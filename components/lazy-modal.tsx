"use client"

import { Suspense } from "react"
import type { Schedule } from "@/lib/cultural-groups"

interface LazyModalProps {
  selectedGroup: string | null
  schedules: Schedule[]
  onClose: () => void
}

const ScheduleModalContent = ({ selectedGroup, schedules, onClose }: LazyModalProps) => {
  const selectedGroupSchedules = selectedGroup
    ? schedules.filter((schedule) => schedule.groupName === selectedGroup)
    : []

  if (!selectedGroup) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{selectedGroup}</h2>
            <button onClick={onClose} className="btn btn-secondary btn-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="card-content">
          {selectedGroupSchedules.length > 0 ? (
            <div className="gap-4 flex flex-col">
              {selectedGroupSchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{schedule.day}</h4>
                      <p className="text-sm text-muted">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                    {schedule.subGroup && (
                      <span className="btn btn-secondary text-sm py-1 px-2">{schedule.subGroup}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted">No hay horarios programados para este grupo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function LazyScheduleModal(props: LazyModalProps) {
  return (
    <Suspense
      fallback={
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-8 text-center">
              <div className="animate-pulse">Cargando...</div>
            </div>
          </div>
        </div>
      }
    >
      <ScheduleModalContent {...props} />
    </Suspense>
  )
}
