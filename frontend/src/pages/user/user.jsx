import Ura from 'ura';
import Navbar from '../utils/Navbar/Navbar.jsx';
import Swords from '../utils/Swords/Swords.jsx';
import WinCup from '../utils/WinCup/WinCup.jsx';
import Award from '../utils/Award/Award.jsx';

function Carousel({ images }) {
  const [render, State] = Ura.init();
  const [getIndex, setIndex] = State(0);

  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return render(() => (
    <div className="carousel">
      {/* <async loding={}> 
        <Comp/>
      </async> */}
      <button className="carousel__button carousel__button--prev" onClick={prevSlide}>
        &#8592;
      </button>
      <div className="carousel__track">
        <loop on={images}>
          {(image, index) => (
            <div key={index} className={`carousel__slide ${index === getIndex() ? "carousel__slide--active" : ""}`} >
              <img src={image} alt={`Slide ${index + 1}`} />
            </div>
          )}
        </loop>
      </div>
      <button className="carousel__button carousel__button--next" onClick={nextSlide}>
        &#8594;
      </button>
      <div className="carousel__indicators">
        <loop on={images}>
          {(image, index) => (
            <button
              key={index}
              className={`carousel__indicator ${index === getIndex() ? "carousel__indicator--active" : ""}`}
              onClick={() => setCurrentIndex(index)} >

            </button>
          )}
        </loop>
      </div>
    </div>
  ))

}

function User() {
  const [render, State] = Ura.init();
  const [getItem, setItem] = State("item-1");
  const images = [
    "https://via.placeholder.com/600x300?text=Slide+1",
    "https://via.placeholder.com/600x300?text=Slide+2",
    "https://via.placeholder.com/600x300?text=Slide+3",
  ];
  const [getList, setList] = State([
    {
      src: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png",
      title: "Product Design 0", subtitle: "UI/UX, Design",
    },
    {
      src: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png",
      title: "Product Design 1", subtitle: "UI/UX, Design",
    },
    {
      src: "https://colorlib.com/preview/theme/seogo/img/case_study/2.png",
      title: "Product Design 2", subtitle: "UI/UX, Design",
    },
    {
      src: "https://colorlib.com/preview/theme/seogo/img/case_study/3.png",
      title: "Product Design 3", subtitle: "UI/UX, Design",
    },
    {
      src: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png",
      title: "Product Design 4", subtitle: "UI/UX, Design",
    }
  ]);
  const [getValue, setValue] = State(0);

  const handle = (direction) => {
    const totalSlides = getList().length;
    let currentValue = getValue();
    if (direction === "left") {
      currentValue = currentValue - 1;
      if (currentValue < 0) currentValue = totalSlides - 1;
    } else if (direction === "right") {
      currentValue = (currentValue + 1) % totalSlides;
    }
    console.log("set value to", currentValue);
    setValue(currentValue);
  };

  return render(() => (
    <div className="user">
      <Navbar />
      <div id="center" >
        <div className="user-card">
          <img src="/assets/profile.png" alt="" >
          </img>
          <h3>
            Hrima mohammed
          </h3>
        </div>
      </div>
      <div id="bottom">

        <div id="games">
          <div id="history">
            <h4 id="title"><Swords /> Games</h4>
            <div className="children">
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
            </div>
          </div>
          <div id="history">
            <h4 id="title"><Award /> Winrate</h4>
            <div className="children">
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
            </div>
          </div>
          <div id="history">
            <h4 id="title"><WinCup /> Tournaments</h4>
            <div className="children">
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
              <div className="child"><o>42%</o><h4>Pongers</h4></div>
            </div>
          </div>
        </div>

        <div id="friends">
          <div className="center">
            <h1>{getValue()}</h1>
            <div className="wrapper">
              <dloop
                className="inner"
                on={getList()}
                style={{
                  transform: `translateX(-${getValue() * 10}%)`,
                  transition: "2s",
                }}
              >
                {(e, i) => (
                  <div className="card" key={i}>
                    <div className="content">
                      <h1>{e.title}</h1>
                      <h3>{e.subtitle}</h3>
                    </div>
                  </div>
                )}
              </dloop>
            </div>
            <button onclick={() => handle("left")}>left {" <"}</button>
            <button onclick={() => handle("right")}>right {" >"}</button>
          </div>

        </div>

      </div>
    </div>
  ));
}

export default User
