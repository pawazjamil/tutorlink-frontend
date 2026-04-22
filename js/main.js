// ========== API CONFIGURATION ==========
const API_URL = "https://tutorlink-backend-d1oa.onrender.com/api";

// ========== GLOBAL VARIABLES ==========
let tutors = [];
let users = [];
let messages = [];
let bookings = [];
let currentUser = null;
let currentTutor = null;
let currentBookingTutor = null;
let selectedRating = 0;
let selectedUserEmail = null;
let selectedUserName = null;
let chatInterval = null;

// ========== INITIALIZE DATA (fetch from API) ==========
async function initData() {
  try {
    // Fetch tutors from backend
    const tutorsRes = await fetch(`${API_URL}/tutors`);
    if (tutorsRes.ok) tutors = await tutorsRes.json();
    else tutors = [];

    // Fetch users from backend (if you have an endpoint)
    // If not, we'll keep localStorage for users as fallback, but ideally you'd have /api/users
    if (localStorage.getItem("users")) {
      users = JSON.parse(localStorage.getItem("users"));
    } else {
      users = [
        {
          id: 1,
          name: "Admin User",
          email: "admin@tutor.com",
          password: "admin123",
          type: "admin",
          joined: "2026",
          phone: "",
          location: "",
          profilePic: null,
        },
        {
          id: 2,
          name: "Test Student",
          email: "student@test.com",
          password: "student123",
          type: "student",
          joined: "2026",
          phone: "01712345678",
          location: "Dhanmondi",
          profilePic: null,
        },
      ];
      localStorage.setItem("users", JSON.stringify(users));
    }

    // Fetch messages and bookings from backend (if endpoints exist)
    // For now, we'll keep localStorage as fallback – but you can implement later.
    if (localStorage.getItem("messages"))
      messages = JSON.parse(localStorage.getItem("messages"));
    else messages = [];
    if (localStorage.getItem("bookings"))
      bookings = JSON.parse(localStorage.getItem("bookings"));
    else bookings = [];

    updateStats();
  } catch (err) {
    console.error("Init error:", err);
    showToast("Failed to load data from server");
  }
}

function updateStats() {
  const totalTutorsSpan = document.getElementById("totalTutors");
  const totalStudentsSpan = document.getElementById("totalStudents");
  if (totalTutorsSpan) totalTutorsSpan.textContent = tutors.length;
  if (totalStudentsSpan)
    totalStudentsSpan.textContent = users.filter(
      (u) => u.type === "student",
    ).length;
}

// ========== PROFILE PICTURE FUNCTIONS (unchanged, client-side only) ==========
function previewProfilePicture(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("profilePicPreview");
      preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    };
    reader.readAsDataURL(file);
  }
}

function getProfilePictureHtml(user) {
  if (user && user.profilePic) {
    return `<img src="${user.profilePic}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">`;
  } else {
    if (user.type === "tutor") {
      const tutor = tutors.find((t) => t.email === user.email);
      return `<div style="width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg, #C6A43F, #a8882e); display:flex; align-items:center; justify-content:center; font-size:3rem;">${tutor?.avatar || "👨‍🏫"}</div>`;
    } else {
      return `<div style="width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg, #C6A43F, #a8882e); display:flex; align-items:center; justify-content:center; font-size:3rem;">👤</div>`;
    }
  }
}

// ========== UTILITY FUNCTIONS ==========
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

function getStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) stars += i <= rating ? "★" : "☆";
  return stars;
}

// ========== NAVIGATION ==========
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
  if (!currentUser) {
    showToast("Please login first");
    showModal("loginModal");
    return;
  }
  document.getElementById("homeSection").style.display = "none";
  document.getElementById("tutorsSection").style.display = "none";
  document.getElementById("profileSection").style.display = "block";
  document.getElementById("messagesSection").style.display = "none";
  document.getElementById("becomeTutorSection").style.display = "none";
  loadProfileData();
}

