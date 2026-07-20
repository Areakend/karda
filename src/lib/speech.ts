import * as Speech from 'expo-speech';

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

/**
 * Lit un texte à voix haute. Utilise une voix arménienne (hy-AM) si
 * l'appareil en a une ; sinon lit la romanisation avec la voix par défaut,
 * pour donner quand même un repère sonore plutôt que de rester muet.
 */
export function speakHy(hy: string, romanized?: string): void {
  Speech.stop();
  hasArmenianVoice()
    .then((ok) => {
      if (ok) {
        Speech.speak(hy, { language: 'hy-AM', rate: 0.8 });
      } else if (romanized) {
        Speech.speak(forcePhonetic(romanized), { rate: 0.85 });
      }
    })
    .catch(() => {});
}
