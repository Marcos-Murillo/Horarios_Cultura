export default function SinAccesoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">Sin acceso</h1>
      <p className="text-gray-600 text-center max-w-sm">
        No tienes permiso para acceder a esta sección. Contacta al administrador.
      </p>
      <a href="/" className="text-blue-600 underline text-sm">Volver al inicio</a>
    </div>
  )
}
