import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary'
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

const createCourse = async (req, res, next) => {
    const {title, description, category, createdBy} = req.body;
    if( !title || !description || !category || !createdBy){
        return next( new AppError("All fields are Required", 400));
    }

    const course = await Course.create({
        title, 
        description, 
        category,
        createdBy,
    })

    if(!course){
        return next(new AppError("Course Could not be created, Please try again later", 500));
    }

    if(req.file){
        const result = await cloudinary.v2.uploader.upload(req.file.path, {folder:'lms'});
        if(result){
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
    }
    fs.rm(`uploads/${req.file.filename}`);
    }


    await course.save();
    res.status(200).json({
        success:true,
        message: 'Course Created Successfully!',
        course
    })


}

const updateCourse = async (req, res, next) => {
    try {
        const {id} = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set : req.body
            },
            {
                runValidators:true
            }
        )

        if(!course){
            return next(new AppError("course does not exitst!", 500));
        }

        res.status(200).json({
            success:true,
            message:"Course Updated Successfully!",
            course
        })
        
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
}

const removeCourse = async (req, res, next) => {
    try {
        const {id} = req.params;
        const course = await Course.findById(id);
        if(!course){
            return next(new AppError("Course Does not exist!", 400));
        }

        await Course.findByIdAndDelete(id);
        res.status(200).json({
            success : true,
            message:"Course removed Successfully!"
        })
     } catch (error) {
        return next(new AppError(error.message, 400));
    }
}

const addLectureToCourseById = async(req,res,next) => {
    try {
        const {title, description } = req.body;
    const {id} = req.params;
    if(!(title && description)){
        return next(new AppError("All fileds are Required!", 400));
    }

    const course = await Course.findById(id);
    if(!course){
        return next( new AppError("Course Does not exist!", 400));
    }

    const lectureData = {
        title, 
        description,
        lecture: {}
    }

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {folder:'lms'});
        if(result){
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;
    }
    fs.rm(`uploads/${req.file.filename}`);
        } 
        catch (error) {
          return next(new AppError(error.message, 400));  
        }
    }
    course.lectures.push(lectureData);
    course.numbersOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
        success:true,
        message:"Lecture Successfully added to the Coures",
        course
    })
    } catch (error) {
        return next(new AppError(error.message, 400));
    }

}
export {getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById}