let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, name: "Admin User", email: "admin@tutor.com", password: "admin123", type: "admin", joined: "2026", phone: "", location: "", education: "", occupation: "" },
    { id: 2, name: "Test Student", email: "student@test.com", password: "student123", type: "student", joined: "2026", phone: "01712345678", location: "Dhanmondi", education: "B.Sc in CSE", occupation: "Student" }
];

function showModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.body.style.overflow = 'auto';
}

function switchModal(modalId) {
    closeAllModals();
    showModal(modalId);
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast('Please fill all fields', 'error'); return; }
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showToast(`Welcome back, ${user.name}!`, 'success');
        closeModal('loginModal');
        updateAuthUI();
        document.getElementById('loginForm').reset();
        if (typeof loadProfileData === 'function') loadProfileData();
        setTimeout(() => { window.location.href = 'profile.html'; }, 1000);
    } else {
        showToast('Invalid email or password', 'error');
    }
    if (user.status === "deactivated") {
  if (reactivateProfile(email)) {
    // Retry login after reactivation
    setTimeout(() => login(), 500);
  }
  return;
}
}

function register() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const type = document.getElementById('regType').value;
    if (!name || !email || !password || !type) { showToast('Please fill all fields', 'error'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    if (users.find(u => u.email === email)) { showToast('Email already exists', 'error'); return; }
    const newUser = { id: users.length + 1, name, email, password, type, joined: new Date().getFullYear().toString(), phone: "", location: "", education: "", occupation: "" };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showToast('Registration successful! Please login.', 'success');
    closeModal('registerModal');
    showModal('loginModal');
    document.getElementById('registerForm').reset();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    updateAuthUI();
    closeAllModals();
    window.location.href = 'index.html';
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;
    if (currentUser) {
        authButtons.innerHTML = `<span class="user-welcome" style="display: flex; align-items: center; gap: 0.5rem; color: var(--gold);"><i class="fas fa-user-circle"></i> ${currentUser.name}</span><button class="btn-luxury-outline" onclick="logout()">Logout</button>`;
    } else {
        authButtons.innerHTML = `<button class="btn-luxury" onclick="showModal('loginModal')">Login</button><button class="btn-luxury-outline" onclick="showModal('registerModal')">Register</button>`;
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) closeAllModals();
}

document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});
