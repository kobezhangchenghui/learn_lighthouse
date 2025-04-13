document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    let chart;

    // 初始化图表
    function initChart(labels, data) {
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '性能得分',
                    data: data,
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // 加载性能数据
    async function loadMetrics() {
        try {
            const response = await fetch('/api/performance_metrics');
            const metrics = await response.json();
            
            // 处理数据格式
            const labels = metrics.map(m => new Date(m.created_at).toLocaleDateString());
            const scores = metrics.map(m => m.performance_score);
            
            // 更新图表
            initChart(labels, scores);
            
            // 更新指标卡片
            const metricsGrid = document.querySelector('.metrics-grid');
            metricsGrid.innerHTML = metrics.slice(0, 4).map(metric => `
                <div class="metric-card">
                    <h3>${new Date(metric.created_at).toLocaleDateString()}</h3>
                    <p>得分: ${metric.performance_score}</p>
                    <p>FCP: ${metric.fcp}</p>
                    <p>LCP: ${metric.lcp}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载性能数据失败:', error);
        }
    }

    // 初始化加载
    await loadMetrics();

    // 筛选条件变化事件
    document.getElementById('websiteSelect').addEventListener('change', loadMetrics);
    document.getElementById('dateFilter').addEventListener('change', loadMetrics);
});