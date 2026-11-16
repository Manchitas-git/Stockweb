from django.core.management.base import BaseCommand

from inventario.models import Bodega, Categoria, Movimiento, Producto, Proveedor, Usuario


class Command(BaseCommand):
    help = 'Carga usuarios y datos de prueba para la demostración'

    def handle(self, *args, **options):
        if Usuario.objects.filter(username='admin').exists():
            self.stdout.write('Los datos de prueba ya estaban cargados.')
            return

        admin = Usuario.objects.create_superuser('admin', 'admin@stockweb.com', 'admin123',
                                                 first_name='Administrador', rol='ADMIN')
        almacen = Usuario.objects.create_user('almacen', 'almacen@stockweb.com', 'almacen123',
                                              first_name='Carlos', last_name='Pérez', rol='ALMACENISTA')
        Usuario.objects.create_user('gerente', 'gerente@stockweb.com', 'gerente123',
                                    first_name='Laura', last_name='Gómez', rol='GERENTE')

        ferreteria = Categoria.objects.create(nombre='Ferretería')
        electricos = Categoria.objects.create(nombre='Eléctricos')
        seguridad = Categoria.objects.create(nombre='Seguridad industrial')

        prov1 = Proveedor.objects.create(nombre='Ferremax S.A.S', nit='900123456-1',
                                         telefono='6076543210', correo='ventas@ferremax.com')
        prov2 = Proveedor.objects.create(nombre='Distribuciones El Voltio', nit='800987654-2',
                                         telefono='6071234567', correo='contacto@elvoltio.com')

        principal = Bodega.objects.create(nombre='Principal', ubicacion='Bucaramanga - Centro')
        norte = Bodega.objects.create(nombre='Norte', ubicacion='Bucaramanga - Zona Norte')

        datos = [
            ('P-0012', 'Tornillo 1/4"', ferreteria, prov1, 150, 100),
            ('P-0020', 'Martillo de uña', ferreteria, prov1, 25000, 10),
            ('P-0047', 'Cinta aislante', electricos, prov2, 3500, 20),
            ('P-0051', 'Cable calibre 12 (metro)', electricos, prov2, 2800, 200),
            ('P-0103', 'Guantes de nitrilo', seguridad, prov1, 12000, 50),
            ('P-0110', 'Casco de seguridad', seguridad, prov1, 35000, 15),
        ]
        productos = {}
        for codigo, nombre, categoria, proveedor, precio, minimo in datos:
            productos[codigo] = Producto.objects.create(codigo=codigo, nombre=nombre, categoria=categoria,
                                                        proveedor=proveedor, precio=precio,
                                                        stock_minimo=minimo)

        entradas = [
            ('P-0012', principal, 80), ('P-0020', principal, 30), ('P-0047', norte, 15),
            ('P-0051', principal, 500), ('P-0103', principal, 40), ('P-0110', norte, 25),
        ]
        for codigo, bodega, cantidad in entradas:
            Movimiento.objects.create(tipo='ENTRADA', producto=productos[codigo], bodega=bodega,
                                      cantidad=cantidad, usuario=admin, observacion='Inventario inicial')

        Movimiento.objects.create(tipo='SALIDA', producto=productos['P-0012'], bodega=principal,
                                  cantidad=10, usuario=almacen, observacion='Pedido obra calle 45')
        Movimiento.objects.create(tipo='SALIDA', producto=productos['P-0103'], bodega=principal,
                                  cantidad=5, usuario=almacen, observacion='Entrega a personal')

        self.stdout.write(self.style.SUCCESS('Datos de prueba cargados correctamente.'))
