import { NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await dbPromise;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
    }

    let query = 'SELECT t.*, c.nombre as categoria_nombre FROM transacciones t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.usuario_id = ?';
    const queryParams = [userId];

    if (fromDate && toDate) {
      query += ' AND t.fecha BETWEEN ? AND ?';
      queryParams.push(fromDate, toDate);
    }

    if (type && type !== 'Todos') {
      query += ' AND t.tipo = ?';
      queryParams.push(type);
    }

    if (category && category !== 'Todas') {
      query += ' AND c.nombre = ?';
      queryParams.push(category);
    }

    query += ' ORDER BY t.fecha DESC';

    const transactions = await db.all(query, ...queryParams);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const db = await dbPromise;
      const { descripcion, monto, fecha, tipo, categoria_id, usuario_id } = await request.json();
  
      if (!descripcion || !monto || !fecha || !tipo || !categoria_id || !usuario_id) {
        return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
      }
  
      const result = await db.run(
        'INSERT INTO transacciones (descripcion, monto, fecha, tipo, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
        [descripcion, monto, fecha, tipo, categoria_id, usuario_id]
      );
  
      const newTransaction = await db.get('SELECT t.*, c.nombre as categoria_nombre FROM transacciones t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.id = ?', result.lastID);
  
      return NextResponse.json(newTransaction, { status: 201 });
    } catch (error) {
      console.error('Error al crear transacción:', error);
      return NextResponse.json({ error: 'Error al crear transacción' }, { status: 500 });
    }
  }
  