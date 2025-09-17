"use client";

import { OrganizationSwitcher, SignInButton, UserButton } from "@clerk/nextjs";
import SearchBar from "../_components/searchBar";
import { useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = ({ setQuery }) => {
  const pathname = usePathname();

  const debouncedSetQuery = useMemo(
    () => debounce((val) => setQuery(val), 300),
    [setQuery]
  );

  const handleChange = (e) => {
    debouncedSetQuery(e.target.value);
  };

  useEffect(() => {
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [debouncedSetQuery]);

  const navItems = [
    { label: "Docs", href: "/docs" },
    { label: "Starred", href: "/starred" },
    { label: "Trash Bin", href: "/trashBin" },
  ];

  return (
    <div className="flex items-center justify-between rounded-full bg-[#3a2b5c] px-6 py-3 mb-5">
      <div className="flex gap-10 text-lg items-center">
        <SignInButton />
        {navItems.map(({ label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="text-white cursor-pointer relative group"
            >
              {label}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] w-full origin-center ${isActive
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                  } bg-white transition-transform duration-300`}
              ></span>
            </Link>
          );
        })}
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

