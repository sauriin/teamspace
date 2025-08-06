"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    query: z.string().min(1).max(50),
});

const SearchBar = ({ setQuery }) => {
    const [focused, setFocused] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
        },
    });

    async function onSubmit(values) {
        setQuery(values.query); // 🔍 update parent state
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative transition-all duration-500 ease-in-out">
            <div
                className={`flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/20 transition-all duration-500 ease-in-out ${focused ? "w-80" : "w-40"
                    }`}
                onClick={() => setFocused(true)}
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
                    onBlur={() => setFocused(false)}
                    className={`bg-transparent text-white outline-none w-full transition-all duration-300 placeholder:transition-opacity placeholder:duration-300 placeholder:text-white/50 ${focused ? "placeholder:opacity-0" : "placeholder:opacity-100"
                        }`}
                />
            </div>
        </form>
    );
};

export default SearchBar;
