"use client";

import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
  color: string;
}

export function BubbleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Three shades of blue: light (whiter), medium, and more saturated
    const colors = [
      "rgba(180, 210, 255, 0.20)", // Light blue (whiter blue) - more visible
      "rgba(100, 150, 255, 0.20)", // Medium blue - more visible
      "rgba(0, 82, 255, 0.20)", // More saturated blue (baseBlue) - more visible
    ];

    // Create bubbles function
    const createBubbles = () => {
      const bubbles: Bubble[] = [];
      const baseBubbleCount = Math.min(40, Math.floor((canvas.width * canvas.height) / 40000));
      const bubbleCount = Math.floor(baseBubbleCount * 1.5); // More bubbles

      for (let i = 0; i < bubbleCount; i++) {
        // Depth opacity: closer bubbles are more opaque, farther bubbles are more transparent
        const depthOpacity = Math.random() * 0.5 + 0.4; // Range: 0.4 to 0.9 (more visible)
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: (Math.random() * 35 + 15) * 0.8, // 20% smaller: 12-40px
          vx: (Math.random() - 0.5) * 0.4, // Slower, smoother movement
          vy: (Math.random() - 0.5) * 0.4,
          opacity: depthOpacity, // Individual bubble opacity for depth effect
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      bubblesRef.current = bubbles;
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Recreate bubbles on resize
      createBubbles();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    createBubbles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubblesRef.current.forEach((bubble) => {
        // Update position
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // Bounce off edges
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) {
          bubble.vx *= -1;
        }
        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height) {
          bubble.vy *= -1;
        }

        // Keep bubbles in bounds
        bubble.x = Math.max(bubble.radius, Math.min(canvas.width - bubble.radius, bubble.x));
        bubble.y = Math.max(bubble.radius, Math.min(canvas.height - bubble.radius, bubble.y));

        // Draw bubble with clean, subtle gradient
        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.2,
          bubble.y - bubble.radius * 0.2,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        );

        const colorMatch = bubble.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (colorMatch) {
          const [, r, g, b, a] = colorMatch;
          const baseOpacity = parseFloat(a);
          // Apply depth opacity: multiply base color opacity by bubble's depth opacity
          const finalOpacity = baseOpacity * bubble.opacity;
          // Gradient with depth effect - closer bubbles are more visible
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 1.0})`);
          gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.5})`);
          gradient.addColorStop(0.9, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.15})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        }

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add subtle anti-aliasing
        ctx.globalCompositeOperation = "source-over";
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: "transparent",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

