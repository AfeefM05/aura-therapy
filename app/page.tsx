"use client";

import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import { useCallback } from "react";
import { Engine } from "tsparticles-engine";
import { useRouter } from 'next/navigation';

function BuddhaModel({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const { scene } = useGLTF('/buddha.glb');
  const x = useTransform(scrollYProgress, [0, 1], [0, -5]);

  return (
    <motion.group style={{ x }}>
      <primitive
        object={scene}
        scale={150}
        position={[0, -2, 0]}
        rotation={[0, Math.PI/2, 0]}
        castShadow
        receiveShadow
      />
    </motion.group>
  );
}

export default function Home() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            color: {
              value: "#9CA3AF"
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "out"
              },
              random: true,
              speed: 2,
              straight: false
            },
            number: {
              density: {
                enable: true,
                area: 800
              },
              value: 30
            },
            opacity: {
              value: 0.5
            },
            shape: {
              type: "circle"
            },
            size: {
              value: { min: 1, max: 5 }
            }
          }
        }}
      />
      
      <div className="container mx-auto px-4 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="h-[600px] relative">
          <Canvas camera={{ position: [10, 0, 0], fov: 50 }} shadows>
              <ambientLight intensity={0.5} color="#ffffff" />
              <directionalLight
                position={[5, 5, 5]}
                intensity={1.5}
                color="#ffffff"
                castShadow
              />
              <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                intensity={6}
                color="#ffffff"
                castShadow
              />
              <pointLight position={[5, 5, -5]} intensity={1} color="#ffcc99" />
              <BuddhaModel scrollYProgress={scrollYProgress} />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
          >
            <h1 className="text-4xl md:text-5xl font-serif mb-6 text-gray-800">
              Mind & Soul
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Welcome to a space of tranquility and self-discovery. Our AI-powered platform 
              offers personalized guidance for your mental well-being journey, helping you 
              find balance and inner peace through understanding and support.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/questions')}
              className="btn btn-primary btn-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Journey
            </motion.button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}