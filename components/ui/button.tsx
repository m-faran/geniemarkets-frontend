import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border font-sans text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-violet-400/30 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:brightness-110",
        cyber:
          "border-cyan-300/40 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:brightness-110",
        gold:
          "border-yellow-300/40 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-110",
        outline:
          "border-white/10 bg-[#0B0F1A]/80 text-slate-200 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white shadow-sm backdrop-blur-md",
        secondary:
          "border-white/10 bg-[#13192B] text-slate-200 hover:bg-[#1C253F] hover:border-white/20 hover:text-white",
        ghost:
          "border-transparent hover:bg-white/5 text-slate-300 hover:text-white",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:border-rose-500/50",
        link: "border-transparent text-violet-400 underline-offset-4 hover:underline hover:text-violet-300",
      },
      size: {
        default: "h-10 gap-2 px-4 text-sm",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold",
        lg: "h-12 gap-2.5 rounded-xl px-6 text-base font-semibold",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
