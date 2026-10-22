# Super Fãs — Front (Next.js)

Web app de fã clubes multifandom. Cada cantor tem um **ambiente** (com visual próprio) com até **10 fã clubes**: o **master** e mais 9. O primeiro ambiente é o **Vintage Culture**.

## Como se organiza

```
Plataforma (admin master da PicBrand) — cria os cantores
└─ Ambiente do cantor (ex.: Vintage Culture)
   ├─ Conteúdo oficial: agenda, loja, Drop News, Drops Hits, benefícios, anúncios do ambiente
   │    → administrado pela equipe do fã clube master (o dono do master é o "admin master do cantor")
   ├─ Fã clube master  ─┐
   ├─ Fã clube 2 … 10  ─┴─ cada um: 1 dono + ajudantes; membros, mural da galera, PicKap e anúncios próprios
   └─ Assinatura de membro → paga ao ambiente do cantor
```

O fã entra em quantos fã clubes quiser (grátis). Ao se cadastrar, já entra no master do cantor escolhido.

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
| Fã | `/` (lista de cantores) | área do fã de qualquer cantor no ar |
| Equipe do fã clube master (admin master do cantor) | `/[artista]/admin` | administração do ambiente + painel de todos os fã clubes daquele cantor |
| Dono / ajudante de um fã clube | `/[artista]/clubes/[clube]/admin` | painel do seu fã clube |
| Quem está em mais de uma equipe | `/painel` (escolhe) | os painéis das suas equipes |
| Patrocinador | `/patrocinador` | portal do patrocinador + área do fã |
| Admin da plataforma | `/admin/fas-clubes` | tudo |

- Fãs se cadastram sozinhos em `/cadastro`.
- A equipe é **convidada**: o admin da plataforma convida o dono do fã clube master; o dono do master cria os outros fã clubes e escolhe o dono de cada um; cada dono convida seus ajudantes. Patrocinadores são convidados pelo admin da plataforma. O convite cria a conta e mostra uma **senha provisória** uma única vez; no primeiro login a pessoa escolhe a própria senha.
- Quem entra numa equipe nova precisa sair e entrar de novo para o login reconhecer o acesso novo.
- O porteiro das rotas é `src/proxy.ts` (confere o token do cookie `sf_session`). Quem garante as permissões de verdade é a API.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Entrada da plataforma (lista de fã clubes e painéis) |
| `/[artista]` | Início do ambiente (anúncio, Drop News, próximo show, seus fã clubes, atalhos) |
| `/[artista]/clubes` | Fã clubes do cantor (entrar/sair) |
| `/[artista]/clubes/[clube]` | Página do fã clube: mural da galera, anúncio do clube, PicKap do clube |
| `/[artista]/mural` | Mural: Drop News, feed da galera, posts do Instagram |
| `/[artista]/agenda` | Agenda de shows |
| `/[artista]/eventos/[id]` | Evento: sorte do evento, brindes, onde comprar |
| `/[artista]/pickap?clube=` | PicKap da sorte (roleta de cada fã clube) |
| `/[artista]/loja` | Loja virtual |
| `/[artista]/drops` | Drops Hits (prévias) |
| `/[artista]/photo-finder` | Photo Finder |
| `/[artista]/membro` | Plano "Tornar membro" (R$ 16,90/mês) |
| `/[artista]/admin/membros` | Ambiente: assinantes |
| `/[artista]/admin/clubes` | Ambiente: os até 10 fã clubes (criar, dono, no ar, apagar) |
| `/[artista]/admin/mural` | Ambiente: Drop News e moderação |
| `/[artista]/admin/agenda` | Ambiente: shows (e, em cada show, onde comprar e brindes) |
| `/[artista]/admin/loja` | Ambiente: produtos |
| `/[artista]/admin/drops` | Ambiente: prévias do Drops Hits |
| `/[artista]/admin/beneficios` | Ambiente: benefícios de membro |
| `/[artista]/admin/anuncios` | Ambiente: vitrines e campanhas do ambiente |
| `/[artista]/clubes/[clube]/admin/membros` | Fã clube: membros |
| `/[artista]/clubes/[clube]/admin/mural` | Fã clube: moderação do mural da galera |
| `/[artista]/clubes/[clube]/admin/pickap` | Fã clube: fatias da roleta |
| `/[artista]/clubes/[clube]/admin/anuncios` | Fã clube: vitrines e campanhas do clube |
| `/[artista]/clubes/[clube]/admin/equipe` | Fã clube: dono e ajudantes |
| `/[artista]/clubes/[clube]/admin/dados` | Fã clube: nome, cidade, descrição |
| `/painel` | Escolher painel (quem está em mais de uma equipe) |
| `/admin/fas-clubes` | Admin da plataforma: cantores, criar cantor (com a equipe do fã clube master), módulos |
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

### Marca da plataforma (white label)

Painéis, portal do patrocinador e telas de conta usam `src/lib/platform.ts`: nome, selo, legenda e cor vêm das variáveis `NEXT_PUBLIC_PLATFORM_*` (ver `.env.example`). A cor vira `--pf-brand` no `<html>` e alimenta os tokens `adm-blue*` do `globals.css`. O componente `PlatformBrand` desenha o selo.

As telas de login, cadastro, minha conta e senha usam o tema do artista (sistema Noite, ver `docs/visual-noite.md`) quando a pessoa vem do ambiente dele (`?artista=` ou o `next=` do login); fora disso, o visual neutro. Ver `src/lib/authArtist.ts` e `AuthShell`.

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

Para **atualizar** um servidor que já está no ar (o banco e as fotos ficam nos volumes do Docker; as tabelas e colunas novas são criadas sozinhas na subida da API):

```bash
cd back-super-fas  && git pull
cd ../front-super-fas && git pull
sudo docker compose up -d --build
sudo docker compose logs -f api   # confira que subiu sem erro
```

Os recursos de e-mail, Photo Finder (AWS) e ranking do Instagram vêm desligados; veja as variáveis opcionais no `.env.example`.

A documentação da API fica em `https://fa-clube.picbrand.com.br/api/docs`.

## Conteúdo de exemplo

Textos entre colchetes (`[PREÇO]`, `[Local do evento]`, `[Marca A]`...) são placeholders para trocar pelos dados reais.
