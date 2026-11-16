from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('usuarios', views.UsuarioViewSet)
router.register('categorias', views.CategoriaViewSet)
router.register('proveedores', views.ProveedorViewSet)
router.register('bodegas', views.BodegaViewSet)
router.register('productos', views.ProductoViewSet)
router.register('stock', views.StockViewSet)
router.register('movimientos', views.MovimientoViewSet)

urlpatterns = [
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('dashboard/', views.DashboardView.as_view()),
    path('reportes/<str:tipo>/', views.ReporteView.as_view()),
    path('', include(router.urls)),
]
