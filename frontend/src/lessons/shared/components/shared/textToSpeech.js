// File: /src/lessons/components/shared/textToSpeech.js
// Reusable text-to-speech utility

export const speakText = (text, voiceEnabled) => {
  if (!voiceEnabled) return;
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 0.7;
    
    const setVoice = () => {
      // CHROMEBOOK MEMORY OPTIMIZATION: Clear handler after use
      window.speechSynthesis.onvoiceschanged = null;

      const voices = window.speechSynthesis.getVoices();

      const preferredVoices = [
        'Samantha',
        'Google UK English Female',
        'Microsoft Zira',
        'Karen',
        'Victoria',
        'Fiona'
      ];

      let selectedVoice = null;
      for (const preferred of preferredVoices) {
        selectedVoice = voices.find(voice => voice.name.includes(preferred));
        if (selectedVoice) break;
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(voice =>
          voice.lang.startsWith('en') &&
          (voice.name.toLowerCase().includes('female') ||
           voice.name.toLowerCase().includes('woman'))
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  }
};