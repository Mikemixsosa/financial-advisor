const BASE_URL = 'https://fa-app-worker.cobijona.workers.dev';

// Función para obtener el token del localStorage
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

export const fetchCategories = async () => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/categorias`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    return await response.json();
  } catch (error) {
    throw new Error('Error al obtener categorías');
  }
};

export const addCategory = async (category: { nombre: string; tipo: string }) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/categorias`, {
      method: 'POST',
      body: JSON.stringify(category),
    });

    if (!response.ok) throw new Error('Error al agregar categoría');
    return await response.json();
  } catch (error) {
    throw new Error('Error al agregar categoría');
  }
};

export const updateCategory = async (id: string, updates: { nombre?: string; tipo?: string }) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/categorias`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) throw new Error('Error al actualizar categoría');
    return await response.json();
  } catch (error) {
    throw new Error('Error al actualizar categoría');
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/categorias`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error('Error al eliminar categoría');
  } catch (error) {
    throw new Error('Error al eliminar categoría');
  }
};