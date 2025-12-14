import React, { useMemo } from 'react';
import * as THREE from 'three';
import { findPath } from '../utils/pathfinder';

const CELL_SIZE = 2;

const HintPath = ({ mazeData, size, playerPos }) => {
    const path = useMemo(() => {
        if (!playerPos) return [];

        // Calculate start grid pos from playerPos
        // Player is in world coords. Maze offset logic:
        const floorSize = size * CELL_SIZE;
        const offset = (floorSize / 2) - (CELL_SIZE / 2);

        const gridX = Math.round((playerPos.x + offset) / CELL_SIZE);
        const gridY = Math.round((playerPos.z + offset) / CELL_SIZE);

        if (gridX < 0 || gridX >= size || gridY < 0 || gridY >= size) return [];

        const start = { x: gridX, y: gridY };
        const end = { x: size - 1, y: size - 1 }; // Exit is always bottom-right

        const pathNodes = findPath(start, end, mazeData, size);
        return pathNodes;
    }, [mazeData, size, playerPos]); // Re-calculate when player moves? Maybe too expensive. 
    // Optimization: Only re-calculate every second or if player moves significantly. 
    // For now, let's just calculate it once when component mounts or if we want dynamic updates.
    // Actually, if we want the path to update as player moves, we need playerPos.
    // But updating every frame is bad.
    // Let's pass playerPos but maybe debounce or just accept it's small grid.

    // To make it efficient, we can just calculate from START of maze to END, and show that?
    // User asked: "Hint 1) Maze path 3D fluorescent arrows"
    // Usually means from current position to exit.

    const arrows = useMemo(() => {
        const arrowObjs = [];
        const floorSize = size * CELL_SIZE;
        const offset = (floorSize / 2) - (CELL_SIZE / 2);

        for (let i = 0; i < path.length - 1; i++) {
            const curr = path[i];
            const next = path[i + 1];

            const x = curr.x * CELL_SIZE - offset;
            const z = curr.y * CELL_SIZE - offset;

            const nextX = next.x * CELL_SIZE - offset;
            const nextZ = next.y * CELL_SIZE - offset;

            const dir = new THREE.Vector3(nextX - x, 0, nextZ - z);
            if (dir.lengthSq() < 0.0001) continue;

            dir.normalize();
            const length = CELL_SIZE * 0.8;
            const origin = new THREE.Vector3(x, 1.0, z); // Lower height

            // Create a group for the arrow
            // We need to rotate it to point in 'dir'
            // 'lookAt' works, but we need a dummy object or math.
            // Let's just use a group and set rotation.

            // Calculate rotation angle
            const angle = Math.atan2(dir.x, dir.z);

            arrowObjs.push(
                <group key={i} position={origin} rotation={[0, angle, 0]}>
                    {/* Shaft */}
                    <mesh position={[0, 0, length / 2]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, length, 8]} />
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0, 0, length]} rotation={[Math.PI / 2, 0, 0]}>
                        <coneGeometry args={[0.15, 0.3, 16]} />
                        <meshBasicMaterial color="#00ff00" />
                    </mesh>
                </group>
            );
        }
        return arrowObjs;
    }, [path, size]);

    return <group>{arrows}</group>;
};

export default HintPath;
