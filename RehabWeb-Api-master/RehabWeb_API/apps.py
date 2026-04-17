from django.apps import AppConfig

class RehabwebApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'RehabWeb_API'
    verbose_name = 'RehabWeb API Core'

    def ready(self):
        # Importamos las señales para que se registren al iniciar la app
        import RehabWeb_API.signals
