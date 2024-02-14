import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
const getAllCourses = async function (req,res,next) {
   try {
    const courses = await Course.find({}).select('-lectures');
    res.status(200).json({
        success : true,
        message: "All Courses",
        courses,
    })
    
   } catch (error) {
    return next(new AppError(e.message, 400));
   }

}

const getLecturesByCourseId = async function (req,res,next) {
    try{
        const {id} = req.params;
        const course = await Course.findById(id);
        res.status(200).json({
            success : true,
            message : 'Course Lectures fethced Successfully',
            lectures : course.lectures
        })
    }

    catch (error) {
        return next(new AppError(e.message, 400));
       }
}


export {getAllCourses, getLecturesByCourseId}