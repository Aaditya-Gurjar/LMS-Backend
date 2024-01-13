import app from './app.js'
import {config} from 'dotenv'
import connetionToDb from './config/dbConnection.js';
config();
const port = process.env.PORT || 5000;

app.listen(port, async() => {
    await connetionToDb();
    console.log(`Server is Running at port ${port}`);
});