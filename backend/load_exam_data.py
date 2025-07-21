# medical/load_exam_data.py
# Coloca este archivo en la carpeta de tu aplicación 'medical' (ej. backend/medical/load_exam_data.py)

import os
import django

# Configura el entorno de Django
# Asegúrate de que 'invgate_backend.settings' sea la ruta correcta a tu archivo settings.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'invgate_backend.settings')
django.setup()

from medical.models import ExamCategory, ExamItem # Importa tus modelos

def load_exam_data():
    """
    Carga la lista COMPLETA de categorías de exámenes y ítems de examen
    basados en la imagen proporcionada por el usuario.
    """
    print("Iniciando carga de datos de exámenes (lista completa)...")

    # Opcional: Descomenta si quieres limpiar datos antes de cargar
    # Útil si quieres empezar desde cero, pero get_or_create ya maneja duplicados.
    # print("Eliminando datos de exámenes existentes...")
    # ExamItem.objects.all().delete()
    # ExamCategory.objects.all().delete()
    # print("Datos existentes eliminados.")

    exam_categories_data = [
        {"name": "EXÁMENES RADIOLÓGICOS", "order": 1, "items": [
            {"name": "Laringe lateral, cavum", "code": "04 01 002", "description": "Laringofaríngeo (laringofarinx)"},
            {"name": "Tórax con equipo portátil", "code": "04 01 003", "description": ""},
            {"name": "Tórax AP o LAT simple", "code": "04 01 009", "description": ""},
            {"name": "Tórax AP/L", "code": "04 01 070", "description": ""},
            {"name": "Abdomen simple", "code": "04 01 013", "description": ""},
            {"name": "Abdomen simple, proy. Compl.", "code": "04 01 014", "description": ""},
            {"name": "PPN, Órbitas, ATM, malar, cara cigomático / Horopios", "code": "04 01 031", "description": ""},
            {"name": "Cráneo AP/L", "code": "04 01 032", "description": ""},
            {"name": "Cráneo (Towne)", "code": "04 01 033", "description": ""},
            {"name": "Col. cervical o atlas-axis AP/L", "code": "04 01 042", "description": ""},
            {"name": "Col. cervical AP/L y OBL", "code": "04 01 043", "description": ""},
            {"name": "Col. dorsal o dorsolumbar localizada AP/L", "code": "04 10 451", "description": ""},
            {"name": "Parrilla costal adultos", "code": "04 01 044", "description": ""},
            {"name": "Parrilla costal adultos", "code": "04 01 046", "description": ""},
            {"name": "Col. lumbar o lumbosacra flexión y extensión (Dinámicas)", "code": "04 01 047", "description": ""},
            {"name": "Col. lumbar o lumbosacra oblicuas", "code": "04 01 048", "description": ""},
            {"name": "Col. total, panorámica con folio", "code": "04 01 049", "description": "graduado AP y LAT"},
            {"name": "Col. total, panorámica con folio", "code": "04 01 050", "description": "graduado AP y LAT (Cód. x2)"},
            {"name": "Pelvis, cadera o coxofemoral", "code": "04 01 051", "description": ""},
            {"name": "Pelvis, cadera o coxofemoral", "code": "04 01 052", "description": "(menor de 6 años)"},
            {"name": "Cadera rotación interna, Lawenstein", "code": "04 01 053", "description": ""},
            {"name": "Sacroilíacas o articulaciones sacroilíacas", "code": "04 01 054", "description": ""},
            {"name": "Brazo, antebrazo, codo, muñeca, mano, dedos, pie AP/L", "code": "04 01 055", "description": ""},
            {"name": "Clavícula", "code": "04 01 056", "description": ""},
            {"name": "Estudio radiológico de articulaciones", "code": "04 01 058", "description": ""},
            {"name": "Muñeca o tobillo AP/L y OBL", "code": "04 01 059", "description": ""},
            {"name": "Hombro, fémur, rodilla, pierna, costilla o esternón AP/L", "code": "04 01 060", "description": ""},
            {"name": "Proy. especiales en hombro, brazo, codo, muñeca, mano, dedos, pie, tobillo, axiales, axiales rotulianas", "code": "04 01 062", "description": ""},
            {"name": "Túnel intercondíleo o radiocarpiano", "code": "04 01 063", "description": ""},
            {"name": "Renal simple", "code": "04 01 028", "description": ""},
            {"name": "Vesical simple o perivesical", "code": "04 01 029", "description": ""},
            {"name": "Col. cervical, flexión y extensión (Dinámicas)", "code": "04 01 044", "description": ""},
            {"name": "Edad ósea: carpo y mano", "code": "04 01 056", "description": ""},
        ]},
        {"name": "TAC", "order": 2, "items": [
            {"name": "Cráneo encefálico", "code": "04 03 001", "description": ""},
            {"name": "Hipotálamo-hipófisis", "code": "04 03 002", "description": ""},
            {"name": "Fosa posterior", "code": "04 03 003", "description": ""},
            {"name": "Temporal-oído", "code": "04 03 006", "description": ""},
            {"name": "Órbitas maxilofacial", "code": "04 03 007", "description": ""},
            {"name": "Columna cervical", "code": "04 03 008", "description": ""},
            {"name": "Columna dorsal, incluye mínima 8 espacios", "code": "04 03 018", "description": ""},
            {"name": "Columna Lumbar", "code": "04 03 019", "description": ""},
            {"name": "Cuello, partes blandas", "code": "04 03 012", "description": ""},
            {"name": "Tórax", "code": "04 03 013", "description": ""},
            {"name": "Abdomen", "code": "04 03 014", "description": ""},
            {"name": "Pelvis", "code": "04 03 016", "description": ""},
            {"name": "Musculoesquelético c/ segmento", "code": "04 03 017", "description": ""},
            {"name": "Angio de encéfalo (*)", "code": "04 03 101", "description": ""},
            {"name": "Angio de abdomen (*)", "code": "04 03 102", "description": ""},
            {"name": "Angio de cuello (*)", "code": "04 03 103", "description": ""},
            {"name": "Angio de pelvis (*)", "code": "04 03 104", "description": ""},
            {"name": "Angio de tórax (*)", "code": "04 03 105", "description": ""},
        ]},
        {"name": "ECOTOMOGRAFÍAS", "order": 3, "items": [
            {"name": "Abdominal (incluye hígado, vía biliar, páncreas, bazo, riñones, grandes vasos retroperitoneales y grandes vasos)", "code": "04 04 001", "description": ""},
            {"name": "Caves (riñón y vejiga, o crecimiento de vías urinarias, partes blandas, etc.)", "code": "04 04 002", "description": ""},
            {"name": "Pélvica masculina (incluye vejiga y próstata)", "code": "04 04 003", "description": ""},
            {"name": "Renal (bilateral, o de bazo)", "code": "04 04 004", "description": ""},
            {"name": "Testicular (uno o ambos) (incluye doppler)", "code": "04 04 010", "description": ""},
            {"name": "Tiroides (incluye doppler)", "code": "04 04 014", "description": ""},
            {"name": "Partes blandas o musculoesquelética (*)", "code": "04 04 015", "description": "indicar zona"},
            {"name": "Vascular (arterial y venosa) periférica (bilateral)", "code": "04 04 118", "description": ""},
            {"name": "Doppler de vasos del cuello", "code": "04 04 119", "description": ""},
        ]},
        {"name": "MAMOGRAFÍAS", "order": 4, "items": [
            {"name": "Mamografía bilateral", "code": "04 01 010", "description": ""},
            {"name": "Mamografía proyección complementaria", "code": "04 01 011", "description": ""},
            {"name": "Marcación preparatoria de lesiones de la mama", "code": "04 01 012", "description": ""},
            {"name": "Mama, pieza operatoria", "code": "04 01 013", "description": ""},
        ]},
        {"name": "RESONANCIA MAGNÉTICA", "order": 5, "items": [
            {"name": "Cráneo encefálico u oídos, bilateral", "code": "04 05 001", "description": ""},
            {"name": "Hipotálamo-hipófisis", "code": "04 05 002", "description": ""},
            {"name": "Columna cervical", "code": "04 05 004", "description": ""},
            {"name": "Columna dorsal", "code": "04 05 006", "description": ""},
            {"name": "Columna lumbar", "code": "04 05 007", "description": ""},
            {"name": "Angiografía de encéfalo (*)", "code": "04 05 017", "description": ""},
            {"name": "Tórax (*)", "code": "04 05 009", "description": ""},
            {"name": "Abdomen (*)", "code": "04 05 010", "description": ""},
            {"name": "Pelvis", "code": "04 05 011", "description": ""},
            {"name": "Abdomen y pelvis", "code": "04 05 012", "description": ""},
            {"name": "Colangioresonancia", "code": "04 05 098", "description": ""},
            {"name": "Rodilla", "code": "04 05 003", "description": ""},
            {"name": "Columna total (cervical, dorsal, lumbar)", "code": "04 05 016", "description": ""},
            {"name": "Hombro", "code": "04 05 008", "description": ""},
        ]},
    ]

    for category_data in exam_categories_data:
        category, created = ExamCategory.objects.get_or_create(
            name=category_data["name"],
            defaults={"order": category_data["order"]}
        )
        if created:
            print(f"Categoría creada: {category.name}")
        else:
            print(f"Categoría existente: {category.name}")
            category.order = category_data["order"] # Actualizar orden si ya existía
            category.save()

        for item_data in category_data["items"]:
            item, created = ExamItem.objects.get_or_create(
                code=item_data["code"],
                defaults={
                    "category": category,
                    "name": item_data["name"],
                    "description": item_data["description"]
                }
            )
            if created:
                print(f"  - Ítem de examen creado: {item.name} ({item.code})")
            else:
                print(f"  - Ítem de examen existente: {item.name} ({item.code})")
                # Opcional: actualizar nombre/descripción si ya existía
                item.name = item_data["name"]
                item.description = item_data["description"]
                item.category = category
                item.save()

    print("Carga de datos de exámenes completada.")

if __name__ == "__main__":
    load_exam_data()
