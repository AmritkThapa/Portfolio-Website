import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Edges, Sparkles } from '@react-three/drei';
import { Terminal, Code2, Gamepad2 } from 'lucide-react';
import type { Mesh, Material } from 'three';
import * as THREE from 'three';
import { CARDS } from '../data/loot';

const Box = ({ onClick, isOpened }: { onClick: () => void, isOpened: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (!isOpened) {
        groupRef.current.rotation.y += delta * 0.5;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        groupRef.current.rotation.y += delta * 0.2;
      }
    }

    if (lidRef.current) {
      if (isOpened) {
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, -Math.PI / 1.5, delta * 4);
      } else {
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, 0, delta * 4);
      }
    }

    if (coreRef.current && isOpened) {
      coreRef.current.position.y = THREE.MathUtils.lerp(coreRef.current.position.y, 1.0 + Math.sin(state.clock.elapsedTime * 3) * 0.2, delta * 2);
      coreRef.current.rotation.y += delta * 2;
      coreRef.current.rotation.x += delta * 1;
    }
  });

  return (
    <group
      ref={groupRef}
      scale={hovered && !isOpened ? 1.05 : 1}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOpened) onClick();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      position={[0, -0.5, 0]}
    >
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial
          color={isOpened ? "#111111" : "#8A2BE2"}
          wireframe={!isOpened}
          transparent opacity={0.8}
          emissive={isOpened ? "#000000" : "#8A2BE2"}
          emissiveIntensity={0.2}
          toneMapped={false}
        />
        <Edges scale={1} threshold={15} color={isOpened ? "#00FFFF" : "#FFFFFF"} />
      </mesh>

      {/* Lid Group - Pivot at the back edge */}
      <group ref={lidRef} position={[0, 0.5, -1]}>
        {/* Lid Mesh shifted forward by 1 so back edge is at origin of Lid Group */}
        <mesh position={[0, 0.25, 1]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial
            color={isOpened ? "#111111" : "#8A2BE2"}
            wireframe={!isOpened}
            transparent opacity={0.8}
            emissive={isOpened ? "#000000" : "#8A2BE2"}
            emissiveIntensity={0.2}
            toneMapped={false}
          />
          <Edges scale={1} threshold={15} color={isOpened ? "#00FFFF" : "#FFFFFF"} />
        </mesh>
      </group>

      {/* Glowing Core inside */}
      {isOpened && (
        <group position={[0, 0, 0]}>
          <mesh ref={coreRef}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <Sparkles count={50} scale={3} size={3} speed={1} opacity={0.8} color="#00FFFF" />
        </group>
      )}

      {/* Idle Sparkles */}
      {!isOpened && (
        <Sparkles count={30} scale={4} size={1.5} speed={0.4} opacity={0.5} color="#8A2BE2" />
      )}
    </group>
  );
};


