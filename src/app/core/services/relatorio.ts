import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, BalancoResponse, LancamentoResumo } from '../models/transacao.model';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly API_BASE = this.getApiBase();

  constructor(private http: HttpClient) {}

  getBalancoAtual(): Observable<ApiResponse<BalancoResponse>> {
    return this.http.get<ApiResponse<BalancoResponse>>(`${this.API_BASE}/relatorios/balanco/atual`);
  }

  getLancamentosRecentes(limit: number): Observable<ApiResponse<LancamentoResumo[]>> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<ApiResponse<LancamentoResumo[]>>(`${this.API_BASE}/relatorios/lancamentos/recentes`, { params });
  }

  getBalancoMensal(ano: number, mes: number): Observable<ApiResponse<BalancoResponse>> {
    return this.http.get<ApiResponse<BalancoResponse>>(`${this.API_BASE}/relatorios/balanco/${ano}/${mes}`);
  }

  private getApiBase(): string {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return '/api/v1';
    }
    return 'https://financeiro-wh8x.onrender.com/api/v1';
  }
}
