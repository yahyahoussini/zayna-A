import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import * as Tone from 'tone';

// --- 3D Scene component with corrected audio sync ---
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/zayna-scene.glb');
  const { actions } = useAnimations(animations, group);

  // Use refs for audio player and its state to persist across renders
  const audioPlayer = useRef<Tone.Player | null>(null);
  const audioStarted = useRef(false);

  // --- Initialization Effect ---
  // This runs only once to set up the animation and audio player.
  useEffect(() => {
    // Set up the animation but keep it paused
    if (actions && Object.keys(actions).length > 0) {
      const animationName = Object.keys(actions)[0];
      const action = actions[animationName];
      if (action) {
        action.play().paused = true;
      }
    }

    // --- Corrected Audio Player Setup ---
    // Initialize the Tone.js Player
    const player = new Tone.Player({
      url: "/scene-audio.mp3",
      loop: false, // Ensure the sound doesn't loop by itself
      onload: () => {
        console.log("Audio file loaded successfully!");
      },
      // KEY FIX #1: The 'onstop' callback is triggered whenever the player stops,
      // either by reaching the end of the file or by a manual .stop() call.
      // We use this to reliably track the player's state.
      onstop: () => {
        audioStarted.current = false;
      },
      onerror: (error) => {
        console.error("Error loading audio file:", error);
      }
    }).toDestination();

    audioPlayer.current = player;

    // Cleanup function to dispose of the player when the component unmounts
    return () => {
      player?.dispose();
    };
  }, [actions]); // Dependency array ensures this runs once when actions are ready

  // --- Frame Loop for Syncing ---
  // This runs on every frame, keeping animation and audio in sync with scroll.
  useFrame(() => {
    // 1. Sync Animation
    // This part scrubs the animation timeline based on scroll progress.
    if (actions && Object.keys(actions).length > 0) {
      const animationName = Object.keys(actions)[0];
      const action = actions[animationName];
      if (action) {
        const duration = action.getClip().duration;
        // Use lerp to smoothly map scroll progress to animation time
        action.time = THREE.MathUtils.lerp(0, duration, scrollProgress);
      }
    }

    // 2. Sync Audio
    // This part handles starting and stopping the audio.
    const player = audioPlayer.current;
    if (!player || !player.loaded) {
      return; // Do nothing if the player isn't ready
    }

    const isPlaying = audioStarted.current;
    // Define the "active" scroll zone where sound should play
    const inActiveZone = scrollProgress > 0.01 && scrollProgress < 0.99;

    // --- KEY FIX #2: Corrected Start/Stop Logic ---
    if (inActiveZone && !isPlaying) {
      // If we are in the active zone and the audio is not playing, start it.
      if (Tone.context.state !== 'running') {
        Tone.start(); // Start audio context if it's not running
      }
      player.start();
      audioStarted.current = true;
    } else if (!inActiveZone && isPlaying) {
      // If we are outside the active zone (at the start or end) and the audio
      // is currently playing, stop it. The onstop callback will then reset
      // audioStarted.current to false.
      player.stop();
    }
  });

  return <primitive ref={group} object={scene} scale={1} />;
}

// --- Main component that exports the 3D scene ---
export const ThreeDShowcase = ({ scrollProgress }: { scrollProgress: number }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <Suspense fallback={null}>
        <Scene scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
};

useGLTF.preload('/zayna-scene.glb');
