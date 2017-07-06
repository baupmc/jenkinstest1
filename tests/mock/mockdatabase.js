'use strict';

// SQL Server configuration
const config = require('../../config/config');
const sql = require('mssql');
const uuid = require('uuid');

module.exports.connectToReal = () => sql.connect(config.sql);
module.exports.connect = () => sql.connect(config.sqlTest);

module.exports.close = () => sql.close();

module.exports.create = (mock) =>
    new Promise((resolve, reject) => {
        let promises = [];
        Promise.all(promises)
            .then(() => {
                promises = [];
                if (mock.CoMIT_Group) {
                    for (let i = 0; i < mock.CoMIT_Group.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_Group[i].Id || uuid())
                            .input('Name', mock.CoMIT_Group[i].Name)
                            .input('IsSystemAdmin', mock.CoMIT_Group[i].IsSystemAdmin)
                            .query('INSERT INTO [CoMIT_Group] (Id, Name, IsSystemAdmin) VALUES (@Id, @Name, @IsSystemAdmin)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_ComponentType) {
                    for (let i = 0; i < mock.CoMIT_ComponentType.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_ComponentType[i].Id || uuid())
                            .input('Name', mock.CoMIT_ComponentType[i].Name)
                            .query('INSERT INTO [CoMIT_ComponentType] (Id, Name) VALUES (@Id, @Name)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_Category) {
                    for (let i = 0; i < mock.CoMIT_Category.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_Category[i].Id || uuid())
                            .input('Name', mock.CoMIT_Category[i].Name)
                            .query('INSERT INTO [CoMIT_Category] (Id, Name) VALUES (@Id, @Name)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.TagType) {
                    for (let i = 0; i < mock.TagType.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.TagType[i].Id || uuid())
                            .input('Name', mock.TagType[i].Name)
                            .input('SystemName', mock.TagType[i].SystemName)
                            .query('INSERT INTO [TagType] (Id, Name, SystemName) VALUES (@Id, @Name, @SystemName)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.Tag) {
                    for (let i = 0; i < mock.Tag.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.Tag[i].Id || uuid())
                            .input('Name', mock.Tag[i].Name)
                            .input('Description', mock.Tag[i].Description)
                            .input('TagTypeId', mock.Tag[i].TagTypeId)
                            .query('INSERT INTO [Tag] (Id, Name, Description, TagTypeId) VALUES (@Id, @Name, @Description, @TagTypeId)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_Component) {
                    for (let i = 0; i < mock.CoMIT_Component.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_Component[i].Id || uuid())
                            .input('Name', mock.CoMIT_Component[i].Name)
                            .input('Description', mock.CoMIT_Component[i].Description)
                            .input('ComponentTypeId', mock.CoMIT_Component[i].ComponentTypeId)
                            .input('CategoryId', mock.CoMIT_Component[i].CategoryId)
                            .query('INSERT INTO [CoMIT_Component] (Id, Name, Description, ComponentTypeId, CategoryId) VALUES (@Id, @Name, @Description, @ComponentTypeId, @CategoryId)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_Alert) {
                    for (let i = 0; i < mock.CoMIT_Alert.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_Alert[i].Id || uuid())
                            .input('ComponentId', mock.CoMIT_Alert[i].ComponentId)
                            .input('Type', mock.CoMIT_Alert[i].Type)
                            .input('Severity', mock.CoMIT_Alert[i].Severity)
                            .input('MessageThreshold', mock.CoMIT_Alert[i].MessageThreshold)
                            .input('RetryWaitTime', mock.CoMIT_Alert[i].RetryWaitTime)
                            .input('AlertSchedule', mock.CoMIT_Alert[i].AlertSchedule)
                            .input('Notify', mock.CoMIT_Alert[i].Notify)
                            .query(
                            'INSERT INTO [CoMIT_Alert] ' +
                            '(Id, ComponentId, Type, Severity, MessageThreshold, RetryWaitTime, AlertSchedule, Notify) ' +
                            'VALUES ' +
                            '(@Id, @ComponentId, @Type, @Severity, @MessageThreshold, @RetryWaitTime, @AlertSchedule, @Notify)'
                            ));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_ComponentHelp) {
                    for (let i = 0; i < mock.CoMIT_ComponentHelp.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_ComponentHelp[i].Id || uuid())
                            .input('ComponentId', mock.CoMIT_ComponentHelp[i].ComponentId)
                            .input('SupportGroup', mock.CoMIT_ComponentHelp[i].SupportGroup)
                            .input('ContactName', mock.CoMIT_ComponentHelp[i].ContactName)
                            .input('ContactPhone', mock.CoMIT_ComponentHelp[i].ContactPhone)
                            .input('ContactEmail', mock.CoMIT_ComponentHelp[i].ContactEmail)
                            .input('Description', mock.CoMIT_ComponentHelp[i].Description)
                            .input('ProbableInactivity', mock.CoMIT_ComponentHelp[i].ProbableInactivity)
                            .input('ResolutionNotes', mock.CoMIT_ComponentHelp[i].ResolutionNotes)
                            .input('AdditionalInfo', mock.CoMIT_ComponentHelp[i].AdditionalInfo)
                            .input('HelpSchedule', mock.CoMIT_ComponentHelp[i].HelpSchedule)
                            .query(
                            'INSERT INTO [CoMIT_ComponentHelp] ' +
                            '(Id, ComponentId, SupportGroup, ContactName, ContactPhone, ContactEmail, Description, ProbableInactivity, ResolutionNotes, AdditionalInfo, HelpSchedule) ' +
                            'VALUES ' +
                            '(@Id, @ComponentId, @SupportGroup, @ContactName, @ContactPhone, @ContactEmail, @Description, @ProbableInactivity, @ResolutionNotes, @AdditionalInfo, @HelpSchedule)'
                            ));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.PermissionType) {
                    for (let i = 0; i < mock.PermissionType.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.PermissionType[i].Id || uuid())
                            .input('Code', mock.PermissionType[i].Code)
                            .input('Name', mock.PermissionType[i].Name)
                            .input('SystemName', mock.PermissionType[i].SystemName)
                            .input('IsSystemPermission', mock.PermissionType[i].IsSystemPermission)
                            .query('INSERT INTO [PermissionType] (Id, Code, Name, SystemName, IsSystemPermission) VALUES (@Id, @Code, @Name, @SystemName, @IsSystemPermission)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.Permission) {
                    for (let i = 0; i < mock.Permission.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.Permission[i].Id || uuid())
                            .input('PermissionTypeId', mock.Permission[i].PermissionTypeId)
                            .input('Value', mock.Permission[i].Value)
                            .query('INSERT INTO [Permission] (Id, PermissionTypeId, [Value]) VALUES (@Id, @PermissionTypeId, @Value)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_GroupTagPermission) {
                    for (let i = 0; i < mock.CoMIT_GroupTagPermission.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_GroupTagPermission[i].Id || uuid())
                            .input('GroupId', mock.CoMIT_GroupTagPermission[i].GroupId)
                            .input('TagId', mock.CoMIT_GroupTagPermission[i].TagId)
                            .input('PermissionId', mock.CoMIT_GroupTagPermission[i].PermissionId)
                            .query('INSERT INTO [CoMIT_GroupTagPermission] (Id, GroupId, TagId, PermissionId) VALUES (@Id, @GroupId, @TagId, @PermissionId)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_GroupSystemPermission) {
                    for (let i = 0; i < mock.CoMIT_GroupSystemPermission.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_GroupSystemPermission[i].Id || uuid())
                            .input('GroupId', mock.CoMIT_GroupSystemPermission[i].GroupId)
                            .input('PermissionId', mock.CoMIT_GroupSystemPermission[i].PermissionId)
                            .query('INSERT INTO [CoMIT_GroupSystemPermission] (Id, GroupId, PermissionId) VALUES (@Id, @GroupId, @PermissionId)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_TagComponent) {
                    for (let i = 0; i < mock.CoMIT_TagComponent.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_TagComponent[i].Id || uuid())
                            .input('ComponentId', mock.CoMIT_TagComponent[i].ComponentId)
                            .input('TagId', mock.CoMIT_TagComponent[i].TagId)
                            .query('INSERT INTO [CoMIT_TagComponent] (Id, ComponentId, TagId) VALUES (@Id, @ComponentId, @TagId)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.FutureSplunk) {
                    for (let i = 0; i < mock.FutureSplunk.length; i++) {
                        promises.push(new sql.Request()
                            .input('SystemName', mock.FutureSplunk[i].SystemName)
                            .input('SystemTokenId', mock.FutureSplunk[i].SystemTokenId)
                            .input('UserName', mock.FutureSplunk[i].UserName)
                            .input('MessageType', mock.FutureSplunk[i].MessageType)
                            .input('IsFairWarning', mock.FutureSplunk[i].IsFairWarning)
                            .input('Message', mock.FutureSplunk[i].Message)
                            .input('MessageDate', mock.FutureSplunk[i].MessageDate)
                            .query(
                            'INSERT INTO [FutureSplunk] ' +
                            '(SystemName, SystemTokenId, UserName, MessageType, IsFairWarning, Message, MessageDate) ' +
                            'VALUES ' +
                            '(@SystemName, @SystemTokenId, @UserName, @MessageType, @IsFairWarning, @Message, @MessageDate)'
                            ));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.MARS_Group) {
                    for (let i = 0; i < mock.MARS_Group.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.MARS_Group[i].Id || uuid())
                            .input('Name', mock.MARS_Group[i].Name)
                            .query('INSERT INTO [MARS_Group] (Id, Name) VALUES (@Id, @Name)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => {
                promises = [];
                if (mock.CoMIT_MessageQuery) {
                    for (let i = 0; i < mock.CoMIT_MessageQuery.length; i++) {
                        promises.push(new sql.Request()
                            .input('Id', mock.CoMIT_MessageQuery[i].Id || uuid())
                            .input('UserId', mock.CoMIT_MessageQuery[i].UserId)
                            .input('Name', mock.CoMIT_MessageQuery[i].Name)
                            .input('QueryData', JSON.stringify(mock.CoMIT_MessageQuery[i].QueryData))
                            .query('INSERT INTO [CoMIT_MessageQuery] (Id, UserId, Name, QueryData) VALUES (@Id, @UserId, @Name, @QueryData)'));
                    }
                }
                return Promise.all(promises);
            })
            .then(() => resolve())
            .catch((error) => reject(error));
    });

module.exports.destroy = () =>
    new sql.Request()
        .query(
        'DELETE FROM [CoMIT_MessageQuery] ' +
        'DELETE FROM [CoMIT_TagComponent] ' +
        'DELETE FROM [CoMIT_Component] ' +
        'DELETE FROM [CoMIT_ComponentHelp] ' +
        'DELETE FROM [CoMIT_ComponentType] ' +
        'DELETE FROM [CoMIT_Alert] ' +
        'DELETE FROM [CoMIT_Category] ' +
        'DELETE FROM [CoMIT_GroupTagPermission] ' +
        'DELETE FROM [CoMIT_GroupSystemPermission] ' +
        'DELETE FROM [CoMIT_Group] ' +
        'DELETE FROM [Permission] ' +
        'DELETE FROM [PermissionType] ' +
        'DELETE FROM [Tag] ' +
        'DELETE FROM [TagType] ' +
        'DELETE FROM [FutureSplunk] ' +
        'DELETE FROM [MARS_Group] ' +
        'DBCC CHECKIDENT ([CoMIT_MessageQuery], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_TagComponent], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_Component], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_ComponentHelp], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_ComponentType], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_Alert], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_Category], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_GroupTagPermission], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_GroupSystemPermission], RESEED, 0)' +
        'DBCC CHECKIDENT ([CoMIT_Group], RESEED, 0)' +
        'DBCC CHECKIDENT ([Permission], RESEED, 0)' +
        'DBCC CHECKIDENT ([PermissionType], RESEED, 0)' +
        'DBCC CHECKIDENT ([Tag], RESEED, 0)' +
        'DBCC CHECKIDENT ([TagType], RESEED, 0)' +
        'DBCC CHECKIDENT ([FutureSplunk], RESEED, 0)' +
        'DBCC CHECKIDENT ([MARS_Group], RESEED, 0)'
        );