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

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarFallback className="font-bold text-white border-2 border-white/20" style={{ backgroundColor: color }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
