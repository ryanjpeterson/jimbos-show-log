require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const isDocker = process.env.NODE_ENV === 'production' || fs.existsSync('/.dockerenv');

app.use(cors());
app.use(express.json());

// Dev Mode: Serve uploads from local folder
if (!isDocker) {
  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
  app.use('/uploads', express.static(uploadsPath));
}

app.use('/api', apiRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));