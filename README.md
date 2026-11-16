# StockWeb – Sistema web de gestión de inventario

Proyecto final de Programación en la Web (UIS, 2026-II).
Autor: Miguel Angel Aguilar Rodriguez (2240030).

Aplicación para controlar productos, entradas, salidas y existencias por bodega, con alertas de stock mínimo,
reportes en PDF/Excel y generación e impresión de códigos de barras para los productos.

## Tecnologías

- Backend: Python, Django y Django REST Framework (API REST con autenticación por token)
- Frontend: React (Vite), React Router, Bootstrap 5 y JsBarcode
- Base de datos: PostgreSQL

## Roles

| Rol | Qué puede hacer |
|---|---|
| Administrador | Todo: usuarios, productos, categorías, proveedores, bodegas, movimientos y reportes |
| Almacenista | Registrar entradas y salidas, consultar productos, stock y alertas |
| Gerente | Solo lectura: inicio, stock, movimientos y reportes |

## Cómo correrlo

### 1. Base de datos

Crear una base de datos en PostgreSQL llamada `stockweb`. Si el usuario o la clave no son `postgres/postgres`
se pueden cambiar con las variables de entorno `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` y `DB_PORT`.

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # en Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations inventario
python manage.py migrate
python manage.py cargar_datos
python manage.py runserver
```

El API queda en http://localhost:8000/api/

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | Administrador |
| almacen | almacen123 | Almacenista |
| gerente | gerente123 | Gerente |

## Código de barras

Cada producto recibe un código EAN-13 automáticamente al registrarse (prefijo 770 + id del producto).
En el formulario de nuevo producto está marcada la opción de imprimir la etiqueta al guardar; también se puede
reimprimir desde la lista de productos con el enlace "Código de barras".
