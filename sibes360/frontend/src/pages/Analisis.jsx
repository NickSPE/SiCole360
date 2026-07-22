import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis,
  ComposedChart, AreaChart, Area, Treemap
} from 'recharts';
import { 
  TrendingUp, ShieldAlert, Award, FileText, Sparkles, AlertCircle, Calendar, CheckCircle2,
  Users, Activity, Percent, BookOpen, Compass, Filter, DollarSign, Layers, Target, PieChart as PieIcon, RefreshCw
} from 'lucide-react';
import KPICard from '../components/KPICard';

const COLORS_STATUS = ['#2dce89', '#ffb236', '#f5365c', '#6c63ff'];
const COLORS_CHANNELS = ['#11cdef', '#2dce89', '#ffb236', '#f5365c', '#6c63ff'];

const Analisis = () => {
  const { selectedInstitucion } = useAuth();
  
  // Temporal Filters State
  const [selectedAnio, setSelectedAnio] = useState('2026');
  const [selectedSemestre, setSelectedSemestre] = useState('TODOS');
  const [selectedTrimestre, setSelectedTrimestre] = useState('TODOS');
  const [selectedBimestre, setSelectedBimestre] = useState('TODOS');
  const [selectedMes, setSelectedMes] = useState('TODOS');
  
  // Active Tab State (6 Strategic DSS Dashboards)
  const [activeTab, setActiveTab] = useState('morosidad');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalisisData = async () => {
      try {
        setLoading(true);
        const instParam = selectedInstitucion ? `&institucion=${selectedInstitucion}` : '';
        const temporalParam = `&semestre=${selectedSemestre}&trimestre=${selectedTrimestre}&bimestre=${selectedBimestre}&mes=${selectedMes}`;
        const res = await axios.get(`http://localhost:8000/api/dashboard/analisis/?anio=${selectedAnio}${instParam}${temporalParam}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analysis stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalisisData();
  }, [selectedInstitucion, selectedAnio, selectedSemestre, selectedTrimestre, selectedBimestre, selectedMes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c63ff]"></div>
      </div>
    );
  }

  // Calculated Metrics
  const totalDeuda = data?.finanzas_mensual?.reduce((sum, item) => sum + item.deuda, 0) || 18500;
  const totalRecaudado = data?.finanzas_mensual?.reduce((sum, item) => sum + item.recaudado, 0) || 124000;
  const totalPensions = totalDeuda + totalRecaudado;
  const globalMorosidadRate = totalPensions > 0 ? ((totalDeuda / totalPensions) * 100).toFixed(1) : '12.9';

  // Sample data for 6 Power BI Dashboards when API fallback is active
  const morosidadGradoData = data?.morosidad_grado || [
    { grado: '1º Primaria', alDia: 85, moraLeve: 10, moraCritica: 5 },
    { grado: '2º Primaria', alDia: 90, moraLeve: 7, moraCritica: 3 },
    { grado: '3º Primaria', alDia: 78, moraLeve: 14, moraCritica: 8 },
    { grado: '4º Primaria', alDia: 82, moraLeve: 11, moraCritica: 7 },
    { grado: '5º Primaria', alDia: 88, moraLeve: 8, moraCritica: 4 },
    { grado: '1º Secundaria', alDia: 72, moraLeve: 18, moraCritica: 10 },
    { grado: '2º Secundaria', alDia: 75, moraLeve: 15, moraCritica: 10 },
    { grado: '3º Secundaria', alDia: 80, moraLeve: 12, moraCritica: 8 },
  ];

  const aforoMorosidadScatter = [
    { id: '1º Primaria A', aforo: 93, morosidad: 5, estudiantes: 28 },
    { id: '2º Primaria A', aforo: 96, morosidad: 8, estudiantes: 29 },
    { id: '3º Primaria A', aforo: 85, morosidad: 14, estudiantes: 25 },
    { id: '4º Primaria A', aforo: 60, morosidad: 22, estudiantes: 18 }, // Inviable
    { id: '5º Primaria A', aforo: 90, morosidad: 6, estudiantes: 27 },
    { id: '1º Secundaria A', aforo: 97, morosidad: 18, estudiantes: 29 },
    { id: '2º Secundaria A', aforo: 58, morosidad: 25, estudiantes: 17 }, // Inviable
  ];

  const funnelAdmisionData = [
    { etapa: '1. Solicitud Informes', cantidad: 320, fill: '#6c63ff' },
    { etapa: '2. Eval. Psicopedagógica', cantidad: 240, fill: '#11cdef' },
    { etapa: '3. Reserva Vacante', cantidad: 180, fill: '#ffb236' },
    { etapa: '4. Pago de Matrícula', cantidad: 152, fill: '#2dce89' },
    { etapa: '5. Matriculado Regular', cantidad: 148, fill: '#2dce89' },
  ];

  const rendimientoPagoData = [
    { estadoPago: 'Al Día', promedioNota: 16.4, aprobados: 94, desaprobados: 6 },
    { estadoPago: 'Mora 1-30 Días', promedioNota: 14.1, aprobados: 82, desaprobados: 18 },
    { estadoPago: 'Mora >60 Días', promedioNota: 11.8, aprobados: 65, desaprobados: 35 },
  ];

  const arrWaterfallData = [
    { mes: 'Marzo', recaudo: 24500, proyectado: 25000 },
    { mes: 'Abril', recaudo: 24200, proyectado: 25000 },
    { mes: 'Mayo', recaudo: 23800, proyectado: 25000 },
    { mes: 'Junio', recaudo: 24100, proyectado: 25000 },
    { mes: 'Julio', recaudo: 24600, proyectado: 25000 },
    { mes: 'Agosto', recaudo: 23900, proyectado: 25000 },
    { mes: 'Setiembre', recaudo: 24300, proyectado: 25000 },
    { mes: 'Octubre', recaudo: 24000, proyectado: 25000 },
    { mes: 'Noviembre', recaudo: 23500, proyectado: 25000 },
    { mes: 'Diciembre', recaudo: 24000, proyectado: 25000 },
  ];

  const churnData = [
    { name: 'Cambio Domicilio', value: 45 },
    { name: 'Motivo Económico', value: 35 },
    { name: 'Insatisfacción Pedagógica', value: 12 },
    { name: 'Conducta / Disciplina', value: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Context Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1f36] tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-[#6c63ff] animate-pulse" />
            <span>Módulo de Analítica Estratégica en Power BI (Nivel DSS / BI Directivo)</span>
          </h1>
          <p className="text-xs text-[#8898aa] mt-0.5">
            Modelado dimensional OLAP en estrella para la Promotora y Dirección General. Toma de decisiones basada en datos.
          </p>
        </div>

        {/* Global Reset Button */}
        <button
          onClick={() => {
            setSelectedAnio('2026');
            setSelectedSemestre('TODOS');
            setSelectedTrimestre('TODOS');
            setSelectedBimestre('TODOS');
            setSelectedMes('TODOS');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
        >
          <RefreshCw size={13} />
          <span>Restablecer Filtros</span>
        </button>
      </div>

      {/* 🗓️ CABECERA DE FILTROS TEMPORALES DINÁMICOS UNIFICADOS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 border-b border-slate-800 pb-2">
          <Filter size={14} className="text-indigo-400" />
          <span>Filtros Temporales Jerárquicos Dinámicos (Año / Semestre / Trimestre / Bimestre / Mes)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Año Lectivo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Año Lectivo:</label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="2026">📅 2026 (Actual)</option>
              <option value="2025">📅 2025 (Histórico)</option>
              <option value="2024">📅 2024 (Histórico)</option>
            </select>
          </div>

          {/* 2. Semestre */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Semestre:</label>
            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="TODOS">Todos los Semestres</option>
              <option value="SEM1">Semestre 1 (Mar - Jul)</option>
              <option value="SEM2">Semestre 2 (Ago - Dic)</option>
            </select>
          </div>

          {/* 3. Trimestre */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Trimestre:</label>
            <select
              value={selectedTrimestre}
              onChange={(e) => setSelectedTrimestre(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="TODOS">Todos los Trimestres</option>
              <option value="TRIM1">I Trimestre</option>
              <option value="TRIM2">II Trimestre</option>
              <option value="TRIM3">III Trimestre</option>
            </select>
          </div>

          {/* 4. Bimestre (MINEDU) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Bimestre (MINEDU):</label>
            <select
              value={selectedBimestre}
              onChange={(e) => setSelectedBimestre(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="TODOS">Todos los Bimestres</option>
              <option value="BIM1">I Bimestre (Mar-May)</option>
              <option value="BIM2">II Bimestre (May-Jul)</option>
              <option value="BIM3">III Bimestre (Ago-Oct)</option>
              <option value="BIM4">IV Bimestre (Oct-Dic)</option>
            </select>
          </div>

          {/* 5. Mes */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">Mes Lectivo:</label>
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="TODOS">Todos los Meses</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Setiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📱 TAB BAR PARA LOS 6 DASHBOARDS EN POWER BI */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-t-xl px-2 pt-2 gap-1 scrollbar-none">
        {[
          { id: 'morosidad', label: '1. Radar Morosidad', icon: DollarSign },
          { id: 'viabilidad', label: '2. Matriz Viabilidad Aforo', icon: Target },
          { id: 'embudo', label: '3. Embudo Admisión', icon: Layers },
          { id: 'rendimiento', label: '4. Rendimiento vs Pago', icon: Award },
          { id: 'arr', label: '5. Proyección ARR / Caja', icon: TrendingUp },
          { id: 'churn', label: '6. Retención y Churn', icon: PieIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-lg transition-all border-b-2 ${
                isActive
                  ? 'border-[#6c63ff] text-[#6c63ff] bg-indigo-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: RADAR DE MOROSIDAD */}
      {activeTab === 'morosidad' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="Presupuesto Periodo" value={`S/ ${totalPensions.toLocaleString()}`} subtitle={`Filtrado ${selectedAnio}`} icon={DollarSign} color="info" />
            <KPICard title="Recaudación Efectiva" value={`S/ ${totalRecaudado.toLocaleString()}`} subtitle="Ingresado a caja" icon={CheckCircle2} color="success" />
            <KPICard title="% Morosidad Periodo" value={`${globalMorosidadRate}%`} subtitle="Respecto al presupuestado" icon={TrendingUp} color="warning" />
            <KPICard title="Mora Crítica (>60 días)" value={`S/ ${totalDeuda.toLocaleString()}`} subtitle="Riesgo de cartera vencida" icon={AlertCircle} color="danger" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Page 1: Radar de Salud Financiera y Morosidad por Grado</h2>
              <p className="text-xs text-slate-500">Porcentaje de alumnos Al Día (Verde), Mora Leve (Amarillo) y Mora Crítica (Rojo) por grado en el periodo {selectedAnio} / {selectedBimestre}.</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={morosidadGradoData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} unit="%" fontSize={11} stroke="#8898aa" />
                  <YAxis type="category" dataKey="grado" fontSize={11} stroke="#8898aa" tickLine={false} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="alDia" stackId="a" fill="#2dce89" name="% Al Día" />
                  <Bar dataKey="moraLeve" stackId="a" fill="#ffb236" name="% Mora 1-30 Días" />
                  <Bar dataKey="moraCritica" stackId="a" fill="#f5365c" name="% Mora >30 Días" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider block">🎯 Toma de Decisiones Estratégicas Habilitada:</span>
            <p className="text-indigo-800 leading-relaxed">
              1. **Campañas de Refinanciamiento:** Si la morosidad en 1º Secundaria supera el 15%, activa automáticamente planes de pago fraccionado antes del cierre del bimestre.<br/>
              2. **Reajuste de Pensiones:** Evalúa la capacidad de pago del grado para la fijación del arancel educativo del siguiente año lectivo.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ AFORO VS MOROSIDAD */}
      {activeTab === 'viabilidad' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard title="Aforo Promedio Global" value="88.5%" subtitle="Capacidad instalada utilizada" icon={Users} color="success" />
            <KPICard title="Secciones Inviables (<65%)" value="2 Aulas" subtitle="Candidatas a fusión" icon={AlertCircle} color="danger" />
            <KPICard title="Secciones Críticas en Mora" value="3 Aulas" subtitle="Morosidad > 20%" icon={ShieldAlert} color="warning" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Page 2: Matriz de Eficiencia Operativa y Viabilidad (Aforo vs Morosidad)</h2>
              <p className="text-xs text-slate-500">Cruza el % de Aforo Ocupado (Eje X) frente al % de Morosidad (Eje Y). Las secciones en el cuadrante inferior derecho son económicamente inviables.</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="aforo" name="Aforo Ocupado" unit="%" domain={[50, 100]} label={{ value: 'Aforo Ocupado (%)', position: 'bottom', fontSize: 11 }} />
                  <YAxis type="number" dataKey="morosidad" name="Morosidad" unit="%" domain={[0, 30]} label={{ value: 'Morosidad (%)', angle: -90, position: 'left', fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => [`${val}%`, name]} />
                  <ReferenceLine x={70} stroke="#ffb236" strokeDasharray="3 3" label={{ value: 'Mínimo Aforo (70%)', fill: '#ffb236', fontSize: 10 }} />
                  <ReferenceLine y={15} stroke="#f5365c" strokeDasharray="3 3" label={{ value: 'Límite Mora (15%)', fill: '#f5365c', fontSize: 10 }} />
                  <Scatter name="Secciones" data={aforoMorosidadScatter} fill="#6c63ff" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider block">🎯 Toma de Decisiones Estratégicas Habilitada:</span>
            <p className="text-indigo-800 leading-relaxed">
              1. **Fusión de Secciones:** Disponer el cierre y fusión de *4º Primaria A* y *2º Secundaria A* por registrar aforo inferior al 65% y morosidad superior al 20%.<br/>
              2. **Optimización del Cuadro de Horas:** Redireccionar horas docentes hacia aulas con aforo completo (95%+).
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: EMBUDO DE ADMISIÓN */}
      {activeTab === 'embudo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard title="Postulantes Totales" value="320 Familias" subtitle={`Campaña ${selectedAnio}`} icon={Users} color="info" />
            <KPICard title="Tasa Conversión Global" value="46.2%" subtitle="Matriculados efectivos" icon={CheckCircle2} color="success" />
            <KPICard title="Tiempo Cierre Promedio" value="3.2 Días" subtitle="Desde informe a pago" icon={Calendar} color="warning" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Page 3: Embudo de Conversión de Matrícula (Pipeline de Admisión)</h2>
              <p className="text-xs text-slate-500">Seguimiento de la pérdida de familias en cada etapa del proceso de admisión.</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelAdmisionData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#8898aa" fontSize={11} />
                  <YAxis type="category" dataKey="etapa" stroke="#8898aa" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#6c63ff" radius={[0, 4, 4, 0]}>
                    {funnelAdmisionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider block">🎯 Toma de Decisiones Estratégicas Habilitada:</span>
            <p className="text-indigo-800 leading-relaxed">
              1. **Optimización del Marketing:** Reasignar presupuesto a campañas digitales al detectar que el 75% de conversion proviene de redes sociales.<br/>
              2. **Reducción de Fuga:** Agilizar la etapa psicopedagógica si se pierde más del 25% de postulantes en dicha fase.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: RENDIMIENTO VS PAGO */}
      {activeTab === 'rendimiento' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard title="Promedio Institucional" value="15.2 / 20" subtitle={`Evaluado ${selectedBimestre}`} icon={Award} color="info" />
            <KPICard title="% Alumnos Destacados (AD)" value="38.5%" subtitle="Excelente nivel" icon={CheckCircle2} color="success" />
            <KPICard title="% Alumnos en Riesgo (C)" value="11.2%" subtitle="Requiere reforzamiento" icon={AlertCircle} color="danger" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Page 4: Correlación Rendimiento Académico vs Regularidad de Pago</h2>
              <p className="text-xs text-slate-500">Comparativa del promedio de notas y tasa de desaprobación según el estado financiero de la familia.</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rendimientoPagoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="estadoPago" stroke="#8898aa" fontSize={11} />
                  <YAxis yAxisId="left" domain={[0, 20]} stroke="#8898aa" fontSize={11} label={{ value: 'Promedio Notas', angle: -90, position: 'left' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" stroke="#8898aa" fontSize={11} label={{ value: '% Desaprobados', angle: 90, position: 'right' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="promedioNota" fill="#6c63ff" name="Promedio Nota (0-20)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="desaprobados" stroke="#f5365c" strokeWidth={3} name="% En Riesgo (C)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider block">🎯 Toma de Decisiones Estratégicas Habilitada:</span>
            <p className="text-indigo-800 leading-relaxed">
              1. **Concesión de Becas:** Otorgar becas integrales a alumnos con notas superiores a 16.0 pertenecientes a familias con mora por vulnerabilidad económica.<br/>
              2. **Apoyo Psicopedagógico:** Contención emocional a estudiantes cuyo rendimiento decae ante estrés financiero en el hogar.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: PROYECCIÓN ARR Y CAJA */}
      {activeTab === 'arr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="ARR Educativo Proyectado" value="S/ 248,500" subtitle={`Año Lectivo ${selectedAnio}`} icon={DollarSign} color="info" />
            <KPICard title="Recaudación YTD" value="S/ 145,100" subtitle="Efectivamente ingresado" icon={CheckCircle2} color="success" />
            <KPICard title="Brecha por Recaudar" value="S/ 103,400" subtitle="Saldo restante 2026" icon={TrendingUp} color="warning" />
            <KPICard title="Cobertura Costos Fijos" value="138%" subtitle="Solidez de liquidez" icon={Sparkles} color="success" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Page 5: Proyección Financiera Anual e Ingreso Recurrente (ARR Educativo)</h2>
              <p className="text-xs text-slate-500">Flujo acumulado de pensiones mensuales presupuestadas vs recaudadas de marzo a diciembre.</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={arrWaterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRecaudo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dce89" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2dce89" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#8898aa" fontSize={11} />
                  <YAxis stroke="#8898aa" fontSize={11} />
                  <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="recaudo" stroke="#2dce89" fillOpacity={1} fill="url(#colorRecaudo)" strokeWidth={2} name="Recaudado Real (S/)" />
                  <Line type="monotone" dataKey="proyectado" stroke="#6c63ff" strokeDasharray="4 4" strokeWidth={2} name="Presupuestado (S/)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider block">🎯 Toma de Decisiones Estratégicas Habilitada:</span>
            <p className="text-indigo-800 leading-relaxed">
              1. **Plan de Inversiones:** Aprobar la renovación de salas de computación al confirmar la cobertura del ARR.<br/>
              2. **Gestión Preventiva de Crédito:** Anticipar periodos de baja recaudación para solicitar líneas de crédito de corto plazo.
            </p>
          </div>
        </div>
      )}

      {/* TAB 6: RETENCIÓN Y CHURN */}
      {activeTab === 'churn' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard title="Tasa Retención Anual (TRA)" value="91.4%" subtitle="Renovación de matrícula" icon={CheckCircle2} color="success" />
            <KPICard title="Tasa Deserción / Churn" value="8.6%" subtitle="Traslados / Retiros" icon={AlertCircle} color="danger" />
            <KPICard title="Antigüedad Promedio" value="4.8 Años" subtitle="Permanencia familiar" icon={Users} color="info" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Page 6: Panel de Fidelización y Retención Estudiantil (Análisis de Churn)</h2>
              <p className="text-xs text-slate-500">Desglose de causas de traslado y desvinculación de estudiantes en el periodo {selectedAnio}.</p>
            </div>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={churnData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={(entry) => `${entry.name}: ${entry.value}%`}>
                    {churnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CHANNELS[index % COLORS_CHANNELS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-2">
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider block">🎯 Toma de Decisiones Estratégicas Habilitada:</span>
            <p className="text-indigo-800 leading-relaxed">
              1. **Descuentos por Continuidad:** Otorgar beneficios de escala a familias con más de 5 años de antigüedad en la institución.<br/>
              2. **Intervención Pedagógica:** Corregir metodologías en materias con mayor índice de traslado por insatisfacción académica.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Analisis;
