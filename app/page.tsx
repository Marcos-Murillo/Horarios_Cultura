"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Instagram, Globe, Facebook, ArrowRight, MapPin } from "lucide-react"
import { CULTURAL_GROUPS, getSchedulesByGroup, type Schedule } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groupSchedules, setGroupSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalGroup, setModalGroup] = useState<string>("")

  const handleGroupClick = async (groupName: string) => {
    setLoading(true)
    setModalGroup(groupName)
    setShowModal(true)

    try {
      const schedules = await getSchedulesByGroup(groupName)
      setGroupSchedules(schedules)
    } catch (error) {
      console.error("Error fetching schedules:", error)
      setGroupSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (groupName: string) => {
    router.push(`/group/${encodeURIComponent(groupName)}`)
  }

  const formatTime = (time: string) => {
    return time.replace(":", ":")
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

  const WeeklyCalendar = ({ schedules }: { schedules: Schedule[] }) => {
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

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {days.map((day, index) => (
          <div key={day} className="space-y-2">
            <h3 className="font-semibold text-center p-1.5 sm:p-2 bg-gray-100 rounded-lg text-xs sm:text-sm truncate">
              {daysInSpanish[index]}
            </h3>
            <div className="space-y-1.5 sm:space-y-2 min-h-[120px] sm:min-h-[150px]">
              {schedulesByDay[day]
                ?.sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-1.5 sm:p-2 rounded text-white text-xs"
                    style={{ backgroundColor: schedule.color }}
                  >
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

  return (
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/ascun.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 font-serif leading-tight px-2">
            Descubre el horario de tu grupo cultural favorito
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-4 sm:mb-6 px-2">
            Universidad del Valle - Área de Cultura
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => window.open("https://www.instagram.com/areaculturaunivalle/", "_blank")}
            >
              <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
              onClick={() =>
                window.open(
                  "https://vicebienestar.univalle.edu.co/cultura-recreacion-y-deporte/area-de-cultura",
                  "_blank",
                )
              }
            >
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => window.open("https://www.facebook.com/areaculturaunivalle", "_blank")}
            >
              <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Cultural Groups List */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {CULTURAL_GROUPS.map((group) => {
              return (
                <Card
                  key={group.id}
                  className="bg-white/95 backdrop-blur-sm hover:bg-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden"
                  onClick={() => handleGroupClick(group.name)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <img
                          src={group.logo || "/placeholder.svg"}
                          alt={`Logo ${group.shortName}`}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-semibold text-xs sm:text-sm text-gray-900 leading-tight line-clamp-2"
                            title={group.name}
                          >
                            {group.shortName}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">Ver horarios</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(group.name)
                          }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              {(() => {
                const group = CULTURAL_GROUPS.find((g) => g.name === modalGroup)
                return group ? (
                  <>
                    <img
                      src={group.logo || "/placeholder.svg"}
                      alt={`Logo ${group.shortName}`}
                      className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate">Horarios de {group.shortName}</span>
                  </>
                ) : (
                  <span className="truncate">Horarios de {modalGroup}</span>
                )
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 sm:mt-4">
            {loading ? (
              <p className="text-center text-gray-600 py-6 sm:py-8 text-sm sm:text-base">Cargando horarios...</p>
            ) : groupSchedules.length > 0 ? (
              <WeeklyCalendar schedules={groupSchedules} />
            ) : (
              <p className="text-center text-gray-600 py-6 sm:py-8 text-sm sm:text-base">
                No hay horarios registrados para este grupo
              </p>
            )}
          </div>
          <div className="flex justify-end mt-3 sm:mt-4">
            <Button variant="outline" onClick={() => handleViewDetails(modalGroup)} className="text-sm">
              Ver detalles completos
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
