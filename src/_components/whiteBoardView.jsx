"use client";

import React, { useRef, useState, useEffect } from "react";
import { Trash2, PenTool, Eraser, RotateCcw, RotateCw } from "lucide-react";
import { useUser, useOrganization, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function WhiteboardView({ boardId = "default" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // --- Clerk ---
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const isClerkLoaded = userLoaded && orgLoaded && authLoaded;
  const orgId = organization?.id ?? user?.id;


  // --- Convex ---
  const getStrokesQuery = useQuery(
    api.whiteBoard.getStrokes,
    isClerkLoaded && isSignedIn && orgId && boardId
      ? { boardId, orgId }
      : "skip"
  );
  const addStrokeMutation = useMutation(api.whiteBoard.addStroke);
  const clearBoardMutation = useMutation(api.whiteBoard.clearBoard);
  const removeLastStroke = useMutation(api.whiteBoard.removeLastStroke);

  // --- State ---
  const [strokes, setStrokes] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [activeText, setActiveText] = useState(null);
  const [toolbarLeft, setToolbarLeft] = useState(300);
  const [textSize, setTextSize] = useState(20);

  // --- Load strokes from Convex ---
  useEffect(() => {
    if (getStrokesQuery) setStrokes(getStrokesQuery);
  }, [getStrokesQuery]);

  // --- Responsive toolbar ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setToolbarLeft(100);
      else if (window.innerWidth < 1024) setToolbarLeft(150);
      else setToolbarLeft(140);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Canvas resizing ---
  useEffect(() => {
    const handleCanvasResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawAll();
    };
    handleCanvasResize();
    window.addEventListener("resize", handleCanvasResize);
    return () => window.removeEventListener("resize", handleCanvasResize);
  }, [strokes, currentStroke, textBoxes]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "z") undo();
      if (e.ctrlKey && e.key === "y") redo();
      if (!e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "p": setTool("pen"); break;
          case "e": setTool("eraser"); break;
          case "r": setTool("rectangle"); break;
          case "l": setTool("ellipse"); break;
          case "a": setTool("arrow"); break;
          case "s": setTool("line"); break; // line tool shortcut
          case "t": setTool("text"); break;
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [strokes, redoStack]);

  // --- Drawing functions ---
  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((s) => drawStroke(ctx, s));

    if (isDrawing && startPos && currentStroke.length) {
      const pos = currentStroke[0];
      drawStroke(ctx, { points: [startPos, pos], color, width, tool }, true);
    }
  };

  const drawStroke = (ctx, s, preview = false) => {
    switch (s.tool) {
      case "pen":
      case "eraser":
        drawFree(ctx, s.points, s.tool === "eraser" ? "#ffffff" : s.color, s.width);
        break;
      case "rectangle":
        drawRect(ctx, s.points[0], s.points[1], s.color, s.width, preview);
        break;
      case "ellipse":
        drawEllipse(ctx, s.points[0], s.points[1], s.color, s.width, preview);
        break;
      case "arrow":
      case "line":
        drawLineOrArrow(ctx, s.points[0], s.points[1], s.color, s.width, s.tool === "arrow", preview);
        break;
    }
  };

  const drawFree = (ctx, points, strokeColor, strokeWidth) => {
    if (!points?.length) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  };

  const drawRect = (ctx, start, end, color, width, preview) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(preview ? [6, 4] : []);
    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    ctx.setLineDash([]);
  };

  const drawEllipse = (ctx, start, end, color, width, preview) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(preview ? [6, 4] : []);
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawLineOrArrow = (ctx, start, end, color, width, isArrow, preview) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(preview ? [6, 4] : []);

    // Draw main line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrowhead if needed
    if (isArrow) {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const head = 10 + width;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - head * Math.cos(angle - Math.PI / 6), end.y - head * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(end.x - head * Math.cos(angle + Math.PI / 6), end.y - head * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(end.x, end.y);
      ctx.fill();
    }

    // Draw angle if preview
    if (preview) {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const degrees = Math.round((angle * 180) / Math.PI);
      ctx.font = "14px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(`${degrees}°`, end.x + 5, end.y - 5);
    }

    ctx.setLineDash([]);
  };

  const getPointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // --- Mouse Events ---
  const handleMouseDown = (e) => {
    const pos = getPointerPos(e);
    if (tool === "text") {
      setActiveText({ x: pos.x, y: pos.y, text: "", color, width: textSize });
      return;
    }
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentStroke([pos]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getPointerPos(e);
    if (tool === "pen" || tool === "eraser") setCurrentStroke((prev) => [...prev, pos]);
    else setCurrentStroke([pos]);
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const endPos = currentStroke[0];
    const points = tool === "pen" || tool === "eraser" ? currentStroke : [startPos, endPos];
    const newStroke = {
      points,
      color: tool === "eraser" ? "#ffffff" : color,
      width,
      tool,
      userId: user?.id ?? null,
      createdAt: Date.now(),
    };

    setStrokes((prev) => [...prev, newStroke]);
    setHistory((prev) => [...prev, { type: "stroke", data: newStroke }]);
    setCurrentStroke([]);
    setStartPos(null);
    setRedoStack([]);

    if (isClerkLoaded && isSignedIn && orgId && user) {
      try {
        await addStrokeMutation({ boardId, orgId, stroke: newStroke });
      } catch (err) {
        console.error("Failed to save stroke:", err);
      }
    }
  };

  // --- Text Tool ---
  const handleTextChange = (e) => setActiveText({ ...activeText, text: e.target.value });
  const handleTextSubmit = () => {
    if (!activeText?.text?.trim()) return;
    setTextBoxes((prev) => [...prev, activeText]);
    setHistory((prev) => [...prev, { type: "text", data: activeText }]);
    setActiveText(null);
  };

  // --- Undo/Redo ---
  const undo = async () => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((r) => [last, ...r]);
      if (last.type === "stroke") setStrokes((s) => s.slice(0, -1));
      else if (last.type === "text") setTextBoxes((t) => t.slice(0, -1));
      if (isClerkLoaded && isSignedIn && orgId && last.type === "stroke")
        removeLastStroke({ boardId, orgId }).catch(console.error);
      return prev.slice(0, -1);
    });
  };

  const redo = () => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      if (first.type === "stroke") {
        setStrokes((s) => [...s, first.data]);
        if (isClerkLoaded && isSignedIn && orgId)
          addStrokeMutation({ boardId, orgId, stroke: first.data }).catch(console.error);
      } else if (first.type === "text") setTextBoxes((t) => [...t, first.data]);
      setHistory((h) => [...h, first]);
      return rest;
    });
  };

  const clear = async () => {
    setStrokes([]);
    setTextBoxes([]);
    setRedoStack([]);
    setHistory([]);
    if (isClerkLoaded && isSignedIn && orgId) await clearBoardMutation({ boardId, orgId });
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100">
      {/* Toolbar */}
      <div
        className="fixed top-16 flex flex-col items-center gap-3 p-4 rounded bg-black/60 z-20"
        style={{ left: `${toolbarLeft}px`, width: "60px", height: "auto" }}
      >
        {[
          { toolName: "pen", icon: <PenTool size={20} /> },
          { toolName: "eraser", icon: <Eraser size={20} /> },
          { toolName: "line", icon: "─" },
        ].map(({ toolName, icon }) => (
          <button
            key={toolName}
            onClick={() => setTool(toolName)}
            className={`p-2 rounded ${tool === toolName ? "bg-white text-black" : "bg-transparent text-white"}`}
            title={toolName.charAt(0).toUpperCase() + toolName.slice(1)}
          >
            {icon}
          </button>
        ))}

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={tool === "eraser"}
          className="w-10 h-10 p-0 border-none"
        />

        {["rectangle", "ellipse", "arrow", "text"].map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`p-2 rounded ${tool === t ? "bg-white text-black" : "bg-transparent text-white"}`}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
          >
            {t === "rectangle" ? "▭" : t === "ellipse" ? "⬭" : t === "arrow" ? "➤" : "T"}
          </button>
        ))}

        <input
          type="number"
          value={textSize}
          onChange={(e) => setTextSize(parseInt(e.target.value))}
          placeholder="Size"
          className="w-12 h-8 text-center border rounded appearance-none
     [&::-webkit-inner-spin-button]:appearance-none
     [&::-webkit-outer-spin-button]:appearance-none
     [&::-moz-inner-spin-button]:appearance-none
     [&::-moz-outer-spin-button]:appearance-none"
        />

        <button onClick={undo} className="p-2 rounded bg-transparent text-white" title="Undo">
          <RotateCcw size={20} />
        </button>
        <button onClick={redo} className="p-2 rounded bg-transparent text-white" title="Redo">
          <RotateCw size={20} />
        </button>
        <button onClick={clear} className="p-2 rounded bg-red-500 text-white" title="Clear">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Text Boxes */}
      {textBoxes.map((box, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: box.x,
            top: box.y,
            fontSize: `${box.width}px`,
            color: box.color,
            border: "1px dotted black",
            padding: "2px",
            pointerEvents: "none",
          }}
        >
          {box.text}
        </div>
      ))}

      {/* Active Text Input */}
      {activeText && (
        <input
          autoFocus
          value={activeText.text}
          onChange={handleTextChange}
          onBlur={handleTextSubmit}
          onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
          style={{
            position: "absolute",
            left: activeText.x,
            top: activeText.y,
            fontSize: `${activeText.width}px`,
            color: activeText.color,
            border: "1px dotted black",
            background: "transparent",
            padding: "2px",
            outline: "none",
          }}
        />
      )}
    </div>
  );
}
