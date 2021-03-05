const stripe = Stripe("pk_test_qMU1Hz2iXcnsbhAnCz4xf3Uq");

const checkoutBtn = document.getElementById('checkout-btn')
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', function(e) {
    axios.post(`/products/${productId}/buy`)
      .then(response => {
        stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        })
          .then(function(result) {
            // If redirection fails, display an error to the customer.
            if (result.error) {
              console.error(result.error.message)
            }
          });
      })
  })
}