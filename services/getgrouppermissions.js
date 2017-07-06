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
const PermissionTypes = require('../models/enums/permissiontypes.json');

module.exports = (request, response, next) => {
    let groupId = request.params.groupId;
    if (!_.isUuid(groupId)) {
        let error = new Error('"' + groupId + '" is an invalid uuid.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => db.CoMIT.Group.getById(pool, groupId))
            .then(group => {
                let data = {
                    id: groupId,
                    name: group.name,
                    componentTagPermissions: [],
                    systemPermissions: [],
                    isAdmin: group.isAdmin,
                    isNew: _.isNil(group.id)
                };
                // return if 
                // Group is administrative, OR
                // Group does not exist in database, OR
                // Group does not have System Permissions AND Component Tag Permissions
                if (data.isAdmin || data.isNew ||
                    (_.isEmpty(group.systemPermissions) && _.isEmpty(group.componentTagPermissions))) {
                    return data;
                } else {
                    return db.connect()
                        .then(pool => db.PermissionType.getBySystemName(pool, 'comit'))
                        .then(permissionTypes => {
                            let systemPermissionTypes = [];
                            let componentTagPermissionTypes = [];

                            for (let permissionType of permissionTypes) {
                                if (permissionType.type === PermissionTypes.SYSTEM) {
                                    systemPermissionTypes.push(permissionType);
                                } else if (permissionType.type === PermissionTypes.COMPONENT) {
                                    componentTagPermissionTypes.push(permissionType);
                                }
                            }

                            if (!_.isEmpty(group.systemPermissions)) {
                                data.systemPermissions =
                                    utils.mergePermissionsWithPermissionTypes(group.systemPermissions, systemPermissionTypes);
                            }
                            if (!_.isEmpty(group.componentTagPermissions)) {
                                data.componentTagPermissions =
                                    utils.mergeComponentTagPermissionsWithPermissionTypes(group.componentTagPermissions, componentTagPermissionTypes);
                            }
                            return data;
                        });
                }
            })
            .then(data => response.status(200).json(new GalaxyReturn(data, null)))
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching Group permissions.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}