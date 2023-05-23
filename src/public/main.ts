const kakaoPaymentFormDOM = document.querySelector(".payment-form");
const kakaoPay = document.getElementById("kakaoPay") as HTMLButtonElement;

if (kakaoPaymentFormDOM) {
  kakaoPaymentFormDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/kakao/payment/ready");
    const url = await response.json();
    window.location = url;
  });
}
