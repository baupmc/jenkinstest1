const config = require('../config/config');
const activedirectory = require('activedirectory');
const activeDirectoryUPMC = new activedirectory(config.activedirectory);

const filters = activedirectory.filters;
/**
 * Parses the GUID from the storage buffer
 * @param {Buffer} objectGUID The Buffer containing the GUID to be parsed.
 * @return {String} The parsed and formatted GUID String.
 */
const parseGUID = (objectGUID) => {
    var s, hex = Array.prototype.map.call(
        //calls the following function on all elements of objectGUID
        objectGUID, value => {
            //Get the least significant byte and convert it to hex.
            s = (value & 0xFF).toString(16);
            return value <= 0xF ? ('0' + s) : s;
        }
    );
    return (
        [hex[3], hex[2], hex[1], hex[0], '-',
        hex[5], hex[4], '-',
        hex[7], hex[6], '-',
        hex[8], hex[9], '-',
        hex[10], hex[11], hex[12], hex[13], hex[14], hex[15], ''
        ].join(''));
}

/**
 * Determines wheter a user is within the UPMC local Active Directory 
 * by looking up or finding a user by their sAMAccountName, userPrincipalName, distinguishedName (dn) or custom filter.
 * @param {string} id The username to search for in the UPMC Active Directory.
 * @return {Promise} A promise that will either resolve to true (if user is found), 
 * resolve to false (if user is not found), or reject with an error.
 */
module.exports.isUserActive = (id) =>
    new Promise((resolve, reject) => {
        activeDirectoryUPMC.findUser(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                if (user) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });

/**
 * Looks up or finds a user by their sAMAccountName, userPrincipalName, 
 * distinguishedName (dn) or custom filter within the UPMC local Active Directory.
 * @param {string} id The username to search for in the UPMC Active Directory.
 * @return {Promise} A promise that will either resolve to a user (if user is found), 
 * resolve to false (if user is not found), or reject with an error.
 */
module.exports.findUser = (id) =>
    new Promise((resolve, reject) => {
        activeDirectoryUPMC.findUser(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });

/**
 * For the specified username, retrieve all of the groups that a user belongs to in the UPMC Active Directory
 * If a retrieved group is a member of another group, then that group is recursively retrieved as well 
 * to build a complete hierarchy of groups that a user belongs to.
 * @param {string} id The name of the user to retrieve group membership for in the UPMC Active Directory. Can be a sAMAccountName, userPrincipalName, or a distinguishedName (dn).
 * @return {Promise} A promise that will either resolve to an array of groups (if user is found and belongs to 1 or more groups), 
 * resolve to false (if user is not found or belongs to no groups), or reject with an error.
 */
module.exports.getGroupMembershipForUser = (id) =>
    new Promise((resolve, reject) => {
        activeDirectoryUPMC.getGroupMembershipForUser(id, (error, groups) => {
            if (error) {
                reject(error);
            } else {
                resolve(groups);
            }
        });
    });

/**
* Queries UPMC Active Directory for a subset of groups starting with the specified string.
* @param {String} startsWith the string used to select Groups whose name includes or is starts with this value
* @return {Promise} A promise that resolves to an array of Active Directory Groups or rejects with an error.
*/
module.exports.getGroups = (startsWith) =>
    new Promise((resolve, reject) => {
        //specify optional params for ldap query
        let opts = {
            filter: "CN=" + startsWith + "*",
            //specify which attributes to be returned from the AD server
            attributes: ['objectGUID', 'cn'],
            sizeLimit: 20,
            timeLimit: 2,
            //use parseGUID() to parse the results of the ldap object(s)
            entryParser: (entry, raw, callback) => {
                // parse and overwrite each raw GUID with the format matching xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                entry.objectGUID = parseGUID(raw.objectGUID);
                callback(entry);
            }
        }
        activeDirectoryUPMC.findGroups(opts, (err, groups) => {
            // reject if ldap query failed
            if (err) {
                reject(err);
            } else {
                resolve(groups || []);
            }
        });
    });