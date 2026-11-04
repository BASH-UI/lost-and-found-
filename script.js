
const STORAGE_KEY = "campusLostFoundPosts_v1";

const itemForm = document.getElementById("item-form");
const itemGrid = document.getElementById("item-grid");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const statusFilter = document.getElementById("status-filter");
const emptyState = document.getElementById("empty-state");
const statusDialog = document.getElementById("status-dialog");

let posts = [];
let statusPostId = null;

// LOAD POSTS FROM LOCAL STORAGE
function loadPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    return savedPosts ? JSON.parse(savedPosts) : [];
  } catch (error) {
    console.error("Could not load posts:", error);
    return [];
  }
}

// SAVE POSTS TO LOCAL STORAGE
function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// CREATE UNIQUE ID
function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// PROTECT DISPLAYED TEXT
function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// FORMAT DATE
function formatDate(date) {
  if (!date) return "No date provided";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// UPDATE STATISTICS
function updateStats() {
  document.getElementById("total-count").textContent = posts.length;

  document.getElementById("open-count").textContent =
    posts.filter(post => post.status === "open").length;

  document.getElementById("resolved-count").textContent =
    posts.filter(post => post.status === "returned").length;
}

// DISPLAY POSTS
function renderPosts() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedType = typeFilter.value;
  const selectedStatus = statusFilter.value;

  const visiblePosts = posts.filter(post => {
    const searchableText = [
      post.name,
      post.description,
      post.location,
      post.category,
      post.department
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);
    const matchesType =
      selectedType === "all" || post.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || post.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  document.getElementById("results-label").textContent =
    `${visiblePosts.length} posts`;

  itemGrid.innerHTML = visiblePosts.map(post => `
    <article class="item-card">
      <div class="card-content">
        <span class="item-type">${escapeText(post.type)}</span>
        <span class="item-status">${escapeText(post.status)}</span>
        <h3>${escapeText(post.name)}</h3>
        <p>${escapeText(post.description)}</p>
        <div class="card-details">
          <span>${escapeText(post.category)}</span>
          <span>${escapeText(post.department)}</span>
          <span>${escapeText(post.location)}</span>
          <span>◷ ${formatDate(post.date)}</span>
        </div>
        <div class="card-footer">
          <span class="contact-text">
            Contact: ${escapeText(post.contact)}
          </span>
          <div class="card-actions">
            <button class="small-action" data-action="edit"
              data-id="${escapeText(post.id)}">Edit</button>
            <button class="small-action" data-action="status"
              data-id="${escapeText(post.id)}">Status</button>
            <button class="small-action delete" data-action="delete"
              data-id="${escapeText(post.id)}">Delete</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", visiblePosts.length !== 0);

  updateStats();
}

// RESET FORM
function resetForm() {
  itemForm.reset();

  document.getElementById("edit-id").value = "";
  document.getElementById("form-heading").textContent = "Create a post";
  document.getElementById("submit-button").textContent = "Publish post";
  document.getElementById("cancel-edit").classList.add("hidden");
  document.getElementById("form-message").textContent = "";
}

// CREATE AND UPDATE POSTS
itemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const editId = document.getElementById("edit-id").value;

  const postData = {
    type: document.getElementById("post-type").value,
    name: document.getElementById("item-name").value.trim(),
    category: document.getElementById("category").value,
    department: document.getElementById("department").value,
    date: document.getElementById("item-date").value,
    location: document.getElementById("location").value.trim(),
    description: document.getElementById("description").value.trim(),
    contact: document.getElementById("contact").value.trim()
  };

  if (Object.values(postData).some(value => !value)) {
    document.getElementById("form-message").textContent =
      "Please complete all required fields.";
    return;
  }

  if (editId) {
    posts = posts.map(post =>
      post.id === editId
        ? { ...post, ...postData }
        : post
    );

    document.getElementById("form-message").textContent =
      "Post updated successfully!";
  } else {
    posts.unshift({
      id: makeId(),
      ...postData,
      status: "open",
      createdAt: new Date().toISOString()
    });

    document.getElementById("form-message").textContent =
      "Your post has been published!";
  }

  savePosts();
  renderPosts();
  resetForm();

  document.getElementById("browse").scrollIntoView({
    behavior: "smooth"
  });
});

// EDIT, DELETE AND CHANGE STATUS
itemGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const post = posts.find(entry => entry.id === button.dataset.id);
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

    document.getElementById("report").scrollIntoView({
      behavior: "smooth"
    });
  }

  if (button.dataset.action === "delete") {
    if (window.confirm(`Delete the post "${post.name}"? This cannot be undone.`)) {
      posts = posts.filter(entry => entry.id !== post.id);
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

// SAVE STATUS
document.getElementById("save-status").addEventListener("click", () => {
  const newStatus = document.getElementById("new-status").value;

  posts = posts.map(post =>
    post.id === statusPostId
      ? { ...post, status: newStatus }
      : post
  );

  savePosts();
  renderPosts();
  statusDialog.close();
  statusPostId = null;
});

// CANCEL EDITING
document.getElementById("cancel-edit").addEventListener("click", resetForm);

// SEARCH AND FILTER
searchInput.addEventListener("input", renderPosts);
typeFilter.addEventListener("change", renderPosts);
statusFilter.addEventListener("change", renderPosts);

// START APPLICATION
posts = loadPosts();
renderPosts();

