import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BrandKit, Avatar, ContentTemplate, ScheduledPost, Voice } from '../types';

// Initialize Firebase with the provided config
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = null;
const ACCESS_TOKEN_KEY = 'google_access_token';

export const googleSignIn = async (): Promise<void> => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Failed to get access token from Firebase Auth');
  }
  cachedAccessToken = credential.accessToken;
  localStorage.setItem(ACCESS_TOKEN_KEY, credential.accessToken);
};

export const getAccessToken = async (): Promise<string> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || cachedAccessToken;
  if (!accessToken) {
    throw new Error('No access token found. Please sign in with Google first.');
  }
  return accessToken;
};

onAuthStateChanged(auth, (user: User | null) => {
  if (!user) {
    cachedAccessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
});

// Drive Logic
export async function uploadToDrive(fileName: string, content: string, mimeType: string = 'text/plain') {
  const token = await getAccessToken();
  
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload to Google Drive');
  }

  return response.json();
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sanitize to remove undefined values which Firestore rejects
function sanitizeForFirestore(data: any) {
  return JSON.parse(JSON.stringify(data));
}

// BrandKit & Avatar Library
export async function saveBrandKit(userId: string, kit: BrandKit) {
  const path = `users/${userId}/config/brand`;
  try {
    await setDoc(doc(db, path), sanitizeForFirestore(kit));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getBrandKit(userId: string): Promise<BrandKit | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'config', 'brand'));
    return snap.exists() ? snap.data() as BrandKit : null;
  } catch (error) {
    console.error("Error getting brand kit:", error);
    return null;
  }
}

export async function saveAvatar(userId: string, avatar: Omit<Avatar, 'id' | 'createdAt'>) {
  const path = `users/${userId}/avatars`;
  try {
    const col = collection(db, 'users', userId, 'avatars');
    await addDoc(col, { ...sanitizeForFirestore(avatar), createdAt: Date.now() });
    console.log('Successfully saved avatar to Firestore');
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getAvatars(userId: string): Promise<Avatar[]> {
  const path = `users/${userId}/avatars`;
  try {
    const col = collection(db, 'users', userId, 'avatars');
    const q = query(col, orderBy('createdAt', 'desc'), limit(24));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Avatar));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteAvatar(userId: string, avatarId: string) {
  const path = `users/${userId}/avatars/${avatarId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateAvatarVoice(userId: string, avatarId: string, voiceId: string) {
  const path = `users/${userId}/avatars/${avatarId}`;
  try {
    await updateDoc(doc(db, path), { voiceId });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Voices
export async function saveVoice(userId: string, voice: Omit<Voice, 'id' | 'createdAt'>): Promise<string | undefined> {
  const path = `users/${userId}/voices`;
  try {
    const col = collection(db, 'users', userId, 'voices');
    const docRef = await addDoc(col, { ...sanitizeForFirestore(voice), createdAt: Date.now() });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return undefined;
  }
}

export async function getVoices(userId: string): Promise<Voice[]> {
  const path = `users/${userId}/voices`;
  try {
    const col = collection(db, 'users', userId, 'voices');
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Voice));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteVoice(userId: string, voiceId: string) {
  const path = `users/${userId}/voices/${voiceId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Templates
export async function saveTemplate(userId: string, template: Omit<ContentTemplate, 'id'>) {
  const path = `users/${userId}/templates`;
  try {
    const col = collection(db, 'users', userId, 'templates');
    await addDoc(col, sanitizeForFirestore(template));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getTemplates(userId: string): Promise<ContentTemplate[]> {
  const path = `users/${userId}/templates`;
  try {
    const col = collection(db, path);
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentTemplate));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Scheduling
export async function schedulePost(userId: string, post: Omit<ScheduledPost, 'id'>) {
  const path = `users/${userId}/schedule`;
  try {
    const col = collection(db, 'users', userId, 'schedule');
    // Sanitize to remove undefined values (like thumbnailUrl) which Firestore rejects
    const sanitized = sanitizeForFirestore(post);
    await addDoc(col, { 
      ...sanitized, 
      status: sanitized.status || 'pending',
      updatedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
  const path = `users/${userId}/schedule`;
  try {
    const col = collection(db, 'users', userId, 'schedule');
    const q = query(col, orderBy('scheduledTime', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduledPost));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteScheduledPost(userId: string, postId: string) {
  const path = `users/${userId}/schedule/${postId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function reschedulePost(userId: string, postId: string, newTime: number) {
  const path = `users/${userId}/schedule/${postId}`;
  try {
    const postRef = doc(db, path);
    await setDoc(postRef, { scheduledTime: newTime }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
