import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Batch Deposit System Utilities

/**
 * Calculate the next batch execution time based on 6-hour intervals
 * Batches execute at: 00:00, 06:00, 12:00, 18:00 UTC daily
 */
export function calculateNextBatchTime(): Date {
  const now = new Date()
  const currentUTCHours = now.getUTCHours()
  const currentUTCMinutes = now.getUTCMinutes()
  const currentUTCSeconds = now.getUTCSeconds()
  
  // Calculate hours until next 6-hour interval
  const batchHours = [0, 6, 12, 18]
  let nextBatchHour = batchHours.find(hour => hour > currentUTCHours)
  
  // If no batch found today, use first batch of next day
  if (!nextBatchHour) {
    nextBatchHour = 0
  }
  
  const nextBatch = new Date(now)
  nextBatch.setUTCHours(nextBatchHour, 0, 0, 0)
  
  // If we've passed the current time, it's for tomorrow
  if (nextBatch <= now) {
    nextBatch.setUTCDate(nextBatch.getUTCDate() + 1)
  }
  
  return nextBatch
}

/**
 * Get time remaining until next batch in milliseconds
 */
export function getTimeUntilNextBatch(): number {
  const nextBatch = calculateNextBatchTime()
  const now = new Date()
  return nextBatch.getTime() - now.getTime()
}

/**
 * Format countdown time as "Xh Ym Zs"
 */
export function formatBatchCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return "Executing..."
  
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Format next batch time as readable string
 */
export function formatNextBatchTime(): string {
  const nextBatch = calculateNextBatchTime()
  return nextBatch.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

