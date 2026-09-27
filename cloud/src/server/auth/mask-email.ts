/** "daniel@codext.de" → "d***@codext.de": enough to recognise the account, without disclosing the address. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${email[0]}***${email.slice(at)}`;
}
