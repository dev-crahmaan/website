const notesGrid = document.getElementById("notesGrid");
const emptyState = document.getElementById("emptyState");
const modal = document.getElementById("modal");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const newNoteBtn = document.getElementById("newNoteBtn");
const emptyNewBtn = document.getElementById("emptyNewBtn");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const allCount = document.getElementById("allCount");
const pinnedCount = document.getElementById("pinnedCount");
const notesCount = document.getElementById("notesCount");
const sectionTitle = document.getElementById("sectionTitle");
const navItems = document.querySelectorAll(".nav-item");
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let currentFilter = "all";
let editingId = null;
function openModal(note = null) {
    modal.classList.add("show");
    if (note) {
        editingId = note.id;
        document.getElementById("modalTitle").textContent = "Edit Note";
        noteTitle.value = note.title;
        noteContent.value = note.content;
        saveBtn.textContent = "Update Note";
    } else {
        editingId = null;
        document.getElementById("modalTitle").textContent = "Create Note";
        noteTitle.value = "";
        noteContent.value = "";
        saveBtn.textContent = "Save Note";
    } noteTitle.focus();
}
function closeNoteModal() {
    modal.classList.remove("show");
    editingId = null;
}
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    if (!title && !content) {
        alert("Please write something first.");
        return;
    }
    if (editingId) {
        notes = notes.map(note => {
            if (note.id === editingId) {
                return {
                    ...note,
                    title: title || "Untitled Note",
                    content: content,
                    updatedAt: new Date().toISOString()  }; }
            return note;
        });
    } else {
        const newNote = {
            id: Date.now(),
            title: title || "Untitled Note",
            content: content,
            pinned: false,
            createdAt: new Date().toISOString()
        };
        notes.unshift(newNote);
    }
    saveToStorage();
    closeNoteModal();
    renderNotes();
}
function deleteNote(id) {
    const confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
    notes = notes.filter(note => note.id !== id);
    saveToStorage();
    renderNotes();
}
function togglePin(id) {
    notes = notes.map(note => {
        if (note.id === id) {
            return {
                ...note,
                pinned: !note.pinned
            };
        }
        return note;
    });
    saveToStorage();
    renderNotes();
}
function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
       openModal(note);
    }
}
function getVisibleNotes() {
    let result = [...notes];
    if (currentFilter === "pinned") {
        result = result.filter(note => note.pinned);
    }
    const searchValue = searchInput.value.toLowerCase().trim();
  if (searchValue) {
     result = result.filter(note =>
    note.title.toLowerCase().includes(searchValue) ||
    note.content.toLowerCase().includes(searchValue)
 );
    }  return result;
}
function renderNotes() {
    const visibleNotes = getVisibleNotes();
    notesGrid.innerHTML = "";
    updateCounts();
    if (visibleNotes.length === 0) {
        emptyState.classList.add("show");
        if (searchInput.value.trim()) {
            emptyState.querySelector("h3").textContent = "No results found";
            emptyState.querySelector("p").textContent =
                "Try searching with another keyword.";
            emptyNewBtn.style.display = "none";
        } else {
            emptyState.querySelector("h3").textContent = "No notes yet";
            emptyState.querySelector("p").textContent =
                "Create your first note and start capturing your ideas.";
   emptyNewBtn.style.display = "inline-block";
        }
        return;
    }
    emptyState.classList.remove("show");
    visibleNotes.forEach(note => {
        const card = document.createElement("article");
        card.className = "note-card";
  card.innerHTML = `<div class="note-top"><h3>${escapeHTML(note.title)}</h3>
 <button
  class="pin ${note.pinned ? "active" : ""}"
 onclick="togglePin(${note.id})"
title="Pin note" > 📌</button>
  </div>
            <p class="note-content">
                ${escapeHTML(note.content)}
            </p>
 <div class="note-bottom">
 <span class="note-date">
         ${formatDate(note.createdAt)} </span>
   <div class="actions">
<buttonclass="action-btn"onclick="editNote(${note.id})"
title="Edit" >✎</button>
  <button
 class="action-btn delete"
 onclick="deleteNote(${note.id})"  title="Delete"  >  🗑  </button>
 </div>
 </div>  `;
        notesGrid.appendChild(card);
    });
}
function updateCounts() {
    const pinned = notes.filter(note => note.pinned).length;
    const visible = getVisibleNotes().length;
    allCount.textContent = notes.length;
    pinnedCount.textContent = pinned;
    notesCount.textContent =
        visible === 1 ? "1 note" : `${visible} notes`;
    sectionTitle.textContent =
        currentFilter === "pinned"
            ? "Pinned Notes"
            : "All Notes";
}
function saveToStorage() {
    localStorage.setItem("notes", JSON.stringify(notes));
}
function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
navItems.forEach(item => {
    item.addEventListener("click", () => {
        navItems.forEach(nav => {
            nav.classList.remove("active");
        });
        item.classList.add("active");
        currentFilter = item.dataset.filter;
        renderNotes();
    });
});
newNoteBtn.addEventListener("click", () => {
    openModal();
});
emptyNewBtn.addEventListener("click", () => {
    openModal();
});
closeModal.addEventListener("click", closeNoteModal);
cancelBtn.addEventListener("click", closeNoteModal);
saveBtn.addEventListener("click", saveNote);
searchInput.addEventListener("input", renderNotes);
modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeNoteModal();
    }
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeNoteModal();
    }
    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "enter" &&
        modal.classList.contains("show")
    ) {
        saveNote();
    }
});
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const darkMode = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", darkMode);
    themeIcon.textContent = darkMode ? "☀" : "☾";
    themeBtn.querySelector("span:last-child").textContent =
        darkMode ? "Light Mode" : "Dark Mode";
});
function loadTheme() {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
 document.body.classList.add("dark");
  themeIcon.textContent = "☀";
 themeBtn.querySelector("span:last-child").textContent =      "Light Mode";
}
}
loadTheme();
renderNotes();