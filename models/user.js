'use strict';

class User {

    constructor(id, firstName, lastName, email, groups, componentTagPermissions, systemPermissions, isAdmin) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.groups = groups || [];
        this.componentTagPermissions = componentTagPermissions || [];
        this.systemPermissions = systemPermissions || [];
        this.isAdmin = isAdmin || false;
    }

};

module.exports = User;