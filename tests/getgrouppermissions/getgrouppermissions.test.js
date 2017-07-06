'use strict';

// import models
const ComponentTagPermission = require('../../models/componenttagpermission');
const Permission = require('../../models/permission');
const PermissionType = require('../../models/permissiontype');
const Tag = require('../../models/tag');
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

const GetGroupPermissions = require('../../services/getgrouppermissions');

describe('GetGroupPermissions', function () {

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

    describe('Valid Parameters', function () {
        describe('Group is an Administrative Group', function () {
            it('should return 200 with isAdmin=true and no Permissions when the given Group is an Administrative', function () {
                const request = {
                    params: {
                        groupId: "cf8ec8fa-1dba-4ec3-aaea-4949e71caa18"
                    }
                };

                let getGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    GetGroupPermissions(request, response);
                });

                return getGroupPermissions
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

                        // data.isAdmin should exist
                        should.exist(data.isAdmin);
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.equal(true);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.systemPermissions);
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.should.eql([]);
                        data.systemPermissions.length.should.equal(0);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.componentTagPermissions);
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.should.eql([]);
                        data.componentTagPermissions.length.should.equal(0);
                    });
            });
        });
        describe('Group is not an Administrative Group and has neither System nor Component Tag Permissions', function () {
            it('should return 200 with isAdmin = false and no Permissions when the given Group is not in the database', function () {
                const request = {
                    params: {
                        groupId: "cf8ec8fa-1dba-4ec3-aaea-4949e71caa19"
                    }
                };

                let getGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    GetGroupPermissions(request, response);
                });

                return getGroupPermissions
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

                        // data.isAdmin should exist
                        should.exist(data.isAdmin);
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.equal(false);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.systemPermissions);
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.should.eql([]);
                        data.systemPermissions.length.should.equal(0);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.componentTagPermissions);
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.should.eql([]);
                        data.componentTagPermissions.length.should.equal(0);
                    });
            });
            it('should return 200 with isAdmin = false and no Permissions when the given Group has no Permissions', function () {
                const request = {
                    params: {
                        groupId: "4cb5394e-a6d2-48f5-a5cd-fa6ef5b8ac28"
                    }
                };

                let getGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    GetGroupPermissions(request, response);
                });

                return getGroupPermissions
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

                        // data.isAdmin should exist
                        should.exist(data.isAdmin);
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.equal(false);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.systemPermissions);
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.should.eql([]);
                        data.systemPermissions.length.should.equal(0);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.componentTagPermissions);
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.should.eql([]);
                        data.componentTagPermissions.length.should.equal(0);
                    });
            });
        });
        describe('Group only has System Permissions', function () {
            it('should return 200 with isAdmin = false and System Permissions when the given Group has System Permissions', function () {
                const request = {
                    params: {
                        groupId: "185b2b41-ff20-4b39-8ac1-f0f2b03e3fac"
                    }
                };

                let getGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    GetGroupPermissions(request, response);
                });

                return getGroupPermissions
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

                        // data.isAdmin should exist
                        should.exist(data.isAdmin);
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.equal(false);

                        // data.systemPermissions should exist and contain an array of permissions
                        should.exist(data.systemPermissions);
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.length.should.be.above(0);

                        for (let permission of data.systemPermissions) {
                            permission.should.be.an.instanceOf(Permission);
                            if (permission.id != null) {
                                permission.id.should.be.a('string');
                            }
                            permission.hasPermission.should.be.a('boolean');
                            permission.type.should.be.an.instanceOf(PermissionType);
                            permission.type.id.should.be.a('string');
                            permission.type.name.should.be.a('string');
                            permission.type.code.should.be.a('string');
                            permission.type.type.should.be.a('string');
                            permission.type.type.should.eql('System');
                        }

                        // data.componentTagPermissions should exist and be an empty array
                        should.exist(data.componentTagPermissions);
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.should.eql([]);
                        data.componentTagPermissions.length.should.equal(0);
                    });
            });
        });
        describe('Group only has Component Tag Permissions', function () {
            it('should return 200 with isAdmin = false and Component Tag Permissions when the given Group has Component Tag Permissions', function () {
                const request = {
                    params: {
                        groupId: "af5aa442-48df-4211-8217-ef984984023f"
                    }
                };

                let getGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    GetGroupPermissions(request, response);
                });

                return getGroupPermissions
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

                        // data.isAdmin should exist
                        should.exist(data.isAdmin);
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.equal(false);

                        // data.systemPermissions should exist and be an empty array
                        should.exist(data.systemPermissions);
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.should.eql([]);
                        data.systemPermissions.length.should.equal(0);

                        // data.componentTagPermissions should exist and contain an array of component tag permissions
                        should.exist(data.componentTagPermissions);
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.length.should.be.above(0);
                        for (let componentTagPermission of data.componentTagPermissions) {
                            componentTagPermission.should.be.an.instanceOf(ComponentTagPermission);
                            componentTagPermission.tag.should.be.an.instanceOf(Tag);
                            componentTagPermission.tag.id.should.be.a('string');
                            componentTagPermission.tag.name.should.be.a('string');
                            componentTagPermission.permissions.should.be.an('array');
                            componentTagPermission.permissions.length.should.be.above(0);
                            for (let permission of componentTagPermission.permissions) {
                                if (permission.id != null) {
                                    permission.id.should.be.a('string');
                                }
                                permission.hasPermission.should.be.a('boolean');
                                permission.type.should.be.an.instanceOf(PermissionType);
                                permission.type.id.should.be.a('string');
                                permission.type.name.should.be.a('string');
                                permission.type.code.should.be.a('string');
                                permission.type.type.should.be.a('string');
                                permission.type.type.should.eql('Component');
                            }
                        }
                    });
            });
        });
        describe('Group has both System and Component Tag Permissions', function () {
            it('should return 200 with isAdmin = false, System Permissions, and Component Tag Permissions when the given Group has both System and Component Tag Permissions', function () {
                const request = {
                    params: {
                        groupId: "ba313e78-0b7d-4b52-b3bf-a198d0d9ea9e"
                    }
                };

                let getGroupPermissions = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    GetGroupPermissions(request, response);
                });

                return getGroupPermissions
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

                        // data.isAdmin should exist
                        should.exist(data.isAdmin);
                        data.isAdmin.should.be.a('boolean');
                        data.isAdmin.should.equal(false);

                        // data.systemPermissions should exist and contain an array of permissions
                        should.exist(data.systemPermissions);
                        data.systemPermissions.should.be.an('array');
                        data.systemPermissions.length.should.be.above(0);

                        for (let permission of data.systemPermissions) {
                            permission.should.be.an.instanceOf(Permission);
                            if (permission.id != null) {
                                permission.id.should.be.a('string');
                            }
                            permission.hasPermission.should.be.a('boolean');
                            permission.type.should.be.an.instanceOf(PermissionType);
                            permission.type.id.should.be.a('string');
                            permission.type.name.should.be.a('string');
                            permission.type.code.should.be.a('string');
                            permission.type.type.should.be.a('string');
                            permission.type.type.should.eql('System');
                        }

                        // data.componentTagPermissions should exist and contain an array of component tag permissions
                        should.exist(data.componentTagPermissions);
                        data.componentTagPermissions.should.be.an('array');
                        data.componentTagPermissions.length.should.be.above(0);
                        for (let componentTagPermission of data.componentTagPermissions) {
                            componentTagPermission.should.be.an.instanceOf(ComponentTagPermission);
                            componentTagPermission.tag.should.be.an.instanceOf(Tag);
                            componentTagPermission.tag.id.should.be.a('string');
                            componentTagPermission.tag.name.should.be.a('string');
                            componentTagPermission.permissions.should.be.an('array');
                            componentTagPermission.permissions.length.should.be.above(0);
                            for (let permission of componentTagPermission.permissions) {
                                if (permission.id != null) {
                                    permission.id.should.be.a('string');
                                }
                                permission.hasPermission.should.be.a('boolean');
                                permission.type.should.be.an.instanceOf(PermissionType);
                                permission.type.id.should.be.a('string');
                                permission.type.name.should.be.a('string');
                                permission.type.code.should.be.a('string');
                                permission.type.type.should.be.a('string');
                                permission.type.type.should.eql('Component');
                            }
                        }
                    });
            });
        });
    });
    describe('Invalid Parameters', function () {
        it('should return 400 and Error when called with undefined', () => {
            const request = {
                params: {
                    groupId: undefined
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
        it('should return 400 and Error when called with null', () => {
            const request = {
                params: {
                    groupId: null
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
                params: {
                    groupId: 0
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
                params: {
                    groupId: 1
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
                params: {
                    groupId: true
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
                params: {
                    groupId: false
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
        it('should return 400 and Error when called with a string (non-uuid)', () => {
            const request = {
                params: {
                    groupId: 'string'
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
                params: {
                    groupId: {
                        groudId: "abc"
                    }
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
                params: {
                    groupId: ['a', 'b', 'c']
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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
        it('should return 400 and Error when called with [] (empty array)', () => {
            const request = {
                params: {
                    groupId: []
                }
            };

            let getGroupPermissions = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetGroupPermissions(request, response);
            });

            return getGroupPermissions
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