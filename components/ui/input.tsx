import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-white/10 bg-[#07090E]/90 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 shadow-inner outline-none transition-all duration-200 focus-visible:border-violet-500/60 focus-visible:ring-2 focus-visible:ring-violet-500/20 disabled:pointer-events-none disabled:opacity-40 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
