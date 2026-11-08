/** Round 69: THE PREVIEW'S LOOK SWITCH, for his pick between two looks that differ in one variable, both drawn by one
 * build (docs/parity/DESIGN-ROUND69.md §4). On the home page, `?r69=<look>` sets `data-r69` on <html> before the
 * sections paint; app/globals.css draws the other look under it. Only short lowercase words pass (setAttribute, never
 * markup). The branch's default is the recommended look; this file and its CSS go when he has picked. */
export const LOOK_SWITCH_SCRIPT = `(function(){try{var v=new URLSearchParams(location.search).get("r69");if(v&&/^[a-z0-9 -]{1,40}$/.test(v))document.documentElement.setAttribute("data-r69",v)}catch(e){}})();`;
