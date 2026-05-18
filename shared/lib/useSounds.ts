import { ref } from 'vue';

/**
 * 🎵 Аудио-движок (Sound Engine)
 * Использует Web Audio API для генерации приятных UI-звуков на лету.
 * Это быстрее, не требует файлов и звучит кристально чисто.
 */
export const useSounds = () => {
  const isMuted = ref(false);
  let audioCtx: AudioContext | null = null;

  const initAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  /**
   * 🔊 Проиграть синтезированный звук
   * @param type Тип звука: 'drop' (перемещение), 'success' (успех), 'click' (клик)
   */
  const play = (type: 'drop' | 'success' | 'click') => {
    if (isMuted.value) return;
    
    try {
      const ctx = initAudio();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'drop') {
        // Мягкий, низкий "пуп" при дропе карточки
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
      } 
      else if (type === 'success') {
        // Звонкий, приятный аккорд при завершении задачи
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, now); // A4
        oscillator.frequency.setValueAtTime(554.37, now + 0.1); // C#5
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      }
      else if (type === 'click') {
        // Короткий высокий щелчок для кнопок
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Не удалось проиграть звук. Возможно, требуется первое взаимодействие с пользователем (User Gesture).', e);
    }
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
  };

  return { play, toggleMute, isMuted };
};
