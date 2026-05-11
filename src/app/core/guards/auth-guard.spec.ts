import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { provideRouter, Router } from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: Pick<AuthService, 'isLogado' | 'clearSession'>;
  let router: Router;

  beforeEach(() => {
    authService = {
      isLogado: vi.fn(),
      clearSession: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('deve permitir acesso quando a sessão estiver válida', () => {
    vi.mocked(authService.isLogado).mockReturnValue(true);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(true);
    expect(authService.clearSession).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('deve limpar sessão e redirecionar quando a sessão estiver inválida', () => {
    vi.mocked(authService.isLogado).mockReturnValue(false);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(false);
    expect(authService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
