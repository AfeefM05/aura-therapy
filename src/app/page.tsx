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

function BuddhaModel() {
  const { scene } = useGLTF("/buddha.glb");
  const modelRef = useRef<THREE.Group>(null);

  // Continuous Rotation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y +=0.008; // Adjust speed if needed
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={140}
      position={[0, -2, 0]}
      receiveShadow
      castShadow
    />
  );
}

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
      {particlesLoaded && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: { value: 30, density: { enable: true, area: 800 } },
              move: { enable: true, speed: 1 },
              size: { value: { min: 1, max: 3 } },
              color: { value: "#9CA3AF" },
            },
          }}
        />
      )}

      <div className="container mx-auto px-4 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="h-[600px] relative">
            <Canvas camera={{ position: [10, 0, 0], fov: 50 }} shadows>
              {/* Stronger ambient light for balanced illumination */}
              <ambientLight intensity={0.6} color={"#ffffff"} />

              {/* Directional light from above to reduce dark spots */}
              <directionalLight
                position={[0, 10, 10]}
                intensity={2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />

              {/* Softer spotlight to prevent harsh shadows */}
              <spotLight position={[5, 10, 5]} intensity={1.5} angle={0.3} penumbra={0.5} castShadow />

              {/* Point light for extra highlight and reducing darkness */}
              <pointLight position={[0, 5, -5]} intensity={1.2} color="#ffcc99" />

              <Suspense fallback={null}>
                <BuddhaModel />
              </Suspense>
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
          >
            <h1 className="text-4xl md:text-5xl font-serif mb-6 text-gray-800">Mind & Soul</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Welcome to a space of tranquility and self-discovery. Our AI-powered platform offers personalized
              guidance for your mental well-being journey.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/questions")}
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
