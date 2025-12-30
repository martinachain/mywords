"use client";

import { BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "book" | "message";
  className?: string;
}

// 深蓝色：沉稳学习感
const deepBlue = "#1e40af"; // blue-800
// 森林绿：自然学习感
const forestGreen = "#166534"; // green-800

export function Logo({ variant = "message", className }: LogoProps) {
  const logoColor = variant === "book" ? deepBlue : deepBlue;

  if (variant === "book") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <BookOpen
          className="w-5 h-5"
          style={{
            color: logoColor,
          }}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  // Message bubble with W
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-6 h-6",
        className
      )}
    >
      <MessageCircle
        className="w-6 h-6 absolute inset-0"
        style={{
          color: logoColor,
        }}
        strokeWidth={1.5}
        fill="none"
      />
      <span
        className="absolute text-[11px] font-semibold leading-none -mt-0.5"
        style={{
          color: logoColor,
        }}
      >
        W
      </span>
    </div>
  );
}

