"""
SEED MASIVO: ~800 estudiantes constantes + desercion/traslados
IE 14 - Colegio San Agustin de Lima
- Max 30 alumnos por seccion (3 secciones A,B,C por grado)
- Notas por curso y bimestre con distribucion realista
- Desercion: alumnos que estuvieron un año y al siguiente no
"""
import os, sys, django, random
from pathlib import Path
from decimal import Decimal
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
from horarios.models import Horario
from asistencia.models import Asistencia, Justificacion
from conducta.models import Conducta
from pagos.models import Pago, Pension
from comunicacion.models import Comunicado, Citacion
from alertas.models import Alerta
from libretas.models import Libreta

random.seed(2026)
IE_ID = 14
ie = InstitucionEducativa.objects.get(id=IE_ID)

# ══════════ NOMBRES PERUANOS (pool grande) ══════════
NM = ["Santiago","Mateo","Leonardo","Joaquin","Thiago","Sebastian","Benjamin","Luciano",
"Gael","Emiliano","Dylan","Adrian","Nicolas","Franco","Dante","Iker","Ian","Rafael",
"Emanuel","Rodrigo","Fabian","Cristian","Eduardo","Renato","Marcos","Gonzalo","Hugo",
"Oliver","Alvaro","Piero","Angelo","Stefano","Marcelo","Bruno","Patrick","Axel","Ariel",
"Liam","Esteban","Diego","Fernando","Andres","David","Pablo","Sergio","Manuel","Cesar",
"Javier","Ricardo","Gustavo","Hector","Mario","Victor","Alberto","Raul","Oscar","Jorge",
"Walter","Marco","Luis","Enrique","Pedro","Jose","Carlos","Miguel","Roberto","Daniel",
"Alejandro","Ivan","Arturo","Alonso","Aaron","Elias","Samuel","Gabriel","Tomas","Martin"]

NF = ["Valentina","Isabella","Camila","Luciana","Mariana","Antonella","Sophia","Daniela",
"Ariana","Victoria","Jimena","Catalina","Renata","Abril","Bianca","Samantha","Micaela",
"Romina","Adriana","Natalia","Fernanda","Alejandra","Valeria","Kiara","Estrella","Brianna",
"Maite","Celeste","Ivanna","Mia","Regina","Dulce","Ximena","Lorena","Paola","Andrea",
"Claudia","Melissa","Karla","Vanessa","Gabriela","Jessica","Priscila","Flavia","Jazmin",
"Araceli","Milagros","Rosario","Ingrid","Tatiana","Pierina","Fiorella","Grecia","Xiomara",
"Dafne","Luana","Almendra","Karina","Yamilet","Nayeli","Abigail","Zoe","Emma","Lucia"]

AP1 = ["Huaman","Quispe","Flores","Gutierrez","Rios","Vasquez","Torres","Chavez","Mendez",
"Paredes","Herrera","Silva","Luna","Espinoza","Vargas","Huanca","Ccallo","Mamani","Apaza",
"Condori","Soto","Ramirez","Castillo","Pena","Villanueva","Cruz","Cardenas","Rojas",
"Salazar","Montoya","Tapia","Reyes","Navarro","Rivera","Delgado","Benites","Sanchez",
"Pariona","Lopez","Choque","Diaz","Fernandez","Vera","Cordova","Ruiz","Alarcon","Morales",
"Aquino","Gonzales","Carpio","Barrios","Perez","Medina","Salinas","Palomino","Huamani",
"Zarate","Lozano","Espejo","Romero","Pinedo","Arevalo","Cubas","Nunez","Tello","Chambi",
"Rosas","Aguirre","Calle","Jara","Pacheco","Yupanqui","Bautista","Ramos","Suarez","Molina",
"Aguilar","Palma","Cornejo","Benavides","Falcon","Portilla","Hidalgo","Poma","Contreras",
"Zevallos","Yactayo","Montes","Huaranga","Paucar","Chumpitaz","Orellana","Quiroz","Valdez"]

