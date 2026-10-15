import { Component } from '@angular/core';
import {RegisterField} from '../../../Components/register-field/register-field';
import { LoginField } from '../../../Components/login-field/login-field';
import {ValidateButton} from '../../../Components/validate-button/validate-button';

@Component({
  selector: 'app-register',
  imports: [LoginField, RegisterField, ValidateButton],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {}
