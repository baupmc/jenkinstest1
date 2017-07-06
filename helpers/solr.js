
// utilities
const _ = require('lodash');
const ping = require('ping');
const request = require('request');
const config = require('../config/config');

const _request = (url) =>
    new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve([response, body]);
            }
        });
    })

const Solr = {

    /**
   * Pings each of the Solr servers (hostnames listed in config.js)
   * if ALL servers are availble then it returns true.
   * if ANY server is unavailble then it returns false.
   * @return {Promise} A promise that will either resolve to boolean, or reject with an error.
   */
    ping: function () {
        let promises = [];
        for (let solr of config.solr) {
            let promise = ping.promise.probe(solr.hostname)
                .then(result => result.alive);
            promises.push(promise);
        }
        return Promise.all(promises)
            .then(alives => {
                let areAllServersAlive = true;
                for (let alive of alives) {
                    areAllServersAlive = areAllServersAlive && alive;
                }
                return areAllServersAlive;
            });
    },

    /**
     * Queries each Solr server for a list of its collections. All collections are merged and duplicates are removed.
     * All servers must be available for this function to succeed, if ANY one of the servers is unavailble this function will fail.
     * @return {Promise} A promise that will either resolve to an array of collections, or reject with an error.
     */
    collections: function () {
        let promises = [];
        for (let solr of config.solr) {
            let promise = ping.promise.probe(solr.hostname)
                .then(response => {
                    if (!response.alive) {
                        let error = new Error('could not establish a connection to ' + solr.hostname);
                        return Promise.reject(error);
                    } else {
                        //http://<host>:<port>/solr/admin/collections?action=LIST&wt=json
                        let url = 'http://' + solr.hostname + ':' + solr.port + '/solr/admin/collections?action=LIST&wt=json';
                        return _request(url);
                    }
                })
                .then(result => {
                    let response = result[0];
                    let body = result[1];
                    // status code is not in the 200's (2xx) then throw an error
                    if (!String(response.statusCode).match(/2\d{2}/g)) {
                        let error = new Error(response.statusCode + ':' + response.statusMessage);
                        return Promise.reject(error);
                    }
                    else {
                        let collections = JSON.parse(body).collections;
                        if (collections) {
                            return collections;
                        } else {
                            let error = new Error('no collections were found');
                            return Promise.reject(error);
                        }
                    }
                });
            promises.push(promise);
        }
        return Promise.all(promises)
            .then(listOfCollections => {
                let mergedCollections = [];
                for (let collections of listOfCollections) {
                    mergedCollections = _.union(mergedCollections, collections);
                }
                return mergedCollections;
            });
    },

    /**
     * Queries the given collection on each Solr server for a list of its fields. All fields are merged (adding up total document count) and duplicates are removed.
     * All servers must be available for this function to succeed, if ANY one of the servers is unavailble this function will fail.
     * @param {String} collection the name of the Solr Collection to retrieve fields for.
     * @return {Promise} A promise that will either resolve to an array of fields, or reject with an error.
     */
    fields: function (collection) {
        let promises = [];
        for (let solr of config.solr) {
            let promise = ping.promise.probe(solr.hostname)
                .then(response => {
                    if (!response.alive) {
                        let error = new Error('could not establish a connection to ' + solr.hostname);
                        return Promise.reject(error);
                    } else {
                        //http://<host>:<port>/solr/<collection_name>/admin/luke?wt=json
                        let url = 'http://' + solr.hostname + ':' + solr.port + '/solr/' + collection + '/admin/luke?wt=json';
                        return _request(url);
                    }
                })
                .then(result => {
                    let response = result[0];
                    let body = result[1];
                    // status code is not in the 200's (2xx) then throw an error
                    if (!String(response.statusCode).match(/2\d{2}/g)) {
                        let error = new Error(response.statusCode + ':' + response.statusMessage);
                        return Promise.reject(error);
                    }
                    else {
                        let fields = JSON.parse(body).fields;
                        if (fields) {
                            return fields;
                        } else {
                            let error = new Error('no fields were found for the given collection');
                            return Promise.reject(error);
                        }
                    }
                });
            promises.push(promise);
        }
        return Promise.all(promises)
            .then(listOfFields => {
                let mergedFields = {};
                for (let fields of listOfFields) {
                    for (let field of Object.keys(fields)) {
                        if (mergedFields[field]) {
                            if (mergedFields[field].docs && fields[field].docs) {
                                mergedFields[field].docs += fields[field].docs;
                            }
                        } else {
                            mergedFields[field] = fields[field];
                        }
                    }
                }
                return mergedFields;
            });
    },

    /**
     * Queries the given collection on each Solr server for its schema. Assuming schemas are identical across servers.
     * Only ONE of the servers must be available for this function to succeed, if ALL of the servers are unavailble this function will fail.
     * @param {String} collection the name of the Solr Collection to retrieve fields for.
     * @return {Promise} A promise that will either resolve to an array of fields, or reject with an error.
     */
    schema: function (collection) {
        let promises = [];
        for (let solr of config.solr) {
            let promise = ping.promise.probe(solr.hostname)
                .then(response => {
                    if (!response.alive) {
                        let error = new Error('could not establish a connection to ' + solr.hostname);
                        return Promise.reject(error);
                    } else {
                        //http://<host>:<port>/solr/<collection_name>/schema
                        let url = 'http://' + solr.hostname + ':' + solr.port + '/solr/' + collection + '/schema';
                        return _request(url);
                    }
                })
                .then(result => {
                    let response = result[0];
                    let body = result[1];
                    // status code is not in the 200's (2xx) then throw an error
                    if (!String(response.statusCode).match(/2\d{2}/g)) {
                        let error = new Error(response.statusCode + ':' + response.statusMessage);
                        return Promise.reject(error);
                    }
                    else {
                        let schema = JSON.parse(body).schema;
                        if (schema) {
                            return schema;
                        } else {
                            let error = new Error('schema was not found for the given collection');
                            return Promise.reject(error);
                        }
                    }
                })
                .catch(error => false);
            promises.push(promise);
        }
        return Promise.all(promises)
            .then(schemas => {
                // note: the value for a schema will be false if the call failed for a given server
                // iterate through each server's schema (assuiming the schemas will be identical) and return the first schema found.
                for (let schema of schemas) {
                    if (schema) {
                        return schema;
                    }
                }
                return {};
            });
    }
}

module.exports = Solr;