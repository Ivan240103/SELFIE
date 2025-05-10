# SELFIE
Progetto di Tecnologie Web 2024/25 - Unibo

## Premesse
Il client è realizzato con React.js e permette di interagire con il server, il quale è sviluppato con Node.js attraverso Express. Il server ascolta sulla porta 8000 e si appoggia ad un database MongoDB.  
L'applicazione è hostata sulle macchine del DISI ed è raggiungibile al link https://site242515.tw.cs.unibo.it/
Per informazioni esaustive consultare la relazione allegata.

## Gerarchia
Il progetto segue una precisa struttura gerarchica che separa logicamente i vari elementi del client e del server. Qui di seguito è fornita una breve rappresentazione schematizzata:
- `/client`
  - `/public`
    - `/audio`: audio riproducibili dal client
    - `/images`: icone dell'applicazione
    - `/tomato`: implementazione del timer pomodoro
  - `/src`
    - `/components`
      - `/Calendar`: calendario, eventi e attività
      - `/Dashboard`: homepage e anteprime
      - `/Header`: intestazione con Time Machine e notifiche
      - `/Notes`: editor di note
      - `/Tomato`: wrapper per il pomodoro
      - `/User`: gestione dell'account
    - `/contexts`: gestione di tempo ed autenticazione
    - `/css`: stili globali
    - `/fonts`: font scaricati
    - `/utils`: moduli di utilità
- `/server`
  - `/google`: accesso e import da Google
  - `/images`
    - `/uploads`: foto profilo degli utenti
  - `/middleware`: gestione autenticazione ed upload
  - `/models`: modelli per il db
  - `/routes`: accesso alle informazioni
  - `/services`: operazioni logicamente correlate

## Debug locale
Per avviare server e client è realizzato uno script unico, il quale installa i loro pacchetti e li avvia:
```bash
./selfie.sh
```

## Autori
|Nome e cognome|Matricola|Email|
|--------------|---------|-----|
|Ivan De Simone|0001069314|ivan.desimone@studio.unibo.it|
|Payam Salarieh|0001077673|payam.salarieh@studio.unibo.it|
|Nicolò Tambini|0001088816|nicolo.tambini@studio.unibo.it|
