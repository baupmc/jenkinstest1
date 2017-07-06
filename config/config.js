module.exports = {
    runtime: {
        port: 31000,
        wsport: 31500
    },
    activedirectory: {
        url: 'ldap://acct.upmchs.net:389',
        //url: 'ldap://10.25.213.11:389',
        baseDN: 'DC=ACCT,DC=UPMCHS,DC=NET',
        username: 'galaxydev@upmc.edu',
        password: 'xvXp75$9'
    },
    email: {
        hostname: 'hubrelay.upmc.edu',
        port: 25
    },
    passport: {
        identityMetadata: 'https://login.microsoftonline.com/upmchs.onmicrosoft.com/v2.0/.well-known/openid-configuration',
        clientID: '03d4c382-8e60-4858-982e-b6745b0491fc',
        validateIssuer: true,
        issuer: 'https://sts.windows.net/8b3dd73e-4e72-4679-b191-56da1588712b/',
        passReqToCallback: false
    },
    token: {
        algorithm: 'HS512',
        issuer: 'THIS_SHOULD_BE_A_UUID',
        expiresIn: '3600s',
        maxAge: '1y'
    },
    keys: {
        secret: 'secret'
    },
    solr: [
        {
            hostname: 'z01dev00.isd.upmc.edu',
            port: '8983'
        },
        {
            hostname: 'z01dev01.isd.upmc.edu',
            port: '8983'
        },
        {
            hostname: 'z01dev02.isd.upmc.edu',
            port: '8983'
        }
    ],
    sql: {
        domain: '1UPMC-ACCT',
        user: 'galaxydev',
        password: 'xvXp75$9',
        server: 'winintssdev02.acct.upmchs.net',
        options: {
            port: 1433,
            database: 'galaxydb',
            instancename: 'MSSQLSERVER'
        }
    },
    sqlTest: {
        domain: '1UPMC-ACCT',
        user: 'galaxydev',
        password: 'xvXp75$9',
        server: 'winintssdev02.acct.upmchs.net',
        options: {
            port: 1433,
            database: 'galaxydb-test',
            instancename: 'MSSQLSERVER'
        }
    },
    hbaseTest: {
        hostname: '192.168.56.101',
        port: '8070'
    },
    ibmMq: {
        //url: 'https://z03dev10.isd.upmc.edu:1401/ibmmq/rest/v1/',
        url: 'http://localhost:8080/',
        user: 'galaxydev',
        password: 'xvXp75$9'
    },
    logId: {
        id: '9cf32144-5686-417d-bd99-e4e03884e776'
    }
}