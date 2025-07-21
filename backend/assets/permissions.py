# backend/assets/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserOrOwner(BasePermission):
    """
    Permite acceso al administrador o al mismo usuario (dueño del objeto).
    """

    def has_object_permission(self, request, view, obj):
        # Permitir lectura (GET) a cualquier usuario autenticado
        if request.method in SAFE_METHODS:
            return True

        # Permitir escritura solo al propio usuario o a un admin
        return request.user and (request.user.is_staff or obj == request.user)
