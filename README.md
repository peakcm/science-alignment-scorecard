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
Just open:
- `web/demo/index.html` (bar charts, embedded seeds)
- `web/demo/likert.html` (Likert axis, per-statement points, KDE, consensus prior)

## Deploy to GitHub Pages
1. Create a new, empty GitHub repo and push (see commands below).
2. In repo settings → **Pages**, set **Source: GitHub Actions**.
3. Push to `main` — the workflow will publish `web/demo`.

## Create & push the repo
```bash
# from inside this folder after unzipping
git init
git add .
git commit -m "Initial commit: Science Index prototype"
# Option A: using GitHub CLI
gh repo create <your-org-or-user>/science-index --public --source=. --remote=origin --push
# Option B: manual
git branch -M main
git remote add origin git@github.com:<your-org-or-user>/science-index.git
git push -u origin main
```

## Notes
- JSON:API media type: `application/vnd.api+json`
- Seeds are demo-only; swap with ETL outputs when ready.
- MIT licensed.
