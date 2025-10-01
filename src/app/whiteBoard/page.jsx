"use client";

import React from "react";
import Navbar from "../Navbar";
import WhiteboardView from "@/_components/whiteBoardView";

export default function WhiteBoardPage() {
    return (
        <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
            {/* Navbar (primary sidebar) */}
            <Navbar onMenuChange={(section, secondary) => { }} />

            {/* Main Whiteboard content */}
            <div className="flex-1 relative">
                <WhiteboardView boardId="default" />
            </div>
        </div>
    );
}
