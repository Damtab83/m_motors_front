import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable, TimeoutError, map, of, switchMap, timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminNavBar, AdminSection } from '../../../Components/admin-nav-bar/admin-nav-bar';
import { CarEditorSubmission, CustomDetails } from '../../custom-details/custom-details';
import { CarModel } from '../../../app/models/car-model';
import { UserModel } from '../../../app/models/user-model';
import { CarService } from '../../../app/services/car/car-service';
import { DocumentService } from '../../../app/services/document/document-service';
import { ImageCarService } from '../../../app/services/imageCar/image-car-service';
import { TestDriveService } from '../../../app/services/test-drive/test-drive-service';
import { UserService } from '../../../app/services/user/user-service';

@Component({
  selector: 'app-admin-panel',
  imports: [AdminNavBar, CustomDetails, MatButtonModule, MatIconModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private readonly userService = inject(UserService);
  private readonly carService = inject(CarService);
  private readonly documentService = inject(DocumentService);
  private readonly imageCarService = inject(ImageCarService);
  private readonly testDriveService = inject(TestDriveService);

  protected readonly selectedSection = signal<AdminSection>('users');
  protected readonly users = signal<UserModel[]>([]);
  protected readonly cars = signal<CarModel[]>([]);
  protected readonly selectedUser = signal<UserModel | null>(null);
  protected readonly selectedCar = signal<CarModel | null>(null);
  protected readonly carEditorOpen = signal(false);
  protected readonly editingCar = signal<CarModel | null>(null);
  protected readonly carEditorSaving = signal(false);
  protected readonly carEditorError = signal('');
  protected readonly usersLoading = signal(true);
  protected readonly carsLoading = signal(false);
  protected readonly usersError = signal('');
  protected readonly carsError = signal('');
  protected readonly documentFormOpen = signal(false);
  protected readonly selectedDocument = signal<File | null>(null);
  protected readonly documentUploading = signal(false);
  protected readonly documentError = signal('');
  protected readonly documentSuccess = signal('');
  protected readonly testDriveFormOpen = signal(false);
  protected readonly testDate = signal('');
  protected readonly testDriveSaving = signal(false);
  protected readonly testDriveError = signal('');
  protected readonly testDriveSuccess = signal('');
  private carsLoaded = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  protected selectSection(section: AdminSection): void {
    if (this.carEditorSaving()) {
      return;
    }

    this.selectedSection.set(section);
    this.closeCarForm();
    this.closeCustomerDetails();

    if (section === 'cars' && !this.carsLoaded) {
      this.loadCars();
    }
  }

  protected openCustomerDetails(user: UserModel): void {
    this.selectedUser.set(user);

    if (this.cars().length === 0) {
      this.selectedCar.set(null);
      return;
    }

    const userIndex = this.users().indexOf(user);
    const selectedCarIndex = userIndex >= 0 ? userIndex % this.cars().length : 0;
    this.selectedCar.set(this.cars()[selectedCarIndex] ?? null);
  }

  protected closeCustomerDetails(): void {
    this.selectedUser.set(null);
    this.selectedCar.set(null);
  }

  protected openNewCarForm(): void {
    this.editingCar.set(null);
    this.carEditorError.set('');
    this.carEditorOpen.set(true);
  }

  protected openEditCarForm(car: CarModel): void {
    this.editingCar.set(car);
    this.carEditorError.set('');
    this.carEditorOpen.set(true);
  }

  protected closeCarForm(): void {
    if (this.carEditorSaving()) {
      return;
    }

    this.carEditorOpen.set(false);
    this.editingCar.set(null);
    this.carEditorError.set('');
  }

  protected openDocumentForm(): void {
    this.selectedDocument.set(null);
    this.documentError.set('');
    this.documentSuccess.set('');
    this.documentFormOpen.set(true);
  }

  protected closeDocumentForm(): void {
    if (this.documentUploading()) {
      return;
    }

    this.documentFormOpen.set(false);
    this.selectedDocument.set(null);
    this.documentError.set('');
  }

  protected selectDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.documentError.set('');
    this.documentSuccess.set('');

    if (file && file.type !== 'application/pdf') {
      this.selectedDocument.set(null);
      this.documentError.set('Le fichier doit être au format PDF.');
      input.value = '';
      return;
    }

    this.selectedDocument.set(file);
  }

  protected uploadDocument(): void {
    const file = this.selectedDocument();
    if (!file || this.documentUploading()) {
      return;
    }

    this.documentError.set('');
    this.documentSuccess.set('');
    this.documentUploading.set(true);
    this.documentService.uploadDocument(file).subscribe({
      next: () => {
        this.documentUploading.set(false);
        this.documentFormOpen.set(false);
        this.selectedDocument.set(null);
        this.documentSuccess.set('Le document PDF a été téléversé.');
      },
      error: () => {
        this.documentUploading.set(false);
        this.documentError.set('Impossible de téléverser le document. Réessayez.');
      },
    });
  }

  protected openTestDriveForm(): void {
    this.testDate.set('');
    this.testDriveError.set('');
    this.testDriveSuccess.set('');
    this.testDriveFormOpen.set(true);
  }

  protected closeTestDriveForm(): void {
    if (this.testDriveSaving()) {
      return;
    }

    this.testDriveFormOpen.set(false);
    this.testDate.set('');
    this.testDriveError.set('');
  }

  protected saveTestDrive(): void {
    const testDate = this.testDate();
    if (!testDate || this.testDriveSaving()) {
      this.testDriveError.set('Veuillez sélectionner une date.');
      return;
    }

    this.testDriveError.set('');
    this.testDriveSuccess.set('');
    this.testDriveSaving.set(true);
    this.testDriveService.createTestDrive({ testDate, confirmed: false }).subscribe({
      next: () => {
        this.testDriveSaving.set(false);
        this.testDriveFormOpen.set(false);
        this.testDate.set('');
        this.testDriveSuccess.set('La date d’essai a été enregistrée.');
      },
      error: () => {
        this.testDriveSaving.set(false);
        this.testDriveError.set('Impossible d’enregistrer la date d’essai. Réessayez.');
      },
    });
  }

  protected updateTestDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.testDate.set(input.value);
    this.testDriveError.set('');
  }

  protected saveCar(submission: CarEditorSubmission): void {
    const car = submission.car;
    const currentCar = this.editingCar();
    if (currentCar) {
      if (currentCar.carId === undefined) {
        this.carEditorError.set('Impossible de modifier cette voiture : identifiant manquant.');
        return;
      }

      this.persistCar(this.carService.updateCar(currentCar.carId, car), currentCar, submission);
      return;
    }

    this.persistCar(this.carService.createCar(car), null, submission);
  }

  private persistCar(
    request: Observable<CarModel>,
    currentCar: CarModel | null,
    submission: CarEditorSubmission,
  ): void {
    this.carEditorError.set('');
    this.carEditorSaving.set(true);
    request.pipe(
      switchMap((savedCar) => {
        const carId = savedCar.carId ?? currentCar?.carId;
        if (submission.imageFile) {
          if (carId === undefined) {
            throw new Error('The saved car response did not include a car ID.');
          }

          return this.imageCarService.uploadImage(submission.imageFile, carId).pipe(
            switchMap((uploadedImage) => {
              if (uploadedImage.imageCarId === undefined) {
                throw new Error('The image upload response did not include an image ID.');
              }

              const removeOldImage =
                currentCar?.imageCarId !== undefined &&
                currentCar.imageCarId !== uploadedImage.imageCarId;
              const oldImageId = removeOldImage ? currentCar?.imageCarId : undefined;
              const deleteOldImage = oldImageId !== undefined
                ? this.imageCarService.deleteImage(oldImageId)
                : of(undefined);
              return deleteOldImage.pipe(
                map(() => ({ savedCar, uploadedImage })),
              );
            }),
          );
        }

        if (submission.removeImage && submission.imageCarId !== undefined) {
          return this.imageCarService.deleteImage(submission.imageCarId).pipe(
            map(() => ({ savedCar, uploadedImage: null })),
          );
        }

        if (submission.removeImage) {
          throw new Error('The image ID is unavailable; the existing image cannot be deleted.');
        }

        return of({ savedCar, uploadedImage: null });
      }),
      timeout({ first: 45_000 }),
    ).subscribe({
      next: ({ savedCar, uploadedImage }) => {
        const uploadedData = submission.imageFile
          ? submission.imagePreview
          : uploadedImage?.imageData && uploadedImage.contentType
            ? `data:${uploadedImage.contentType};base64,${uploadedImage.imageData}`
            : undefined;
        const carToStore: CarModel = {
          ...savedCar,
          carId: currentCar?.carId ?? savedCar.carId,
          ...(uploadedImage
            ? {
                imageCarId: uploadedImage.imageCarId,
                imageCar: uploadedData,
              }
            : submission.removeImage
              ? { imageCarId: undefined, imageCar: null }
              : currentCar
                ? {
                    imageCarId: currentCar.imageCarId,
                    imageCar: currentCar.imageCar,
                  }
                : {}),
        };
        this.cars.update((cars) =>
          currentCar
            ? cars.map((existingCar) =>
                existingCar.carId === currentCar.carId ? carToStore : existingCar,
              )
            : [...cars, carToStore],
        );
        this.carsError.set('');
        this.carsLoaded = true;
        this.carEditorSaving.set(false);
        this.closeCarForm();
      },
      error: (error: unknown) => {
        this.carEditorError.set(error instanceof TimeoutError
          ? 'Le serveur met trop de temps à répondre. Vérifiez votre connexion puis réessayez.'
          : error instanceof Error && error.message.includes('image ID')
            ? 'Impossible de supprimer cette image car son identifiant est indisponible. Rechargez les images depuis le serveur.'
            : 'La voiture ou son image n’a pas pu être enregistrée. Vérifiez la connexion puis réessayez.');
        this.carEditorSaving.set(false);
      },
    });
  }

  protected deleteCar(): void {
    const car = this.editingCar();
    if (!car || car.carId === undefined) {
      this.carEditorError.set('Impossible de supprimer cette voiture : identifiant manquant.');
      return;
    }

    if (!globalThis.confirm(`Supprimer ${car.brand} ${car.model} ?`)) {
      return;
    }

    this.carEditorError.set('');
    this.carEditorSaving.set(true);
    this.carService.deleteCar(car.carId).subscribe({
      next: () => {
        this.cars.update((cars) => cars.filter((existingCar) => existingCar.carId !== car.carId));
        this.carsError.set('');
        this.carEditorSaving.set(false);
        this.closeCarForm();
      },
      error: () => {
        this.carEditorError.set('Impossible de supprimer la voiture. Réessayez.');
        this.carEditorSaving.set(false);
      },
    });
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: () => {
        this.usersError.set('Impossible de charger les utilisateurs.');
        this.usersLoading.set(false);
      },
    });
  }

  private loadCars(): void {
    this.carsLoading.set(true);
    this.carService.getAllCars().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.carsLoaded = true;
        this.carsLoading.set(false);
      },
      error: () => {
        this.carsError.set('Impossible de charger les voitures.');
        this.carsLoading.set(false);
      },
    });
  }
}
