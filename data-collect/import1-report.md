# US Hotel Import Preparation Report (IMPORT1-PREP)

**Date:** 2026-10-28  
**Scope:** United States hotel facts preparation (zero database writes, local analysis only).

---

## 1. Inventory Summary & Country Counts

Raw records in source dataset (`all-extracted-hotels.json`): **9756**

| Country | Records | Status |
|---|---|---|
| **United States (US)** | **7836** | **Processed this round** |
| Spain (ES) | 1568 | Counted, not processed |
| Canada (CA) | 292 | Counted, not processed |
| United Kingdom (GB) | 60 | Counted, not processed |

---

## 2. Deduplication & Matching Breakdown

Following the de-duplication rules (normalised name + normalised street / geo rounded to 4 decimals), the US inventory resolves to:

- **Unique US Hotels:** **6922**
- **Duplicate Records Merged:** **914**
- **Hotels with Differing Variants Preserved:** **117**

### Matching Against Existing 562 US Hotels

The 6922 unique US hotels classify as:

| Classification | Count | Description |
|---|---|---|
| **High Match** | **22** | Same normalised name, same city, geo within 300 m |
| **Medium Match** | **44** | Same city name substring, or geo within 150 m with different name (written to review list) |
| **New Hotels** | **6856** | Unmatched US properties proposed for import |
| **Total Unique US** | **6922** | **High (22) + Medium (44) + New (6856) = 6922** |

---

## 3. High Match Fact Fills & Conflicts

Proposals for the 22 high-confidence matched hotels:

- **Hotels with Proposed Fills:** **5**
  - `streetAddress` filled (replacing area placeholders like "Prime Enclave"): **5**
  - `coordinates` filled: **0**
  - `area / neighbourhood` filled: **0**
  - `roomType` filled (only if ours was empty): **0**
- **Hotels with Room / Tub Type Conflicts:** **20**
  - Preserved existing database values; queued for manual source verification against partner listings.

---

## 4. Proposed New Hotels & Town Mapping

For the **6856** proposed new hotels:

- **Attached to Existing 38 US City Pages:** **776**
- **Mapped to New Towns:** **6080**
- **New Hotels Lacking Verified Room Name:** **1609**
- **New Hotels Lacking Real Coordinates:** **3592**

---

## 5. New Towns & City-Page Candidates

- **Distinct New Towns Identified:** **833**
- **Towns with 5+ Hotels (City-Page Candidates):** **376**

### Top 30 New Towns by Hotel Count

| Rank | Town | State | Hotels | With Room Name | With Real Geo | City-Page Candidate |
|---|---|---|---|---|---|---|
| 1 | Michigan | MI | 73 | 59 | 14 | Yes (5+) |
| 2 | Highland | *(unplaced)* | 68 | 0 | 0 | Yes (5+) |
| 3 | Eureka Springs | AR | 62 | 47 | 47 | Yes (5+) |
| 4 | Wisconsin | WI | 58 | 25 | 2 | Yes (5+) |
| 5 | Windermere | *(unplaced)* | 53 | 10 | 6 | Yes (5+) |
| 6 | Big Bear Lake | CA | 47 | 6 | 46 | Yes (5+) |
| 7 | Pigeon Forge | TN | 44 | 39 | 40 | Yes (5+) |
| 8 | Texas | TX | 43 | 30 | 5 | Yes (5+) |
| 9 | Dumfries and Galloway | *(unplaced)* | 42 | 0 | 0 | Yes (5+) |
| 10 | Helen | GA | 41 | 15 | 12 | Yes (5+) |
| 11 | Pennsylvania | PA | 39 | 19 | 0 | Yes (5+) |
| 12 | Illinois | IL | 39 | 34 | 0 | Yes (5+) |
| 13 | Branson | MO | 38 | 34 | 31 | Yes (5+) |
| 14 | Ohio | OH | 38 | 27 | 3 | Yes (5+) |
| 15 | California | CA | 38 | 34 | 7 | Yes (5+) |
| 16 | Indianapolis | IN | 38 | 38 | 16 | Yes (5+) |
| 17 | Perth and Kinross | *(unplaced)* | 37 | 0 | 0 | Yes (5+) |
| 18 | Virginia | VA | 36 | 24 | 4 | Yes (5+) |
| 19 | Oklahoma City | OK | 36 | 36 | 23 | Yes (5+) |
| 20 | Tulsa | OK | 35 | 18 | 14 | Yes (5+) |
| 21 | British Columbia | *(unplaced)* | 35 | 25 | 0 | Yes (5+) |
| 22 | North Carolina | NC | 32 | 18 | 2 | Yes (5+) |
| 23 | West Virginia | WV | 32 | 18 | 0 | Yes (5+) |
| 24 | Georgia | GA | 31 | 22 | 2 | Yes (5+) |
| 25 | Milwaukee | WI | 31 | 31 | 14 | Yes (5+) |
| 26 | Wimberley | TX | 30 | 0 | 0 | Yes (5+) |
| 27 | Detroit | MI | 30 | 30 | 4 | Yes (5+) |
| 28 | Atlantic City | NJ | 29 | 28 | 9 | Yes (5+) |
| 29 | Shenandoah | VA | 29 | 0 | 0 | Yes (5+) |
| 30 | Kansas | KS | 29 | 24 | 1 | Yes (5+) |

---

## 6. Verification & Data Integrity Checks

- **Database Writes:** 0 (read-only execution)
- **External Network Requests:** 0 (local execution)
- **Forbidden Fields Audit:** All generated files in `data-collect/private/` and `data-collect/import1-report.md` exclude `about`, `guestTubReview`, `images`, `bookingUrl`, `priceFromUsd`, `rating`, `reviewCount`, `amenities`, and affiliate tracking codes.
