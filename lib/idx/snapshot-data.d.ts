/** Raw committed snapshot (data/mls-snapshot.json) — typed as unknown so tsc never
 * parses the multi-MB JSON; lib/idx/snapshot.ts validates it with parseSnapshot. */
declare const raw: unknown;
export default raw;
