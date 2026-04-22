// ========== GLOBAL VARIABLES ==========
let tutors = [];
let users = [];
let messages = [];
let bookings = [];
let currentUser = null;

// ========== INITIALIZE DATA (localStorage) ==========
function initData() {
  if (localStorage.getItem("users")) {
    users = JSON.parse(localStorage.getItem("users"));
  } else {
    users = [
      { id: 1, name: "Admin User", email: "admin@tutor.com", password: "admin123", type: "admin", joined: "2026", phone: "", location: "", profilePic: null },
      { id: 2, name: "Test Student", email: "student@test.com", password: "student123", type: "student", joined: "2026", phone: "01712345678", location: "Dhanmondi", profilePic: null },
    ];
    localStorage.setItem("users", JSON.stringify(users));
  }

  if (localStorage.getItem("tutors")) {
    tutors = JSON.parse(localStorage.getItem("tutors"));
  } else {
    tutors = [
      { id: 1, name: "Dr. Abdur Rahman", email: "rahman@tutor.com", password: "tutor123", type: "tutor", phone: "01711111111", subject: "Math", baseRate: 3500, perDayRate: 600, location: "Dhanmondi", qualification: "PhD in Mathematics, DU", experience: 12, bio: "Award-winning mathematician.", avatar: "👨‍🏫", rating: 4.9, totalRatings: 128, reviews: [], profilePic: null },
      { id: 2, name: "Prof. Fatema Begum", email: "fatema@tutor.com", password: "tutor123", type: "tutor", phone: "01822222222", subject: "English", baseRate: 4000, perDayRate: 700, location: "Gulshan", qualification: "PhD in English, Oxford", experience: 15, bio: "Oxford-educated professor.", avatar: "👩‍🏫", rating: 4.95, totalRatings: 245, reviews: [], profilePic: null },
      { id: 3, name: "Dr. Hasan Mahmud", email: "hasan@tutor.com", password: "tutor123", type: "tutor", phone: "01933333333", subject: "Physics", baseRate: 3800, perDayRate: 650, location: "Uttara", qualification: "M.Sc in Physics, BUET", experience: 10, bio: "Physics expert.", avatar: "👨‍🔬", rating: 4.7, totalRatings: 89, reviews: [], profilePic: null },
      { id: 4, name: "Prof. Kamal Hossain", email: "kamal@tutor.com", password: "tutor123", type: "tutor", phone: "01644444444", subject: "Chemistry", baseRate: 3600, perDayRate: 600, location: "Mohammadpur", qualification: "M.Sc in Chemistry, DU", experience: 8, bio: "Chemistry specialist.", avatar: "🧪", rating: 4.6, totalRatings: 67, reviews: [], profilePic: null },
      { id: 5, name: "Ms. Jahanara Akter", email: "jahanara@tutor.com", password: "tutor123", type: "tutor", phone: "01555555555", subject: "Programming", baseRate: 5000, perDayRate: 800, location: "Banani", qualification: "B.Sc in CSE, BUET", experience: 6, bio: "Software Engineer.", avatar: "💻", rating: 4.98, totalRatings: 156, reviews: [], profilePic: null },
    ];
    localStorage.setItem("tutors", JSON.stringify(tutors));
  }

  if (localStorage.getItem("messages")) messages = JSON.parse(localStorage.getItem("messages")) || [];
  else messages = [];
  if (localStorage.getItem("bookings")) bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  else bookings = [];

  updateStats();
}

function updateStats() {
  const totalTutorsSpan = document.getElementById("totalTutors");
  const totalStudentsSpan = document.getElementById("totalStudents");
  if (totalTutorsSpan) totalTutorsSpan.textContent = tutors.length;
  if (totalStudentsSpan) totalStudentsSpan.textContent = users.filter(u => u.type === "student").length;
}

// ========== UTILITY ==========
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

function getStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) stars += i <= rating ? "★" : "☆";
  return stars;
}

