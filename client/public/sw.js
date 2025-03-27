// service worker che si mette in ascolto delle notifiche
// push e poi le mostra

/* eslint-disable no-restricted-globals */
self.addEventListener("push", event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "./logo192.png",
  });
});
