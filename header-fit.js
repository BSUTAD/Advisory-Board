(() => {
 const title = document.querySelector('.brand-title h1');
 const line = title.querySelector('.title-line:last-child');
 function fitTitle() {
   if (window.matchMedia('(min-width: 601px)').matches) {
     title.style.removeProperty('font-size');
     return;
   }
   title.style.fontSize = '40px';
   const available = title.clientWidth;
   const measured = line.getBoundingClientRect().width;
   if (available && measured) title.style.fontSize = (40 * available / measured) + 'px';
 }
 const observer = new ResizeObserver(fitTitle);
 observer.observe(document.querySelector('.brand'));
 document.fonts.ready.then(fitTitle);
 fitTitle();
})();
