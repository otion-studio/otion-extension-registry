# Changelog

## 0.2.0

Adds isolated executable decision-card and project-brief views, active-page statistics, and a device-local focus-session widget. The package requests `document:read` for statistics and `storage` for the counter. Existing marker fields remain portable; the new `status`, `title`, `goal` and `owner` fields use string defaults and preserve unknown fields. Includes an SDK scaffold, offline digest builder, API types, package tests and revised host/security documentation.

## 0.1.0

Initial declarative decision and project brief cards with portable external-agent guidance. No executable source or runtime permissions.
