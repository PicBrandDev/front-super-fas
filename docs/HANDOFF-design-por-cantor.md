# Handoff para o Gabriel: como subir o design de cada cantor

Este documento mostra **onde o design de um cantor mora no código**, **quais são as telas do fã e do admin** (com a rota e o arquivo de cada uma) e **o que mudou nas últimas atualizações**. A lógica (API, ações, banco) fica com a Julia: para o design você mexe só em tema, pele, CSS, marca e nos componentes de tela.

Referências que já existem: `docs/visual-noite.md` (tokens e vocabulário da área do fã) e `docs/guia-de-telas.html` (guia das telas).

---

## 1. Como o design de um cantor funciona (4 camadas)

| Camada | Arquivo | O que define |
| --- | --- | --- |
| **Tema** (cores e fontes) | `src/lib/themes.ts` | Os tokens `--fc-*` do cantor: fundo, superfície, fios, texto, acento, cores de apoio. Ex.: `vintageTheme`, `departamentoTheme`, `departamentoBlueTheme`. |
| **Pele** (voz e variações) | `src/lib/brands.ts` | O que não cabe em cor: nome da loja, palavra do cabeçalho, roleta (`turntable` ou `star`), tema das telas de assinatura (`toneTheme` + `toneRoutes`), tema do admin (`adminTheme`), hashtag, lema, textos do PicKup. |
| **CSS** (forma) | `src/app/globals.css` | Cantos, pesos, caixa alta, botões, tags. Os ajustes de um cantor ficam em `.fan[data-brand="x"] { ... }` (veja o bloco do Departamento, linha ~710). |
| **Marca** (logo) | `src/components/fan/mark-shape.ts` + `Mark.tsx` | O desenho da marca: chevrons (Vintage), estrela (Departamento), monograma D. Para o admin: `src/components/admin/ClubAdminShell.tsx` (quadradinho do menu). |

Como o app escolhe o cantor: `brandKeyFor(slug)` (em `brands.ts`) devolve a chave da pele. **Cantor sem pele própria usa a do Vintage.** A área do fã põe `data-brand="<chave>"` no wrapper (`src/components/fan/FanShell.tsx`), e o tema vira variáveis CSS pelo `themeStyle()`.

### Passo a passo para um cantor novo
1. **Tema:** em `themes.ts`, crie `xTheme: ArtistTheme` (copie `departamentoTheme` e troque os valores). Uma fonte só: use `var(--font-archivo)` nos três campos de fonte (veja a seção 5).
2. **Pele:** em `brands.ts`, adicione a chave em `BrandKey`, crie `const x: ArtistBrand` (tema, `adminTheme`, loja, hashtag, lema, `pickup`, `wheel`...), ponha em `BRANDS` e mapeie o slug em `BY_SLUG` (ex.: `{ "bts": "bts" }`).
3. **Marca:** desenhe o SVG em `mark-shape.ts` e trate a chave nova em `Mark.tsx` (e no quadradinho do admin em `ClubAdminShell.tsx`, hoje com um `if` para Departamento e outro para Vintage).
4. **CSS:** só o que for de forma (raio, peso, caixa alta) em `globals.css`, dentro de `.fan[data-brand="x"]`. Cor nunca com hex em componente: use `var(--fc-...)` ou as classes (`bg-night`, `text-fg`, `bg-amber`...).
5. **Logo/ícone:** arquivos em `public/` (ex.: `public/logo-vc.png`).
6. **Colocar no ar:** o ambiente nasce em "setup". Enquanto estiver em setup e **sem pele própria**, o fã vê a tela em branco "Em construção" (`src/components/fan/UnderConstruction.tsx`). Ao criar a pele (chave diferente de `vintage`), o design aparece; para o público ver, o master usa "Colocar no ar" em `/admin/fas-clubes`.
7. **Teste:** veja `/<slug>` (fã) e `/<slug>/admin` (admin) logado como master. Rode `npx tsc --noEmit` e `npx eslint src`.

---

