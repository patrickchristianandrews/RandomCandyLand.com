/* Random Candy Land: GA4 page visits only.
 * Do not send questionnaire responses, partner invitations, fragments,
 * URL query parameters, search phrases, or identifying user input.
 */
(function () {
  'use strict';
  var measurementId = 'G-66LXYNEMLJ';
  var cleanUrl = location.origin + location.pathname;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    page_location: cleanUrl,
    page_path: location.pathname,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  // Exactly one initial page_view per loaded document; never track hash-based
  // quiz tabs or #partner-results?data=... links.
  window.gtag('event', 'page_view', {
    send_to: measurementId,
    page_title: document.title,
    page_location: cleanUrl,
    page_path: location.pathname
  });
})();
