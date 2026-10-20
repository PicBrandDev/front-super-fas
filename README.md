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

Sem `NEXT_PUBLIC_API_URL`, o app usa os dados de exemplo de `src/lib/mock.ts`. Para ligar no back (FastAPI), copie `.env.example` para `.env.local` e defina a URL.

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
| `/admin/fas-clubes` | Admin master: fã clubes, criar artista, administradores, módulos |
| `/admin/midia` | Admin master: plataforma de mídia (vitrines, campanhas, patrocinadores) |
| `/patrocinador` | Portal do patrocinador (nova campanha) |

## Estrutura

```
src/
  app/                    rotas (App Router)
    [artista]/(fan)/      área do fã (usa FanShell)
    [artista]/admin/      admin do fã clube
    admin/                admin master
    patrocinador/         portal do patrocinador
  components/
    fan/                  componentes da área do fã (tema por artista)
    admin/                componentes dos painéis (visual neutro)
    icons.tsx             ícones SVG
  lib/
    types.ts              tipos do domínio (espelham a API)
    api.ts                camada de dados (mock hoje, FastAPI depois)
    mock.ts               dados de exemplo
    themes.ts             temas por artista (variáveis --fc-*)
    format.ts             formatação (R$, números)
  fonts/                  fontes self-hosted (licença OFL)
```

### Tema por artista

Os componentes da área do fã usam só tokens (`bg-paper`, `text-ink`, `bg-accent`, `font-display`...). Os valores vêm de `src/lib/themes.ts` e são aplicados pelo `FanShell` como variáveis CSS. Para um artista novo, crie um tema e associe ao `Artist`. Nenhum componente precisa mudar.

### Integração com o back

Cada função de `src/lib/api.ts` já indica o endpoint que vai chamar (ex.: `GET /artists/{slug}/posts?kind=drop`). Os pontos de escrita (postar, girar a roleta, assinar, validar ingresso, criar artista, enviar campanha...) estão marcados com `// TODO:` nos componentes.

## Conteúdo de exemplo

Textos entre colchetes (`[PREÇO]`, `[Local do evento]`, `[Marca A]`...) são placeholders para trocar pelos dados reais.