// ========== NAVIGATION (ALL required functions) ==========
function showHome() {
  document.getElementById("homeSection").style.display = "flex";
  document.getElementById("tutorsSection").style.display = "none";
  document.getElementById("profileSection").style.display = "none";
  document.getElementById("messagesSection").style.display = "none";
  document.getElementById("becomeTutorSection").style.display = "none";
  document.getElementById("searchSubject").value = "";
  document.getElementById("searchLocation").value = "";
}

function showTutors() {
  document.getElementById("homeSection").style.display = "none";
  document.getElementById("tutorsSection").style.display = "block";
  document.getElementById("profileSection").style.display = "none";
  document.getElementById("messagesSection").style.display = "none";
  document.getElementById("becomeTutorSection").style.display = "none";
  displayAllTutors();
}

function displayAllTutors() {
  displayTutors(tutors);
}

function showProfile() {
  if (!currentUser) { showToast("Please login first"); showModal("loginModal"); return; }
  document.getElementById("homeSection").style.display = "none";
  document.getElementById("tutorsSection").style.display = "none";
  document.getElementById("profileSection").style.display = "block";
  document.getElementById("messagesSection").style.display = "none";
  document.getElementById("becomeTutorSection").style.display = "none";
  loadProfileData();
}

function showMessages() {
  if (!currentUser) { showToast("Please login first"); showModal("loginModal"); return; }
  document.getElementById("homeSection").style.display = "none";
  document.getElementById("tutorsSection").style.display = "none";
  document.getElementById("profileSection").style.display = "none";
  document.getElementById("messagesSection").style.display = "block";
  document.getElementById("becomeTutorSection").style.display = "none";
  loadConversations();
}

function showBecomeTutor() {
  document.getElementById("homeSection").style.display = "none";
  document.getElementById("tutorsSection").style.display = "none";
  document.getElementById("profileSection").style.display = "none";
  document.getElementById("messagesSection").style.display = "none";
  document.getElementById("becomeTutorSection").style.display = "block";
}

// ========== MODAL FUNCTIONS (required by HTML) ==========
function showModal(id) {
  document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}
