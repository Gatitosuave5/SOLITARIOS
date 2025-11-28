"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface User {
  id: string
  nombre: string
  email: string
  rol: "admin" | "profesor" | "coordinador"
  estado: "activo" | "inactivo"
  fechaCreacion: string
}

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      nombre: "Admin Sistema",
      email: "admin@universidad.edu",
      rol: "admin",
      estado: "activo",
      fechaCreacion: "2025-01-15",
    },
  ])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "profesor" as const,
  })

  const handleAddUser = () => {
    if (!formData.nombre || !formData.email) {
      alert("Por favor completa todos los campos")
      return
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      estado: "activo",
      fechaCreacion: new Date().toISOString().split("T")[0],
    }

    setUsers([...users, newUser])
    setFormData({ nombre: "", email: "", rol: "profesor" })
    setOpenDialog(false)
  }

  const handleDeleteUser = (id: string) => {
    if (id === "1") {
      alert("No se puede eliminar el usuario admin")
      return
    }
    setUsers(users.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Add User Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
          <p className="text-sm text-muted-foreground">Total: {users.length} usuarios en el sistema</p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
              <DialogDescription>Crea una nueva cuenta de usuario en el sistema</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Dr. Juan Pérez"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@universidad.edu"
                />
              </div>

              <div>
                <Label>Rol</Label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                  className="w-full h-10 px-3 border border-input bg-background rounded-md"
                >
                  <option value="profesor">Profesor</option>
                  <option value="coordinador">Coordinador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddUser}>Agregar Usuario</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.rol}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-600">
                      {user.estado}
                    </span>
                  </TableCell>
                  <TableCell>{user.fechaCreacion}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === "1"}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}
    </div>
  )
}
