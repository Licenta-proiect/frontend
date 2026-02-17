"use client";

import * as React from "react";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selectează...",
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (itemValue: string) => {
    if (disabled) return; 
    onChange(selected.filter((val) => val !== itemValue));
  };

  const handleSelect = (itemValue: string) => {
    if (disabled) return; 
    if (selected.includes(itemValue)) {
      onChange(selected.filter((val) => val !== itemValue));
    } else {
      onChange([...selected, itemValue]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  return (
    // Dacă componenta este disabled, Popover nu ar trebui să se deschidă
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled} 
          className={cn(
            "w-full justify-between min-h-10 h-auto border-gray-200 hover:bg-transparent active:scale-100 px-3 py-2 shadow-xs font-normal",
            disabled && "opacity-50 cursor-not-allowed disabled:pointer-events-auto bg-gray-50", // Stil vizual pentru disabled
            className
          )}
        >
          <div className="flex gap-x-1 gap-y-2 flex-wrap items-center flex-1 overflow-hidden">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <Badge
                    variant="secondary"
                    key={value}
                    className="pr-1.5 pl-2 py-1 text-sm font-medium bg-blue-50 text-brand-blue border-blue-100 shrink-0 h-auto"
                  >
                    {option?.label || value}
                    <span
                      role="button" 
                      tabIndex={disabled ? -1 : 0}  
                      className={cn(
                        "ml-1 rounded-full outline-none cursor-pointer inline-flex items-center justify-center hover:bg-blue-100",
                        disabled && "cursor-not-allowed pointer-events-none"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleUnselect(value);
                      }}
                    >
                      <X className="h-3.5 w-3.5 text-brand-blue/60 hover:text-brand-blue" />
                    </span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-50 shrink-0 ml-2 self-center">
            {selected.length > 0 && !disabled && ( // Ascunde butonul Clear dacă e disabled
              <div
                role="button"
                className="p-0.5 hover:bg-gray-100 rounded-md cursor-pointer pointer-events-auto"
                onClick={handleClear}
              >
                <X className="h-4 w-4 hover:text-red-500 transition-colors" />
              </div>
            )}
            <ChevronsUpDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      {!disabled && ( // Nu randa conținutul Popover-ului dacă e disabled
        <PopoverContent 
          className="w-(--radix-popover-trigger-width) p-0 border-gray-200 shadow-md" 
          align="start"
        >
          <Command>
            <CommandInput placeholder="Caută..." className="h-9" />
            <CommandList className="max-h-64">
              <CommandEmpty>Nu am găsit rezultate.</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="aria-selected:bg-gray-100 aria-selected:text-brand-blue"
                    >
                      <Check className={cn("mr-2 h-4 w-4 text-brand-blue", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="text-gray-900">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}