## 2. Telas do fã (rota → arquivo)

Todas em `src/app/[artista]/(fan)/`. A casca (menu lateral, topo, navegação de baixo) é `src/components/fan/FanShell.tsx`.

| Tela | Rota | Pasta / arquivo | Observação para o design |
| --- | --- | --- | --- |
| Início | `/<slug>` | `page.tsx` | Cartaz, próximo show, blocos de PicKup, drops, loja, fã clubes e a vitrine "Início". |
| Mural | `/<slug>/mural` | `mural/` | Posts oficiais. **Um anúncio depois de cada post** (vitrine). Usa tema de assinatura no Departamento. |
| Comunidade | `/<slug>/comunidade` | `comunidade/` | Feed da galera; anúncio do fã clube a cada 2 posts e um post de notícias sorteado. |
| Fã clubes | `/<slug>/clubes` e `/<slug>/clubes/<clube>` | `clubes/` | Cards dos clubes e o mural de cada um. |
| Drops | `/<slug>/drops` | `drops/` | Prévias de músicas, votos. |
| PicKup (roleta) | `/<slug>/pickup` | `pickup/` | Roleta (`Turntable`), 4 camadas patrocinadas, vídeo antes de girar e ao pegar o brinde. |
| Loja | `/<slug>/loja` | `loja/` | Cards de produto, carrinho, pedido. Banner no topo e anúncio depois da compra. Produto sem estoque mostra "Esgotado". |
| Agenda e eventos | `/<slug>/agenda`, `/<slug>/eventos/...` | `agenda/`, `eventos/` | Shows, pacotes de experiências. |
| Caronas | `/<slug>/caronas` | `caronas/` | Ofertas e reservas. |
| Photo Finder | `/<slug>/photo-finder` | `photo-finder/` | Busca de fotos por rosto. |
| Revenda | `/<slug>/revenda` | `revenda/` | Revenda de ingressos. |
| Perfil / Membro / Meu fandom | `/<slug>/perfil`, `membro`, `meu-fandom` | pastas com o mesmo nome | Dados do fã, assinatura, fã clube dele. |
| Fãs / Conversas / Notificações | `fas/`, `conversas/`, `notificacoes/` | pastas com o mesmo nome | Perfil público, chat, avisos. |

Componentes de fã mais usados: `Masthead` (cabeçalho com a palavra cortada), `FanTopBar`, `BottomNav`, `FanSidebar`, `PostCard`, `Sheet`, `Tabs`, `Mark`, `Turntable`, `PickupLayers`, `AdCard`/`FeedAd` (anúncios). Todos em `src/components/fan/`.

---

## 3. Telas do admin

### 3.1 Admin do ambiente do cantor (`/<slug>/admin`)
Casca: `src/components/admin/ClubAdminShell.tsx` (usa `AdminShell.tsx`). O tema vem de `brand.adminTheme ?? artist.theme` e a classe `adm-noite` religa os tokens `adm-*` aos `--fc-*` do cantor (bloco `.adm-noite` em `globals.css`, linha ~90). A classe `adm-com-arte` esconde o título repetido embaixo do cabeçalho.