function showMessages() {
  if (!currentUser) {
    showToast("Please login first");
    showModal("loginModal");
    return;
  }
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

// ========== PROFILE FUNCTIONS (using API) ==========
function loadProfileData() {
  if (currentUser.type === "tutor") {
    const tutor = tutors.find((t) => t.email === currentUser.email);
    document.getElementById("profileContent").innerHTML = `
      <div style="text-align:center;">
        ${getProfilePictureHtml(currentUser)}
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <p><strong>Phone:</strong> ${currentUser.phone || "Not set"}</p>
        <p><strong>Location:</strong> ${currentUser.location || "Not set"}</p>
        <p><strong>Subject:</strong> ${tutor?.subject || "Not set"}</p>
        <p><strong>Qualification:</strong> ${tutor?.qualification || "Not set"}</p>
        <p><strong>Rate:</strong> ৳${tutor?.baseRate || 0}/month</p>
        <p><strong>Rating:</strong> ${getStars(tutor?.rating || 0)} (${tutor?.totalRatings || 0} reviews)</p>
        <button class="btn-edit-profile" onclick="openEditProfileModal()">Edit Profile</button>
        <button class="btn-profile" onclick="logout()" style="margin-top:1rem;">Logout</button>
      </div>
      <div style="margin-top:2rem;"><h3>My Students</h3><div id="myStudentsList"></div></div>
    `;
    const myBookings = bookings.filter(
      (b) => b.tutorEmail === currentUser.email,
    );
    const studentsList = document.getElementById("myStudentsList");
    if (studentsList) {
      if (myBookings.length === 0)
        studentsList.innerHTML = "<p>No students yet.</p>";
      else
        studentsList.innerHTML = myBookings
          .map(
            (b) =>
              `<div style="background:#f5f5f5; padding:1rem; margin:0.5rem 0; border-radius:10px;"><strong>${b.studentName}</strong> - ${b.subject}<br>${b.days} days/week | ৳${b.total}/month<br><small>Booked on: ${b.date}</small><br><button class="btn-profile" onclick="openChatWithUser('${b.studentEmail}', '${b.studentName}')">Message Student</button></div>`,
          )
          .join("");
    }
  } else {
    let userBookings = bookings.filter(
      (b) => b.studentEmail === currentUser.email,
    );
    document.getElementById("profileContent").innerHTML = `
      <div style="text-align:center;">
        ${getProfilePictureHtml(currentUser)}
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
        <p><strong>Phone:</strong> ${currentUser.phone || "Not set"}</p>
        <p><strong>Location:</strong> ${currentUser.location || "Not set"}</p>
        <p>Account Type: Student</p>
        <button class="btn-edit-profile" onclick="openEditProfileModal()">Edit Profile</button>
        <button class="btn-profile" onclick="logout()" style="margin-top:1rem;">Logout</button>
      </div>
      <div style="margin-top:2rem;"><h3>My Bookings (${userBookings.length})</h3>
      ${userBookings.length === 0 ? "<p>No bookings yet.</p>" : userBookings.map((b) => `<div style="background:#f5f5f5; padding:1rem; margin:0.5rem 0; border-radius:10px;"><strong>${b.tutor}</strong> - ${b.subject}<br>${b.days} days/week | ৳${b.total}/month<br><small>Booked on: ${b.date}</small><button class="btn-profile" onclick="openChatWithUser('${b.tutorEmail}', '${b.tutor}')">Message Tutor</button></div>`).join("")}
      </div>
    `;
  }
}

function openEditProfileModal() {
  document.getElementById("editName").value = currentUser.name;
  document.getElementById("editEmail").value = currentUser.email;
  document.getElementById("editPhone").value = currentUser.phone || "";
  document.getElementById("editLocation").value = currentUser.location || "";
  const preview = document.getElementById("profilePicPreview");
  if (currentUser.profilePic)
    preview.innerHTML = `<img src="${currentUser.profilePic}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
  else {
    if (currentUser.type === "tutor") {
      const tutor = tutors.find((t) => t.email === currentUser.email);
      preview.innerHTML = `<span style="font-size:3rem;">${tutor?.avatar || "👨‍🏫"}</span>`;
    } else preview.innerHTML = `<span style="font-size:3rem;">👤</span>`;
  }
  showModal("editProfileModal");
}

async function saveProfileChanges() {
  currentUser.name = document.getElementById("editNameModal").value;
  currentUser.email = document.getElementById("editEmailModal").value;
  currentUser.phone = document.getElementById("editPhoneModal").value;
  currentUser.location = document.getElementById("editLocationModal").value;

  const fileInput = document.getElementById("profilePicUpload");
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      currentUser.profilePic = e.target.result;
      finalizeSave();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else finalizeSave();
}

async function finalizeSave() {
  // Update user in backend (if you have an endpoint)
  // For now, update localStorage and also update in users array
  const userIndex = users.findIndex((u) => u.id === currentUser.id);
  if (userIndex !== -1) users[userIndex] = currentUser;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  if (currentUser.type === "tutor") {
    const tutorIndex = tutors.findIndex((t) => t.email === currentUser.email);
    if (tutorIndex !== -1) {
      tutors[tutorIndex].name = currentUser.name;
      tutors[tutorIndex].email = currentUser.email;
      if (currentUser.profilePic)
        tutors[tutorIndex].profilePic = currentUser.profilePic;
      // Optionally update tutor via API: PUT /api/tutors/:id
    }
  }
  showToast("Profile updated!");
  closeModal("editProfileModal");
  updateAuthUI();
  loadProfileData();
}

// ========== BECOME A TUTOR (API POST) ==========
async function applyAsTutor() {
  const name = document.getElementById("applyName").value;
  const email = document.getElementById("applyEmail").value;
  const password = document.getElementById("applyPassword").value;
  const phone = document.getElementById("applyPhone").value;
  const subject = document.getElementById("applySubject").value;
  const rate = parseInt(document.getElementById("applyRate").value);
  const location = document.getElementById("applyLocation").value;
  const qualification = document.getElementById("applyQualification").value;
  const bio = document.getElementById("applyBio").value;

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !subject ||
    !rate ||
    !location ||
    !qualification ||
    !bio
  ) {
    showToast("Please fill all fields");
    return;
  }

  try {
    // First register user via backend
    const registerRes = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, type: "tutor" }),
    });
    if (!registerRes.ok) {
      const err = await registerRes.json();
      showToast(err.message || "Registration failed");
      return;
    }

    // Then create tutor profile
    const tutorData = {
      name,
      email,
      phone,
      subject,
      baseRate: rate,
      perDayRate: Math.round(rate / 7),
      location,
      qualification,
      experience: 1,
      bio,
      avatar: "👨‍🏫",
      rating: 0,
      totalRatings: 0,
      reviews: [],
      profilePic: null,
    };
    const tutorRes = await fetch(`${API_URL}/tutors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tutorData),
    });
    if (!tutorRes.ok) {
      showToast("Failed to create tutor profile");
      return;
    }
    const newTutor = await tutorRes.json();
    tutors.push(newTutor);
    // Auto-login after registration
    const loginRes = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      currentUser = loginData.user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      updateAuthUI();
      showToast("Application submitted! You are now a tutor.");
      showProfile();
    } else {
      showToast("Registered, but please login manually");
      showModal("loginModal");
    }
    document.getElementById("tutorApplicationForm").reset();
  } catch (err) {
    console.error(err);
    showToast("Network error");
  }
}

