import React, { useState, useMemo, useCallback } from 'react';
import { 
  DollarSign, Calendar, TrendingUp, Users, BarChart3, PieChart, 
  Download, Filter, RefreshCw, ArrowUp, ArrowDown, Target,
  Clock, Star, Car, Wallet, Receipt, LineChart, Settings,
  ChevronDown, ChevronUp, Eye, EyeOff,User
} from 'lucide-react';
import { LUXURY_THEMES_2025 } from '../../utils/luxuryThemes';
import { PREMIUM_SERVICES } from '../Services/ServicesFilters';
import { STAFF_MEMBERS } from '../../utils/configs';

const MoneyDashboard = ({ services, theme }) => {
  const currentTheme = LUXURY_THEMES_2025[theme];
  
  // State for filters and display
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showDetails, setShowDetails] = useState({
    revenue: true,
    staff: true,
    services: true,
    trends: false
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Financial calculations
  const financialData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    
    // Fix today's date string for proper comparison
    const todayString = today.toISOString().split('T')[0];
    
    // Filter services based on filters
    let filteredServices = services.filter(service => {
      const serviceDate = new Date(service.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end + 'T23:59:59');
      
      let matches = serviceDate >= startDate && serviceDate <= endDate;
      
      if (selectedStaff !== 'all') {
        matches = matches && (Array.isArray(service.staff) ? 
          service.staff.includes(selectedStaff) : 
          service.staff === selectedStaff);
      }
      
      if (selectedService !== 'all') {
        matches = matches && service.serviceType === selectedService;
      }
      
      return matches;
    });

    // Calculate period-based revenue
    const calculatePeriodRevenue = (startDate, label, exactDate = null) => {
      let periodServices;
      
      if (exactDate) {
        // For today, match exact date string
        periodServices = services.filter(service => service.date === exactDate);
      } else {
        // For other periods, use date range
        periodServices = services.filter(service => {
          const serviceDate = new Date(service.date);
          return serviceDate >= startDate;
        });
      }
      
      const total = periodServices.reduce((sum, service) => sum + (service.totalPrice || 0), 0);
      const count = periodServices.length;
      const average = count > 0 ? total / count : 0;
      
      return { total, count, average, label };
    };

    const periods = {
      today: calculatePeriodRevenue(today, `Aujourd'hui (${now.toLocaleDateString('fr-FR')})`, todayString),
      week: calculatePeriodRevenue(thisWeekStart, "Cette semaine"),
      month: calculatePeriodRevenue(thisMonthStart, `Ce mois (${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})`),
      year: calculatePeriodRevenue(thisYearStart, "Cette année")
    };

    // Staff earnings calculation
    const staffEarnings = {};
    Object.keys(STAFF_MEMBERS).forEach(staffKey => {
      const staffServices = filteredServices.filter(service => 
        Array.isArray(service.staff) ? 
          service.staff.includes(staffKey) : 
          service.staff === staffKey
      );
      
      const earnings = staffServices.reduce((sum, service) => {
        const servicePrice = service.totalPrice || 0;
        const staffCount = Array.isArray(service.staff) ? service.staff.length : 1;
        return sum + (servicePrice / staffCount);
      }, 0);
      
      staffEarnings[staffKey] = {
        earnings: Math.round(earnings),
        services: staffServices.length,
        average: staffServices.length > 0 ? Math.round(earnings / staffServices.length) : 0
      };
    });

    // Service type breakdown
    const serviceBreakdown = {};
    Object.keys(PREMIUM_SERVICES).forEach(serviceKey => {
      const serviceServices = filteredServices.filter(service => service.serviceType === serviceKey);
      const revenue = serviceServices.reduce((sum, service) => sum + (service.totalPrice || 0), 0);
      
      serviceBreakdown[serviceKey] = {
        revenue: Math.round(revenue),
        count: serviceServices.length,
        average: serviceServices.length > 0 ? Math.round(revenue / serviceServices.length) : 0
      };
    });

    // Daily revenue for chart (last 30 days)
    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      const dayServices = services.filter(service => service.date === dateStr);
      const dayRevenue = dayServices.reduce((sum, service) => sum + (service.totalPrice || 0), 0);
      
      dailyRevenue.push({
        date: dateStr,
        revenue: dayRevenue,
        services: dayServices.length,
        label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      });
    }

    // Calculate totals from filtered data
    const filteredTotal = filteredServices.reduce((sum, service) => sum + (service.totalPrice || 0), 0);
    const filteredCount = filteredServices.length;
    const filteredAverage = filteredCount > 0 ? filteredTotal / filteredCount : 0;

    // Growth calculation (compare to previous period)
    const previousPeriodStart = new Date(thisMonthStart.getTime() - (30 * 24 * 60 * 60 * 1000));
    const previousPeriodServices = services.filter(service => {
      const serviceDate = new Date(service.date);
      return serviceDate >= previousPeriodStart && serviceDate < thisMonthStart;
    });
    const previousTotal = previousPeriodServices.reduce((sum, service) => sum + (service.totalPrice || 0), 0);
    const growth = previousTotal > 0 ? ((periods.month.total - previousTotal) / previousTotal) * 100 : 0;

    return {
      periods,
      staffEarnings,
      serviceBreakdown,
      dailyRevenue,
      filtered: {
        total: Math.round(filteredTotal),
        count: filteredCount,
        average: Math.round(filteredAverage)
      },
      growth: Math.round(growth * 10) / 10
    };
  }, [services, selectedStaff, selectedService, dateRange]);

  // Export functionality
  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const csvData = [
        ['Rapport Financier - JOUINI Car Wash'],
        ['Généré le:', new Date().toLocaleDateString('fr-FR')],
        ['Période:', `${dateRange.start} - ${dateRange.end}`],
        [''],
        ['RÉSUMÉ GÉNÉRAL'],
        ['Total Revenus:', `${financialData.filtered.total} DT`],
        ['Nombre Services:', financialData.filtered.count],
        ['Prix Moyen:', `${financialData.filtered.average} DT`],
        [''],
        ['REVENUS PAR PÉRIODE'],
        ['Période', 'Revenus (DT)', 'Services', 'Moyenne (DT)'],
        ...Object.values(financialData.periods).map(period => [
          period.label,
          period.total,
          period.count,
          Math.round(period.average)
        ]),
        [''],
        ['PERFORMANCE ÉQUIPE'],
        ['Staff', 'Revenus (DT)', 'Services', 'Moyenne (DT)'],
        ...Object.entries(financialData.staffEarnings).map(([key, data]) => [
          STAFF_MEMBERS[key]?.name || key,
          data.earnings,
          data.services,
          data.average
        ]),
        [''],
        ['SERVICES PAR TYPE'],
        ['Service', 'Revenus (DT)', 'Nombre', 'Moyenne (DT)'],
        ...Object.entries(financialData.serviceBreakdown)
          .filter(([, data]) => data.count > 0)
          .map(([key, data]) => [
            PREMIUM_SERVICES[key]?.name || key,
            data.revenue,
            data.count,
            data.average
          ])
      ];

      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport_financier_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
    }
  }, [financialData, dateRange]);

  // Export chart to PDF
  const exportChartToPDF = useCallback(() => {
    try {
      // Create a simple text-based PDF content
      const chartData = financialData.dailyRevenue
        .map(day => `${day.label}: ${day.revenue} DT (${day.services} services)`)
        .join('\n');
      
      const pdfContent = [
        'JOUINI Car Wash - Rapport Graphique des Revenus',
        `Généré le: ${new Date().toLocaleDateString('fr-FR')}`,
        `Période: ${dateRange.start} - ${dateRange.end}`,
        '',
        'ÉVOLUTION DES REVENUS (30 DERNIERS JOURS)',
        '=' .repeat(50),
        '',
        chartData,
        '',
        'STATISTIQUES:',
        `Maximum journalier: ${Math.max(...financialData.dailyRevenue.map(d => d.revenue))} DT`,
        `Minimum journalier: ${Math.min(...financialData.dailyRevenue.map(d => d.revenue))} DT`,
        `Moyenne journalière: ${Math.round(financialData.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) / financialData.dailyRevenue.length)} DT`,
        `Total sur 30 jours: ${financialData.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0)} DT`,
        '',
        'Ce rapport a été généré automatiquement par JOUINI Car Wash Dashboard'
      ].join('\n');

      // Create downloadable text file (as PDF alternative)
      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport_graphique_revenus_${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  }, [financialData, dateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${currentTheme.surface} rounded-2xl p-6 shadow-xl border ${currentTheme.border}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <DollarSign className="text-white" size={28} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${currentTheme.text}`}>
                Tableau de Bord Financier
              </h1>
              <p className={`${currentTheme.textSecondary} text-sm`}>
                Suivi des revenus • Performance équipe • Analytics métier
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {exportLoading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${currentTheme.surface} rounded-2xl p-4 shadow-xl border ${currentTheme.border}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Filter className={`${currentTheme.text}`} size={20} />
          <h3 className={`font-bold ${currentTheme.text} text-lg`}>Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.textSecondary}`}>Date début</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md`}
            />
          </div>
          
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.textSecondary}`}>Date fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md`}
            />
          </div>

          {/* Staff Filter */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.textSecondary}`}>Employé</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md appearance-none`}
            >
              <option value="all">Tous les employés</option>
              {Object.entries(STAFF_MEMBERS).map(([key, staff]) => (
                <option key={key} value={key}>{staff.name}</option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.textSecondary}`}>Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${currentTheme.glass} ${currentTheme.border} ${currentTheme.text} ${currentTheme.ring} focus:border-transparent transition-all duration-300 text-sm shadow-md appearance-none`}
            >
              <option value="all">Tous les services</option>
              {Object.entries(PREMIUM_SERVICES).map(([key, service]) => (
                <option key={key} value={key}>{service.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Period Buttons */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${currentTheme.textSecondary}`}>Période rapide</label>
            <div className="flex flex-col space-y-1">
              {[
                { key: 'today', label: 'Aujourd\'hui' },
                { key: 'week', label: 'Cette semaine' },
                { key: 'month', label: 'Ce mois' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => {
                    const now = new Date();
                    let start;
                    switch(period.key) {
                      case 'today':
                        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                      case 'week':
                        start = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
                        break;
                      case 'month':
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                      default:
                        start = now;
                    }
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: now.toISOString().split('T')[0]
                    });
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                    selectedPeriod === period.key
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : `${currentTheme.glass} ${currentTheme.text} hover:scale-105`
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Revenu Total",
            value: `${financialData.filtered.total} DT`,
            subtitle: `${financialData.filtered.count} services`,
            icon: Wallet,
            color: 'green',
            gradient: 'from-green-500 to-emerald-600'
          },
          {
            title: "Prix Moyen",
            value: `${financialData.filtered.average} DT`,
            subtitle: "par service",
            icon: Target,
            color: 'blue',
            gradient: 'from-blue-500 to-indigo-600'
          },
          {
            title: "Ce Mois",
            value: `${financialData.periods.month.total} DT`,
            subtitle: `${financialData.growth > 0 ? '+' : ''}${financialData.growth}% vs mois précédent`,
            icon: TrendingUp,
            color: financialData.growth >= 0 ? 'green' : 'red',
            gradient: financialData.growth >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-600'
          },
          {
            title: "Aujourd'hui",
            value: `${financialData.periods.today.total} DT`,
            subtitle: `${financialData.periods.today.count} services`,
            icon: Calendar,
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600'
          }
        ].map((metric, index) => (
          <div
            key={index}
            className={`${currentTheme.surface} rounded-xl p-6 hover:scale-105 transition-all duration-500 shadow-lg border ${currentTheme.border} relative overflow-hidden group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.gradient} shadow-md`}>
                  <metric.icon className="text-white" size={24} />
                </div>
                {metric.title === "Ce Mois" && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                    financialData.growth >= 0 ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                  }`}>
                    {financialData.growth >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>{Math.abs(financialData.growth)}%</span>
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${currentTheme.textSecondary} mb-2 uppercase tracking-wider`}>
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold ${currentTheme.text} mb-1`}>
                  {metric.value}
                </p>
                <p className={`text-sm ${currentTheme.textMuted}`}>
                  {metric.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Performance */}
        <div className={`${currentTheme.surface} rounded-xl p-6 shadow-xl border ${currentTheme.border}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                <Users className="text-white" size={20} />
              </div>
              <h3 className={`font-bold ${currentTheme.text} text-lg`}>Performance Équipe</h3>
            </div>
            <button
              onClick={() => setShowDetails(prev => ({ ...prev, staff: !prev.staff }))}
              className={`p-2 rounded-lg ${currentTheme.glass} ${currentTheme.text} hover:scale-110 transition-all duration-300`}
            >
              {showDetails.staff ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {showDetails.staff && (
            <div className="space-y-4">
              {Object.entries(financialData.staffEarnings)
                .sort(([,a], [,b]) => b.earnings - a.earnings)
                .map(([staffKey, data]) => (
                <div key={staffKey} className={`p-4 rounded-lg ${currentTheme.glass} hover:scale-102 transition-all duration-300 shadow-md`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600`}>
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${currentTheme.text}`}>
                        {STAFF_MEMBERS[staffKey]?.name || staffKey}
                      </h4>
                      <p className={`text-sm ${currentTheme.textSecondary}`}>
                        {STAFF_MEMBERS[staffKey]?.specialty || 'Spécialiste'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-md bg-green-500/10 border border-green-500/20">
                      <p className="text-lg font-bold text-green-600">
                        {data.earnings} DT
                      </p>
                      <p className={`text-xs ${currentTheme.textMuted} uppercase tracking-wider`}>Revenus</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                      <p className="text-lg font-bold text-blue-600">
                        {data.services}
                      </p>
                      <p className={`text-xs ${currentTheme.textMuted} uppercase tracking-wider`}>Services</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
                      <p className="text-lg font-bold text-purple-600">
                        {data.average} DT
                      </p>
                      <p className={`text-xs ${currentTheme.textMuted} uppercase tracking-wider`}>Moyenne</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Types Performance */}
        <div className={`${currentTheme.surface} rounded-xl p-6 shadow-xl border ${currentTheme.border}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                <PieChart className="text-white" size={20} />
              </div>
              <h3 className={`font-bold ${currentTheme.text} text-lg`}>Services par Type</h3>
            </div>
            <button
              onClick={() => setShowDetails(prev => ({ ...prev, services: !prev.services }))}
              className={`p-2 rounded-lg ${currentTheme.glass} ${currentTheme.text} hover:scale-110 transition-all duration-300`}
            >
              {showDetails.services ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {showDetails.services && (
            <div className="space-y-4">
              {Object.entries(financialData.serviceBreakdown)
                .filter(([, data]) => data.count > 0)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .map(([serviceKey, data]) => (
                <div key={serviceKey} className={`p-4 rounded-lg ${currentTheme.glass} hover:scale-102 transition-all duration-300 shadow-md`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {PREMIUM_SERVICES[serviceKey]?.icon}
                      </div>
                      <div>
                        <h4 className={`font-bold ${currentTheme.text}`}>
                          {PREMIUM_SERVICES[serviceKey]?.name || serviceKey}
                        </h4>
                        <p className={`text-sm ${currentTheme.textSecondary}`}>
                          {data.count} services
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">{data.revenue} DT</span>
                      <p className={`text-sm ${currentTheme.textMuted}`}>
                        Moy: {data.average} DT
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 shadow-md transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(100, financialData.filtered.total > 0 ? (data.revenue / financialData.filtered.total) * 100 : 0)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Revenue Chart */}
      <div className={`${currentTheme.surface} rounded-xl p-6 shadow-xl border ${currentTheme.border}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
              <LineChart className="text-white" size={20} />
            </div>
            <h3 className={`font-bold ${currentTheme.text} text-lg`}>Évolution des Revenus (30 derniers jours)</h3>
          </div>
          <button
            onClick={() => exportChartToPDF()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
        
        {/* Enhanced Chart with Grid and Better Design */}
        <div className="relative">
          {/* Chart Background Grid */}
          <div className="absolute inset-0 grid grid-rows-5 opacity-20">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`border-b ${currentTheme.border}`} />
            ))}
          </div>
          
          {/* Chart Container */}
          <div className="relative h-80 overflow-x-auto p-4">
            <div className="flex items-end justify-between space-x-2 h-full min-w-full">
              {financialData.dailyRevenue.map((day, index) => {
                const maxRevenue = Math.max(...financialData.dailyRevenue.map(d => d.revenue));
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 250 : 2;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 min-w-[25px] group">
                    {/* Revenue Value on Hover */}
                    <div className={`mb-2 text-xs font-bold ${currentTheme.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black text-white px-2 py-1 rounded whitespace-nowrap`}>
                      {day.revenue} DT
                    </div>
                    
                    {/* Enhanced Bar */}
                    <div 
                      className="w-full relative rounded-t-lg transition-all duration-500 hover:scale-110 cursor-pointer shadow-lg"
                      style={{ 
                        height: `${height}px`,
                        background: day.revenue > 0 
                          ? `linear-gradient(to top, #10b981, #34d399, #6ee7b7)` 
                          : 'linear-gradient(to top, #e5e7eb, #f3f4f6)'
                      }}
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-green-600/30 to-transparent rounded-t-lg" />
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:animate-pulse" />
                    </div>
                    
                    {/* Date Label */}
                    <div className={`text-xs ${currentTheme.textMuted} mt-3 transform -rotate-45 origin-center font-medium`}>
                      {day.label}
                    </div>
                    
                    {/* Services Count */}
                    <div className={`text-xs ${currentTheme.textSecondary} mt-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      {day.services} srv
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Chart Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: "Maximum",
                value: `${Math.max(...financialData.dailyRevenue.map(d => d.revenue))} DT`,
                color: "text-green-600",
                bg: "bg-green-500/10"
              },
              {
                label: "Minimum", 
                value: `${Math.min(...financialData.dailyRevenue.map(d => d.revenue))} DT`,
                color: "text-blue-600",
                bg: "bg-blue-500/10"
              },
              {
                label: "Moyenne",
                value: `${Math.round(financialData.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) / financialData.dailyRevenue.length)} DT`,
                color: "text-purple-600", 
                bg: "bg-purple-500/10"
              },
              {
                label: "Total 30j",
                value: `${financialData.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0)} DT`,
                color: "text-orange-600",
                bg: "bg-orange-500/10"
              }
            ].map((stat, index) => (
              <div key={index} className={`p-3 rounded-lg ${stat.bg} border border-opacity-20 text-center`}>
                <p className={`text-sm font-medium ${currentTheme.textSecondary} mb-1`}>{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Comparison */}
      <div className={`${currentTheme.surface} rounded-xl p-6 shadow-xl border ${currentTheme.border}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
            <BarChart3 className="text-white" size={20} />
          </div>
          <h3 className={`font-bold ${currentTheme.text} text-lg`}>Comparaison par Période</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(financialData.periods).map((period, index) => (
            <div key={index} className={`p-4 rounded-lg ${currentTheme.glass} hover:scale-105 transition-all duration-300 shadow-md text-center`}>
              <h4 className={`font-bold ${currentTheme.text} mb-2`}>{period.label}</h4>
              <p className="text-2xl font-bold text-green-600 mb-1">{period.total} DT</p>
              <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>{period.count} services</p>
              <p className={`text-xs ${currentTheme.textMuted}`}>Moy: {Math.round(period.average)} DT</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoneyDashboard;