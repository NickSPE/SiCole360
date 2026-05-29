"""
==========================================================================
  SEED ACADÉMICO MASIVO — SIBES 360 / IE 14: Colegio San Agustín de Lima
==========================================================================
Objetivo:
  - Llevar a ~140 estudiantes en IE 14 (actualmente tiene 80)
  - Crear notas por curso y por bimestre (4 bimestres por año: 2024, 2025, 2026)
  - Proporción realista: ~45% de alumnos jalan al menos 1 curso
  - Distribución de notas con curva natural (Matemática más difícil, Ed. Física más fácil)
  - DNIs y nombres peruanos únicos, sin duplicados
  - Matrícula en todos los bimestres
  - Evaluaciones: 3 por curso/bimestre (Tarea 25%, Examen Parcial 35%, Examen Bimestral 40%)
  - Promedios precalculados matemáticamente correctos
  
Libretas: En el sistema peruano de EBR, se entregan 2 libretas por año:
  - 1ra Libreta: al final del 2° Bimestre (consolidado Bim I + Bim II) 
  - 2da Libreta: al final del 4° Bimestre (consolidado Bim III + Bim IV)
  El filtro en la UI sería por bimestre individual para notas y por semestre para libretas.
==========================================================================
"""

import os
import sys
import django
import random
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
from datetime import date

sys.stdout.reconfigure(encoding='utf-8')
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from instituciones.models import InstitucionEducativa
from estudiantes.models import Estudiante
from apoderados.models import Apoderado
from academico.models import NivelEducativo, Grado, Seccion, Curso, PeriodoAcademico
from notas.models import Evaluacion, Nota, Promedio
from matricula.models import Matricula
from docentes.models import Docente

random.seed(42)  # Reproducibilidad

IE_ID = 14  # Colegio San Agustín de Lima
ie = InstitucionEducativa.objects.get(id=IE_ID)

# ═══════════════════════════════════════════════════
#  PASO 0: Obtener DNIs existentes para evitar duplicados
# ═══════════════════════════════════════════════════
existing_dnis = set(Estudiante.objects.values_list('dni', flat=True))
existing_apoderado_names = set(Apoderado.objects.values_list('nombres', flat=True))
print(f"[INFO] DNIs existentes: {len(existing_dnis)}")

# ═══════════════════════════════════════════════════
#  PASO 1: Nombres peruanos realistas para 60 nuevos estudiantes
# ═══════════════════════════════════════════════════
NOMBRES_M = [
    "Santiago", "Mateo", "Leonardo", "Joaquin", "Thiago", "Sebastian",
    "Benjamin", "Luciano", "Gael", "Maximiliano", "Emiliano", "Dylan",
    "Adrian", "Nicolas", "Franco", "Dante", "Iker", "Ian",
    "Rafael", "Emanuel", "Rodrigo", "Fabian", "Cristian", "Eduardo",
    "Renato", "Marcos", "Gonzalo", "Hugo", "Oliver", "Alvaro",
    "Piero", "Angelo", "Stefano", "Marcelo", "Bruno", "Patrick",
    "Axel", "Ariel", "Liam", "Esteban"
]

NOMBRES_F = [
    "Valentina", "Isabella", "Camila", "Luciana", "Mariana", "Antonella",
    "Sophia", "Daniela", "Ariana", "Victoria", "Jimena", "Catalina",
    "Renata", "Abril", "Bianca", "Samantha", "Micaela", "Romina",
    "Adriana", "Natalia", "Fernanda", "Alejandra", "Valeria", "Kiara",
    "Estrella", "Brianna", "Maite", "Celeste", "Ivanna", "Mia"
]

