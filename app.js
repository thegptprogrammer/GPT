const storageKey = "attendance-management-data";

const state = {
  role: "",
  activeEmployeeId: "",
  employees: [],
  attendance: [],
  advances: [],
  remarks: [],
  payrolls: [],
  holidays: [],
};

const elements = {
  role: document.getElementById("role"),
  employeeSelect: document.getElementById("employee-select"),
  signIn: document.getElementById("sign-in"),
  signInStatus: document.getElementById("sign-in-status"),
  businessPanel: document.getElementById("business-panel"),
  employeePanel: document.getElementById("employee-panel"),
  employeeForm: document.getElementById("employee-form"),
  attendanceForm: document.getElementById("attendance-form"),
  attendanceSummary: document.getElementById("attendance-summary"),
  advanceForm: document.getElementById("advance-form"),
  advanceSummary: document.getElementById("advance-summary"),
  remarkForm: document.getElementById("remark-form"),
  remarkSummary: document.getElementById("remark-summary"),
  payrollForm: document.getElementById("payroll-form"),
  payrollSummary: document.getElementById("payroll-summary"),
  holidayForm: document.getElementById("holiday-form"),
  holidaySummary: document.getElementById("holiday-summary"),
  employeeStatusList: document.getElementById("employee-status-list"),
  selfAttendanceForm: document.getElementById("self-attendance-form"),
  employeeSummary: document.getElementById("employee-summary"),
  attendanceEmployee: document.getElementById("attendance-employee"),
  advanceEmployee: document.getElementById("advance-employee"),
  remarkEmployee: document.getElementById("remark-employee"),
  payrollEmployee: document.getElementById("payroll-employee"),
};

