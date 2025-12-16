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

  // Gameplay State
  const [health, setHealth] = useState(100);
  const [sprint, setSprint] = useState(false);
  const healthTimer = React.useRef(null);

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

  // Reset Health on Stage Change or Game Start
  useEffect(() => {
    if (gameState === 'playing') {
      setHealth(100);
      setSprint(false);
    }
  }, [stage, gameState]);

  // Health Decay Logic
  useEffect(() => {
    if (gameState === 'playing' && sprint) {
      healthTimer.current = setInterval(() => {
        setHealth(prev => {
          const newHealth = prev - 5;
          if (newHealth <= 0) {
            clearInterval(healthTimer.current);
            setGameState('gameover');
            return 0;
          }
          return newHealth;
        });
      }, 500); // 0.5 seconds
    } else {
      if (healthTimer.current) clearInterval(healthTimer.current);
    }

    return () => {
      if (healthTimer.current) clearInterval(healthTimer.current);
    };
  }, [gameState, sprint]);

  const handleWolfCatch = () => {
    setHealth(prev => {
      const newHealth = prev - 20;
      if (newHealth <= 0) {
        setGameState('gameover');
        return 0;
      }
      return newHealth;
    });
  };

  const healPlayer = () => {
    setHealth(prev => Math.min(100, prev + 20));
  };

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
      {gameState === 'gameover' && (
        <div className="start-screen" style={{ backgroundColor: 'rgba(50, 0, 0, 0.9)' }}>
          <h1 style={{ color: 'red' }}>GAME OVER</h1>
          <p style={{ fontSize: '24px', marginBottom: '20px' }}>The wolf caught you or you ran out of energy!</p>
          <button onClick={() => {
            setHealth(100);
            setGameState('playing');
          }}>Try Again</button>
          <button
            style={{ marginTop: '20px', backgroundColor: '#555' }}
            onClick={() => setGameState('start')}
          >
            Main Menu
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
            sprint={sprint}
            setSprint={setSprint}
            onWolfCatch={handleWolfCatch}
            onHeal={healPlayer}
          />
          <UI
            stage={stage}
            hints={hints}
            activateHint={activateHint}
            activeHint={activeHint}
            hintTimeLeft={hintTimeLeft}
            joystickRef={joystickRef}
            health={health}
            setSprint={setSprint}
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
