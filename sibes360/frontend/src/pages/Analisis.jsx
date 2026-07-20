import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, ShieldAlert, Award, FileText, Sparkles, AlertCircle, Calendar, CheckCircle2,
  Users, Activity, Percent, BookOpen, Compass
} from 'lucide-react';
import KPICard from '../components/KPICard';

const COLORS_SIAGIE = ['#11cdef', '#2dce89', '#ffb236', '#f5365c'];

const Analisis = () => {
  const { selectedInstitucion } = useAuth();
  const [selectedAnio, setSelectedAnio] = useState('2026');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalisisData = async () => {
      try {
        setLoading(true);
        const instParam = selectedInstitucion ? `&institucion=${selectedInstitucion}` : '';
        const res = await axios.get(`http://localhost:8000/api/dashboard/analisis/?anio=${selectedAnio}${instParam}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analysis stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalisisData();
  }, [selectedInstitucion, selectedAnio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  // Calculate some actionable stats for decision making
  const lowestGradeObj = data?.academico_grado?.reduce((prev, current) => 
    (prev.promedio < current.promedio) ? prev : current, { name: 'Ninguno', promedio: 20 }
  );

  const highestConductGraveObj = data?.conducta_grado?.reduce((prev, current) => 
    (prev.grave > current.grave) ? prev : current, { name: 'Ninguno', grave: 0 }
  );

  const totalDeuda = data?.finanzas_mensual?.reduce((sum, item) => sum + item.deuda, 0) || 0;
  const totalRecaudado = data?.finanzas_mensual?.reduce((sum, item) => sum + item.recaudado, 0) || 0;
  const totalPensions = totalDeuda + totalRecaudado;
  const globalMorosidadRate = totalPensions > 0 ? ((totalDeuda / totalPensions) * 100).toFixed(1) : 0;

  // Calculate total students in risk of absenteeism
  const totalStudentsInRisk = data?.ausentismo_riesgo?.reduce((sum, item) => sum + item.en_riesgo, 0) || 0;

  // Calculate total students in scale C (desaprobados) across all subjects
  const maxAlumnosC = data?.cursos_riesgo?.reduce((max, item) => item.alumnos > max ? item.alumnos : max, 1) || 1;

  const previousYear = parseInt(selectedAnio) - 1;

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1f36] tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-[#6c63ff] animate-pulse" />
            <span>Módulo de Análisis Estratégico y Decisiones Organizacionales</span>
          </h1>
          <p className="text-xs text-[#8898aa] mt-0.5">
            Métricas organizativas avanzadas para planificación de recursos directivos, auditoría pedagógica e intervención de riesgos.
          </p>
        </div>

        {/* Year filter control */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Calendar size={15} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Año Lectivo:</span>
          <select
            value={selectedAnio}
            onChange={(e) => setSelectedAnio(e.target.value)}
            className="bg-[#fcfcff] border border-indigo-100 hover:border-indigo-200 text-xs font-bold text-indigo-600 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#6c63ff] cursor-pointer shadow-sm transition-all"
          >
            <option value="2026">📅 2026 (Periodo Actual)</option>
            <option value="2025">📅 2025 (Histórico)</option>
            <option value="2024">📅 2024 (Histórico)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards for strategic focus */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          title="Foco de Refuerzo Académico" 
          value={lowestGradeObj?.promedio > 0 ? lowestGradeObj.name : "N/A"} 
          subtitle={`Promedio más bajo: ${lowestGradeObj?.promedio || 0}`} 
          icon={FileText} 
          color="danger"
        />
        <KPICard 
          title="Foco Conductual Crítico" 
          value={highestConductGraveObj?.grave > 0 ? highestConductGraveObj.name : "Excelente"} 
          subtitle={`${highestConductGraveObj?.grave || 0} incidencias graves registradas`} 
          icon={ShieldAlert} 
          color="warning"
        />
        <KPICard 
          title="Ratio General de Morosidad" 
          value={`${globalMorosidadRate}%`} 
          subtitle={`Monto pendiente: S/ ${totalDeuda.toLocaleString()}`} 
          icon={TrendingUp} 
          color="success"
        />
        <KPICard 
          title="Alumnos en Alerta de Deserción" 
          value={`${totalStudentsInRisk} Est.`} 
          subtitle="Con ausentismo crónico (>=3 faltas)" 
          icon={Users} 
          color="info"
        />
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Academic averages by Grade (BarChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36]">{`Rendimiento Académico por Grado (${selectedAnio})`}</h2>
            <p className="text-[11px] text-[#8898aa]">Promedio de calificaciones ponderadas en el periodo {selectedAnio}. Línea roja indica el mínimo aprobatorio peruano (11.0).</p>
          </div>
          <div className="h-72">
            {data?.academico_grado?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.academico_grado} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#8898aa" fontSize={9} tickLine={false} />
                  <YAxis domain={[0, 20]} stroke="#8898aa" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine y={11.0} stroke="#ff6584" strokeDasharray="4 4" label={{ value: 'Aprobatorio (11.0)', fill: '#ff6584', fontSize: 10, position: 'top' }} />
                  <Bar dataKey="promedio" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Promedio de Notas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText size={40} className="stroke-[1.5] text-slate-300 mb-2" />
                <span className="text-xs font-medium">Sin datos académicos registrados para este año.</span>
              </div>
            )}
          </div>
        </div>

        {/* Behavior Incidents by Grade (Stacked BarChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36]">{`Distribución de Incidencias Conductuales (${selectedAnio})`}</h2>
            <p className="text-[11px] text-[#8898aa]">Frecuencia acumulada de méritos positivos y faltas por grado durante el año lectivo {selectedAnio}.</p>
          </div>
          <div className="h-72">
            {data?.conducta_grado?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.conducta_grado} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#8898aa" fontSize={9} tickLine={false} />
                  <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="positiva" stackId="a" fill="#2dce89" name="Conducta Positiva (Méritos)" />
                  <Bar dataKey="leve" stackId="a" fill="#ffb236" name="Faltas Leves" />
                  <Bar dataKey="grave" stackId="a" fill="#ff6584" name="Faltas Graves" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShieldAlert size={40} className="stroke-[1.5] text-slate-300 mb-2" />
                <span className="text-xs font-medium">Sin incidencias conductuales registradas para este año.</span>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Organizational Chart 1: Donut Chart SIAGIE Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36]">Distribución de Notas por Criterios SIAGIE</h2>
            <p className="text-[11px] text-[#8898aa]">Clasificación de rendimiento académico global bajo los estándares oficiales del Ministerio de Educación (MINEDU).</p>
          </div>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-4">
            {data?.distribucion_notas?.some(x => x.value > 0) ? (
              <>
                <div className="w-1/2 h-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.distribucion_notas}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.distribucion_notas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_SIAGIE[index % COLORS_SIAGIE.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {data.distribucion_notas.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS_SIAGIE[index % COLORS_SIAGIE.length] }}></span>
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full text-slate-400">
                <Percent size={40} className="stroke-[1.5] text-slate-300 mb-2" />
                <span className="text-xs font-medium">Sin datos de distribución SIAGIE disponibles.</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Course breakdown for Scale C students (Desaprobados por Asignatura) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36]">Cursos Críticos: Alumnos en Inicio (Escala C)</h2>
            <p className="text-[11px] text-[#8898aa]">Cantidad de estudiantes desaprobados (nota &lt; 11.0) agrupados por curso para priorización de auditorías docentes.</p>
          </div>
          <div className="h-72 overflow-y-auto pr-2 space-y-3">
            {data?.cursos_riesgo?.length > 0 ? (
              data.cursos_riesgo.map((item, index) => {
                const percentage = ((item.alumnos / maxAlumnosC) * 100).toFixed(0);
                return (
                  <div key={item.curso} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-[#f5365c]" />
                        {item.curso}
                      </span>
                      <span className="font-extrabold text-[#f5365c]">{item.alumnos} Alumnos</span>
                    </div>
                    {/* Visual custom progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-rose-400 to-rose-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle2 size={40} className="stroke-[1.5] text-emerald-400 mb-2 animate-bounce" />
                <span className="text-xs font-bold text-emerald-600">¡Excelente Clima Pedagógico!</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Ningún alumno desaprobado en ningún curso en {selectedAnio}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial collection & Delinquency (Side-by-Side BarChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36]">Recaudación y Deuda Operativa Mensual</h2>
            <p className="text-[11px] text-[#8898aa]">Visualización de ingresos reales recaudados frente a la cartera morosa (deuda acumulada) de pensiones por mes (S/.).</p>
          </div>
          <div className="h-72">
            {data?.finanzas_mensual?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.finanzas_mensual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#8898aa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="recaudado" fill="#4c47df" radius={[4, 4, 0, 0]} name="Monto Recaudado (S/.)" />
                  <Bar dataKey="deuda" fill="#ff6584" radius={[4, 4, 0, 0]} name="Monto Moroso / Deuda (S/.)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <TrendingUp size={40} className="stroke-[1.5] text-slate-300 mb-2" />
                <span className="text-xs font-medium">Sin registros de pensiones generados para este año.</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic School Quality Radar Chart (Comparativa Multidimensional) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-1.5">
              <Compass size={16} className="text-[#6c63ff]" />
              <span>Radar de Calidad Escolar Multidimensional</span>
            </h2>
            <p className="text-[11px] text-[#8898aa]">Comparación de ejes clave de rendimiento: Pedagógico, Asistencia, Clima Escolar y Finanzas vs Periodo Previo ({previousYear}).</p>
          </div>
          <div className="h-72">
            {data?.radar_calidad?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={data?.radar_calidad}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" stroke="#8898aa" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#e2e8f0" fontSize={8} />
                  <Radar name={`Periodo Actual (${selectedAnio})`} dataKey="Actual" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.25} />
                  <Radar name={`Periodo Previo (${previousYear})`} dataKey="Previo" stroke="#ffb236" fill="#ffb236" fillOpacity={0.15} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 9 }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Compass size={40} className="stroke-[1.5] text-slate-300 mb-2" />
                <span className="text-xs font-medium">Sin datos históricos para trazar la comparativa de radar.</span>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Organizational Chart 2: LineChart Absenteeism Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div>
            <h2 className="text-sm font-bold text-[#1a1f36]">Tasa de Ausentismo Crónico por Grado</h2>
            <p className="text-[11px] text-[#8898aa]">Cantidad de estudiantes con alto riesgo de deserción y desaprobación automática (3 o más inasistencias acumuladas).</p>
          </div>
          <div className="h-72">
            {data?.ausentismo_riesgo?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.ausentismo_riesgo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#8898aa" fontSize={9} tickLine={false} />
                  <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="en_riesgo" stroke="#ff6584" strokeWidth={3} activeDot={{ r: 8 }} name="Alumnos con Ausentismo Crónico" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Activity size={40} className="stroke-[1.5] text-slate-300 mb-2" />
                <span className="text-xs font-medium">Sin registros de inasistencias para este año.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECCIÓN DE ANÁLISIS DE INTERACCIÓN INTER-ÁREAS (EXPOSICIÓN & TOMA DE DECISIONES) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-[#1a1f36] flex items-center gap-2">
            <Activity size={20} className="text-[#6c63ff] animate-pulse" />
            <span>Análisis Cruzado e Interacción de Áreas (Auditoría & Decisiones)</span>
          </h2>
          <p className="text-[11px] text-[#8898aa]">
            Visualiza cómo interactúan múltiples áreas de la institución (Pedagógica, Asistencia, Conducta y Finanzas) para diagnosticar patrones de comportamiento y tomar decisiones estratégicas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico 1: Asistencia vs Rendimiento (ComposedChart) */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#1a1f36] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                1. Asistencia vs. Rendimiento Académico
              </h3>
              <p className="text-[10px] text-[#8898aa]">
                Nota promedio general (Barras) y tasa de reprobación (Línea) según la asistencia.
              </p>
            </div>
            <div className="h-64">
              {data?.interaccion_asistencia_notas?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.interaccion_asistencia_notas} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#8898aa" fontSize={8} tickLine={false} />
                    <YAxis yAxisId="left" domain={[0, 20]} stroke="#8898aa" fontSize={9} tickLine={false} label={{ value: 'Nota Promedio', angle: -90, position: 'insideLeft', offset: 10, fontSize: 8, fill: '#8898aa' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#8898aa" fontSize={9} tickLine={false} label={{ value: 'Reprobados (%)', angle: 90, position: 'insideRight', offset: 10, fontSize: 8, fill: '#8898aa' }} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Bar yAxisId="left" dataKey="nota_promedio" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Promedio de Notas" />
                    <Line yAxisId="right" type="monotone" dataKey="tasa_reprobacion" stroke="#f5365c" strokeWidth={2.5} name="Tasa de Reprobación (%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Activity size={30} className="stroke-[1.5] text-slate-300 mb-1" />
                  <span className="text-[10px]">Sin datos para este gráfico.</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              💡 <strong>Diagnóstico de Exposición:</strong> Los alumnos con asistencia &gt;95% tienen un promedio sobresaliente de 14.0 y casi 0% de reprobación. Cuando la asistencia cae por debajo del 90%, el promedio desciende a 9.6 y el 95.7% de alumnos reprueba.
            </div>
          </div>

          {/* Gráfico 2: Conducta vs Rendimiento (AreaChart) */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#1a1f36] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                2. Disciplina vs. Rendimiento Académico
              </h3>
              <p className="text-[10px] text-[#8898aa]">
                Impacto de las incidencias de conducta (leve/grave) en el rendimiento promedio.
              </p>
            </div>
            <div className="h-64">
              {data?.interaccion_conducta_notas?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.interaccion_conducta_notas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dce89" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2dce89" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f5365c" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f5365c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#8898aa" fontSize={8} tickLine={false} />
                    <YAxis stroke="#8898aa" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Area type="monotone" dataKey="nota_promedio" stroke="#2dce89" fillOpacity={1} fill="url(#colorNota)" name="Nota Promedio" />
                    <Area type="monotone" dataKey="tasa_reprobacion" stroke="#f5365c" fillOpacity={1} fill="url(#colorRep)" name="Tasa de Reprobación (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Activity size={30} className="stroke-[1.5] text-slate-300 mb-1" />
                  <span className="text-[10px]">Sin datos para este gráfico.</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              💡 <strong>Diagnóstico de Exposición:</strong> El 30.8% de alumnos con faltas graves disciplinarias reprueban alguna asignatura, con promedios sensiblemente menores comparado con alumnos con conducta impecable.
            </div>
          </div>

          {/* Gráfico 3: Finanzas vs Asistencia (BarChart) */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#1a1f36] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                3. Estado de Pagos vs. Asistencia Escolar
              </h3>
              <p className="text-[10px] text-[#8898aa]">
                Tasa de asistencia de alumnos agrupados por su nivel de morosidad.
              </p>
            </div>
            <div className="h-64">
              {data?.interaccion_finanzas_asistencia?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.interaccion_finanzas_asistencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#8898aa" fontSize={8} tickLine={false} />
                    <YAxis domain={[90, 100]} stroke="#8898aa" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="asistencia_promedio" fill="#ffb236" radius={[4, 4, 0, 0]} name="Asistencia Promedio (%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Activity size={30} className="stroke-[1.5] text-slate-300 mb-1" />
                  <span className="text-[10px]">Sin datos para este gráfico.</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              💡 <strong>Diagnóstico de Exposición:</strong> Existe una pequeña desviación en la asistencia en alumnos de morosidad crítica (94.63% vs 95.59% de alumnos al día), alertando a la institución para activar protocolos de retención por motivos económicos.
            </div>
          </div>

          {/* Gráfico 4: Radar de Ejes Institucionales (RadarChart) */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#1a1f36] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                4. Ejes Operacionales de Calidad Institucional
              </h3>
              <p className="text-[10px] text-[#8898aa]">
                Comparativa multidimensional de las áreas clave para evaluar el desempeño general.
              </p>
            </div>
            <div className="h-64">
              {data?.radar_calidad?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" radius="70%" data={data.radar_calidad}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#8898aa" fontSize={8} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={7} />
                    <Radar name={`Año Actual (${selectedAnio})`} dataKey="Actual" stroke="#ff6584" fill="#ff6584" fillOpacity={0.2} />
                    <Radar name={`Año Anterior (${previousYear})`} dataKey="Previo" stroke="#4c47df" fill="#4c47df" fillOpacity={0.1} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Activity size={30} className="stroke-[1.5] text-slate-300 mb-1" />
                  <span className="text-[10px]">Sin datos para este gráfico.</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              💡 <strong>Diagnóstico de Exposición:</strong> Permite evaluar visualmente si la mejora en el área académica o de asistencia se condice con un clima de convivencia escolar positivo y finanzas saneadas.
            </div>
          </div>

        </div>
      </div>

      {/* Decision-making actionable insights section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-[#1a1f36] flex items-center gap-2 pb-3 border-b border-slate-100">
          <Award size={18} className="text-[#6c63ff]" />
          <span>Panel de Decisiones Estratégicas Recomendadas (Toma de Decisiones - {selectedAnio})</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Académico */}
          <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>Decisión Pedagógica (SIAGIE)</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Refuerzo Académico Focalizado</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {lowestGradeObj?.promedio > 0 ? (
                <>
                  Para el año {selectedAnio}, el grado <strong>{lowestGradeObj.name}</strong> registró el rendimiento más crítico. Adicionalmente, el censo SIAGIE reporta alumnos en escala <strong>C (En Inicio)</strong>. Se formaliza la apertura de <strong>talleres de nivelación obligatorios</strong> los martes y jueves y la entrega de <strong>carpetas de recuperación académica</strong> de cara a los exámenes finales.
                </>
              ) : (
                "Rendimiento general satisfactorio. Mantener la programación actual."
              )}
            </p>
          </div>

          {/* Card 2: Conducta */}
          <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-50 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
              <AlertCircle size={16} />
              <span>Decisión de Clima y Tutoría</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Intervención de Psicología</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {highestConductGraveObj?.grave > 0 ? (
                <>
                  Se registra un foco conductual crítico en el periodo {selectedAnio} en <strong>{highestConductGraveObj.name}</strong> con <strong>{highestConductGraveObj.grave}</strong> faltas graves. Se decide programar una <strong>charla de prevención del bullying y asertividad</strong> y citación general a los apoderados del aula.
                </>
              ) : (
                "Excelente convivencia escolar general. Promover actividades recreativas al aire libre."
              )}
            </p>
          </div>

          {/* Card 3: Finanzas y Retención */}
          <div className="p-4 bg-rose-50/30 rounded-xl border border-rose-50 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
              <TrendingUp size={16} />
              <span>Decisión Financiera y Retención</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Retención de Alumnos y Contingencia de Cobranza</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {totalDeuda > 0 || totalStudentsInRisk > 0 ? (
                <>
                  Con <strong>{totalStudentsInRisk} alumnos</strong> en alto ausentismo y una morosidad del <strong>{globalMorosidadRate}%</strong>, se decide activar visitas sociales domiciliarias de tutoría para evitar la <strong>deserción escolar</strong>, acopladas a planes de fraccionamiento flexible de pensiones vencidas.
                </>
              ) : (
                "Finanzas institucionales sanas. Proyectar inversiones en laboratorios de computación."
              )}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analisis;
