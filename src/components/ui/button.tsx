import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-700 text-white shadow-sm hover:bg-blue-800 active:bg-blue-900',
        secondary: 'bg-slate-100 text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-200',
        outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400',
        ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700',
        link: 'text-blue-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 px-2.5 text-[0.8125rem]',
        lg: 'h-11 px-5 text-base',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export function LinkButton({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & VariantProps<typeof buttonVariants> & { href: string }) {
  return (
    <a href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </a>
  )
}

export { buttonVariants }
