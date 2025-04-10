const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { userAuthMiddleware } = require('./middlewares/authMiddleware');

const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

app.use('/auth/user', userRoutes);
connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ message: "Time for deepun to evolve" });
})

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
})
