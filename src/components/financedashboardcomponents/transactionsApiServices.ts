import { Transaction } from './financedashboardtypes';

const BASE_URL = 'https://fa-app-worker.cobijona.workers.dev';

// Función para obtener el token de autenticación desde el localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Función para realizar peticiones autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    // Token expirado o inválido, redirigir al login
    localStorage.removeItem('authToken');
    window.location.href = '/auth/login';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }
  return response;
};

// Función para obtener transacciones
export const fetchTransactions = async () => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/transacciones`);
    if (!response.ok) throw new Error('Error al obtener transacciones');
    return await response.json();
  } catch (error) {
    throw new Error('Error al obtener transacciones');
  }
};

// Función para agregar una nueva transacción
export const addTransaction = async (transaction: { descripcion: string; monto: number; tipo: string; categoria_id: number }) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/transacciones`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error('Error al agregar transacción');
    return await response.json();
  } catch (error) {
    throw new Error('Error al agregar transacción');
  }
};

// Función para actualizar una transacción existente
export const updateTransaction = async (transaction: Transaction) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/transacciones`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar transacción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    throw new Error('Error al actualizar transacción');
  }
};

// Función para eliminar una transacción
export const deleteTransaction = async (transactionId: number) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/transacciones`, {
      method: 'DELETE',
      body: JSON.stringify({ id: transactionId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar transacción');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    throw new Error('Error al eliminar transacción');
  }
};
