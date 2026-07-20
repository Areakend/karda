import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const correctSound = require('../../assets/sounds/correct.wav');
const wrongSound = require('../../assets/sounds/wrong.wav');

/**
 * Retour haptique + sonore court sur une réponse de quiz. Un nouveau
 * lecteur est créé à chaque appel : les clips font moins d'une seconde,
 * le coût est négligeable, et ça évite tout état de lecteur partagé à
 * gérer (chevauchement de deux réponses rapides, etc.).
 */
export function playFeedback(correct: boolean): void {
  try {
    Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  } catch {}

  try {
    const player = createAudioPlayer(correct ? correctSound : wrongSound);
    player.play();
    // Le lecteur n'est plus référencé après la lecture ; on le libère
    // après un délai généreux plutôt que de suivre son état de lecture.
    setTimeout(() => {
      try {
        player.remove();
      } catch {}
    }, 1500);
  } catch {}
}
