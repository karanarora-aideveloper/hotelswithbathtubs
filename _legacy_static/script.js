{"@context":"https://schema.org","@graph":[{"@type":"CollectionPage","@id":"https://hotelwithbathtub.com/","url":"https://hotelwithbathtub.com/","name":"Hotel with Bathtub - Discover hotels with bathtubs for a romantic night as a couple","isPartOf":{"@id":"https://hotelwithbathtub.com/#website"},"description":"Discover hotels with bathtubs for a romantic night as a couple","breadcrumb":{"@id":"https://hotelwithbathtub.com/#breadcrumb"},"inLanguage":"en-US"},{"@type":"BreadcrumbList","@id":"https://hotelwithbathtub.com/#breadcrumb","itemListElement":[{"@type":"ListItem","position":1,"name":"Home"}]},{"@type":"WebSite","@id":"https://hotelwithbathtub.com/#website","url":"https://hotelwithbathtub.com/","name":"Hotel with Bathtub","description":"Discover hotels with bathtubs for a romantic night as a couple","potentialAction":[{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://hotelwithbathtub.com/?s={search_term_string}"},"query-input":"required name=search_term_string"}],"inLanguage":"en-US"}]}

/* <![CDATA[ */
window._wpemojiSettings = {"baseUrl":"https:\/\/s.w.org\/images\/core\/emoji\/15.0.3\/72x72\/","ext":".png","svgUrl":"https:\/\/s.w.org\/images\/core\/emoji\/15.0.3\/svg\/","svgExt":".svg","source":{"concatemoji":"https:\/\/hotelwithbathtub.com\/wp-includes\/js\/wp-emoji-release.min.js?ver=6.5.10"}};
/*! This file is auto-generated */
!function(i,n){var o,s,e;function c(e){try{var t={supportTests:e,timestamp:(new Date).valueOf()};sessionStorage.setItem(o,JSON.stringify(t))}catch(e){}}function p(e,t,n){e.clearRect(0,0,e.canvas.width,e.canvas.height),e.fillText(t,0,0);var t=new Uint32Array(e.getImageData(0,0,e.canvas.width,e.canvas.height).data),r=(e.clearRect(0,0,e.canvas.width,e.canvas.height),e.fillText(n,0,0),new Uint32Array(e.getImageData(0,0,e.canvas.width,e.canvas.height).data));return t.every(function(e,t){return e===r[t]})}function u(e,t,n){switch(t){case"flag":return n(e,"\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f","\ud83c\udff3\ufe0f\u200b\u26a7\ufe0f")?!1:!n(e,"\ud83c\uddfa\ud83c\uddf3","\ud83c\uddfa\u200b\ud83c\uddf3")&&!n(e,"\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f","\ud83c\udff4\u200b\udb40\udc67\u200b\udb40\udc62\u200b\udb40\udc65\u200b\udb40\udc6e\u200b\udb40\udc67\u200b\udb40\udc7f");case"emoji":return!n(e,"\ud83d\udc26\u200d\u2b1b","\ud83d\udc26\u200b\u2b1b")}return!1}function f(e,t,n){var r="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?new OffscreenCanvas(300,150):i.createElement("canvas"),a=r.getContext("2d",{willReadFrequently:!0}),o=(a.textBaseline="top",a.font="600 32px Arial",{});return e.forEach(function(e){o[e]=t(a,e,n)}),o}function t(e){var t=i.createElement("script");t.src=e,t.defer=!0,i.head.appendChild(t)}"undefined"!=typeof Promise&&(o="wpEmojiSettingsSupports",s=["flag","emoji"],n.supports={everything:!0,everythingExceptFlag:!0},e=new Promise(function(e){i.addEventListener("DOMContentLoaded",e,{once:!0})}),new Promise(function(t){var n=function(){try{var e=JSON.parse(sessionStorage.getItem(o));if("object"==typeof e&&"number"==typeof e.timestamp&&(new Date).valueOf()<e.timestamp+604800&&"object"==typeof e.supportTests)return e.supportTests}catch(e){}return null}();if(!n){if("undefined"!=typeof Worker&&"undefined"!=typeof OffscreenCanvas&&"undefined"!=typeof URL&&URL.createObjectURL&&"undefined"!=typeof Blob)try{var e="postMessage("+f.toString()+"("+[JSON.stringify(s),u.toString(),p.toString()].join(",")+"));",r=new Blob([e],{type:"text/javascript"}),a=new Worker(URL.createObjectURL(r),{name:"wpTestEmojiSupports"});return void(a.onmessage=function(e){c(n=e.data),a.terminate(),t(n)})}catch(e){}c(n=f(s,u,p))}t(n)}).then(function(e){for(var t in e)n.supports[t]=e[t],n.supports.everything=n.supports.everything&&n.supports[t],"flag"!==t&&(n.supports.everythingExceptFlag=n.supports.everythingExceptFlag&&n.supports[t]);n.supports.everythingExceptFlag=n.supports.everythingExceptFlag&&!n.supports.flag,n.DOMReady=!1,n.readyCallback=function(){n.DOMReady=!0}}).then(function(){return e}).then(function(){var e;n.supports.everything||(n.readyCallback(),(e=n.source||{}).concatemoji?t(e.concatemoji):e.wpemoji&&e.twemoji&&(t(e.twemoji),t(e.wpemoji)))}))}((window,document),window._wpemojiSettings);
/* ]]> */

</script>
<script type="text/javascript" src="https://hotelwithbathtub.com/wp-includes/js/jquery/jquery-migrate.min.js?ver=3.4.1" id="jquery-migrate-js">
</script>
<script type="text/javascript" src="https://hotelwithbathtub.com/wp-content/themes/newspaperss/js/newspaperss_other.min.js?ver=1" id="newspaperss_other-js">

document.addEventListener('DOMContentLoaded', function() {
  
  const baseUrl = window.location.href;

  const articleContainer = document.querySelector('.single-content-wrap');
  
  if (articleContainer) {
    const hotelHeaders = articleContainer.querySelectorAll('h3');
    
    const hotels = []; 

    hotelHeaders.forEach(header => {
      const hotelName = header.textContent.trim();
      console.log(`Processing hotel: ${hotelName}`);
      
      const slug = hotelName.toLowerCase().replace(/\s+/g, '-');
      const hotelUrl = `${baseUrl.split('#')[0]}#${slug}`;
      console.log(`Constructed URL: ${hotelUrl}`);
      
      const addressLabel = 'Address: ';
      let postalAddressName = '';
      let imageUrl = '';
      let currentElement = header.nextElementSibling;

      while (currentElement) {
        if (currentElement.tagName === 'P' && currentElement.textContent.startsWith(addressLabel)) {
          postalAddressName = currentElement.textContent.replace(addressLabel, '').trim();
          
          let figureElement = currentElement.nextElementSibling;
          while (figureElement && figureElement.tagName !== 'FIGURE') {
            figureElement = figureElement.nextElementSibling;
          }
          
          if (figureElement && figureElement.classList.contains('wp-block-image')) {
            const imgElement = figureElement.querySelector('img');
            if (imgElement) {
              imageUrl = imgElement.src;
            }
          }
          break;
        }
        currentElement = currentElement.nextElementSibling;
      }


      hotels.push({
        "@type": "Hotel",
        "name": hotelName,
        "url": hotelUrl || baseUrl, 
        "image": imageUrl || "https://hotelwithbathtub.com/wp-content/uploads/rakabi-the-fern-igatpuri-with-bathtub.jpeg", 
        "address": {
          "@type": "PostalAddress",
          "name": postalAddressName
        },
        "amenityFeature": [
          {
            "@type": "LocationFeatureSpecification",
            "name": "Bathtub in room", 
            "value": true 
          }
        ] 
      });
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(hotels, null, 2);
      

      document.head.appendChild(script);
    });


    const carouselSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": hotels.map((hotel, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": hotel
      }))
    };


    const carouselScript = document.createElement('script');
    carouselScript.type = 'application/ld+json';
    carouselScript.textContent = JSON.stringify(carouselSchema, null, 2);


    document.head.appendChild(carouselScript);

  } else {
    console.error('Container with class "single-content-wrap" not found.');
  }
});



  window.addEventListener('DOMContentLoaded', function() {
    // Espera a que el DOM esté completamente cargado

    // Selecciona todas las imágenes en la página
    var images = document.querySelectorAll('img');

    // Itera sobre todas las imágenes
    images.forEach(function(img) {
      // Obtiene el valor del atributo 'alt' de cada imagen
      var altText = img.getAttribute('alt');

      // Verifica si el atributo 'alt' tiene un valor
      if (altText) {
        // Establece el valor de 'alt' como el valor de 'title'
        img.setAttribute('title', altText);
      }
    });
  });


document.addEventListener("DOMContentLoaded", function() {
    var h2Element = document.querySelector('.navigation.pagination .screen-reader-text');
    if (h2Element) {
        var newElement = document.createElement('p'); // O puedes crear un div con document.createElement('div');
        newElement.textContent = ''; // Vacía el contenido del nuevo elemento
        h2Element.parentNode.replaceChild(newElement, h2Element);
    }
});

</script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-LC9RXWPR68');

</script>
      <script>
        /(trident|msie)/i.test(navigator.userAgent) && document.getElementById && window.addEventListener && window.addEventListener("hashchange", function() {
          var t, e = location.hash.substring(1);
          /^[A-z0-9_-]+$/.test(e) && (t = document.getElementById(e)) && (/^(?:a|select|input|button|textarea)$/i.test(t.tagName) || (t.tabIndex = -1), t.focus())
        }, !1);
      
