// --- Constants & Variables ---
const STORAGE_KEY = 'appointmentTrackerState';
let appState = {
  sdrName: '',
  closers: [] // { id: string, name: string, count: number }
};

// --- DOM Elements ---
const sdrNameDisplay = document.getElementById('sdr-name-display');
const dateTimeDisplay = document.getElementById('current-date-time');
const totalCountDisplay = document.getElementById('total-count');
const closersGrid = document.getElementById('closers-grid');
const setupModal = document.getElementById('setup-modal');
const setupForm = document.getElementById('setup-form');
const inputSdrName = document.getElementById('input-sdr-name');
const inputClosersCount = document.getElementById('input-closers-count');
const dynamicClosersNames = document.getElementById('dynamic-closers-names');
const checkboxCafofo = document.getElementById('checkbox-cafofo');
const btnReset = document.getElementById('btn-reset');
const btnClearAll = document.getElementById('btn-clear-all');

// --- Custom Dialog Elements ---
const dialogModal = document.getElementById('dialog-modal');
const dialogTitle = document.getElementById('dialog-title');
const dialogMessage = document.getElementById('dialog-message');
const dialogBtnCancel = document.getElementById('dialog-btn-cancel');
const dialogBtnConfirm = document.getElementById('dialog-btn-confirm');

// --- Calendar Modal Elements ---
const calendarModal = document.getElementById('calendar-modal');
const calendarTitle = document.getElementById('calendar-title');
const calendarEventsList = document.getElementById('calendar-events-list');
const calendarBtnClose = document.getElementById('calendar-btn-close');

const btnAuthGoogle = document.getElementById('btn-auth-google');

function showDialog(title, message, isConfirm = false) {
  return new Promise((resolve) => {
    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    
    if (isConfirm) {
      dialogBtnCancel.style.display = 'block';
    } else {
      dialogBtnCancel.style.display = 'none';
      dialogBtnConfirm.textContent = 'OK';
    }

    dialogModal.classList.remove('hidden');

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      dialogModal.classList.add('hidden');
      dialogBtnConfirm.removeEventListener('click', handleConfirm);
      dialogBtnCancel.removeEventListener('click', handleCancel);
    };

    dialogBtnConfirm.addEventListener('click', handleConfirm);
    dialogBtnCancel.addEventListener('click', handleCancel);
  });
}

// --- Initialization ---
function init() {
  loadState();
  updateClock();
  setInterval(updateClock, 1000);

  if (appState && appState.closers && appState.closers.length > 0) {
    setupModal.classList.add('hidden');
    renderUI();
    if(typeof checkAuthReady === 'function'){
      checkAuthReady();
    }
  } else {
    setupModal.classList.remove('hidden');
  }

  if (btnAuthGoogle) {
    btnAuthGoogle.addEventListener('click', async () => {
      try {
        await handleGoogleAuth();
        renderUI(); // re-render to show calendar icons if they were hidden
      } catch (err) {
        console.error("Auth failed:", err);
        showDialog("Erro", "Falha na autenticação do Google. " + (err.error || err));
      }
    });
  }

  if (calendarBtnClose) {
    calendarBtnClose.addEventListener('click', () => {
      calendarModal.classList.add('hidden');
    });
  }
}

// --- Clock Logic ---
function updateClock() {
  const now = new Date();
  const optionsDate = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const strDate = now.toLocaleDateString('pt-BR', optionsDate);
  const strTime = now.toLocaleTimeString('pt-BR');
  
  const formattedDate = strDate.charAt(0).toUpperCase() + strDate.slice(1);
  dateTimeDisplay.textContent = `${formattedDate} • ${strTime}`;
}

// --- Storage Logic ---
function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      appState = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing local storage data.', e);
    }
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  renderUI();
}

// --- Dynamic Modal Inputs ---
inputClosersCount.addEventListener('input', (e) => {
  const count = parseInt(e.target.value) || 0;
  dynamicClosersNames.innerHTML = '';
  
  if (count > 0 && count <= 20) {
    for (let i = 1; i <= count; i++) {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group'
      formGroup.style.marginBottom = '0';
      
      const label = document.createElement('label');
      label.textContent = `Nome da ${i}ª Pessoa`;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.required = true;
      input.className = 'closer-name-input';
      input.placeholder = `Ex: Closer ${i}`;
      
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      dynamicClosersNames.appendChild(formGroup);
    }
  }
});

// --- Modal Submit ---
setupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const sdrName = inputSdrName.value.trim();
  const nameInputs = document.querySelectorAll('.closer-name-input');
  
  const closers = [];
  nameInputs.forEach((input, index) => {
    if (input.value.trim() !== '') {
      closers.push({
        id: `closer-${Date.now()}-${index}`,
        name: input.value.trim(),
        count: 0
      });
    }
  });

  if (checkboxCafofo.checked) {
    closers.push({
      id: `closer-cafofo-${Date.now()}`,
      name: 'Cafofo',
      count: 0
    });
  }

  if (sdrName && closers.length > 0) {
    appState = {
       sdrName,
       closers
    };
    saveState();
    setupModal.classList.add('hidden');
    if(typeof checkAuthReady === 'function') checkAuthReady();
  } else {
    await showDialog("Alerta", "Por favor, preencha o seu nome e adicione pelo menos um Closer/Pessoa.", false);
  }
});

