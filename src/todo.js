import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, db } from "./config.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let todoArr = [];
let userUid;
const logOut = document.querySelector("#signoutButton");
const form = document.querySelector("#form");
const inputTitle = document.querySelector("#inputTitle");
const inputDesc = document.querySelector("#inputDesc");
// const todoList = document.getElementById("todoArea");
const showTodo = document.getElementById("showTodo");
const noTodo = document.getElementById("noTodo");
const userName = document.getElementById("userName");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    // console.log(uid, "user uid");
    userUid = uid;
    const q = query(
      collection(db, "todos"),
      where("uid", "==", uid),
      orderBy("timestamp", "desc")
    );
    const getName = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshotName = await getDocs(getName);
    querySnapshotName.forEach((doc) => {
      let userElementName = { ...doc.data() };
      // console.log(userElementName);
      userName.innerText += userElementName.name;
    });
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      todoArr.push({ ...doc.data(), docId: doc.id });
    });
    renderTodo();
    // console.log(todoArr);
  } else {
    window.location = "../public/login.html";
  }
});
function renderTodo() {
  showTodo.innerHTML = "";

  todoArr.forEach((item, index) => {
    const editForm = document.createElement("div");
    editForm.className = "editForm";
    editForm.innerHTML = `
    <input type="text" id="editTitle" placeholder="Updated Title" />
    <input type="text" id="editDesc" placeholder="Updated Description" />
    <button id="saveBtn">Save</button>
    `;
    editForm.style.display = "none";
    const todoItem = document.createElement("div");
    todoItem.className = "todoList";

    const title = document.createElement("div");
    title.className = "title";
    title.innerHTML = `<p><span>Title: </span>${item.title}</p>
      <p><span>Desc: </span>${item.description}</p>`;
    todoItem.appendChild(title);

    const buttons = document.createElement("div");
    buttons.className = "buttons";
    buttons.innerHTML = `
    <button id="deleteBtn">Delete</button>
    <button id="updateBtn">Edit</button>`;
    todoItem.appendChild(buttons);

    showTodo.appendChild(editForm);
    showTodo.appendChild(todoItem);

    const deleteBtn = todoItem.querySelector("#deleteBtn");
    deleteBtn.addEventListener("click", () => {
      deleteTodo(index);
    });

    const updateBtn = todoItem.querySelector("#updateBtn");
    updateBtn.addEventListener("click", () => {
      toggleEditForm(editForm);
    });

    const saveBtn = editForm.querySelector("#saveBtn");
    saveBtn.addEventListener("click", () => {
      const updatedTitle = editForm.querySelector("#editTitle").value;
      const updatedDesc = editForm.querySelector("#editDesc").value;
      updateTodo(index, updatedTitle, updatedDesc);
    });
  });

  if (todoArr.length === 0) {
    noTodo.style.display = "flex";
  } else {
    noTodo.style.display = "none";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isTitleValid = inputTitle.value.trim() !== "";
  const isDescValid = inputDesc.value.trim() !== "";
  if (!isTitleValid || !isDescValid) {
    Toastify({
      text: "Title and description are required",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
      stopOnFocus: true,
    }).showToast();
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "todos"), {
      title: inputTitle.value,
      description: inputDesc.value,
      uid: auth.currentUser.uid,
      timestamp: Timestamp.fromDate(new Date()),
    });
    console.log(docRef.id, "docRef id");
    todoArr.unshift({
      title: inputTitle.value,
      description: inputDesc.value,
      uid: userUid,
      docId: docRef.id,
    });
    Toastify({
      text: "Todo added successfully",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      stopOnFocus: true,
    }).showToast();
    inputDesc.value = "";
    inputTitle.value = "";
    renderTodo();
  } catch (error) {
    Toastify({
      text: `Error: ${error.message}`,
      duration: 5000,
      gravity: "top",
      position: "left",
      backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
      stopOnFocus: true,
    }).showToast();
    console.log(error);
  }
});

function deleteTodo(index) {
  deleteDoc(doc(db, "todos", todoArr[index].docId))
    .then(() => {
      todoArr.splice(index, 1);
      Toastify({
        text: "Todo Deleted",
        duration: 3000,
        gravity: "bottom",
        position: "center bottom",
        backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
        stopOnFocus: true,
      }).showToast();
      renderTodo();
    })
    .catch((e) => {
      console.log(e);
    });
}
function toggleEditForm(editForm) {
  const isVisible = editForm.style.display === "block";
  editForm.style.display = isVisible ? "none" : "block";
}

function updateTodo(index, updatedTitle, updatedDesc) {
  const todoToUpdate = todoArr[index];

  if (updatedTitle !== "" && updatedDesc !== "") {
    updateDoc(doc(db, "todos", todoToUpdate.docId), {
      title: updatedTitle,
      description: updatedDesc,
    })
      .then(() => {
        todoArr[index].title = updatedTitle;
        todoArr[index].description = updatedDesc;

        Toastify({
          text: "Todo Updated",
          duration: 3000,
          gravity: "bottom",
          position: "center bottom",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          stopOnFocus: true,
        }).showToast();

        renderTodo();
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    Toastify({
      text: "Update InputField Required",
      duration: 3000,
      gravity: "center",
      position: "center",
      backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
      stopOnFocus: true,
    }).showToast();
  }
}

logOut.addEventListener("click", () => {
  console.log("object");
  signOut(auth)
    .then(() => {
      console.log("User signed out");
      window.location = "../index.html";
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
});
