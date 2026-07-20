#!/usr/bin/env node
// Le dossier android/ est régénéré à chaque `expo prebuild`, donc toute
// modification manuelle de build.gradle serait perdue au prochain build.
// Ce script re-applique après coup une vraie configuration de signature
// "release", en lisant le keystore et les mots de passe depuis des
// variables d'environnement (fournies par les secrets GitHub en CI).
//
// N'est appelé par le workflow que si un keystore de release est
// configuré ; sinon le gradle généré garde son comportement par défaut
// (signature "release" avec la clé de debug).

const fs = require('fs');
const path = require('path');

const GRADLE_PATH = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

const required = [
  'ANDROID_KEYSTORE_PATH',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Variable d'environnement manquante : ${key}`);
    process.exit(1);
  }
}

let gradle = fs.readFileSync(GRADLE_PATH, 'utf8');

// 1) Ajoute un signingConfig "release" juste après celui de "debug".
const debugConfigMarker = `debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`;

if (!gradle.includes(debugConfigMarker)) {
  console.error("Gabarit signingConfigs.debug introuvable — le template Expo a peut-être changé.");
  process.exit(1);
}

const releaseConfigBlock = `debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }`;

gradle = gradle.replace(debugConfigMarker, releaseConfigBlock);

// 2) Fait pointer le buildType "release" vers ce nouveau signingConfig
//    (et seulement lui : le buildType "debug" doit garder signingConfigs.debug).
const releaseBuildTypeMarker = `release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

if (!gradle.includes(releaseBuildTypeMarker)) {
  console.error("Gabarit buildTypes.release introuvable — le template Expo a peut-être changé.");
  process.exit(1);
}

gradle = gradle.replace(
  releaseBuildTypeMarker,
  releaseBuildTypeMarker.replace('signingConfigs.debug', 'signingConfigs.release')
);

fs.writeFileSync(GRADLE_PATH, gradle);
console.log('✓ Signature de release configurée dans android/app/build.gradle');
