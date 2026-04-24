import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import {
  ApiResponse,
  BalancoMensal,
  Categoria,
  PagedResponse,
  TransacaoFiltro,
  Transacao,
} from '../models/transacao.model';

@Injectable({
  providedIn: 'root',
})
export class TransacaoService {
  private readonly API_BASE = this.getApiBase();

  constructor(private http: HttpClient) {}

  getReceitas(filtro?: TransacaoFiltro): Observable<PagedResponse<Transacao>> {
    const params = this.buildParams(filtro);
    return this.http
      .get<ApiResponse<PagedResponse<Transacao>>>(`${this.API_BASE}/receitas`, { params })
      .pipe(map((res) => res.data));
  }

  getDespesas(filtro?: TransacaoFiltro): Observable<PagedResponse<Transacao>> {
    const params = this.buildParams(filtro);
    return this.http
      .get<ApiResponse<PagedResponse<Transacao>>>(`${this.API_BASE}/despesas`, { params })
      .pipe(map((res) => res.data));
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http
      .get<ApiResponse<Categoria[]>>(`${this.API_BASE}/categorias`)
      .pipe(map((res) => res.data ?? []));
  }

  getRelatorioMensal(mes: number, ano: number): Observable<BalancoMensal> {
    return this.http
      .get<ApiResponse<BalancoMensal>>(`${this.API_BASE}/relatorios/balanco/${ano}/${mes}`)
      .pipe(map((res) => res.data));
  }

  getDadosIniciaisDashboard(): Observable<{
    receitas: PagedResponse<Transacao>;
    despesas: PagedResponse<Transacao>;
    categorias: Categoria[];
  }>{
    return this.getDadosDashboard();
  }

  getDadosDashboard(filtro?: TransacaoFiltro): Observable<{
    receitas: PagedResponse<Transacao>;
    despesas: PagedResponse<Transacao>;
    categorias: Categoria[];
  }> {
    return forkJoin({
      receitas: this.getReceitas(filtro),
      despesas: this.getDespesas(filtro),
      categorias: this.getCategorias(),
    });
  }

  salvarReceita(dados: Transacao): Observable<Transacao> {
    return this.http
      .post<ApiResponse<Transacao>>(`${this.API_BASE}/receitas`, dados)
      .pipe(map((res) => res.data));
  }

  salvarDespesa(dados: Transacao): Observable<Transacao> {
    return this.http
      .post<ApiResponse<Transacao>>(`${this.API_BASE}/despesas`, dados)
      .pipe(map((res) => res.data));
  }

  atualizarReceita(id: number, dados: Transacao): Observable<Transacao> {
    return this.http
      .put<ApiResponse<Transacao>>(`${this.API_BASE}/receitas/${id}`, dados)
      .pipe(map((res) => res.data));
  }

  atualizarDespesa(id: number, dados: Transacao): Observable<Transacao> {
    return this.http
      .put<ApiResponse<Transacao>>(`${this.API_BASE}/despesas/${id}`, dados)
      .pipe(map((res) => res.data));
  }

  excluirReceita(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.API_BASE}/receitas/${id}`)
      .pipe(map(() => void 0));
  }

  excluirDespesa(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.API_BASE}/despesas/${id}`)
      .pipe(map(() => void 0));
  }

  private getApiBase(): string {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return '/api/v1';
    }
    return 'https://financeiro-wh8x.onrender.com/api/v1';
  }

  private buildParams(filtro?: TransacaoFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.categoriaId) {
      params = params.set('categoriaId', String(filtro.categoriaId));
    }
    if (filtro.dataInicial) {
      params = params.set('dataInicial', filtro.dataInicial);
    }
    if (filtro.dataFinal) {
      params = params.set('dataFinal', filtro.dataFinal);
    }
    if (filtro.page !== undefined) {
      params = params.set('page', String(filtro.page));
    }
    if (filtro.size !== undefined) {
      params = params.set('size', String(filtro.size));
    }
    return params;
  }
}
