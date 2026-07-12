// Committed MLS snapshot, imported through plain JS ON PURPOSE: the adjacent .d.ts
// shadows this file for tsc, so the type checker never parses the multi-MB JSON
// (resolveJsonModule would type-infer the whole literal — slow and memory-hungry).
// The bundler inlines the JSON into the server build, so the snapshot ships INSIDE
// the deploy and nothing external (a paused Blob store, a quota, a CDN) can break it.
import raw from "../../data/mls-snapshot.json";
export default raw;
