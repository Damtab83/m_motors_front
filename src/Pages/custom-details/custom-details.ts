import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarModel } from '../../app/models/car-model';
import { UserModel } from '../../app/models/user-model';

interface CarForm {
  brand: string;
  model: string;
  motorisation: string;
  kilometer: number;
  price: number;
  testDriving: boolean;
}

export interface CarEditorSubmission {
  car: CarModel;
  imageFile?: File;
  imagePreview?: string;
  imageCarId?: number;
  removeImage: boolean;
}

@Component({
  selector: 'app-custom-details',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './custom-details.html',
  styleUrl: './custom-details.css',
})
export class CustomDetails implements OnChanges {
  @Input() user: UserModel | null = null;
  @Input() car: CarModel | null = null;
  @Input() carEditMode = false;
  @Input() saving = false;
  @Input() editorError = '';

  @Output() close = new EventEmitter<void>();
  @Output() saveCar = new EventEmitter<CarEditorSubmission>();
  @Output() deleteCar = new EventEmitter<void>();

  protected carForm: CarForm = this.emptyCarForm();
  protected imageLoading = false;
  protected imageError = '';
  protected imagePreview: string | null = null;
  protected imageCarId: number | undefined;
  protected selectedImage: File | undefined;
  private removeImage = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['car'] || changes['carEditMode']) {
      this.carForm = this.car
        ? {
            brand: this.car.brand,
            model: this.car.model,
            motorisation: this.car.motorisation,
            kilometer: this.car.kilometer,
            price: this.car.price,
            testDriving: this.car.testDriving ?? false,
          }
        : this.emptyCarForm();
      this.imagePreview = this.car?.imageCar ?? null;
      this.imageCarId = this.car?.imageCarId;
      this.selectedImage = undefined;
      this.removeImage = false;
      this.imageLoading = false;
      this.imageError = '';
    }
  }

  protected updateCarField(field: keyof CarForm, event: Event): void {
    const input = event.target as HTMLInputElement;

    switch (field) {
      case 'brand':
      case 'model':
      case 'motorisation':
        this.carForm = { ...this.carForm, [field]: input.value };
        break;
      case 'kilometer':
      case 'price':
        this.carForm = { ...this.carForm, [field]: Number(input.value) };
        break;
      case 'testDriving':
        this.carForm = { ...this.carForm, testDriving: input.checked };
        break;
    }
  }

  protected submitCar(event: Event): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;

    if (!form.reportValidity() || this.saving || this.imageLoading) {
      return;
    }

    this.saveCar.emit({
      car: {
        ...this.carForm,
        carId: this.car?.carId,
      },
      imageFile: this.selectedImage,
      imagePreview: this.imagePreview ?? undefined,
      imageCarId: this.imageCarId,
      removeImage: this.removeImage,
    });
  }

  protected async selectCarImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.imageError = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.imageError = 'Veuillez sélectionner un fichier image.';
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.imageError = 'Choisissez une image au format JPEG, PNG ou WebP.';
      return;
    }

    this.imageLoading = true;
    try {
      const bitmap = await createImageBitmap(file);
      let compressedImage: Blob;
      try {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / bitmap.width, maxDimension / bitmap.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas 2D context is unavailable.');
        }
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        compressedImage = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Image compression failed.')),
            'image/jpeg',
            0.8,
          );
        });
      } finally {
        bitmap.close();
      }

      const compressedFile = new File(
        [compressedImage],
        `${file.name.replace(/\.[^.]+$/, '')}.jpg`,
        { type: 'image/jpeg' },
      );
      const reader = new FileReader();
      const preview = await new Promise<string>((resolve, reject) => {
        reader.onload = () =>
          typeof reader.result === 'string'
            ? resolve(reader.result)
            : reject(new Error('Image preview is unavailable.'));
        reader.onerror = () => reject(new Error('Image file could not be read.'));
        reader.readAsDataURL(compressedFile);
      });
      this.selectedImage = compressedFile;
      this.removeImage = false;
      this.imagePreview = preview;
    } catch {
      this.imageError = 'Impossible de lire ou de compresser cette image.';
    } finally {
      this.imageLoading = false;
    }
  }

  protected removeCarImage(): void {
    this.imagePreview = null;
    this.selectedImage = undefined;
    this.removeImage = true;
    this.imageError = '';
  }

  private emptyCarForm(): CarForm {
    return {
      brand: '',
      model: '',
      motorisation: '',
      kilometer: 0,
      price: 0,
      testDriving: false,
    };
  }
}
