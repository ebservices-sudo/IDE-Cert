// Plain-language help for the shop, in Albanian and English: what each category is,
// what each use means and what each filter does. Written for buyers who are not gear
// experts (park operators, site managers, first-time climbers). Keep it short and concrete.

import type { IconName } from "@/components/shop/ShopIcon";
import type { L10n } from "@/lib/i18n/T";

export type UseGuide = { value: string; label: L10n; help: L10n; icon: IconName };

/** Values match `Product.use` in the catalogue. */
export const uses: UseGuide[] = [
  { value: "Climbing & mountaineering", label: { sq: "Ngjitje dhe alpinizëm", en: "Climbing & mountaineering" }, help: { sq: "Palestër, shkëmb, mal dhe via ferrata.", en: "Gym, crag, alpine and via ferrata." }, icon: "carab" },
  { value: "Work at height", label: { sq: "Punë në lartësi", en: "Work at height" }, help: { sq: "Mbrojtje nga rënia për punëtorë në çati, kulla dhe qasje me litar.", en: "Fall protection for crews on roofs, towers and rope access." }, icon: "harness" },
  { value: "Adventure parks", label: { sq: "Parqe aventure", en: "Adventure parks" }, help: { sq: "Smart Belay, rripa dhe helmeta për vizitorët e parqeve.", en: "Smart Belay, guest harnesses and helmets for rope parks." }, icon: "lanyard" },
  { value: "Tree care", label: { sq: "Kujdesi i pemëve", en: "Tree care" }, help: { sq: "Litarë, rripa dhe pajisje për arboristë.", en: "Arborist ropes, saddles and climbing gear." }, icon: "tree" },
  { value: "Ice climbing", label: { sq: "Ngjitje në akull", en: "Ice climbing" }, help: { sq: "Kazma akulli, krampona dhe pjesë këmbimi.", en: "Ice tools, crampons and spare parts." }, icon: "ice" },
  { value: "Canyoning", label: { sq: "Kanioning", en: "Canyoning" }, help: { sq: "Rripa dhe mbrojtje për zbritje në kanione.", en: "Harnesses and protection for wet descents." }, icon: "rope" },
  { value: "Rescue", label: { sq: "Shpëtim", en: "Rescue" }, help: { sq: "Sisteme zbritjeje dhe shpëtimi për ekipe.", en: "Descent and rescue systems for teams." }, icon: "pulley" },
];

export type CategoryGuide = { icon: IconName; what: L10n };

