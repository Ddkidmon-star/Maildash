export let gmailAccessToken: string | null = null;
let tokenExpiration: number = 0;

const CLIENT_ID = '930936961690-1a0ole18aqd614rh04bhq730vm63o4tv.apps.googleusercontent.com';

export const requireGmailAuth = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (gmailAccessToken && Date.now() < tokenExpiration) {
      resolve(gmailAccessToken);
      return;
    }

    if (!window.google || !window.google.accounts) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      callback: (response: any) => {
        if (response.error !== undefined) {
          reject(response);
          return;
        }
        gmailAccessToken = response.access_token;
        tokenExpiration = Date.now() + (response.expires_in * 1000) - 60000;
        resolve(gmailAccessToken);
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  });
};

export const fetchEmailsForAlias = async (token: string, aliasEmail: string) => {
  try {
    const query = `to:${aliasEmail}`;
    const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!listRes.ok) throw new Error('Failed to fetch messages list');
    const listData = await listRes.json();
    
    if (!listData.messages) return [];

    const messages = await Promise.all(
      listData.messages.slice(0, 10).map(async (msg: any) => {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const msgData = await msgRes.json();
        return parseGmailMessage(msgData);
      })
    );
    
    // Sort by most recent first
    return messages.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching alias emails:', error);
    return [];
  }
};

function parseGmailMessage(message: any) {
  const headers = message.payload.headers;
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  
  let body = '';
  
  if (message.payload.parts) {
    const part = message.payload.parts.find((p: any) => p.mimeType === 'text/plain') || message.payload.parts[0];
    if (part && part.body && part.body.data) {
      body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  } else if (message.payload.body && message.payload.body.data) {
    body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  }

  return {
    id: message.id,
    from: getHeader('From'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    body: body,
    timestamp: parseInt(message.internalDate)
  };
}

export const generateGmailAlias = (baseEmail: string, suffix: string) => {
  const parts = baseEmail.split('@');
  if (parts.length !== 2) return baseEmail;
  // Remove existing +alias if any
  const cleanBase = parts[0].split('+')[0];
  return `${cleanBase}+${suffix}@${parts[1]}`;
};
