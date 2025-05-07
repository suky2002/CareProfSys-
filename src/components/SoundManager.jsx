import { useEffect, useRef } from "react";
import useSound from "use-sound";

const SoundManager = ({ volume }) => {
  const hasInteracted = useRef(false);
  const [play, { stop }] = useSound("/audio/intro.mpeg", {
    volume,
    loop: true,
    interrupt: true,
    soundEnabled: true,
  });

  useEffect(() => {
    const startAudio = () => {
      if (!hasInteracted.current) {
        play();
        hasInteracted.current = true;
        document.removeEventListener("click", startAudio);
      }
    };

    document.addEventListener("click", startAudio);

    return () => {
      stop();
      document.removeEventListener("click", startAudio);
    };
  }, [play, stop]);

  return null;
};

export default SoundManager;