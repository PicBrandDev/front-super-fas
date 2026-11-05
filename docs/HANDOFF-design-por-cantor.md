# Handoff para o Gabriel: como subir o design de cada cantor

Este documento mostra **onde o design de um cantor mora no código**, **quais são as telas do fã e do admin** (com a rota e o arquivo de cada uma) e **o que mudou nas últimas atualizações**. A lógica (API, ações, banco) fica com a Julia: para o design você mexe só em tema, pele, CSS, marca e nos componentes de tela.

Referências que já existem: `docs/visual-noite.md` (tokens e vocabulário da área do fã) e `docs/guia-de-telas.html` (guia das telas).

---

## 1. Como o design de um cantor funciona (4 camadas)

| Camada | Arquivo | O que define |
| --- | --- | --- |
| **Tema** (cores e fontes) | `src/lib/themes.ts` | Os tokens `--fc-*` do cantor: fundo, superfície, fios, texto, acento, cores de apoio e, opcional, o cabeçalho (`mast`, `mastInk`, `mastRule`). Ex.: `vintageTheme`, `departamentoTheme`, `departamentoBlueTheme`, `anittaTheme`, `anittaFeatureTheme`. |
| **Pele** (voz, marca e variações) | `src/lib/brands.ts` | Tudo que não cabe em cor, **como dado**: marca (`mark`, `adminMark`), tons dos cabeçalhos (`mastTones`, `adminMastTone`), céu das telas de assinatura (`sky`), roleta (`wheel`, `wheelSeal`), vinil (`vinyl`), cartazes do Mural no padrão do kit (`posters`, com `card` para carta de tarô), loja, hashtag, lema, textos do PicKup, artigo (`the`, `of`). |
| **CSS** (forma) | `src/app/globals.css` | Cantos, pesos, caixa alta, botões, tags e as cores dos cartazes (`--field-*`, `--card-*`). Os ajustes de um cantor ficam em `.fan[data-brand="x"] { ... }` (blocos do Departamento e da Anitta) e `.adm-noite[data-brand="x"]` (admin). |
| **Marca** (desenho) | `src/components/fan/mark-shape.ts` | O desenho da marca como `FilledMark` (`{ d, viewBox }`): estrela do Departamento, estrela de 5 pontas e sol da Anitta. `Mark`, `Vinyl`, a roleta e o menu do admin leem a marca da pele; não há mais `if (cantor)` nesses componentes. |

Como o app escolhe o cantor: `brandKeyFor(slug)` (em `brands.ts`) devolve a chave da pele. **Cantor sem pele própria usa a do Vintage.** A área do fã põe `data-brand="<chave>"` no wrapper (`src/components/fan/FanShell.tsx`), e o tema vira variáveis CSS pelo `themeStyle()`.

### Passo a passo para um cantor novo
A fonte de identidade é a pasta `<cantor>-fanzone-refs` (tokens.json, DESIGN.md, VOICE.md) e o Artifact "Fanzone <Cantor>" do Fanzone Artist Kit. A Anitta (`const anitta` em `brands.ts`) é o exemplo mais completo: copie e troque os valores.

1. **Fonte (se a identidade pedir uma):** o woff2 latin em `src/fonts` (OFL) e um `localFont` com `preload: false` em `src/app/layout.tsx` (veja `averia`). Uma fonte por cantor, nos três campos de fonte do tema. Sem fonte própria, use `var(--font-archivo)`. Avise a Julia.
2. **Tema:** em `themes.ts`, `xTheme: ArtistTheme` (e `xFeatureTheme` se Mural/PicKup tiverem outro fundo). Hex só aqui e no CSS do cantor.
3. **Pele:** em `brands.ts`, a chave em `BrandKey`, `const x: ArtistBrand`, a entrada em `BRANDS` e o slug em `BY_SLUG`. O TypeScript aponta tudo que falta (inclusive a arte do Instagram em `share-art.ts`).
   - Marca: desenhe em `mark-shape.ts` como `FilledMark` e ponha em `mark` (e em `adminMark` com as cores do quadradinho).
   - Cabeçalhos: `mastTones` troca o tom que cada tela pede (ex.: a Anitta põe tudo no vermelho `mast`; Início e Mural pedem `sky` e ficam no campo).
   - Cartazes do Mural: `posters` usa os moldes A–E do kit (glifo, linha pequena, legenda, PicKup, manchete da loja, capa). `posters.card` coloca cada molde numa carta de tarô (numeral, plaqueta, lateral).
   - Roleta `star`: `wheelSeal` (texto do selo e centro `globe` ou `sun`); o ponteiro é a `mark`.
