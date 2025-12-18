import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory latest telemetry
let latest = null;

app.get('/api/status', (req, res) => {
  res.json({ ok: true, version: '0.1.0' });
});

app.post('/api/telemetry', (req, res) => {
  // Accept the payload from ESP32
  latest = req.body;
  console.log('Received telemetry:', latest);
  res.status(200).json({ ok: true });
});

app.get('/api/telemetry/latest', (req, res) => {
  if (!latest) return res.status(404).json({ error: 'no telemetry yet' });
  res.json(latest);
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
