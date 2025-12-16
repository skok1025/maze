import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, PerspectiveCamera } from '@react-three/drei';
import Maze from './Maze';
import Player from './Player';
import Wolf from './Wolf';
import Minimap from './Minimap';
import { generateMaze } from '../utils/mazeGenerator';
import { getTheme } from '../utils/themes';

const GameScene = ({ stage, setGameState, activeHint, joystickRef, collisionEffect, setHints, sprint, setSprint, onWolfCatch, onHeal }) => {
    // Increase size with stage. Stage 1 = 5x5, Stage 10 = 14x14
    const size = 5 + (stage - 1);
    const mazeData = useMemo(() => generateMaze(size, size), [size]);
    const theme = useMemo(() => getTheme(stage), [stage]);

    // Player State
    const [playerPos, setPlayerPos] = useState(null);

    // Items State
    const [hintItems, setHintItems] = useState([]);
    const [wingItem, setWingItem] = useState(null);
    const [healthItems, setHealthItems] = useState([]);

    // Fly State
    const [flyTimeLeft, setFlyTimeLeft] = useState(0);

    useEffect(() => {
        // Spawn Hint Items (2 per stage)
        const hints = [];
        for (let i = 0; i < 2; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);
            } while ((x < 2 && y < 2) || (x === size - 1 && y === size - 1)); // Avoid start and end
            hints.push({ id: i, x, y });
        }
        setHintItems(hints);

        // Spawn Wing Item (1 per stage, 30% chance)
        if (Math.random() < 0.3) {
            let x, y;
            do {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);
            } while ((x < 2 && y < 2) || (x === size - 1 && y === size - 1));
            setWingItem({ x, y });
        } else {
            setWingItem(null);
        }

        // Spawn Health Items (1-2 per stage)
        const healths = [];
        const count = Math.floor(Math.random() * 2) + 1; // 1 or 2
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);
            } while ((x < 2 && y < 2) || (x === size - 1 && y === size - 1));
            healths.push({ id: i, x, y });
        }
        setHealthItems(healths);

    }, [size]);

    const handleCollectHint = (id) => {
        setHintItems(prev => prev.filter(item => item.id !== id));
        setHints(prev => prev + 1);
    };

    const handleCollectWing = () => {
        setWingItem(null);
    };

    const handleCollectHealth = (id) => {
        setHealthItems(prev => prev.filter(item => item.id !== id));
        if (onHeal) onHeal();
    };

    // Wolf State
    const [wolfPos, setWolfPos] = useState(null);
    const [isScared, setIsScared] = useState(false);

    useEffect(() => {
        // Find a dead end for the Wolf
        // Dead end = cell with 3 walls
        // Should be far from (0,0) and NOT the exit (size-1, size-1)
        const deadEnds = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Skip start area
                if (x < 2 && y < 2) continue;
                // Skip exit area
                if (x === size - 1 && y === size - 1) continue;

                const cell = mazeData[y][x];
                let walls = 0;
                if (cell.walls.top) walls++;
                if (cell.walls.bottom) walls++;
                if (cell.walls.left) walls++;
                if (cell.walls.right) walls++;

                if (walls === 3) {
                    deadEnds.push({ x, y });
                }
            }
        }

        // If no dead ends, pick random far spot excluding exit
        let spawnPos;
        if (deadEnds.length > 0) {
            // Pick random dead end
            const choice = deadEnds[Math.floor(Math.random() * deadEnds.length)];
            spawnPos = choice;
        } else {
            // Fallback: Random spot not start or exit
            let x, y;
            do {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);
            } while ((x < 2 && y < 2) || (x === size - 1 && y === size - 1));
            spawnPos = { x, y };
        }

        const CELL_SIZE = 2;
        const floorSize = size * CELL_SIZE;
        const offset = (floorSize / 2) - (CELL_SIZE / 2);
        const startX = spawnPos.x * CELL_SIZE - offset;
        const startZ = spawnPos.y * CELL_SIZE - offset;
        setWolfPos(new THREE.Vector3(startX, 0.5, startZ));

    }, [mazeData, size]);

    return (
        <div className="game-scene">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 10, 5]} />
                <color attach="background" args={[theme.sky]} />
                <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                    <Sky sunPosition={[100, 20, 100]} />
                    <Maze
                        mazeData={mazeData}
                        size={size}
                        theme={theme}
                        hintItems={hintItems}
                        wingItem={wingItem}
                        healthItems={healthItems}
                    />
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
                        healthItems={healthItems}
                        onCollectHealth={handleCollectHealth}
                        setFlyTimeLeft={setFlyTimeLeft}
                        sprint={sprint}
                        setSprint={setSprint}
                        isScared={isScared}
                    />
                    {wolfPos && (
                        <Wolf
                            startPos={wolfPos}
                            playerPos={playerPos}
                            mazeData={mazeData}
                            size={size}
                            onCatch={onWolfCatch}
                            onChaseUpdate={(chasing) => setIsScared(chasing)}
                        />
                    )}
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
