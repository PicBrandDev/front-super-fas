# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Fã** (18 a 35 anos, Brasil): usa quase sempre no celular, muitas vezes à noite e em eventos, com internet instável. Lê novidades do artista, posta, vai aos shows, gira a roleta, compra na loja e, na revenda, compra ou vende ingresso de show esgotado.
- **Equipe do fã clube** (dono e ajudantes), **equipe do artista** (fã clube master, admin do ambiente), **admin master** (PicBrand) e **patrocinador**: trabalham nos painéis neutros da plataforma.

## Product Purpose

Plataforma white label de fã clubes ("Super Fãs", nome provisório, da PicBrand). Cada artista ganha um ambiente próprio, com a cara dele, em formato de rede social mobile: mural, comunidade, agenda com brindes, PicKup da sorte (roleta), loja, drops, Photo Finder, assinatura de membro, anúncios e revenda de ingressos entre fãs. O primeiro artista é o DJ Vintage Culture.

## Positioning

O ambiente é do artista e dos fã clubes dele, não um app genérico de ingressos ou rede social: tudo (inclusive a revenda) acontece dentro da comunidade, entre fãs que fazem parte de fã clubes e têm histórico no app.

## Operating Context

- Duas camadas visuais que nunca se misturam: o ambiente do artista (tema do artista, área do fã em `/[artista]/...`) e a plataforma (entrada, login neutro, painéis, portal do patrocinador).
- Revenda de ingressos: só abre quando o show esgota na ticketeira oficial e o admin do ambiente libera. Dinheiro retido pela plataforma (escrow) até o comprador confirmar. Preço máximo é o valor de face; reserva de 15 min; o vendedor transfere pela ticketeira em até 24h ou até 2h antes do show; o comprador confirma em até 48h ou abre disputa; taxa descontada do vendedor. Contrato da API em `back-super-fas/docs/revenda-ingressos-frontend.md`.
- Pagamento da revenda hoje é simulado; o gateway real entra depois sem mudar as telas.

## Capabilities and Constraints

- Next.js (App Router) com server actions; API FastAPI separada (`back-super-fas`). Sem `API_URL` o front usa dados de exemplo (`src/lib/mock.ts`).
- Valores em centavos, prazos e preços calculados pelo back; o front só mostra o que vem pronto e só mostra ações quando a flag do back permite.
- O comprador nunca vê CPF, telefone ou e-mail do vendedor; o vendedor só vê o @ e o nome abreviado do comprador. Códigos e prova do ingresso só o admin vê.
- Aberto: verificação do ingresso direto na ticketeira (o verificador do back é um stub; hoje a conferência é manual pelo admin).

## Brand Commitments

- Cada artista tem o próprio tema; nunca escrever um hex do artista num componente (tokens `--fc-*`).
- Vintage Culture: marca de três chevrons como único ornamento; voz curta, afirmativa, de clube ("Culture is the answer").
- Textos da interface em português do Brasil.

## Evidence on Hand

- Fotos do artista e de produtos em `public/media/<slug>/`; protótipo de referência `fanzone.html` na pasta `vintage-culture-fanzone-refs` (fora do repo).
- Não há depoimentos, números de vendas nem selos de parceria com ticketeiras: não inventar.

## Product Principles

1. Dentro da comunidade: tudo leva o fã de volta ao artista e ao fã clube dele.
2. Confiança antes de conversão nas telas de dinheiro: mostrar quem é o outro lado, o que acontece com o dinheiro e qual é o próximo prazo, sempre com o valor que cabe a cada um.
3. O back decide regras, preços e prazos; o front explica com clareza e nunca promete o que a API não garante.
4. Celular à noite, em evento, com internet ruim: cada tela tem que funcionar com uma mão, em pouca luz e com carregamento lento.

## Accessibility & Inclusion

Alvos de toque de pelo menos 44px, botões e links de verdade, `aria-label` em botões só de ícone, respeito a reduced motion.
