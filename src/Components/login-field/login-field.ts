import { Component } from '@angular/core';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-login-field',
  imports: [MatInputModule ],
  templateUrl: './login-field.html',
  styleUrl: './login-field.css',
})
export class LoginField {}
