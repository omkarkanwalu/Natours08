import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51NXjrISGyyHzPEQzzwkGfnSZCsGzI0XNCMtDnmcJoSt3XVNIx4nje5W9dxPO37njA1R2p39fpVznuT8uKnZ1YJTt00Jeb2z8Jb'
  );
  try {
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    // console.log(session);

    //note: stripe object correctly initialized
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
