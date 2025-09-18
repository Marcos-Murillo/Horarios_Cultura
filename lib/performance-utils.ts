import React from "react"
export const compressData = (data: any): string => {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error("Error compressing data:", error)
    return "{}"
  }
}

export const decompressData = (compressedData: string): any => {
  try {
    return JSON.parse(compressedData)
  } catch (error) {
    console.error("Error decompressing data:", error)
    return null
  }
}

// Cache management for schedules
export const cacheManager = {
  set: (key: string, data: any, ttl = 300000) => {
    // 5 minutes default
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
  },

  get: (key: string) => {
    const item = localStorage.getItem(key)
    if (!item) return null

    const parsed = JSON.parse(item)
    const now = Date.now()

    if (now - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(key)
      return null
    }

    return parsed.data
  },

  clear: () => {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("schedules_") || key.startsWith("groups_")) {
        localStorage.removeItem(key)
      }
    })
  },
}

// Debounce function for search and form inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Image preloader for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Lazy component loader
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc)
}