| Tela | Rota | Arquivo |
| --- | --- | --- |
| Fã clubes (painel) | `/<slug>/admin` | `src/app/[artista]/admin/page.tsx` + `PainelClubes.tsx` + `Destaques.tsx` |
| Analytics de um fã clube | `/<slug>/admin/analytics/<clube>` | `analytics/[clube]/page.tsx` + `src/components/admin/ClubAnalyticsView.tsx` |
| Assinantes e receita | `/<slug>/admin/membros` | `membros/page.tsx`, `ReceitaAssinaturas.tsx`, `ListaAssinantes.tsx` |
| Ranking de fãs | `/<slug>/admin/ranking` | `ranking/page.tsx`, `AnalyticsHashtag.tsx`, `RankingLeaders.tsx`, `../RankingPessoas.tsx` |
| Drop News | `/<slug>/admin/mural` | `[secao]/MuralAdmin.tsx` |
| Agenda (calendário) | `/<slug>/admin/agenda` | `[secao]/AgendaCalendario.tsx` |
| Um show | `/<slug>/admin/agenda?evento=<id>` | `[secao]/page.tsx`, `VendasShow.tsx`, `PackagesManager.tsx`, `CompradoresExperiencias.tsx` |
| Loja | `/<slug>/admin/loja` | `[secao]/LojaAdmin.tsx`, `AnaliseLoja.tsx`, `HistoricoVendasLoja.tsx` |
| Drops Hits | `/<slug>/admin/drops` | `[secao]/DropsAdmin.tsx` |
| PicKup | `/<slug>/admin/pickup` | `pickup/page.tsx`, `RoletaTeste.tsx`, `PrizeCard.tsx`, `HistoricoGiros.tsx` |
| Caronas | `/<slug>/admin/caronas` | `caronas/` |
| Vitrines | `/<slug>/admin/vitrines` | `vitrines/page.tsx`, `src/components/admin/vitrines/*` |
| Gerenciar fã clubes | `/<slug>/admin/clubes` | `clubes/` |

### 3.2 Admin de um fã clube (`/<slug>/clubes/<clube>/admin`)
Casca: `src/components/admin/FanClubShell.tsx`. Telas: visão geral, posts, PicKup, anúncios, equipe e dados do clube (pasta `src/app/[artista]/clubes/[clube]/admin/`).

### 3.3 Painéis que **não** mudam por cantor (white label)
- **Admin master:** `/admin/fas-clubes`, `/admin/midia` (`src/app/admin/`).
- **Portal do patrocinador:** `/patrocinador` (`src/app/patrocinador/`, `src/components/sponsor/`).
Esses seguem neutros (tokens `adm-*` da plataforma).

### Componentes de admin
`src/components/admin/`: `ui.tsx` (Badge, botões, campos), `ResourceManager.tsx` (listas e formulários de cadastro), `charts.tsx`, `ClubAvatar.tsx`, `AdminTopBar.tsx`, `ProfileMenu.tsx`.

---

## 4. O que mudou nas últimas atualizações (para você revisar o visual de cada cantor)

**Em todo o site**
- **Uma fonte só:** a **Archivo**, a mesma do cabeçalho, em tudo (títulos, rótulos, números, painéis). Playfair, DM Mono e IBM Plex saíram. Os números usam `tabular-nums`.
- **Selo verificado do dono de fã clube:** `src/components/VerifiedSeal.tsx` (círculo azul com visto), no canto da foto (`PersonAvatar`, `ClubAvatar`). Aparece em posts, ranking, painel e no menu do próprio dono.
- **"Em construção":** ambiente em setup sem pele própria mostra tela branca (`UnderConstruction.tsx`).

**Vitrines (anúncios), 13 por cantor:** modal de entrada, Início, Mural (a cada post), fã clubes (a cada 2 posts), notícias (sorteada), 4 camadas da roleta, vídeo antes de girar, vídeo ao pegar o brinde, topo da loja e depois da compra. Os blocos de anúncio (`FeedAd`, `PickupLayers`) precisam combinar com o visual de cada cantor.

**Admin do ambiente**
- **Topo com a arte:** a mesma arte do app (palavra da seção cortada pela borda) em todas as telas, em `AdminTopBar.tsx`. As palavras ficam no objeto `MAST_WORD` de `ClubAdminShell.tsx`. O título repetido abaixo foi escondido por CSS (`.adm-com-arte [data-page-header]`).
- **Painel:** cards de resumo em faixa (5 colunas), destaques abaixo, cards dos clubes com assinantes e receita.
- **Assinantes e receita:** receita mensal, projeção, gráfico de 6 meses.
- **Ranking:** analytics da hashtag no topo, depois o ranking de pessoas.
- **Agenda:** calendário de peças (um dia por peça); o show abre com dados em lista, vendas, pacotes e compradores.
- **Loja:** abas Produtos, Análise (funil, gráficos) e Histórico; estoque nos cards.
- **PicKup:** a roleta do admin gira para teste.
- **Vitrines:** aluguéis agrupados por patrocinador, com views e cliques.

