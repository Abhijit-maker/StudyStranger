import React, { useRef, useState, useEffect } from "react";

interface TiltContainerProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default: 8)
  perspective?: number; // Perspective depth in pixels (default: 1000)
  scale?: number; // Scale effect on hover (default: 1.01)
  isIsometric?: boolean; // Apply subtle isometric starting rotation
}

export const TiltContainer: React.FC<TiltContainerProps> = ({
  children,
  className = "",
  maxTilt = 8,
  perspective = 1200,
  scale = 1.01,
  isIsometric = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Starting isometric base transform if selected
  const baseTransform = isIsometric 
    ? "rotateX(20deg) rotateY(-20deg) rotateZ(5deg)" 
    : "rotateX(0deg) rotateY(0deg) rotateZ(0deg)";

  const [style, setStyle] = useState<React.CSSProperties>({
    transform: `perspective(${perspective}px) ${baseTransform} scale(1)`,
    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
    transformStyle: "preserve-3d"
  });
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(
        window.matchMedia("(max-width: 768px)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;

    const el = containerRef.current;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to the card center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    // Calculate rotation angles
    let rotateY = x * maxTilt * 2;
    let rotateX = -y * maxTilt * 2;
    let rotateZ = 0;

    if (isIsometric) {
      // Offset with isometric base angles
      rotateX += 20;
      rotateY -= 20;
      rotateZ += 5;
    }

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
      transition: "transform 0.15s ease-out", // Snappy mouse tracking
      transformStyle: "preserve-3d"
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setStyle({
      transform: `perspective(${perspective}px) ${baseTransform} scale(1)`,
      transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)", // Smooth landing back
      transformStyle: "preserve-3d"
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
