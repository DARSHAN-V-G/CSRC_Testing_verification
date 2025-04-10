const express = require('express')

const app = express()
require('dotenv').config()

app.get('/', (req, res) => {
  res.status(200).json({message: "Time for deepun to evolve"});
})

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
})
