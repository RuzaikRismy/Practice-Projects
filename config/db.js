const mongoose = require('mongoose');

const connectDB = async () => {
    // try{
        await mongoose.connect(process.env.MONGO_URI,{
        //This MONGO_URI comes from .env file
         useNewUrlParser: true,
         useUnifiedTopology:true,
        });

        console.log("Mongodb connected...")
    // }catch(err){
    // console.log("Mongodb connection fail");
    // process.exit(1);
    // }
}

module.exports = connectDB;