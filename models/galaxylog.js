'use strict';

const db = require('../helpers/galaxydb');
const GalaxyReturn = require('./galaxyreturn');
const GalaxyError = require('./galaxyerror');

class GalaxyLog {
    /**
     * LogMessage Object Class
     * @param {string} systemName friendly name of consuming system
     * @param {string} systemToken Splunk token or other GUID that represents the consuming system
     * @param {string} userName username of the logged event
     * @param {string} logType basic types for logging, create, read, update, info, etc
     * @param {boolean} isFairWarning boolean flag if this is a log for FairWarning (true)
     * @param {string} message message to log
     */

    constructor(systemName, systemToken, userName, logType, isFairWarning, message) {
        this.systemName = systemName || 'galaxyAPI';
        // If no token passed in generate a temporary token (GUID) for testing
        this.systemToken = systemToken || '9199bdbc-70b0-4af7-8e3a-a5ace0db299f';
        this.userName = userName || 'galaxyAPI';
        this.logType = logType || 'info';
        this.isFairWarning = isFairWarning || false;
        if (this.isFairWarning === 'true') {
            this.isFairWarning = 1
        } else {
            this.isFairWarning = 0;
        }
        this.message = message;
        // Always generate date/time stamp
        var timestamp = new Date();
        timestamp = timestamp.getUTCFullYear() + '-' +
            ('00' + (timestamp.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + timestamp.getUTCDate()).slice(-2) + ' ' +
            ('00' + timestamp.getUTCHours()).slice(-2) + ':' +
            ('00' + timestamp.getUTCMinutes()).slice(-2) + ':' +
            ('00' + timestamp.getUTCSeconds()).slice(-2) + '.' +
            ('000' + timestamp.getUTCMilliseconds()).slice(-3);
        this.messageDate = timestamp;
    };

    toDb() {
        return db.connect()
            .then(pool => {
                let transaction = pool.transaction();
                return transaction.begin()
                    .then(() => db.LoggingMessage.insertLog(transaction, this.systemName, this.systemToken,
                        this.userName, this.logType, this.isFairWarning, this.message, this.messageDate))
                    .then(() => transaction.commit())
                    .catch(error => transaction.rollback()
                        .then(() => Promise.reject(error)))
            })
    };

    toSplunk() {
        // Create a Splunk event to emit
        console.log('splunk stuff here');
    };
};

module.exports = GalaxyLog;