import { NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await dbPromise;
    const transaction = await db.get('SELECT t.*, c.nombre as categoria_nombre FROM transacciones t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.id = ?', params.id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    return NextResponse.json({ error: 'Error al obtener transacción' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await dbPromise;
    const { descripcion, monto, fecha, tipo, categoria_id } = await request.json();

    if (!descripcion || !monto || !fecha || !tipo || !categoria_id) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    await db.run(
      'UPDATE transacciones SET descripcion = ?, monto = ?, fecha = ?, tipo = ?, categoria_id = ? WHERE id = ?',
      [descripcion, monto, fecha, tipo, categoria_id, params.id]
    );

    const updatedTransaction = await db.get('SELECT t.*, c.nombre as categoria_nombre FROM transacciones t LEFT JOIN categorias c ON t.categoria_id = c.id WHERE t.id = ?', params.id);

    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    return NextResponse.json({ error: 'Error al actualizar transacción' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await dbPromise;
    const result = await db.run('DELETE FROM transacciones WHERE id = ?', params.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transacción eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    return NextResponse.json({ error: 'Error al eliminar transacción' }, { status: 500 });
  }
}