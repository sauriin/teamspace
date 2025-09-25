"use client"

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { SignInButton, UserButton, OrganizationSwitcher, useUser } from "@clerk/nextjs";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};

export default function Header() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const debouncedSetQuery = useMemo(() => debounce((val) => setQuery(val), 300), []);
  const handleChange = (e) => debouncedSetQuery(e.target.value);

  useEffect(() => {
    return () => debouncedSetQuery.cancel();
  }, [debouncedSetQuery]);

  // Only show these if logged in
  const navItems = isSignedIn
    ? [
      { label: "Docs", href: "/docs" },
      { label: "Starred", href: "/starred" },
      { label: "Trash Bin", href: "/trashBin" },
    ]
    : [];

  // Auth Section
  const AuthSection = () => {
    if (!isSignedIn) {
      return (
        <SignInButton mode="modal" redirecturl="/docs">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-700 text-white border h-10 px-4 py-2">
            Sign In
          </button>
        </SignInButton>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: "bg-white text-black rounded-md shadow-lg",
              organizationSwitcherTrigger: "bg-white text-black",
            },
          }}
        />
        <UserButton />
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/white-TeamSpace2.png" width={150} height={150} alt="teamspace_logo" />
          </div>

          {/* Desktop Navigation */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <a
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      }`}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            <AuthSection />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col gap-2 pt-4">
              {isSignedIn &&
                navItems.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all"
                  >
                    {label}
                  </a>
                ))}
              <AuthSection />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
