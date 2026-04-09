let tokenClient;
let gapiInited = false;
let gisInited = false;

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  try {
    await gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    checkAuthReady();
  } catch (error) {
    console.error("Erro ao inicializar GAPI client:", error);
  }
}

function gisLoaded() {
  gisInited = true;
  checkAuthReady();
}

const CLIENT_ID = '1078839488832-1a6eqeei5s5flqu0m0tjqq1g1cimoqov.apps.googleusercontent.com';

function checkAuthReady() {
  if (gapiInited && gisInited) {
    // Inicializa o token client apenas se o Google Identity carregou
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined below
    });
  }
}

async function handleGoogleAuth() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      return reject('Token client not initialized');
    }
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        return reject(resp);
      }
      
      const btnAuth = document.getElementById('btn-auth-google');
      if (btnAuth) {
        btnAuth.textContent = "Google Conectado";
        btnAuth.classList.remove('btn-primary');
        btnAuth.classList.add('btn-secondary');
        btnAuth.disabled = true;
      }
      resolve(true);
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
}

// Verifica e retorna o Calendar ID correspondente ao Closer
async function findCalendarForCloser(closerName) {
  try {
    const response = await gapi.client.calendar.calendarList.list();
    const calendars = response.result.items;
    
    // Busca algum calendário cujo summary contenha o nome do closer
    const targetName = closerName.toLowerCase().trim();
    const match = calendars.find(c => c.summary.toLowerCase().includes(targetName));
    
    return match ? match.id : null;
  } catch (err) {
    console.error('Erro ao buscar lista de calendários', err);
    return null;
  }
}

async function getTodayEvents(calendarId) {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    const response = await gapi.client.calendar.events.list({
      'calendarId': calendarId,
      'timeMin': startOfDay,
      'timeMax': endOfDay,
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 50,
      'orderBy': 'startTime'
    });
    
    return response.result.items;
  } catch (err) {
    console.error('Erro ao buscar eventos', err);
    return [];
  }
}

// Verifica se a API do Google Global já carregou assim que o script rodar
window.onload = () => {
    if(window.gapi) gapiLoaded();
    if(window.google && window.google.accounts) gisLoaded();
};
