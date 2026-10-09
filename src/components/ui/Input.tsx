import type { ComponentProps } from "react";

import { controlStyles } from "@/components/ui/Field";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlStyles, "h-12 py-0", className)} {...props} />;
}
