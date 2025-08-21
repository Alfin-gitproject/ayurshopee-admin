 
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        fullName:{
            type:String,
            required: false,
        },
        address:{
            type:String,
            required: true,
        },
        city:{
            type:String,
            required: true,
        },
        phoneNo:{
            type:String,
            required: true,
        },
        zipCode:{
            type:String,
            required: true,
        },
        country:{
            type: String,
            required: true,
            default: 'India'
        },
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    orderItems:[
        {
            name: {
                type:String,
                required: true,
            },
            quantity: {
                type:Number,
                required: true,
                default:1,
            },
            image: {
                type:String,
                required: false,
            },
            price: {
                type:String,
                required: true,
            },
            product:{
                type:String,
                required:true,
            },
        }
    ],
    paymentMethod:{
        type:String,
        required:[true,"Please select payment method"],
        enum:{
            values:["COD","Online"],
            message:"Please select COD or Online Payments"
        }
    },
    paymentInfo:{
        id:String,
        status:String
    },
    itemsPrice:{
        type:Number,
        required:true
    },
    taxAmount:{
        type:Number,
        required:true
    },
    shippingAmount:{
        type:Number,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    orderStatus:{
        type:String,
        default:"Processing",
        enum:{
            values:["Processing","Shipped","Delivered"],
            message:"Please select valid order status"
        }
    },
    deliveredAt:Date
},
{timestamps:true}
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
