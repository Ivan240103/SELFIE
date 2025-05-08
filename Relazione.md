<div style="
  height:90vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
">
  <img src="logoUnibo.png" width="400px" style="margin-bottom:50px;">
  <h1>SELFIE</h1>
  <h2>Progetto di Tecnologie Web 2024/25</h2>
  <h2><i>Estensione 18-27</i></h2>
  <div style="display:flex; flex-direction:column;">
    <h3>Ivan De Simone</h3>
    <h3>Payam Salarieh</h3>
    <h3>Nicolò Tambini</h3>
  </div>
</div>

<!-- pagebreak -->

## Introduzione
Il progetto SELFIE si propone di semplificare la vita di uno studente universitario, consentendo l'organizzazione dei propri impegni e la programmazione delle attività, fornendo al contempo strumenti per lo studio quali editor di testo e timer pomodoro.

Accedendo alla webapp ci si trova di fronte ad una dashboard, che presenta le principali funzionalità con annessa una piccola preview. Le sezioni raggiungibili dalla dashboard sono:
\- il profilo utente, dove modificare le proprie informazioni personali
\- il calendario, dove gestire eventi ed attività
\- le note, dotate di un editor di testo
\- la lista di attività, dove trovare interamente le attività pianificate
\- il pomodoro, per organizzare il tempo di studio
SELFIE mette in campo un servizio di autenticazione e gestione degli account minimale ma efficace, garantendo affidabilità ed efficienza.

Il progetto comprende un client sviluppato con React.js, il quale comunica con un backend composto dal server Node.js e dal database MongoDB. L'applicazione risiede sulle macchine del DISI, ed è raggiungibile al seguente link: [SELFIE](https://site242515.tw.cs.unibo.it/)

## Funzionalità

### Eventi
Il calendario consente la programmazione di eventi, contraddistinti da un titolo ed una descrizione. L'evento, che può impiegare uno o più giorni, può avere orari di inizio e fine determinati oppure occupare l'intera giornata. È possibile impostare una regola di ricorrenza per fare in modo che si ripeta ogni $n$ giorni, mesi o anni ed una scadenza indicata come numero di ripetizioni, data limite o indefinita. L'evento ha la possibilità di essere geolocalizzato, nel qual caso sarà presente un collegamento per vedere la location su Google Maps. È inoltre implementato un servizio di notifica, previa attivazione, attivato con un certo anticipo e recapitato tramite notifiche push o via email.
Previo accesso con Google, è possibile visualizzare nel calendario gli eventi importati da Google Calendar, non è però consentita la modifica o l'eliminazione di essi.

### Attività
Il calendario mette inoltre a disposizione la possibilità di segnare dei task, ovvero attività da completare entro una certa data. Anche queste sono caratterizzate da un titolo ed una descrizione, nonché dal giorno di scadenza. Le attività non completate entro la data pianificata vengono segnalate come "in ritardo". Come per gli eventi, è possibile impostare delle notifiche con un certo anticipo tramite un determinato servizio, con la differenza che le notifiche continuano ad arrivare giornalmente per segnalare eventuali ritardi fino al completamento dell'attività associata.
Dalla dashboard è possibile accedere ad una sezione specifica per le attività che mostra quest'ultime in formato lista, suddividendole in completate e non. Come dal calendario, anche da quest'area è possibile marcare un task come portato a termine.

### Note
All'interno dell'applicazione è presente un editor di testo che permette di scrivere, modificare ed eliminare note. Una nota possiede un titolo ed una serie di categorie identificate come tag. Il contenuto della nota può essere di lunghezza arbitraria e supporta la sintassi markdown classica.
Tutte le note salvate sono visualizzabili tramite un elenco ordinabile (per data di ultima modifica, titolo, data di creazione o lunghezza), dove ogni nota fornisce una breve preview del suo contenuto. Tramite il menù opzioni di ogni nota è possibile copiare o modificare il contenuto, duplicare la nota, scaricarla come file .md oppure eliminarla definitivamente. È possibile inoltre effettuare una ricerca testuale all'interno dei campi delle note.

