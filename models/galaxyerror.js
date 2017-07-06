'use strict';

class GalaxyError{
    constructor(friendlyMsg, description, type) {
        this.friendlyMsg = friendlyMsg;
        this.description = description;
        this.type = type;
    }
};

module.exports = GalaxyError;