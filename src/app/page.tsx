"use client";
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion, useScroll } from "framer-motion";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { Engine } from "tsparticles-engine";
import { useRouter } from "next/navigation";
import { useSpring, animated } from "react-spring";
import "./globals.css";
import { Heart, Brain, BookOpen, Moon } from "lucide-react";
import * as THREE from "three";
import {
  MultimodalAnalysis,
  PersonalityAvatar,
  PersonalizedSuggestions,
  TherapyChatbot,
  Dashboard,
} from "@/components/features";

// Simpler Buddha model
function BuddhaModel() {
  const { scene } = useGLTF("/buddha.glb");
  const modelRef = useRef<THREE.Group>(null);

  // useEffect(() => {
  //   // Create the material with stone/marble appearance
  //   const material = new THREE.MeshStandardMaterial({
  //     metalness: 0.0,
  //     roughness: 0.0,
  //     color: "#4e5656", // Light stone color
  //     emissive: "#2a2a2a", // Subtle dark undertones
  //     emissiveIntensity: 0.05,
  //     envMapIntensity: 0.8,
  //   });

  // Apply the material to all meshes
  //   scene.traverse((child) => {
  //     if (child instanceof THREE.Mesh) {
  //       child.material = material;
  //     }
  //   });

  //   // Cleanup
  //   return () => {
  //     material.dispose();
  //   };
  // }, [scene]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={175}
      position={[0, -3, 0]}
    />
  );
}

