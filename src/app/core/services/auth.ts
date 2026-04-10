import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'https://financeiro-wh8x.onrender.com/api/v1/auth';

  constructor(private http: HttpClient) {} // Aqui acontece a Injeção de Dependência

  // Altere para receber o objeto com os nomes que o Java espera
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }
  
}

