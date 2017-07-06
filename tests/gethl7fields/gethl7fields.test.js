'use strict';

// import models
const GalaxyReturn = require('../../models/galaxyreturn');
const GalaxyError = require('../../models/galaxyerror');

// unit test framework
const chai = require('chai');
const sinon = require('sinon');
const should = require('chai').should();
chai.use(require('sinon-chai'));

const GetHl7Fields = require('../../services/gethl7fields');

describe('GetHl7Fields', function () {

    describe('Valid Parameters', function () {

        it('should return 200 and no Fields when called with "NOT_A_REAL_FIELD"', () => {
            const request = {
                params: {
                    contains: 'NOT_A_REAL_FIELD'
                }
            };

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

                    // fields should exist and its length = 0
                    let fields = data;
                    should.exist(fields);
                    fields.should.be.an.instanceOf(Array);
                    fields.length.should.be.equal(0);

                });
        });

        it('should return 200 and 1 Field when called with "MSH.1.FieldSeparator"', () => {
            const request = {
                params: {
                    contains: 'MSH.1.FieldSeparator'
                }
            };

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

                    // fields should exist and its length = 1
                    let fields = data;
                    should.exist(fields);
                    fields.should.be.an.instanceOf(Array);
                    fields.length.should.be.equal(1);

                    // fields[0] should be a String
                    let field = fields[0]
                    field.should.be.a('string');
                    field.should.equal('MSH.1.FieldSeparator');

                });
        });

        it('should return 200 and 1 Field when called with "msh.1.fieldseparator"', () => {
            const request = {
                params: {
                    contains: 'msh.1.fieldseparator'
                }
            };

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

                    // fields should exist and its length = 1
                    let fields = data;
                    should.exist(fields);
                    fields.should.be.an.instanceOf(Array);
                    fields.length.should.be.equal(1);

                    // fields[0] should be a String
                    let field = fields[0]
                    field.should.be.a('string');
                    field.toLowerCase().should.equal('msh.1.fieldseparator');

                });
        });

        it('should return 200 and 1 Field when called with "MSH.1.FIELDSEPARATOR"', () => {
            const request = {
                params: {
                    contains: 'MSH.1.FIELDSEPARATOR'
                }
            };

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

                    // fields should exist and its length = 1
                    let fields = data;
                    should.exist(fields);
                    fields.should.be.an.instanceOf(Array);
                    fields.length.should.be.equal(1);

                    // fields[0] should be a String
                    let field = fields[0]
                    field.should.be.a('string');
                    field.toUpperCase().should.equal('MSH.1.FIELDSEPARATOR');

                });
        });

        it('should return 200 and many Fields when called with "MSH"', () => {
            const request = {
                params: {
                    contains: 'MSH'
                }
            };

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

                    // fields should exist and its length > 1
                    let fields = data;
                    should.exist(fields);
                    fields.should.be.an.instanceOf(Array);
                    fields.length.should.be.above(1);

                    // categories[0] should be a Tag
                    for (let field of fields) {
                        field.should.be.a('string');
                        field.should.include('MSH');
                    }
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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

            let getHl7Fields = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                GetHl7Fields(request, response);
            });

            return getHl7Fields
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