// ==========================================
// 1. INIZIALIZZAZIONE E LOCAL STORAGE
// ==========================================
let gruppi = JSON.parse(localStorage.getItem('gruppiChiOffre')) || [];
let giri = JSON.parse(localStorage.getItem('giriChiOffre')) || [];
let gruppoAttivoId = localStorage.getItem('gruppoAttivoId') || (gruppi.length > 0 ? gruppi[0].id : null);

let membriTemporanei = [];

// Elementi di navigazione
const navHome = document.getElementById('navHome');
const navGroups = document.getElementById('navGroups');
const navHistory = document.getElementById('navHistory');

const viewHome = document.getElementById('viewHome');
const viewGroups = document.getElementById('viewGroups');
const viewHistory = document.getElementById('viewHistory');

// Elementi Vista Gruppi
const groupNameInput = document.getElementById('groupNameInput');
const memberNameInput = document.getElementById('memberNameInput');
const btnAddMember = document.getElementById('btnAddMember');
const tempMembersList = document.getElementById('tempMembersList');
const btnCreateGroup = document.getElementById('btnCreateGroup');
const groupsList = document.getElementById('groupsList');

// Elementi Vista Home & Cronologia
const payerSelect = document.getElementById('payerSelect');
const btnRecord = document.getElementById('btnRecord');
const lastPayerName = document.getElementById('lastPayerName');
const lastPayerTime = document.getElementById('lastPayerTime');
const statsList = document.getElementById('statsList');
const historyList = document.getElementById('historyList');

// ==========================================
// 2. NAVIGAZIONE SCHERMATE (VISTE)
// ==========================================
function switchView(activeView, activeBtn) {
  if (!viewHome || !viewGroups || !viewHistory) return;

  viewHome.classList.add('d-none');
  viewGroups.classList.add('d-none');
  viewHistory.classList.add('d-none');

  activeView.classList.remove('d-none');

  [navHome, navGroups, navHistory].forEach(btn => {
    if (btn) {
      btn.classList.remove('text-warning');
      btn.classList.add('text-secondary');
    }
  });

  if (activeBtn) {
    activeBtn.classList.remove('text-secondary');
    activeBtn.classList.add('text-warning');
  }
}

if (navHome) navHome.addEventListener('click', () => switchView(viewHome, navHome));
if (navGroups) navGroups.addEventListener('click', () => switchView(viewGroups, navGroups));
if (navHistory) navHistory.addEventListener('click', () => switchView(viewHistory, navHistory));

// ==========================================
// 3. CREAZIONE E SELEZIONE GRUPPI
// ==========================================
function aggiungiAmicoTemporaneo() {
  const nomeAmico = memberNameInput.value.trim();
  if (nomeAmico !== "") {
    membriTemporanei.push(nomeAmico);
    memberNameInput.value = "";
    aggiornaBadgeMembri();
  }
}

if (btnAddMember) {
  btnAddMember.addEventListener('click', (e) => {
    e.preventDefault();
    aggiungiAmicoTemporaneo();
  });
}

if (memberNameInput) {
  memberNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      aggiungiAmicoTemporaneo();
    }
  });
}

function aggiornaBadgeMembri() {
  tempMembersList.innerHTML = "";
  membriTemporanei.forEach((amico) => {
    tempMembersList.innerHTML += `<span class="badge bg-secondary">${amico}</span>`;
  });
}

if (btnCreateGroup) {
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
    gruppoAttivoId = nuovoGruppo.id;

    localStorage.setItem('gruppiChiOffre', JSON.stringify(gruppi));
    localStorage.setItem('gruppoAttivoId', gruppoAttivoId);

    groupNameInput.value = "";
    membriTemporanei = [];
    tempMembersList.innerHTML = "";

    aggiornaInterfaccia();
  });
}

function selezionaGruppo(id) {
  gruppoAttivoId = id;
  localStorage.setItem('gruppoAttivoId', gruppoAttivoId);
  aggiornaInterfaccia();
}

function eliminaGruppo(idDaEliminare) {
  if (!confirm("Sei sicuro di voler eliminare questo gruppo e tutta la sua cronologia?")) {
    return;
  }

  gruppi = gruppi.filter(g => Number(g.id) !== Number(idDaEliminare));
  giri = giri.filter(g => Number(g.gruppoId) !== Number(idDaEliminare));

  if (Number(gruppoAttivoId) === Number(idDaEliminare)) {
    gruppoAttivoId = gruppi.length > 0 ? gruppi[0].id : null;
  }

  localStorage.setItem('gruppiChiOffre', JSON.stringify(gruppi));
  localStorage.setItem('giriChiOffre', JSON.stringify(giri));

  if (gruppoAttivoId) {
    localStorage.setItem('gruppoAttivoId', gruppoAttivoId);
  } else {
    localStorage.removeItem('gruppoAttivoId');
  }

  aggiornaInterfaccia();
}

