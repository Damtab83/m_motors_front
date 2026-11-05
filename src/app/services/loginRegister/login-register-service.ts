import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserModel } from '../../models/user-model';

export type LoginCredentials = Pick<UserModel, 'email' | 'password'>;
export type LoginUser = Pick<
  UserModel,
  'id' | 'firstname' | 'lastname' | 'email' | 'role'
> & { id: number };
export interface LoginResponse {
  token?: string;
  user: LoginUser;
}

function getUserId(value: Record<string, unknown>): number | undefined {
  const id =
    value['id'] ??
    value['userId'] ??
    value['userCustomId'] ??
    value['usercustomId'];

  if (typeof id === 'number' && Number.isSafeInteger(id)) {
    return id;
  }

  if (typeof id === 'string' && /^\d+$/.test(id)) {
    const parsedId = Number(id);
    return Number.isSafeInteger(parsedId) ? parsedId : undefined;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(
  value: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  const result = keys.map((key) => value[key]).find(
    (candidate) => typeof candidate === 'string',
  );
  return typeof result === 'string' ? result : undefined;
}

function parseLoginUser(value: unknown): LoginUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const firstname = getString(value, 'firstname', 'firstName');
  const lastname = getString(value, 'lastname', 'lastName');
  const email = getString(value, 'email');
  const role = getString(value, 'role');
  const id = getUserId(value);

  if (
    id === undefined ||
    firstname === undefined ||
    lastname === undefined ||
    email === undefined ||
    role === undefined
  ) {
    return null;
  }

  return {
    id,
    firstname,
    lastname,
    email,
    role,
  };
}

function parseLoginResponse(
  value: unknown,
  authorizationHeader: string | null,
): LoginResponse {
  if (!isRecord(value)) {
    throw new Error("L’API n’a pas renvoyé un profil utilisateur valide.");
  }

  const nestedUser =
    value['user'] ??
    value['userCustom'] ??
    value['usercustom'] ??
    value['client'] ??
    value['customer'];
  const user = parseLoginUser(nestedUser ?? value);
  if (!user) {
    throw new Error(
      'Le profil de connexion doit contenir un identifiant, firstname, lastname, email et role.',
    );
  }

  const headerToken = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
  const token = value['token'] ?? value['accessToken'] ?? headerToken;
  if (token !== undefined && typeof token !== 'string') {
    throw new Error('Le token renvoyé par l’API est invalide.');
  }

  return {
    user,
    ...(typeof token === 'string' ? { token } : {}),
  };
}

export type RegistrationData = Pick<
  UserModel,
  'firstname' | 'lastname' | 'email' | 'password'
>;

@Injectable({
  providedIn: 'root',
})
export class LoginRegisterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/authentification`;

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<unknown>(`${this.apiUrl}/connexion`, credentials, {
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<unknown>) =>
          parseLoginResponse(
            response.body,
            response.headers.get('Authorization') ?? response.headers.get('token'),
          ),
        ),
      );
  }

  register(data: RegistrationData): Observable<HttpResponse<string>> {
    return this.http.post(
      `${this.apiUrl}/inscription`,
      data,
      { observe: 'response', responseType: 'text' },
    );
  }
}
