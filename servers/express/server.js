import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5055;

const loadDoc = (name) => {
  const p = path.join(__dirname, 'seeds', name);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
};

// Helper to respond JSON:API style
const respond = (res, data, included=null, meta=null) => {
  const doc = { data };
  if (included) doc.included = included;
  if (meta) doc.meta = meta;
  res.type('application/vnd.api+json').json(doc);
};

// Collections
app.get('/topics', (req, res) => {
  const doc = loadDoc('topics.json');
  respond(res, doc.data, doc.included || null);
});

app.get('/claim-spaces', (req, res) => {
  const doc = loadDoc('claim_spaces.json');
  respond(res, doc.data);
});

app.get('/consensus-priors', (req, res) => {
  const doc = loadDoc('consensus_priors.json');
  let data = doc.data;
  const { topic_id, as_of } = req.query;
  if (topic_id) data = data.filter(r => r.attributes.topic_id === topic_id);
  if (as_of) data = data.filter(r => r.attributes.as_of <= as_of);
  respond(res, data);
});

app.get('/candidates', (req, res) => {
  const doc = loadDoc('candidates.json');
  respond(res, doc.data);
});

app.get('/stance-estimates', (req, res) => {
  const doc = loadDoc('stance_estimates.json');
  let data = doc.data;
  const { candidate_id, topic_id } = req.query;
  if (candidate_id) data = data.filter(r => r.attributes.candidate_id === candidate_id);
  if (topic_id) data = data.filter(r => r.attributes.topic_id === topic_id);
  respond(res, data);
});

app.get('/score-snapshots', (req, res) => {
  const doc = loadDoc('score_snapshots.json');
  let data = doc.data;
  const { candidate_id, topic_id } = req.query;
  if (candidate_id) data = data.filter(r => r.attributes.candidate_id === candidate_id);
  if (topic_id) data = data.filter(r => r.attributes.topic_id === topic_id);
  respond(res, data);
});

app.get('/evidence-units', (req, res) => {
  const doc = loadDoc('evidence_units.json');
  let data = doc.data;
  const { candidate_id, topic_id } = req.query;
  if (candidate_id) data = data.filter(r => r.attributes.candidate_id === candidate_id);
  if (topic_id) data = data.filter(r => r.attributes.topic_id === topic_id);
  respond(res, data);
});

// OpenAPI file passthrough if you drop it next to server.js
app.get('/openapi.yaml', (req, res) => {
  const p = path.join(__dirname, '..', 'openapi.yaml');
  if (fs.existsSync(p)) {
    res.type('text/yaml').send(fs.readFileSync(p, 'utf8'));
  } else {
    res.status(404).json({ error: 'openapi.yaml not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Science Index mock API (Express) on http://localhost:${PORT}`);
});
