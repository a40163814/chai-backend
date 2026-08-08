//require('dotenv').config({path: './.env'});
import dotenv from 'dotenv';

import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';
import connectDB from './db/index.js';
dotenv.config({path: './.env'});


connectDB()
.then(() => {
    app.on('error', (error) => {
         console.error('Error connecting to MongoDB:', error);       
          
        })
    app.listen(process.env.PORT||8000, () => {
        console.log(`app is listening on port ${process.env.PORT||8000}`);
    })
})
.catch((error) => {
    console.error('MONGO DB connection failed!', error);
     // Exit the process with an error code
})
























// import express from 'express';
// const app = express();

// database connection
// (async () => {
//     try{
//        await mongoose.connect('${process.env.MONGODB_URI}/${DB_NAME}' )
//        app.on('error', (error) => {
//         console.error('Error connecting to MongoDB:', error);
//         throw error;
//        })
//        app.listen(process.env.PORT, () => {
//         console.log(`app is listening on port ${process.env.PORT}`);
//        });

//     } catch(error){
//         console.error('Error connecting to MongoDB:', error);
//         throw error;
//        }
//     })

   
// ();

