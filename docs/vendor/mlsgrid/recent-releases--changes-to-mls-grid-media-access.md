---
source: https://docs.mlsgrid.com/recent-releases/changes-to-mls-grid-media-access
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2026-05-06T18:48:13.688Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# Changes to MLS Grid Media Access

Hello API Data Consumer,
We want to notify you that the MLS Grid will be making changes to how you access media on June 1, 2026. The details of the change can be found below.

If you are not the development/technical point of contact for your MLS Grid data subscription please ensure you provide the following information to those individuals.
MLS Grid will now require of ALL Data Consumers that requests to download the expanded media using the provided Media URL MUST include a HTTP User-Agent header.
That User-Agent value MUST be the Oauth 2 access token you are provided by MLS Grid that is used to access our Web API. The access token can be found under the Access Token tab of your existing MLS Grid data subscription.

Starting June 1, 2026 if the User-Agent value is not your provided Oauth 2 access token your access to media may be denied.
Please take steps to immediately implement this change as part of all requests submitted to download media. We highly recommend that you review the Media section of our technical documentation regarding this change:

https://docs.mlsgrid.com/api-documentation/api-version-2.0#media#media

PreviousSCKansas MLS: Changes to MLS Grid IDX and VOW RulesNextRealtracs MLS: Changes to MLS Grid IDX and VOW Rules
Last updated 3 months ago
