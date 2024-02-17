import User from "../models/user.model.js"
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";

export const getRazorpayApiKey = async(req,res,next) => {
    res.status(200).json({
        sucess:true,
        message: "Razorpay Api Key",
        key : process.env.RAZORPAY_KEY_ID
    })
}


export const buySubscription = async(req,res,next) => {
   try {
    const {id} = req.user;

    const user = await User.findById(id)
    if(!user){
        return next( new AppError('Unauthorized,Please Login', 400));
    }

    if(user.role === "ADMIN"){
        return next(new AppError('Admin can not purchase a Subscription', 400));
    }

    const subscription = await razorpay.Subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify:1
    });

    user.subscription.id = subscription.id
    user.subscription.status = subscription.status
    await user.save();


    res.status(200).json({
        success:true,
        message:"Subscribed Successfully",
        subscription_id : subscription.id

    })

   } catch (error) {
    return next(new AppError(error.message, 400));
    
   }

}


export const  verifySubscription = async(req,res,next) => {
   try {
    const {id} = req.user;
    const{razorpay_payment_id, razorpay_signature, razorpay_subscription_id} = req.body;

    const user = await User.findById(id)
    if(!user){
        return next( new AppError('Unauthorized,Please Login', 400));
    }
    const subcriptionId = user.subscription.id;
    
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(`${razorpay_payment_id}|${subscription_id}`)
        .digest('hex')
    
    if(generatedSignature !== razorpay_signature){
        return next (new AppError("Payment Not verified, Please try again!", 500));
    }

    await Payment.create(
        {razorpay_payment_id, 
        razorpay_signature, 
        razorpay_subscription_id}
        );

    user.subscription.status = 'active'
    await user.save();

    res.status(200).json({
        sucess : true,
        message : 'Payment verified Successfully!'
    })
    
    
   } catch (error) {
    return next(new AppError(error.message, 400));
    
   }
}

export const cancelSubscription = async(req,res,next) => {

    try {
        const {id} = req.user;
        const user = await User.findById(id);
    
        if(!user){
            return next( new AppError('Unauthorized,Please Login', 400));
        }
    
        if(user.role === "ADMIN"){
            return next(new AppError('Admin can not purchase or Cancel a Subscription', 400));
        }
        
        const subscriptionId = user.subscription.id;
        const subscription = await razorpay.subscription.cancel(subscriptionId)
    
        user.subscription.stauts = subscription.status;
        await user.save();
    } catch (error) {
        return next(new AppError(error.message, 400));
    }

}




