# WP-02 — Platform Foundation

## Israeli Nursing Center

### Version 1.0

---

# Purpose

This document describes the centralized configuration and registry layer
introduced in WP-02. It is the map future Work Packages should use so the
architecture never needs to be rediscovered.

**Principle:** brand, contact, organization, navigation, footer, service and
city data live in **one place each**. Components and pages *consume* this
configuration — they must not hardcode or duplicate it.

No routing, component hierarchy, business logic or content was changed in
WP-02; only the data layer was centralized.

---

# Configuration & Registry Map

| Concern | Source of truth | Notes |
|---|---|---|
| Brand identity (name, taglines, descriptions, logos, CTAs, keywords, messages) | `lib/brand.ts` | Existing — unchanged |
| Site origin / domain | `lib/site.ts` | `NEXT_PUBLIC_SITE_URL` → Vercel → brand default |
| **Organization / business / contact** | **`lib/config/organization.ts`** | New — master config |
| **Primary navigation** | **`lib/config/navigation.ts`** | New |
| **Footer links & headings** | **`lib/config/footer.ts`** | New |
| Photography | `lib/images.ts` | From WP-02 milestone 1 |
| Default metadata | `lib/metadata.ts` | Consumes brand + org + site |
| Structured data (schema.org) | `lib/schema.ts` | Consumes org config |
| Service registry | `lib/data/services.ts` | Existing — type enriched |
| City registry | `lib/data/cities.ts` | Existing — type enriched |
| FAQ data | `lib/data/faq.ts`, `lib/data/seo-faq.ts` | Existing |
| Back-compat contact constants | `lib/constants.ts` | Re-exports from org config |

---

# 1. Organization Configuration — `lib/config/organization.ts`

The single source of truth for all business, contact and organization data.
Exposed as `ORGANIZATION` (typed `OrganizationConfig`).

Fields:

* `name`, `shortName`, `legalName`, `description`, `tagline` — re-used from `lib/brand.ts` (never duplicated)
* `locale`, `language`, `languages` — drives `<html lang>`, metadata locale and schema `availableLanguage`
* `coverage` — `{ scope, country, countryCode }` (schema `areaServed`)
* `foundingYear?` — when set, emitted as schema `foundingDate` *(TODO: owner to provide)*
* `priceRange` — schema `priceRange`
* `contact` — `phone { display, href }`, `whatsapp { number, href }`, `email?` *(TODO: owner to provide)*
* `address` — `{ street, city, country, display }`
* `hours` — `{ display, schema }` (human copy + schema `openingHours`)
* `social` — `{ facebook?, instagram?, youtube?, linkedin? }` (emitted as schema `sameAs`)
* `license` — `{ number, authority, url }` (placement license banner)
* `analytics` — `{ gtmId }`
* `verification` — `{ google? }`

Helper: `socialProfiles()` returns the list of defined social URLs for schema `sameAs`.

**To update any business detail (phone, address, hours, license, GTM, etc.), edit this file only.**

---

# 2. Primary Navigation — `lib/config/navigation.ts`

`PRIMARY_NAV: NavItem[]` where `NavItem = { href, label }`.

* Consumed by `components/Header.tsx` (desktop nav + mobile menu).
* `href` may be an on-page anchor (`#services`) or a route (`/about`).
* **To add/reorder a nav item, edit `PRIMARY_NAV` only.**

---

# 3. Footer — `lib/config/footer.ts`

Configuration-driven footer:

* `FOOTER_HEADINGS` — column titles.
* `FOOTER_SERVICE_LINKS` — derived from the service registry + an "all services" link.
* `FOOTER_CITY_LINKS` — derived from the city registry.
* `FOOTER_QUICK_LINKS` — cross-site quick links (extend as top-level pages are added).
* `FOOTER_LEGAL_LINKS` — legal/policy pages (prepared; add entries together with their routes).

Adding a service or city automatically updates the footer (and header-independent shortcuts).

---

# 4. Service Registry — `lib/data/services.ts`

`services: Record<string, ServiceData>` keyed by slug. Helpers: `serviceSlugs`, `getService(slug)`.

Required fields (power current pages): `slug`, `name` (title), `h1` (hero title),
`description`, `content`, `careType`, `benefits[]`, `faqs[]`.

Prepared optional fields (WP-02 foundation, populate per service as needed):
`shortTitle`, `seoTitle`, `seoDescription`, `heroDescription`, `cta`, `icon`.

**To add a service:** add one object to `services`. No component changes required.

---

# 5. City Registry — `lib/data/cities.ts`

`cities: Record<string, CityData>` keyed by slug. Helpers: `citySlugs`, `getCity(slug)`.

Required fields: `slug`, `name`, `description`, `intro`, `hospitals[]`,
`neighborhoods[]`, `faqs[]`.

Prepared optional fields: `shortTitle`, `region`, `seoTitle`, `seoDescription`, `heroDescription`.

**To add a city:** add one object to `cities`. The route, footer link and schema
are wired automatically.

---

# 6. Consumers (read-only of the above)

* `components/Header.tsx` → `PRIMARY_NAV`
* `components/Footer.tsx` → footer config + registries
* `components/LicenseBanner.tsx` → `ORGANIZATION.license`
* `app/layout.tsx` → `ORGANIZATION.language`, `ORGANIZATION.analytics.gtmId`
* `lib/metadata.ts` → brand + `ORGANIZATION.locale` + `ORGANIZATION.verification`
* `lib/schema.ts` → `ORGANIZATION` (address, hours, coverage, languages, sameAs, foundingDate)
* `lib/constants.ts` → re-exports `ORGANIZATION` contact values under their legacy names

---

# Open TODOs for the owner (non-blocking)

* `ORGANIZATION.contact.email` — add a public contact email.
* `ORGANIZATION.foundingYear` — set to emit schema.org `foundingDate`.
* `ORGANIZATION.social.*` — add social profile URLs (auto-emitted as schema `sameAs`).

These are prepared in the config and will surface automatically once provided.
