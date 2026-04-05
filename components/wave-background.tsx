"use client";

import { useEffect, useRef } from "react";

const baseY = [0, 0.1, 0.19, 0.27, 0.34, 0.4];
const colors: [string, string][] = [
  ["#000000", "#020410"],
  ["#020410", "#08102A"],
  ["#08102A", "#13265F"],
  ["#13265F", "#2447B2"],
  ["#2447B2", "#4F78DF"],
  ["#4F78DF", "#A8C4F8"],
];
const amplitudes = [0.06, 0.055, 0.05, 0.04, 0.026, 0.014];
const speeds = [0.13, 0.15, 0.16, 0.14, 0.12, 0.1];
const primaryFreqs = [1.25, 1.55, 1.4, 1.82, 1.18, 1.68];
const secondaryFreqs = [0.72, 0.94, 1.08, 0.83, 1.16, 0.9];
const tertiaryFreqs = [2.2, 1.75, 2.45, 1.96, 2.62, 1.58];
const phaseOffsets = [0.2, 1.15, 2.4, 0.75, 1.9, 2.85];
const driftFactors = [0.62, 0.48, 0.73, 0.57, 0.69, 0.52];
const secondaryMix = [0.38, 0.58, 0.42, 0.5, 0.36, 0.46];
const tertiaryMix = [0.16, 0.1, 0.14, 0.12, 0.09, 0.08];
const segments = 5;

const config = {
  blur: 41,
  amplitude: 89,
  offset: 10,
  rotation: 0,
  speed: 50,
};

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const waveY = (xNormal: number, yBase: number, amplitude: number, index: number, amplitudeScale: number, extentH: number) => {
      const phase = timeRef.current * speeds[index] + phaseOffsets[index];
      const drift = phase * driftFactors[index];
      return (
        yBase * extentH +
        Math.sin(xNormal * Math.PI * primaryFreqs[index] + phase) * amplitude * amplitudeScale * extentH +
        Math.sin(xNormal * Math.PI * secondaryFreqs[index] - drift + phaseOffsets[index] * 0.35) *
          amplitude *
          amplitudeScale *
          extentH *
          secondaryMix[index] +
        Math.cos(xNormal * Math.PI * tertiaryFreqs[index] + phase * 0.45 + phaseOffsets[index]) *
          amplitude *
          amplitudeScale *
          extentH *
          tertiaryMix[index]
      );
    };

    const drawWave = (
      yBase: number,
      amplitude: number,
      colorIndex: number,
      index: number,
      amplitudeScale: number,
      extentW: number,
      extentH: number,
      originX: number,
      originY: number,
    ) => {
      const points = [];

      for (let i = 0; i <= segments; i += 1) {
        const xNormal = i / segments;
        points.push({
          x: originX + xNormal * extentW,
          y: originY + waveY(xNormal, yBase, amplitude, index, amplitudeScale, extentH),
        });
      }

      context.beginPath();
      context.moveTo(originX - 80, originY + extentH + 80);
      context.lineTo(originX - 80, points[0].y);
      context.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i += 1) {
        const point = points[i];
        const next = points[i + 1];
        context.bezierCurveTo(
          point.x + (next.x - point.x) * 0.4,
          point.y,
          point.x + (next.x - point.x) * 0.6,
          next.y,
          next.x,
          next.y,
        );
      }

      context.lineTo(originX + extentW + 80, originY + extentH + 80);
      context.closePath();

      const topY = originY + yBase * extentH;
      const gradient = context.createLinearGradient(0, topY - extentH * 0.04, 0, topY + extentH * 0.15);
      gradient.addColorStop(0, colors[colorIndex][0]);
      gradient.addColorStop(1, colors[colorIndex][1]);
      context.fillStyle = gradient;
      context.fill();
    };

    const render = () => {
      const speedScale = 0.2 + (config.speed / 100) * 1.8;
      timeRef.current += 0.005 * speedScale;

      const blurPx = Math.round(Math.min(width, height) * (config.blur / 100) * 0.22);
      const amplitudeScale = 0.3 + (config.amplitude / 100) * 1.4;
      const offset = config.offset / 100;
      const angle = (config.rotation * Math.PI) / 180;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = "#02030a";
      context.fillRect(0, 0, width, height);

      const diagonal = Math.sqrt(width * width + height * height);
      const extentW = diagonal * 1.3;
      const extentH = diagonal * 1.3;
      const originX = (width - extentW) / 2;
      const originY = (height - extentH) / 2;

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(angle);
      context.translate(-width / 2, -height / 2);
      context.filter = blurPx > 0 ? `blur(${blurPx}px)` : "none";
      context.fillStyle = "#000000";
      context.fillRect(originX - 100, originY - 100, extentW + 200, extentH + 200);

      for (let i = 0; i < baseY.length; i += 1) {
        drawWave(offset + baseY[i], amplitudes[i], i, i, amplitudeScale, extentW, extentH, originX, originY);
      }

      context.filter = "none";
      frameRef.current = window.requestAnimationFrame(render);
      context.restore();
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return <canvas aria-hidden="true" className="site-background-canvas" ref={canvasRef} />;
}
