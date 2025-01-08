from blueprints.ecs.web_service import WebService, WebServiceConfig

from . import local_mappings


class ExcelAddInEcsService(WebService):

    def service_config(self):
        return WebServiceConfig(
            'excel-add-in',
            health_check='/',
            public_service=True,
        )

    def app_env_vars(self):
        return super(ExcelAddInEcsService, self).app_env_vars() + [
            ('OAUTH_REDIRECT_URI', self.find_mapping('excelAddInServiceEnvVars', 'OAUTHREDIRECTURI')),
            ('OAUTH_CLIENT_ID', self.find_mapping('excelAddInServiceEnvVars', 'OAUTHCLIENTID')),
            ('OAUTH_CLIENT_SECRET', self.find_mapping('excelAddInServiceEnvVars', 'OAUTHCLIENTSECRET')),
            ('NODE_ENV', self.find_mapping('excelAddInServiceEnvVars', 'NODEENV')),
            ('API_BASE_URL', self.find_mapping('excelAddInServiceEnvVars', 'APIBASEURL')),
        ]

    def nginx_mapping(self):
        return local_mappings.NGINX_MAPPING

    def service_mapping(self):
        return local_mappings.ECS_SERVICE_MAPPING

    def add_mappings(self):
        super(ExcelAddInEcsService, self).add_mappings()
        self.template.add_mapping('excelAddInServiceEnvVars', local_mappings.EXCEL_ADD_IN_SERVICE_ENV_VARS)
