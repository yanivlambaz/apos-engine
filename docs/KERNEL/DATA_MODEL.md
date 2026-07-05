# APOS - DATA MODEL

Version: 1.0

Status: STABLE

Classification: CORE KERNEL

---

# Purpose

This document defines every business object used by APOS.

Every Pattern.

Every Generator.

Every Validator.

Every Vertical Pack.

Every page.

Every workflow.

Must use only the objects defined here.

Nothing may invent new structures.

This document is the single source of truth for all data models.

---

# Core Principles

Objects are permanent.

Pages are temporary.

Pages render Objects.

Objects relate to other Objects.

Knowledge grows by relationships.

No duplicated objects.

No duplicated knowledge.

---

# Universal Object

Every object in APOS inherits these fields.

| Field | Type | Required |
|--------|------|----------|
| id | UUID | ✓ |
| slug | string | ✓ |
| title | string | ✓ |
| summary | string | ✓ |
| description | markdown | ✓ |
| status | Draft \| Review \| Published \| Archived | ✓ |
| language | string | ✓ |
| createdAt | datetime | ✓ |
| updatedAt | datetime | ✓ |
| seo | object | ✓ |
| schema | object | ✓ |

---

# Object Relationships

Objects never stand alone.

Each object may have

Parent

Children

Related

References

Dependencies

Alternative

Recommended

Prerequisite

Supporting

Referenced By

---

# Organization

Represents the business.

Fields

Brand Name

Legal Name

Description

Logo

Phone

Email

Address

Business Hours

Social Links

Licenses

Certifications

Primary CTA

Service Areas

---

# Category

Groups similar Topics and Services.

Examples

Home Care

Tax Refunds

Insurance

Personal Injury

Contains

Topics

Services

Articles

Guides

FAQ

---

# Topic

Represents one knowledge domain.

Examples

Private Nursing

Capital Gains Tax

Long-Term Care

Workers Tax Refund

Contains

Guides

Articles

FAQ

Comparisons

Checklist

Downloads

Related Services

---

# Knowledge Cluster

Represents one complete educational ecosystem.

Contains

One Pillar Guide

Many Articles

Many FAQs

Comparisons

Checklist

Glossary

Downloads

Related Services

One Topic

Purpose

Own one subject completely.

---

# Service

Represents one business service.

Examples

Private Nurse

Night Nurse

Tax Refund Review

Bookkeeping

Contains

Benefits

Process

Pricing

FAQ

Related Services

Related Articles

Related Guides

CTA

Reviews

Cities

Intent

One Service

One URL

One Conversion Goal

---

# Guide

Highest educational asset.

Purpose

Become the definitive resource for one Topic.

Contains

Definitions

Detailed Sections

Examples

FAQ

Checklist

Comparisons

Resources

Related Services

Related Articles

Related Guides

---

# Article

Answers exactly one primary question.

Contains

Question

Short Answer

Detailed Answer

Examples

FAQ

Related Articles

Related Guides

Related Services

Never answers multiple intents.

---

# FAQ

Represents one reusable question.

Contains

Question

Short Answer

Detailed Answer

Category

Topic

Priority

Related Objects

One FAQ may appear on many pages.

---

# Comparison

Compares two or more entities.

Examples

Private Nurse vs Caregiver

Tax Refund vs Tax Credit

Contains

Comparison Table

Advantages

Disadvantages

Recommendations

FAQ

---

# Checklist

Represents a practical step-by-step list.

Examples

Hospital Discharge Checklist

Tax Documents Checklist

Contains

Items

Categories

Downloads

Related Services

---

# Review

Represents customer feedback.

Contains

Reviewer

Rating

Review

Date

Service

Location

Verification Status

---

# Author

Represents content ownership.

Contains

Name

Biography

Credentials

Expertise

Articles

Guides

Photo

Social Links

---

# City

Represents one geographic area.

Contains

Name

Region

Country

Coordinates

Available Services

Local Articles

Local FAQ

Related Guides

---

# CTA

Represents one conversion action.

Types

Phone

WhatsApp

Lead Form

Booking

Email

Chat

Every page has one Primary CTA.

---

# Image

Represents visual media.

Contains

Title

Alt Text

Caption

Dimensions

Purpose

Copyright

Priority

---

# Video

Represents educational video.

Contains

Title

Summary

Transcript

Duration

Thumbnail

Related Topic

---

# Download

Represents downloadable resources.

Examples

PDF

Checklist

Guide

Template

Worksheet

---

# Lead

Represents a user inquiry.

Contains

Source

Landing Page

Service

Campaign

Status

Assigned To

Created At

---

# SEO Object

Every object includes

Title

Meta Description

Canonical

Robots

OpenGraph

Breadcrumb

Structured Data

Reading Time

Last Updated

---

# AI Object

Every object explicitly answers

What is it?

Who is it for?

Who is it not for?

Why does it matter?

Benefits

Risks

Alternatives

Next Step

No ambiguity.

---

# Validation Rules

Every object must satisfy

Unique ID

Unique Slug

Required Fields

Relationships

SEO

Schema

Accessibility

Internal Linking

AI Readability

No Placeholder Content

No Duplicate Content

---

# Anti Patterns

Never duplicate objects.

Never duplicate FAQs.

Never duplicate Services.

Never duplicate Articles.

Never create orphan objects.

Never create orphan pages.

Never mix multiple intents inside one object.

---

# Object Lifecycle

Draft

↓

Review

↓

Approved

↓

Published

↓

Archived

Objects never skip states.

---

# Definition of Done

A business object is complete only when

✓ Required fields exist

✓ Relationships exist

✓ SEO complete

✓ AI complete

✓ Schema complete

✓ Validation passed

✓ Connected to the Knowledge Graph

Only then may Pages render the object.

END OF DOCUMENT