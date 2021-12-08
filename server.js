require("dotenv").config({path: "./config.env"});
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const app =express();


//Connect DB
connectDB();

app.use(express.json());

app.get("/", (req, res, next) => {
    res.send("Api running");
  });

  //Connecting Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));

//Error Handler (Should be last piece of middleware)
//This is for create error messages
app.use(errorHandler);



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => 
console.log(`Server runing on port ${PORT}`));

process.on("unhandledRejection",(err,promise)=>{
    console.log(`Loged Error : ${err}`);
    server.close(()=>process.exit(1));
})

