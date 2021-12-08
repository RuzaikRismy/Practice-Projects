const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

exports.login = async (req,res,next) => {
    // res.send("Login Route ");
    const {email,password} = req.body;

    if(!email || !password){
        // res.status(400).json({success:false,error:"Please provide email and password"});
        return next(new ErrorResponse("Please Provide an Email and Password",400));
    }
    
    try{

     const user = await User.findOne({email}).select("+password");

     if(!user){
        //  res.status(404).json({success:false,error:"Invalid Credentials"});
        return next(new ErrorResponse("Invalid Credentials",401));
     }

     //Let's compare password we enteres and inside database
     const isMatch = await user.matchPasswords(password);

     if(!isMatch) {
        //  res.status(404).json({success:false, error: "Invalid Credentials"});
        return next(new ErrorResponse("Invalid Credentials",401));
     }

    //  res.status(200).json({
    //     success: true,
    //     token: "thjnksdjf343mk",
    // });
    sendToken(user, 200,res);

    }catch(error){
    // res.status(500).json({success: false, error: error.message});
    next(err);
    }
};

exports.register = async (req,res,next) => {
    // res.send("Register Route ");
    const {username,email,password} = req.body;

    try {
        const user = await User.create({
            username,
            email,
            password
        });

        // res.status(201).json({
        //     success: true,
        //     token:"2nzdb89"
           sendToken(user, 200, res);
        
    } catch(error){
        // res.status(400).json({
        //     success: false,
        //     error: error.message,
        // });

        //After creating errorHandler we can place it like below
        next(error);
    }
};



exports.forgotpassword = async (req,res,next) => {
    //get email from body
    const {email} = req.body;

    try {
        const user  = await User.findOne({email});

        if(!user){
            return next(new ErrorResponse("Email could not be sent",404));
        }
        const resetToken =  user.getResetPasswordToken();

        await user.save();

        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;
        
        //This for email for user their new email
        const message = `
          <h1> You have requested a password reset </h1>
          <p> PLease go to this link to reset your password</p>
          <a href=${resetUrl} clicktracking=off>${resetUrl} </a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset Request",
                text: message
            });

            res.status(200).json({success: true, data: "Email_sent"});
            
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return next(new ErrorResponse("Email could not be send",500));
        }
         
        
    } catch (err) {
        next(err);
    }
};

exports.resetpassword = async (req,res,next) => {
    // res.send("Reset Password Route ");

    const resetPasswordToken = crypto.createHash("sha256")
    .update(req.params.resetToken).digest("hex");

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now()}   //In here we check expire date is grater than currently date
        })
        if(!user){
            return next(new ErrorResponse("Invalid Reset Token",400));
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        //  await user.status(201).json({
            res.status(201).json({
             success: true,
             data: "Password Reset Success",
             token: user.getSignedToken(),
         });

    }catch(err){
       next(err);
    }
};

const sendToken = (user, statusCode, res)=> {
    const token = user.getSignedToken();
    res.status(statusCode).json({success:true,token})
}