// ==========================================
// 4. REGISTRAZIONE E CANCELLAZIONE GIRO
// ==========================================
if (btnRecord) {
  btnRecord.addEventListener('click', () => {
    const chiPaga = payerSelect.value;

    if (!chiPaga) {
      alert("Seleziona chi offre il giro!");
      return;
    }

    const oraAttuale = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuovoGiro = {
      id: Date.now(),
      gruppoId: Number(gruppoAttivoId),
      pagante: chiPaga,
      orario: oraAttuale
    };

    giri.push(nuovoGiro);
    localStorage.setItem('giriChiOffre', JSON.stringify(giri));

    payerSelect.value = "";
    aggiornaInterfaccia();
  });
}

function eliminaSingoloGiro(idGiro) {
  if (!confirm("Vuoi cancellare questo giro registrato per errore?")) {
    return;
  }

  giri = giri.filter(g => Number(g.id) !== Number(idGiro));
  localStorage.setItem('giriChiOffre', JSON.stringify(giri));

  aggiornaInterfaccia();
}

// ==========================================
// 5. RENDERING E REFRESH INTERFACCIA
// ==========================================
function aggiornaInterfaccia() {
  const gruppoCorrente = gruppi.find(g => Number(g.id) === Number(gruppoAttivoId));

  // A. Lista Gruppi nella scheda "Gruppi"
  groupsList.innerHTML = "";
  if (gruppi.length === 0) {
    groupsList.innerHTML = '<li class="list-group-item bg-transparent text-secondary text-center">Nessun gruppo creato</li>';
  } else {
    gruppi.forEach(g => {
      const isAttivo = Number(g.id) === Number(gruppoAttivoId);

      const li = document.createElement('li');
      li.className = "list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center py-2 px-1";

      li.innerHTML = `
        <div class="flex-grow-1" style="cursor: pointer;">
          <strong>${g.nome}</strong>
          <br><small class="text-secondary">${g.membri.join(', ')}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge ${isAttivo ? 'bg-warning text-dark' : 'bg-secondary'} select-badge" style="cursor: pointer;">
            ${isAttivo ? 'Attivo' : 'Seleziona'}
          </span>
          <button class="btn btn-outline-danger btn-sm border-0 delete-btn px-2" title="Elimina gruppo">
            🗑️
          </button>
        </div>
      `;

      const selectArea = li.querySelector('.flex-grow-1');
      const selectBadge = li.querySelector('.select-badge');
      const deleteBtn = li.querySelector('.delete-btn');

      const handleSelect = () => selezionaGruppo(g.id);
      selectArea.addEventListener('click', handleSelect);
      selectBadge.addEventListener('click', handleSelect);

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        eliminaGruppo(g.id);
      });

      groupsList.appendChild(li);
    });
  }

  // B. Popola la <select> degli amici nella Home
  payerSelect.innerHTML = '<option value="">Seleziona chi paga...</option>';
  if (gruppoCorrente) {
    gruppoCorrente.membri.forEach(amico => {
      payerSelect.innerHTML += `<option value="${amico}">${amico}</option>`;
    });
  }

  // C. Filtra i giri del gruppo attivo
  const giriGruppo = giri.filter(g => Number(g.gruppoId) === Number(gruppoAttivoId));

  // D. Card Ultimo Giro
  if (giriGruppo.length > 0) {
    const ultimoGiro = giriGruppo[giriGruppo.length - 1];
    lastPayerName.innerHTML = `👑 ${ultimoGiro.pagante} 👑`;
    lastPayerTime.textContent = `Registrato alle ${ultimoGiro.orario}`;
  } else {
    lastPayerName.innerHTML = `👑 Nessuno 👑`;
    lastPayerTime.textContent = `Nessun giro registrato stasera`;
  }

  // E. Riepilogo Gruppo (Conteggio Giri per ciascun amico)
  statsList.innerHTML = "";
  if (gruppoCorrente) {
    gruppoCorrente.membri.forEach(amico => {
      const conteggio = giriGruppo.filter(g => g.pagante === amico).length;
      statsList.innerHTML += `
        <li class="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary px-0">
          <span>${amico}</span>
          <span class="badge bg-warning text-dark rounded-pill">🍻 ${conteggio} ${conteggio === 1 ? 'giro' : 'giri'}</span>
        </li>
      `;
    });
  }

  // F. Cronologia Giri (con opzione per eliminare il singolo giro)
  historyList.innerHTML = "";
  if (giriGruppo.length === 0) {
    historyList.innerHTML = '<li class="list-group-item bg-transparent text-secondary text-center">Nessun giro registrato</li>';
  } else {
    [...giriGruppo].reverse().forEach(g => {
      const li = document.createElement('li');
      li.className = "list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center py-2 px-1";

      li.innerHTML = `
        <div>
          🍻 <strong>${g.pagante}</strong> ha offerto un giro
          <br><small class="text-secondary">${g.orario}</small>
        </div>
        <button class="btn btn-outline-danger btn-sm border-0 delete-round-btn px-2" title="Elimina questo giro">
          Elimina
        </button>
      `;

      const deleteBtn = li.querySelector('.delete-round-btn');
      deleteBtn.addEventListener('click', () => {
        eliminaSingoloGiro(g.id);
      });

      historyList.appendChild(li);
    });
  }
}

// Avvio automatico all'apertura dell'app
aggiornaInterfaccia();