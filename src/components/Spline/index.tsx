"use client";

import Spline from "@splinetool/react-spline";
import { useRef } from "react";

export default function Spline3D() {
  const splineRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!splineRef.current) return;
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    (splineRef.current as any).emitEvent("mouseMove", { x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ width: "100%", height: "100%" }}
    >
      <Spline
        scene="https://prod.spline.design/25LYgn5xv3T9X9Ci/scene.splinecode"
        ref={splineRef}
      />
    </div>
  );
}
