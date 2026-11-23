# US Hotel Import Preparation Report (IMPORT1-PREP-B)

**Date:** 2026-10-28  
**Scope:** United States hotel facts preparation — refined town placement, suburb detection, and full conflict reporting (zero database writes, local analysis only).

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

## 2. Deduplication & State Code Filtering (Task B1)

Following the de-duplication rules (normalised name + normalised street / geo rounded to 4 decimals), the US inventory resolves to:

- **Total Unique US Input Records:** **6922**
- **Duplicate Records Merged:** **914**
- **Hotels with Differing Variants Preserved:** **117**

### Non-US Records Dropped to `data-collect/private/non-us-records.json`

- **Valid US Records Kept:** **6104**
- **Non-US Records Dropped:** **818**
- **Sum Verification:** **6104 + 818 = 6922** (equals 6922)

#### Breakdown of Dropped Non-US Records by Reason

| Reason | Count | Notes |
|---|---|---|
| UK postcode or region | 312 | UK regions (e.g. Highland, Windermere, Cumbria) and postcodes |
| Canadian province | 129 | Canadian provinces (e.g. BC, ON, QC) and postal codes |
| Spain destination or province | 169 | Spanish destinations and provinces |
| Unknown / missing US state code | 208 | Records without valid 2-letter US state code |

---

## 3. Matching Against Existing 562 US Hotels

Matching the 6104 valid US hotels against our existing 562 US properties:

| Classification | Count | Description |
|---|---|---|
| **High Match** | **22** | Same normalised name, same city, geo within 300 m |
| **Medium Match** | **47** | Same city name substring, or geo within 150 m with different name (written to review list) |
| **New Hotels** | **6035** | Unmatched US properties proposed for import |
| **Total Valid US Kept** | **6104** | **High (22) + Medium (47) + New (6035) = 6104** |

---

## 4. High Match Fact Fills & Conflicts (Task B4)

Proposals for the 22 high-confidence matched hotels:

- **Hotels with Proposed Fills:** **7**
  - `streetAddress` filled (replacing area placeholders like "Prime Enclave"): **5**
  - `coordinates` filled: **0**
  - `area / neighbourhood` filled: **3**
  - `roomType` filled (only if ours was empty): **0**
- **Hotels with Room / Tub Type Conflicts:** **20**

### All 20 Room-Name Conflicts (Task B4 Full Table)

