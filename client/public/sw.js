// service worker che si mette in ascolto delle notifiche
// push e poi le mostra

// TODO: assicurarsi del funzionamento, chat diceva di usare self al posto di this
this.addEventListener("push", event => {
  const data = event.data.json();
  this.registration.showNotification(data.title, {
    body: data.body,
    icon: "./logo192.png",
  });
});
