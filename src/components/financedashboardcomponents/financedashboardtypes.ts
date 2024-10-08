export type Transaction = {
    id: number
    descripcion: string
    monto: number
    fecha: string
    tipo: 'Ingreso' | 'Gasto'
    categoria: string
  }
  
 export type Category = {
    id: number
    nombre: string
    tipo: 'Ingreso' | 'Gasto'
  }
  
  export type DateRange = {
    from: Date | undefined
    to: Date | undefined
  }