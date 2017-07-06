'use strict';

const config = require('../config/config');
const jwt = require('jsonwebtoken');

/**
 * Signs and returns a JWT token encoding the given object in its payload.
 * @param {object} object The object to encode in the JWT token.
 * @return {Promise} A promise that will either resolve to a JWT token, or reject with an error.
 */
module.exports.encode = (object) =>
    new Promise((resolve, reject) => {
        let options = {
            algorithm: config.token.algorithm,
            issuer: config.token.issuer,
            expiresIn: config.token.expiresIn
        };

        //delete issued at, expiration, and issuer for renewals
        delete object.iat;
        delete object.exp;
        delete object.iss;

        jwt.sign(object, config.keys.secret, options, (error, token) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });
    });

/**
 * Verifies the given JWT token decoding and returning its payload.
 * @param {} token The JWT token to verify and decode.
 * @param {boolean} ignoreExpiration when true, the expiration date of the token will be ignored during verification.
 * @return {Promise} A promise that will either resolve to the payload object, or reject with an error.
 */
module.exports.decode = (token, ignoreExpiration) =>
    new Promise((resolve, reject) => {
        let options = {
            algorithm: config.token.algorithm,
            issuer: config.token.issuer,
            maxAge: config.token.maxAge
        };

        if (ignoreExpiration) {
            options.ignoreExpiration = true;
        }

        jwt.verify(token, config.keys.secret, options, (error, decoded) => {
            if (error) {
                reject(error);
            } else {
                resolve(decoded);
            }
        });
    });