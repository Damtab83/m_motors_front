import { Component } from '@angular/core';
import {LoginField} from '../../../Components/login-field/login-field';
import {ValidateButton} from '../../../Components/validate-button/validate-button';

@Component({
  selector: 'app-login',
  imports: [LoginField, ValidateButton],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
