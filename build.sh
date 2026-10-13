#!/bin/sh
# Génère les trois versions à partir de template.html
cd "$(dirname "$0")"
gen() { sed -e "s/__MODE__/$1/" -e "s/__TITLE__/$2/" -e "s/__BG__/$3/" template.html > "cafe-$1.html"; }
gen morning "Café Komorebi Matin" "#94d0f2"
gen sunset "Café Komorebi Crépuscule" "#d9708e"
gen night "Café Komorebi Nuit" "#0b1236"
