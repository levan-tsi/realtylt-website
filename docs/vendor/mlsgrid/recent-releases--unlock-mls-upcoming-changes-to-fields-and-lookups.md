---
source: https://docs.mlsgrid.com/recent-releases/unlock-mls-upcoming-changes-to-fields-and-lookups
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-03-04T20:42:22.334Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# Unlock MLS: Upcoming Changes to Fields and Lookups

Hello API Data Consumer,
We want to notify you that the MLS Grid will be making the following changes to one or more of your API data feeds.
These changes will only affect organizations using the MLS Grid API to access data from Unlock MLS.
The details of the change can be found below.
MLS Affected: Unlock MLS
Date of Change: March 11, 2025
Resources Affected: PROPERTY, MEMBER
Type of Change: FIELD NAME CHANGES, LOOKUP NAME CHANGES
Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to add or rename affected fields in your local environment accordingly.

DO NOT re-pull old records as these changes will not be immediately available on old records.

## Field(s) Affected:

The following fields will be renamed to better reflect RESO Data Dictionary standards

PROPERTY RESOURCE

-

ACT_AttributionContact - will be renamed to AttributionContact

-

ACT_BackOnMarketDate - will be renamed to BackOnMarketDate

-

ACT_UnitRoomType - will be renamed to RoomType

The following fields will have Lookup values changed or removed completely
PROPERTY RESOURCE

-

AccessibilityFeatures - “Enhanced Accessibility” will be renamed to “Enhanced Accessible”

-

ExteriorFeatures - “Boat Dock - Shared” will be renamed “Dock”

-

ExteriorFeatures - “Boat Dock - Private” will be renamed “Dock”

-

Heating - “ENERGY STAR/ACCA RSI Quality Install” will be renamed “ENERGY STAR/ACCA RSI Qualified Installation”

-

LotFeatures - “Sprinkler - In Front” will be renamed “Sprinklers In Front”

-

LotFeatures - “Sprinkler - Side Yard” will be renamed “Sprinklers On Side”

-

LotFeatures - “Sprinkler - In Rear” will be renamed “Sprinklers In Rear”

-

LotFeatures - “Back to Park/Greenbelt” will be renamed “Greenbelt”

-

OtherStructures - “Packing Shd” will be renamed “Packing Shed”

-

ParkingFeatures - “Elec Vehicle Charge Station(s)” will be renamed “Electric Vehicle Charging Station(s)”

-

PoolFeatures - Saltwater will be renamed “Salt Water”

-

WindowFeatures - “Low Emissivity Windows” will be renamed “Low-Emissivity Windows”

MEMBER RESOURCE

-

MemberType - “Affiliate Corporate” will be renamed “Affiliate”

-

MemberType - “Affiliate Individual” will be renamed “Affiliate”

PreviousLBOR MLS: Status and Field AdditionNextOneKey MLS: Upcoming Changes to Fields and Lookups
Last updated 1 year ago
