'use strict';

const db = require('./galaxydb');
const utils = require('./galaxyutils');

/**
 * Fetches both CoMIT System Permissions and CoMIT Component Tag Permissions for the given User. 
 * 
 * In the case where a User belongs to a Group that is marked as administrative in galaxyDB, 
 * user.isAdmin will be set to true and 
 * both user.systemPermissions and user.componentTagPermissions will be an empty array.
 * 
 * In the case where a User does not belong to a Group that is marked as administrative in galaxyDB,
 * user.isAdmin will be set to false,
 * user.systemPermissions will contain an array of System Permissions, and 
 * user.componentTagPermissions will contain an array of Component Tag Permissions.
 * 
 * @param {User} user The User to fetch permissions for, where user.groups contains a string array of UPMC AD Group (friendly) names
 * in which the User belongs to.
 * @return {Promise} A promise that will either resolve to a User (now with permissions), or reject with an error.
 */
const comit = (user) =>
    db.connect()
        .then(pool => {
            let promises = [];
            for (let group of user.groups) {
                promises.push(db.CoMIT.Group.getByName(pool, group));
            }
            return Promise.all(promises)
                .then(groups => {
                    let systemPermissionSets = [];
                    let componentTagPermissionSets = [];
                    for (let group of groups) {
                        if (group.isAdmin) {
                            //user is administrator, ignore permissions
                            user.isAdmin = true;
                            user.systemPermissions = [];
                            user.componentTagPermissions = [];
                            return user;
                        }
                        systemPermissionSets.push(group.systemPermissions);
                        componentTagPermissionSets.push(group.componentTagPermissions);
                    }
                    //user is not an administrator, merge all permissions
                    user.isAdmin = false;
                    user.systemPermissions = utils.collapsePermissions(systemPermissionSets);
                    user.componentTagPermissions = utils.collapseComponentTagPermissions(componentTagPermissionSets)
                    return user;
                });
        });

module.exports = (user, context) => {
    context = String(context).toLowerCase().trim();
    if (context === 'comit') {
        return comit(user);
    } else {
        return Promise.reject(new Error('The context: ' + String(context) + ' is invalid'));
    }
}
