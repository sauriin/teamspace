"use client";

import React from "react";
import Hero from "./Hero";
import Footer from "./Footer";
import Header from "@/app/Header";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#1a0e2b] to-[#2c1b49] text-white">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
                <div className="max-w-7xl mx-auto">
                    <Header />
                </div>
            </div>

            {/* Main Content with padding to avoid overlap */}
            <div className="flex-grow pt-28">
                <Hero />
            </div>

            {/* Footer here only once */}
            <Footer />
        </div>
    );
}
