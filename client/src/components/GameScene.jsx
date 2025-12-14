import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, PerspectiveCamera } from '@react-three/drei';
import Maze from './Maze';
import Player from './Player';
import Minimap from './Minimap'; // We will create this next
import { generateMaze } from '../utils/mazeGenerator';
import { getTheme } from '../utils/themes';

const GameScene = ({ stage, setGameState, hintActive, joystickRef }) => {
    // Increase size with stage. Stage 1 = 5x5, Stage 10 = 14x14
    const size = 5 + (stage - 1);
    const mazeData = useMemo(() => generateMaze(size, size), [size]);
    const theme = useMemo(() => getTheme(stage), [stage]);
    const [playerPos, setPlayerPos] = useState(null); // World position

    return (
        <div className="game-scene">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 10, 5]} />
                <color attach="background" args={[theme.sky]} />
                <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                    <Sky sunPosition={[100, 20, 100]} />
                    <Maze mazeData={mazeData} size={size} theme={theme} />
                    <Player
                        mazeData={mazeData}
                        size={size}
                        setGameState={setGameState}
                        onPositionChange={setPlayerPos}
                        joystickRef={joystickRef}
                    />
                    {/* OrbitControls for debug, but Player will control camera later */}
                    {/* <OrbitControls /> */}
                </Suspense>
            </Canvas>
            {hintActive && playerPos && (
                <Minimap mazeData={mazeData} size={size} playerPos={playerPos} />
            )}
        </div>
    );
};

export default GameScene;
