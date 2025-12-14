import React, { useState, useEffect } from 'react';
import GameScene from './components/GameScene';
import UI from './components/UI';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, won, gameover
  const [stage, setStage] = useState(1);
  const [hints, setHints] = useState(5);
  const [hintActive, setHintActive] = useState(false);
  const [hintTimeLeft, setHintTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (hintActive && hintTimeLeft > 0) {
      timer = setInterval(() => {
        setHintTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (hintTimeLeft === 0) {
      setHintActive(false);
    }
    return () => clearInterval(timer);
  }, [hintActive, hintTimeLeft]);

  const activateHint = () => {
    if (hints > 0 && !hintActive) {
      setHints(h => h - 1);
      setHintActive(true);
      setHintTimeLeft(10);
    } else if (hintActive) {
      setHintActive(false);
      setHintTimeLeft(0);
    }
  };

  useEffect(() => {
    console.log('App mounted');
  }, []);

  const joystickRef = React.useRef({ x: 0, y: 0 });

  return (
    <div className="app-container">
      {gameState === 'start' && (
        <div className="start-screen">
          <h1>3D Maze Game</h1>
          <button onClick={() => setGameState('playing')}>Start Game</button>
        </div>
      )}
      {gameState === 'playing' && (
        <>
          <GameScene stage={stage} setGameState={setGameState} hintActive={hintActive} joystickRef={joystickRef} />
          <UI
            stage={stage}
            hints={hints}
            activateHint={activateHint}
            hintActive={hintActive}
            hintTimeLeft={hintTimeLeft}
            joystickRef={joystickRef}
          />
        </>
      )}
      {gameState === 'won' && (
        <div className="win-screen">
          <h1>Stage {stage} Cleared!</h1>
          <button onClick={() => {
            setStage(s => s + 1);
            setGameState('playing');
            setHintActive(false);
          }}>Next Stage</button>
        </div>
      )}
    </div>
  );
}

export default App;
