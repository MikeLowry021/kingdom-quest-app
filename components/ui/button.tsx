import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium font-sans ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "btn-primary bg-primary-500 text-white hover:bg-primary-600",
      destructive: "bg-error-500 text-white hover:bg-error-600",
      outline: "border border-gray-300 bg-white hover:bg-gray-50",
      secondary: "btn-secondary bg-secondary-500 text-primary-500 hover:bg-secondary-600",
      ghost: "hover:bg-gray-100",
      link: "text-primary-500 underline-offset-4 hover:underline"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2 min-h-[2.75rem]", // WCAG 44px minimum touch target
      sm: "h-9 rounded-md px-3 min-h-[2.25rem]",
      lg: "h-11 rounded-md px-8 min-h-[2.75rem]"
    }

    return (
      <Comp
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }