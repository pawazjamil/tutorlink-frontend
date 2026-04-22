// Load tutors from localStorage or use default data
let tutors = [];

function loadTutors() {
    const stored = localStorage.getItem('tutors');
    if (stored) {
        tutors = JSON.parse(stored);
    } else {
        tutors = [...tutorsData];
        saveTutors();
    }
    displayTutors();
}

function saveTutors() {
    localStorage.setItem('tutors', JSON.stringify(tutors));
}

function getStarHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return stars;
}

function createTutorCard(tutor) {
    const card = document.createElement('div');
    card.className = 'tutor-card';
    const stars = getStarHTML(tutor.rating);
    
    card.innerHTML = `
        <div class="tutor-header">
            <div class="tutor-avatar">${tutor.avatar}</div>
            <h3>${tutor.name}</h3>
            <p>${tutor.subject} Specialist</p>
        </div>
        <div class="tutor-body">
            <div class="tutor-info">
                <p><i class="fas fa-map-marker-alt"></i> ${tutor.location}</p>
                <p><i class="fas fa-graduation-cap"></i> ${tutor.qualification.substring(0, 35)}...</p>
                <p><i class="fas fa-briefcase"></i> ${tutor.experience}+ years exp.</p>
                <p><i class="fas fa-calendar-alt"></i> <span style="color: var(--gold);">4 days: ৳${tutor.baseRate}</span></p>
                <p><i class="fas fa-chart-line"></i> Extra day: +৳${tutor.perDayRate}</p>
            </div>
            <div class="tutor-rating">
                <span class="stars">${stars}</span>
                <span>(${tutor.totalRatings} reviews)</span>
            </div>
            <div class="tutor-actions">
                <button class="btn-view" onclick="viewTutor(${tutor.id})"><i class="fas fa-eye"></i> Profile</button>
                <button class="btn-rate" onclick="openBookingModal(${tutor.id})"><i class="fas fa-calendar-check"></i> Book</button>
                <button class="btn-rate" onclick="openRatingModal(${tutor.id})"><i class="fas fa-star"></i> Rate</button>
            </div>
        </div>
    `;
    return card;
}

function displayTutors() {
    const container = document.getElementById('tutorsList');
    if (!container) return;
    container.innerHTML = '';
    tutors.forEach(tutor => container.appendChild(createTutorCard(tutor)));
}

function displayFilteredTutors(filtered) {
    const container = document.getElementById('tutorsList');
    container.innerHTML = '';
    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align: center; grid-column: 1/-1; padding: 3rem;"><i class="fas fa-search" style="font-size: 3rem; color: var(--gold);"></i><h3>No tutors found</h3><p style="color: var(--text-gray);">Try adjusting your filters</p></div>`;
        return;
    }
    filtered.forEach(t => container.appendChild(createTutorCard(t)));
}

function searchTutors() {
    const subject = document.getElementById('searchSubject').value.toLowerCase();
    const location = document.getElementById('searchLocation').value.toLowerCase();
    const filtered = tutors.filter(t => {
        const matchSubject = !subject || t.subject.toLowerCase().includes(subject);
        const matchLocation = !location || t.location.toLowerCase().includes(location);
        return matchSubject && matchLocation;
    });
    displayFilteredTutors(filtered);
    showToast(`Found ${filtered.length} tutors`, 'info');
}

function filterSubject(subject) {
    document.getElementById('searchSubject').value = subject;
    searchTutors();
}

function filterBySubject() {
    const subject = document.getElementById('filterSubject').value;
    if (subject) {
        displayFilteredTutors(tutors.filter(t => t.subject === subject));
    } else {
        displayTutors();
    }
}

function filterByDay() {
    const day = document.getElementById('filterDay').value;
    if (!day) { displayTutors(); return; }
    displayFilteredTutors(tutors.filter(t => t.availability && t.availability[day] && t.availability[day].length > 0));
    showToast(`Showing tutors available on ${day}`, 'info');
}

function filterByPrice() {
    const price = document.getElementById('filterPrice').value;
    if (!price) { displayTutors(); return; }
    let filtered = [];
    if (price === 'low') filtered = tutors.filter(t => t.baseRate < 3000);
    else if (price === 'medium') filtered = tutors.filter(t => t.baseRate >= 3000 && t.baseRate <= 4500);
    else filtered = tutors.filter(t => t.baseRate > 4500);
    displayFilteredTutors(filtered);
}

function sortTutors() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...tutors];
    if (sortBy === 'rating-high') sorted.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'rating-low') sorted.sort((a, b) => a.rating - b.rating);
    else if (sortBy === 'monthly-low') sorted.sort((a, b) => a.baseRate - b.baseRate);
    else if (sortBy === 'monthly-high') sorted.sort((a, b) => b.baseRate - a.baseRate);
    else return;
    displayFilteredTutors(sorted);
}

