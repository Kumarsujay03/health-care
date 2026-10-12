# MongoDB Data Dashboard

A web dashboard for loading **CSV data into MongoDB** and exploring it without
writing queries. Pick a database and collection, then search, filter, sort and
page through the records in a table.

Built with **React** (frontend) and **FastAPI + pandas + PyMongo** (backend),
originally for working with healthcare datasets.

## Features

- **Upload CSV** straight into any database and collection (created automatically)
- **Browse** all databases and collections on the server
- **Search** and **filter** records by any field
- **Sort** by any field, ascending or descending, with **Load more** pagination
- Field list is detected automatically from the data

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, React Router |
| Backend | Python, FastAPI, pandas, PyMongo |
| Database | MongoDB |

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Clone

```bash
git clone https://github.com/Kumarsujay03/health-care.git
cd health-care
```

### 2. Start the backend

```bash
pip install fastapi uvicorn pandas pymongo python-multipart
uvicorn main:app --reload
```

The API runs on `http://localhost:8000`.

### 3. Start the frontend

```bash
npm install
npm start
```

Open `http://localhost:3000`. To point the UI at a different API, set
`REACT_APP_API_URL` before `npm start`.

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload-csv` | Upload a CSV (`file`, `database`, `collection_name` as form fields) |
| `GET` | `/databases` | List databases |
| `GET` | `/collections?database=` | List collections in a database |
| `GET` | `/fields?database=&collection_name=` | List fields in a collection |
| `GET` | `/data?database=&collection_name=` | All records |
| `GET` | `/search?database=&collection_name=&field=&value=` | Search by field |
| `GET` | `/filter?database=&collection_name=&field=&value=` | Filter by field |
| `GET` | `/sort?database=&collection_name=&field=&order=&skip=&limit=` | Sorted, paginated records |

## Project structure

```text
health-care/
├── main.py                      # FastAPI backend
├── src/components/Dashboard.js  # Main dashboard UI
├── src/components/              # Other UI components
└── public/
```

## Notes

This is a local development tool with no authentication on the API and CORS
open to all origins, so don't expose it to the internet as-is.
