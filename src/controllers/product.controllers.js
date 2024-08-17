import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// fetching all the products added in the cart by the current user
const getProducts = asyncHandler(async (req, res) => {
    // performing aggregation -> so we find the products that are added by the current user
    const allCartProducts = await Product.aggregate(
        [
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user._id), // with the help of verifyJWT middleware
                }
            }
        ]
    );

    // There is no product added in the cart by the current user
    if (allCartProducts.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, {}, "No product in the cart")
        );
    }

    // returning response
    return res.status(200).json(
        new ApiResponse(200, { allItems: allCartProducts }, "All products in the cart fetched successfully")
    );
});

// add product to the cart
const addProduct = asyncHandler(async (req, res) => {
    // extracting product details from the req-body
    const { id, title, description, image, category, price, discount, quantity, rating } = req.body;

    // validations for string fields
    const stringFields = [id, title, description, image, category];
    if (stringFields.some(field => typeof field === 'string' && field.trim() === "")) {
        throw new ApiError(400, "All string fields are necessary and cannot be empty.");
    }

    // validations for numeric fields
    const numberFields = { price, discount, quantity, rating };
    for (const [key, value] of Object.entries(numberFields)) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new ApiError(400, `The field ${key} must be a valid number.`);
        }
    }

    // check if the product already exists or not
    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
        return res.status(409).json(
            new ApiResponse(409, {}, "This product has already been added")
        );
    }

    // create a new Product 
    const product = await Product.create({
        id,
        title,
        description,
        image,
        category,
        price,
        discount,
        quantity,
        rating,
        user: req.user._id
    });

    // check if the new product was added or not
    const createdProduct = await Product.findById(product._id).select("-user");
    if (!createdProduct) {
        throw new ApiError(500, "Something went wrong while adding the product!");
    }

    return res.status(201).json(
        new ApiResponse(201, createdProduct, "Product added successfully")
    );

});

// update product  -> for now it is only the quantity part that we need to update
const updateProduct = asyncHandler(async (req, res) => {
    // extract the data 
    const { id, quantity } = req.body;

    // validations
    if (!quantity) {
        throw new ApiError(404, "quantity is required to update product details");
    }

    if (quantity < 1 || quantity > 10) {
        throw new ApiError(404, "quantity cannot me less than 1 or more than 10");
    } 

    // find the product
    const product = await Product.findOne({ id });

    await Product.findByIdAndUpdate(
        product._id,
        {
            quantity
        },
        {
            new: true
        }
    )

    const updatedProduct = await Product.findById(product._id).select("-user");

    if (!updatedProduct) {
        throw new ApiError(500, "Something went wrong while updating the product");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    );
});

// delete product  
const deleteProduct = asyncHandler(async (req, res) => {
    // extract the data 
    const { id } = req.body;

    // find the product
    const product = await Product.findOne({ id });

    // delete the product from db
    await Product.findByIdAndDelete(product._id);

    // checking if the product deleted from the db or not
    const deletedProduct = await Product.findById(product._id).select("-user");
    if (deletedProduct) {
        throw new ApiError(500, "Something went wrong while deleting the product");
    }

    // returning the response
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Product deleted successfully")
    );
});

export {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
}