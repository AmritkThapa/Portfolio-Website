import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Edges } from '@react-three/drei';
import { Terminal, Code2, Gamepad2 } from 'lucide-react';
import type { Mesh } from 'three';

const Box = ({ onClick, isOpened }: { onClick: () => void, isOpened: boolean }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (!isOpened) {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.8;
      } else {
        meshRef.current.rotation.x = Math.PI / 4;
        meshRef.current.rotation.y = Math.PI / 4;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color={hovered || isOpened ? "#00FFFF" : "#8A2BE2"} 
        wireframe={!isOpened}
        transparent
        opacity={0.8}
        emissive={hovered || isOpened ? "#00FFFF" : "#8A2BE2"}
        emissiveIntensity={0.5}
      />
      <Edges scale={1} threshold={15} color="#FFFFFF" />
    </mesh>
  );
};

export default function LootBox() {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start relative px-4">
      {/* 3D Canvas Container - Takes 50vh */}
      <div className={`transition-all duration-700 w-full flex-shrink-0 relative ${isOpened ? 'h-[40vh]' : 'h-[50vh]'}`}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
          <Environment preset="city" />
          <Box onClick={() => setIsOpened(true)} isOpened={isOpened} />
        </Canvas>
        
        {!isOpened && (
          <div className="absolute inset-x-0 bottom-8 text-cyan-400 animate-pulse font-mono flex items-center justify-center gap-2 pointer-events-none text-sm md:text-base">
            <span>&gt;</span> Click the Core to decrypt loot <span>&lt;</span>
          </div>
        )}
      </div>

      {/* Loot Drop (Side Quests) - Inventory Container */}
      <div className={`w-full max-w-4xl mx-auto mt-4 transition-all duration-1000 transform ${isOpened ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="glass-panel p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex flex-col gap-4">
          <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest border-b border-white/10 pb-2 mb-2">Systems Decrypted / Inventory</h3>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-purple-500/50 rounded-lg text-purple-200 font-mono text-sm hover:bg-white/10 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(138,43,226,0.5)] transition-all">
              <Code2 className="w-5 h-5 text-purple-400" />
              <span>LeetCode: DP</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-cyan-500/50 rounded-lg text-cyan-200 font-mono text-sm hover:bg-white/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Gist: Shaders</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-pink-500/50 rounded-lg text-pink-200 font-mono text-sm hover:bg-white/10 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(255,20,147,0.5)] transition-all">
              <Gamepad2 className="w-5 h-5 text-pink-400" />
              <span>Canvas Prototype</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
