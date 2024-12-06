export interface Report {
    id: number;                // ID único del reporte
    year: number;              // Año del reporte
    trimester: string;         // Trimestre del reporte (e.g., "Enero-Marzo")
    description: string;       // Descripción del reporte
    schedule?: string | null;  // Horario (opcional)
    active: String;         // Estado activo ('A') o inactivo ('I')
}