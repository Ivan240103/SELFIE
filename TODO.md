# Cose da fare

## Progetto base

### Client
- [x] memorizzare User nel localStorage per creare eventi, task...
- [ ] view time machine
- [ ] home dashboard
  - [ ] ultima nota modificata
  - [ ] ultima sessione pomodoro oppure crea nuova
  - [ ] 3 task a scadenza più ravvicinata
  - [ ] prossimo evento
- [ ] eventi e task
  - [ ] calendario month
  - [ ] calendario week
  - [ ] calendario day
  - [ ] creazione evento
  - [ ] visualizzazione evento specifico
  - [ ] modifica di un evento
  - [ ] eliminazione di un evento
  - [ ] creazione task
  - [ ] visualizzazione task specifico
  - [ ] modifica task
  - [ ] eliminazione task
- [ ] solo task
  - [ ] task scaduti
- [ ] note
  - [ ] tutte le note
  - [ ] nota specifica
  - [ ] modifica di una nota
  - [ ] eliminazione nota
  - [ ] ordinamento note ???
- [ ] pomodoro
  - [ ] schermata timer pomodoro
- [ ] profilo utente
  - [ ] pagina del profilo personale

### Server
- [ ] criptare la password nel db
- [ ] criptare la password nel tragitto c <---> s
- [x] time machine
- [x] route per eventi
  - [x] creazione nuovo evento
  - [x] ottenere tutti gli eventi
  - [x] ottenere un evento specifico
  - [x] modificare un evento specifico
  - [x] eliminare un evento specifico
  - [x] modificare un evento ripetibile
  - [x] eliminare un evento ripetibile
- [x] route per task
  - [x] creazione nuovo task
  - [x] ottenere tutti i task
  - [x] ottenere tutti i task non completati
  - [x] ottenere un task specifico
  - [x] ottenere task in un intervallo di tempo dato
  - [x] modificare un task specifico
  - [x] segnare un task come completato o non
  - [x] eliminare un task specifico
- [ ] route per utenti
  - [x] controllare funzionamento di Passport
  - [x] registrare un nuovo utente
  - [x] login dell'utente
  - [x] logout dell'utente
  - [x] ottenere i dati di un utente specifico
  - [x] aggiornare i dati di un utente
  - [ ] modificare la password
  - [ ] recupero della password
  - [x] eliminare un utente
- [x] route per pomodoro (ogni user max 1 pomodoro salvato)
  - [x] salvare nuovo pomodoro
  - [x] prendere i dati del pomodoro dell'utente
  - [x] modificare un pomodoro specifico
  - [x] eliminare un pomodoro specifico (finito o eliminato)
- [x] route per note
  - [x] creare una nuova nota
  - [x] ottenere tutte le note
  - [x] ottenere ultima nota modificata
  - [x] ottenere una nota specifica
  - [x] modificare una nota
  - [x] eliminare una nota

## Estensione 18-27
- [ ] notifica per gli eventi a scelta (mail, SO, whatsapp...), con un certo anticipo e una certa ripetizione
- [ ] notifica crescente di urgenza per le attività
- [ ] note in markdown
- [ ] cicli di pomodoro programmati come eventi
- [ ] cicli non completati si spostano alle giornate successive
- [ ] integrazione con calendari terzi (standard iCalendar?)
- [ ] geolocalizzazione per gli eventi --> NON SPECIFICATO/APPROFONDITO
