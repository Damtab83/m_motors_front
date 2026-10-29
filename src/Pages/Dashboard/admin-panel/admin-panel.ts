import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminNavBar, AdminSection } from '../../../Components/admin-nav-bar/admin-nav-bar';
import { CustomDetails } from '../../custom-details/custom-details';
import { CarModel } from '../../../app/models/car-model';
import { UserModel } from '../../../app/models/user-model';
import { CarService } from '../../../app/services/car/car-service';
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

  protected readonly selectedSection = signal<AdminSection>('users');
  protected readonly users = signal<UserModel[]>([]);
  protected readonly cars = signal<CarModel[]>([]);
  protected readonly selectedUser = signal<UserModel | null>(null);
  protected readonly selectedCar = signal<CarModel | null>(null);
  protected readonly usersLoading = signal(true);
  protected readonly carsLoading = signal(false);
  protected readonly usersError = signal('');
  protected readonly carsError = signal('');
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
