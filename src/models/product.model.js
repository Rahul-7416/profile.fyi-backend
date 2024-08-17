import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        id: {
          type: Number,
          required: true,
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["electronics", "jewelery", "men's clothing", "women's clothing"],
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        rating: {
            type: Number,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }, {timestamps: true}
)

export const Product = mongoose.model("Product", productSchema);