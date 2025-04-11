const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { userAuthMiddleware } = require('./middlewares/authMiddleware');
const reportRoutes = require("./routes/reportRoutes");
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors({
  origin:'*',
  methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders:['Content-type','Authorization']
}))

app.use(express.json());

app.use('/auth/user', userRoutes);
app.use('/report',reportRoutes);
connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ message: "Time for deepun to evolve" });
})

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
})
