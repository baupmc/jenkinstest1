'use strict';

class Token {
    constructor(iat, exp, jwt) {
        this.iat = iat;
        this.exp = exp;
        this.jwt = jwt;
    }
}

module.exports = Token;