// TransactionsTab.tsx

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2 } from 'lucide-react'
import { Transaction, Category } from './financedashboardcomponents/financedashboardtypes'
import { format } from 'date-fns'
import { addTransaction, updateTransaction, deleteTransaction } from './financedashboardcomponents/transactionsApiServices'

interface TransactionsTabProps {
  userId: string
  categories: Category[]
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}

export function TransactionsTab({ userId, categories, transactions, setTransactions }: TransactionsTabProps) {
  const [newTransaction, setNewTransaction] = useState({
    descripcion: '',
    monto: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'Gasto' as 'Ingreso' | 'Gasto',
    categoria: '',
  })
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories.filter(category => category.tipo === 'Gasto'))
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)

  // Manejar el cambio de tipo de transacción
  const handleTransactionTypeChange = (tipo: 'Ingreso' | 'Gasto') => {
    setNewTransaction({ ...newTransaction, tipo, categoria: '' })
    setFilteredCategories(categories.filter(category => category.tipo === tipo))
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Encontrar la categoría seleccionada y obtener su `id`
      const selectedCategory = categories.find((cat) => cat.nombre === newTransaction.categoria);
      if (!selectedCategory) {
        console.error('Categoría no encontrada');
        return;
      }

      // Crear el objeto de transacción con el `categoria_id` en lugar del nombre de la categoría
      const transactionData = {
        descripcion: newTransaction.descripcion,
        monto: parseFloat(newTransaction.monto), // Asegurarse de que `monto` sea numérico
        fecha: newTransaction.fecha,
        tipo: newTransaction.tipo,
        categoria_id: selectedCategory.id, // Usar el id de la categoría
      };

      const addedTransaction = await addTransaction(transactionData); // Llamada a la API
      setTransactions([...transactions, addedTransaction]); // Actualizar lista de transacciones

      // Resetear el formulario después de agregar
      setNewTransaction({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd'), tipo: 'Gasto', categoria: '' });
      setFilteredCategories(categories.filter(category => category.tipo === 'Gasto'));
    } catch (error: any) {
      console.error('Error al agregar transacción:', error);
    }
  };


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
    }
  }

  return (
    <>
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
            {transactions.map((transaction) => (
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
                            value={editingTransaction?.tipo}
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
                            value={editingTransaction?.categoria}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.filter(category => category.tipo === editingTransaction?.tipo).map((category) => (
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
    </>
  )
}
