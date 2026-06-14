# Portal 16º BPM

Aplicação mobile-first para o 16º Batalhão de Polícia Militar de Pernambuco. Centraliza agenda de serviços, escalas, mural de notícias e notificações automáticas via WhatsApp.

## Funcionalidades

- **Mural de notícias** — publicações internas do batalhão
- **Agenda pessoal** — eventos com categorias (Escala, Prazo/IPM, Rotina, Serviço Extra)
- **Escalados** — visualização diária de quem está em qual serviço
- **Meu Perfil** — histórico de serviços, rentabilidade de extras e registro de ocorrências (MIKE)
- **Bot WhatsApp** — notificações automáticas diárias de eventos agendados

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular 20 — Standalone Components + Signals |
| Estilo | Tailwind CSS v4 |
| Backend / BD | Supabase (PostgreSQL + Auth + RLS) |
| Bot | Node.js 20 + whatsapp-web.js + PM2 (VPS Hostinger) |

## Categorias de evento (Agenda)

| Cor | Categoria | Uso |
|-----|-----------|-----|
| Azul | Escala | Serviços escalados — aparecem na aba Escalados |
| Vermelho | Prazo/IPM | Prazos e inquéritos |
| Lilás | Rotina | Atividades rotineiras |
| Verde | Serviço Extra | Serviços pagos (R$ 180 ou R$ 300) |

## Instalação (Frontend)

```bash
# Pré-requisitos: Node.js 20+, Angular CLI 20+
git clone https://github.com/yLucasG/portal16bpm.git
cd portal16bpm
npm install
ng serve
```

Acesse `http://localhost:4200`. Login com matrícula + senha `161616` (primeiro acesso força troca de senha).

## Supabase — Tabelas principais

```
usuarios    → matrícula, nome, patente, perfil
agenda      → eventos pessoais (titulo, data, tag_cor, valor_extra, notificar_wpp)
perfis      → telefone para notificação WhatsApp
noticias    → publicações do mural
```

### RPC necessária (Escalados)

Execute no SQL Editor do Supabase:

```sql
CREATE OR REPLACE FUNCTION buscar_escalados(p_data date)
RETURNS TABLE (
  id uuid, usuario_id uuid, usuario_nome text,
  servico text, data_evento date,
  hora_inicio text, hora_fim text
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    a.id, a.usuario_id,
    u.raw_user_meta_data->>'nome' AS usuario_nome,
    a.titulo AS servico,
    a.data_evento::date,
    a.hora_evento AS hora_inicio,
    a.hora_fim
  FROM public.agenda a
  JOIN auth.users u ON u.id = a.usuario_id
  WHERE a.data_evento = p_data
    AND a.tag_cor = 'blue'
  ORDER BY a.hora_evento ASC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION buscar_escalados(date) TO authenticated;
```

---

## Bot WhatsApp (VPS)

O bot roda na VPS da Hostinger e envia lembretes automáticos todo dia às **00:01 (horário de Recife)** para usuários com eventos marcados com `notificar_wpp = true`.

### Requisitos da VPS

- Ubuntu 22.04+ / Debian 11+
- Node.js 20+
- Google Chrome estável
- PM2 (processo persistente)

### Setup completo na VPS

```bash
# 1. Dependências do sistema
apt-get update
apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libgbm1 libasound2

# 2. Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Google Chrome
wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -O /tmp/chrome.deb
apt-get install -y /tmp/chrome.deb

# 4. Criar projeto
mkdir -p ~/bot-16bpm && cd ~/bot-16bpm
npm init -y
npm install whatsapp-web.js qrcode-terminal @supabase/supabase-js node-cron ws
npm install -g pm2
```

### Código — `~/bot-16bpm/index.js`

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const WebSocket = require('ws');
global.WebSocket = WebSocket;

const supabaseUrl = 'https://byqvyhfbxvzmvehwarws.supabase.co';
const supabaseKey = 'SUA_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Escaneie o QR Code com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot conectado e aguardando horários!');
});

client.initialize();

cron.schedule('1 0 * * *', async () => {
    const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Recife' });
    const { data: eventos, error } = await supabase
        .from('agenda')
        .select('*')
        .eq('data_evento', hoje)
        .eq('notificar_wpp', true);

    if (error || !eventos?.length) return;

    for (const evento of eventos) {
        const { data: perfil } = await supabase
            .from('perfis').select('telefone')
            .eq('id', evento.usuario_id).single();

        if (!perfil?.telefone) continue;

        let numero = perfil.telefone.replace(/\D/g, '');
        if (!numero.startsWith('55')) numero = '55' + numero;

        const mensagem = `*PORTAL 16º BPM - AVISO*\n\n` +
            `📌 *${evento.titulo}*\n` +
            `🕒 ${evento.hora_evento || 'O dia todo'}${evento.hora_fim ? ' às ' + evento.hora_fim : ''}\n` +
            `📝 ${evento.descricao || 'Sem detalhes'}\n\nBom serviço! 🚔`;

        await client.sendMessage(numero + '@c.us', mensagem);
        await new Promise(r => setTimeout(r, 3000));
    }
}, { timezone: 'America/Recife' });
```

### Primeiro uso — escanear QR Code

```bash
# Rodar interativamente para escanear o QR Code
cd ~/bot-16bpm && node index.js
```

Escaneie o QR com o WhatsApp → **Menu → Aparelhos conectados → Conectar aparelho**. Após conectar, pressione `Ctrl+C`.

### Iniciar com PM2 (permanente)

```bash
cd ~/bot-16bpm
pm2 start index.js --name "bot-16bpm"
pm2 save
pm2 startup   # Copie e execute o comando gerado
pm2 save      # Salvar novamente após startup
```

### Comandos de manutenção

```bash
pm2 status                     # Ver se está online
pm2 logs bot-16bpm             # Logs em tempo real
pm2 logs bot-16bpm --lines 50  # Últimas 50 linhas de log
pm2 restart bot-16bpm          # Reiniciar (ex: após atualizar index.js)
pm2 stop bot-16bpm             # Parar
```

### Testar sem esperar até 00:01

No SSH da VPS, edite o cron em `index.js` temporariamente:

```javascript
// Trocar:
cron.schedule('1 0 * * *', async () => {
// Por (roda a cada 2 minutos):
cron.schedule('*/2 * * * *', async () => {
```

Depois: `pm2 restart bot-16bpm` e observe: `pm2 logs bot-16bpm`

Confirme que funcionou, volte para `1 0 * * *` e reinicie novamente.

### Como o bot funciona

```
00:01 Recife → cron dispara
  └→ Busca eventos do dia em agenda WHERE notificar_wpp = true
      └→ Para cada evento, busca telefone em perfis WHERE id = usuario_id
          └→ Formata mensagem e envia via WhatsApp
              └→ Aguarda 3s entre cada envio (anti-ban)
```

### Renovar sessão (se desconectar)

```bash
pm2 stop bot-16bpm
rm -rf ~/bot-16bpm/.wwebjs_auth   # Apagar sessão antiga
cd ~/bot-16bpm && node index.js   # Escanear novo QR Code
# Após escanear:
pm2 restart bot-16bpm
```

---

## Autenticação

Login com **matrícula** (ex: `12345`) e senha. Primeiro acesso exige troca de senha obrigatória. O email interno usado é `{matricula}@portal16bpm.com` — invisível para o usuário.

## Licença

Uso interno — 16º BPM / PERNAMBUCO
