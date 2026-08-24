// 1. Selezioniamo i pulsanti della barra in basso e le sezioni (viste)
const navHome = document.getElementById('navHome');
const navGroups = document.getElementById('navGroups');
const navHistory = document.getElementById('navHistory');

const viewHome = document.getElementById('viewHome');
const viewGroups = document.getElementById('viewGroups');
const viewHistory = document.getElementById('viewHistory');

// Funzione di supporto per cambiare schermata
function switchView(activeView, activeBtn) {
  // Nascondi tutte le viste aggiungendo 'd-none'
  viewHome.classList.add('d-none');
  viewGroups.classList.add('d-none');
  viewHistory.classList.add('d-none');

  // Mostra solo la vista scelta rimuovendo 'd-none'
  activeView.classList.remove('d-none');

  // Gestione dei colori dei tasti nella barra (giallo se attivo, grigio se spento)
  [navHome, navGroups, navHistory].forEach(btn => {
    btn.classList.remove('text-warning');
    btn.classList.add('text-secondary');
  });
  
  activeBtn.classList.remove('text-secondary');
  activeBtn.classList.add('text-warning');
}

// 2. Collega gli eventi "click" ai pulsanti della barra
navHome.addEventListener('click', () => {
  switchView(viewHome, navHome);
});

navGroups.addEventListener('click', () => {
  switchView(viewGroups, navGroups);
});

navHistory.addEventListener('click', () => {
  switchView(viewHistory, navHistory);
});

console.log("ciao")