'use strict';

const _ = require('lodash');
const solr = require('../helpers/solr');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

const getFieldNames = (fields) => {
    let fieldNames = [];
    for (let field of Object.keys(fields)) {
        fieldNames.push(field);
    }
    return fieldNames;
}

module.exports = (request, response, next) => {
    solr.collections()
        .then(collections => {
            for (let collection of collections) {
                if (collection.includes('hl7')) {
                    return collection;
                }
            }
            return Promise.reject('The HL7 collection does not exist in Solr');
        })
        .then(collection => solr.fields(collection))
        .then(fields => {
            let fieldNames = getFieldNames(fields);
            log4galaxy.logMessage(fieldNames);
            response.status(200).json(new GalaxyReturn(fieldNames, null));
        })
        .catch(error => {
            log4galaxy.logMessage(error);
            let friendly = 'An error occurred while fetching HL7 field names from the Solr index.';
            response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
        });
}