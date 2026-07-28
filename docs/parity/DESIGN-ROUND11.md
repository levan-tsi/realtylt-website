# Design round 11 — from "good" to considered

Written 2026-07-28, before any code, after looking at the shipped site at 1440 and 390 with the
`frontend-design` lens. The owner's brief: *"I like what we have and it's great but I think we could
do it better."* Target = high-end, calm, restrained. **Restraint is the luxury signal, not more
effects.** Parity with the old realtylt.com is finished and is explicitly not the goal any more.

Screenshots this was written from: `docs/design-r11/*.png` (home, buying, selling, connect,
who-we-are at 1440; home at 390).

---

## Part 1 — What the site actually is right now

### What already reads luxury (do not touch these)

1. **The colour discipline.** Black, white, `#f3f5f8` mist, one navy and one azure. There is no
   second accent anywhere and no gradient anywhere. Most sites in this category cannot say that.
   This is the strongest thing the design has and everything below has to protect it.
2. **The alternating ink/paper bands on `/buying` and `/selling`.** Full-bleed black sections with a
   device mockup on one side and a short left-aligned argument on the other. That is a real system,
   it is confident, and the black is a true black rather than a charcoal that apologises for itself.
3. **Weight contrast inside a single headline** — "Let's Find **Home**", "Our **Pricing Strategy**",
   "Start Your **Home Search**". Light next to bold in one line is the closest thing the site has to
   a signature, and it costs nothing. It should be amplified, not replaced.
4. **The listing cards.** Photo zoom on hover, a 4px lift, an honest "Photo coming soon" state.
   Restrained and correct.
5. **The hero headline's placement** — bottom-left, alone, over a dark photograph. Correct instinct:
   the picture is doing the work and the type is not competing with it.

### What reads generic

1. **One typeface doing every job.** `--font-display`, `--font-sans` and `--font-mono` are all Lato.
   Lato is the old vendor theme's face; it was inherited, not chosen. A site whose display face and
   body face are the same face has no typographic point of view by definition — the type is a
   delivery vehicle, not part of the design.
2. **The hero stops being a hero halfway down.** The photograph ends at the headline and the search
   strip — the single most important control on the site — sits on a flat black shelf underneath it.
   The owner named this. It is the clearest "unfinished" signal on the page.
3. **The search control has no rhythm.** Input and SEARCH button are butted together with zero gap,
   then two more identically-weighted outline buttons sit beside them. Four controls, one visual
   weight, no hierarchy: nothing tells you which one is the point.
4. **Three horizontal bars before you reach the logo.** Phone/Saved/Sign-in on `#f3f5f8`, then Fair
   Housing Notice on `#d3d6d9`, then the logo row. Two greys that close together read as an accident
   rather than a decision, and they push the brand 100px down every single page.
5. **Centred body copy.** "The Home Buying Process" and "Choose the Path That's Right for You" both
   centre a full paragraph. Centred short headings are fine. Centred paragraphs are the template tell
   — the eye loses the left edge on every line.
6. **Vertical rhythm is arbitrary.** Shipping today: `py-[60px]`, `py-16`, `pt-16 pb-8`,
   `py-16 md:py-24`, `py-20`. Five different section rhythms with no scale behind them. Whitespace is
   the cheapest luxury material there is and we are spending it randomly.
7. **Every section heading is the same size and the same weight.** `text-3xl md:text-4xl`, light or
   bold. A page cannot have a hierarchy if its h2s are all identical — nothing is the main event.
8. **Numbered `1` / `2` badges on `/selling`** over "Fast Cash Offer" and "Traditional Listing".
   Numbering encodes sequence. This content is a *choice between two paths*, not a sequence, so the
   numerals are decoration pretending to be structure. They actively mislead.
9. **The stat row** (11 / 24h / 100+ / 7). Big number, small label, four across. This is the single
   most templated block on the internet.
