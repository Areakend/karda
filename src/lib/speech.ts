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
        Speech.speak(romanized, { rate: 0.85 });
      }
    })
    .catch(() => {});
}
