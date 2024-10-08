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
import { CalendarIcon, ChevronDown, ChevronUp, DollarSign, Filter, PiggyBank, X, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchCategories, fetchTransactions } from './financedashboardcomponents/apiServices'
import { addTransaction, updateTransaction, deleteTransaction } from './financedashboardcomponents/transactionsApiServices'
import { Transaction, Category, DateRange } from './financedashboardcomponents/financedashboardtypes'
import { CategoryTab } from './CategoryTab'
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
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined } as DateRange,
    tipo: 'Todos' as 'Todos' | 'Ingreso' | 'Gasto',
    categoria: 'Todas',
  })
  const [showFilters, setShowFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/auth/login')
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
      setFilteredCategories(categoriesData.filter(category => category.tipo === newTransaction.tipo)) // Filtrar categorías iniciales según el tipo por defecto
      const transactionsData = await fetchTransactions(userId)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error al cargar los datos iniciales', error)
    } finally {
      setIsLoading(false)

    }
  }

  const handleTransactionTypeChange = (tipo: 'Ingreso' | 'Gasto') => {
    setNewTransaction({ ...newTransaction, tipo, categoria: '' }) // Cambiar el tipo y resetear la categoría seleccionada
    setFilteredCategories(categories.filter(category => category.tipo === tipo)) // Filtrar las categorías según el tipo seleccionado
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const addedTransaction = await addTransaction(newTransaction, userId, categories)
      setTransactions([...transactions, addedTransaction])
      setNewTransaction({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd'), tipo: 'Gasto', categoria: '' })
      setFilteredCategories(categories.filter(category => category.tipo === 'Gasto')) // Actualizar las categorías según el tipo por defecto
    } catch (error: any) {
      setError(error.message)
    }
  }


  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction) return

    try {
      const updatedTransaction = await updateTransaction(editingTransaction)
      setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t))
      setEditingTransaction(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error al actualizar la transacción:', error)
      setError('Error al actualizar la transacción')
    }
  }

  const handleDeleteTransaction = async () => {
    if (!deletingTransactionId) return

    try {
      await deleteTransaction(deletingTransactionId)
      setTransactions(transactions.filter(t => t.id !== deletingTransactionId))
      setIsDeleteDialogOpen(false)
      setDeletingTransactionId(null)
    } catch (error) {
      console.error('Error al eliminar la transacción:', error)
      setError('Error al eliminar la transacción')
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Agregar Transacción</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      onValueChange={(value: 'Ingreso' | 'Gasto') => handleTransactionTypeChange(value)}
                      value={newTransaction.tipo}
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
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, categoria: value })}
                      value={newTransaction.categoria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.nombre}>{category.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                      <p className="text-sm text-gray-500">{transaction.fecha} - {transaction.categoria}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-bold ${transaction.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.tipo === 'Ingreso' ? '+' : '-'}${transaction.monto.toFixed(2)}
                      </p>
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Transacción</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleEditTransaction} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="editDescription">Descripción</Label>
                              <Input
                                id="editDescription"
                                value={editingTransaction?.descripcion || ''}
                                onChange={(e) => setEditingTransaction({ ...editingTransaction!, descripcion: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editAmount">Monto</Label>
                              <Input
                                id="editAmount"
                                type="number"
                                value={editingTransaction?.monto || ''}
                                onChange={(e) => setEditingTransaction({ ...editingTransaction!, monto: parseFloat(e.target.value) })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editDate">Fecha</Label>
                              <Input
                                id="editDate"
                                type="date"
                                value={editingTransaction?.fecha || ''}
                                onChange={(e) => setEditingTransaction({ ...editingTransaction!, fecha: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="editType">Tipo</Label>
                              <Select
                                onValueChange={(value: 'Ingreso' | 'Gasto') => setEditingTransaction({ ...editingTransaction!, tipo: value })}
                                defaultValue={editingTransaction?.tipo}
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
                            <div className="space-y-2">
                              <Label htmlFor="editCategory">Categoría</Label>
                              <Select
                                onValueChange={(value) => setEditingTransaction({ ...editingTransaction!, categoria: value })}
                                defaultValue={editingTransaction?.categoria}
                              >
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
                              setDeletingTransactionId(transaction.id)
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
                              ¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDeleteTransaction}>Eliminar</Button>
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

        <TabsContent value="categories" className="space-y-4">
          <CategoryTab
            userId={userId!}
            categories={categories}
            setCategories={setCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}