// Global variables
let employeesData = [];
let filteredData = [];

// Decryption function
function decryptData(encryptedData, password) {
    try {
        // Split IV and encrypted data
        const parts = encryptedData.split(':');
        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encrypted = parts[1];

        // Derive key from password using same method as Node.js scrypt
        // For simplicity, we'll use PBKDF2 which is available in CryptoJS
        const key = CryptoJS.PBKDF2(password, 'salt', {
            keySize: 256/32,
            iterations: 1000
        });

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Hex.parse(encrypted) },
            key,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data. Invalid password or corrupted data.');
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch encrypted data
        const response = await fetch('data/attendance_data_encrypted.txt');
        const encryptedData = await response.text();

        // Decrypt with password
        const password = 'hr@push2026';
        const decryptedJson = decryptData(encryptedData, password);

        // Parse JSON
        employeesData = JSON.parse(decryptedJson);
        filteredData = [...employeesData];

        initializeDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load attendance data. Please make sure the data file exists.');
    }
});

// Initialize dashboard
function initializeDashboard() {
    populateDepartmentFilter();
    updateStatistics();
    renderTable();
    setupEventListeners();
}

// Populate department filter dropdown
function populateDepartmentFilter() {
    const departments = [...new Set(employeesData.map(emp => emp.department))].sort();
    const filterSelect = document.getElementById('departmentFilter');

    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        filterSelect.appendChild(option);
    });
}

// Update statistics cards
function updateStatistics() {
    const totalEmployees = filteredData.length;
    const avgCheckIns = filteredData.reduce((sum, emp) => sum + emp.checked_in_days, 0) / totalEmployees || 0;
    const employeesWithIssues = filteredData.filter(emp => hasAlignmentIssues(emp)).length;
    const totalLeaveRequests = filteredData.reduce((sum, emp) => sum + emp.days_off_requested, 0);

    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('avgCheckIns').textContent = Math.round(avgCheckIns);
    document.getElementById('employeesWithIssues').textContent = employeesWithIssues;
    document.getElementById('totalLeaveRequests').textContent = Math.round(totalLeaveRequests);
}

// Check if employee has alignment issues
function hasAlignmentIssues(employee) {
    // Use unjustified absences (absences without approved leave requests)
    const unjustifiedAbsences = employee.unjustified_absences || 0;
    return unjustifiedAbsences > 3; // Small buffer for edge cases
}

