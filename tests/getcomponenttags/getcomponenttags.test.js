'use strict';

// import models
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

const GetComponentTags = require('../../services/getcomponenttags');

describe('GetComponentTags', function () {

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

        it('should return 200 and [West Virginia] when called with "west"', () => {
            const states = ['West Virginia'];
            const request = {
                params: {
                    contains: 'west'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in states
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    states.should.include(tag.name);
                });

        });

        it('should return 200 and [New Hampshire, New Jersey, New Mexico, New York] when called with "new"', () => {
            let states = [];
            states.push('New Hampshire');
            states.push('New Jersey');
            states.push('New Mexico');
            states.push('New York');

            const request = {
                params: {
                    contains: 'new'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 4
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(4);

                    // each tag should be a Tag and its name should be included in states
                    for (let tag of tags) {
                        tag.should.be.an.instanceOf(Tag);
                        states.should.include(tag.name);
                    }
                });

        });

        it('should return 200 and [] when called with "canada"', () => {
            const states = [];
            const request = {
                params: {
                    contains: 'canada'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 0
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(0);
                    tags.should.eql(states);

                });

        });

        it('should return 200 and [New Jersey] when called with " jersey"', () => {
            const states = ['New Jersey'];
            const request = {
                params: {
                    contains: ' jersey'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in states
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    states.should.include(tag.name);

                });

        });

        it('should return 200 and [Rhode Island] when called with "rhode "', () => {
            const states = ['Rhode Island'];
            const request = {
                params: {
                    contains: 'rhode '
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in states
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    states.should.include(tag.name);

                });

        });

        it('should return 200 and [Rhode Island] when called with "ode is"', () => {
            const states = ['Rhode Island'];
            const request = {
                params: {
                    contains: 'ode is'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in states
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    states.should.include(tag.name);

                });

        });

        it('should return 200 and [] when called with "undefined"', () => {
            const states = [];
            const request = {
                params: {
                    contains: "undefined"
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 0
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(0);
                    tags.should.eql(states);

                });

        });

        it('should return 200 and [] when called with "null"', () => {
            const states = [];
            const request = {
                params: {
                    contains: "null"
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 0
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(0);
                    tags.should.eql(states);

                });

        });

        it('should return 200 and [] when called with a SQL statement', () => {
            const states = [];
            const request = {
                params: {
                    contains: "; SELECT * FROM [ComponentTag]"
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 0
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(0);
                    tags.should.eql(states);

                });

        });

    });

    describe('Invalid Parameters', function () {

        it('should return 400 and Error when called with " " (blank space)', () => {
            const request = {
                params: {
                    contains: ' '
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: ''
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: null
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: 0
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: 1
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: false
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: true
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: { x: "pennsylvania" }
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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
                    contains: ["California", "Utah", "Nevada"]
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

    describe('SQL Server Wildcard Characters', function () {

        it('should return 200 and ["[Testing^Escape-Characters]"] when called with "[Testing^Escape-Characters]"', () => {
            const strings = ['[Testing^Escape-Characters]'];
            const request = {
                params: {
                    contains: '[Testing^Escape-Characters]'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in strings
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    strings.should.include(tag.name);

                });

        });

        it('should return 200 and ["Testing%Escape_Characters[]"] when called with "Testing%Escape_Characters[]"', () => {
            const strings = ['Testing%Escape_Characters[]'];
            const request = {
                params: {
                    contains: 'Testing%Escape_Characters[]'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in strings
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    strings.should.include(tag.name);

                });

        });

        it('should return 200 and ["[Testing%Escape_Characters]"] when called with "[Testing%Escape_Characters]"', () => {
            const strings = ['[Testing%Escape_Characters]'];
            const request = {
                params: {
                    contains: '[Testing%Escape_Characters]'
                }
            };

            let getComponentTags = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetComponentTags(request, response);
            });

            return getComponentTags
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

                    // tags should exist and its length = 1
                    let tags = data;
                    should.exist(tags);
                    tags.should.be.an.instanceOf(Array);
                    tags.length.should.equal(1);

                    // tags[0] should be a Tag and its name should be included in strings
                    let tag = tags[0];
                    should.exist(tag);
                    tag.should.be.an.instanceOf(Tag);
                    strings.should.include(tag.name);

                });

        });

    });

});