import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard';
import { AuthService } from '../../core/services/auth';
import { TransacaoService } from '../../core/services/transacao';
import { ToastService } from '../../core/services/toast';

describe('Dashboard', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: { isLogado: ReturnType<typeof vi.fn>; clearSession: ReturnType<typeof vi.fn> };
  let transacaoService: { getDadosDashboard: ReturnType<typeof vi.fn> };
  let toastService: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      isLogado: vi.fn().mockReturnValue(false),
      clearSession: vi.fn(),
    };
    transacaoService = {
      getDadosDashboard: vi.fn().mockReturnValue(
        of({
          receitas: { content: [] },
          despesas: { content: [] },
          categorias: [],
        }),
      ),
    };
    toastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: TransacaoService, useValue: transacaoService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve explicar que exibe ate 10 lancamentos recentes sem paginacao visual', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Exibindo até 10 lançamentos mais recentes');
    expect(compiled.textContent).not.toContain('Anterior');
    expect(compiled.textContent).not.toContain('Próxima');
  });

  it('deve carregar os dados automaticamente ao entrar logado no dashboard', () => {
    authService.isLogado.mockReturnValue(true);

    fixture.detectChanges();

    expect(transacaoService.getDadosDashboard).toHaveBeenCalledWith({
      categoriaId: undefined,
      dataInicial: undefined,
      dataFinal: undefined,
      page: 0,
      size: 1000,
    });
  });
});
