import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportTrimesterService } from '../services/report/report-trimester.service';
import Swal from 'sweetalert2';
import { ReportModalComponent } from './report-modal/report-modal.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReportModalComponent],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  @ViewChild(ReportModalComponent) reportModal: ReportModalComponent | undefined;
  searchYear: number | null = null; // Inicializa como null
  reports: any[] = [];
  filteredReports: any[] = [];
  selectedTrimester: string = 'Enero-Marzo';
  selectedStatus: string = 'A';
  loading: boolean = false;

  constructor(private reportService: ReportTrimesterService) { }

  ngOnInit() {
    this.loadReports();
  }

  // En el método loadReports, después de cargar los reportes
  loadReports() {
    this.loading = true; // Mostrar spinner
    this.reportService.listReportsByFilter(this.selectedTrimester, this.selectedStatus).subscribe(
      (data: any[]) => {
        console.log('Datos recibidos del servicio:', data);
        this.reports = data.sort((a, b) => b.report.id - a.report.id);
        this.filteredReports = this.reports; // Inicialmente, todos los reportes

        this.loading = false; // Ocultar spinner
      },
      (error) => {
        console.error('Error al cargar los reportes:', error);
        this.loading = false; // Ocultar spinner en caso de error
      }
    );
  }

  // Método para filtrar reportes por año
  onYearSearch(event: Event) {
    const input = event.target as HTMLInputElement; // Asegura que sea un HTMLInputElement
    this.searchYear = input.value ? parseInt(input.value) : null; // Convierte a número o null
    this.filterReports(); // Llama al método de filtrado
  }

  // Método para filtrar los reportes
  filterReports() {
    this.filteredReports = this.reports.filter(report => {
      if (this.searchYear) {
        const searchYearStr = this.searchYear.toString();
        return report.report.year.toString().includes(searchYearStr);
      }
      return true; // Si no hay búsqueda, mostrar todos
    });
  }

  onFilterChange() {
    const trimesterSelect = document.getElementById('selectTrimester') as HTMLSelectElement;
    const statusSelect = document.getElementById('selectStatus') as HTMLSelectElement;

    this.selectedTrimester = trimesterSelect.value;
    this.selectedStatus = statusSelect.value;

    this.loadReports(); // Cargar reportes filtrados
  }

  editReport(reportId: number) {
    // Mostrar el Swal de carga
    Swal.fire({
      title: "Cargando datos...",
      text: "Por favor espera mientras se traen los datos del reporte.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    this.reportService.getReportById(reportId).subscribe((data) => {
      // Cerrar el Swal de carga
      Swal.close(); // Cerrar el Swal de carga
      this.openEditModal(data);
    }, (error) => {
      // Cerrar el Swal de carga en caso de error
      Swal.close(); // Cerrar el Swal de carga
      Swal.fire({
        icon: 'error',
        title: 'Error al Cargar',
        text: 'Hubo un error al cargar los datos del reporte. Inténtalo de nuevo.',
        confirmButtonText: 'Aceptar'
      });
    });
  }

  openEditModal(report: any) {
    // Aquí puedes abrir el modal y pasar los datos del reporte
    this.reportModal?.setReportData(report);
  }

  // Confirmación para eliminar un reporte
  delete(Id: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar el reporte?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, elimínalo!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar el Swal de carga
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espera mientras se elimina el reporte.',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
        });

        this.deleteReport(Id);
      }
    });
  }

  deleteReport(reportId: number) {
    this.reportService.disableReportById(reportId).subscribe(() => {
      Swal.close(); // Cerrar el Swal de carga
      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Su reporte ha sido eliminado.',
        confirmButtonText: 'Aceptar'
      });
      this.loadReports(); // Recargar la lista de reportes
    }, (error) => {
      Swal.close(); // Cerrar el Swal de carga en caso de error
      Swal.fire({
        icon: 'error',
        title: 'Error al Eliminar',
        text: 'Hubo un error al eliminar el reporte. Inténtalo de nuevo.',
        confirmButtonText: 'Aceptar'
      });
    });
  }


  // Confirmación para activar/restaurar un reporte
  restore(Id: number) {
    Swal.fire({
      title: '¿Estás seguro de restaurar el reporte?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restauralo!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar el Swal de carga
        Swal.fire({
          title: 'Restaurando...',
          text: 'Por favor espera mientras se restaura el reporte.',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
        });

        this.restoreReport(Id);
      }
    });
  }

  restoreReport(reportId: number) {
    this.reportService.activateReportById(reportId).subscribe(() => {
      Swal.close(); // Cerrar el Swal de carga
      Swal.fire({
        icon: 'success',
        title: '¡Restaurado!',
        text: 'Su reporte ha sido restaurado.',
        confirmButtonText: 'Aceptar'
      });
      this.loadReports(); // Recargar la lista de reportes
    }, (error) => {
      Swal.close(); // Cerrar el Swal de carga en caso de error
      Swal.fire({
        icon: 'error',
        title: 'Error al Restaurar',
        text: 'Hubo un error al restaurar el reporte. Inténtalo de nuevo.',
        confirmButtonText: 'Aceptar'
      });
    });
  }

  pdfReport(reportId: number) {
    console.log('Descargar en PDF reporte con ID:', reportId);
  }

  onReportSaved() {
    this.loadReports(); // Recargar reportes después de guardar uno nuevo
  }
}