10. **Photography has no grade.** Home is desaturated black and white, `/buying` is a warm colour
    interior, `/selling` is a saturated twilight landscape, `/connect` is a washed-out office stock
    photo at maybe 30% contrast. Five pages, five different worlds.
11. **`/connect` has a hole in it.** The left column ends at the email address around y=900 and the
    section runs to y=1330. Four hundred pixels of nothing next to a third-party calendar widget
    that brings its own typeface and its own card radius.
12. **Uppercase tracked micro-labels everywhere.** `REACH OUT`, `WE USE THE MOST ACCURATE METHOD…`,
    `BE THE FIRST TO KNOW…`, `PHOTOGRAPHS, VIRTUAL TOURS…`. Used once a page an eyebrow is a system.
    Used under every heading it is texture, and it makes each section shout its own subtitle.

---

## Part 2 — The ranked moves

Ordered by impact per unit of risk. 1–3 are the owner's named defects and are not optional.

| # | Move | Why it earns its place |
|---|---|---|
| 1 | **Carry the hero photograph through the search strip** | Named defect. Removes the flat black shelf, makes the search control feel like part of the picture rather than an afterthought bolted below it, and makes the homepage open as one image instead of two blocks. |
| 2 | **Give the search control real rhythm and one clear primary** | Named defect. Gap between field and button, one obvious primary action, the two secondary paths demoted to a quieter treatment. Four equal buttons become one control plus two links. |
| 3 | **Regroup the mobile footer** | Named defect. Form as its own block, then identity + contact + links as one contiguous reference block. |
| 4 | **A display typeface, used only on headlines** | The highest-leverage single change available. Keeps Lato for every body, control, nav and form (zero product disruption) and gives the site a voice at the only sizes where a voice is visible. |
| 5 | **A real type scale with hierarchy** | Page h1 / section h2 / sub-h3 stop being the same size. Costs nothing, fixes "nothing is the main event". |
| 6 | **Collapse the double utility bar into one** | Recovers ~40px at the top of every page, removes the two-greys accident, and lets the logo land nearer the top edge. |
| 7 | **One vertical rhythm scale** | Replace five ad-hoc paddings with a 3-step scale. This is the move that reads as "expensive" without anyone being able to name why. |
| 8 | **Un-centre the body copy** | Centred paragraphs go left at a set measure. Headings that anchor a symmetric grid stay centred. |
| 9 | **One photographic grade across all heroes** | Pick the treatment the home hero already uses (desaturated, deep scrim) and apply it site-wide so five pages stop being five brands. |
| 10 | **The bracket** — a signature device drawn from the logo | The RealtyLT mark is a squared bracket around the R and the T. That is the client's own geometry, sitting unused. One hairline bracket per page, at the moment that matters. Spend the boldness here and nowhere else. |
| 11 | **Fix `/selling`'s false numbering and `/connect`'s hole** | Two specific structural lies. The numerals claim a sequence that does not exist; the empty column claims content that does not exist. |
| 12 | **Motion timing pass** | Every reveal on the site is the same 26px rise at 0.7s. Vary by role — a hero settles, a card lifts, a rail slides — and stagger siblings rather than firing them together. |

### On move 4 — which face, and why not the obvious ones

