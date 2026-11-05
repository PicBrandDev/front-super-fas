---
name: subir-pele-cantor
description: Sobe a identidade visual de um cantor (pasta <cantor>-fanzone-refs + Artifact "Fanzone <Cantor>" do Fanzone Artist Kit) para o app de fã clubes, como pele nova em src/lib/brands.ts, sem mudar layout nem função e sem alterar Vintage e Departamento. Use quando pedirem para "subir", "aplicar" ou "transformar em código" a estilização ou o design de um cantor ou artista.
---

# Subir a pele de um cantor

O app é white label: as telas, as rotas e a lógica são as mesmas para todo cantor. Um cantor novo é **dado**, não componente novo. O passo a passo detalhado, o mapa de arquivos e as armadilhas estão em `docs/HANDOFF-design-por-cantor.md`. Leia antes de editar.

## Entradas
- A pasta de identidade `Documents/<cantor>-fanzone-refs/`. Leia o `AGENTS.md` dela primeiro e depois `tokens.json`. Em conflito, `tokens.json` vence. As regras duras dela valem (paleta fechada, fonte, proibidos).
- O Artifact "Fanzone <Cantor>". Para ver localmente, `fanzone-artist-kit/dist/<cantor>/artifact.html`, servido por http. Ele mostra o resultado esperado de cada tela.
- O `origin/main` atualizado. Faça o fetch antes e trabalhe numa worktree `feat/<cantor>` a partir dele. **Não mude estilos que a Julia mudou.** Se a pele pedir algo que o padrão não comporta, a mudança vai como opção da pele (campo novo em `ArtistBrand` ou variável CSS com o valor antigo de padrão), nunca trocando o padrão.

## Roteiro
1. **Tema** em `src/lib/themes.ts` (`xTheme` e, se Mural e PicKup tiverem outro fundo, `xFeatureTheme`). Para o de-para de papéis, use `MIGRATION-MAP.md` da pasta.
2. **Fonte** (ou par display + texto), se a identidade pedir: o woff2 latin em `src/fonts`, a partir do pacote `@fontsource/<fonte>` (`npm pack` numa pasta temporária, só copie os arquivos). Depois um `localFont` com `preload: false` em `src/app/layout.tsx`.
3. **Pele** em `src/lib/brands.ts`: copie `const anitta` (tema escuro, carta de tarô) ou `const veigh` (tom claro, par de fontes, arte oficial no cartaz B) e troque os valores. O `tsc` aponta o que falta.
4. **Marca** em `src/components/fan/mark-shape.ts`, como `FilledMark`. Marque com `TODO oficial` todo desenho aproximado.
5. **CSS**: o bloco `.fan[data-brand="x"]` (variáveis `--field-*` e `--card-*`, mais a forma) e o `.adm-noite[data-brand="x"]` no `globals.css`. Depois os blocos `[data-brand="x"]` nos CSS Modules das telas que o Artifact pinta diferente.
6. **Mídia** em `public/media/<slug>/` e `src/lib/media.ts`. Use só arquivos da pasta de identidade, nunca foto de pessoa sem licença. Converta PNG grande para JPG de cerca de 900 px.
7. **Modo exemplo**: o cantor em `src/lib/mock.ts`. **Nome no admin**: `artistLook` em `AnuncioCard.tsx`.
8. **Divergências**: o que o app decidir diferente da pasta vai para `00-brand/GAPS.md` da pasta de identidade.

## Verificação (obrigatória)
- `npx tsc --noEmit` e `npx eslint src`, sem erros novos.
- Rode o app com `npm run dev` em modo exemplo, sem `API_URL`, a 375 px. Num tema de tom claro, confira que nada some no papel (texto herdado, linhas da roda). Compare Início, Mural (as 5 cartas), Drops, PicKup, Agenda, Evento, Loja, Comunidade e o admin com o Artifact.
- **Os cantores que já existem (Vintage, Departamento, Anitta…) não podem mudar.** Suba o `origin/main` numa worktree temporária em outra porta e compare, rota a rota, a impressão digital dos estilos computados de cada elemento visível: tag, texto, cores, fonte, peso, tamanho, raio, bordas e tamanho do elemento. Use um iframe de 375 px e espere as fontes carregarem. Tudo fora dos SVGs tem que ser idêntico. Nos SVGs, confira que a caixa de cada `path` é a mesma. Remova a worktree temporária no fim.
- Commit no branch `feat/<cantor>`. Push e PR só com o OK do usuário.
