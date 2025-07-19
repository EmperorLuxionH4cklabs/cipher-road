import React, { useRef, useMemo } from "https://esm.sh/react";
import { useFrame } from "https://esm.sh/@react-three/fiber";
import * as THREE from "https://esm.sh/three";

// Simple particle system for visual effects
export function ParticleSystem({ position, count = 10, color = 0xffffff, duration = 1 }) {
  const particles = useRef();
  const clock = useRef(new THREE.Clock());

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random positions around the spawn point
      positions[i * 3] = position[0] + (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = position[2] + Math.random() * 10;
      
      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 50;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 50;
      velocities[i * 3 + 2] = Math.random() * 50;
    }
    
    return { positions, velocities };
  }, [position, count]);

  useFrame((state, delta) => {
    if (!particles.current) return;
    
    const elapsedTime = clock.current.getElapsedTime();
    if (elapsedTime > duration) {
      // Remove particles after duration
      particles.current.visible = false;
      return;
    }
    
    const positions = particles.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      // Update positions based on velocity
      positions[i * 3] += particleData.velocities[i * 3] * delta;
      positions[i * 3 + 1] += particleData.velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += particleData.velocities[i * 3 + 2] * delta;
      
      // Apply gravity
      particleData.velocities[i * 3 + 2] -= 100 * delta;
    }
    
    particles.current.geometry.attributes.position.needsUpdate = true;
    
    // Fade out over time
    const opacity = 1 - (elapsedTime / duration);
    particles.current.material.opacity = opacity;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={5}
        transparent={true}
        opacity={1}
      />
    </points>
  );
}