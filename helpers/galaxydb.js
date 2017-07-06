'use strict';

// utilities
const _ = require('lodash');
_.mixin(require('lodash-uuid'));
const uuid = require('uuid');
const synchronous = require('../helpers/galaxyutils').synchronous;

// sql
const sql = require('mssql');
const config = require('../config/config');

// models
const Group = require('../models/group');
const Tag = require('../models/tag');
const TagTypes = require('../models/enums/tagtypes.json');
const Permission = require('../models/permission');
const PermissionType = require('../models/permissiontype');
const Category = require('../models/category');
const Component = require('../models/component');
const ComponentHelp = require('../models/componenthelp');
const ComponentTagPermission = require('../models/componenttagpermission');
const MessageQuery = require('../models/messagequery.js');
const Alert = require("../models/alert");

/**
 * Escapes the following symbols in the given wildcard string: % _ [
 * @param {string} stringToEscape The string to be escaped.
 * @param {string} escapeCharacter The character used to escape the symbols.
 * @return {string} The escaped string
 */
const escapeWildcard = (stringToEscape, escapeCharacter) => {
    let result = stringToEscape
        .replace('%', escapeCharacter + '%')
        .replace('_', escapeCharacter + '_')
        .replace('[', escapeCharacter + '[');
    return result;
};

