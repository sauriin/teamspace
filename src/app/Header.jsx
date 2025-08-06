"use client";

import { OrganizationSwitcher, SignInButton, UserButton } from "@clerk/nextjs";
import SearchBar from "../_components/searchBar";
import { useEffect, useMemo } from "react";
import debounce from "lodash.debounce";

const Header = ({ setQuery }) => {

    const debouncedSetQuery = useMemo(
        () => debounce((val) => setQuery(val), 300),
        [setQuery]
    );

    const handleChange = (e) => {
        debouncedSetQuery(e.target.value);
    };

    useEffect(() => {
        return () => {
            debouncedSetQuery.cancel(); // Cleanup
        };
    }, [debouncedSetQuery]);

    return (
        <div className="flex items-center justify-between rounded-full bg-[#3a2b5c] px-6 py-4 mb-10">
            <div className="flex gap-10 text-lg items-center">
                <SignInButton />
                <span className="text-white cursor-pointer relative group">
                    Docs
                    <span className="absolute left-0 -bottom-1 h-[2px] w-full origin-center scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100"></span>
                </span>
                <span className="text-white cursor-pointer relative group">
                    Favourite
                    <span className="absolute left-0 -bottom-1 h-[2px] w-full origin-center scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100"></span>
                </span>
                <span className="text-white cursor-pointer relative group">
                    Trash Bin
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
                <SearchBar setQuery={setQuery} onChange={handleChange} />
                <UserButton />
            </div>
        </div>
    );
};

export default Header;
