import { NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

// Método GET: Obtener todos los usuarios
export async function GET() {
  try {
    const db = await dbPromise;
    const usuarios = await db.all('SELECT * FROM usuarios');
    
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// Método POST: Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    const db = await dbPromise;
    const { firebase_uid, nombre, correo_electronico, rol } = await request.json();

    await db.run(
      'INSERT INTO usuarios (firebase_uid, nombre, correo_electronico, rol) VALUES (?, ?, ?, ?)',
      [firebase_uid, nombre, correo_electronico, rol]
    );

    return NextResponse.json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ message: 'Error al crear usuario' }, { status: 500 });
  }
}
