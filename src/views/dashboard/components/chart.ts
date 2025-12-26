/**
 * Chart Components
 * CSS-based charts without external libraries
 */

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  id: string;
  data: BarChartData[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
}

export function generateBarChart(props: BarChartProps): string {
  const { id, data, height = 200, showLabels = true, showValues = true, animated = true } = props;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const barsHtml = data
    .map((item, index) => {
      const percentage = (item.value / maxValue) * 100;
      const color = item.color || 'var(--accent-primary)';

      return `
      <div class="bar-chart-item" data-index="${index}">
        <div class="bar-chart-bar-container">
          <div
            class="bar-chart-bar ${animated ? 'animated' : ''}"
            style="height: ${percentage}%; background: ${color};"
            data-value="${item.value}"
          >
            ${showValues ? `<span class="bar-chart-value">${formatNumber(item.value)}</span>` : ''}
          </div>
        </div>
        ${showLabels ? `<span class="bar-chart-label">${item.label}</span>` : ''}
      </div>
    `;
    })
    .join('');

  return `
    <div class="bar-chart" id="${id}" style="height: ${height}px;">
      <div class="bar-chart-bars">
        ${barsHtml}
      </div>
    </div>
  `;
}

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  id: string;
  data: DonutChartData[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  showCenter?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export function generateDonutChart(props: DonutChartProps): string {
  const {
    id,
    data,
    size = 180,
    thickness = 24,
    showLegend = true,
    showCenter = true,
    centerLabel = '',
    centerValue = '',
  } = props;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentOffset = 0;

  const segments = data
    .map((item) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const dashArray = `${percentage} ${100 - percentage}`;
      const rotation = currentOffset * 3.6; // Convert percentage to degrees
      currentOffset += percentage;

      return `
      <circle
        class="donut-segment"
        cx="50"
        cy="50"
        r="40"
        stroke="${item.color}"
        stroke-width="${thickness}"
        stroke-dasharray="${dashArray}"
        stroke-dashoffset="25"
        transform="rotate(${rotation - 90} 50 50)"
        data-label="${item.label}"
        data-value="${item.value}"
        data-percentage="${percentage.toFixed(1)}"
      />
    `;
    })
    .join('');

  const legendHtml = showLegend
    ? `
    <div class="donut-legend">
      ${data
        .map(
          (item) => `
        <div class="donut-legend-item">
          <span class="donut-legend-color" style="background: ${item.color};"></span>
          <span class="donut-legend-label">${item.label}</span>
          <span class="donut-legend-value">${formatNumber(item.value)}</span>
          <span class="donut-legend-percent">${total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%</span>
        </div>
      `
        )
        .join('')}
    </div>
  `
    : '';

  return `
    <div class="donut-chart-container" id="${id}">
      <div class="donut-chart" style="width: ${size}px; height: ${size}px;">
        <svg viewBox="0 0 100 100" class="donut-svg">
          <circle
            class="donut-background"
            cx="50"
            cy="50"
            r="40"
            stroke="var(--border-color)"
            stroke-width="${thickness}"
            fill="none"
          />
          ${segments}
        </svg>
        ${
          showCenter
            ? `
          <div class="donut-center">
            <span class="donut-center-value">${centerValue}</span>
            <span class="donut-center-label">${centerLabel}</span>
          </div>
        `
            : ''
        }
      </div>
      ${legendHtml}
    </div>
  `;
}

export interface LineChartData {
  label: string;
  value: number;
}

export interface LineChartProps {
  id: string;
  data: LineChartData[];
  height?: number;
  color?: string;
  showPoints?: boolean;
  showArea?: boolean;
  showLabels?: boolean;
}

export function generateLineChart(props: LineChartProps): string {
  const {
    id,
    data,
    height = 200,
    color = 'var(--accent-primary)',
    showPoints = true,
    showArea = true,
    showLabels = true,
  } = props;

  if (data.length === 0) {
    return `<div class="line-chart empty" id="${id}">No data available</div>`;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const chartHeight = 100;
  const padding = 10;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = chartHeight - padding - (item.value / maxValue) * (chartHeight - padding * 2);
    return { x, y, value: item.value, label: item.label };
  });

  // Create path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  const pointsHtml = showPoints
    ? points
        .map(
          (p, i) => `
      <circle
        class="line-chart-point"
        cx="${p.x}"
        cy="${p.y}"
        r="4"
        fill="${color}"
        data-value="${p.value}"
        data-label="${p.label}"
        data-index="${i}"
      />
    `
        )
        .join('')
    : '';

  const labelsHtml = showLabels
    ? `
    <div class="line-chart-labels">
      ${data.map((item) => `<span class="line-chart-label">${item.label}</span>`).join('')}
    </div>
  `
    : '';

  return `
    <div class="line-chart" id="${id}" style="height: ${height}px;">
      <svg viewBox="0 0 ${width} ${chartHeight}" preserveAspectRatio="none" class="line-chart-svg">
        ${showArea ? `<path class="line-chart-area" d="${areaD}" fill="${color}" opacity="0.1"/>` : ''}
        <path class="line-chart-line" d="${pathD}" stroke="${color}" stroke-width="2" fill="none"/>
        ${pointsHtml}
      </svg>
      ${labelsHtml}
      <div class="line-chart-tooltip" id="${id}-tooltip"></div>
    </div>
  `;
}

