'use strict';

const uuid = require('uuid');

// import models
const Group = require('../../models/group');
const Tag = require('../../models/tag');
const Permission = require('../../models/permission');
const PermissionType = require('../../models/permissiontype');
const Component = require('../../models/component');
const ComponentTagPermission = require('../../models/componenttagpermission');
const GalaxyReturn = require('../../models/galaxyreturn');
const GalaxyError = require('../../models/galaxyerror');

// mock data and database
const mockDb = require('../mock/mockdatabase');
const mockData = require('./mock.json');
const config = require('../../config/config');

// unit test framework
const chai = require('chai');
const sinon = require('sinon');
const should = require('chai').should();
chai.use(require('sinon-chai'));

const UpdateGroupPermissions = require('../../services/updategrouppermissions');

describe('UpdateGroupPermissions', function () {

    // create mock data and force test database 
    before(() =>
        mockDb.connect()
            .then(() => mockDb.destroy())
            .then(() => mockDb.create(mockData))
            .then(() => mockDb.close())
            .then(() => config.sql = config.sqlTest)
    );

    // destroy mock data
    after(() =>
        mockDb.connect()
            .then(() => mockDb.destroy())
            .then(() => mockDb.close())
    );

    describe('Rollbacks', function () {
        describe('Rollback due to invalid Group', function () {
            it('should return 500 and rollback transaction if request fails', () => {
                const groupId = mockData.CoMIT_Group[1].Id;
                const isAdmin = true;
                const systemPermissions = [];
                const componentTagPermissions = [];
                const group = new Group(groupId, null, isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not be administrative
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(1);
                                    should.exist(rows[0].IsSystemAdmin);
                                    rows[0].IsSystemAdmin.should.equal(false);
                                })
                        })
                    );
            });
        });
        describe('Rollback due to invalid System Permission', function () {
            it('should return 500 and rollback transaction if first request fails', () => {
                const fail = 0;
                const groupId = uuid();
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let permissionType;
                    if (i == fail) {
                        permissionType = new PermissionType();
                    } else {
                        permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    }
                    systemPermissions.push(new Permission('', permissionType, true));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetSystemPermissionsByGroupId]')
                                        .then(result => {
                                            // System Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
            it('should return 500 and rollback transaction if middle request fails', () => {
                const fail = 1;
                const groupId = uuid();
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let permissionType;
                    if (i == fail) {
                        permissionType = new PermissionType();
                    } else {
                        permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    }
                    systemPermissions.push(new Permission('', permissionType, true));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetSystemPermissionsByGroupId]')
                                        .then(result => {
                                            // System Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
            it('should return 500 and rollback transaction if last request fails', () => {
                const fail = mockData.PermissionType.length - 1;
                const groupId = uuid();
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let permissionType;
                    if (i == fail) {
                        permissionType = new PermissionType();
                    } else {
                        permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    }
                    systemPermissions.push(new Permission('', permissionType, true));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetSystemPermissionsByGroupId]')
                                        .then(result => {
                                            // System Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
        });
        describe('Rollback due to invalid Tag', function () {
            it('should return 500 and rollback transaction if first request fails', () => {
                const fail = 0;
                const groupId = uuid();
                const tagId = mockData.Tag[0].Id;
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let tag;
                    if (i == fail) {
                        tag = new Tag();
                    } else {
                        tag = new Tag(tagId);
                    }
                    let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    let permissions = [new Permission('', permissionType, true)];
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('tagId', tagId)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // Tag Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
            it('should return 500 and rollback transaction if middle request fails', () => {
                const fail = 1;
                const groupId = uuid();
                const tagId = mockData.Tag[0].Id;
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let tag;
                    if (i == fail) {
                        tag = new Tag();
                    } else {
                        tag = new Tag(tagId);
                    }
                    let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    let permissions = [new Permission('', permissionType, true)];
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('tagId', tagId)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // Tag Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
            it('should return 500 and rollback transaction if last request fails', () => {
                const fail = mockData.PermissionType.length - 1;
                const groupId = uuid();
                const tagId = mockData.Tag[0].Id;
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let tag;
                    if (i == fail) {
                        tag = new Tag();
                    } else {
                        tag = new Tag(tagId);
                    }
                    let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    let permissions = [new Permission('', permissionType, true)];
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('tagId', tagId)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // Tag Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
        });
        describe('Rollback due to invalid Component Tag Permission', function () {
            it('should return 500 and rollback transaction if first request fails', () => {
                const fail = 0;
                const groupId = uuid();
                const tagId = mockData.Tag[0].Id;
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let permissionType;
                    if (i == fail) {
                        permissionType = new PermissionType();
                    } else {
                        permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    }
                    let tag = new Tag(tagId);
                    let permissions = [new Permission('', permissionType, true)];
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('tagId', tagId)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // Tag Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
            it('should return 500 and rollback transaction if middle request fails', () => {
                const fail = 1;
                const groupId = uuid();
                const tagId = mockData.Tag[0].Id;
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let permissionType;
                    if (i == fail) {
                        permissionType = new PermissionType();
                    } else {
                        permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    }
                    let tag = new Tag(tagId);
                    let permissions = [new Permission('', permissionType, true)];
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('tagId', tagId)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // Tag Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
            it('should return 500 and rollback transaction if last request fails', () => {
                const fail = mockData.PermissionType.length - 1;
                const groupId = uuid();
                const tagId = mockData.Tag[0].Id;
                const isAdmin = false;
                const systemPermissions = [];
                const componentTagPermissions = [];
                for (let i = 0; i < mockData.PermissionType.length; i++) {
                    let permissionType;
                    if (i == fail) {
                        permissionType = new PermissionType();
                    } else {
                        permissionType = new PermissionType(mockData.PermissionType[i].Id);
                    }
                    let tag = new Tag(tagId);
                    let permissions = [new Permission('', permissionType, true)];
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                }
                const group = new Group(groupId, 'GRP1', isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => mockDb.connect()
                        .then(pool => {
                            // status should be 500
                            response.status.should.have.been.calledWith(500);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.not.exist(data);
                            should.exist(error);

                            // error should be a GalaxyError
                            error.should.be.an.instanceOf(GalaxyError);
                            should.exist(error.friendlyMsg);
                            error.friendlyMsg.should.be.a('string');
                            should.exist(error.description);
                            error.description.should.be.a('string');

                            return pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should not exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                })
                                .then(() =>
                                    pool.request()
                                        .input('tagId', tagId)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // Tag Permissions should not exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        }))
                        })
                    );
            })
        });
    });
    describe('Valid Parameters', function () {
        describe('Administrative Group', function () {
            it('should return 200 and update group if it already exists in the database', () => {
                const groupId = mockData.CoMIT_Group[4].Id;
                const groupName = mockData.CoMIT_Group[4].Name;
                const isAdmin = true;
                const systemPermissions = [];
                const componentTagPermissions = [];
                const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 200
                        response.status.should.have.been.calledWith(200);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should exist and GalaxyReturn.error should not exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.exist(data);
                        should.not.exist(error);

                        // Group.id should be a string
                        data.id.should.be.a('string');

                        // Group.name should be a string
                        data.name.should.be.a('string');

                        // Group.isAdmin should be a boolean equal to true
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.be.true;

                        // Group.systemPermissions should be an empty array
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.length.should.be.equal(0);

                        // Group.componentTagPermissions should be an empty array
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.length.should.be.equal(0);
                    })
                    .then(() => mockDb.connect())
                    .then(pool =>
                        pool.request()
                            .input('id', groupId)
                            .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                            .then(rows => {
                                // Group should exist in database and be set to administrative
                                rows.should.be.an('array');
                                rows.length.should.be.equal(1);
                                rows[0].Name.should.be.eql(groupName);
                                rows[0].IsSystemAdmin.should.be.eql(true);
                                rows[0].Id.toLowerCase().should.be.eql(groupId.toLowerCase());
                            })
                            .then(() =>
                                pool.request()
                                    .input('groupId', groupId)
                                    .execute('[uspComitGetSystemPermissionsByGroupId]')
                                    .then(result => {
                                        // No System Permissions should exist in the database for the Group
                                        let rows = result[0];
                                        rows.should.be.an('array');
                                        rows.length.should.be.equal(0);
                                    }))
                            .then(() => {
                                let promises = [];
                                for (let tag of mockData.Tag) {
                                    let request = pool.request()
                                        .input('tagId', tag.Id)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // No Component Tag Permissions should exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        });
                                    promises.push(request);
                                }
                                return Promise.all(promises);
                            })
                    );
            });
            it('should return 200 and insert group (with uuid) if it does not exist in the database', () => {
                const groupId = uuid();
                const groupName = 'NEWGROUP';
                const isAdmin = true;
                const systemPermissions = [];
                const componentTagPermissions = [];
                const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 200
                        response.status.should.have.been.calledWith(200);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should exist and GalaxyReturn.error should not exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.exist(data);
                        should.not.exist(error);

                        // Group.id should be a string
                        data.id.should.be.a('string');

                        // Group.name should be a string
                        data.name.should.be.a('string');

                        // Group.isAdmin should be a boolean equal to true
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.be.true;

                        // Group.systemPermissions should be an empty array
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.length.should.be.equal(0);

                        // Group.componentTagPermissions should be an empty array
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.length.should.be.equal(0);
                    })
                    .then(() => mockDb.connect())
                    .then(pool =>
                        pool.request()
                            .input('id', groupId)
                            .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                            .then(rows => {
                                // Group should exist in database and be set to administrative
                                rows.should.be.an('array');
                                rows.length.should.be.equal(1);
                                rows[0].Name.should.be.eql(groupName);
                                rows[0].IsSystemAdmin.should.be.eql(true);
                                rows[0].Id.toLowerCase().should.be.eql(groupId.toLowerCase());
                            })
                            .then(() =>
                                pool.request()
                                    .input('groupId', groupId)
                                    .execute('[uspComitGetSystemPermissionsByGroupId]')
                                    .then(result => {
                                        // No System Permissions should exist in the database for the Group
                                        let rows = result[0];
                                        rows.should.be.an('array');
                                        rows.length.should.be.equal(0);
                                    }))
                            .then(() => {
                                let promises = [];
                                for (let tag of mockData.Tag) {
                                    let request = pool.request()
                                        .input('tagId', tag.Id)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // No Component Tag Permissions should exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        });
                                    promises.push(request);
                                }
                                return Promise.all(promises);
                            })
                    );
            });
            it('should return 200 and insert group if it does not exist in the database', () => {
                let groupId = '';
                const groupName = 'NEWGROUP2';
                const isAdmin = true;
                const systemPermissions = [];
                const componentTagPermissions = [];
                const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 200
                        response.status.should.have.been.calledWith(200);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should exist and GalaxyReturn.error should not exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.exist(data);
                        should.not.exist(error);

                        // Group.id should be a string
                        data.id.should.be.a('string');

                        // Group.name should be a string
                        data.name.should.be.a('string');

                        // Group.isAdmin should be a boolean equal to true
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.be.true;

                        // Group.systemPermissions should be an empty array
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.length.should.be.equal(0);

                        // Group.componentTagPermissions should be an empty array
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.length.should.be.equal(0);
                    })
                    .then(() => mockDb.connect())
                    .then(pool =>
                        pool.request()
                            .input('name', groupName)
                            .query('SELECT * FROM CoMIT_Group WHERE Name = @name;')
                            .then(rows => {
                                // Group should exist in database and be set to administrative
                                rows.should.be.an('array');
                                rows.length.should.be.equal(1);
                                rows[0].Name.should.be.eql(groupName);
                                rows[0].IsSystemAdmin.should.be.eql(true);
                                // store the Group's Id for upcoming Requests
                                groupId = rows[0].Id;
                            })
                            .then(() =>
                                pool.request()
                                    .input('groupId', groupId)
                                    .execute('[uspComitGetSystemPermissionsByGroupId]')
                                    .then(result => {
                                        // No System Permissions should exist in the database for the Group
                                        let rows = result[0];
                                        rows.should.be.an('array');
                                        rows.length.should.be.equal(0);
                                    }))
                            .then(() => {
                                let promises = [];
                                for (let tag of mockData.Tag) {
                                    let request = pool.request()
                                        .input('tagId', tag.Id)
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetTagPermissions]')
                                        .then(result => {
                                            // No Component Tag Permissions should exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(0);
                                        });
                                    promises.push(request);
                                }
                                return Promise.all(promises);
                            })
                    );
            });
        });
        describe('Non-Administrative Group', function () {
            describe('Group', function () {
                it('should return 200 and update group if it already exists in the database', () => {
                    const groupId = mockData.CoMIT_Group[4].Id;
                    const groupName = mockData.CoMIT_Group[4].Name;
                    const tagId = mockData.Tag[0].Id;
                    const tagName = mockData.Tag[0].Name;
                    const tag = new Tag(tagId, tagName);
                    const isAdmin = false;
                    const systemPermissions = [];
                    for (let i = 0; i < 2; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        systemPermissions.push(new Permission(null, permissionType, true));
                    }
                    const permissions = [];
                    const componentTagPermissions = [];
                    for (let i = 2; i < 4; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        permissions.push(new Permission(null, permissionType, true));
                    }
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                    const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                    const request = {
                        body: group
                    };

                    let updateGroupPermissions = new Promise((resolve, reject) => {
                        let response = {};
                        response.json = sinon.stub().callsFake((d) => resolve(response));
                        response.status = sinon.stub().callsFake((n) => response);
                        UpdateGroupPermissions(request, response);
                    });

                    return updateGroupPermissions
                        .then(response => {
                            // status should be 200
                            response.status.should.have.been.calledWith(200);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should exist and GalaxyReturn.error should not exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.exist(data);
                            should.not.exist(error);

                            // Group.id should be a string
                            data.id.should.be.a('string');

                            // Group.name should be a string
                            data.name.should.be.a('string');

                            // Group.isAdmin should be a boolean equal to false
                            data.isAdmin.should.be.a('boolean');
                            data.isAdmin.should.be.false;

                            // Group.systemPermissions should be an array of length 2
                            should.exist(data.systemPermissions);
                            data.systemPermissions.should.be.an('array');
                            data.systemPermissions.length.should.be.equal(2);
                            for (let systemPermission of data.systemPermissions) {
                                systemPermission.id.should.be.a('string');
                                systemPermission.hasPermission.should.be.true;
                            }

                            // Group.componentTagPermissions should be an array of length 1
                            should.exist(data.componentTagPermissions);
                            data.componentTagPermissions.should.be.an('array');
                            data.componentTagPermissions.length.should.be.equal(1);
                            for (let componentTagPermission of data.componentTagPermissions) {
                                componentTagPermission.tag.id.should.be.a('string');
                                componentTagPermission.tag.name.should.be.a('string');
                                componentTagPermission.tag.type.should.be.a('string');
                                componentTagPermission.tag.components.should.be.an('array');
                                componentTagPermission.permissions.should.be.an('array');
                                componentTagPermission.permissions.length.should.be.equal(2);
                                for (let permission of componentTagPermission.permissions) {
                                    permission.id.should.be.a('string');
                                    permission.hasPermission.should.be.true;
                                }
                            }
                        })
                        .then(() => mockDb.connect())
                        .then(pool =>
                            pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    // Group should exist in database and not be administrative
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(1);
                                    rows[0].Name.should.be.eql(groupName);
                                    rows[0].IsSystemAdmin.should.be.eql(false);
                                    rows[0].Id.toLowerCase().should.be.eql(groupId.toLowerCase());
                                })
                                .then(() =>
                                    pool.request()
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetSystemPermissionsByGroupId]')
                                        .then(result => {
                                            // System Permissions should exist in the database for the Group
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(2);
                                            for (let i = 0; i < rows.length; i++) {
                                                rows[i].Value.should.equal(true);
                                                rows[i].IsSystemPermission.should.equal(true);
                                                rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i].Id.toLowerCase());
                                            }
                                        }))
                                .then(() => {
                                    let promises = [];
                                    for (let tag of mockData.Tag) {
                                        let request = pool.request()
                                            .input('tagId', tag.Id)
                                            .input('groupId', groupId)
                                            .execute('[uspComitGetTagPermissions]')
                                            .then(result => {
                                                // Component Tag Permissions should exist in the database for the Group
                                                let rows = result[0];
                                                if (tag.Id === tagId) {
                                                    rows.should.be.an('array');
                                                    rows.length.should.be.equal(2);
                                                    for (let i = 0; i < rows.length; i++) {
                                                        rows[i].Value.should.equal(true);
                                                        rows[i].IsSystemPermission.should.equal(false);
                                                        rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i + 2].Id.toLowerCase());
                                                    }
                                                } else {
                                                    rows.should.be.an('array');
                                                    rows.length.should.be.equal(0);
                                                }
                                            });
                                        promises.push(request);
                                    }
                                    return Promise.all(promises);
                                })
                        );
                });
                it('should return 200 and insert group (with uuid) if it does not exist in the database', () => {
                    const groupId = uuid();
                    const groupName = 'NEWGROUP3';
                    const tagId = mockData.Tag[0].Id;
                    const tagName = mockData.Tag[0].Name;
                    const tag = new Tag(tagId, tagName);
                    const isAdmin = false;
                    const systemPermissions = [];
                    for (let i = 0; i < 2; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        systemPermissions.push(new Permission(null, permissionType, true));
                    }
                    const permissions = [];
                    const componentTagPermissions = [];
                    for (let i = 2; i < 4; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        permissions.push(new Permission(null, permissionType, true));
                    }
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                    const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                    const request = {
                        body: group
                    };

                    let updateGroupPermissions = new Promise((resolve, reject) => {
                        let response = {};
                        response.json = sinon.stub().callsFake((d) => resolve(response));
                        response.status = sinon.stub().callsFake((n) => response);
                        UpdateGroupPermissions(request, response);
                    });

                    return updateGroupPermissions
                        .then(response => {
                            // status should be 200
                            response.status.should.have.been.calledWith(200);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should exist and GalaxyReturn.error should not exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.exist(data);
                            should.not.exist(error);

                            // Group.id should be a string
                            data.id.should.be.a('string');

                            // Group.name should be a string
                            data.name.should.be.a('string');

                            // Group.isAdmin should be a boolean equal to true
                            data.isAdmin.should.be.a('boolean');
                            data.isAdmin.should.be.false;

                            // Group.systemPermissions should be an array of length 2
                            should.exist(data.systemPermissions);
                            data.systemPermissions.should.be.an('array');
                            data.systemPermissions.length.should.be.equal(2);
                            for (let systemPermission of data.systemPermissions) {
                                systemPermission.id.should.be.a('string');
                                systemPermission.hasPermission.should.be.true;
                            }

                            // Group.componentTagPermissions should be an array of length 1
                            should.exist(data.componentTagPermissions);
                            data.componentTagPermissions.should.be.an('array');
                            data.componentTagPermissions.length.should.be.equal(1);
                            for (let componentTagPermission of data.componentTagPermissions) {
                                componentTagPermission.tag.id.should.be.a('string');
                                componentTagPermission.tag.name.should.be.a('string');
                                componentTagPermission.tag.type.should.be.a('string');
                                componentTagPermission.tag.components.should.be.an('array');
                                componentTagPermission.permissions.should.be.an('array');
                                componentTagPermission.permissions.length.should.be.equal(2);
                                for (let permission of componentTagPermission.permissions) {
                                    permission.id.should.be.a('string');
                                    permission.hasPermission.should.be.true;
                                }
                            }
                        })
                        .then(() => mockDb.connect())
                        .then(pool =>
                            pool.request()
                                .input('id', groupId)
                                .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(1);
                                    rows[0].Name.should.be.eql(groupName);
                                    rows[0].IsSystemAdmin.should.be.eql(false);
                                    rows[0].Id.toLowerCase().should.be.eql(groupId.toLowerCase());
                                })
                                .then(() =>
                                    pool.request()
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetSystemPermissionsByGroupId]')
                                        .then(result => {
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(2);
                                            for (let i = 0; i < rows.length; i++) {
                                                rows[i].Value.should.equal(true);
                                                rows[i].IsSystemPermission.should.equal(true);
                                                rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i].Id.toLowerCase());
                                            }
                                        }))
                                .then(() => {
                                    let promises = [];
                                    for (let tag of mockData.Tag) {
                                        let request = pool.request()
                                            .input('tagId', tag.Id)
                                            .input('groupId', groupId)
                                            .execute('[uspComitGetTagPermissions]')
                                            .then(result => {
                                                let rows = result[0];
                                                if (tag.Id === tagId) {
                                                    rows.should.be.an('array');
                                                    rows.length.should.be.equal(2);
                                                    for (let i = 0; i < rows.length; i++) {
                                                        rows[i].Value.should.equal(true);
                                                        rows[i].IsSystemPermission.should.equal(false);
                                                        rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i + 2].Id.toLowerCase());
                                                    }
                                                } else {
                                                    rows.should.be.an('array');
                                                    rows.length.should.be.equal(0);
                                                }
                                            });
                                        promises.push(request);
                                    }
                                    return Promise.all(promises);
                                })
                        );
                });
                it('should return 200 and insert group if it does not exist in the database', () => {
                    let groupId = '';
                    const groupName = 'NEWGROUP4';
                    const tagId = mockData.Tag[0].Id;
                    const tagName = mockData.Tag[0].Name;
                    const tag = new Tag(tagId, tagName);
                    const isAdmin = false;
                    const systemPermissions = [];
                    for (let i = 0; i < 2; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        systemPermissions.push(new Permission(null, permissionType, true));
                    }
                    const permissions = [];
                    const componentTagPermissions = [];
                    for (let i = 2; i < 4; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        permissions.push(new Permission(null, permissionType, true));
                    }
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                    const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                    const request = {
                        body: group
                    };

                    let updateGroupPermissions = new Promise((resolve, reject) => {
                        let response = {};
                        response.json = sinon.stub().callsFake((d) => resolve(response));
                        response.status = sinon.stub().callsFake((n) => response);
                        UpdateGroupPermissions(request, response);
                    });

                    return updateGroupPermissions
                        .then(response => {
                            // status should be 200
                            response.status.should.have.been.calledWith(200);

                            // response should be a GalaxyReturn
                            response.json.should.have.been.calledOnce;
                            let calledWith = response.json.firstCall.args[0];
                            calledWith.should.be.an.instanceOf(GalaxyReturn);

                            // GalaxyReturn.data should exist and GalaxyReturn.error should not exist
                            let data = calledWith.data;
                            let error = calledWith.error;
                            should.exist(data);
                            should.not.exist(error);

                            // Group.id should be a string
                            data.id.should.be.a('string');

                            // Group.name should be a string
                            data.name.should.be.a('string');

                            // Group.isAdmin should be a boolean equal to true
                            data.isAdmin.should.be.a('boolean');
                            data.isAdmin.should.be.false;

                            // Group.systemPermissions should be an array of length 2
                            should.exist(data.systemPermissions);
                            data.systemPermissions.should.be.an('array');
                            data.systemPermissions.length.should.be.equal(2);
                            for (let systemPermission of data.systemPermissions) {
                                systemPermission.id.should.be.a('string');
                                systemPermission.hasPermission.should.be.true;
                            }

                            // Group.componentTagPermissions should be an array of length 1
                            should.exist(data.componentTagPermissions);
                            data.componentTagPermissions.should.be.an('array');
                            data.componentTagPermissions.length.should.be.equal(1);
                            for (let componentTagPermission of data.componentTagPermissions) {
                                componentTagPermission.tag.id.should.be.a('string');
                                componentTagPermission.tag.name.should.be.a('string');
                                componentTagPermission.tag.type.should.be.a('string');
                                componentTagPermission.tag.components.should.be.an('array');
                                componentTagPermission.permissions.should.be.an('array');
                                componentTagPermission.permissions.length.should.be.equal(2);
                                for (let permission of componentTagPermission.permissions) {
                                    permission.id.should.be.a('string');
                                    permission.hasPermission.should.be.true;
                                }
                            }
                        })
                        .then(() => mockDb.connect())
                        .then(pool =>
                            pool.request()
                                .input('name', groupName)
                                .query('SELECT * FROM CoMIT_Group WHERE Name = @name;')
                                .then(rows => {
                                    // Group should exist in database and be set to administrative
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(1);
                                    rows[0].Name.should.be.eql(groupName);
                                    rows[0].IsSystemAdmin.should.be.eql(false);
                                    // store the Group's Id for upcoming Requests
                                    groupId = rows[0].Id;
                                })
                                .then(() =>
                                    pool.request()
                                        .input('groupId', groupId)
                                        .execute('[uspComitGetSystemPermissionsByGroupId]')
                                        .then(result => {
                                            let rows = result[0];
                                            rows.should.be.an('array');
                                            rows.length.should.be.equal(2);
                                            for (let i = 0; i < rows.length; i++) {
                                                rows[i].Value.should.equal(true);
                                                rows[i].IsSystemPermission.should.equal(true);
                                                rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i].Id.toLowerCase());
                                            }
                                        }))
                                .then(() => {
                                    let promises = [];
                                    for (let tag of mockData.Tag) {
                                        let request = pool.request()
                                            .input('tagId', tag.Id)
                                            .input('groupId', groupId)
                                            .execute('[uspComitGetTagPermissions]')
                                            .then(result => {
                                                let rows = result[0];
                                                if (tag.Id === tagId) {
                                                    rows.should.be.an('array');
                                                    rows.length.should.be.equal(2);
                                                    for (let i = 0; i < rows.length; i++) {
                                                        rows[i].Value.should.equal(true);
                                                        rows[i].IsSystemPermission.should.equal(false);
                                                        rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i + 2].Id.toLowerCase());
                                                    }
                                                } else {
                                                    rows.should.be.an('array');
                                                    rows.length.should.be.equal(0);
                                                }
                                            });
                                        promises.push(request);
                                    }
                                    return Promise.all(promises);
                                })
                        );
                });
            });
            describe('Tag', function () {
                it('should return 200 and update group with a tag that doesnt exist in the database', () => {
                    const groupId = mockData.CoMIT_Group[4].Id;
                    const groupName = mockData.CoMIT_Group[4].Name;
                    const tagName = 'NEWTAG1';
                    const tag = new Tag(null, tagName);
                    const isAdmin = false;
                    const systemPermissions = [];
                    for (let i = 0; i < 2; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        systemPermissions.push(new Permission(null, permissionType, true));
                    }
                    const permissions = [];
                    const componentTagPermissions = [];
                    for (let i = 2; i < 4; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        permissions.push(new Permission(null, permissionType, true));
                    }
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                    const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                    const request = {
                        body: group
                    };

                    let updateGroupPermissions = new Promise((resolve, reject) => {
                        let response = {};
                        response.json = sinon.stub().callsFake((d) => resolve(response));
                        response.status = sinon.stub().callsFake((n) => response);
                        UpdateGroupPermissions(request, response);
                    });

                    return updateGroupPermissions
                        .then(response => mockDb.connect()
                            .then(pool =>
                                pool.request()
                                    .input('id', groupId)
                                    .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                    .then(rows => {
                                        rows.should.be.an('array');
                                        rows.length.should.be.equal(1);
                                        rows[0].Name.should.be.eql(groupName);
                                        rows[0].IsSystemAdmin.should.be.eql(false);
                                        rows[0].Id.toLowerCase().should.be.eql(groupId.toLowerCase());
                                    })
                                    .then(() =>
                                        pool.request()
                                            .input('groupId', groupId)
                                            .execute('[uspComitGetSystemPermissionsByGroupId]')
                                            .then(result => {
                                                let rows = result[0];
                                                rows.should.be.an('array');
                                                rows.length.should.be.equal(2);
                                                for (let i = 0; i < rows.length; i++) {
                                                    rows[i].Value.should.equal(true);
                                                    rows[i].IsSystemPermission.should.equal(true);
                                                    rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i].Id.toLowerCase());
                                                }
                                            }))
                                    .then(() => {
                                        let promises = [];
                                        for (let tag of mockData.Tag) {
                                            let request = pool.request()
                                                .input('tagId', tag.Id)
                                                .input('groupId', groupId)
                                                .execute('[uspComitGetTagPermissions]')
                                                .then(result => {
                                                    let rows = result[0];
                                                    if (tag.Name === tagName) {
                                                        rows.should.be.an('array');
                                                        rows.length.should.be.equal(2);
                                                        for (let i = 0; i < rows.length; i++) {
                                                            rows[i].Value.should.equal(true);
                                                            rows[i].IsSystemPermission.should.equal(false);
                                                            rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i + 2].Id.toLowerCase());
                                                        }
                                                    } else {
                                                        rows.should.be.an('array');
                                                        rows.length.should.be.equal(0);
                                                    }
                                                });
                                            promises.push(request);
                                        }
                                        return Promise.all(promises);
                                    })
                                    .then(() => response.status.should.have.been.calledWith(200))
                            )
                        );
                });
                it('should return 200 and insert group with a tag that doesnt exist in the database', () => {
                    const groupId = uuid();
                    const groupName = 'NEWGROUP5';
                    const tagName = 'NEWTAG2';
                    const tag = new Tag(null, tagName);
                    const isAdmin = false;
                    const systemPermissions = [];
                    for (let i = 0; i < 2; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        systemPermissions.push(new Permission(null, permissionType, true));
                    }
                    const permissions = [];
                    const componentTagPermissions = [];
                    for (let i = 2; i < 4; i++) {
                        let permissionType = new PermissionType(mockData.PermissionType[i].Id);
                        permissions.push(new Permission(null, permissionType, true));
                    }
                    componentTagPermissions.push(new ComponentTagPermission(tag, permissions));
                    const group = new Group(groupId, groupName, isAdmin, componentTagPermissions, systemPermissions);
                    const request = {
                        body: group
                    };

                    let updateGroupPermissions = new Promise((resolve, reject) => {
                        let response = {};
                        response.json = sinon.stub().callsFake((d) => resolve(response));
                        response.status = sinon.stub().callsFake((n) => response);
                        UpdateGroupPermissions(request, response);
                    });

                    return updateGroupPermissions
                        .then(response => mockDb.connect()
                            .then(pool =>
                                pool.request()
                                    .input('id', groupId)
                                    .query('SELECT * FROM CoMIT_Group WHERE Id = @id;')
                                    .then(rows => {
                                        rows.should.be.an('array');
                                        rows.length.should.be.equal(1);
                                        rows[0].Name.should.be.eql(groupName);
                                        rows[0].IsSystemAdmin.should.be.eql(false);
                                        rows[0].Id.toLowerCase().should.be.eql(groupId.toLowerCase());
                                    })
                                    .then(() =>
                                        pool.request()
                                            .input('groupId', groupId)
                                            .execute('[uspComitGetSystemPermissionsByGroupId]')
                                            .then(result => {
                                                let rows = result[0];
                                                rows.should.be.an('array');
                                                rows.length.should.be.equal(2);
                                                for (let i = 0; i < rows.length; i++) {
                                                    rows[i].Value.should.equal(true);
                                                    rows[i].IsSystemPermission.should.equal(true);
                                                    rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i].Id.toLowerCase());
                                                }
                                            }))
                                    .then(() => {
                                        let promises = [];
                                        for (let tag of mockData.Tag) {
                                            let request = pool.request()
                                                .input('tagId', tag.Id)
                                                .input('groupId', groupId)
                                                .execute('[uspComitGetTagPermissions]')
                                                .then(result => {
                                                    let rows = result[0];
                                                    if (tag.Name === tagName) {
                                                        rows.should.be.an('array');
                                                        rows.length.should.be.equal(2);
                                                        for (let i = 0; i < rows.length; i++) {
                                                            rows[i].Value.should.equal(true);
                                                            rows[i].IsSystemPermission.should.equal(false);
                                                            rows[i].PermissionTypeId.toLowerCase().should.equal(mockData.PermissionType[i + 2].Id.toLowerCase());
                                                        }
                                                    } else {
                                                        rows.should.be.an('array');
                                                        rows.length.should.be.equal(0);
                                                    }
                                                });
                                            promises.push(request);
                                        }
                                        return Promise.all(promises);
                                    })
                                    .then(() => response.status.should.have.been.calledWith(200))
                            )
                        );
                });
            });
        });
    });
    describe('Invalid Parameters', function () {
        describe('Invalid Group', function () {
            it('should return 400 and Error when called with null', () => {
                const group = null;
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with undefined', () => {
                const group = undefined;
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 0', () => {
                const group = 0;
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 1', () => {
                const group = 1;
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with string', () => {
                const group = 'string';
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with empty string', () => {
                const group = '';
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with an array', () => {
                const group = [1, 2, 3];
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with an empty array', () => {
                const group = [];
                const request = {
                    body: group
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
        });
        describe('Invalid isAdmin flag', function () {
            it('should return 400 and Error when called with null', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: null,
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with undefined', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: undefined,
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 0', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: 0,
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 1', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: 1,
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with string', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: 'string',
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with empty string', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: '',
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with an object', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: { isAdmin: false },
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with an array', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: [1, 2, 3],
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with an empty array', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: [],
                        systemPermissions: [],
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
        });
        describe('Invalid System Permissions when Group is non-administrative', function () {
            it('should return 400 and Error when called with null', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: null,
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with undefined', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: undefined,
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 0', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: 0,
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 1', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: 1,
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with true', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: true,
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with false', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: false,
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with object', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: { systemPermissions: [] },
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with string', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: 'string',
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with empty string', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: '',
                        componentTagPermissions: []
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
        });
        describe('Invalid Component Tag Permissions when Group is non-administrative', function () {
            it('should return 400 and Error when called with null', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: null
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with undefined', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: undefined
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 0', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: 0
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with 1', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: 1
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with true', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: true
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with false', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: false
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with object', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: { componentTagPermissions: [] }
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with string', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: 'string'
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
            it('should return 400 and Error when called with empty string', () => {
                const request = {
                    body: {
                        id: uuid(),
                        name: '',
                        isAdmin: false,
                        systemPermissions: [],
                        componentTagPermissions: ''
                    }
                };

                let updateGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateGroupPermissions(request, response);
                });

                return updateGroupPermissions
                    .then(response => {
                        // status should be 400
                        response.status.should.have.been.calledWith(400);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.exist(error);

                        // error should be a GalaxyError
                        error.should.be.an.instanceOf(GalaxyError);
                        should.exist(error.friendlyMsg);
                        error.friendlyMsg.should.be.a('string');
                        should.exist(error.description);
                        error.description.should.be.a('string');
                    });

            });
        });
    });
});
