"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SearchSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchSelect({ options, value, onChange, placeholder = "Selectează..." }: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Păstrăm indexul activ
  const [activeIndex, setActiveIndex] = useState(0); 
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Handler pentru schimbarea căutării - actualizăm și indexul aici, nu în useEffect
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActiveIndex(0); // Resetăm indexul sincron cu căutarea
  };

  // Folosim un efect DOAR pentru scroll (operație DOM externă), ceea ce este corect
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.children[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[activeIndex]) {
          onChange(filteredOptions[activeIndex].value);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div 
      className="relative w-full md:min-w-62.5" 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 h-10 text-sm bg-white border rounded-md cursor-pointer transition-all shadow-sm
          ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-input hover:bg-slate-50"}`}
      >
        <span className={`truncate ${!selectedLabel ? "text-muted-foreground" : "text-foreground"}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center px-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              className="w-full p-2.5 text-sm bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Caută în listă..."
              value={searchTerm}
              onChange={handleSearchChange} // Folosim handler-ul nou
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul 
            ref={listRef}
            className="max-h-70 overflow-y-auto py-1 custom-scrollbar"
          >
            {filteredOptions.map((option, index) => (
              <li
                key={option.value}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors
                  ${index === activeIndex ? "bg-slate-100 text-primary" : "text-slate-700 hover:bg-slate-50"}
                  ${value === option.value ? "font-semibold" : ""}`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-primary" />}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-6 text-sm text-center text-slate-400">
                Niciun rezultat găsit.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}