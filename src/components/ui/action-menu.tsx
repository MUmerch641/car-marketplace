"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

interface ActionMenuProps {
  children: React.ReactNode;
}

export function ActionMenu({ children }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#0b1f33] transition-colors focus:outline-none"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="sr-only">Open options menu</span>
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div 
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
          onClick={() => {
            // Give form submissions time to register before unmounting
            setTimeout(() => setOpen(false), 150);
          }}
        >
          <div className="flex flex-col py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
