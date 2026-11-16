from django.db.models import Sum
from rest_framework import serializers

from .models import Bodega, Categoria, Movimiento, Producto, Proveedor, Stock, Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'is_active', 'password']

    def validate(self, data):
        if self.instance is None and not data.get('password'):
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', '')
        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'


class BodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bodega
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True, default='')
    stock_total = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['codigo_barras']

    def get_stock_total(self, obj):
        return obj.stocks.aggregate(total=Sum('cantidad'))['total'] or 0


class StockSerializer(serializers.ModelSerializer):
    producto_codigo = serializers.CharField(source='producto.codigo', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    bodega_nombre = serializers.CharField(source='bodega.nombre', read_only=True)
    stock_minimo = serializers.IntegerField(source='producto.stock_minimo', read_only=True)

    class Meta:
        model = Stock
        fields = '__all__'


class MovimientoSerializer(serializers.ModelSerializer):
    producto_codigo = serializers.CharField(source='producto.codigo', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    bodega_nombre = serializers.CharField(source='bodega.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True, default='')

    class Meta:
        model = Movimiento
        fields = '__all__'
        read_only_fields = ['usuario', 'fecha']

    def validate_cantidad(self, valor):
        if valor <= 0:
            raise serializers.ValidationError('La cantidad debe ser mayor a cero.')
        return valor

    def validate(self, data):
        # No se puede sacar mas de lo que hay en la bodega
        if data['tipo'] == 'SALIDA':
            stock = Stock.objects.filter(producto=data['producto'], bodega=data['bodega']).first()
            disponible = stock.cantidad if stock else 0
            if data['cantidad'] > disponible:
                raise serializers.ValidationError(
                    f'No hay suficiente stock en la bodega. Disponible: {disponible}.')
        return data
