import os
import sys
import django
import random
from pathlib import Path
from decimal import Decimal
from datetime import date, datetime, timedelta

# Set stdout to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, os.path.join(BASE_DIR, 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sibes360.settings')
django.setup()

from django.db import transaction
from django.contrib.auth import get_user_model
from django.apps import apps

# Import models
from instituciones.models import InstitucionEducativa
from usuarios.models import Rol, Usuario
from estudiantes.models import Estudiante
from apoderados.models import Apoderado
from docentes.models import Docente
from academico.models import NivelEducativo, Grado, Seccion, Curso, PeriodoAcademico
from matricula.models import Matricula
from horarios.models import Horario
from asistencia.models import Asistencia, Justificacion
from notas.models import Evaluacion, Nota, Promedio
from libretas.models import Libreta
from conducta.models import Conducta
from pagos.models import Pago, Pension
from comunicacion.models import Comunicado, Citacion
from alertas.models import Alerta
from reportes.models import Reporte

random.seed(42)

# Names pools
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
       "Fuentes","Vega","Ochoa","Serrano","Guerrero","Lara","Dominguez","Blanco","Mora",
       "Heredia","Solis","Villar","Correa","Mejia","Sandoval","Davila","Alfaro","Linares",
       "Calderon","Toledo","Garay","Matos","Cisneros","Becerra","Cuevas","Reynoso","Aranda",
       "Duran","Mercado","Gamboa","Olivera","Chacon","Paz","Terrones"]

NP = ["Carlos","Miguel","Pedro","Jose","Roberto","Fernando","Ricardo","Alberto","Mario",
      "Victor","Julio","Enrique","Raul","Oscar","Jorge","Hector","Cesar","Walter","Marco","Luis"]

NMA = ["Maria","Rosa","Ana","Carmen","Juana","Elena","Teresa","Lucia","Gloria","Silvia",
       "Patricia","Isabel","Mercedes","Lourdes","Milagros","Gladys","Roxana","Yolanda","Norma","Flor"]

used_dnis = set()

def gen_dni():
    while True:
        d = str(random.randint(60000000, 79999999))
        if d not in used_dnis:
            used_dnis.add(d)
            return d

