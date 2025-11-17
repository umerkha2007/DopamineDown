# Stats Page

This folder contains the statistics and analytics page for the Dopamine Down extension.

## Files

- **stats.html** - Main statistics page with comprehensive data visualization
- **stats.css** - Styling with dark theme and responsive design
- **stats.js** - JavaScript for data processing, chart rendering, and statistics calculations

## Features

### Summary Cards
- **Focus Time** - Total focus time with trend comparison
- **Distractions** - Number of distractions detected
- **Current Streak** - Days of consecutive focus sessions
- **Productivity Score** - Calculated score based on focus time and distractions

### Charts
- **Focus Time Trend** - Line chart showing focus time over selected period
- **Distractions Over Time** - Bar chart of daily distractions
- **Top Distracting Sites** - Doughnut chart of most frequently visited distraction sites
- **Daily Activity Heatmap** - Visual representation of focus activity over the last 28 days

### Detailed Breakdown
- Average daily focus time
- Peak productivity hour
- Most focused day
- Blocked distractions count
- Average session length
- Total sessions

### Recent Activity
- Timeline of recent focus sessions and distractions
- Timestamps and details for each activity

### Additional Features
- **Time Range Selector** - View stats for today, this week, this month, or all time
- **Export Data** - Download all statistics as JSON file
- **Reset Statistics** - Clear all stored data

## Data Storage

All data is stored locally in Chrome's storage API:
- `focusSessions` - Array of completed focus sessions
- `distractions` - Array of detected distractions
- `stats` - Global statistics (streaks, totals, etc.)

## Dependencies

- **Chart.js 4.4.0** - Loaded from CDN for chart rendering
- No other external dependencies required

## Usage

Access the stats page by clicking the "View Stats" button in the extension popup, or by opening `chrome-extension://[extension-id]/stats/stats.html` directly.

## Privacy

All data is stored locally in your browser and never transmitted to external servers. Your browsing statistics remain completely private.
