const fs = require('fs');
const uuid = require('uuid/v4');

let data = {};

data.CoMIT_Group = [
    {
        'Id': '339c814b-94f6-49af-8508-4868caa40dde',
        'Name': 'ETI - Software Integration',
        'IsSystemAdmin': true
    },
    {
        'Id': '07ca1984-9ead-459e-865d-ca002a8c474e',
        'Name': 'System Integration Analysts',
        'IsSystemAdmin': true
    },
    {
        'Id': '65438b4b-6e51-4f84-90e3-980a96fcca66',
        'Name': 'Interoperability Application Analysts',
        'IsSystemAdmin': false
    },
    {
        'Id': uuid(),
        'Name': 'IOC Support',
        'IsSystemAdmin': false
    },
    {
        'Id': uuid(),
        'Name': 'Medipac Admins',
        'IsSystemAdmin': false
    },
    {
        'Id': uuid(),
        'Name': 'Epic Admins',
        'IsSystemAdmin': false
    }
];

data.TagType = [
    {
        'Id': uuid(),
        'Name': 'COMPONENT',
        'SystemName': 'comit',
    }
];

data.Tag = [
    {
        'Id': uuid(),
        'Name': 'dbMotion',
        'Description': '',
        'TagTypeId': data.TagType[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'Epic',
        'Description': '',
        'TagTypeId': data.TagType[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'Eligibility',
        'Description': '',
        'TagTypeId': data.TagType[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'Medipac',
        'Description': '',
        'TagTypeId': data.TagType[0].Id
    }
];

data.CoMIT_Category = [
    {
        'Id': uuid(),
        'Name': 'All',
    }
];

data.CoMIT_ComponentType = [
    {
        'Id': uuid(),
        'Name': 'send',
    },
    {
        'Id': uuid(),
        'Name': 'transform',
    },
    {
        'Id': uuid(),
        'Name': 'receive',
    }
]

data.CoMIT_Component = [
    {
        'Id': uuid(),
        'Name': 'T_EPICDM_DBMOTION',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[1].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_DBMOTION_MDM_SENDER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_DBMOTION_ADT_EPIC_SENDER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_DBMOTION_ADT_MEDIPAC_SENDER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'T_EPIC_ADT_DBMOTION',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[1].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'T_MEDIPAC_DBMOTION',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[1].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'S_EPICDM_MDM_RECEIVER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[0].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'S_EPIC_ADT_RECEIVER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[0].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'S_EPIC_SIU_RECEIVER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[0].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'S_EPIC_RAD_SIU_RECEIVER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[0].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'T_QUEST_ORU_EPIC',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[1].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_EPIC_ORU_QUEST_SENDER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'T_EPIC_270',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[1].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_HIGHMARK_270',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_MEDIPAC_271',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'S_MEDIPAC10_ADT_RECEIVER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[0].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'S_MEDIPAC9_ADT_RECEIVER',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[0].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'T_ARIA_DFT_MEDIPAC',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[1].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
    {
        'Id': uuid(),
        'Name': 'D_MEDIPAC_ADT_ARIA',
        'Description': '',
        'ComponentTypeId': data.CoMIT_ComponentType[2].Id,
        'CategoryId': data.CoMIT_Category[0].Id
    },
]

data.CoMIT_TagComponent = [
    {
        'Id': uuid(),
        'TagId': data.Tag[0].Id,
        'ComponentId': data.CoMIT_Component[0].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[0].Id,
        'ComponentId': data.CoMIT_Component[1].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[0].Id,
        'ComponentId': data.CoMIT_Component[2].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[0].Id,
        'ComponentId': data.CoMIT_Component[3].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[0].Id,
        'ComponentId': data.CoMIT_Component[4].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[0].Id,
        'ComponentId': data.CoMIT_Component[5].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[1].Id,
        'ComponentId': data.CoMIT_Component[6].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[1].Id,
        'ComponentId': data.CoMIT_Component[7].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[1].Id,
        'ComponentId': data.CoMIT_Component[8].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[1].Id,
        'ComponentId': data.CoMIT_Component[9].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[1].Id,
        'ComponentId': data.CoMIT_Component[10].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[1].Id,
        'ComponentId': data.CoMIT_Component[11].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[2].Id,
        'ComponentId': data.CoMIT_Component[12].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[2].Id,
        'ComponentId': data.CoMIT_Component[13].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[2].Id,
        'ComponentId': data.CoMIT_Component[14].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[3].Id,
        'ComponentId': data.CoMIT_Component[15].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[3].Id,
        'ComponentId': data.CoMIT_Component[16].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[3].Id,
        'ComponentId': data.CoMIT_Component[17].Id
    },
    {
        'Id': uuid(),
        'TagId': data.Tag[3].Id,
        'ComponentId': data.CoMIT_Component[18].Id
    },
]

data.PermissionType = [
    {
        'Id': uuid(),
        'Code': 'Administrator',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'View All Components',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Start/Stop All Components',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Show Stage Components',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Create Categories',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Modify Categories',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Modify Permissions',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Modify Roles',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': true
    },
    {
        'Id': uuid(),
        'Code': 'Modify Component Information',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'View Components',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'Start/Stop Components',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'Clear Queues',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'Delete First Message in Queue',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'View Queue Message Data',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'View Messages',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    },
    {
        'Id': uuid(),
        'Code': 'Replay Messages',
        'Name': '',
        'SystemName': 'comit',
        'IsSystemPermission': false
    }
];

data.Permission = [
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[0].Id,
        'Value': false
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[1].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[4].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[0].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[0].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[8].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[9].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[10].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[9].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[9].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[9].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[10].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[9].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[10].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[9].Id,
        'Value': true
    },
    {
        'Id': uuid(),
        'PermissionTypeId': data.PermissionType[10].Id,
        'Value': false
    }
];

data.CoMIT_GroupTagPermission = [
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[2].Id,
        'TagId': data.Tag[0].Id,
        'PermissionId': data.Permission[5].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[2].Id,
        'TagId': data.Tag[0].Id,
        'PermissionId': data.Permission[6].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[2].Id,
        'TagId': data.Tag[0].Id,
        'PermissionId': data.Permission[7].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[2].Id,
        'TagId': data.Tag[1].Id,
        'PermissionId': data.Permission[8].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[2].Id,
        'TagId': data.Tag[3].Id,
        'PermissionId': data.Permission[9].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[5].Id,
        'TagId': data.Tag[1].Id,
        'PermissionId': data.Permission[10].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[5].Id,
        'TagId': data.Tag[1].Id,
        'PermissionId': data.Permission[11].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[4].Id,
        'TagId': data.Tag[3].Id,
        'PermissionId': data.Permission[12].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[4].Id,
        'TagId': data.Tag[3].Id,
        'PermissionId': data.Permission[13].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[4].Id,
        'TagId': data.Tag[2].Id,
        'PermissionId': data.Permission[14].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[2].Id,
        'TagId': data.Tag[1].Id,
        'PermissionId': data.Permission[15].Id
    },
]

data.CoMIT_GroupSystemPermission = [
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[3].Id,
        'PermissionId': data.Permission[0].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[3].Id,
        'PermissionId': data.Permission[1].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[3].Id,
        'PermissionId': data.Permission[2].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[0].Id,
        'PermissionId': data.Permission[3].Id
    },
    {
        'Id': uuid(),
        'GroupId': data.CoMIT_Group[1].Id,
        'PermissionId': data.Permission[4].Id
    },
];

module.exports = data;

//Generates mock.json file
fs.writeFile('mock.json', JSON.stringify(data), function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('exported to mock.json');
    }
});
