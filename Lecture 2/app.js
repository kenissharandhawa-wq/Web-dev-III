import express from 'express';
import logger from './middleware/logger.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

app.use('/students', studentRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Student API' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});