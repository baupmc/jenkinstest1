'use strict';

const BaseModel = require('./basemodel');

class Alert extends BaseModel {

    constructor(id, componentId, type, severity, messageThreshold, retryWaitTime, alertSchedule, notify) {
        super(id, "");
        this.componentId = componentId || "";
        this.type = type || "";
        this.severity = severity || "";
        this.messageThreshold = messageThreshold || 0;
        this.retryWaitTime = retryWaitTime || 0;
        this.alertSchedule = alertSchedule || [];
        this.notify = notify || false;
    }

};

module.exports = Alert;