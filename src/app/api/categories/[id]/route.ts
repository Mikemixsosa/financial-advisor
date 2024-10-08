import { NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await dbPromise;
    const category = await db.get('SELECT * FROM categorias WHERE id = ?', params.id);
    
    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await dbPromise;
    const { nombre, tipo } = await request.json();

    if (!nombre || !tipo) {
      return NextResponse.json({ error: 'Se requieren nombre y tipo' }, { status: 400 });
    }

    await db.run(
      'UPDATE categorias SET nombre = ?, tipo = ? WHERE id = ?',
      [nombre, tipo, params.id]
    );

    const updatedCategory = await db.get('SELECT * FROM categorias WHERE id = ?', params.id);

    if (!updatedCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await dbPromise;
    const result = await db.run('DELETE FROM categorias WHERE id = ?', params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Categoría eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}