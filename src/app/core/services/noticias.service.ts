import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

// ─── Estrutura esperada na tabela `noticias` do Supabase ─────────────────────
// CREATE TABLE noticias (
//   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   titulo     TEXT NOT NULL,
//   conteudo   TEXT NOT NULL,
//   autor_id   UUID NOT NULL REFERENCES auth.users(id),
//   autor_nome TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
// -- Leitura pública para autenticados:
// CREATE POLICY "read_noticias" ON noticias FOR SELECT USING (auth.role() = 'authenticated');
// -- Inserção: apenas o próprio usuário como autor:
// CREATE POLICY "insert_noticias" ON noticias FOR INSERT WITH CHECK (auth.uid() = autor_id);
// -- Exclusão: autor ou master admin:
// CREATE POLICY "delete_noticias" ON noticias FOR DELETE USING (
//   auth.uid() = autor_id OR auth.email() = '1263722@portal16bpm.com'
// );

export interface Noticia {
  id: string;
  titulo: string;
  conteudo: string;
  autor_id: string;
  autor_nome: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private readonly supabase = inject(SupabaseService);

  /** Retorna todas as notícias ordenadas da mais recente para a mais antiga. */
  buscarNoticias() {
    return this.supabase.client
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });
  }

  /** Insere uma nova notícia associada ao usuário logado. */
  inserirNoticia(
    titulo: string,
    conteudo: string,
    autorId: string,
    autorNome: string,
  ) {
    return this.supabase.client.from('noticias').insert({
      titulo,
      conteudo,
      autor_id: autorId,
      autor_nome: autorNome,
    });
  }

  /** Remove uma notícia pelo ID (RLS valida permissão no banco). */
  deletarNoticia(id: string) {
    return this.supabase.client.from('noticias').delete().eq('id', id);
  }
}
