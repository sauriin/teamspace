import { Github, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="py-16 px-6 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Image src="/white-Teamspace2.png" width={150} height={150} alt="teamspace_logo" />
                    <p className="text-muted-foreground leading-relaxed">
                        Helping teams collaborate, manage tasks, and stay organized — all in one platform.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-4">Contact</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="mailto:saurinparmar2324@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                                Email Support
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-4">Explore</h3>
                    <ul className="space-y-2">
                        <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                        <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                        <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                    <div className="flex gap-4">
                        <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                            <Github size={20} />
                        </a>
                        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                            <Twitter size={20} />
                        </a>
                        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-border mt-12 pt-8 text-center">
                <p className="text-muted-foreground">© {new Date().getFullYear()} TeamSpace. All rights reserved.</p>
            </div>
        </footer>
    );
}
