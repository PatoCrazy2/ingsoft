from .audit_context import set_current_user, clear_current_user

class AuditMiddleware:
    """
    Middleware que captura el usuario de la petición y lo guarda 
    en el contexto del hilo para que las señales puedan acceder a él.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            set_current_user(request.user)
        else:
            set_current_user(None)

        response = self.get_response(request)
        
        # Limpiar al terminar para evitar fugas de datos entre hilos
        clear_current_user()
        
        return response
