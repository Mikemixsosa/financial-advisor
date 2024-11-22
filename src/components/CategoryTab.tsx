'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Edit, Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Category } from './financedashboardcomponents/financedashboardtypes'
import { addCategory, updateCategory, deleteCategory, fetchCategories } from './financedashboardcomponents/apiServices'

interface CategoryTabProps {
  userId: string
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}

export function CategoryTab({ userId, categories, setCategories }: CategoryTabProps) {
  const [newCategory, setNewCategory] = useState({
    nombre: '',
    tipo: 'Gasto' as 'Ingreso' | 'Gasto',
  })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedType, setSelectedType] = useState<'Todos' | 'Ingreso' | 'Gasto'>('Todos')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories)

  const filterCategories = useCallback((type: 'Todos' | 'Ingreso' | 'Gasto') => {
    if (type === 'Todos') {
      setFilteredCategories(categories)
    } else {
      setFilteredCategories(categories.filter(category => category.tipo === type))
    }
  }, [categories])

  useEffect(() => {
    filterCategories(selectedType)
  }, [selectedType, categories, filterCategories])
  


  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const addedCategory = await addCategory(newCategory)
      setCategories(prevCategories => [...prevCategories, addedCategory])
      setNewCategory({ nombre: '', tipo: 'Gasto' })
      filterCategories(selectedType)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const updatedCategory = await updateCategory(editingCategory)
      setCategories(prevCategories => prevCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat))
      setEditingCategory(null)
      setIsEditDialogOpen(false)
      filterCategories(selectedType)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDeleteCategory = async () => {
    if (!userId || !deletingCategoryId) return

    try {
      await deleteCategory(deletingCategoryId)
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== deletingCategoryId))
      setIsDeleteDialogOpen(false)
      setDeletingCategoryId(null)
      filterCategories(selectedType)
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nombre</Label>
                <Input
                  id="categoryName"
                  value={newCategory.nombre}
                  onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryType">Tipo</Label>
                <Select
                  onValueChange={(value: 'Ingreso' | 'Gasto') => setNewCategory({ ...newCategory, tipo: value })}
                  value={newCategory.tipo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingreso">Ingreso</SelectItem>
                    <SelectItem value="Gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Agregar Categoría</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="filterType">Filtrar por tipo</Label>
            <Select
              onValueChange={(value: 'Todos' | 'Ingreso' | 'Gasto') => setSelectedType(value)}
              value={selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
                <SelectItem value="Gasto">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.id} className="flex justify-between items-center border-b py-2">
                <p className="font-semibold">{category.nombre}</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-sm ${category.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                    {category.tipo}
                  </p>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Categoría</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditCategory} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="editCategoryName">Nombre</Label>
                          <Input
                            id="editCategoryName"
                            value={editingCategory?.nombre || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory!, nombre: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editCategoryType">Tipo</Label>
                          <Select
                            onValueChange={(value: 'Ingreso' | 'Gasto') => setEditingCategory({ ...editingCategory!, tipo: value })}
                            value={editingCategory?.tipo || 'Gasto'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ingreso">Ingreso</SelectItem>
                              <SelectItem value="Gasto">Gasto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Guardar Cambios</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingCategoryId(category.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>
                          ¿Estás seguro de que quieres eliminar la categoría "{category.nombre}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteCategory}>Eliminar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}