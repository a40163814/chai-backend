// express se app banega
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    ceredentials:true
}));// middleware for handling Cross-Origin Resource Sharing (CORS) in Express.js applications. It allows you to specify which domains are allowed to access your server's resources, helping to prevent security issues related to cross-origin requests.
app.use(cookieParser());
app.use(express.json({
    limit: "16kb"
}));// middleware that parses incoming JSON requests and puts the parsed data in req.body. It allows your Express.js application to handle JSON payloads sent in HTTP requests, making it easier to work with JSON data.
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));// middleware that parses incoming URL-encoded requests and puts the parsed data in req.body. It allows your Express.js application to handle URL-encoded data sent in HTTP requests, such as form submissions.
app.use(express.static("public"));// middleware that serves static files from the "public" directory. It allows your Express.js application to serve static assets like images, CSS files, and JavaScript files directly to clients without needing additional route handling.



//routes import
import userRouter from './routes/user.routes.js';
// routes declaration
app.use("/api/v1/users",userRouter);
//http://localhost:3000/api/v1/users/register
export{app}

