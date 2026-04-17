import threading

# Thread-local storage para el usuario actual
_thread_locals = threading.local()

def set_current_user(user):
    """Establece el usuario del request en el hilo actual."""
    _thread_locals.user = user

def get_current_user():
    """Recupera el usuario del hilo actual."""
    return getattr(_thread_locals, 'user', None)

def clear_current_user():
    """Limpia el usuario del hilo actual."""
    if hasattr(_thread_locals, 'user'):
        del _thread_locals.user