def main():
    print("=== INICIANDO SEEDING COMPLETO Y COHERENTE ===")
    
    try:
        with transaction.atomic():
            # ----------------------------------------------------
            # 1. LIMPIEZA ABSOLUTA EN ORDEN
            # ----------------------------------------------------
            print("[1/14] Limpiando base de datos...")
            Alerta.objects.all().delete()
            Reporte.objects.all().delete()
            Citacion.objects.all().delete()
            Comunicado.objects.all().delete()
            Pago.objects.all().delete()
            Pension.objects.all().delete()
            Conducta.objects.all().delete()
            Libreta.objects.all().delete()
            Nota.objects.all().delete()
            Promedio.objects.all().delete()
            Evaluacion.objects.all().delete()
            Justificacion.objects.all().delete()
            Asistencia.objects.all().delete()
            Horario.objects.all().delete()
            Matricula.objects.all().delete()
            Docente.objects.all().delete()
            Apoderado.objects.all().delete()
            Estudiante.objects.all().delete()
            Curso.objects.all().delete()
            Seccion.objects.all().delete()
            Grado.objects.all().delete()
            NivelEducativo.objects.all().delete()
            PeriodoAcademico.objects.all().delete()
            
            # Clean non-superuser accounts
            Usuario.objects.filter(is_superuser=False).delete()
            Rol.objects.all().delete()
            InstitucionEducativa.objects.all().delete()
            
            print("  Base de datos vaciada con éxito.")

            # ----------------------------------------------------
            # 2. INSTITUCIÓN Y ROLES
            # ----------------------------------------------------
            print("[2/14] Creando Institución Educativa y Roles...")
            ie = InstitucionEducativa.objects.create(
                id=14,
                nombre="Colegio Pre Universitario Cimafiq",
                ruc="20123456789",
                direccion="Av. Universitaria 1234, Lima",
                telefono="01-4567890",
                estado=True
            )
            
            rol_admin = Rol.objects.create(nombre_rol="Director", descripcion="Director de la institución")
            rol_docente = Rol.objects.create(nombre_rol="Docente", descripcion="Personal docente")
            rol_apoderado = Rol.objects.create(nombre_rol="Apoderado", descripcion="Padre/Madre/Tutor")
            rol_estudiante = Rol.objects.create(nombre_rol="Estudiante", descripcion="Alumno matriculado")

            
            # Ensure we have at least one clean admin user with the Director role
            admin_user, created = Usuario.objects.get_or_create(username="admin")
            admin_user.first_name = "Administrador"
            admin_user.last_name = "General"
            admin_user.email = "admin@cimafiq.edu.pe"
            admin_user.institucion = ie
            admin_user.rol = rol_admin
            admin_user.estado = True
            admin_user.dni = "00000001"
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password("admin123")
            admin_user.save()

                
            print(f"  IE: {ie.nombre} (ID: {ie.id}) creada.")

            # ----------------------------------------------------
            # 3. ESTRUCTURA ACADÉMICA
            # ----------------------------------------------------
            print("[3/14] Creando Niveles, Grados, Secciones, Cursos y Periodos...")
            niv_pri = NivelEducativo.objects.create(institucion=ie, nombre="Primaria")
            niv_sec = NivelEducativo.objects.create(institucion=ie, nombre="Secundaria")
            
            grados_map = {}
            secciones_map = {}
            
            # Primaria 1° a 6°
            for i in range(1, 7):
                g = Grado.objects.create(nivel=niv_pri, nombre=f"{i}° de Primaria")
                grados_map[f"P{i}"] = g
                secciones_map[f"P{i}"] = [
                    Seccion.objects.create(grado=g, nombre="A"),
                    Seccion.objects.create(grado=g, nombre="B")
                ]
                
            # Secundaria 1° a 5°
            for i in range(1, 6):
                g = Grado.objects.create(nivel=niv_sec, nombre=f"{i}° de Secundaria")
                grados_map[f"S{i}"] = g
                secciones_map[f"S{i}"] = [
                    Seccion.objects.create(grado=g, nombre="A"),
                    Seccion.objects.create(grado=g, nombre="B")
                ]
                
            # Cursos
            cursos_info = [
                ("Matematica", "Ciencias Exactas"),
                ("Comunicacion", "Humanidades"),
                ("Ciencia y Tecnologia", "Ciencias Naturales"),
                ("Personal Social", "Ciencias Sociales"),
                ("Ingles", "Idiomas"),
                ("Educacion Fisica", "Desarrollo Fisico"),
                ("Arte y Cultura", "Artes"),
                ("Computacion", "Tecnologia")
            ]
            cursos = []
            for nombre, area in cursos_info:
                c = Curso.objects.create(institucion=ie, nombre=nombre, area=area)
                cursos.append(c)
                
            # Periodos Académicos (2024, 2025, 2026)
            periodos_por_anio = {}
            for anio in [2024, 2025, 2026]:
                periodos_por_anio[anio] = []
                for bim in range(1, 5):
                    # El bimestre activo actual del sistema de pruebas será 2026 2° Bimestre
                    is_active = (anio == 2026 and bim == 2)
                    p = PeriodoAcademico.objects.create(
                        institucion=ie,
                        anio=anio,
                        bimestre=f"{bim}° Bimestre",
                        estado=is_active
                    )
                    periodos_por_anio[anio].append(p)
                    
            print(f"  Estructura creada: 11 grados, 22 secciones, {len(cursos)} cursos.")

            # ----------------------------------------------------
            # 4. DOCENTES Y HORARIOS SIN TRASLAPES (ALGORITMO ESTRICTO)
            # ----------------------------------------------------
            print("[4/14] Creando Docentes y asignando Horarios con 0 traslapes...")
            docentes = []
            # Crear 16 docentes (2 por cada uno de los 8 cursos para cubrir Primaria/Secundaria)
            for idx, (curso_nombre, area) in enumerate(cursos_info):
                c_obj = next(c for c in cursos if c.nombre == curso_nombre)
                for doc_idx in range(1, 3):
                    dni_val = gen_dni()
                    nom = random.choice(NM) if doc_idx == 1 else random.choice(NF)
                    ape = f"{random.choice(AP1)} {random.choice(AP2)}"
                    full_name = f"{nom} {ape}"
                    
                    # Cuenta de usuario para docente
                    usr = Usuario.objects.create(
                        username=f"docente_{curso_nombre.lower().replace(' ', '_')}_{doc_idx}",
                        first_name=nom,
                        last_name=ape,
                        email=f"{nom.lower()}.{ape.lower().replace(' ', '')}@cimafiq.edu.pe",
                        institucion=ie,
                        rol=rol_docente,
                        estado=True,
                        dni=dni_val
                    )
                    usr.set_password("docente123")
                    usr.save()
                    
                    d = Docente.objects.create(
                        institucion=ie,
                        dni=dni_val,
                        nombres=full_name,
                        especialidad=curso_nombre,
                        estado=True
                    )
                    docentes.append((d, c_obj))
            
            # Asignación de Horarios: Lunes a Viernes, 3 bloques diarios
            # Slot 1: 08:00 - 09:30
            # Slot 2: 09:30 - 11:00
            # Slot 3: 11:30 - 13:00
            dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
            slots = [
                (time(8, 0), time(9, 30)),
                (time(9, 30), time(11, 0)),
                (time(11, 30), time(13, 0))
            ]
            
            # Estructura para registrar disponibilidad
            busy_teachers = {d[0].id: set() for d in docentes}
            busy_sections = {}
            for gk, secs in secciones_map.items():
                for s in secs:
                    busy_sections[s.id] = set()
                    
            horarios_totales = 0
            
            for gk, secs in secciones_map.items():
                for sec in secs:
                    cursos_programar = list(cursos)
                    random.shuffle(cursos_programar)
                    
                    for curso_obj in cursos_programar:
                        docentes_c = [d[0] for d in docentes if d[1].id == curso_obj.id]
                        scheduled = False
                        
                        dias_slots = [(d, s_idx) for d in dias for s_idx in range(len(slots))]
                        random.shuffle(dias_slots)
                        
                        for dia, slot_idx in dias_slots:
                            if (dia, slot_idx) in busy_sections[sec.id]:
                                continue
                            
                            doc_libre = None
                            for d_c in docentes_c:
                                if (dia, slot_idx) not in busy_teachers[d_c.id]:
                                    doc_libre = d_c
                                    break
                            
                            if doc_libre:
                                Horario.objects.create(
                                    docente=doc_libre,
                                    curso=curso_obj,
                                    seccion=sec,
                                    dia=dia,
                                    hora_inicio=slots[slot_idx][0],
                                    hora_fin=slots[slot_idx][1]
                                )
                                busy_teachers[doc_libre.id].add((dia, slot_idx))
                                busy_sections[sec.id].add((dia, slot_idx))
                                scheduled = True
                                horarios_totales += 1
                                break
                                
                        if not scheduled:
                            print(f"  [ADVERTENCIA] No se pudo agendar el curso {curso_obj.nombre} para Sección {sec.grado.nombre} - {sec.nombre}")
            
            print(f"  ✅ {horarios_totales} horarios semanales creados sin ningún traslape.")

            # ----------------------------------------------------
            # 5. ESTUDIANTES Y APODERADOS COHERENTES (400 ESTUDIANTES)
            # ----------------------------------------------------
            print("[5/14] Creando 400 Estudiantes y sus Apoderados (árbol familiar 100% coherente)...")
            
            estudiantes_data = []
            alumnos_creados = 0
            familia_idx = 0
            
            used_student_names = set()
            used_parent_names = set()
            
            while alumnos_creados < 400:
                num_hijos = 2 if (random.random() < 0.35 and alumnos_creados < 399) else 1
                
                ap1 = AP1[familia_idx % len(AP1)]
                ap2 = AP2[familia_idx % len(AP2)]
                apellidos_hijos = f"{ap1} {ap2}"
                
                is_father = random.random() < 0.5
                parent_nom = random.choice(NP) if is_father else random.choice(NMA)
                parent_full = f"{parent_nom} {ap1}"
                
                counter = 0
                original_parent_full = parent_full
                while parent_full in used_parent_names:
                    counter += 1
                    parent_full = f"{original_parent_full} {counter}"
                used_parent_names.add(parent_full)
                
                parent_dni = gen_dni()
                
                usr_parent = Usuario.objects.create(
                    username=f"apoderado_{parent_dni}",
                    first_name=parent_nom,
                    last_name=ap1,
                    email=f"{parent_nom.lower()}.{ap1.lower()}@mail.com",
                    institucion=ie,
                    rol=rol_apoderado,
                    estado=True,
                    dni=parent_dni
                )
                usr_parent.set_password("apoderado123")
                usr_parent.save()
                
                apoderado_obj = Apoderado.objects.create(
                    nombres=parent_full,
                    telefono=f"9{random.randint(10000000, 99999999)}",
                    correo=usr_parent.email,
                    parentesco="Padre" if is_father else "Madre",
                    usuario=usr_parent
                )
                
                for h_idx in range(num_hijos):
                    is_male = random.random() < 0.5
                    nom = random.choice(NM) if is_male else random.choice(NF)
                    
                    full_name = f"{nom} {apellidos_hijos}"
                    while full_name in used_student_names:
                        nom = random.choice(NM if is_male else NF)
                        full_name = f"{nom} {apellidos_hijos}"
                    used_student_names.add(full_name)
                    
                    ref_idx = alumnos_creados
                    if ref_idx < 220:
                        anio_nac = 2018 - (ref_idx // 38)
                    else:
                        anio_nac = 2012 - ((ref_idx - 220) // 36)
                        
                    mes_nac = random.randint(1, 12)
                    dia_nac = random.randint(1, 28)
                    
                    est = Estudiante.objects.create(
                        institucion=ie,
                        dni=gen_dni(),
                        nombres=nom,
                        apellidos=apellidos_hijos,
                        fecha_nacimiento=date(anio_nac, mes_nac, dia_nac),
                        estado=True
                    )
                    
                    apoderado_obj.estudiantes.add(est)
                    estudiantes_data.append(est)
                    alumnos_creados += 1
                    
                familia_idx += 1
                
            print(f"  ✅ 400 Estudiantes y {familia_idx} Apoderados creados exitosamente.")

            # ----------------------------------------------------
            # 6. MATRÍCULAS Y DESERCIÓN POR AÑO
            # ----------------------------------------------------
            print("[6/14] Creando Matrículas con historial de Deserción y Nuevos Ingresos...")
            
            random.shuffle(estudiantes_data)
            
            base_2024 = estudiantes_data[:340]
            nuevos_2025 = estudiantes_data[340:375]
            nuevos_2026 = estudiantes_data[375:400]
            
            desertores_2025 = set(base_2024[:20])
            activos_2025_de_2024 = [e for e in base_2024 if e not in desertores_2025]
            pool_2025 = activos_2025_de_2024 + nuevos_2025
            
            desertores_2026 = set(pool_2025[:15])
            activos_2026_de_2025 = [e for e in pool_2025 if e not in desertores_2026]
            pool_2026 = activos_2026_de_2025 + nuevos_2026
            
            alumnos_matriculados_2026_ids = {e.id for e in pool_2026}
            for est in estudiantes_data:
                if est.id not in alumnos_matriculados_2026_ids:
                    est.estado = False
                    est.save(update_fields=['estado'])
            
            pools_por_anio = {
                2024: base_2024,
                2025: pool_2025,
                2026: pool_2026
            }
            
            grado_keys = [f"P{i}" for i in range(1, 7)] + [f"S{i}" for i in range(1, 6)]
            
            matriculas_creadas = 0
            historial_matriculas = {}
            
            for anio in [2024, 2025, 2026]:
                pool = pools_por_anio[anio]
                random.shuffle(pool)
                
                n_por_grado = len(pool) // 11
                rem = len(pool) % 11
                
                idx = 0
                for g_idx, gk in enumerate(grado_keys):
                    cant = n_por_grado + (1 if g_idx < rem else 0)
                    secs = secciones_map[gk]
                    
                    for c_idx in range(cant):
                        if idx >= len(pool):
                            break
                        est = pool[idx]
                        sec = secs[c_idx % 2]
                        
                        for periodo in periodos_por_anio[anio]:
                            Matricula.objects.create(
                                estudiante=est,
                                periodo=periodo,
                                grado=grados_map[gk],
                                seccion=sec,
                                fecha=date(anio, 3, 1) + timedelta(days=random.randint(0, 10))
                            )
                            matriculas_creadas += 1
                            
                        if est.id not in historial_matriculas:
                            historial_matriculas[est.id] = {}
                        historial_matriculas[est.id][anio] = (grados_map[gk], sec)
                        idx += 1
                        
            print(f"  ✅ {matriculas_creadas} matrículas registradas para 2024-2026.")

            # ----------------------------------------------------
            # 7. EVALUACIONES
            # ----------------------------------------------------
            print("[7/14] Creando evaluaciones por curso/bimestre...")
            
            TIPOS_EVAL = [
                ("Tarea / Practica Calificada", Decimal("0.25")),
                ("Examen Parcial", Decimal("0.35")),
                ("Examen Bimestral", Decimal("0.40")),
            ]
            
            evaluaciones = []
            evals_map = {}
            
            for anio in [2024, 2025, 2026]:
                for periodo in periodos_por_anio[anio]:
                    for curso in cursos:
                        evals_de_curso = []
                        for tipo, peso in TIPOS_EVAL:
                            ev = Evaluacion.objects.create(
                                curso=curso,
                                periodo=periodo,
                                tipo=tipo,
                                peso=peso
                            )
                            evaluaciones.append(ev)
                            evals_de_curso.append((ev.id, peso))
                        evals_map[(curso.id, periodo.id)] = evals_de_curso
                        
            print(f"  ✅ {len(evaluaciones)} evaluaciones registradas.")

            # ----------------------------------------------------
            # 8. NOTAS Y PROMEDIOS REALISTAS Y MATEMÁTICAMENTE COHERENTES
            # ----------------------------------------------------
            print("[8/14] Generando Notas y Promedios coherentes...")
            
            DIFICULTAD = {
                "Matematica": (11.2, 3.8),
                "Ciencia y Tecnologia": (12.4, 3.4),
                "Comunicacion": (12.8, 3.0),
                "Personal Social": (13.2, 2.8),
                "Ingles": (12.0, 3.5),
                "Computacion": (13.8, 2.5),
                "Arte y Cultura": (14.8, 2.2),
                "Educacion Fisica": (15.8, 1.8),
            }
            
            perfil_talento = {}
            for est in estudiantes_data:
                r = random.random()
                if r < 0.15:
                    perfil_talento[est.id] = random.uniform(2.5, 4.5)
                elif r < 0.35:
                    perfil_talento[est.id] = random.uniform(0.8, 2.5)
                elif r < 0.70:
                    perfil_talento[est.id] = random.uniform(-1.0, 0.8)
                elif r < 0.90:
                    perfil_talento[est.id] = random.uniform(-3.0, -1.0)
                else:
                    perfil_talento[est.id] = random.uniform(-5.0, -3.0)
            
            notas_batch = []
            promedios_batch = []
            
            for anio in [2024, 2025, 2026]:
                pool = pools_por_anio[anio]
                bimestres = periodos_por_anio[anio]
                
                for periodo in bimestres:
                    for curso in cursos:
                        media, desv = DIFICULTAD.get(curso.nombre, (13.0, 3.0))
                        evals_del_curso = evals_map[(curso.id, periodo.id)]
                        
                        for est in pool:
                            mod = perfil_talento[est.id]
                            var_bim = random.uniform(-0.8, 0.8)
                            
                            notas_estudiante = []
                            for ev_id, peso in evals_del_curso:
                                nota_raw = media + mod + var_bim + random.gauss(0, desv * 0.4)
                                
                                if peso == Decimal("0.40"):
                                    nota_raw -= random.uniform(0.2, 1.2)
                                elif peso == Decimal("0.25"):
                                    nota_raw += random.uniform(0.1, 0.9)
                                    
                                nota_final = max(0, min(20, round(nota_raw)))
                                nota_dec = Decimal(str(nota_final))
                                
                                notas_batch.append(Nota(
                                    evaluacion_id=ev_id,
                                    estudiante_id=est.id,
                                    calificacion=nota_dec
                                ))
                                notas_estudiante.append((nota_dec, peso))
                                
                            prom_calculado = sum(float(n) * float(p) for n, p in notas_estudiante)
                            prom_dec = Decimal(str(round(prom_calculado, 2)))
                            
                            promedios_batch.append(Promedio(
                                estudiante_id=est.id,
                                curso=curso,
                                periodo=periodo,
                                promedio=prom_dec
                            ))
                            
            Nota.objects.bulk_create(notas_batch, batch_size=5000)
            Promedio.objects.bulk_create(promedios_batch, batch_size=5000)
            
            print(f"  ✅ {len(notas_batch)} Notas y {len(promedios_batch)} Promedios guardados con éxito.")

            # ----------------------------------------------------
            # 9. CONTROL DE ASISTENCIA DIARIA (LUNES A VIERNES)
            # ----------------------------------------------------
            print("[9/14] Generando registros de Asistencia y Justificaciones...")
            
            asistencias_batch = []
            
            def get_business_days(start_date, end_date):
                curr = start_date
                bdays = []
                while curr <= end_date:
                    if curr.weekday() < 5:
                        bdays.append(curr)
                    curr += timedelta(days=1)
                return bdays

            business_days_2026 = get_business_days(date(2026, 3, 1), date(2026, 7, 20))
            
            days_to_seed = {
                2024: get_business_days(date(2024, 3, 15), date(2024, 4, 15)),
                2025: get_business_days(date(2025, 3, 15), date(2025, 4, 15)),
                2026: business_days_2026
            }
            
            for anio in [2024, 2025, 2026]:
                pool = pools_por_anio[anio]
                fechas = days_to_seed[anio]
                
                for f in fechas:
                    for est in pool:
                        tasa_personal = 0.12 if perfil_talento[est.id] < -2.0 else 0.03
                        
                        r_val = random.random()
                        if r_val < tasa_personal:
                            estado = "Falta"
                            obs = "Inasistencia injustificada"
                        elif r_val < (tasa_personal + 0.05):
                            estado = "Tardanza"
                            obs = "Llegó tarde al bloque de ingreso"
                        else:
                            estado = "Presente"
                            obs = ""
                            
                        asistencias_batch.append(Asistencia(
                            estudiante_id=est.id,
                            fecha=f,
                            estado=estado,
                            observacion=obs
                        ))
            
            Asistencia.objects.bulk_create(asistencias_batch)
            
            faltas_creadas = list(Asistencia.objects.filter(estado="Falta"))
            justs_batch = []
            
            motivos_just = [
                "Cita médica odontológica programada con anterioridad.",
                "Problemas de salud del alumno (fiebre y malestar general).",
                "Problemas familiares de fuerza mayor.",
                "Viaje urgente programado fuera de la ciudad.",
                "Suspensión de transporte público de su zona.",
            ]
            
            for f_obj in faltas_creadas:
                if random.random() < 0.4:
                    motivo = random.choice(motivos_just)
                    doc_file = f"certificado_{f_obj.estudiante.dni}_{f_obj.fecha.strftime('%Y%m%d')}.pdf"
                    justs_batch.append(Justificacion(
                        asistencia=f_obj,
                        motivo=motivo,
                        documento=doc_file,
                        estado=random.choice(["Aprobado", "Rechazado", "Pendiente"])
                    ))
                    
                    if justs_batch[-1].estado == "Aprobado":
                        f_obj.observacion = "Inasistencia justificada formalmente."
                        f_obj.save(update_fields=['observacion'])
                        
            Justificacion.objects.bulk_create(justs_batch)
            print(f"  ✅ {len(asistencias_batch)} asistencias y {len(justs_batch)} justificaciones registradas.")

            # ----------------------------------------------------
            # 10. CONDUCTA
            # ----------------------------------------------------
            print("[10/14] Creando registros de Conducta...")
            
            conductas_batch = []
            desc_cond = [
                ("Felicitación", "Excelente aporte en el taller de ciencias, ayudando a integrar a compañeros nuevos."),
                ("Positiva", "Mostró liderazgo positivo ordenando el aula de cómputo tras finalizar la sesión."),
                ("Llamado de atención", "Uso indebido de celular dentro del aula de clases a pesar de advertencia previa."),
                ("Leve", "Conversación reiterativa e interrupción durante la explicación del docente de matemáticas."),
                ("Grave", "Falta de respeto verbal a un compañero de aula en horas de recreo."),
                ("Negativa", "No presentó las actividades de clase por segunda vez consecutiva.")
            ]
            
            alumnos_cond = random.sample(estudiantes_data, 60)
            for est in alumnos_cond:
                t, desc = random.choice(desc_cond)
                fecha_cond = date(2026, random.randint(3, 7), random.randint(1, 20))
                while fecha_cond.weekday() >= 5:
                    fecha_cond += timedelta(days=1)
                    
                conductas_batch.append(Conducta(
                    estudiante=est,
                    fecha=fecha_cond,
                    tipo=t,
                    descripcion=desc
                ))
                
            Conducta.objects.bulk_create(conductas_batch)
            print(f"  ✅ {len(conductas_batch)} reportes de conducta ingresados.")

            # ----------------------------------------------------
            # 11. FINANZAS: PENSIONES Y PAGOS REALISTAS
            # ----------------------------------------------------
            print("[11/14] Registrando Pensiones mensuales y Pagos vinculados...")
            
            meses_pension = [
                ("Marzo", 3), ("Abril", 4), ("Mayo", 5), ("Junio", 6), ("Julio", 7),
                ("Agosto", 8), ("Setiembre", 9), ("Octubre", 10), ("Noviembre", 11), ("Diciembre", 12)
            ]
            
            pensiones_to_create = []
            pagos_to_create = []
            
            for anio in [2024, 2025, 2026]:

                pool = pools_por_anio[anio]
                meses_cobrar = meses_pension if anio < 2026 else meses_pension[:5]
                
                for est in pool:
                    hist = historial_matriculas[est.id][anio]
                    es_primaria = "Primaria" in hist[0].nombre
                    monto_mensual = Decimal("350.00") if es_primaria else Decimal("420.00")
                    
                    for mes, m_num in meses_cobrar:
                        periodo_str = f"{mes} {anio}"
                        r_pago = random.random()
                        
                        if anio < 2026:
                            estado_fin = "Pagado" if r_pago < 0.98 else "Vencido"
                        else:
                            if m_num <= 5:
                                estado_fin = "Pagado" if r_pago < 0.95 else "Vencido"
                            elif m_num == 6:
                                estado_fin = "Pagado" if r_pago < 0.85 else "Vencido"
                            else:
                                estado_fin = "Pagado" if r_pago < 0.45 else "Pendiente"
                                
                        pensiones_to_create.append(Pension(
                            estudiante=est,
                            periodo=periodo_str,
                            monto=monto_mensual,
                            estado=estado_fin
                        ))
                        
                        if estado_fin == "Pagado":
                            fecha_limite = date(anio, m_num, 28)
                            r_dias = random.randint(-10, 5)
                            fecha_pago = fecha_limite + timedelta(days=r_dias)
                            
                            while fecha_pago.weekday() >= 5:
                                fecha_pago -= timedelta(days=1)
                                
                            pago_obj = Pago(
                                estudiante=est,
                                monto=monto_mensual,
                                concepto=f"Pensión Escolar - {periodo_str}",
                                comprobante=f"B001-{anio:04d}{m_num:02d}{est.id:04d}"
                            )
                            pagos_to_create.append((pago_obj, fecha_pago))
            
            # Bulk create Pensiones
            Pension.objects.bulk_create(pensiones_to_create)
            
            # Bulk create Pagos
            pago_objects_only = [item[0] for item in pagos_to_create]
            created_pagos = Pago.objects.bulk_create(pago_objects_only)
            
            # Update dates via raw SQL to bypass auto_now_add
            from django.db import connection
            pago_updates = []
            for idx, p_obj in enumerate(created_pagos):
                target_date = pagos_to_create[idx][1]
                pago_updates.append((target_date.strftime('%Y-%m-%d'), p_obj.id))
                
            with connection.cursor() as cursor:
                cursor.executemany("UPDATE pagos_pago SET fecha = ? WHERE id = ?", pago_updates)
                
            print("  ✅ Pensiones y Pagos históricos y actuales generados.")


            # ----------------------------------------------------
            # 12. LIBRETAS ESCOLARES
            # ----------------------------------------------------
            print("[12/14] Creando Libretas Escolares...")
            
            libretas_batch = []
            
            for anio in [2024, 2025, 2026]:
                pool = pools_por_anio[anio]
                periodos_anio = periodos_por_anio[anio]
                
                for p in periodos_anio:
                    if anio == 2026 and p.bimestre in ["2° Bimestre", "3° Bimestre", "4° Bimestre"]:
                        continue
                        
                    for est in pool:
                        b_num = int(p.bimestre[0])
                        mes_e = 5 if b_num == 1 else (7 if b_num == 2 else (10 if b_num == 3 else 12))
                        libretas_batch.append(Libreta(
                            estudiante=est,
                            periodo=p,
                            fecha_emision=date(anio, mes_e, 20)
                        ))
                        
            Libreta.objects.bulk_create(libretas_batch)
            print(f"  ✅ {len(libretas_batch)} libretas emitidas.")

            # ----------------------------------------------------
            # 13. COMUNICADOS, CITACIONES Y REPORTES
            # ----------------------------------------------------
            print("[13/14] Registrando Comunicados, Citaciones y logs de Auditoría...")
            
            c1 = Comunicado.objects.create(
                institucion=ie,
                titulo="Inicio del Segundo Bimestre Escolar",
                mensaje="Estimada comunidad educativa, damos inicio a las actividades académicas correspondientes al II Bimestre. Exhortamos a los padres a supervisar las tareas diarias.",
                fecha=datetime(2026, 5, 25, 8, 30)
            )
            c2 = Comunicado.objects.create(
                institucion=ie,
                titulo="Simulacro Nacional de Sismo",
                mensaje="El día de mañana a las 10:00 a.m. realizaremos el simulacro nacional en el patio principal de la institución educativa de manera obligatoria.",
                fecha=datetime(2026, 6, 12, 14, 0)
            )
            c3 = Comunicado.objects.create(
                institucion=ie,
                titulo="Entrega de Libretas del I Bimestre",
                mensaje="Los boletines de notas del primer bimestre se encuentran disponibles en la plataforma académica para su visualización y descarga.",
                fecha=datetime(2026, 5, 18, 9, 0)
            )
            
            alumnos_bajos = Promedio.objects.filter(promedio__lt=11, periodo__anio=2026)[:40]
            citaciones_batch = []
            
            for prom in alumnos_bajos:
                apo = Apoderado.objects.filter(estudiantes=prom.estudiante).first()
                if apo:
                    citaciones_batch.append(Citacion(
                        estudiante=prom.estudiante,
                        apoderado=apo,
                        fecha=datetime(2026, 7, 22, 15, 30) - timedelta(days=random.randint(0, 10)),
                        motivo=f"Reunión para coordinar apoyo en el curso de {prom.curso.nombre} debido a bajo rendimiento (Nota: {prom.promedio}).",
                        asistencia=random.choice(["Asistio", "Falto", "Pendiente"])
                    ))
                    
            Citacion.objects.bulk_create(citaciones_batch)
            
            Reporte.objects.create(
                institucion=ie,
                tipo="Carga Inicial Masiva de Datos",
                fecha=datetime.now(),
                usuario=admin_user
            )
            
            print(f"  ✅ {len(citaciones_batch)} citaciones guardadas y reportes de auditoría inicializados.")

            # ----------------------------------------------------
            # 14. ALERTAS AUTOMÁTICAS POR RENDIMIENTO/ASISTENCIA
            # ----------------------------------------------------
            print("[14/14] Analizando rendimiento para generar Alertas automáticas...")
            
            alertas_batch = []
            
            periodo_actual = PeriodoAcademico.objects.get(anio=2026, bimestre="2° Bimestre", institucion=ie)
            promedios_rojos = Promedio.objects.filter(periodo=periodo_actual, promedio__lt=11)
            
            for prom in promedios_rojos:
                alertas_batch.append(Alerta(
                    estudiante=prom.estudiante,
                    tipo="Rendimiento Academico",
                    descripcion=f"Rendimiento desaprobatorio en {prom.curso.nombre} con promedio de {prom.promedio} en el II Bimestre.",
                    estado="Pendiente"
                ))
                
            from django.db.models import Count
            faltas_reiteradas = Asistencia.objects.filter(fecha__year=2026, estado="Falta")\
                                                 .values('estudiante')\
                                                 .annotate(total_faltas=Count('id'))\
                                                 .filter(total_faltas__gt=3)
                                                 
            for f_group in faltas_reiteradas:
                est_id = f_group['estudiante']
                est_obj = Estudiante.objects.get(id=est_id)
                alertas_batch.append(Alerta(
                    estudiante=est_obj,
                    tipo="Inasistencias",
                    descripcion=f"El estudiante presenta {f_group['total_faltas']} inasistencias en lo que va del año académico.",
                    estado="Pendiente"
                ))
                
            Alerta.objects.bulk_create(alertas_batch)
            print(f"  ✅ {len(alertas_batch)} alertas de control activadas en el sistema.")

    except Exception as e:
        print(f"\n❌ Error durante el seeding: {e}")
        raise e

    print("\n=== ¡BASE DE DATOS COMPLETAMENTE POBLADA CON ÉXITO! ===")


if __name__ == '__main__':
    from datetime import time
    main()
