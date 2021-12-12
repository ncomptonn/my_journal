const firstPassword = document.getElementById('password')
const secondPassword = document.getElementById('checkPassword')
const submitBtn = document.getElementById('submitBtn')

running = true;

submitBtn.addEventListener("click", () => {
    running = false;
});

firstPassword.addEventListener('input', () => checkEquality())

secondPassword.addEventListener('input', () => checkEquality())

const checkEquality = () => {
    console.log(firstPassword.value == secondPassword.value)
    firstPassword.value == secondPassword.value ? submitBtn.disabled = false : submitBtn.disabled = true
}