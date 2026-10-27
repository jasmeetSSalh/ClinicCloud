# ClinicCloud

A web dashboard for managing a hospital's operational database: patients, staff assignments, and the medicine and supply inventory and orders for both the hospital and its pharmacy. We built it for a database systems course at Toronto Metropolitan University, on top of an Oracle database.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Oracle Database (`node-oracledb`)

## Features

- **Schema management:** create, populate with sample data, or drop the whole 10-table schema in one click.
- **Table browser:** view any table, search it, and scroll through long result sets.
- **Row editing:** add, edit and delete records from the UI. Date fields and nullable fields are converted to the right Oracle types.
- **REST API:** Next.js route handlers expose both the schema and the individual tables.

## Data model

| Area | Tables |
| --- | --- |
| People | `patient_list`, `hospital_personnel`, `hosp_personnel_pat_assign` |
| Pharmacy | `pharm_med_inventory`, `pharm_supply_inventory` |
| Hospital stock | `hosp_med_inventory`, `hosp_supply_inventory` |
| Orders | `patient_med_order`, `hosp_med_order`, `hosp_supply_order` |

Hospital inventory refers to the pharmacy catalogue. Orders link staff, patients and stock items.

## API

| Method | Route | Action |
| --- | --- | --- |
| `GET` | `/api/tables` | List all tables |
| `POST` | `/api/tables` | Create the schema |
| `PUT` | `/api/tables` | Load sample data |
| `DELETE` | `/api/tables` | Drop the schema |
| `GET` | `/api/tables/:tableName` | Read a table |
| `POST` | `/api/tables/:tableName` | Insert a row |
| `PUT` | `/api/tables/:tableName` | Update a row |
| `DELETE` | `/api/tables/:tableName` | Delete a row |

## Run it locally

**Requirements:** Node.js 20 or newer and access to an Oracle database. Oracle Instant Client is optional; the app falls back to thin mode without it.

```bash
cd clinic-cloud
npm install
```

Create `clinic-cloud/.env.local`:

```env
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=your_oracle_host
DB_PORT=1521
DB_SID=orcl
```

```bash
npm run dev   # http://localhost:3000
```

## Team

Built by [@jasmeetSSalh](https://github.com/jasmeetSSalh) and [@jackie-png](https://github.com/jackie-png).
