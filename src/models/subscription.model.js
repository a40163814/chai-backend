import mongoose from "mongoose";
const subscriptionSchema= new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,// one who is subscribing
        ref:"User",
        required:true,
    },
    channel:{
        type:Schema.Types.ObjectId,//one to whom "subscriber" is subscribing
        ref:"User",
        required:true,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    plan:{
        type:String,
        required:true,
    },
    startDate:{
        type:Date,
        default:Date.now,
    },
    endDate:{
        type:Date,
        default:Date.now,
    },
})
export const Subscription=mongoose.model("Subscription",subscriptionSchema);
