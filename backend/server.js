require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const opportunityRoutes = require('./routes/opportunities');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check - useful to confirm the deployed backend is alive
app.get('/', (req, res) => {
  res.json({ message: 'PingBack AI backend is running' });
});

app.use('/api/opportunities', opportunityRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Add it to your .env file or hosting environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
