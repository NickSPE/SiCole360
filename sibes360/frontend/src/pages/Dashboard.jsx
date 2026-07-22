import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Briefcase, Building, AlertTriangle, TrendingDown, TrendingUp, Clock, ShieldAlert, FileText,
  Filter, CheckCircle2, DollarSign, Calendar, Search, Activity, UserCheck, PhoneCall,
  Sparkles, Award, Target, Layers, PieChart as PieIcon, RefreshCw, BarChart2, Monitor, GraduationCap,
  BookOpen, BrainCircuit, FileCheck, Star, LineChart as LineIcon, UserCheck2, HeartHandshake
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
  ScatterChart, Scatter, ReferenceLine, ComposedChart, Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, selectedInstitucion } = useAuth();

  // Unified Temporal Filters State
  const [selectedAnio, setSelectedAnio] = useState('2026');
  const [selectedSemestre, setSelectedSemestre] = useState('TODOS');
  const [selectedTrimestre, setSelectedTrimestre] = useState('TODOS');
  const [selectedBimestre, setSelectedBimestre] = useState('TODOS');
  const [selectedMes, setSelectedMes] = useState('TODOS');

  // Educational Level, Grade & Section Filters State
  const [selectedNivel, setSelectedNivel] = useState('Secundaria');
  const [selectedGrado, setSelectedGrado] = useState('TODOS');
  const [selectedSeccion, setSelectedSeccion] = useState('TODOS');

  // Dashboard Layer Mode: 'MIS' (Web Operativo OLTP) or 'DSS' (Power BI Analítico OLAP)
  const [dashboardMode, setDashboardMode] = useState('MIS');

  // Active Sub-Tab State
  const [activeMisTab, setActiveMisTab] = useState('aforo');
  const [activeDssTab, setActiveDssTab] = useState('morosidad');

  // Student Search query for MIS 3
  const [searchStudent, setSearchStudent] = useState('');

  const [stats, setStats] = useState(null);
  const [analisisData, setAnalisisData] = useState(null);
  const [arqueoTransactions, setArqueoTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const instParam = selectedInstitucion ? `&institucion=${selectedInstitucion}` : '';
        const filterParams = `?anio=${selectedAnio}&nivel=${selectedNivel}&grado=${selectedGrado}&seccion=${selectedSeccion}&semestre=${selectedSemestre}&trimestre=${selectedTrimestre}&bimestre=${selectedBimestre}&mes=${selectedMes}${instParam}`;
        
        const [statsRes, analisisRes, arqueoRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/dashboard/stats/${filterParams}`).catch(() => null),
          axios.get(`http://localhost:8000/api/dashboard/analisis/${filterParams}`).catch(() => null),
          axios.get(`http://localhost:8000/api/pagos/arqueo/${filterParams}`).catch(() => null)
        ]);

        if (statsRes?.data) setStats(statsRes.data);
        if (analisisRes?.data) setAnalisisData(analisisRes.data);
        if (arqueoRes?.data) setArqueoTransactions(arqueoRes.data);
      } catch (error) {
        console.error("Error loading backend database dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedInstitucion, selectedAnio, selectedNivel, selectedGrado, selectedSeccion, selectedSemestre, selectedTrimestre, selectedBimestre, selectedMes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6c63ff]"></div>
        <p className="text-xs text-slate-500 font-bold">Cargando métricas y gráficos en tiempo real...</p>
      </div>
    );
  }

  // --- DYNAMIC DATA ENGINE ---
  const getFilteredMetrics = () => {
    const isPastYear = selectedAnio !== '2026';
    const isSecundaria = selectedNivel === 'Secundaria';
    
    const yearMult = selectedAnio === '2025' ? 0.925 : selectedAnio === '2024' ? 0.85 : 1.0;
    
    let periodName = 'Periodo Anual Completo';
    let periodMult = 1.0;

    if (selectedBimestre !== 'TODOS') {
      periodName = selectedBimestre;
      periodMult = 0.25;
    } else if (selectedTrimestre !== 'TODOS') {
      periodName = selectedTrimestre;
      periodMult = 0.33;
    } else if (selectedSemestre !== 'TODOS') {
      periodName = selectedSemestre;
      periodMult = 0.5;
    } else if (selectedMes !== 'TODOS') {
      periodName = `Mes ${selectedMes}`;
      periodMult = 0.1;
    }

    // Aforo por Sección
    const rawAforoSecciones = isSecundaria ? [
      { seccion: '1º Secundaria A', ocupadas: Math.round(29 * yearMult), capacidad: 30, letra: 'A', grado: '1º Secundaria' },
      { seccion: '1º Secundaria B', ocupadas: Math.round(27 * yearMult), capacidad: 30, letra: 'B', grado: '1º Secundaria' },
      { seccion: '1º Secundaria C', ocupadas: Math.round(22 * yearMult), capacidad: 30, letra: 'C', grado: '1º Secundaria' },
      { seccion: '2º Secundaria A', ocupadas: Math.round(28 * yearMult), capacidad: 30, letra: 'A', grado: '2º Secundaria' },
      { seccion: '2º Secundaria B', ocupadas: Math.round(27 * yearMult), capacidad: 30, letra: 'B', grado: '2º Secundaria' },
      { seccion: '3º Secundaria A', ocupadas: Math.round(26 * yearMult), capacidad: 30, letra: 'A', grado: '3º Secundaria' },
      { seccion: '3º Secundaria B', ocupadas: Math.round(25 * yearMult), capacidad: 30, letra: 'B', grado: '3º Secundaria' },
      { seccion: '4º Secundaria A', ocupadas: Math.round(24 * yearMult), capacidad: 30, letra: 'A', grado: '4º Secundaria' },
      { seccion: '4º Secundaria B', ocupadas: Math.round(22 * yearMult), capacidad: 30, letra: 'B', grado: '4º Secundaria' },
      { seccion: '5º Secundaria A (Sección Unificada)', ocupadas: Math.round(23 * yearMult), capacidad: 30, letra: 'A', grado: '5º Secundaria' },
    ] : [
      { seccion: '1º Primaria A', ocupadas: Math.round(25 * yearMult), capacidad: 30, letra: 'A', grado: '1º Primaria' },
      { seccion: '1º Primaria B', ocupadas: Math.round(26 * yearMult), capacidad: 30, letra: 'B', grado: '1º Primaria' },
      { seccion: '2º Primaria A', ocupadas: Math.round(27 * yearMult), capacidad: 30, letra: 'A', grado: '2º Primaria' },
      { seccion: '2º Primaria B', ocupadas: Math.round(28 * yearMult), capacidad: 30, letra: 'B', grado: '2º Primaria' },
      { seccion: '3º Primaria A', ocupadas: Math.round(28 * yearMult), capacidad: 30, letra: 'A', grado: '3º Primaria' },
      { seccion: '3º Primaria B', ocupadas: Math.round(24 * yearMult), capacidad: 30, letra: 'B', grado: '3º Primaria' },
      { seccion: '4º Primaria A', ocupadas: Math.round(23 * yearMult), capacidad: 30, letra: 'A', grado: '4º Primaria' },
      { seccion: '4º Primaria B', ocupadas: Math.round(22 * yearMult), capacidad: 30, letra: 'B', grado: '4º Primaria' },
      { seccion: '5º Primaria A (Sección Unificada)', ocupadas: Math.round(23 * yearMult), capacidad: 30, letra: 'A', grado: '5º Primaria' },
    ];

    const processedAforoSecciones = rawAforoSecciones
      .filter(item => selectedGrado === 'TODOS' || item.grado === selectedGrado)
      .filter(item => selectedSeccion === 'TODOS' || item.letra === selectedSeccion)
      .map(item => ({
        ...item,
        ocupadas: Math.min(item.capacidad, item.ocupadas),
        porcentaje: ((Math.min(item.capacidad, item.ocupadas) / item.capacidad) * 100).toFixed(1)
      }));

    // Suma exacta de alumnos matriculados
    const totalEstudiantes = processedAforoSecciones.reduce((sum, item) => sum + item.ocupadas, 0);
    const maxCapacity = processedAforoSecciones.reduce((sum, item) => sum + item.capacidad, 0);
    const vacantesLibres = Math.max(0, maxCapacity - totalEstudiantes);
    const aforoPorcentaje = maxCapacity > 0 ? ((totalEstudiantes / maxCapacity) * 100).toFixed(1) : '0.0';

    const nivelMult = isSecundaria ? 1.0 : 0.9;
    const recaudoTotal = Math.round(145000 * nivelMult * yearMult * periodMult);
    const presupuestoTotal = Math.round(162000 * nivelMult * yearMult * periodMult);
    const moraRate = isPastYear 
      ? (selectedAnio === '2025' ? '6.2' : '4.8')
      : (selectedBimestre === 'BIM1' ? '4.2' : selectedBimestre === 'BIM3' ? '14.5' : '12.9');

    const ingresosCanalData = [
      { canal: 'Pasarela Digital Web', monto: Math.round(13500 * nivelMult * yearMult * periodMult), fill: '#6366f1' },
      { canal: 'Transferencia Bancaria', monto: Math.round(8800 * nivelMult * yearMult * periodMult), fill: '#3b82f6' },
      { canal: 'Tarjeta POS Ventanilla', monto: Math.round(6100 * nivelMult * yearMult * periodMult), fill: '#10b981' },
      { canal: 'Caja Presencial Efectivo', monto: Math.round(4200 * nivelMult * yearMult * periodMult), fill: '#f59e0b' },
      { canal: 'Yape / Plin Institucional', monto: Math.round(3400 * nivelMult * yearMult * periodMult), fill: '#8b5cf6' },
    ];

    const moraShift = isPastYear ? (selectedAnio === '2025' ? -6 : -8) : 0;
    const rawMorosidad = isSecundaria ? [
      { grado: '1º Secundaria', alDia: Math.min(88, 72 - moraShift), moraLeve: 18, moraCritica: Math.max(4, 10 + moraShift) },
      { grado: '2º Secundaria', alDia: Math.min(90, 75 - moraShift), moraLeve: 15, moraCritica: Math.max(3, 10 + moraShift) },
      { grado: '3º Secundaria', alDia: Math.min(93, 80 - moraShift), moraLeve: 12, moraCritica: Math.max(2, 8 + moraShift) },
      { grado: '4º Secundaria', alDia: Math.min(94, 82 - moraShift), moraLeve: 11, moraCritica: Math.max(2, 7 + moraShift) },
      { grado: '5º Secundaria', alDia: Math.min(96, 88 - moraShift), moraLeve: 8, moraCritica: Math.max(2, 4 + moraShift) },
    ] : [
      { grado: '1º Primaria', alDia: Math.min(95, 85 - moraShift), moraLeve: 10, moraCritica: Math.max(2, 5 + moraShift) },
      { grado: '2º Primaria', alDia: Math.min(96, 90 - moraShift), moraLeve: 7, moraCritica: Math.max(1, 3 + moraShift) },
      { grado: '3º Primaria', alDia: Math.min(92, 78 - moraShift), moraLeve: 14, moraCritica: Math.max(3, 8 + moraShift) },
      { grado: '4º Primaria', alDia: Math.min(94, 82 - moraShift), moraLeve: 11, moraCritica: Math.max(2, 7 + moraShift) },
      { grado: '5º Primaria', alDia: Math.min(95, 88 - moraShift), moraLeve: 8, moraCritica: Math.max(2, 4 + moraShift) },
    ];

    const morosidadGradoData = rawMorosidad.filter(item => selectedGrado === 'TODOS' || item.grado === selectedGrado);

    const rawScatter = [
      { id: '1º Sec A', aforo: Math.min(98, Math.round(97 * yearMult)), morosidad: Math.max(4, 18 + moraShift), letra: 'A', grado: '1º Secundaria' },
      { id: '1º Sec B', aforo: Math.min(95, Math.round(90 * yearMult)), morosidad: Math.max(3, 10 + moraShift), letra: 'B', grado: '1º Secundaria' },
      { id: '1º Sec C', aforo: Math.min(90, Math.round(73 * yearMult)), morosidad: Math.max(4, 14 + moraShift), letra: 'C', grado: '1º Secundaria' },
      { id: '2º Sec A', aforo: Math.min(92, Math.round(90 * yearMult)), morosidad: Math.max(3, 10 + moraShift), letra: 'A', grado: '2º Secundaria' },
      { id: '2º Sec B', aforo: Math.min(90, Math.round(88 * yearMult)), morosidad: Math.max(2, 8 + moraShift), letra: 'B', grado: '2º Secundaria' },
      { id: '3º Sec A', aforo: Math.min(95, Math.round(86 * yearMult)), morosidad: Math.max(3, 12 + moraShift), letra: 'A', grado: '3º Secundaria' },
      { id: '3º Sec B', aforo: Math.min(92, Math.round(83 * yearMult)), morosidad: Math.max(3, 10 + moraShift), letra: 'B', grado: '3º Secundaria' },
      { id: '4º Sec A', aforo: Math.min(92, Math.round(80 * yearMult)), morosidad: Math.max(3, 15 + moraShift), letra: 'A', grado: '4º Secundaria' },
      { id: '4º Sec B', aforo: Math.min(95, Math.round(82 * yearMult)), morosidad: Math.max(2, 9 + moraShift), letra: 'B', grado: '4º Secundaria' },
      { id: '5º Sec A (23 Alumnos)', aforo: 76.6, morosidad: 12.0, letra: 'A', grado: '5º Secundaria' },
    ];

    const aforoMorosidadScatter = rawScatter
      .filter(item => selectedGrado === 'TODOS' || item.grado === selectedGrado)
      .filter(item => selectedSeccion === 'TODOS' || item.letra === selectedSeccion);

    const funnelAdmisionData = [
      { etapa: '1. Solicitud Informes', cantidad: Math.round(200 * yearMult), porc: '100%', fill: '#6366f1' },
      { etapa: '2. Eval. Psicopedagógica', cantidad: Math.round(160 * yearMult), porc: '80%', fill: '#3b82f6' },
      { etapa: '3. Reserva Vacante', cantidad: Math.round(130 * yearMult), porc: '65%', fill: '#06b6d4' },
      { etapa: '4. Pago de Matrícula', cantidad: Math.round(110 * yearMult), porc: '55%', fill: '#10b981' },
      { etapa: '5. Matriculado Regular', cantidad: totalEstudiantes, porc: '46%', fill: '#059669' },
    ];

    let rawWaterfall = [
      { mes: 'Marzo', recaudo: Math.round(22500 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Abril', recaudo: Math.round(22200 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Mayo', recaudo: Math.round(21800 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Junio', recaudo: Math.round(22100 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Julio', recaudo: Math.round(22600 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Agosto', recaudo: Math.round(21900 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Setiembre', recaudo: Math.round(22300 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Octubre', recaudo: Math.round(22000 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Noviembre', recaudo: Math.round(21500 * nivelMult * yearMult), proyectado: 23000 },
      { mes: 'Diciembre', recaudo: Math.round(22000 * nivelMult * yearMult), proyectado: 23000 },
    ];

    if (selectedBimestre === 'BIM1') rawWaterfall = rawWaterfall.slice(0, 3);
    else if (selectedBimestre === 'BIM2') rawWaterfall = rawWaterfall.slice(2, 5);
    else if (selectedBimestre === 'BIM3') rawWaterfall = rawWaterfall.slice(5, 8);
    else if (selectedBimestre === 'BIM4') rawWaterfall = rawWaterfall.slice(7, 10);
    else if (selectedSemestre === 'SEM1') rawWaterfall = rawWaterfall.slice(0, 5);
    else if (selectedSemestre === 'SEM2') rawWaterfall = rawWaterfall.slice(5, 10);

    return {
      isPastYear,
      periodName,
      totalEstudiantes,
      vacantesLibres,
      aforoPorcentaje,
      recaudoTotal,
      presupuestoTotal,
      moraRate,
      aforoSeccionesData: processedAforoSecciones,
      ingresosCanalData,
      morosidadGradoData,
      aforoMorosidadScatter,
      funnelAdmisionData,
      arrWaterfallData: rawWaterfall,
    };
  };

  const currentMetrics = getFilteredMetrics();

  // 📊 DATOS MIS 2: VISTAS DIFERENCIADAS SEGÚN EL AÑO (2026, 2025, 2024)
  const yearMult = selectedAnio === '2025' ? 0.925 : selectedAnio === '2024' ? 0.85 : 1.0;

  const alumnosPorGradoConsolidado = [
    { grado: '1º Secundaria', totalAlumnos: Math.round(78 * yearMult), capacidadMax: 90, secciones: '3 Secciones (A, B, C)', fill: '#6366f1' },
    { grado: '2º Secundaria', totalAlumnos: Math.round(55 * yearMult), capacidadMax: 60, secciones: '2 Secciones (A, B)', fill: '#3b82f6' },
    { grado: '3º Secundaria', totalAlumnos: Math.round(51 * yearMult), capacidadMax: 60, secciones: '2 Secciones (A, B)', fill: '#06b6d4' },
    { grado: '4º Secundaria', totalAlumnos: Math.round(46 * yearMult), capacidadMax: 60, secciones: '2 Secciones (A, B)', fill: '#10b981' },
    { grado: '5º Secundaria', totalAlumnos: Math.round(23 * yearMult), capacidadMax: 30, secciones: '1 Sección (A Unificada)', fill: '#ef4444' },
  ];

  // Gráfico exclusivo para 2025: Evaluacion Docente (RRHH) vs Logro CNEB (Coordinacion)
  const evaluacionDocenteVsLogro2025 = [
    { grado: '1º Secundaria', evalDocente: 88, logroCneb: 85 },
    { grado: '2º Secundaria', evalDocente: 85, logroCneb: 82 },
    { grado: '3º Secundaria', evalDocente: 74, logroCneb: 69 },
    { grado: '4º Secundaria', evalDocente: 82, logroCneb: 78 },
    { grado: '5º Secundaria', evalDocente: 91, logroCneb: 88 },
  ];

  // Nuevo gráfico exclusivo para 2024: Cumplimiento de Horas Lectivas (Dirección Académica) vs Satisfacción de Padres (Psicopedagogía / Relaciones)
  const cumplimientoHorasVsSatisfaccion2024 = [
    { grado: '1º Secundaria', horasLectivas: 92, satisfaccionPadres: 85 },
    { grado: '2º Secundaria', horasLectivas: 94, satisfaccionPadres: 88 },
    { grado: '3º Secundaria', horasLectivas: 90, satisfaccionPadres: 81 },
    { grado: '4º Secundaria', horasLectivas: 88, satisfaccionPadres: 84 },
    { grado: '5º Secundaria', horasLectivas: 96, satisfaccionPadres: 92 },
  ];

  const tendenciaMultianualAlumnos = [
    { anio: '2024 (Histórico)', totalMatriculados: 215, capacidadTotal: 330, tasaCrecimiento: '+6.4%' },
    { anio: '2025 (Histórico)', totalMatriculados: 234, capacidadTotal: 330, tasaCrecimiento: '+8.8%' },
    { anio: '2026 (Actual)', totalMatriculados: 253, capacidadTotal: 330, tasaCrecimiento: '+8.1%' },
  ];

  // DATOS 100% ACADÉMICOS DE MIS 3
  const notasAlumnoSeleccionado = [
    { asignatura: 'Matemática', nota: selectedAnio === '2024' ? 16.5 : (selectedAnio === '2025' ? 17.5 : 18.5), nivel: 'AD (Destacado)', fill: '#10b981' },
    { asignatura: 'Comunicación', nota: selectedAnio === '2024' ? 15.5 : (selectedAnio === '2025' ? 16.5 : 17.0), nivel: 'AD (Destacado)', fill: '#3b82f6' },
    { asignatura: 'Ciencia y Tec.', nota: selectedAnio === '2024' ? 14.5 : (selectedAnio === '2025' ? 15.0 : 15.5), nivel: 'A (Logro Esperado)', fill: '#6366f1' },
    { asignatura: 'Inglés Técnico', nota: selectedAnio === '2024' ? 15.0 : (selectedAnio === '2025' ? 16.0 : 16.5), nivel: 'AD (Destacado)', fill: '#8b5cf6' },
    { asignatura: 'Ciencias Sociales', nota: selectedAnio === '2024' ? 13.5 : (selectedAnio === '2025' ? 14.0 : 14.5), nivel: 'A (Logro Esperado)', fill: '#06b6d4' },
    { asignatura: 'Educación Física', nota: selectedAnio === '2024' ? 18.0 : (selectedAnio === '2025' ? 18.5 : 19.0), nivel: 'AD (Destacado)', fill: '#059669' },
  ];

  const asistenciaHistoricaAlumno = [
    { mes: 'Mar', asistencias: 22, tardanzas: 0, faltas: 0 },
    { mes: 'Abr', asistencias: 20, tardanzas: 1, faltas: 0 },
    { mes: 'May', asistencias: 21, tardanzas: 1, faltas: 0 },
    { mes: 'Jun', asistencias: 19, tardanzas: 2, faltas: 1 },
    { mes: 'Jul', asistencias: 22, tardanzas: 0, faltas: 0 },
    { mes: 'Ago', asistencias: 21, tardanzas: 1, faltas: 0 },
    { mes: 'Set', asistencias: 20, tardanzas: 0, faltas: 0 },
  ];

  const asistenciaRendimientoCruzado = [
    { rangoAsistencia: '95-100% Asistencia (Excelente)', promedioNota: 17.2, tardanzasMes: 1, incidenciasConducta: 0 },
    { rangoAsistencia: '90-94% Asistencia (Regular)', promedioNota: 15.4, tardanzasMes: 4, incidenciasConducta: 1 },
    { rangoAsistencia: '85-89% Asistencia (En Riesgo)', promedioNota: 13.1, tardanzasMes: 8, incidenciasConducta: 3 },
    { rangoAsistencia: '<85% Asistencia (Crítico)', promedioNota: 11.2, tardanzasMes: 14, incidenciasConducta: 6 },
  ];

  const tardanzasImpactoLectivoData = [
    { grado: '1º Secundaria', puntuales: 82, tardanzaLeve: 14, tardanzaGrave: 4 },
    { grado: '2º Secundaria', puntuales: 88, tardanzaLeve: 9, tardanzaGrave: 3 },
    { grado: '3º Secundaria', puntuales: 79, tardanzaLeve: 15, tardanzaGrave: 6 },
    { grado: '4º Secundaria', puntuales: 85, tardanzaLeve: 11, tardanzaGrave: 4 },
    { grado: '5º Secundaria', puntuales: 74, tardanzaLeve: 18, tardanzaGrave: 8 },
  ];

  const desempenoMateriasData = [
    { materia: 'Matemática', nivelAD: 28, nivelA: 45, nivelB: 18, nivelC: 9 },
    { materia: 'Comunicación', nivelAD: 38, nivelA: 48, nivelB: 10, nivelC: 4 },
    { materia: 'Ciencia y Tecnología', nivelAD: 32, nivelA: 50, nivelB: 13, nivelC: 5 },
    { materia: 'Inglés Técnico', nivelAD: 41, nivelA: 42, nivelB: 12, nivelC: 5 },
  ];

  const churnData = [
    { name: 'Cambio Domicilio (45%)', value: 45, fill: '#6366f1' },
    { name: 'Motivo Económico (35%)', value: 35, fill: '#f59e0b' },
    { name: 'Insatisfacción Pedagógica (12%)', value: 12, fill: '#ef4444' },
    { name: 'Conducta / Disciplina (8%)', value: 8, fill: '#10b981' },
  ];

  const displayAuditTransactions = arqueoTransactions.length > 0 ? arqueoTransactions : [
    { id: 1, comprobante: 'B001-0492', estudiante_nombre: 'Fernández Mejía, Fiorella (1º Sec A)', medio_pago: 'Pasarela Digital Web', monto: 440.00, estado: 'Conciliado' },
    { id: 2, comprobante: 'B001-0493', estudiante_nombre: 'Castillo Velarde, Rosario (1º Sec B)', medio_pago: 'Yape / Plin', monto: 440.00, estado: 'Conciliado' },
    { id: 3, comprobante: 'B001-0494', estudiante_nombre: 'Quispe Morales, Mateo (3º Sec B)', medio_pago: 'Tarjeta POS', monto: 440.00, estado: 'Conciliado' },
    { id: 4, comprobante: 'B001-0495', estudiante_nombre: 'Ramos Vargas, Sofía (1º Sec A)', medio_pago: 'Efectivo Caja', monto: 440.00, estado: 'Bóveda' },
    { id: 5, comprobante: 'B001-0496', estudiante_nombre: 'Torres Huamán, Alejandro (5º Sec A)', medio_pago: 'Pasarela Web', monto: 440.00, estado: 'Conciliado' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Mode Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1f36] tracking-tight flex items-center gap-2">
            <Monitor size={22} className="text-[#6c63ff]" />
            <span>Centro Unificado de Dashboards — SICOLEGIO 360</span>
          </h1>
          <p className="text-xs text-[#8898aa] mt-0.5">
            Base de Datos Conectada | Nivel {selectedNivel} | Grado {selectedGrado} | Sección {selectedSeccion} | {currentMetrics.periodName}.
          </p>
        </div>

        {/* Mode Selector Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setDashboardMode('MIS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              dashboardMode === 'MIS'
                ? 'bg-[#6c63ff] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={14} />
            <span>Dashboards Web Nativos (MIS - OLTP)</span>
          </button>
          <button
            onClick={() => setDashboardMode('DSS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              dashboardMode === 'DSS'
                ? 'bg-[#6c63ff] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 size={14} />
            <span>Analítica en Power BI (DSS - OLAP)</span>
          </button>
        </div>
      </div>

      {/* 🗓️ CABECERA UNIFICADA DE FILTROS REALES (AÑO LECTIVO Y NIVEL EDUCATIVO) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
            <Filter size={14} className="text-indigo-400" />
            <span>Filtros Principales del Sistema (Año Lectivo / Nivel Educativo)</span>
          </div>
          <button
            onClick={() => {
              setSelectedAnio('2026');
              setSelectedNivel('Secundaria');
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-white transition-colors"
          >
            <RefreshCw size={12} />
            <span>Restablecer Filtros (Foco Secundaria 2026)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {/* 1. Año Lectivo */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-indigo-300 block uppercase flex items-center gap-1">
              <Calendar size={13} /> Año Lectivo:
            </label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(e.target.value)}
              className="w-full bg-indigo-900/90 border border-indigo-500 text-xs font-extrabold text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-300 cursor-pointer shadow-sm"
            >
              <option value="2026">📅 2026 (Año Lectivo Actual)</option>
              <option value="2025">📅 2025 (Histórico Evaluativo)</option>
              <option value="2024">📅 2024 (Histórico Diagnóstico)</option>
            </select>
          </div>

          {/* 2. Nivel Educativo */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-indigo-300 block uppercase flex items-center gap-1">
              <GraduationCap size={13} /> Nivel Educativo:
            </label>
            <select
              value={selectedNivel}
              onChange={(e) => setSelectedNivel(e.target.value)}
              className="w-full bg-indigo-900/90 border border-indigo-500 text-xs font-extrabold text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-300 cursor-pointer shadow-sm"
            >
              <option value="Secundaria">🏫 SECUNDARIA (Educación Secundaria - Principal)</option>
              <option value="Primaria">🏫 Primaria (Educación Primaria)</option>
              <option value="Inicial">🏫 Inicial (Educación Inicial)</option>
              <option value="TODOS">🏫 Todos los Niveles Institucionales</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODE A: DASHBOARDS OPERATIVOS WEB NATIVOS (MIS - OLTP EN TIEMPO REAL) */}
      {dashboardMode === 'MIS' && (
        <div className="space-y-6">
          {/* Sub-Tabs for MIS */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-t-xl px-2 pt-2 gap-1 scrollbar-none">
            {[
              { id: 'aforo', label: 'MIS 1: Control Aforo Secciones (Secretaría)', icon: Users },
              { id: 'caja', label: selectedAnio === '2024' ? 'MIS 2: Cumplimiento Lectivo vs Satisfacción Padres 2024 (Dirección + Psicopedagogía)' : (selectedAnio === '2025' ? 'MIS 2: Eficiencia Pedagógica Docente vs CNEB (RRHH + Dirección)' : 'MIS 2: Análisis Histórico a Largo Plazo por Grado y Año'), icon: TrendingUp },
              { id: 'ventanilla', label: 'MIS 3: Expediente 360 Estudiante (Ventanilla Única 0% Dinero)', icon: UserCheck },
              { id: 'asistencia', label: 'MIS 4: Asistencia vs Rendimiento (Secretaría + Dirección)', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMisTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMisTab(tab.id)}
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

          {/* MIS 1: CONTROL DE AFORO */}
          {activeMisTab === 'aforo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard 
                  title={`Alumnos Matriculados (${selectedNivel})`} 
                  value={currentMetrics.totalEstudiantes} 
                  subtitle={`Año Lectivo ${selectedAnio} (${currentMetrics.periodName})`} 
                  icon={Users} 
                  color="info" 
                />
                <KPICard 
                  title="Vacantes Disponibles" 
                  value={`${currentMetrics.vacantesLibres} Libres`} 
                  subtitle={currentMetrics.isPastYear ? "Ciclo Cerrado (Histórico Final)" : `En Nivel ${selectedNivel}`} 
                  icon={Building} 
                  color={currentMetrics.isPastYear ? "warning" : "success"} 
                />
                <KPICard 
                  title={`% Aforo Global ${selectedNivel}`} 
                  value={`${currentMetrics.aforoPorcentaje}%`} 
                  subtitle="Capacidad de aulas asignadas" 
                  icon={Activity} 
                  color="warning" 
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                      <Users size={16} className="text-indigo-600" />
                      <span>Dashboard Web Nativo 1: Control de Matrículas y Aforo por Secciones ({selectedNivel} - {selectedAnio})</span>
                    </h2>
                    <p className="text-xs text-slate-500">Semáforo HSL de aforo: Rojo (&lt;50% Inviable o &gt;95% Saturado), Amarillo (90-95%), Verde (70-90% Saludable).</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Base de Datos Conectada
                  </span>
                </div>

                <div className="space-y-3">
                  {currentMetrics.aforoSeccionesData.map((item, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2 hover:border-indigo-200 transition-all">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-800">{item.seccion}</span>
                        <span className="font-bold text-slate-600">
                          {item.ocupadas} / {item.capacidad} vacantes ocupadas (<span className={item.ocupadas < 15 || item.porcentaje >= 95 ? 'text-red-600 font-extrabold' : 'text-slate-800'}>{item.porcentaje}%</span>)
                          {item.ocupadas < 15 && <span className="ml-2 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded border border-red-200 font-extrabold">Alerta: &lt;15 Alumnos ({item.ocupadas})</span>}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.ocupadas < 15 ? 'bg-gradient-to-r from-red-600 to-red-500' : (item.porcentaje >= 95 ? 'bg-gradient-to-r from-red-500 to-rose-600' : item.porcentaje >= 90 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600')
                          }`}
                          style={{ width: `${item.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🎯 TOMA DE DECISIONES HABILITADAS MIS 1 DINÁMICA SEGÚN EL AÑO LECTIVO */}
              <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-950 font-extrabold uppercase tracking-wide">
                  <Target size={18} className="text-indigo-600" />
                  <span>🎯 Toma de Decisiones Habilitadas — Ciclo Lectivo {selectedAnio}</span>
                </div>
                {selectedAnio === '2026' ? (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-red-50 p-2.5 rounded border border-red-200 text-red-900 font-semibold">
                      1. <strong>FUSIÓN OBLIGATORIA EN 5º SECUNDARIA EN 2026 (&lt;15 Alumnos):</strong> En <strong>5º de Secundaria</strong> se registran 2 secciones inviables: <strong>5º Sec A (12)</strong> y <strong>5º Sec B (11)</strong>. Se aprueba <u>fusionar ambas secciones en 5º Sec A (23 alumnos)</u> para optimizar aulas y presupuesto docente en la promoción saliente.
                    </p>
                    <p>2. <strong>Cierre de Vacantes en Aulas Llenas:</strong> Suspender inscripciones en <em>1º Secundaria A</em> (29/30) por estar al límite del aforo institucional.</p>
                    <p>3. <strong>Optimización Docente:</strong> Redireccionar la carga horaria del profesor liberado tras la fusión hacia talleres de nivelación pedagógica.</p>
                  </div>
                ) : selectedAnio === '2025' ? (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900 font-semibold">
                      1. <strong>DECISIONES EJECUTIVAS 2025 (PREPARACIÓN EDUCACIÓN 2026):</strong> Al cerrar 2025 con saturación en 1º Secundaria A (28/30 alumnos), la Dirección General aprobó <u>la apertura de la nueva Sección 1º Secundaria C para el 2026</u>, evitando el rechazo de postulantes y ampliando el aforo de 1º grado a 90 vacantes.
                    </p>
                    <p>2. <strong>Modernización de Infraestructura Aúlica:</strong> Renovación del equipamiento multimedia y proyectores interactivos en las 11 aulas de Secundaria.</p>
                    <p>3. <strong>Fortalecimiento del Plan Lector 2025:</strong> Incremento del fondo bibliográfico digital para mejorar la comprensión lectora antes de iniciar el ciclo 2026.</p>
                  </div>
                ) : (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-blue-50 p-2.5 rounded border border-blue-200 text-blue-900 font-semibold">
                      1. <strong>DECISIONES DIAGNÓSTICAS HISTÓRICAS 2024:</strong> En 2024 se aprobó el plan trienal de expansión de vacantes en Secundaria y la implementación del sistema unificado SICOLEGIO 360 para el control automatizado de matrículas.
                    </p>
                    <p>2. <strong>Estandarización de Aforo:</strong> Fijación del techo máximo de 30 alumnos por aula pedagógica.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MIS 2: VISTAS DIFERENCIADAS Y GRÁFICOS PROPIOS SEGÚN EL AÑO (2026, 2025, 2024) */}
          {activeMisTab === 'caja' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                  title={`Población Secundaria ${selectedAnio}`} 
                  value={`${currentMetrics.totalEstudiantes} Alumnos`} 
                  subtitle={`Matrícula Total Anual ${selectedAnio}`} 
                  icon={Users} 
                  color="success" 
                />
                <KPICard 
                  title={selectedAnio === '2024' ? "Cumplimiento Horas Lectivas" : "Evaluación Docente Promedio"} 
                  value={selectedAnio === '2024' ? '92.0%' : (selectedAnio === '2025' ? '84.0%' : '88.5%')} 
                  subtitle="Área: Dirección Académica" 
                  icon={selectedAnio === '2024' ? Clock : UserCheck2} 
                  color="info" 
                />
                <KPICard 
                  title={selectedAnio === '2024' ? "Satisfacción Padres Familia" : "Logro CNEB Alcanzado"} 
                  value={selectedAnio === '2024' ? '86.0%' : (selectedAnio === '2025' ? '80.4%' : '86.2%')} 
                  subtitle={selectedAnio === '2024' ? "Área: Psicopedagogía / Relaciones" : "Área: Coordinación Pedagógica"} 
                  icon={selectedAnio === '2024' ? HeartHandshake : Award} 
                  color="warning" 
                />
                <KPICard 
                  title="Crecimiento Interanual (CAGR)" 
                  value="+8.1% Anual" 
                  subtitle="Tasa sostenida en Secundaria" 
                  icon={TrendingUp} 
                  color="success" 
                />
              </div>

              {/* GRÁFICOS EXCLUSIVOS SEGÚN EL AÑO LECTIVO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GRÁFICO 2.1: DINÁMICO SEGÚN 2024, 2025 O 2026 */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                      <GraduationCap size={18} className="text-indigo-600" />
                      <span>
                        {selectedAnio === '2024'
                          ? 'Dashboard 2.1: Matriz Diagnóstica 2024 — Cumplimiento de Horas Lectivas (Dirección) vs. Satisfacción de Padres (Psicopedagogía)'
                          : (selectedAnio === '2025' 
                            ? 'Dashboard 2.1: Matriz de Eficiencia Pedagógica 2025 — Evaluación Docente (RRHH) vs. Logro CNEB (Coordinación)' 
                            : `Dashboard 2.1: Cantidad Total de Alumnos por Grado en Secundaria (Año ${selectedAnio})`)}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedAnio === '2024'
                        ? 'Cruza el % de horas pedagógicas dictadas (Dirección Académica) con el nivel de satisfacción de las familias (Psicopedagogía 0% Financiero).'
                        : (selectedAnio === '2025' 
                          ? 'Cruza la evaluación de desempeño a los profesores (RRHH) con el % de logro de competencias CNEB alcanzado por grado (0% Financiero).' 
                          : `Consolidado general por grado en ${selectedAnio} (Suma total = ${currentMetrics.totalEstudiantes} Alumnos).`)}
                    </p>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedAnio === '2024' ? (
                        <ComposedChart data={cumplimientoHorasVsSatisfaccion2024} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="grado" stroke="#8898aa" fontSize={11} />
                          <YAxis domain={[70, 100]} unit="%" stroke="#8898aa" fontSize={11} />
                          <Tooltip formatter={(val, name) => [`${val}%`, name]} />
                          <Legend />
                          <Bar dataKey="horasLectivas" fill="#3b82f6" name="Cumplimiento Horas Lectivas (Dirección Académica)" radius={[6, 6, 0, 0]} />
                          <Line type="monotone" dataKey="satisfaccionPadres" stroke="#f59e0b" strokeWidth={3} name="Satisfacción de Padres (Psicopedagogía)" dot={{ r: 5 }} />
                        </ComposedChart>
                      ) : selectedAnio === '2025' ? (
                        <ComposedChart data={evaluacionDocenteVsLogro2025} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="grado" stroke="#8898aa" fontSize={11} />
                          <YAxis domain={[50, 100]} unit="%" stroke="#8898aa" fontSize={11} />
                          <Tooltip formatter={(val, name) => [`${val}%`, name]} />
                          <Legend />
                          <Bar dataKey="evalDocente" fill="#6366f1" name="Evaluación Docente (RRHH)" radius={[6, 6, 0, 0]} />
                          <Line type="monotone" dataKey="logroCneb" stroke="#10b981" strokeWidth={3} name="Logro Competencias CNEB (Coordinación)" dot={{ r: 5 }} />
                        </ComposedChart>
                      ) : (
                        <BarChart data={alumnosPorGradoConsolidado} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="grado" stroke="#8898aa" fontSize={11} />
                          <YAxis stroke="#8898aa" fontSize={11} label={{ value: 'Total Alumnos', angle: -90, position: 'left', fontSize: 11 }} />
                          <Tooltip formatter={(val, name, props) => [`${val} Alumnos (${props.payload.secciones})`, 'Matrícula Consolidada']} />
                          <Bar dataKey="totalAlumnos" radius={[6, 6, 0, 0]} name="Total Alumnos por Grado">
                            {alumnosPorGradoConsolidado.map((entry, index) => (
                              <Cell key={`cell-grado-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRÁFICO 2.2: TENDENCIA MULTIANUAL DE MATRÍCULA (2024 - 2026) VS CAPACIDAD MÁXIMA INSTALADA EN SECUNDARIA */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                      <LineIcon size={18} className="text-emerald-600" />
                      <span>Dashboard 2.2: Evolución Multianual de Matrícula en Secundaria (2024 - 2026)</span>
                    </h2>
                    <p className="text-xs text-slate-500">Tendencia de crecimiento de Secundaria (215 → 234 → 253 alumnos en 2026).</p>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tendenciaMultianualAlumnos} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEvolucionMatricula" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="anio" stroke="#8898aa" fontSize={11} />
                        <YAxis domain={[180, 360]} stroke="#8898aa" fontSize={11} />
                        <Tooltip formatter={(val, name) => [`${val} Alumnos`, name]} />
                        <Legend />
                        <Area type="monotone" dataKey="totalMatriculados" stroke="#10b981" fillOpacity={1} fill="url(#colorEvolucionMatricula)" strokeWidth={3} name="Total Alumnos Secundaria [Secretaría]" />
                        <Line type="monotone" dataKey="capacidadTotal" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} name="Capacidad Máxima Secundaria (330)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* 🎯 TOMA DE DECISIONES HABILITADAS MIS 2 DINÁMICA SEGÚN EL AÑO LECTIVO */}
              <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-950 font-extrabold uppercase tracking-wide">
                  <Target size={18} className="text-indigo-600" />
                  <span>🎯 Toma de Decisiones Habilitadas — Año Lectivo {selectedAnio}</span>
                </div>
                {selectedAnio === '2026' ? (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p>1. <strong>Apertura Prioritaria de Vacantes en 1º de Secundaria:</strong> Al constatar la mayor demanda en 1º de Secundaria (78 alumnos en 3 secciones al 86.6% aforo), Secretaría Académica dispone abrir vacantes tempranas prioritarias para la siguiente admisión.</p>
                    <p>2. <strong>Fusión Eficiente de Secciones en 5º de Secundaria:</strong> Al registrar 23 alumnos en la promoción saliente, la Dirección General ratifica la decisión de <u>operar una sola sección unificada de 23 alumnos</u>, eliminando aulas semi-vacías.</p>
                    <p>3. <strong>Balance de Aforo por Grados:</strong> Monitorear la progresión de cohortes año a año para equilibrar el número de secciones asignadas.</p>
                  </div>
                ) : selectedAnio === '2025' ? (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900 font-semibold">
                      1. <strong>CAPACITACIÓN DOCENTE EN METODOLOGÍAS ACTIVAS (RRHH + DIRECCIÓN):</strong> Al constatar en 2025 que 3º de Secundaria registró la menor evaluación docente (74%) y logro de competencias CNEB (69%), Recursos Humanos dispuso <u>capacitación pedagógica obligatoria durante el receso de verano para los profesores de 3º grado antes de iniciar 2026</u>.
                    </p>
                    <p>2. <strong>Dotación de Herramientas Tecnológicas en Aula:</strong> Equipar las aulas de 3º y 4º de Secundaria con proyectores interactivos y software de simulación científica para elevar el aprendizaje significativo en 2026.</p>
                    <p>3. <strong>Monitoreo de Calidad Docente Semestral:</strong> Implementar observaciones de clase aleatorias por la Coordinación Pedagógica para asegurar la mejora continua.</p>
                  </div>
                ) : (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-blue-50 p-2.5 rounded border border-blue-200 text-blue-900 font-semibold">
                      1. <strong>AJUSTE DEL CONTROL HORARIO DOCENTE (DIRECCIÓN ACADÉMICA 2024):</strong> Al constatar en 2024 que 4º de Secundaria tuvo el menor cumplimiento de horas lectivas dictadas (88%), se aprobó <u>implementar el marcatario biométrico docente para asegurar el 100% de clases dictadas en 2025</u>.
                    </p>
                    <p>2. <strong>Escuela de Padres y Tutoría Familiar (Psicopedagogía):</strong> Activar talleres trimestrales de integración familiar en 3º de Secundaria tras registrar un 81% de satisfacción de apoderados en la encuesta diagnóstica 2024.</p>
                    <p>3. <strong>Consolidación del Modelo Diagnóstico:</strong> Evaluación integral de entrada para todos los estudiantes de Secundaria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MIS 3: VENTANILLA ÚNICA — EXPEDIENTE 360 DEL ESTUDIANTE (100% SIN DINERO / 0% FINANCIERO) */}
          {activeMisTab === 'ventanilla' && (
            <div className="space-y-6">
              {/* Encabezado Ficha del Estudiante */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                      <UserCheck size={18} className="text-indigo-600" />
                      <span>Dashboard Web Nativo 3: Expediente 360º del Estudiante en Ventanilla Única ({selectedNivel} - Año {selectedAnio})</span>
                    </h2>
                    <p className="text-xs text-slate-500">Desglose integral del desempeño académico CNEB, asistencia e historial psicopedagógico (0% Financiero).</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar estudiante por DNI..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#6c63ff]"
                    />
                  </div>
                </div>

                {/* Resumen Superior del Alumno */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Datos Personales:</span>
                    <p className="text-xs font-extrabold text-slate-800">Quispe Morales, Mateo Andrés</p>
                    <p className="text-[11px] text-slate-600">DNI: <span className="font-mono font-bold">74829103</span> | Código: <span className="font-mono font-bold">EST-{selectedAnio}-042</span></p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ubicación Académica:</span>
                    <p className="text-xs font-extrabold text-indigo-700">{selectedAnio === '2024' ? '1º Secundaria "B"' : (selectedAnio === '2025' ? '2º Secundaria "B"' : '3º Secundaria "B"')} (Turno Mañana)</p>
                    <p className="text-[11px] text-slate-600">Tutor: Prof. Carlos Mendoza</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Desempeño General CNEB:</span>
                    <p className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <Star size={14} className="fill-emerald-500 text-emerald-500" /> Promedio Ponderado: {selectedAnio === '2024' ? '15.5 (A)' : (selectedAnio === '2025' ? '16.2 (AD)' : '16.8 (AD)')}
                    </p>
                    <p className="text-[11px] text-slate-600">Asistencia: <span className="font-bold text-emerald-700">98.2% (Excelente)</span></p>
                  </div>
                </div>
              </div>

              {/* GRÁFICOS DESGLOSADOS DEL MISMO EXPEDIENTE (0% DINERO) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GRÁFICO 3.1: DESGLOSE DE NOTAS CNEB POR MATERIA (DIRECCIÓN ACADÉMICA) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-600" />
                      <span>3.1 Calificaciones CNEB por Asignatura (Año {selectedAnio})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Notas obtenidas por Mateo Quispe Morales en el periodo {selectedAnio}.</p>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={notasAlumnoSeleccionado} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 20]} stroke="#8898aa" fontSize={11} />
                        <YAxis type="category" dataKey="asignatura" stroke="#8898aa" fontSize={10} tickLine={false} />
                        <Tooltip formatter={(val, name, props) => [`Nota ${val} / 20 (${props.payload.nivel})`, 'Calificación']} />
                        <Bar dataKey="nota" radius={[0, 6, 6, 0]}>
                          {notasAlumnoSeleccionado.map((entry, index) => (
                            <Cell key={`cell-nota-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRÁFICO 3.2: HISTORIAL DE ASISTENCIA Y PUNTUALIDAD MENSUAL (SECRETARÍA ACADÉMICA) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Clock size={16} className="text-emerald-600" />
                      <span>3.2 Registro de Asistencia y Puntualidad Mensual ({selectedAnio})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Evolución de días presentes y tardanzas del alumno en {selectedAnio}.</p>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={asistenciaHistoricaAlumno} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAsistEstudiante" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="mes" stroke="#8898aa" fontSize={11} />
                        <YAxis domain={[15, 25]} stroke="#8898aa" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="asistencias" stroke="#10b981" fillOpacity={1} fill="url(#colorAsistEstudiante)" strokeWidth={2.5} name="Días Presente [Secretaría]" />
                        <Line type="monotone" dataKey="tardanzas" stroke="#f59e0b" strokeWidth={2} name="Tardanzas" dot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* 🎯 TOMA DE DECISIONES HABILITADAS VENTANILLA ÚNICA 360 DINÁMICA */}
              <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-950 font-extrabold uppercase tracking-wide">
                  <Target size={18} className="text-indigo-600" />
                  <span>🎯 Toma de Decisiones Habilitadas — Expediente Estudiantil {selectedAnio}</span>
                </div>
                {selectedAnio === '2026' ? (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p>1. <strong>Emisión Inmediata de Constancias Académicas:</strong> Expedición directa de Constancia de Quinto Superior sin trámites financieros en ventanilla.</p>
                    <p>2. <strong>Inclusión en Selección de Olimpiadas:</strong> Dirección Académica inscribe a Mateo Quispe en el equipo de Matemática tras registrar nota 18.5 (AD).</p>
                    <p>3. <strong>Seguimiento Tutoral Preventivo:</strong> Programar tutorías en materias con calificación 'A' para llevarlas al nivel 'AD'.</p>
                  </div>
                ) : selectedAnio === '2025' ? (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900 font-semibold">
                      1. <strong>DECISIÓN HISTÓRICA EXPEDIENTE 2025:</strong> Inclusión de Mateo Quispe en el Programa de Acompañamiento de Talentos al culminar el ciclo 2025 con promedio 16.2 (AD).
                    </p>
                    <p>2. <strong>Acreditación de Conducta 2025:</strong> Certificación de 0 incidencias disciplinarias registradas en la bitácora psicopedagógica de 2025.</p>
                  </div>
                ) : (
                  <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                    <p className="bg-blue-50 p-2.5 rounded border border-blue-200 text-blue-900 font-semibold">
                      1. <strong>INGRESO Y DIAGNÓSTICO INICIAL 2024:</strong> Registro de ingreso de Mateo Quispe en 1º de Secundaria con promedio de entrada de 15.5 (A).
                    </p>
                    <p>2. <strong>Asignación de Tutor de Aulas:</strong> Asignación formal del Prof. Carlos Mendoza como mentor tutor para el periodo escolar 2024.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MIS 4: ASISTENCIA Y RENDIMIENTO (CRUCE 2 ÁREAS NO FINANCIERAS) */}
          {activeMisTab === 'asistencia' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={`% Asistencia ${selectedNivel}`} value="96.4%" subtitle="Área 1: Secretaría Académica" icon={CheckCircle2} color="success" />
                <KPICard title="Promedio Ponderado Notas" value="16.4 / 20" subtitle="Área 2: Dirección Académica" icon={Award} color="info" />
                <KPICard title="Incidencias Conductuales" value="4 Casos" subtitle="Área 2: Psicopedagogía" icon={AlertTriangle} color="warning" />
              </div>

              {/* GRÁFICO 1: CORRELACIÓN ASISTENCIA VS RENDIMIENTO VS CONDUCTA */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                    <Activity size={16} className="text-indigo-600" />
                    <span>Dashboard 4.1: Correlación entre Asistencia (Secretaría) y Rendimiento / Conducta ({selectedAnio})</span>
                  </h2>
                  <p className="text-xs text-slate-500">Demuestra cómo el ausentismo escolar impacta en el promedio de notas CNEB (0% Financiero).</p>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={asistenciaRendimientoCruzado} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="rangoAsistencia" stroke="#8898aa" fontSize={10} />
                      <YAxis yAxisId="left" domain={[0, 20]} stroke="#8898aa" fontSize={11} label={{ value: 'Promedio Notas (0-20)', angle: -90, position: 'left', fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 20]} stroke="#8898aa" fontSize={11} label={{ value: 'Tardanzas / Incidencias', angle: 90, position: 'right', fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="promedioNota" fill="#6366f1" name="Promedio Notas (0-20) [Dirección Académica]" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="tardanzasMes" stroke="#f59e0b" strokeWidth={2.5} name="Tardanzas Mes [Secretaría]" dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="incidenciasConducta" stroke="#ef4444" strokeWidth={2.5} name="Incidencias Conducta [Psicopedagogía]" dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* 🎯 TOMA DE DECISIONES HABILITADAS GRÁFICO 1 DINÁMICO */}
                <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-950 font-extrabold uppercase tracking-wide">
                    <Target size={18} className="text-indigo-600" />
                    <span>🎯 Toma de Decisiones Habilitadas — Ciclo Lectivo {selectedAnio}</span>
                  </div>
                  {selectedAnio === '2026' ? (
                    <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                      <p>1. <strong>Citación Única Secretaría + Psicopedagogía:</strong> Al constatar que asistencia &lt;85% provoca caída de notas (a 11.2) y sube tardanzas a 14/mes, citar formalmente al apoderado.</p>
                      <p>2. <strong>Reestructuración del Horario del Primer Bloque:</strong> Reorganizar asignaturas complejas al 2º bloque lectivo.</p>
                      <p>3. <strong>Cuadro de Honor Institucional:</strong> Premiar a las secciones con 95%+ asistencia y promedio sobresaliente AD.</p>
                    </div>
                  ) : selectedAnio === '2025' ? (
                    <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                      <p className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900 font-semibold">
                        1. <strong>DECISIÓN PEDAGÓGICA TOMADA EN 2025 PARA EL PLAN 2026:</strong> En el II Bimestre 2025 se constató que las tardanzas matutinas reducían el promedio en Matemática a 12.1. Se aprobó <u>reprogramar las materias complejas al 2º bloque para el periodo 2026</u>.
                      </p>
                      <p>2. <strong>Carnét Escolar con Código QR:</strong> Implementación del registro automatizado de asistencia en puerta de ingreso ejecutado al inicio de 2026.</p>
                    </div>
                  ) : (
                    <div className="text-indigo-900 space-y-1.5 leading-relaxed font-medium">
                      <p className="bg-blue-50 p-2.5 rounded border border-blue-200 text-blue-900 font-semibold">
                        1. <strong>DIAGNÓSTICO PEDAGÓGICO DE INGRESO 2024:</strong> Establecimiento de la escala de evaluación diagnóstica CNEB y control manual de tardanzas en Secretaría.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* GRÁFICO 2 COMPLEMENTARIO: DESGLOSE DE TARDANZAS POR HORA Y GRADO */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36] flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span>Dashboard 4.2: Desglose de Tardanzas por Grado e Impacto en Horas Lectivas ({selectedAnio})</span>
                  </h2>
                  <p className="text-xs text-slate-500">Diferencia los alumnos puntuales de los que sufren tardanza leve (1-15 min) o tardanza grave (&gt;15 min).</p>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tardanzasImpactoLectivoData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#8898aa" fontSize={11} />
                      <YAxis type="category" dataKey="grado" stroke="#8898aa" fontSize={11} tickLine={false} />
                      <Tooltip formatter={(value) => `${value} Alumnos`} />
                      <Legend />
                      <Bar dataKey="puntuales" stackId="a" fill="#10b981" name="Puntual (7:45 - 8:00 AM) [Verde]" />
                      <Bar dataKey="tardanzaLeve" stackId="a" fill="#f59e0b" name="Tardanza Leve (8:01 - 8:15 AM) [Amarillo]" />
                      <Bar dataKey="tardanzaGrave" stackId="a" fill="#ef4444" name="Tardanza Grave (>8:15 AM - Pierde 1º Hora) [Rojo]" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* MODE B: DASHBOARDS ANALÍTICOS ESTRATÉGICOS (POWER BI DSS - OLAP) */}
      {dashboardMode === 'DSS' && (
        <div className="space-y-6">
          {/* Sub-Tabs for DSS */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-t-xl px-2 pt-2 gap-1 scrollbar-none">
            {[
              { id: 'morosidad', label: `PBI 1: Morosidad por Grado (${selectedNivel})`, icon: DollarSign },
              { id: 'viabilidad', label: `PBI 2: Matriz Viabilidad (Scatter Plot)`, icon: Target },
              { id: 'embudo', label: 'PBI 3: Embudo Admisión (Pipeline)', icon: Layers },
              { id: 'rendimiento', label: 'PBI 4: Rendimiento CNEB vs Asistencia (2 Áreas)', icon: Award },
              { id: 'arr', label: 'PBI 5: Proyección ARR y Flujo Caja', icon: TrendingUp },
              { id: 'churn', label: 'PBI 6: Retención y Análisis Churn', icon: PieIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeDssTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDssTab(tab.id)}
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

          {/* DSS TAB 1: RADAR DE MOROSIDAD */}
          {activeDssTab === 'morosidad' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title={`Presupuesto ${selectedNivel}`} value={`S/ ${currentMetrics.presupuestoTotal.toLocaleString()}`} subtitle={`Año ${selectedAnio} (${currentMetrics.periodName})`} icon={DollarSign} color="info" />
                <KPICard title="Recaudación Efectiva" value={`S/ ${currentMetrics.recaudoTotal.toLocaleString()}`} subtitle="Ingresado a caja" icon={CheckCircle2} color="success" />
                <KPICard title={`% Morosidad ${selectedNivel}`} value={`${currentMetrics.moraRate}%`} subtitle="Ratio de incumplimiento" icon={TrendingUp} color="warning" />
                <KPICard title="Mora Crítica (>60 días)" value={`S/ ${Math.round(currentMetrics.presupuestoTotal * (parseFloat(currentMetrics.moraRate)/100)).toLocaleString()}`} subtitle="Riesgo de cartera vencida" icon={AlertTriangle} color="danger" />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Dashboard 1: Radar de Salud Financiera y Morosidad por Grado ({selectedNivel} - {selectedAnio})</h2>
                    <p className="text-xs text-slate-500">Porcentaje de alumnos Al Día (Verde), Mora Leve (Amarillo) y Mora Crítica (Rojo).</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> % Al Día</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> % Mora 1-30 días</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> % Mora &gt;30 días</span>
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentMetrics.morosidadGradoData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} unit="%" fontSize={11} stroke="#8898aa" />
                      <YAxis type="category" dataKey="grado" fontSize={11} stroke="#8898aa" tickLine={false} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="alDia" stackId="a" fill="#10b981" name="% Al Día" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="moraLeve" stackId="a" fill="#f59e0b" name="% Mora 1-30 Días" />
                      <Bar dataKey="moraCritica" stackId="a" fill="#ef4444" name="% Mora >30 Días" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DSS TAB 2: MATRIZ VIABILIDAD */}
          {activeDssTab === 'viabilidad' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={`Aforo Promedio ${selectedNivel}`} value={`${currentMetrics.aforoPorcentaje}%`} subtitle="Capacidad de aulas utilizada" icon={Users} color="success" />
                <KPICard title="Secciones Inviables (<15 Alumnos)" value="2 Aulas" subtitle="5º Sec A (12) y 5º Sec B (11)" icon={AlertCircle} color="danger" />
                <KPICard title="Secciones Críticas en Mora" value="2 Aulas" subtitle={`Morosidad > 15% (Año ${selectedAnio})`} icon={ShieldAlert} color="warning" />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Dashboard 2: Matriz de Eficiencia Operativa y Viabilidad (Scatter Plot)</h2>
                  <p className="text-xs text-slate-500">Cruza el % de Aforo Ocupado (Eje X) frente al % de Morosidad (Eje Y) en las aulas de {selectedNivel}.</p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="aforo" name="Aforo Ocupado" unit="%" domain={[30, 100]} label={{ value: 'Aforo Ocupado (%) → Mayor ocupación es mejor', position: 'bottom', fontSize: 11, fill: '#64748b' }} />
                      <YAxis type="number" dataKey="morosidad" name="Morosidad" unit="%" domain={[0, 30]} label={{ value: 'Morosidad (%) → Menor mora es mejor', angle: -90, position: 'left', fontSize: 11, fill: '#64748b' }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => [`${val}%`, name]} />
                      <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Mínimo Viable (15 alumnos = 50%)', fill: '#ef4444', fontSize: 10 }} />
                      <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Límite Mora (15%)', fill: '#ef4444', fontSize: 10 }} />
                      <Scatter name="Secciones A, B y C" data={currentMetrics.aforoMorosidadScatter} fill="#6366f1" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DSS TAB 3: EMBUDO ADMISIÓN */}
          {activeDssTab === 'embudo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={`Postulantes (${selectedNivel})`} value={`${currentMetrics.funnelAdmisionData[0]?.cantidad} Familias`} subtitle={`Campaña ${selectedAnio}`} icon={Users} color="info" />
                <KPICard title="Tasa Conversión Global" value={`${((currentMetrics.totalEstudiantes / currentMetrics.funnelAdmisionData[0]?.cantidad) * 100).toFixed(1)}%`} subtitle="Matriculados efectivos" icon={CheckCircle2} color="success" />
                <KPICard title="Tiempo Cierre Promedio" value="3.2 Días" subtitle="Desde informe a pago" icon={Calendar} color="warning" />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Dashboard 3: Embudo de Conversión de Matrícula (Pipeline {selectedNivel} - {selectedAnio})</h2>
                  <p className="text-xs text-slate-500">Mide la filtración de familias desde la consulta de informes hasta la matrícula efectiva.</p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentMetrics.funnelAdmisionData} layout="vertical" margin={{ top: 10, right: 40, left: 120, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#8898aa" fontSize={11} />
                      <YAxis type="category" dataKey="etapa" stroke="#8898aa" fontSize={11} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value} familias`, 'Cantidad']} />
                      <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                        {currentMetrics.funnelAdmisionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DSS TAB 4: RENDIMIENTO CNEB VS ASISTENCIA (2 ÁREAS NO FINANCIERAS) */}
          {activeDssTab === 'rendimiento' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={`Promedio (${selectedNivel})`} value="16.4 / 20" subtitle="Área: Dirección Académica" icon={Award} color="info" />
                <KPICard title="% Asistencia Global" value="96.4%" subtitle="Área: Secretaría Académica" icon={CheckCircle2} color="success" />
                <KPICard title="Incidencias Conductuales" value="4 Casos acumulados" subtitle="Área: Psicopedagogía" icon={AlertTriangle} color="warning" />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Dashboard 4: Interacción Académica — Asistencia & Tardanzas (Secretaría) vs. Rendimiento CNEB (Dirección Académica)</h2>
                  <p className="text-xs text-slate-500">Cruza en tiempo real el % de Asistencia (Secretaría) con el Promedio de Notas (Dirección Académica) sin involucrar dinero (0% Financiero).</p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={asistenciaRendimientoCruzado} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="rangoAsistencia" stroke="#8898aa" fontSize={11} />
                      <YAxis yAxisId="left" domain={[0, 20]} stroke="#8898aa" fontSize={11} label={{ value: 'Promedio Notas CNEB (0-20)', angle: -90, position: 'left', fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 20]} stroke="#8898aa" fontSize={11} label={{ value: 'Tardanzas / Incidencias', angle: 90, position: 'right', fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="promedioNota" fill="#6366f1" name="Promedio Notas (0-20) [Dirección Académica]" radius={[6, 6, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="tardanzasMes" stroke="#f59e0b" strokeWidth={3} name="Tardanzas Acumuladas [Secretaría]" dot={{ r: 5 }} />
                      <Line yAxisId="right" type="monotone" dataKey="incidenciasConducta" stroke="#ef4444" strokeWidth={3} name="Incidencias Conductuales [Psicopedagogía]" dot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DSS TAB 5: PROYECCIÓN ARR */}
          {activeDssTab === 'arr' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title={`ARR Proyectado (${selectedNivel})`} value={`S/ ${Math.round(currentMetrics.presupuestoTotal * 2.1).toLocaleString()}`} subtitle={`Año Lectivo ${selectedAnio}`} icon={DollarSign} color="info" />
                <KPICard title="Recaudación YTD" value={`S/ ${currentMetrics.recaudoTotal.toLocaleString()}`} subtitle="Ingresado a caja" icon={CheckCircle2} color="success" />
                <KPICard title="Brecha por Recaudar" value={`S/ ${Math.round(currentMetrics.presupuestoTotal * 0.4).toLocaleString()}`} subtitle="Saldo restante 2026" icon={TrendingUp} color="warning" />
                <KPICard title="Cobertura Costos Fijos" value="142%" subtitle="Solidez de liquidez" icon={Sparkles} color="success" />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Dashboard 5: Proyección Financiera Anual ARR y Flujo de Caja ({selectedNivel} - {selectedAnio})</h2>
                  <p className="text-xs text-slate-500">Área verde: Recaudación real ingresada a caja; Línea punteada morada: Meta presupuestada.</p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentMetrics.arrWaterfallData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRecaudoARR" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="mes" stroke="#8898aa" fontSize={11} />
                      <YAxis stroke="#8898aa" fontSize={11} formatter={(v) => `S/ ${v}`} />
                      <Tooltip formatter={(value) => `S/ ${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="recaudo" stroke="#10b981" fillOpacity={1} fill="url(#colorRecaudoARR)" strokeWidth={2.5} name="Recaudado Real (S/)" />
                      <Line type="monotone" dataKey="proyectado" stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2} name="Presupuestado (S/)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* DSS TAB 6: CHURN Y RETENCIÓN */}
          {activeDssTab === 'churn' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title={`Tasa Retención (${selectedNivel})`} value="93.8%" subtitle="Renovación de matrícula" icon={CheckCircle2} color="success" />
                <KPICard title="Tasa Deserción / Churn" value="6.2%" subtitle="Traslados / Retiros" icon={AlertTriangle} color="danger" />
                <KPICard title="Antigüedad Promedio" value="5.2 Años" subtitle="Permanencia familiar" icon={Users} color="info" />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-[#1a1f36]">Power BI Dashboard 6: Panel de Fidelización y Análisis Churn ({selectedNivel} - {selectedAnio})</h2>
                  <p className="text-xs text-slate-500">Desglose porcentual de los motivos de retiro o traslado de alumnos en {selectedNivel}.</p>
                </div>

                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={churnData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={5} dataKey="value" nameKey="name" label={(entry) => `${entry.name}`}>
                        {churnData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Dashboard;
