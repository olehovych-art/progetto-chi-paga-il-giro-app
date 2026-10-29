// ==========================================
// 1. INIZIALIZZAZIONE E LOCAL STORAGE
// ==========================================
let gruppi = JSON.parse(localStorage.getItem('gruppiChiOffre')) || [];
let giri = JSON.parse(localStorage.getItem('giriChiOffre')) || [];
let gruppoAttivoId = localStorage.getItem('gruppoAttivoId') || (gruppi.length > 0 ? gruppi[0].id : null);

let membriTemporanei = [];
let modalitaModificaId = null; // ID del gruppo in fase di modifica (null = nuovo gruppo)

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
const todayPayerName = document.getElementById('todayPayerName');
const statsList = document.getElementById('statsList');
const historyList = document.getElementById('historyList');

function normalizzaNome(nome) {
  return nome.trim().toLocaleLowerCase('it-IT');
}

function membriUnici(membri) {
  const nomiVisti = new Set();
  return membri
    .map(nome => nome.trim())
    .filter(nome => {
      const nomeNormalizzato = normalizzaNome(nome);
      if (!nomeNormalizzato || nomiVisti.has(nomeNormalizzato)) return false;
      nomiVisti.add(nomeNormalizzato);
      return true;
    });
}

function calcolaProssimoTurno(membri, giriGruppo) {
  const conteggi = membri.map(amico => {
    const nomeNormalizzato = normalizzaNome(amico);
    const giriPersona = giriGruppo.filter(g => normalizzaNome(g.pagante) === nomeNormalizzato);
    return {
      amico,
      conteggio: giriPersona.length,
      ultimoGiroIndice: giriGruppo.reduce(
        (ultimoIndice, giro, indice) => normalizzaNome(giro.pagante) === nomeNormalizzato ? indice : ultimoIndice,
        -1
      )
    };
  });

  if (conteggi.length === 0) {
    return { partecipantiInTurno: [], paganteConsigliato: null };
  }

  const minimoGiri = Math.min(...conteggi.map(({ conteggio }) => conteggio));
  const partecipantiInTurno = conteggi
    .filter(({ conteggio }) => conteggio === minimoGiri)
    .sort((a, b) => a.ultimoGiroIndice - b.ultimoGiroIndice);

  return {
    partecipantiInTurno: partecipantiInTurno.map(({ amico }) => amico),
    paganteConsigliato: partecipantiInTurno[0].amico
  };
}

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
// 3. GESTIONE PARTECIPANTI TEMPORANEI
// ==========================================
function aggiungiAmicoTemporaneo() {
  const nomeAmico = memberNameInput.value.trim();
  if (nomeAmico === "") return;
  if (membriTemporanei.some(amico => normalizzaNome(amico) === normalizzaNome(nomeAmico))) {
    alert("Questo partecipante è già presente nel gruppo.");
    return;
  }

  membriTemporanei.push(nomeAmico);
  memberNameInput.value = "";
  aggiornaBadgeMembri();
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

function rimuoviMembroTemporaneo(index) {
  membriTemporanei.splice(index, 1);
  aggiornaBadgeMembri();
}

function modificaMembroTemporaneo(index) {
  const vecchioNome = membriTemporanei[index];
  const nuovoNome = prompt("Modifica il nome del partecipante:", vecchioNome);
  if (nuovoNome === null || nuovoNome.trim() === "") return;
  const nomeModificato = nuovoNome.trim();
  if (membriTemporanei.some((amico, indice) =>
    indice !== index && normalizzaNome(amico) === normalizzaNome(nomeModificato)
  )) {
    alert("Questo partecipante è già presente nel gruppo.");
    return;
  }

  membriTemporanei[index] = nomeModificato;
  aggiornaBadgeMembri();
}

function aggiornaBadgeMembri() {
  tempMembersList.innerHTML = "";
  membriTemporanei.forEach((amico, idx) => {
    const badge = document.createElement('span');
    badge.className = "badge bg-secondary d-inline-flex align-items-center gap-2 p-2";
    
    badge.innerHTML = `
      <span class="member-name" style="cursor: pointer;" title="Clicca per modificare">${amico} ✏️</span>
      <button type="button" class="btn-close btn-close-white" style="font-size: 0.65rem;" aria-label="Rimuovi"></button>
    `;

    badge.querySelector('.member-name').addEventListener('click', () => modificaMembroTemporaneo(idx));
    badge.querySelector('.btn-close').addEventListener('click', () => rimuoviMembroTemporaneo(idx));

    tempMembersList.appendChild(badge);
  });
}

// ==========================================
// 4. CREAZIONE, MODIFICA E CANCELLAZIONE GRUPPI
// ==========================================
if (btnCreateGroup) {
  btnCreateGroup.addEventListener('click', () => {
    const nomeGruppo = groupNameInput.value.trim();

    if (nomeGruppo === "" || membriTemporanei.length === 0) {
      alert("Inserisci un nome per il gruppo e almeno un amico!");
      return;
    }

    if (modalitaModificaId !== null) {
      // MODIFICA GRUPPO ESISTENTE
      const gruppoIndex = gruppi.findIndex(g => Number(g.id) === Number(modalitaModificaId));
      if (gruppoIndex !== -1) {
        gruppi[gruppoIndex].nome = nomeGruppo;
        gruppi[gruppoIndex].membri = membriUnici(membriTemporanei);
      }
    } else {
      // CREAZIONE NUOVO GRUPPO
      const nuovoGruppo = {
        id: Date.now(),
        nome: nomeGruppo,
        membri: membriUnici(membriTemporanei)
      };

      gruppi.push(nuovoGruppo);
      gruppoAttivoId = nuovoGruppo.id;
    }

    localStorage.setItem('gruppiChiOffre', JSON.stringify(gruppi));
    localStorage.setItem('gruppoAttivoId', gruppoAttivoId);

    resetFormGruppo();
    aggiornaInterfaccia();
  });
}

function resetFormGruppo() {
  modalitaModificaId = null;
  groupNameInput.value = "";
  memberNameInput.value = "";
  membriTemporanei = [];
  tempMembersList.innerHTML = "";
  btnCreateGroup.textContent = "💾 Salva Gruppo";
}

function avviaModificaGruppo(idGruppo) {
  const gruppo = gruppi.find(g => Number(g.id) === Number(idGruppo));
  if (!gruppo) return;

  modalitaModificaId = gruppo.id;
  groupNameInput.value = gruppo.nome;
  membriTemporanei = membriUnici(gruppo.membri);

  btnCreateGroup.textContent = "✏️ Salva Modifiche";

  aggiornaBadgeMembri();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (Number(modalitaModificaId) === Number(idDaEliminare)) {
    resetFormGruppo();
  }

  aggiornaInterfaccia();
}

// ==========================================
// 5. REGISTRAZIONE E CANCELLAZIONE GIRO
// ==========================================
if (btnRecord) {
  btnRecord.addEventListener('click', () => {
    const chiPaga = payerSelect.value;

    if (!chiPaga) {
      alert("Seleziona chi offre il giro!");
      return;
    }

    const dataOraAttuale = new Date().toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const nuovoGiro = {
      id: Date.now(),
      gruppoId: Number(gruppoAttivoId),
      pagante: chiPaga,
      orario: dataOraAttuale
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
// 6. RENDERING E REFRESH INTERFACCIA
// ==========================================
function aggiornaInterfaccia() {
  const gruppoCorrente = gruppi.find(g => Number(g.id) === Number(gruppoAttivoId));

  // A. Lista Gruppi salvati
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
          <br><small class="text-secondary">${membriUnici(g.membri).join(', ')}</small>
        </div>
        <div class="d-flex align-items-center gap-1">
          <span class="badge ${isAttivo ? 'bg-warning text-dark' : 'bg-secondary'} select-badge" style="cursor: pointer;">
            ${isAttivo ? 'Attivo' : 'Seleziona'}
          </span>
          <button class="btn btn-outline-warning btn-sm border-0 edit-btn px-2" title="Modifica gruppo">
            ✏️
          </button>
          <button class="btn btn-outline-danger btn-sm border-0 delete-btn px-2" title="Elimina gruppo">
            🗑️
          </button>
        </div>
      `;

      const selectArea = li.querySelector('.flex-grow-1');
      const selectBadge = li.querySelector('.select-badge');
      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');

      const handleSelect = () => selezionaGruppo(g.id);
      selectArea.addEventListener('click', handleSelect);
      selectBadge.addEventListener('click', handleSelect);

      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avviaModificaGruppo(g.id);
      });

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        eliminaGruppo(g.id);
      });

      groupsList.appendChild(li);
    });
  }

  // B. Popola la select dei paganti nella Home
  payerSelect.innerHTML = '<option value="">Seleziona chi paga...</option>';

  // C. Filtra i giri per il gruppo attivo
  const giriGruppo = giri.filter(g => Number(g.gruppoId) === Number(gruppoAttivoId));
  const membriCorrenti = gruppoCorrente ? membriUnici(gruppoCorrente.membri) : [];
  const { paganteConsigliato } = calcolaProssimoTurno(membriCorrenti, giriGruppo);

  membriCorrenti.forEach(amico => {
    const option = document.createElement('option');
    option.value = amico;
    option.textContent = amico;
    payerSelect.appendChild(option);
  });
  payerSelect.value = paganteConsigliato || "";

  if (todayPayerName) {
    todayPayerName.textContent = paganteConsigliato || "Crea un gruppo per iniziare";
  }

  // D. Card Ultimo Giro
  if (giriGruppo.length > 0) {
    const ultimoGiro = giriGruppo[giriGruppo.length - 1];
    lastPayerName.innerHTML = `👑 ${ultimoGiro.pagante} 👑`;
    lastPayerTime.textContent = `Registrato il ${ultimoGiro.orario}`;
  } else {
    lastPayerName.innerHTML = `👑 Nessuno 👑`;
    lastPayerTime.textContent = `Nessun giro registrato`;
  }

  // E. Riepilogo Giri
  statsList.innerHTML = "";
  if (gruppoCorrente) {
    membriCorrenti.forEach(amico => {
      const conteggio = giriGruppo.filter(g => normalizzaNome(g.pagante) === normalizzaNome(amico)).length;
      statsList.innerHTML += `
        <li class="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary px-0">
          <span>${amico}</span>
          <span class="badge bg-warning text-dark rounded-pill">🍻 ${conteggio} ${conteggio === 1 ? 'giro' : 'giri'}</span>
        </li>
      `;
    });
  }

  // F. Cronologia Giri
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
          <br><small class="text-secondary">Il ${g.orario}</small>
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