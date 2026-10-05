/**
 * RITHIN FINANCE — Comparison Chart Module
 * Renders visual comparison of the four Cost of Equity methods.
 * Supports Chart.js canvas when online, with an elegant SVG/HTML bar chart fallback when offline.
 */

export const ChartRenderer = {
  chartInstance: null,

  /**
   * Render comparison chart
   * @param {string} canvasId - Target canvas ID
   * @param {string} fallbackId - Target fallback container ID
   * @param {Array<{name: string, value: number, color: string}>} data
   */
  render(canvasId, fallbackId, data) {
    const canvas = document.getElementById(canvasId);
    const fallbackContainer = document.getElementById(fallbackId);

    // Try Chart.js if available
    if (window.Chart && canvas) {
      try {
        if (fallbackContainer) fallbackContainer.style.display = 'none';
        canvas.style.display = 'block';
        this.renderChartJs(canvas, data);
        return;
      } catch (err) {
        console.warn('Chart.js rendering failed, falling back to SVG/HTML renderer:', err);
      }
    }

    // Fallback renderer
    if (canvas) canvas.style.display = 'none';
    if (fallbackContainer) {
      fallbackContainer.style.display = 'flex';
      this.renderFallbackBars(fallbackContainer, data);
    }
  },

  /**
   * Render using Chart.js
   */
  renderChartJs(canvas, data) {
    const ctx = canvas.getContext('2d');

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = data.map(item => item.name);
    const values = data.map(item => item.value);
    const colors = data.map(item => item.color || '#6366F1');

    this.chartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cost of Equity (%)',
          data: values,
          backgroundColor: colors.map(c => c + 'CC'), // 80% opacity
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 42,
          maxBarThickness: 56
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 900,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: '#F8FAFC',
            bodyColor: '#38BDF8',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
            bodyFont: { family: 'JetBrains Mono', size: 14, weight: '600' },
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Cost of Equity: ${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: '#94A3B8',
              font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#64748B',
              font: { family: 'JetBrains Mono', size: 11 },
              callback: function(val) {
                return val + '%';
              }
            }
          }
        }
      }
    });
  },

  /**
   * Render offline fallback animated bars
   */
  renderFallbackBars(container, data) {
    container.innerHTML = '';
    const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 20);

    data.forEach(item => {
      const row = document.createElement('div');
      row.className = 'bar-row';

      const widthPct = Math.min(Math.max((Math.abs(item.value) / maxVal) * 100, 4), 100);

      row.innerHTML = `
        <div class="bar-method-name">${item.name}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: 0%; background: ${item.color || '#6366F1'};" data-target-width="${widthPct}%">
            ${item.value.toFixed(2)}%
          </div>
        </div>
      `;

      container.appendChild(row);
    });

    // Animate width
    setTimeout(() => {
      container.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-target-width');
      });
    }, 50);
  }
};