// ========== MESSAGING FUNCTIONS (client-side only for now) ==========
function getAllUsers() {
  let allUsers = [];
  users.forEach((u) => {
    if (u.type === "student" && u.email !== currentUser?.email) {
      allUsers.push({
        email: u.email,
        name: u.name,
        type: "Student",
        profilePic: u.profilePic,
      });
    }
  });
  tutors.forEach((t) => {
    if (t.email !== currentUser?.email) {
      allUsers.push({
        email: t.email,
        name: t.name,
        type: `Tutor (${t.subject})`,
        profilePic: t.profilePic,
        avatar: t.avatar,
      });
    }
  });
  const unique = [];
  const emails = new Set();
  for (const user of allUsers) {
    if (!emails.has(user.email)) {
      emails.add(user.email);
      unique.push(user);
    }
  }
  return unique;
}

function loadConversations() {
  let conversations = new Map();
  messages.forEach((msg) => {
    if (msg.from === currentUser.email || msg.to === currentUser.email) {
      const otherEmail = msg.from === currentUser.email ? msg.to : msg.from;
      const otherName =
        msg.from === currentUser.email ? msg.toName : msg.fromName;
      if (!conversations.has(otherEmail)) {
        conversations.set(otherEmail, {
          email: otherEmail,
          name: otherName,
          lastMessage: msg.content,
          lastTime: msg.timestamp,
          unread: !msg.read && msg.to === currentUser.email,
        });
      }
    }
  });
  const sortedConversations = Array.from(conversations.values()).sort(
    (a, b) => new Date(b.lastTime) - new Date(a.lastTime),
  );
  const messagesHTML = `
    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
      <div style="flex:1; min-width:280px;">
        <h3>Conversations</h3>
        <div id="conversationsList">
          ${
            sortedConversations.length === 0
              ? "<p>No conversations yet.</p>"
              : sortedConversations
                  .map(
                    (conv) => `
              <div onclick="openChatWithUser('${conv.email}', '${conv.name}')" style="padding:1rem; margin:0.5rem 0; background:${conv.unread ? "#f0e6d2" : "#f5f5f5"}; border-radius:10px; cursor:pointer;">
                <strong>${conv.name}</strong> ${conv.unread ? '<span style="color:#C6A43F;">● New</span>' : ""}
                <p style="font-size:0.8rem;">${conv.lastMessage.substring(0, 50)}...</p>
              </div>
            `,
                  )
                  .join("")
          }
        </div>
      </div>
      <div style="flex:1; min-width:320px; background:#faf8f5; padding:1.5rem; border-radius:20px;">
        <h3>Send New Message</h3>
        <input type="text" id="userSearchInput" placeholder="Search by name..." style="width:100%; padding:0.8rem; margin:1rem 0; border:1px solid #e0e0e0; border-radius:10px;" onkeyup="filterUserList()">
        <div id="userListContainer" style="max-height:200px; overflow-y:auto; border:1px solid #e0e0e0; border-radius:10px; margin-bottom:1rem;"></div>
        <textarea id="messageContent" rows="4" placeholder="Type your message..." style="width:100%; padding:0.8rem; border:1px solid #e0e0e0; border-radius:10px;"></textarea>
        <button class="btn-search" onclick="sendNewMessage()" style="margin-top:1rem; width:100%;">Send Message</button>
      </div>
    </div>
  `;
  document.getElementById("messagesContent").innerHTML = messagesHTML;
  populateUserList();
}

