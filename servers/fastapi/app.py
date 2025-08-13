from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from pathlib import Path
import json
from typing import Optional

app = FastAPI(title="Science Index Mock API (FastAPI)")

BASE = Path(__file__).resolve().parent
SEEDS = BASE / "seeds"

def load_doc(name: str):
    with open(SEEDS / name, "r") as f:
        return json.load(f)

def respond(data, included=None, meta=None):
    doc = {"data": data}
    if included: doc["included"] = included
    if meta: doc["meta"] = meta
    return JSONResponse(content=doc, media_type="application/vnd.api+json")

@app.get("/topics")
def list_topics():
    doc = load_doc("topics.json")
    return respond(doc["data"], doc.get("included"))

@app.get("/claim-spaces")
def list_claim_spaces():
    doc = load_doc("claim_spaces.json")
    return respond(doc["data"])

@app.get("/consensus-priors")
def list_consensus_priors(topic_id: Optional[str] = Query(default=None), as_of: Optional[str] = Query(default=None)):
    doc = load_doc("consensus_priors.json")
    data = doc["data"]
    if topic_id:
        data = [r for r in data if r["attributes"].get("topic_id") == topic_id]
    if as_of:
        data = [r for r in data if r["attributes"].get("as_of") <= as_of]
    return respond(data)

@app.get("/candidates")
def list_candidates():
    doc = load_doc("candidates.json")
    return respond(doc["data"])

@app.get("/stance-estimates")
def list_stance_estimates(candidate_id: Optional[str] = None, topic_id: Optional[str] = None):
    doc = load_doc("stance_estimates.json")
    data = doc["data"]
    if candidate_id:
        data = [r for r in data if r["attributes"].get("candidate_id") == candidate_id]
    if topic_id:
        data = [r for r in data if r["attributes"].get("topic_id") == topic_id]
    return respond(data)

@app.get("/score-snapshots")
def list_score_snapshots(candidate_id: Optional[str] = None, topic_id: Optional[str] = None):
    doc = load_doc("score_snapshots.json")
    data = doc["data"]
    if candidate_id:
        data = [r for r in data if r["attributes"].get("candidate_id") == candidate_id]
    if topic_id:
        data = [r for r in data if r["attributes"].get("topic_id") == topic_id]
    return respond(data)

@app.get("/evidence-units")
def list_evidence_units(candidate_id: Optional[str] = None, topic_id: Optional[str] = None):
    doc = load_doc("evidence_units.json")
    data = doc["data"]
    if candidate_id:
        data = [r for r in data if r["attributes"].get("candidate_id") == candidate_id]
    if topic_id:
        data = [r for r in data if r["attributes"].get("topic_id") == topic_id]
    return respond(data)
