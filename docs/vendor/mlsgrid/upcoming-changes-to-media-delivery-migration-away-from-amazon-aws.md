---
source: https://docs.mlsgrid.com/upcoming-changes-to-media-delivery-migration-away-from-amazon-aws
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2026-08-04T18:20:33.030Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

# Upcoming Changes to Media Delivery — Migration Away from Amazon AWS

Hi everyone,
We want to give you advance notice of a change coming to how MLS Grid delivers Media (photos and other listing media). MLS Grid is migrating our Media hosting and delivery infrastructure off of Amazon Web Services (AWS). As part of this move, the URLs your systems use to retrieve Media will change.
This notice explains what's changing, why it matters to you, and what action — if any — you'll need to take depending on how your system currently consumes Media from MLS Grid.

## What’s Changing

MLS Grid will no longer serve Media directly from Amazon AWS. Going forward, Media will be delivered from a new MLS Grid domain. New Media URLs will follow this format:

Copy

```
https://media.mlsgrid.com/token=OlQCGcw0eHIb7_yVPb0oNQwLxSS-WV2BniUX0TuI5tw&expires=1785214585&id=6a5fd94b01ecf70f22bafd26/images/MFR781897278/763177d0-e06c-4672-a48e-2801be622702.jpeg
```

This is an example only — the token, expiration, and file identifiers will be unique to each Media item and will be provided through the normal RESO Web API resources, exactly as they are today.
Important — these URLs are signed, single-use, and time-limited:

-

Signed: The token, expiration, and id parameters are cryptographically tied to the URL. Any modification to the URL — including reformatting, re-encoding, or editing any part of it — will invalidate it.

-

Single-use: Each URL can be used to download its image only once. A second request using the same URL will fail.

-

Time-limited: Each URL expires one hour after it is generated. If it isn’t used within that window, it will no longer work and a new URL will need to be retrieved via the API.

## What You Need to Do

Your required action depends on how your system currently accesses Media from MLS Grid:

1. You download Media and store it on your own servers

Your download-and-store workflow itself doesn't need to change, but because the new URLs are single-use and expire after one hour, one thing does matter: retrieve each URL from the API and download the image promptly, rather than storing the URL itself for later use or re-downloading. Do not cache, share, or re-request an already-used Media URL — it will not work a second time.

2. You access Media via S3 bucket-to-bucket transfer

This method will no longer be available once we complete the migration off of AWS. Vendors using bucket-to-bucket transfer will need to move to a traditional download-and-store workflow — retrieving each signed Media URL via the API and downloading the image to your own storage — as described in the MLS Grid technical documentation (https://docs.mlsgrid.com/api-documentation/api-version-2.0#media).

3. You access Media via Amazon CloudFront

Your current CloudFront-based access will need to be reconfigured to point to the CDN that MLS Grid will operate going forward. Please contact MLS Grid so we can get you set up on the new CDN ahead of the transition.

## Timeline

This transition will take place on September 8, 2026, starting at 12:00 PM (noon) Mountain Time. The corresponding times in the other continental U.S. time zones are:

• Pacific Time: 11:00 AM
• Mountain Time: 12:00 PM (noon)
• Central Time: 1:00 PM
• Eastern Time: 2:00 PM

## Questions or Need to Coordinate a Transition?

If you fall into scenario 3 above, or if you have any questions about how this affects your integration, please reach out to us at support@mlsgrid.com and we will work with you directly on a smooth transition.
Thanks for your continued partnership — we’ll follow up with any additional detail as the transition date approaches.
Best regards,
Joe Szurgyi, CEO

PreviousAPI Version 2.0NextPACMLS Now Available Through MLS Grid
Last updated 4 days ago
