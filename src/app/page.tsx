"use client";
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion, useScroll } from "framer-motion";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { Engine } from "tsparticles-engine";
import { useRouter } from "next/navigation";
import "./globals.css";
import { Heart, Brain, BookOpen, Moon } from "lucide-react";
import * as THREE from 'three';
import { MultimodalAnalysis, PersonalityAvatar, PersonalizedSuggestions, TherapyChatbot, Dashboard } from '@/components/features';

// Simpler Buddha model
function BuddhaModel() {
  const { scene } = useGLTF("/buddha.glb");
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Create the material once
    const material = new THREE.MeshStandardMaterial({
      metalness: 0.0,
      roughness: 0.4,
      color: "#ffffff",
      emissive: "#ffffff",
      emissiveIntensity: 0.2,
      envMapIntensity: 1.5,
    });

    // Apply the material to all meshes
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    // Cleanup
    return () => {
      material.dispose();
    };
  }, [scene]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={200}
      position={[0, -3, 0]}
    />
  );
}

export default function Home() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setTimeout(() => setParticlesLoaded(true), 1000);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowIntro(true);
      } else {
        setShowIntro(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">512D</div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {particlesLoaded && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: { value: 50, density: { enable: true, area: 1000 } },
              move: {
                enable: true,
                speed: 0.5,
                direction: "bottom",
                random: true,
                straight: false,
                outModes: "out",
                attract: {
                  enable: true,
                  rotateX: 600,
                  rotateY: 1200
                }
              },
              size: {
                value: { min: 4, max: 12 },
                random: true
              },
              color: {
                value: ["#FFB7C5", "#FFC0CB", "#FFE4E1", "#FF69B4", "#FF1493"]
              },
              opacity: {
                value: 0.7,
                random: true,
                anim: {
                  enable: true,
                  speed: 0.3,
                  opacity_min: 0.2,
                  sync: false
                }
              },
              shape: {
                type: ["image"],
                options: {
                  image: {
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFB7C5'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3Cpath d='M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z'/%3E%3C/svg%3E"
                  }
                }
              },
              rotate: {
                value: 0,
                random: true,
                direction: "clockwise",
                animation: {
                  enable: true,
                  speed: 2,
                  sync: false
                }
              },
              wobble: {
                enable: true,
                distance: 15,
                speed: 3
              },
              twinkle: {
                particles: {
                  enable: true,
                  frequency: 0.05,
                  opacity: 1
                }
              }
            }
          }}
        />
      )}

      <div className="container mx-auto px-4 pt-16">
        {/* Initial Buddha View - Big and Centered */}
        <div className={`h-screen flex items-center justify-center transition-all duration-500 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-[800px] w-full max-w-5xl relative">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }} shadows>
              {/* Ambient light */}
              <ambientLight intensity={0.2} />

              {/* Back Light for enlightenment effect */}
              <spotLight
                position={[0, 3, -10]}
                intensity={2.5}
                angle={0.6}
                penumbra={0.5}
                color="#FFF8E1"
                distance={25}
              />

              {/* Top light */}
              <spotLight
                position={[0, 15, 0]}
                intensity={1.5}
                angle={0.5}
                penumbra={1}
                color="#ffffff"
                distance={30}
              />

              {/* Front light (reduced intensity) */}
              <spotLight
                position={[0, 5, 10]}
                intensity={0.3}
                angle={0.3}
                penumbra={1}
                color="#ffffff"
                distance={20}
              />

              {/* Side rim lights */}
              <pointLight
                position={[-8, 3, -2]}
                intensity={0.8}
                color="#FFF8E1"
                distance={15}
                decay={2}
              />
              <pointLight
                position={[8, 3, -2]}
                intensity={0.8}
                color="#FFF8E1"
                distance={15}
                decay={2}
              />

              <fog attach="fog" args={['#000000', 15, 25]} />

              {/* Scene components */}
              <Suspense fallback={null}>
                <BuddhaModel />
              </Suspense>
              <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
            </Canvas>
          </div>
        </div>

        {/* Combined Buddha and Intro Section */}
        <div className={`h-screen flex items-center justify-center transition-all duration-500 ${showIntro ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full flex items-center justify-between gap-8">
            {/* Buddha Section */}
            <div className="w-1/2">
              <div className="h-[600px] relative">
                <Canvas camera={{ position: [0, 0, 15], fov: 45 }} shadows>
                  {/* Ambient light */}
                  <ambientLight intensity={0.2} />

                  {/* Back Light for enlightenment effect */}
                  <spotLight
                    position={[0, 3, -10]}
                    intensity={2.5}
                    angle={0.6}
                    penumbra={0.5}
                    color="#FFF8E1"
                    distance={25}
                  />

                  {/* Top light */}
                  <spotLight
                    position={[0, 15, 0]}
                    intensity={1.5}
                    angle={0.5}
                    penumbra={1}
                    color="#ffffff"
                    distance={30}
                  />

                  {/* Front light (reduced intensity) */}
                  <spotLight
                    position={[0, 5, 10]}
                    intensity={0.3}
                    angle={0.3}
                    penumbra={1}
                    color="#ffffff"
                    distance={20}
                  />

                  {/* Side rim lights */}
                  <pointLight
                    position={[-8, 3, -2]}
                    intensity={0.8}
                    color="#FFF8E1"
                    distance={15}
                    decay={2}
                  />
                  <pointLight
                    position={[8, 3, -2]}
                    intensity={0.8}
                    color="#FFF8E1"
                    distance={15}
                    decay={2}
                  />

                  <fog attach="fog" args={['#000000', 15, 25]} />

                  {/* Scene components */}
                  <Suspense fallback={null}>
                    <BuddhaModel />
                  </Suspense>
                  <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
                </Canvas>
              </div>
            </div>

            {/* Intro Section */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: showIntro ? 1 : 0, x: showIntro ? 0 : 100 }}
              transition={{ duration: 0.8 }}
              className="w-1/2"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                <h1 className="text-4xl md:text-5xl font-serif mb-6 text-white">Mind & Soul</h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Welcome to a space of tranquility and self-discovery. Our AI-powered platform offers personalized
                  guidance for your mental well-being journey.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/questions")}
                  className="w-full bg-gradient-to-r from-white/20 via-white/30 to-white/20 text-white border-none px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Begin Your Journey
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Components */}
        <div className="w-full max-w-6xl mx-auto space-y-32 py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: -100 },
              visible: { opacity: 1, x: 0 }
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <MultimodalAnalysis />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: 100 },
              visible: { opacity: 1, x: 0 }
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <PersonalityAvatar />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: -100 },
              visible: { opacity: 1, x: 0 }
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <PersonalizedSuggestions />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: 100 },
              visible: { opacity: 1, x: 0 }
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <TherapyChatbot />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: -100 },
              visible: { opacity: 1, x: 0 }
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <Dashboard />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">512D</h3>
              <p className="text-gray-400">
                Empowering mental wellness through AI-powered therapy and personalized support.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: contact@512d.com</li>
                <li className="text-gray-400">Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 512D. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}