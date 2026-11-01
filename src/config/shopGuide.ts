// Plain-language help for the shop: what each category is, what each use means and
// what each filter does. Written for buyers who are not gear experts (park operators,
// site managers, first-time climbers). Keep it short and concrete.

import type { IconName } from "@/components/shop/ShopIcon";

export type UseGuide = { value: string; label: string; help: string; icon: IconName };

/** Values match `Product.use` in the catalogue. */
export const uses: UseGuide[] = [
  { value: "Climbing & mountaineering", label: "Climbing & mountaineering", help: "Gym, crag, alpine and via ferrata.", icon: "carab" },
  { value: "Work at height", label: "Work at height", help: "Fall protection for crews on roofs, towers and rope access.", icon: "harness" },
  { value: "Adventure parks", label: "Adventure parks", help: "Smart Belay, guest harnesses and helmets for rope parks.", icon: "lanyard" },
  { value: "Tree care", label: "Tree care", help: "Arborist ropes, saddles and climbing gear.", icon: "tree" },
  { value: "Ice climbing", label: "Ice climbing", help: "Ice tools, crampons and spare parts.", icon: "ice" },
  { value: "Canyoning", label: "Canyoning", help: "Harnesses and protection for wet descents.", icon: "rope" },
  { value: "Rescue", label: "Rescue", help: "Descent and rescue systems for teams.", icon: "pulley" },
];

export type CategoryGuide = { icon: IconName; what: string };

/** Keyed by "world/subcategory". `what` explains the category in one or two plain sentences. */
export const categoryGuide: Record<string, CategoryGuide> = {
  "sport/dynamic-ropes": { icon: "rope", what: "Stretchy climbing ropes that catch a fall softly. Used for lead climbing in the gym, on rock and in the mountains." },
  "sport/harnesses": { icon: "harness", what: "The belt and leg loops a climber wears to tie into the rope. Pick by size and by where you climb." },
  "sport/helmets": { icon: "helmet", what: "Protects the head from falling rocks and knocks. Sized by head circumference in cm." },
  "sport/carabiners-quickdraws": { icon: "carab", what: "Metal clips that connect rope, harness and anchors. Locking ones for belaying, quickdraws for clipping bolts." },
  "sport/belay-devices": { icon: "belay", what: "The device the belayer uses to hold and lower a climber. Assisted-braking models help catch a fall." },
  "sport/via-ferrata": { icon: "lanyard", what: "Y-shaped sets with an energy absorber that clip you to the steel cable on a via ferrata route." },
  "sport/static-rappel-lines": { icon: "rope", what: "Low-stretch ropes for abseiling, hauling and fixed lines. Not for lead climbing." },
  "sport/cords-webbing": { icon: "cord", what: "Thin accessory cord and flat webbing by the metre, for prusiks, anchors and gear loops." },
  "sport/slings": { icon: "sling", what: "Sewn loops of tape for building anchors and extending protection." },
  "sport/ice-climbing": { icon: "ice", what: "Ice axes, crampons and their spare parts for frozen waterfalls and alpine ice." },
  "sport/canyoning": { icon: "rope", what: "Harnesses, seat protectors and bags made for wet, abrasive canyon descents." },
  "sport/route-setting": { icon: "wall", what: "Hangers, lower-offs and tools for building and maintaining climbing walls and routes." },
  "sport/bags": { icon: "bag", what: "Rope bags, haul bags and organisers to carry and protect your gear." },
  "sport/chalk-bouldering": { icon: "acc", what: "Chalk, chalk bags and crash pads for bouldering." },
  "sport/clothing": { icon: "shirt", what: "EDELRID jackets, hoodies, T-shirts, pants and caps." },
  "sport/accessories": { icon: "acc", what: "Knives, gear carabiners, first-aid kits and other small essentials." },
  "professional/ropes": { icon: "rope", what: "Static and dynamic work ropes and cord, on spools or cut to the length you need." },
  "professional/work-harnesses": { icon: "harness", what: "Full-body and sit harnesses that stop a worker's fall and let them work hands-free at height." },
  "professional/lanyards": { icon: "lanyard", what: "Lanyards connect the harness to an anchor. Energy absorbers soften the stop if someone falls." },
  "professional/connectors": { icon: "carab", what: "Certified aluminium and steel connectors for work positioning, rope access and rescue." },
  "professional/descenders": { icon: "belay", what: "Devices to descend a rope under control and to adjust your position on it." },
  "professional/adventure-parks": { icon: "lanyard", what: "Smart Belay X systems, guest harnesses, helmets and gloves for rope parks and zip lines." },
  "professional/ropes-with-terminations": { icon: "rope", what: "Ropes delivered with sewn or spliced ends, ready to use." },
  "professional/tree-care": { icon: "tree", what: "Arborist ropes, saddles, spurs and cambium savers for working in trees." },
  "professional/ascenders": { icon: "pulley", what: "Rope clamps that let you climb up a fixed rope: hand, chest, foot and knee." },
  "professional/pulleys": { icon: "pulley", what: "Pulleys, swivels and rigging plates for hauling and rescue systems." },
  "professional/anchors": { icon: "sling", what: "Slings and straps to create a secure anchor point around beams and structures." },
  "professional/rescue": { icon: "pulley", what: "Rescue descent systems and equipment for teams who evacuate people from height." },
  "professional/work-helmets": { icon: "helmet", what: "Work and rescue helmets with chin straps, visors and accessories." },
  "professional/bags-transport": { icon: "bag", what: "PPE backpacks, rope bags and storage to keep equipment clean and inspected." },
  "professional/protection-accessories": { icon: "spare", what: "Rope protectors, edge protection and other work accessories." },
  "professional/workwear-gloves": { icon: "shirt", what: "Work gloves and workwear." },
};

/** One-line help shown under each filter heading. */
export const filterHelp: Record<string, string> = {
  price: "Prices include 18% Kosovo VAT.",
  size: "Clothing and harness sizes. Helmets are sized by head circumference.",
  length: "Rope, sling and lanyard lengths.",
  colour: "Most items come in several colours.",
  standard: "The European safety norm the item is certified to, e.g. EN 892 for dynamic ropes.",
  new: "New in the EDELRID 2026 range.",
};
