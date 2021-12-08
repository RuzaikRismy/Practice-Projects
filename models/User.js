const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({

    username:{
        type : String ,
        required: [true, "Please provise a username"]
    },
    email:{
        type : String ,
        required: [true, "Please provide a email"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ,
            "Please prvide a valid email"
        ]
    },
    password:{
        type : String ,
        required: [true, "Please add a password"],
        minilength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

//middleware for pre saving or post saving

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next(); 
    }

    const salt = await bcrypt.genSalt(10);
    //Below code will save the hash password in password field in database
    this.password = await bcrypt.hash(this.password,salt)
    next();
})

UserSchema.methods.matchPasswords = async function(password) {
    return await bcrypt.compare(password, this.password);
}
//Below method is for create a token 
UserSchema.methods.getSignedToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}

//Below method for reset token if someone who forgot password

UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 10 + (60 * 1000);

    return resetToken
}

const User = mongoose.model('User',UserSchema);

module.exports = User;