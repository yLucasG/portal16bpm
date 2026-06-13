import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AgendaEvento {
  id: string;
  usuario_id: string;
  titulo: string;
  descricao: string | null;
  data: string;       // 'YYYY-MM-DD'
  hora: string | null;      // 'HH:MM'
  hora_fim: string | null;  // 'HH:MM'
  tag_cor: 'blue' | 'red' | 'green';
  avisar_whatsapp: boolean;
  telefone_whatsapp: string | null;
  created_at: string;
}

export interface NovoEvento {
  usuario_id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string | null;
  hora_fim: string | null;
  tag_cor: 'blue' | 'red' | 'green';
  avisar_whatsapp: boolean;
  telefone_whatsapp: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly db = inject(SupabaseService).client;

  buscarMes(usuarioId: string, ano: number, mes: number) {
    const mm    = String(mes + 1).padStart(2, '0');
    const inicio = `${ano}-${mm}-01`;
    const ultimo = new Date(ano, mes + 1, 0).getDate();
    const fim    = `${ano}-${mm}-${String(ultimo).padStart(2, '0')}`;
    return this.db
      .from('agenda')
      .select('*')
      .eq('usuario_id', usuarioId)
      .gte('data', inicio)
      .lte('data', fim)
      .order('hora', { ascending: true, nullsFirst: false });
  }

  inserir(evento: NovoEvento) {
    return this.db.from('agenda').insert(evento).select().single();
  }

  excluir(id: string) {
    return this.db.from('agenda').delete().eq('id', id);
  }
}
