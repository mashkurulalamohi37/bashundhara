import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    setIsPointer(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest("button, a, input, select, textarea, [role='button'], .cursor-pointer, .card, [data-interactive]");
        setIsHovered(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Smooth spring/lerp loop for outer glow ring
    const render = () => {
      // Lerp ring towards mouse position
      const ease = 0.22;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isPointer) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Outer Spring Glow Ring */}
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 -ml-5 -mt-5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-[1px] transition-[width,height,border-color,background-color] duration-200 ease-out will-change-transform ${
          isHovered
            ? "h-14 w-14 -ml-7 -mt-7 border-primary/80 bg-primary/20 shadow-[0_0_20px_rgba(38,166,91,0.35)]"
            : isClicking
            ? "h-8 w-8 -ml-4 -mt-4 border-primary bg-primary/30"
            : "h-10 w-10 shadow-[0_0_12px_rgba(38,166,91,0.15)]"
        }`}
      />

      {/* Center Precision Pointer Dot */}
      <div
        ref={dotRef}
        className={`fixed left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-primary shadow-sm transition-transform duration-100 ease-out will-change-transform ${
          isClicking ? "scale-50" : isHovered ? "scale-150 bg-emerald-400" : "scale-100"
        }`}
      />
    </div>
  );
}
