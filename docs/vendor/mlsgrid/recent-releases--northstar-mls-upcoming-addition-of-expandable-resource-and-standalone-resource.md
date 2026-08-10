---
source: https://docs.mlsgrid.com/recent-releases/northstar-mls-upcoming-addition-of-expandable-resource-and-standalone-resource
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-12-01T23:36:42.016Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# Northstar MLS: Upcoming Addition of Expandable Resource and Standalone Resource

Hello API Data Consumer,
We want to notify you that the MLS Grid will be making the following changes to the Northstar MLS data distributed via the MLS Grid API. These changes will only affect new or modified property records following the release. These changes will not apply to older property records you have already obtained. The details of the change can be found below.

MLS Affected: Northstar MLS
Date of Change: December 8, 2025
Resources Affected: PROPERTY
Type of Change: NEW EXPANDABLE BodyOfWater RESOURCE, NEW UnitRooms RESOURCE

NEW EXPANDED RESOURCE - BodyOfWater

The following fields will be moved from the Property resource to create a new separate expanded resource on the property record. This will function the same way as expanded Media, Rooms, and UnitTypes function currently.
The new BodyOfWater resource will be accessible by adding
“$expand=BodyOfWater” to your existing queries.

The fields moving the property record to the BodyOfWater resource are:

LakeAcres
LakeChainAcres
LakeChainName
LakeDepth
WaterBodyKey
WaterBodyName

Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System. Any older property records will continue to contain these fields on the property record.

DO NOT re-pull old records as these changes will not be available on old records.

NEW STANDALONE RESOURCE - UnitRooms
A new standalone resource will be added that will provide additional information about rooms in Multi-Unit properties. This standalone resource will be titled “UnitRooms” and will be accessible by modifying your queries to access this standalone resource.

A query to the UnitRooms resource will look like the following:

https://api.mlsgrid.com/v2/UnitRooms?$filter=OriginatingSystemName eq 'northstar'
When provided by the agent this new resource will provide the following information about Rooms contained in the Multi-Unit property.

The field available in UnitRooms this resource are:

ModificationTimestamp
UnitKey
RoomDimensions
RoomKey
RoomLevel
RoomType

Any new or modified records from the MLS will immediately create UnitRooms records in the UnitRooms resource when provided by the MLS.

DO NOT re-pull old records as these changes will not be available on old records.

The expanded BodyOfWater resource and the new standalone UnitRooms resource will become available on December 8, 2025 at approximately 10:30am Central Time.

PreviousRealtracs MLS: Changes to MLS Grid IDX and VOW RulesNextMRED: IDX and VOW Rules Changes
Last updated 8 months ago
