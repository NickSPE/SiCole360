import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Briefcase, Building, AlertTriangle, TrendingUp, Clock, ShieldAlert, FileText,
  Sparkles, Calendar, CheckCircle2, AlertCircle, Award, Compass, Percent, BookOpen, Activity,
  PieChart as PieIcon, BarChart2, DollarSign, LayoutDashboard, Target, Sliders, UserCheck,
  Printer, ArrowUpRight, ArrowDownRight, Layers, HelpCircle, Check, X, PhoneCall, Mail
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS_SIAGIE = ['#11cdef', '#2dce89', '#ffb236', '#f5365c'];
const COLORS_PAYMENTS = ['#4c47df', '#11cdef', '#ffb236', '#f5365c'];

const Dashboard = () => {
  const { user, selectedInstitucion } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'risk_simulation', 'financial', 'academic', 'teachers', 'attendance'
  const [selectedAnio, setSelectedAnio] = useState('2026');
  
  const [stats, setStats] = useState(null);
  const [analisis, setAnalisis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // What-If Simulation Sliders State
  const [discountRate, setDiscountRate] = useState(5); // % pronto pago
  const [recoveryRate, setRecoveryRate] = useState(15); // % recuperación morosidad
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const instParam = selectedInstitucion ? `?institucion=${selectedInstitucion}` : '';
        const instParamAmp = selectedInstitucion ? `&institucion=${selectedInstitucion}` : '';

        const [statsRes, alertsRes, analisisRes] = await Promise.allSettled([
          axios.get(`http://localhost:8000/api/dashboard/stats/${instParam}`),
          axios.get(`http://localhost:8000/api/alertas/pendientes/${instParam}`),
          axios.get(`http://localhost:8000/api/dashboard/analisis/?anio=${selectedAnio}${instParamAmp}`)
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.slice(0, 5));
        if (analisisRes.status === 'fulfilled') setAnalisis(analisisRes.value.data);
      } catch (error) {
        console.error("Error loading executive dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedInstitucion, selectedAnio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  const isParent = user?.rol === 'Apoderado';
  const isTeacher = user?.rol === 'Docente';

  // Derived stats for Decision Making
  const lowestGradeObj = analisis?.academico_grado?.reduce((prev, current) => 
    (prev.promedio < current.promedio) ? prev : current, { name: 'N/A', promedio: 20 }
  );

  const highestConductGraveObj = analisis?.conducta_grado?.reduce((prev, current) => 
    (prev.grave > current.grave) ? prev : current, { name: 'Ninguno', grave: 0 }
  );

  const totalDeuda = analisis?.finanzas_mensual?.reduce((sum, item) => sum + item.deuda, 0) || 0;
  const totalRecaudado = analisis?.finanzas_mensual?.reduce((sum, item) => sum + item.recaudado, 0) || 0;
  const totalPensions = totalDeuda + totalRecaudado;
  const globalMorosidadRate = totalPensions > 0 ? ((totalDeuda / totalPensions) * 100).toFixed(1) : 0;
  const totalStudentsInRisk = analisis?.ausentismo_riesgo?.reduce((sum, item) => sum + item.en_riesgo, 0) || 0;
  const maxAlumnosC = analisis?.cursos_riesgo?.reduce((max, item) => item.alumnos > max ? item.alumnos : max, 1) || 1;
  const previousYear = parseInt(selectedAnio) - 1;

  // What-If Math Simulation
  const simulatedRecoveryAmount = (totalDeuda * (recoveryRate / 100.0));
  const simulatedProntoPagoSavings = (totalRecaudado * (discountRate / 100.0));
  const simulatedNetRevenue = totalRecaudado + simulatedRecoveryAmount - simulatedProntoPagoSavings;

  const chartDataOverview = stats?.chart_data || [
    { name: 'Marzo', asistencia: 92, morosidad: 12 },
    { name: 'Abril', asistencia: 94, morosidad: 8 },
    { name: 'Mayo', asistencia: 95, morosidad: 5 },
  ];

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header bar with title and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1f36] tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-[#6c63ff] animate-pulse" />
            <span>{isParent ? 'Mi Portal de Apoderado' : isTeacher ? 'Portal del Docente' : 'Central de Inteligencia Directiva 360°'}</span>
          </h1>
          <p className="text-xs text-[#8898aa] mt-0.5">
            {isParent 
              ? 'Seguimiento y control de rendimiento académico y de asistencia de tus hijos.' 
              : `Plataforma de analítica predictiva y toma de decisiones empresariales para ${user?.institucion_nombre || 'SIBES 360'}.`}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <Calendar size={15} className="text-indigo-500 ml-1" />
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Año Lectivo:</span>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(e.target.value)}
              className="bg-white border border-indigo-100 hover:border-indigo-300 text-xs font-bold text-indigo-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/20 cursor-pointer shadow-sm transition-all"
            >
              <option value="2026">📅 2026 (Periodo Actual)</option>
              <option value="2025">📅 2025 (Histórico)</option>
              <option value="2024">📅 2024 (Histórico)</option>
            </select>
          </div>

          <button
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            title="Exportar Reporte Ejecutivo para Junta Directiva"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation 6 Executive Tabs Header */}
      {!isParent && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Visión General</span>
          </button>

          <button
            onClick={() => setActiveTab('risk_simulation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'risk_simulation'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Target size={16} />
            <span>Simulador & Riesgo 360°</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <DollarSign size={16} />
            <span>Salud Financiera & Pagos</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'academic'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={16} />
            <span>Rendimiento SIAGIE</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={16} />
            <span>Plana Docente & Eficiencia</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Activity size={16} />
            <span>Asistencia & Tardanzas</span>
          </button>
        </div>
      )}

      {/* Global Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard 
          title={isParent ? "Hijos Representados" : "Total Alumnos"} 
          value={stats?.total_estudiantes || 0} 
          subtitle={isParent ? "Estudiantes vinculados" : "Matrículas registradas"} 
          trend={isParent ? undefined : "+4.8%"}
          trendType={isParent ? undefined : "up"} 
          icon={Users} 
        />
        <KPICard 
          title={isParent ? "Colegio" : "Total Docentes"} 
          value={isParent ? (user?.institucion_nombre || "Asignado") : (stats?.total_docentes || 0)} 
          subtitle={isParent ? "Institución educativa" : "Plana docente activa"} 
          trend={isParent ? undefined : "Estable"} 
          icon={Briefcase} 
          color="warning"
        />
        <KPICard 
          title={isParent ? "Asistencia Hijo(s)" : "Asistencia General"} 
          value={`${stats?.asistencia?.tasa_asistencia || 100}%`} 
          subtitle="Tasa de asistencia"
          trend="+1.2%" 
          trendType="up" 
          icon={Clock} 
          color="success"
        />
        <KPICard 
          title="Alertas Pendientes" 
          value={stats?.alertas_pendientes || 0} 
          subtitle={isParent ? "Incidencias de tu hijo" : "Alertas del colegio"}
          trend={stats?.alertas_pendientes > 0 ? "Requiere acción" : "Sin alertas"} 
          trendType={stats?.alertas_pendientes > 0 ? "down" : "neutral"}
          icon={AlertTriangle} 
          color="danger"
        />
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#1a1f36]">Tendencia Operativa: Asistencia vs Morosidad</h2>
                  <p className="text-[11px] text-[#8898aa]">Comportamiento mensual consolidado en el periodo actual.</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAsist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dce89" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2dce89" stopOpacity={0}/>
                      </linearGradient>
                      {!isParent && !isTeacher && (
                        <linearGradient id="colorMoros" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                        </linearGradient>
                      )}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#8898aa" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8898aa" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="asistencia" stroke="#2dce89" fillOpacity={1} fill="url(#colorAsist)" strokeWidth={2.5} name="Tasa Asistencia (%)" />
                    {!isParent && !isTeacher && (
                      <Area type="monotone" dataKey="morosidad" stroke="#6c63ff" fillOpacity={1} fill="url(#colorMoros)" strokeWidth={2.5} name="Tasa Morosidad (%)" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick summary cards for SuperAdmin */}
            {user?.rol === 'SuperAdmin' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-[#1a1f36] mb-3">Instituciones Afiliadas al Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="p-3 bg-indigo-50 text-[#6c63ff] rounded-xl">
                      <Building size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Colegios en Plataforma</p>
                      <p className="text-lg font-extrabold text-slate-800">{stats?.total_instituciones || 1}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Recent Alerts */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-[#1a1f36] flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-500" />
                  <span>Alertas Prioritarias</span>
                </h2>
                <span className="bg-rose-50 text-rose-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {alerts.length} Críticas
                </span>
              </div>

              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alerta) => (
                    <div key={alerta.id} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">{alerta.tipo}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{alerta.fecha || 'Hoy'}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{alerta.descripcion}</p>
                      <div className="pt-1 flex justify-between items-center text-[10px]">
                        <span className="font-bold text-indigo-600">{alerta.estudiante_nombres || 'Estudiante'}</span>
                        <span className="text-rose-600 font-bold uppercase tracking-wider">Acción Requerida</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">¡Sin alertas pendientes!</p>
                    <p className="text-[11px] text-slate-400">Todo marcha correctamente en la institución.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: RISK MATRIX & WHAT-IF SIMULATION */}
      {activeTab === 'risk_simulation' && (
        <div className="space-y-8">
          {/* Scatter plot risk matrix */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                  <Target size={18} className="text-rose-500" />
                  <span>Matriz de Riesgo 360° Alumno por Alumno (Scatter Matrix)</span>
                </h2>
                <p className="text-[11px] text-[#8898aa]">
                  Eje X: Promedio Académico | Eje Y: % Asistencia | Haz clic en cualquier estudiante para ver su Ficha de Intervención Directa.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Crítico</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Observación</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Saludable</span>
              </div>
            </div>

            <div className="h-80">
              {analisis?.matriz_estudiantes_riesgo?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="promedio" name="Promedio" unit=" pts" domain={[0, 20]} stroke="#8898aa" fontSize={10} />
                    <YAxis type="number" dataKey="asistencia" name="Asistencia" unit="%" domain={[60, 100]} stroke="#8898aa" fontSize={10} />
                    <ZAxis type="number" dataKey="deuda" range={[60, 400]} name="Deuda" unit=" S/." />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                      if (payload && payload.length) {
                        const dataItem = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-extrabold text-indigo-300">{dataItem.nombre}</p>
                            <p>Promedio: <strong className="text-white">{dataItem.promedio}</strong></p>
                            <p>Asistencia: <strong className="text-white">{dataItem.asistencia}%</strong></p>
                            <p>Deuda: <strong className="text-rose-400">S/ {dataItem.deuda}</strong></p>
                            <p className="text-[10px] uppercase font-bold text-amber-300 pt-1">Clic para abrir Ficha Directiva</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Scatter 
                      name="Estudiantes" 
                      data={analisis?.matriz_estudiantes_riesgo} 
                      onClick={(e) => setSelectedStudentModal(e)}
                      className="cursor-pointer"
                    >
                      {analisis?.matriz_estudiantes_riesgo?.map((entry, index) => {
                        const color = entry.riesgo === 'Critico' ? '#f5365c' : (entry.riesgo === 'Medio' ? '#ffb236' : '#2dce89');
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin datos de matriz</div>
              )}
            </div>
          </div>

          {/* WHAT-IF SIMULATION SLIDERS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-extrabold text-[#1a1f36] flex items-center gap-2">
                  <Sliders size={18} className="text-[#6c63ff]" />
                  <span>Simulador Financiero Predictivo "What-If"</span>
                </h2>
                <p className="text-[11px] text-[#8898aa]">Ajusta las variables para simular el impacto en los ingresos netos del colegio.</p>
              </div>
              <span className="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1 rounded-xl">
                Proyección Dinámica
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Slider 1 */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Descuento por Pronto Pago (Antes del día 5):</label>
                  <span className="text-sm font-extrabold text-indigo-600">{discountRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={discountRate} 
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full accent-[#6c63ff] cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Costo de incentivo de pronto pago: <strong className="text-rose-500">-S/ {simulatedProntoPagoSavings.toLocaleString()}</strong></p>
              </div>

              {/* Slider 2 */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Recuperación de Morosidad Estimada:</label>
                  <span className="text-sm font-extrabold text-emerald-600">{recoveryRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={recoveryRate} 
                  onChange={(e) => setRecoveryRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Ingreso adicional recuperado: <strong className="text-emerald-600">+S/ {simulatedRecoveryAmount.toLocaleString()}</strong></p>
              </div>
            </div>

            {/* Results Callout */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
              <div>
                <span className="text-xs font-medium text-slate-300">Recaudación Neta Proyectada con Escenario Simulado:</span>
                <p className="text-2xl font-black text-emerald-400">S/ {simulatedNetRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-indigo-200">Impacto Estimado en Caja:</span>
                <p className="text-lg font-bold text-white">
                  {simulatedRecoveryAmount - simulatedProntoPagoSavings >= 0 ? '+' : ''} S/ {(simulatedRecoveryAmount - simulatedProntoPagoSavings).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FINANCIAL & PAYMENTS FUNNEL */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Monto Total Recaudado</span>
              <p className="text-2xl font-black text-emerald-600">S/ {totalRecaudado.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">Ingresos efectivos ingresados a caja en {selectedAnio}</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Cartera Morosa / Deuda</span>
              <p className="text-2xl font-black text-rose-600">S/ {totalDeuda.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">Pensiones pendientes y vencidas acumuladas</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Tasa de Morosidad Global</span>
              <p className="text-2xl font-black text-indigo-600">{globalMorosidadRate}%</p>
              <p className="text-[11px] text-slate-400">Porcentaje de deuda sobre la facturación total</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recaudación mensual */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Estado de Recaudación y Deuda Operativa Mensual (S/.)</h2>
                <p className="text-[11px] text-[#8898aa]">Desglose de cobros realizados frente a morosidad por mes.</p>
              </div>
              <div className="h-72">
                {analisis?.finanzas_mensual?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analisis?.finanzas_mensual} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#8898aa" fontSize={10} tickLine={false} />
                      <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="recaudado" fill="#4c47df" radius={[4, 4, 0, 0]} name="Monto Recaudado (S/.)" />
                      <Bar dataKey="deuda" fill="#ff6584" radius={[4, 4, 0, 0]} name="Monto Moroso (S/.)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs font-medium">Sin datos</div>
                )}
              </div>
            </div>

            {/* Payment methods funnel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Distribución por Métodos y Canales de Pago</h2>
                <p className="text-[11px] text-[#8898aa]">Preferencia de canal de pago de los apoderados de la institución.</p>
              </div>
              <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-4">
                {analisis?.metodos_pago?.length > 0 ? (
                  <>
                    <div className="w-1/2 h-full min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analisis.metodos_pago}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {analisis.metodos_pago.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_PAYMENTS[index % COLORS_PAYMENTS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-2.5">
                      {analisis.metodos_pago.map((entry, index) => (
                        <div key={entry.name} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_PAYMENTS[index % COLORS_PAYMENTS.length] }}></span>
                              {entry.name}
                            </span>
                            <span>{entry.value}%</span>
                          </div>
                          <p className="text-[10px] text-slate-400 pl-4">S/ {entry.monto?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin datos de pagos</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ACADEMIC SIAGIE */}
      {activeTab === 'academic' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Promedios por grado */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Rendimiento Académico Promedio por Grado</h2>
                <p className="text-[11px] text-[#8898aa]">Línea roja punteada representa la nota aprobatoria (11.0).</p>
              </div>
              <div className="h-72">
                {analisis?.academico_grado?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analisis?.academico_grado} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#8898aa" fontSize={10} tickLine={false} />
                      <YAxis domain={[0, 20]} stroke="#8898aa" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <ReferenceLine y={11.0} stroke="#ff6584" strokeDasharray="4 4" label={{ value: '11.0 Min', fill: '#ff6584', fontSize: 10 }} />
                      <Bar dataKey="promedio" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Promedio" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin calificaciones</div>
                )}
              </div>
            </div>

            {/* Distribución SIAGIE Donut */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Distribución de Calificaciones SIAGIE (MINEDU)</h2>
                <p className="text-[11px] text-[#8898aa]">Escala oficial de logros alcanzados por la masa estudiantil.</p>
              </div>
              <div className="h-72 flex flex-col sm:flex-row items-center justify-center gap-4">
                {analisis?.distribucion_notas?.some(x => x.value > 0) ? (
                  <>
                    <div className="w-1/2 h-full min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analisis.distribucion_notas}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {analisis.distribucion_notas.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_SIAGIE[index % COLORS_SIAGIE.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-2">
                      {analisis.distribucion_notas.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS_SIAGIE[index % COLORS_SIAGIE.length] }}></span>
                          <span>{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin distribución</div>
                )}
              </div>
            </div>
          </div>

          {/* Cursos Críticos (Alumnos en Escala C) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Asignaturas Críticas (Mayor cantidad de Alumnos Jalados / Escala C)</h2>
              <p className="text-[11px] text-[#8898aa]">Priorización para auditorías pedagógicas docentes y reforzamiento académico.</p>
            </div>
            <div className="space-y-3">
              {analisis?.cursos_riesgo?.length > 0 ? (
                analisis.cursos_riesgo.map((item) => {
                  const percentage = ((item.alumnos / maxAlumnosC) * 100).toFixed(0);
                  return (
                    <div key={item.curso} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-rose-500" />
                          {item.curso}
                        </span>
                        <span className="text-rose-600 font-extrabold">{item.alumnos} Alumnos Desaprobados</span>
                      </div>
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
                <div className="text-center py-6 text-emerald-600 font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>¡Excelente! Ningún alumno desaprobado en ningún curso en {selectedAnio}.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: TEACHERS PERFORMANCE & WORKLOAD */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Evaluación de Eficiencia y Carga de la Plana Docente</h2>
                <p className="text-[11px] text-[#8898aa]">Control de horas semanales, promedio académico de alumnos a cargo y cumplimiento de registros.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-xl">
                Plana Activa: {analisis?.docentes_eficiencia?.length || 0} Profesores
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4 font-bold">Docente</th>
                    <th className="py-3 px-4 font-bold">Especialidad</th>
                    <th className="py-3 px-4 font-bold text-center">Horas / Sem</th>
                    <th className="py-3 px-4 font-bold text-center">Promedio Alumnos</th>
                    <th className="py-3 px-4 font-bold text-center">Cumplimiento Registros</th>
                    <th className="py-3 px-4 font-bold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analisis?.docentes_eficiencia?.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                          {doc.nombre.charAt(0)}
                        </div>
                        {doc.nombre}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{doc.especialidad}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{doc.horas_semanales} hrs</td>
                      <td className="py-3 px-4 text-center font-extrabold text-indigo-600">{doc.promedio_alumnos} / 20</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          {doc.cumplimiento}% a tiempo
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Excelente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: ATTENDANCE & CONDUCT */}
      {activeTab === 'attendance' && (
        <div className="space-y-8">
          {/* Day of Week Attendance Heatmap */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Patrón de Puntualidad y Tardanzas por Día de la Semana (Lunes a Viernes)</h2>
              <p className="text-[11px] text-[#8898aa]">Análisis operativo para refuerzo de control de asistencia en la puerta de ingreso.</p>
            </div>
            <div className="h-72">
              {analisis?.asistencia_dias_semana?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analisis?.asistencia_dias_semana} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="dia" stroke="#8898aa" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="puntual" stackId="a" fill="#2dce89" name="Puntual (%)" />
                    <Bar dataKey="tardanza" stackId="a" fill="#ffb236" name="Tardanza (%)" />
                    <Bar dataKey="inasistencia" stackId="a" fill="#ff6584" name="Inasistencia (%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin datos semanales</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incidencias Conductuales */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Distribución de Incidencias de Conducta por Grado</h2>
                <p className="text-[11px] text-[#8898aa]">Faltas leves, graves y reconocimientos positivos acumulados.</p>
              </div>
              <div className="h-72">
                {analisis?.conducta_grado?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analisis?.conducta_grado} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#8898aa" fontSize={10} tickLine={false} />
                      <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="positiva" stackId="a" fill="#2dce89" name="Conducta Positiva" />
                      <Bar dataKey="leve" stackId="a" fill="#ffb236" name="Falta Leve" />
                      <Bar dataKey="grave" stackId="a" fill="#ff6584" name="Falta Grave" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin incidencias</div>
                )}
              </div>
            </div>

            {/* Ausentismo Crónico */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1a1f36]">Tasa de Ausentismo Crónico por Grado</h2>
                <p className="text-[11px] text-[#8898aa]">Alumnos con 3 o más inasistencias en riesgo directo de deserción.</p>
              </div>
              <div className="h-72">
                {analisis?.ausentismo_riesgo?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analisis?.ausentismo_riesgo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#8898aa" fontSize={10} tickLine={false} />
                      <YAxis stroke="#8898aa" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="en_riesgo" stroke="#ff6584" strokeWidth={3} activeDot={{ r: 7 }} name="Estudiantes en Riesgo" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sin ausentismo</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT INTERVENTION MODAL */}
      {selectedStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 border border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 font-extrabold flex items-center justify-center text-base">
                  {selectedStudentModal.nombre?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{selectedStudentModal.nombre}</h3>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Riesgo {selectedStudentModal.riesgo}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Promedio</span>
                <p className="text-base font-extrabold text-slate-800">{selectedStudentModal.promedio}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Asistencia</span>
                <p className="text-base font-extrabold text-indigo-600">{selectedStudentModal.asistencia}%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Deuda</span>
                <p className="text-base font-extrabold text-rose-600">S/ {selectedStudentModal.deuda}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Acciones de Intervención Recomendadas en 1-Clic:</p>
              <button 
                onClick={() => {
                  alert(`Citación enviada correctamente al apoderado de ${selectedStudentModal.nombre}`);
                  setSelectedStudentModal(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#6c63ff] hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Mail size={15} />
                <span>Enviar Citación Urgente a Apoderado</span>
              </button>

              <button 
                onClick={() => {
                  alert(`Plan de refinanciamiento solicitado para ${selectedStudentModal.nombre}`);
                  setSelectedStudentModal(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <PhoneCall size={15} />
                <span>Solicitar Plan de Pago Flexible</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
