import React, { useRef, useEffect } from "react";

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  penColor?: string;
  penWidth?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  penColor = "#1b0f29",
  penWidth = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);

  // Load existing value if passed
  useEffect(() => {
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [value]);

  // Resize canvas to container size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dataUrl = canvas.toDataURL();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Redraw saved content
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          canvas.getContext("2d")?.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing.current = true;
    points.current = [getPos(e)];
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !canvasRef.current) return;
    isDrawing.current = false;
    onChange(canvasRef.current.toDataURL());
    points.current = [];
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    points.current.push(pos);

    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = penColor;

    if (points.current.length < 3) {
      const b = points.current[0];
      ctx.beginPath();
      ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.closePath();
      return;
    }

    // Use quadratic curve for smooth lines
    const lastTwoPoints = points.current.slice(-3);
    const [p1, p2, p3] = lastTwoPoints;
    const midPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };

    ctx.beginPath();
    ctx.moveTo(midPoint.x, midPoint.y);
    ctx.quadraticCurveTo(p2.x, p2.y, (p2.x + p3.x) / 2, (p2.y + p3.y) / 2);
    ctx.stroke();
  };

  const clear = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onChange("");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    canvas.addEventListener("mousemove", draw);

    // Touch
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing);
    canvas.addEventListener("touchmove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
      canvas.removeEventListener("mousemove", draw);

      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
      canvas.removeEventListener("touchmove", draw);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="border rounded bg-white w-full h-40 touch-none"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="px-3 py-1 bg-gray-200 rounded text-xs"
          onClick={clear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