The brief for the type is: it has to work at 60px over a black-and-white photograph, it has to hold a
light weight next to a bold weight in the same line (the site's existing signature), and it must not
look like the face every AI-designed page reaches for.

Ruled out on those grounds: **Playfair Display** (the most templated serif on the web), **Instrument
Serif** and **Fraunces** (both now default AI-design house style), **Cormorant** (too fragile at
body-adjacent sizes), and any second grotesque — pairing another sans with Lato reads as an accident
rather than a pairing, because the contrast is not visible at a glance.

**Chosen: Newsreader** (Production Type, weights 200–600 plus italic), for display only.

- Modern-classical rather than fashion-classical: moderate contrast, sturdy serifs, drawn for
  screens. It sits next to architectural photography without turning the page into a magazine.
- Its 200 and 300 weights are genuinely elegant at 48–72px, which is where the hero lives, and it
  keeps a 600 for the bold half of "Let's Find **Home**" — so the site's existing signature survives
  the change and gets more expressive, not less.
- A distinctive italic that can carry exactly one accent word per page.
- Not one of the four faces above.

Lato keeps every body paragraph, every form control, every nav item, every button and every table.
This is one CSS token (`--font-display`); if the owner dislikes it, it reverts in one line.

---

## Part 3 — Research: Equal Housing Opportunity and the REALTOR® marks

The owner asked for both to be added. They are legal marks with real usage rules, so this is what
the rules actually say.

### The REALTOR® marks (National Association of REALTORS®)

- **Who may display them.** Members only. "Non-members are never authorized to use the MARKS in
  reference to or in connection with their businesses or themselves." Displaying the mark on this
  site is therefore a statement that Levan holds current NAR membership. **If that membership ever
  lapses, the marks have to come off the site.** Noted here so nobody has to rediscover it.
- **Form of use.** NAR's form-of-use rule requires the marks to be highlighted relative to adjoining
  text by (1) capital letters and, where needed, bold or italic, (2) separating punctuation where
  appropriate, and (3) the federal registration symbol **®** adjacent to the term. The preferred
  forms are **REALTOR®**, **REALTORS®**, **REALTOR-ASSOCIATE®**.
- **Never all lowercase.** The only exceptions are domain names, email addresses and usernames,
  where capitalisation is not meaningful.
- **Beside a name.** "REALTOR®" may appear next to the member's name if separating punctuation is
  used — `Levan Tsiklauri, REALTOR®`. No separator is needed when it precedes the name.
- **Contextual use needs a membership reference** in the same sentence or phrase — the association's
  name, the Code of Ethics, or a general reference to association membership.
- **What this means for us:** the site currently writes "Realtor" in title case with no ® in four
  places (`/connect`, `/who-we-are` ×3). That is not a permitted form. Fixing those is part of this
  work, not a separate task.
- **Artwork decision:** use the **word mark set in our own type**, not a recreated block-R logo. The
  word mark is the preferred form, it is explicitly permitted, and it is crisp at every size. NAR's
  block-R artwork has its own proportion, colour and minimum-size rules and should only ever be the
  official file from NAR's brand centre — if the owner wants that specific logo, he supplies the
  file. Recreating a registered logo by hand is the one thing not to do here.

### The Equal Housing Opportunity logo

- **Required in advertising.** HUD's guidance is that the Equal Housing Opportunity logo, statement
  or slogan appears in advertising for residential real estate for sale, rent or financing. A real
  estate website is advertising.
- **Sizing.** If the *statement* is used it should be in a print size comparable to the rest of the
  advertisement. If the *logo* is used it should be at least the size of other logos present, and if
  there are no other logos it should be in a clearly visible bold display face.
- **Licensing.** The logo is **not copyrighted** and is free to use; no permission or licence is
  required. HUD publishes the artwork.
- **Artwork decision:** self-hosted SVG of the standard house-with-equal-sign mark, drawn to the
  published proportions, plus the words "Equal Housing Opportunity". Vector, so it is sharp on every
  screen, and it inherits the footer's own grey instead of being a fuzzy grey PNG at one fixed size.
  We do **not** hotlink the old vendor's `Equal-Housing-Realtor_gray50.png`.
- **New York.** The state's own requirement is the Fair Housing Notice (Dept. of State), which the
  site already links on every page from the header bar. That obligation is already met; the EHO
  logo is the federal-side addition.

### Placement

Footer, on the legal row, beside the copyright line: the conventional position, always present on
every page, and quiet enough that it does not compete with the brand. Alt text names the mark
(`Equal Housing Opportunity`) rather than describing the drawing.

---

## Part 4 — Photography licensing

Six images came from the old IDX vendor's CDN with no licence record and must be replaced with
free, no-watermark photography, each recorded in `public/images/ATTRIBUTIONS.md`:

| file | used by |
|---|---|
| `hero/buying-bg5.jpg` | `/buying` hero |
| `hero/connect-int33.jpg` | `/connect` hero |
| `hero/financing-paperwork.jpg` | `/financing` hero |
| `hero/sell-img-4.jpg` | `/selling` parallax band |
| `hero/blog-social.jpg` | `/blog` hero |
| `hero/hom.jpg` | home hero poster (mobile + reduced-motion) |

Plus `hero/hom.png` (2.2 MB, unreferenced) — delete.

`hero/hero-vimeo-frame.jpg` is the first frame of the Vimeo clip the live site plays; it stands or
falls with that video and is tracked separately.

Replacements are graded to move 9 above: one treatment for all heroes, so the licence fix and the
art-direction fix land together instead of fighting each other later.

---

## Part 5 — What actually shipped, and what did not

Written at the end of the round, against the ranked list in Part 2.

### Shipped

| # | Move | Where it landed |
|---|---|---|
| 1 | Hero photograph carries the search strip | `app/page.tsx` — background layer now spans the section |
| 2 | Search control rhythm, one clear primary | 620px control, real gap, solid-white SEARCH, two outlined paths |
| 3 | Footer regrouped | Form first, then identity + contact + links as one block, at every width |
| 4 | Display typeface | Newsreader on headlines only; Lato keeps all body, UI, nav and forms |
| 5 | Type scale with hierarchy | `t-display` / `t-h1` / `t-h2` / `t-h3` / `t-eyebrow` |
| 6 | Utility bars merged | One `#f3f5f8` rule instead of two greys; 42px back on every page |
| 7 | Vertical rhythm scale | `.sec-sm` / `.sec` / `.sec-lg` replacing five ad-hoc paddings |
| 8 | Body copy un-centred | `/buying` and `/financing` intros are heading-left, passage-right at 62ch |
| 9 | One photographic grade | Every hero monochrome; listing photography stays colour |
| 11 | `/selling` numbering, `/connect` hole | Badges say "Fastest" / "Highest price"; the contact column is sticky |
| 12 | Motion timing | Reveal 26px/0.7s → 16px/0.5s |

Plus three things not on the list, found by looking: the third typeface (Montserrat on
`/home-value`), Chromium's blue clear button in every search field, and `/connect`'s h1 going
dark-on-dark the moment its band went dark.

### Move 10 — the bracket signature — NOT built, on purpose

The plan was to derive a hairline corner-bracket from the logo's squared `[R]`/`[T]` and use it
once per page as the site's signature device. It is not in the build.

By the time moves 1–9 landed, the site had a signature: a light serif headline over a
monochrome Hudson photograph with a contained search under it, in a palette with one accent.
That is specific, it is memorable, and it is theirs. Adding a bracket motif on top of it would
have been a second idea competing with the first — decoration, arriving exactly when the round
had finished earning restraint. Chanel's rule: take one accessory off before leaving.

It stays on the shelf, written down, and a later round can take it up when there is a reason to
rather than a slot to fill.

### Deliberately left for the owner

- **The ambient Vimeo clip on the desktop home hero.** It is the old vendor's, it has no licence
  record, its frames are a bland CGI interior, and it puts a third-party iframe on the LCP path.
  Every other visitor — phone, reduced-motion — now gets a licensed Hudson Highlands photograph
  that is plainly stronger. The owner named the video as acceptable, so it stays; the
  recommendation is to drop it. See `public/images/ATTRIBUTIONS.md`.
- **County card photography stays in colour.** The monochrome grade is for HERO photography.
  The county cards on `/top-areas` are showing you six specific places, and the colour is doing
  the work there — the same reason listing photos stay colour.
