---
source: https://docs.mlsgrid.com/recent-releases/mred-mls-upcoming-changes-to-fields-april-2-2025
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-03-26T22:14:01.390Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# MRED MLS: Upcoming Changes to Fields (April 2, 2025)

Hello API Data Consumer,
We want to notify you that the MLS Grid will be making the following changes to one or more of your API data feeds. The details of the change can be found below.
MLS Affected: MRED MLS
Date of Change: April 2, 2025
Resources Affected: PROPERTY
Type of Change: FIELD NAME CHANGES, FIELDS ADDED
Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to add or rename affected fields in your local environment accordingly.

DO NOT re-pull old records as these changes will not be immediately available on old records.

## Field(s) Affected:

The following fields will be renamed to better reflect RESO Data Dictionary standards, or naming conventions already in use

PROPERTY RESOURCE

-

MRD_ACTV_DATE will be renamed ActivationDate

-

MRD_BMD will be renamed BackOnMarketDate

-

MRD_DBL will be renamed BodyType

-

MRD_RENTAL_PROPERTY_TYPE will be renamed PropertyAttachedYN

-

MRD_UFL will be renamed EntryLevel

Some fields that are duplicative are being renamed and merged into a single RESO Data Dictionary compliant field

-

MRD_BAS will be renamed and merged into Basement

-

MRD_DRV will be renamed merged into ParkingFeatures

-

MRD_GAR will be renamed and merged into ParkingFeatures

-

MRD_GARAGE_TYPE will be renamed and merged into ParkingFeatures

-

MRD_GARAGE_OWNERSHIP will be renamed and merged into ParkingFeatures

-

MRD_GARAGE_ONSITE will be renamed and merged into ParkingFeatures

-

MRD_PARKING_OWNERSHIP will be renamed and merged into ParkingFeatures

-

MRD_PARKING_ONSITE will be renamed and merged into ParkingFeatures

-

MRD_PKN will be renamed and merged into ParkingFeatures

The following fields will be added to conform to RESO Data Dictionary standards
PROPERTY RESOURCE

-

Fencing

-

HorseAmenities

-

Levels

-

WaterfrontFeatures

PreviousRRAR MLS: Upcoming Changes to FieldsNextNIRA (Northwest Indiana REALTOR Association) MLS: Upcoming Changes to Fields
Last updated 1 year ago
