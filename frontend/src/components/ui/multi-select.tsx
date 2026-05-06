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
  const [search, setSearch] = React.useState("");
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null);
  const shiftPressedRef = React.useRef(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { shiftPressedRef.current = e.shiftKey; };
    const onKeyUp = (e: KeyboardEvent) => { shiftPressedRef.current = e.shiftKey; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handleUnselect = (itemValue: string) => {
    if (disabled) return;
    onChange(selected.filter((val) => val !== itemValue));
  };

  const handleSelect = (itemValue: string, currentIndex: number) => {
    if (disabled) return;

    let newSelected = [...selected];

    if (shiftPressedRef.current && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeValues = options.slice(start, end + 1).map((opt) => opt.value);

      // Range behaviour is driven by the anchor item's state
      const anchorValue = options[lastSelectedIndex].value;
      const anchorIsSelected = selected.includes(anchorValue);

      if (anchorIsSelected) {
        // Anchor was selected → select the whole range
        newSelected = Array.from(new Set([...newSelected, ...rangeValues]));
      } else {
        // Anchor was deselected → deselect the whole range
        newSelected = newSelected.filter((val) => !rangeValues.includes(val));
      }
    } else {
      // Simple toggle
      if (selected.includes(itemValue)) {
        newSelected = selected.filter((val) => val !== itemValue);
      } else {
        newSelected = [...selected, itemValue];
      }
    }

    setLastSelectedIndex(currentIndex);
    onChange(newSelected);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
    setLastSelectedIndex(null);
  };

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-10 h-auto border-gray-200 hover:bg-transparent active:scale-100 px-3 py-2 shadow-xs font-normal",
            disabled && "opacity-50 cursor-not-allowed disabled:pointer-events-auto bg-gray-50",
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
            {selected.length > 0 && !disabled && (
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

      {!disabled && (
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0 border-gray-200 shadow-md"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Caută..." 
              className="h-9" 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-64">
              <CommandEmpty>Nu am găsit rezultate.</CommandEmpty>
              <CommandGroup className="p-1">
                {filteredOptions.map((option) => {
                  const originalIndex = options.findIndex(o => o.value === option.value);
                  const isSelected = selected.includes(option.value);
                  
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value, originalIndex)}
                      className="aria-selected:bg-gray-100 aria-selected:text-brand-blue cursor-pointer"
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
      )}
    </Popover>
  );
}