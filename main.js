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
  } else {
    setupModal.classList.remove('hidden');
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

// Start app
document.addEventListener('DOMContentLoaded', init);
