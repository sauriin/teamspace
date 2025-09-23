import Header from "@/app/Header";
import Hero from "./hero";
import Footer from "./footer";


export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-hero text-foreground">
            <Header />
            <Hero />
            {/* Features Section */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Why Choose TeamSpace?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Powerful features designed to streamline your workflow and boost productivity
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Organized Workspace", desc: "Group, search, and manage documents efficiently with our intuitive interface.", icon: "📁" },
                        { title: "Secure Sharing", desc: "Grant access to your files with customizable roles and permissions for full control.", icon: "🔒" },
                        { title: "Instant Preview", desc: "Preview PDF, DOCX, and TXT documents without downloading them.", icon: "👁️" },
                    ].map((feature) => (
                        <div key={feature.title} className="group p-8 bg-gradient-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
                            <div className="text-6xl mb-6 group-hover:animate-bounce">{feature.icon}</div>
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
            {/* About Section */}
            <section id="about" className="py-24 px-6 bg-gradient-card text-center max-w-4xl mx-auto">
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    About TeamSpace
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    TeamSpace was born out of the frustration of bloated, confusing file-sharing platforms. We designed it with simplicity and speed in mind — perfect for education, collaboration, and personal productivity. Join thousands of teams who trust TeamSpace to keep their work organized and accessible.
                </p>
            </section>
            <Footer />
        </div>
    );
}
