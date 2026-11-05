import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AdminPanel } from './admin-panel';
import { CarModel } from '../../../app/models/car-model';
import { CarService } from '../../../app/services/car/car-service';
import { DocumentService } from '../../../app/services/document/document-service';
import { TestDriveService, TestDriveRequest } from '../../../app/services/test-drive/test-drive-service';
import { UserService } from '../../../app/services/user/user-service';

describe('AdminPanel', () => {
  let component: AdminPanel;
  let fixture: ComponentFixture<AdminPanel>;
  let createdCar: CarModel | null;
  let updatedCar: CarModel | null;
  let deletedCarId: number | null;
  let uploadedDocument: File | null;
  let createdTestDrive: TestDriveRequest | null;
  const existingCar: CarModel = {
    carId: 1,
    brand: 'Mercedes',
    model: 'Classe A',
    motorisation: '150CV',
    kilometer: 12500,
    price: 25000,
    testDriving: false,
  };

  beforeEach(async () => {
    createdCar = null;
    updatedCar = null;
    deletedCarId = null;
    uploadedDocument = null;
    createdTestDrive = null;

    await TestBed.configureTestingModule({
      imports: [AdminPanel],
      providers: [
        {
          provide: UserService,
          useValue: { getAllUsers: () => of([]) },
        },
        {
          provide: CarService,
          useValue: {
            getAllCars: () => of([existingCar]),
            createCar: (car: CarModel) => {
              createdCar = car;
              return of({ ...car, carId: 2 });
            },
            updateCar: (id: number, car: CarModel) => {
              updatedCar = { ...car, carId: id };
              return of({ ...car, carId: id });
            },
            deleteCar: (id: number) => {
              deletedCarId = id;
              return of(existingCar);
            },
          },
        },
        {
          provide: DocumentService,
          useValue: {
            uploadDocument: (file: File) => {
              uploadedDocument = file;
              return of({});
            },
          },
        },
        {
          provide: TestDriveService,
          useValue: {
            createTestDrive: (testDrive: TestDriveRequest) => {
              createdTestDrive = testDrive;
              return of({});
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add, edit and delete cars from the cars section', async () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    buttons.find((button) => button.textContent.includes('Voitures'))?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.section-header button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ajouter une voiture');

    const fillCarForm = (overrides: Partial<Record<string, string>> = {}) => {
      const values = {
        brand: 'Ford',
        model: 'Mustang',
        motorisation: '200CV',
        kilometer: '45000',
        price: '38000',
        ...overrides,
      };
      for (const [name, value] of Object.entries(values)) {
        const input = fixture.nativeElement.querySelector(`[name="${name}"]`) as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    const submitCarForm = async () => {
      fixture.nativeElement.querySelector('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await fixture.whenStable();
      fixture.detectChanges();
    };

    fillCarForm();
    await submitCarForm();
    expect(createdCar?.brand).toBe('Ford');
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);

    const editButton = fixture.nativeElement.querySelector('[aria-label^="Modifier"]') as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();
    fillCarForm({ brand: 'Ford modifiée' });
    await submitCarForm();
    expect(updatedCar?.carId).toBe(1);
    expect(updatedCar?.brand).toBe('Ford modifiée');

    fixture.nativeElement.querySelector('[aria-label^="Modifier"]')?.click();
    fixture.detectChanges();
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const deleteButton = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find((button) => button.textContent.includes('Supprimer'));
    deleteButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deletedCarId).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('should upload a PDF document and reject other MIME types', async () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    buttons.find((button) => button.textContent.includes('Documents'))?.click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.section-header button').click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['not a PDF'], 'notes.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [invalidFile], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Le fichier doit être au format PDF.');

    const pdf = new File(['pdf'], 'document.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [pdf], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.form-actions button:last-child').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(uploadedDocument).toBe(pdf);
    expect(fixture.nativeElement.textContent).toContain('Le document PDF a été téléversé.');
  });

  it('should save a test drive using the selected date and confirmed false', async () => {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    buttons.find((button) => button.textContent.includes('Essais voiture'))?.click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.section-header button').click();
    fixture.detectChanges();

    const dateInput = fixture.nativeElement.querySelector('[name="testDate"]') as HTMLInputElement;
    dateInput.value = '2026-11-05';
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form button[type="submit"]').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(createdTestDrive).toEqual({ testDate: '2026-11-05', confirmed: false });
    expect(fixture.nativeElement.textContent).toContain('La date d’essai a été enregistrée.');
  });
});