AP2 = ["Villegas","Cabanillas","Infantes","Leon","Nolasco","Carrion","Bustamante","Inga",
"Aliaga","Figueroa","Jauregui","Cueva","Salvatierra","Barreto","Robles","Huayta","Caceres",
"Campos","Ibarra","Meza","Acosta","Otero","Valverde","Gallegos","Saavedra","Requena",
"Espinosa","Arce","Carbajal","Bravo","Mendoza","Porras","Segura","Cespedes","Alcantara",
"Trujillo","Camacho","Estrada","Velarde","Osorio","Miranda","Cabrera","Cano","Pinto",
"Rojas","Fuentes","Vega","Ochoa","Serrano","Guerrero","Lara","Dominguez","Navarro",
"Blanco","Mora","Heredia","Solis","Villar","Correa","Mejia","Sandoval","Davila","Alarcon",
"Alfaro","Linares","Vasquez","Calderon","Toledo","Garay","Matos","Cisneros","Becerra",
"Cuevas","Reynoso","Aranda","Duran","Mercado","Gamboa","Olivera","Chacon","Paz","Terrones",
"Huaman","Quispe","Flores","Gutierrez","Rios","Torres","Chavez","Mendez","Paredes","Silva"]

NP = ["Carlos","Miguel","Pedro","Jose","Roberto","Fernando","Ricardo","Alberto","Mario",
"Victor","Julio","Enrique","Raul","Oscar","Jorge","Hector","Cesar","Walter","Marco","Luis"]
NMA = ["Maria","Rosa","Ana","Carmen","Juana","Elena","Teresa","Lucia","Gloria","Silvia",
"Patricia","Isabel","Mercedes","Lourdes","Milagros","Gladys","Roxana","Yolanda","Norma","Flor"]

used_dnis = set(Estudiante.objects.exclude(institucion=ie).values_list('dni', flat=True))
used_doc_dnis = set(Docente.objects.exclude(institucion=ie).values_list('dni', flat=True))

def gen_dni():
    while True:
        d = str(random.randint(60000000, 79999999))
        if d not in used_dnis:
            used_dnis.add(d)
            return d

# ══════════ PASO 1: LIMPIAR TODO DE IE 14 ══════════
print("[1/9] Limpiando datos de IE 14...")
est_ie14 = Estudiante.objects.filter(institucion=ie)
est_ids = list(est_ie14.values_list('id', flat=True))

Nota.objects.filter(evaluacion__periodo__institucion=ie).delete()
Promedio.objects.filter(periodo__institucion=ie).delete()
Evaluacion.objects.filter(periodo__institucion=ie).delete()
Matricula.objects.filter(periodo__institucion=ie).delete()
Libreta.objects.filter(periodo__institucion=ie).delete()
Asistencia.objects.filter(estudiante_id__in=est_ids).delete()
Conducta.objects.filter(estudiante_id__in=est_ids).delete()
Pago.objects.filter(estudiante_id__in=est_ids).delete()
Pension.objects.filter(estudiante_id__in=est_ids).delete()
Citacion.objects.filter(estudiante_id__in=est_ids).delete()
Alerta.objects.filter(estudiante_id__in=est_ids).delete()
Comunicado.objects.filter(institucion=ie).delete()
Horario.objects.filter(seccion__grado__nivel__institucion=ie).delete()
# Limpiar apoderados vinculados solo a IE14
for ap in Apoderado.objects.filter(estudiantes__in=est_ids).distinct():
    ap.estudiantes.clear()
    if ap.usuario:
        ap.usuario.delete()
    ap.delete()
