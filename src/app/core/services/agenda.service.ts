import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AgendaEvento {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string | null;
  data_evento: string;
  hora_evento: string | null;
  hora_fim: string | null;
  tag_cor: 'blue' | 'red' | 'green' | 'orange';
  notificar_wpp: boolean;
  telefone_wpp: string | null;
  criado_em: string;
  valor_extra: number | null;
  ocorrencia_mike: string | null;
}

export interface NovoEvento {
  usuario_id: string;
  titulo: string;
  descricao: string;
  data_evento: string;
  hora_evento: string | null;
  hora_fim: string | null;
  tag_cor: 'blue' | 'red' | 'green' | 'orange';
  notificar_wpp: boolean;
  telefone_wpp: string;
  valor_extra?: number | null;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly db = inject(SupabaseService).client;

  buscarMes(usuarioId: string, ano: number, mes: number) {
    const mm     = String(mes + 1).padStart(2, '0');
    const inicio = `${ano}-${mm}-01`;
    const ultimo = new Date(ano, mes + 1, 0).getDate();
    const fim    = `${ano}-${mm}-${String(ultimo).padStart(2, '0')}`;
    return this.db
      .from('agenda')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('data_evento', inicio)
      .lte('data_evento', fim)
      .order('hora_evento', { ascending: true });
  }

  inserir(evento: NovoEvento) {
    return this.db.from('agenda').insert(evento).select().single();
  }

  atualizarOcorrencia(id: string, mike: string) {
    return this.db.from('agenda').update({ ocorrencia_mike: mike }).eq('id', id);
  }

  excluir(id: string) {
    return this.db.from('agenda').delete().eq('id', id);
  }
}
