export type SolicitacaoProps = {
  sol_codigo: number;
  sol_origem: string;
  sol_destino: string;
  sol_distancia: number;
  sol_valor: number;
  sol_servico: string;
  sol_status: string;
  sol_data: string;
  sol_formapagamento: string;
  usu_codigo?: number;
};