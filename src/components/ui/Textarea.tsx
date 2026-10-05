import type { ComponentProps } from "react";

import { controlStyles } from "@/components/ui/Field";
import { cn } from "@/lib/utils/cn";

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(controlStyles, "resize-y", className)} {...props} />;
}
