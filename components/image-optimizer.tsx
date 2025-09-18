"use client"

import { useState, useEffect } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function OptimizedImage({ src, alt, className, priority = false }: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()

    // Check WebP support
    const supportsWebP = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
    }

    // Use WebP if supported, fallback to original
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp")
    const finalSrc = supportsWebP() ? webpSrc : src

    img.onload = () => {
      setImageSrc(finalSrc)
      setIsLoaded(true)
    }

    img.onerror = () => {
      // Fallback to original format if WebP fails
      setImageSrc(src)
      setIsLoaded(true)
    }

    if (priority) {
      img.src = finalSrc
    } else {
      // Lazy load for non-priority images
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            img.src = finalSrc
            observer.disconnect()
          }
        },
        { threshold: 0.1 },
      )

      const placeholder = document.createElement("div")
      observer.observe(placeholder)
    }
  }, [src, priority])

  if (!isLoaded) {
    return (
      <div className={`${className} animate-pulse bg-gray-200`} style={{ minHeight: "200px" }}>
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  )
}
