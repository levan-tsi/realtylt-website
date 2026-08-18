// `server-only` is resolved by Next's bundler, not by node, so any module that imports it is
// unreachable from vitest. Its whole job is to fail a CLIENT build; under test there is no
// client bundle to protect, so an empty module is the correct stand-in. Aliased in
// vitest.config.ts.
export {};
