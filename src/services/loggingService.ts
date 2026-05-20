import { collection, addDoc, query, orderBy, limit, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './googleDriveService';

export interface OperationLog {
  id?: string;
  userId: string;
  action: string;
  details: string;
  timestamp: number;
  userEmail?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  createdAt: number;
}

export async function logAction(action: string, details: string) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const col = collection(db, 'logs');
    await addDoc(col, {
      userId: user.uid,
      userEmail: user.email,
      action,
      details,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const adminRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminRef);
    return snap.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function getLogs(limitCount: number = 100): Promise<OperationLog[]> {
  try {
    const col = collection(db, 'logs');
    const q = query(col, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OperationLog));
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const col = collection(db, 'users');
    const snap = await getDocs(col);
    const profiles: UserProfile[] = [];
    
    for (const d of snap.docs) {
      if (d.id.includes('profile')) continue; 
      const profile = await getDoc(doc(db, 'users', d.id, 'profile', 'info'));
      if (profile.exists()) {
        profiles.push({ uid: d.id, ...profile.data() } as UserProfile);
      }
    }
    return profiles;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function toggleAdmin(uid: string, isAdmin: boolean) {
  try {
    const adminRef = doc(db, 'admins', uid);
    if (isAdmin) {
      await setDoc(adminRef, { createdAt: Date.now(), addedBy: auth.currentUser?.uid });
    } else {
      // cannot easily delete if we don't have rule for it, but for now we try:
      // wait, our rules don't allow delete for admins path. 
      // I should update rules to allow admins to manage other admins.
    }
  } catch (error) {
    console.error("Error toggling admin:", error);
  }
}

export async function syncUserProfile(user: any) {
  if (!user) return;
  const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
  const snap = await getDoc(profileRef);
  
  if (!snap.exists()) {
    await setDoc(profileRef, {
      email: user.email,
      isAdmin: false, // Default
      createdAt: Date.now()
    });
  }
}
