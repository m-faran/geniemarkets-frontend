import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-auto w-fit shrink-0 items-center justify-center gap-1.5 rounded-lg border font-mono text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-150 py-0.5 px-2.5 select-none [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default:
          "border-violet-500/35 bg-violet-500/15 text-violet-300 shadow-sm shadow-violet-500/10",
        cyber:
          "border-cyan-500/35 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/10",
        gold:
          "border-amber-500/35 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10",
        emerald:
          "border-emerald-500/35 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10",
        secondary:
          "border-white/10 bg-[#13192B] text-slate-300",
        destructive:
          "border-rose-500/35 bg-rose-500/15 text-rose-300",
        outline:
          "border-white/15 bg-black/40 text-slate-300 backdrop-blur-xs",
        ghost:
          "border-transparent bg-transparent text-slate-400",
        link: "border-transparent text-violet-400 underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