4. **CSS:** em `globals.css`, `.fan[data-brand="x"]` com as variáveis dos cartazes (`--field-a` … `--field-e`, `-ink`, `-accent`; `--card-*` se usar carta; `--wheel-on*`) e a forma (raios, pesos, caixa alta). Para o admin, `.adm-noite[data-brand="x"]` (acento em `--pf-brand*`). Telas com bloco por cantor nos CSS Modules: PicKup, Loja, ShowStub, EventoView, Ticket, Mural (copie o bloco do Departamento ou da Anitta).
5. **Mídia:** `public/media/<slug>/` (produtos, capa, céu) e o mapa em `src/lib/media.ts`. Sem foto de pessoa sem licença.
6. **Painéis que reconhecem cantor pelo nome:** `src/components/admin/vitrines/AnuncioCard.tsx` (`artistLook`). O portal do patrocinador (`/patrocinador/nova`) já usa a pele.
7. **Modo exemplo:** o cantor em `src/lib/mock.ts > artists` para ver sem a API.
8. **Colocar no ar:** o ambiente nasce em "setup". Enquanto estiver em setup e **sem pele própria**, o fã vê a tela em branco "Em construção" (`src/components/fan/UnderConstruction.tsx`). Ao criar a pele (chave diferente de `vintage`), o design aparece; para o público ver, o master usa "Colocar no ar" em `/admin/fas-clubes`. O slug criado no admin master tem que ser o mesmo de `BY_SLUG`.
9. **Teste:** `/<slug>` (fã) e `/<slug>/admin` (admin) logado como master, em 375 px, lado a lado com o Artifact. Confira que Vintage e Departamento não mudaram. Rode `npx tsc --noEmit` e `npx eslint src`.

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

- **Fonte:** `fontDisplay`, `fontGrotesk` e `fontMono` de todo tema apontam para uma fonte só: `var(--font-archivo)`, ou a fonte de pele do cantor quando a identidade pede (Anitta: `var(--font-averia)`, Averia Serif Libre, a fonte do site oficial). Não carregue outra fonte sem avisar a Julia.
- **Cor:** nunca escreva hex de cantor num componente; use os tokens. Para outro cantor trocar o tema, o componente não pode ter cor fixa.
- **Contraste no admin:** o acento do admin (`adm-blue`) vem de `--fc-amber`. Se o acento for claro (como o branco do Departamento), botão e item ativo do menu precisam de texto escuro: ajuste em `adminTheme` (`amber`, `amberText`, `onAmber`).
- **O admin tem `data-brand`:** o wrapper do admin do ambiente recebe `data-brand="<chave>"` (via `ClubAdminShell.tsx` → `AdminShell` → prop `brandKey`). Os estilos de forma e cor do admin de um cantor ficam em `globals.css`, em `.adm-noite[data-brand="x"]`. O do Departamento (no fim do arquivo) é o modelo.
- **Acento do admin:** as cores de acento (botões, links, item ativo) dos utilitários `adm-blue*` leem `--pf-brand`, `--pf-brand-dark`, `--pf-brand-soft` e `--pf-brand-tint`, **não** os `--color-adm-blue*`. Para trocar o acento de um cantor, sobrescreva essas quatro variáveis no seletor dele (o Vintage ainda usa o azul da plataforma).
- **Modo celular no computador:** a pele aceita `phone: true` (hoje ligado em **todos** os cantores: Vintage e Departamento, e os que usam a pele do Vintage). No computador a área do fã vira uma coluna de celular de 430 px, com o topo e o menu de baixo, sem o menu lateral (`FanFrame`, `FanTopBar`, `BottomNav`, `FanSidebar`; classe `.nav-phone` em `globals.css`). Com `phone: false` (ou sem a flag), o computador mostra o menu lateral e a coluna de 600 px.
- **Avatares redondos:** `ClubAvatar`/`PersonAvatar` são círculos de propósito; se você zerar o raio global, mantenha os avatares redondos.
- **Anitta é a referência mais completa** (fonte própria, dois tons, céu, cartas de tarô, sol na roleta): `anittaTheme`/`anittaFeatureTheme`, `const anitta` em `brands.ts` e os blocos `[data-brand="anitta"]` no CSS.
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
