import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CarEditorSubmission, CustomDetails } from './custom-details';
import { CarModel } from '../../app/models/car-model';

describe('CustomDetails', () => {
  let component: CustomDetails;
  let fixture: ComponentFixture<CustomDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the new car when the form is submitted', () => {
    let submission: CarEditorSubmission | undefined;
    component.saveCar.subscribe((value) => submission = value);
    fixture.componentRef.setInput('carEditMode', true);
    fixture.detectChanges();

    const values: Record<string, string> = {
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: '45000',
      price: '38000',
    };

    for (const [name, value] of Object.entries(values)) {
      const input = fixture.nativeElement.querySelector(`[name="${name}"]`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submission).toEqual({
      car: {
        brand: 'Ford',
        model: 'Mustang',
        motorisation: '200CV',
        kilometer: 45000,
        price: 38000,
        testDriving: false,
        carId: undefined,
      },
      imageFile: undefined,
      imageCarId: undefined,
      removeImage: false,
    });
  });

  it('should show and remove the current car image', () => {
    let submission: CarEditorSubmission | undefined;
    component.saveCar.subscribe((value) => submission = value);
    fixture.componentRef.setInput('carEditMode', true);
    fixture.componentRef.setInput('car', {
      carId: 1,
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: 45000,
      price: 38000,
      testDriving: false,
      imageCar: 'data:image/png;base64,abc',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.car-image-preview')?.getAttribute('src'))
      .toBe('data:image/png;base64,abc');

    const removeButton = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find((button) => button.textContent.includes('Supprimer l’image')) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.car-image-preview')).toBeNull();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submission?.removeImage).toBe(true);
    expect(submission?.imageCarId).toBeUndefined();
  });

  it('should resize and select an image for upload', async () => {
    let submission: CarEditorSubmission | undefined;
    component.saveCar.subscribe((value) => submission = value);
    fixture.componentRef.setInput('carEditMode', true);
    fixture.componentRef.setInput('car', {
      carId: 1,
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: 45000,
      price: 38000,
      testDriving: false,
    });
    fixture.detectChanges();

    const bitmap = {
      width: 2400,
      height: 1200,
      close: vi.fn(),
    } as ImageBitmap;
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['compressed'], { type: 'image/jpeg' }));
    });
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        value: 'data:image/jpeg;base64,abc',
      });
      this.dispatchEvent(new ProgressEvent('load'));
    });
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const image = new File(['image'], 'mustang.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [image], configurable: true });
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.car-image-preview')?.getAttribute('src'))
      .toBe('data:image/jpeg;base64,abc');
    expect(bitmap.close).toHaveBeenCalled();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submission?.imageFile).toBeInstanceOf(File);
    expect(submission?.imageFile?.type).toBe('image/jpeg');
    expect(submission?.imageFile?.name).toBe('mustang.jpg');
    expect(submission?.imagePreview).toBe('data:image/jpeg;base64,abc');
  });

  it('should emit a delete request for an existing car', () => {
    let deleteRequested = false;
    component.deleteCar.subscribe(() => deleteRequested = true);
    fixture.componentRef.setInput('carEditMode', true);
    fixture.componentRef.setInput('car', {
      carId: 1,
      brand: 'Ford',
      model: 'Mustang',
      motorisation: '200CV',
      kilometer: 45000,
      price: 38000,
      testDriving: false,
    });
    fixture.detectChanges();

    const deleteButton = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find((button) => button.textContent.includes('Supprimer')) as HTMLButtonElement;
    deleteButton.click();

    expect(deleteRequested).toBe(true);
  });
});
