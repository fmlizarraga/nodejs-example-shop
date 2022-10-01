const path = require('path');

const express = require('express');
const {check, body} = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',
 isAuth, 
 [
    body('title', 'El nombre debe contener al menos 6 caracteres').trim().isString().isLength({min: 4}),
   //  body('imageUrl', 'URL invalida').isURL(),
    body('price', 'El precio debe ser un numero, con punto decimal').isFloat(),
    body('description', 'La descripcion debe contener entre 6 y 240 caracteres alfanumericos').trim().isLength({min: 6, max:240}),
 ], 
 adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, 
[
    body('title', 'El nombre debe contener al menos 6 caracteres alfanumericos').trim().isString().isLength({min: 4}),
   //  body('imageUrl', 'URL invalida').isURL(),
    body('price', 'El precio debe ser un numero, con punto decimal').isFloat(),
    body('description', 'La descripcion debe contener entre 6 y 240 caracteres alfanumericos').trim().isLength({min: 6, max:240}),
 ],
adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
