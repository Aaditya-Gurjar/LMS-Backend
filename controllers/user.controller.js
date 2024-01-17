// import { JsonWebTokenError } from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
const cookieOptions = {
    maxAge : 7 * 24 *60 * 60 * 1000, //7days
    httpOnly : true,
    secure : true
}

const register = async (req,res, next) => 
{
    const {fullName, email, password} = req.body;
    if(!fullName || ! email || !password) return next (new AppError("All fields are required", 400)) ;

    const userExist = User.findOne({email});
    if(userExist) return next(new AppError("Email already exists ", 400))

    const user = await User.create({
        fullName,
        email,
        password,
        avatar:{
            public_id:email,
            secure_url:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
    })

    if(!user) return next (new AppError('User Registration Failed, Please try again !', 400))

    // TODO: file upload

    await user.save();
    user.password = undefined

    const token = await user.generateJWTToken();

    res.status(200).json({
        success : true,
        message : 'User Registered Sucessfuully ',
        user
        
    })

    res.cookie('token', token, cookieOptions)
}


const login = async (req,res) => {
    try {
        const {email, password} = req.body;
    if(!email || !password) return next(new AppError("All fields are required", 400));

    const user = await User.findOne({email}).select('+password');
    if(!user || !user.comparePassword(password)){
        return next (new AppError("Email or Password doesn't match",400))
    }
    const token = user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success : true,
        message : 'User loggedin Successfully',
        user
    });
    } catch (error) {
        return next (new AppError(error.message, 500));
    }
    
}

const logout = (req,res) => {
    res.cookie(token, null, {
        secure : true,
        maxAge : 0,
        httpOnly : true
    });
    res.send(200).json({
        success : true,
        message : 'User LoggedOut successfully'
    })
}

const getProfile = async (req,res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        res.status(200).json({
            success : true,
            message : 'User details',
            user
        })

    } catch (error) {
        return next(new AppError('Failed to fetch Profile details', 500));
    }
}


export {register, login, logout, getProfile}



