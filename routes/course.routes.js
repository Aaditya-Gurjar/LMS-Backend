import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse } from "../controllers/course.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
const router = Router();


router.route('/')
.get(getAllCourses)
.post(
    isLoggedIn, 
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
    );


router.route('/:id')
.get(isLoggedIn, getLecturesByCourseId)
.put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
.delete(isLoggedIn,authorizedRoles('ADMIN'), removeCourse);
export default router;