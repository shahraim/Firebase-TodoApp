import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./config.js";

const form = document.querySelector("#form");
const email = document.querySelector("#email");
const password = document.querySelector("#password");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      const user = userCredential.user;
      window.location = "../public/todo.html";
      console.log(user);
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
