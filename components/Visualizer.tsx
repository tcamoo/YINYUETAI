import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types';

interface VisualizerProps {
  isPlaying: boolean;
  mode: VisualizerMode;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, mode, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let frame = 0;

    const draw = () => {
      if (!ctx) return;
      frame++;
      
      // Clear with trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const centerX = width / 2;

      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();

      if (mode === VisualizerMode.WAVEFORM) {
        for (let x = 0; x < width; x += 5) {
            // Simulate audio data
            const amplitude = isPlaying ? Math.sin((x + frame * 5) * 0.02) * (height / 4) * Math.sin(frame * 0.05) : 10;
            const noise = isPlaying ? Math.random() * 20 : 0;
            const y = centerY + amplitude + noise;
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
      } else if (mode === VisualizerMode.BARS) {
        const barWidth = 20;
        const gap = 5;
        const numBars = Math.floor(width / (barWidth + gap));
        
        ctx.fillStyle = color;
        for (let i = 0; i < numBars; i++) {
           const freq = isPlaying ? Math.abs(Math.sin(i * 0.5 + frame * 0.1)) * (height * 0.8) : 20;
           const h = freq;
           const x = i * (barWidth + gap);
           const y = height - h;
           
           // Glitch offset
           const glitchX = isPlaying && Math.random() > 0.95 ? (Math.random() - 0.5) * 20 : 0;

           ctx.fillRect(x + glitchX, y, barWidth, h);
        }
      } else if (mode === VisualizerMode.ORB) {
         const radius = 100 + (isPlaying ? Math.sin(frame * 0.1) * 20 : 0);
         ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
         ctx.fillStyle = isPlaying ? color : '#333';
         ctx.fill();
         ctx.stroke();
         
         // Rings
         if (isPlaying) {
             ctx.beginPath();
             ctx.arc(centerX, centerY, radius + 40 * Math.sin(frame * 0.05), 0, Math.PI * 2);
             ctx.strokeStyle = '#fff';
             ctx.stroke();
         }
      }

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, mode, color]);

  return (
    <canvas 
        ref={canvasRef} 
        className="w-full h-full block rounded-xl border-4 border-black"
    />
  );
};

export default Visualizer;
