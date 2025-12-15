import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CELL_SIZE = 2;
const SPEED = 5;
const ROTATION_SPEED = 3;
const PLAYER_RADIUS = 0.3;

const Player = ({ mazeData, size, setGameState, onPositionChange, joystickRef, activeHint, collisionEffect, hintItems, onCollectHint }) => {
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

  // Intro State
  const [isIntro, setIsIntro] = useState(true);
  const introStartTime = useRef(null);
  const smoothedCameraRotation = useRef(0);

  // Victory State
  const [isVictory, setIsVictory] = useState(false);
  const victoryStartTime = useRef(null);

  // Collision Effect State
  const collisionIntensity = useRef(0);
  const bodyMaterialRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Adjust for Mobile (Portrait)
    const { width, height: canvasHeight } = state.size;
    const isPortrait = width < canvasHeight;

    const baseDist = isPortrait ? 6 : 4;
    const baseHeight = isPortrait ? 3 : 1.5;
    const baseFov = isPortrait ? 80 : 50;

    if (camera.fov !== baseFov) {
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
    }

    // Intro Animation Logic
    if (isIntro) {
      if (introStartTime.current === null) {
        introStartTime.current = state.clock.elapsedTime;
      }

      const elapsed = state.clock.elapsedTime - introStartTime.current;
      const totalDuration = 5.0;

      if (elapsed < totalDuration) {
        const t = elapsed / totalDuration;
        // Ease in-out cubic for smooth acceleration and deceleration
        const smoothT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // --- Animation Parameters ---

        // 1. Orbit Center: From Maze Center (0,0,0) to Player Position
        // This makes the camera focus shift from the maze to the player naturally.
        const startCenter = new THREE.Vector3(0, 0, 0);
        const endCenter = position.clone();
        const currCenter = new THREE.Vector3().lerpVectors(startCenter, endCenter, smoothT);

        // 2. Radius (Distance from Center): From Far to Close (baseDist)
        const startRadius = size * 3.0; // See entire maze
        const endRadius = baseDist;
        const currRadius = startRadius + (endRadius - startRadius) * smoothT;

        // 3. Height: From High to Low (baseHeight)
        const startHeight = size * 3.0;
        const endHeight = baseHeight;
        const currHeight = startHeight + (endHeight - startHeight) * smoothT;

        // 4. Angle: Spiral Motion
        // Start from Front-ish (Math.PI) to Back (0) relative to player rotation
        // Adding extra rotation (Math.PI * 2) makes it swirl more dynamically
        const startAngle = rotation + Math.PI; // Front view
        const endAngle = rotation + Math.PI * 4; // Spin 2 times and land on Back (0 mod 2PI) -> Wait, Back is 0 relative to rotation.
        // Let's just go from PI to 0.
        const angleStartVal = rotation + Math.PI;
        const angleEndVal = rotation;
        const currAngle = angleStartVal + (angleEndVal - angleStartVal) * smoothT;

        // 5. Calculate Camera Position
        // X = CenterX + sin(angle) * radius
        // Z = CenterZ + cos(angle) * radius
        const camX = currCenter.x + Math.sin(currAngle) * currRadius;
        const camZ = currCenter.z + Math.cos(currAngle) * currRadius;
        const camY = currCenter.y + currHeight;

        camera.position.set(camX, camY, camZ);

        // 6. Look At Target: From Maze Center to Player Head
        const startLook = new THREE.Vector3(0, 0, 0);
        const endLook = position.clone().add(new THREE.Vector3(0, 0.5, 0));
        const currLook = new THREE.Vector3().lerpVectors(startLook, endLook, smoothT);

        camera.lookAt(currLook);

        // Breathing animation
        const time = state.clock.elapsedTime * 2;
        meshRef.current.position.y = 0.5 + Math.sin(time) * 0.02;

        return;
      } else {
        setIsIntro(false);
      }
    }

    // Victory Animation Logic
    if (isVictory) {
      if (victoryStartTime.current === null) {
        victoryStartTime.current = state.clock.elapsedTime;
      }
      const elapsed = state.clock.elapsedTime - victoryStartTime.current;

      if (elapsed < 2.0) {
        // Dance! Jump and Spin
        const jumpHeight = Math.abs(Math.sin(elapsed * 10)) * 0.5;
        meshRef.current.position.y = 0.5 + jumpHeight;
        meshRef.current.rotation.y += 10 * delta; // Spin fast

        // Arms up
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.z = Math.PI - 0.5; // Hands up
          rightArmRef.current.rotation.z = -Math.PI + 0.5;
        }
        return;
      } else {
        setGameState('won');
        return;
      }
    }

    // Rotation & Movement (Only if not zooming out)
    let rotChange = 0;
    let moveVec = new THREE.Vector3();
    let isMoving = false;
    let newRotation = rotation;
    const moveSpeed = SPEED * delta;

    if (activeHint !== 'zoomout') {
      // Rotation
      if (keys.current.a) rotChange += ROTATION_SPEED * delta;
      if (keys.current.d) rotChange -= ROTATION_SPEED * delta;

      // Joystick Rotation (X axis)
      if (joystickRef && joystickRef.current) {
        // Joystick X is usually -1 (left) to 1 (right)
        // We want left (-1) to ADD rotation (positive rotChange)
        rotChange -= joystickRef.current.x * ROTATION_SPEED * delta;
      }

      newRotation = rotation + rotChange;
      if (rotChange !== 0) {
        setRotation(newRotation);
        meshRef.current.rotation.y = newRotation;

        // Tilt body when turning
        // rotChange > 0 (Left) -> Tilt Left (Z > 0)
        // rotChange < 0 (Right) -> Tilt Right (Z < 0)
        // Wait, standard banking: Turn Left -> Bank Left. 
        // In Three.js, Z rotation: Positive is CCW (Left tilt?), Negative is CW (Right tilt?)
        // Let's try: Turn Left (rotChange > 0) -> Z = -0.2
        // Turn Right (rotChange < 0) -> Z = 0.2
        const tiltAmount = 0.3;
        const targetTilt = rotChange > 0 ? -tiltAmount : tiltAmount;
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetTilt, 0.1);
      } else {
        // Return to upright
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
      }

      // Movement
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), newRotation);

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

      isMoving = moveVec.lengthSq() > 0;
    }

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
          setIsVictory(true);
        }
      } else {
        // Collision Hit!
        if (collisionEffect) {
          collisionIntensity.current = 1.0;
        }
      }
    }

    // Check Item Collection
    if (hintItems && onCollectHint) {
      const floorSize = size * CELL_SIZE;
      const offset = (floorSize / 2) - (CELL_SIZE / 2);

      hintItems.forEach(item => {
        const itemX = item.x * CELL_SIZE - offset;
        const itemZ = item.y * CELL_SIZE - offset;
        const dist = new THREE.Vector2(position.x - itemX, position.z - itemZ).length();

        if (dist < 0.8) { // Collection radius
          onCollectHint(item.id);
        }
      });
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
    if (activeHint === 'zoomout') {
      // Bird's Eye View Hint
      const centerPos = new THREE.Vector3(0, 0, 0);
      const highPos = new THREE.Vector3(0, size * 5, 0.1);

      camera.position.lerp(highPos, 0.1);
      camera.lookAt(centerPos);
    } else {
      // Normal Follow Logic

      // Smooth Camera Rotation
      const rotLerpFactor = 3.0 * delta;
      smoothedCameraRotation.current += (newRotation - smoothedCameraRotation.current) * rotLerpFactor;

      const camRot = smoothedCameraRotation.current;

      // Calculate offset relative to rotation
      let dist = baseDist;
      const height = baseHeight;

      // Simple Raycast for Camera Clipping
      const backwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), camRot).normalize();

      // We check discrete steps
      const checkStep = 0.1;
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
        const rightDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), camRot).normalize();
        const sideOffset = 0.3;
        const leftPos = checkPos.clone().sub(rightDir.clone().multiplyScalar(sideOffset));
        const rightPos = checkPos.clone().add(rightDir.clone().multiplyScalar(sideOffset));

        if (isWall(leftPos) || isWall(rightPos)) {
          dist = Math.max(0.5, d - 0.5);
          break;
        }
      }

      const camOffset = new THREE.Vector3(0, height, dist);
      camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), camRot);

      const targetPos = position.clone().add(camOffset);
      camera.position.lerp(targetPos, 0.1);
      // Look slightly higher to avoid looking at the floor, but not too high
      camera.lookAt(position.clone().add(new THREE.Vector3(0, 0.8, 0)));

      // Apply Camera Shake from Collision
      if (collisionIntensity.current > 0) {
        const shakeAmount = 0.2 * collisionIntensity.current;
        const shakeX = (Math.random() - 0.5) * shakeAmount;
        const shakeY = (Math.random() - 0.5) * shakeAmount;
        camera.position.x += shakeX;
        camera.position.y += shakeY;
      }
    }

    // Process Collision Effect Decay & Color
    if (collisionIntensity.current > 0) {
      collisionIntensity.current -= delta * 3.0; // Fade out
      if (collisionIntensity.current < 0) collisionIntensity.current = 0;

      if (bodyMaterialRef.current) {
        const baseColor = new THREE.Color("hotpink");
        const hitColor = new THREE.Color("red");
        bodyMaterialRef.current.color.lerpColors(baseColor, hitColor, collisionIntensity.current);
      }
    }
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

    // Reset Intro
    setIsIntro(true);
    introStartTime.current = null;

    // Reset Victory
    setIsVictory(false);
    victoryStartTime.current = null;
    smoothedCameraRotation.current = 0;

    // Reset Collision
    collisionIntensity.current = 0;
    if (bodyMaterialRef.current) bodyMaterialRef.current.color.set("hotpink");

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
        <meshStandardMaterial ref={bodyMaterialRef} color="hotpink" />
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
