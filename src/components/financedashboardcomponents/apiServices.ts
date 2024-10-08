// apiService.ts
export const fetchCategories = async (userId: string) => {
    try {
      const response = await fetch(`/api/categories?userId=${userId}`);
      if (!response.ok) throw new Error('Error al obtener categorías');
      return await response.json();
    } catch (error) {
      throw new Error('Error al obtener categorías');
    }
  };
  
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
  
  export const addCategory = async (category: any, userId: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: category.nombre,
          tipo: category.tipo,
          usuario_id: userId,
        }),
      });
  
      if (!response.ok) throw new Error('Error al agregar categoría');
      return await response.json();
    } catch (error) {
      throw new Error('Error al agregar categoría');
    }
  };
  