APELLIDOS = [
    "Huaman Quispe", "Flores Gutierrez", "Rios Vasquez", "Torres Chavez",
    "Mendez Paredes", "Herrera Silva", "Luna Espinoza", "Vargas Huanca",
    "Ccallo Mamani", "Apaza Condori", "Soto Ramirez", "Castillo Pena",
    "Villanueva Cruz", "Cardenas Rojas", "Salazar Montoya", "Tapia Reyes",
    "Navarro Huaman", "Rivera Delgado", "Benites Sanchez", "Pariona Lopez",
    "Quispe Taype", "Choque Flores", "Diaz Fernandez", "Vera Cordova",
    "Ruiz Alarcon", "Morales Aquino", "Gonzales Carpio", "Barrios Perez",
    "Medina Salinas", "Palomino Huamani", "Zarate Cuellar", "Lozano Velez",
    "Espejo Romero", "Pinedo Arevalo", "Cubas Burga", "Nunez Tello",
    "Chambi Huanca", "Rosas Aguirre", "Calle Jara", "Pacheco Yupanqui",
    "Bautista Ramos", "Suarez Molina", "Aguilar Palma", "Cornejo Benavides",
    "Falcon Portilla", "Hidalgo Poma", "Contreras Zevallos", "Yactayo Montes",
    "Huaranga Paucar", "Chumpitaz Orellana", "Quiroz Valdez", "Villegas Cabanillas",
    "Infantes Leon", "Nolasco Carrion", "Bustamante Inga", "Aliaga Figueroa",
    "Jauregui Cueva", "Salvatierra Pumacayo", "Barreto Chuquimia", "Robles Huayta"
]

# Nombres de apoderados peruanos
NOMBRES_PADRES = [
    "Carlos", "Miguel", "Pedro", "Jose", "Roberto", "Fernando",
    "Ricardo", "Alberto", "Mario", "Victor", "Julio", "Enrique",
    "Raul", "Oscar", "Jorge", "Hector", "Cesar", "Walter",
    "Marco", "Luis", "Manuel", "Francisco", "Andres", "Javier",
    "Gustavo", "Sergio", "Daniel", "Pablo", "Alejandro", "David"
]
NOMBRES_MADRES = [
    "Maria", "Rosa", "Ana", "Carmen", "Juana", "Elena",
    "Teresa", "Lucia", "Gloria", "Silvia", "Patricia", "Isabel",
    "Mercedes", "Lourdes", "Milagros", "Gladys", "Roxana", "Betty",
    "Yolanda", "Norma", "Flor", "Nelly", "Karina", "Sonia",
    "Luz", "Dora", "Pilar", "Ruth", "Angelica", "Elvira"
]


def gen_dni():
    """Genera un DNI único de 8 dígitos."""
    while True:
        d = str(random.randint(60000000, 79999999))
        if d not in existing_dnis:
            existing_dnis.add(d)
            return d


def gen_apoderado_dni():
    """Genera un DNI para apoderado."""
    return gen_dni()


# ═══════════════════════════════════════════════════
#  PASO 2: Obtener estructura académica IE 14
# ═══════════════════════════════════════════════════
niveles = NivelEducativo.objects.filter(institucion=ie)
grados = Grado.objects.filter(nivel__in=niveles).order_by('id')
secciones = Seccion.objects.filter(grado__in=grados).order_by('id')
cursos_ie14 = Curso.objects.filter(institucion=ie)
periodos_ie14 = PeriodoAcademico.objects.filter(institucion=ie).order_by('anio', 'id')

print(f"\n[INFO] Estructura IE 14:")
print(f"  Niveles: {niveles.count()}")
print(f"  Grados: {grados.count()}")
print(f"  Secciones: {secciones.count()}")
print(f"  Cursos: {cursos_ie14.count()}")
print(f"  Periodos: {periodos_ie14.count()}")

# Mapeo de secciones por grado
secciones_por_grado = {}
for g in grados:
    secciones_por_grado[g.id] = list(Seccion.objects.filter(grado=g))

# ═══════════════════════════════════════════════════
#  PASO 3: Crear 60 nuevos estudiantes + apoderados
# ═══════════════════════════════════════════════════
print(f"\n[PASO 3] Creando 60 nuevos estudiantes y apoderados...")