// Get alignment status based on unjustified absences
function getAlignmentStatus(employee) {
    const unjustifiedAbsences = employee.unjustified_absences || 0;

    if (unjustifiedAbsences <= 3) {
        return { status: 'aligned', text: 'Aligned', class: 'status-aligned' };
    } else if (unjustifiedAbsences <= 8) {
        return { status: 'warning', text: `${Math.round(unjustifiedAbsences)} unjustified absences`, class: 'status-warning' };
    } else {
        return { status: 'issues', text: `${Math.round(unjustifiedAbsences)} unjustified absences`, class: 'status-issues' };
    }
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    filteredData.forEach(employee => {
        const row = document.createElement('tr');
        const alignment = getAlignmentStatus(employee);

        const justifiedAbsences = employee.justified_absences || 0;
        const unjustifiedAbsences = employee.unjustified_absences || 0;

        row.innerHTML = `
            <td>${employee.id}</td>
            <td><strong>${employee.name}</strong></td>
            <td>${employee.department}</td>
            <td><span style="color: #10b981; font-weight: 600;">${employee.checked_in_days}</span></td>
            <td><span style="color: #6366f1; font-weight: 600;" title="Absences with approved leave requests">${justifiedAbsences}</span></td>
            <td><span style="color: #ef4444; font-weight: 600;" title="Absences without approved leave requests">${unjustifiedAbsences}</span></td>
            <td><span style="color: #f59e0b; font-weight: 600;">${employee.partial_check_days}</span></td>
            <td><span class="status-badge ${alignment.class}">${alignment.text}</span></td>
            <td><button class="btn-view" onclick="showDetails('${employee.id}')">View Details</button></td>
        `;

        tbody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', applyFilters);

    // Department filter
    document.getElementById('departmentFilter').addEventListener('change', applyFilters);

    // Status filter
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    // Sort by
    document.getElementById('sortBy').addEventListener('change', applyFilters);

    // Reset filters
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);

    // Modal close button
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('detailModal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('detailModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Apply all filters and sorting
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const status = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter data
    filteredData = employeesData.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm) ||
                            emp.department.toLowerCase().includes(searchTerm) ||
                            emp.id.toString().includes(searchTerm);
        const matchesDepartment = !department || emp.department === department;

        let matchesStatus = true;
        if (status) {
            const alignment = getAlignmentStatus(emp);
            matchesStatus = alignment.status === status;
        }

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Sort data
    sortData(sortBy);

    updateStatistics();
    renderTable();
}

// Sort filtered data
function sortData(sortBy) {
    switch(sortBy) {
        case 'name':
            filteredData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredData.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'checked-in-desc':
            filteredData.sort((a, b) => b.checked_in_days - a.checked_in_days);
            break;
        case 'checked-in-asc':
            filteredData.sort((a, b) => a.checked_in_days - b.checked_in_days);
            break;
        case 'absences-desc':
            filteredData.sort((a, b) => b.not_checked_in_days - a.not_checked_in_days);
            break;
        case 'absences-asc':
            filteredData.sort((a, b) => a.not_checked_in_days - b.not_checked_in_days);
            break;
        case 'issues-desc':
            filteredData.sort((a, b) => {
                const issuesA = a.not_checked_in_days - a.days_off_requested;
                const issuesB = b.not_checked_in_days - b.days_off_requested;
                return issuesB - issuesA;
            });
            break;
        default:
            // Default to name sorting
            filteredData.sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortBy').value = 'name';
    applyFilters();
}

// Show employee details in modal
function showDetails(employeeId) {
    const employee = employeesData.find(emp => emp.id === employeeId);
    if (!employee) return;

    const alignment = getAlignmentStatus(employee);

    // Update modal content
    document.getElementById('modalEmployeeName').textContent = `${employee.name} (ID: ${employee.id})`;

    // Overview section
    const overview = `
        <div class="detail-item">
            <span class="detail-label">Department:</span>
            <span class="detail-value">${employee.department}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Total Working Days:</span>
            <span class="detail-value">${employee.total_working_days}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Days Checked In:</span>
            <span class="detail-value" style="color: #10b981;">${employee.checked_in_days}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Partial Check-ins:</span>
            <span class="detail-value" style="color: #f59e0b;">${employee.partial_check_days}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Total Absences (excluding weekends & holidays):</span>
            <span class="detail-value" style="color: #6b7280;">${employee.not_checked_in_days}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Justified Absences (with approved leave):</span>
            <span class="detail-value" style="color: #6366f1;">${employee.justified_absences || 0}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Unjustified Absences (without approved leave):</span>
            <span class="detail-value" style="color: #ef4444;">${employee.unjustified_absences || 0}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Weekend Days:</span>
            <span class="detail-value" style="color: #9ca3af;">${employee.weekend_days}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Public Holidays:</span>
            <span class="detail-value" style="color: #8b5cf6;">${employee.holiday_days}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Alignment Status:</span>
            <span class="status-badge ${alignment.class}">${alignment.text}</span>
        </div>
    `;
    document.getElementById('modalOverview').innerHTML = overview;

    // Leave breakdown section
    const leaveBreakdown = `
        <div class="detail-item">
            <span class="detail-label">Annual Leave:</span>
            <span class="detail-value">${(employee.annual_leave_minutes / 60).toFixed(1)} hours</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Sick Leave:</span>
            <span class="detail-value">${(employee.sick_leave_minutes / 60).toFixed(1)} hours</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Occasional Leave:</span>
            <span class="detail-value">${(employee.occasional_leave_minutes / 60).toFixed(1)} hours</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Total Leave:</span>
            <span class="detail-value"><strong>${((employee.annual_leave_minutes + employee.sick_leave_minutes + employee.occasional_leave_minutes) / 60).toFixed(1)} hours</strong></span>
        </div>
    `;
    document.getElementById('modalLeaveBreakdown').innerHTML = leaveBreakdown;

    // Daily attendance calendar
    // Group days by month
    const monthGroups = {};
    employee.daily_status.forEach(day => {
        if (!monthGroups[day.month]) {
            monthGroups[day.month] = [];
        }
        monthGroups[day.month].push(day);
    });

    // Create calendar view
    let calendarHTML = '';
    Object.keys(monthGroups).forEach(month => {
        const days = monthGroups[month];

        calendarHTML += `
            <div class="month-section">
                <h4 class="month-header">${month} ${days[0].date.split('-')[0]}</h4>
                <div class="calendar-grid">
                    <div class="calendar-weekday">Mon</div>
                    <div class="calendar-weekday">Tue</div>
                    <div class="calendar-weekday">Wed</div>
                    <div class="calendar-weekday">Thu</div>
                    <div class="calendar-weekday">Fri</div>
                    <div class="calendar-weekday">Sat</div>
                    <div class="calendar-weekday">Sun</div>
        `;

        // Get the first day of the month to know where to start
        const firstDay = new Date(days[0].date);
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
        const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday = 0

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startOffset; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Add day cells
        days.forEach(day => {
            let className = 'calendar-day ';
            let title = `${day.day_of_week}, ${day.month} ${day.day_of_month}: `;

            if (day.status === 'holiday') {
                className += 'day-holiday';
                title += `Public Holiday - ${day.holiday_name}`;
                if (day.value) title += ` (Checked in: ${day.value})`;
            } else if (day.status === 'weekend') {
                className += 'day-weekend';
                title += day.value ? `Weekend - Checked in (${day.value})` : 'Weekend';
            } else if (day.status === 'checked_in') {
                className += 'day-checked-in';
                title += `Checked in (${day.value})`;
            } else if (day.status === 'partial') {
                className += 'day-partial';
                title += `Partial check-in (${day.value})`;
            } else if (day.status === 'justified_absence') {
                className += 'day-justified-absence';
                title += 'Justified Absence (approved leave request)';
            } else if (day.status === 'unjustified_absence') {
                className += 'day-unjustified-absence';
                title += 'Unjustified Absence (no leave request)';
            } else {
                className += 'day-absent';
                title += 'No check-in';
            }

            const displayText = day.status === 'holiday' ? '🎉' : '';

            calendarHTML += `
                <div class="${className}" title="${title}">
                    <div class="calendar-day-number">${day.day_of_month}</div>
                    ${displayText ? `<div style="font-size: 1.2rem;">${displayText}</div>` : ''}
                    ${day.value ? `<div class="calendar-day-time">${day.value.split('-')[0] || day.value}</div>` : ''}
                </div>
            `;
        });

        calendarHTML += '</div></div>';
    });

    document.getElementById('modalDailyAttendance').innerHTML = calendarHTML;

    // Show modal
    document.getElementById('detailModal').style.display = 'block';
}

// Export data to CSV
function exportToCSV() {
    const headers = [
        'Employee ID',
        'Name',
        'Department',
        'Total Working Days',
        'Days Checked In',
        'Total Absences',
        'Justified Absences (with approved leave)',
        'Unjustified Absences (without approved leave)',
        'Partial Check-ins',
        'Weekend Days',
        'Public Holidays',
        'Annual Leave (hours)',
        'Sick Leave (hours)',
        'Occasional Leave (hours)',
        'Alignment Status'
    ];

    const rows = filteredData.map(emp => {
        const alignment = getAlignmentStatus(emp);

        return [
            emp.id,
            emp.name,
            emp.department,
            emp.total_working_days,
            emp.checked_in_days,
            emp.not_checked_in_days,
            emp.justified_absences || 0,
            emp.unjustified_absences || 0,
            emp.partial_check_days,
            emp.weekend_days,
            emp.holiday_days || 0,
            (emp.annual_leave_minutes / 60).toFixed(1),
            (emp.sick_leave_minutes / 60).toFixed(1),
            (emp.occasional_leave_minutes / 60).toFixed(1),
            alignment.text
        ];
    });

    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
