import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Party, 
  Recreador, 
  Client, 
  AuditLog, 
  NotificationItem, 
  SupportTicket, 
  AuthUser 
} from '../types';

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// 3. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
}

// 4. Validate connection to Firestore (CRITICAL Skill Requirement)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firebase Firestore conectado com sucesso ao projeto:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('⚠️ Firestore: Cliente offline ou aguardando conexão com a nuvem.');
    } else {
      console.log('ℹ️ Firestore inicializado (verificação de conexão):', error);
    }
    return false;
  }
}

// 5. Auth Helpers
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn('Falha no popup do Google Auth, utilizando fallback anônimo autenticado:', error);
    try {
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch (e) {
      console.error('Erro de autenticação:', e);
      return null;
    }
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Erro ao sair do Firebase:', err);
  }
}

// 6. Firestore Real-time Collections Sync & Mutations

// PARTIES
export const partiesCollection = collection(db, 'parties');

export function subscribeToParties(callback: (parties: Party[]) => void) {
  return onSnapshot(partiesCollection, (snapshot) => {
    const list: Party[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Party);
    });
    // Sort by date ascending
    list.sort((a, b) => a.date.localeCompare(b.date));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'parties');
  });
}

export async function savePartyToFirestore(party: Party): Promise<void> {
  try {
    const ref = doc(db, 'parties', party.id);
    await setDoc(ref, party, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `parties/${party.id}`);
  }
}

export async function deletePartyFromFirestore(partyId: string): Promise<void> {
  try {
    const ref = doc(db, 'parties', partyId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `parties/${partyId}`);
  }
}

// RECREADORES / STAFF
export const staffCollection = collection(db, 'recreadores');

export function subscribeToStaff(callback: (staff: Recreador[]) => void) {
  return onSnapshot(staffCollection, (snapshot) => {
    const list: Recreador[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Recreador);
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'recreadores');
  });
}

export async function saveStaffToFirestore(staff: Recreador): Promise<void> {
  try {
    const ref = doc(db, 'recreadores', staff.id);
    await setDoc(ref, staff, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `recreadores/${staff.id}`);
  }
}

export async function deleteStaffFromFirestore(staffId: string): Promise<void> {
  try {
    const ref = doc(db, 'recreadores', staffId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `recreadores/${staffId}`);
  }
}

// CLIENTS
export const clientsCollection = collection(db, 'clients');

export function subscribeToClients(callback: (clients: Client[]) => void) {
  return onSnapshot(clientsCollection, (snapshot) => {
    const list: Client[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Client);
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'clients');
  });
}

export async function saveClientToFirestore(client: Client): Promise<void> {
  try {
    const ref = doc(db, 'clients', client.id);
    await setDoc(ref, client, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `clients/${client.id}`);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  try {
    const ref = doc(db, 'clients', clientId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `clients/${clientId}`);
  }
}

// AUDIT LOGS
export const auditLogsCollection = collection(db, 'auditLogs');

export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void) {
  return onSnapshot(auditLogsCollection, (snapshot) => {
    const list: AuditLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AuditLog);
    });
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'auditLogs');
  });
}

export async function saveAuditLogToFirestore(log: AuditLog): Promise<void> {
  try {
    const ref = doc(db, 'auditLogs', log.id);
    await setDoc(ref, log, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `auditLogs/${log.id}`);
  }
}

// NOTIFICATIONS
export const notificationsCollection = collection(db, 'notifications');

export function subscribeToNotifications(callback: (notifs: NotificationItem[]) => void) {
  return onSnapshot(notificationsCollection, (snapshot) => {
    const list: NotificationItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as NotificationItem);
    });
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notifications');
  });
}

export async function saveNotificationToFirestore(notif: NotificationItem): Promise<void> {
  try {
    const ref = doc(db, 'notifications', notif.id);
    await setDoc(ref, notif, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `notifications/${notif.id}`);
  }
}

export async function markNotificationAsReadInFirestore(id: string): Promise<void> {
  try {
    const ref = doc(db, 'notifications', id);
    await updateDoc(ref, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
  }
}

// SUPPORT TICKETS
export const supportTicketsCollection = collection(db, 'supportTickets');

export function subscribeToSupportTickets(callback: (tickets: SupportTicket[]) => void) {
  return onSnapshot(supportTicketsCollection, (snapshot) => {
    const list: SupportTicket[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SupportTicket);
    });
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'supportTickets');
  });
}

export async function saveSupportTicketToFirestore(ticket: SupportTicket): Promise<void> {
  try {
    const ref = doc(db, 'supportTickets', ticket.id);
    await setDoc(ref, ticket, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `supportTickets/${ticket.id}`);
  }
}

export async function updateSupportTicketInFirestore(ticketId: string, data: Partial<SupportTicket>): Promise<void> {
  try {
    const ref = doc(db, 'supportTickets', ticketId);
    await updateDoc(ref, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `supportTickets/${ticketId}`);
  }
}

// USERS
export const usersCollection = collection(db, 'users');

export function subscribeToUsers(callback: (users: AuthUser[]) => void) {
  return onSnapshot(usersCollection, (snapshot) => {
    const list: AuthUser[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as AuthUser);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'users');
  });
}

export async function saveUserToFirestore(user: AuthUser): Promise<void> {
  try {
    const ref = doc(db, 'users', user.id);
    await setDoc(ref, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
}