const SoftWindEffect = () => {
  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      const randomX = Math.random() * 10 - 5;
      const randomY = Math.random() * 5 - 2.5;
      set({ xys: [randomX, randomY, 1.05] });
      setTimeout(() => {
        set({ xys: [0, 0, 1] });
      }, 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, [set]);

  const trans = (x: number, y: number, s: number) =>
    `translate3d(${x}px,${y}px,0) scale(${s})`;

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <animated.div
          key={i}
          className="absolute opacity-20"
          style={{
            transform: props.xys.to(trans),
            left: `${i * 12.5 + 5}%`,
            top: `${i * 12.5 + 5}%`,
            transition: "all 3s ease-out",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,1C7.03,1,3,5.03,3,10s4.03,9,9,9s9-4.03,9-9S16.97,1,12,1z M12,17c-3.86,0-7-3.14-7-7s3.14-7,7-7s7,3.14,7,7S15.86,17,12,17z" />
            <path d="M12,3c-3.86,0-7,3.14-7,7s3.14,7,7,7s7-3.14,7-7S15.86,3,12,3z M12,15c-2.76,0-5-2.24-5-5s2.24-5,5-5s5,2.24,5,5S14.76,15,12,15z" />
          </svg>
        </animated.div>
      ))}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const [particlesLoaded, setParticlesLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setParticlesLoaded(true), 1000);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const leavesParticlesOptions = {
    particles: {
      number: {
        value: 15,
        density: {
          enable: true,
          area: 800,
        },
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: "bottom" as const,
        random: true,
        straight: false,
        outModes: "out",
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200,
        },
      },
      size: {
        value: { min: 8, max: 20 },
        random: true,
      },
      color: {
        value: [
          "#A0522D",
          "#8B4513",
          "#CD853F",
          "#DEB887",
          "#F5DEB3",
          "#4b5320",
          "#556b2f",
          "#ADFF2F",
          "#9ACD32",
        ],
      },
      opacity: {
        value: 0.8,
        random: true,
        anim: {
          enable: true,
          speed: 0.2,
          opacity_min: 0.4,
          sync: false,
        },
      },
      shape: {
        type: ["image"],
        options: {
          image: [
            {
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23556B2F'%3E%3Cpath d='M12 2C7.03 2 3 6.03 3 11c0 .1.01.19.02.29.19-.13.4-.24.61-.34.01 0 .01-.01.02-.01.05-.02.1-.04.16-.06.03-.01.06-.03.1-.04.05-.02.11-.04.17-.06.04-.01.08-.03.13-.04.05-.02.1-.03.16-.05.05-.01.1-.03.15-.04.04-.01.08-.02.12-.03.02-.01.05-.01.07-.02 8.94-2.58 9.69-8.02 9.69-8.02S15.01 5.69 12 2zm0 13c-1.86 0-3.41-1.28-3.86-3h7.72c-.45 1.72-2 3-3.86 3zm-4-3.7V11h8v.3c0 2.43-1.75 4.43-4 4.43s-4-2-4-4.43z'/%3E%3Cpath d='M19.25 12.13c-1.88-.89-3.25-3.31-3.25-6.58 0-1.12.52-2.07 1-2.83L17 1l-.01 1.27c-.05.75-.33 3.15-1.99 5.73.48 3.12 3.21 4.82 5 5.57V22l-1-1v-7c-2-1-4.59-2.54-5-7H3l.02 1c.05.69.31 2.31 1.03 4.05.35.84.89 1.73 1.61 2.53.17.19.34.38.53.56.81.77 1.78 1.48 3.01 1.98.18.07.37.14.56.2.18.06.37.11.56.16.19.05.38.09.58.13.05.01.09.02.14.03.2.04.4.07.6.09.18.02.35.04.53.05.07.01.15.02.22.02.17.01.34.02.52.02.02 0 .05 0 .08 0 .13 0 .26 0 .39-.01l.18-.01c.14-.01.28-.03.42-.04.11-.01.22-.03.34-.05.06-.01.13-.02.19-.03.16-.03.31-.06.47-.1.06-.01.11-.03.17-.04.16-.04.31-.08.47-.13.07-.02.14-.04.21-.06.15-.05.3-.1.44-.16.08-.03.15-.06.23-.09.14-.06.28-.12.42-.19.08-.04.16-.08.24-.12.13-.07.26-.14.38-.22.01-.01.02-.01.03-.01.12-.07.24-.15.35-.23.09-.06.17-.11.25-.17.12-.09.23-.18.34-.28.08-.07.17-.13.24-.20.11-.11.22-.21.32-.32l.15-.15.31-.35c.07-.09.14-.18.21-.28.07-.09.13-.18.20-.28.01-.02.02-.03.04-.05.06-.10.11-.20.17-.30.06-.09.11-.19.16-.29.01-.02.02-.04.03-.05.05-.10.10-.20.14-.31.05-.10.09-.20.13-.31.04-.09.07-.19.10-.29.03-.10.06-.20.09-.30.03-.12.06-.25.09-.37.02-.12.04-.23.06-.36.02-.12.03-.25.04-.38.01-.12.02-.24.02-.36 0-.10.01-.21.01-.31l.28-.32.72.32c1.73 0 3.15 1.41 3.15 3.15 0 .37-.07.73-.20 1.08v9.93l-1 1v-7.89z'/%3E%3C/svg%3E",
            },
            // {
            //   src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238B4513'%3E%3Cpath d='M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L6.6 19H15l-.83 2h1.75l1.73-4H16l1.5-3.5L19 15h-1.17L19 18h2v-3c0-2.5-2.5-7-4-7zM8.67 14L7.33 16 6 14l-1.33 2 1.25 2h3.17l-1.25-2 1.33-2-1.33-2z'/%3E%3Cpath d='M13 2l-1 1.73C13.89 5 15.31 5.97 16.11 6.66 16.61 7.08 18 8.45 18 10c0 .5-.3.66-.67.89L21 13c.56-.22 1-.67 1-1.5 0-1.34-.97-3.22-2.33-5.31C18.33 3.67 15.78 2 13 2z'/%3E%3C/svg%3E",
            // },
            // {
            //   src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23A0522D'%3E%3Cpath d='M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L6.6 19H15l-.83 2h1.75l1.73-4H16l1.5-3.5L19 15h-1.17L19 18h2v-3c0-2.5-2.5-7-4-7z'/%3E%3Cpath d='M4.67 14L6 16l1.33-2 1.33 2-1.33 2h3.17L12 16l-1.33-2-1.33 2-1.33-2zm11.41-8.17C14.55 4.76 13 2 13 2s-1.55 2.76-3.08 3.83c-.48.33-.92.5-1.34.5.29 1.63 1.26 2.97 2.62 3.6.6-.27 1.1-.72 1.5-1.27.4.55.9 1 1.5 1.27 1.36-.63 2.33-1.97 2.62-3.6-.41 0-.85-.17-1.33-.5z'/%3E%3C/svg%3E",
            // },
          ],
        },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: {
          enable: true,
          speed: 5,
          sync: false,
        },
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: 5,
      },
      roll: {
        enable: true,
        speed: 3,
      },
      tilt: {
        enable: true,
        direction: "random",
        value: {
          min: 0,
          max: 360,
        },
        animation: {
          enable: true,
          speed: 5,
          sync: true,
        },
      },
    },
    background: {
      image:
        "radial-gradient(circle, rgba(43,50,59,1) 0%, rgba(26,32,44,1) 100%)",
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Wind Effect */}
      <SoftWindEffect />

      {/* Fog Overlay */}
      <div className="fog-overlay"></div>

      {/* Particles */}
      {particlesLoaded && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={leavesParticlesOptions}
        />
      )}

      {/* Combined Buddha and Intro Section */}
      <div className="h-screen flex items-center justify-center pt-0">
        <div className="w-full flex items-center justify-between gap-8">
          {/* Buddha Section */}
          <div className="w-1/2">
            <div className="h-[600px] relative">
              <Canvas camera={{ position: [10, 0, 0], fov: 50 }} shadows>
                {/* Main ambient light */}
                <ambientLight intensity={0.5} color="#ffffff" />

                {/* Main directional light */}
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={2}
                  color="#ffffff"
                  castShadow
                />

                {/* Bright spot light */}
                <spotLight
                  position={[10, 10, 10]}
                  angle={0.15}
                  penumbra={1}
                  intensity={10}
                  color="#ffffff"
                  castShadow
                />

                {/* Warm accent light */}
                <pointLight
                  position={[5, 5, -5]}
                  intensity={1}
                  color="#ffcc99"
                />

                <fog attach="fog" args={["#000000", 15, 25]} />

                {/* Scene components */}
                <Suspense fallback={null}>
                  <BuddhaModel />
                </Suspense>
                <OrbitControls
                  enableZoom={false}
                  maxPolarAngle={Math.PI / 2}
                  minPolarAngle={Math.PI / 3}
                />
              </Canvas>
            </div>
          </div>

          {/* Intro Section */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-1/2"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
              <h1 className="text-4xl md:text-5xl font-serif mb-6 text-white">
                Mind & Soul
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Welcome to a space of tranquility and self-discovery. Our
                AI-powered platform offers personalized guidance for your mental
                well-being journey.
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
            visible: { opacity: 1, x: 0 },
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
            visible: { opacity: 1, x: 0 },
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
            visible: { opacity: 1, x: 0 },
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
            visible: { opacity: 1, x: 0 },
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
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <Dashboard />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">512D</h3>
              <p className="text-gray-400">
                Empowering mental wellness through AI-powered therapy and
                personalized support.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
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
