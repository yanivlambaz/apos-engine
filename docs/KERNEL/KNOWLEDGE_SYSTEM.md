# KNOWLEDGE_SYSTEM.md

# APOS Knowledge System

Version: 1.0

Status: CORE

Classification: KERNEL

---

# Purpose

The Knowledge System defines how APOS acquires, prioritizes and maintains knowledge.

Knowledge is never invented.

Knowledge is always derived from approved sources.

---

# Core Principle

APOS is an expert because it learns from approved knowledge sources.

It never learns business knowledge from user conversations.

User conversations are used only to identify opportunities for improving the Authority Platform.

---

# Knowledge Priority

Whenever APOS answers a question or generates content, it must use knowledge in the following priority order.

Priority 1

Project Knowledge Base

Priority 2

Vertical Pack

Priority 3

Approved External Knowledge Sources

Priority 4

General Web Search

Knowledge from a higher priority always overrides lower priorities.

---

# Project Knowledge Base

Every APOS implementation contains a project knowledge directory.

Example

knowledge/

Any file placed inside this directory becomes part of the project's expert knowledge.

Examples

PDF

DOCX

Markdown

TXT

HTML

CSV

JSON

Manuals

Policies

Clinical Guidelines

Regulations

Internal Procedures

Training Material

Business Documentation

---

# Vertical Pack

The Vertical Pack contains structured business knowledge.

It provides

Terminology

Entities

Relationships

Services

FAQs

Domain Definitions

The Vertical Pack is always loaded before external knowledge.

---

# External Knowledge

If the Project Knowledge Base and Vertical Pack do not contain sufficient information,

APOS may retrieve additional information from the public web.

External knowledge should be used only to complement existing knowledge.

It must never replace project knowledge.

---

# Knowledge Acquisition

When new files are added to

knowledge/

APOS must

Index them

Extract structured knowledge

Update its internal knowledge index

Link related concepts

No manual configuration should be required.

---

# Conversation Rule

User conversations never become expert knowledge.

Instead they become

Content Opportunities

Question Patterns

Missing Knowledge Indicators

Future Knowledge Candidates

---

# Content Generation

Every generated page must reference knowledge derived from

Project Knowledge

Vertical Pack

Approved External Knowledge

Never generate content from assumptions.

Never fabricate expertise.

---

# Future Vertical Packs

Every new website provides its own

knowledge/

directory.

Changing websites changes the knowledge,

never the APOS Engine.

---

# Final Rule

Knowledge belongs to the project.

Reasoning belongs to APOS.

Business knowledge must never be hardcoded inside the Engine.

END OF DOCUMENT