// Stats page functionality
let charts = {};
let currentTimeRange = 'week';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadStats();
});

function initializeEventListeners() {
    // Time range selector
    document.getElementById('timeRange').addEventListener('change', (e) => {
        currentTimeRange = e.target.value;
        loadStats();
    });

    // Export data
    document.getElementById('exportData').addEventListener('click', exportData);

    // Reset stats
    document.getElementById('resetStats').addEventListener('click', resetStats);
}

async function loadStats() {
    try {
        const data = await getStoredData();
        const filteredData = filterDataByTimeRange(data, currentTimeRange);
        
        updateSummaryCards(filteredData);
        updateCharts(filteredData);
        updateDetailedStats(filteredData);
        updateRecentActivity(filteredData);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function getStoredData() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['focusSessions', 'distractions', 'stats'], (result) => {
            resolve({
                focusSessions: result.focusSessions || [],
                distractions: result.distractions || [],
                stats: result.stats || {
                    totalFocusTime: 0,
                    totalDistractions: 0,
                    currentStreak: 0,
                    bestStreak: 0,
                    blockedCount: 0
                }
            });
        });
    });
}

function filterDataByTimeRange(data, range) {
    const now = Date.now();
    let cutoffTime;

    switch (range) {
        case 'today':
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            cutoffTime = todayStart.getTime();
            break;
        case 'week':
            cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
            break;
        case 'all':
            cutoffTime = 0;
            break;
    }

    return {
        focusSessions: data.focusSessions.filter(s => s.timestamp >= cutoffTime),
        distractions: data.distractions.filter(d => d.timestamp >= cutoffTime),
        stats: data.stats
    };
}

function updateSummaryCards(data) {
    // Calculate total focus time
    const totalMinutes = data.focusSessions.reduce((sum, session) => sum + session.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    document.getElementById('totalFocusTime').textContent = `${hours}h ${minutes}m`;

    // Total distractions
    document.getElementById('totalDistractions').textContent = data.distractions.length;

    // Current streak
    document.getElementById('currentStreak').textContent = `${data.stats.currentStreak} days`;
    document.getElementById('streakInfo').textContent = `Best: ${data.stats.bestStreak} days`;

    // Productivity score
    const score = calculateProductivityScore(data);
    document.getElementById('productivityScore').textContent = `${score}%`;

    // Calculate changes from previous period
    updateChangeIndicators(data);
}

function calculateProductivityScore(data) {
    if (data.focusSessions.length === 0) return 0;
    
    const totalFocusMinutes = data.focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const distractionCount = data.distractions.length;
    
    // Score based on focus time (max 70 points) and low distractions (max 30 points)
    const focusScore = Math.min((totalFocusMinutes / 60) * 10, 70);
    const distractionScore = Math.max(30 - distractionCount, 0);
    
    return Math.round(focusScore + distractionScore);
}

function updateChangeIndicators(data) {
    // This would compare with previous period data
    // For now, showing placeholder logic
    const focusChange = '+12%';
    const distractionsChange = '-8%';
    const scoreChange = '+15%';

    document.getElementById('focusTimeChange').textContent = `${focusChange} from last period`;
    document.getElementById('focusTimeChange').className = 'stat-change positive';
    
    document.getElementById('distractionsChange').textContent = `${distractionsChange} from last period`;
    document.getElementById('distractionsChange').className = 'stat-change positive';
    
    document.getElementById('scoreChange').textContent = `${scoreChange} from last period`;
    document.getElementById('scoreChange').className = 'stat-change positive';
}

function updateCharts(data) {
    createFocusTimeChart(data);
    createDistractionsChart(data);
    createTopSitesChart(data);
    createHeatmap(data);
}

function createFocusTimeChart(data) {
    const ctx = document.getElementById('focusTimeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.focusTime) {
        charts.focusTime.destroy();
    }

    // Group sessions by day
    const dailyData = groupByDay(data.focusSessions);
    const labels = Object.keys(dailyData);
    const values = Object.values(dailyData).map(sessions => 
        sessions.reduce((sum, s) => sum + s.duration, 0) / 60 // Convert to hours
    );

    charts.focusTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Focus Time (hours)',
                data: values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            }
        }
    });
}

function createDistractionsChart(data) {
    const ctx = document.getElementById('distractionsChart').getContext('2d');
    
    if (charts.distractions) {
        charts.distractions.destroy();
    }

    const dailyData = groupByDay(data.distractions);
    const labels = Object.keys(dailyData);
    const values = Object.values(dailyData).map(items => items.length);

    charts.distractions = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distractions',
                data: values,
                backgroundColor: '#ef4444',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        color: '#94a3b8',
                        stepSize: 1
                    },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            }
        }
    });
}

