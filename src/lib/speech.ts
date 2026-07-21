import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { fetchAzureArmenianAudio } from './azureSpeech';

let voiceCheck: Promise<boolean> | null = null;

async function hasArmenianVoice(): Promise<boolean> {
  if (!voiceCheck) {
    voiceCheck = Speech.getAvailableVoicesAsync()
      .then((voices) => voices.some((v) => v.language?.toLowerCase().startsWith('hy')))
      .catch(() => false);
  }
  return voiceCheck;
}

/**
 * De nombreux moteurs de synthèse épellent un caractère isolé au lieu de le
 * prononcer (ex. « é » lu « e accent aigu », « s » lu « esse ») — la plupart
 * des sons de l'alphabet arménien sont justement une seule lettre latine
 * (a, m, n, t, s, é, o…). Doubler le caractère force une lecture phonétique
 * continue plutôt qu'un nom de lettre.
 */
function forcePhonetic(text: string): string {
  return text.length === 1 ? text + text : text;
}

let cloudPlayer: AudioPlayer | null = null;

function stopCloudPlayer(): void {
  if (cloudPlayer) {
    try {
      cloudPlayer.remove();
    } catch {}
    cloudPlayer = null;
  }
}

function playCloudAudio(uri: string): void {
  const player = createAudioPlayer({ uri });
  cloudPlayer = player;
  const sub = player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) {
      sub.remove();
      if (cloudPlayer === player) cloudPlayer = null;
      try {
        player.remove();
      } catch {}
    }
  });
  player.play();
}

let playToken = 0;

/**
 * Lit un texte à voix haute. Ordre de préférence :
 * 1. Voix hy-AM native de l'appareil, si installée (immédiat, hors-ligne) —
 *    quasiment jamais le cas en pratique, aucun moteur grand public n'a de
 *    voix arménienne embarquée.
 * 2. Voix arménienne Azure en ligne, mise en cache après le premier essai
 *    (rejouable hors-ligne ensuite).
 * 3. Repli hors-ligne : romanisation lue par la voix par défaut de
 *    l'appareil, pour garder un repère sonore même sans réseau/clé Azure.
 */
export function speakHy(hy: string, romanized?: string): void {
  const myToken = ++playToken;
  Speech.stop();
  stopCloudPlayer();

  const fallback = () => {
    if (myToken === playToken && romanized) {
      Speech.speak(forcePhonetic(romanized), { rate: 0.85 });
    }
  };

  hasArmenianVoice()
    .then(async (ok) => {
      if (myToken !== playToken) return;
      if (ok) {
        Speech.speak(hy, { language: 'hy-AM', rate: 0.8 });
        return;
      }
      const uri = await fetchAzureArmenianAudio(hy);
      if (myToken !== playToken) return;
      if (uri) {
        playCloudAudio(uri);
      } else {
        fallback();
      }
    })
    .catch(fallback);
}
