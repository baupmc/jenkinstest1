'use strict';

const log4galaxy = require('../helpers/galaxyservicelog');
const jwt = require('../helpers/jwt');
const Token = require('../models/token');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let token;
    jwt.encode(request.user)
        .then(jwtToken => jwt.decode(token = jwtToken))
        .then(obj => {
            let data = {
                token: new Token(obj.iat, obj.exp, token)
            };
            response.status(200).json(new GalaxyReturn(data, null));
        })
        .catch(error => {
            log4galaxy.logMessage(error);
            let friendly = "An error occurred while renewing the user's JWT token.";
            response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
        });
}