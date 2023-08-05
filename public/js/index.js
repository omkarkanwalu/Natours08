import { displayMap } from './mapbox';
import { login, logout, signup, CreateNewReviewonTour } from './login';
import { updateSettings } from './updateSetting';
import { bookTour } from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login-diff');
const signupForm = document.querySelector('.signup-id');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const reviewBtn = document.querySelectorAll('.review-it');

const hiddenDiv = document.getElementById('hiddenDiv12');
const reviewSubmit = document.querySelector('.review-submit');
let ct_id;

if (reviewBtn) {
  reviewBtn.forEach((el) => {
    el.addEventListener('click', function (e) {
      ct_id = el.getAttribute('current-tour-Id');
      console.log(ct_id);
      hiddenDiv.classList.toggle('visible');
    });
  });
}

if (reviewSubmit) {
  reviewSubmit.addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = document.getElementById('ratingInput').value;
    const review = document.getElementById('reviewInput').value;
    CreateNewReviewonTour(ct_id, rating, review);
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    bookBtn.textContent = 'processing....';
    const tourId = bookBtn.getAttribute('data-tour-Id');

    bookTour(tourId);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sign-name').value;
    const email = document.getElementById('sign-email').value;
    const password = document.getElementById('sign-password').value;
    const passwordconfirm = document.getElementById(
      'sign-passwordconfirm'
    ).value;
    signup(name, email, password, passwordconfirm);
  });
}

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = '....updating';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSetting(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
