import { Component, OnInit, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminNavBar, AdminSection } from '../../../Components/admin-nav-bar/admin-nav-bar';
import { CustomDetails } from '../../custom-details/custom-details';
import { CarModel } from '../../../app/models/car-model';
import { UserModel } from '../../../app/models/user-model';
import { CarService } from '../../../app/services/car/car-service';
import { DocumentService } from '../../../app/services/document/document-service';
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
    this.selectedSection.set(section);

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

  protected saveCar(car: CarModel): void {
    const currentCar = this.editingCar();
    if (currentCar) {
      if (currentCar.carId === undefined) {
        this.carEditorError.set('Impossible de modifier cette voiture : identifiant manquant.');
        return;
      }

      this.persistCar(this.carService.updateCar(currentCar.carId, car), currentCar);
      return;
    }

    this.persistCar(this.carService.createCar(car), null);
  }

  private persistCar(request: Observable<CarModel>, currentCar: CarModel | null): void {
    this.carEditorError.set('');
    this.carEditorSaving.set(true);
    request.subscribe({
      next: (savedCar) => {
        const carToStore = currentCar
          ? { ...savedCar, carId: currentCar.carId }
          : savedCar;
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
      error: () => {
        this.carEditorError.set('Impossible d’enregistrer la voiture. Réessayez.');
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
