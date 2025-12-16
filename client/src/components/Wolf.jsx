import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const WOLF_SPEED = 5 * 0.4 * 0.8; // Player Base Speed (5 * 0.4) * 0.8
const WOLF_RADIUS = 0.4;
const DETECTION_RADIUS = 5;

const Wolf = ({ startPos, playerPos, mazeData, size, onCatch, onChaseUpdate }) => {
    const meshRef = useRef();
    const [position, setPosition] = useState(startPos);
    const [isChasing, setIsChasing] = useState(false);
    const [roarOpacity, setRoarOpacity] = useState(0);

    useEffect(() => {
        setPosition(startPos);
        setIsChasing(false);
        setRoarOpacity(0);
        if (onChaseUpdate) onChaseUpdate(false);
    }, [startPos]);

    const lastCatchTime = useRef(0);
    const isPaused = useRef(false);

    useFrame((state, delta) => {
        if (!meshRef.current || !playerPos) return;

        // Always look at player
        meshRef.current.lookAt(playerPos);

        const dist = position.distanceTo(playerPos);

        if (!isChasing) {
            // Check for detection
            if (dist < DETECTION_RADIUS) {
                setIsChasing(true);
                setRoarOpacity(1);
                if (onChaseUpdate) onChaseUpdate(true);

                // Fade out roar after 2 seconds
                setTimeout(() => {
                    setRoarOpacity(0);
                }, 2000);
            }
            return; // Stay still if not chasing
        }

        // Pause Logic
        if (isPaused.current) return;

        // Chase Logic
        const direction = new THREE.Vector3().subVectors(playerPos, position).normalize();
        const moveDist = WOLF_SPEED * delta;
        const nextPos = position.clone().add(direction.multiplyScalar(moveDist));

        // Collision Detection (Same as Player)
        const CELL_SIZE = 2;
        const floorSize = size * CELL_SIZE;
        const offset = (floorSize / 2) - (CELL_SIZE / 2);

        const checkCollision = (pos) => {
            const gridX = Math.round((pos.x + offset) / CELL_SIZE);
            const gridY = Math.round((pos.z + offset) / CELL_SIZE);

            if (gridX < 0 || gridX >= size || gridY < 0 || gridY >= size) return true;

            const cell = mazeData[gridY][gridX];
            const localX = (pos.x + offset) - (gridX * CELL_SIZE);
            const localY = (pos.z + offset) - (gridY * CELL_SIZE);

            if (cell.walls.top && localY < -CELL_SIZE / 2 + WOLF_RADIUS) return true;
            if (cell.walls.bottom && localY > CELL_SIZE / 2 - WOLF_RADIUS) return true;
            if (cell.walls.left && localX < -CELL_SIZE / 2 + WOLF_RADIUS) return true;
            if (cell.walls.right && localX > CELL_SIZE / 2 - WOLF_RADIUS) return true;

            return false;
        };

        if (!checkCollision(nextPos)) {
            setPosition(nextPos);
            meshRef.current.position.copy(nextPos);
        } else {
            // Try sliding
            const nextPosX = position.clone().add(new THREE.Vector3(direction.x, 0, 0).multiplyScalar(moveDist));
            if (!checkCollision(nextPosX)) {
                setPosition(nextPosX);
                meshRef.current.position.copy(nextPosX);
            } else {
                const nextPosZ = position.clone().add(new THREE.Vector3(0, 0, direction.z).multiplyScalar(moveDist));
                if (!checkCollision(nextPosZ)) {
                    setPosition(nextPosZ);
                    meshRef.current.position.copy(nextPosZ);
                }
            }
        }

        // Check Catch with Cooldown
        if (dist < 0.8) {
            const now = Date.now();
            if (now - lastCatchTime.current > 2000) { // 2 seconds cooldown
                if (onCatch) onCatch();
                lastCatchTime.current = now;

                // Pause for 0.8 seconds
                isPaused.current = true;
                setTimeout(() => {
                    isPaused.current = false;
                }, 800);
            }
        }
    });

    return (
        <group ref={meshRef} position={startPos}>
            {/* Roar Effect */}
            {roarOpacity > 0 && (
                <Text
                    position={[0, 1.5, 0]}
                    fontSize={0.5}
                    color="red"
                    anchorX="center"
                    anchorY="middle"
                    fillOpacity={roarOpacity}
                >
                    ROAR!
                </Text>
            )}

            <group rotation={[0, Math.PI, 0]}>
                {/* Body */}
                <mesh position={[0, 0, 0]} castShadow>
                    <capsuleGeometry args={[WOLF_RADIUS, 0.6, 4, 8]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.5, 0.3]} castShadow>
                    <boxGeometry args={[0.35, 0.35, 0.4]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
                {/* Snout */}
                <mesh position={[0, 0.5, 0.55]} castShadow>
                    <boxGeometry args={[0.2, 0.15, 0.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* Ears */}
                <mesh position={[-0.12, 0.7, 0.3]} rotation={[0, 0, 0.2]}>
                    <coneGeometry args={[0.08, 0.2, 4]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
                <mesh position={[0.12, 0.7, 0.3]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.08, 0.2, 4]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
                {/* Eyes */}
                <mesh position={[-0.08, 0.55, 0.51]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                </mesh>
                <mesh position={[0.08, 0.55, 0.51]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={2} />
                </mesh>
                {/* Legs */}
                <mesh position={[-0.15, -0.4, 0.15]}>
                    <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
                <mesh position={[0.15, -0.4, 0.15]}>
                    <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
                <mesh position={[-0.15, -0.4, -0.15]}>
                    <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
                <mesh position={[0.15, -0.4, -0.15]}>
                    <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
                {/* Tail */}
                <mesh position={[0, -0.2, -0.4]} rotation={[-0.5, 0, 0]}>
                    <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
            </group>
        </group>
    );
};

export default Wolf;
