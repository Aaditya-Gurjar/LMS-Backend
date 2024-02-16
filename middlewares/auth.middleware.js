import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    // const {token} = req.cookies;

    // if(!token) return next(new AppError('Unauthenticated', 400));
    // // const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    // // req.user = userDetails;
    // // next();

    // try {
    //     const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    //     req.user = userDetails;
    //     next();
    // } catch (error) {
    //     // Handle token verification error
    //     return next(new AppError('Invalid token or authentication failed', 401));
    // }

     // extracting token from the cookies
     console.log(req.cookies);
  const { token } = req.cookies;

  // If no token send unauthorized message
  if (!token) {
    return next(new AppError("Unauthorized, please login to continue", 401));
  }

  // Decoding the token using jwt package verify method
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // If no decode send the message unauthorized
  if (!decoded) {
    return next(new AppError("Unauthorized, please login to continue", 401));
  }

  // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
  req.user = decoded;

  // Do not forget to call the next other wise the flow of execution will not be passed further
  next();
}

const authorizedRoles = (...roles) => async (req,res,next) => {
    const currentRole = req.user.role;
    if(!roles.includes(currentRole)){
        return next(new AppError("You don't have permission to access this route", 403));
    }
    next();
}
export{ isLoggedIn, authorizedRoles}