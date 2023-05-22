const paymentFormDOM = document.querySelector(".payment-form");
const kakaoPay = document.getElementById("kakaoPay") as HTMLButtonElement;

if (paymentFormDOM) {
  paymentFormDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/payment/ready");
    const url = await response.json();
    window.location = url;
  });
}
