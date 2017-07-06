'use strict';

const BaseModel = require('./basemodel');
const TagTypes = require('./enums/tagtypes.json');

class Tag extends BaseModel {

    constructor(id, name, type, components) {
        super(id, name);
        this.type = TagTypes[type] || '';
        this.components = components || [];
    }

};

module.exports = Tag;