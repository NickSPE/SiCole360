import sqlite3, csv, os

DB_PATH = 'db.sqlite3'
OUT_DIR = 'csv_exports'

os.makedirs(OUT_DIR, exist_ok=True)
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

tables = [
    'instituciones_institucioneducativa', 'estudiantes_estudiante', 'docentes_docente',
    'apoderados_apoderado', 'apoderados_apoderado_estudiantes', 'matricula_matricula',
    'academico_grado', 'academico_seccion', 'academico_curso', 'academico_niveleducativo',
    'academico_periodoacademico', 'asistencia_asistencia', 'asistencia_justificacion',
    'notas_nota', 'notas_evaluacion', 'notas_promedio',
    'pagos_pago', 'pagos_pension', 'conducta_conducta',
    'horarios_horario', 'libretas_libreta', 'comunicacion_comunicado',
    'comunicacion_citacion', 'alertas_alerta', 'reportes_reporte'
]

for table in tables:
    cur = conn.execute(f'SELECT * FROM {table}')
    rows = cur.fetchall()
    if not rows:
        print(f'{table}: vacía')
        continue
    cols = [d[0] for d in cur.description]
    path = os.path.join(OUT_DIR, f'{table}.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(cols)
        for r in rows:
            w.writerow([r[c] for c in cols])
    print(f'{table}: {len(rows)} filas -> {path}')

conn.close()
print(f'\nListo. CSVs en: {os.path.abspath(OUT_DIR)}')