function switchModal(id) {
  closeAllModals();
  showModal(id);
}
function closeAllModals() {
  document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

// ========== PROFILE ==========
function loadProfileData() {
  if (currentUser.type === "tutor") {
    const tutor = tutors.find(t => t.email === currentUser.email);
    document.getElementById("profileContent").innerHTML = `
      <div style="text-align:center;">
        <div style="width:100px; height:100px; border-radius:50%; margin:0 auto; background:gold; display:flex; align-items:center; justify-content:center; font-size:3rem;">👨‍🏫</div>
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <p><strong>Phone:</strong> ${currentUser.phone || "Not set"}</p>
        <p><strong>Location:</strong> ${currentUser.location || "Not set"}</p>
        <p><strong>Subject:</strong> ${tutor?.subject || "Not set"}</p>
        <p><strong>Qualification:</strong> ${tutor?.qualification || "Not set"}</p>
        <p><strong>Rate:</strong> ৳${tutor?.baseRate || 0}/month</p>
        <p><strong>Rating:</strong> ${getStars(tutor?.rating || 0)} (${tutor?.totalRatings || 0} reviews)</p>
        <button class="btn-edit-profile" onclick="alert('Edit profile')">Edit Profile</button>
        <button class="btn-profile" onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    let userBookings = bookings.filter(b => b.studentEmail === currentUser.email);
    document.getElementById("profileContent").innerHTML = `
      <div style="text-align:center;">
        <div style="width:100px; height:100px; border-radius:50%; margin:0 auto; background:gold; display:flex; align-items:center; justify-content:center; font-size:3rem;">👤</div>
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <p><strong>Phone:</strong> ${currentUser.phone || "Not set"}</p>
        <p><strong>Location:</strong> ${currentUser.location || "Not set"}</p>
        <p>Account Type: Student</p>
        <button class="btn-edit-profile" onclick="alert('Edit profile')">Edit Profile</button>
        <button class="btn-profile" onclick="logout()">Logout</button>
      </div>
      <div style="margin-top:2rem;"><h3>My Bookings (${userBookings.length})</h3>
      ${userBookings.length === 0 ? "<p>No bookings yet.</p>" : userBookings.map(b => `<div style="background:#f5f5f5; padding:1rem; margin:0.5rem 0; border-radius:10px;"><strong>${b.tutor}</strong> - ${b.subject}<br>${b.days} days/week | ৳${b.total}/month<br><small>Booked on: ${b.date}</small></div>`).join("")}
      </div>
    `;
  }
}

// ========== TUTOR DISPLAY ==========
function displayTutors(tutorsArray) {
  const container = document.getElementById("tutorsList");
  if (!container) return;
  if (!tutorsArray || tutorsArray.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:2rem;">No tutors found.</p>';
    return;
  }
  container.innerHTML = tutorsArray.map(t => `
    <div class="tutor-card">
      <div class="tutor-header">
        <div style="width:80px; height:80px; border-radius:50%; margin:0 auto 1rem; background:gold; display:flex; align-items:center; justify-content:center; font-size:3rem;">${t.avatar}</div>
        <h3>${t.name}</h3>
        <p>${t.subject} Specialist</p>
      </div>
      <div class="tutor-body">
        <div class="tutor-info">
          <p><i class="fas fa-map-marker-alt"></i> ${t.location}</p>
          <p><i class="fas fa-graduation-cap"></i> ${t.qualification.substring(0,30)}...</p>
          <p><i class="fas fa-briefcase"></i> ${t.experience}+ years</p>
          <p><i class="fas fa-calendar-alt"></i> Monthly: ৳${t.baseRate} (4 days)</p>
        </div>
        <div class="tutor-rating">
          <span class="stars">${getStars(t.rating)}</span>
          <span>(${t.totalRatings})</span>
        </div>
        <div class="tutor-actions">
          <button class="btn-profile" onclick="viewTutor(${t.id})">View Profile</button>
          <button class="btn-book" onclick="openBooking(${t.id})">Book Now</button>
          <button class="btn-profile" onclick="openChatWithTutor('${t.name}', '${t.email}')">Message</button>
        </div>
      </div>
    </div>
  `).join("");
}

function searchTutors() {
  const subject = document.getElementById("searchSubject").value.trim().toLowerCase();
  const location = document.getElementById("searchLocation").value.trim().toLowerCase();
  let filtered = tutors;
  if (subject) filtered = filtered.filter(t => t.subject.toLowerCase() === subject);
  if (location) filtered = filtered.filter(t => t.location.toLowerCase().includes(location));
  displayTutors(filtered);
  if (filtered.length === 0) showToast("No tutors found");
  else showToast(`Found ${filtered.length} tutor(s)`);
  showTutors();
}

function filterSubject(subject) {
  document.getElementById("searchSubject").value = subject;
  searchTutors();
}

function filterBySubject() {
  const subject = document.getElementById("filterSubject").value;
  if (subject) {
    const filtered = tutors.filter(t => t.subject === subject);
    displayTutors(filtered);
    showToast(`Showing ${filtered.length} ${subject} tutors`);
  } else {
    displayTutors(tutors);
    showToast(`Showing all ${tutors.length} tutors`);
  }
}

function sortTutors() {
  const sortBy = document.getElementById("sortBy").value;
  let sorted = [...tutors];
  if (sortBy === "rating-high") sorted.sort((a,b) => b.rating - a.rating);
  else if (sortBy === "price-low") sorted.sort((a,b) => a.baseRate - b.baseRate);
  else if (sortBy === "price-high") sorted.sort((a,b) => b.baseRate - a.baseRate);
  else return;
  displayTutors(sorted);
}

function viewTutor(id) {
  const t = tutors.find(t => t.id === id);
  if (!t) return;
  alert(`📚 ${t.name}\nSubject: ${t.subject}\n📍 ${t.location}\n💰 Monthly: ৳${t.baseRate} (4 days)\n⭐ Rating: ${t.rating} (${t.totalRatings} reviews)\n🎓 ${t.qualification}\n📝 ${t.bio}`);
}

function openBooking(id) {
  if (!currentUser) { showToast("Please login first"); showModal("loginModal"); return; }
  if (currentUser.type === "tutor") { showToast("Tutors cannot book. Please login as student."); return; }
  const t = tutors.find(t => t.id === id);
  if (!t) return;
  const days = prompt("📅 How many days per week? (4,5,6):", "4");
  if (!days) return;
  const daysNum = parseInt(days);
  if (daysNum < 4 || daysNum > 6) { showToast("Please enter 4, 5, or 6"); return; }
  const total = t.baseRate + (daysNum - 4) * t.perDayRate;
  if (confirm(`Confirm booking for ${t.name}?\n${daysNum} days/week\nTotal: ৳${total}/month`)) {
    bookings.push({
      id: Date.now(),
      tutor: t.name,
      tutorEmail: t.email,
      subject: t.subject,
      days: daysNum,
      total: total,
      date: new Date().toLocaleDateString(),
      studentName: currentUser.name,
      studentEmail: currentUser.email,
    });
    localStorage.setItem("bookings", JSON.stringify(bookings));
    showToast(`✅ Booked ${t.name} for ৳${total}/month`);
    // Optionally send a message (you can add later)
  }
}

// ========== MESSAGING ==========
function openChatWithTutor(tutorName, tutorEmail) {
  if (!currentUser) { showToast("Please login first"); showModal("loginModal"); return; }
  showMessages();
  // Simulate a conversation for now
  document.getElementById("messagesContent").innerHTML = `
    <div style="padding:1rem;">
      <h3>Chat with ${tutorName}</h3>
      <p>Messaging feature will be fully implemented soon.</p>
      <textarea id="chatMsg" placeholder="Type your message..." rows="3" style="width:100%; margin:1rem 0;"></textarea>
      <button onclick="alert('Message sent (demo)')">Send</button>
    </div>
  `;
}

function loadConversations() {
  document.getElementById("messagesContent").innerHTML = `
    <div style="text-align:center; padding:2rem;">
      <p>💬 You have no conversations yet.</p>
      <p>Go to <strong>Find Tutors</strong> and click "Message" on any tutor to start a conversation.</p>
    </div>
  `;
}

// ========== BECOME A TUTOR ==========
function applyAsTutor() {
  if (!currentUser) { showToast("Please login first"); showModal("loginModal"); return; }
  alert("Tutor registration will be available soon. For now, please use the existing tutor accounts.\nDemo tutor: rahman@tutor.com / tutor123");
}

// ========== AUTH ==========
function login() {
  const email = document.getElementById("loginEmail").value;
  const pwd = document.getElementById("loginPassword").value;
  const user = users.find(u => u.email === email && u.password === pwd);
  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
    closeModal("loginModal");
    updateAuthUI();
    showProfile();
  } else {
    showToast("Invalid credentials. Use student@test.com / student123");
  }
}

function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const pwd = document.getElementById("regPassword").value;
  const type = document.getElementById("regType").value;
  if (!name || !email || !pwd) { showToast("Fill all fields"); return; }
  if (users.find(u => u.email === email)) { showToast("Email already exists"); return; }
  const newUser = { id: users.length+1, name, email, password: pwd, type, joined: "2026", phone: "", location: "", profilePic: null };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  if (type === "tutor") {
    showToast("Please complete your tutor profile in the Become a Tutor section");
    currentUser = newUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateAuthUI();
    closeModal("registerModal");
    showBecomeTutor();
    return;
  }
  currentUser = newUser;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  showToast("Registration successful!");
  closeModal("registerModal");
  updateAuthUI();
  showProfile();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showToast("Logged out");
  updateAuthUI();
  showHome();
}

function updateAuthUI() {
  const container = document.getElementById("authButtons");
  if (currentUser) {
    container.innerHTML = `<span style="color:#C6A43F; margin-right:0.5rem;">${currentUser.name}</span><button class="btn-login" onclick="logout()">Sign Out</button>`;
  } else {
    container.innerHTML = `<button class="btn-login" onclick="showModal('loginModal')">Sign In</button><button class="btn-register" onclick="showModal('registerModal')">Join Now</button>`;
  }
}

// ========== INITIALIZE ==========
initData();
currentUser = JSON.parse(localStorage.getItem("currentUser"));
updateAuthUI();
showHome();