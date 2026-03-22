"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface GroupAvatarProps {
  groupName: string
  shortName: string
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function GroupAvatar({ groupName, shortName, color, size = "md", className }: GroupAvatarProps) {
  const getInitials = (name: string) => {
    const words = name.split(" ")
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
  }

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm sm:w-10 sm:h-10",
    lg: "w-12 h-12 text-base",
  }

  const initials = getInitials(shortName)

  // Genera un color secundario ligeramente más claro para el gradiente
  const toRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color} 0%, ${toRgba(color, 0.6)} 100%)`,
    boxShadow: `0 4px 14px ${toRgba(color, 0.5)}, inset 0 1px 0 rgba(255,255,255,0.2)`,
    border: `1px solid ${toRgba(color, 0.4)}`,
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarFallback className="font-bold text-white" style={gradientStyle}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
