/** Round 65: the first plate's reveal. The territory plate is server-rendered and its bytes are
 * preloaded with the document, so it lands long before the engine hydrates (measured: painted at
 * 300 to 480 ms, the engine's `ml:reveal` at 500 to 650) and until now it popped in at full strength
 * in one frame. This inline script, placed before the ground in the page, eases the picture in from
 * the frame its bytes are in: it looks at the picture once a frame (requestAnimationFrame runs
 * before that frame is painted) and starts the fade the first frame the picture is complete, so it
 * never waits on the script bundle and never holds the picture back (an image is blank until it is
 * in anyway). Not the image's `load` event: measured, that task can run a frame or more after the
 * picture was first painted (behind the page's own scripts), and the fade then started from nothing
 * over a picture already shown, a flash. With JavaScript off, under reduced motion, or in a browser
 * without `Element.animate`, the plate shows as before, at once. Gives up after ten seconds. */
export const PLATE_REVEAL_MS = 320;
/** The plain ease-out: the settle curve (cubic-bezier(0.33, 1, 0.68, 1)) put two thirds of the
 * picture on in the first captured frame, which read as the old pop. */
export const PLATE_REVEAL_EASE = "ease-out";

export const PLATE_REVEAL_SCRIPT = `(function(){var d=document,w=window,r=w.requestAnimationFrame;if(!r||(w.matchMedia&&w.matchMedia("(prefers-reduced-motion: reduce)").matches))return;var t0=Date.now(),img=null;function tick(){img=img||d.querySelector('[data-plate-slot="0"] img');if(img&&img.complete){if(img.naturalWidth>0&&img.animate)img.animate([{opacity:0},{opacity:1}],{duration:${PLATE_REVEAL_MS},easing:"${PLATE_REVEAL_EASE}"});return}if(Date.now()-t0<10000)r(tick)}r(tick)})();`;
