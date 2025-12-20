import React, { useMemo } from 'react';
import * as THREE from 'three';

const Decorations = ({ size, theme, mazeData }) => {

    // Generate decorations based on theme and maze structure
    const decorations = useMemo(() => {
        const items = [];
        if (!theme) return items;

        const count = Math.floor(size * 1.5); // Density based on size
        const CELL_SIZE = 2;

        for (let i = 0; i < count; i++) {
            // Random position
            let x, y;
            let valid = false;
            let attempts = 0;

            // Try to find a valid spot (floor or wall based on decoration type)
            while (!valid && attempts < 20) {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);

                // Don't spawn on start/end
                if ((x < 2 && y < 2) || (x === size - 1 && y === size - 1)) {
                    attempts++;
                    continue;
                }
                valid = true;
            }

            if (!valid) continue;

            const cx = x * CELL_SIZE;
            const cy = y * CELL_SIZE;

            // Add slight randomness to position within cell
            const offsetX = (Math.random() - 0.5) * 1.2;
            const offsetY = (Math.random() - 0.5) * 1.2;

            if (theme.name === 'Forest') {
                // Trees
                items.push(
                    <group key={i} position={[cx + offsetX, 0, cy + offsetY]}>
                        {/* Trunk */}
                        <mesh position={[0, 0.5, 0]}>
                            <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
                            <meshStandardMaterial color="#4d2926" />
                        </mesh>
                        {/* Leaves */}
                        <mesh position={[0, 1.2, 0]}>
                            <coneGeometry args={[0.5, 1.5, 8]} />
                            <meshStandardMaterial color="#2d5a27" />
                        </mesh>
                    </group>
                );
            } else if (theme.name === 'Desert') {
                // Cactus
                items.push(
                    <group key={i} position={[cx + offsetX, 0, cy + offsetY]}>
                        <mesh position={[0, 0.6, 0]}>
                            <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
                            <meshStandardMaterial color="#228b22" />
                        </mesh>
                        {/* Sphere Top */}
                        <mesh position={[0, 1.2, 0]}>
                            <sphereGeometry args={[0.15, 8, 8]} />
                            <meshStandardMaterial color="#228b22" />
                        </mesh>
                        {/* Arm */}
                        <mesh position={[0.2, 0.8, 0]} rotation={[0, 0, -0.5]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
                            <meshStandardMaterial color="#228b22" />
                        </mesh>
                    </group>
                );
            } else if (theme.name === 'City') {
                // Street Lamp
                items.push(
                    <group key={i} position={[cx + offsetX, 0, cy + offsetY]}>
                        <mesh position={[0, 1, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
                            <meshStandardMaterial color="#333" />
                        </mesh>
                        <mesh position={[0, 2, 0.2]}>
                            <boxGeometry args={[0.2, 0.1, 0.4]} />
                            <meshStandardMaterial color="#333" />
                        </mesh>
                        <pointLight position={[0, 1.9, 0.2]} distance={5} intensity={1} color="yellow" />
                        <mesh position={[0, 1.95, 0.2]}>
                            <boxGeometry args={[0.15, 0.05, 0.3]} />
                            <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
                        </mesh>
                    </group>
                );
            } else if (theme.name === 'Space') {
                // Floating Rocks
                items.push(
                    <mesh key={i} position={[cx + offsetX, 1 + Math.random() * 2, cy + offsetY]} rotation={[Math.random(), Math.random(), 0]}>
                        <dodecahedronGeometry args={[0.3]} />
                        <meshStandardMaterial color="#555" roughness={0.8} />
                    </mesh>
                );
            } else if (theme.name === 'Ice') {
                // Ice Crystals
                items.push(
                    <mesh key={i} position={[cx + offsetX, 0.3, cy + offsetY]} rotation={[0, Math.random(), 0]}>
                        <coneGeometry args={[0.2, 0.8, 4]} />
                        <meshStandardMaterial color="#aaffff" transparent opacity={0.8} metalness={0.9} roughness={0.1} />
                    </mesh>
                );
            }
        }
        return items;
    }, [size, theme]);

    return <group>{decorations}</group>;
};

export default Decorations;
