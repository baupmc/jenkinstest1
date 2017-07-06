'use strict';

const BaseModel = require('./basemodel');

class ComponentHelp {

    constructor(id, componentId, supportGroup, contactName, contactPhone, contactEmail,
        description, probableInactivity, resolutionNotes, additionalInfo, helpSchedule) {
        this.id = id || "";
        this.componentId = componentId || "";
        this.supportGroup = supportGroup || "";
        this.contactName = contactName || "";
        this.contactPhone = contactPhone || "";
        this.contactEmail = contactEmail || "";
        this.description = description || "";
        this.probableInactivity = probableInactivity || "";
        this.resolutionNotes = resolutionNotes || "";
        this.additionalInfo = additionalInfo || "";
        this.helpSchedule = helpSchedule || [];
    }
};

module.exports = ComponentHelp;