est_ie14.delete()
Seccion.objects.filter(grado__nivel__institucion=ie).delete()
Docente.objects.filter(institucion=ie).delete()
PeriodoAcademico.objects.filter(institucion=ie).delete()
Curso.objects.filter(institucion=ie).delete()
Grado.objects.filter(nivel__institucion=ie).delete()
NivelEducativo.objects.filter(institucion=ie).delete()
print("  Limpieza completada")

# ══════════ PASO 2: ESTRUCTURA ACADEMICA ══════════
print("[2/9] Creando estructura academica...")
niv_pri = NivelEducativo.objects.create(institucion=ie, nombre="Primaria")
niv_sec = NivelEducativo.objects.create(institucion=ie, nombre="Secundaria")

grados_map = {}
secciones_map = {}
for i in range(1, 7):
    g = Grado.objects.create(nivel=niv_pri, nombre=f"{i}\u00b0 de Primaria")
    grados_map[f"P{i}"] = g
    secs = []
    for letra in ["A", "B", "C"]:
        s = Seccion.objects.create(grado=g, nombre=letra)
        secs.append(s)
    secciones_map[f"P{i}"] = secs

for i in range(1, 6):
    g = Grado.objects.create(nivel=niv_sec, nombre=f"{i}\u00b0 de Secundaria")
    grados_map[f"S{i}"] = g
    secs = []
    for letra in ["A", "B", "C"]:
        s = Seccion.objects.create(grado=g, nombre=letra)
        secs.append(s)
    secciones_map[f"S{i}"] = secs

print(f"  11 grados x 3 secciones = 33 secciones creadas")

# Cursos
CURSOS_DATA = [
    ("Matematica", "Ciencias Exactas"), ("Comunicacion", "Humanidades"),
    ("Ciencia y Tecnologia", "Ciencias Naturales"), ("Personal Social", "Ciencias Sociales"),
    ("Ingles", "Idiomas"), ("Educacion Fisica", "Desarrollo Fisico"),
    ("Arte y Cultura", "Artes"), ("Computacion", "Tecnologia"),
]
cursos = []
for nombre, area in CURSOS_DATA:
    c = Curso.objects.create(institucion=ie, nombre=nombre, area=area)
    cursos.append(c)
print(f"  {len(cursos)} cursos creados")

# Periodos
periodos_por_anio = {}
for anio in [2024, 2025, 2026]:
    bims = []
    for b in range(1, 5):
        p = PeriodoAcademico.objects.create(
            institucion=ie, anio=anio,
            bimestre=f"{b}\u00b0 Bimestre",
            estado=(anio == 2026 and b == 2)
        )
        bims.append(p)
    periodos_por_anio[anio] = bims
all_periodos = []
for anio in [2024, 2025, 2026]:
    all_periodos.extend(periodos_por_anio[anio])
print(f"  {len(all_periodos)} periodos creados")

# ══════════ PASO 3: CREAR ~850 ESTUDIANTES UNICOS ══════════
print("[3/9] Creando ~850 estudiantes unicos...")
# 800 base + ~50 extras para desercion
TOTAL_UNIQUE = 850
estudiantes_all = []
nombres_usados = set()

for i in range(TOTAL_UNIQUE):
    if i % 2 == 0:
        nombre = random.choice(NM)
    else:
        nombre = random.choice(NF)
    a1 = AP1[i % len(AP1)]
    a2 = AP2[i % len(AP2)]
    apellido = f"{a1} {a2}"
    key = f"{nombre}|{apellido}"
    attempts = 0
    while key in nombres_usados:
        nombre = random.choice(NM if i % 2 == 0 else NF)
        key = f"{nombre}|{apellido}"
        attempts += 1
        if attempts > 20:
            a2 = random.choice(AP2)
            apellido = f"{a1} {a2}"
            key = f"{nombre}|{apellido}"
    nombres_usados.add(key)
    anio_nac = random.randint(2008, 2019)
    est = Estudiante(
        institucion=ie, dni=gen_dni(), nombres=nombre,
        apellidos=apellido, fecha_nacimiento=date(anio_nac, random.randint(1,12), random.randint(1,28)),
        estado=True
    )
    estudiantes_all.append(est)

