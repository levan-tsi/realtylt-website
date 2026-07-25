# Theme settings + global code (owner-pasted 2026-07-24)

## Theme colors (BlueRoof panel)
Menu link #808080, hover #000. Dropdown: link #808080, hover #fff on bg #000 (bg #fff).
Headers #000, body text #808080. Links #000, hover #808080.
-> REFERENCE ONLY: our Hudson-Twilight ink/stone palette approximates this gray/black
scheme and is owner-approved through rounds 3-6; do NOT re-theme. Flag only glaring
mismatches (e.g. a colored element where live is monochrome).

## Typography
Body: Lato, 16px, line-height 1.72222 (custom CSS `html body{font-size:16px;font-family:Lato...}`).
Headers Lato (theme). We already use Lato — verify body size/leading match (ours vs 16px/1.722).
NOTE: rem values in pasted section code assume the THEME root (10px): 5rem h2 renders ~50px.

## Global header script
gtag AW-11479042629 + gtagSendEvent(url) delayed-navigation helper — WE SHIPPED THIS in
round 3; verify still wired (conversion event name conversion_event_submit_lead_form).

## Global footer script
The RealtyLT chat widget (full source pasted; n8n webhook realtylt-chat, brand #1557b0,
greeting "Hey! Looking for a home in Westchester, the Hudson Valley, or anywhere in the
city?...", chips ['Show me 3-bed homes under $700k','Condos under $1M','Talk to Levan'],
sessionStorage session/history, 30s timeout, mobile full-screen panel).
-> We host public/rlt-chat.js extracted from live earlier; DIFF ours vs this paste (the
owner may have updated it) — especially CONFIG values, greeting, chips, safe-area CSS.

## Custom CSS (site-wide) — checks for us
- Container: max-width 1800px, width 95% (our shells vary per page; live search shell
  measured 1600 earlier — page-specific, don't blanket-change; note per-page).
- Home hero (>=993px): section max-width huge, content 1800px, quick-search form 75%
  width, CTA buttons 72px tall / 16px font / padding 24px 20px 21px; sell button
  margin-left 20px. VERIFY our home hero matches these proportions at 1440.
- video-background: position FIXED, z-index -99 (video sits behind the whole page on
  live; ours is absolute within the hero — ours is deliberate/better, keep, but confirm
  the hero looks the same at rest).
- .bg-parallax = background-attachment: fixed, disabled <= 768px. Matches our parallax
  approach; keep static under reduced-motion (ours).
- Fair-housing bar: #d3d6d9 bg, auto height, 10px padding. VERIFY ours matches color.
- White footer scheme (#fff bg, #ddd top border, #222 text) and white nav w/ #ddd border:
  ours matches visually; spot-check borders.
- reCAPTCHA modal text #c0c0c0 (we don't use reCAPTCHA — ignore).
