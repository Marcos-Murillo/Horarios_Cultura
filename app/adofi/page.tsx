"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, Save, X, Home, MapPin, Filter, LayoutList, Users } from "lucide-react"
import {
  CULTURAL_GROUPS,
  getSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  generateGroupColor,
  type Schedule,
} from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { RouteGuard } from "@/components/route-guard"
import { TeamAdmin } from "@/components/team-admin"

export default function AdminPage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const [activeTab, setActiveTab] = useState<"form" | "calendar" | "equipo">("form")
  const [formData, setFormData] = useState({
    groupName: "",
    startTime: "",
    endTime: "",
    dayOfWeek: "",
    subGroup: "",
    lugar: "",
  })

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const allSchedules = await getSchedules()
      setSchedules(allSchedules)
    } catch (error) {
      console.error("Error fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formData.groupName) errors.groupName = "Selecciona un grupo cultural"
    if (!formData.startTime) errors.startTime = "Ingresa la hora de inicio"
    if (!formData.endTime) errors.endTime = "Ingresa la hora de fin"
    if (!formData.dayOfWeek) errors.dayOfWeek = "Selecciona el día de la semana"
    if (!formData.lugar) errors.lugar = "Ingresa el lugar"

    // Validate time format and logic
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      if (start >= end) {
        errors.endTime = "La hora de fin debe ser posterior a la hora de inicio"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const scheduleData = {
        ...formData,
        color: generateGroupColor(formData.groupName),
      }

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id!, scheduleData)
      } else {
        await addSchedule(scheduleData)
      }

      // Reset form and refresh data
      setFormData({
        groupName: "",
        startTime: "",
        endTime: "",
        dayOfWeek: "",
        subGroup: "",
        lugar: "",
      })
      setEditingSchedule(null)
      setFormErrors({})
      await fetchSchedules()
    } catch (error) {
      console.error("Error saving schedule:", error)
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      groupName: schedule.groupName,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      dayOfWeek: schedule.dayOfWeek,
      subGroup: schedule.subGroup || "",
      lugar: schedule.lugar || "",
    })
  }

  const handleDelete = async (scheduleId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este horario?")) {
      try {
        await deleteSchedule(scheduleId)
        await fetchSchedules()
      } catch (error) {
        console.error("Error deleting schedule:", error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingSchedule(null)
    setFormData({
      groupName: "",
      startTime: "",
      endTime: "",
      dayOfWeek: "",
      subGroup: "",
      lugar: "",
    })
    setFormErrors({})
  }

  const getDayInSpanish = (day: string) => {
    const days: { [key: string]: string } = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
    }
    return days[day] || day
  }

  const formatTime = (time: string) => {
    return time.replace(":", ":")
  }

  // Group schedules by group name
  const schedulesByGroup = schedules.reduce(
    (acc, schedule) => {
      if (!acc[schedule.groupName]) {
        acc[schedule.groupName] = []
      }
      acc[schedule.groupName].push(schedule)
      return acc
    },
    {} as { [key: string]: Schedule[] },
  )

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">Panel de Administración</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Gestiona los horarios de los grupos culturales
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")} className="self-start sm:self-auto">
            <Home className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>

        <FloatingNav
          navItems={[
            {
              name: "Gestionar Horarios",
              link: "#",
              icon: <LayoutList className="h-4 w-4" />,
              onClick: () => setActiveTab("form"),
              active: activeTab === "form",
            },
            {
              name: "Vista de Calendario",
              link: "#",
              icon: <Calendar className="h-4 w-4" />,
              onClick: () => setActiveTab("calendar"),
              active: activeTab === "calendar",
            },
            {
              name: "Equipo",
              link: "#",
              icon: <Users className="h-4 w-4" />,
              onClick: () => setActiveTab("equipo"),
              active: activeTab === "equipo",
            },
          ]}
          className="cursor-pointer"
        />

        <div className="space-y-4 sm:space-y-6 pt-20">
          {activeTab === "form" && (
            <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    {editingSchedule ? (
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    {editingSchedule ? "Editar Horario" : "Agregar Nuevo Horario"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="groupName" className="text-sm">
                        Grupo Cultural
                      </Label>
                      <Select
                        value={formData.groupName}
                        onValueChange={(value) => setFormData({ ...formData, groupName: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecciona un grupo" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {CULTURAL_GROUPS.map((group) => (
                            <SelectItem key={group.id} value={group.name} className="text-sm">
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.groupName && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1">{formErrors.groupName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="startTime" className="text-sm">
                          Hora de Inicio
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="text-sm"
                        />
                        {formErrors.startTime && (
                          <p className="text-xs sm:text-sm text-red-600 mt-1">{formErrors.startTime}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="endTime" className="text-sm">
                          Hora de Fin
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="text-sm"
                        />
                        {formErrors.endTime && (
                          <p className="text-xs sm:text-sm text-red-600 mt-1">{formErrors.endTime}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dayOfWeek" className="text-sm">
                        Día de la Semana
                      </Label>
                      <Select
                        value={formData.dayOfWeek}
                        onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecciona un día" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Monday">Lunes</SelectItem>
                          <SelectItem value="Tuesday">Martes</SelectItem>
                          <SelectItem value="Wednesday">Miércoles</SelectItem>
                          <SelectItem value="Thursday">Jueves</SelectItem>
                          <SelectItem value="Friday">Viernes</SelectItem>
                          <SelectItem value="Saturday">Sábado</SelectItem>
                          <SelectItem value="Sunday">Domingo</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.dayOfWeek && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1">{formErrors.dayOfWeek}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="subGroup" className="text-sm">
                        Tipo de Grupo (Opcional)
                      </Label>
                      <Select
                        value={formData.subGroup}
                        onValueChange={(value) => setFormData({ ...formData, subGroup: value })}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecciona el tipo (opcional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="semillero">Semillero</SelectItem>
                          <SelectItem value="proceso">Proceso</SelectItem>
                          <SelectItem value="representativo">Representativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="lugar" className="text-sm">
                        Lugar
                      </Label>
                      <Input
                        id="lugar"
                        type="text"
                        placeholder="Ej: Aula 101, Auditorio, Patio central..."
                        value={formData.lugar}
                        onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                        className="text-sm"
                      />
                      {formErrors.lugar && <p className="text-xs sm:text-sm text-red-600 mt-1">{formErrors.lugar}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button type="submit" className="flex-1 text-sm">
                        <Save className="h-4 w-4 mr-2" />
                        {editingSchedule ? "Actualizar" : "Guardar"}
                      </Button>
                      {editingSchedule && (
                        <Button type="button" variant="outline" onClick={cancelEdit} className="text-sm bg-transparent">
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Schedules List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Horarios Registrados</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-gray-600 text-sm">Cargando horarios...</p>
                  ) : schedules.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm">No hay horarios registrados</p>
                  ) : (
                    <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                      {Object.entries(schedulesByGroup).map(([groupName, groupSchedules]) => (
                        <div key={groupName} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: generateGroupColor(groupName) }}
                            ></div>
                            <h4 className="font-medium text-sm text-gray-900 truncate" title={groupName}>
                              {groupName}
                            </h4>
                          </div>
                          {groupSchedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="ml-5 p-2 sm:p-3 bg-gray-50 rounded-lg flex items-start sm:items-center justify-between gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {getDayInSpanish(schedule.dayOfWeek)}
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                  {schedule.subGroup && ` • ${schedule.subGroup}`}
                                </p>
                                {schedule.lugar && (
                                  <p
                                    className="text-xs text-gray-600 flex items-center gap-1 mt-1"
                                    title={schedule.lugar}
                                  >
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{schedule.lugar}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(schedule)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(schedule.id!)}
                                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          )}

          {activeTab === "calendar" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Vista de Calendario Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-gray-600 text-sm">Cargando calendario...</p>
                ) : (
                  <WeeklyCalendar schedules={schedules} onEdit={handleEdit} onDelete={handleDelete} onSwitchToForm={() => setActiveTab("form")} />
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "equipo" && (
            <TeamAdmin />
          )}
        </div>
      </div>
    </div>
    </RouteGuard>
  )
}

// Weekly Calendar Component
function WeeklyCalendar({ schedules, onEdit, onDelete, onSwitchToForm }: { schedules: Schedule[], onEdit: (schedule: Schedule) => void, onDelete: (id: string) => void, onSwitchToForm: () => void }) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    groups: [] as string[],
    types: [] as string[],
    places: [] as string[],
  })

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const daysInSpanish = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  // Generar horas de 6 AM a 10 PM (cada hora)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6)

  // Obtener lugares únicos de los horarios
  const uniquePlaces = Array.from(new Set(schedules.map(s => s.lugar).filter(Boolean))) as string[]

  // Obtener tipos únicos
  const uniqueTypes = ["ninguno", "semillero", "proceso", "representativo"]

  // Filtrar horarios
  const filteredSchedules = schedules.filter(schedule => {
    // Filtro por grupo
    if (filters.groups.length > 0 && !filters.groups.includes(schedule.groupName)) {
      return false
    }

    // Filtro por tipo
    if (filters.types.length > 0) {
      const scheduleType = schedule.subGroup || "ninguno"
      if (!filters.types.includes(scheduleType)) {
        return false
      }
    }

    // Filtro por lugar
    if (filters.places.length > 0 && schedule.lugar && !filters.places.includes(schedule.lugar)) {
      return false
    }

    return true
  })

  const schedulesByDay = filteredSchedules.reduce(
    (acc, schedule) => {
      if (!acc[schedule.dayOfWeek]) {
        acc[schedule.dayOfWeek] = []
      }
      acc[schedule.dayOfWeek].push(schedule)
      return acc
    },
    {} as { [key: string]: Schedule[] },
  )

  // Obtener grupos únicos con sus colores
  const uniqueGroups = Array.from(
    new Map(
      CULTURAL_GROUPS.map((group) => [group.name, { name: group.shortName, fullName: group.name, color: group.color }])
    ).values()
  )

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM"
    if (hour === 12) return "12 PM"
    if (hour > 12) return `${hour - 12} PM`
    return `${hour} AM`
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const min = minutes
    if (hour === 0) return `12:${min} AM`
    if (hour === 12) return `12:${min} PM`
    if (hour > 12) return `${hour - 12}:${min} PM`
    return `${hour}:${min} AM`
  }

  const getShortGroupName = (fullName: string) => {
    const group = CULTURAL_GROUPS.find(g => g.name === fullName)
    return group ? group.shortName : fullName.split(" ").slice(0, 3).join(" ")
  }

  const getDayInSpanish = (day: string) => {
    const dayMap: { [key: string]: string } = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
    }
    return dayMap[day] || day
  }

  // Calcular la posición y altura de cada evento basado en su hora
  const getEventStyle = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    
    // Calcular posición desde las 6 AM (360 minutos)
    const baseMinutes = 6 * 60
    const topPosition = ((startMinutes - baseMinutes) / 60) * 60 // 60px por hora
    const height = (durationMinutes / 60) * 60 // 60px por hora
    
    return {
      top: `${topPosition}px`,
      height: `${Math.max(height, 30)}px`, // Mínimo 30px de altura
    }
  }

  const toggleFilter = (category: 'groups' | 'types' | 'places', value: string) => {
    setFilters(prev => {
      const current = prev[category]
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [category]: newValues }
    })
  }

  const clearFilters = () => {
    setFilters({ groups: [], types: [], places: [] })
  }

  const hasActiveFilters = filters.groups.length > 0 || filters.types.length > 0 || filters.places.length > 0

  return (
    <div className="flex gap-4">
      {/* Leyenda de colores */}
      <div className="w-48 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Grupos Culturales</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors relative"
            title="Filtros"
          >
            <Filter className="h-4 w-4 text-gray-600" />
            {hasActiveFilters && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {uniqueGroups.map((group, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ backgroundColor: group.color }}
              ></div>
              <span className="text-xs text-gray-700 leading-tight">{group.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFilters(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Filtro por grupos */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Grupos Culturales</h4>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueGroups.map((group) => (
                    <label
                      key={group.fullName}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.groups.includes(group.fullName)}
                        onChange={() => toggleFilter('groups', group.fullName)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        ></div>
                        <span className="text-sm text-gray-700 truncate">{group.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro por tipo */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tipo de Grupo</h4>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => toggleFilter('types', type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro por lugar */}
              {uniquePlaces.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Lugares</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {uniquePlaces.map((place) => (
                      <label
                        key={place}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.places.includes(place)}
                          onChange={() => toggleFilter('places', place)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 truncate" title={place}>{place}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <Button onClick={() => setShowFilters(false)} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header con días */}
          <div className="grid grid-cols-8 border-b-2 border-gray-300 bg-white sticky top-0 z-10">
            <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-200"></div>
            {days.map((day, index) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                {daysInSpanish[index]}
              </div>
            ))}
          </div>

          {/* Grid de horas y eventos */}
          <div className="relative">
            {/* Líneas de horas de fondo */}
            <div className="grid grid-cols-8">
              <div className="border-r border-gray-200">
                {hours.map((hour) => (
                  <div key={hour} className="h-[60px] border-b border-gray-200 px-2 py-1 text-xs text-gray-500 text-right relative">
                    {formatHour(hour)}
                    {/* Línea horizontal que se extiende */}
                    <div className="absolute top-0 left-full w-screen h-px bg-gray-200 pointer-events-none"></div>
                  </div>
                ))}
              </div>
              
              {/* Columnas de días con eventos posicionados absolutamente */}
              {days.map((day) => (
                <div key={day} className="relative border-r border-gray-200 last:border-r-0">
                  {/* Líneas de hora de fondo */}
                  {hours.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-gray-200"></div>
                  ))}
                  
                  {/* Eventos posicionados absolutamente */}
                  <div className="absolute inset-0 px-1">
                    {schedulesByDay[day]
                      ?.sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((schedule) => {
                        const style = getEventStyle(schedule.startTime, schedule.endTime)
                        return (
                          <div
                            key={schedule.id}
                            className="absolute left-1 right-1 rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:z-10 transition-all"
                            style={{
                              ...style,
                              backgroundColor: schedule.color,
                            }}
                            onClick={() => setSelectedSchedule(schedule)}
                          >
                            <div className="p-1.5 h-full flex flex-col text-white">
                              <p className="font-semibold text-xs leading-tight truncate">
                                {getShortGroupName(schedule.groupName)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedSchedule && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con color del grupo */}
            <div
              className="px-6 py-4 flex items-start justify-between"
              style={{ backgroundColor: selectedSchedule.color }}
            >
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg text-white drop-shadow">
                  {getShortGroupName(selectedSchedule.groupName)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Grupo</p>
                <p className="text-sm font-medium text-gray-900">{selectedSchedule.groupName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Día</p>
                <p className="text-sm font-medium text-gray-900">{getDayInSpanish(selectedSchedule.dayOfWeek)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Horario</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
                </p>
              </div>
              {selectedSchedule.lugar && (
                <div>
                  <p className="text-sm text-gray-500">Lugar</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedSchedule.lugar}
                  </p>
                </div>
              )}
              {selectedSchedule.subGroup && (
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <Badge variant="secondary" className="text-sm">
                    {selectedSchedule.subGroup}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  onClick={() => {
                    onEdit(selectedSchedule)
                    setSelectedSchedule(null)
                    onSwitchToForm()
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => {
                    onDelete(selectedSchedule.id!)
                    setSelectedSchedule(null)
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
