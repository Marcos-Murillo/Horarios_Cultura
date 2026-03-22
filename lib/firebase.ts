import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAbxNkjj45FMeHmlRVWGE15jq5SUnngT0c",
  authDomain: "horarioscultura-e30ba.firebaseapp.com",
  projectId: "horarioscultura-e30ba",
  storageBucket: "horarioscultura-e30ba.firebasestorage.app",
  messagingSenderId: "593662091995",
  appId: "1:593662091995:web:a5af6b4fb7729c8c1162fe",
  measurementId: "G-B575M0W3LV",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Types for our data structures
export interface Schedule {
  id?: string
  groupName: string
  startTime: string
  endTime: string
  dayOfWeek: string
  subGroup?: string // semillero, proceso, or representativo
  lugar?: string
  color: string
}

export interface CulturalGroup {
  id: string
  name: string
  shortName: string
  logo: string
  background: string
  color: string
}

export const CULTURAL_GROUPS: CulturalGroup[] = [
  {
    id: "cuap",
    name: "COLECTIVO UNIVERSITARIO AUTOGESTIONADO DE COMUNICACIÓN POPULAR - CUAP",
    shortName: "CUAP",
    logo: "/images/logos/cuap.jpg",
    background: "/images/backgrounds/cuap.jpg",
    color: "#E8A020", // Amarillo bandera colombiana — comunicación popular
  },
  {
    id: "coro",
    name: "CORO MAGNO DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Coro Magno",
    logo: "/images/logos/coro.jpg",
    background: "/images/backgrounds/coro.jpg",
    color: "#1A6BAD", // Azul bandera colombiana — solemnidad coral
  },
  {
    id: "estudiantina",
    name: "ESTUDIANTINA DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Estudiantina",
    logo: "/images/logos/estudiantina.jpg",
    background: "/images/backgrounds/estudiantina.jpg",
    color: "#C0392B", // Rojo bandera colombiana — música tradicional
  },
  {
    id: "capoeira",
    name: "GRUPO CAPOEIRA DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Capoeira",
    logo: "/images/logos/capoeira.jpg",
    background: "/images/backgrounds/capoeira.jpg",
    color: "#27AE60", // Verde selva colombiana — movimiento y naturaleza
  },
  {
    id: "arte-urbano",
    name: "GRUPO DE ARTE URBANO (RAP, FREESTYLE, DIBUJO, MURALISMO Y GRAFITI DE LA UNIVERSIDAD DEL VALLE)",
    shortName: "Arte Urbano",
    logo: "/images/logos/arte-urbano.jpg",
    background: "/images/backgrounds/arte-urbano.jpg",
    color: "#8E44AD", // Morado — arte urbano y expresión libre
  },
  {
    id: "bailes-latinos",
    name: "GRUPO DE BAILES LATINOS DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Bailes Latinos",
    logo: "/images/logos/bailes-latinos.jpg",
    background: "/images/backgrounds/bailes-latinos.jpg",
    color: "#E74C3C", // Rojo salsa — pasión y ritmo latino
  },
  {
    id: "danza-arabe",
    name: "CORO UNIVERSITARIO SAN FERNANDO",
    shortName: "Coro San Fernando",
    logo: "/images/logos/danza-arabe.jpg",
    background: "/images/backgrounds/danza-arabe.jpg",
    color: "#2980B9", // Azul cielo — voces y armonía
  },
  {
    id: "danza-contemporanea",
    name: "GRUPO DE DANZA CONTEMPORÁNEA DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Danza Contemporánea",
    logo: "/images/logos/danza-contemporanea.jpg",
    background: "/images/backgrounds/danza-contemporanea.jpg",
    color: "#D35400", // Naranja tierra — expresión corporal
  },
  {
    id: "danza-oriental",
    name: "GRUPO DE DANZA ORIENTAL DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Danza Oriental",
    logo: "/images/logos/danza-oriental.jpg",
    background: "/images/backgrounds/danza-oriental.jpg",
    color: "#16A085", // Verde esmeralda — misticismo oriental
  },
  {
    id: "danza-urbana",
    name: "GRUPO DE DANZA URBANA Y BREACKING DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Danza Urbana",
    logo: "/images/logos/danza-urbana.jpg",
    background: "/images/backgrounds/danza-urbana.jpg",
    color: "#F39C12", // Amarillo cálido — energía urbana
  },
  {
    id: "laboratorio-artistico",
    name: "GRUPO DE DANZA URBANA Y LABORATORIO ARTÍSTICO DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Laboratorio Artístico",
    logo: "/images/logos/laboratorio-artistico.jpg",
    background: "/images/backgrounds/laboratorio-artistico.jpg",
    color: "#1ABC9C", // Turquesa — creatividad y experimentación
  },
  {
    id: "carmen-lopez",
    name: "GRUPO DE MÚSICA Y DANZA CARMEN LÓPEZ DE DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Carmen López",
    logo: "/images/logos/carmen-lopez.jpg",
    background: "/images/backgrounds/carmen-lopez.jpg",
    color: "#C0392B", // Rojo folclor — música y danza tradicional
  },
  {
    id: "narracion-oral",
    name: "GRUPO DE NARRACIÓN ORAL Y CUENTERÍA EL PEROL DE LA UNIVERSIDAD DEL VALLE",
    shortName: "El Perol",
    logo: "/images/logos/narracion-oral.jpg",
    background: "/images/backgrounds/narracion-oral.jpg",
    color: "#E67E22", // Naranja cálido — cuentería y tradición oral
  },
  {
    id: "poesia",
    name: "GRUPO DE POESÍA DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Poesía",
    logo: "/images/logos/poesia.jpg",
    background: "/images/backgrounds/poesia.jpg",
    color: "#9B59B6", // Violeta — poesía y lirismo
  },
  {
    id: "teatro",
    name: "GRUPO DE TEATRO BIENESTAR UNIVERSITARIO DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Teatro",
    logo: "/images/logos/teatro.jpg",
    background: "/images/backgrounds/teatro.jpg",
    color: "#2C3E8C", // Azul índigo — teatro y drama
  },
  {
    id: "orquesta-salsa",
    name: "ORQUESTA DE SALSA Y MÚSICA LATINA DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Orquesta Salsa",
    logo: "/images/logos/orquesta-salsa.jpg",
    background: "/images/backgrounds/orquesta-salsa.jpg",
    color: "#E8A020", // Amarillo dorado — brillo de la orquesta
  },
  {
    id: "seleccion-salsa",
    name: "SELECCIÓN SALSA, BACHATA Y RITMOS LATINOS DE LA UNIVERSIDAD DEL VALLE",
    shortName: "Selección Salsa",
    logo: "/images/logos/seleccion-salsa.jpg",
    background: "/images/backgrounds/seleccion-salsa.jpg",
    color: "#E74C3C", // Rojo pasión — salsa y bachata
  },
  {
    id: "univalluno-cancion",
    name: "UNIVALLUNO DE CANCIÓN",
    shortName: "Univalluno de Canción",
    logo: "/images/logos/univalluno-cancion.jpg",
    background: "/images/backgrounds/univalluno-cancion.jpg",
    color: "#27AE60", // Verde esperanza — canción universitaria
  },
  {
    id: "voces-libres",
    name: "TALLER DE VOCES LIBRES, EXPRESIÓN Y COMUNICACIÓN",
    shortName: "Voces Libres",
    logo: "/images/logos/voces-libres.jpg",
    background: "/images/backgrounds/voces-libres.jpg",
    color: "#2980B9", // Azul libertad — expresión vocal
  },
  {
    id: "baile-recreativo",
    name: "BAILE RECREATIVO",
    shortName: "Baile Recreativo",
    logo: "/images/logos/baile-recreativo.jpg",
    background: "/images/backgrounds/baile-recreativo.jpg",
    color: "#F39C12", // Amarillo alegre — recreación y disfrute
  },
]

