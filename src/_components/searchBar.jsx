"use client";

import { useState, useRef } from "react";
import { Search } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    query: z.string().min(1).max(50),
});

const SearchBar = ({ setQuery, suggestions = [] }) => {
    const [focused, setFocused] = useState(false);
    const wrapperRef = useRef(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
        },
    });

    async function onSubmit(values) {
        setQuery(values.query);
    }

    const handleBlur = (e) => {
        if (wrapperRef.current && wrapperRef.current.contains(e.relatedTarget)) {
            return;
        }
        setFocused(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="transition-all duration-500 ease-in-out"
            >
                <div
                    className={`flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/20 transition-all duration-500 ease-in-out ${focused ? "w-80" : "w-40"
                        }`}
                >
                    <Search
                        className={`transition-colors duration-300 ${focused ? "text-blue-400" : "text-white/60"
                            }`}
                    />
                    <input
                        {...form.register("query")}
                        type="text"
                        placeholder="Search"
                        onFocus={() => setFocused(true)}
                        onBlur={handleBlur}
                        className={`bg-transparent text-white outline-none w-full transition-all duration-300 placeholder:transition-opacity placeholder:duration-300 placeholder:text-white/50 ${focused ? "placeholder:opacity-0" : "placeholder:opacity-100"
                            }`}
                    />
                </div>
            </form>

            {focused && suggestions.length > 0 && (
                <ul
                    tabIndex={-1} // make it focusable for relatedTarget
                    className="absolute left-0 mt-2 w-full bg-neutral-900 rounded-md shadow-lg z-[9999]"
                >
                    {suggestions.map((item, idx) => (
                        <li
                            key={idx}
                            tabIndex={0} // focusable for blur detection
                            className="px-4 py-2 hover:bg-neutral-800 cursor-pointer text-white"
                            onClick={() => {
                                setQuery(item);
                                form.setValue("query", item);
                                setFocused(false);
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