function populateUserList(searchTerm = "") {
  let usersList = getAllUsers();
  if (searchTerm)
    usersList = usersList.filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  const container = document.getElementById("userListContainer");
  if (!container) return;
  if (usersList.length === 0) {
    container.innerHTML =
      '<div style="padding:1rem; text-align:center;">No users found</div>';
    return;
  }
  container.innerHTML = usersList
    .map(
      (user) => `
    <div onclick="selectUser('${user.email}', '${user.name}')" style="padding:0.8rem; border-bottom:1px solid #e0e0e0; cursor:pointer;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'">
      <strong>${user.name}</strong><br><small style="color:#888;">${user.type}</small>
    </div>
  `,
    )
    .join("");
}

function filterUserList() {
  const searchTerm = document.getElementById("userSearchInput").value;
  populateUserList(searchTerm);
}

let selectedUserEmail = null;
let selectedUserName = null;

function selectUser(email, name) {
  selectedUserEmail = email;
  selectedUserName = name;
  showToast(`Selected: ${name}`);
}

function sendNewMessage() {
  const content = document.getElementById("messageContent").value.trim();
  if (!selectedUserEmail) {
    showToast("Please select a recipient first");
    return;
  }
  if (!content) {
    showToast("Please enter a message");
    return;
  }
  messages.push({
    id: Date.now(),
    from: currentUser.email,
    fromName: currentUser.name,
    to: selectedUserEmail,
    toName: selectedUserName,
    content: content,
    timestamp: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem("messages", JSON.stringify(messages));
  showToast(`Message sent to ${selectedUserName}!`);
  document.getElementById("messageContent").value = "";
  selectedUserEmail = null;
  selectedUserName = null;
  loadConversations();
}

function openChatWithUser(userEmail, userName) {
  let updated = false;
  messages = messages.map((msg) => {
    if (msg.from === userEmail && msg.to === currentUser.email && !msg.read) {
      updated = true;
      return { ...msg, read: true };
    }
    return msg;
  });
  if (updated) localStorage.setItem("messages", JSON.stringify(messages));
  const chatHTML = `
    <div style="display: flex; flex-direction: column; height: 500px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
        <button class="btn-profile" onclick="loadConversations()">← Back</button>
        <h3>Chat with ${userName}</h3>
        <div style="width:80px;"></div>
      </div>
      <div id="chatMessages" style="flex:1; overflow-y: auto; background: #faf8f5; border-radius: 20px; padding: 1rem; margin-bottom: 1rem;"></div>
      <div style="display: flex; gap: 0.5rem;">
        <input type="text" id="chatInput" placeholder="Type your message..." style="flex:1; padding:0.8rem; border:1px solid #e0e0e0; border-radius: 10px;" onkeypress="if(event.key==='Enter') sendChatMessageToUser('${userEmail}', '${userName}')">
        <button class="btn-search" onclick="sendChatMessageToUser('${userEmail}', '${userName}')">Send</button>
      </div>
    </div>
  `;
  document.getElementById("messagesContent").innerHTML = chatHTML;
  loadChatMessagesWithUser(userEmail, userName);
  if (window.chatInterval) clearInterval(window.chatInterval);
  window.chatInterval = setInterval(
    () => loadChatMessagesWithUser(userEmail, userName),
    3000,
  );
}

function loadChatMessagesWithUser(userEmail, userName) {
  let chatMessages = messages
    .filter(
      (m) =>
        (m.from === currentUser.email && m.to === userEmail) ||
        (m.from === userEmail && m.to === currentUser.email),
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const container = document.getElementById("chatMessages");
  if (!container) return;
  if (chatMessages.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; padding:2rem;">No messages yet.</p>';
    return;
  }
  container.innerHTML = chatMessages
    .map(
      (msg) => `
    <div style="text-align: ${msg.from === currentUser.email ? "right" : "left"}; margin-bottom: 1rem;">
      <div style="display: inline-block; max-width: 70%; background: ${msg.from === currentUser.email ? "#C6A43F" : "white"}; color: ${msg.from === currentUser.email ? "white" : "#333"}; padding: 0.8rem 1rem; border-radius: 20px;">
        <p>${msg.content}</p>
        <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
      </div>
    </div>
  `,
    )
    .join("");
  container.scrollTop = container.scrollHeight;
}

function sendChatMessageToUser(userEmail, userName) {
  const input = document.getElementById("chatInput");
  const content = input.value.trim();
  if (!content) return;
  messages.push({
    id: Date.now(),
    from: currentUser.email,
    fromName: currentUser.name,
    to: userEmail,
    toName: userName,
    content: content,
    timestamp: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem("messages", JSON.stringify(messages));
  input.value = "";
  loadChatMessagesWithUser(userEmail, userName);
}

// ========== TUTOR DISPLAY FUNCTIONS (using API) ==========
function displayTutors(tutorsArray) {
  const container = document.getElementById("tutorsList");
  if (!container) return;
  if (!tutorsArray || tutorsArray.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; padding:2rem;">No tutors found. Try a different search!</p>';
    return;
  }
  container.innerHTML = tutorsArray
    .map(
      (t) => `
    <div class="tutor-card">
      <div class="tutor-header">
        <div style="width:80px; height:80px; border-radius:50%; margin:0 auto 1rem; overflow:hidden;">
          ${t.profilePic ? `<img src="${t.profilePic}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:3rem;">${t.avatar}</span>`}
        </div>
        <h3>${t.name}</h3>
        <p>${t.subject} Specialist</p>
      </div>
      <div class="tutor-body">
        <div class="tutor-info">
          <p><i class="fas fa-map-marker-alt"></i> ${t.location}</p>
          <p><i class="fas fa-graduation-cap"></i> ${t.qualification.substring(0, 30)}...</p>
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
          <button class="btn-profile" onclick="openChatWithUser('${t.email}', '${t.name}')">Message</button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

async function searchTutors() {
  const subjectInput = document.getElementById("searchSubject").value.trim();
  const locationInput = document.getElementById("searchLocation").value.trim();
  try {
    let url = `${API_URL}/tutors`;
    if (subjectInput || locationInput) {
      // If you have search query parameters, adjust accordingly
      // For simplicity, we filter client-side after fetch
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch tutors");
    let allTutors = await res.json();
    let filtered = allTutors;
    if (subjectInput)
      filtered = filtered.filter(
        (t) => t.subject.toLowerCase() === subjectInput.toLowerCase(),
      );
    if (locationInput)
      filtered = filtered.filter((t) =>
        t.location.toLowerCase().includes(locationInput.toLowerCase()),
      );
    displayTutors(filtered);
    if (filtered.length === 0) showToast("No tutors found");
    else showToast(`Found ${filtered.length} tutor(s)`);
    showTutors();
  } catch (err) {
    console.error(err);
    showToast("Error loading tutors");
  }
}

function filterSubject(subject) {
  document.getElementById("searchSubject").value = subject;
  searchTutors();
}

function filterBySubject() {
  const subject = document.getElementById("filterSubject").value;
  if (subject) {
    const filtered = tutors.filter((t) => t.subject === subject);
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
  if (sortBy === "rating-high") sorted.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "price-low")
    sorted.sort((a, b) => a.baseRate - b.baseRate);
  else if (sortBy === "price-high")
    sorted.sort((a, b) => b.baseRate - a.baseRate);
  else return;
  displayTutors(sorted);
}

async function viewTutor(id) {
  try {
    const res = await fetch(`${API_URL}/tutors/${id}`);
    if (!res.ok) throw new Error("Tutor not found");
    const t = await res.json();
    document.getElementById("tutorDetails").innerHTML = `
      <div style="text-align:center;">
        <div style="width:100px; height:100px; border-radius:50%; margin:0 auto 1rem; overflow:hidden;">
          ${t.profilePic ? `<img src="${t.profilePic}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:4rem;">${t.avatar}</span>`}
        </div>
        <h2>${t.name}</h2>
        <p class="gold">${t.subject} Specialist</p>
        <div class="stars">${getStars(t.rating)} (${t.totalRatings} reviews)</div>
        <div style="margin:1rem 0; text-align:left;">
          <p><strong>📍 Location:</strong> ${t.location}</p>
          <p><strong>🎓 Qualification:</strong> ${t.qualification}</p>
          <p><strong>💼 Experience:</strong> ${t.experience} years</p>
          <p><strong>📧 Email:</strong> ${t.email}</p>
          <p><strong>📞 Phone:</strong> ${t.phone}</p>
          <p><strong>💰 Monthly:</strong> 4 days: ৳${t.baseRate} | 5 days: ৳${t.baseRate + t.perDayRate} | 6 days: ৳${t.baseRate + t.perDayRate * 2}</p>
          <p><strong>📝 About:</strong> ${t.bio}</p>
        </div>
        <button class="modal-btn" onclick="openBooking(${t.id});closeModal('tutorModal')">Book Now</button>
        <button class="modal-btn" onclick="openChatWithUser('${t.email}', '${t.name}');closeModal('tutorModal')" style="margin-top:0.5rem; background:transparent; border:1px solid #C6A43F; color:#C6A43F;">Send Message</button>
      </div>
    `;
    showModal("tutorModal");
  } catch (err) {
    showToast("Error loading tutor details");
  }
}

// ========== BOOKING FUNCTIONS (API) ==========
function openBooking(id) {
  if (!currentUser) {
    showToast("Please login first");
    showModal("loginModal");
    return;
  }
  if (currentUser.type === "tutor") {
    showToast("Tutors cannot book. Please login as student.");
    return;
  }
  const t = tutors.find((t) => t.id === id);
  if (!t) return;
  currentBookingTutor = t;
  document.getElementById("bookingInfo").innerHTML =
    `<h3>${t.name}</h3><p>${t.subject} | Base: ৳${t.baseRate}/month (4 days)</p>`;
  document.getElementById("priceBreakdown").innerHTML =
    `Base Rate (4 days): ৳${t.baseRate}<br>Extra day: +৳${t.perDayRate}`;
  showModal("bookingModal");
}

function updateBookingPrice() {
  if (!currentBookingTutor) return;
  const days = parseInt(document.getElementById("bookingDays").value);
  const total =
    currentBookingTutor.baseRate + (days - 4) * currentBookingTutor.perDayRate;
  document.getElementById("priceBreakdown").innerHTML =
    `Base Rate (4 days): ৳${currentBookingTutor.baseRate}<br>Extra days: ${days - 4} × ৳${currentBookingTutor.perDayRate}<br><strong>Total: ৳${total}/month</strong>`;
}

async function confirmBooking() {
  if (!currentBookingTutor || !currentUser) return;
  const days = parseInt(document.getElementById("bookingDays").value);
  const total =
    currentBookingTutor.baseRate + (days - 4) * currentBookingTutor.perDayRate;
  const bookingData = {
    tutor: currentBookingTutor.name,
    tutorEmail: currentBookingTutor.email,
    subject: currentBookingTutor.subject,
    days: days,
    total: total,
    date: new Date().toLocaleDateString(),
    studentName: currentUser.name,
    studentEmail: currentUser.email,
    status: "confirmed",
  };
  try {
    const res = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error("Booking failed");
    const newBooking = await res.json();
    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    showToast(`Booked ${currentBookingTutor.name} for ৳${total}/month`);
    closeModal("bookingModal");
    // Send confirmation message
    const msgData = {
      from: currentUser.email,
      fromName: currentUser.name,
      to: currentBookingTutor.email,
      toName: currentBookingTutor.name,
      content: `I have booked your ${days} days/week package for ৳${total}/month.`,
      read: false,
    };
    const msgRes = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msgData),
    });
    if (msgRes.ok) {
      const newMsg = await msgRes.json();
      messages.push(newMsg);
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  } catch (err) {
    console.error(err);
    showToast("Booking failed. Please try again.");
  }
}

// ========== RATING FUNCTIONS (API) ==========
function openRating(id) {
  if (!currentUser) {
    showToast("Please login first");
    showModal("loginModal");
    return;
  }
  const t = tutors.find((t) => t.id === id);
  if (!t) return;
  currentTutor = t;
  document.getElementById("ratingInfo").innerHTML =
    `<h3>${t.name}</h3><p>${t.subject}</p>`;
  selectedRating = 0;
  document
    .querySelectorAll(".stars-input span")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("ratingComment").value = "";
  showModal("ratingModal");
}

function setRating(r) {
  selectedRating = r;
  document.querySelectorAll(".stars-input span").forEach((s, i) => {
    if (i < r) s.classList.add("active");
    else s.classList.remove("active");
  });
}

async function submitRating() {
  if (!currentTutor || selectedRating === 0) {
    showToast("Please select a rating");
    return;
  }
  const comment = document.getElementById("ratingComment").value;
  try {
    const res = await fetch(`${API_URL}/tutors/${currentTutor.id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: selectedRating,
        comment,
        userName: currentUser.name,
      }),
    });
    if (!res.ok) throw new Error("Rating failed");
    const updatedTutor = await res.json();
    const idx = tutors.findIndex((t) => t.id === currentTutor.id);
    if (idx !== -1) tutors[idx] = updatedTutor;
    localStorage.setItem("tutors", JSON.stringify(tutors));
    displayTutors(tutors);
    showToast("Thank you for your review!");
    closeModal("ratingModal");
  } catch (err) {
    console.error(err);
    showToast("Failed to submit rating");
  }
}

// ========== AUTH FUNCTIONS (API) ==========
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
  document
    .querySelectorAll(".modal")
    .forEach((m) => (m.style.display = "none"));
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const pwd = document.getElementById("loginPassword").value;
  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pwd }),
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      showToast(`Welcome back, ${currentUser.name}!`);
      closeModal("loginModal");
      updateAuthUI();
      showProfile();
      // Refresh tutors list
      const tutorsRes = await fetch(`${API_URL}/tutors`);
      if (tutorsRes.ok) tutors = await tutorsRes.json();
    } else {
      showToast(data.message || "Invalid credentials");
    }
  } catch (err) {
    showToast("Network error");
  }
}

