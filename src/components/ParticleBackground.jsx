import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

const ParticleBackground = () => {
  // This is a required function for the library to initialize the engine
  const particlesInit = useCallback(async (engine) => {
    // console.log(engine); // You can log the engine to see its properties
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // console.log(container); // You can log the container to see its properties
  }, []);

  // This is the configuration object that defines how the particles look and behave.
  // Feel free to tweak these values to get the exact look you want!
  const particleOptions = {
    background: {
      color: {
        value: '#0d1117', // The dark navy background color
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse', // This makes the particles move away from the cursor
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: '#ffffff',
      },
      links: {
        color: '#ffffff',
        distance: 150,
        enable: true,
        opacity: 0.1, // Make the links very subtle
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 0.5, // Slow, gentle movement
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80, // Number of particles
      },
      opacity: {
        value: 0.3, // Make the particles semi-transparent
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 }, // Particles will have a random size between 1 and 3 pixels
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={particleOptions}
      className="absolute top-0 left-0 w-full h-full z-[-1]" // Position it behind all other content
    />
  );
};

export default ParticleBackground;