const loadState = () => {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    return;
  }
  const parsed = JSON.parse(data);
  Object.assign(state, parsed);
};

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const formatHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    return "-";
  }
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  const minutes = outH * 60 + outM - (inH * 60 + inM);
  if (Number.isNaN(minutes) || minutes <= 0) {
    return "-";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const getEmployeeOptions = () =>
  state.employees
    .map(
      (employee) =>
        `<option value="${employee.id}">${employee.name} (${employee.designation})</option>`
    )
    .join("");

const refreshEmployeeDropdowns = () => {
  const options = getEmployeeOptions();
  [
    elements.employeeSelect,
    elements.attendanceEmployee,
    elements.advanceEmployee,
    elements.remarkEmployee,
    elements.payrollEmployee,
  ].forEach((select) => {
    select.innerHTML = options || "<option value=\"\">No employees</option>";
  });
};

const updateSignInPanel = () => {
  const role = elements.role.value;
  document.getElementById("employee-select-wrapper").hidden = role !== "employee";
};

const signIn = () => {
  state.role = elements.role.value;
  state.activeEmployeeId = elements.employeeSelect.value;
  const signedInAs =
    state.role === "business"
      ? "Business account"
      : getEmployeeById(state.activeEmployeeId)?.name || "Employee";
  elements.signInStatus.textContent = `Signed in as ${signedInAs}.`;
  elements.businessPanel.hidden = state.role !== "business";
  elements.employeePanel.hidden = state.role !== "employee";
  if (state.role === "employee") {
    renderEmployeeSummary();
  }
  saveState();
};

const getEmployeeById = (id) => state.employees.find((employee) => employee.id === id);

const addEmployee = (event) => {
  event.preventDefault();
  const newEmployee = {
    id: crypto.randomUUID(),
    name: document.getElementById("emp-name").value,
    mobile: document.getElementById("emp-mobile").value,
    joinDate: document.getElementById("emp-join").value,
    dob: document.getElementById("emp-dob").value,
    designation: document.getElementById("emp-designation").value,
    email: document.getElementById("emp-email").value,
    salary: Number(document.getElementById("emp-salary").value),
    leavesAllowed: Number(document.getElementById("emp-leaves").value),
    workingDays: Number(document.getElementById("emp-working").value),
    status: "active",
  };
  state.employees.push(newEmployee);
  event.target.reset();
  refreshEmployeeDropdowns();
  renderEmployeeStatus();
  saveState();
};

const addAttendance = (event) => {
  event.preventDefault();
  const record = {
    id: crypto.randomUUID(),
    employeeId: elements.attendanceEmployee.value,
    date: document.getElementById("attendance-date").value,
    checkIn: document.getElementById("check-in").value,
    checkOut: document.getElementById("check-out").value,
    status: document.getElementById("attendance-status").value,
  };
  state.attendance.push(record);
  event.target.reset();
  renderAttendanceSummary();
  saveState();
};

const addAdvance = (event) => {
  event.preventDefault();
  const record = {
    id: crypto.randomUUID(),
    employeeId: elements.advanceEmployee.value,
    amount: Number(document.getElementById("advance-amount").value),
    date: document.getElementById("advance-date").value,
  };
  state.advances.push(record);
  event.target.reset();
  renderAdvanceSummary();
  saveState();
};

const addRemark = (event) => {
  event.preventDefault();
  const record = {
    id: crypto.randomUUID(),
    employeeId: elements.remarkEmployee.value,
    date: document.getElementById("remark-date").value,
    remark: document.getElementById("remark-text").value,
  };
  state.remarks.push(record);
  event.target.reset();
  renderRemarkSummary();
  saveState();
};

const addPayroll = (event) => {
  event.preventDefault();
  const record = {
    id: crypto.randomUUID(),
    employeeId: elements.payrollEmployee.value,
    period: document.getElementById("payroll-period").value,
    amount: Number(document.getElementById("payroll-amount").value),
  };
  state.payrolls.push(record);
  event.target.reset();
  renderPayrollSummary();
  saveState();
};

const addHoliday = (event) => {
  event.preventDefault();
  const record = {
    id: crypto.randomUUID(),
    date: document.getElementById("holiday-date").value,
    name: document.getElementById("holiday-name").value,
  };
  state.holidays.push(record);
  event.target.reset();
  renderHolidaySummary();
  saveState();
};

const renderAttendanceSummary = () => {
  const grouped = state.attendance.reduce(
    (acc, record) => {
      acc.total += 1;
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    },
    { total: 0, present: 0, absent: 0, halfday: 0, holiday: 0 }
  );
  elements.attendanceSummary.innerHTML = `
    <p>Total records: ${grouped.total}</p>
    <p>Present: ${grouped.present} | Absent: ${grouped.absent} | Half days: ${grouped.halfday} | Holidays: ${grouped.holiday}</p>
  `;
};

const renderAdvanceSummary = () => {
  const total = state.advances.reduce((sum, record) => sum + record.amount, 0);
  elements.advanceSummary.innerHTML = `<p>Total advances: ${state.advances.length} | Amount: ${total.toFixed(
    2
  )}</p>`;
};

const renderRemarkSummary = () => {
  elements.remarkSummary.innerHTML = `<p>Total remarks: ${state.remarks.length}</p>`;
};

const renderPayrollSummary = () => {
  const total = state.payrolls.reduce((sum, record) => sum + record.amount, 0);
  elements.payrollSummary.innerHTML = `<p>Payrolls: ${state.payrolls.length} | Total payout: ${total.toFixed(
    2
  )}</p>`;
};

const renderHolidaySummary = () => {
  elements.holidaySummary.innerHTML = `
    <ul>
      ${state.holidays
        .map((holiday) => `<li>${holiday.date} — ${holiday.name}</li>`)
        .join("")}
    </ul>
  `;
};

const renderEmployeeStatus = () => {
  if (!state.employees.length) {
    elements.employeeStatusList.innerHTML = `<p class="muted">No employees added yet.</p>`;
    return;
  }
  elements.employeeStatusList.innerHTML = `
    <div class="status-list">
      ${state.employees
        .map(
          (employee) => `
        <div class="status-item">
          <div>
            <strong>${employee.name}</strong>
            <div class="muted">${employee.designation} · ${employee.email}</div>
          </div>
          <div>
            <span class="tag">${employee.status}</span>
            <button data-action="toggle" data-id="${employee.id}">
              ${employee.status === "active" ? "Mark inactive" : "Mark active"}
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
};

const renderEmployeeSummary = () => {
  const employee = getEmployeeById(state.activeEmployeeId);
  if (!employee) {
    elements.employeeSummary.innerHTML = `<p class="muted">Select an employee to view summary.</p>`;
    return;
  }
  const attendanceRecords = state.attendance.filter(
    (record) => record.employeeId === employee.id
  );
  const advances = state.advances.filter((record) => record.employeeId === employee.id);
  const remarks = state.remarks.filter((record) => record.employeeId === employee.id);
  const payrolls = state.payrolls.filter((record) => record.employeeId === employee.id);
  const totals = attendanceRecords.reduce(
    (acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    },
    { present: 0, absent: 0, halfday: 0, holiday: 0 }
  );
  const latestAttendance = attendanceRecords[attendanceRecords.length - 1];
  elements.employeeSummary.innerHTML = `
    <p><strong>${employee.name}</strong> · ${employee.designation}</p>
    <p>Status: ${employee.status}</p>
    <p>Attendance — Present: ${totals.present}, Absent: ${totals.absent}, Half days: ${totals.halfday}, Holidays: ${totals.holiday}</p>
    <p>Latest working hours: ${latestAttendance ? formatHours(latestAttendance.checkIn, latestAttendance.checkOut) : "-"}</p>
    <p>Salary advances: ${advances.length}</p>
    <p>Remarks logged: ${remarks.length}</p>
    <p>Payroll entries: ${payrolls.length}</p>
  `;
};

const handleStatusToggle = (event) => {
  const button = event.target.closest("button[data-action='toggle']");
  if (!button) {
    return;
  }
  const employee = getEmployeeById(button.dataset.id);
  if (!employee) {
    return;
  }
  employee.status = employee.status === "active" ? "inactive" : "active";
  renderEmployeeStatus();
  saveState();
};

const addSelfAttendance = (event) => {
  event.preventDefault();
  if (!state.activeEmployeeId) {
    return;
  }
  const record = {
    id: crypto.randomUUID(),
    employeeId: state.activeEmployeeId,
    date: document.getElementById("self-date").value,
    checkIn: document.getElementById("self-check-in").value,
    checkOut: document.getElementById("self-check-out").value,
    status: "present",
  };
  state.attendance.push(record);
  event.target.reset();
  renderEmployeeSummary();
  saveState();
};

const init = () => {
  loadState();
  refreshEmployeeDropdowns();
  renderAttendanceSummary();
  renderAdvanceSummary();
  renderRemarkSummary();
  renderPayrollSummary();
  renderHolidaySummary();
  renderEmployeeStatus();
  if (state.role) {
    elements.role.value = state.role;
    elements.employeeSelect.value = state.activeEmployeeId;
    signIn();
  }
};

elements.role.addEventListener("change", updateSignInPanel);
elements.signIn.addEventListener("click", signIn);
elements.employeeForm.addEventListener("submit", addEmployee);
elements.attendanceForm.addEventListener("submit", addAttendance);
elements.advanceForm.addEventListener("submit", addAdvance);
elements.remarkForm.addEventListener("submit", addRemark);
elements.payrollForm.addEventListener("submit", addPayroll);
elements.holidayForm.addEventListener("submit", addHoliday);
elements.employeeStatusList.addEventListener("click", handleStatusToggle);
elements.selfAttendanceForm.addEventListener("submit", addSelfAttendance);

updateSignInPanel();
init();