nuevos_estudiantes = []
nombres_usados = set()

for i in range(60):
    # Alternar entre masculino y femenino
    if i % 2 == 0:
        nombre = random.choice(NOMBRES_M)
    else:
        nombre = random.choice(NOMBRES_F)
    
    apellido = APELLIDOS[i]
    nombre_completo = f"{nombre} {apellido}"
    
    # Evitar repeticiones exactas
    while nombre_completo in nombres_usados:
        if i % 2 == 0:
            nombre = random.choice(NOMBRES_M)
        else:
            nombre = random.choice(NOMBRES_F)
        nombre_completo = f"{nombre} {apellido}"
    nombres_usados.add(nombre_completo)
    
    # Fecha de nacimiento realista (entre 6 y 17 años)
    anio_nac = random.randint(2009, 2020)
    mes_nac = random.randint(1, 12)
    dia_nac = random.randint(1, 28)
    
    est = Estudiante.objects.create(
        institucion=ie,
        dni=gen_dni(),
        nombres=nombre,
        apellidos=apellido,
        fecha_nacimiento=date(anio_nac, mes_nac, dia_nac),
        estado=True
    )
    nuevos_estudiantes.append(est)
    
    # Crear apoderado (padre o madre)
    ap_apellidos = apellido.split()
    if random.random() < 0.5:
        # Padre
        ap_nombre = random.choice(NOMBRES_PADRES)
        ap_full = f"{ap_nombre} {ap_apellidos[0]}" if len(ap_apellidos) > 0 else f"{ap_nombre} {apellido}"
        parentesco = "Padre"
    else:
        # Madre
        ap_nombre = random.choice(NOMBRES_MADRES)
        ap_full = f"{ap_nombre} {ap_apellidos[0]}" if len(ap_apellidos) > 0 else f"{ap_nombre} {apellido}"
        parentesco = "Madre"
    
    # Evitar nombre duplicado de apoderado
    counter = 0
    original_ap_full = ap_full
    while ap_full in existing_apoderado_names:
        counter += 1
        ap_full = f"{original_ap_full} {counter}"
    existing_apoderado_names.add(ap_full)
    
    ap = Apoderado(
        nombres=ap_full,
        telefono=f"9{random.randint(10000000, 99999999)}",
        correo=None,  # No crear usuario automáticamente
        parentesco=parentesco
    )
    ap.save()
    ap.estudiantes.add(est)

print(f"  ✅ {len(nuevos_estudiantes)} estudiantes creados")
print(f"  ✅ Apoderados vinculados")

# ═══════════════════════════════════════════════════
#  PASO 4: Distribuir TODOS los 140 estudiantes en secciones
# ═══════════════════════════════════════════════════
print(f"\n[PASO 4] Distribuyendo estudiantes en secciones...")

# Obtener TODOS los estudiantes de IE 14
todos_est_ie14 = list(Estudiante.objects.filter(institucion=ie).order_by('id'))
random.shuffle(todos_est_ie14)
print(f"  Total estudiantes IE 14: {len(todos_est_ie14)}")

# Distribución por grado (11 grados x 2 secciones = 22 secciones)
# Primaria: 6 grados. Secundaria: 5 grados.
# Distribución natural: más alumnos en primaria baja, menos en secundaria alta
distribucion_por_grado = {
    # Primaria
    59: 16,  # 1° Primaria -> 16 alumnos (8+8)
    60: 15,  # 2° Primaria -> 15 alumnos (8+7)
    61: 14,  # 3° Primaria -> 14 alumnos (7+7)
    62: 13,  # 4° Primaria -> 13 alumnos (7+6)
    63: 13,  # 5° Primaria -> 13 alumnos (7+6)
    64: 12,  # 6° Primaria -> 12 alumnos (6+6)
    # Secundaria
    65: 14,  # 1° Secundaria -> 14 alumnos (7+7)
    66: 13,  # 2° Secundaria -> 13 alumnos (7+6)
    67: 12,  # 3° Secundaria -> 12 alumnos (6+6)
    68: 10,  # 4° Secundaria -> 10 alumnos (5+5)
    69: 8,   # 5° Secundaria -> 8 alumnos (4+4)
}
# Total: 16+15+14+13+13+12+14+13+12+10+8 = 140 ✅

