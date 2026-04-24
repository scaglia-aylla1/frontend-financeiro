export interface Categoria {
  id: number;
  nome: string;
  tipo: 'RECEITA' | 'DESPESA';
}

export interface Transacao {
  id?: number;
  descricao: string;
  valor: number;
  data: string;
  natureza: 'FIXA' | 'VARIAVEL';
  categoria?: Categoria;
  categoriaId?: number;
  tipo?: 'RECEITA' | 'DESPESA';
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface BalancoMensal {
  totalReceitas: number;
  totalDespesas: number;
  balancoFinal: number;
  despesasPorCategoria: Record<string, number>;
  receitasPorCategoria: Record<string, number>;
}

export interface TransacaoFiltro {
  categoriaId?: number;
  dataInicial?: string;
  dataFinal?: string;
  page?: number;
  size?: number;
}