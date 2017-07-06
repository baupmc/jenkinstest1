'use strict';

const uuid = require('uuid');

// import models
const Tag = require('../../models/tag');
const Component = require('../../models/component');
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

const UpdateComponentTag = require('../../services/updatecomponenttag');

describe('UpdateComponentTag', function () {

    // create mock data and force test database and 
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
        describe('Rollback due to invalid Tag', function () {
            it('should return 500 and rollback transaction if request fails', () => {
                const components = [];
                for (let component of mockData.CoMIT_Component) {
                    components.push(new Component(component.Id, component.Name));
                }
                const tag = new Tag(uuid(), null, null, components);

                const request = {
                    body: tag
                };

                let updateComponentTag = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateComponentTag(request, response);
                });

                return updateComponentTag
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

                            let promises = [];

                            // Tag should not exist in database
                            promises.push(pool.request()
                                .input('id', tag.id)
                                .query('SELECT * FROM Tag WHERE Id = @id;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            // Tag Component links should not exist in database
                            promises.push(pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));
                            return Promise.all(promises);
                        }));
            });
        });
        describe('Rollback due to invalid Component', function () {
            it('should return 500 and rollback transaction if first request fails', () => {
                const fail = 0;
                const components = [];
                for (let i = 0; i < mockData.CoMIT_Component.length; i++) {
                    if (i == fail) {
                        components.push(new Component());
                    } else {
                        components.push(new Component(mockData.CoMIT_Component[i].Id, mockData.CoMIT_Component[i].Name));
                    }
                }
                const tag = new Tag(uuid(), 'NEWTAG', 'Component', components);
                const request = {
                    body: tag
                };

                let updateComponentTag = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateComponentTag(request, response);
                });

                return updateComponentTag
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

                            let promises = [];

                            // Tag should not exist in database
                            promises.push(pool.request()
                                .input('id', tag.id)
                                .query('SELECT * FROM Tag WHERE Id = @id;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            // Tag Component links should not exist in database
                            promises.push(pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            return Promise.all(promises);
                        }));
            });
            it('should return 500 and rollback transaction if middle request fails', () => {
                const fail = 1;
                const components = [];
                for (let i = 0; i < mockData.CoMIT_Component.length; i++) {
                    if (i == fail) {
                        components.push(new Component());
                    } else {
                        components.push(new Component(mockData.CoMIT_Component[i].Id, mockData.CoMIT_Component[i].Name));
                    }
                }
                const tag = new Tag(uuid(), 'NEWTAG', 'Component', components);
                const request = {
                    body: tag
                };

                let updateComponentTag = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateComponentTag(request, response);
                });

                return updateComponentTag
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

                            let promises = [];

                            // Tag should not exist in database
                            promises.push(pool.request()
                                .input('id', tag.id)
                                .query('SELECT * FROM Tag WHERE Id = @id;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            // Tag Component links should not exist in database
                            promises.push(pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            return Promise.all(promises);
                        }));
            });
            it('should return 500 and rollback transaction if last request fails', () => {
                const fail = 2;
                const components = [];
                for (let i = 0; i < mockData.CoMIT_Component.length; i++) {
                    if (i == fail) {
                        components.push(new Component());
                    } else {
                        components.push(new Component(mockData.CoMIT_Component[i].Id, mockData.CoMIT_Component[i].Name));
                    }
                }
                const tag = new Tag(uuid(), 'NEWTAG', 'Component', components);
                const request = {
                    body: tag
                };

                let updateComponentTag = new Promise((resolve, reject) => {
                    let response = {};
                    response.json = sinon.stub().callsFake((d) => resolve(response));
                    response.status = sinon.stub().callsFake((n) => response);
                    UpdateComponentTag(request, response);
                });

                return updateComponentTag
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

                            let promises = [];

                            // Tag should not exist in database
                            promises.push(pool.request()
                                .input('id', tag.id)
                                .query('SELECT * FROM Tag WHERE Id = @id;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            // Tag Component links should not exist in database
                            promises.push(pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(0);
                                }));

                            return Promise.all(promises);
                        }));
            });
        });
    });
    describe('Valid Parameter', function () {
        it('should return 200 and insert Tag when it does not exist yet in the database', () => {
            const tagTypeId = mockData.TagType[0].Id;
            const components = [];
            for (let component of mockData.CoMIT_Component) {
                components.push(new Component(component.Id, component.Name));
            }
            const tag = new Tag('', 'T3', 'Component', components);
            const request = {
                body: tag
            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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

                    // Tag.id should be a string
                    data.id.should.be.a('string');

                    // Tag.name should be a string
                    data.name.should.be.a('string');

                    // Tag.type should be a string
                    data.type.should.be.a('string');

                    // Tag.Components should be an array
                    data.components.should.be.an('array');
                    data.components.length.should.be.equal(components.length);
                    data.components.should.be.eql(components);
                })
                .then(() => mockDb.connect())
                .then(pool =>
                    pool.request()
                        .input('id', tag.id)
                        .query('SELECT * FROM Tag WHERE Id = @id;')
                        .then(rows => {
                            // Tag should exist in the database
                            rows.should.be.an('array');
                            rows.length.should.be.equal(1);
                            rows[0].Id.toLowerCase().should.be.eql(tag.id.toLowerCase());
                            rows[0].Name.should.be.eql(tag.name);
                            rows[0].TagTypeId.toLowerCase().should.be.eql(tagTypeId.toLowerCase());
                        })
                        .then(() =>
                            pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    // All Tag Component links should exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(components.length);
                                    for (let i = 0; i < rows.length; i++) {
                                        rows[i].TagId.toLowerCase().should.be.eql(tag.id.toLowerCase());
                                        rows[i].ComponentId.toLowerCase().should.be.eql(components[i].id.toLowerCase());
                                    }
                                })
                        )
                );
        });
        it("should return 200 and update Tag's Components when it already exists in the database", () => {
            const tagTypeId = mockData.TagType[0].Id;
            const components = [];
            for (let component of mockData.CoMIT_Component) {
                components.push(new Component(component.Id, component.Name));
            }
            const tag = new Tag(mockData.Tag[0].Id, mockData.Tag[0].Name, '', components)
            const request = {
                body: tag
            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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

                    // Tag.id should be a string
                    data.id.should.be.a('string');

                    // Tag.name should be a string
                    data.name.should.be.a('string');

                    // Tag.type should be a string
                    data.type.should.be.a('string');

                    // Tag.Components should be an array
                    data.components.should.be.an('array');
                    data.components.length.should.be.equal(components.length);
                    data.components.should.be.eql(components);
                })
                .then(() => mockDb.connect())
                .then(pool =>
                    pool.request()
                        .input('id', tag.id)
                        .query('SELECT * FROM Tag WHERE Id = @id;')
                        .then(rows => {
                            // Tag should exist in the database
                            rows.should.be.an('array');
                            rows.length.should.be.equal(1);
                            rows[0].Id.toLowerCase().should.be.eql(tag.id.toLowerCase());
                            rows[0].Name.should.be.eql(tag.name);
                            rows[0].TagTypeId.toLowerCase().should.be.eql(tagTypeId.toLowerCase());
                        })
                        .then(() =>
                            pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    // All Tag Component links should exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(components.length);
                                    for (let i = 0; i < rows.length; i++) {
                                        rows[i].TagId.toLowerCase().should.be.eql(tag.id.toLowerCase());
                                        rows[i].ComponentId.toLowerCase().should.be.eql(components[i].id.toLowerCase());
                                    }
                                }))
                );
        });
        it("should return 200 and update Tag's Name when it already exists in the database", () => {
            const tagTypeId = mockData.TagType[0].Id;
            const components = [];
            for (let component of mockData.CoMIT_Component) {
                components.push(new Component(component.Id, component.Name));
            }
            const tag = new Tag(mockData.Tag[1].Id, 'GIVING_IT_A_NEW_NAME', '', components)
            const request = {
                body: tag
            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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

                    // Tag.id should be a string
                    data.id.should.be.a('string');

                    // Tag.name should be a string
                    data.name.should.be.a('string');

                    // Tag.type should be a string
                    data.type.should.be.a('string');

                    // Tag.Components should be an array
                    data.components.should.be.an('array');
                    data.components.length.should.be.equal(components.length);
                    data.components.should.be.eql(components);
                })
                .then(() => mockDb.connect())
                .then(pool =>
                    pool.request()
                        .input('id', tag.id)
                        .query('SELECT * FROM Tag WHERE Id = @id;')
                        .then(rows => {
                            // Tag should exist in the database
                            rows.should.be.an('array');
                            rows.length.should.be.equal(1);
                            rows[0].Id.toLowerCase().should.be.eql(tag.id.toLowerCase());
                            rows[0].Name.should.be.eql(tag.name);
                            rows[0].TagTypeId.toLowerCase().should.be.eql(tagTypeId.toLowerCase());
                        })
                        .then(() =>
                            pool.request()
                                .input('tagId', tag.id)
                                .query('SELECT * FROM CoMIT_TagComponent WHERE TagId = @tagId;')
                                .then(rows => {
                                    // All Tag Component links should exist in the database
                                    rows.should.be.an('array');
                                    rows.length.should.be.equal(components.length);
                                    for (let i = 0; i < rows.length; i++) {
                                        rows[i].TagId.toLowerCase().should.be.eql(tag.id.toLowerCase());
                                        rows[i].ComponentId.toLowerCase().should.be.eql(components[i].id.toLowerCase());
                                    }
                                }))
                );
        });
    });
    describe('Invalid Parameters', function () {
        it('should return 400 and Error when called with 0', () => {
            const request = {
                body: 0
            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
                body: 1
            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
                body: true
            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
                body: false

            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
        it('should return 400 and Error when called with a string', () => {
            const request = {
                body: "tags"

            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
        it('should return 400 and Error when called with an empty string ("")', () => {
            const request = {
                body: ""

            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
                body: [1, 2, 3]

            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
                body: []

            };

            let updateComponentTag = new Promise((resolve, reject) => {
                let response = {};
                response.json = sinon.stub().callsFake((d) => resolve(response));
                response.status = sinon.stub().callsFake((n) => response);
                UpdateComponentTag(request, response);
            });

            return updateComponentTag
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
