import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! try agian');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Congratulations! 🎉 You've successfully signed up!`
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

export const CreateNewReviewonTour = async (ct_id, rating, review) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${ct_id}/reviews`,
      // url: `http://127.0.0.1:3000/api/v1/tours/${ct_id}/reviews`,
      data: {
        rating,
        review,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'REVIEW CAUGHT');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
