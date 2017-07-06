'use strict';

const BaseModel = require('./basemodel');

class Category extends BaseModel {

    constructor(id, name) {
        super(id, name);
    }

};

module.exports = Category;