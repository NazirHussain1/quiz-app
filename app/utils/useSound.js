import { useEffect, useRef } from "react";

export function useSound() {
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const completeSoundRef = useRef(null);

  useEffect(() => {
    // Initialize audio objects
    correctSoundRef.current = new Audio("/sounds/correct.mp3");
    wrongSoundRef.current = new Audio("/sounds/wrong.mp3");
    completeSoundRef.current = new Audio("/sounds/complete.mp3");

    // Set volume
    correctSoundRef.current.volume = 0.5;
    wrongSoundRef.current.volume = 0.5;
    completeSoundRef.current.volume = 0.5;

    // Preload audio files
    correctSoundRef.current.load();
    wrongSoundRef.current.load();
    completeSoundRef.current.load();
  }, []);

  const playCorrect = () => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  const playWrong = () => {
    if (wrongSoundRef.current) {
      wrongSoundRef.current.currentTime = 0;
      wrongSoundRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  const playComplete = () => {
    if (completeSoundRef.current) {
      completeSoundRef.current.currentTime = 0;
      completeSoundRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  return { playCorrect, playWrong, playComplete };
}