function createTopSitesChart(data) {
    const ctx = document.getElementById('topSitesChart').getContext('2d');
    
    if (charts.topSites) {
        charts.topSites.destroy();
    }

    // Count distractions by site
    const siteCounts = {};
    data.distractions.forEach(d => {
        const domain = extractDomain(d.url);
        siteCounts[domain] = (siteCounts[domain] || 0) + 1;
    });

    // Get top 5 sites
    const sortedSites = Object.entries(siteCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = sortedSites.map(s => s[0]);
    const values = sortedSites.map(s => s[1]);
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

    charts.topSites = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        padding: 15
                    }
                }
            }
        }
    });
}

function createHeatmap(data) {
    const container = document.getElementById('heatmapContainer');
    container.innerHTML = '';

    // Get last 28 days
    const days = 28;
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Count focus time for this day
        const dayData = data.focusSessions.filter(s => {
            const sessionDate = new Date(s.timestamp).toISOString().split('T')[0];
            return sessionDate === dateStr;
        });
        
        const totalMinutes = dayData.reduce((sum, s) => sum + s.duration, 0);
        const level = Math.min(Math.floor(totalMinutes / 60), 4); // 0-4 based on hours
        
        const cell = document.createElement('div');
        cell.className = `heatmap-cell level-${level}`;
        cell.title = `${dateStr}: ${Math.round(totalMinutes)} minutes`;
        container.appendChild(cell);
    }
}

function updateDetailedStats(data) {
    // Average daily focus
    const daysCount = Math.max(getDaysCount(currentTimeRange), 1);
    const totalMinutes = data.focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgMinutes = Math.round(totalMinutes / daysCount);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    document.getElementById('avgDailyFocus').textContent = `${avgHours}h ${avgMins}m`;

    // Peak productivity hour
    const peakHour = findPeakHour(data.focusSessions);
    document.getElementById('peakHour').textContent = peakHour;

    // Most focused day
    const bestDay = findBestDay(data.focusSessions);
    document.getElementById('bestDay').textContent = bestDay;

    // Blocked distractions
    document.getElementById('blockedCount').textContent = data.stats.blockedCount || 0;

    // Average session length
    const avgSession = data.focusSessions.length > 0 
        ? Math.round(totalMinutes / data.focusSessions.length)
        : 0;
    document.getElementById('avgSession').textContent = `${avgSession} min`;

    // Total sessions
    document.getElementById('totalSessions').textContent = data.focusSessions.length;
}

function updateRecentActivity(data) {
    const container = document.getElementById('activityList');
    
    // Combine sessions and distractions, sort by time
    const activities = [
        ...data.focusSessions.map(s => ({ ...s, type: 'focus' })),
        ...data.distractions.map(d => ({ ...d, type: 'distraction' }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    if (activities.length === 0) {
        container.innerHTML = '<p class="loading">No activity yet. Start a focus session!</p>';
        return;
    }

    container.innerHTML = activities.map(activity => {
        const icon = activity.type === 'focus' ? '🎯' : '⚠️';
        const title = activity.type === 'focus' 
            ? `Focus session (${activity.duration} min)`
            : `Distraction detected`;
        const details = activity.type === 'focus'
            ? activity.goal || 'General focus'
            : extractDomain(activity.url);
        const time = formatTimeAgo(activity.timestamp);

        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${title}</div>
                    <div class="activity-details">${details}</div>
                </div>
                <div class="activity-time">${time}</div>
            </div>
        `;
    }).join('');
}

// Helper functions
function groupByDay(items) {
    const groups = {};
    items.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
    });
    return groups;
}

function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return 'Unknown';
    }
}

function getDaysCount(range) {
    switch (range) {
        case 'today': return 1;
        case 'week': return 7;
        case 'month': return 30;
        default: return 30;
    }
}

function findPeakHour(sessions) {
    if (sessions.length === 0) return '--:--';
    
    const hourCounts = new Array(24).fill(0);
    sessions.forEach(session => {
        const hour = new Date(session.timestamp).getHours();
        hourCounts[hour] += session.duration;
    });
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    return `${peakHour.toString().padStart(2, '0')}:00`;
}

function findBestDay(sessions) {
    if (sessions.length === 0) return '---';
    
    const dayTotals = groupByDay(sessions);
    const bestDay = Object.entries(dayTotals)
        .map(([day, sessions]) => ({
            day,
            total: sessions.reduce((sum, s) => sum + s.duration, 0)
        }))
        .sort((a, b) => b.total - a.total)[0];
    
    return bestDay ? bestDay.day : '---';
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function exportData() {
    getStoredData().then(data => {
        const exportObj = {
            exportDate: new Date().toISOString(),
            timeRange: currentTimeRange,
            data: data
        };
        
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dopamine-down-stats-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        chrome.storage.local.set({
            focusSessions: [],
            distractions: [],
            stats: {
                totalFocusTime: 0,
                totalDistractions: 0,
                currentStreak: 0,
                bestStreak: 0,
                blockedCount: 0
            }
        }, () => {
            loadStats();
            alert('Statistics have been reset.');
        });
    }
}
