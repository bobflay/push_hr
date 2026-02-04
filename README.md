# Employee Attendance Analysis Dashboard

A comprehensive web-based dashboard for analyzing employee attendance data, check-ins, and leave requests.

## Files Created

1. **attendance_dashboard.html** - Main HTML file
2. **attendance_dashboard.css** - Styling and layout
3. **attendance_dashboard.js** - Data processing and interactivity
4. **data/attendance_data.json** - Processed employee data (auto-generated)

## Features

### Main Dashboard
- **Statistics Overview**: Quick stats showing total employees, average check-ins, employees with issues, and total leave days
- **Search & Filter**: Search by employee name or filter by department
- **Color-Coded Status**: Visual indicators for aligned employees vs. those with issues
- **Export to CSV**: Export filtered data to CSV for further analysis
- **Leave Request Cross-Referencing**: Automatically matches absences with approved leave requests from the HR system

### Employee Analysis
For each employee, the dashboard shows:
- **Days Checked In**: Days with full check-in/check-out records
- **Justified Absences**: Days absent WITH approved leave requests (shown in blue)
- **Unjustified Absences**: Days absent WITHOUT approved leave requests (shown in red)
- **Partial Check-ins**: Days with only one timestamp (either check-in or check-out)
- **Alignment Status**: Now based on unjustified absences only

### Alignment Logic
**The system automatically cross-references attendance data with approved leave requests from the HR system.**

- **Aligned**: ≤3 unjustified absences
- **Warning**: 4-8 unjustified absences
- **Issues**: More than 8 unjustified absences

**How it works:**
1. Identifies weekends (Saturday/Sunday) automatically
2. Identifies public holidays for Ivory Coast (Abidjan)
3. Cross-references with approved leave requests from "Classeur Absence.xlsx"
4. Classifies each absence as:
   - **Justified**: Employee requested and was approved for leave on this date
   - **Unjustified**: Employee was absent without approved leave request
5. Only unjustified absences count as issues

**Data Sources:**
- Attendance: `Pointage mensuel_20260204102038_export.xlsx` (check-in/check-out times)
- Leave Requests: `Classeur Absence.xlsx` (approved leave requests from managers and HR)
- Date range: November 2025 - January 2026 (92 total days, 63 working days, 27 weekend days, 5 public holidays)

**Public Holidays Marked:**
- November 1, 2025 (Saturday) - All Saints' Day
- November 15, 2025 (Saturday) - National Peace Day
- December 7, 2025 (Sunday) - Félix Houphouët-Boigny Remembrance Day
- December 25, 2025 (Thursday) - Christmas Day ⭐ Weekday Holiday
- January 1, 2026 (Thursday) - New Year's Day ⭐ Weekday Holiday

### Detailed View
Click "View Details" for any employee to see:
- Complete overview of attendance metrics including working days breakdown
- Leave breakdown by type (annual, sick, occasional)
- **Full calendar view** organized by month showing:
  - Actual dates with day of week
  - Color-coded status for each day
  - Check-in times displayed on the calendar
  - Proper calendar grid layout (Monday-Sunday)

### Color Coding
- **Green with green border**: Days checked in successfully
- **Yellow with orange border**: Partial check-ins (missing check-in or check-out)
- **Blue with blue border**: Justified absence (absent WITH approved leave request) ✅
- **Red with red border**: Unjustified absence (absent WITHOUT approved leave request) ⚠️
- **Gray with gray border**: Weekends (Saturday/Sunday)
- **Purple with purple border (🎉 icon)**: Public Holidays

## How to Use

### 1. Open the Dashboard
Simply open `attendance_dashboard.html` in a web browser:
```bash
open attendance_dashboard.html
```

Or double-click the HTML file in Finder.

### 2. Search and Filter
The dashboard includes comprehensive filtering and sorting options:

**Search:**
- Search by employee name, department, or employee ID
- Real-time search as you type

**Filters:**
- **Department Filter**: Show employees from specific departments only
- **Status Filter**: Filter by alignment status
  - All Statuses (default)
  - Aligned: Employees whose absences match their leave requests
  - Warning: Employees with 4-8 unexplained absences
  - Issues: Employees with more than 8 unexplained absences

