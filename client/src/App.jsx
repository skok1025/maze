import React, { useState, useEffect } from 'react';
import GameScene from './components/GameScene';
import UI from './components/UI';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('start'); // start, playing, won, gameover
  const [stage, setStage] = useState(() => parseInt(localStorage.getItem('maze_stage') || 1));
  const [hints, setHints] = useState(2);
  const [activeHint, setActiveHint] = useState(null); // null, 'minimap', 'zoomout'
  const [hintTimeLeft, setHintTimeLeft] = useState(0);
  const [collisionEffect, setCollisionEffect] = useState(false);
  const [controlType, setControlType] = useState('keyboard'); // 'keyboard' or 'joystick'

  useEffect(() => {
    let timer;
    if (activeHint && hintTimeLeft > 0) {
      timer = setInterval(() => {
        setHintTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (hintTimeLeft === 0) {
      setActiveHint(null);
    }
    return () => clearInterval(timer);
  }, [activeHint, hintTimeLeft]);

  const activateHint = (type) => {
    if (hints > 0 && !activeHint) {
      setHints(h => h - 1);
      setActiveHint(type);
      setHintTimeLeft(10);
    } else if (activeHint === type) {
      setActiveHint(null);
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

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '18px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={collisionEffect}
                onChange={(e) => setCollisionEffect(e.target.checked)}
                style={{ width: '20px', height: '20px', marginRight: '10px' }}
              />
              Enable Collision Effect (Shake & Red Flash)
            </label>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>Control Type:</div>
            <label style={{ fontSize: '16px', cursor: 'pointer', marginRight: '20px' }}>
              <input
                type="radio"
                name="controlType"
                value="keyboard"
                checked={controlType === 'keyboard'}
                onChange={(e) => setControlType(e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Keyboard (Arrow Keys)
            </label>
            <label style={{ fontSize: '16px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="controlType"
                value="joystick"
                checked={controlType === 'joystick'}
                onChange={(e) => setControlType(e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Joystick (Mobile)
            </label>
          </div>

          <button
            style={{ marginTop: '20px', fontSize: '16px', padding: '10px 20px', backgroundColor: '#555' }}
            onClick={() => {
              setStage(1);
              localStorage.setItem('maze_stage', 1);
              setGameState('playing');
            }}
          >
            Reset Progress (Start from Stage 1)
          </button>
        </div>
      )}
      {gameState === 'playing' && (
        <>
          <GameScene
            stage={stage}
            setGameState={setGameState}
            activeHint={activeHint}
            joystickRef={joystickRef}
            collisionEffect={collisionEffect}
            setHints={setHints}
          />
          <UI
            stage={stage}
            hints={hints}
            activateHint={activateHint}
            activeHint={activeHint}
            hintTimeLeft={hintTimeLeft}
            joystickRef={joystickRef}
            controlType={controlType}
          />
        </>
      )}
      {gameState === 'won' && (
        <div className="win-screen">
          <h1>Stage {stage} Cleared!</h1>
          <button onClick={() => {
            setStage(s => {
              const next = s + 1;
              localStorage.setItem('maze_stage', next);
              return next;
            });
            setHints(2);
            setGameState('playing');
            setHintActive(false);
          }}>Next Stage</button>
        </div>
      )}
    </div>
  );
}

export default App;
