"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
        const percentage = ((value - min) / (max - min)) * 100;

        return (
            <div className="relative w-full h-6 flex items-center">
                <div className="absolute w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-150 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onValueChange(Number(e.target.value))}
                    ref={ref}
                    className={cn(
                        "absolute w-full h-full opacity-0 cursor-pointer z-10",
                        className
                    )}
                    {...props}
                />
                {/* Thumb visual using left positioning */}
                <div
                    className="absolute h-5 w-5 bg-background border-2 border-primary rounded-full shadow-md pointer-events-none transition-all duration-150 ease-out"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        );
    }
);
Slider.displayName = "Slider";
