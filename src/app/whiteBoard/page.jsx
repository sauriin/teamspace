// src/app/whiteBoard/page.jsx
"use client";

import React from "react";
import Navbar from "../Navbar";
import WhiteboardView from "@/_components/whiteBoardView";

export default function WhiteBoardPage() {
    return (
        <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Navbar / sidebar */}
            <Navbar onMenuChange={() => { }} />

            {/* Main Whiteboard area */}
            <div className="flex-1 flex flex-col">
                <WhiteboardView boardId="default" />
            </div>
        </div>
    );
}
