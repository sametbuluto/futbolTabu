import { useEffect, useMemo } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const roundStartSource = require('../../assets/audio/round-start-whistle.wav');
const roundEndSource = require('../../assets/audio/round-end-whistle.wav');
const correctSource = require('../../assets/audio/card-correct.wav');
const passSource = require('../../assets/audio/card-pass.wav');
const tabuSource = require('../../assets/audio/card-tabu.wav');

export function useGameAudio(enabled: boolean) {
  const roundStartPlayer = useAudioPlayer(roundStartSource);
  const roundEndPlayer = useAudioPlayer(roundEndSource);
  const correctPlayer = useAudioPlayer(correctSource);
  const passPlayer = useAudioPlayer(passSource);
  const tabuPlayer = useAudioPlayer(tabuSource);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    roundStartPlayer.volume = 0.95;
    roundEndPlayer.volume = 0.95;
    correctPlayer.volume = 0.6;
    passPlayer.volume = 0.45;
    tabuPlayer.volume = 0.75;
  }, [correctPlayer, passPlayer, roundEndPlayer, roundStartPlayer, tabuPlayer]);

  async function replay(player: {
    pause: () => void;
    play: () => void;
    seekTo: (seconds: number) => Promise<void>;
  }) {
    if (!enabled) {
      return;
    }

    try {
      player.pause();
      await player.seekTo(0);
      player.play();
    } catch {
      player.play();
    }
  }

  return useMemo(
    () => ({
      playCorrect: () => replay(correctPlayer),
      playPass: () => replay(passPlayer),
      playRoundEnd: () => replay(roundEndPlayer),
      playRoundStart: () => replay(roundStartPlayer),
      playTabu: () => replay(tabuPlayer),
    }),
    [correctPlayer, passPlayer, roundEndPlayer, roundStartPlayer, tabuPlayer],
  );
}
