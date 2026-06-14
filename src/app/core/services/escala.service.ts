import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface EscaladoItem {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  servico: string;
  data_evento: string;
  hora_inicio: string | null;
  hora_fim: string | null;
}

@Injectable({ providedIn: 'root' })
export class EscalaService {
  private readonly db = inject(SupabaseService).client;

  buscarEscaladosDia(data: string) {
    return this.db.rpc('buscar_escalados', { p_data: data });
  }
}
