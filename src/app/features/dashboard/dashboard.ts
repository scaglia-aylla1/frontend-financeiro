import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize, startWith } from 'rxjs/operators';
import { Categoria, Transacao, TransacaoFiltro } from '../../core/models/transacao.model';
import { TransacaoService } from '../../core/services/transacao';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  userName = 'Usuário';
  transacoesExibicao: Transacao[] = [];
  categorias: Categoria[] = [];
  carregandoLancamentos = false;
  erroLancamentos = false;
  mensagemErroLancamentos = 'Não foi possível carregar os lançamentos recentes.';

  mostrarFormulario = false;
  modoEdicao = false;
  itemEditandoId: number | null = null;
  formTransacao: FormGroup;
  filtroForm: FormGroup;

  saldoTotal = 0;
  totalReceitas = 0;
  totalDespesas = 0;

  constructor(
    private transacaoService: TransacaoService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.formTransacao = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data: [new Date().toISOString().substring(0, 10), Validators.required],
      categoriaId: ['', Validators.required],
      natureza: ['VARIAVEL', Validators.required],
      tipo: ['DESPESA', Validators.required],
    });

    this.filtroForm = this.fb.group({
      categoriaId: [''],
      dataInicial: [''],
      dataFinal: [''],
    });

    this.formTransacao
      .get('tipo')
      ?.valueChanges.pipe(
        startWith(this.formTransacao.get('tipo')?.value),
        takeUntil(this.destroy$),
      )
      .subscribe((tipo) => {
        const categoriaSelecionada = Number(this.formTransacao.get('categoriaId')?.value);
        const categoriaValida = this.categorias.some(
          (c) => c.id === categoriaSelecionada && c.tipo === tipo,
        );
        if (!categoriaValida) {
          this.formTransacao.patchValue({ categoriaId: '' }, { emitEvent: false });
        }
      });
  }

  ngOnInit(): void {
    this.carregarNomeUsuario();
    if (this.authService.isLogado()) {
      this.carregarDadosDashboard();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarNomeUsuario(): void {
    const nome = localStorage.getItem('userName');
    if (nome) {
      this.userName = nome;
    }
  }

  /** Carga inicial: usa os endpoints de transações, que refletem os totais exibidos na tela. */
  carregarDadosDashboard(): void {
    this.carregarDadosFinanceiros();
  }

  /** Carga com filtros aplicados pelo usuário (usa endpoints de receitas/despesas). */
  carregarDadosFinanceiros(): void {
    this.carregandoLancamentos = true;
    this.erroLancamentos = false;
    this.cdr.detectChanges();

    const filtro: TransacaoFiltro = {
      ...this.extrairFiltros(),
      page: 0,
      size: 1000,
    };

    this.transacaoService
      .getDadosDashboard(filtro)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.carregandoLancamentos = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.categorias = res.categorias;

          const receitas = (res.receitas.content ?? []).map((r: Transacao) => ({
            ...r,
            tipo: 'RECEITA' as const,
          }));
          const despesas = (res.despesas.content ?? []).map((d: Transacao) => ({
            ...d,
            tipo: 'DESPESA' as const,
          }));

          this.transacoesExibicao = [...receitas, ...despesas]
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 10);

          this.calcularResumo(receitas, despesas);

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao carregar dados do dashboard:', err);
          if (err.status === 401 || err.status === 403) {
            this.logout();
            return;
          }
          this.erroLancamentos = true;
          this.cdr.detectChanges();
        },
      });
  }

  salvarNovaTransacao(): void {
    if (this.formTransacao.invalid) return;

    const { tipo, ...payload } = this.formTransacao.value;
    const novaTransacao: Transacao = {
      ...payload,
      categoriaId: Number(payload.categoriaId),
    };

    const requestObserver = {
      next: () => {
        this.toastService.success(
          this.modoEdicao ? 'Lançamento atualizado com sucesso!' : 'Lançamento realizado com sucesso!',
        );
        this.resetFormulario();
        this.carregarDadosDashboard();
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar:', err);
        this.toastService.error('Não foi possível salvar o lançamento.');
      },
    };

    if (this.modoEdicao && this.itemEditandoId) {
      if (tipo === 'RECEITA') {
        this.transacaoService
          .atualizarReceita(this.itemEditandoId, novaTransacao)
          .subscribe(requestObserver);
      } else {
        this.transacaoService
          .atualizarDespesa(this.itemEditandoId, novaTransacao)
          .subscribe(requestObserver);
      }
      return;
    }

    if (tipo === 'RECEITA') {
      this.transacaoService.salvarReceita(novaTransacao).subscribe(requestObserver);
    } else {
      this.transacaoService.salvarDespesa(novaTransacao).subscribe(requestObserver);
    }
  }

  toggleFormulario(): void {
    if (this.modoEdicao) {
      this.cancelarEdicao();
      return;
    }
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  editarTransacao(item: Transacao): void {
    const categoriaId = item.categoriaId ?? item.categoria?.id;
    if (!item.id || !categoriaId || !item.tipo) {
      this.toastService.error('Não foi possível editar este lançamento.');
      return;
    }

    this.modoEdicao = true;
    this.itemEditandoId = item.id;
    this.mostrarFormulario = true;

    this.formTransacao.patchValue({
      descricao: item.descricao,
      valor: item.valor,
      data: item.data,
      categoriaId,
      natureza: item.natureza,
      tipo: item.tipo,
    });
  }

  excluirTransacao(item: Transacao): void {
    if (!item.id || !item.tipo) return;

    const confirmou = confirm(`Deseja excluir "${item.descricao}"?`);
    if (!confirmou) return;

    const request$ =
      item.tipo === 'RECEITA'
        ? this.transacaoService.excluirReceita(item.id)
        : this.transacaoService.excluirDespesa(item.id);

    request$.subscribe({
      next: () => {
        this.toastService.success('Lançamento excluído com sucesso!');
        if (this.itemEditandoId === item.id) {
          this.resetFormulario();
        }
        this.carregarDadosDashboard();
      },
      error: (err: unknown) => {
        console.error('Erro ao excluir:', err);
        this.toastService.error('Não foi possível excluir o lançamento.');
      },
    });
  }

  cancelarEdicao(): void {
    this.resetFormulario();
  }

  aplicarFiltros(): void {
    this.carregarDadosFinanceiros();
  }

  limparFiltros(): void {
    this.filtroForm.reset({
      categoriaId: '',
      dataInicial: '',
      dataFinal: '',
    });
    this.carregarDadosDashboard();
  }

  tentarNovamenteLancamentos(): void {
    this.carregarDadosDashboard();
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }

  get categoriasFormulario(): Categoria[] {
    const tipoSelecionado = this.formTransacao.get('tipo')?.value as Categoria['tipo'];
    return this.categorias.filter((categoria) => categoria.tipo === tipoSelecionado);
  }

  private calcularResumo(receitas: Transacao[], despesas: Transacao[]): void {
    this.totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0);
    this.totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    this.saldoTotal = this.totalReceitas - this.totalDespesas;
  }

  private resetFormulario(): void {
    this.formTransacao.reset({
      tipo: 'DESPESA',
      natureza: 'VARIAVEL',
      data: new Date().toISOString().substring(0, 10),
    });
    this.modoEdicao = false;
    this.itemEditandoId = null;
    this.mostrarFormulario = false;
  }

  private extrairFiltros(): TransacaoFiltro {
    const { categoriaId, dataInicial, dataFinal } = this.filtroForm.value;
    return {
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      dataInicial: dataInicial || undefined,
      dataFinal: dataFinal || undefined,
    };
  }

}
