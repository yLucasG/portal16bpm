export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
}

export interface ServiceDef {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  checklistItems: ChecklistItem[];
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'oficial-operacoes',
    name: 'Oficial de Operações',
    subtitle: 'Coordenação e controle operacional',
    emoji: '⚔️',
    checklistItems: [
      { id: 'oo-1', label: 'Receber passagem de serviço do oficial anterior', category: 'Início do Serviço' },
      { id: 'oo-2', label: 'Conferir efetivo disponível e escala do dia', category: 'Início do Serviço' },
      { id: 'oo-3', label: 'Verificar estado e disponibilidade das viaturas', category: 'Início do Serviço' },
      { id: 'oo-4', label: 'Lançar o efetivo', category: 'Início do Serviço' },
      { id: 'oo-5', label: 'Confirmar armamento e munição', category: 'Segurança' },
      { id: 'oo-6', label: 'Checar equipamentos', category: 'Segurança' },
      { id: 'oo-7', label: 'Verificar ocorrências pendentes no sistema', category: 'Operações' },
      { id: 'oo-8', label: 'Acessar e validar dados no Autovision', category: 'Operações' },
      { id: 'oo-9', label: 'Monitorar e registrar ocorrências do turno', category: 'Operações' },
      { id: 'oo-10', label: 'Registrar início do serviço no livro de ocorrências', category: 'Registro' },
      { id: 'oo-11', label: 'Realizar reunião de passagem de serviço', category: 'Encerramento' },
      { id: 'oo-12', label: 'Registrar passagem de serviço e assinar livro', category: 'Encerramento' },
    ],
  },
  {
    id: 'fiscal-dia',
    name: 'Fiscal de Dia',
    subtitle: 'Fiscalização e controle administrativo',
    emoji: '📋',
    checklistItems: [
      { id: 'fd-1', label: 'Receber passagem do Fiscal anterior', category: 'Início do Serviço' },
      { id: 'fd-2', label: 'Verificar a escala de serviço do dia', category: 'Início do Serviço' },
      { id: 'fd-3', label: 'Checar presença e apresentação do efetivo', category: 'Efetivo' },
      { id: 'fd-4', label: 'Controlar entrada e saída de pessoal', category: 'Controle' },
      { id: 'fd-5', label: 'Conferir documentos administrativos do dia', category: 'Controle' },
      { id: 'fd-6', label: 'Verificar armamento e munição no paiol', category: 'Segurança' },
      { id: 'fd-7', label: 'Registrar ocorrências no livro de protocolo', category: 'Registro' },
      { id: 'fd-8', label: 'Encaminhar relatório diário ao Comandante', category: 'Encerramento' },
      { id: 'fd-9', label: 'Lavrar termo de passagem de serviço', category: 'Encerramento' },
    ],
  },
];
