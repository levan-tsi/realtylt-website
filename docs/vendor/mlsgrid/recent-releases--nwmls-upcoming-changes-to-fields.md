---
source: https://docs.mlsgrid.com/recent-releases/nwmls-upcoming-changes-to-fields
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-02-26T21:54:54.716Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# NWMLS: Upcoming Changes to Fields

Hello API Data Consumer,
We want to notify you that the MLS Grid will be making the following changes to one or more of your API data feeds. The details of the change can be found below.
MLS Affected: NWMLS
Date of Change: EVENING OF MARCH 05, 2025
Resources Affected: PROPERTY, OFFICE, MEMBER
Type of Change: FIELD NAME CHANGES, LEGACY FIELDS DEPRECATED
Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to remove, or rename affected fields in your local environment accordingly.

DO NOT re-pull records as these changes will not have immediate impact on records, the records will simply no longer contain these fields in the future or when modified

## Field(s) Affected:

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

MainOfficeKeyNumeric

-

OfficeBrokerKeyNumeric

-

OfficeKeyNumeric

MEMBER RESOURCE

-

MemberKeyNumeric

-

OfficeKeyNumeric

The following fields will be removed completely
PROPERTY RESOURCE

-

NWM_EquipmentIncluded

-

NWM_IncludedInRent

-

NWM_Rent

-

TaxLegalDescription

The following fields will be retitled to more appropriate field names
PROPERTY RESOURCE

-

NWM_AdditionalTaxIds will become: NWM_AdditionalParcelsDescription

-

BuyerAgencyCommission will become: BuyerBrokerageCompensation

-

CancelationDate will become: CancellationDate

-

NWM_CommissionType will become: BuyerBrokerageCompensationType

-

NWM_Outbuildings will become: OtherStructures

PreviousOneKey MLS: Upcoming Changes to Fields and LookupsNextRealtracs: Upcoming Changes to Fields and Lookups
Last updated 1 year ago
