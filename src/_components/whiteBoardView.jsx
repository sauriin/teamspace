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

  // --- Canvas State ---
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);

  // --- Text Tool State ---
  const [textBoxes, setTextBoxes] = useState([]); // all text boxes on canvas
  const [activeText, setActiveText] = useState(null); // current editing box

  // --- Toolbar Responsive State ---
  const [toolbarLeft, setToolbarLeft] = useState(300);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setToolbarLeft(100);       // small screens
      else if (window.innerWidth < 1024) setToolbarLeft(300); // medium screens
      else setToolbarLeft(330);                              // big screens
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Load strokes from Convex
  useEffect(() => {
    if (getStrokesQuery) setStrokes(getStrokesQuery);
  }, [getStrokesQuery]);

  // Resize canvas and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    drawAll();
  }, []);

  useEffect(() => drawAll(), [strokes, currentStroke, textBoxes]);

  // Keyboard shortcuts
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
          case "t": setTool("text"); break;
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [strokes, redoStack]);

  // --- Drawing Functions ---
  const drawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((s) => drawStroke(ctx, s));

    if (isDrawing && startPos && currentStroke.length) {
      const pos = currentStroke[0];
      const previewStroke = { points: [startPos, pos], color, width, tool };
      drawStroke(ctx, previewStroke, true);
    }
  };

  const drawStroke = (ctx, s, preview = false) => {
    if (s.tool === "pen" || s.tool === "eraser") {
      drawFree(ctx, s.points, s.tool === "eraser" ? "#ffffff" : s.color, s.width);
    } else if (s.tool === "rectangle") {
      drawRect(ctx, s.points[0], s.points[1], s.color, s.width, preview);
    } else if (s.tool === "ellipse") {
      drawEllipse(ctx, s.points[0], s.points[1], s.color, s.width, preview);
    } else if (s.tool === "arrow") {
      drawArrow(ctx, s.points[0], s.points[1], s.color, s.width, preview);
    }
  };

  const drawFree = (ctx, points, strokeColor, strokeWidth) => {
    if (!points || !points.length) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  };

  const drawRect = (ctx, start, end, strokeColor, strokeWidth, preview = false) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash(preview ? [6, 4] : []);
    ctx.beginPath();
    ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawEllipse = (ctx, start, end, strokeColor, strokeWidth, preview = false) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash(preview ? [6, 4] : []);
    ctx.beginPath();
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radiusX = Math.abs(end.x - start.x) / 2;
    const radiusY = Math.abs(end.y - start.y) / 2;
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawArrow = (ctx, start, end, strokeColor, strokeWidth, preview = false) => {
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.setLineDash(preview ? [6, 4] : []);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = 10 + strokeWidth;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(end.x, end.y);
    ctx.fill();
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
      const newBox = { x: pos.x, y: pos.y, text: "", color, width };
      setActiveText(newBox);
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
    if (!isDrawing || !user || !orgId) return;
    const endPos = currentStroke[0];

    const newStroke = {
      points: tool === "pen" || tool === "eraser" ? currentStroke : [startPos, endPos],
      color: tool === "eraser" ? "#ffffff" : color,
      width,
      tool,
      userId: user.id,
      createdAt: Date.now(),
    };

    setStrokes([...strokes, newStroke]);
    setCurrentStroke([]);
    setStartPos(null);
    setIsDrawing(false);
    setRedoStack([]);
    await addStrokeMutation({ boardId, orgId, stroke: newStroke });
  };

  const handleTextChange = (e) => setActiveText({ ...activeText, text: e.target.value });
  const handleTextSubmit = () => {
    if (!activeText || !activeText.text.trim()) return;
    setTextBoxes([...textBoxes, activeText]);
    setActiveText(null);
  };

  // --- Undo / Redo ---
  const undo = () => {
    setStrokes((prev) => {
      if (!prev.length) return prev;
      const newStrokes = prev.slice(0, -1);
      setRedoStack((r) => [prev[prev.length - 1], ...r]);
      return newStrokes;
    });
  };

  const redo = () => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      setStrokes((s) => [...s, first]);
      return rest;
    });
  };

  const clear = async () => {
    setStrokes([]);
    setRedoStack([]);
    setTextBoxes([]);
    if (isClerkLoaded && isSignedIn && orgId) {
      await clearBoardMutation({ boardId, orgId });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100">
      {/* Toolbar */}
      <div
        className="fixed top-16 flex flex-col gap-3 p-2 rounded bg-black/50 z-20 transition-left duration-300"
        style={{ left: `${toolbarLeft}px` }}
      >
        <button onClick={() => setTool("pen")} className={`p-2 rounded ${tool === "pen" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Pen"><PenTool size={20} /></button>
        <button onClick={() => setTool("eraser")} className={`p-2 rounded ${tool === "eraser" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Eraser"><Eraser size={20} /></button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === "eraser"} className="w-10 h-10 p-0 border-none" />
        <button onClick={() => setTool("rectangle")} className={`p-2 rounded ${tool === "rectangle" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Rectangle">▭</button>
        <button onClick={() => setTool("ellipse")} className={`p-2 rounded ${tool === "ellipse" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Ellipse">⬭</button>
        <button onClick={() => setTool("arrow")} className={`p-2 rounded ${tool === "arrow" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Arrow">➤</button>
        <button onClick={() => setTool("text")} className={`p-2 rounded ${tool === "text" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Text">T</button>
        <button onClick={undo} className="p-2 rounded bg-transparent text-white" title="Undo"><RotateCcw size={20} /></button>
        <button onClick={redo} className="p-2 rounded bg-transparent text-white" title="Redo"><RotateCw size={20} /></button>
        <button onClick={clear} className="p-2 rounded bg-red-500 text-white" title="Clear"><Trash2 size={20} /></button>
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
        <div key={i} style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          fontSize: `${box.width * 5}px`,
          color: box.color,
          border: "1px dotted black",
          padding: "2px",
          pointerEvents: "none"
        }}>
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
            fontSize: `${activeText.width * 5}px`,
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