function viewTutor(id) {
    const tutor = tutors.find(t => t.id === id);
    if (!tutor) return;
    
    const stars = getStarHTML(tutor.rating);
    let reviewsHTML = tutor.reviews.length ? tutor.reviews.map(r => `
        <div class="review-item"><div class="review-header"><span class="reviewer-name">${r.user}</span><span class="review-date">${r.date}</span></div>
        <div class="stars">${getStarHTML(r.rating)}</div><p>${r.comment || 'No comment'}</p></div>
    `).join('') : '<p style="color: var(--text-gray); text-align: center;">No reviews yet. Be the first to rate!</p>';
    
    document.getElementById('tutorDetails').innerHTML = `
        <div class="tutor-details-header">
            <div class="tutor-details-avatar">${tutor.avatar}</div>
            <h2>${tutor.name}</h2>
            <p class="gold-text">${tutor.subject} Specialist</p>
            <div class="stars" style="font-size: 1.2rem;">${stars}</div>
            <p>${tutor.totalRatings} reviews</p>
        </div>
        <div class="details-grid">
            <div class="detail-item"><strong><i class="fas fa-map-marker-alt"></i> Location</strong><p>${tutor.location}</p></div>
            <div class="detail-item"><strong><i class="fas fa-graduation-cap"></i> Qualification</strong><p>${tutor.qualification}</p></div>
            <div class="detail-item"><strong><i class="fas fa-briefcase"></i> Experience</strong><p>${tutor.experience} years</p></div>
            <div class="detail-item"><strong><i class="fas fa-envelope"></i> Email</strong><p>${tutor.email}</p></div>
            <div class="detail-item"><strong><i class="fas fa-phone"></i> Phone</strong><p>${tutor.phone}</p></div>
            <div class="detail-item"><strong><i class="fas fa-calendar-alt"></i> Monthly Packages</strong><p>4 days: ৳${tutor.baseRate}</p><p>5 days: ৳${tutor.baseRate + tutor.perDayRate}</p><p>6 days: ৳${tutor.baseRate + (tutor.perDayRate * 2)}</p></div>
        </div>
        <div class="detail-item"><strong><i class="fas fa-comment"></i> About</strong><p>${tutor.bio}</p></div>
        <div class="tutor-modal-actions">
            <button onclick="openBookingModal(${tutor.id})" class="btn-luxury"><i class="fas fa-calendar-check"></i> Book Monthly Package</button>
            <button onclick="sendMessageToTutor('${tutor.name}')" class="btn-luxury-outline"><i class="fas fa-envelope"></i> Send Message</button>
        </div>
        <div class="reviews-section"><h3><i class="fas fa-star"></i> Student Reviews</h3>${reviewsHTML}</div>
    `;
    showModal('tutorModal');
}

function sendMessageToTutor(tutorName) {
    if (!currentUser) { showToast('Please login to send message', 'error'); showModal('loginModal'); return; }
    window.location.href = `messages.html?to=${encodeURIComponent(tutorName)}`;
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
    const baseRate = parseFloat(document.getElementById('baseRate')?.textContent || 0);
    const perDayRate = parseFloat(document.getElementById('perDayRate')?.textContent || 0);
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
    bookings.push({ id: Date.now(), tutorId: currentBookingTutor.id, tutorName: currentBookingTutor.name, subject: currentBookingTutor.subject, daysPerWeek, preferredTime, monthlyFee: totalFee, studentName: currentUser.name, studentEmail: currentUser.email, bookingDate: new Date().toLocaleDateString(), status: 'Confirmed' });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    showToast(`Booking confirmed! Monthly fee: ৳${totalFee}`, 'success');
    closeModal('bookingModal');
}

function openRatingModal(tutorId) {
    if (!currentUser) { showToast('Please login to rate', 'error'); showModal('loginModal'); return; }
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return;
    currentRatingTutor = tutor;
    selectedRating = 0;
    document.getElementById('ratingTutorInfo').innerHTML = `<h3>${tutor.name}</h3><p class="gold-text">${tutor.subject} Tutor</p><div class="stars">${getStarHTML(tutor.rating)}</div>`;
    document.getElementById('ratingValue').textContent = 'Click a star to rate';
    document.getElementById('ratingComment').value = '';
    document.querySelectorAll('.star-rating span').forEach(s => s.classList.remove('active'));
    showModal('ratingModal');
}

function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.star-rating span').forEach((star, i) => star.classList[i < rating ? 'add' : 'remove']('active'));
    document.getElementById('ratingValue').textContent = `You rated: ${rating} star${rating > 1 ? 's' : ''}`;
}

function submitRating() {
    if (!currentRatingTutor || selectedRating === 0) { showToast('Please select a rating', 'error'); return; }
    const comment = document.getElementById('ratingComment').value;
    const tutorIndex = tutors.findIndex(t => t.id === currentRatingTutor.id);
    if (tutorIndex === -1) return;
    tutors[tutorIndex].reviews.unshift({ user: currentUser.name, rating: selectedRating, comment: comment || 'No comment', date: new Date().toLocaleDateString() });
    const totalStars = tutors[tutorIndex].rating * tutors[tutorIndex].totalRatings + selectedRating;
    tutors[tutorIndex].totalRatings += 1;
    tutors[tutorIndex].rating = totalStars / tutors[tutorIndex].totalRatings;
    saveTutors();
    displayTutors();
    showToast('Thank you for your rating!', 'success');
    closeModal('ratingModal');
    currentRatingTutor = null;
    selectedRating = 0;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTutors();
});