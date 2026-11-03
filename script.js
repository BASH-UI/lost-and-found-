import { supabase } from "./supabase.js";
async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error.message);
  } else {
    console.log("Supabase connected successfully!", data);
  }
}

testSupabaseConnection();
const STORAGE_KEY = "campusLostFoundPosts_v1";

const itemForm = document.getElementById("item-form");
const itemGrid = document.getElementById("item-grid");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const statusFilter = document.getElementById("status-filter");
const emptyState = document.getElementById("empty-state");
const statusDialog = document.getElementById("status-dialog");

let posts = loadPosts();
let statusPostId = null;

function loadPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not load saved posts:", error);
    return [];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function formatDate(dateString) {
  if (!dateString) return "Date not provided";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric"
  });
}

function updateStats() {
  document.getElementById("total-count").textContent = posts.length;
  document.getElementById("open-count").textContent = posts.filter((post) => post.status === "open").length;
  document.getElementById("resolved-count").textContent = posts.filter((post) => post.status === "returned").length;
}

function renderPosts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const selectedStatus = statusFilter.value;

  const visiblePosts = posts.filter((post) => {
    const searchableText = [
      post.name, post.category, post.description, post.location, post.type
    ].join(" ").toLowerCase();

    return searchableText.includes(searchTerm)
      && (selectedType === "all" || post.type === selectedType)
      && (selectedStatus === "all" || post.status === selectedStatus);
  });

  document.getElementById("results-label").textContent =
    `${visiblePosts.length} ${visiblePosts.length === 1 ? "post" : "posts"}`;

  itemGrid.innerHTML = visiblePosts.map((post) => `
    <article class="item-card">
      <div class="card-top">
        <span class="type-pill type-${escapeText(post.type)}">${post.type === "lost" ? "Lost item" : "Found item"}</span>
        <span class="status-pill status-${escapeText(post.status)}">${escapeText(post.status)}</span>
      </div>
      <h3>${escapeText(post.name)}</h3>
      <p class="card-description">${escapeText(post.description)}</p>
      <div class="card-meta">
        <span>▦ <b>${escapeText(post.category)}</b></span>
        <span>Department: <b>${escapeText(post.department || "Not specified")}</b></span>
        <span>⌖ ${escapeText(post.location)}</span>
        <span>◷ ${formatDate(post.date)}</span>
      </div>
      <div class="card-footer">
        <span class="contact-text">Contact: ${escapeText(post.contact)}</span>
        <div class="card-actions">
          <button class="small-action" data-action="edit" data-id="${escapeText(post.id)}">Edit</button>
          <button class="small-action" data-action="status" data-id="${escapeText(post.id)}">Status</button>
          <button class="small-action delete" data-action="delete" data-id="${escapeText(post.id)}">Delete</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", visiblePosts.length !== 0);
  updateStats();
}

function resetForm() {
  itemForm.reset();
  document.getElementById("edit-id").value = "";
  document.getElementById("form-heading").textContent = "Create a post";
  document.getElementById("submit-button").textContent = "Publish post";
  document.getElementById("cancel-edit").classList.add("hidden");
  document.getElementById("form-message").textContent = "";
}
itemGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const post = posts.find((entry) => entry.id === button.dataset.id);
  if (!post) return;

  if (button.dataset.action === "edit") {
    document.getElementById("edit-id").value = post.id;
    document.getElementById("post-type").value = post.type;
    document.getElementById("item-name").value = post.name;
    document.getElementById("category").value = post.category;
    document.getElementById("department").value = post.department || "";
    document.getElementById("item-date").value = post.date;
    document.getElementById("location").value = post.location;
    document.getElementById("description").value = post.description;
    document.getElementById("contact").value = post.contact;
    document.getElementById("form-heading").textContent = "Edit your post";
    document.getElementById("submit-button").textContent = "Save changes";
    document.getElementById("cancel-edit").classList.remove("hidden");
    document.getElementById("report").scrollIntoView({ behavior: "smooth" });
  }

  if (button.dataset.action === "delete") {
    if (window.confirm(`Delete the post "${post.name}"? This cannot be undone.`)) {
      posts = posts.filter((entry) => entry.id !== post.id);
      savePosts();
      renderPosts();
      resetForm();
    }
  }

  if (button.dataset.action === "status") {
    statusPostId = post.id;
    document.getElementById("dialog-item-name").textContent = post.name;
    document.getElementById("new-status").value = post.status;
    statusDialog.showModal();
  }
});

document.getElementById("save-status").addEventListener("click", () => {
  const newStatus = document.getElementById("new-status").value;
  posts = posts.map((post) => post.id === statusPostId ? { ...post, status: newStatus } : post);
  savePosts();
  renderPosts();
  statusDialog.close();
  statusPostId = null;
});

document.getElementById("cancel-edit").addEventListener("click", resetForm);
searchInput.addEventListener("input", renderPosts);
typeFilter.addEventListener("change", renderPosts);
statusFilter.addEventListener("change", renderPosts);

renderPosts();
// SIGN UP
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    const message = document.getElementById("auth-message");

    if (error) {
        message.textContent = error.message;
    } else {
        message.textContent = "Account created! Check your email for confirmation.";
        signupForm.reset();
    }
});


// LOGIN
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    const message = document.getElementById("auth-message");

    if (error) {
        message.textContent = error.message;
    } else {
        message.textContent = "Login successful!";
        loginForm.reset();
    }
});
// PASSWORD RECOVERY

const resetPasswordForm = document.getElementById("reset-password-form");

// Check whether the user arrived through a password recovery link
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        resetPasswordForm.hidden = false;
        document.getElementById("auth-message").textContent =
            "Enter your new password below.";
    }
});

// Save the new password
resetPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value;

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    const message = document.getElementById("auth-message");

    if (error) {
        message.textContent = error.message;
    } else {
        message.textContent = "Password updated successfully! You can now log in.";
        resetPasswordForm.reset();
        resetPasswordForm.hidden = true;
    }
});