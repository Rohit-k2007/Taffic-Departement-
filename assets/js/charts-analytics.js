/**
 * NATDAMS - Analytics & Chart Controller
 * Handles Historical Volumes, Vehicle Ratio Intelligence (Challans & Accidents),
 * and AI Predictive Congestion Curves.
 */

class AnalyticsController {
  constructor() {
    this.charts = {};
  }

  initHistoricalCharts() {
    this.renderMonthlyVolumeChart();
    this.renderVehicleRatiosCharts();
    this.renderPeakHoursChart();
  }

  initPredictiveCharts() {
    this.render24HourPredictiveChart('standard');
    this.renderSignalOptimizationChart();
  }

  renderVehicleRatiosCharts() {
    const data = window.trafficDB ? window.trafficDB.getVehicleRatios() : null;
    const categories = data ? data.vehicleCategories : [
      { category: "Cars & SUVs", challanPercentage: 28.4, accidentPercentage: 19.9 },
      { category: "Bikes & Two-Wheelers", challanPercentage: 44.1, accidentPercentage: 36.8 },
      { category: "Heavy Trucks", challanPercentage: 16.5, accidentPercentage: 29.5 },
      { category: "Buses", challanPercentage: 5.8, accidentPercentage: 7.6 },
      { category: "Auto-Rickshaws & LCVs", challanPercentage: 5.2, accidentPercentage: 6.2 }
    ];

    const labels = categories.map(c => c.category);
    const challanShares = categories.map(c => c.challanPercentage);
    const accidentShares = categories.map(c => c.accidentPercentage);

    // 1. Challan Vehicle Ratio Chart
    const ctxChallan = document.getElementById('vehicleChallanRatioChart');
    if (ctxChallan) {
      if (this.charts.challanRatio) this.charts.challanRatio.destroy();
      this.charts.challanRatio = new Chart(ctxChallan, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: challanShares,
            backgroundColor: [
              '#111827', // Cars (Charcoal)
              '#b45309', // Bikes (Amber)
              '#b91c1c', // Trucks (Crimson)
              '#047857', // Buses (Emerald)
              '#475569'  // Auto/LCVs (Slate)
            ],
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw}% of Total Violations`
              }
            }
          },
          cutout: '62%'
        }
      });
    }

    // 2. Accident Vehicle Ratio Chart
    const ctxAccident = document.getElementById('vehicleAccidentRatioChart');
    if (ctxAccident) {
      if (this.charts.accidentRatio) this.charts.accidentRatio.destroy();
      this.charts.accidentRatio = new Chart(ctxAccident, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Accident Share (%)',
            data: accidentShares,
            backgroundColor: [
              'rgba(17, 24, 39, 0.85)',
              'rgba(180, 83, 9, 0.85)',
              'rgba(185, 28, 28, 0.85)',
              'rgba(4, 120, 87, 0.85)',
              'rgba(71, 85, 105, 0.85)'
            ],
            borderRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}% Contribution to Collisions`
              }
            }
          },
          scales: {
            x: { ticks: { font: { size: 10 } } },
            y: { 
              beginAtZero: true,
              suggestedMax: 50,
              title: { display: true, text: 'Accident Ratio Percentage (%)', font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  renderMonthlyVolumeChart() {
    const ctx = document.getElementById('monthlyVolumeChart');
    if (!ctx) return;
    if (this.charts.monthlyVolume) this.charts.monthlyVolume.destroy();

    this.charts.monthlyVolume = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: '2026 Volume (Million Trips)',
            data: [4.8, 5.1, 5.4, 5.2, 5.9, 6.3, 6.1, 6.7, 7.1, null, null, null],
            borderColor: '#111827',
            backgroundColor: 'rgba(17, 24, 39, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.2,
            pointBackgroundColor: '#111827'
          },
          {
            label: '2025 Historical Volume',
            data: [4.2, 4.4, 4.7, 4.6, 5.0, 5.2, 5.1, 5.5, 5.8, 6.0, 6.2, 6.5],
            borderColor: '#94a3b8',
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { family: 'Plus Jakarta Sans' } } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
        }
      }
    });
  }

  renderPeakHoursChart() {
    const ctx = document.getElementById('peakHoursChart');
    if (!ctx) return;
    if (this.charts.peakHours) this.charts.peakHours.destroy();

    this.charts.peakHours = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [{
          label: 'Hourly Inflow (Vehicles / Hr)',
          data: [12000, 48000, 52000, 31000, 28000, 39000, 56000, 44000, 21000],
          backgroundColor: '#374151',
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
        }
      }
    });
  }

  render24HourPredictiveChart(scenario = 'standard') {
    const ctx = document.getElementById('future24HourChart');
    if (!ctx) return;
    if (this.charts.future24) this.charts.future24.destroy();

    let forecastMultiplier = 1.0;
    let scenarioLabel = 'AI Baseline Forecast';
    let borderColor = '#111827';

    if (scenario === 'rain') {
      forecastMultiplier = 1.35;
      scenarioLabel = 'AI Forecast + Heavy Monsoon Rain Event';
      borderColor = '#0284c7';
    } else if (scenario === 'vip') {
      forecastMultiplier = 1.25;
      scenarioLabel = 'AI Forecast + VIP Motorcade Arterial Lockout';
      borderColor = '#b45309';
    } else if (scenario === 'weekend') {
      forecastMultiplier = 0.85;
      scenarioLabel = 'AI Forecast (Holiday Mode)';
      borderColor = '#047857';
    }

    const baseline = [22, 16, 12, 10, 18, 48, 78, 85, 62, 54, 58, 64, 82, 88, 72, 45];
    const predicted = baseline.map(v => Math.min(99, Math.round(v * forecastMultiplier)));

    this.charts.future24 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'Tomorrow 02:00', '04:00', '06:00', '08:00'],
        datasets: [
          {
            label: scenarioLabel,
            data: predicted,
            borderColor: borderColor,
            backgroundColor: 'rgba(10, 37, 64, 0.06)',
            fill: true,
            tension: 0.25,
            borderWidth: 2
          },
          {
            label: 'Normal Baseline Pattern',
            data: baseline,
            borderColor: '#94a3b8',
            borderDash: [4, 4],
            borderWidth: 1.5,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { family: 'Plus Jakarta Sans' } } }
        },
        scales: {
          y: { suggestedMax: 100, title: { display: true, text: 'Congestion Index (%)' } }
        }
      }
    });
  }

  renderSignalOptimizationChart() {
    const ctx = document.getElementById('signalOptimizationChart');
    if (!ctx) return;
    if (this.charts.signalOpt) this.charts.signalOpt.destroy();

    this.charts.signalOpt = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Junction 1', 'Junction 2', 'Junction 3', 'Junction 4'],
        datasets: [
          {
            label: 'Legacy Wait Time (s)',
            data: [78, 92, 64, 85],
            backgroundColor: '#b91c1c',
            borderRadius: 2
          },
          {
            label: 'AI Adaptive Timing (s)',
            data: [42, 54, 38, 49],
            backgroundColor: '#047857',
            borderRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { title: { display: true, text: 'Average Delay Seconds' } }
        }
      }
    });
  }

  renderVahanProgressionChart(growthData = null) {
    const ctx = document.getElementById('vahanProgressionChart');
    if (!ctx) return;
    if (this.charts.vahanProgression) this.charts.vahanProgression.destroy();

    const timeline = growthData || [
      { year: '1995', count: 30295000, newAdditions: 2400000 },
      { year: '2000', count: 48857000, newAdditions: 4100000 },
      { year: '2005', count: 81502000, newAdditions: 6800000 },
      { year: '2010', count: 127749000, newAdditions: 10500000 },
      { year: '2015', count: 210023000, newAdditions: 15800000 },
      { year: '2020', count: 295800000, newAdditions: 18200000 },
      { year: '2023', count: 342100000, newAdditions: 22100000 },
      { year: '2024', count: 358400000, newAdditions: 23400000 },
      { year: '2025', count: 371200000, newAdditions: 24100000 },
      { year: '2026 (Sep)', count: 382450000, newAdditions: 19450000 }
    ];

    const labels = timeline.map(t => t.year);
    const cumulativeMillion = timeline.map(t => +(t.count / 10000000).toFixed(2)); // in Crores
    const additionsMillion = timeline.map(t => +(t.newAdditions / 10000000).toFixed(2));

    this.charts.vahanProgression = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cumulative Fleet in India (Crore Vehicles)',
            data: cumulativeMillion,
            borderColor: '#111827',
            backgroundColor: 'rgba(17, 24, 39, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.25,
            pointBackgroundColor: '#111827',
            pointRadius: 4
          },
          {
            label: 'Yearly New Registrations (Crores)',
            data: additionsMillion,
            borderColor: '#b45309',
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            tension: 0.25,
            pointBackgroundColor: '#b45309'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { font: { family: 'Plus Jakarta Sans', size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} Cr Vehicles`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { 
            beginAtZero: true,
            title: { display: true, text: 'Total Vehicles (in Crores)', font: { size: 11 } }
          }
        }
      }
    });
  }
}

window.analyticsController = new AnalyticsController();
