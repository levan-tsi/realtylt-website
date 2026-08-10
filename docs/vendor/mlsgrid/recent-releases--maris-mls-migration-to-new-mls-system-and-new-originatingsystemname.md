---
source: https://docs.mlsgrid.com/recent-releases/maris-mls-migration-to-new-mls-system-and-new-originatingsystemname
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-05-01T18:25:40.778Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# MARIS MLS: Migration to new MLS system and new OriginatingSystemName

Hello API Data Consumer,
We want to notify you that the MARIS MLS has announced they will delay their migration to a new version of their Matrix MLS System until May 12th, 2025.
Access to the new OriginatingSystemName 'maris2' is now available and permissions to this new OriginatingSystemName have automatically been added to your existing access token. We encourage all Data Consumers to begin their intial import of OriginatingSystemName 'maris2' as soon as possible to meet MARIS’ new extended deadline.
This new version of MARIS MLS will be more compliant with RESO Data Dictionary 2.0 and as a result most fields will be renamed to better reflect RESO Data Dictionary standards. ALL Data Consumers should treat this change as an initial import of a new MLS source and take appropriate steps to conduct an initial import of this new version of MARIS MLS.

Please contact support@mlsgrid.com and request a Grace Period for your access token when you being your initial import of this new OriginatingSystemName 'maris2'.

The detail of the changes can be found below.
MLS Affected: MARIS MLS
Date of Change: May 12, 2025
Resources Affected: ALL RESOURCES WILL BE AFFECTED
Type of Change: DATA CONSUMERS WILL NEED TO REIMPORT MARIS MLS DATA

## Description of Changes:

-

NEW OriginatingSystemName: 'maris2'

As part of the MARIS MLS migration to their new Matrix MLS system ALL Data Consumers currently receiving MARIS MLS data through MLS Grid will need to change the OriginatingSystemName used in requests to the API to use the new OriginatingSystemName 'maris2'.
Example of Current requests: https://api.mlsgrid.com/v2/Property?$filter=OriginatingSystemName eq 'maris'

Example of New requests: https://api.mlsgrid.com/v2/Property?$filter=OriginatingSystemName eq 'maris2'
This change requires ALL Data Consumers currently accessing MARIS MLS data to conduct a new initial import of all MARIS MLS data from the MLS Grid
This new OriginatingSystemName will become available on April 29, 2025. Permissions for this new OriginatingSystemName will automatically be added to your existing API access token.
To avoid any interruption in access to MARIS MLS data you should begin your new initial import of MARIS MLS ('maris2') as soon as you receive notification from MLS Grid that permissions to access 'maris2' have been aded to your API access token.
Following MARIS MLS’s migration to their new Matrix MLS system, Listing Input in the old MARIS MLS system will no longer be permitted by MARIS and data accessed through the old OriginatingSystemName 'maris' may become out of date.
Technical Documentation on the use of OriginatingSystemName can be found here:
https://docs.mlsgrid.com/api-documentation/api-version-2.0#originatingsystemname

-

NEW Local Fields Prefix: MIS_

With the change to the new OriginatingSystemName ALL Data Consumers will now receive local fields for MARIS MLS with the new prefix MIS_
Example of change in Local field prefix: MAR_AuctionYN will become MIS_AuctionYN
Technical Documentation on the use of Local Fields Prefix can be found here:
https://docs.mlsgrid.com/api-documentation/api-version-2.0#local-fields-prefix

-

NEW Prefixed KeyField Values: MIS

With the change to the new OriginatingSystemName ALL Data Consumers will now receive Prefixed Key Values with the new prefix MIS
Example of Prefixed KeyField value change: ListingId MAR12345 will become ListingId MIS12345
Technical Documentation on the use of Prefixed KeyField Values can be found here:
https://docs.mlsgrid.com/api-documentation/api-version-2.0#prefixed-keyfield-values

-

New MARIS MLS Fields

As part of the migration of MLS systems ALL Data Consumers will need to adjust mappings of MARIS MLS fields as some of the existing field names will change or be removed. Some field names will remain the same, but others will be different and more compliant with the RESO Data Dictionary 2.0.
For that reason new data mappings for MARIS MLS (NEW) have been made available in the Mappings section of your existing MLS Grid account (app.mlsgrid.com/developer/mappings).
We recommend that your organization familiarize itself with these field changes.

PreviousHeartland MLS: Adding Coming Soon listings to IDX and VOWNextREcolorado: Upcoming Changes to Fields and Lookups
Last updated 1 year ago