// --- Render UI ---
function renderUI() {
  if (!appState || !appState.closers) return;

  sdrNameDisplay.textContent = appState.sdrName || "SDR";
  
  closersGrid.innerHTML = '';
  let total = 0;

  appState.closers.forEach(closer => {
    total += closer.count;
    
    const card = document.createElement('div');
    card.className = 'card';
    
    const countDisplay = document.createElement('div');
    countDisplay.className = 'card-count';
    countDisplay.textContent = closer.count;
    
    // Action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'card-actions';

    const btnDecrement = document.createElement('button');
    btnDecrement.className = 'btn-circle';
    btnDecrement.innerHTML = '-';
    btnDecrement.setAttribute('aria-label', `Diminuir de ${closer.name}`);
    btnDecrement.addEventListener('click', () => decrementCount(closer.id));
    
    const btnIncrement = document.createElement('button');
    btnIncrement.className = 'btn-circle';
    btnIncrement.innerHTML = '+';
    btnIncrement.setAttribute('aria-label', `Incrementar para ${closer.name}`);
    btnIncrement.addEventListener('click', () => incrementCount(closer.id));

    actionsContainer.appendChild(btnDecrement);
    actionsContainer.appendChild(btnIncrement);

    // Adiciona botão "Ver Agenda" se estiver logado via OAuth
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken() !== null) {
      const btnCalendar = document.createElement('button');
      btnCalendar.className = 'btn-circle btn-calendar';
      btnCalendar.innerHTML = '📅';
      btnCalendar.title = "Ver Agenda Hoje";
      btnCalendar.style.fontSize = '1.2rem';
      btnCalendar.style.background = 'rgba(255, 255, 255, 0.1)';
      btnCalendar.addEventListener('click', () => openCalendarModal(closer.name));
      actionsContainer.appendChild(btnCalendar);
    }

    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'card-name';
    nameDisplay.textContent = closer.name;

    card.appendChild(countDisplay);
    card.appendChild(actionsContainer);
    card.appendChild(nameDisplay);
    
    closersGrid.appendChild(card);
  });

  totalCountDisplay.textContent = total;
}

// --- Actions ---
function incrementCount(id) {
  const closer = appState.closers.find(c => c.id === id);
  if (closer) {
    closer.count += 1;
    saveState();
  }
}

function decrementCount(id) {
  const closer = appState.closers.find(c => c.id === id);
  if (closer && closer.count > 0) {
    closer.count -= 1;
    saveState();
  }
}

btnReset.addEventListener('click', async () => {
  const confirmed = await showDialog('Zerar contadores', 'Tem certeza que deseja zerar todas as contagens? As pessoas serão mantidas.', true);
  if (confirmed) {
    if (appState.closers) {
      appState.closers.forEach(c => c.count = 0);
      saveState();
    }
  }
});

btnClearAll.addEventListener('click', async () => {
  const confirmed = await showDialog('Limpar Tudo', 'Atenção: Isso apagará TODOS os dados, incluindo seu nome e a lista de pessoas configuradas. Continuar?', true);
  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
});

// --- Modal Calendar Data ---
async function openCalendarModal(closerName) {
  calendarTitle.textContent = `Agenda: ${closerName}`;
  calendarEventsList.innerHTML = `<p class="text-center" style="color: #a0aec0; padding: 2rem 0;">Buscando calendário...</p>`;
  calendarModal.classList.remove('hidden');

  const calendarId = await findCalendarForCloser(closerName);
  
  if (!calendarId) {
    calendarEventsList.innerHTML = `<p class="text-center" style="color: #ff6b6b; padding: 2rem 0;">Agenda não encontrada enviando nome "${closerName}". Verifique se você tem acesso a ela e se o nome condiz.</p>`;
    return;
  }

  const events = await getTodayEvents(calendarId);
  calendarEventsList.innerHTML = '';

  if (events.length === 0) {
    calendarEventsList.innerHTML = `<p class="text-center" style="color: #51cf66; padding: 2rem 0;">Agenda livre hoje!</p>`;
    return;
  }

  events.forEach(event => {
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    let timeString = 'Dia inteiro';
    if(event.start.dateTime) {
       const startDate = new Date(event.start.dateTime);
       const endDate = new Date(event.end.dateTime);
       timeString = `${startDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    }

    eventItem.innerHTML = `
      <div class="event-time">${timeString}</div>
      <div class="event-title">${event.summary || '(Sem título)'}</div>
    `;
    calendarEventsList.appendChild(eventItem);
  });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
