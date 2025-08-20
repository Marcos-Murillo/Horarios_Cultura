"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, Edit, Trash2, Save, X, Home, MapPin } from "lucide-react"
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

export default function AdminPage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  // Form state
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

        <Tabs defaultValue="form" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="text-xs sm:text-sm">
              Gestionar Horarios
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">
              Vista de Calendario
            </TabsTrigger>
          </TabsList>

          {/* Form Tab */}
          <TabsContent value="form" className="space-y-4 sm:space-y-6">
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
                        <SelectContent>
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
                        <SelectContent>
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
                        <SelectContent>
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
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
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
                  <WeeklyCalendar schedules={schedules} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Weekly Calendar Component
function WeeklyCalendar({ schedules }: { schedules: Schedule[] }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const daysInSpanish = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const schedulesByDay = schedules.reduce(
    (acc, schedule) => {
      if (!acc[schedule.dayOfWeek]) {
        acc[schedule.dayOfWeek] = []
      }
      acc[schedule.dayOfWeek].push(schedule)
      return acc
    },
    {} as { [key: string]: Schedule[] },
  )

  const formatTime = (time: string) => {
    return time.replace(":", ":")
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
      {days.map((day, index) => (
        <div key={day} className="space-y-2">
          <h3 className="font-semibold text-center p-1.5 sm:p-2 bg-gray-100 rounded-lg text-xs sm:text-sm truncate">
            {daysInSpanish[index]}
          </h3>
          <div className="space-y-1.5 sm:space-y-2 min-h-[150px] sm:min-h-[200px]">
            {schedulesByDay[day]
              ?.sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-1.5 sm:p-2 rounded text-white text-xs"
                  style={{ backgroundColor: schedule.color }}
                >
                  <p className="font-medium truncate text-xs leading-tight" title={schedule.groupName}>
                    {schedule.groupName.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <p className="opacity-90 text-xs leading-tight">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </p>
                  {schedule.lugar && (
                    <p className="opacity-75 text-xs truncate flex items-center gap-1 mt-1" title={schedule.lugar}>
                      <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="truncate">{schedule.lugar}</span>
                    </p>
                  )}
                  {schedule.subGroup && (
                    <Badge variant="secondary" className="text-xs mt-1 px-1 py-0 h-auto">
                      {schedule.subGroup}
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
