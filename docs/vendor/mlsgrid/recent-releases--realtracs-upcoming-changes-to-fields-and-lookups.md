---
source: https://docs.mlsgrid.com/recent-releases/realtracs-upcoming-changes-to-fields-and-lookups
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-02-14T21:28:39.870Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# Realtracs: Upcoming Changes to Fields and Lookups

We want to notify you that the MLS Grid will be making the following changes to one or more of your API data feeds. The details of the change can be found below.
Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to add or rename affected fields in your local environment accordingly.

DO NOT re-pull older records as these changes will not be available on older records.
MLS Affected: Realtracs MLS
Date of Change: February 18, 2025
Resources Affected: PROPERTY, OFFICE, MEMBER
Type of Change: FIELD NAME CHANGES, LOOKUP NAME CHANGES
Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to add or rename affected fields in your local environment accordingly.

DO NOT re-pull old records as these changes will not be immediately available on old records.

The following KeyNumeric fields will be removed as they are redundant with other existing Key fields
PROPERTY RESOURCE

-

BuyerAgentKeyNumeric

-

BuyerOfficeKeyNumeric

-

CoBuyerAgentKeyNumeric

-

CoBuyerOfficeKeyNumeric

-

CoListAgentKeyNumeric

-

CoListOfficeKeyNumeric

-

ListAgentKeyNumeric

-

ListingKeyNumeric

-

ListOfficeKeyNumeric

OFFICE RESOURCE

-

OfficeBrokerKeyNumeric

-

OfficeKeyNumeric

-

OfficeManagerKeyNumeric

MEMBER RESOURCE

-

MemberKeyNumeric

-

OfficeKeyNumeric

The following fields will have Lookup values changed or removed completely
PROPERTY RESOURCE

-

Appliances - “Grill” will be renamed to “Indoor Grill”

-

Appliances - “Washer Dryer Connection” will be removed

-

Flooring - “Bamboo/Cork” will be renamed “Cork”

-

Flooring - “Finished Wood” will be renamed “Wood”

-

Heating - “Stove” will be renamed “Wood Stove”

-

ParkingFeatures - “Attached - Front” will be renamed “Garage Faces Front”

-

ParkingFeatures - “Attached - Rear” will be renamed “Garage Faces Rear”

-

ParkingFeatures - “Attached - Side” will be renamed “Garage Faces Side”

-

PropertyTimeZoneName - lookups in this field will be replaced with IanaTimeZoneValues to comply with RESO Data Dictionary 2.0 requirements

OFFICE RESOURCE

-

OfficeType - Old lookup values no longer in use will be removed from metadata

-

OfficeBranchType - Field will be removed completely as the lookup values are not accurate and no longer in use

MEMBER RESOURCE

-

MemberType - Old lookup values no longer in use will be removed from metadata

Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to add or rename affected fields in your local environment accordingly.

DO NOT re-pull older records as these changes will not be available on older records.

PreviousNWMLS: Upcoming Changes to Fields
Last updated 1 year ago
