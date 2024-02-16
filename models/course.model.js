import { model, Schema } from "mongoose";

const courseSchema = new Schema({
    title : {
        type : String,
        required : [true, 'Title is required'],
        minLength : [8, 'Title must be at least 8 Chatacter'],
        maxLength: [60, 'Title must be less than 60 characters'] ,
        trim : true   },

    description : {
        type : String,
        required: [true, 'Description is requried'],
        minLength : [8, 'Title must be at least 8 Chatacter'],
        maxLength: [200, 'Title must be less than 200 characters'] ,

    },
    category : {
        type : String,
    },
    thumbnail : {
        public_id : {
            type: String
        },
        secure_url : {
            type : String
        }

    },
    lectures : [
        {
            title:{
                type : String,
                description : String,
                lecture : {
                    public_id : {
                        type: String
                    },
                    secure_url : {
                        type : String
                    }

                }
            }
             
        }
    ],
    numbersOfLectures : {
        type:Number,
        default : 0,
    },

    createdBy : {
        type : String,
        required : true,
    }
},{
    timestamps : true
})

const Course = model('Course', courseSchema);
export default Course;