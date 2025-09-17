"use client";

import React from "react";

const Hero = () => {
    return (
        <div className="min-h-screen flex flex-col text-white bg-gradient-to-r from-[#1a0e2b] to-[#2c1b49]">
            {/* 1. Hero Section */}
            <section
                id="hero"
                className="flex flex-col items-center justify-center text-center px-4"
                style={{ height: "calc(100vh - 80px)" }}
            >
                <img
                    src="/white-TeamSpace2.png"
                    alt="TeamSpace Logo"
                    className="w-[300px] md:w-[400px] mb-6"
                />
                <p className="text-xl max-w-2xl">
                    A secure and lightning-fast way to upload, organize, and share your
                    documents. Built for students, professionals, and small teams.
                </p>
                <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg transition duration-300">
                    Get Started
                </button>
            </section>

            {/* 2. Features Section */}
            <section
                id="features"
                className="min-h-screen flex flex-col justify-center py-20 px-6 bg-[#2c1b49] gap-12"
            >
                <h2 className="text-4xl font-bold text-center">
                    Why Choose TeamSpace?
                </h2>
                <p className="text-center max-w-2xl mx-auto text-lg text-white/80">
                    TeamSpace combines simplicity, speed, and security to make document
                    sharing effortless. Explore our key features designed to enhance your
                    productivity.
                </p>

                <div className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
                    {/* Organized Workspace */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-1/3">
                            <img
                                src="/workplace.svg"
                                alt="Organized Workspace"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="w-full md:w-2/3 bg-white/10 rounded-[2rem] p-6">
                            <h3 className="text-2xl font-semibold mb-2">
                                Organized Workspace
                            </h3>
                            <p>Group, search, and manage documents efficiently.</p>
                        </div>
                    </div>

                    {/* Secure Sharing */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-1/3">
                            <img

                                src="/secure.png"
                                alt="Secure Sharing"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="w-full md:w-2/3 bg-white/10 rounded-[2rem] p-6">
                            <h3 className="text-2xl font-semibold mb-2">Secure Sharing</h3>
                            <p>
                                Grant access to your files with customizable roles and
                                permissions for full control.
                            </p>
                        </div>
                    </div>

                    {/* Instant Preview */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-1/3">
                            <img
                                src="/preview.svg"
                                alt="Instant Preview"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="w-full md:w-2/3 bg-white/10 rounded-[2rem] p-6">
                            <h3 className="text-2xl font-semibold mb-2">Instant Preview</h3>
                            <p>
                                Preview PDF, DOCX, and TXT documents without downloading them.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. About Section */}
            <section
                id="about"
                className="min-h-screen flex flex-col justify-center py-20 px-6 text-center bg-[#24143d]"
            >
                <h2 className="text-4xl font-bold mb-6">About TeamSpace</h2>
                <p className="max-w-3xl mx-auto text-lg">
                    TeamSpace was born out of the frustration of bloated, confusing
                    file-sharing platforms. It’s designed with simplicity and speed in
                    mind — perfect for education, collaboration, and personal
                    productivity.
                </p>
            </section>
        </div>
    );
};

export default Hero;

