import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <motion.div
                initial={{ opacity: 0.9, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out hover:border-primary/50",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </motion.div>
        )
    }
)
Input.displayName = "Input"

export { Input }
