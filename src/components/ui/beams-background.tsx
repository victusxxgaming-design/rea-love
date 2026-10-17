"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: -8 + Math.random() * 22,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({
  className,
  children,
  intensity = "strong",
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);

  const opacityMap = {
    subtle: 0.7,
    medium: 0.85,
    strong: 1,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let lastFrame = 0;
    const updateCanvasSize = () => {
      const bounds = canvas.parentElement?.getBoundingClientRect();
      width = bounds?.width || window.innerWidth;
      height = bounds?.height || window.innerHeight;
      // Cap the backing buffer on dense phones and 4K displays.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, 2560 / width);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // setTransform (not scale) so the ratio never compounds on resize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const totalBeams = width < 768 ? 16 : 30;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(width, height),
      );
      if (reducedMotion.matches) drawFrame(0);
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;

      const column = index % 3;
      const spacing = width / 3;

      beam.y = height + 100;
      beam.x =
        column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = -8 + (index * 26) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      // Calculate pulsing opacity
      const pulsingOpacity =
        beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

      // Enhanced gradient with multiple color stops
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`,
      );
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`,
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function drawFrame(step: number) {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.filter = "blur(35px)";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed * step;
        beam.pulse += beam.pulseSpeed * step;

        // Reset beam when it goes off screen
        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

    }
    function animate(time: number) {
      if (document.hidden || reducedMotion.matches) {
        animationFrameRef.current = 0;
        return;
      }
      if (time - lastFrame >= 1000 / 30) {
        drawFrame(lastFrame ? Math.min((time - lastFrame) / (1000 / 60), 3) : 1);
        lastFrame = time;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    const restart = () => {
      cancelAnimationFrame(animationFrameRef.current);
      lastFrame = 0;
      if (reducedMotion.matches) drawFrame(0);
      else if (!document.hidden) animationFrameRef.current = requestAnimationFrame(animate);
    };
    restart();
    document.addEventListener("visibilitychange", restart);
    reducedMotion.addEventListener("change", restart);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", restart);
      reducedMotion.removeEventListener("change", restart);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-site-background",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(15px)" }}
      />

      <div
        className="absolute inset-0 bg-site-background/5"
        style={{
          backdropFilter: "blur(50px)",
        }}
      />

      {children}
    </div>
  );
}
