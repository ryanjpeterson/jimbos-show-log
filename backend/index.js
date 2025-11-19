require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend to talk to the backend
app.use(express.json()); // Allows backend to parse JSON body data

// Routes
app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});