import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, db } from "./config.js";
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.querySelector("#form");
const name = document.querySelector("#name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(async (userCredential) => {
        const user = userCredential.user;
        try {
          const docRef = await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: name.value,
            email: email.value,
            password: password.value,
          });
          console.log("Document written with ID: ", docRef.id);
          window.location = "../index.html";
        } catch (e) {
          console.log(e, "error adding ");
        }
      })
      .catch((error) => {
        const errorMessage = error.message;
        Toastify({
          text: `${errorMessage}`,
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
          stopOnFocus: true,
        }).showToast();
        // console.log(errorMessage);
      });
  });
} else {
  console.error("Form element not found");
}
