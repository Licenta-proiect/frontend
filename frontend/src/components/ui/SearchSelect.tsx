"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface Option {
  label: string;
  value: string;
}

interface SearchSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Selectează...",
  className,
  disabled,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover open={disabled ? false : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-10 border-gray-200 hover:bg-slate-50 active:scale-100 px-3 py-2 shadow-sm font-normal",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            className
          )}
        >
          <span className={cn(
            "truncate",
            !selectedLabel ? "text-muted-foreground" : "text-foreground"
          )}>
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      {!disabled && (
        <PopoverContent 
          className="w-(--radix-popover-trigger-width) p-0 border-gray-200 shadow-md" 
          align="start"
        >
          <Command>
            <CommandInput placeholder="Caută..." className="h-9" />
            <CommandList className="max-h-64 custom-scrollbar">
              <CommandEmpty>Nu am găsit rezultate.</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} 
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="aria-selected:bg-slate-100 aria-selected:text-slate-900 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-slate-900",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}