export function formatCurrency(value, currency = "BRL") {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "Não informado";
  }

  const localeByCurrency = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };

  const safeCurrency = ["BRL", "USD", "EUR"].includes(currency)
    ? currency
    : "BRL";

  return new Intl.NumberFormat(localeByCurrency[safeCurrency], {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export function formatTime(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}
