from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Bodega, Categoria, Movimiento, Producto, Proveedor, Stock, Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (('Rol en StockWeb', {'fields': ('rol',)}),)
    list_display = ('username', 'first_name', 'last_name', 'rol', 'is_active')


admin.site.register(Categoria)
admin.site.register(Proveedor)
admin.site.register(Bodega)
admin.site.register(Producto)
admin.site.register(Stock)
admin.site.register(Movimiento)
