'use strict';

// helpers
const _ = require('lodash');
_.mixin(require('lodash-uuid'));
const db = require('../helpers/galaxydb');
const utils = require('../helpers/galaxyutils');
const log4galaxy = require('../helpers/galaxyservicelog');

// models
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');
const Alert = require('../models/alert');

module.exports = (request, response, next) => {
    let componentId = request.params.componentId;
    // If the ID isn't a UUID, just return a 400 error.
    if (!_.isUuid(componentId)) {
        let error = new Error('"' + componentId + '" is an invalid uuid.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        // Build skeleton core component settings object.
        let componentSettings = {
            main: {},
            alerts: {
                cnEnabled: false,
                dtEnabled: false,
                qdEnabled: false,
                naEnabled: false
            },
            help: {}
        };
        db.connect()
            // Get main, overarching component settings and data.
            .then(pool => db.CoMIT.Component.getSettingDataById(pool, componentId))
            .then(result => {
                // Apply settings to componentSettings object.
                // Ex: result = [component, componentHelp]
                let component = result[0];
                let componentHelp = result[1];
                componentSettings.id = component.id;
                componentSettings.name = component.name;
                componentSettings.type = component.type;
                componentSettings.main.disableNotify = component.disableNotify;
                componentSettings.main.stageStatus = component.stageStatus;
                componentSettings.main.autoStart = component.autoStart;
                componentSettings.alerts.alertEmail = component.alertEmail;
                componentSettings.alerts.alertPhone = component.alertPhone;
                componentSettings.category = component.category;
                componentSettings.help = componentHelp;
                // Get all alerts (and their schedules) by the componentId
                return db.connect()
                    .then(pool => db.CoMIT.Alert.getByComponentId(pool, componentId))
                    .then(alerts => {
                        // If there are somehow more than 4 alerts for a given component,
                        // there is a fatal error, so go no further. Only 1 of each 
                        // alert type can exist for any given component.
                        if (alerts.length > 4) {
                            let error = new Error('Fatal error returning alerts (maximum alert type count exceeded)!');
                            log4galaxy.logMessage(error);
                            response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
                        }
                        // Loop through the 4 alerts, setting data appropriately in componentSettings.
                        for(let alert of alerts){
                            if(alert.type == "Connection"){
                                componentSettings.alerts.cnId = alert.id;
                                componentSettings.alerts.cnEnabled = true;
                                componentSettings.alerts.cnSeverity = alert.severity;
                                componentSettings.alerts.cnSchedule = alert.alertSchedule;
                            }
                            else if (alert.type == "Data Timeout"){
                                componentSettings.alerts.dtId = alert.id;
                                componentSettings.alerts.dtEnabled = true;
                                componentSettings.alerts.dtSeverity = alert.severity;
                                componentSettings.alerts.dtSchedule = alert.alertSchedule;
                            }
                            else if (alert.type == "Queue Depth"){
                                componentSettings.alerts.qdId = alert.id;
                                componentSettings.alerts.qdEnabled = true;
                                componentSettings.alerts.qdMessageThreshold = alert.messageThreshold;
                                componentSettings.alerts.qdSeverity = alert.severity;
                                componentSettings.alerts.qdNotify = alert.notify;
                            }
                            else if (alert.type == "Negative Ack"){
                                componentSettings.alerts.naId = alert.id;
                                componentSettings.alerts.naEnabled = true;
                                componentSettings.alerts.naSeverity = alert.severity;
                                componentSettings.alerts.naRetryWait = alert.retryWaitTime;
                                componentSettings.alerts.naSchedule = alert.alertSchedule;
                            }
                        }
                        // Get all tags that contain this component.
                        return db.connect()
                            .then(pool => db.CoMIT.Tag.getByComponentId(pool, componentSettings.id))
                            .then(tags => {
                                // Add tags to the componentSettings object.
                                componentSettings.tags = tags;
                                // componentSettings object is complete, so return to client.
                                response.status(200).json(new GalaxyReturn(componentSettings, null));
                            })
                            .catch(error => {
                                log4galaxy.logMessage(error);
                                let friendly = 'An error occurred while fetching *tag* component settings.';
                                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
                            });
                    })
                    .catch(error => {
                        log4galaxy.logMessage(error);
                        let friendly = 'An error occurred while fetching *alert* component settings.';
                        response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
                    });
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching *main* component settings.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}