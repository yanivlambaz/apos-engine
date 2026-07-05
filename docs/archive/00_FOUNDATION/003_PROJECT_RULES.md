# Authority Platform Operating System (APOS)

# PROJECT RULES

Document ID: FOUNDATION-003

Version: 1.0

Status: APPROVED

Priority: CRITICAL

Depends On:

- FOUNDATION-001
- FOUNDATION-002
- MANIFEST

---

# Purpose

This document defines the mandatory engineering, architecture, business and implementation rules for every APOS project.

These rules apply regardless of industry.

Healthcare, Tax, Legal, Insurance, Finance and every future vertical must follow exactly the same rules.

These rules are mandatory.

---

# SECTION 1
## General Rules

---

### RULE-001

Every project must have a clearly defined business objective.

A website without measurable business objectives must not be developed.

---

### RULE-002

Every page must have a single primary purpose.

Examples:

Generate Leads

Educate

Support SEO

Support AI Visibility

Support Conversion

Support Trust

Never mix multiple primary purposes.

---

### RULE-003

Every page must define a primary conversion goal.

Examples:

Phone Call

WhatsApp

Lead Form

Appointment

Quote Request

Guide Download

---

### RULE-004

Every page must define its target audience.

Never build generic pages.

---

### RULE-005

Every page must answer one specific user intent.

Never mix search intents.

---

# SECTION 2
## Business Rules

---

### RULE-006

Business information must never be duplicated.

Business information belongs only inside configuration.

---

### RULE-007

Phone numbers must be configurable.

---

### RULE-008

Email addresses must be configurable.

---

### RULE-009

Business hours must be configurable.

---

### RULE-010

Service lists must be configurable.

---

### RULE-011

Cities must be configurable.

---

### RULE-012

CTA text must be configurable.

---

### RULE-013

Company information must exist only once.

---

# SECTION 3
## Architecture Rules

---

### RULE-014

Never duplicate components.

---

### RULE-015

Never duplicate business logic.

---

### RULE-016

Never hardcode configurable information.

---

### RULE-017

Reusable components are mandatory.

---

### RULE-018

Every component must have one responsibility.

---

### RULE-019

Large components must be decomposed.

---

### RULE-020

Configuration must always be preferred over code changes.

---

# SECTION 4
## User Experience Rules

---

### RULE-021

Every page must immediately communicate:

Who we are.

What we offer.

Why trust us.

What the visitor should do next.

---

### RULE-022

Navigation must never confuse users.

---

### RULE-023

Navigation depth should be minimized.

---

### RULE-024

Users should never require more than three clicks to reach important information.

---

### RULE-025

Every page must contain a clear CTA.

---

### RULE-026

Every page must include trust elements.

---

### RULE-027

Every page must support mobile-first navigation.

---

### RULE-028

Every page must remain readable without zooming.

---

### RULE-029

Typography must prioritize readability.

---

### RULE-030

Important actions must remain visually prominent.

---

# SECTION 5
## SEO Rules

---

### RULE-031

Every indexable page requires:

Unique Title

Unique Meta Description

Canonical URL

Structured Heading Hierarchy

---

### RULE-032

Every page must contain internal links.

---

### RULE-033

Every service page must connect to related services.

---

### RULE-034

Every article must connect to service pages.

---

### RULE-035

Every FAQ must connect to services.

---

### RULE-036

No orphan pages are allowed.

---

### RULE-037

Duplicate content is prohibited.

---

### RULE-038

Thin content is prohibited.

---

### RULE-039

Every important page must contain structured data.

---

### RULE-040

SEO is mandatory.

Never optional.

---

# SECTION 6
## AI Rules

---

### RULE-041

Content must be understandable by humans.

---

### RULE-042

Content must be understandable by AI.

---

### RULE-043

Entities must be explicit.

---

### RULE-044

Relationships between entities must be explicit.

---

### RULE-045

Content should be organized into logical sections.

---

### RULE-046

Semantic HTML is mandatory.

---

### RULE-047

Knowledge Graph thinking must be applied.

---

### RULE-048

AI readability is mandatory.

---

# SECTION 7
## Trust Rules

---

### RULE-049

Never make unverifiable claims.

---

### RULE-050

Never create artificial urgency.

---

### RULE-051

Never display misleading counters.

---

### RULE-052

Testimonials must be authentic.

---

### RULE-053

Credentials should be verifiable.

---

### RULE-054

Trust always overrides marketing.

---

# SECTION 8
## Accessibility Rules

---

### RULE-055

Keyboard accessibility is mandatory.

---

### RULE-056

Color contrast must meet accessibility requirements.

---

### RULE-057

Images require meaningful alternative text.

---

### RULE-058

Interactive controls require visible focus.

---

### RULE-059

Accessibility regressions are prohibited.

---

# SECTION 9
## Performance Rules

---

### RULE-060

Performance must be designed.

Not repaired later.

---

### RULE-061

Images must be optimized.

---

### RULE-062

Lazy loading whenever appropriate.

---

### RULE-063

Avoid unnecessary JavaScript.

---

### RULE-064

Core Web Vitals must be monitored.

---

# SECTION 10
## Engineering Rules

---

### RULE-065

Every implementation must compile.

---

### RULE-066

No lint errors.

---

### RULE-067

No TypeScript errors.

---

### RULE-068

Production builds must succeed.

---

### RULE-069

Every completed task must pass validation.

---

### RULE-070

Temporary fixes are prohibited.

---

### RULE-071

TODO comments are prohibited in production.

---

### RULE-072

Breaking existing functionality is prohibited.

---

# SECTION 11
## Documentation Rules

---

### RULE-073

Architecture changes require documentation.

---

### RULE-074

New systems require documentation.

---

### RULE-075

New reusable components require documentation.

---

### RULE-076

Configuration changes must be documented.

---

# SECTION 12
## Completion Rules

---

### RULE-077

Implementation is not complete until Acceptance Criteria pass.

---

### RULE-078

Implementation is not complete until validation succeeds.

---

### RULE-079

Implementation is not complete until regressions are checked.

---

### RULE-080

Implementation is not complete until documentation is updated when required.

---

# FINAL RULE

When uncertain,

do not invent.

Read the relevant documentation.

If documentation is missing,

stop

and request clarification.

APOS values correctness over speed.

END OF DOCUMENT