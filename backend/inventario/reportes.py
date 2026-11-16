from io import BytesIO

from django.http import HttpResponse
from django.utils import timezone
from openpyxl import Workbook
from openpyxl.styles import Font
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generar_reporte(titulo, encabezados, filas, formato, nombre_archivo):
    if formato == 'excel':
        return reporte_excel(titulo, encabezados, filas, nombre_archivo)
    return reporte_pdf(titulo, encabezados, filas, nombre_archivo)


def reporte_excel(titulo, encabezados, filas, nombre_archivo):
    libro = Workbook()
    hoja = libro.active
    hoja.title = 'Reporte'
    hoja.append([titulo])
    hoja['A1'].font = Font(bold=True, size=14)
    hoja.append([f'Generado: {timezone.localtime().strftime("%Y-%m-%d %H:%M")}'])
    hoja.append([])
    hoja.append(encabezados)
    for celda in hoja[4]:
        celda.font = Font(bold=True)
    for fila in filas:
        hoja.append(fila)
    for columna in hoja.columns:
        hoja.column_dimensions[columna[0].column_letter].width = 20

    buffer = BytesIO()
    libro.save(buffer)
    respuesta = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    respuesta['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.xlsx"'
    return respuesta


def reporte_pdf(titulo, encabezados, filas, nombre_archivo):
    buffer = BytesIO()
    documento = SimpleDocTemplate(buffer, pagesize=letter)
    estilos = getSampleStyleSheet()

    tabla = Table([encabezados] + filas, repeatRows=1)
    tabla.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f3a5f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f3f6')]),
    ]))

    contenido = [
        Paragraph(f'StockWeb - {titulo}', estilos['Title']),
        Paragraph(f'Generado: {timezone.localtime().strftime("%Y-%m-%d %H:%M")}', estilos['Normal']),
        Spacer(1, 12),
        tabla if filas else Paragraph('No hay datos para mostrar.', estilos['Normal']),
    ]
    documento.build(contenido)

    respuesta = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    respuesta['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.pdf"'
    return respuesta
