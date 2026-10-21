# Visual "Noite" da área do fã

A área do fã (`/[artista]/...`) copia o protótipo `fanzone.html` (pasta de
referências `vintage-culture-fanzone-refs`, fora do repo): tema escuro,
âmbar como único acento, serifa pesada contra grotesca caixa alta, fios de
1px, cantos de 2px, sem sombra, sem glow, sem gradiente. Os painéis
(admin, patrocinador) continuam neutros (white label, tokens `adm-*`).

## Tokens (Tailwind, via `--fc-*` em `src/lib/themes.ts`)

| Uso | Classe | Vintage Culture |
| --- | --- | --- |
| fundo da tela | `bg-night` | #120907 |
| campos, folhas | `bg-surface` | #1C1311 |
| superfície elevada / evento passado | `bg-raised` | #281D19 |
| fio padrão | `border-line` | #3A2E29 |
| fio forte (tag, avatar, input) | `border-line-strong` | #8A7B73 |
| texto | `text-fg` | #F6F1EC |
| texto secundário | `text-fg-muted` | #B8AAA1 |
| acento (botão primário, ativo) | `bg-amber` / `text-amber-text` | #FE9900 |
| texto sobre amber/sun | `text-on-amber` | #120907 |
| amarelo (PicKap, selo, tag key) | `bg-sun` | #FCCA0B |
| alerta, "últimos lotes", curtida | `text-signal` | #E5574D |
| azul profundo (cartaz, Photo Finder, Loja) | `bg-lagoon-deep` | #29495D |
| cinza metálico (ações do post) | `text-chrome` | #8C9898 |
| cinza chapado do cartaz | `bg-poster-grey` | #9E9E9E |
| claro quase branco (cartaz da loja) | `bg-mist` | #E5E5E8 |
| o mais escuro (texto sobre amber/sun/mist) | `text-ink` | #120907 |
| branco | `text-paper` | #FFFFFF |

Fontes: `font-display` (Playfair Display 400–900 + itálico), `font-grotesk`
(Archivo 100–900), `font-mono` (DM Mono 400/500). Raios: `rounded-hair` (2px),
`rounded-field` (6px), `rounded-device` (20px). Espaço: 4, 8, 12, 16, 24, 32,
48, 64 (`p-1 p-2 p-3 p-4 p-6 p-8 p-12 p-16`).

Em CSS puro, use as variáveis: `var(--fc-amber)`, `var(--fc-font-display)`...
Nunca escreva um hex do artista num componente: outro artista troca o tema.

## Vocabulário (classes em `src/app/globals.css`, só dentro de `.fan`)

- Vozes: `.mono` (11/14 mono caixa alta, tracking .12em, muted), `.poster`
  (Archivo 800 caixa alta), `.serif` (Playfair 900), `.num` (tabular).
- Botões: `.btn` + `.btn-primary` | `.btn-outline` | `.btn-ghost`; `.btn-sm`,
  `.btn-block`. Links também podem ser `.btn`.
- `.tag` (+ `.tag-hot` vermelho, `.tag-key` amarelo cheio, `.tag-demo` apagado).
- `.act` (+ `.like` / `.rp`, `aria-pressed`) para curtir, comentar, repostar.
- `.avatar` (32px, iniciais mono), `.verified` (check + "Oficial" em muted).
- `.field` (input/textarea), `.go` (link sublinhado âmbar), `.ok`, `.err`, `.back`.
- Abas: componente `Tabs` (`.tabs/.tab/.slot`).
- Cabeçalho: componente `Masthead` (`.mast/.mast-word`), a palavra da seção
  cortada pela borda, que desliza com a aba ativa.
- Menu de baixo: `BottomNav` (`.nav/.deck/.key/.led`), cinco teclas.
- Folha e aviso: `Sheet` + `SheetOption` (`.scrim/.sheet/.opts/.opt/.row`),
  `useToast()` (`.toast`).
- Marca: `Mark` (três chevrons, só linha). Vinil: `Vinyl`.
- Ícones: `Icon` (em `.fan` ficam com traço 1.6 e pontas retas). Novos:
  `arrow`, `pin`, `clock`, `play`, `pause`.

## Fotos

`src/lib/media.ts` mapeia as fotos de cada artista (em `public/media/<slug>/`):
`mediaFor(slug).hero` (foto do artista), `.press[]` (imprensa),
`productImage(slug, product, i)`, `postImage(slug, post, i)`, `eventPhoto(slug, i)`.
Quando a API mandar `image`, ela tem prioridade.

## Regras do protótipo que valem aqui

1. Plano e angular: fios de 1px, cantos de 2px, sem sombra, sem glow, sem gradiente.
2. Uma nota vintage (serifa, vinil) e uma futurista (grotesca caixa alta, mono) por tela; resto em silêncio.
3. Cor com economia: só o estado que importa leva cor. No máximo dois acentos por cartaz.
4. Tipografia como imagem: manchetes grandes cortadas pela borda (em `cqw` da largura do cartaz), com a informação legível no corpo.
5. A marca dos três chevrons é o único ornamento. Nunca preencher, girar ou engrossar.
6. Alvos de toque ≥ 44px; `<button>`/`<a>` de verdade; `aria-label` em botão só de ícone.
7. Reduced motion: sem deslizes e sem giros; o resultado aparece pronto.

Anti-referências: cartões arredondados idênticos, pílulas, glow, gradientes,
ícones preenchidos, tudo centralizado, sombras suaves, emoji como decoração.
