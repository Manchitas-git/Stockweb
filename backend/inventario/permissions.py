from rest_framework.permissions import SAFE_METHODS, BasePermission


def tiene_rol(request, roles):
    return request.user.is_authenticated and request.user.rol in roles


class SoloAdmin(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request, ['ADMIN'])


class AdminOSoloLectura(BasePermission):
    """Todos pueden consultar, pero solo el administrador crea, edita o elimina."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.rol == 'ADMIN'


class PuedeRegistrarMovimientos(BasePermission):
    """Todos ven el historial, pero solo admin y almacenista registran entradas y salidas."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.rol in ['ADMIN', 'ALMACENISTA']


class PuedeVerReportes(BasePermission):
    def has_permission(self, request, view):
        return tiene_rol(request, ['ADMIN', 'GERENTE'])
