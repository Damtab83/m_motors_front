import { Injectable } from '@angular/core';
import type { LoginUser } from './loginRegister/login-register-service';

export type AuthRole = 'Admin' | 'Custom';

export interface AuthenticatedUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: AuthRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly storageKey = 'my-motors-user';
  private readonly tokenStorageKey = 'my-motors-token';

  setSession(user: LoginUser, token?: string): AuthenticatedUser {
    if (
      typeof user !== 'object' ||
      user === null ||
      typeof user.firstname !== 'string' ||
      typeof user.lastname !== 'string' ||
      typeof user.email !== 'string'
    ) {
      throw new Error("La réponse de connexion ne contient pas un profil utilisateur valide.");
    }

    if (typeof user.id !== 'number' || !Number.isFinite(user.id)) {
      throw new Error("La réponse de connexion ne contient pas l'identifiant du client.");
    }

    if (token !== undefined && (typeof token !== 'string' || token.trim().length === 0)) {
      throw new Error("La réponse de connexion contient un token invalide.");
    }

    const role = this.normalizeRole(user.role);
    if (!role) {
      throw new Error("Le rôle du compte renvoyé par l'API est absent ou invalide.");
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role,
    };

    sessionStorage.setItem(this.storageKey, JSON.stringify(authenticatedUser));
    if (token) {
      sessionStorage.setItem(this.tokenStorageKey, token);
    } else {
      sessionStorage.removeItem(this.tokenStorageKey);
    }
    return authenticatedUser;
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenStorageKey);
  }

  getUser(): AuthenticatedUser | null {
    const storedUser = sessionStorage.getItem(this.storageKey);

    if (!storedUser) {
      return null;
    }

    let user: unknown;
    try {
      user = JSON.parse(storedUser);
    } catch (error: unknown) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }

      sessionStorage.removeItem(this.storageKey);
      return null;
    }

    if (!this.isAuthenticatedUser(user)) {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }

    return user;
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.tokenStorageKey);
  }

  private normalizeRole(role: unknown): AuthRole | null {
    if (typeof role !== 'string') {
      return null;
    }

    switch (role.trim().toLowerCase()) {
      case 'admin':
      case 'role_admin':
        return 'Admin';
      case 'custom':
      case 'customer':
      case 'role_custom':
        return 'Custom';
      default:
        return null;
    }
  }

  private isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const role = 'role' in value ? this.normalizeRole(value.role) : null;

    return (
      'id' in value &&
      typeof value.id === 'number' &&
      'firstname' in value &&
      typeof value.firstname === 'string' &&
      'lastname' in value &&
      typeof value.lastname === 'string' &&
      'email' in value &&
      typeof value.email === 'string' &&
      role !== null
    );
  }
}
