'use strict';

const BaseModel = require('./basemodel');

class Permission {

    constructor(id, type, hasPermission) {
        this.id = id;
        this.type = type;
        this.hasPermission = hasPermission || false;
    }

};

module.exports = Permission;