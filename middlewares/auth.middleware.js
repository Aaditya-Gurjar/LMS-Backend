import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';

const isLoggedIn= (req, res, next) => {
    const {token} = req.cookies;

    if(!token) return next(new AppError('Unauthenticated', 400));
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
}

export{ isLoggedIn}