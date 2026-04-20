import React, { useRef, useEffect } from "react";

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles = [];
    const PARTICLE_COUNT = Math.max(40, Math.floor((width * height) / 12000));

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function makeParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.6, 2.6),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.08, 0.08),
          hue: rand(345, 15),
          alpha: rand(0.08, 0.26),
          life: rand(40, 200)
        });
      }
    }
    makeParticles();

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      makeParticles();
    }
    window.addEventListener("resize", resize);

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const grd = ctx.createLinearGradient(0, 0, width, height);
      grd.addColorStop(0, "rgba(255,240,240,0.45)");
      grd.addColorStop(1, "rgba(255,255,255,0.85)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.2;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.life <= 0) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = rand(40, 220);
        }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 12);
        g.addColorStop(0, `rgba(185,28,28,${p.alpha})`);
        g.addColorStop(0.25, `rgba(239,68,68,${p.alpha * 0.45})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, p.alpha * 2)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(185,28,28,${0.02 + (120 - dist) / 120 * 0.06})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
