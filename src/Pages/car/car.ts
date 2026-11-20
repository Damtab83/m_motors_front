import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimeoutError, map, timeout } from 'rxjs';
import { CarService } from '../../app/services/car/car-service';
import { CarModel } from '../../app/models/car-model';
import { DocumentService } from '../../app/services/document/document-service';
import { DocumentModel } from '../../app/models/document-model';

@Component({
  selector: 'app-car',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './car.html',
  styleUrl: './car.css',
})
export class Car implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly carService = inject(CarService);
  private readonly documentService = inject(DocumentService);

  protected readonly car = signal<CarModel | null>(null);
  protected readonly carId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly documentDownloading = signal(false);
  protected readonly documentError = signal('');
  protected readonly documentSuccess = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam === null ? Number.NaN : Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      return;
    }

    this.carId.set(id);
    this.carService
      .getCarById(id)
      .pipe(timeout({ first: 15_000 }))
      .subscribe({
        next: (car) => {
          this.car.set(car);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.car.set(null);
          this.errorMessage.set(
            error instanceof TimeoutError
              ? 'Le chargement prend trop de temps. Vérifiez votre connexion puis réessayez.'
              : 'Impossible de charger cette voiture.',
          );
          this.loading.set(false);
        },
      });
  }

  protected downloadDocument(): void {
    this.documentError.set('');
    this.documentSuccess.set('');
    this.documentDownloading.set(true);
    this.documentService
      .getDocumentById(1)
      .pipe(map((document) => this.createPdfBlob(document)))
      .subscribe({
        next: ({ blob, filename }) => {
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
          this.documentDownloading.set(false);
          this.documentSuccess.set('Le téléchargement du PDF a commencé.');
        },
        error: () => {
          this.documentDownloading.set(false);
          this.documentError.set('Impossible de télécharger le PDF. Réessayez.');
        },
      });
  }

  private createPdfBlob(document: DocumentModel): { blob: Blob; filename: string } {
    const dataUrlMatch = /^data:([^;,]+)?;base64,(.*)$/s.exec(document.contenu);
    const base64Content = dataUrlMatch ? dataUrlMatch[2] : document.contenu;
    const binaryContent = atob(base64Content);
    const bytes = Uint8Array.from(binaryContent, (character) => character.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: document.mimeType || dataUrlMatch?.[1] || 'application/pdf',
    });

    return {
      blob,
      filename: document.name || 'document-1.pdf',
    };
  }
}
