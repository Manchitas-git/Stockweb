from django.contrib.auth import authenticate
from django.db.models import F, ProtectedError, Q
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bodega, Categoria, Movimiento, Producto, Proveedor, Stock, Usuario
from .permissions import AdminOSoloLectura, PuedeRegistrarMovimientos, PuedeVerReportes, SoloAdmin
from .reportes import generar_reporte
from .serializers import (BodegaSerializer, CategoriaSerializer, MovimientoSerializer,
                          ProductoSerializer, ProveedorSerializer, StockSerializer,
                          UsuarioSerializer)


def datos_usuario(usuario):
    return {
        'id': usuario.id,
        'username': usuario.username,
        'nombre': usuario.get_full_name() or usuario.username,
        'rol': usuario.rol,
    }


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        usuario = authenticate(username=request.data.get('username'),
                               password=request.data.get('password'))
        if usuario is None:
            return Response({'detail': 'Usuario o contraseña incorrectos.'}, status=400)
        token, _ = Token.objects.get_or_create(user=usuario)
        return Response({'token': token.key, 'usuario': datos_usuario(usuario)})


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Sesión cerrada.'})


class BorradoSeguroMixin:
    """Si el registro tiene datos relacionados no se deja borrar y se avisa al usuario."""

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({'detail': 'No se puede eliminar porque tiene registros asociados.'},
                            status=400)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('username')
    serializer_class = UsuarioSerializer
    permission_classes = [SoloAdmin]


class CategoriaViewSet(BorradoSeguroMixin, viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by('nombre')
    serializer_class = CategoriaSerializer
    permission_classes = [AdminOSoloLectura]


class ProveedorViewSet(BorradoSeguroMixin, viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('nombre')
    serializer_class = ProveedorSerializer
    permission_classes = [AdminOSoloLectura]


class BodegaViewSet(BorradoSeguroMixin, viewsets.ModelViewSet):
    queryset = Bodega.objects.all().order_by('nombre')
    serializer_class = BodegaSerializer
    permission_classes = [AdminOSoloLectura]


class ProductoViewSet(BorradoSeguroMixin, viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [AdminOSoloLectura]

    def get_queryset(self):
        productos = Producto.objects.select_related('categoria', 'proveedor').order_by('codigo')
        buscar = self.request.query_params.get('buscar')
        categoria = self.request.query_params.get('categoria')
        if buscar:
            productos = productos.filter(Q(nombre__icontains=buscar) | Q(codigo__icontains=buscar))
        if categoria:
            productos = productos.filter(categoria_id=categoria)
        return productos


def filtrar_stock(params):
    stock = Stock.objects.select_related('producto', 'bodega').order_by('producto__codigo', 'bodega__nombre')
    if params.get('producto'):
        stock = stock.filter(producto_id=params.get('producto'))
    if params.get('bodega'):
        stock = stock.filter(bodega_id=params.get('bodega'))
    if params.get('bajo') == '1':
        stock = stock.filter(cantidad__lt=F('producto__stock_minimo'))
    return stock


def filtrar_movimientos(params):
    movimientos = Movimiento.objects.select_related('producto', 'bodega', 'usuario')
    if params.get('tipo'):
        movimientos = movimientos.filter(tipo=params.get('tipo'))
    if params.get('producto'):
        movimientos = movimientos.filter(producto_id=params.get('producto'))
    if params.get('bodega'):
        movimientos = movimientos.filter(bodega_id=params.get('bodega'))
    if params.get('desde'):
        movimientos = movimientos.filter(fecha__date__gte=params.get('desde'))
    if params.get('hasta'):
        movimientos = movimientos.filter(fecha__date__lte=params.get('hasta'))
    return movimientos


class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    def get_queryset(self):
        return filtrar_stock(self.request.query_params)


class MovimientoViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                        mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    # Los movimientos no se editan ni se borran para no descuadrar el stock
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer
    permission_classes = [PuedeRegistrarMovimientos]

    def get_queryset(self):
        return filtrar_movimientos(self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class DashboardView(APIView):
    def get(self, request):
        hoy = timezone.localdate()
        stock_bajo = filtrar_stock({'bajo': '1'})
        return Response({
            'productos': Producto.objects.count(),
            'stock_bajo': stock_bajo.count(),
            'entradas_hoy': Movimiento.objects.filter(tipo='ENTRADA', fecha__date=hoy).count(),
            'salidas_hoy': Movimiento.objects.filter(tipo='SALIDA', fecha__date=hoy).count(),
            'lista_stock_bajo': StockSerializer(stock_bajo, many=True).data,
        })


class ReporteView(APIView):
    permission_classes = [PuedeVerReportes]

    def get(self, request, tipo):
        formato = request.query_params.get('formato', 'pdf')

        if tipo == 'stock':
            titulo = 'Reporte de stock por bodega'
            encabezados = ['Código', 'Producto', 'Bodega', 'Stock', 'Mínimo']
            filas = [[s.producto.codigo, s.producto.nombre, s.bodega.nombre, s.cantidad,
                      s.producto.stock_minimo] for s in filtrar_stock(request.query_params)]
        elif tipo == 'movimientos':
            titulo = 'Reporte de movimientos'
            encabezados = ['Fecha', 'Tipo', 'Código', 'Producto', 'Bodega', 'Cantidad', 'Usuario']
            filas = []
            for m in filtrar_movimientos(request.query_params):
                fecha = timezone.localtime(m.fecha).strftime('%Y-%m-%d %H:%M')
                usuario = m.usuario.username if m.usuario else ''
                filas.append([fecha, m.get_tipo_display(), m.producto.codigo, m.producto.nombre,
                              m.bodega.nombre, m.cantidad, usuario])
        else:
            return Response({'detail': 'Tipo de reporte no válido.'}, status=400)

        return generar_reporte(titulo, encabezados, filas, formato, f'reporte_{tipo}')