| # | Hotel | City | Our Room Name | Their Room Name |
|---|---|---|---|---|
| 1 | Four Seasons Hotel Atlanta | Atlanta | Midtown Suite with Marble Soaking Tub | The Presidential Suite Bathroom with Spa tub |
| 2 | The Whitley, a Luxury Collection Hotel, Atlanta Buckhead | Atlanta | Executive King Suite with Marble Tub | Presidential King Suite with Skyline View and Spa Bath |
| 3 | Four Seasons Baltimore | Baltimore | Luxury Room with Soaking Tub | Admiral King Suite with Spa tub |
| 4 | 1840s Carrollton Inn | Baltimore | Deluxe Room with Freestanding Tub | Declaration Suite with Jetted tub |
| 5 | The Ritz-Carlton, Dallas | Dallas | Executive Suite with Soaking Tub | Club Suite with Spa Tub |
| 6 | The Highland Dallas, Curio Collection by Hilton | Dallas | King Suite with Soaking Tub | One-Bedroom King Suite with Spa tub |
| 7 | Mandarin Oriental Boston | Boston | Signature Suite with Private Bathtub | Two Bedroom Presidential Suite with Jetted tub |
| 8 | InterContinental Boston | Boston | Fort Point Channel Suite with Soaking Tub | Ambassador Suite with Spa tub |
| 9 | XV Beacon Hotel | Boston | Studio Suite with In-Room Jacuzzi Tub | Bromfield Suite with Jetted tun |
| 10 | Battery Wharf Hotel, Boston Waterfront | Boston | Waterfront Suite with Deep Soaking Tub | Harbor View King Suite with Whirlpool |
| 11 | Encore Boston Harbor | Boston | Signature Harbor Suite with Two-Person Tub | Signature Suite with Harbor View and Jacuzzi |
| 12 | Water's Edge Inn | Charleston | Executive Jacuzzi Suite | Room with Spa Tub |
| 13 | Country Inn & Suites By Radisson, Charleston North, SC | Charleston | Palace Heritage Suite with Soaking Tub | King Suite with Jetted Tub |
| 14 | Green Valley Ranch Resort and Spa | Las Vegas | Villa Suite with Spa Jet Bathtub | Strip Suite with 2 Bedrooms and Spa Bath |
| 15 | M Resort Spa Casino | Las Vegas | Executive Suite with Soaking Tub | Luxury Strip View King with Spa Bath |
| 16 | Fairmont San Francisco | San Francisco | Tower Suite with Bay View Bathtub | Suite with King Bed and Jetted Tub - Tony Bennett Legacy |
| 17 | Hawthorn Suites by Wyndham Napa Valley | Napa | Royal Jacuzzi Suite | Studio Suite |
| 18 | Waldorf Astoria Beverly Hills | Los Angeles | Beverly Hills Suite with Balcony & Tub | Villa with Terrace and Spa tub |
| 19 | The Ritz-Carlton, Marina del Rey | Los Angeles | Marina View Suite with Marble Bathtub | Executive Suite with1 Bedroom, Marina View and Jetted tub |
| 20 | Andaz Maui at Wailea Resort | Maui | Executive Jacuzzi Suite | Villa (private lanai with jacuzzi) |

---

## 5. Town Placement, Suburbs & City Attachment (Task B2)

For the **6035** proposed new hotels:

- **Attached to Existing 38 US City Pages:** **435**
- **Identified as Suburbs (`nearCity` within 40 km):** **375**
- **Mapped to Distinct New Towns:** **5600**
- **New Hotels Lacking Verified Room Name:** **1109**
- **New Hotels Lacking Real Coordinates:** **2818**

### Attached Hotels Count by City Page

| City Slug | Attached Hotels |
|---|---|
| `las-vegas` | 51 |
| `gatlinburg` | 34 |
| `sedona` | 32 |
| `houston` | 27 |
| `orlando` | 25 |
| `san-antonio` | 23 |
| `asheville` | 19 |
| `san-diego` | 18 |
| `scottsdale` | 16 |
| `portland` | 16 |
| `los-angeles` | 15 |
| `nashville` | 14 |
| `new-orleans` | 13 |
| `new-york` | 12 |
| `denver` | 11 |
| `dallas` | 10 |
| `charleston` | 9 |
| `seattle` | 9 |
| `savannah` | 8 |
| `philadelphia` | 7 |
| `kansas-city` | 7 |
| `phoenix` | 7 |
| `baltimore` | 6 |
| `maui` | 6 |
| `palm-springs` | 6 |
| `chicago` | 5 |
| `san-francisco` | 5 |
| `miami` | 5 |
| `atlanta` | 4 |
| `napa` | 4 |
| `austin` | 3 |
| `washington-dc` | 3 |
| `boston` | 2 |
| `poconos` | 1 |
| `honolulu` | 1 |
| `key-west` | 1 |

---

## 6. New Towns & City-Page Candidates (Task B3)

- **Distinct New Towns Identified:** **2280**
- **Towns Meeting City-Page Criteria (5+ hotels AND 3+ with verified room name):** **220**

### Top 30 New Towns by Hotel Count

