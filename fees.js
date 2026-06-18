// LocalStorage data connect boards
let tenantsList = JSON.parse(localStorage.getItem("pg_tenants"));
let paymentsList = JSON.parse(localStorage.getItem("pg_payments"));

// Backup Default values agar database clean ho
if (!tenantsList || tenantsList.length === 0) {
    tenantsList = [
        { name: "Rahul Kumar", room: "101", phone: "9876543210", status: "Active" },
        { name: "Amit Sharma", room: "102", phone: "8765432109", status: "Active" }
    ];
    localStorage.setItem("pg_tenants", JSON.stringify(tenantsList));
}

if (!paymentsList || paymentsList.length === 0) {
    paymentsList = [
        { name: "Rahul Kumar", amount: "5500", month: "2026-05", status: "Paid" },
        { name: "Amit Sharma", amount: "4000", month: "2026-05", status: "Paid" }
    ];
    localStorage.setItem("pg_payments", JSON.stringify(paymentsList));
}

const tenantSelect = document.getElementById("tenantSelect");
const feesForm = document.getElementById("feesForm");
const feesTableBody = document.getElementById("feesTableBody");

// Dropdown Sync with original tenant database
function populateDropdown() {
    if (!tenantSelect) return;
    tenantSelect.innerHTML = '<option value="">-- Choose Tenant --</option>';
    
    tenantsList.forEach(tenant => {
        const option = document.createElement("option");
        option.value = tenant.name;
        option.innerText = `${tenant.name} (Room ${tenant.room})`;
        tenantSelect.appendChild(option);
    });
}

// Render dynamic invoices
function displayPayments() {
    if (!feesTableBody) return;
    feesTableBody.innerHTML = "";

    paymentsList.forEach(payment => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #e2e8f0";
        row.innerHTML = `
            <td style="padding: 15px;"><strong>${payment.name}</strong></td>
            <td style="padding: 15px; color:#2b6cb0; font-weight:bold;">₹${payment.amount}</td>
            <td style="padding: 15px;">${payment.month}</td>
            <td style="padding: 15px;"><span class="status-paid-badge"><i class="fa-solid fa-circle-check"></i> ${payment.status}</span></td>
        `;
        feesTableBody.appendChild(row);
    });
}

if (feesForm) {
    feesForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedTenant = tenantSelect.value;
        const amountPaid = document.getElementById("amountPaid").value.trim();
        const paymentMonth = document.getElementById("paymentMonth").value;

        const newPayment = {
            name: selectedTenant,
            amount: amountPaid,
            month: paymentMonth,
            status: "Paid"
        };

        paymentsList.push(newPayment);
        localStorage.setItem("pg_payments", JSON.stringify(paymentsList));
        feesForm.reset();
        displayPayments();
        alert("Invoice created successfully! 🧾");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateDropdown();
    displayPayments();
});