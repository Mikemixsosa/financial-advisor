'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronDown, ChevronUp, DollarSign, Filter, PiggyBank, X, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchCategories } from './financedashboardcomponents/apiServices'
import { Transaction, Category, DateRange } from './financedashboardcomponents/financedashboardtypes'
import { CategoryTab } from './CategoryTab'
import { TransactionsTab } from './TransactionsTab'
import { fetchTransactions } from './financedashboardcomponents/transactionsApiServices'

export function FinanceDashboardComponent() {
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState({
    dateRange: { from: undefined, to: undefined } as DateRange,
    tipo: 'Todos' as 'Todos' | 'Ingreso' | 'Gasto',
    categoria: 'Todas',
  })
  const [showFilters, setShowFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const router = useRouter()

  useEffect(() => {
    const filteredByType = filters.tipo === 'Todos'
      ? categories
      : categories.filter(category => category.tipo === filters.tipo)
    setFilteredCategories(filteredByType)
  }, [filters.tipo, categories])

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
      const transactionsData = await fetchTransactions(userId)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error al cargar los datos iniciales', error)
    } finally {
      setIsLoading(false)
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
                    {filteredCategories.map((category) => (
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
          <TransactionsTab
            userId={userId!}
            categories={categories}
            transactions={filteredTransactions}
            setTransactions={setTransactions}
          />
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
