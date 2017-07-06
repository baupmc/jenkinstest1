'use strict';

const BaseModel = require('./basemodel');
const Category = require('./category');
const ComponentTypes = require('./enums/componenttypes.json');

class Component extends BaseModel {

    constructor(id, name, type, tags, category, modDate, alertEmail, alertPhone, disableNotify, stageStatus, autoStart) {
        super(id, name);
        this.type = type || '';
        this.tags = tags || [];
        this.category = category || new Category();
        this.modDate = modDate || '';
        this.alertEmail = alertEmail || '';
        this.alertPhone = alertPhone || '';
        this.disableNotify = disableNotify || false;
        this.stageStatus = stageStatus || false;
        this.autoStart = autoStart || '';
    }

};

module.exports = Component;