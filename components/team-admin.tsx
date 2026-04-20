"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, X, Users, Upload, Loader2, FileText } from "lucide-react"
import {
  CULTURAL_GROUPS,
  addTeamMember,
  getAllTeamMembers,
  updateTeamMember,
  deleteTeamMember,
  generateGroupColor,
  getGroupDescription,
  saveGroupDescription,
  type TeamMember,
} from "@/lib/firebase"

const IMGBB_API_KEY = "284aa20216b1efbccba773436aab047f"

async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  })
  const data = await res.json()
  if (!data.success) throw new Error("Error al subir imagen")
  return data.data.url as string
}

const emptyForm = { groupName: "", name: "", role: "", description: "", imageUrl: "" }

export function TeamAdmin() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [filterGroup, setFilterGroup] = useState("all")

  // Group description state
  const [descGroup, setDescGroup] = useState("")
  const [descText, setDescText] = useState("")
  const [descLoading, setDescLoading] = useState(false)
  const [descSaving, setDescSaving] = useState(false)

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try { setMembers(await getAllTeamMembers()) } finally { setLoading(false) }
  }

  const handleDescGroupChange = async (groupName: string) => {
    setDescGroup(groupName)
    setDescText("")
    if (!groupName) return
    setDescLoading(true)
    try {
      const existing = await getGroupDescription(groupName)
      setDescText(existing?.description ?? "")
    } finally { setDescLoading(false) }
  }

  const handleSaveDesc = async () => {
    if (!descGroup) return
    setDescSaving(true)
    try { await saveGroupDescription(descGroup, descText) } finally { setDescSaving(false) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToImgBB(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch { alert("Error al subir la imagen.") } finally { setUploading(false) }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.groupName) e.groupName = "Selecciona un grupo"
    if (!form.name.trim()) e.name = "Ingresa el nombre"
    if (!form.role.trim()) e.role = "Ingresa el rol"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      if (editing?.id) { await updateTeamMember(editing.id, form) }
      else { await addTeamMember(form) }
      setForm(emptyForm); setEditing(null); setErrors({})
      await fetchMembers()
    } finally { setSaving(false) }
  }

  const handleEdit = (m: TeamMember) => {
    setEditing(m)
    setForm({ groupName: m.groupName, name: m.name, role: m.role, description: m.description, imageUrl: m.imageUrl })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este integrante?")) return
    await deleteTeamMember(id); await fetchMembers()
  }

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); setErrors({}) }

  const filtered = filterGroup === "all" ? members : members.filter((m) => m.groupName === filterGroup)
  const byGroup = filtered.reduce((acc, m) => {
    if (!acc[m.groupName]) acc[m.groupName] = []
    acc[m.groupName].push(m)
    return acc
  }, {} as Record<string, TeamMember[]>)

  return (
    <div className="space-y-6">
      {/* ── Descripción del grupo ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4" />
            Descripción del Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm">Grupo</Label>
            <Select value={descGroup} onValueChange={handleDescGroupChange}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecciona un grupo" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {CULTURAL_GROUPS.map((g) => (
                  <SelectItem key={g.id} value={g.name} className="text-sm">{g.shortName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Descripción</Label>
            <textarea
              value={descText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescText(e.target.value)}
              placeholder="Escribe una descripción para este grupo..."
              disabled={!descGroup || descLoading}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={4}
            />
          </div>
          <Button onClick={handleSaveDesc} disabled={!descGroup || descSaving} className="text-sm">
            {descSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar descripción
          </Button>
        </CardContent>
      </Card>

      {/* ── Integrantes ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {editing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editing ? "Editar Integrante" : "Agregar Integrante"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm">Grupo Cultural</Label>
                <Select value={form.groupName} onValueChange={(v) => setForm({ ...form, groupName: v })}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecciona un grupo" /></SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {CULTURAL_GROUPS.map((g) => (
                      <SelectItem key={g.id} value={g.name} className="text-sm">{g.shortName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.groupName && <p className="text-xs text-red-600 mt-1">{errors.groupName}</p>}
              </div>
              <div>
                <Label className="text-sm">Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" className="text-sm" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="text-sm">Rol</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ej: Monitor, Director..." className="text-sm" />
                {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
              </div>
              <div>
                <Label className="text-sm">Descripción (opcional)</Label>
                <textarea
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descripción..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-sm">Imagen</Label>
                <div className="flex items-center gap-3 mt-1">
                  {form.imageUrl && <img src={form.imageUrl} alt="preview" className="w-12 h-12 rounded-full object-cover border" />}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin text-gray-500" /> : <Upload className="h-4 w-4 text-gray-500" />}
                      <span className="text-sm text-gray-600">{uploading ? "Subiendo..." : "Subir imagen"}</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 text-sm" disabled={saving || uploading}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {editing ? "Actualizar" : "Guardar"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={cancelEdit} className="text-sm bg-transparent">
                    <X className="h-4 w-4 mr-2" />Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />Integrantes Registrados
              </CardTitle>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-40 text-xs"><SelectValue placeholder="Filtrar grupo" /></SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  <SelectItem value="all" className="text-xs">Todos los grupos</SelectItem>
                  {CULTURAL_GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.name} className="text-xs">{g.shortName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-600 text-sm py-8">Cargando...</p>
            ) : Object.keys(byGroup).length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No hay integrantes registrados</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {Object.entries(byGroup).map(([groupName, groupMembers]) => (
                  <div key={groupName}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: generateGroupColor(groupName) }} />
                      <h4 className="font-medium text-sm text-gray-900 truncate">{groupName}</h4>
                    </div>
                    <div className="space-y-2 ml-5">
                      {groupMembers.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          {m.imageUrl ? (
                            <img src={m.imageUrl} alt={m.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                              {m.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(m)} className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id!)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
