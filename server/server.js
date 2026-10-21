require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const vesselRoutes = require('./routes/vesselRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const stationRoutes = require('./routes/stationRoutes');
const expeditionRoutes = require('./routes/expeditionRoutes');
const userRoutes = require('./routes/userRoutes');

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/vessels', vesselRoutes);
app.use('/api/equipment', equipmentRoutes);

app.use('/api/stations', stationRoutes);
app.use('/api/expeditions', expeditionRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));