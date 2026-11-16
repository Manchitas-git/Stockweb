from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models, transaction


class Usuario(AbstractUser):
    ROLES = [
        ('ADMIN', 'Administrador'),
        ('ALMACENISTA', 'Almacenista'),
        ('GERENTE', 'Gerente'),
    ]
    rol = models.CharField(max_length=20, choices=ROLES, default='ALMACENISTA')


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre


class Proveedor(models.Model):
    nombre = models.CharField(max_length=150)
    nit = models.CharField(max_length=30, unique=True)
    telefono = models.CharField(max_length=30, blank=True)
    correo = models.EmailField(blank=True)
    direccion = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.nombre


class Bodega(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    ubicacion = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.nombre


def generar_ean13(numero):
    # 770 es el prefijo de Colombia, luego el id del producto con ceros a la izquierda
    base = '770' + str(numero).zfill(9)
    suma = 0
    for i, digito in enumerate(base):
        suma += int(digito) * (1 if i % 2 == 0 else 3)
    verificador = (10 - suma % 10) % 10
    return base + str(verificador)


class Producto(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    codigo_barras = models.CharField(max_length=13, unique=True, null=True, blank=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='productos')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, null=True, blank=True,
                                  related_name='productos')
    precio = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock_minimo = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # El codigo de barras se crea solo despues de tener el id
        if not self.codigo_barras:
            self.codigo_barras = generar_ean13(self.id)
            super().save(update_fields=['codigo_barras'])

    def __str__(self):
        return f'{self.codigo} - {self.nombre}'


class Stock(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='stocks')
    bodega = models.ForeignKey(Bodega, on_delete=models.CASCADE, related_name='stocks')
    cantidad = models.IntegerField(default=0)

    class Meta:
        unique_together = ('producto', 'bodega')

    def __str__(self):
        return f'{self.producto.nombre} en {self.bodega.nombre}: {self.cantidad}'


class Movimiento(models.Model):
    TIPOS = [
        ('ENTRADA', 'Entrada'),
        ('SALIDA', 'Salida'),
    ]
    tipo = models.CharField(max_length=10, choices=TIPOS)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='movimientos')
    bodega = models.ForeignKey(Bodega, on_delete=models.PROTECT, related_name='movimientos')
    cantidad = models.PositiveIntegerField()
    observacion = models.TextField(blank=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']

    def save(self, *args, **kwargs):
        es_nuevo = self.pk is None
        with transaction.atomic():
            super().save(*args, **kwargs)
            # Al registrar el movimiento se actualiza el stock de esa bodega
            if es_nuevo:
                stock, _ = Stock.objects.get_or_create(producto=self.producto, bodega=self.bodega)
                if self.tipo == 'ENTRADA':
                    stock.cantidad += self.cantidad
                else:
                    stock.cantidad -= self.cantidad
                stock.save()

    def __str__(self):
        return f'{self.tipo} {self.cantidad} {self.producto.nombre}'
