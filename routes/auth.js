const express = require('express');
const {check, body} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login', 
    [
        body('email')
        .isEmail()
        .withMessage('Direccion de email invalida.')
        .custom((value, {req}) => {
            return User.findOne({email: value})
            .then(user => {
                if (!user) {
                    return Promise.reject('Email o clave incorrectos');
                }
            })
        })
        .normalizeEmail(),
        body('password', 'Algo anda mal con esa clave...')
        .isLength({min: 3})
        .isAlphanumeric()
        .trim(),
    ], 
    authController.postLogin
);

router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Direcion de email invalida.')
            .custom((value, {req}) => {
                // if (value === 'test@test.com') {
                //     throw new Error('Fuck YOU in particular!');
                // }
                // return true;
                return User.findOne({email: value})
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            'El email ingresado ya existe ¿Olvidaste tu clave?'
                        );
                    }
            })
        })
        .normalizeEmail(), 
        body(
                'password',
                'La clave debe estar compuesta de numeros y letras y tener al menos 5 caracteres.'
            )
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Las claves no coinciden.');
            }
            return true;
        })
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;