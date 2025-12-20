import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { generateTexture } from '../utils/textureGenerator';
import Decorations from './Decorations';

const WALL_HEIGHT = 2;
const CELL_SIZE = 2;

const Maze = ({ mazeData, size, theme, hintItems, wingItem, healthItems }) => {
    // Generate Textures
    const wallTexture = useMemo(() => {
        try {
            const tex = generateTexture(theme.wallTexture, theme.wall, theme.wallDetail);
            // tex.magFilter = THREE.NearestFilter; // Optional: for pixel art look
            return tex;
        } catch (e) {
            console.error("Failed to generate wall texture", e);
            return null;
        }
    }, [theme]);

    const floorTexture = useMemo(() => {
        try {
            const tex = generateTexture(theme.floorTexture, theme.floor, theme.floorDetail);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(size, size); // Repeat texture across the floor
            return tex;
        } catch (e) {
            console.error("Failed to generate floor texture", e);
            return null;
        }
    }, [theme, size]);

    const walls = useMemo(() => {
        const wallGeometries = [];
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            color: 'white' // Map controls color mostly, but we can tint if needed. Best to use white so texture shows true colors.
        });

        mazeData.forEach((row, y) => {
            row.forEach((cell, x) => {
                const cx = x * CELL_SIZE;
                const cy = y * CELL_SIZE;

                // Walls
                const thickness = 0.2;
                const halfSize = CELL_SIZE / 2;

                if (cell.walls.top) {
                    wallGeometries.push(
                        <mesh key={`top-${x}-${y}`} position={[cx, WALL_HEIGHT / 2, cy - halfSize]} castShadow receiveShadow>
                            <boxGeometry args={[CELL_SIZE + thickness, WALL_HEIGHT, thickness]} />
                            <primitive object={wallMaterial} attach="material" />
                        </mesh>
                    );
                }
                if (cell.walls.bottom) {
                    wallGeometries.push(
                        <mesh key={`bottom-${x}-${y}`} position={[cx, WALL_HEIGHT / 2, cy + halfSize]} castShadow receiveShadow>
                            <boxGeometry args={[CELL_SIZE + thickness, WALL_HEIGHT, thickness]} />
                            <primitive object={wallMaterial} attach="material" />
                        </mesh>
                    );
                }
                if (cell.walls.left) {
                    wallGeometries.push(
                        <mesh key={`left-${x}-${y}`} position={[cx - halfSize, WALL_HEIGHT / 2, cy]} castShadow receiveShadow>
                            <boxGeometry args={[thickness, WALL_HEIGHT, CELL_SIZE + thickness]} />
                            <primitive object={wallMaterial} attach="material" />
                        </mesh>
                    );
                }
                if (cell.walls.right) {
                    wallGeometries.push(
                        <mesh key={`right-${x}-${y}`} position={[cx + halfSize, WALL_HEIGHT / 2, cy]} castShadow receiveShadow>
                            <boxGeometry args={[thickness, WALL_HEIGHT, CELL_SIZE + thickness]} />
                            <primitive object={wallMaterial} attach="material" />
                        </mesh>
                    );
                }
            });
        });
        return wallGeometries;
    }, [mazeData, theme, wallTexture]);

    // Solve Maze to find path
    const solutionPath = useMemo(() => {
        const queue = [{ x: 0, y: 0, path: [] }];
        const visited = new Set(['0,0']);

        while (queue.length > 0) {
            const { x, y, path } = queue.shift();
            const newPath = [...path, { x, y }];

            if (x === size - 1 && y === size - 1) {
                return newPath;
            }

            const cell = mazeData[y][x];

            // Directions: Top, Bottom, Left, Right
            const neighbors = [
                { nx: x, ny: y - 1, wall: 'top' },
                { nx: x, ny: y + 1, wall: 'bottom' },
                { nx: x - 1, ny: y, wall: 'left' },
                { nx: x + 1, ny: y, wall: 'right' }
            ];

            for (const { nx, ny, wall } of neighbors) {
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(`${nx},${ny}`)) {
                    if (!cell.walls[wall]) {
                        visited.add(`${nx},${ny}`);
                        queue.push({ x: nx, y: ny, path: newPath });
                    }
                }
            }
        }
        return [];
    }, [mazeData, size]);

    const floorSize = size * CELL_SIZE;
    const offset = (floorSize / 2) - (CELL_SIZE / 2);

    return (
        <group position={[-offset, 0, -offset]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0, offset]} receiveShadow>
                <planeGeometry args={[floorSize + 10, floorSize + 10]} />
                <meshStandardMaterial map={floorTexture} color="white" />
            </mesh>
            {walls}

            {/* Path Markers (Breadcrumbs) - Hot/Cold Indicator */}
            {solutionPath.map((pos, index) => {
                // Skip start and very end (exit is already marked)
                if (index === 0 || index >= solutionPath.length - 1) return null;

                // Show marker every 3 steps for intermediate guidance
                if (index % 3 !== 0) return null;

                const progress = index / solutionPath.length;
                const color = new THREE.Color();
                // Cyan (Cold/Start) -> Red (Hot/Exit)
                color.lerpColors(new THREE.Color('#00ffff'), new THREE.Color('#ff0000'), progress);

                return (
                    <mesh
                        key={`marker-${index}`}
                        position={[pos.x * CELL_SIZE, 0.02, pos.y * CELL_SIZE]}
                        receiveShadow
                    >
                        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                    </mesh>
                );
            })}

            {/* Hint Items */}
            {hintItems && hintItems.map((item) => (
                <mesh
                    key={`hint-${item.id}`}
                    position={[item.x * CELL_SIZE, 0.5, item.y * CELL_SIZE]}
                    castShadow
                >
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={0.5} />
                    <Text
                        position={[0, 0.8, 0]}
                        fontSize={0.5}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        billboard // Make text always face the camera
                    >
                        Hint +1
                    </Text>
                    {/* Simple bobbing animation could be added here if we made this a separate component */}
                </mesh>
            ))}

            {/* Wing Item */}
            {wingItem && (
                <mesh
                    key="wing-item"
                    position={[wingItem.x * CELL_SIZE, 0.5, wingItem.y * CELL_SIZE]}
                    castShadow
                >
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} />
                    <Text
                        position={[0, 0.8, 0]}
                        fontSize={0.5}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        billboard
                    >
                        Fly!
                    </Text>
                </mesh>
            )}

            {/* Health Items */}
            {healthItems && healthItems.map((item) => (
                <mesh
                    key={`health-${item.id}`}
                    position={[item.x * CELL_SIZE, 0.5, item.y * CELL_SIZE]}
                    castShadow
                >
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
                    <Text
                        position={[0, 0.8, 0]}
                        fontSize={0.5}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        billboard
                    >
                        HP +20
                    </Text>
                </mesh>
            ))}

            {/* Exit Marker - Light Beam */}
            <group position={[(size - 1) * CELL_SIZE, 0, (size - 1) * CELL_SIZE]}>
                {/* Main Beam */}
                <mesh position={[0, 50, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 100, 32, 1, true]} />
                    <meshStandardMaterial
                        color="#00ff00"
                        emissive="#00ff00"
                        emissiveIntensity={2}
                        transparent
                        opacity={0.3}
                        side={THREE.DoubleSide}
                        depthWrite={false} // Prevent z-fighting with sky
                    />
                </mesh>
                {/* Core Beam */}
                <mesh position={[0, 50, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 100, 16, 1, true]} />
                    <meshStandardMaterial
                        color="white"
                        emissive="white"
                        emissiveIntensity={5}
                        transparent
                        opacity={0.8}
                        depthWrite={false}
                    />
                </mesh>
                {/* Base Glow */}
                <pointLight position={[0, 2, 0]} color="#00ff00" intensity={5} distance={10} decay={2} />
            </group>

            {/* Theme Decorations */}
            <Decorations size={size} theme={theme} mazeData={mazeData} />
        </group>
    );
};

export default Maze;
