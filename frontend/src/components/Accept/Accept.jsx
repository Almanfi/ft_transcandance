import Ura from 'ura';

function Accept(props = {}) {
  const [render, State] = Ura.init();
  const [getter, setter] = State(0);

  return render(() => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`.cls-1 {
          fill: none;
          stroke: #000000;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2px;
        }`}
        </style>
      </defs>
      <title>Checkmark</title>
      <g id="checkmark">
        <line className="cls-1" x1="3" y1="16" x2="12" y2="25" />
        <line className="cls-1" x1="12" y1="25" x2="29" y2="7" />
      </g>
    </svg>

  ));
}

export default Accept;
