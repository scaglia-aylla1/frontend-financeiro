import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthPayload, AuthService } from './auth';
import { ApiResponse } from '../models/transacao.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const authResponse: ApiResponse<AuthPayload> = {
    data: {
      name: 'Aylla',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    },
    message: 'ok',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve fazer login no endpoint correto', () => {
    service.login({ email: 'test@email.com', password: '123456' }).subscribe((res) => {
      expect(res).toEqual(authResponse);
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@email.com', password: '123456' });
    req.flush(authResponse);
  });

  it('deve fazer refresh token no endpoint correto', () => {
    service.refreshToken('refresh-token').subscribe((res) => {
      expect(res.data.accessToken).toBe('access-token');
    });

    const req = httpMock.expectOne('/api/v1/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-token' });
    req.flush(authResponse);
  });

  it('deve persistir sessao no localStorage', () => {
    service.persistSession(authResponse.data);

    expect(localStorage.getItem('token')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    expect(localStorage.getItem('userName')).toBe('Aylla');
  });

  it('deve limpar sessao do localStorage', () => {
    localStorage.setItem('token', 'x');
    localStorage.setItem('refreshToken', 'y');
    localStorage.setItem('userName', 'z');

    service.clearSession();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
  });
});
