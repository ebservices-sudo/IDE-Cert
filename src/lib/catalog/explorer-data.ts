import "server-only";
import { getCatalog } from "./data";
import { toExplorerItem, type ExplorerItem } from "./explorer";

/** Every product as compact explorer data, with published prices. */
export async function getExplorerItems(): Promise<ExplorerItem[]> {
  return (await getCatalog()).products.map(toExplorerItem);
}
