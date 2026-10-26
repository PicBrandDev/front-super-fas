---
version: 1
slug: "src-app-artista-fan-revenda"
primary_target: "src/app/[artista]/(fan)/revenda"
related_targets: ["src/app/[artista]/(fan)/agenda"]
---

# Revenda de ingressos (área do fã)

Escopo: `/[artista]/revenda` (hub, show, anúncio, vender, meus anúncios, pedidos, pedido, vendedor, identidade) e o ingresso em Meus ingressos da Agenda. Modo: Operate. Mundo: visual Noite já existente (docs/visual-noite.md), sem mudança de sistema.

Público e tarefa: fã no celular, à noite, com internet ruim, comprando ou vendendo ingresso de show esgotado com dinheiro retido pela plataforma. Precisa saber a cada momento onde está o dinheiro, qual o próximo prazo e qual a única coisa a fazer. Regras, preços, prazos e flags vêm prontos da API (back-super-fas/docs/revenda-ingressos-frontend.md).

Restrições: não existe ID autenticado pela ticketeira (verificador do back é stub); o ingresso mostra o Nº do pedido e "anúncio conferido pela equipe", com espaço para o ID da ticketeira quando houver integração. Nunca CPF, telefone ou e-mail de ninguém. Pagamento simulado hoje.

Momento memorável: o carimbo da etapa batendo no ingresso.

Em aberto: integração com ticketeira (Sympla com token do produtor), repasse após o show.

## Direction contract

THESIS: O ingresso é a tela. Cada etapa do pedido carimba o próprio ingresso (Reservado, Pago, Transferido, Confirmado) e nada some, só ganha carimbo. Recusa o checkout de marketplace com cards empilhados e stepper colorido.

OWN-WORLD: Noite: fundo night, fios de 1px, cantos de 2px. O ingresso é um objeto de papel num campo chapado do próprio show (um dos campos do tema, escolhido pelo id do evento), nome da cidade em Playfair 900 cortado pela borda, picote tracejado com dois recortes, canhoto em surface. Carimbo: moldura de 1px em mono caixa alta, sem preenchimento, cor só do estado (âmbar pago, sun transferido, signal disputa, muted encerrado).

STORY: O comprador vê o ingresso, o carimbo da etapa, quanto pagou e até quando cada lado tem que agir; confirma ou abre disputa. O vendedor vê quanto recebe líquido e o prazo para transferir.

FIRST VIEWPORT: 390x844. Topo: voltar + mono "Pedido Nº". O ingresso ocupa ~60% da tela: faixa do show (cidade cortada, data em serifa, tipo e quantidade), corpo com titular e Nº, carimbo da etapa no canto direito do corpo. Picote. Canhoto: valor que cabe a quem vê em número grande, o prazo com contagem, e a única ação primária em largura total. Abaixo da dobra: trilha de carimbos, cartão de confiança, regras.

FORM: carteira com carimbos, posição 6 da minha lista ordenada, seed d07d7de3. Interação assinatura: quando a etapa muda (ação ou polling), o carimbo novo bate no ingresso uma vez (escala 1.12 para 1, 180ms) e o anterior desce para a trilha; reduced motion mostra pronto. A reserva conta MM:SS no canhoto.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