**Sort Options:**
- Name (A-Z) - Default
- Name (Z-A)
- Most Check-ins
- Least Check-ins
- Most Absences
- Least Absences
- Most Issues - Shows employees with the highest number of unexplained absences first

**Reset Filters:**
- Click the "Reset Filters" button to clear all filters and return to default view

All filters work together - you can combine search, department, status, and sorting to find exactly what you need.

### 3. View Details
Click the "View Details" button for any employee to see:
- Complete attendance overview
- Leave request breakdown
- Daily attendance calendar (92 days)

### 4. Export Data
Click "Export to CSV" to download the current filtered data as a CSV file for use in Excel or other tools.

## Data Processing

The dashboard processes data from the Excel file (`Pointage mensuel_20260204102038_export.xlsx`) and:
- Extracts employee information (ID, name, department)
- Analyzes daily check-in patterns
- Calculates leave requests from various leave types
- Identifies alignment issues between absences and leave requests
- Converts leave minutes to days (assuming 480 minutes = 8-hour workday)

## Technical Details

### Data Structure
Each employee record contains:
```javascript
{
  "id": "1",
  "name": "EMPLOYEE NAME",
  "department": "DEPARTMENT",
  "checked_in_days": 50,
  "not_checked_in_days": 15,        // Excludes weekends
  "partial_check_days": 8,
  "weekend_days": 27,
  "total_working_days": 65,
  "days_off_requested": 2.5,
  "annual_leave_minutes": 480,
  "sick_leave_minutes": 240,
  "occasional_leave_minutes": 480,
  "daily_status": [
    {
      "day": 1,
      "date": "2025-11-01",
      "day_of_week": "Saturday",
      "day_of_month": 1,
      "month": "November",
      "is_weekend": true,
      "status": "weekend",
      "value": ""
    },
    {
      "day": 2,
      "date": "2025-11-03",
      "day_of_week": "Monday",
      "day_of_month": 3,
      "month": "November",
      "is_weekend": false,
      "status": "checked_in",
      "value": "06:44-19:19"
    },
    ...
  ]
}
```

### Check-in Status Types
- **checked_in**: Full check-in record with both times (e.g., "06:44-19:19")
- **partial**: Only one timestamp recorded (e.g., "06:53" or "17:35")
- **absent**: No check-in record on a weekday
- **weekend**: Saturday or Sunday (automatically detected and excluded from issues)

## Regenerating Data

If you update the Excel file, regenerate the JSON data by running:

```bash
python3 << 'EOF'
import pandas as pd
import json

# Read and process Excel file
file_path = 'data/Pointage mensuel_20260204102038_export.xlsx'
df = pd.read_excel(file_path, header=0)
df_data = df.iloc[1:].copy()

# [Processing code here - see the original Python script]

# Save to JSON
with open('data/attendance_data.json', 'w', encoding='utf-8') as f:
    json.dump(employees_data, f, ensure_ascii=False, indent=2)
EOF
```

## Browser Compatibility

The dashboard works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Notes

- The dashboard assumes a 480-minute (8-hour) workday for leave calculations
- **Weekends (Saturday/Sunday) and Public Holidays are automatically detected and excluded from absence counts**
- A 3-day buffer is included in the alignment check to account for edge cases
- The data covers 92 days total (November 2025 - January 2026):
  - 63 working days (weekdays excluding holidays)
  - 27 weekend days
  - 5 public holidays (3 fall on weekends, 2 on weekdays)
- Public holidays are based on Ivory Coast (Côte d'Ivoire) national holidays
- All times in the data are preserved from the original Excel file
- The calendar view displays actual dates organized by month with proper day-of-week alignment
- Public holidays are marked with a purple background and 🎉 icon

## Future Enhancements

Possible improvements:
- Add date range selection
- Include weekend detection (mark weekends automatically)
- Add charts and visualizations (graphs, pie charts)
- Import leave request data from PDF
- Add employee comparison view
- Generate detailed PDF reports
