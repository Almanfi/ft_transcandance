import Ura from "ura";

function Notification() {
  const [render] = Ura.init();

  return render(() => (
    <svg
      data-name="Layer 3"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
    >
      <path d="M89.3 75.226V49.8a24.8 24.8 0 0 0-15.47-22.944 9.309 9.309 0 0 0-18.61 0A24.8 24.8 0 0 0 39.75 49.8v25.349a11.418 11.418 0 0 0 .344 22.832h10.288a14.3 14.3 0 0 0 28.288 0h9.23a11.42 11.42 0 0 0 1.4-22.755zM64.524 22.033a5.1 5.1 0 0 1 4.82 3.472 24.509 24.509 0 0 0-9.638 0 5.1 5.1 0 0 1 4.818-3.472zm0 7.217A20.575 20.575 0 0 1 85.077 49.8v25.331H43.972V49.8a20.578 20.578 0 0 1 20.556-20.55zm0 76.717a10.112 10.112 0 0 1-9.87-7.986h19.738a10.105 10.105 0 0 1-9.862 7.986zM87.9 93.758H40.094a7.2 7.2 0 0 1 0-14.405H87.9a7.2 7.2 0 1 1 0 14.405z" />
    </svg>
  ));
}

export default Notification;
