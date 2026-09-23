# Codex Fixes Summary

Date: 2026-09-23

## Photo Upload / Display Fixes

- Fixed Cloudinary environment variable support for standard names:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Added persistent Mongo GridFS fallback when Cloudinary upload is unavailable.
- Made GridFS image read URLs public so frontend image tags can display uploaded photos.
- Updated gallery upload to use the shared image upload service.
- Allowed places to save GridFS image URLs.
- Returned missing image fields in public API responses:
  - hotel `cardImage`
  - package `images`
- Updated local frontend API selection so `VITE_API_URL` is respected on localhost.

## Admin Analytics Fixes

- Added backend endpoint `GET /api/admin/analytics`.
- Analytics now calculates dynamically from:
  - invoices as income/revenue
  - payment vouchers as expenses
- Added dynamic calculations for:
  - total revenue
  - advance received
  - receivable amount
  - total expenses
  - expense due
  - net profit
  - profit margin
  - average booking value
  - monthly revenue/expense/profit trend
  - top packages from tour invoices
  - top hotels from hotel invoices
  - recent income/expense transactions
- Removed static/mock analytics values from the admin analytics page.

## Changed Files

- `backend/utils/cloudinary.js`
- `backend/services/imageService.js`
- `backend/routes/upload.js`
- `backend/routes/gallery.js`
- `backend/routes/places.js`
- `backend/routes/admin.js`
- `backend/models/Hotel.js`
- `backend/models/Package.js`
- `frontend/src/services/api.js`
- `frontend/src/services/analyticsService.js`
- `frontend/src/components/dashboard/Analytics.jsx`

## Verification Completed

- Backend syntax checks passed for modified backend files.
- Frontend production build passed with `npm run build`.

## Deployment Note

Deploy backend first, then frontend. The frontend analytics page depends on the new backend endpoint:

`GET /api/admin/analytics?period=month`

## Lead Management Feature

- Added admin sidebar item: Lead Management.
- Added backend model and API:
  - `Lead`
  - `GET /api/leads`
  - `POST /api/leads`
  - `PUT /api/leads/:id`
  - `PATCH /api/leads/:id/stage`
  - `DELETE /api/leads/:id`
- Lead fields include:
  - name
  - email
  - phone
  - place of query
  - query type: package, hotel, transport, custom, other
  - remarks
  - stage
  - next follow-up date
- Admin can add, edit, soft-delete, search/filter leads, and change lead stage directly from the list.

## User Management Feature

- Added admin sidebar item: User Management.
- Added admin create-user endpoint:
  - `POST /api/admin/users`
- Reused existing admin APIs for:
  - listing users
  - editing users
  - deleting users
- Admin can add, edit, deactivate/reactivate, and delete users from the dashboard.

## Additional Changed Files

- `backend/models/Lead.js`
- `backend/routes/leads.js`
- `backend/models/AuditLog.js`
- `backend/server.js`
- `frontend/src/components/dashboard/LeadManagement.jsx`
- `frontend/src/components/dashboard/UserManagement.jsx`
- `frontend/src/pages/Dashboard.jsx`

## Premium Frontend / SEO Pass

- Added shared premium UI utilities in `frontend/src/index.css`:
  - luxury hero overlays
  - premium panels/cards
  - premium buttons
  - image hover/lift treatments
  - smooth reveal and reduced-motion handling
- Upgraded global SEO component:
  - robots/meta author/publisher/theme color
  - canonical URL handling
  - Open Graph locale and image dimensions
  - Twitter metadata
  - JSON-LD schema for TravelAgency and WebSite
- Upgraded public-facing design polish on:
  - home hero
  - navigation bar
  - footer CTA strip
  - packages listing page
  - hotels listing page
  - gallery shell/hero
  - contact page polish and social links
  - about page SEO/shell polish
- Production build completed successfully after the design pass.