Estudiante.objects.bulk_create(estudiantes_all, batch_size=500)
estudiantes_all = list(Estudiante.objects.filter(institucion=ie).order_by('id'))
print(f"  {len(estudiantes_all)} estudiantes creados")

# ══════════ PASO 4: APODERADOS ══════════
print("[4/9] Creando apoderados...")
apoderados_batch = []
for est in estudiantes_all:
    ap_parts = est.apellidos.split()
    if random.random() < 0.5:
        ap_nombre = f"{random.choice(NP)} {ap_parts[0]}"
        par = "Padre"
    else:
        ap_nombre = f"{random.choice(NMA)} {ap_parts[0]}"
        par = "Madre"
    apoderados_batch.append((est, ap_nombre, par))

# Create in batches (can't bulk_create M2M)
ap_count = 0
for est, ap_nombre, par in apoderados_batch:
    ap = Apoderado(
        nombres=ap_nombre,
        telefono=f"9{random.randint(10000000,99999999)}",
        parentesco=par
    )
    ap.save()
    ap.estudiantes.add(est)
    ap_count += 1
    if ap_count % 200 == 0:
        print(f"    {ap_count}/{len(apoderados_batch)} apoderados...")
print(f"  {ap_count} apoderados creados")

# ══════════ PASO 5: DISTRIBUCION POR AÑO CON DESERCION ══════════
print("[5/9] Distribuyendo por año con desercion/traslados...")

# Enrollment plan:
# 2024: 800 estudiantes (indices 0-799)
# 2025: 790 (30 salen, 20 nuevos entran) -> indices 0-769 + 800-819
# 2026: 795 (15 salen, 20 nuevos entran) -> base 2025 - 15 + 820-849

random.shuffle(estudiantes_all)
pool_2024 = estudiantes_all[:800]

# Desercion 2024->2025: 30 alumnos salen
desertores_2025 = random.sample(pool_2024, 30)
desertores_ids_2025 = {e.id for e in desertores_2025}
continuadores_2025 = [e for e in pool_2024 if e.id not in desertores_ids_2025]
nuevos_2025 = estudiantes_all[800:820]
pool_2025 = continuadores_2025 + nuevos_2025  # 770 + 20 = 790

# Desercion 2025->2026: 15 salen
desertores_2026 = random.sample(pool_2025, 15)
desertores_ids_2026 = {e.id for e in desertores_2026}
continuadores_2026 = [e for e in pool_2025 if e.id not in desertores_ids_2026]
nuevos_2026 = estudiantes_all[820:850]
pool_2026 = continuadores_2026 + nuevos_2026  # 775 + 30 = 805

# Marcar desertores como inactivos
for e in desertores_2025:
    if e.id not in {x.id for x in pool_2026}:
        e.estado = False
        e.save(update_fields=['estado'])
for e in desertores_2026:
    e.estado = False
    e.save(update_fields=['estado'])

pools = {2024: pool_2024, 2025: pool_2025, 2026: pool_2026}
print(f"  2024: {len(pool_2024)} | 2025: {len(pool_2025)} | 2026: {len(pool_2026)}")
print(f"  Desertores 2024->2025: {len(desertores_2025)}")
print(f"  Desertores 2025->2026: {len(desertores_2026)}")
print(f"  Nuevos 2025: {len(nuevos_2025)} | Nuevos 2026: {len(nuevos_2026)}")

# ══════════ PASO 6: MATRICULAS SIN DUPLICIDAD ══════════
print("[6/9] Creando matriculas (max 30/seccion, sin duplicados)...")

grado_keys = [f"P{i}" for i in range(1,7)] + [f"S{i}" for i in range(1,6)]
# Distribucion: ~73 por grado, 3 secciones -> ~24 por seccion
matriculas_batch = []

