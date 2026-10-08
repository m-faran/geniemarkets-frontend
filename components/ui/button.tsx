import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border font-sans text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500/50 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-sky-500/30 bg-sky-600 text-white font-semibold shadow-sm hover:bg-sky-500 hover:border-sky-400/50",
        cyber:
          "border-emerald-500/30 bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-500 hover:border-emerald-400/50",
        gold:
          "border-amber-500/30 bg-amber-600 text-white font-semibold shadow-sm hover:bg-amber-500 hover:border-amber-400/50",
        outline:
          "border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700 hover:bg-slate-800 hover:text-white shadow-sm",
        secondary:
          "border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:border-slate-700 hover:text-white",
        ghost:
          "border-transparent hover:bg-white/5 text-slate-300 hover:text-white",
        destructive:
          "border-rose-500/30 bg-rose-600 text-white hover:bg-rose-500 shadow-sm",
        link: "border-transparent text-sky-400 underline-offset-4 hover:underline hover:text-sky-300",
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
