import { NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await dbPromise;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Se requiere el ID del usuario' }, { status: 400 });
    }

    const categories = await db.all('SELECT * FROM categorias WHERE usuario_id = ?', userId);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const db = await dbPromise;
      const { nombre, tipo, usuario_id } = await request.json();
  
      if (!nombre || !tipo || !usuario_id) {
        return NextResponse.json({ error: 'Se requieren nombre, tipo y usuario_id' }, { status: 400 });
      }
  
      const result = await db.run(
        'INSERT INTO categorias (nombre, tipo, usuario_id) VALUES (?, ?, ?)',
        [nombre, tipo, usuario_id]
      );
  
      const newCategory = await db.get('SELECT * FROM categorias WHERE id = ?', result.lastID);
  
      return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
    }
  }

  