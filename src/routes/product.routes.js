import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controllers.js";

const router = Router();

// applying the authentication middleware to all the routes
router.use(verifyJWT);

// get products
router.route("/").get(getProducts);

// add product
router.route("/add-product").post(addProduct);

// update product
router.route("/update-product").put(updateProduct);

// remove product
router.route("/remove-product").delete(deleteProduct);

export default router;