async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const pwd = document.getElementById("regPassword").value;
  const type = document.getElementById("regType").value;
  if (!name || !email || !pwd) {
    showToast("Fill all fields");
    return;
  }
  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pwd, type }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Registration successful! Please login.");
      closeModal("registerModal");
      showModal("loginModal");
    } else {
      showToast(data.message || "Registration failed");
    }
  } catch (err) {
    showToast("Network error");
  }
}

function logout() {
  if (window.chatInterval) clearInterval(window.chatInterval);
  currentUser = null;
  localStorage.removeItem("currentUser");
  showToast("Logged out");
  updateAuthUI();
  showHome();
}

function updateAuthUI() {
  const container = document.getElementById("authButtons");
  if (currentUser) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.8rem;">
        <div style="width:32px; height:32px; border-radius:50%; overflow:hidden;">
          ${currentUser.profilePic ? `<img src="${currentUser.profilePic}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:1.2rem;">${currentUser.type === "tutor" ? "👨‍🏫" : "👤"}</span>`}
        </div>
        <span style="color:#C6A43F;">${currentUser.name}</span>
        <button class="btn-login" onclick="logout()">Sign Out</button>
      </div>
    `;
  } else {
    container.innerHTML = `<button class="btn-login" onclick="showModal('loginModal')">Sign In</button><button class="btn-register" onclick="showModal('registerModal')">Join Now</button>`;
  }
}

// ========== INITIALIZE ==========
initData();
currentUser = JSON.parse(localStorage.getItem("currentUser"));
updateAuthUI();
showHome();
