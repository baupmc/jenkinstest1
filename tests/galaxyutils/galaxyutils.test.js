'use strict';

// unit test framework
const chai = require('chai');
const sinon = require('sinon');
const should = require('chai').should();
chai.use(require('sinon-chai'));

// import models
const Tag = require('../../models/tag');
const Permission = require('../../models/permission');
const PermissionType = require('../../models/permissiontype');
const ComponentTagPermission = require('../../models/componenttagpermission');

// utils
const collapsePermissions = require('../../helpers/galaxyutils').collapsePermissions;
const collapseComponentTagPermissions = require('../../helpers/galaxyutils').collapseComponentTagPermissions;
const mergePermissionsWithPermissionTypes = require('../../helpers/galaxyutils').mergePermissionsWithPermissionTypes;

const permissionComparator = (a, b) => {
    if (a.type.id < b.type.id)
        return -1;
    if (a.type.id > b.type.id)
        return 1;
    return 0;
};

const tagPermissionComparator = (a, b) => {
    if (a.tag.id < b.tag.id)
        return -1;
    if (a.tag.id > b.tag.id)
        return 1;
    return 0;
};

describe('galaxyutils', function () {
    describe('collapsePermissions', function () {
        describe('No Permission Sets or Permissions', function () {
            it('should return an empty array when called with an empty array', () => {
                let observed = collapsePermissions([]);
                observed.length.should.eql(0);
                observed.should.eql([]);
            });
            it('should return an empty array when called with an empty array of an empty Permissions array', () => {
                let observed = collapsePermissions([[]]);
                observed.length.should.eql(0);
                observed.should.eql([]);
            });
            it('should return an empty array when called with an array of empty Permissions arrays', () => {
                const length = 5;
                const sets = [];
                for (let i = 0; i < length; i++) {
                    sets.push([]);
                }
                let observed = collapsePermissions(sets);
                observed.length.should.eql(0);
                observed.should.eql([]);

            });
        });
        describe('Permissions that are neither duplicated or overridden', function () {
            it('should return an identical array of Permissions when called with one Permissions array with a length of 1', () => {
                const permissions = [];
                const permissionSets = [];

                let type = new PermissionType(1, 'P1', 'P1', true);
                permissions.push(new Permission(1, type, false));
                permissionSets.push(permissions);

                const expected = permissions;

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
            it('should return an identical array of Permissions when called with one Permissions array with a length greater than 1', () => {
                const lengthofPermissions = 5;
                const permissions = [];
                const permissionSets = [];

                for (let i = 0; i < lengthofPermissions; i++) {
                    let type = new PermissionType(i, 'P' + i, 'P' + i, true);
                    permissions.push(new Permission(i, type, false))
                }

                permissionSets.push(permissions);

                const expected = permissions;

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
            it('should return an identical array of Permissions when called with many Permissions arrays with a length greater than 1', () => {
                const lengthofPermissions = 5;
                const lengthofSets = 5;
                const permissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofSets; i++) {
                    let permissions = [];
                    for (let j = 0; j < lengthofPermissions; j++) {
                        let id = (i + '' + j);
                        let type = new PermissionType(id, 'P' + id, 'P' + id, true);
                        let permission = new Permission(id, type, false)
                        permissions.push(permission);
                        expected.push(permission);
                    }
                    permissionSets.push(permissions);
                }

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
        });
        describe('Permissions that are duplicated but are not overridden', function () {
            it('should return a collapsed array of Permissions when called with one Permissions array with a length greater than 1', () => {
                const lengthofPermissions = 5;
                const permissions = [];
                const permissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofPermissions; i++) {
                    let type = new PermissionType(i, 'P' + i, 'P' + i, true);
                    let permission = new Permission(i, type, false);
                    //add it twice, so there is a duplicate for every permission
                    permissions.push(permission);
                    permissions.push(permission);
                    expected.push(permission);
                }

                permissionSets.push(permissions);

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.should.eql(expected);
            });
            it('should return a collapsed array of Permissions when called with many Permissions arrays with a length greater than 1', () => {
                const lengthofPermissions = 5;
                const lengthofSets = 5;
                const permissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofSets; i++) {
                    let permissions = [];
                    for (let j = 0; j < lengthofPermissions; j++) {
                        let id = (i + '' + j);
                        let type = new PermissionType(id, 'P' + id, 'P' + id, true);
                        let permission = new Permission(id, type, false)
                        //add it twice, so there is a duplicate for every permission
                        permissions.push(permission);
                        permissions.push(permission);
                        expected.push(permission);
                    }
                    permissionSets.push(permissions);
                }

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
        });
        describe('Permissions that are both duplicated and overridden', function () {
            it('should return a collapsed and overridden array of Permissions when called with one Permissions array with a length greater than 1', () => {
                const lengthofPermissions = 5;
                const permissions = [];
                const permissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofPermissions; i++) {
                    let type = new PermissionType(i, 'P' + i, 'P' + i, true);
                    let permission = new Permission(i, type, false);
                    //add it twice, so there is a duplicate for every permission
                    permissions.push(permission);
                    //set the duplicate permission's value to true, so that it is overridden
                    permission.hasPermission = true;
                    permissions.push(permission);
                    expected.push(permission);
                }

                permissionSets.push(permissions);

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.should.eql(expected);
            });
            it('should return a collapsed and overridden array of Permissions when called with many Permissions arrays with a length greater than 1', () => {
                const lengthofPermissions = 5;
                const lengthofSets = 5;
                const permissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofSets; i++) {
                    let permissions = [];
                    for (let j = 0; j < lengthofPermissions; j++) {
                        let id = (i + '' + j);
                        let type = new PermissionType(id, 'P' + id, 'P' + id, true);
                        let permission = new Permission(id, type, false)
                        //add it twice, so there is a duplicate for every permission
                        permissions.push(permission);
                        //set the duplicate permission's value to true, so that it is overridden
                        permission.hasPermission = true;
                        permissions.push(permission);
                        expected.push(permission);
                    }
                    permissionSets.push(permissions);
                }

                let observed = collapsePermissions(permissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
        });
    });
    describe('collapseComponentTagPermissions', function () {
        describe('No Tag Permission Sets or Tag Permissions', function () {
            it('should return an empty array when called with an empty array', () => {
                let observed = collapseComponentTagPermissions([]);
                observed.length.should.eql(0);
                observed.should.eql([]);
            });
            it('should return an empty array when called with an empty array of an empty Tag Permissions array', () => {
                let observed = collapseComponentTagPermissions([[]]);
                observed.length.should.eql(0);
                observed.should.eql([]);
            });
            it('should return an empty array when called with an array of empty Tag Permissions arrays', () => {
                const length = 5;
                const sets = [];
                for (let i = 0; i < length; i++) {
                    sets.push([]);
                }
                let observed = collapseComponentTagPermissions(sets);
                observed.length.should.eql(0);
                observed.should.eql([]);

            });
        });
        describe('Tag Permissions that are neither duplicated or overridden', function () {
            it('should return an identical array of Tag Permissions when called with one Tag Permissions array with a length of 1', () => {
                const componentTagPermissions = [];
                const componentTagPermissionSets = [];

                let tag = new Tag(1, 'T1');
                let type = new PermissionType(1, 'P1', 'P1', true);
                let permission = new Permission(1, type, false);

                componentTagPermissions.push(new ComponentTagPermission(tag, [permission]));
                componentTagPermissionSets.push(componentTagPermissions);

                const expected = componentTagPermissions;

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.should.eql(expected);
            });
            it('should return an identical array of Tag Permissions when called with one Tag Permissions array with a length greater than 1', () => {
                const lengthofComponentTagPermissions = 5;
                const componentTagPermissions = [];
                const componentTagPermissionSets = [];

                for (let i = 0; i < lengthofComponentTagPermissions; i++) {
                    let tag = new Tag(i, 'T' + i);
                    let type = new PermissionType(1, 'P1', 'P1', true);
                    let permission = new Permission(1, type, false);
                    componentTagPermissions.push(new ComponentTagPermission(tag, [permission]));
                }
                componentTagPermissionSets.push(componentTagPermissions);

                const expected = componentTagPermissions;

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(tagPermissionComparator).should.eql(expected.sort(tagPermissionComparator));
            });
            it('should return an identical array of Tag Permissions when called with many Tag Permissions arrays with a length greater than 1', () => {
                const lengthOfSets = 5;
                const lengthofComponentTagPermissions = 5;
                const componentTagPermissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthOfSets; i++) {
                    let componentTagPermissions = [];
                    for (let j = 0; j < lengthofComponentTagPermissions; j++) {
                        let id = (i + '' + j)
                        let tag = new Tag(id, 'T' + id);
                        let type = new PermissionType(id, 'P' + id, 'P' + id, true);
                        let permission = new Permission(id, type, false);
                        let componentTagPermission = new ComponentTagPermission(tag, [permission]);
                        componentTagPermissions.push(componentTagPermission);
                        expected.push(componentTagPermission);
                    }
                    componentTagPermissionSets.push(componentTagPermissions);
                }

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(tagPermissionComparator).should.eql(expected.sort(tagPermissionComparator));
            });
        });
        describe('Tag Permissions that are duplicated but are not overridden', function () {
            it('should return a collapsed array of Tag Permissions when called with one Tag Permissions array with a length greater than 1', () => {
                const lengthofComponentTagPermissions = 5;
                const componentTagPermissions = [];
                const componentTagPermissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofComponentTagPermissions; i++) {
                    let tag = new Tag(i, 'T' + i);
                    let type = new PermissionType(1, 'P1', 'P1', true);
                    let permission = new Permission(1, type, false);
                    let componentTagPermission = new ComponentTagPermission(tag, [permission]);
                    //add it twice, so there is a duplicate for every tag permission
                    componentTagPermissions.push(componentTagPermission);
                    componentTagPermissions.push(componentTagPermission);
                    expected.push(componentTagPermission);
                }

                componentTagPermissionSets.push(componentTagPermissions);

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(tagPermissionComparator).should.eql(expected.sort(tagPermissionComparator));
            });
            it('should return a collapsed array of Tag Permissions when called with many Tag Permissions arrays with a length greater than 1', () => {
                const lengthOfSets = 5;
                const lengthofComponentTagPermissions = 5;
                const componentTagPermissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthOfSets; i++) {
                    let componentTagPermissions = [];
                    for (let j = 0; j < lengthofComponentTagPermissions; j++) {
                        let id = (i + '' + j)
                        let tag = new Tag(id, 'T' + id);
                        let type = new PermissionType(id, 'P' + id, 'P' + id, true);
                        let permission = new Permission(id, type, false);
                        let componentTagPermission = new ComponentTagPermission(tag, [permission]);
                        //add it twice, so there is a duplicate for every tag permission
                        componentTagPermissions.push(componentTagPermission);
                        componentTagPermissions.push(componentTagPermission);
                        expected.push(componentTagPermission);
                    }
                    componentTagPermissionSets.push(componentTagPermissions);
                }

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(tagPermissionComparator).should.eql(expected.sort(tagPermissionComparator));
            });
        });
        describe('Tag Permissions that are both duplicated and overridden', function () {
            it('should return a collapsed and overridden array of Tag Permissions when called with one Tag Permissions array with a length greater than 1', () => {
                const lengthofComponentTagPermissions = 5;
                const componentTagPermissions = [];
                const componentTagPermissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthofComponentTagPermissions; i++) {
                    let tag = new Tag(i, 'T' + i);
                    let type = new PermissionType(1, 'P1', 'P1', true);
                    let permission = new Permission(1, type, false);
                    let componentTagPermission = new ComponentTagPermission(tag, [permission]);
                    //add it twice, so there is a duplicate for every tag permission
                    componentTagPermissions.push(componentTagPermission);
                    //set the duplicate tag's permission value to true, so that it is overridden
                    permission.hasPermission = true;
                    componentTagPermission = new ComponentTagPermission(tag, [permission]);
                    componentTagPermissions.push(componentTagPermission);
                    expected.push(componentTagPermission);
                }

                componentTagPermissionSets.push(componentTagPermissions);

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(tagPermissionComparator).should.eql(expected.sort(tagPermissionComparator));
            });
            it('should return a collapsed and overridden array of Tag Permissions when called with many Tag Permissions arrays with a length greater than 1', () => {
                const lengthOfSets = 5;
                const lengthofComponentTagPermissions = 5;
                const componentTagPermissionSets = [];
                const expected = [];

                for (let i = 0; i < lengthOfSets; i++) {
                    let componentTagPermissions = [];
                    for (let j = 0; j < lengthofComponentTagPermissions; j++) {
                        let id = (i + '' + j)
                        let tag = new Tag(id, 'T' + id);
                        let type = new PermissionType(id, 'P' + id, 'P' + id, true);
                        let permission = new Permission(id, type, false);
                        let componentTagPermission = new ComponentTagPermission(tag, [permission]);
                        //add it twice, so there is a duplicate for every tag permission
                        componentTagPermissions.push(componentTagPermission);
                        //set the duplicate tag's permission value to true, so that it is overridden
                        permission.hasPermission = true;
                        componentTagPermission = new ComponentTagPermission(tag, [permission]);
                        componentTagPermissions.push(componentTagPermission);
                        expected.push(componentTagPermission);
                    }
                    componentTagPermissionSets.push(componentTagPermissions);
                }

                let observed = collapseComponentTagPermissions(componentTagPermissionSets);
                observed.length.should.eql(expected.length);
                observed.sort(tagPermissionComparator).should.eql(expected.sort(tagPermissionComparator));
            });
        });
    });
    describe('mergePermissionsWithPermissionTypes', function () {
        describe('No Permissions or Permission Types', function () {
            it('should return an empty array when called with no Permissions and no Permission Types', () => {
                let observed = mergePermissionsWithPermissionTypes([], [])
                observed.length.should.eql(0);
                observed.should.eql([]);
            });
        });
        describe('Permissions with all Permission Types', function () {
            it('should return an identical array of Permissions when called with one Permission and one Permission Type', () => {
                const permissions = [];
                const permissionTypes = [];

                let type = new PermissionType('1', 'T1', 'T1', true);
                permissionTypes.push(type);

                let permission = new Permission('1', type, false);
                permissions.push(permission);

                const expected = permissions;

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.should.eql(expected);
            });
            it('should return an identical array of Permissions when called with many Permissions and many Permission Types', () => {
                const length = 5;
                const permissions = [];
                const permissionTypes = [];

                for (let i = 0; i < length; i++) {
                    let type = new PermissionType(i, 'T' + i, 'T' + i, true);
                    permissionTypes.push(type);

                    let permission = new Permission(i, type, false);
                    permissions.push(permission);
                }

                const expected = permissions;

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
        });
        describe('Permissions with missing Permission Types', function () {
            it('should return an extended array of Permissions with the missing Permission Type when called with one Permission and one Permission Type', () => {
                const permissions = [];
                const permissionTypes = [];

                let type1 = new PermissionType('1', 'T1', 'T1', true);
                let type2 = new PermissionType('2', 'T2', 'T2', true);

                permissionTypes.push(type2);

                let permission = new Permission('1', type1, false);
                permissions.push(permission);

                let missingPermission = new Permission(null, type2, false);
                const expected = permissions.concat(missingPermission);

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.should.eql(expected);
            });
            it('should return an extended array of Permissions with the missing Permission Types when called with one Permission and many Permission Types', () => {
                const length = 5;
                const typeNotMissing = 0;
                const permissions = [];
                const permissionTypes = [];
                const expected = [];

                for (let i = 0; i < length; i++) {
                    let type = new PermissionType(i, 'T' + i, 'T' + i, true);
                    permissionTypes.push(type);
                    if (i != typeNotMissing) {
                        let missingPermission = new Permission(null, type, false);
                        expected.push(missingPermission);
                    } else {
                        let permission = new Permission(i, type, false);
                        permissions.push(permission);
                        expected.push(permission);
                    }
                }

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
            it('should return an extended array of Permissions with the missing Permission Types when called with many Permissions and many Permission Types', () => {
                const length = 5;
                const typesNotMissing = [0, 1, 2];
                const permissions = [];
                const permissionTypes = [];
                const expected = [];

                for (let i = 0; i < length; i++) {
                    let type = new PermissionType(i, 'T' + i, 'T' + i, true);
                    permissionTypes.push(type);
                    if (typesNotMissing.includes(i)) {
                        let missingPermission = new Permission(null, type, false);
                        expected.push(missingPermission);
                    } else {
                        let permission = new Permission(i, type, false);
                        permissions.push(permission);
                        expected.push(permission);
                    }
                }

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
            it('should return an extended array of Permissions with the missing Permission Type when called with many Permissions and one Permission Type', () => {
                const length = 5;
                const typeMissing = 4;
                const permissions = [];
                const permissionTypes = [];
                const expected = [];

                for (let i = 0; i < length; i++) {
                    let type = new PermissionType(i, 'T' + i, 'T' + i, true);
                    if (i == typeMissing) {
                        permissionTypes.push(type);
                        let missingPermission = new Permission(null, type, false);
                        expected.push(missingPermission);
                    } else {
                        let permission = new Permission(i, type, false);
                        permissions.push(permission);
                        expected.push(permission);
                    }
                }

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
        });
        describe('Incomplete set of Permission Types', function () {
            it('should return an identical array of Permissions when called with one Permission and no Permission Types', () => {
                const permissions = [];

                let type = new PermissionType('1', 'T1', 'T1', true);
                let permission = new Permission('1', type, false);
                permissions.push(permission);

                const expected = permissions;

                let observed = mergePermissionsWithPermissionTypes(permissions, []);
                observed.length.should.eql(expected.length);
                observed.should.eql(expected);
            });
            it('should return an identical array of Permissions when called with many Permissions and one Permission Type', () => {
                const length = 5;
                const subSetOfTypes = 1;
                const permissions = [];
                const permissionTypes = [];
                const expected = [];

                for (let i = 0; i < length; i++) {
                    let type = new PermissionType(i, 'T' + i, 'T' + i, true);
                    if (i == subSetOfTypes) {
                        permissionTypes.push(type);
                    }
                    let permission = new Permission(i, type, false);
                    permissions.push(permission);
                    expected.push(permission);
                }

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
            it('should return an identical array of Permissions when called with many Permissions and many Permission Types', () => {
                const length = 5;
                const subsetOfTypes = [0, 2, 4];
                const permissions = [];
                const permissionTypes = [];
                const expected = [];

                for (let i = 0; i < length; i++) {
                    let type = new PermissionType(i, 'T' + i, 'T' + i, true);;
                    if (subsetOfTypes.includes(i)) {
                        permissionTypes.push(type);
                    }
                    let permission = new Permission(i, type, false);
                    permissions.push(permission);
                    expected.push(permission);
                }

                let observed = mergePermissionsWithPermissionTypes(permissions, permissionTypes);
                observed.length.should.eql(expected.length);
                observed.sort(permissionComparator).should.eql(expected.sort(permissionComparator));
            });
        });
    });
});