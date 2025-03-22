let processed = 0;
let totalRenders = 0;
let timeout; // To prevent infinite wait

const checkCompletion = () => {
  processed++;
  console.log(`Processed: ${processed}/${totalRenders}`);
  if (processed >= totalRenders && totalRenders > 0) {
    clearTimeout(timeout);
    initOtherScripts();
  }
};

const initOtherScripts = () => {
  console.log("Initializing other scripts...");
  loadScript('js/plugins.js')
    .then(() => loadScript('js/main.js'));
};

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    document.body.appendChild(script);
  });
};

// Fetch renders.json and set totalRenders first
fetch('renders.json')
  .then(response => response.json())
  .then(data => {
    const swiperWrapper = document.querySelector('.swiper-wrapper');

    if (!swiperWrapper || !data.renders || data.renders.length === 0) {
      console.error('No renders found');
      checkCompletion(); // Prevent infinite wait
      return;
    }

    totalRenders = data.renders.length;
    console.log(`Total renders: ${totalRenders}`);

    data.renders.forEach((render, index) => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.innerHTML = `
        <div class="swiper-slide-inner" data-swiper-parallax="50%">
          <div class="swiper-slide-inner-bg">
            ${render.type === 'video' ? `
              <video playsinline autoplay muted loop onloadeddata="checkCompletion()" onerror="checkCompletion()">
                <source src="${render.link}" type="video/mp4">
              </video>
            ` : `
              <img src="${render.link}" alt="${render.title}" onload="checkCompletion()" onerror="checkCompletion()">
            `}
          </div>
          <div class="overlay overlay-dark-${render.dim}"></div>
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
      if (render.type !== 'video') checkCompletion();
    });

    // Set a timeout to avoid infinite wait
    timeout = setTimeout(() => {
      console.warn("Timeout reached, initializing scripts...");
      initOtherScripts();
    }, 5000);
  })
  .catch(error => {
    console.error('Error loading renders:', error);
    checkCompletion(); // Prevent infinite loop
  });
