import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    fullName :{
        type : String,
        required : [true, "Name is Required"],
        minLength : [3, "Name must be atleast 3 charcter"],
        MaxLength : [30, "Name must be less than 50 character"],
        lowercase : true,
        trim : true
    },
    email : {
        type : String,
        required : [true, "Email is Required"],
        unique : true,
        lowercase : true,
        trim : true,
        
    },
    password : {
        type : String,
        required : [true, "Password is Required"],
        minLength : [8, "Password must be atleast 8 Characters"],
        select : false,
    },

    role : {
        type : String,
        enum : ['USER', 'ADMIN'],
        default : "USER"
    },

    avatar : {
        public_id : {
            type : String,
        },

        secure_url : {
            type : String
        }
    },

    forgotPasswordToken : String,
    forgotPasswordExpiry : Date
}, {timestamps : true});

userSchema.pre('save', async (next)=> {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods = {
    generateJWTToken : async () => {
       return await jwt.sign(
        {id:this._id, email : this._email, subscription: this.subscription} ,
        process.env.JWT_SECRET,
        {
            expiresIn : process.env.JWT_EXPIRY
        }
       )
    },

    comparePassword : async (plainTextPassword) => {
        return await bcrypt.compare(plainTextPassword, this.password)
    }
}

const User = model('User', userSchema);
export default User;