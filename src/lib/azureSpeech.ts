import { Directory, File, Paths } from 'expo-file-system';

// Azure Cognitive Services Speech propose deux voix neuronales arméniennes
// (hy-AM-AnahitNeural, hy-AM-HaykNeural) — aucun moteur de synthèse embarqué
// sur téléphone ni service gratuit sans clé ne couvre l'arménien. Clé et
// région viennent de variables d'environnement EXPO_PUBLIC_* (voir
// .env.example) : injectées dans le bundle au build, jamais commitées.
const REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION;
const KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY;
const VOICE = 'hy-AM-AnahitNeural';

// Construits à la demande (pas au chargement du module) : sur des
// plateformes où le module natif n'est pas pleinement disponible (web…),
// construire un `Directory`/`File` peut lever une exception — elle doit
// rester dans le `try` de fetchAzureArmenianAudio, pas planter l'import.
function cacheDir(): Directory {
  const dir = new Directory(Paths.cache, 'armenian-tts');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function cacheFileFor(text: string): File {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return new File(cacheDir(), `${Math.abs(hash)}.mp3`);
}

function escapeSsml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Récupère un clip audio arménien pour ce texte via Azure Speech, avec mise
 * en cache disque (un mot/lettre n'est synthétisé qu'une fois, rejouable
 * hors-ligne ensuite). Retourne `null` si la clé n'est pas configurée ou en
 * cas d'échec réseau — l'appelant doit prévoir un repli.
 */
export async function fetchAzureArmenianAudio(text: string): Promise<string | null> {
  if (!REGION || !KEY) return null;
  try {
    const file = cacheFileFor(text);
    if (file.exists) return file.uri;

    const ssml = `<speak version="1.0" xml:lang="hy-AM"><voice name="${VOICE}">${escapeSsml(text)}</voice></speak>`;
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
      },
      body: ssml,
    });
    if (!res.ok) return null;

    const bytes = new Uint8Array(await res.arrayBuffer());
    file.create({ intermediates: true, overwrite: true });
    file.write(bytes);
    return file.uri;
  } catch {
    return null;
  }
}
