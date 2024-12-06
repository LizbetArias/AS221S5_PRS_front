import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReportTrimesterService } from '../../services/report/report-trimester.service';
import * as bootstrap from 'bootstrap'; // Importar Bootstrap

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent {
  modalTitle: string = 'Nuevo Reporte Trimestral'; // Título por defecto
  @Output() reportSaved = new EventEmitter<void>(); // Evento para notificar que se guardó el reporte
  // Formulario principal para el reporte
  reporteForm: FormGroup;
  // Opciones de trimestres disponibles
  trimestres = ['Enero-Marzo', 'Abril-Junio', 'Julio-Septiembre', 'Octubre-Diciembre'];
  // Arreglo para almacenar las imágenes de los talleres
  imagenesTalleres: File[][] = [];
  cronograma: File | null = null; // Almacena el archivo del cronograma
  cronogramaError: string | null = null; // Mensaje de error en caso de archivo inválido
  isEditMode: boolean = false; // Para determinar si estamos en modo edición
  currentReportId: number | null = null; // ID del reporte actual

  constructor(private fb: FormBuilder, private reportService: ReportTrimesterService) {
    // Inicialización del formulario reactivo
    this.reporteForm = this.fb.group({
      trimestre: ['', Validators.required], // Trimestre (obligatorio)
      year: ['', [Validators.required]], // Año (obligatorio y dentro del rango válido)
      descripcion: ['', Validators.required], // Descripción (obligatorio)
      talleres: this.fb.array([]) // Arreglo dinámico de talleres
    });
  }

  // Función para validar el archivo del cronograma
  validarCronograma(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;

    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2 MB
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

      // Verificar el tipo de archivo
      if (!validImageTypes.includes(file.type)) {
        this.cronogramaError = 'El archivo debe ser una imagen (JPEG, PNG, GIF)';
        this.cronograma = null;
        input.value = '';
        Swal.fire({
          icon: 'error',
          title: 'Archivo Inválido',
          text: 'Por favor, selecciona una imagen válida (JPEG, PNG, GIF).',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Verificar el tamaño del archivo
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo Demasiado Grande',
          text: 'El archivo debe ser menor de 2 MB.',
          confirmButtonText: 'Aceptar'
        });
        this.cronograma = null;
        input.value = '';
        return;
      }

      this.cronograma = file;
      this.cronogramaError = null;
    }
  }

  // Función para visualizar el cronograma en una ventana emergente
  verCronograma(): void {
    if (this.cronograma) {
      const reader = new FileReader();
      reader.onload = (event) => {
        Swal.fire({
          title: "Vista Previa del Cronograma",
          imageUrl: event.target?.result as string,
          imageAlt: "Cronograma",
        });
      };
      reader.readAsDataURL(this.cronograma);
    }
  }

  get talleres(): FormArray {
    return this.reporteForm.get('talleres') as FormArray;
  }

  getTallerFormGroup(index: number): FormGroup {
    return this.talleres.at(index) as FormGroup;
  }

  agregarTaller(): void {
    const tallerForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [null],
      imagenes: [[]]
    });
    this.talleres.push(tallerForm);
    this.imagenesTalleres.push([]);
  }

  eliminarTaller(index: number): void {
    this.talleres.removeAt(index);
    this.imagenesTalleres.splice(index, 1);
  }

  imageError: string | null = null;

  cargarImagenes(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const invalidFiles = files.filter(file => !validImageTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        this.imageError = 'Solo se pueden cargar imágenes en formato JPEG, PNG o GIF.';
        input.value = '';
        Swal.fire({
          icon: 'error',
          title: 'Archivo Inválido',
          text: 'Por favor, selecciona una imagen válida (JPEG, PNG, GIF).',
          confirmButtonText: 'Entendido'
        });
      } else {
        this.imagenesTalleres[index] = files;
        this.talleres.at(index).get('imagenes')?.setValue(this.imagenesTalleres[index]);
        this.imageError = null;
      }
    }
  }

  verImagenTaller(imagen: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      Swal.fire({
        title: imagen.name,
        imageUrl: event.target?.result as string,
        imageAlt: "Imagen del Taller",
      });
    };
    reader.readAsDataURL(imagen);
  }

  async guardarReporte(): Promise<void> {
    Swal.fire({
      title: "Guardando reporte...",
      text: "Por favor espera.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
    });
    if (this.reporteForm.valid) {
      const { year, trimestre, descripcion } = this.reporteForm.value;
      // Promesas para procesar cada taller y sus imágenes
      const reportDetailsPromises = this.talleres.controls.map(taller => {
        const { nombre, descripcion: desc, imagenes } = taller.value;
        const imgPromises = imagenes.map((file: File) => this.convertToBase64(file));
        return Promise.all(imgPromises).then(imgBase64 => ({
          workshop: nombre,
          description: desc,
          img: imgBase64
        }));
      });
      try {
        // Esperar a que todos los talleres se procesen
        const reportDetails = await Promise.all(reportDetailsPromises);
        const reporteData = {
          report: {
            year,
            trimester: trimestre,
            description: descripcion,
            schedule: this.cronograma ? await this.convertToBase64(this.cronograma) : null
          },
          reportDetails
        };
        if (this.isEditMode) {
          // Lógica para actualizar un reporte existente
          this.reportService.updateReportById(this.currentReportId!, reporteData).subscribe({
            next: () => {
              Swal.close(); // Cerrar el Swal de carga
              Swal.fire({
                icon: 'success',
                title: 'Reporte Actualizado',
                text: 'El reporte se ha actualizado exitosamente.',
                confirmButtonText: 'Aceptar'
              });
              this.reportSaved.emit(); // Emitir evento para indicar el guardado
              this.reiniciarValidacion();
              this.closeModal();
            },
            error: (error) => {
              Swal.close(); // Cerrar el Swal de carga
              console.error('Error al actualizar el reporte:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error al Actualizar',
                text: 'Hubo un error al actualizar el reporte. Inténtalo de nuevo.',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        } else {
          // Lógica para crear un nuevo reporte
          this.reportService.newReport(reporteData).subscribe({
            next: () => {
              Swal.close(); // Cerrar el Swal de carga
              Swal.fire({
                icon: 'success',
                title: 'Reporte Creado',
                text: 'El reporte se ha creado exitosamente.',
                confirmButtonText: 'Aceptar'
              });
              this.reportSaved.emit(); // Emitir evento para indicar el guardado
              this.reiniciarValidacion();
              this.closeModal();
            },
            error: (error) => {
              Swal.close(); // Cerrar el Swal de carga
              console.error('Error al crear el reporte:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error al Crear',
                text: 'Hubo un error al crear el reporte. Inténtalo de nuevo.',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        }
      } catch (error) {
        Swal.close(); // Cerrar el Swal de carga
        console.error('Error procesando los datos del reporte:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error Interno',
          text: 'Hubo un error al procesar los datos. Inténtalo de nuevo.',
          confirmButtonText: 'Aceptar'
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Inválido',
        text: 'Por favor, completa todos los campos requeridos.',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          const base64String = reader.result.toString();
          resolve(base64String);
        } else {
          reject('No se pudo leer el archivo');
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  reiniciarValidacion(): void {
    this.reporteForm.reset(); // Reinicia el formulario
    this.cronograma = null; // Limpia el archivo del cronograma
    this.cronogramaError = null; // Limpia cualquier mensaje de error
    this.imagenesTalleres = []; // Reinicia las imágenes de los talleres
    this.talleres.clear(); // Limpia el FormArray de talleres
    this.isEditMode = false; // Reinicia el estado de edición
    this.currentReportId = null; // Reinicia el ID del reporte actual

    // Limpiar el input del cronograma manualmente
    const cronogramaInput = document.getElementById('cronograma') as HTMLInputElement;
    if (cronogramaInput) {
      cronogramaInput.value = ''; // Limpia el campo de entrada
    }
  }

  onModalShown(): void {
    const firstInput = document.querySelector('input, select, textarea');
    if (firstInput) {
      (firstInput as HTMLElement).focus();
    }
  }

  setReportData(report: any) {
    this.isEditMode = true; // Establece el modo de edición
    this.currentReportId = report.report.id;
    this.modalTitle = 'Editando Reporte Trimestral';
    this.openModal(); // Guarda el ID del reporte actual

    this.reporteForm.patchValue({
      trimestre: report.report.trimester,
      year: report.report.year,
      descripcion: report.report.description,
    });

    // Limpiar el FormArray y las imágenes antes de agregar los nuevos datos
    this.talleres.clear();
    this.imagenesTalleres = []; // Reiniciar el arreglo de imágenes

    report.reportDetails.forEach((detail: any) => { // Especificar el tipo 'any'
      const tallerForm = this.fb.group({
        nombre: [detail.workshop, Validators.required],
        descripcion: [detail.description],
        imagenes: [[]]
      });
      this.talleres.push(tallerForm);

      // Convertir las imágenes de base64 a objetos File
      const files = detail.img.map((imgBase64: string) => this.convertBase64ToFile(imgBase64));
      this.imagenesTalleres.push(files); // Almacenar los archivos convertidos

      // Cargar las imágenes en el formGroup
      if (files.length > 0) {
        tallerForm.get('imagenes')?.setValue(files);
      }
    });

    // Manejo del cronograma
    if (report.report.schedule) {
      this.cronograma = this.convertBase64ToFile(report.report.schedule);
    } else {
      this.cronograma = null; // Si no hay cronograma, establecer a null
    }
  }

  convertBase64ToFile(base64: string): File | null {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const byteString = atob(arr[1]);
    const ab = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ab[i] = byteString.charCodeAt(i);
    }
    return new File([ab], 'imagen.png', { type: mime || 'application/octet-stream' });
  }


  closeModal() {
    const modal = document.getElementById('staticBackdrop');
    if (modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      bootstrapModal?.hide(); // Oculta el modal
    }
    // Elimina manualmente el fondo si persiste
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.remove();
    });
  }

  openModal() {
    // Usa Bootstrap o cualquier otra librería para mostrar el modal
    const modalElement = document.getElementById('staticBackdrop');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
