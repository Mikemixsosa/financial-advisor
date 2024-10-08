'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function LoginInterfaceComponent() {
  const [email, setEmail] = useState('')
  const [firebaseUid, setFirebaseUid] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebase_uid: firebaseUid }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Inicio de sesión exitoso:', data)
        // Store user ID in localStorage
        localStorage.setItem('userId', data.user.id.toString())
        router.push('/finanzas')
      } else {
        setError(data.error || 'Error en el inicio de sesión')
      }
    } catch (error) {
      setError('Error en la conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Registro con:', email, firebaseUid)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Recuperar contraseña para:', email)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>Inicia sesión o crea una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firebase_uid">Firebase UID</Label>
                  <Input
                    id="firebase_uid"
                    type="password"
                    value={firebaseUid}
                    onChange={(e) => setFirebaseUid(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Correo Electrónico</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-firebase_uid">Firebase UID</Label>
                  <Input
                    id="register-firebase_uid"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Registrarse</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button variant="link" onClick={handleForgotPassword} className="text-sm">
            ¿Olvidaste tu contraseña?
          </Button>
        </CardFooter>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  )
}