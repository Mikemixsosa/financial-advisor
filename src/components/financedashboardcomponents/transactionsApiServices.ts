import { Transaction } from './financedashboardtypes'

export const fetchTransactions = async (userId: string) => {
  try {
    const response = await fetch(`/api/transactions?userId=${userId}`);
    if (!response.ok) throw new Error('Error al obtener transacciones');
    return await response.json();
  } catch (error) {
    throw new Error('Error al obtener transacciones');
  }
};

export const addTransaction = async (transaction: any, userId: string, categories: any[]) => {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transaction,
        usuario_id: userId,
        categoria_id: categories.find(c => c.nombre === transaction.categoria)?.id
      }),
    });

    if (!response.ok) throw new Error('Error al agregar transacción');
    return await response.json();
  } catch (error) {
    throw new Error('Error al agregar transacción');
  }
};

export const updateTransaction = async (transaction: Transaction) => {
  try {
    const response = await fetch(`/api/transactions/${transaction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error('Error al actualizar transacción');
    return await response.json();
  } catch (error) {
    throw new Error('Error al actualizar transacción');
  }
};

export const deleteTransaction = async (transactionId: string) => {
  try {
    const response = await fetch(`/api/transactions/${transactionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error al eliminar transacción');
    return await response.json();
  } catch (error) {
    throw new Error('Error al eliminar transacción');
  }
};