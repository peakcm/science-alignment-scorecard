# Science Index (Prototype)

End-to-end starter repo for the **Science Index** concept: schemas, seeds, mock APIs (Express + FastAPI), OpenAPI spec, and a static web demo (including a Likert density view).

## Structure
```
openapi/             # OpenAPI 3 spec
schemas/             # JSON Schemas for core objects
seeds/               # JSON:API seed documents
servers/express/     # Node Express mock API (reads seeds)
servers/fastapi/     # Python FastAPI mock API (reads seeds)
web/demo/            # Static demo: index.html (bar) & likert.html
.github/workflows/   # Pages deploy for /web/demo
```

## Run mock APIs

### Express (Node 18+)
```bash
cd servers/express
npm install
npm start
# http://localhost:5055/topics
```

### FastAPI (Python 3.10+)
```bash
cd servers/fastapi
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 5056
# http://localhost:5056/topics
```

## View the static demo
Default:
- `web/demo/index.html` (**Likert tabs**: 2 statements, 50+ mock points per candidate, filters, KDE, consensus prior)

Additional:
- `web/demo/bar.html` (legacy bar charts)
- `web/demo/likert.html` (single-statement Likert + KDE)
- `web/demo/likert-tabs.html` (same as index)