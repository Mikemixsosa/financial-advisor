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
  

  export const updateCategory = async (category: { id: string; nombre: string; tipo: string }) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: category.nombre,
          tipo: category.tipo,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar categoría');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw new Error('Error al actualizar categoría');
    }
  };
  
  export const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar categoría');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw new Error('Error al eliminar categoría');
    }
  };