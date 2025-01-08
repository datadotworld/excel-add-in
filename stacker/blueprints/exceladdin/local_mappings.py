
ECS_SERVICE_MAPPING = {
    'p': {
        'MinSize': 2,
        'MaxSize': 4,
        'Cpu': 1024,
        'Mem': 1536,
    },
    'default': {
        'MinSize': 1,
        'MaxSize': 4,
        'Cpu': 256,
        'Mem': 1536,
    },
}

NGINX_MAPPING = {
    'p': {
        'Cpu': 128,
        'Mem': 64
    },
    'default': {
        'Cpu': 32,
        'Mem': 64
    },
}

EXCEL_ADD_IN_SERVICE_ENV_VARS = {
    'p': {
        'OAUTHREDIRECTURI': 'https://excel.data.world/callback',
        'OAUTHCLIENTID': 'datadotworld-excel-addon',
        'OAUTHCLIENTSECRET': 'd2108252-770c-47a7-af0d-76dad8af7168',
        'NODEENV': 'production',
        'APIBASEURL': 'https://api.data.world/v0'
    },
    'd': {
        'OAUTHREDIRECTURI': 'https://ddw-excel.dev.data.world/callback',
        'OAUTHCLIENTID': 'datadotworld-excel-addon-dev',
        'OAUTHCLIENTSECRET': 'a2e39c5a-c421-47dd-8c4f-c6107509d8c3',
        'NODEENV': 'development',
        'APIBASEURL': 'https://ddw-corewebapp-us-east-1.dev.data.world'
    },
    'default': {
        'OAUTHREDIRECTURI': 'https://ddw-excel.dev.data.world/callback',
        'OAUTHCLIENTID': 'datadotworld-excel-addon-dev',
        'OAUTHCLIENTSECRET': 'a2e39c5a-c421-47dd-8c4f-c6107509d8c3',
        'NODEENV': 'development',
        'APIBASEURL': 'https://ddw-corewebapp-us-east-1.dev.data.world'
    }
}
