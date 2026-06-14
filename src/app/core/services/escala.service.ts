import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface EscalaEntrada {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  servico: string;
  data_escala: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  criado_em: string;
}

export interface NovaEscala {
  usuario_id: string;
  usuario_nome: string;
  servico: string;
  data_escala: string;
  hora_inicio: string | null;
  hora_fim: string | null;
}

@Injectable({ providedIn: 'root' })
export class EscalaService {
  private readonly db = inject(SupabaseService).client;

  buscarDia(data: string) {
    return this.db
      .from('escala')
      .select('*')
      .eq('data_escala', data)
      .order('hora_inicio', { ascending: true });
  }

  inserir(entrada: NovaEscala) {
    return this.db.from('escala').insert(entrada).select().single();
  }

  excluir(id: string) {
    return this.db.from('escala').delete().eq('id', id);
  }
}
