"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Calendar, Users, MapPin, Mail, Instagram } from "lucide-react"
import { getSchedulesByGroup, getTeamMembersByGroup, type Schedule, type TeamMember, generateGroupColor, CULTURAL_GROUPS } from "@/lib/firebase"
import { GroupAvatar } from "@/components/group-avatar"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupName = decodeURIComponent(params.groupName as string)

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"horarios" | "equipo">("horarios")

  const currentGroup = CULTURAL_GROUPS.find((g) => g.name === groupName)
  const backgroundImage = currentGroup?.background || "/ascun.jpg"
  const groupColor = currentGroup?.color || generateGroupColor(groupName)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const [data, team] = await Promise.all([
          getSchedulesByGroup(groupName),
          getTeamMembersByGroup(groupName),
        ])
        setSchedules(data)
        setTeamMembers(team)
      } catch (err) {
        console.error("Error fetching schedules:", err)
        setError("Error al cargar los horarios")
      } finally {
        setLoading(false)
      }
    }
    if (groupName) fetchSchedules()
  }, [groupName])

  const getDayInSpanish = (day: string) => {
    const map: Record<string, string> = {
      Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles",
      Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo",
    }
    return map[day] || day
  }

  const getDayEmoji = (day: string) => {
    const map: Record<string, string> = {
      Monday: "🌱", Tuesday: "🎭", Wednesday: "🎨",
      Thursday: "🎵", Friday: "✨", Saturday: "🎪", Sunday: "🌟",
    }
    return map[day] || "📅"
  }

  const formatTime = (time: string) => time

  const getDuration = (start: string, end: string) => {
    const s = new Date(`2000-01-01T${start}`)
    const e = new Date(`2000-01-01T${end}`)
    const mins = (e.getTime() - s.getTime()) / 60000
    return mins >= 60 ? `${mins / 60}h` : `${mins}min`
  }

  const toRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const schedulesByDay = schedules.reduce((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = []
    acc[s.dayOfWeek].push(s)
    return acc
  }, {} as Record<string, Schedule[]>)

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const sortedDays = dayOrder.filter((d) => schedulesByDay[d])

  const bgOverlay = `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)`

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }}>
          <div className="absolute inset-0" style={{ background: bgOverlay }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg">Cargando horarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${backgroundImage}')` }}>
          <div className="absolute inset-0" style={{ background: bgOverlay }} />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-red-300 text-lg mb-4">{error}</p>
          <Button className="bg-white/20 border border-white/30 text-white hover:bg-white/30" onClick={() => router.push("/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${backgroundImage}')` }}>
        <div className="absolute inset-0" style={{ background: bgOverlay }} />
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* ── HERO ── */}
        <div className="px-4 pt-6 pb-10 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-6 -ml-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Grupos culturales
          </Button>

          {/* Hero card */}
          <div
            className="rounded-2xl p-6 sm:p-8 backdrop-blur-md border border-white/20"
            style={{
              background: `linear-gradient(135deg, ${toRgba(groupColor, 0.35)} 0%, rgba(255,255,255,0.08) 100%)`,
              boxShadow: `0 8px 32px ${toRgba(groupColor, 0.3)}, 0 2px 8px rgba(0,0,0,0.2)`,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <GroupAvatar
                groupName={groupName}
                shortName={currentGroup?.shortName || groupName}
                color={groupColor}
                size="lg"
                className="w-20 h-20 text-2xl flex-shrink-0"
              />
              <div className="text-center sm:text-left flex-1">
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-medium">Grupo Cultural</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                  {currentGroup?.shortName || groupName}
                </h1>
                <p className="text-white/70 text-sm leading-relaxed mb-4 hidden sm:block">
                  {groupName}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-white/90 text-xs">
                    <Users className="h-3 w-3" style={{ color: groupColor }} />
                    Universidad del Valle
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-white/90 text-xs">
                    <Calendar className="h-3 w-3" style={{ color: groupColor }} />
                    {schedules.length} horario{schedules.length !== 1 ? "s" : ""}
                  </span>
                  {teamMembers.length > 0 && (
                    <span className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-white/90 text-xs">
                      <Users className="h-3 w-3" style={{ color: groupColor }} />
                      {teamMembers.length} integrante{teamMembers.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="px-4 max-w-3xl mx-auto mb-6">
          <div
            className="flex rounded-xl p-1 backdrop-blur-md border border-white/20"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {(["horarios", "equipo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all"
                style={
                  activeTab === tab
                    ? { background: groupColor, color: "white", boxShadow: `0 2px 8px rgba(0,0,0,0.2)` }
                    : { color: "rgba(255,255,255,0.6)" }
                }
              >
                {tab === "horarios" ? <Calendar className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                {tab === "horarios" ? "Horarios" : "Equipo"}
              </button>
            ))}
          </div>
        </div>

        {/* ── TIMELINE DE HORARIOS ── */}
        {activeTab === "horarios" && (
        <div className="px-4 pb-8 max-w-3xl mx-auto">
          {schedules.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center backdrop-blur-md border border-white/20"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40 text-white" />
              <h3 className="text-white font-semibold text-lg mb-1">Sin horarios registrados</h3>
              <p className="text-white/50 text-sm">Este grupo aún no tiene horarios programados.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Línea vertical del timeline */}
              <div
                className="absolute left-[18px] top-2 bottom-2 w-0.5 rounded-full"
                style={{ background: `linear-gradient(to bottom, ${groupColor}, ${toRgba(groupColor, 0.2)})` }}
              />

              <div className="space-y-6 pl-10">
                {sortedDays.map((day) => (
                  <div key={day} className="relative">
                    {/* Nodo del timeline */}
                    <div
                      className="absolute -left-[34px] top-3 w-4 h-4 rounded-full border-2 border-white/40 shadow-lg"
                      style={{ backgroundColor: groupColor, boxShadow: `0 0 10px ${toRgba(groupColor, 0.6)}` }}
                    />

                    {/* Día header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{getDayEmoji(day)}</span>
                      <h2 className="text-white font-bold text-base tracking-wide">{getDayInSpanish(day)}</h2>
                      <div className="flex-1 h-px bg-white/10 ml-1" />
                    </div>

                    {/* Cards de horarios */}
                    <div className="space-y-3">
                      {schedulesByDay[day]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="rounded-xl backdrop-blur-md border border-white/15 overflow-hidden"
                            style={{
                              background: "rgba(255,255,255,0.10)",
                              boxShadow: `0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)`,
                              borderLeft: `3px solid ${groupColor}`,
                            }}
                          >
                            <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                              {/* Hora */}
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: toRgba(groupColor, 0.25), border: `1px solid ${toRgba(groupColor, 0.4)}` }}
                                >
                                  <Clock className="h-4 w-4" style={{ color: groupColor }} />
                                </div>
                                <div>
                                  <p className="text-white font-bold text-sm">
                                    {formatTime(schedule.startTime)} — {formatTime(schedule.endTime)}
                                  </p>
                                  {schedule.subGroup && (
                                    <p className="text-white/55 text-xs capitalize mt-0.5">{schedule.subGroup}</p>
                                  )}
                                </div>
                              </div>

                              {/* Badges */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {schedule.lugar && (
                                  <span
                                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                                    style={{
                                      background: toRgba(groupColor, 0.2),
                                      color: "rgba(255,255,255,0.9)",
                                      border: `1px solid ${toRgba(groupColor, 0.35)}`,
                                    }}
                                  >
                                    <MapPin className="h-3 w-3" style={{ color: groupColor }} />
                                    {schedule.lugar}
                                  </span>
                                )}
                                <span
                                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                                  style={{
                                    background: toRgba(groupColor, 0.3),
                                    color: "white",
                                    border: `1px solid ${toRgba(groupColor, 0.5)}`,
                                  }}
                                >
                                  {getDuration(schedule.startTime, schedule.endTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* ── EQUIPO ── */}
        {activeTab === "equipo" && (
        <div className="px-4 pb-8 max-w-3xl mx-auto">
          {teamMembers.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center backdrop-blur-md border border-white/20"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <Users className="h-12 w-12 mx-auto mb-4 opacity-40 text-white" />
              <h3 className="text-white font-semibold text-lg mb-1">Sin integrantes registrados</h3>
              <p className="text-white/50 text-sm">Este grupo aún no tiene equipo registrado.</p>
            </div>
          ) : (
            <div
              className="rounded-2xl backdrop-blur-md border border-white/15 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <AnimatedTestimonials
                autoplay
                testimonials={teamMembers.map((m) => ({
                  name: m.name,
                  designation: m.role,
                  quote: m.description || "",
                  src: m.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=${groupColor.slice(1)}&color=fff&size=400`,
                }))}
              />
            </div>
          )}
        </div>
        )}

        {/* ── CONTACTO ── */}
        <div className="px-4 pb-12 max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-6 backdrop-blur-md border border-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <h3 className="text-white font-semibold text-base mb-1">¿Quieres saber más?</h3>
            <p className="text-white/55 text-sm mb-4">
              Contacta al Área de Cultura de la Universidad del Valle.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:areacultura.cdr@correounivalle.edu.co"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/90 border border-white/20 hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Mail className="h-4 w-4 text-amber-400" />
                areacultura.cdr@correounivalle.edu.co
              </a>
              <a
                href="https://www.instagram.com/culturarecreadeporteunivalle/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/90 border border-white/20 hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                @culturarecreadeporteunivalle
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
