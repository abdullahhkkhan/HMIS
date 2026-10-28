# HMIS — Frontend

React (Create React App) + Tailwind v4 (browser build, loaded in `public/index.html`).

```bash
npm install
npm start        # http://localhost:4000
npm test
npm run build
```

## Roles & pages (from `pages.txt`)

| Role | Pages |
|---|---|
| Admin | Dashboard, Registration, Patient List (edit patient / referred doctor / medicines), Patient History, Dispensary, Medicines, User Management |
| Registration | Registration |
| Doctor (General Physician etc.) | Waiting Patients, Patient History |
| Dispensary | Waiting Patients, Dispensary |

Demo accounts (local demo data only): `admin/admin123`, `reception/reception123`, `drali/doctor123`, `pharmacy/pharmacy123`.
Admin → user menu → **Reset demo data** restores the sample data.

## Visit workflow

1. **Registration** registers a new patient (MR # generated) or finds a returning one, and issues a token to a doctor.
2. **Doctor** opens the patient from *Waiting Patients* → *Patient History* and completes three modules:
   Patient Vitals → Health Details → Medicine Suggestion.
   The visit stays **Pending** until all three are saved. **Confirm Visit** is only enabled after that.
   The doctor can also refer the patient to another doctor.
3. Confirmed visits with medicines go to the **Dispensary** queue. Issuing medicines deducts stock and completes the visit.

## Structure

```
src/
  api/            fetch services per backend route (ready for the Express API, not wired yet)
  components/
    forms/        Field, Input, Select, ChoiceGroup, PrescriptionEditor
    layout/       Layout, Navbar (role-based), Footer
    ui/           Button, Card, Badge, Modal, Toast, PageHeader, StatCard, PatientBanner …
  modules/
    auth/         Login, RegisterUser (User Management)
    registration/ NewPatientForm, PatientList, EditVisitModal
    doctors/      PatientHistory, VitalsForm, HealthDetailsForm, MedicineSuggestion, VisitTimeline
    pharmacy/     DispenseMedicine, MedicineInventory
    admin/        Dashboard
  routes/         AppRoutes (role guards), navConfig (which role sees which page)
  store/          HmisStore (data + actions, saved in localStorage), seed (demo data)
  utils/          constants, format, visits
```

Until the backend exists, all data lives in the browser (`localStorage`). Each store action in
`src/store/HmisStore.jsx` matches a function in `src/api/*` — swap the action body for the API call
when the backend is ready.
