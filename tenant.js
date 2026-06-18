let tenantsList = JSON.parse(localStorage.getItem("pg_tenants")) || [];
let roomsList = JSON.parse(localStorage.getItem("pg_rooms")) || [];

function getCurrentTimestamp() {
    const now = new Date();
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;

    return `${date}-${month}-${year} | ${strTime}`;
}

const tenantForm = document.getElementById("tenantForm");
const tenantTableBody = document.getElementById("tenantTableBody");
const tenantRoomSelect = document.getElementById("tenantRoom");

function updateRoomDropdown() {
    if (!tenantRoomSelect) return;
    tenantRoomSelect.innerHTML = '<option value="" disabled selected>-- Choose Room --</option>';

    roomsList.forEach(room => {
        const activeTenantsInRoom = tenantsList.filter(t => 
            String(t.room).trim() === String(room.roomNo).trim() && t.status === "Booked"
        ).length;
        
        const bedsLeft = parseInt(room.sharing || 1) - activeTenantsInRoom;

        if (bedsLeft > 0) {
            const option = document.createElement("option");
            option.value = room.roomNo;
            option.textContent = `Room ${room.roomNo} (${room.type} - ${bedsLeft} Beds Left)`;
            tenantRoomSelect.appendChild(option);
        }
    });
}

function displayTenants() {
    if (!tenantTableBody) return;
    tenantTableBody.innerHTML = "";

    tenantsList.forEach((tenant, index) => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #edf2f7";

        let statusBadge = '';
        let actionButton = '';
        let bookingTime = tenant.bookedAt ? tenant.bookedAt : '--';
        let checkoutTime = tenant.checkedOutAt ? tenant.checkedOutAt : '--';

        if (tenant.status === "Booked") {
            statusBadge = `<span style="background:#c6f6d5; color:#22543d; padding:5px 8px; border-radius:5px; font-size:12px; font-weight:bold;"><i class="fa-solid fa-circle-check"></i> Booked</span>`;
            actionButton = `
                <button onclick="checkoutTenant(${index})" style="background:#fff5f5; border:1px solid #fed7d7; color:#e53e3e; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer; font-size:12px; transition:0.2s;" onmouseover="this.style.background='#fed7d7'" onmouseout="this.style.background='#fff5f5'">
                    <i class="fa-solid fa-door-open"></i> Checkout
                </button>
            `;
        } else {
            statusBadge = `<span style="background:#edf2f7; color:#4a5568; padding:5px 8px; border-radius:5px; font-size:12px; font-weight:bold;"><i class="fa-solid fa-person-walking-arrow-right"></i> Checked Out</span>`;
            actionButton = `<span style="color: #a0aec0; font-size: 12px; font-style: italic;"><i class="fa-solid fa-clock-rotate-left"></i> Left PG</span>`;
        }

        row.innerHTML = `
            <td style="padding: 12px;"><strong>${tenant.name}</strong></td>
            <td style="padding: 12px;"><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-weight: 600;">Room ${tenant.room}</span></td>
            <td style="padding: 12px;">${tenant.phone}</td>
            <td style="padding: 12px; font-size: 13px; color: #4a5568;">${bookingTime}</td>
            <td style="padding: 12px; font-size: 13px; color: #e53e3e; font-weight: 500;">${checkoutTime}</td>
            <td style="padding: 12px;">${statusBadge}</td>
            <td style="padding: 12px; text-align: center;">${actionButton}</td>
        `;
        tenantTableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    displayTenants();
    updateRoomDropdown();

    const nameInput = document.getElementById("tenantName");
    const phoneInput = document.getElementById("tenantPhone");

    if (nameInput) {
        nameInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            let words = value.split(" ");
            for (let i = 0; i < words.length; i++) {
                if (words[i].length > 0) {
                    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
                }
            }
            e.target.value = words.join(" ");
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
    }

    // 🔥 LOGOUT ACTION FOR TENANTS PAGE
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Kya aap sach me logout karna chahte hain?")) {
                localStorage.removeItem("isLoggedIn");
                window.location.href = "login.html";
            }
        });
    }
});

if (tenantForm) {
    tenantForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("tenantName").value.trim();
        const roomNo = document.getElementById("tenantRoom").value;
        const phone = document.getElementById("tenantPhone").value.trim();

        if (!roomNo) {
            alert("Please select a room!");
            return;
        }
        if (phone.length !== 10) {
            alert("Phone number must be 10 digits!");
            return;
        }

        const newTenant = {
            name: name,
            room: roomNo,
            phone: phone,
            status: "Booked",
            bookedAt: getCurrentTimestamp(),
            checkedOutAt: ""
        };

        tenantsList.push(newTenant);
        localStorage.setItem("pg_tenants", JSON.stringify(tenantsList));

        tenantForm.reset();
        displayTenants();
        updateRoomDropdown();

        alert(`🎉 Booked successfully at ${newTenant.bookedAt}`);
    });
}

window.checkoutTenant = function(index) {
    const tenantName = tenantsList[index].name;

    if (confirm(`Kya aap confirm karte hain ki ${tenantName} room chhor rahe hain?`)) {
        tenantsList[index].status = "Checked Out";
        tenantsList[index].checkedOutAt = getCurrentTimestamp();
        
        localStorage.setItem("pg_tenants", JSON.stringify(tenantsList));
        
        displayTenants();
        updateRoomDropdown();

        alert(`🚪 Checked out completed at ${tenantsList[index].checkedOutAt}`);
    }
}