import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { TransacaoService } from './transacao';
import { ApiResponse, Categoria, PagedResponse, Transacao } from '../models/transacao.model';

describe('TransacaoService', () => {
  let service: TransacaoService;
  let httpMock: HttpTestingController;

  const categoria: Categoria = { id: 1, nome: 'Salário', tipo: 'RECEITA' };
  const transacao: Transacao = {
    id: 10,
    descricao: 'Salário abril',
    valor: 5000,
    data: '2026-04-10',
    natureza: 'FIXA',
    categoria,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TransacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve buscar receitas com filtros e paginação', () => {
    const response: ApiResponse<PagedResponse<Transacao>> = {
      data: {
        content: [transacao],
        totalPages: 2,
        totalElements: 11,
        size: 10,
        number: 0,
      },
      message: 'ok',
    };

    service
      .getReceitas({ categoriaId: 1, dataInicial: '2026-04-01', dataFinal: '2026-04-30', page: 0, size: 10 })
      .subscribe((res) => {
        expect(res.content.length).toBe(1);
        expect(res.totalPages).toBe(2);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/v1/receitas' &&
        r.params.get('categoriaId') === '1' &&
        r.params.get('dataInicial') === '2026-04-01' &&
        r.params.get('dataFinal') === '2026-04-30' &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '10',
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('deve criar categoria no endpoint correto', () => {
    const response: ApiResponse<Categoria> = {
      data: categoria,
      message: 'Categoria criada',
    };

    service.criarCategoria({ nome: categoria.nome, tipo: categoria.tipo }).subscribe((res) => {
      expect(res.nome).toBe('Salário');
    });

    const req = httpMock.expectOne('/api/v1/categorias');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Salário', tipo: 'RECEITA' });
    req.flush(response);
  });

  it('deve excluir despesa no endpoint correto', () => {
    service.excluirDespesa(99).subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('/api/v1/despesas/99');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: null, message: 'ok' });
  });
});
