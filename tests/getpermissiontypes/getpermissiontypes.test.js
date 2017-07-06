'use strict';

// import models
const PermissionType = require('../../models/permissiontype');
const GalaxyReturn = require('../../models/galaxyreturn');
const GalaxyError = require('../../models/galaxyerror');

// mock data and database
const mockDb = require('../mock/mockdatabase');
const mockData = require('./mock.json');
const mockPermissionTypes = require('./mock.json').PermissionType;
const config = require('../../config/config');

// unit test framework
const chai = require('chai');
const sinon = require('sinon');
const should = require('chai').should();
chai.use(require('sinon-chai'));

const GetPermissionTypes = require('../../services/getpermissiontypes');

describe('GetPermissionTypes', function () {

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

    describe('Valid parameter', function () {

        it('should return 200 and only permission types belonging to Alpha when called with "Alpha"', () => {
            let ids = [];
            for (let mockPermissionType of mockPermissionTypes) {
                if (mockPermissionType.SystemName === 'Alpha') {
                    ids.push(mockPermissionType.Id.toLowerCase());
                }
            }

            const request = {
                params: {
                    systemName: 'Alpha'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 8
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(8);

                    // each permission type should be a PermissionType 
                    // and its id should belong to the list of alpha ids
                    for (let permissionType of permissionTypes) {
                        permissionType.should.be.an.instanceOf(PermissionType);
                        ids.should.include(permissionType.id.toLowerCase());
                    }

                });

        });

        it('should return 200 and only permission types belonging to Beta when called with "Beta"', () => {
            let ids = [];
            for (let mockPermissionType of mockPermissionTypes) {
                if (mockPermissionType.SystemName === 'Beta') {
                    ids.push(mockPermissionType.Id.toLowerCase());
                }
            }

            const request = {
                params: {
                    systemName: 'Beta'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 4
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(4);

                    // each permission type should be a PermissionType 
                    // and its id should belong to the list of beta ids
                    for (let permissionType of permissionTypes) {
                        permissionType.should.be.an.instanceOf(PermissionType);
                        ids.should.include(permissionType.id.toLowerCase());
                    }

                });

        });

        it('should return 200 and [] when called with "Charlie"', () => {
            const request = {
                params: {
                    systemName: 'Charlie'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and only permission types belonging to Old Beta when called with "Old Beta"', () => {
            let ids = [];
            for (let mockPermissionType of mockPermissionTypes) {
                if (mockPermissionType.SystemName === 'Old Beta') {
                    ids.push(mockPermissionType.Id.toLowerCase());
                }
            }

            const request = {
                params: {
                    systemName: 'Old Beta'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 8
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(4);

                    // each permission type should be a PermissionType 
                    // and its id should belong to the list of beta ids
                    for (let permissionType of permissionTypes) {
                        permissionType.should.be.an.instanceOf(PermissionType);
                        ids.should.include(permissionType.id.toLowerCase());
                    }

                });

        });

        it('should return 200 and only permission types belonging to Alpha when called with "alpha"', () => {
            let ids = [];
            for (let mockPermissionType of mockPermissionTypes) {
                if (mockPermissionType.SystemName === 'Alpha') {
                    ids.push(mockPermissionType.Id.toLowerCase());
                }
            }

            const request = {
                params: {
                    systemName: 'alpha'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 8
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(8);

                    // each permission type should be a PermissionType 
                    // and its id should belong to the list of alpha ids
                    for (let permissionType of permissionTypes) {
                        permissionType.should.be.an.instanceOf(PermissionType);
                        ids.should.include(permissionType.id.toLowerCase());
                    }

                });

        });

        it('should return 200 and only permission types belonging to Alpha when called with "AlPhA"', () => {
            let ids = [];
            for (let mockPermissionType of mockPermissionTypes) {
                if (mockPermissionType.SystemName === 'Alpha') {
                    ids.push(mockPermissionType.Id.toLowerCase());
                }
            }

            const request = {
                params: {
                    systemName: 'AlPhA'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 8
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(8);

                    // each permission type should be a PermissionType 
                    // and its id should belong to the list of alpha ids
                    for (let permissionType of permissionTypes) {
                        permissionType.should.be.an.instanceOf(PermissionType);
                        ids.should.include(permissionType.id.toLowerCase());
                    }

                });

        });

        it('should return 200 and [] when called with "aalpha"', () => {
            const request = {
                params: {
                    systemName: 'aalpha'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with "alphaa"', () => {
            const request = {
                params: {
                    systemName: 'alphaa'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with "Alpha123"', () => {
            const request = {
                params: {
                    systemName: 'Alpha123'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with a SQL Statement', () => {
            const request = {
                params: {
                    systemName: "; SELECT * FROM [PermissionType]"
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with a "undefined"', () => {
            const request = {
                params: {
                    systemName: 'undefined'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with a "null"', () => {
            const request = {
                params: {
                    systemName: 'null'
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with " " (blank space)', () => {
            const request = {
                params: {
                    systemName: ' '
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with "" (empty string)', () => {
            const request = {
                params: {
                    systemName: ''
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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

                    // data.permissionTypes should exist and its length = 0
                    let permissionTypes = data.permissionTypes;
                    should.exist(permissionTypes);
                    permissionTypes.should.be.an.instanceOf(Array);
                    permissionTypes.length.should.equal(0);

                });

        });

    });

    describe('Invalid parameter', function () {

        it('should return 400 and Error when called with undefined', () => {
            const request = {
                params: {
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: null
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: 0
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: 1
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: false
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: true
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: { name: "alpha" }
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    systemName: ["alpha", "beta", "charlie"]
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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
                    contains: []
                }
            };

            let getPermissionTypes = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetPermissionTypes(request, response);
            });

            return getPermissionTypes
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