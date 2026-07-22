# Informe de Arquitectura de Software: Estructura de 2 TPS e Integración en Power BI (SiCole360)

## 1. Aclaración Conceptual y Arquitectónica

### 🏢 ¿Qué es un Área?
Es una dependencia, departamento u oficina dentro de la estructura organizacional del colegio donde el personal ejecuta funciones operativas específicas.

### 💻 ¿Qué es un TPS (Transaction Processing System)?
Es el **software transaccional** utilizado por una determinada área para registrar, actualizar y procesar la información operativa del día a día (asistencias, notas, registros, solicitudes).

### ❓ ¿Es un ERP o no?
* **No es un ERP monolítico centralizado:** En la arquitectura tradicional ERP, todas las áreas comparten de forma rígida una única base de datos transaccional centralizada.
* **Es una Arquitectura Desacoplada de TPS + Business Intelligence (Power BI):** Existen 2 sistemas transaccionales independientes con autonomía en sus dominios de datos. La consolidación de la información **no ocurre a nivel transaccional**, sino en la **capa analítica (Power BI)** para la toma de decisiones estratégicas.

---

## 2. Definición de las 2 Áreas y sus TPS Correspondientes

```
┌───────────────────────────────────────────────────────────┐
│              ÁREA 1: DIRECCIÓN ACADÉMICA                  │
│             (TPS 1: Pedagógico / Evaluativo)              │
└─────────────────────────────┬─────────────────────────────┘
                              │
                      Interacción Directa
      (Justificaciones activan reprogramación de exámenes / 
       Bajo rendimiento genera citaciones de tutoría)
                              │
┌─────────────────────────────┴─────────────────────────────┐
│          ÁREA 2: SECRETARÍA Y CONVIVENCIA ESCOLAR          │
│          (TPS 2: Control Escolar y Familias)              │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
                 [ Capa Analítica: POWER BI ]
             (Cruce de Inasistencias vs. Rendimiento)
```

### 🏢 ÁREA 1: Dirección Académica y Coordinación Pedagógica
* **Software (TPS):** **TPS Pedagógico y Evaluativo**
* **Módulos del Sistema:** `docentes`, `horarios`, `notas`, `evaluaciones`, `libretas`, `academico` (grados, secciones, cursos, periodos).
* **Transacciones Operativas:**
  1. Registro de notas de evaluaciones, prácticas y exámenes.
  2. Cálculo automático de promedios bimestrales.
  3. Generación y emisión de libretas escolares.
  4. Asignación de horarios docentes y carga horaria por sección.

### 🏢 ÁREA 2: Secretaría Escolar, Auxiliaría y Convivencia (Tutoría)
* **Software (TPS):** **TPS de Control Escolar y Convivencia**
* **Módulos del Sistema:** `estudiantes`, `apoderados`, `matricula`, `asistencia`, `conducta`, `comunicacion` (citaciones/comunicados).
* **Transacciones Operativas:**
  1. Marcación de asistencia diaria, entradas y tardanzas.
  2. Registro y validación de justificaciones presentadas por apoderados.
  3. Registro disciplinario (méritos y deméritos de conducta).
  4. Registro de matrícula e inscripción de estudiantes.
  5. Emisión de citaciones oficiales a padres de familia.

---

## 3. Auditoría y Evidencia en la Base de Datos (`db.sqlite3`)

El análisis realizado sobre el archivo de base de datos **`db.sqlite3`** respalda técnicamente esta separación de 2 TPS mediante los volúmenes transaccionales reales encontrados:

| TPS / Área | Módulos Principales | Registros Transaccionales Reales en BD | Carga Transaccional |
| :--- | :--- | :--- | :--- |
| **TPS 1: Pedagógico** | `notas`, `libretas`, `horarios` | • **101,760** Notas registradas<br>• **33,920** Promedios bimestrales<br>• **3,145** Libretas generadas<br>• **176** Bloques de horarios | **Carga Intensa Por Cierre Periodico** (Evaluación continua) |
| **TPS 2: Control Escolar** | `asistencia`, `conducta`, `matricula` | • **52,155** Asistencias marcadas<br>• **797** Justificaciones registradas<br>• **714** Partes de conducta<br>• **4,240** Matrículas históricas | **Alta Frecuencia Diaria** (Operación en puerta y tutoría) |

> **Conclusión de la BD:** Ambas áreas poseen una carga volumétrica sustancial e independiente. La única clave foránea de enlace entre ambos TPS es el identificador del alumno (`estudiante_id`), lo que garantiza que pueden operar como dos bases de datos lógicas independientes.

---

## 4. Flujo de Interacción entre los 2 TPS

Aunque los 2 TPS operan de forma desacoplada, interactúan mediante los siguientes flujos del negocio escolar:

1. **Secretaría $\rightarrow$ Académico (Habilitación y Reprogramación):**
   * La matrícula realizada en el TPS 2 habilita automáticamente al estudiante en las listas del TPS 1 (Docentes).
   * Una justificación médica registrada en el TPS 2 (Secretaría) notifica al TPS 1 (Docentes) para autorizar la reprogramación de exámenes desaprobados o no rendidos por inasistencia.

2. **Académico $\rightarrow$ Secretaría/Tutoría (Alertas de Convivencia):**
   * El registro de notas desaprobatorias consecutivas en el TPS 1 (Académico) dispara una alerta hacia el TPS 2 (Tutoría/Secretaría) para emitir una citación oficial al apoderado.

---

## 5. Integración Analítica en Power BI

Power BI actúa como la **capa de Inteligencia de Negocios (BI)** que extrae los datos de ambos TPS para la alta dirección (Director/Promotor):

* **Dashboard de Correlación Pedagógica:** Cruzar la tasa de inasistencias/tardanzas (TPS 2) con el promedio ponderado de calificaciones (TPS 1).
* **Dashboard de Riesgo Escolar:** Identificar alumnos con acumulación de deméritos disciplinarios (TPS 2) y su impacto en el rendimiento académico bimestral (TPS 1).

---

## 6. Guión Sugerido para la Exposición ante el Ing. Paucar

> *"Ingeniero Paucar, en el proyecto **SiCole360** hemos definido dos **Áreas Organizacionales** principales, cada una soportada por su propio **TPS (Sistema Transaccional)**:*
> 
> 1. *El **Área de Dirección Académica**, que opera el **TPS Pedagógico**, procesando más de 100,000 registros de notas, evaluaciones y libretas.*
> 2. *El **Área de Secretaría y Convivencia**, que opera el **TPS de Control Escolar**, procesando más de 52,000 registros diarios de asistencia, conducta y comunicación con apoderados.*
> 
> *Ambos TPS son independientes a nivel operativo e interactúan cuando los eventos del control escolar (como faltas justificadas) habilitan acciones académicas (como reprogramaciones). Finalmente, no requerimos una base de datos centralizada monolítica porque la consolidación ejecutiva la realizamos llevando ambas fuentes de datos a **Power BI** para la toma de decisiones estratégicas."*
