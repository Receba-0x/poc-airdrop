import { SearchIcon, X } from "lucide-react";
import { cn } from "@/utils/cn";
import * as React from "react";

interface SearchInputProps extends React.ComponentProps<"input"> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export function SearchInput({
  className,
  value,
  onClear,
  showClearButton = true,
  ...props
}: SearchInputProps) {
  const hasValue = value && value.toString().length > 0;

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <SearchIcon
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
          hasValue ? "text-primary-9" : "text-neutral-8"
        )}
      />

      <input
        type="text"
        value={value}
        className={cn(
          "file:text-foreground placeholder:text-neutral-11 selection:bg-primary selection:text-neutral-11 dark:bg-input border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent pl-8 pr-10 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-primary-6 focus-visible:ring-primary-6 focus-visible:ring-[1px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          hasValue && "border-primary-6",
          className
        )}
        {...props}
      />

      {hasValue && showClearButton && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-8 hover:text-neutral-12 transition-colors duration-200 p-0.5 rounded-full hover:bg-neutral-4"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
