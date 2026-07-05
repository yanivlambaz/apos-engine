# Authority Platform Operating System (APOS)

# TASK EXECUTION WORKFLOW

Document ID: WF-001

Version: 1.0

Status: APPROVED

Priority: CRITICAL

Classification:
CORE WORKFLOW

---

# Purpose

This workflow defines the mandatory execution process for every implementation task performed inside an APOS project.

No task should begin before this workflow has been executed.

This workflow is independent of technology, framework or business domain.

---

# Core Principle

Never write code first.

Understand first.

Design second.

Implement third.

Validate fourth.

Only then consider the task complete.

---

# Execution Pipeline

Every task follows the exact same lifecycle.

REQUEST

↓

UNDERSTAND

↓

LOAD CONTEXT

↓

PLAN

↓

IMPLEMENT

↓

SELF REVIEW

↓

VALIDATE

↓

QUALITY ASSURANCE

↓

DOCUMENT

↓

COMPLETE

Skipping steps is prohibited.

---

# STEP 1
Understand the Request

Determine:

Business objective

Technical objective

Expected outcome

Success criteria

User value

If the request is ambiguous:

STOP

Request clarification.

Never assume.

---

# STEP 2
Load Context

Always load:

README

MANIFEST

INDEX

FOUNDATION

Then load only the documentation relevant to the task.

Examples:

Homepage

↓

Homepage Pattern

Hero Component

CTA Component

SEO Homepage

QA Homepage

Never load unrelated documentation.

---

# STEP 3
Identify Pattern

Every task belongs to a Pattern.

Examples

Homepage

Service Page

Knowledge Article

FAQ

Component

Navigation

Search

Review

Form

If no Pattern exists:

STOP

Create a Pattern before implementation.

---

# STEP 4
Identify Components

Determine every component involved.

Example

Homepage

↓

Header

↓

Hero

↓

Buttons

↓

CTA

↓

Cards

↓

FAQ

↓

Footer

Never modify unknown components.

---

# STEP 5
Identify Dependencies

Before implementation determine:

Configuration

Content

SEO

Schema

Routing

Shared Components

State

Styling

Accessibility

Performance

Every dependency must be understood.

---

# STEP 6
Create Implementation Plan

Write a short implementation plan.

Example

Update Hero

↓

Update CTA

↓

Update FAQ

↓

Update Schema

↓

Run QA

Never implement without a plan.

---

# STEP 7
Implementation

Only now begin coding.

Follow all applicable APOS standards.

Never:

Duplicate code

Hardcode configuration

Break architecture

Ignore accessibility

Ignore SEO

Ignore AI contracts

---

# STEP 8
Self Review

Before testing ask:

Did I satisfy the Pattern?

Did I satisfy APOS?

Did I introduce duplication?

Did I reduce quality?

Did I create technical debt?

If uncertain,

fix before testing.

---

# STEP 9
Validation

Mandatory validation:

Project builds

Lint passes

TypeScript passes

Responsive

Accessibility

Performance

Internal Links

Metadata

Schema

Images

Broken Links

Every validation must pass.

---

# STEP 10
Regression Review

Check:

Homepage

Navigation

Footer

Search

CTA

Forms

Mobile

Desktop

Dark Mode (if applicable)

Nothing unrelated should break.

---

# STEP 11
Documentation

If architecture changed:

Update documentation.

If Pattern changed:

Update Pattern.

If Component changed:

Update Component Contract.

Documentation is part of implementation.

---

# STEP 12
Completion

The task is complete only when:

Business goal achieved.

Acceptance Criteria satisfied.

Validation passed.

Regression passed.

Documentation updated.

Architecture preserved.

---

# Failure Conditions

The task automatically fails if:

Build fails.

Lint fails.

TypeScript fails.

Accessibility decreases.

Performance decreases.

SEO decreases.

Architecture becomes more complex.

Business configuration becomes duplicated.

---

# Decision Tree

Task Received

↓

Known Pattern?

↓

YES

↓

Load Pattern

↓

Implement

↓

QA

↓

Done

------------

NO

↓

Create Pattern

↓

Review

↓

Approve

↓

Implement

---

# AI Agent Contract

Every AI Agent must optimize for:

Correctness

Maintainability

Authority

Trust

Consistency

Never optimize for speed at the expense of quality.

---

# Definition of Success

A successful implementation should require no additional corrections.

Another developer should be able to understand the implementation without additional explanation.

Future AI Agents should understand the implementation from documentation alone.

---

END OF DOCUMENT