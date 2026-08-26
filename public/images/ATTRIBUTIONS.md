# Image attributions

**Every image file under `public/images` must appear in the table below.**
`lib/images/attributions.test.ts` fails if one does not, and fails if the table names a file
that has been deleted. That test exists because this file had quietly fallen nine images behind
reality — six of them the old IDX vendor's stock photographs, pulled off
`images.brivityidx.com` during the parity rounds with no licence record at all.

Sources: [Openverse](https://openverse.org) and [Wikimedia Commons](https://commons.wikimedia.org),
under CC0, public domain, or CC BY. **CC BY-SA is deliberately not used** — its share-alike
terms are a question nobody should have to answer later. CC BY attributions must stay with the
project. The owner may replace any of these with his own photography; update this file when he
does.

## `public/images/editorial/` — plates for the flagship blog, added Round E

`listings/`, `counties/`, `hero/` and `lifestyle/` are the SITE's photography and every file in
them is now spoken for: by round D each one was a post cover, a page hero or a blog plate, and
topics 12 to 20 had nothing left to illustrate with. This folder is that shortage answered. It is
editorial photography, sourced only for blog plates, and it is deliberately separate from
`listings/` so nobody mistakes a picture chosen to carry an argument for a picture of a property.

Two rules that go with it, both earned in round E:

- **The licence is read on the source page, never taken from a search index.** A catalogue saying
  "CC BY 2.0" is a third party's claim about a photo page; `scripts/_scratch-e-licverify.mjs`
  fetches the page and prints what it says. Every row below was checked that way.
- **A candidate is judged at the 21:9 crop that ships, not in a contact sheet**
  (`scripts/_scratch-plateswatch.mjs`). Four otherwise-usable photographs were dropped after
  being looked at there. See `docs/blog-flagship/ROUND-E-LOG.md` for what was rejected and why,
  including the one that illustrated its article best and was rejected because of it.

Fourteen files landed in round E and nine of them shipped immediately. Rows marked **UNSPENT**
are on no page at all and exist for the rounds after E; the suggestion beside each one is a
suggestion, not a reservation. A plate has to earn its band in the article it lands in, so if
none of the five carries an argument for topic 13, source a new one rather than using a spare
because it is there.

**Round F added seven and spent eight**, which is the same rule applied twice more. Only
`office-stamps.jpg` was taken off the unspent list; the other four were left alone on purpose.
`clock-not-in-use.jpg`, `tool-wall.jpg` and `register-keys.jpg` stay for the topics they were
suggested for, and **`mailbox-mist.jpg` was deliberately not used on data-enrichment** even
though it fits the subject: three of the four photographs on the skip-tracing post are mailboxes,
and a fourth mailbox on the article sitting directly beside it would have made the two posts look
like one.

**Round G added six and spent seven**, taking `clock-not-in-use.jpg` and `register-keys.jpg` off
the unspent list for the topics they were suggested for. It also tightened the licence rule in
one place, because the round G brief said a fetch of a Flickr photo page returns a shell with no
licence in it. Rather than argue, every candidate was opened in Chromium
(`scripts/_scratch-g-lic.mjs`) and the licence link, the title and the photographer's name were
read off the rendered page. **The name is the part that moved.** Openverse's `creator` field is
sometimes the account alias rather than the display name on the photo page, and four of this
round's six differed: kitmasterbloke is Steve Knight, M McBey is Mike McBey, "Elsie esq." is Les
Chatfield and kvanhorn is Kyle Van Horn. Four shipped rows were re-checked the same way and were
already right (`mpclemens` and `upyernoz` really are the names those pages display). **Three rows
remain UNSPENT** for topics 18, 19 and 20.

**Round H added seven and spent nine**, which closes the twenty-topic rollout. Every one was read
in Chromium with `scripts/_scratch-h-owner.mjs`, which differs from round G's probe in the two
ways round G's own log asked for: it matches on the licence URL rather than on the anchor's
visible text (the anchor reads "Some rights reserved", which is why the older script printed
"?? CHECK" on correctly licensed photographs), and **CC0 is not under `/licenses/` at all** but
under `/publicdomain/zero/`, so a naive pattern cannot see it.

**The alias rule runs in both directions, and that is round H's finding.** Round G established
that the photo page is the authority for the photographer's name because the search index
sometimes carries the account alias. Two more differed this round the same way round G's did:
`quinet` is Thomas Quine, `Wiki.will` is William, and `mikecogh` is Michael Coghlan. But one
candidate went the other way: a store-mannequin photograph indexed to "Horia Varlan" is on an
account whose page now displays, everywhere including its own `<title>`, the string **"Old Photo
Profile"**. The index has a person's name and the page does not. **That photograph was dropped**
rather than credited to a string a reader cannot check, and a replacement was sourced. The rule
survives intact: the page is the authority, and when the page has no name on it the photograph
cannot be used here.

**`mailbox-mist.jpg` is still UNSPENT and is now the only one**, after three rounds of being
passed over. Round F left it alone because the neighbouring post was already carrying three
mailboxes; round H left it alone because none of these three topics is about post. That is the
rule working rather than failing: a plate has to earn its band in the article it lands in.

## Two folders that are NOT stock photography

- `public/images/why/*.webp` — our own product screenshots, generated by
  `scripts/build-why-slides.mjs` from the running app. Re-run that script instead of editing
  them. They replaced the IDX vendor's stock product mockups, which showed a Seattle search
  page and a seller dashboard we do not ship.
- `public/images/mls/*.svg` — the One Key MLS mark, One Key MLS's trademark, self-hosted from
  their own CDN by `scripts/fetch-onekey-logo.mjs`. It is displayed as part of the required IDX
  attribution (`components/idx/MlsAttribution.tsx`), not as decoration, so it may not be
  restyled, recoloured or replaced.

## One unresolved file

`public/images/hero/hero-vimeo-frame.jpg` is the first frame of the ambient Vimeo clip the live
site plays behind the home hero (video 398379426, the old vendor's). It exists so the video
fades in over an identical still instead of flashing black, so it stands or falls with the clip
— and the clip has no licence record either. **This needs an owner decision, not a patch:**
either confirm the clip is licensed to RealtyLT, or drop the video and let every visitor get
the licensed still that phones and reduced-motion visitors already get. Until then it is listed
below as unresolved rather than quietly omitted.

| File | Title | Creator | License | Source |
|---|---|---|---|---|
| public/images/hero/hero-vimeo-frame.jpg | First frame of the live site's ambient hero clip | Unknown (old IDX vendor) | UNRESOLVED — see above | [source](https://vimeo.com/398379426) |
| public/images/hero/hudson-olana.jpg | View of Hudson and Catskills from Olana — LIVE on /thank-you since round 38, rendered grayscale like every other hero. Was `hero-cand-olana.jpg`, a round-36 candidate; renamed when it shipped so the filename stops calling itself a candidate. CC BY 2.0 requires attribution, which this row is. | Ed from Queens, USA | BY 2.0 | [source](https://commons.wikimedia.org/wiki/File:View_of_Hudson_and_Catskills_from_Olana.jpg) |
| public/images/hero/hero-cand-breakneck-south.jpg | Hudson Highlands view south from Breakneck Ridge — ROUND-36 CANDIDATE, same ridge the phone hero shows | ScubaBear68 | BY 2.0 | [source](https://commons.wikimedia.org/wiki/File:Hudson_Highlands_view_south_from_Breakneck_Ridge.jpg) |
| public/images/hero/hero-cand-bear-mountain.jpg | Bear Mountain Bridge and Popolopen Creek, Anthony's Nose — ROUND-36 CANDIDATE | Reconrabbit | CC0 | [source](https://commons.wikimedia.org/wiki/File:Bear_Mountain_Bridge_and_Popolopen_Creek,_Anthony%27s_Nose.jpg) |
| public/images/hero/millerton-night.jpg | Millerton Business District at Night — REMOVED from /thank-you in round 38 (owner's complaint: power lines, blown flares, parked cars, orange cast, and the site's only full-colour hero). STILL IN USE on /connect and in a blog scene, so the file stays. | FromTheTron | CC0 | [source](https://commons.wikimedia.org/wiki/File:Millerton_Business_District_at_Night.jpg) |
| public/images/hero/hudson-twilight.jpg | Sky of West Point Evening | Wei Zhang@Hudson | BY 2.0 | [source](https://www.flickr.com/photos/28121863@N07/3224727572) |
| public/images/hero/valley-aerial.jpg | Breakneck Ridge II | Jeff Pang | BY 2.0 | [source](https://www.flickr.com/photos/29069842@N02/4784280225) |
| public/images/counties/dutchess.jpg | Walkway over the Hudson Poughkeepsie Highland Raliroad Bridg | bobistraveling | BY 2.0 | [source](https://www.flickr.com/photos/91008793@N00/5702967939) |
| public/images/counties/putnam.jpg | Cold Spring Harbor, NY | eleephotography | BY 2.0 | [source](https://www.flickr.com/photos/47096398@N08/5888417991) |
| public/images/counties/rockland.jpg | Harriman State Park | SurFeRGiRL30 | BY 2.0 | [source](https://www.flickr.com/photos/33143245@N02/7390645804) |
| public/images/counties/ulster.jpg | Lake Awosting At Minnewaska State Park | Gaurav Pandit | BY 3.0 | [source](https://commons.wikimedia.org/w/index.php?curid=7348066) |
| public/images/counties/orange.jpg | Cold Spring, NY | eleephotography | BY 2.0 | [source](https://www.flickr.com/photos/47096398@N08/5756646995) |
| public/images/counties/westchester.jpg | New Croton Dam | Malinda Rathnayake | BY 2.0 | [source](https://www.flickr.com/photos/malinki/15189998922) |
| public/images/lifestyle/buying.jpg | Wheaton | *rboed* | BY 2.0 | [source](https://www.flickr.com/photos/92082510@N04/29246201572) |
| public/images/lifestyle/selling.jpg | Round House in Rush Creek Village | dok1 | BY 2.0 | [source](https://www.flickr.com/photos/51096110@N00/7516923314) |
| public/images/lifestyle/financing.jpg | Accounting Finance | Wilfred Iven | CC0 1.0 | [source](https://stocksnap.io/photo/accounting-finance-JONMP7TPGK) |
| public/images/listings/house-01.jpg | red house | CodyR | BY 2.0 | [source](https://www.flickr.com/photos/21603648@N00/235609922) |
| public/images/listings/house-02.jpg | White house details, white flowering trees, green hedge, oct | Wonderlane | BY 2.0 | [source](https://www.flickr.com/photos/71401718@N00/4670987654) |
| public/images/listings/house-03.jpg | Cape house for sale with realtor for sale sign | jongorey | BY 2.0 | [source](https://www.flickr.com/photos/13548221@N04/39946020074) |
| public/images/listings/house-04.jpg | This Old House | Jan Tik | BY 2.0 | [source](https://www.flickr.com/photos/15363357@N00/6183733) |
| public/images/listings/house-05.jpg | Old House | Jimmy_Joe | BY 2.0 | [source](https://www.flickr.com/photos/31073149@N00/1189776958) |
| public/images/listings/house-06.jpg | Eugene - Victorian across from train depot | Kathleen Tyler Conklin | BY 2.0 | [source](https://www.flickr.com/photos/79865753@N00/2927440015) |
| public/images/listings/house-07.jpg | Stow farmhouse | Muffet | BY 2.0 | [source](https://www.flickr.com/photos/53133240@N00/2147672236) |
| public/images/listings/house-08.jpg | Tudor Revival house_0166 | hoyasmeg | BY 2.0 | [source](https://www.flickr.com/photos/62126383@N00/2676428722) |
| public/images/listings/house-09.jpg | Green Roof | pnwra | BY 2.0 | [source](https://www.flickr.com/photos/17573364@N00/460698511) |
| public/images/listings/house-10.jpg | Houses . Logan Circle . 1500 block of Q Street, NW . WDC . 1 | Elvert Barnes | BY 2.0 | [source](https://www.flickr.com/photos/95413346@N00/280042499) |
| public/images/listings/house-11.jpg | Parrrington House | chuck b. | BY 2.0 | [source](https://www.flickr.com/photos/82479320@N00/5899683304) |
| public/images/listings/house-12.jpg | Child's Playhouse | Cindy Funk | BY 2.0 | [source](https://www.flickr.com/photos/84858864@N00/3481392789) |
| public/images/listings/house-13.jpg | Saltbox house in Great Plain, Danbury, Connecticut | CityLimitsJunction | BY 4.0 | [source](https://commons.wikimedia.org/wiki/File:Saltbox_house_in_Great_Plain,_Danbury,_Connecticut.jpg) |
| public/images/listings/house-14.jpg | Living Room (Angle 2) | smoMashup1 | BY 2.0 | [source](https://www.flickr.com/photos/21015483@N02/3312118193) |
| public/images/listings/house-15.jpg | rooms were nice! | Betsssssy | BY 2.0 | [source](https://www.flickr.com/photos/39154240@N00/5249219872) |
| public/images/listings/house-16.jpg | kitchen | Midtown Crossing at Turner Park | BY 2.0 | [source](https://www.flickr.com/photos/30032090@N04/3007704037) |
| public/images/listings/house-17.jpg | Sustainable Kitchen | Jeremy Levine Design | BY 2.0 | [source](https://www.flickr.com/photos/25186605@N04/15606512391) |
| public/images/listings/house-18.jpg | apartment - dining room | Cubosh | BY 2.0 | [source](https://www.flickr.com/photos/39427725@N00/2609949336) |
| public/images/editorial/mailboxes-row.jpg | Rural mailboxes — four boxes on one weathered rack above an autumn valley, two of them numbered. SPENT: plate one of the skip-tracing flagship. Every row in this block was verified by opening its own Flickr photo page and reading the licence there, not by trusting a search index | _Imaji_ | BY 2.0 | [source](https://www.flickr.com/photos/76612814@N00/62469472) |
| public/images/editorial/mailboxes-receding.jpg | Mailboxes — a long receding rank of rusted boxes, one number legible. SPENT: cover of the skip-tracing flagship | sf-dvs | BY 2.0 | [source](https://www.flickr.com/photos/46207792@N00/253452403) |
| public/images/editorial/mailbox-road.jpg | Rural Mailbox — a single box far down a wet road in bare woods. SPENT: cold-open field of the skip-tracing flagship | Bob | BY 2.0 | [source](https://www.flickr.com/photos/12463666@N03/32252608421) |
| public/images/editorial/ledger-names.jpg | Very Old payroll Journal — names and dates entered by hand in ruled columns. SPENT: plate two of the skip-tracing flagship | peagreengirl | BY 2.0 | [source](https://www.flickr.com/photos/95652992@N00/396463634) |
| public/images/editorial/no-solicitation.jpg | no solicitation — a red warning sign, a striding figure with a case inside a triangle and its hat flying off, WARNING above NO SOLICITATION above Thank You! SPENT: plate three of the skip-tracing flagship. Round I corrected the hat here and in the plate alt | upyernoz | BY 2.0 | [source](https://www.flickr.com/photos/48600082269@N01/4183433578) |
| public/images/editorial/flyer-kiosk.jpg | Flyer Kiosk — overlapping notices, none of them addressed to anybody. SPENT: plate one of the marketing-automation flagship | Richard Ha | BY 2.0 | [source](https://www.flickr.com/photos/45561728@N06/4433739626) |
| public/images/editorial/index-drawers.jpg | file cabinets — a wall of wooden index drawers with brass bail handles, labelled by hand: the middle tier in ranges of surnames, the bottom tier DISTRICT and HANSARD. SPENT: plate two of the marketing-automation flagship. Round I corrected "ranges of surnames" here and in the plate alt, having counted the bottom tier | waferboard | BY 2.0 | [source](https://www.flickr.com/photos/60944931@N00/4137041591) |
| public/images/editorial/notice-board.jpg | flyers — a community board layered with notices. SPENT: cover of the marketing-automation flagship | Joel Kramer | BY 2.0 | [source](https://www.flickr.com/photos/75001512@N00/3448923996) |
| public/images/editorial/post-office-boxes.jpg | Post Office Boxes - Boonville, MO — a wall of numbered boxes in a small-town post office. SPENT: cold-open field of the marketing-automation flagship | Robert Stinnett | BY 2.0 | [source](https://www.flickr.com/photos/93732749@N00/5701673909) |
| public/images/editorial/mailbox-mist.jpg | Rural Mailbox — one box numbered 1801 against a field in fog. **UNSPENT** | Michele Dorsey Walfred | BY 2.0 | [source](https://www.flickr.com/photos/97485958@N02/41814676714) |
| public/images/editorial/clock-not-in-use.jpg | Worcester Shrub Hill Station - clock not in use — a station clock with a notice over its face telling you to read the electronic displays instead. SPENT: cover of the ai-scheduling flagship. Round G | Elliott Brown | BY 2.0 | [source](https://www.flickr.com/photos/39415781@N06/6365953749) |
| public/images/editorial/office-stamps.jpg | Rubber stamp stash — a rack of office stamps reading SURFACE MAIL, PROFORMA, DUPLICATE, TRIPLICATE, INSURED, COPY. SPENT: plate one of the document-processing flagship, Round F. (This row still read UNSPENT until round G checked its own counts against the directory: content/blog/document-scenes.ts has used this file since Round F shipped, and ROUND-F-LOG.md records it as spent) | mpclemens | BY 2.0 | [source](https://www.flickr.com/photos/24364103@N04/5483313713) |
| public/images/editorial/register-keys.jpg | Cash Register — the keys of an antique register, one of them reading RECEIPT. SPENT: plate two and cover of the invoicing-and-payments flagship. Round G | Steve Snodgrass | BY 2.0 | [source](https://www.flickr.com/photos/10710442@N08/4034636727) |
| public/images/editorial/archive-stacks.jpg | Shelves in the stacks of the Haus-, Hof- und Staatsarchiv — a corridor of numbered archive boxes receding to a lit door. SPENT: cold-open field of the document-processing flagship. Round F. The labels are Holy Roman Empire series (Reichstagsakten, Kurrheinische and Oberrheinische Kreisakten); a second photograph from the same set was rejected because its boxes read REICHSKANZLEI | -JvL- | BY 2.0 | [source](https://www.flickr.com/photos/32051524@N08/13091907034) |
| public/images/editorial/deed-1825.jpg | Manuscript Deed for Shaw Homestead, Kensington, New Hampshire, 1825 — a printed conveyance form with every blank filled in by hand. SPENT: plate two of the document-processing flagship. Round F. The parties named on it are two centuries dead and the deed is a public record published by a museum, which is why a legible name was acceptable here and is not on the skip-tracing post | museado | CC0 1.0 | [source](https://www.flickr.com/photos/200781279@N05/53901705421) |
| public/images/editorial/signature-ink.jpg | Signature — a fountain pen and one word written in ink on cream paper. SPENT: cover of the document-processing flagship. Round F | hierher | BY 2.0 | [source](https://www.flickr.com/photos/52220311@N08/16314639066) |
| public/images/editorial/ghost-sign-foundry.jpg | Ghost Wall. — a painted advertisement half worn off a red brick wall, FOUNDRY CO still readable and the vertical name above it painted over itself, with only its last letters, TOR, standing clear. SPENT: plate one of the data-enrichment flagship. Round F, reading corrected in Round I | A Continuous Lean | BY 2.0 | [source](https://www.flickr.com/photos/7393890@N04/5142025798) |
| public/images/editorial/ghost-signs-layered.jpg | Ghost Signs: Hand Painted Advertisements, Second Avenue, 34th Street, New York — several painted signs showing through each other on one building. SPENT: cover of the data-enrichment flagship. Round F | Jeffrey Zeldman | BY 2.0 | [source](https://www.flickr.com/photos/48889052497@N01/19534852651) |
| public/images/editorial/posters-peeled.jpg | peeled away — layers of torn paper on a wall, several older sheets showing through the tears. SPENT: cold-open field of the data-enrichment flagship. Round F | Michael Cory | BY 2.0 | [source](https://www.flickr.com/photos/80044857@N00/5639931024) |
| public/images/editorial/palimpsest-page.jpg | A page of the Archimedes Palimpsest — a prayer book written across an erased older manuscript, both scripts visible at once. SPENT: plate two of the data-enrichment flagship. Round F | Walters Art Museum Illuminated Manuscripts | CC0 1.0 | [source](https://www.flickr.com/photos/39699193@N03/5492154703) |
| public/images/editorial/lever-frame.jpg | The 44 lever frame at St Albans South signalbox — a receding rank of painted signal levers in a mechanical interlocking. SPENT: plate one of the ai-scheduling flagship. Round G. Every row in this block had its licence, its title AND its photographer's name read on the rendered photo page in Chromium (`scripts/_scratch-g-lic.mjs`), not out of a search index | Steve Knight | BY 2.0 | [source](https://www.flickr.com/photos/58415659@N00/16078259650) |
| public/images/editorial/switchboard.jpg | Vintage telephone switchboard — rows of numbered jacks with a forest of patch cords plugged into them. SPENT: cold-open field of the ai-scheduling flagship. Round G | Mike McBey | BY 2.0 | [source](https://www.flickr.com/photos/158652122@N02/49467795397) |
| public/images/editorial/departure-board.jpg | Departure board at Inverness Railway Station — six screens, four of departures plus Subsequent Departures and one cut off, each carrying a time somebody else set. SPENT: plate two of the ai-scheduling flagship. Round G, count corrected in Round I | David Jones | BY 2.0 | [source](https://www.flickr.com/photos/45457437@N00/9707241535) |
| public/images/editorial/adding-machine.jpg | Old mechanical adding machine — a full grid of numbered keys with the four operations down the right. SPENT: plate one of the invoicing-and-payments flagship. Round G | Les Chatfield | BY 2.0 | [source](https://www.flickr.com/photos/61132483@N00/15896899229) |
| public/images/editorial/till-drawer.jpg | Open till drawer — an empty cash drawer standing open under a register, one receipt on the floor beside it. SPENT: cold-open field of the invoicing-and-payments flagship. Round G | Deborah Fitchett | BY 2.0 | [source](https://www.flickr.com/photos/31320962@N05/3999463246) |
| public/images/editorial/type-case.jpg | gothic san serif lower case - FUTURA! — wooden letterpress type lying face up, one carved master per letter. SPENT: plate one of the ai-clone flagship. Round H | Kyle Van Horn | BY 2.0 | [source](https://www.flickr.com/photos/8503402@N08/2728009027) |
| public/images/editorial/tool-wall.jpg | The Garage — hand tools hung in order on a workshop wall. SPENT: plate one of the custom-automation flagship. Round H, having been reserved for it since Round F | huw-ogilvie | BY 2.0 | [source](https://www.flickr.com/photos/97438202@N00/28135419) |
| public/images/editorial/empty-theatre.jpg | Theatre Interior — rows of empty seats facing a drawn curtain. SPENT: cold-open field of the ai-clone flagship. Round H. Every row in this block had its licence and its photographer's name read on the rendered photo page in Chromium (`scripts/_scratch-h-owner.mjs`), matching on the licence URL rather than on the anchor's visible text | Michael Coghlan | BY 2.0 | [source](https://www.flickr.com/photos/89165847@N00/3109297781) |
| public/images/editorial/victrola.jpg | Victrola — a wind-up gramophone with a metal horn against a yellow wall. SPENT: plate two and cover of the ai-clone flagship. Round H | Vince Alongi | BY 2.0 | [source](https://www.flickr.com/photos/90963248@N00/2480351515) |
| public/images/editorial/abacus.jpg | abacus — pale stones resting between the rusted rods of a cast-iron frame. SPENT: cold-open field of the ai-audit flagship. Round H | jenny downing | BY 2.0 | [source](https://www.flickr.com/photos/7941044@N06/5838855288) |
| public/images/editorial/dial-panel.jpg | Dial panel — three pressure gauges on a yellow instrument panel, their faces labelled in Cyrillic. SPENT: plate one of the ai-audit flagship. Round H | Thomas Quine | BY 2.0 | [source](https://www.flickr.com/photos/91994044@N00/15502803579) |
| public/images/editorial/switch-box.jpg | Switches — three red industrial isolators bolted to a concrete wall, their levers in different positions. SPENT: plate two and cover of the ai-audit flagship. Round H | Vladimir Mokry | CC0 1.0 | [source](https://www.flickr.com/photos/100359919@N08/35375875141) |
| public/images/editorial/patch-panel.jpg | Patch panel cables — grey network cables looped by hand through a punch-down frame. SPENT: cold-open field of the custom-automation flagship. Round H | William | BY 2.0 | [source](https://www.flickr.com/photos/15805954@N00/3905694973) |
| public/images/editorial/jacquard-cards.jpg | Punched cards from a Jacquard loom — laced cards of punched holes riding the head of a loom. SPENT: plate two and cover of the custom-automation flagship. Round H | pedrik | BY 2.0 | [source](https://www.flickr.com/photos/24388834@N04/24093489692) |
| public/images/levan-portrait.jpg | Levan Tsiklauri portrait | Levan Tsiklauri | Owner's own photograph | [source](https://realtylt.com/who-we-are) |
| public/images/google-logo.png | Google mark, shown beside real Google reviews | Google LLC | Trademark, nominative use | [source](https://about.google/brand-resource-center/) |
| public/images/why/our-search.webp | RealtyLT search page | RealtyLT | Our own screenshot | [source](https://github.com/levan-tsi/realtylt-website) |
| public/images/why/our-listing-gallery.webp | RealtyLT listing gallery | RealtyLT | Our own screenshot | [source](https://github.com/levan-tsi/realtylt-website) |
| public/images/why/our-home-value.webp | RealtyLT home-value page | RealtyLT | Our own screenshot | [source](https://github.com/levan-tsi/realtylt-website) |
| public/images/why/our-market-insights.webp | RealtyLT market insights | RealtyLT | Our own screenshot | [source](https://github.com/levan-tsi/realtylt-website) |
| public/images/why/our-save-search.webp | RealtyLT save-a-search | RealtyLT | Our own screenshot | [source](https://github.com/levan-tsi/realtylt-website) |
| public/images/mls/onekey-mls.svg | One Key MLS mark | One Key MLS | Trademark, required IDX attribution | [source](https://www.onekeymls.com/) |
| public/images/mls/onekey-mls-on-dark.svg | One Key MLS mark, light-on-dark | One Key MLS | Trademark, required IDX attribution | [source](https://www.onekeymls.com/) |
| public/images/mls/coming-soon.svg | "Photograph coming soon" panel — IN USE. Typographic, drawn in the site's own palette and display face | RealtyLT | Our own artwork | — |
| public/images/mls/coming-soon-notext.svg | Wordless cut of the same panel, for overlay tiles that print their own price | RealtyLT | Our own artwork | — |
| public/images/mls/coming-soon.webp | RETIRED 2026-08-02, kept on purpose — "coming soon" placeholder, moonlit manor | Levan Tsiklauri, Google Nano Banana Pro via ElevenLabs | Owner's own generated artwork | [source](https://elevenlabs.io/) |
| public/images/mls/coming-soon-notext.webp | RETIRED 2026-08-02, kept on purpose — wordless cut (sky text removed with local Mage-Flow edit) | Levan Tsiklauri + RealtyLT | Owner's own generated artwork | [source](https://elevenlabs.io/) |
