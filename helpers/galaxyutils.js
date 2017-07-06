'use strict';

const Permission = require('../models/permission');

/**
 * Collapses multiple arrays of Permission into a single array. 
 * Permissions will be distinguised by their code.
 * Whenever a duplicate permission is found,
 * it will overwrite the previous permission only if the current permission's value is true.
 * @param {Permission[][]} permissionSets An array of Permission arrays.
 * @return {Permission[]}
 */
module.exports.collapsePermissions = (permissionSets) => {
    let permissions = {};
    for (let permissionSet of permissionSets) {
        for (let permission of permissionSet) {
            // insert permission if it does not exist yet OR overwrite permission if new permission is true
            if (!permissions[permission.type.id] || permission.hasPermission) {
                permissions[permission.type.id] = permission;
            }
        }
    }
    //convert permissions from map to an array
    return Object.keys(permissions).map(key => permissions[key]);
}

/**
 * Collapses multiple arrays of Component Tag Permission into a single array. 
 * Component Tag Permissions will be distinguised by their Tag's id.
 * Whenever a duplicate Component Tag Permission is found,
 * it will collapse the previous Component Tag Permission's Permissions 
 * with the current Component Tag Permission's Permissions using collapsePermissions().
 * @param {ComponentTagPermission[][]} componentTagPermissionSets An array of ComponentTagPermission arrays.
 * @return {ComponentTagPermission[]}
 */
module.exports.collapseComponentTagPermissions = (componentTagPermissionSets) => {
    let componentTagPermissions = {};
    for (let componentTagPermissionSet of componentTagPermissionSets) {
        for (let componentTagPermission of componentTagPermissionSet) {
            let tagId = componentTagPermission.tag.id;
            if (componentTagPermissions[tagId]) {
                // collapse the tags's permissions
                let permissionSets = [componentTagPermissions[tagId].permissions, componentTagPermission.permissions];
                let permissions = module.exports.collapsePermissions(permissionSets);
                componentTagPermissions[tagId].permissions = permissions;
            } else {
                // insert component tag permissions if it does not exist yet 
                componentTagPermissions[tagId] = componentTagPermission;
            }
        }
    }
    //convert itemPermissions from map to an array
    componentTagPermissions = Object.keys(componentTagPermissions).map(key => componentTagPermissions[key]);
    return componentTagPermissions;
}

/**
 * Merges an array of Permissions with an array of all possible Permission Types.
 * When a Permission Type is not found in the Permissions,
 * a new Permission will be appended with an id of null, a type of the new Permission Type, and a hasPermission value of false.
 * @param {Permission[]} permissions An array of Permissions.
 * @param {PermissionType[]} componentTagPermissions An array of PermissionTypes.
 * @return {ComponentTagPermission[]}
 */
module.exports.mergePermissionsWithPermissionTypes = (permissions, permissionTypes) => {
    let mergedPermissions = {};
    for (let permission of permissions) {
        mergedPermissions[permission.type.id] = permission;
    }
    for (let permissionType of permissionTypes) {
        // if permission type doesnt exist yet, then add a new permission defaulted to false
        if (!mergedPermissions[permissionType.id]) {
            mergedPermissions[permissionType.id] = new Permission(null, permissionType, false);
        }
    }
    //convert mergedPermissions from map to an array
    return Object.keys(mergedPermissions).map(key => mergedPermissions[key]);
}

/**
 * Merges an array of Component Tag Permissions with an array of all possible Permission Types.
 * When a Permission Type is not found in a Component Tag Permission's Permissions,
 * a new Permission will be appended with an id of null, a type of the new Permission Type, and a hasPermission value of false.
 * @param {ComponentTagPermission[]} componentTagPermissions An array of ComponentTagPermissions.
 * @param {PermissionType[]} componentTagPermissions An array of PermissionTypes.
 * @return {ComponentTagPermission[]}
 */
module.exports.mergeComponentTagPermissionsWithPermissionTypes = (componentTagPermissions, permissionTypes) => {
    for (let componentTagPermission of componentTagPermissions) {
        componentTagPermission.permissions =
            module.exports.mergePermissionsWithPermissionTypes(componentTagPermission.permissions, permissionTypes);
    }
    return componentTagPermissions;
}

/**
 * Executes the given Promises synchronously. 
 * It is important to note that the parameter is an array of Promise Factories (a function that returns a promise), not an array of Promises.
 * Per the promise spec, as soon as a promise is created, it begins executing. 
 * Since a Promise Factory is a function that returns a Promise it will not create the Promise until it's actually invoked.
 * @param {function[]} tasks An array of Promise Factories (a function that returns a promise)
 * @return {Promise}
 */
module.exports.synchronous = (tasks) => {
    let sequence = Promise.resolve();
    tasks.forEach(task => {
        sequence = sequence.then(() => task())
    });
    return sequence;
}