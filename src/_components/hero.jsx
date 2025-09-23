import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative pt-52 pb-20 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 space-y-8">
                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                        Collaborate. Share. Organize.
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        A secure and lightning-fast way to upload, organize, and share your documents. Built for students, professionals, and small teams.
                    </p>
                </div>

                <div className="lg:w-1/2 flex justify-center relative">
                    <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-card bg-gray-900 rounded-3xl animate-float shadow-2xl flex items-center justify-center">
                        <Image src="/logo.png" width={210} height={210} alt="teamspace_logo" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full animate-float" style={{ animationDelay: "0.5s" }}></div>
                    <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-accent/20 rounded-full animate-float" style={{ animationDelay: "1s" }}></div>
                </div>
            </div>
        </section>
    );
}