/** Keyed by "world/subcategory". `what` explains the category in one or two plain sentences. */
export const categoryGuide: Record<string, CategoryGuide> = {
  "sport/dynamic-ropes": { icon: "rope", what: { sq: "Litarë që shtrihen dhe e kapin rënien butë. Për ngjitje me litar në palestër, në shkëmb dhe në mal.", en: "Stretchy climbing ropes that catch a fall softly. Used for lead climbing in the gym, on rock and in the mountains." } },
  "sport/harnesses": { icon: "harness", what: { sq: "Rripi i belit dhe i këmbëve që ngjitësi vesh për t'u lidhur me litar. Zgjidhni sipas madhësisë dhe vendit ku ngjitni.", en: "The belt and leg loops a climber wears to tie into the rope. Pick by size and by where you climb." } },
  "sport/helmets": { icon: "helmet", what: { sq: "Mbron kokën nga gurët që bien dhe goditjet. Madhësia sipas perimetrit të kokës në cm.", en: "Protects the head from falling rocks and knocks. Sized by head circumference in cm." } },
  "sport/carabiners-quickdraws": { icon: "carab", what: { sq: "Kapëse metalike që lidhin litarin, rripin dhe ankorimet. Me bllokim për sigurim, ekspresa për lidhje në pika.", en: "Metal clips that connect rope, harness and anchors. Locking ones for belaying, quickdraws for clipping bolts." } },
  "sport/belay-devices": { icon: "belay", what: { sq: "Pajisja me të cilën siguruesi mban dhe ul ngjitësin. Modelet me frenim ndihmës e ndalojnë rënien më lehtë.", en: "The device the belayer uses to hold and lower a climber. Assisted-braking models help catch a fall." } },
  "sport/via-ferrata": { icon: "lanyard", what: { sq: "Sete në formë Y me amortizues që ju lidhin me kabllon e çelikut në rrugët via ferrata.", en: "Y-shaped sets with an energy absorber that clip you to the steel cable on a via ferrata route." } },
  "sport/static-rappel-lines": { icon: "rope", what: { sq: "Litarë me shtrirje të ulët për zbritje, tërheqje dhe linja fikse. Jo për ngjitje me litar.", en: "Low-stretch ropes for abseiling, hauling and fixed lines. Not for lead climbing." } },
  "sport/cords-webbing": { icon: "cord", what: { sq: "Kordon i hollë dhe shirit i sheshtë me metër, për prusik, ankorime dhe lidhje pajisjesh.", en: "Thin accessory cord and flat webbing by the metre, for prusiks, anchors and gear loops." } },
  "sport/slings": { icon: "sling", what: { sq: "Unaza shiriti të qepura për ndërtimin e ankorimeve dhe zgjatjen e pikave.", en: "Sewn loops of tape for building anchors and extending protection." } },
  "sport/ice-climbing": { icon: "ice", what: { sq: "Kazma akulli, krampona dhe pjesët e tyre për ujëvara të ngrira dhe akull malor.", en: "Ice axes, crampons and their spare parts for frozen waterfalls and alpine ice." } },
  "sport/canyoning": { icon: "rope", what: { sq: "Rripa, mbrojtëse dhe çanta të bëra për zbritje në kanione me ujë dhe gurë.", en: "Harnesses, seat protectors and bags made for wet, abrasive canyon descents." } },
  "sport/route-setting": { icon: "wall", what: { sq: "Varëse, pika zbritjeje dhe vegla për ndërtimin dhe mirëmbajtjen e mureve dhe rrugëve.", en: "Hangers, lower-offs and tools for building and maintaining climbing walls and routes." } },
  "sport/bags": { icon: "bag", what: { sq: "Çanta litari, çanta tërheqjeje dhe organizues për të bartur dhe mbrojtur pajisjet.", en: "Rope bags, haul bags and organisers to carry and protect your gear." } },
  "sport/chalk-bouldering": { icon: "acc", what: { sq: "Magnez, çanta magnezi dhe dyshekë për boulder.", en: "Chalk, chalk bags and crash pads for bouldering." } },
  "sport/clothing": { icon: "shirt", what: { sq: "Xhaketa, duks, bluza, pantallona dhe kapele EDELRID.", en: "EDELRID jackets, hoodies, T-shirts, pants and caps." } },
  "sport/accessories": { icon: "acc", what: { sq: "Thika, karabina pajisjesh, çanta të ndihmës së parë dhe gjëra të tjera të vogla.", en: "Knives, gear carabiners, first-aid kits and other small essentials." } },
  "professional/ropes": { icon: "rope", what: { sq: "Litarë pune statikë dhe dinamikë dhe kordon, në bobina ose të prerë sipas gjatësisë që ju duhet.", en: "Static and dynamic work ropes and cord, on spools or cut to the length you need." } },
  "professional/work-harnesses": { icon: "harness", what: { sq: "Rripa trupi të plotë dhe ulëse që e ndalojnë rënien e punëtorit dhe e lënë të punojë me duar të lira në lartësi.", en: "Full-body and sit harnesses that stop a worker's fall and let them work hands-free at height." } },
  "professional/lanyards": { icon: "lanyard", what: { sq: "Lidhëset e bashkojnë rripin me ankorimin. Amortizuesit e zbutin ndalimin nëse dikush bie.", en: "Lanyards connect the harness to an anchor. Energy absorbers soften the stop if someone falls." } },
  "professional/connectors": { icon: "carab", what: { sq: "Lidhës të certifikuar alumini dhe çeliku për pozicionim në punë, qasje me litar dhe shpëtim.", en: "Certified aluminium and steel connectors for work positioning, rope access and rescue." } },
  "professional/descenders": { icon: "belay", what: { sq: "Pajisje për të zbritur në litar nën kontroll dhe për të rregulluar pozicionin në të.", en: "Devices to descend a rope under control and to adjust your position on it." } },
  "professional/adventure-parks": { icon: "lanyard", what: { sq: "Sisteme Smart Belay X, rripa për vizitorë, helmeta dhe doreza për parqe me litarë dhe tirolezë.", en: "Smart Belay X systems, guest harnesses, helmets and gloves for rope parks and zip lines." } },
  "professional/ropes-with-terminations": { icon: "rope", what: { sq: "Litarë që vijnë me skaje të qepura ose të gërshetuara, gati për përdorim.", en: "Ropes delivered with sewn or spliced ends, ready to use." } },
  "professional/tree-care": { icon: "tree", what: { sq: "Litarë arboristësh, rripa, thumba dhe mbrojtëse lëvoreje për punë në pemë.", en: "Arborist ropes, saddles, spurs and cambium savers for working in trees." } },
  "professional/ascenders": { icon: "pulley", what: { sq: "Kapëse litari që ju lejojnë të ngjiteni në një litar fiks: dore, gjoksi, këmbe dhe gjuri.", en: "Rope clamps that let you climb up a fixed rope: hand, chest, foot and knee." } },
  "professional/pulleys": { icon: "pulley", what: { sq: "Rrotulla, rrotullues dhe pllaka për sisteme tërheqjeje dhe shpëtimi.", en: "Pulleys, swivels and rigging plates for hauling and rescue systems." } },
  "professional/anchors": { icon: "sling", what: { sq: "Unaza dhe rripa për të krijuar një pikë ankorimi të sigurt rreth trarëve dhe strukturave.", en: "Slings and straps to create a secure anchor point around beams and structures." } },
  "professional/rescue": { icon: "pulley", what: { sq: "Sisteme zbritjeje dhe pajisje për ekipet që evakuojnë njerëz nga lartësia.", en: "Rescue descent systems and equipment for teams who evacuate people from height." } },
  "professional/work-helmets": { icon: "helmet", what: { sq: "Helmeta pune dhe shpëtimi me rrip mjekre, vizore dhe aksesorë.", en: "Work and rescue helmets with chin straps, visors and accessories." } },
  "professional/bags-transport": { icon: "bag", what: { sq: "Çanta shpine për PPE, çanta litari dhe ruajtje që i mbajnë pajisjet të pastra dhe të kontrolluara.", en: "PPE backpacks, rope bags and storage to keep equipment clean and inspected." } },
  "professional/protection-accessories": { icon: "spare", what: { sq: "Mbrojtëse litari, mbrojtje skajesh dhe aksesorë të tjerë pune.", en: "Rope protectors, edge protection and other work accessories." } },
  "professional/workwear-gloves": { icon: "shirt", what: { sq: "Doreza dhe veshje pune.", en: "Work gloves and workwear." } },
};

/** One-line help shown under each filter heading. */
export const filterHelp: Record<string, L10n> = {
  price: { sq: "Çmimet përfshijnë TVSH-në 18% të Kosovës.", en: "Prices include 18% Kosovo VAT." },
  size: { sq: "Madhësitë e veshjeve dhe rripave. Helmetat sipas perimetrit të kokës.", en: "Clothing and harness sizes. Helmets are sized by head circumference." },
  length: { sq: "Gjatësia e litarëve, unazave dhe lidhëseve.", en: "Rope, sling and lanyard lengths." },
  colour: { sq: "Shumica e artikujve vijnë në disa ngjyra.", en: "Most items come in several colours." },
  standard: { sq: "Norma evropiane e sigurisë sipas së cilës është certifikuar artikulli, p.sh. EN 892 për litarët dinamikë.", en: "The European safety norm the item is certified to, e.g. EN 892 for dynamic ropes." },
  new: { sq: "E re në gamën EDELRID 2026.", en: "New in the EDELRID 2026 range." },
};