| Rank | Town | State | Hotels | With Room Name | With Real Geo | Nearest City | City-Page Candidate |
|---|---|---|---|---|---|---|---|
| 1 | Eureka Springs | AR | 62 | 47 | 47 | *(none)* | Yes (5+ & 3+ rooms) |
| 2 | Big Bear Lake | CA | 45 | 6 | 45 | *(none)* | Yes (5+ & 3+ rooms) |
| 3 | Pigeon Forge | TN | 44 | 39 | 40 | `gatlinburg` | Yes (5+ & 3+ rooms) |
| 4 | Helen | GA | 39 | 13 | 12 | *(none)* | Yes (5+ & 3+ rooms) |
| 5 | Branson | MO | 35 | 34 | 31 | *(none)* | Yes (5+ & 3+ rooms) |
| 6 | Wimberley | TX | 33 | 3 | 2 | *(none)* | Yes (5+ & 3+ rooms) |
| 7 | Shenandoah | VA | 29 | 0 | 0 | *(none)* | No |
| 8 | St. Augustine | FL | 29 | 29 | 25 | *(none)* | Yes (5+ & 3+ rooms) |
| 9 | Tulsa | OK | 28 | 12 | 14 | *(none)* | Yes (5+ & 3+ rooms) |
| 10 | Traverse City | MI | 23 | 19 | 22 | *(none)* | Yes (5+ & 3+ rooms) |
| 11 | Park City | UT | 23 | 23 | 23 | *(none)* | Yes (5+ & 3+ rooms) |
| 12 | Oklahoma City | OK | 23 | 23 | 23 | *(none)* | Yes (5+ & 3+ rooms) |
| 13 | Estes Park | CO | 22 | 17 | 17 | *(none)* | Yes (5+ & 3+ rooms) |
| 14 | Ashford | WA | 22 | 0 | 0 | *(none)* | No |
| 15 | Lincoln City | OR | 22 | 20 | 22 | *(none)* | Yes (5+ & 3+ rooms) |
| 16 | South Lake Tahoe | CA | 22 | 20 | 22 | `lake-tahoe` | Yes (5+ & 3+ rooms) |
| 17 | Myrtle Beach | SC | 21 | 21 | 20 | *(none)* | Yes (5+ & 3+ rooms) |
| 18 | Colorado Springs | CO | 20 | 15 | 14 | *(none)* | Yes (5+ & 3+ rooms) |
| 19 | Fargo | ND | 20 | 19 | 20 | *(none)* | Yes (5+ & 3+ rooms) |
| 20 | Hot Springs | AR | 19 | 14 | 15 | *(none)* | Yes (5+ & 3+ rooms) |
| 21 | Columbus | OH | 19 | 14 | 12 | *(none)* | Yes (5+ & 3+ rooms) |
| 22 | Newport | OR | 18 | 10 | 9 | *(none)* | Yes (5+ & 3+ rooms) |
| 23 | Sevierville | TN | 17 | 11 | 14 | `gatlinburg` | Yes (5+ & 3+ rooms) |
| 24 | Greater Palm Springs | CA | 17 | 9 | 10 | `palm-springs` | Yes (5+ & 3+ rooms) |
| 25 | Fort Lauderdale | FL | 17 | 15 | 15 | `miami` | Yes (5+ & 3+ rooms) |
| 26 | Indianapolis | IN | 17 | 17 | 16 | *(none)* | Yes (5+ & 3+ rooms) |
| 27 | Waco | TX | 16 | 7 | 5 | *(none)* | Yes (5+ & 3+ rooms) |
| 28 | Wisconsin Dells | WI | 16 | 14 | 7 | *(none)* | Yes (5+ & 3+ rooms) |
| 29 | Fort Worth | TX | 16 | 16 | 14 | `dallas` | Yes (5+ & 3+ rooms) |
| 30 | Augusta | GA | 16 | 15 | 13 | *(none)* | Yes (5+ & 3+ rooms) |

---

## 7. Verification & Data Integrity Checks

- **Database Writes:** 0 (read-only execution)
- **External Network Requests:** 0 (local execution)
- **Forbidden Fields Audit:** All generated files in `data-collect/private/` and `data-collect/import1-report.md` exclude `about`, `guestTubReview`, `images`, `bookingUrl`, `priceFromUsd`, `rating`, `reviewCount`, `amenities`, and affiliate tracking codes.