for anio, pool in pools.items():
    random.shuffle(pool)
    idx = 0
    n_per_grade = len(pool) // 11
    remainder = len(pool) % 11
    
    for gi, gk in enumerate(grado_keys):
        n = n_per_grade + (1 if gi < remainder else 0)
        secs = secciones_map[gk]
        for j in range(n):
            if idx >= len(pool):
                break
            sec = secs[j % 3]  # Round-robin A,B,C
            est = pool[idx]
            for periodo in periodos_por_anio[anio]:
                matriculas_batch.append(Matricula(
                    estudiante=est, periodo=periodo,
                    grado=grados_map[gk], seccion=sec
                ))
            idx += 1

Matricula.objects.bulk_create(matriculas_batch, batch_size=5000)
print(f"  {len(matriculas_batch)} matriculas creadas")

# Verificar max por seccion
from django.db.models import Count
max_sec = Matricula.objects.values('seccion__nombre','grado__nombre','periodo__anio','periodo__bimestre').annotate(c=Count('id')).order_by('-c').first()
print(f"  Max alumnos en una seccion/bimestre: {max_sec['c']} ({max_sec['grado__nombre']} {max_sec['seccion__nombre']})")

# ══════════ PASO 7: EVALUACIONES ══════════
print("[7/9] Creando evaluaciones...")
TIPOS_EVAL = [
    ("Tarea / Practica Calificada", Decimal("0.25")),
    ("Examen Parcial", Decimal("0.35")),
    ("Examen Bimestral", Decimal("0.40")),
]
eval_map = {}  # (curso_id, periodo_id) -> [(ev_id, peso)]
eval_batch = []
for p in all_periodos:
    for c in cursos:
        for tipo, peso in TIPOS_EVAL:
            eval_batch.append(Evaluacion(curso=c, periodo=p, tipo=tipo, peso=peso))

Evaluacion.objects.bulk_create(eval_batch, batch_size=2000)
# Rebuild map from DB
for ev in Evaluacion.objects.filter(periodo__institucion=ie):
    key = (ev.curso_id, ev.periodo_id)
    if key not in eval_map:
        eval_map[key] = []
    eval_map[key].append((ev.id, ev.peso))
print(f"  {len(eval_batch)} evaluaciones creadas")

# ══════════ PASO 8: NOTAS Y PROMEDIOS ══════════
print("[8/9] Generando notas realistas (esto puede tardar)...")

DIFICULTAD = {
    "Matematica": (11.5, 3.8), "Ciencia y Tecnologia": (12.5, 3.3),
    "Comunicacion": (13.0, 3.0), "Personal Social": (13.5, 2.8),
    "Ingles": (12.0, 3.5), "Computacion": (14.0, 2.5),
    "Arte y Cultura": (15.0, 2.0), "Educacion Fisica": (16.0, 1.8),
}

# Perfil por estudiante (talento base fijo)
perfil = {}
for est in estudiantes_all:
    r = random.random()
    if r < 0.12:
        perfil[est.id] = random.uniform(3.0, 5.0)
    elif r < 0.30:
        perfil[est.id] = random.uniform(1.0, 3.0)
    elif r < 0.60:
        perfil[est.id] = random.uniform(-1.0, 1.0)
    elif r < 0.82:
        perfil[est.id] = random.uniform(-3.0, -1.0)
    else:
        perfil[est.id] = random.uniform(-5.0, -3.0)

# Generar por año
notas_batch = []
proms_batch = []

