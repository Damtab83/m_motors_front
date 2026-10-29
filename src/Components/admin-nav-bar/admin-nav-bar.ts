import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type AdminSection = 'documents' | 'cars' | 'users' | 'test-drives';

@Component({
  selector: 'app-admin-nav-bar',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './admin-nav-bar.html',
  styleUrl: './admin-nav-bar.css',
})
export class AdminNavBar {
  readonly selectedSection = input<AdminSection>('users');
  readonly sectionChange = output<AdminSection>();

  protected selectSection(section: AdminSection): void {
    this.sectionChange.emit(section);
  }
}
