# APOS - GENERATORS

Version: 1.0

Status: STABLE

Classification: CORE KERNEL

---

# Purpose

Generators transform Business Objects into production-ready assets.

Generators never invent architecture.

Generators consume:

Data Model

+

Patterns

+

Configuration

=

Output

Every Generator is deterministic.

The same input should always produce substantially the same output.

---

# Generator Pipeline

Input

↓

Validation

↓

Object Resolution

↓

Pattern Resolution

↓

Content Generation

↓

SEO Generation

↓

Schema Generation

↓

Internal Linking

↓

Validation

↓

Output

---

# Available Generators

001 Homepage

002 Service Page

003 Guide

004 Article

005 FAQ

006 Category

007 Topic

008 Knowledge Cluster

009 Comparison

010 City

011 Author

012 Contact

013 Metadata

014 Schema

015 Internal Linking

016 Sitemap

017 Robots

018 Images

019 Navigation

020 Release Report

---

# Homepage Generator

Input

Organization

Services

Categories

Knowledge

Reviews

FAQ

Primary CTA

Output

Homepage

Metadata

Schema

Navigation

Internal Links

QA Report

---

# Service Generator

Input

Service

Related Services

Articles

Guides

FAQ

Reviews

CTA

Output

Service Page

Metadata

Schema

Internal Links

Related Knowledge

QA Report

---

# Guide Generator

Input

Guide

Topic

Articles

FAQ

Checklist

Comparison

Output

Guide

Table Of Contents

Metadata

Schema

Internal Links

QA Report

---

# Article Generator

Input

Article

Author

Topic

Related Content

Output

Article

Metadata

Schema

Internal Links

QA Report

---

# FAQ Generator

Input

FAQ

Topic

Category

Output

FAQ

Schema

Internal Links

QA Report

---

# Category Generator

Input

Category

Services

Topics

Output

Category Page

Metadata

Schema

QA Report

---

# Topic Generator

Input

Topic

Knowledge Cluster

Output

Topic Page

Metadata

Schema

QA Report

---

# Knowledge Cluster Generator

Input

Topic

Guide

Articles

FAQ

Checklist

Comparison

Output

Knowledge Cluster

Internal Links

Knowledge Graph

QA Report

---

# Comparison Generator

Input

Comparison

Output

Comparison Page

Schema

Metadata

QA Report

---

# City Generator

Input

City

Services

Articles

FAQ

Output

City Page

Metadata

Schema

Internal Links

QA Report

---

# Metadata Generator

Generates

Title

Meta Description

Canonical

Open Graph

Twitter

Robots

Reading Time

Updated Date

---

# Schema Generator

Automatically generates

Organization

WebPage

Article

FAQ

Service

Breadcrumb

Review

Image

Video

HowTo

LocalBusiness

ProfessionalService

Depending on object type.

---

# Internal Linking Generator

Creates links between

Homepage

Categories

Topics

Services

Guides

Articles

FAQ

Cities

Authors

No orphan pages allowed.

---

# Image Generator

Creates

Alt Text

Caption

Image Purpose

Priority

Loading Strategy

Responsive Sizes

---

# Navigation Generator

Creates

Primary Navigation

Footer Navigation

Breadcrumbs

Related Navigation

Context Navigation

---

# Sitemap Generator

Creates

XML Sitemap

HTML Sitemap

Knowledge Sitemap

Image Sitemap

---

# Robots Generator

Creates

robots.txt

Crawl Rules

AI Rules

Sitemap References

---

# Release Report Generator

Creates

Architecture Summary

Files Created

SEO Report

AI Report

Accessibility Report

Performance Report

Validation Report

Remaining Risks

---

# Universal Generator Rules

Every Generator MUST

Read the Data Model.

Read the Pattern.

Generate Metadata.

Generate Schema.

Generate Internal Links.

Generate Validation Report.

Support AI.

Support SEO.

Support Accessibility.

---

# Generator Order

Validation

↓

Object Loading

↓

Generation

↓

Linking

↓

Schema

↓

Metadata

↓

QA

↓

Output

---

# Failure Conditions

Missing Object

Missing Pattern

Missing Required Fields

Duplicate Slug

Broken Relationships

Missing Schema

Missing Metadata

Missing Internal Links

Placeholder Content

Generator execution stops immediately.

---

# Output Contract

Every Generator must return

Generated Asset

Metadata

Structured Data

Internal Links

Validation Report

QA Report

Status

---

# Definition of Done

A Generator is complete only when

✓ Pattern applied

✓ Object rendered

✓ Metadata created

✓ Schema created

✓ Internal Links created

✓ Validation passed

✓ QA passed

✓ Asset ready for production

END OF DOCUMENT