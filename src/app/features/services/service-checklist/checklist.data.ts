export interface ChecklistStep {
  id: string;
  label: string;
}

export interface OperationalChecklist {
  serviceId: string;
  serviceName: string;
  emoji: string;
  steps: ChecklistStep[];
}

export const OPERATIONAL_CHECKLISTS: OperationalChecklist[] = [
  {
    serviceId: 'oficial-operacoes',
    serviceName: 'Oficial de Operações',
    emoji: '⚔️',
    steps: [
      {
        id: 'oo-s1',
        label: 'Verificar as alterações existentes (Livro de Partes / Passagem de Serviço)',
      },
      {
        id: 'oo-s2',
        label: 'Verificar as ordens de serviço do dia',
      },
      {
        id: 'oo-s3',
        label: 'Fazer o lançamento do efetivo',
      },
      {
        id: 'oo-s4',
        label: 'Seguir para o serviço: fiscalizar e apoiar o efetivo lançado (Patrulhamento)',
      },
    ],
  },
];
