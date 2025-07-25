const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { userAuthMiddleware } = require('./middlewares/authMiddleware');
const reportRoutes = require("./routes/reportRoutes");
const testRoutes = require('./routes/testRoutes');
const customerRoutes = require('./routes/customerRoutes');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors({
  origin: true, // Allow all origins (equivalent to '*')
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());

app.use('/auth/user', userRoutes);
app.use('/report',userAuthMiddleware, reportRoutes);
app.use('/test',userAuthMiddleware,testRoutes);
app.use('/customer',userAuthMiddleware,customerRoutes);
connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ message: "Created by 23N213 & 23N216" });
})

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
})
