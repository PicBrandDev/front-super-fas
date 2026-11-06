/** Termo de confidencialidade dos ambientes de demonstração (texto, versão e quais ambientes pedem o aceite). */

/** Ambientes que abrem com o termo. Para incluir outro (ex.: "anitta"), acrescente o slug. */
export const TERMS_GATED = ["vintage-culture", "departamento"];

/** Troque a versão ao mudar o texto: quem aceitou a anterior aceita de novo. */
export const TERMS_VERSION = "2026-11-06";

export const termsKey = (slug: string) => `terms-ok:${slug}:${TERMS_VERSION}`;

export const TERMS_INTRO =
  "Este ambiente é uma demonstração privada da PicBrand. Leia o termo abaixo e informe seu CPF para continuar.";

export const TERMS_SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. O que é este ambiente",
    body: [
      "Este Super Fãs é um webapp de apresentação, feito pela PicBrand para mostrar aos donos e às equipes de cada artista como seria o fã clube oficial e quais são as oportunidades de negócio.",
      "Não é um produto aberto ao público. As telas, os números, os fãs, os posts, os anúncios, os produtos e os patrocinadores que aparecem aqui são exemplos criados para a demonstração.",
    ],
  },
  {
    title: "2. Propriedade e proteção da ideia",
    body: [
      "O conceito, o nome, a identidade visual, o design das telas, os fluxos de uso, os textos, o código e as funcionalidades deste ambiente pertencem à PicBrand e são protegidos pela Lei de Direitos Autorais (Lei 9.610/98) e pela Lei do Software (Lei 9.609/98).",
      "Marcas, nomes e imagens de artistas e de patrocinadores aparecem só para ilustrar a proposta. Isso não significa parceria, patrocínio ou endosso de nenhum deles.",
    ],
  },
  {
    title: "3. O que você se compromete a não fazer",
    body: [
      "Copiar, reproduzir, imitar ou usar total ou parcialmente o conceito, o design, os fluxos, os textos ou o código deste ambiente em outro produto, projeto ou proposta.",
      "Apresentar a ideia como própria ou levá-la a terceiros, concorrentes ou fornecedores para ser refeita.",
      "Fazer engenharia reversa, extrair dados ou código, ou automatizar a coleta do conteúdo.",
      "Divulgar o link, gravações de tela ou capturas de tela fora da sua equipe, sem autorização por escrito da PicBrand.",
    ],
  },
  {
    title: "4. Confidencialidade",
    body: [
      "Tudo o que você vê aqui é confidencial e foi mostrado só para avaliar uma possível parceria. Compartilhe apenas com quem precisa participar da decisão, e peça a essas pessoas que sigam este mesmo termo.",
      "O dever de sigilo continua mesmo que a negociação não avance.",
    ],
  },
  {
    title: "5. Seus dados (LGPD)",
    body: [
      "Pedimos seu CPF para identificar quem acessou esta demonstração e comprovar que o termo foi aceito. Guardamos o CPF, o ambiente acessado, a data e hora e o endereço de IP do aceite.",
      "Usamos esses dados só para registrar o aceite deste termo e para proteger a propriedade intelectual da PicBrand, com base na Lei Geral de Proteção de Dados (Lei 13.709/2018). Não vendemos nem compartilhamos o CPF para outros fins. Para pedir informações ou a exclusão, fale com a PicBrand.",
    ],
  },
  {
    title: "6. Aceite",
    body: [
      "Ao informar seu CPF e marcar a caixa de aceite, você declara que leu e concorda com este termo. O aceite eletrônico vale como assinatura. O uso indevido pode gerar responsabilização civil e criminal, nos termos da lei.",
    ],
  },
];

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

/** 000.000.000-00 enquanto a pessoa digita. */
export function maskCpf(s: string): string {
  const d = onlyDigits(s).slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/** 11 dígitos, não repetidos, com os dois dígitos verificadores certos. */
export function cpfValido(s: string): boolean {
  const d = onlyDigits(s);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const n of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    if (Number(d[n]) !== ((soma * 10) % 11) % 10) return false;
  }
  return true;
}
