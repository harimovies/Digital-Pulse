const signUp = document.getElementById("signUp");
const signIn = document.getElementById("signIn");
const form1 = document.getElementById("form1");
const form2 = document.getElementById("form2");
// signUp.addEventListener("click", () => {
//   signIn.style.display = "inline";
//   form1.style.display = "none";
//   form2.style.display = "block";
//   signUp.style.display = "none";
// });
// signIn.addEventListener("click", () => {
//   signUp.style.display = "inline";
//   form1.style.display = "block";
//   form2.style.display = "none";
//   signIn.style.display = "none";
// });
signIn.addEventListener("click", () => {
  window.location.href = "/login";
});
signUp.addEventListener("click", () => {
  window.location.href = "/user_register";
});
