'use strict';

// helpers
const _ = require('lodash');
_.mixin(require('lodash-uuid'));
const uuid = require('uuid');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const synchronous = require('../helpers/galaxyutils').synchronous;

// models
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');
const Alert = require('../models/alert');

const constructAlertArray = (componentSettings) => {
    let alerts = [];
    if(componentSettings.alerts.cnEnabled){
        alerts.push(
            new Alert(
                componentSettings.alerts.cnId,
                componentSettings.id,
                "Connection", 
                componentSettings.alerts.cnSeverity,
                "",
                "",
                componentSettings.alerts.cnSchedule,
                false
            )
        )
    }
    if(componentSettings.alerts.dtEnabled){
        alerts.push(
            new Alert(
                componentSettings.alerts.dtId,
                componentSettings.id,
                "Data Timeout",
                componentSettings.alerts.dtSeverity,
                "",
                "",
                componentSettings.alerts.dtSchedule,
                false
            )
        )
    }
    if(componentSettings.alerts.qdEnabled){
        alerts.push(
            new Alert(
                componentSettings.alerts.qdID,
                componentSettings.id,
                "Queue Depth",
                componentSettings.alerts.qdSeverity,
                componentSettings.alerts.qdMessageThreshold,
                "",
                "",
                componentSettings.alerts.qdNotify
            )
        )
    }
    if(componentSettings.alerts.naEnabled){
        alerts.push(
            new Alert(
                componentSettings.alerts.naId,
                componentSettings.id,
                "Negative Ack",
                componentSettings.alerts.naSeverity,
                "",
                componentSettings.alerts.naRetryWait,
                componentSettings.alerts.naSchedule,
                false
            )
        )
    }
    return alerts;
}

module.exports = (request, response, next) => {
    const componentSettings = request.body;
    componentSettings.help.componentId = componentSettings.id;
    if (_.isNil(componentSettings) || !_.isObject(componentSettings)) {
        let error = new Error('Please provide a valid component settings object for the update!');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else if (!_.isUuid(componentSettings.id)) {
        let error = new Error('Please provide a valid component for the update!');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => {
                const transaction = pool.transaction();
                return transaction.begin()
                    // Update main component information
                    .then(() => db.CoMIT.Component.update(transaction, componentSettings))
                    // If component settings exist, update them. Else, set them.
                    .then(() => {
                        if(_.isUuid(componentSettings.help.id)){
                            return db.CoMIT.ComponentHelp.update(transaction, componentSettings.help);
                        } else {
                            return db.CoMIT.ComponentHelp.set(transaction, componentSettings.help);
                        }
                    })
                    // Delete all component tag records by the component id.
                    .then(() => db.CoMIT.ComponentTag.deleteByComponentId(transaction, componentSettings.id))
                    // Insert the tags one by one, inserting new ones into the 
                    // table if they don't yet exist.
                    .then(() => {
                        // TAG UPDATE 
                        let updatedTags = [];
                        let tagPromises = [];
                        for (let tag of componentSettings.tags) {
                            tagPromises.push(() => db.CoMIT.ComponentTag.updateSingleComponent(transaction, tag, componentSettings.id)
                                .then(tag => updatedTags.push(tag)));
                        }
                        return synchronous(tagPromises)
                            .then(() => componentSettings.tags = updatedTags);
                    })
                    // Remove all alerts from the database.
                    .then(() => db.CoMIT.Alert.deleteByComponentId(transaction, componentSettings.id))
                    // Insert the alerts given by the client.
                    .then(() => {
                        // ALERT UPDATE
                        // Build up alert object array
                        let alerts = constructAlertArray(componentSettings);
                        let alertPromises = [];
                        if(alerts.length > 0){
                            for(let alert of alerts){
                                alertPromises.push(() => db.CoMIT.Alert.insert(transaction, alert));
                            }
                        }
                        return synchronous(alertPromises);
                    })
                    .then(() => transaction.commit())
                    .catch(error =>
                        transaction.rollback()
                            .then(() => Promise.reject(error)))
            })
            .then(() => response.status(200).json(new GalaxyReturn(componentSettings, null)))
            .catch(error => {
                // return an error if for some reason errors occured while updating group permissions in the database.
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while updating component settings.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}