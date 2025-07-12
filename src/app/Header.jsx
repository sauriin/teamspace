    "use client";

    import React, { useState } from "react";
    import { Search } from "lucide-react";
    import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

    const Header = () => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="flex items-center justify-between rounded-full bg-[#3a2b5c] px-6 py-4 mb-10">
        <div className="flex gap-10 font-semibold text-lg items-center">
            <span className="text-white cursor-pointer relative group">
            Docs
            <span className="absolute left-0 -bottom-1 h-[2px] w-full origin-center scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100"></span>
            </span>
            
            <OrganizationSwitcher
                appearance={{
                    elements: {
                        rootBox: "bg-white text-black rounded-md shadow-lg",
                        organizationSwitcherTrigger: "bg-white text-black",
                    },
                }}
            />
        </div>
        <div className="flex items-center gap-4">
            <div className="relative transition-all duration-500 ease-in-out">
            <div
                className={`flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/20 transition-all duration-500 ease-in-out ${
                focused ? "w-80" : "w-40"
                }`}
                onClick={() => setFocused(true)}
            >
                <Search
                className={`transition-colors duration-300 ${
                    focused ? "text-blue-400" : "text-white/60"
                }`}
                />
                <input
                type="text"
                placeholder="Search"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`bg-transparent text-white outline-none w-full transition-all duration-300 placeholder:transition-opacity placeholder:duration-300 placeholder:text-white/50 ${
                    focused ? "placeholder:opacity-0" : "placeholder:opacity-100"
                }`}
                />
            </div>
            </div>
            <UserButton />
        </div>
        </div>
    );
    };

    export default Header;
