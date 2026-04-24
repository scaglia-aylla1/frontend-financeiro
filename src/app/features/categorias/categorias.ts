import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Categoria } from '../../core/models/transacao.model';
import { TransacaoService } from '../../core/services/transacao';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categorias.html',
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  formCategoria: FormGroup;
  modoEdicao = false;
  categoriaEditandoId: number | null = null;
  carregando = false;

  constructor(
    private transacaoService: TransacaoService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.formCategoria = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['DESPESA', Validators.required],
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.carregando = true;
    this.transacaoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        if (err.status === 401 || err.status === 403) {
          localStorage.clear();
          this.router.navigate(['/login']);
          return;
        }
        console.error('Erro ao carregar categorias:', err);
      },
    });
  }

  salvarCategoria(): void {
    if (this.formCategoria.invalid) return;

    const payload = this.formCategoria.value as Pick<Categoria, 'nome' | 'tipo'>;
    const request$ =
      this.modoEdicao && this.categoriaEditandoId
        ? this.transacaoService.atualizarCategoria(this.categoriaEditandoId, payload)
        : this.transacaoService.criarCategoria(payload);

    request$.subscribe({
      next: () => {
        alert(this.modoEdicao ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
        this.resetFormulario();
        this.carregarCategorias();
      },
      error: (err) => {
        const mensagem = err?.error?.message || 'Erro ao salvar categoria.';
        alert(mensagem);
      },
    });
  }

  editarCategoria(categoria: Categoria): void {
    this.modoEdicao = true;
    this.categoriaEditandoId = categoria.id;
    this.formCategoria.patchValue({
      nome: categoria.nome,
      tipo: categoria.tipo,
    });
  }

  excluirCategoria(categoria: Categoria): void {
    const confirmou = confirm(`Deseja excluir a categoria "${categoria.nome}"?`);
    if (!confirmou) return;

    this.transacaoService.excluirCategoria(categoria.id).subscribe({
      next: () => {
        alert('Categoria excluída com sucesso!');
        if (this.categoriaEditandoId === categoria.id) {
          this.resetFormulario();
        }
        this.carregarCategorias();
      },
      error: (err) => {
        const mensagem = err?.error?.message || 'Não foi possível excluir a categoria.';
        alert(mensagem);
      },
    });
  }

  cancelarEdicao(): void {
    this.resetFormulario();
  }

  private resetFormulario(): void {
    this.formCategoria.reset({
      nome: '',
      tipo: 'DESPESA',
    });
    this.modoEdicao = false;
    this.categoriaEditandoId = null;
  }
}
