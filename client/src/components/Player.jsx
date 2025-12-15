import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CELL_SIZE = 2;
const SPEED = 5;
const ROTATION_SPEED = 3;
const PLAYER_RADIUS = 0.3;

const Player = ({ mazeData, size, setGameState, onPositionChange, joystickRef }) => {
  const meshRef = useRef();
  const { camera } = useThree();

  // Start at 0,0
  const [position, setPosition] = useState(new THREE.Vector3(0, 0.5, 0));
  const [rotation, setRotation] = useState(0); // in radians

  // Report initial position
  React.useEffect(() => {
    if (onPositionChange) onPositionChange(position);
  }, []);

  // Input state
  const keys = useRef({ w: false, a: false, s: false, d: false });

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
        keys.current[e.key === 'ArrowUp' ? 'w' : e.key === 'ArrowLeft' ? 'a' : e.key === 'ArrowDown' ? 's' : e.key === 'ArrowRight' ? 'd' : e.key] = true;
      }
    };
    const handleKeyUp = (e) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
        keys.current[e.key === 'ArrowUp' ? 'w' : e.key === 'ArrowLeft' ? 'a' : e.key === 'ArrowDown' ? 's' : e.key === 'ArrowRight' ? 'd' : e.key] = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Rotation
    let rotChange = 0;
    if (keys.current.a) rotChange += ROTATION_SPEED * delta;
    if (keys.current.d) rotChange -= ROTATION_SPEED * delta;

    // Joystick Rotation (X axis)
    if (joystickRef && joystickRef.current) {
      // Joystick X is usually -1 (left) to 1 (right)
      // We want left (-1) to ADD rotation (positive rotChange)
      rotChange -= joystickRef.current.x * ROTATION_SPEED * delta;
    }

    const newRotation = rotation + rotChange;
    if (rotChange !== 0) {
      setRotation(newRotation);
      meshRef.current.rotation.y = newRotation;
    }

    // Movement
    const moveSpeed = SPEED * delta;
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), newRotation);
    let moveVec = new THREE.Vector3();

    if (keys.current.w) moveVec.add(forward);
    if (keys.current.s) moveVec.sub(forward);

    // Joystick Movement (Y axis)
    if (joystickRef && joystickRef.current) {
      // Joystick Y is usually -1 (bottom) to 1 (top)
      // We want top (1) to move forward
      const joyY = joystickRef.current.y;
      if (Math.abs(joyY) > 0.1) { // Deadzone
        moveVec.add(forward.clone().multiplyScalar(joyY));
      }
    }

    const isMoving = moveVec.lengthSq() > 0;

    if (isMoving) {
      moveVec.normalize().multiplyScalar(moveSpeed);
      const nextPos = position.clone().add(moveVec);

      // Collision Detection
      const floorSize = size * CELL_SIZE;
      const offset = (floorSize / 2) - (CELL_SIZE / 2);

      const checkCollision = (pos) => {
        const gridX = Math.round((pos.x + offset) / CELL_SIZE);
        const gridY = Math.round((pos.z + offset) / CELL_SIZE);

        if (gridX < 0 || gridX >= size || gridY < 0 || gridY >= size) return true; // Out of bounds

        const cell = mazeData[gridY][gridX];
        const localX = (pos.x + offset) - (gridX * CELL_SIZE);
        const localY = (pos.z + offset) - (gridY * CELL_SIZE);

        // Check walls
        if (cell.walls.top && localY < -CELL_SIZE / 2 + PLAYER_RADIUS) return true;
        if (cell.walls.bottom && localY > CELL_SIZE / 2 - PLAYER_RADIUS) return true;
        if (cell.walls.left && localX < -CELL_SIZE / 2 + PLAYER_RADIUS) return true;
        if (cell.walls.right && localX > CELL_SIZE / 2 - PLAYER_RADIUS) return true;

        return false;
      };

      if (!checkCollision(nextPos)) {
        setPosition(nextPos);
        meshRef.current.position.copy(nextPos);
        if (onPositionChange) onPositionChange(nextPos);

        // Check Win
        const gridX = Math.round((nextPos.x + offset) / CELL_SIZE);
        const gridY = Math.round((nextPos.z + offset) / CELL_SIZE);
        if (gridX === size - 1 && gridY === size - 1) {
          setGameState('won');
        }
      }
    }

    // Animation (Bobbing & Feet & Arms)
    if (isMoving) {
      const time = state.clock.elapsedTime * 15;
      meshRef.current.position.y = 0.5 + Math.sin(time) * 0.05;

      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.position.z = Math.sin(time) * 0.2;
        rightFootRef.current.position.z = Math.sin(time + Math.PI) * 0.2;
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
        rightArmRef.current.rotation.x = Math.sin(time) * 0.8;
      }
    } else {
      meshRef.current.position.y = 0.5;
      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.position.z = 0;
        rightFootRef.current.position.z = 0;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }

    // Camera Follow (Locked behind)

    // Adjust for Mobile (Portrait)
    const { width, height: canvasHeight } = state.size;
    const isPortrait = width < canvasHeight;

    const baseDist = isPortrait ? 6 : 3;
    const baseHeight = isPortrait ? 3 : 1.5;
    const baseFov = isPortrait ? 80 : 50;

    if (camera.fov !== baseFov) {
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
    }

    // Calculate offset relative to rotation
    let dist = baseDist;
    const height = baseHeight;

    // Simple Raycast for Camera Clipping
    // Check backwards from player to see if we hit a wall
    const backwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), newRotation).normalize();

    // We check discrete steps
    const checkStep = 0.5;
    const maxDist = baseDist;

    const floorSize = size * CELL_SIZE;
    const offset = (floorSize / 2) - (CELL_SIZE / 2);

    // Helper to check if a point collides with a wall (reusing logic somewhat)
    const isWall = (pos) => {
      const gridX = Math.round((pos.x + offset) / CELL_SIZE);
      const gridY = Math.round((pos.z + offset) / CELL_SIZE);

      if (gridX < 0 || gridX >= size || gridY < 0 || gridY >= size) return false;

      const cell = mazeData[gridY][gridX];
      const localX = (pos.x + offset) - (gridX * CELL_SIZE);
      const localY = (pos.z + offset) - (gridY * CELL_SIZE);
      const wallThick = 0.2;

      if (cell.walls.top && localY < -CELL_SIZE / 2 + wallThick) return true;
      if (cell.walls.bottom && localY > CELL_SIZE / 2 - wallThick) return true;
      if (cell.walls.left && localX < -CELL_SIZE / 2 + wallThick) return true;
      if (cell.walls.right && localX > CELL_SIZE / 2 - wallThick) return true;

      return false;
    };

    // Raymarch backwards
    for (let d = 0; d <= maxDist; d += checkStep) {
      const checkPos = position.clone().add(backwardDir.clone().multiplyScalar(d));
      checkPos.y = height;

      // Check center
      if (isWall(checkPos)) {
        dist = Math.max(0.5, d - 0.5);
        break;
      }

      // Check sides (prevent corner clipping)
      const rightDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), newRotation).normalize();
      const sideOffset = 0.3;
      const leftPos = checkPos.clone().sub(rightDir.clone().multiplyScalar(sideOffset));
      const rightPos = checkPos.clone().add(rightDir.clone().multiplyScalar(sideOffset));

      if (isWall(leftPos) || isWall(rightPos)) {
        dist = Math.max(0.5, d - 0.5);
        break;
      }
    }

    const camOffset = new THREE.Vector3(0, height, dist);
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), newRotation);

    const targetPos = position.clone().add(camOffset);
    camera.position.lerp(targetPos, 0.2);
    camera.lookAt(position.clone().add(new THREE.Vector3(0, 0.5, 0)));
  });

  // Initial position setup
  React.useEffect(() => {
    const floorSize = size * CELL_SIZE;
    const offset = (floorSize / 2) - (CELL_SIZE / 2);
    // Start at 0,0 grid
    const startX = 0 * CELL_SIZE - offset;
    const startZ = 0 * CELL_SIZE - offset;
    const startPos = new THREE.Vector3(startX, 0.5, startZ);
    setPosition(startPos);
    setRotation(0);
    if (meshRef.current) {
      meshRef.current.position.copy(startPos);
      meshRef.current.rotation.y = 0;
    }
  }, [size]);

  const leftFootRef = useRef();
  const rightFootRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[PLAYER_RADIUS, 32, 32]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 0.1, -0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.1, 0.1, -0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="black" />
      </mesh>
      {/* Ears (Rabbit) */}
      <mesh position={[-0.15, 0.45, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh position={[0.15, 0.45, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      {/* Feet */}
      <mesh ref={leftFootRef} position={[-0.15, -0.25, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh ref={rightFootRef} position={[0.15, -0.25, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      {/* Arms (Hands) with Pivot */}
      <group ref={leftArmRef} position={[-0.25, 0.1, 0]}>
        <mesh position={[0, -0.25, 0.15]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.25, 0.1, 0]}>
        <mesh position={[0, -0.25, 0.15]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </group>
    </group>
  );
};

export default Player;
