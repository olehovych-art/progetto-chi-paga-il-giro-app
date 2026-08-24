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



// 1. Carichiamo i gruppi salvati nel browser (se non ce ne sono, partiamo da un array vuoto [])
let gruppi = JSON.parse(localStorage.getItem('gruppiChiOffre')) || [];
let membriTemporanei = [];

// Elementi HTML
const groupNameInput = document.getElementById('groupNameInput');
const memberNameInput = document.getElementById('memberNameInput');
const btnAddMember = document.getElementById('btnAddMember');
const tempMembersList = document.getElementById('tempMembersList');
const btnCreateGroup = document.getElementById('btnCreateGroup');
const groupsList = document.getElementById('groupsList');

// Aggiunge un amico alla lista temporanea
btnAddMember.addEventListener('click', () => {
  const nomeAmico = memberNameInput.value.trim();
  
  if (nomeAmico !== "") {
    membriTemporanei.push(nomeAmico);
    memberNameInput.value = "";
    aggiornaBadgeMembri();
  }
});

function aggiornaBadgeMembri() {
  tempMembersList.innerHTML = "";
  membriTemporanei.forEach((amico) => {
    tempMembersList.innerHTML += `<span class="badge bg-secondary">${amico}</span>`;
  });
}

// Salva il gruppo e aggiorna il localStorage
btnCreateGroup.addEventListener('click', () => {
  const nomeGruppo = groupNameInput.value.trim();

  if (nomeGruppo === "" || membriTemporanei.length === 0) {
    alert("Inserisci un nome per il gruppo e almeno un amico!");
    return;
  }

  const nuovoGruppo = {
    id: Date.now(),
    nome: nomeGruppo,
    membri: [...membriTemporanei]
  };

  gruppi.push(nuovoGruppo);

  // === SALVATAGGIO NEL LOCALSTORAGE ===
  localStorage.setItem('gruppiChiOffre', JSON.stringify(gruppi));

  // Reset del form
  groupNameInput.value = "";
  membriTemporanei = [];
  tempMembersList.innerHTML = "";

  aggiornaListaGruppi();
});

// Mostra i gruppi salvati
function aggiornaListaGruppi() {
  groupsList.innerHTML = "";

  if (gruppi.length === 0) {
    groupsList.innerHTML = '<li class="list-group-item bg-transparent text-secondary text-center">Nessun gruppo creato</li>';
    return;
  }

  gruppi.forEach(g => {
    groupsList.innerHTML += `
      <li class="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center">
        <div>
          <strong>${g.nome}</strong>
          <br><small class="text-secondary">${g.membri.join(', ')}</small>
        </div>
        <span class="badge bg-warning text-dark">Attivo</span>
      </li>
    `;
  });
}

// CARICAMENTO INIZIALE: Mostra i gruppi salvati subito all'apertura dell'app
aggiornaListaGruppi();