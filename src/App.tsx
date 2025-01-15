import { Canvas } from "@react-three/fiber";
import { OrbitControls, SoftShadows } from "@react-three/drei";
import { Stack } from "./components/Stack";
import { ComparisonLines } from "./components/ComparisonLines";
import { ControlPanel } from "./components/ControlPanel";
import { ComparisonOperator } from "./components/ComparisonOperator";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useComparisonStore } from "./store/comparisonStore";
import * as THREE from "three";

function CameraController() {
  const mode = useComparisonStore((state) => state.mode);
  const leftStack = useComparisonStore((state) => state.leftStack);
  const rightStack = useComparisonStore((state) => state.rightStack);
  const lockedPosition = useRef<THREE.Vector3 | null>(null);
  const lockedTarget = useRef<THREE.Vector3 | null>(null);

  const targetPosition = new THREE.Vector3(0, 0, 0);

  useFrame(({ camera }) => {
    if (mode === "drawCompare") {
      const targetCameraPos = new THREE.Vector3(0, 0, 11);
      camera.position.lerp(targetCameraPos, 0.05);
      camera.lookAt(targetPosition);
    } else if (mode === "addRemove") {
      if (!lockedPosition.current) {
        lockedPosition.current = camera.position.clone();
        lockedTarget.current = new THREE.Vector3(0, 0, 0);
      }

      if (lockedPosition.current && lockedTarget.current) {
        camera.position.copy(lockedPosition.current);
        camera.lookAt(lockedTarget.current);
      }
    } else {
      lockedPosition.current = null;
      lockedTarget.current = null;

      const maxHeight = Math.max(leftStack, rightStack);
      const baseDistance = 10;
      const distancePerBlock = 0.8;
      const targetDistance = baseDistance + maxHeight * distancePerBlock;
      const currentDistance = camera.position.length();
      const newDistance = THREE.MathUtils.lerp(
        currentDistance,
        targetDistance,
        0.1
      );
      camera.position.normalize().multiplyScalar(newDistance);
    }
  });

  return null;
}

export default function App() {
  const mode = useComparisonStore((state) => state.mode);
  const leftPosition: [number, number, number] = [-2, 0, 0];
  const rightPosition: [number, number, number] = [2, 0, 0];

  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 50,
        }}
        className="w-full h-full"
        shadows>
        <CameraController />
        <SoftShadows />
        <color attach="background" args={["#111"]} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.3}
          color="#00ffff"
        />
        <spotLight
          position={[0, 10, -5]}
          intensity={0.5}
          color="#ff00ff"
          angle={0.6}
        />
        <ambientLight intensity={0.5} />

        <Stack side="left" position={leftPosition} />
        <Stack side="right" position={rightPosition} />
        <ComparisonLines leftPos={leftPosition} rightPos={rightPosition} />
        <ComparisonOperator leftPos={leftPosition} rightPos={rightPosition} />

        <OrbitControls
          enabled={mode === "none"}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={6}
          maxDistance={24}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -3.5, 0]}
          receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        <gridHelper args={[20, 20, "#444", "#222"]} position={[0, -3.49, 0]} />
      </Canvas>
      <ControlPanel />
    </div>
  );
}
