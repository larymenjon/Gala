/**
 * Gera um identificador curto e amigável para uso em URLs públicas.
 * Não usamos a v4 completa do uuid para manter o link mais curto e fácil de compartilhar.
 */
export function generateSlug(): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'; // sem caracteres ambíguos (0,o,1,l,i)
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export function publicRsvpUrl(slug: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${window.location.origin}${base}#/r/${slug}`;
}

export function publicEventUrl(eventId: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${window.location.origin}${base}#/i/${eventId}`;
}