# Asignar a secciones A y B equitativamente
idx = 0
asignacion = {}  # estudiante_id -> (grado_id, seccion_id)
for grado_id, cantidad in distribucion_por_grado.items():
    secciones_g = secciones_por_grado[grado_id]
    mitad = (cantidad + 1) // 2
    for j in range(cantidad):
        if idx >= len(todos_est_ie14):
            break
        est = todos_est_ie14[idx]
        sec = secciones_g[0] if j < mitad else secciones_g[1]
        asignacion[est.id] = (grado_id, sec.id)
        idx += 1

print(f"  ✅ {idx} estudiantes asignados a grados y secciones")

# ═══════════════════════════════════════════════════
#  PASO 5: Limpiar matrículas, evaluaciones, notas y promedios existentes de IE 14
# ═══════════════════════════════════════════════════
print(f"\n[PASO 5] Limpiando datos académicos existentes de IE 14...")

# Eliminar notas y promedios vinculados
notas_borradas = Nota.objects.filter(evaluacion__periodo__institucion=ie).count()
Nota.objects.filter(evaluacion__periodo__institucion=ie).delete()
print(f"  Notas eliminadas: {notas_borradas}")

prom_borrados = Promedio.objects.filter(periodo__institucion=ie).count()
Promedio.objects.filter(periodo__institucion=ie).delete()
print(f"  Promedios eliminados: {prom_borrados}")

eval_borradas = Evaluacion.objects.filter(periodo__institucion=ie).count()
Evaluacion.objects.filter(periodo__institucion=ie).delete()
print(f"  Evaluaciones eliminadas: {eval_borradas}")

mat_borradas = Matricula.objects.filter(periodo__institucion=ie).count()
Matricula.objects.filter(periodo__institucion=ie).delete()
print(f"  Matrículas eliminadas: {mat_borradas}")

# ═══════════════════════════════════════════════════
#  PASO 6: Crear matrículas para TODOS los bimestres
# ═══════════════════════════════════════════════════
print(f"\n[PASO 6] Creando matrículas por bimestre...")

periodos = list(PeriodoAcademico.objects.filter(institucion=ie).order_by('anio', 'id'))
matriculas_creadas = 0

for periodo in periodos:
    for est_id, (grado_id, seccion_id) in asignacion.items():
        Matricula.objects.create(
            estudiante_id=est_id,
            periodo=periodo,
            grado_id=grado_id,
            seccion_id=seccion_id,
        )
        matriculas_creadas += 1

print(f"  ✅ {matriculas_creadas} matrículas creadas ({len(asignacion)} alumnos x {len(periodos)} bimestres)")

# ═══════════════════════════════════════════════════
#  PASO 7: Crear evaluaciones por curso/bimestre
# ═══════════════════════════════════════════════════
print(f"\n[PASO 7] Creando evaluaciones (3 por curso/bimestre)...")

TIPOS_EVALUACION = [
    ("Tarea / Practica Calificada", Decimal("0.25")),
    ("Examen Parcial", Decimal("0.35")),
    ("Examen Bimestral", Decimal("0.40")),
]

evaluaciones_creadas = 0
eval_map = {}  # (curso_id, periodo_id) -> [(evaluacion_id, peso)]

