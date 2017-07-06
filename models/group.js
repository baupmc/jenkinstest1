'use strict';

const BaseModel = require('./basemodel');

class Group extends BaseModel {

    constructor(id, name, isAdmin, componentTagPermissions, systemPermissions) {
        super(id, name);
        this.isAdmin = isAdmin || false;
        this.componentTagPermissions = componentTagPermissions || [];
        this.systemPermissions = systemPermissions || [];
    }

};

module.exports = Group;