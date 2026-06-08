import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static assets from the standard built 'dist' output directory
app.use(express.static(join(__dirname, 'dist')));

// Support client-side SPA routing - redirect all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Bind to port specified by host or fall back to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Teramor CRM Production Server running on port ${PORT}`);
});
