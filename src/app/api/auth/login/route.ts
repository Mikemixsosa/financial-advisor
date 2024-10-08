import { NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function POST(request: Request) {
  try {
    const db = await dbPromise;
    const { firebase_uid } = await request.json();

    if (!firebase_uid) {
      return NextResponse.json({ error: 'Firebase UID es requerido' }, { status: 400 });
    }

    const usuario = await db.get('SELECT id, nombre, correo_electronico, rol FROM usuarios WHERE firebase_uid = ?', firebase_uid);

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Autenticación exitosa',
      user: usuario
    });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return NextResponse.json({ error: 'Error en la autenticación' }, { status: 500 });
  }
}