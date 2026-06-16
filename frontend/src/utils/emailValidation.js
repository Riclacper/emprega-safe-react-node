const COMMON_TLD_TYPOS = new Set(["cmo", "con", "comm", "xom", "vom"]);

export function validateEmail(value) {
  const email = String(value || "")
    .trim()
    .toLowerCase();
  const parts = email.split("@");

  if (
    email.length > 254 ||
    parts.length !== 2 ||
    !parts[0] ||
    !parts[1] ||
    parts[0].length > 64 ||
    !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(parts[0]) ||
    !/^(?=.{1,253}$)(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i.test(parts[1])
  ) {
    return {
      valid: false,
      messageKey: "auth.invalidEmail",
      message: "Informe um e-mail válido.",
    };
  }

  const tld = parts[1].split(".").at(-1);

  if (COMMON_TLD_TYPOS.has(tld)) {
    return {
      valid: false,
      messageKey: "auth.emailDomainTypo",
      message: "Verifique o domínio do e-mail. Você quis dizer .com?",
    };
  }

  return { valid: true, email };
}
