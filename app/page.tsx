"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Users, Instagram, Globe, Facebook, ArrowRight, MapPin, Clock, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSchedules, getSchedulesByGroup, CULTURAL_GROUPS, type Schedule } from "@/lib/firebase"
import { cacheManager, debounce } from "@/lib/performance-utils"
import { GroupAvatar } from "@/components/group-avatar"

export default function HomePage() {
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groupSchedules, setGroupSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalGroup, setModalGroup] = useState<string>("")
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchAllSchedules()
  }, [])

  const fetchAllSchedules = async () => {
    try {
      const cachedSchedules = cacheManager.get("schedules_data")
      if (cachedSchedules) {
        setAllSchedules(cachedSchedules)
        setInitialLoading(false)
        return
      }

      const schedulesData = await getSchedules()
      setAllSchedules(schedulesData)
      cacheManager.set("schedules_data", schedulesData, 300000)
    } catch (error) {
      console.error("[v0] Error fetching schedules:", error)
      setAllSchedules([])
    } finally {
      setInitialLoading(false)
    }
  }

  const debouncedHandleGroupClick = debounce(async (groupName: string) => {
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
  }, 150)

  const handleGroupClick = (groupName: string) => {
    debouncedHandleGroupClick(groupName)
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

  const toRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const getDayEmoji = (day: string) => {
    const map: Record<string, string> = {
      Monday: "🌱", Tuesday: "🎭", Wednesday: "🎨",
      Thursday: "🎵", Friday: "✨", Saturday: "🎪", Sunday: "🌟",
    }
    return map[day] || "📅"
  }

  const getDuration = (start: string, end: string) => {
    const s = new Date(`2000-01-01T${start}`)
    const e = new Date(`2000-01-01T${end}`)
    const mins = (e.getTime() - s.getTime()) / 60000
    return mins >= 60 ? `${mins / 60}h` : `${mins}min`
  }

  const ScheduleTimeline = ({ schedules, groupColor }: { schedules: Schedule[], groupColor: string }) => {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const days: Record<string, string> = {
      Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles",
      Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo",
    }

    const byDay = schedules.reduce((acc, s) => {
      if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = []
      acc[s.dayOfWeek].push(s)
      return acc
    }, {} as Record<string, Schedule[]>)

    const sortedDays = dayOrder.filter((d) => byDay[d])

    if (sortedDays.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/50 text-sm">Sin horarios registrados</p>
        </div>
      )
    }

    return (
      <div className="relative">
        {/* Línea vertical */}
        <div
          className="absolute left-[10px] top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${groupColor}, ${toRgba(groupColor, 0.15)})` }}
        />
        <div className="space-y-5 pl-8">
          {sortedDays.map((day) => (
            <div key={day} className="relative">
              {/* Nodo */}
              <div
                className="absolute -left-[26px] top-2.5 w-3 h-3 rounded-full border-2 border-white/30"
                style={{ backgroundColor: groupColor, boxShadow: `0 0 8px ${toRgba(groupColor, 0.7)}` }}
              />
              {/* Día */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{getDayEmoji(day)}</span>
                <span className="text-white font-semibold text-sm">{days[day]}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              {/* Horarios */}
              <div className="space-y-2">
                {byDay[day]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderLeft: `3px solid ${groupColor}`,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                        backdropFilter: "blur(8px)",
                        border: `1px solid rgba(255,255,255,0.12)`,
                        borderLeftColor: groupColor,
                        borderLeftWidth: "3px",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: toRgba(groupColor, 0.25), border: `1px solid ${toRgba(groupColor, 0.4)}` }}
                        >
                          <Clock className="h-3.5 w-3.5" style={{ color: groupColor }} />
                        </div>
                        <div>
                          <p className="text-white font-bold text-xs">
                            {schedule.startTime} — {schedule.endTime}
                          </p>
                          {schedule.subGroup && (
                            <p className="text-white/50 text-xs capitalize">{schedule.subGroup}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {schedule.lugar && (
                          <span
                            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-white/85"
                            style={{ background: toRgba(groupColor, 0.2), border: `1px solid ${toRgba(groupColor, 0.35)}` }}
                          >
                            <MapPin className="h-2.5 w-2.5" style={{ color: groupColor }} />
                            {schedule.lugar}
                          </span>
                        )}
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                          style={{ background: toRgba(groupColor, 0.35), border: `1px solid ${toRgba(groupColor, 0.5)}` }}
                        >
                          {getDuration(schedule.startTime, schedule.endTime)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
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
              onClick={() => window.open("https://www.instagram.com/culturarecreadeporteunivalle/", "_blank")}
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
          {initialLoading ? (
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-white/10 backdrop-blur-md border border-white/20 animate-pulse">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {CULTURAL_GROUPS.map((group) => {
                return (
                  <Card
                    key={group.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-black/20 overflow-hidden"
                    onClick={() => handleGroupClick(group.name)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <GroupAvatar
                            groupName={group.name}
                            shortName={group.shortName}
                            color={group.color}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <h3
                              className="font-semibold text-xs sm:text-sm text-white leading-tight line-clamp-2"
                              title={group.name}
                            >
                              {group.shortName}
                            </h3>
                            <p className="text-xs text-white/60 mt-0.5 sm:mt-1">Ver horarios</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white/40" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white p-1 h-auto"
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
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="max-w-[92vw] sm:max-w-lg border-0 p-0 rounded-2xl overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "rgba(15, 15, 25, 0.75)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            margin: 0,
          }}
        >
          {(() => {
            const group = CULTURAL_GROUPS.find((g) => g.name === modalGroup)
            const groupColor = group?.color || "#E8A020"
            return (
              <>
                {/* Header con color del grupo */}
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${toRgba(groupColor, 0.4)} 0%, rgba(255,255,255,0.05) 100%)`,
                    borderBottom: `1px solid ${toRgba(groupColor, 0.3)}`,
                  }}
                >
                  {group && (
                    <GroupAvatar groupName={group.name} shortName={group.shortName} color={group.color} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-white font-bold text-sm sm:text-base truncate">
                      {group?.shortName || modalGroup}
                    </DialogTitle>
                    <p className="text-white/50 text-xs mt-0.5">Horarios semanales</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/10 shrink-0"
                    onClick={() => handleViewDetails(modalGroup)}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span className="ml-1 text-xs hidden sm:inline">Ver más</span>
                  </Button>
                </div>

                {/* Contenido con scroll */}
                <div className="p-5 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto mb-3" />
                      <p className="text-white/50 text-sm">Cargando horarios...</p>
                    </div>
                  ) : (
                    <ScheduleTimeline schedules={groupSchedules} groupColor={groupColor} />
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