export interface ProgressBarProps {
  id: string;
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function generateProgressBar(props: ProgressBarProps): string {
  const {
    id,
    value,
    max,
    label = '',
    showPercentage = true,
    color = 'var(--accent-primary)',
    size = 'md',
  } = props;

  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return `
    <div class="progress-bar-container ${size}" id="${id}">
      ${label ? `<div class="progress-bar-label">${label}</div>` : ''}
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill"
          style="width: ${percentage}%; background: ${color};"
        ></div>
      </div>
      ${showPercentage ? `<div class="progress-bar-text">${percentage.toFixed(0)}%</div>` : ''}
    </div>
  `;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getChartStyles(): string {
  return `
    /* Bar Chart */
    .bar-chart {
      display: flex;
      flex-direction: column;
    }

    .bar-chart-bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 0 4px;
    }

    .bar-chart-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 0;
    }

    .bar-chart-bar-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .bar-chart-bar {
      width: 100%;
      max-width: 48px;
      min-height: 4px;
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: opacity var(--transition-fast);
    }

    .bar-chart-bar.animated {
      animation: barGrow 0.6s ease-out forwards;
      transform-origin: bottom;
    }

    @keyframes barGrow {
      from {
        transform: scaleY(0);
      }
      to {
        transform: scaleY(1);
      }
    }

    .bar-chart-bar:hover {
      opacity: 0.8;
    }

    .bar-chart-value {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .bar-chart-label {
      margin-top: 8px;
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    /* Donut Chart */
    .donut-chart-container {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .donut-chart {
      position: relative;
      flex-shrink: 0;
    }

    .donut-svg {
      transform: rotate(-90deg);
    }

    .donut-segment {
      fill: none;
      transition: opacity var(--transition-fast);
      cursor: pointer;
    }

    .donut-segment:hover {
      opacity: 0.8;
    }

    .donut-background {
      fill: none;
    }

    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .donut-center-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .donut-center-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .donut-legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
    }

    .donut-legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    .donut-legend-label {
      color: var(--text-secondary);
      flex: 1;
    }

    .donut-legend-value {
      font-weight: 500;
      color: var(--text-primary);
      min-width: 40px;
      text-align: right;
    }

    .donut-legend-percent {
      color: var(--text-muted);
      min-width: 45px;
      text-align: right;
    }

    /* Line Chart */
    .line-chart {
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .line-chart.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .line-chart-svg {
      flex: 1;
      width: 100%;
    }

    .line-chart-line {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .line-chart-point {
      cursor: pointer;
      transition: r var(--transition-fast);
    }

    .line-chart-point:hover {
      r: 6;
    }

    .line-chart-labels {
      display: flex;
      justify-content: space-between;
      padding: 8px 10px 0;
    }

    .line-chart-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .line-chart-tooltip {
      position: absolute;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--transition-fast);
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .line-chart-tooltip.visible {
      opacity: 1;
    }

    /* Progress Bar */
    .progress-bar-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .progress-bar-container.sm .progress-bar-track {
      height: 4px;
    }

    .progress-bar-container.md .progress-bar-track {
      height: 8px;
    }

    .progress-bar-container.lg .progress-bar-track {
      height: 12px;
    }

    .progress-bar-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      min-width: 80px;
    }

    .progress-bar-track {
      flex: 1;
      background: var(--bg-tertiary);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s ease;
    }

    .progress-bar-text {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-primary);
      min-width: 40px;
      text-align: right;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .donut-chart-container {
        flex-direction: column;
        align-items: flex-start;
      }

      .bar-chart-bars {
        gap: 4px;
      }

      .bar-chart-value {
        font-size: 0.625rem;
        top: -20px;
      }
    }
  `;
}

export function getChartScripts(): string {
  return `
    // Line chart tooltip handling
    function initLineChartTooltips(chartId) {
      const chart = document.getElementById(chartId);
      if (!chart) return;

      const tooltip = document.getElementById(chartId + '-tooltip');
      const points = chart.querySelectorAll('.line-chart-point');

      points.forEach(point => {
        point.addEventListener('mouseenter', function(e) {
          const value = this.getAttribute('data-value');
          const label = this.getAttribute('data-label');
          tooltip.innerHTML = '<strong>' + label + '</strong><br>' + value;
          tooltip.classList.add('visible');

          const rect = chart.getBoundingClientRect();
          const x = parseFloat(this.getAttribute('cx'));
          const y = parseFloat(this.getAttribute('cy'));

          tooltip.style.left = (x / 100 * rect.width - tooltip.offsetWidth / 2) + 'px';
          tooltip.style.top = (y / 100 * (rect.height - 30) - tooltip.offsetHeight - 10) + 'px';
        });

        point.addEventListener('mouseleave', function() {
          tooltip.classList.remove('visible');
        });
      });
    }

    // Bar chart hover effects
    function initBarChartInteractions(chartId) {
      const chart = document.getElementById(chartId);
      if (!chart) return;

      const bars = chart.querySelectorAll('.bar-chart-bar');
      bars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
          bars.forEach(b => {
            if (b !== bar) b.style.opacity = '0.4';
          });
        });

        bar.addEventListener('mouseleave', function() {
          bars.forEach(b => b.style.opacity = '1');
        });
      });
    }

    // Donut chart interactions
    function initDonutChartInteractions(chartId) {
      const container = document.getElementById(chartId);
      if (!container) return;

      const segments = container.querySelectorAll('.donut-segment');
      const centerValue = container.querySelector('.donut-center-value');
      const centerLabel = container.querySelector('.donut-center-label');

      if (!centerValue || !centerLabel) return;

      const originalValue = centerValue.textContent;
      const originalLabel = centerLabel.textContent;

      segments.forEach(segment => {
        segment.addEventListener('mouseenter', function() {
          const value = this.getAttribute('data-value');
          const label = this.getAttribute('data-label');
          const percentage = this.getAttribute('data-percentage');

          centerValue.textContent = value;
          centerLabel.textContent = label + ' (' + percentage + '%)';
        });

        segment.addEventListener('mouseleave', function() {
          centerValue.textContent = originalValue;
          centerLabel.textContent = originalLabel;
        });
      });
    }
  `;
}
