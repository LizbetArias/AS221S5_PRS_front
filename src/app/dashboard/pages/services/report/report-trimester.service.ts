import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportTrimesterService {
  reportActualizar = new Subject<any[]>();

  constructor(private http: HttpClient) { }

  // Método para obtener los reportes filtrados /OCULTA LAS IMAGENES ME LAS MUESTRA COMO NULL
  listReportsByFilter(trimester: string, active: string): Observable<any[]> {
    const url = `${environment.apiUrl}/api/reports?trimester=${encodeURIComponent(trimester)}&active=${encodeURIComponent(active)}`;
    return this.http.get<any[]>(url);
  }

  // Método para obtener un reporte por su ID / ME LISTA CON LAS IMAGENES
  getReportById(reportId: number): Observable<any> {
    const url = `${environment.apiUrl}/api/reports/${reportId}`;
    return this.http.get<any>(url);
  }
  // Método Listado total / ME LISTA CON LAS IMAGENES
  getallReport(): Observable<any> {
    const url = `${environment.apiUrl}/api/reports/all`;
    return this.http.get<any>(url);
  }

  // Insertar reporte
  newReport(newReport: any) {
    return this.http.post(`${environment.apiUrl}/api/reports`, newReport);
  }

  // Editar reporte
  updateReportById(reportId: number, updatedReport: any) {
    return this.http.put(`${environment.apiUrl}/api/reports/${reportId}`, updatedReport);
  }

  // Eliminar Reporte Lógicamente
  disableReportById(reportId: number) {
    return this.http.delete(`${environment.apiUrl}/api/reports/${reportId}`, {});
  }

  // Activar Reporte
  activateReportById(reportId: number) {
    return this.http.put(`${environment.apiUrl}/api/reports/restore/${reportId}`, {});
  }
}
