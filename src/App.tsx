import { Canvas } from "@react-three/fiber";
import { OrbitControls, SoftShadows } from "@react-three/drei";
import { Stack } from "./components/Stack";
import { ComparisonLines } from "./components/ComparisonLines";
import { ControlPanel } from "./components/ControlPanel";
import { ComparisonOperator } from "./components/ComparisonOperator";

export default function App() {
  const leftPosition: [number, number, number] = [-2, 0, 0];
  const rightPosition: [number, number, number] = [2, 0, 0];

  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        className="w-full h-full"
        shadows>
        <SoftShadows />
        <color attach="background" args={["#111"]} />

        {/* Key light */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Fill light */}
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.3}
          color="#00ffff"
        />

        {/* Rim light */}
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
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minDistance={6}
          maxDistance={18}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
        />

        {/* Ground plane for shadows */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.25, 0]}
          receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        <gridHelper args={[20, 20, "#444", "#222"]} />
      </Canvas>
      <ControlPanel />
    </div>
  );
}
