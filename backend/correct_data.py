import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'invgate_backend.settings')
django.setup()

from medical.models import ExamItem, ExamCategory

# Mapeo de corrección completo y verificado
correction_map = {
    '┴': 'Á', 'Ë': 'É', 'Í': 'Í', 'Ó': 'Ó', 'Ú': 'Ú',
    'ß': 'á', 'è': 'á', 'ì': 'í', 'î': 'í', 'ò': 'ó',
    'ù': 'ú', 'Ú': 'ú', 'Ü': 'ü', '°': 'º', '·': 'í', 'Ý': 'í',
    '¾': 'ó', '±': 'ñ', 'ñ': 'ñ', 'Ñ': 'Ñ', 'æ': 'ä', 'Æ': 'Ä', '»': 'ú',
    'é': 'é', 'ë': 'ë', 'í': 'í', 'ó': 'ó', 'ú': 'ú',
    'É': 'É', 'ü': 'ü', 'ú': 'ú', '═': 'Í', '╔': 'É'
}

def clean_string_final(s):
    """Reemplaza caracteres garabateados y maneja valores nulos."""
    # Si el valor es nulo o no es un string, lo reemplazamos con un valor predeterminado
    if s is None or not isinstance(s, str):
        return "N/A"

    # Corregir errores de copia/pegado
    s = s.replace('AngiografÝa de encÚfalo', 'Angiografía de encéfalo')
    s = s.replace('Hombro, fÚmur', 'Hombro, fémur')
    s = s.replace('MusculoesquelÚtico', 'Musculoesquelético')
    s = s.replace('Tínel', 'Túnel')
    s = s.replace('perifÚrica', 'periférica')
    s = s.replace('PÚlvica', 'Pélvica') 
    s = s.replace('T¾rax', 'Tórax')

    # Usar el mapeo para el resto de caracteres
    for old, new in correction_map.items():
        s = s.replace(old, new)

    return s

def run_data_correction():
    print("Iniciando la corrección de nombres de exámenes...")
    for item in ExamItem.objects.all():
        new_name = clean_string_final(item.name)
        if new_name != item.name:
            print(f"Corrigiendo item: '{item.name}' -> '{new_name}'")
            item.name = new_name
            item.save()

    print("\nIniciando la corrección de nombres de categorías...")
    for category in ExamCategory.objects.all():
        new_name = clean_string_final(category.name)
        if new_name != category.name:
            print(f"Corrigiendo categoría: '{category.name}' -> '{new_name}'")
            category.name = new_name
            category.save()

    print("\nProceso de corrección de datos completado.")

run_data_correction()