# Cose da fare

## Progetto base

### Client
- [x] memorizzare User nel localStorage per creare eventi, task...
- [x] view time machine
- [x] home dashboard
  - [x] ultima nota modificata
  - [x] ultima sessione pomodoro oppure crea nuova
  - [x] 3 task a scadenza più ravvicinata
  - [x] prossimo evento
- [x] eventi e task
  - [x] calendario month
  - [x] calendario week
  - [x] calendario day
  - [x] creazione evento
  - [x] visualizzazione evento specifico
  - [x] modifica di un evento
  - [x] eliminazione di un evento
  - [x] creazione task
  - [x] visualizzazione task specifico
  - [x] modifica task
  - [x] eliminazione task
- [x] solo task
  - [x] visualizzazione task come lista a sè
  - [x] GESTIRE I TASK OLTRE LA SCADENZA (senza notifica)
- [ ] note
  - [x] tutte le note
  - [x] nota specifica
  - [x] modifica di una nota
  - [x] eliminazione nota
  - [x] ordinamento note ???
- [ ] pomodoro
  - [ ] schermata timer pomodoro
- [x] profilo utente
  - [x] pagina del profilo personale

### Server
- [x] criptare la password nel db
- [x] criptare la password nel tragitto c <---> s
- [x] time machine
- [x] route per eventi
  - [x] creazione nuovo evento
  - [x] ottenere tutti gli eventi
  - [x] ottenere un evento specifico
  - [x] modificare un evento specifico
  - [x] eliminare un evento specifico
  - [x] creare un evento ripetibile
  - [x] modificare un evento ripetibile
- [x] route per task
  - [x] creazione nuovo task
  - [x] ottenere tutti i task
  - [x] ottenere tutti i task non completati
  - [x] ottenere un task specifico
  - [x] modificare un task specifico
  - [x] segnare un task come completato o non
  - [x] eliminare un task specifico
- [x] route per utenti
  - [x] controllare funzionamento di Passport
  - [x] registrare un nuovo utente
  - [x] login dell'utente
  - [x] logout dell'utente
  - [x] ottenere i dati di un utente specifico
  - [x] aggiornare i dati di un utente
  - [x] modificare la password
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

## Nice to have
- [ ] recupero della password tramite mail
- [x] drag and drop eventi e task
- [ ] doppio click per creare evento/task
- [x] button per mostrare la psw in chiaro

## Estensione 18-27
- [x] notifica per gli eventi a scelta (mail, SO, whatsapp...), con un certo anticipo e una certa ripetizione
  - [x] eventi ricorrenti
  - [x] aggiungere il db
  - [x] filtrare a chi inviare le notifiche
- [x] notifica crescente di urgenza per le attività
- [ ] alla tot ora del giorno prendi tutti i task non completati ma scaduti e reimposta la notifica a false, in modo che al giro successivo di check vengano nuovamente notificate. fare la stessa cosa anche per i recurrent events
- [x] disabilitare le notifiche
- [ ] quando ci si sposta nel tempo le notifiche vanno controllate
- [x] note in markdown
- [ ] cicli di pomodoro programmati come eventi
- [ ] cicli non completati si spostano alle giornate successive
- [x] integrazione con calendari terzi (standard iCalendar?)
- [ ] geolocalizzazione per gli eventi --> NON SPECIFICATO/APPROFONDITO