export const getGroupById = (id: string): CulturalGroup | undefined => {
  return CULTURAL_GROUPS.find((group) => group.id === id)
}

export const getGroupByName = (name: string): CulturalGroup | undefined => {
  return CULTURAL_GROUPS.find((group) => group.name === name)
}

export const generateGroupColor = (groupName: string) => {
  const group = getGroupByName(groupName)
  return group ? group.color : "#059669"
}

// Firestore functions
export const addSchedule = async (schedule: Omit<Schedule, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "schedules"), schedule)
    return docRef.id
  } catch (error) {
    console.error("Error adding schedule:", error)
    throw error
  }
}

export const getSchedules = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "schedules"))
    const schedules: Schedule[] = []
    querySnapshot.forEach((doc) => {
      schedules.push({ id: doc.id, ...doc.data() } as Schedule)
    })
    return schedules
  } catch (error) {
    console.error("Error getting schedules:", error)
    throw error
  }
}

export const getSchedulesByGroup = async (groupName: string) => {
  try {
    const q = query(collection(db, "schedules"), where("groupName", "==", groupName))
    const querySnapshot = await getDocs(q)
    const schedules: Schedule[] = []
    querySnapshot.forEach((doc) => {
      schedules.push({ id: doc.id, ...doc.data() } as Schedule)
    })
    return schedules
  } catch (error) {
    console.error("Error getting schedules by group:", error)
    throw error
  }
}

export const updateSchedule = async (id: string, schedule: Partial<Schedule>) => {
  try {
    const scheduleRef = doc(db, "schedules", id)
    await updateDoc(scheduleRef, schedule)
  } catch (error) {
    console.error("Error updating schedule:", error)
    throw error
  }
}

export const deleteSchedule = async (id: string) => {
  try {
    await deleteDoc(doc(db, "schedules", id))
  } catch (error) {
    console.error("Error deleting schedule:", error)
    throw error
  }
}
