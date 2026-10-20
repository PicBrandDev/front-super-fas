# Super Fãs — Front (Next.js)

Web app de fã clubes multifandom. Cada artista tem seu ambiente (com visual próprio) e até 10 administradores. O primeiro ambiente é o **Vintage Culture**.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4**.

## Rodando

```bash
npm install
npm run dev       # http://localhost:3000
npm run build && npm start
npm run lint
```

Sem `API_URL`, o app roda em **modo exemplo**: usa os dados de `src/lib/mock.ts` e não pede login.
Para ligar no back ([back-super-fas](../back-super-fas)), crie um `.env.local` com:

```bash
API_URL=http://localhost:8000
JWT_SECRET=o-mesmo-valor-do-back
```

Com a API ligada, **todo o site exige login** e cada tipo de conta só entra na sua área (ver abaixo).

## Login e tipos de conta

| Conta | Depois do login vai para | Pode entrar em |
| --- | --- | --- |
| Fã | `/` (lista de fã clubes) | área do fã de qualquer fã clube no ar |
| Admin do fã clube | `/[artista]/admin` | admin dos fã clubes que administra + área do fã |
| Patrocinador | `/patrocinador` | portal do patrocinador + área do fã |
| Admin master | `/admin/fas-clubes` | tudo |

- Fãs se cadastram sozinhos em `/cadastro`.
- Admins de fã clube e patrocinadores são **convidados** (admin master ou equipe do fã clube). O convite cria a conta e mostra uma **senha provisória** uma única vez; no primeiro login a pessoa escolhe a própria senha.
- O porteiro das rotas é `src/proxy.ts` (confere o token do cookie `sf_session`). Quem garante as permissões de verdade é a API.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Entrada da plataforma (lista de fã clubes e painéis) |
| `/[artista]` | Início do fã clube (anúncio, Drop News, próximo show, atalhos) |
| `/[artista]/mural` | Mural: Drop News, feed da galera, posts do Instagram |
| `/[artista]/agenda` | Agenda de shows |
| `/[artista]/eventos/[id]` | Evento: sorte do evento, brindes, onde comprar |
| `/[artista]/pickap` | PicKap da sorte (roleta) |
| `/[artista]/loja` | Loja virtual |
| `/[artista]/drops` | Drops Hits (prévias) |
| `/[artista]/photo-finder` | Photo Finder |
| `/[artista]/membro` | Plano "Tornar membro" (R$ 16,90/mês) |
| `/[artista]/admin/membros` | Admin do fã clube: membros |
| `/[artista]/admin/mural` | Admin do fã clube: Drop News e moderação do mural |
| `/[artista]/admin/agenda` | Admin do fã clube: shows (e, em cada show, onde comprar e brindes) |
| `/[artista]/admin/pickap` | Admin do fã clube: fatias da roleta |
| `/[artista]/admin/loja` | Admin do fã clube: produtos |
| `/[artista]/admin/drops` | Admin do fã clube: prévias do Drops Hits |
| `/[artista]/admin/beneficios` | Admin do fã clube: benefícios de membro |
| `/[artista]/admin/equipe` | Admin do fã clube: convidar e remover administradores |
| `/admin/fas-clubes` | Admin master: fã clubes, criar artista, administradores, módulos |
| `/admin/midia` | Admin master: plataforma de mídia (vitrines, campanhas, patrocinadores) |
| `/patrocinador` | Portal do patrocinador (nova campanha) |
| `/patrocinador/campanhas` | Portal do patrocinador: minhas campanhas |
| `/login`, `/cadastro` | Entrar e criar conta de fã |
| `/conta`, `/conta/senha` | Minha conta e trocar senha |

## Estrutura

```
src/
  app/                    rotas (App Router)
    [artista]/(fan)/      área do fã (usa FanShell)
    [artista]/admin/      admin do fã clube
    admin/                admin master
    patrocinador/         portal do patrocinador
    actions/              server actions (login, admin, fã) que chamam a API
  proxy.ts                porteiro das rotas (login obrigatório e acesso por tipo de conta)
  components/
    fan/                  componentes da área do fã (tema por artista)
    admin/                componentes dos painéis (visual neutro)
    icons.tsx             ícones SVG
  lib/
    types.ts              tipos do domínio (espelham a API)
    api.ts                camada de dados (FastAPI com API_URL; mock sem)
    auth.ts               sessão/JWT e regras de acesso por rota
    mock.ts               dados de exemplo
    themes.ts             temas por artista (variáveis --fc-*)
    format.ts             formatação (R$, números)
  fonts/                  fontes self-hosted (licença OFL)
```

### Tema por artista

Os componentes da área do fã usam só tokens (`bg-paper`, `text-ink`, `bg-accent`, `font-display`...). Os valores vêm de `src/lib/themes.ts` e são aplicados pelo `FanShell` como variáveis CSS. Para um artista novo, crie um tema e associe ao `Artist`. Nenhum componente precisa mudar.

### Integração com o back

Leituras: cada função de `src/lib/api.ts` indica o endpoint que chama (ex.: `GET /artists/{slug}/posts?kind=drop`), sempre com o token do login.
Escritas: as telas chamam server actions em `src/app/actions/` (o token nunca vai para o navegador). Sem API, as ações devolvem `status: 0` e as telas só simulam.

Ainda sem back: busca de fotos do Photo Finder, validação de ingresso, checkout da loja e áudio do Drops Hits (marcados com `// TODO:`).

## Deploy (servidor)

O `docker-compose.yml` sobe banco (Postgres), API, site e Caddy (HTTPS automático). O back precisa estar clonado **ao lado** do front:

```bash
git clone https://github.com/PicBrandDev/front-super-fas.git
git clone https://github.com/PicBrandDev/back-super-fas.git
cd front-super-fas
cp .env.example .env    # preencha POSTGRES_PASSWORD, JWT_SECRET e SEED_PASSWORD
sudo docker compose up -d --build
sudo docker compose logs api   # mostra as contas de teste criadas na primeira subida
```

A documentação da API fica em `https://fa-clube.picbrand.com.br/api/docs`.

## Conteúdo de exemplo

Textos entre colchetes (`[PREÇO]`, `[Local do evento]`, `[Marca A]`...) são placeholders para trocar pelos dados reais.
