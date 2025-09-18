export const CULTURAL_GROUPS = [
  "COLECTIVO UNIVERSITARIO AUTOGESTIONADO DE COMUNICACIÓN POPULAR - CUAP",
  "CORO MAGNO DE LA UNIVERSIDAD DEL VALLE",
  "ESTUDIANTINA DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO CAPOEIRA DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE ARTE URBANO (RAP, FREESTYLE, DIBUJO, MURALISMO Y GRAFITI DE LA UNIVERSIDAD DEL VALLE)",
  "GRUPO DE BAILES LATINOS DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE DANZA ÁRABE Y TRIBAL DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE DANZA CONTEMPORÁNEA DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE DANZA ORIENTAL DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE DANZA URBANA Y BREACKING DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE DANZA URBANA Y LABORATORIO ARTÍSTICO DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE MÚSICA Y DANZA CARMEN LÓPEZ DE DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE NARRACIÓN ORAL Y CUENTERÍA EL PEROL DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE POESÍA DE LA UNIVERSIDAD DEL VALLE",
  "GRUPO DE TEATRO BIENESTAR UNIVERSITARIO DE LA UNIVERSIDAD DEL VALLE",
  "ORQUESTA DE SALSA Y MÚSICA LATINA DE LA UNIVERSIDAD DEL VALLE",
  "SELECCIÓN SALSA, BACHATA Y RITMOS LATINOS DE LA UNIVERSIDAD DEL VALLE",
  "UNIVALLUNO DE CANCIÓN",
  "TALLER DE VOCES LIBRES, EXPRESIÓN Y COMUNICACIÓN",
  "BAILE RECREATIVO",
]

export interface Schedule {
  id: string
  groupName: string
  day: string
  startTime: string
  endTime: string
  subGroup?: "semillero" | "proceso" | "representativo"
  createdAt: Date
  updatedAt: Date
}

export const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export const GROUP_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
]

export function getGroupColor(groupName: string): string {
  const index = CULTURAL_GROUPS.indexOf(groupName) % GROUP_COLORS.length
  return GROUP_COLORS[index]
}

export function getShortGroupName(fullName: string): string {
  if (fullName.includes("CUAP")) return "CUAP"
  if (fullName.includes("CORO MAGNO")) return "Coro Magno"
  if (fullName.includes("ESTUDIANTINA")) return "Estudiantina"
  if (fullName.includes("CAPOEIRA")) return "Capoeira"
  if (fullName.includes("ARTE URBANO")) return "Arte Urbano"
  if (fullName.includes("BAILES LATINOS")) return "Bailes Latinos"
  if (fullName.includes("DANZA ÁRABE")) return "Danza Árabe"
  if (fullName.includes("DANZA CONTEMPORÁNEA")) return "Danza Contemporánea"
  if (fullName.includes("DANZA ORIENTAL")) return "Danza Oriental"
  if (fullName.includes("DANZA URBANA Y BREACKING")) return "Danza Urbana & Breaking"
  if (fullName.includes("DANZA URBANA Y LABORATORIO")) return "Danza Urbana & Lab"
  if (fullName.includes("CARMEN LÓPEZ")) return "Carmen López"
  if (fullName.includes("NARRACIÓN ORAL")) return "El Perol"
  if (fullName.includes("POESÍA")) return "Poesía"
  if (fullName.includes("TEATRO")) return "Teatro"
  if (fullName.includes("ORQUESTA")) return "Orquesta Salsa"
  if (fullName.includes("SELECCIÓN SALSA")) return "Selección Salsa"
  if (fullName.includes("UNIVALLUNO")) return "Univalluno de Canción"
  if (fullName.includes("VOCES LIBRES")) return "Voces Libres"
  if (fullName.includes("BAILE RECREATIVO")) return "Baile Recreativo"
  return fullName
}
