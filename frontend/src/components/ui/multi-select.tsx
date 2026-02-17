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
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selectează...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (itemValue: string) => {
    onChange(selected.filter((val) => val !== itemValue));
  };

  const handleSelect = (itemValue: string) => {
    if (selected.includes(itemValue)) {
      onChange(selected.filter((val) => val !== itemValue));
    } else {
      onChange([...selected, itemValue]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 min-h-10 border-gray-200 hover:bg-transparent active:scale-100 px-3 py-2 shadow-xs font-normal",
            className
          )}
        >
          <div className="flex gap-1 flex-wrap py-1">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <Badge
                    variant="secondary"
                    key={value}
                    className="pr-1 font-medium bg-blue-50 text-brand-blue border-blue-100"
                  >
                    {option?.label || value}
                    <span
                      role="button" 
                      tabIndex={0}  
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleUnselect(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleUnselect(value);
                        }
                      }}
                    >
                      <X className="h-3 w-3 text-brand-blue/60 hover:text-brand-blue" />
                    </span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
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
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-brand-blue",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-gray-900">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}