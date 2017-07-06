'use strict';

class ComponentTagPermission {

    constructor(tag, permissions) {
        this.tag = tag;
        this.permissions = permissions || [];
    }

};

module.exports = ComponentTagPermission;