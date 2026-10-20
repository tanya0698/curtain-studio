// The business's own WhatsApp number — this is public contact info (the same
// number the WhatsApp product catalogue already runs on), not a secret, so
// it's fine as a plain client-side constant.
export const BUSINESS_WHATSAPP_NUMBER = '+263787541207';

// Builds a wa.me deep link with a pre-filled message. `phone` may be in any
// human-entered format (spaces, dashes, leading 0, with/without +) — wa.me
// only accepts digits with a country code, so we strip everything else.
// Numbers stored in local format (e.g. "0787541207") are assumed Zimbabwean
// and get the country code prefixed.
export const buildWhatsAppLink = (phone: string, message: string): string => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `263${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};
