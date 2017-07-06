'use strict';

const BaseModel = require('./basemodel');

class MessageQuery extends BaseModel {

    constructor(id, name, userId, queryData) {
        super(id, name);
        this.userId = userId;
        this.queryData = queryData || {};
    }

};

module.exports = MessageQuery;