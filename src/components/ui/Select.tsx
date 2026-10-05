import type { ComponentProps } from "react";

import { controlStyles } from "@/components/ui/Field";
import { cn } from "@/lib/utils/cn";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(controlStyles, "appearance-none bg-[right_0.875rem_center] bg-no-repeat pr-10", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8' fill='none'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%23667085' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}
