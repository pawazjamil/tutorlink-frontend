const WEEKDAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const TIME_SLOTS = ['morning', 'afternoon', 'evening'];
const TIME_SLOT_NAMES = { morning: '9:00 AM - 12:00 PM', afternoon: '2:00 PM - 5:00 PM', evening: '7:00 PM - 10:00 PM' };

function initAvailabilityGrid() {
    const grid = document.getElementById('availabilityGrid');
    if (!grid) return;
    grid.innerHTML = '';
    WEEKDAYS.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-availability';
        dayDiv.innerHTML = `<h4>${day.charAt(0).toUpperCase() + day.slice(1)}</h4><div class="time-slots">${TIME_SLOTS.map(slot => `<label class="time-slot"><input type="checkbox" class="avail-${day}" value="${slot}"> ${TIME_SLOT_NAMES[slot]}</label>`).join('')}</div>`;
        grid.appendChild(dayDiv);
    });
}

function getAvailabilityFromForm() {
    const availability = {};
    WEEKDAYS.forEach(day => {
        availability[day] = [];
        TIME_SLOTS.forEach(slot => {
            if (document.querySelector(`.avail-${day}[value="${slot}"]`)?.checked) availability[day].push(slot);
        });
    });
    return availability;
}

function isTutorAvailable(tutor, day, timeSlot) {
    return tutor.availability && tutor.availability[day] && tutor.availability[day].includes(timeSlot);
}

function showTutorSchedule(tutorId) {
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return;
    let html = `<h3 class="gold-text" style="text-align: center;">${tutor.name}'s Weekly Schedule</h3><table class="schedule-table"><thead><tr><th>Day</th><th>Morning</th><th>Afternoon</th><th>Evening</th></tr></thead><tbody>`;
    WEEKDAYS.forEach(day => {
        html += `<tr><td><strong>${day.charAt(0).toUpperCase() + day.slice(1)}</strong></td>${TIME_SLOTS.map(slot => `<td style="color: ${isTutorAvailable(tutor, day, slot) ? '#00ff00' : '#ff4444'};">${isTutorAvailable(tutor, day, slot) ? '✓ Available' : '✗ Busy'}</td>`).join('')}</tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('scheduleContent').innerHTML = html;
    showModal('scheduleModal');
}

function openBookingModal(tutorId) {
    if (!currentUser) { showToast('Please login to book', 'error'); showModal('loginModal'); return; }
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return;
    currentBookingTutor = tutor;
    document.getElementById('bookingTutorInfo').innerHTML = `<h3>${tutor.name}</h3><p class="gold-text">${tutor.subject} Tutor</p><div class="stars">${getStarHTML(tutor.rating)}</div>`;
    document.getElementById('baseRate').textContent = tutor.baseRate;
    document.getElementById('perDayRate').textContent = tutor.perDayRate;
    document.getElementById('extraDays').textContent = '0';
    document.getElementById('totalFee').textContent = tutor.baseRate;
    document.getElementById('bookingDays').value = '4';
    showModal('bookingModal');
}

function calculateMonthlyFee() {
    const baseRate = parseFloat(document.getElementById('baseRate')?.textContent || 3000);
    const perDayRate = parseFloat(document.getElementById('perDayRate')?.textContent || 500);
    const selectedDays = parseInt(document.getElementById('bookingDays')?.value || 4);
    const extraDays = Math.max(0, selectedDays - 4);
    const totalFee = baseRate + (extraDays * perDayRate);
    document.getElementById('extraDays').textContent = extraDays;
    document.getElementById('totalFee').textContent = totalFee;
    return totalFee;
}

function confirmBooking() {
    if (!currentBookingTutor || !currentUser) return;
    const daysPerWeek = document.getElementById('bookingDays').value;
    const preferredTime = document.getElementById('bookingTime').value;
    const totalFee = document.getElementById('totalFee').textContent;
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push({ id: Date.now(), tutorId: currentBookingTutor.id, tutorName: currentBookingTutor.name, subject: currentBookingTutor.subject, daysPerWeek, preferredTime, monthlyFee: totalFee, studentName: currentUser.name, bookingDate: new Date().toLocaleDateString(), status: 'confirmed' });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    showToast(`Booking confirmed! Monthly fee: ৳${totalFee}`, 'success');
    closeModal('bookingModal');
}