import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, PerspectiveCamera } from '@react-three/drei';
import Maze from './Maze';
import Player from './Player';
import Minimap from './Minimap'; // We will create this next
import { generateMaze } from '../utils/mazeGenerator';
import { getTheme } from '../utils/themes';

const GameScene = ({ stage, setGameState, activeHint, joystickRef, collisionEffect, setHints }) => {
    // Increase size with stage. Stage 1 = 5x5, Stage 10 = 14x14
    const size = 5 + (stage - 1);
    const mazeData = useMemo(() => generateMaze(size, size), [size]);
    const theme = useMemo(() => getTheme(stage), [stage]);
    const [playerPos, setPlayerPos] = useState(null); // World position

    // Hint Items
    const [hintItems, setHintItems] = useState([]);
    // Wing Item
    const [wingItem, setWingItem] = useState(null);
    // Fly Time
    const [flyTimeLeft, setFlyTimeLeft] = useState(0);

    useEffect(() => {
        // Generate 3 random hint items
        const items = [];
        const taken = new Set();

        // Helper to get random pos
        const getRandomPos = () => {
            let x, y, key;
            do {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);
                key = `${x},${y}`;
            } while (
                (x === 0 && y === 0) ||
                (x === size - 1 && y === size - 1) ||
                taken.has(key)
            );
            taken.add(key);
            return { x, y };
        };

        while (items.length < 3) {
            const pos = getRandomPos();
            items.push({ ...pos, id: `${pos.x}-${pos.y}` });
        }
        setHintItems(items);

        // Generate 1 Wing Item (only from stage 10+)
        if (stage >= 10) {
            const wingPos = getRandomPos();
            setWingItem({ ...wingPos, id: 'wing' });
        } else {
            setWingItem(null);
        }

    }, [size, stage]);

    const handleCollectHint = (id) => {
        setHintItems(prev => prev.filter(item => item.id !== id));
        setHints(h => h + 1);
    };

    const handleCollectWing = () => {
        setWingItem(null);
    };

    return (
        <div className="game-scene">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 10, 5]} />
                <color attach="background" args={[theme.sky]} />
                <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                    <Sky sunPosition={[100, 20, 100]} />
                    <Maze mazeData={mazeData} size={size} theme={theme} hintItems={hintItems} wingItem={wingItem} />
                    <Player
                        mazeData={mazeData}
                        size={size}
                        setGameState={setGameState}
                        onPositionChange={setPlayerPos}
                        joystickRef={joystickRef}
                        activeHint={activeHint}
                        collisionEffect={collisionEffect}
                        hintItems={hintItems}
                        onCollectHint={handleCollectHint}
                        wingItem={wingItem}
                        onCollectWing={handleCollectWing}
                        setFlyTimeLeft={setFlyTimeLeft}
                    />
                    {/* OrbitControls for debug, but Player will control camera later */}
                    {/* <OrbitControls /> */}
                </Suspense>
            </Canvas>
            {activeHint === 'minimap' && playerPos && (
                <Minimap mazeData={mazeData} size={size} playerPos={playerPos} />
            )}
            {flyTimeLeft > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    pointerEvents: 'none'
                }}>
                    ✈️ {Math.ceil(flyTimeLeft)}s
                </div>
            )}
        </div>
    );
};

export default GameScene;
