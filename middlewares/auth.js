"use strict";

const activedirectory = require("../helpers/activedirectory");
const config = require("../config/config");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;
const Strategy = require("passport-http-bearer").Strategy;
const User = require("../models/user");
const jwt = require("../helpers/jwt");

module.exports.authorization = new Strategy((token, done) => {
    jwt.decode(token)
        .then(user => done(null, user))
        .catch(error => done(null, false, JSON.stringify(error.message)));
});

module.exports.renewal = new Strategy((token, done) => {
    let currentUser;
    jwt.decode(token, true)
        .then(user => {
            currentUser = user;
            return activedirectory.isUserActive(currentUser.id);
        })
        .then(isActive => {
            if (isActive) {
                return done(null, currentUser);
            } else {
                return Promise.reject(new Error('Error: User ' + currentUser.id + ' was not found in Active Directory'));
            }
        })
        .catch(error => done(null, false, JSON.stringify(error.message)));
});

module.exports.authentication = new BearerStrategy(config.passport, (token, done) => {
    let currentUser;
    activedirectory.findUser(token.upn)
        .then(user => {
            if (user) {
                currentUser = new User(
                    token.upn,
                    token.given_name,
                    token.family_name,
                    user.mail
                );
                return activedirectory.getGroupMembershipForUser(currentUser.id);
            } else {
                return Promise.reject(new Error('Error: User was not found in Active Directory'));
            }
        })
        .then(groups => {
            if (groups) {
                currentUser.groups = [];
                groups.forEach((group) => currentUser.groups.push(group.cn));
            }
            return done(null, currentUser);
        })
        .catch(error => done(null, false, JSON.stringify(error.message)));
});