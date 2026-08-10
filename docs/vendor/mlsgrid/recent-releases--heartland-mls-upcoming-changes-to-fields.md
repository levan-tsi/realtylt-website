---
source: https://docs.mlsgrid.com/recent-releases/heartland-mls-upcoming-changes-to-fields
fetched: 2026-08-10T03:27:32.861Z
sitemap_lastmod: 2025-03-26T21:02:01.179Z
---

For the complete documentation index, see llms.txt. This page is also available as Markdown.
Copy
On this page

- RECENT RELEASES

# Heartland MLS: Upcoming Changes to Fields

Hello API Data Consumer,
We want to notify you that the MLS Grid will be making the following changes to one or more of your API data feeds. The details of the change can be found below.
MLS Affected: Heartland MLS
Date of Change: March 31, 2025
Resources Affected: PROPERTY, MEMBER, OFFICE
Type of Change: FIELD NAME CHANGES, FIELDS ADDED
Any new or modified records from the MLS will immediately receive these changes on new or modified records as the information is added in the MLS System.

Please take appropriate steps to add or rename affected fields in your local environment accordingly.

DO NOT re-pull old records as these changes will not be immediately available on old records.

## Field(s) Affected:

The following fields will be renamed to better reflect RESO Data Dictionary standards, or naming conventions already in use

PROPERTY RESOURCE

-

HMS_ActivateDate will be renamed ActivationDate

-

HMS_AgeRestrictedYN will be renamed SeniorCommunityYN

-

HMS_AttributionContact will be renamed AttributionContact

-

HMS_LegalDescription will be renamed TaxLegalDescription

MEMBER RESOURCE

-

HMS_MemberMailAddr1 will be renamed HMS_MemberMailAddress1

-

HMS_MemberMailAddr2 will be renamed HMS_MemberMailAddress2

OFFICE RESOURCE

-

HMS_OfficeMailCity will be renamed OfficeMailCity

-

HMS_OfficeMailPostalCode will be renamed OfficeMailPostalCode

-

HMS_OfficeMailPostalCodePlus4 will be renamed OfficeMailPostalCodePlus4

-

HMS_OfficeMailStateOrProvince will be renamed OfficeMailStateOrProvince

-

HMS_OfficeMailAddr1 will be renamed OfficeMailAddress1

-

HMS_OfficeMailAddr2 will be renamed OfficeMailAddress2

The following fields will be added to conform to RESO Data Dictionary standards
PROPERTY RESOURCE

-

DoorFeatures

-

FoundationDetails

-

SpaFeatures

-

StructureType

PreviousNIRA (Northwest Indiana REALTOR Association) MLS: Upcoming Changes to FieldsNextLBOR MLS: Status and Field Addition
Last updated 1 year ago