---

## 5. Regras e armadilhas

- **Fonte:** `fontDisplay`, `fontGrotesk` e `fontMono` de todo tema apontam para `var(--font-archivo)`. Não carregue outra fonte sem avisar a Julia.
- **Cor:** nunca escreva hex de cantor num componente; use os tokens. Para outro cantor trocar o tema, o componente não pode ter cor fixa.
- **Contraste no admin:** o acento do admin (`adm-blue`) vem de `--fc-amber`. Se o acento for claro (como o branco do Departamento), botão e item ativo do menu precisam de texto escuro: ajuste em `adminTheme` (`amber`, `amberText`, `onAmber`).
- **O admin tem `data-brand`:** o wrapper do admin do ambiente recebe `data-brand="<chave>"` (via `ClubAdminShell.tsx` → `AdminShell` → prop `brandKey`). Os estilos de forma e cor do admin de um cantor ficam em `globals.css`, em `.adm-noite[data-brand="x"]`. O do Departamento (no fim do arquivo) é o modelo.
- **Acento do admin:** as cores de acento (botões, links, item ativo) dos utilitários `adm-blue*` leem `--pf-brand`, `--pf-brand-dark`, `--pf-brand-soft` e `--pf-brand-tint`, **não** os `--color-adm-blue*`. Para trocar o acento de um cantor, sobrescreva essas quatro variáveis no seletor dele (o Vintage ainda usa o azul da plataforma).
- **Avatares redondos:** `ClubAvatar`/`PersonAvatar` são círculos de propósito; se você zerar o raio global, mantenha os avatares redondos.
- **Departamento é a referência** de um cantor com pele própria: veja `departamentoTheme`, `departamentoBlueTheme`, o bloco `.fan[data-brand="departamento"]` (área do fã) e `const departamento` em `brands.ts`.
- **Admin do Departamento (modelo de admin por cantor):** menu lateral e topo em azul elétrico (#0000FF, tinta branca; o topo usa `tone="electric"` no `Masthead`), área dos dados em papel branco (#F0F0F0 / #FFFFFF) com tinta preta, cantos retos, títulos em caixa alta 900, etiquetas em caixa alta (`data-badge` no `Badge`), botão primário azul com texto branco que inverte no hover. Avatares redondos (`data-avatar`). Tudo em `.adm-noite[data-brand="departamento"]`.

---

## 6. Como rodar para ver o design

- **Front:** `npm run dev` em `front-super-fas` (porta 3000). **Back:** `uvicorn app.main:app --port 8000` em `back-super-fas`. O front fala com o back por `API_URL`.
- Entre como **admin master** para ver qualquer ambiente (inclusive os em construção).
- Rotas para conferir cada cantor: `/<slug>` (fã), `/<slug>/mural`, `/<slug>/pickup`, `/<slug>/loja`, `/<slug>/admin`, `/<slug>/admin/vitrines`.
- Antes de subir: `npx tsc --noEmit` e `npx eslint src`.

## 7. Checklist por cantor

- [ ] Tema criado (`themes.ts`) e pele criada (`brands.ts`), slug mapeado em `BY_SLUG`
- [ ] Marca desenhada e usada no app e no menu do admin
- [ ] CSS de forma em `.fan[data-brand="x"]` (e `.adm-noite[data-brand="x"]` se quiser no admin)
- [ ] Fã: Início, Mural, PicKup, Loja, Agenda e Perfil revisados
- [ ] Anúncios (`FeedAd`, camadas da roleta, modal de entrada) combinando com o visual
- [ ] Admin: Fã clubes, Assinantes, Ranking, Agenda, Loja, PicKup e Vitrines revisados (contraste do acento!)
- [ ] Selo verificado visível sobre a foto
- [ ] `tsc` e `eslint` limpos; Julia avisada para "Colocar no ar"
