import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.resolve('./financial-advisor.sqlite'); // Ruta de la base de datos

// Función para inicializar la base de datos y crear tablas si es necesario
async function initializeDatabase() {
  // Verificar si el archivo de la base de datos ya existe
  try {
    await fs.access(DB_PATH);
    console.log('La base de datos ya existe.');
  } catch (error) {
    console.log('La base de datos no existe. Creando e inicializando...');
    
    // Si no existe el archivo, se creará y se inicializarán las tablas
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Crear tablas solo si el archivo no existía antes
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firebase_uid TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        correo_electronico TEXT UNIQUE NOT NULL,
        rol TEXT DEFAULT 'usuario',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        usuario_id INTEGER NOT NULL,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      );

      CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT,
        monto REAL NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tipo TEXT NOT NULL,
        categoria_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        FOREIGN KEY(categoria_id) REFERENCES categorias(id),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      );
    `);

    console.log('Base de datos y tablas inicializadas correctamente.');
    return db;
  }

  // Si la base de datos ya existe, simplemente la abrimos
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

// Exportar la promesa de la base de datos para usarla en otros archivos
const dbPromise = initializeDatabase();
export default dbPromise;
