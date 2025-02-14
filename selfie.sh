#!/bin/bash

# Script per avviare client e server dell'applicazione e
# gestirne la terminazione.

# termina i processi figli creati
cleanup() {
  echo ""
  echo "Killing client and server pew pew..."
  kill 0
}

# trap cattura il segnale di interruzione Ctrl + C
trap cleanup SIGINT

# avvia il server
echo "Starting server..."
(
  cd server || exit
  npm install
  npx nodemon app.js
) &

# avvia il client
echo "Starting client..."
(
  cd client || exit
  npm install
  npm start
) &

# attende che i processi terminino
wait