for periodo in periodos:
    for curso in cursos_ie14:
        evals_de_curso = []
        for tipo, peso in TIPOS_EVALUACION:
            ev = Evaluacion.objects.create(
                curso=curso,
                periodo=periodo,
                tipo=tipo,
                peso=peso
            )
            evals_de_curso.append((ev.id, peso))
            evaluaciones_creadas += 1
        eval_map[(curso.id, periodo.id)] = evals_de_curso

print(f"  ✅ {evaluaciones_creadas} evaluaciones creadas")

# ═══════════════════════════════════════════════════
#  PASO 8: Generar notas con distribución realista
# ═══════════════════════════════════════════════════
print(f"\n[PASO 8] Generando notas con distribución realista...")

# Dificultad por curso (afecta la media de notas)
# Escala vigesimal peruana: 0-20, aprueba con 11
DIFICULTAD_CURSO = {
    "Matematica": {"media": 11.5, "desv": 3.8},         # El más difícil
    "Ciencia y Tecnologia": {"media": 12.5, "desv": 3.3},
    "Comunicacion": {"media": 13.0, "desv": 3.0},
    "Personal Social": {"media": 13.5, "desv": 2.8},
    "Ingles": {"media": 12.0, "desv": 3.5},
    "Computacion": {"media": 14.0, "desv": 2.5},
    "Arte y Cultura": {"media": 15.0, "desv": 2.0},      # El más fácil
    "Educacion Fisica": {"media": 16.0, "desv": 1.8},     # Casi todos aprueban
}

# Perfiles de estudiante: cada uno tiene un "talento base" fijo
perfil_estudiante = {}
for est in todos_est_ie14:
    # Generamos un modificador personal: algunos son buenos estudiantes, otros no
    # Distribución: ~20% buenos (mod +2 a +4), ~30% promedio (mod -1 a +1), ~50% variados
    r = random.random()
    if r < 0.15:
        mod = random.uniform(3.0, 5.0)   # Estudiante sobresaliente (~15%)
    elif r < 0.35:
        mod = random.uniform(1.0, 3.0)   # Estudiante bueno (~20%)
    elif r < 0.65:
        mod = random.uniform(-1.0, 1.0)  # Estudiante promedio (~30%)
    elif r < 0.85:
        mod = random.uniform(-3.0, -1.0) # Estudiante con dificultades (~20%)
    else:
        mod = random.uniform(-5.0, -3.0) # Estudiante con serias dificultades (~15%)
    
    perfil_estudiante[est.id] = mod

# Generar notas
notas_batch = []
promedios_batch = []
total_notas = 0
total_promedios = 0

for periodo in periodos:
    for curso in cursos_ie14:
        dif = DIFICULTAD_CURSO.get(curso.nombre, {"media": 13.0, "desv": 3.0})
        evals = eval_map[(curso.id, periodo.id)]
        
        for est_id in asignacion.keys():
            mod = perfil_estudiante[est_id]
            
            # Variación bimestral (simula que algunos bimestres van mejor/peor)
            var_bim = random.uniform(-1.0, 1.0)
            
            notas_est = []
            for ev_id, peso in evals:
                # Nota base = media_curso + modificador_personal + variacion_bimestral + ruido
                nota_raw = dif["media"] + mod + var_bim + random.gauss(0, dif["desv"] * 0.5)
                
                # Ajuste por tipo de evaluación (exámenes tienden a ser más bajos)
                if peso == Decimal("0.40"):  # Examen bimestral
                    nota_raw -= random.uniform(0, 1.5)
                elif peso == Decimal("0.25"):  # Tarea
                    nota_raw += random.uniform(0, 1.0)
                
                # Clamping a rango [0, 20]
                nota_final = max(0, min(20, round(nota_raw)))
                nota_decimal = Decimal(str(nota_final))
                
                notas_batch.append(Nota(
                    evaluacion_id=ev_id,
                    estudiante_id=est_id,
                    calificacion=nota_decimal
                ))
                notas_est.append((nota_decimal, peso))
                total_notas += 1
            
            # Calcular promedio ponderado
            promedio_val = sum(float(n) * float(p) for n, p in notas_est)
            promedio_dec = Decimal(str(round(promedio_val, 2)))
            
            promedios_batch.append(Promedio(
                estudiante_id=est_id,
                curso=curso,
                periodo=periodo,
                promedio=promedio_dec
            ))
            total_promedios += 1

