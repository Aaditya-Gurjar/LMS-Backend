import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import userRoutes from "./routes/user.routes.js"
import courseRoutes from "./routes/course.routes.js"
import errormiddleware from './middlewares/error.middleware.js';
const app = express();


app.use(express.json());
app.use(cors({
    origin : [process.env.FRONTEND_URL],
    credentials : true
}));

app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/ping', (req, res) => {
    res.send("Pong");
})

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/courses', courseRoutes)

app.all('*', (req,res) => {
    res.status(404).send("OOPS! 404 page not found !")
})

app.use(errormiddleware);
// Routes of 3 module

export default app;