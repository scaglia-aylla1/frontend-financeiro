import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Categoria, Transacao, TransacaoFiltro } from '../../core/models/transacao.model';
import { TransacaoService } from '../../core/services/transacao';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Adicionado ReactiveFormsModule aqui
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  userName = 'Usuário';
  transacoesExibicao: Transacao[] = [];
  categorias: Categoria[] = [];

  mostrarFormulario = false;
  modoEdicao = false;
  itemEditandoId: number | null = null;
  formTransacao: FormGroup;
  filtroForm: FormGroup;

  saldoTotal = 0;
  totalReceitas = 0;
  totalDespesas = 0;
  paginaAtual = 0;
  tamanhoPagina = 10;
  totalPaginas = 1;

  constructor(
    private transacaoService: TransacaoService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formTransacao = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data: [new Date().toISOString().substring(0, 10), Validators.required],
      categoriaId: ['', Validators.required],
      natureza: ['VARIAVEL', Validators.required],
      tipo: ['DESPESA', Validators.required]
    });

    this.filtroForm = this.fb.group({
      categoriaId: [''],
      dataInicial: [''],
      dataFinal: ['']
    });
  }

  ngOnInit(): void {
    this.carregarNomeUsuario();
    this.carregarDadosFinanceiros();
  }

  carregarNomeUsuario(): void {
    const nome = localStorage.getItem('userName');
    if (nome) {
      this.userName = nome;
    }
  }

  carregarDadosFinanceiros(): void {
    const filtro: TransacaoFiltro = {
      ...this.extrairFiltros(),
      page: this.paginaAtual,
      size: this.tamanhoPagina
    };

    this.transacaoService.getDadosDashboard(filtro).subscribe({
      next: (res) => {
        this.categorias = res.categorias;

        const receitas = (res.receitas.content ?? []).map((r: Transacao) => ({ ...r, tipo: 'RECEITA' as const }));
        const despesas = (res.despesas.content ?? []).map((d: Transacao) => ({ ...d, tipo: 'DESPESA' as const }));

        this.transacoesExibicao = [...receitas, ...despesas].sort((a, b) => {
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        });
        this.totalPaginas = Math.max(res.receitas.totalPages || 1, res.despesas.totalPages || 1, 1);

        this.calcularResumo(receitas, despesas);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard:', err);
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  salvarNovaTransacao(): void {
    if (this.formTransacao.invalid) return;

    const { tipo, ...payload } = this.formTransacao.value;
    const novaTransacao: Transacao = {
      ...payload,
      categoriaId: Number(payload.categoriaId)
    };

    const requestObserver = {
      next: () => {
        alert(this.modoEdicao ? 'Lançamento atualizado com sucesso!' : 'Lançamento realizado com sucesso!');
        this.resetFormulario();
        this.carregarDadosFinanceiros();
      },
      error: (err: any) => console.error('Erro ao salvar:', err)
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
      alert('Não foi possível editar este lançamento.');
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
      tipo: item.tipo
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
        alert('Lançamento excluído com sucesso!');
        if (this.itemEditandoId === item.id) {
          this.resetFormulario();
        }
        this.carregarDadosFinanceiros();
      },
      error: (err) => console.error('Erro ao excluir:', err)
    });
  }

  cancelarEdicao(): void {
    this.resetFormulario();
  }

  aplicarFiltros(): void {
    this.paginaAtual = 0;
    this.carregarDadosFinanceiros();
  }

  limparFiltros(): void {
    this.filtroForm.reset({
      categoriaId: '',
      dataInicial: '',
      dataFinal: ''
    });
    this.aplicarFiltros();
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas - 1) {
      this.paginaAtual++;
      this.carregarDadosFinanceiros();
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.carregarDadosFinanceiros();
    }
  }

  private calcularResumo(receitas: Transacao[], despesas: Transacao[]): void {
    this.totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0);
    this.totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    this.saldoTotal = this.totalReceitas - this.totalDespesas;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private resetFormulario(): void {
    this.formTransacao.reset({
      tipo: 'DESPESA',
      natureza: 'VARIAVEL',
      data: new Date().toISOString().substring(0, 10)
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
      dataFinal: dataFinal || undefined
    };
  }
}