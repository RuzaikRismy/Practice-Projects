const ErrorResponse = require('../utils/errorResponse');

const errorHandler  = (err, req, res, next)=> {
    let error = {...err};

    error.message = err.message;

    // console.log(err);

    if(err.code === 11000){
        const message = `Duplicate Fied Value Enter`;
        error = new ErrorResponse(message, 400);
    }


    //In mongoose we get validations error
    if(err.name === "ValidationError"){
        const message = Object.values(err.errors).map((val) => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success:false,
        error: error.message || "Server Error",
    });
}

module.exports = errorHandler;


//This is create for create and display error messages
//we van see error name and also error status