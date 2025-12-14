import React, { useMemo } from 'react';
import * as THREE from 'three';

const WALL_HEIGHT = 2;
const CELL_SIZE = 2;

const Maze = ({ mazeData, size, theme }) => {
    const walls = useMemo(() => {
        const wallGeometries = [];
        const wallMaterial = new THREE.MeshStandardMaterial({ color: theme.wall });

        mazeData.forEach((row, y) => {
            row.forEach((cell, x) => {
                const cx = x * CELL_SIZE;
                const cy = y * CELL_SIZE;

                // Floor
                // We can just use one big plane for floor, but for now let's keep it simple.

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
    }, [mazeData]);

    const floorSize = size * CELL_SIZE;
    const offset = (floorSize / 2) - (CELL_SIZE / 2);

    return (
        <group position={[-offset, 0, -offset]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0, offset]} receiveShadow>
                <planeGeometry args={[floorSize + 10, floorSize + 10]} />
                <meshStandardMaterial color={theme.floor} />
            </mesh>
            {walls}
            {/* Exit Marker */}
            <mesh position={[(size - 1) * CELL_SIZE, 1, (size - 1) * CELL_SIZE]}>
                <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
                <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} transparent opacity={0.8} />
            </mesh>
            <pointLight position={[(size - 1) * CELL_SIZE, 2, (size - 1) * CELL_SIZE]} color="#00ff00" intensity={2} distance={5} />
        </group>
    );
};

export default Maze;
