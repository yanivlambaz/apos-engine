# APOS Kernel

Version: 1.0

Status: STABLE

Classification: CORE

---

# Purpose

The Kernel is the permanent core of APOS.

It defines how the platform thinks, generates, validates and evolves.

The Kernel never contains business knowledge.

Business knowledge belongs only inside Vertical Packs.

The Kernel should be reusable across every industry.

---

# Contents

The Kernel consists of the following documents.

## DATA_MODEL.md

Defines every business object.

Single source of truth for all entities.

---

## PATTERNS.md

Defines how objects are presented.

Patterns describe pages.

Patterns never contain business knowledge.

---

## GENERATORS.md

Defines how objects become production-ready assets.

Generators consume

Data Model

+

Patterns

↓

Output

---

## VALIDATORS.md

Defines every quality gate.

No asset may be released without passing Validators.

---

## WORKFLOWS.md

Defines execution order.

Every operation follows a Workflow.

Nothing bypasses Workflows.

---

## AI_SYSTEM.md

Defines how AI agents think.

Reasoning rules.

Decision hierarchy.

Execution order.

Context loading.

---

## SEO_SYSTEM.md

Defines technical and semantic SEO.

Internal linking.

Metadata.

Structured data.

Authority.

---

## CONTENT_SYSTEM.md

Defines writing standards.

Structure.

Tone.

Readability.

Quality.

---

## DESIGN_SYSTEM.md

Defines UI principles.

Layout.

Spacing.

Typography.

Accessibility.

---

## VERTICAL_TEMPLATE.md

Defines how to build a new industry pack.

Healthcare.

Tax.

Legal.

Insurance.

Finance.

Any future domain.

---

# Dependency Order

The Kernel loads documents in the following order.

1. DATA_MODEL

2. PATTERNS

3. GENERATORS

4. VALIDATORS

5. WORKFLOWS

6. AI_SYSTEM

7. SEO_SYSTEM

8. CONTENT_SYSTEM

9. DESIGN_SYSTEM

10. VERTICAL_TEMPLATE

This order should never change.

---

# Design Principles

The Kernel must remain

Generic

Reusable

Deterministic

Extensible

Vendor Independent

Business knowledge must never be added here.

---

# Modification Rules

Kernel changes are rare.

Every Kernel modification affects every APOS implementation.

Before modifying the Kernel ask:

Will this improve every Vertical Pack?

If the answer is no,

the change probably belongs inside a Vertical Pack.

---

# Definition of Done

The Kernel is complete when

✓ Every document is internally consistent.

✓ No business-specific knowledge exists.

✓ Every Vertical Pack can use it without modification.

✓ Every Generator references it.

✓ Every Validator references it.

END OF DOCUMENT