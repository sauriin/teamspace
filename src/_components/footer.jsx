import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full bg-black text-white px-6 sm:px-10 py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                {/* Logo + About */}
                <div>
                    <div className="inline-block mb-3">
                        <Image
                            src="/TeamSpace.svg"
                            alt="TeamSpace Logo"
                            width={140}
                            height={45}
                            priority
                        />
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                        <strong>TeamSpace</strong> helps teams collaborate, manage tasks,
                        and stay organized — all in one platform.
                    </p>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="font-semibold mb-3 text-lg">Contact</h3>
                    <ul className="text-sm space-y-2">
                        <li>
                            <a
                                href="mailto:saurinparmar2324@gmail.com"
                                className="hover:underline"
                                aria-label="Email us"
                            >
                                Email
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Explore */}
                <div>
                    <h3 className="font-semibold mb-3 text-lg">Explore</h3>
                    <ul className="text-sm space-y-2">
                        <li>
                            <a href="#whats-inside" className="hover:underline">
                                What's Inside
                            </a>
                        </li>
                        <li>
                            <a href="#features" className="hover:underline">
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#faq" className="hover:underline">
                                FAQ
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="font-semibold mb-3 text-lg">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a
                            href="https://github.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="hover:text-gray-400 transition"
                        >
                            <Github size={20} />
                        </a>
                        <a
                            href="https://twitter.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            className="hover:text-gray-400 transition"
                        >
                            <Twitter size={20} />
                        </a>
                        <a
                            href="https://linkedin.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="hover:text-gray-400 transition"
                        >
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mt-10 pt-6">
                <p className="text-xs text-white/60 text-center sm:text-left">
                    © {new Date().getFullYear()} TeamSpace. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
