
function createCard(imgSrc, title, subtitle) {
  const card = document.createElement('div');
  card.classList.add('card');

  const img = document.createElement('img');
  img.src = imgSrc;

  const content = document.createElement('div');
  content.classList.add('content');

  const h1 = document.createElement('h1');
  h1.textContent = title;

  const h3 = document.createElement('h3');
  h3.textContent = subtitle;

  content.appendChild(h1);
  content.appendChild(h3);
  card.appendChild(img);
  card.appendChild(content);

  return card;
}

// Data for the cards
const cardsData = [
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png", title: "Product Design", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/2.png", title: "Custom Website", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/3.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/2.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/3.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/1.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/2.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
  { img: "https://colorlib.com/preview/theme/seogo/img/case_study/3.png", title: "Digital Marketing", subtitle: "UI/UX, Design" },
];

// Select the .inner container
const innerContainer = document.querySelector('.center .wrapper .inner');

// Generate and append cards dynamically
cardsData.forEach(data => {
  const card = createCard(data.img, data.title, data.subtitle);
  innerContainer.appendChild(card);
});


const buttonsWrapper = document.querySelector(".map");
const slides = document.querySelector(".inner");

buttonsWrapper.addEventListener("click", e => {
  if (e.target.nodeName === "BUTTON") {
    Array.from(buttonsWrapper.children).forEach(item =>
      item.classList.remove("active")
    );
    if (e.target.classList.contains("first")) {
      slides.style.transform = "translateX(-0%)";
      e.target.classList.add("active");
    } else if (e.target.classList.contains("second")) {
      slides.style.transform = "translateX(-33.33333333333333%)";
      e.target.classList.add("active");
    } else if (e.target.classList.contains('third')){
      slides.style.transform = 'translatex(-66.6666666667%)';
      e.target.classList.add('active');
    }
  }
});