for anio, pool in pools.items():
    est_ids_set = {e.id for e in pool}
    bimestres = periodos_por_anio[anio]
    
    for periodo in bimestres:
        for curso in cursos:
            media, desv = DIFICULTAD.get(curso.nombre, (13.0, 3.0))
            evals = eval_map[(curso.id, periodo.id)]
            
            for est in pool:
                mod = perfil[est.id]
                var_bim = random.uniform(-1.0, 1.0)
                notas_est = []
                
                for ev_id, peso in evals:
                    nota_raw = media + mod + var_bim + random.gauss(0, desv * 0.5)
                    if peso == Decimal("0.40"):
                        nota_raw -= random.uniform(0, 1.5)
                    elif peso == Decimal("0.25"):
                        nota_raw += random.uniform(0, 1.0)
                    nota_final = max(0, min(20, round(nota_raw)))
                    
                    notas_batch.append(Nota(
                        evaluacion_id=ev_id, estudiante_id=est.id,
                        calificacion=Decimal(str(nota_final))
                    ))
                    notas_est.append((Decimal(str(nota_final)), peso))
                
                prom_val = sum(float(n) * float(p) for n, p in notas_est)
                proms_batch.append(Promedio(
                    estudiante_id=est.id, curso=curso,
                    periodo=periodo, promedio=Decimal(str(round(prom_val, 2)))
                ))
    
    print(f"  Año {anio}: {len(pool)} alumnos procesados")

print(f"  Insertando {len(notas_batch)} notas...")
Nota.objects.bulk_create(notas_batch, batch_size=10000)
print(f"  Insertando {len(proms_batch)} promedios...")
Promedio.objects.bulk_create(proms_batch, batch_size=10000)

# ══════════ PASO 9: REPORTE FINAL ══════════
print(f"\n{'='*60}")
print(f"  REPORTE FINAL — IE 14: Colegio San Agustin de Lima")
print(f"{'='*60}")
from django.db.models import Avg, Q

total_est = Estudiante.objects.filter(institucion=ie).count()
activos = Estudiante.objects.filter(institucion=ie, estado=True).count()
inactivos = total_est - activos
print(f"\n  Estudiantes unicos: {total_est}")
print(f"  Activos: {activos} | Inactivos (desercion): {inactivos}")
print(f"  Matriculas: {Matricula.objects.filter(periodo__institucion=ie).count()}")
print(f"  Evaluaciones: {Evaluacion.objects.filter(periodo__institucion=ie).count()}")
print(f"  Notas: {Nota.objects.filter(evaluacion__periodo__institucion=ie).count()}")
print(f"  Promedios: {Promedio.objects.filter(periodo__institucion=ie).count()}")

print(f"\n  RENDIMIENTO POR CURSO:")
for c in cursos:
    st = Promedio.objects.filter(curso=c, periodo__institucion=ie).aggregate(
        p=Avg('promedio'),
        a=Count('id', filter=Q(promedio__gte=11)),
        d=Count('id', filter=Q(promedio__lt=11)),
        t=Count('id')
    )
    pct = st['a']*100//st['t'] if st['t'] else 0
    print(f"    {c.nombre:25s} | Prom:{st['p']:.1f} | Aprob:{pct}% | OK:{st['a']} FAIL:{st['d']}")

print(f"\n  ENROLLMENT POR AÑO:")
for anio in [2024, 2025, 2026]:
    n = Matricula.objects.filter(periodo__anio=anio, periodo__bimestre="1\u00b0 Bimestre", periodo__institucion=ie).count()
    print(f"    {anio}: {n} alumnos matriculados")

print(f"\n  ESTUDIANTES CON CURSOS JALADOS (acumulado):")
all_est = Estudiante.objects.filter(institucion=ie)
jala1, jala3 = 0, 0
for e in all_est:
    cj = Promedio.objects.filter(estudiante=e, promedio__lt=11).values('curso').distinct().count()
    if cj > 0: jala1 += 1
    if cj >= 3: jala3 += 1
print(f"    1+ curso jalado: {jala1}/{total_est} ({jala1*100//total_est}%)")
print(f"    3+ cursos jalados: {jala3}/{total_est} ({jala3*100//total_est}%)")

print(f"\n{'='*60}")
print(f"  SEED COMPLETADO")
print(f"{'='*60}")
