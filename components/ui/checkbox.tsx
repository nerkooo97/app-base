"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    onCheckedChange?: (checked: boolean) => void
    onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onCheckedChange) {
                onCheckedChange(e.target.checked)
            }
            if (onChange) {
                onChange(e)
            }
        }

        return (
            <div className="relative flex items-center justify-center w-4 h-4">
                <input
                    type="checkbox"
                    className={cn(
                        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:border-primary cursor-pointer",
                        className
                    )}
                    ref={ref}
                    onChange={handleChange}
                    {...props}
                />
                <Check className="absolute h-3 w-3 text-white pointer-events-none hidden peer-checked:block" strokeWidth={3} />
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