# Inserción masiva
print(f"  Insertando {total_notas} notas en lote...")
Nota.objects.bulk_create(notas_batch, batch_size=5000)
print(f"  ✅ Notas insertadas")

print(f"  Insertando {total_promedios} promedios en lote...")
Promedio.objects.bulk_create(promedios_batch, batch_size=5000)
print(f"  ✅ Promedios insertados")

# ═══════════════════════════════════════════════════
#  PASO 9: Reporte de estadísticas finales
# ═══════════════════════════════════════════════════
print(f"\n{'='*60}")
print(f"  REPORTE FINAL DE DATOS ACADÉMICOS — IE 14")
print(f"{'='*60}")

total_est = Estudiante.objects.filter(institucion=ie).count()
print(f"\n  📊 Total estudiantes: {total_est}")
print(f"  📊 Total matrículas: {matriculas_creadas}")
print(f"  📊 Total evaluaciones: {evaluaciones_creadas}")
print(f"  📊 Total notas: {total_notas}")
print(f"  📊 Total promedios: {total_promedios}")

# Estadísticas de rendimiento
from django.db.models import Avg, Count, Q

print(f"\n  📈 RENDIMIENTO POR CURSO (TODOS LOS BIMESTRES):")
for curso in cursos_ie14:
    stats = Promedio.objects.filter(curso=curso, periodo__institucion=ie).aggregate(
        prom=Avg('promedio'),
        aprobados=Count('id', filter=Q(promedio__gte=11)),
        desaprobados=Count('id', filter=Q(promedio__lt=11)),
        total=Count('id')
    )
    tasa_aprob = stats['aprobados'] * 100 / stats['total'] if stats['total'] > 0 else 0
    print(f"    {curso.nombre:25s} | Prom: {stats['prom']:.1f} | Aprob: {tasa_aprob:.0f}% | ✅{stats['aprobados']} ❌{stats['desaprobados']}")

print(f"\n  📈 RENDIMIENTO POR BIMESTRE:")
for periodo in periodos:
    stats = Promedio.objects.filter(periodo=periodo).aggregate(
        prom=Avg('promedio'),
        aprobados=Count('id', filter=Q(promedio__gte=11)),
        desaprobados=Count('id', filter=Q(promedio__lt=11)),
        total=Count('id')
    )
    tasa_aprob = stats['aprobados'] * 100 / stats['total'] if stats['total'] > 0 else 0
    print(f"    {periodo.bimestre} {periodo.anio} | Prom: {stats['prom']:.1f} | Aprob: {tasa_aprob:.0f}% | ✅{stats['aprobados']} ❌{stats['desaprobados']}")

# Estudiantes con cursos jalados
print(f"\n  📈 ESTUDIANTES CON CURSOS JALADOS:")
est_con_jala = 0
est_con_3_jala = 0
for est in todos_est_ie14:
    cursos_jalados = Promedio.objects.filter(
        estudiante=est, 
        promedio__lt=11
    ).values('curso').distinct().count()
    if cursos_jalados > 0:
        est_con_jala += 1
    if cursos_jalados >= 3:
        est_con_3_jala += 1

print(f"    Con al menos 1 curso jalado: {est_con_jala}/{total_est} ({est_con_jala*100//total_est}%)")
print(f"    Con 3+ cursos jalados: {est_con_3_jala}/{total_est} ({est_con_3_jala*100//total_est}%)")

print(f"\n{'='*60}")
print(f"  ✅ SEED ACADÉMICO COMPLETADO EXITOSAMENTE")
print(f"{'='*60}")
