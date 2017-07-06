'use strict';

// import models
const MessageQuery = require('../../models/messagequery');
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

const SaveMessageQuery = require('../../services/savemessagequery');

describe('SaveMessageQuery', function () {

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

        it('should return 200 and when saving a new query for the user', () => {
            const request = {
                body: {
                    id: '',
                    name: 'Q3',
                    userId: 'U2',
                    queryData: {
                        name: 'Q3.3'
                    }
                }
            };

            let saveMessageQuery = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                SaveMessageQuery(request, response);
            });

            return saveMessageQuery
                .then(response => mockDb.connect()
                    .then(pool => {
                        // status should be 200
                        response.status.should.have.been.calledWith(200);

                        // response should be a GalaxyReturn
                        response.json.should.have.been.calledOnce;
                        let calledWith = response.json.firstCall.args[0];
                        calledWith.should.be.an.instanceOf(GalaxyReturn);

                        // GalaxyReturn.data should not exist and GalaxyReturn.error should not exist
                        let data = calledWith.data;
                        let error = calledWith.error;
                        should.not.exist(data);
                        should.not.exist(error);

                        // Message Query should exist in database
                        return pool.request()
                            .input('userId', request.body.userId)
                            .input('name', request.body.name)
                            .query('SELECT * FROM CoMIT_MessageQuery WHERE UserId = @userId AND Name = @name;')
                            .then(rows => {
                                rows.should.be.an('array');
                                rows.length.should.be.equal(1);
                                request.body.userId.should.equal(rows[0].UserId);
                                request.body.name.should.equal(rows[0].Name);
                                JSON.stringify(request.body.queryData).should.equal(rows[0].QueryData);
                            });
                    }));
        });

        it('should return 400 and Error when a query with the same name exists for the user', () => {
            const request = {
                body: {
                    id: '',
                    name: 'Q2',
                    userId: 'U2',
                    queryData: {
                        "name": "Q2.2"
                    }
                }
            };

            let saveMessageQuery = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                SaveMessageQuery(request, response);
            });

            return saveMessageQuery
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

    describe('Invalid Parameters', function () {
        
        describe('UserId', function () {

            it('should return 400 and Error when called with " " (blank space)', () => {
                const request = {
                    body: {
                        id: ' ',
                        name: '',
                        userId: ' ',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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

            it('should return 400 and Error when called with "" (empty string)', () => {
                const request = {
                    body: {
                        id: '',
                        name: '',
                        userId: '',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                    body: {
                        id: '',
                        name: '',
                        userId: [],
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: '',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                    body: {
                        id: '',
                        name: '',
                        userId: null,
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: '',
                        userId: 0,
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: '',
                        userId: 1,
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: '',
                        userId: true,
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: '',
                        userId: false,
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: ' ',
                        name: '',
                        userId: {
                            id: 123
                        },
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: ' ',
                        name: '',
                        userId: [1, 2, 3],
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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

        describe('Name', function () {

            it('should return 400 and Error when called with " " (blank space)', () => {
                const request = {
                    body: {
                        id: '',
                        name: ' ',
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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

            it('should return 400 and Error when called with "" (empty string)', () => {
                const request = {
                    body: {
                        id: '',
                        name: '',
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                    body: {
                        id: '',
                        name: [],
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                    body: {
                        id: '',
                        name: null,
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: 0,
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: 1,
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: true,
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: '',
                        name: false,
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: ' ',
                        name: {
                            id: 123
                        },
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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
                        id: ' ',
                        name: [1, 2, 3],
                        userId: 'valid',
                        queryData: ''
                    }
                };

                let saveMessageQuery = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    SaveMessageQuery(request, response);
                });

                return saveMessageQuery
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