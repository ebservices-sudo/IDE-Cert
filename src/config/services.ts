// IDE Cert's services, shown on the home page and the Services page.
// TODO(content): the client has not sent service descriptions yet. The texts
// below describe the four disciplines in general terms only — no standards,
// accreditations or scope are claimed. Replace with IDE Cert's own wording.

export type Service = {
  letter: string;
  name: string;
  anchor: string;
  summary: string;
  body: string;
  points: string[];
};

export const services: Service[] = [
  {
    letter: "I",
    name: "Inspection",
    anchor: "inspection",
    summary: "Independent inspection of equipment and installations, documented in a written report.",
    body: "We inspect equipment and installations and document the result in a written report, so you know what can stay in service and what has to be replaced.",
    points: ["Inspection of personal protective equipment against falls from height", "Inspection of installations on site", "Written report for your records"],
  },
  {
    letter: "D",
    name: "Design",
    anchor: "design",
    summary: "Design of safety systems and installations, developed together with your team.",
    body: "We design safety systems and installations around the way your people work, from the first site visit to the drawings.",
    points: ["Site visit and requirements", "Concept and detailed design", "Equipment selection from the EDELRID range"],
  },
  {
    letter: "E",
    name: "Engineering",
    anchor: "engineering",
    summary: "Engineering analysis, calculations and technical documentation.",
    body: "We provide the engineering behind a project: analysis, calculations and the technical documentation that goes with it.",
    points: ["Engineering analysis and calculations", "Technical documentation", "Support during installation"],
  },
  {
    letter: "C",
    name: "Certification",
    anchor: "certification",
    summary: "Certification and conformity assessment support for products and installations.",
    body: "We support manufacturers, installers and operators in showing that products and installations meet the requirements that apply to them.",
    points: ["Conformity assessment support", "Preparation of documentation", "Guidance on the applicable requirements"],
  },
];

/**
 * Smart Belay servicing for adventure parks. EDELRID lists these services in its
 * Adventure price list (dealer prices only), so they are offered on request.
 * TODO(client): set IDE Cert's prices, or keep "price on request".
 */
export const smartBelayServices = [
  "Annual inspection of Smart Belay and Smart Belay X systems",
  "PPE check for Smart Belay",
  "System diagnosis",
  "Wire tension re-adjustment",
  "Opening and professional closing of Conecto / Conecto Swivel",
  "Additional cleaning of heavily soiled units",
];
