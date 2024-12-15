import Ura from 'ura';

function Input({ name, value, isError }) {
  const [render, State] = Ura.init();
  const placeholder = value.charAt(0).toUpperCase() + value.slice(1);

  return render(() => (
    <input
      name={name.replace(" ", "")}
      type={value === "Password" ? "password" : "text"}
      placeholder={placeholder}
      className={isError ? "is-error" : ""}
    />
  ));
}
export default Input;