### Pomodoro
Molto apprezzato per temporizzare l'andamento dello studio, l'applicazione mette a disposizione un timer pomodoro. Esso è un particolare timer che alterna sessioni di studio a periodi di pausa, ripetuti per un numero definito di cicli. Dalla sezione pomodoro è possibile avviare il timer e gestire il suo funzionamento (reset del tempo, restart della sessione e skip della sessione), il tutto con una gradevole e rilassante animazione di sfondo. Nell'impostazione delle durate si può sfruttare un meccanismo che dati i minuti disponibili calcola dei cicli ottimali di studio + pausa.
Sempre dalle impostazioni, è possibile pianificare la sessione pomodoro per un giorno specifico come se fosse un'attività, quindi con trascinamento in caso di ritardo ed eventuali notifiche.

### Time Machine
La Time Machine è un servizio aggiuntivo che permette all'utente di spostarsi avanti e indietro nel tempo per testare le funzionalità temporali senza dover attendere il passaggio reale del tempo. Uno spostamento nel tempo causa l'aggiornamento immediato di tutte le visualizzazioni per rispecchiare la data e l'ora selezionate. Sempre dalla Time Machine è possibile reimpostare il tempo a quello attuale del sistema.

## Dettagli implementativi

#### UI
L'interfaccia grafica è realizzata sfruttando i componenti della libreria [HeroUI](https://www.heroui.com/), i quali implementano tutti gli standard di accessibilità attuali, validano l'input dei form e consentono un comportamento responsivo efficace. Tali componenti sono stati personalizzati tramite il framework CSS [Tailwind](https://tailwindcss.com/), il quale fornisce stili comodamente applicabili inline, senza dover intasare lo spazio dei nomi per riferimenti esterni.

#### Calendario
La visualizzazione del calendario si basa sulla libreria [FullCalendar](https://fullcalendar.io/), che permette una gestione brillante degli eventi. Tramite il plugin di FullCalendar sul client ed il pacchetto [rrule](https://github.com/jkbrzt/rrule) sul server vengono gestite le regole di ricorrenza secondo lo standard iCalendar.
Per quel che concerne la geolocalizzazione degli eventi, viene utilizzata l'API [LocationIQ](https://locationiq.com/) al fine di ricercare una posizione esatta a partire da un testo approssimativo inserito dall'utente. Se tale posizione viene approvata dall'utente, comparirà un bottone per aprirla su Google Maps.
Per quanto riguarda le attività, sarebbero di default visualizzate di colore ambrato. In caso di completamento il colore diventerà verde. Contrariamente, in caso di ritardo il colore diventerà rosso. Discorso valido anche per la lista di attività visualizzabile a parte. Le attività si possono segnare come completate sia dal calendario che dall'elenco, in quanto il componente utilizzato alla base è lo stesso.

#### Notifiche
Il sistema di notifica dell'applicazione è basato su due differenti meccanismi: notifiche web tramite le WebPush API e notifiche via mail tramite il pacchetto `nodemailer`.
Le notifiche sono implementate tramite un demone che viene eseguito ogni 60 secondi: ciascuna esecuzione recupera dal db tutti gli eventi ed attività aventi delle notifiche impostate, verifica se è il momento di mandare la notifica e nel caso richiama le funzioni per recapitarla.
È presente un demone aggiuntivo per notificare le attività in ritardo, il quale viene eseguito ogni 180 secondi. Tale demone prende dal db tutte le attività aventi notifiche impostate, dopodiché per le sole attività in ritardo da almeno un giorno verifica il timestamp dell'ultima notifica. Se è passato almeno un giorno dall'ultima notifica, ne recapita una nuova, altrimenti tace.

#### Profilo
accesso con google, compleanno

#### Time Machine

#### Note
gestione date attuata dal server, [marked](https://www.npmjs.com/package/marked)

#### Pomodoro
animazione, pianificazione

## Gruppo

### Autori

### Contributi

## Intelligenza Artificiale
AI usata per ...