export default function LootBox() {
  const [isOpened, setIsOpened] = useState(false);
  const [selectedCard, setSelectedCard] = useState<typeof CARDS[0] | null>(null);

  const handleOpen = () => {
    if (isOpened) return;
    setIsOpened(true);
    const randomCard = CARDS[Math.floor(Math.random() * CARDS.length)];
    setSelectedCard(randomCard);
  };

  const handleReroll = () => {
    const randomCard = CARDS[Math.floor(Math.random() * CARDS.length)];
    setSelectedCard(randomCard);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Shift + A
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        if (!isOpened) {
          handleOpen();
        } else {
          handleReroll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpened]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start relative px-4">
      {/* 3D Canvas Container - Takes 50vh */}
      <div className={`transition-all duration-700 w-full flex-shrink-0 relative ${isOpened ? 'h-[40vh]' : 'h-[50vh]'}`}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
          <Environment preset="city" />
          <Box onClick={handleOpen} isOpened={isOpened} />
        </Canvas>

        {!isOpened && (
          <div className="absolute inset-x-0 bottom-8 text-cyan-400 animate-pulse font-mono flex items-center justify-center gap-2 pointer-events-none text-sm md:text-base">
            <span>&gt;</span> Click the Core to decrypt loot <span>&lt;</span>
          </div>
        )}
      </div>

      {/* Loot Drop (Side Quests) - Inventory Container */}
      <div className={`w-full max-w-4xl mx-auto mt-4 transition-all duration-1000 transform ${isOpened ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="glass-panel p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex flex-col items-center gap-8">

          {/* Top: RNG Pick */}
          <div className="w-full flex flex-col items-center relative">
            <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest border-b border-white/10 pb-2 mb-4 w-full text-center flex flex-col items-center gap-1">
              <span>Unlocked Loot</span>
              <span className="text-[10px] text-cyan-500/70 normal-case tracking-normal">(Press Shift+A to re-roll)</span>
            </h3>
            {selectedCard && (
              <div className={`flex flex-col h-64 w-full sm:w-80 bg-zinc-900 border-2 ${selectedCard.colors.border} rounded-xl overflow-hidden ${selectedCard.colors.shadow} relative group`}>
                <div className={`${selectedCard.colors.bgHeader} px-3 py-2 border-b ${selectedCard.colors.border}`}>
                  <h4 className={`${selectedCard.colors.textTitle} font-bold uppercase tracking-widest text-xs flex justify-between`}>
                    <span>{selectedCard.title}</span>
                    <span className={selectedCard.status === 'ONLINE' ? `animate-pulse ${selectedCard.colors.textStatus}` : selectedCard.colors.textStatus}>{selectedCard.status}</span>
                  </h4>
                </div>
                <div className={`flex-1 flex flex-col items-center justify-center p-4 bg-zinc-950 ${selectedCard.status === 'OFFLINE' ? 'opacity-70' : ''}`}>
                  {selectedCard.icon === 'Terminal' ? (
                    <Terminal className={`w-16 h-16 ${selectedCard.colors.icon} mb-4`} />
                  ) : (
                    <Gamepad2 className={`w-16 h-16 ${selectedCard.colors.icon} mb-4`} />
                  )}

                  {selectedCard.status === 'ONLINE' ? (
                    <a href={selectedCard.href} className="px-6 py-2 bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 font-mono uppercase tracking-widest text-sm hover:bg-cyan-800 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] pointer-events-auto relative z-50">
                      OPEN COMPONENT
                    </a>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                      <span className={`border-2 ${selectedCard.colors.overlayText} font-black px-4 py-2 rotate-[-15deg] ${selectedCard.colors.overlayShadow}`}>COMING SOON</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom: All Arcade Cabinets */}
          <div className="w-full flex flex-col items-center">
            <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest border-b border-white/10 pb-2 mb-4 w-full text-left">Arcade Cabinets Collection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {CARDS.map(card => (
                <div key={card.id} className={`flex flex-col h-64 bg-zinc-900 border-2 ${card.colors.border} rounded-xl overflow-hidden ${card.colors.shadow} relative group`}>
                  <div className={`${card.colors.bgHeader} px-3 py-2 border-b ${card.colors.border}`}>
                    <h4 className={`${card.colors.textTitle} font-bold uppercase tracking-widest text-xs flex justify-between`}>
                      <span>{card.title}</span>
                      <span className={card.status === 'ONLINE' ? `animate-pulse ${card.colors.textStatus}` : card.colors.textStatus}>{card.status}</span>
                    </h4>
                  </div>
                  <div className={`flex-1 flex flex-col items-center justify-center p-4 bg-zinc-950 ${card.status === 'OFFLINE' ? 'opacity-70' : ''}`}>
                    {card.icon === 'Terminal' ? (
                      <Terminal className={`w-16 h-16 ${card.colors.icon} mb-4`} />
                    ) : (
                      <Gamepad2 className={`w-16 h-16 ${card.colors.icon} mb-4`} />
                    )}

                    {card.status === 'ONLINE' ? (
                      <a href={card.href} className="px-6 py-2 bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 font-mono uppercase tracking-widest text-sm hover:bg-cyan-800 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] pointer-events-auto relative z-50">
                        OPEN COMPONENT
                      </a>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className={`border-2 ${card.colors.overlayText} font-black px-4 py-2 rotate-[-15deg] ${card.colors.overlayShadow}`}>COMING SOON</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
