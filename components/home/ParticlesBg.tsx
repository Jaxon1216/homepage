"use client";

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function ParticlesBg() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const options: ISourceOptions = {
    fullScreen: false,
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
      },
      modes: {
        grab: {
          distance: 150,
          links: {
            opacity: 0.4,
          },
        },
      },
    },
    particles: {
      number: {
        value: isMobile ? 30 : 80,
        density: { enable: true },
      },
      color: { value: "#3b82f6" },
      links: {
        enable: true,
        color: "#3b82f6",
        opacity: 0.15,
        distance: 150,
      },
      move: {
        enable: true,
        speed: 0.8,
        outModes: { default: "bounce" },
      },
      opacity: { value: { min: 0.1, max: 0.3 } },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  const particlesLoaded = useCallback(async () => {}, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      particlesLoaded={particlesLoaded}
    />
  );
}
