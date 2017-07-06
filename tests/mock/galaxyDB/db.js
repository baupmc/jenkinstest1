'use strict';

const mockDb = require('../mockdatabase');
const mockData = require('./mock.json');

if (String(process.argv[2]).toLowerCase() === 'create') {
    mockDb.connectToReal()
        .then(() => mockDb.destroy(mockData))
        .then(() => mockDb.create(mockData))
        .then(() => mockDb.close())
        .then(() => console.log('created'))
        .catch(err => console.log(err))
} else if (String(process.argv[2]).toLowerCase() === 'destroy') {
    mockDb.connectToReal()
        .then(() => mockDb.destroy(mockData))
        .then(() => mockDb.close())
        .then(() => console.log('destroyed'))
        .catch(err => console.log(err))
}