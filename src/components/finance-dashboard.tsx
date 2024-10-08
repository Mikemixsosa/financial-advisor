'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BarChart, CalendarIcon, ChevronDown, ChevronUp, DollarSign, Filter, PiggyBank, X, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchCategories, fetchTransactions, addTransaction, addCategory, updateCategory, deleteCategory } from './financedashboardcomponents/apiServices'
import { Transaction, Category, DateRange } from './financedashboardcomponents/financedashboardtypes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export function FinanceDashboardComponent() {
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTransaction, setNewTransaction] = useState({
    descripcion: '',
    monto: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'Gasto' as 'Ingreso' | 'Gasto',
    categoria: '',
  })
  const [newCategory, setNewCategory] = useState({
    nombre: '',
    tipo: 'Gasto' as 'Ingreso' | 'Gasto',
  })
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined } as DateRange,
    tipo: 'Todos' as 'Todos' | 'Ingreso' | 'Gasto',
    categoria: 'Todas',
  })
  const [showFilters, setShowFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  const router = useRouter()

  // Fetch userId and initialize data
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/login')
    } else {
      setUserId(storedUserId)
      initializeData(storedUserId)
    }
  }, [router])

  const initializeData = async (userId: string) => {
    try {
      setIsLoading(true)
      const categoriesData = await fetchCategories(userId)
      setCategories(categoriesData)
      const transactionsData = await fetchTransactions(userId)
      setTransactions(transactionsData)
    } catch (error) {
      setError('Error al cargar los datos iniciales')
    } finally {
      setIsLoading(false)
    }
  }




  // Handle adding a new transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const addedTransaction = await addTransaction(newTransaction, userId, categories)
      setTransactions([...transactions, addedTransaction])
      setNewTransaction({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd'), tipo: 'Gasto', categoria: '' })
    } catch (error) {
      setError(error.message)
    }
  }

  // Handle adding a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const addedCategory = await addCategory(newCategory, userId)
      setCategories(prevCategories => [...prevCategories, addedCategory])
      setNewCategory({ nombre: '', tipo: 'Gasto' })
    } catch (error) {
      setError(error.message)
    }
  }

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const updatedCategory = await updateCategory(editingCategory)
      setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat))
      setEditingCategory(null)
      setIsEditDialogOpen(false)  // Cerrar el diálogo si la edición fue exitosa
    } catch (error) {
      console.error('Error al actualizar la categoría:', error)
    }
  }

  const handleDeleteCategory = async () => {
    if (!userId || !deletingCategoryId) return

    try {
      await deleteCategory(deletingCategoryId)
      setCategories(categories.filter(cat => cat.id !== deletingCategoryId))
      setIsDeleteDialogOpen(false)
      setDeletingCategoryId(null)
    } catch (error) {
      setError(error.message)
    }
  }


  const clearFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      tipo: 'Todos',
      categoria: 'Todas',
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    const dateInRange = filters.dateRange.from && filters.dateRange.to
      ? new Date(transaction.fecha) >= filters.dateRange.from && new Date(transaction.fecha) <= filters.dateRange.to
      : true
    const typeMatch = filters.tipo === 'Todos' || transaction.tipo === filters.tipo
    const categoryMatch = filters.categoria === 'Todas' || transaction.categoria === filters.categoria
    return dateInRange && typeMatch && categoryMatch
  })

  const totalIncome = filteredTransactions.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto, 0)
  const totalExpenses = filteredTransactions.filter(t => t.tipo === 'Gasto').reduce((sum, t) => sum + t.monto, 0)
  const balance = totalIncome - totalExpenses

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mi Dashboard Financiero</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="mr-2" />
              Filtros
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="dateRange">Rango de Fechas</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${filters.dateRange.from && filters.dateRange.to ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from && filters.dateRange.to ? (
                        `${format(filters.dateRange.from, "P")} - ${format(filters.dateRange.to, "P")}`
                      ) : (
                        <span>Seleccionar fechas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange.from}
                      selected={filters.dateRange}
                      onSelect={(range) => setFilters({ ...filters, dateRange: range || { from: undefined, to: undefined } })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="type">Tipo de Transacción</Label>
                <Select onValueChange={(value: 'Todos' | 'Ingreso' | 'Gasto') => setFilters({ ...filters, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Ingreso">Ingreso</SelectItem>
                    <SelectItem value="Gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="category">Categoría</Label>
                <Select onValueChange={(value) => setFilters({ ...filters, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.nombre}>{category.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={clearFilters} variant="outline" className="w-full">
              <X className="mr-2 h-4 w-4" /> Limpiar Filtros
            </Button>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={newTransaction.descripcion}
                      onChange={(e) => setNewTransaction({ ...newTransaction, descripcion: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newTransaction.monto}
                      onChange={(e) => setNewTransaction({ ...newTransaction, monto: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.fecha}
                      onChange={(e) => setNewTransaction({ ...newTransaction, fecha: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select onValueChange={(value: 'Ingreso' | 'Gasto') => setNewTransaction({ ...newTransaction, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ingreso">Ingreso</SelectItem>
                        <SelectItem value="Gasto">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select onValueChange={(value) => setNewTransaction({ ...newTransaction, categoria: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.nombre}>{category.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit">Agregar Transacción</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b py-2">
                    <div>
                      <p className="font-semibold">{transaction.descripcion}</p>
                      <p className="text-sm  text-gray-500">{transaction.fecha} - {transaction.categoria}</p>
                    </div>
                    <p className={`font-bold ${transaction.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.tipo === 'Ingreso' ? '+' : '-'}${transaction.monto.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
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
                    <Select onValueChange={(value: 'Ingreso' | 'Gasto') => setNewCategory({ ...newCategory, tipo: value })}>
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
              <div className="space-y-2">
                {categories.map((category) => (
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
                                defaultValue={editingCategory?.tipo}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}