"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Închide dropdown-ul când dai click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Resetăm căutarea la închidere
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrarea opțiunilor bazată pe ce tastează utilizatorul
  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Găsim label-ul pentru valoarea selectată
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

 return (
    <div className="relative w-full md:min-w-[250px]" ref={containerRef}>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul className="max-h-[280px] overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors
                  ${value === option.value ? "bg-slate-100 text-primary font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
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