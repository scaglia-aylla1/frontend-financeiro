import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from '../models/transacao.model';

export interface AuthPayload {
  name: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  name: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = this.getApiBase();

  private readonly currentUserSubject: BehaviorSubject<User | null>;
  readonly currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Leitura síncrona do localStorage no construtor para evitar race condition
    const storedToken = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    const initialUser: User | null =
      storedToken && storedName ? { name: storedName, token: storedToken } : null;

    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /** Retorna o token JWT de forma síncrona, direto do localStorage. */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Verifica se o token existe e ainda não está expirado. */
  isLogado(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const agora = Math.floor(Date.now() / 1000);
      return typeof payload.exp === 'number' && payload.exp > agora;
    } catch {
      return false;
    }
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthPayload>> {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.API}/login`, credentials);
  }

  register(userData: {
    name: string;
    email: string;
    password: string;
  }): Observable<ApiResponse<AuthPayload>> {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.API}/register`, userData);
  }

  refreshToken(refreshToken: string): Observable<ApiResponse<AuthPayload>> {
    return this.http.post<ApiResponse<AuthPayload>>(`${this.API}/refresh`, { refreshToken });
  }

  /** Salva a sessão no localStorage e emite o novo usuário no BehaviorSubject. */
  persistSession(payload: AuthPayload): void {
    localStorage.setItem('token', payload.accessToken);
    localStorage.setItem('refreshToken', payload.refreshToken);
    localStorage.setItem('userName', payload.name);
    this.currentUserSubject.next({ name: payload.name, token: payload.accessToken });
  }

  /** Remove a sessão do localStorage e emite null no BehaviorSubject. */
  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    this.currentUserSubject.next(null);
  }

  private getApiBase(): string {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return '/api/v1/auth';
    }
    return 'https://financeiro-wh8x.onrender.com/api/v1/auth';
  }
}
