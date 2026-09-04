const fs = require('fs');
let fb = fs.readFileSync('src/lib/firebase.ts', 'utf8');
fb = fb.replace("import { getAuth", "import { getFirestore } from 'firebase/firestore';\nimport { getAuth");
fb = fb.replace("export const auth = getAuth(app);", "export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);\nexport const auth = getAuth(app);");
fs.writeFileSync('src/lib/firebase.ts', fb);
