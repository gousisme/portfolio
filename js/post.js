let processed = 0;
let totalRenders = 0;

const checkCompletion = () => {
  processed++;
  if (processed === totalRenders) {
    //console.log('All renders inserted, proceeding with other scripts...');
    initOtherScripts();
  }
};

const initOtherScripts = () => {
  //console.log('Loading other scripts...');
  loadScript('js/plugins.js')
    .then(() => {
      return loadScript('js/main.js');
    })
};


const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    document.body.appendChild(script);
  });
};

fetch('renders.json')
  .then(response => response.json())
  .then(data => {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    totalRenders = data.renders.length;
    
    data.renders.forEach((render, index) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.innerHTML = `
        <div class="swiper-slide-inner" data-swiper-parallax="50%">
          <div class="swiper-slide-inner-bg">
            ${render.type === 'video' ? `
              <video playsinline autoplay muted loop onloadeddata="checkCompletion()">
                <source src="${render.link}" type="video/mp4">
              </video>
            ` : `
              <img src="${render.link}" alt="${render.title}" onload="checkCompletion()">
            `}
          </div>
          <div class="overlay overlay-dark-60"></div>
          <div class="swiper-slide-inner-txt">
            <a href="${render.artstation}" target="_blank">
              <h2 class="hero-subheading fadeIn-element introduction">
                <span>Render #${index + 1}</span>
              </h2>
              <div class="inner-divider-half"></div>
              <h1 class="hero-heading fadeIn-element introduction">
                ${render.title}
              </h1>
              ${render.comment ? `<h2 class="comment fadeIn-element introduction">${render.comment}</h2>` : ''}
            </a>
          </div>
        </div>
      `;
      swiperWrapper.appendChild(slide);
      if (render.type !== 'video') checkCompletion(); // Images trigger completion on load
    });
  })
  .catch(error => console.error('Error loading renders:', error));
