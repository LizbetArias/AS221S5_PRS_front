export interface ReportDetail {
    id: number;                // ID único del detalle
    reportId: number;          // ID del reporte al que pertenece (relación)
    workshop: string;          // Nombre del taller
    description: string;       // Descripción del taller
    img: string[];             // Array de URLs de imágenes asociadas
}