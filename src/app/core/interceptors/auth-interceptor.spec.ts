import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor, resetRefreshInterceptorState } from './auth-interceptor';
import { AuthPayload } from '../services/auth';
import { ApiResponse } from '../models/transacao.model';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  const authResponse: ApiResponse<AuthPayload> = {
    data: {
      name: 'Aylla',
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    },
    message: 'ok',
  };

  beforeEach(() => {
    localStorage.clear();
    resetRefreshInterceptorState();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    resetRefreshInterceptorState();
  });

  it('should be created', () => {
    expect(authInterceptor).toBeTruthy();
  });

  it('deve adicionar Authorization em requisições protegidas', () => {
    localStorage.setItem('token', 'access-token');

    http.get('/api/v1/receitas').subscribe();

    const req = httpMock.expectOne('/api/v1/receitas');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token');
    req.flush({ data: [], message: 'ok' });
  });

  it('não deve adicionar Authorization em requisições de autenticação', () => {
    localStorage.setItem('token', 'access-token');

    http.post('/api/v1/auth/login', { email: 'test@email.com', password: '123456' }).subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(authResponse);
  });

  it('deve renovar token e repetir a requisição original após 401', () => {
    localStorage.setItem('token', 'old-access-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    http.get('/api/v1/receitas').subscribe((res) => {
      expect(res).toEqual({ data: ['receita'], message: 'ok' });
    });

    const firstReq = httpMock.expectOne('/api/v1/receitas');
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer old-access-token');
    firstReq.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'refresh-token' });
    expect(refreshReq.request.headers.has('Authorization')).toBe(false);
    refreshReq.flush(authResponse);

    const retryReq = httpMock.expectOne('/api/v1/receitas');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryReq.flush({ data: ['receita'], message: 'ok' });

    expect(localStorage.getItem('token')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('deve limpar sessão e redirecionar quando o refresh falhar', () => {
    localStorage.setItem('token', 'old-access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('userName', 'Aylla');
    let statusErro: number | undefined;

    http.get('/api/v1/despesas').subscribe({
      error: (error) => {
        statusErro = error.status;
      },
    });

    const firstReq = httpMock.expectOne('/api/v1/despesas');
    firstReq.flush({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
    refreshReq.flush({ message: 'refresh inválido' }, { status: 401, statusText: 'Unauthorized' });

    expect(statusErro).toBe(401);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
