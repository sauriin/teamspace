"use client";

import React, { useRef, useState, useEffect } from "react";
import { Trash2, PenTool, Eraser, RotateCcw, RotateCw } from "lucide-react";

export default function WhiteboardView() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [strokes, setStrokes] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#000000");
    const [width, setWidth] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState(null);

    // --- Canvas setup ---
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        drawAll();
    }, []);

    useEffect(() => drawAll(), [strokes, currentStroke, startPos]);

    // --- Keyboard shortcuts ---
    useEffect(() => {
        const handleKey = (e) => {
            if (e.ctrlKey && e.key === "z") undo(); // Ctrl+Z = Undo
            if (e.ctrlKey && e.key === "y") redo(); // Ctrl+Y = Redo

            // Tool shortcuts
            if (!e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case "p":
                        setTool("pen");
                        break;
                    case "e":
                        setTool("eraser");
                        break;
                    case "r":
                        setTool("rectangle");
                        break;
                    case "l":
                        setTool("ellipse");
                        break;
                    case "a":
                        setTool("arrow");
                        break;
                }
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [strokes, redoStack]);

    const drawAll = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        strokes.forEach(s => {
            if (s.tool === "pen" || s.tool === "eraser") drawFree(ctx, s.points, s.color, s.width);
            else if (s.tool === "rectangle") drawRect(ctx, s.start, s.end, s.color, s.width);
            else if (s.tool === "ellipse") drawEllipse(ctx, s.start, s.end, s.color, s.width);
            else if (s.tool === "arrow") drawArrow(ctx, s.start, s.end, s.color, s.width);
        });

        if (isDrawing && startPos) {
            const pos = currentStroke[0];
            if (tool === "rectangle") drawRect(ctx, startPos, pos, color, width, true);
            else if (tool === "ellipse") drawEllipse(ctx, startPos, pos, color, width, true);
            else if (tool === "arrow") drawArrow(ctx, startPos, pos, color, width, true);
            else if (tool === "pen" || tool === "eraser") drawFree(ctx, currentStroke, tool === "eraser" ? "#ffffff" : color, width);
        }
    };

    const drawFree = (ctx, points, strokeColor, strokeWidth) => {
        if (!points.length) return;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
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

    const handleMouseDown = (e) => {
        setIsDrawing(true);
        const pos = getPointerPos(e);
        setStartPos(pos);
        setCurrentStroke([pos]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const pos = getPointerPos(e);
        if (tool === "pen" || tool === "eraser") setCurrentStroke(prev => [...prev, pos]);
        else setCurrentStroke([pos]);
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        const endPos = currentStroke[0];
        if (tool === "pen" || tool === "eraser") {
            setStrokes([...strokes, { points: currentStroke, color: tool === "eraser" ? "#ffffff" : color, width, tool }]);
        } else if (tool === "rectangle" || tool === "ellipse" || tool === "arrow") {
            setStrokes([...strokes, { start: startPos, end: endPos, color, width, tool }]);
        }
        setCurrentStroke([]);
        setStartPos(null);
        setIsDrawing(false);
        setRedoStack([]);
    };

    const undo = () => {
        setStrokes(prev => {
            if (!prev.length) return prev;
            const newStrokes = prev.slice(0, -1);
            setRedoStack(r => [prev[prev.length - 1], ...r]);
            return newStrokes;
        });
    };

    const redo = () => {
        setRedoStack(prev => {
            if (!prev.length) return prev;
            const [first, ...rest] = prev;
            setStrokes(s => [...s, first]);
            return rest;
        });
    };

    const clear = () => {
        setStrokes([]);
        setRedoStack([]);
    };

    return (
        <div ref={containerRef} className="w-full h-full relative bg-gray-100">
            {/* Toolbar */}
            <div className="fixed top-16 left-[300px] flex flex-col gap-3 p-2 rounded bg-black/50 z-20">
                <button onClick={() => setTool("pen")} className={`p-2 rounded ${tool === "pen" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Pen"><PenTool size={20} /></button>
                <button onClick={() => setTool("eraser")} className={`p-2 rounded ${tool === "eraser" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Eraser"><Eraser size={20} /></button>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === "eraser"} className="w-10 h-10 p-0 border-none" />
                <button onClick={() => setTool("rectangle")} className={`p-2 rounded ${tool === "rectangle" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Rectangle">▭</button>
                <button onClick={() => setTool("ellipse")} className={`p-2 rounded ${tool === "ellipse" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Ellipse">⬭</button>
                <button onClick={() => setTool("arrow")} className={`p-2 rounded ${tool === "arrow" ? "bg-white text-black" : "bg-transparent text-white"}`} title="Arrow">➤</button>
                <button onClick={undo} className="p-2 rounded bg-transparent text-white" title="Undo"><RotateCcw size={20} /></button>
                <button onClick={redo} className="p-2 rounded bg-transparent text-white" title="Redo"><RotateCw size={20} /></button>
                <button onClick={clear} className="p-2 rounded bg-red-500 text-white" title="Clear"><Trash2 size={20} /></button>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
}
