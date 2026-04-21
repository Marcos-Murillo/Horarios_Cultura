"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, Loader2, CalendarPlus } from "lucide-react"
import { CULTURAL_GROUPS, addSchedule, generateGroupColor, type Schedule } from "@/lib/firebase"

type SlotForm = {
  dayOfWeek: string
  startTime: string
  endTime: string
  lugar: string
  subGroup: string
}

const emptySlot = (): SlotForm => ({
  dayOfWeek: "", startTime: "", endTime: "", lugar: "", subGroup: "",
})

const DAYS = [
  { value: "Monday", label: "Lunes" },
  { value: "Tuesday", label: "Martes" },
  { value: "Wednesday", label: "Miércoles" },
  { value: "Thursday", label: "Jueves" },
  { value: "Friday", label: "Viernes" },
  { value: "Saturday", label: "Sábado" },
  { value: "Sunday", label: "Domingo" },
]

export function ScheduleForm({ onSaved }: { onSaved: () => void }) {
  const [groupName, setGroupName] = useState("")
  const [slots, setSlots] = useState<SlotForm[]>([emptySlot()])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateSlot = (i: number, field: keyof SlotForm, value: string) => {
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const addSlot = () => setSlots((prev) => [...prev, emptySlot()])

  const removeSlot = (i: number) => {
    if (slots.length === 1) return
    setSlots((prev) => prev.filter((_, idx) => idx !== i))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!groupName) e.groupName = "Selecciona un grupo"
    slots.forEach((s, i) => {
      if (!s.dayOfWeek) e[`day_${i}`] = "Selecciona el día"
      if (!s.startTime) e[`start_${i}`] = "Hora de inicio requerida"
      if (!s.endTime) e[`end_${i}`] = "Hora de fin requerida"
      if (!s.lugar.trim()) e[`lugar_${i}`] = "Lugar requerido"
      if (s.startTime && s.endTime && s.startTime >= s.endTime)
        e[`end_${i}`] = "Fin debe ser posterior al inicio"
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const color = generateGroupColor(groupName)
      await Promise.all(
        slots.map((s) =>
          addSchedule({
            groupName,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            lugar: s.lugar,
            subGroup: s.subGroup === "none" ? "" : s.subGroup,
            color,
          })
        )
      )
      setGroupName("")
      setSlots([emptySlot()])
      setErrors({})
      onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CalendarPlus className="h-4 w-4" />
          Agregar Horarios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grupo */}
          <div>
            <Label className="text-sm">Grupo</Label>
            <Select value={groupName} onValueChange={setGroupName}>
              <SelectTrigger className="text-sm mt-1">
                <SelectValue placeholder="Selecciona un grupo" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {CULTURAL_GROUPS.map((g) => (
                  <SelectItem key={g.id} value={g.name} className="text-sm">{g.shortName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.groupName && <p className="text-xs text-red-600 mt-1">{errors.groupName}</p>}
          </div>

          {/* Slots */}
          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div
                key={i}
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
              >
                {/* Header del slot */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Horario {i + 1}
                  </span>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Día */}
                <div>
                  <Label className="text-xs text-gray-600">Día</Label>
                  <Select value={slot.dayOfWeek} onValueChange={(v) => updateSlot(i, "dayOfWeek", v)}>
                    <SelectTrigger className="text-sm mt-1">
                      <SelectValue placeholder="Selecciona el día" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {DAYS.map((d) => (
                        <SelectItem key={d.value} value={d.value} className="text-sm">{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`day_${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`day_${i}`]}</p>}
                </div>

                {/* Horas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">Hora inicio</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                      className="text-sm mt-1"
                    />
                    {errors[`start_${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`start_${i}`]}</p>}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Hora fin</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                      className="text-sm mt-1"
                    />
                    {errors[`end_${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`end_${i}`]}</p>}
                  </div>
                </div>

                {/* Lugar */}
                <div>
                  <Label className="text-xs text-gray-600">Lugar</Label>
                  <Input
                    value={slot.lugar}
                    onChange={(e) => updateSlot(i, "lugar", e.target.value)}
                    placeholder="Ej: Aula 101, Cancha, Piscina..."
                    className="text-sm mt-1"
                  />
                  {errors[`lugar_${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`lugar_${i}`]}</p>}
                </div>

                {/* Tipo (opcional) */}
                <div>
                  <Label className="text-xs text-gray-600">Tipo (opcional)</Label>
                  <Select value={slot.subGroup} onValueChange={(v) => updateSlot(i, "subGroup", v)}>
                    <SelectTrigger className="text-sm mt-1">
                      <SelectValue placeholder="Sin tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none" className="text-sm">Ninguno</SelectItem>
                      <SelectItem value="semillero" className="text-sm">Semillero</SelectItem>
                      <SelectItem value="proceso" className="text-sm">Proceso</SelectItem>
                      <SelectItem value="representativo" className="text-sm">Representativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Botón agregar slot */}
          <button
            type="button"
            onClick={addSlot}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar otro horario
          </button>

          <Button type="submit" className="w-full text-sm" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar {slots.length} horario{slots.length !== 1 ? "s" : ""}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
