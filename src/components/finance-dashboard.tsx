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
import { BarChart, CalendarIcon, ChevronDown, ChevronUp, DollarSign, Filter, PiggyBank, X, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


type Transaction = {
  id: number
  description: string
  amount: number
  date: string
  type: 'Ingreso' | 'Gasto'
  category: string
}

type Category = {
  id: number
  name: string
  type: 'Ingreso' | 'Gasto'
}

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export function FinanceDashboardComponent() {
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'Gasto' as 'Ingreso' | 'Gasto',
    category: '',
  })
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'Gasto' as 'Ingreso' | 'Gasto',
  })
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined } as DateRange,
    type: 'Todos' as 'Todos' | 'Ingreso' | 'Gasto',
    category: 'Todas',
  })
  const [showFilters, setShowFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Fetch userId and initialize data
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/login')
    } else {
      setUserId(storedUserId)
      fetchCategories(storedUserId)
      fetchTransactions(storedUserId)
    }
  }, [router])

  // Fetch categories from the API
  const fetchCategories = async (userId: string) => {
    try {
      const response = await fetch(`/api/categories?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      setError('Error fetching categories')
    }
  }

  // Fetch transactions from the API
  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      setError('Error fetching transactions')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle adding a new transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTransaction,
          usuario_id: userId,
          categoria_id: categories.find(c => c.name === newTransaction.category)?.id
        }),
      })

      if (!response.ok) throw new Error('Failed to add transaction')
      const addedTransaction = await response.json()
      setTransactions([...transactions, addedTransaction])
      setNewTransaction({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'Gasto', category: '' })
    } catch (error) {
      setError('Error adding transaction')
    }
  }

  // Handle adding a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCategory,
          usuario_id: userId
        }),
      })

      if (!response.ok) throw new Error('Failed to add category')
      const addedCategory = await response.json()
      setCategories([...categories, addedCategory])
      setNewCategory({ name: '', type: 'Gasto' })
    } catch (error) {
      setError('Error adding category')
    }
  }

  const clearFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      type: 'Todos',
      category: 'Todas',
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    const dateInRange = filters.dateRange.from && filters.dateRange.to
      ? new Date(transaction.date) >= filters.dateRange.from && new Date(transaction.date) <= filters.dateRange.to
      : true
    const typeMatch = filters.type === 'Todos' || transaction.type === filters.type
    const categoryMatch = filters.category === 'Todas' || transaction.category === filters.category
    return dateInRange && typeMatch && categoryMatch
  })

  const totalIncome = filteredTransactions.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter(t => t.type === 'Gasto').reduce((sum, t) => sum + t.amount, 0)
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
                <Select onValueChange={(value: 'Todos' | 'Ingreso' | 'Gasto') => setFilters({ ...filters, type: value })}>
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
                <Select onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
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
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select onValueChange={(value: 'Ingreso' | 'Gasto') => setNewTransaction({ ...newTransaction, type: value })}>
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
                    <Select onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
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
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm  text-gray-500">{transaction.date} - {transaction.category}</p>
                    </div>
                    <p className={`font-bold ${transaction.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'Ingreso' ? '+' : '-'}${transaction.amount.toFixed(2)}
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
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryType">Tipo</Label>
                    <Select onValueChange={(value: 'Ingreso' | 'Gasto') => setNewCategory({ ...newCategory, type: value })}>
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
                    <p className="font-semibold">{category.name}</p>
                    <p className={`text-sm ${category.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {category.type}
                    </p>
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