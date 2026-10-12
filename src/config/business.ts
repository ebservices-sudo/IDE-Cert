// Legal and bank details used on proforma invoices and order emails.
// TODO(client): fill in before launch. While a value is null it is left out
// of documents, and the proforma cannot be sent from the admin panel.

export const business = {
  legalName: "IDE Cert SH.P.K.",
  nui: null as string | null, // Numri Unik Identifikues
  vatNumber: null as string | null,
  bank: {
    name: null as string | null,
    iban: null as string | null,
    swift: null as string | null,
    accountHolder: "IDE Cert SH.P.K.",
  },
  /** Days a proforma invoice stays valid. */
  proformaValidDays: 7,
} as const;

export const bankDetailsComplete = Boolean(business.bank.name && business.bank.iban && business.bank.swift);
