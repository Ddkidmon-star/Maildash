import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  email: string;
  role: 'user' | 'owner';
  status: 'active' | 'suspended' | 'banned';
  isVerified: boolean;
  balance: number;
  createdAt: number;
}

export const syncUserDocument = async (user: User): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    // ensure balance exists
    if (data.balance === undefined) {
      await updateDoc(userRef, { balance: 0 });
      data.balance = 0;
    }
    return data;
  } else {
    const isOwner = user.email === 'preciousddkid@gmail.com';
    const profile: UserProfile = {
      email: user.email || '',
      role: isOwner ? 'owner' : 'user',
      status: 'active',
      isVerified: isOwner ? true : false,
      balance: 0,
      createdAt: Date.now()
    };
    await setDoc(userRef, profile);
    return profile;
  }
};

export const fetchAllUsers = async (): Promise<{id: string, profile: UserProfile}[]> => {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  return snap.docs.map(d => ({ id: d.id, profile: d.data() as UserProfile }));
};

export const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'banned', isVerified: boolean) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { status, isVerified });
};

export const updateUserBalance = async (userId: string, newBalance: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { balance: newBalance });
};
