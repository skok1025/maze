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

    useEffect(() => {
        // Generate 3 random hint items
        const items = [];
        while (items.length < 3) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            // Avoid start (0,0) and end (size-1, size-1) and duplicates
            if ((x === 0 && y === 0) || (x === size - 1 && y === size - 1)) continue;
            if (items.some(item => item.x === x && item.y === y)) continue;

            items.push({ x, y, id: `${x}-${y}` });
        }
        setHintItems(items);
    }, [size]);

    const handleCollectHint = (id) => {
        setHintItems(prev => prev.filter(item => item.id !== id));
        setHints(h => h + 1);
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
                    <Maze mazeData={mazeData} size={size} theme={theme} hintItems={hintItems} />
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
                    />
                    {/* OrbitControls for debug, but Player will control camera later */}
                    {/* <OrbitControls /> */}
                </Suspense>
            </Canvas>
            {activeHint === 'minimap' && playerPos && (
                <Minimap mazeData={mazeData} size={size} playerPos={playerPos} />
            )}
        </div>
    );
};

export default GameScene;
