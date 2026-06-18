let roomsList = JSON.parse(localStorage.getItem("pg_rooms")) || [];
const roomForm = document.getElementById("roomForm");
const roomTableBody = document.getElementById("roomTableBody");

function displayRooms() {
    if (!roomTableBody) return;
    roomTableBody.innerHTML = "";

    const urlParams = new URLSearchParams(window.location.search);
    const filterType = urlParams.get('filter'); 

    const storedTenants = JSON.parse(localStorage.getItem("pg_tenants")) || [];

    roomsList.forEach((room, index) => {
        const activeTenantsInRoom = storedTenants.filter(t => 
            String(t.room).trim() === String(room.roomNo).trim() && t.status === "Booked"
        ).length;
        
        const bedsLeft = parseInt(room.sharing || 1) - activeTenantsInRoom;
        const isRoomFull = (bedsLeft <= 0);

        if (filterType === 'available' && isRoomFull) return;
        if (filterType === 'full' && !isRoomFull) return;

        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #edf2f7";
        
        const badgeColor = isRoomFull ? 'background: #fed7d7; color: #9b2c2c;' : 'background: #c6f6d5; color: #22543d;';
        const badgeText = isRoomFull ? 'Full' : 'Available';

        row.innerHTML = `
            <td style="padding: 12px;"><strong>Room ${room.roomNo}</strong></td>
            <td style="padding: 12px;">${room.type}</td>
            <td style="padding: 12px;">${room.sharing} Seater</td>
            <td style="padding: 12px;">${bedsLeft < 0 ? 0 : bedsLeft} Beds Left</td>
            <td style="padding: 12px;">₹${room.rent}</td>
            <td style="padding: 12px;"><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; ${badgeColor}">${badgeText}</span></td>
            <td style="padding: 12px;">
                <button onclick="deleteRoom(${index})" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-size: 16px;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        roomTableBody.appendChild(row);
    });
}

if (roomForm) {
    roomForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const roomNo = document.getElementById("roomNo").value.trim();
        const roomType = document.getElementById("roomType").value;
        const sharing = parseInt(document.getElementById("roomSharing").value);
        const rent = document.getElementById("roomRent").value.trim();

        const newRoom = {
            roomNo: roomNo,
            type: roomType,
            sharing: sharing,
            rent: rent,
            status: "Available"
        };

        roomsList.push(newRoom);
        localStorage.setItem("pg_rooms", JSON.stringify(roomsList));
        roomForm.reset();
        
        window.history.replaceState({}, document.title, window.location.pathname);
        displayRooms();
    });
}

window.deleteRoom = function(index) {
    if (confirm("Kya aap is room ko delete karna chahte hain?")) {
        roomsList.splice(index, 1);
        localStorage.setItem("pg_rooms", JSON.stringify(roomsList));
        displayRooms();
    }
}

// 🔥 LOGOUT ACTION FOR ROOMS PAGE
document.addEventListener("DOMContentLoaded", () => {
    displayRooms();
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