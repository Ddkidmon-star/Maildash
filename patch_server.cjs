const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const adminImport = `import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;
function getFirebaseAdmin() {
  if (!firebaseAdminApp) {
    try {
      firebaseAdminApp = admin.initializeApp({
        projectId: 'ai-studio-maildash-fe829a32-73cb-40f5-851f-18c571d88552'
      });
    } catch (error) {
      console.error('Error initializing firebase admin:', error);
      throw error;
    }
  }
  return firebaseAdminApp;
}

// Middleware to authenticate user via Firebase ID token
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const adminApp = getFirebaseAdmin();
    const decodedToken = await adminApp.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
`;

code = code.replace('import crypto from "crypto";', 'import crypto from "crypto";\n' + adminImport);

// Inject wallet verification endpoint
const walletEndpoint = `
  // Wallet: Verify Paystack Deposit
  app.post("/api/wallet/verify-deposit", authenticate, async (req, res) => {
    try {
      const { reference, amount } = req.body;
      const userId = req.user.uid;
      
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (secretKey) {
        const response = await fetch(\`https://api.paystack.co/transaction/verify/\${reference}\`, {
          headers: { Authorization: \`Bearer \${secretKey}\` }
        });
        const data = await response.json();
        if (!data.status || data.data.status !== 'success') {
           return res.status(400).json({ error: 'Transaction verification failed' });
        }
        const verifiedAmount = data.data.amount / 100;
        if (verifiedAmount !== amount) {
           return res.status(400).json({ error: 'Amount mismatch' });
        }
      } else {
         console.warn('PAYSTACK_SECRET_KEY is missing. Skipping real Paystack API verification for development.');
      }

      const adminApp = getFirebaseAdmin();
      const userRef = adminApp.firestore().collection('users').doc(userId);
      
      let newBalance = 0;
      await adminApp.firestore().runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) throw new Error('User not found');
        
        newBalance = (doc.data()?.balance || 0) + amount;
        t.update(userRef, { balance: newBalance });
      });
      
      res.json({ success: true, balance: newBalance });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
`;

code = code.replace('// API Routes', '// API Routes\n' + walletEndpoint);

// Modify register-custom endpoint
const oldRegisterStart = `app.post("/api/mailtm/register-custom", async (req, res) => {
    try {
      const { address, password } = req.body;`;

const newRegisterStart = `app.post("/api/mailtm/register-custom", authenticate, async (req, res) => {
    try {
      const { address, password } = req.body;
      const userId = req.user.uid;
      const adminApp = getFirebaseAdmin();
      const userRef = adminApp.firestore().collection('users').doc(userId);
      
      let newBalance = 0;
      try {
        await adminApp.firestore().runTransaction(async (t) => {
          const doc = await t.get(userRef);
          if (!doc.exists) throw new Error('User not found');
          
          const currentBalance = doc.data()?.balance || 0;
          if (currentBalance < 200) {
             throw new Error('INSUFFICIENT_FUNDS');
          }
          newBalance = currentBalance - 200;
          t.update(userRef, { balance: newBalance });
        });
      } catch (err: any) {
        if (err.message === 'INSUFFICIENT_FUNDS') {
           return res.status(402).json({ error: 'Insufficient balance. Need ₦200.' });
        }
        throw err;
      }
`;

code = code.replace(oldRegisterStart, newRegisterStart);

// Handle refund on create fail
const oldCreateRes = `if (!createRes.ok) {
        const errorData = await createRes.json();
        return res.status(createRes.status).json({ error: "Failed to create account", details: errorData });
      }`;

const newCreateRes = `if (!createRes.ok) {
        // Refund
        await adminApp.firestore().runTransaction(async (t) => {
           const doc = await t.get(userRef);
           if (doc.exists) {
              t.update(userRef, { balance: (doc.data()?.balance || 0) + 200 });
           }
        });
        const errorData = await createRes.json();
        return res.status(createRes.status).json({ error: "Failed to create account", details: errorData });
      }`;

code = code.replace(oldCreateRes, newCreateRes);

fs.writeFileSync('server.ts', code);
console.log('patched server.ts');