const GalaxyDB = {
    connect: () => sql.connect(config.sql),
    CoMIT: {
        Alert: {
            /**
             * Queries the CoMIT_Alert table of galaxyDB for an Alert with an Id 
             * which is equal to or includes the value of the given Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} alertId The Id used to select an Alert whose Id is equal to this value
             * @return {Promise} A promise that will either resolve to an Alert, or reject with an error.
             */
            getById: function (connection, alertId) {
                return connection.request()
                    .input('alertId', alertId)
                    .query(
                    'SELECT [Id], [ComponentId], [Type], [Severity], [MessageThreshold], [RetryWaitTime], [AlertSchedule], [Notify] ' +
                    'FROM [CoMIT_Alert] ' +
                    'WHERE [Id] = @alertId'
                    )
                    .then(rows => {
                        let scheduleArray = JSON.parse(rows[0].AlertSchedule);
                        let result = new Alert(rows[0].Id, rows[0].ComponentId, rows[0].Type, rows[0].Severity, rows[0].MessageThreshold, rows[0].RetryWaitTime, scheduleArray, rows[0].Notify);
                        return result;
                    });
            },
            /**
             * Queries the CoMIT_Alert table of galaxyDB for a Alerts with a ComponentId 
             * which is equal to the value of the given ComponentId.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} componentId The Id used to select Alerts whose ComponentId is equal to this value
             * @return {Promise} A promise that will either resolve to an array of Alerts, or reject with an error.
             */
            getByComponentId: function (connection, componentId) {
                return connection.request()
                    .input('componentId', componentId)
                    .query(
                    'SELECT [Id], [ComponentId], [Type], [Severity], [MessageThreshold], [RetryWaitTime], [AlertSchedule], [Notify] ' +
                    'FROM [CoMIT_Alert] ' +
                    'WHERE [ComponentId] = @componentId'
                    )
                    .then(rows => {
                        var alertsArray = [];
                        for (let row of rows) {
                            let scheduleArray = JSON.parse(row.AlertSchedule);
                            alertsArray.push(new Alert(row.Id, row.ComponentId, row.Type, row.Severity, row.MessageThreshold, row.RetryWaitTime, scheduleArray, row.Notify));
                        }

                        return alertsArray;
                    });
            },
            /**
             * Deletes alerts based on a given ComponentId.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} componentId The Id used to select Alerts whose ComponentId is equal to this value
             * @return {Promise} A promise that will either resolve to an array of Alerts, or reject with an error.
             */
            deleteByComponentId: function (connection, componentId) {
                return connection.request()
                    .input('componentId', componentId)
                    .query(
                    'DELETE FROM [CoMIT_Alert] ' +
                    'WHERE [ComponentId] = @componentId'
                    )
            },
            /**
             * Inserts an alert into the CoMIT_Alert table of galaxyDB.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Alert} alert The alert to insert into the table.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            insert: function (connection, alert) {
                if (!_.isUuid(alert.id)) {
                    alert.id = uuid();
                }
                return connection.request()
                    .input('alertId', alert.id)
                    .input('componentId', alert.componentId)
                    .input('type', alert.type)
                    .input('severity', alert.severity)
                    .input('messageThreshold', alert.messageThreshold)
                    .input('retryWaitTime', alert.retryWaitTime)
                    .input('alertSchedule', JSON.stringify(alert.alertSchedule))
                    .input('notify', alert.notify)
                    .query(
                    'INSERT INTO [CoMIT_Alert] ' +
                    'VALUES (@alertId, @componentId, @type, @severity, @messageThreshold, @retryWaitTime, @alertSchedule, @notify) '
                    )
            },
            /**
             * Updates the CoMIT_Alert table of galaxyDB for an Alert with a Id 
             * which is equal to the value of the given Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Alert} alert The alert to update in the table.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            update: function (connection, alert) {
                return connection.request()
                    .input('alertId', alert.id)
                    .input('componentId', alert.componentId)
                    .input('type', alert.type)
                    .input('severity', alert.severity)
                    .input('messageThreshold', alert.messageThreshold)
                    .input('retryWaitTime', alert.retryWaitTime)
                    .input('alertSchedule', JSON.stringify(alert.alertSchedule))
                    .input('notify', alert.notify)
                    .query(
                    'UPDATE [CoMIT_Alert] ' +
                    'SET [ComponentId] = @componentId, [Type] = @type, [Severity] = @severity, [MessageThreshold] = @messageThreshold, [RetryWaitTime] = @retryWaitTime, [AlertSchedule] = @alertSchedule, [Notify] = @notify ' +
                    'WHERE [Id] = @alertId'
                    )
            }
        },
        Category: {
            /**
             * Queries the CoMIT_Category table of galaxyDB for a Category with a name 
             * which is equal to or includes the value of the given string,
             * eventually returning an array of Categories for typeahead search.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {string} contains the string used to select Categories whose name includes or is equal to this value
             * @return {Promise} A promise that will either resolve to an array of Categories, or reject with an error.
             */
            getByContains: function (connection, contains) {
                const escapeCharacter = '\\';
                contains = escapeWildcard(contains, escapeCharacter);
                return connection.request()
                    .input('category', '%' + contains + '%')
                    .input('escape', escapeCharacter)
                    .query(
                    'SELECT CoMIT_Category.Id, CoMIT_Category.Name ' +
                    'FROM [CoMIT_Category] ' +
                    'WHERE CoMIT_Category.Name LIKE @category ESCAPE @escape'
                    )
                    .then(rows => {
                        let categories = [];
                        for (let row of rows) {
                            categories.push(new Category(row.Id, row.Name));
                        }
                        return categories;
                    });
            },
            /**
             * Inserts an alert into the CoMIT_Category table of galaxyDB.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Category} category The category to insert into the table.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            set: function (connection, category) {
                if (!_.isUuid(category.id)) {
                    category.id = uuid();
                }
                return connection.request()
                    .input('id', category.id)
                    .input('name', category.name)
                    .query('INSERT INTO [CoMIT_Category] (Id, Name) VALUES (@id, @name)')
            },
            /**
             * Updates the CoMIT_Category table of galaxyDB for a Category with a Id 
             * which is equal to the value of the given Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Category} category The category to insert into the table.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            update: function (connection, category) {
                return connection.request()
                    .input('id', category.id)
                    .input('name', category.name)
                    .query(
                    'UPDATE [CoMIT_Category] ' +
                    'SET [Name] = @name ' +
                    'WHERE [Id] = @id'
                    )
            },
            /**
             * Queries the CoMIT_Category table of galaxyDB for a Category with an id 
             * which is equal to the given id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} id The ID of the category that is equal to this value
             * @return {Promise} A promise that will either resolve to an array of Categories, or reject with an error.
             */
            getById: function (connection, id) {
                return connection.request()
                    .input('id', id)
                    .query(
                    'SELECT CoMIT_Category.Id, CoMIT_Category.Name ' +
                    'FROM [CoMIT_Category] ' +
                    'WHERE CoMIT_Category.Id = @id'
                    )
                    .then(rows => {
                        return new Category(rows[0].Id, rows[0].Name);
                    });
            }
        },
        Component: {
            /**
             * Queries the CoMIT_Component table of galaxyDB for Components with a name 
             * which is equal to or includes the value of the given string.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {string} contains the string used to select Components whose name includes or is equal to this value
             * @return {Promise} A promise that will either resolve to an array of Components, or reject with an error.
             */
            getByContains: function (connection, contains) {
                const escapeCharacter = '\\';
                contains = escapeWildcard(contains, escapeCharacter);
                return connection.request()
                    .input('component', '%' + contains + '%')
                    .input('escape', escapeCharacter)
                    .query(
                    'SELECT Components.Id, Components.Name, Types.Name AS Type ' +
                    'FROM [CoMIT_Component] AS Components JOIN [CoMIT_ComponentType] AS Types ' +
                    'ON Components.ComponentTypeId=Types.Id ' +
                    'WHERE Components.Name LIKE @component ESCAPE @escape'
                    )
                    .then(rows => {
                        let components = [];
                        for (let row of rows) {
                            components.push(new Component(row.Id, row.Name, row.Type));
                        }
                        return components;
                    });
            },

            /**
             * Queries the CoMIT_Component table of galaxyDB for Components with an Id 
             * which is equal to or includes the value of the given Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} componentId the id used to select Components whose id is equal to this value
             * @return {Promise} A promise that will either resolve to an array containing component and help data, or reject with an error.
             */
            getSettingDataById: function (connection, componentId) {
                return connection.request()
                    .input('componentId', componentId)
                    .query(
                    'SELECT Components.Id, Components.Name, Components.CategoryId, ' +
                    'Components.ModDate, Components.AlertEmail, Components.AlertPhone, ' +
                    'Components.DisableNotify, Components.StageStatus, Components.AutoStart, ' +
                    'Types.Name AS Type, Categories.Name AS Category, ' +
                    'Help.SupportGroup, Help.ContactName, Help.ContactEmail, Help.ContactPhone, ' +
                    'Help.Description, Help.ProbableInactivity, Help.ResolutionNotes, ' +
                    'Help.AdditionalInfo, Help.HelpSchedule, Help.Id AS HelpId ' +
                    'FROM [CoMIT_Component] AS Components JOIN [CoMIT_ComponentType] AS Types ' +
                    'ON Components.ComponentTypeId=Types.Id LEFT JOIN [CoMIT_Category] AS Categories ' +
                    'ON Components.CategoryId = Categories.Id LEFT JOIN [CoMIT_ComponentHelp] AS Help ' +
                    'ON Components.Id = Help.ComponentId ' +
                    'WHERE Components.Id = @componentId'
                    )
                    .then(rows => {
                        let category = new Category(rows[0].CategoryId, rows[0].Category);
                        let component = new Component(rows[0].Id, rows[0].Name, rows[0].Type, [],
                            category, rows[0].ModDate, rows[0].AlertEmail,
                            rows[0].AlertPhone, rows[0].DisableNotify, rows[0].StageStatus,
                            rows[0].AutoStart);
                        let componentHelp = new ComponentHelp(rows[0].HelpId, rows[0].Id, rows[0].SupportGroup, rows[0].ContactName,
                            rows[0].ContactPhone, rows[0].ContactEmail, rows[0].Description,
                            rows[0].ProbableInactivity, rows[0].ResolutionNotes,
                            rows[0].AdditionalInfo, JSON.parse(rows[0].HelpSchedule));
                        return [component, componentHelp];
                    });
            },

            /**
             * Executes the uspComitGetComponentsByTagId stored procedure of galaxyDB,
             * which fetches all Components linked to the given Tag Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} tagId the uuid of the Tag to fetch Components for.
             * @return {Promise} A promise that will either resolve to an array of Components, or reject with an error.
             */
            getByTagId: function (connection, tagId) {
                return connection.request()
                    .input('tagId', tagId)
                    .execute('[uspComitGetComponentsByTagId]')
                    .then(result => {
                        let components = [];
                        let rows = result[0];
                        if (rows) {
                            for (let row of rows) {
                                components.push(new Component(row.Id, row.Name, row.Type));
                            }
                        }
                        return components;
                    });
            },

            /**
             * Updates the CoMIT_Component table of galaxyDB for Components with an Id 
             * which is equal to or includes the value of the given Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} componentSettings the full component settings data object from the client.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            update: function (connection, componentSettings) {
                return connection.request()
                    .input('componentId', componentSettings.id)
                    .input('categoryId', componentSettings.category.id)
                    .input('modDate', new Date())
                    .input('alertEmail', componentSettings.alerts.alertEmail)
                    .input('alertPhone', componentSettings.alerts.alertPhone)
                    .input('disableNotify', componentSettings.main.disableNotify)
                    .input('stageStatus', componentSettings.main.stageStatus)
                    .input('autoStart', componentSettings.main.autoStart)
                    .query(
                    'UPDATE [CoMIT_Component] ' +
                    'SET [CategoryId] = @categoryId, ' +
                    '[ModDate] = @modDate, ' +
                    '[AlertEmail] = @alertEmail, ' +
                    '[AlertPhone] = @alertPhone, ' +
                    '[DisableNotify] = @disableNotify, ' +
                    '[StageStatus] = @stageStatus, ' +
                    '[AutoStart] = @autoStart ' +
                    'WHERE [Id] = @componentId'
                    )
            },
        },
        ComponentHelp: {
            /**
             * Queries the CoMIT_ComponentHelp table of galaxyDB for a Component Help object with a ComponentId 
             * which is equal to the value of the given ComponentId.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} componentId The Id used to select a Component Help object whose ComponentId is equal to this value
             * @return {Promise} A promise that will either resolve to a Component Help object, or reject with an error.
             */
            getByComponentId: function (connection, componentId) {
                return connection.request()
                    .input('componentId', componentId)
                    .query(
                    'SELECT [Id], [ComponentId], [SupportGroup], [ContactName], [ContactPhone], [ContactEmail], ' +
                    '[Description], [ProbableInactivity], [ResolutionNotes], [AdditionalInfo], [HelpSchedule]' +
                    'FROM [CoMIT_ComponentHelp] ' +
                    'WHERE [ComponentId] = @componentId'
                    )
                    .then(rows => {
                        let help = rows[0];
                        if (help) {
                            return new ComponentHelp(help.Id, help.ComponentId, help.SupportGroup,
                                help.ContactName, help.ContactPhone, help.ContactEmail,
                                help.Description, help.ProbableInactivity, help.ResolutionNotes, help.AdditionalInfo,
                                help.HelpSchedule);
                        } else {
                            return new ComponentHelp();
                        }
                    });
            },
            /**
             * Inserts a Component Help object into the CoMIT_ComponentHelp table of galaxyDB.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {ComponentHelp} help The Component Help object to insert into the table.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            set: function (connection, help) {
                if (!_.isUuid(help.id)) {
                    help.id = uuid();
                }
                return connection.request()
                    .input('id', help.id)
                    .input('componentId', help.componentId)
                    .input('supportGroup', help.supportGroup)
                    .input('contactName', help.contactName)
                    .input('contactPhone', help.contactPhone)
                    .input('contactEmail', help.contactEmail)
                    .input('description', help.description)
                    .input('probableInactivity', help.probableInactivity)
                    .input('resolutionNotes', help.resolutionNotes)
                    .input('additionalInfo', help.additionalInfo)
                    .input('helpSchedule', JSON.stringify(help.helpSchedule))
                    .query(
                    'INSERT INTO [CoMIT_ComponentHelp] ' +
                    'VALUES (@id, @componentId, @supportGroup, @contactName, @contactPhone, @contactEmail, ' +
                    '@description, @probableInactivity, @resolutionNotes, @additionalInfo, @helpSchedule)'
                    )
            },
            /**
             * Updates the CoMIT_ComponentHelp table of galaxyDB for a Component Help object with a Id 
             * which is equal to the value of the given Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {ComponentHelp} help The Component Help object to update in the table.
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            update: function (connection, help) {
                return connection.request()
                    .input('id', help.id)
                    .input('componentId', help.componentId)
                    .input('supportGroup', help.supportGroup)
                    .input('contactName', help.contactName)
                    .input('contactPhone', help.contactPhone)
                    .input('contactEmail', help.contactEmail)
                    .input('description', help.description)
                    .input('probableInactivity', help.probableInactivity)
                    .input('resolutionNotes', help.resolutionNotes)
                    .input('additionalInfo', help.additionalInfo)
                    .input('helpSchedule', JSON.stringify(help.helpSchedule))
                    .query(
                    'UPDATE [CoMIT_ComponentHelp] ' +
                    'SET [ComponentId] = @componentId, ' +
                    '[SupportGroup] = @supportGroup, ' +
                    '[ContactName] = @contactName, ' +
                    '[ContactPhone] = @contactPhone, ' +
                    '[ContactEmail] = @contactEmail, ' +
                    '[Description] = @description, ' +
                    '[ProbableInactivity] = @probableInactivity, ' +
                    '[ResolutionNotes] = @resolutionNotes, ' +
                    '[AdditionalInfo] = @additionalInfo, ' +
                    '[HelpSchedule] = @helpSchedule ' +
                    'WHERE [Id] = @id'
                    )
            },
            /**
             * Deletes a record in CoMIT_ComponentHelp based on an id input.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {UUID} id The Id used to select a Component Help object whose Id is equal to this value
             * @return {Promise} A promise that will either resolve cleanly, or reject with an error.
             */
            delete: function (connection, id) {
                return connection.request()
                    .input('id', id)
                    .query(
                    'DELETE FROM [CoMIT_ComponentHelp] ' +
                    'WHERE [Id] = @id'
                    )
            },
        },
        ComponentTag: {
            /**
             * Queries the Tag table of galaxyDB for a Tag with a name 
             * which is equal to or includes the value of the given string, then 
             * queries a joined Component & TagComponent table for the components 
             * that tag holds, eventually returning an array of tags with all 
             * component tag information for typeahead search.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {string} contains the string used to select Tags whose name includes or is equal to this value
             * @return {Promise} A promise that will either resolve to an array of Tags, or reject with an error.
             */
            getByContains: function (connection, contains) {
                return GalaxyDB.Tag.getByContains(connection, contains)
                    .then(tags => {
                        let promises = [];
                        for (let tag of tags) {
                            promises.push(GalaxyDB.CoMIT.Component.getByTagId(connection, tag.id));
                        }
                        return Promise.all(promises)
                            .then(components => {
                                for (let i = 0; i < tags.length; i++) {
                                    tags[i].components = components[i];
                                }
                                return tags;
                            })
                    })

            },
            /**
             * Inserts a record into the CoMIT_TagComponent table of the database, linking a Tag to a Component.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} tagId the uuid of the Tag in the Tag Component relation.
             * @param {uuid} componentId the uuid of the Component in the Tag Component relation.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            set: function (connection, tagId, componentId) {
                return connection.request()
                    .input('tagId', tagId)
                    .input('componentId', componentId)
                    .query('INSERT INTO [CoMIT_TagComponent] (TagId, ComponentId) VALUES (@tagId, @componentId)');
            },

            /**
             * The given Tag will be upserted (inserted or updated) into the database.
             * Next there will be a delete of all links in the CoMIT_TagComponent table belonging to the given Tag.
             * Once all of the links are deleted, a record will be inserted into the CoMIT_TagComponent table 
             * linking the Component Tag to each of new Components.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Tag} tag the Tag to be inserted or updated in the database
             * @return {Promise} A promise that will either resolve to the inserted Tag, or reject with an error.
            */
            update: function (connection, tag) {
                return Promise.resolve()
                    .then(() => {
                        // always set the Tag's type to "Component"
                        tag.type = TagTypes.COMPONENT;

                        // if the Tag does not exist, then simply generate its uuid 
                        if (!_.isUuid(tag.id)) {
                            tag.id = uuid();
                        }

                        // fetch the "Component" TagType, the TagTypeId will be needed for Insert/Update
                        return GalaxyDB.TagType.getByName(connection, tag.type);
                    })
                    .then(tagType => GalaxyDB.Tag.update(connection, tag, tagType.id))
                    .then(() => GalaxyDB.CoMIT.ComponentTag.deleteByTagId(connection, tag.id))
                    .then(() => {
                        let promises = [];
                        let components = tag.components || [];
                        // synchronously insert a CoMIT_TagComponent record for each of the Tag's Components 
                        for (let component of components) {
                            let request = () => GalaxyDB.CoMIT.ComponentTag.set(connection, tag.id, component.id)
                            promises.push(request);
                        }
                        return synchronous(promises);
                    })
                    .then(() => tag);
            },

            /**
             * The given Tag will be upserted (inserted or updated) into the database.
             * Delete given component happens all at once, before this function is called,
             * see updatecomponentsettings.js for more details and an example.
             * A single record is inserted into the CoMIT_TagComponent table for the given 
             * tag and component id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Tag} tag the Tag to be inserted or updated in the database
             * @param {UUID} componentId the component Id the tag will be inserted on
             * @return {Promise} A promise that will either resolve to the inserted Tag, or reject with an error.
            */
            updateSingleComponent: function (connection, tag, componentId) {
                return Promise.resolve()
                    .then(() => {
                        // always set the Tag's type to "Component"
                        tag.type = TagTypes.COMPONENT;

                        // if the Tag does not exist, then simply generate its uuid 
                        if (!_.isUuid(tag.id)) {
                            tag.id = uuid();
                        }

                        // fetch the "Component" TagType, the TagTypeId will be needed for Insert/Update
                        return GalaxyDB.TagType.getByName(connection, tag.type);
                    })
                    .then(tagType => GalaxyDB.Tag.update(connection, tag, tagType.id))
                    .then(() => GalaxyDB.CoMIT.ComponentTag.set(connection, tag.id, componentId))
                    .then(() => tag);
            },

            /**
             * Deletes record(s) from the CoMIT_TagComponent table of the database, with a TagId equal to the given uuid.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} tagId the uuid of the Tag to delete from the Tag Component relation table.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            deleteByTagId: function (connection, tagId) {
                return connection.request()
                    .input('tagId', tagId)
                    .query('DELETE FROM [CoMIT_TagComponent] WHERE [TagId] = @tagId');
            },

            /**
             * Deletes record(s) from the CoMIT_TagComponent table of the database, with a Component Id equal to the given uuid.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} tagId the uuid of the Component to delete from the Tag Component relation table.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            deleteByComponentId: function (connection, componentId) {
                return connection.request()
                    .input('componentId', componentId)
                    .query('DELETE FROM [CoMIT_TagComponent] WHERE [ComponentId] = @componentId');
            },
        },
        ComponentTagPermission: {
            /**
             * Executes the uspComitGetTagPermissions stored procedure of galaxyDB,
             * which fetches all Tag Permissions linked to the given Group Id and Tag Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId the uuid of the Group linked to the given Tag.
             * @param {uuid} tagId the uuid of the Tag to fetch Permissions for.
             * @return {Promise} A promise that will either resolve to an array of Permissions, or reject with an error.
             */
            getByGroupIdAndTagId: function (connection, groupId, tagId) {
                return connection.request()
                    .input('groupId', groupId)
                    .input('tagId', tagId)
                    .execute('[uspComitGetTagPermissions]')
                    .then(result => {
                        let permissions = [];
                        let rows = result[0];
                        if (rows) {
                            for (let row of rows) {
                                let type = new PermissionType(row.PermissionTypeId, row.Name, row.Code, row.IsItemType)
                                permissions.push(new Permission(row.Id, type, row.Value));
                            }
                        }
                        return permissions;
                    });
            },
            /**
             * First it executes the uspComitGetTagsByGroupId stored procedure of galaxyDB, 
             * to get all of the Tags belonging the given Group Id.
             * Then for each tag it executes the uspComitGetTagPermissions stored procedure of galaxyDB, 
             * to get all Component Tag Permissions belonging the given Tag Id which are assoicated to the given Group Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId The Group Id used as input to the stored procedure calls;
             * @return {Promise} A promise that will either resolve to an array of Componet Tag Permissions, or reject with an error.
             */
            getByGroupId: function (connection, groupId) {
                return GalaxyDB.CoMIT.Tag.getByGroupId(connection, groupId)
                    .then(tags => {
                        let promises = [];
                        for (let tag of tags) {
                            promises.push(GalaxyDB.CoMIT.ComponentTagPermission.getByGroupIdAndTagId(connection, groupId, tag.id));
                        }
                        return Promise.all(promises)
                            .then(tagPermissions => {
                                let componentTagPermissions = [];
                                for (let i = 0; i < tags.length; i++) {
                                    componentTagPermissions.push(new ComponentTagPermission(tags[i], tagPermissions[i]));
                                }
                                return componentTagPermissions;
                            })
                    })
            },
            /**
             * Executes the uspComitSetTagPermission stored procedure of galaxyDB,
             * which inserts a record into Permission to create a new permission
             * and inserts another record into CoMIT_GroupTagPermission to link the Group and Tag to the new Permission.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId the uuid of the Group to link to the Permission.
             * @param {uuid} tagId the uuid of the Tag to link to the Permission.
             * @param {uuid} permissionTypeId the uuid of the Permission Type of the Permission.
             * @param {uuid} hasPermission the boolean value of the Permission.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            set: function (connection, groupId, tagId, permission) {
                // generate uuid for the Permission
                permission.id = uuid();
                return connection.request()
                    .input('groupId', groupId)
                    .input('tagId', tagId)
                    .input('permissionId', permission.id)
                    .input('permissionTypeId', permission.type.id)
                    .input('value', permission.hasPermission)
                    .execute('[uspComitSetTagPermission]')
                    .then(() => permission);
            }
        },
        Group: {
            /**
             * Queries the CoMIT_Group table of galaxyDB for a Group with an id equal to the value of the given uuid.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId the uuid of the Group to select.
             * @return {Promise} A promise that will either resolve to a Group, or reject with an error.
             */
            getById: function (connection, groupId) {
                return connection.request()
                    .input('groupId', groupId)
                    .query(
                    'SELECT * FROM [CoMIT_Group] ' +
                    'WHERE [Id] = @groupId'
                    )
                    .then(rows => {
                        let group = rows[0];
                        if (group) {
                            return new Group(group.Id, group.Name, group.IsSystemAdmin);
                        } else {
                            return new Group();
                        }
                    })
                    .then(group => {
                        // skip permissions if group is adminstrative or group doesnt exist in db
                        if (group.IsAdmin || !group.id) {
                            return group;
                        } else {
                            let promises = [
                                GalaxyDB.CoMIT.SystemPermission.getByGroupId(connection, group.id),
                                GalaxyDB.CoMIT.ComponentTagPermission.getByGroupId(connection, group.id)
                            ];
                            return Promise.all(promises)
                                .then(results => {
                                    group.systemPermissions = results[0];
                                    group.componentTagPermissions = results[1];
                                    return group;
                                });
                        }
                    });
            },

            /**
             * Queries the CoMIT_Group table of galaxyDB for a Group with a name equal to the value of the given string.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {string} groupName the name of the Group to select.
             * @return {Promise} A promise that will either resolve to a Group, or reject with an error.
             */
            getByName: function (connection, groupName) {
                return connection.request()
                    .input('groupName', groupName)
                    .query(
                    'SELECT * FROM [CoMIT_Group] ' +
                    'WHERE [Name] = @groupName'
                    )
                    .then(rows => {
                        let group = rows[0];
                        if (group) {
                            return new Group(group.Id, group.Name, group.IsSystemAdmin);
                        } else {
                            return new Group();
                        }
                    })
                    .then(group => {
                        // skip permissions if group is adminstrative or group doesnt exist in db
                        if (group.IsAdmin || !group.id) {
                            return group;
                        } else {
                            let promises = [
                                GalaxyDB.CoMIT.SystemPermission.getByGroupId(connection, group.id),
                                GalaxyDB.CoMIT.ComponentTagPermission.getByGroupId(connection, group.id)
                            ];
                            return Promise.all(promises)
                                .then(results => {
                                    group.systemPermissions = results[0];
                                    group.componentTagPermissions = results[1];
                                    return group;
                                });
                        }
                    });
            },

            /**
             * Inserts a record into the CoMIT_Group table of galaxyDB using the given Group object.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Group} group the object of the Group to insert.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            set: function (connection, group) {
                return connection.request()
                    .input('id', group.id)
                    .input('name', group.name)
                    .input('isSystemAdmin', group.isAdmin)
                    .query(
                    'INSERT INTO [CoMIT_Group] ' +
                    '(Id, Name, IsSystemAdmin)' +
                    'VALUES' +
                    '(@id, @name, @isSystemAdmin)'
                    )
            },

            /**
             * Deletes a record from the CoMIT_Group table of galaxyDB for a Group
             * with an id equal to the value of the given uuid.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId the uuid of the Group to delete.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            deleteById: function (connection, groupId) {
                return connection.request()
                    .input('groupId', groupId)
                    .query(
                    'DELETE FROM [CoMIT_Group] ' +
                    'WHERE [Id] = @groupId'
                    )
            }
        },
        MessageQuery: {
            /**
             * Queries the CoMIT_MessageQuery table for all saved queries that match the user's ID.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {String} userId User's ID from ADAL, passed in from the client.
             * @return {Promise} A promise that will either resolve to an array of MessageQuery, or reject with an error.
             */
            getByUserId: function (connection, userId) {
                return connection.request()
                    .input('userId', userId)
                    .query(
                    'SELECT [Id], [Name], [UserId], [QueryData] ' +
                    'FROM [CoMIT_MessageQuery] ' +
                    'WHERE [UserId] = @userId'
                    )
                    .then(rows => {
                        let queries = [];
                        for (let row of rows) {
                            queries.push(new MessageQuery(row.Id, row.Name, row.UserId, JSON.parse(row.QueryData)));
                        }
                        return queries;
                    });
            },

            /**
             * Inserts the given MessageQuery object into the database.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Object} messageQuery MessageQuery object handed to GalaxyAPI from the client.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            set: function (connection, messageQuery) {
                return connection.request()
                    .input('userId', messageQuery.userId)
                    .input('name', messageQuery.name)
                    .input('queryData', JSON.stringify(messageQuery.queryData))
                    .query(
                    'INSERT INTO [CoMIT_MessageQuery]([UserId], [Name], [QueryData]) ' +
                    'VALUES (@userId,@name,@queryData)'
                    )
            },

            /**
             * Inserts the given MessageQuery object into the database.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {Object} messageQuery MessageQuery object handed to GalaxyAPI from the client.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            updateById: function (connection, messageQuery) {
                return connection.request()
                    .input('id', messageQuery.id)
                    .input('name', messageQuery.name)
                    .input('queryData', JSON.stringify(messageQuery.queryData))
                    .query(
                    'UPDATE [CoMIT_MessageQuery] ' +
                    'SET [Name] = @name, [QueryData] = @queryData ' +
                    'WHERE [Id] = @id'
                    )

            },

            /**
             * Deletes the MessageQuery from the database matching the given id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {String} id MessageQuery object's id received from client.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            deleteById: function (connection, id) {
                return connection.request()
                    .input('id', id)
                    .query(
                    'DELETE FROM [CoMIT_MessageQuery] ' +
                    'WHERE [Id] = @id'
                    )

            },
        },
        Tag: {
            /**
             * Executes the uspComitGetTagsByGroupId stored procedure of galaxyDB,
             * which fetches all Tags linked to the given Group Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId the uuid of the Group to fetch Tags for.
             * @return {Promise} A promise that will either resolve to an array of Tags, or reject with an error.
             */
            getByGroupId: function (connection, groupId) {
                return connection.request()
                    .input('groupId', groupId)
                    .execute('[uspComitGetTagsByGroupId]')
                    .then(result => {
                        let tags = [];
                        let rows = result[0];
                        if (rows) {
                            for (let row of rows) {
                                tags.push(new Tag(row.Id, row.Name, row.Type));
                            }
                        }
                        return tags;
                    })
                    .then(tags => {
                        let promises = [];
                        for (let tag of tags) {
                            promises.push(GalaxyDB.CoMIT.Component.getByTagId(connection, tag.id));
                        }
                        return Promise.all(promises)
                            .then(components => {
                                for (let i = 0; i < tags.length; i++) {
                                    tags[i].components = components[i];
                                }
                                return tags;
                            })
                    });
            },

            /**
             * Executes the uspComitGetTagsByComponentId stored procedure of galaxyDB,
             * which fetches all Tags linked to the given Component Id.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} componentId the uuid of the Component to fetch Tags for.
             * @return {Promise} A promise that will either resolve to an array of Tags, or reject with an error.
             */
            getByComponentId: function (connection, componentId) {
                return connection.request()
                    .input('componentId', componentId)
                    .execute('[uspComitGetTagsByComponentId]')
                    .then(result => {
                        let tags = [];
                        let rows = result[0];
                        if (rows) {
                            for (let row of rows) {
                                tags.push(new Tag(row.Id, row.TagName, row.TagType));
                            }
                        }
                        return tags;
                    })
                    .then(tags => {
                        let promises = [];
                        for (let tag of tags) {
                            promises.push(GalaxyDB.CoMIT.Component.getByTagId(connection, tag.id));
                        }
                        return Promise.all(promises)
                            .then(components => {
                                for (let i = 0; i < tags.length; i++) {
                                    tags[i].components = components[i];
                                }
                                return tags;
                            })
                    });
            }
        },
        SystemPermission: {
            /**
            * Executes the uspComitGetSystemPermissionsByGroupId stored procedure of galaxyDB,
            * which fetches all System Permissions belonging to the given Group Id.
            * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
            * or an open transaction with the database.
            * @param {uuid} groupId the uuid of the Group to fetch System Permissions for.
            * @return {Promise} A promise that will either resolve to an array of System Permissions, or reject with an error.
            */
            getByGroupId: function (connection, groupId) {
                return connection.request()
                    .input('groupId', groupId)
                    .execute('[uspComitGetSystemPermissionsByGroupId]')
                    .then(result => {
                        let permissions = [];
                        let rows = result[0];
                        if (rows) {
                            for (let row of rows) {
                                let type = new PermissionType(row.PermissionTypeId, row.Name, row.Code, row.IsSystemPermission)
                                permissions.push(new Permission(row.Id, type, row.Value));
                            }
                        }
                        return permissions;
                    })
            },
            /**
             * Executes the uspComitSetSystemPermission stored procedure of galaxyDB,
             * which inserts a record into Permission to create a new permission
             * and inserts another record into CoMIT_GroupSystemPermission to link the Group to the new Permission.
             * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
             * or an open transaction with the database.
             * @param {uuid} groupId the uuid of the Group to link to the Permission.
             * @param {uuid} permissionTypeId the uuid of the Permission Type of the Permission.
             * @param {uuid} hasPermission the boolean value of the Permission.
             * @return {Promise} A promise that will either resolve, or reject with an error.
             */
            set: function (connection, groupId, permission) {
                // generate uuid for the Permission
                permission.id = uuid();
                return connection.request()
                    .input('groupId', groupId)
                    .input('permissionId', permission.id)
                    .input('permissionTypeId', permission.type.id)
                    .input('value', permission.hasPermission)
                    .execute('[uspComitSetSystemPermission]')
                    .then(() => permission);
            }
        }
    },
    Tag: {
        /**
         * Queries the Tag table of galaxyDB for a Tag with a name 
         * which is equal to or includes the value of the given string.
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {string} contains the string used to select Tags whose name includes or is equal to this value
         * @return {Promise} A promise that will either resolve to an array of Tags, or reject with an error.
         */
        getByContains: function (connection, contains) {
            const escapeCharacter = '\\';
            contains = escapeWildcard(contains, escapeCharacter);
            return connection.request()
                .input('tag', '%' + contains + '%')
                .input('escape', escapeCharacter)
                .query(
                'SELECT Tag.Id, Tag.Name, TagType.Name AS Type ' +
                'FROM Tag JOIN TagType ' +
                'ON Tag.TagTypeId = TagType.Id ' +
                'WHERE Tag.Name LIKE @tag ESCAPE @escape'
                )
                .then(rows => {
                    let tags = [];
                    for (let row of rows) {
                        tags.push(new Tag(row.Id, row.Name, row.Type));
                    }
                    return tags;
                });
        },

        /**
         * Inserts a record into the Tag table of galaxyDB using the given Tag object and TagTypeId.
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {Tag} tag the object of the Tag to insert.
         * @param {uuid} tagTypeId the uuid of the Tag Type.
         * @return {Promise} A promise that will either resolve, or reject with an error.
         */
        set: function (connection, tag, tagTypeId) {
            return connection.request()
                .input('id', tag.id)
                .input('name', tag.name)
                .input('tagTypeId', tagTypeId)
                .query('INSERT INTO Tag (Id, Name, TagTypeId) VALUES (@id, @name, @tagTypeId)');
        },

        /**
         * Deletes a record from the Tag table of galaxyDB for a Tag
         * with an id equal to the value of the given uuid.
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {uuid} groupId the uuid of the Tag to delete.
         * @return {Promise} A promise that will either resolve, or reject with an error.
         */
        deleteById: function (connection, id) {
            return connection.request()
                .input('id', id)
                .query('DELETE FROM Tag WHERE Id = @id');
        },

        /**
         * Executes the uspInsertOrUpdateTag stored procedure of galaxyDB,
         * which will either insert the Tag if it does not exist or update the Tag if it exists.
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {Tag} tag the object of the Tag to insert or update
         * @param {uuid} tagTypeId the uuid of the Tag Type.
         * @return {Promise} A promise that will either resolve to an array of Tags, or reject with an error.
         */
        update: function (connection, tag, tagTypeId) {
            return connection.request()
                .input('tagId', tag.id)
                .input('tagName', tag.name)
                .input('tagTypeId', tagTypeId)
                .execute('[uspInsertOrUpdateTag]')
                .then(() => tag)
        }
    },
    TagType: {
        /**
         * Queries the TagType table of galaxyDB for a Tag Type which matches the given name.
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {string} name the name of the Tag Type to select.
         * @return {Promise} A promise that will either resolve to a Tag Type, or reject with an error.
         */
        getByName: function (connection, name) {
            return connection.request()
                .input('name', name)
                .query('SELECT Id, Name, SystemName FROM TagType WHERE Name = @name')
                .then(rows => {
                    let tagType = {
                        id: '',
                        name: '',
                        systemName: ''
                    };
                    if (rows[0]) {
                        tagType.id = rows[0].Id;
                        tagType.name = rows[0].Name;
                        tagType.systemName = rows[0].SystemName;
                    }
                    return tagType;
                });
        }
    },
    PermissionType: {
        /**
         * Queries the PermissionType table of galaxyDB for Permission Types with the given System Name.
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {string} systemName the System Name of the Permission Types to select.
         * @return {Promise} A promise that will either resolve to an array of Permission Types, or reject with an error.
         */
        getBySystemName: function (connection, systemName) {
            return connection.request()
                .input('systemName', systemName)
                .query('SELECT * FROM [PermissionType] WHERE SystemName = @systemName')
                .then(rows => {
                    let permissionTypes = [];
                    rows.forEach(row => {
                        permissionTypes.push(new PermissionType(row.Id, row.Name, row.Code, row.IsSystemPermission));
                    });
                    return permissionTypes;
                });
        },
    },
    LoggingMessage: {
        /**
         * Writes LogMessage to the database using Stored Procedure
         * @param {(ConnectionPool|Transaction)} connection either a connection pool to the database, 
         * or an open transaction with the database.
         * @param {string} systemName the System Name of the Permission Types to select.
         * @param {string} systemName friendly name of consuming system
         * @param {string} systemToken Splunk token or other GUID that represents the consuming system
         * @param {string} userName username of the logged event
         * @param {string} logType basic types for logging, INFO, DEBUG, ERROR, TRACE, etc
         * @param {bit} isFairWarning boolean flag if this is a log for FairWarning (true)
         * @param {string} message message to log
         * @return {boolean} status from SProc
         */
        insertLog: function (connection, systemName, systemToken, userName, logType, isFairWarning, message, messageDate) {
            return connection.request()
                .input('systemname', systemName)
                .input('systemtoken', systemToken)
                .input('username', userName)
                .input('messagetype', logType)
                .input('isfairwarning', sql.Bit, isFairWarning)     // cast to MSSQL bit
                .input('message', sql.Text, message)                // cast string to MSSQL text
                .input('messagedate', messageDate)    // cast node date to MSSQL datetime
                .execute('[uspInsertIntoFutureSplunk]')
                .then(() => true)
        }
    }
}

module.exports = GalaxyDB;