from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Reporte
from .serializers import ReporteSerializer
from estudiantes.models import Estudiante
from docentes.models import Docente
from alertas.models import Alerta
from pagos.models import Pension
from asistencia.models import Asistencia
from instituciones.models import InstitucionEducativa
from apoderados.models import Apoderado
from academico.models import Grado
from notas.models import Promedio
from conducta.models import Conducta

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all().order_by('-fecha')
    serializer_class = ReporteSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Reporte.objects.none()

        rol = user.rol.nombre_rol if user.rol else None

        if rol == 'SuperAdmin':
            return Reporte.objects.all().order_by('-fecha')
        elif rol in ['Director', 'Docente']:
            return Reporte.objects.filter(institucion=user.institucion).order_by('-fecha')
        else:
            return Reporte.objects.none()

class DashboardStatsView(APIView):
    def get(self, request):
        try:
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

            rol = user.rol.nombre_rol if user.rol else None

            # Base querysets
            estudiantes = Estudiante.objects.filter(estado=True)
            docentes = Docente.objects.filter(estado=True)
            instituciones = InstitucionEducativa.objects.filter(estado=True)
            alertas = Alerta.objects.filter(estado='Activa')
            pensiones = Pension.objects.all()
            asistencias = Asistencia.objects.all()

            # Apply filters by role
            if rol == 'SuperAdmin':
                # Allow SuperAdmin to filter by selected institution
                institucion_id = request.query_params.get('institucion', None)
                if institucion_id:
                    estudiantes = estudiantes.filter(institucion_id=institucion_id)
                    docentes = docentes.filter(institucion_id=institucion_id)
                    instituciones = instituciones.filter(id=institucion_id)
                    alertas = alertas.filter(estudiante__institucion_id=institucion_id)
                    pensiones = pensiones.filter(estudiante__institucion_id=institucion_id)
                    asistencias = asistencias.filter(estudiante__institucion_id=institucion_id)
            elif rol in ['Director', 'Docente']:
                estudiantes = estudiantes.filter(institucion=user.institucion)
                docentes = docentes.filter(institucion=user.institucion)
                instituciones = instituciones.filter(id=user.institucion.id)
                alertas = alertas.filter(estudiante__institucion=user.institucion)
                pensiones = pensiones.filter(estudiante__institucion=user.institucion)
                asistencias = asistencias.filter(estudiante__institucion=user.institucion)
            elif rol == 'Apoderado':
                student_ids = Apoderado.objects.filter(correo=user.email).values_list('estudiante_id', flat=True)
                estudiantes = estudiantes.filter(id__in=student_ids)
                docentes = docentes.filter(institucion=user.institucion) if user.institucion else docentes.none()
                instituciones = instituciones.filter(id=user.institucion.id) if user.institucion else instituciones.none()
                alertas = alertas.filter(estudiante_id__in=student_ids)
                pensiones = pensiones.filter(estudiante_id__in=student_ids)
                asistencias = asistencias.filter(estudiante_id__in=student_ids)
            else:
                return Response({"error": "Rol no permitido"}, status=status.HTTP_403_FORBIDDEN)

            # Query aggregates
            total_estudiantes = estudiantes.count()
            total_docentes = docentes.count()
            total_instituciones = instituciones.count()
            alertas_pendientes = alertas.count()
            
            # Financial metrics
            pensiones_total = pensiones.count()
            pensiones_pagadas = pensiones.filter(estado='Pagado').count()
            pensiones_pendientes = pensiones.filter(estado__in=['Pendiente', 'Vencido']).count()
            
            tasa_morosidad = 0.0
            if pensiones_total > 0:
                tasa_morosidad = round((pensiones_pendientes / pensiones_total) * 100, 2)

            # Attendance metrics
            asistencias_total = asistencias.count()
            asistencias_presente = asistencias.filter(estado='P').count()
            tasa_asistencia = 100.0
            if asistencias_total > 0:
                tasa_asistencia = round((asistencias_presente / asistencias_total) * 100, 2)

            # Dynamic Monthly Chart Data for 2025
            chart_data = []
            meses_peru = [
                ("Marzo", 3), ("Abril", 4), ("Mayo", 5), ("Junio", 6), 
                ("Julio", 7), ("Agosto", 8), ("Setiembre", 9), 
                ("Octubre", 10), ("Noviembre", 11), ("Diciembre", 12)
            ]
            for mes_nombre, mes_num in meses_peru:
                asist_mes = asistencias.filter(fecha__year=2025, fecha__month=mes_num)
                asist_total = asist_mes.count()
                asist_presente = asist_mes.filter(estado='P').count()
                tasa_asist = round((asist_presente / asist_total) * 100, 1) if asist_total > 0 else 95.0
                
                period_str = f"{mes_nombre} 2025"
                pensiones_mes = pensiones.filter(periodo=period_str)
                pens_total = pensiones_mes.count()
                pens_pendientes = pensiones_mes.filter(estado__in=['Pendiente', 'Vencido']).count()
                tasa_moro = round((pens_pendientes / pens_total) * 100, 1) if pens_total > 0 else 0.0
                
                chart_data.append({
                    "name": mes_nombre,
                    "asistencia": tasa_asist,
                    "morosidad": tasa_moro
                })

            data = {
                "total_estudiantes": total_estudiantes,
                "total_docentes": total_docentes,
                "total_instituciones": total_instituciones,
                "alertas_pendientes": alertas_pendientes,
                "pensiones": {
                    "total": pensiones_total,
                    "pagadas": pensiones_pagadas,
                    "pendientes": pensiones_pendientes,
                    "tasa_morosidad": tasa_morosidad
                },
                "asistencia": {
                    "tasa_asistencia": tasa_asistencia
                },
                "chart_data": chart_data
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalisisStatsView(APIView):
    def get(self, request):
        try:
            user = request.user
            if not user.is_authenticated:
                return Response({"error": "No autenticado"}, status=status.HTTP_401_UNAUTHORIZED)

            rol = user.rol.nombre_rol if user.rol else None

            # Get target year (default 2026)
            try:
                anio = int(request.query_params.get('anio', 2026))
            except ValueError:
                anio = 2026

            # Get target institution for filter
            institucion_id = None
            if rol == 'SuperAdmin':
                institucion_id = request.query_params.get('institucion', None)
            elif rol in ['Director', 'Docente']:
                institucion_id = user.institucion.id if user.institucion else None

            if not institucion_id:
                # Default to first institution if none provided for SuperAdmin
                first_inst = InstitucionEducativa.objects.first()
                institucion_id = first_inst.id if first_inst else None

            if not institucion_id:
                return Response({
                    "academico_grado": [],
                    "conducta_grado": [],
                    "finanzas_mensual": []
                }, status=status.HTTP_200_OK)

            inst = InstitucionEducativa.objects.get(id=institucion_id)

            # 1. Rendimiento Académico por Grado (Promedio)
            academico_grado = []
            grados = Grado.objects.filter(nivel__institucion=inst).order_by('id')
            for gr in grados:
                prom_avg = Promedio.objects.filter(
                    estudiante__institucion=inst,
                    estudiante__matriculas__grado=gr,
                    estudiante__matriculas__periodo__anio=anio,
                    periodo__anio=anio
                ).distinct().aggregate(Avg('promedio'))['promedio__avg']
                
                prom_val = round(prom_avg, 2) if prom_avg is not None else 0.0
                if prom_val > 0:
                    academico_grado.append({
                        "name": gr.nombre,
                        "promedio": prom_val
                    })

            # 2. Distribución de Incidencias Conductuales por Grado
            conducta_grado = []
            for gr in grados:
                conductas_gr = Conducta.objects.filter(
                    estudiante__institucion=inst,
                    estudiante__matriculas__grado=gr,
                    estudiante__matriculas__periodo__anio=anio,
                    fecha__year=anio
                ).distinct()
                grave = conductas_gr.filter(tipo='Grave').count()
                leve = conductas_gr.filter(tipo='Leve').count()
                positiva = conductas_gr.filter(tipo='Positiva').count()

                if (grave + leve + positiva) > 0:
                    conducta_grado.append({
                        "name": gr.nombre,
                        "grave": grave,
                        "leve": leve,
                        "positiva": positiva
                    })

            # 3. Estado de Recaudación Financiera Mensual
            finanzas_mensual = []
            pensiones = Pension.objects.filter(estudiante__institucion=inst)
            meses_peru = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"]
            
            # Dynamic pension amount per year
            monto_pension = 440.0 if anio == 2026 else (420.0 if anio == 2025 else 400.0)

            for mes in meses_peru:
                period_str = f"{mes} {anio}"
                pensiones_mes = pensiones.filter(periodo=period_str)
                recaudado = pensiones_mes.filter(estado='Pagado').count() * monto_pension
                deuda = pensiones_mes.filter(estado__in=['Vencido', 'Pendiente']).count() * monto_pension

                if (recaudado + deuda) > 0:
                    finanzas_mensual.append({
                        "name": mes,
                        "recaudado": recaudado,
                        "deuda": deuda
                    })

            # 4. Distribución de Calificaciones por Rango SIAGIE (AD, A, B, C)
            promedios_anio = Promedio.objects.filter(estudiante__institucion=inst, periodo__anio=anio)
            count_ad = promedios_anio.filter(promedio__gte=18).count()
            count_a = promedios_anio.filter(promedio__gte=14, promedio__lt=18).count()
            count_b = promedios_anio.filter(promedio__gte=11, promedio__lt=14).count()
            count_c = promedios_anio.filter(promedio__lt=11).count()

            distribucion_notas = [
                {"name": "AD (Logro Destacado 18-20)", "value": count_ad},
                {"name": "A (Logro Previsto 14-17)", "value": count_a},
                {"name": "B (En Proceso 11-13)", "value": count_b},
                {"name": "C (En Inicio 0-10)", "value": count_c}
            ]

            # 5. Riesgo de Deserción y Ausentismo Crónico por Grado (Alumnos con 3 o más faltas en el año lectivo)
            ausentismo_riesgo = []
            for gr in grados:
                students_in_grade = Estudiante.objects.filter(
                    institucion=inst,
                    matriculas__grado=gr,
                    matriculas__periodo__anio=anio
                ).distinct()
                
                en_riesgo_count = 0
                for student in students_in_grade:
                    absences_count = Asistencia.objects.filter(
                        estudiante=student,
                        fecha__year=anio,
                        estado__in=['F', 'FJ']
                    ).count()
                    if absences_count >= 3:
                        en_riesgo_count += 1
                
                if students_in_grade.exists():
                    ausentismo_riesgo.append({
                        "name": gr.nombre,
                        "en_riesgo": en_riesgo_count,
                        "total": students_in_grade.count()
                    })

            # 6. Cursos con Mayor Cantidad de Alumnos en Inicio (Escala C / Desaprobados)
            cursos_c = Promedio.objects.filter(
                estudiante__institucion=inst,
                periodo__anio=anio,
                promedio__lt=11.0
            ).values('curso__nombre').annotate(count=Count('estudiante', distinct=True)).order_by('-count')

            cursos_riesgo = []
            for item in cursos_c:
                cursos_riesgo.append({
                    "curso": item['curso__nombre'],
                    "alumnos": item['count']
                })

            # 7. Radar Multidimensional de Ejes de Calidad Escolar (Año Lectivo vs Año Anterior)
            def get_radar_rates(target_yr):
                avg_grade = Promedio.objects.filter(estudiante__institucion=inst, periodo__anio=target_yr).aggregate(Avg('promedio'))['promedio__avg']
                val_academico = round((float(avg_grade) / 20.0 * 100.0), 1) if avg_grade is not None else 0.0
                
                total_as = Asistencia.objects.filter(estudiante__institucion=inst, fecha__year=target_yr)
                present_as = total_as.filter(estado__in=['P', 'T']).count()
                val_asistencia = round((present_as / total_as.count() * 100.0), 1) if total_as.count() > 0 else 0.0
                
                tot_students = Estudiante.objects.filter(institucion=inst).count()
                severe_faults = Conducta.objects.filter(estudiante__institucion=inst, fecha__year=target_yr, tipo='Grave').count()
                val_convivencia = max(100.0 - (severe_faults * 10.0), 0.0) if tot_students > 0 else 100.0
                
                pensions_yr = Pension.objects.filter(estudiante__institucion=inst, periodo__contains=str(target_yr))
                total_p = pensions_yr.count()
                paid_p = pensions_yr.filter(estado='Pagado').count()
                val_finanzas = round((paid_p / total_p * 100.0), 1) if total_p > 0 else 100.0
                
                return val_academico, val_asistencia, val_convivencia, val_finanzas

            try:
                act_ac, act_as, act_co, act_fi = get_radar_rates(anio)
                prev_ac, prev_as, prev_co, prev_fi = get_radar_rates(anio - 1)
            except Exception:
                act_ac, act_as, act_co, act_fi = 0.0, 0.0, 0.0, 0.0
                prev_ac, prev_as, prev_co, prev_fi = 0.0, 0.0, 0.0, 0.0

            radar_calidad = [
                {"subject": "Rendimiento Académico", "Actual": act_ac, "Previo": prev_ac},
                {"subject": "Puntualidad y Asistencia", "Actual": act_as, "Previo": prev_as},
                {"subject": "Buen Clima Convivencia", "Actual": act_co, "Previo": prev_co},
                {"subject": "Solvencia Recaudación", "Actual": act_fi, "Previo": prev_fi}
            ]

            return Response({
                "academico_grado": academico_grado,
                "conducta_grado": conducta_grado,
                "finanzas_mensual": finanzas_mensual,
                "distribucion_notas": distribucion_notas,
                "ausentismo_riesgo": ausentismo_riesgo,
                "cursos_riesgo": cursos_riesgo,
                "radar_calidad": radar_calidad
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
