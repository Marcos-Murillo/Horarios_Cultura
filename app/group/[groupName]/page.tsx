"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Users, MapPin } from "lucide-react"
import { getSchedulesByGroup, type Schedule, generateGroupColor, CULTURAL_GROUPS } from "@/lib/firebase"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupName = decodeURIComponent(params.groupName as string)

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentGroup = CULTURAL_GROUPS.find((group) => group.name === groupName)
  const backgroundImage = currentGroup?.background || "/placeholder.svg?height=1080&width=1920"

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const groupSchedules = await getSchedulesByGroup(groupName)
        setSchedules(groupSchedules)
      } catch (err) {
        console.error("Error fetching schedules:", err)
        setError("Error al cargar los horarios")
      } finally {
        setLoading(false)
      }
    }

    if (groupName) {
      fetchSchedules()
    }
  }, [groupName])

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

  const groupColor = generateGroupColor(groupName)

  // Group schedules by day
  const schedulesByDay = schedules.reduce(
    (acc, schedule) => {
      const day = schedule.dayOfWeek
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(schedule)
      return acc
    },
    {} as { [key: string]: Schedule[] },
  )

  // Sort days in order
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const sortedDays = dayOrder.filter((day) => schedulesByDay[day])

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <p className="text-lg">Cargando horarios...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <p className="text-lg text-red-300">{error}</p>
            <Button
              variant="outline"
              className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="text-white hover:bg-white/10 mb-4" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a grupos culturales
          </Button>

          <div className="flex items-center gap-4 mb-4">
            {currentGroup?.logo ? (
              <img
                src={currentGroup.logo || "/placeholder.svg"}
                alt={`Logo ${groupName}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: groupColor }}></div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white font-serif">{groupName}</h1>
          </div>

          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Universidad del Valle</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {schedules.length} horario{schedules.length !== 1 ? "s" : ""} registrado
                {schedules.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Schedules */}
        <div className="max-w-4xl mx-auto">
          {schedules.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay horarios registrados</h3>
                <p className="text-gray-600">Este grupo cultural aún no tiene horarios programados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedDays.map((day) => (
                <Card key={day} className="bg-white/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" style={{ color: groupColor }} />
                      {getDayInSpanish(day)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {schedulesByDay[day]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: schedule.color }}></div>
                              <div>
                                <div className="flex items-center gap-2 font-medium text-gray-900">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                </div>
                                {schedule.subGroup && (
                                  <p className="text-sm text-gray-600 mt-1">Tipo: {schedule.subGroup}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {schedule.subGroup && (
                                <Badge variant="outline" className="text-xs">
                                  {schedule.subGroup}
                                </Badge>
                              )}
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: `${schedule.color}20`,
                                  color: schedule.color,
                                  borderColor: schedule.color,
                                }}
                              >
                                {(() => {
                                  const start = new Date(`2000-01-01T${schedule.startTime}`)
                                  const end = new Date(`2000-01-01T${schedule.endTime}`)
                                  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                                  return `${duration}h`
                                })()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de contacto
              </h3>
              <p className="text-gray-600 mb-2">
                Para más información sobre este grupo cultural, contacta al Área de Cultura de la Universidad del Valle.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline">Área de Cultura</Badge>
                <Badge variant="outline">Universidad del Valle</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
