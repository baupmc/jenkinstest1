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

const GetMessageQueries = require('../../services/getmessagequeries');

describe('GetMessageQueries', function () {

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

        it('should return 200 and [] when called with "NOT_A_USER"', () => {
            const request = {
                params: {
                    userid: "NOT_A_USER"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 0
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(0);

                });

        });

        it('should return 200 and 1 query when called with "U1"', () => {
            let id = mockData.CoMIT_MessageQuery[0].Id;
            let name = mockData.CoMIT_MessageQuery[0].Name;
            let userId = mockData.CoMIT_MessageQuery[0].UserId;
            let queryData = mockData.CoMIT_MessageQuery[0].QueryData;
            let expectedQuery = new MessageQuery(id, name, userId, queryData);

            const request = {
                params: {
                    userid: "U1"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 1
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(1);

                    // queries[0] should be a MessageQuery
                    let query = queries[0];
                    should.exist(query);
                    query.should.be.an.instanceOf(MessageQuery);

                    // queries[0] should be identical to expectedQuery
                    query.id.toLowerCase().should.equal(expectedQuery.id.toLowerCase());
                    query.userId.should.equal(expectedQuery.userId);
                    query.name.should.equal(expectedQuery.name);
                    JSON.stringify(query.queryData).should.equal(JSON.stringify(expectedQuery.queryData));
                });

        });

        it('should return 200 and 2 queries when called with "U2"', () => {
            let expectedQueries = {};
            for (let i = 1; i <= 2; i++) {
                let id = mockData.CoMIT_MessageQuery[i].Id.toLowerCase();
                let name = mockData.CoMIT_MessageQuery[i].Name;
                let userId = mockData.CoMIT_MessageQuery[i].UserId;
                let queryData = mockData.CoMIT_MessageQuery[i].QueryData;
                let expectedQuery = new MessageQuery(id, name, userId, queryData);
                expectedQueries[id] = expectedQuery;
            }

            const request = {
                params: {
                    userid: "U2"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 2
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(2);

                    for (let query of queries) {
                        // query should be a MessageQuery
                        should.exist(query);
                        query.should.be.an.instanceOf(MessageQuery);

                        // query should be identical to expectedQuery                        
                        let expectedQuery = expectedQueries[query.id.toLowerCase()];
                        query.id.toLowerCase().should.equal(expectedQuery.id.toLowerCase());
                        query.userId.should.equal(expectedQuery.userId);
                        query.name.should.equal(expectedQuery.name);
                        JSON.stringify(query.queryData).should.equal(JSON.stringify(expectedQuery.queryData));
                    }

                });

        });

        it('should return 200 and 3 queries when called with "U3"', () => {
            let expectedQueries = {};
            for (let i = 3; i <= 5; i++) {
                let id = mockData.CoMIT_MessageQuery[i].Id.toLowerCase();
                let name = mockData.CoMIT_MessageQuery[i].Name;
                let userId = mockData.CoMIT_MessageQuery[i].UserId;
                let queryData = mockData.CoMIT_MessageQuery[i].QueryData;
                let expectedQuery = new MessageQuery(id, name, userId, queryData);
                expectedQueries[id] = expectedQuery;
            }

            const request = {
                params: {
                    userid: "U3"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 2
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(3);

                    for (let query of queries) {
                        // query should be a MessageQuery
                        should.exist(query);
                        query.should.be.an.instanceOf(MessageQuery);

                        // query should be identical to expectedQuery                        
                        let expectedQuery = expectedQueries[query.id.toLowerCase()];
                        query.id.toLowerCase().should.equal(expectedQuery.id.toLowerCase());
                        query.userId.should.equal(expectedQuery.userId);
                        query.name.should.equal(expectedQuery.name);
                        JSON.stringify(query.queryData).should.equal(JSON.stringify(expectedQuery.queryData));
                    }

                });

        });

        it('should return 200 and [] when called with "undefined"', () => {
            const request = {
                params: {
                    userid: "undefined"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 0
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with "null"', () => {
            const request = {
                params: {
                    userid: "null"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 0
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(0);

                });

        });

        it('should return 200 and [] when called with a SQL statement', () => {
            const request = {
                params: {
                    userid: "; SELECT * FROM [ComponentTag]"
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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

                    // queries should exist and its length = 0
                    let queries = data;
                    should.exist(queries);
                    queries.should.be.an.instanceOf(Array);
                    queries.length.should.equal(0);

                });

        });

    });

    describe('Invalid Parameters', function () {

        it('should return 400 and Error when called with " " (blank space)', () => {
            const request = {
                params: {
                    userid: ' '
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                params: {
                    userid: ''
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: []
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                params: {
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: null
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: 0
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: 1
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: false
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: true
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: { x: "pennsylvania" }
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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
                    userid: ["California", "Utah", "Nevada"]
                }
            };

            let getMessageQueries = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetMessageQueries(request, response);
            });

            return getMessageQueries
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