import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { Room, Student, Grievance, Notice, LeaveRequest, Role, User } from '../types';

// --- Helper to Map Firebase Documents to Types ---
const mapDoc = (doc: any) => ({ id: doc.id, ...doc.data() });

export const dbService = {
  isConnected: true,

  checkSystemHealth: async () => {
    console.log("System Health: Connected to Firebase");
  },

  // --- Auth & User Management ---

  registerStudent: async (email: string, password: string, aadharNumber: string) => {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No student record found with this email. Please ask the Admin to add you first.");
    }

    const studentDoc = querySnapshot.docs[0];
    const studentData = studentDoc.data();

    if (studentData.aadharNumber !== aadharNumber) {
      throw new Error("Aadhar number does not match our records.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      email: email,
      role: Role.STUDENT,
      name: studentData.name,
      studentId: studentDoc.id
    });

    return { 
      id: studentDoc.id, 
      name: studentData.name, 
      email, 
      role: Role.STUDENT 
    };
  },

  login: async (email: string, password: string, role: Role) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error("User profile not found.");
    }

    const userData = userDocSnap.data();

    if (userData.role !== role) {
      await signOut(auth);
      throw new Error(`Unauthorized. You are not an ${role}.`);
    }

    return {
      id: userData.studentId || firebaseUser.uid,
      name: userData.name || "User",
      email: email,
      role: userData.role
    };
  },

  loginWithGoogle: async (expectedRole: Role): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    // Look up the user's role doc in Firestore by their Firebase UID
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await signOut(auth);
      throw new Error('Your Google account is not registered in LuxStay. Please contact the warden.');
    }

    const userData = userDocSnap.data();

    if (userData.role !== expectedRole) {
      await signOut(auth);
      throw new Error(`This Google account is not registered as a ${expectedRole}.`);
    }

    return {
      id: userData.studentId || firebaseUser.uid,
      name: userData.name || firebaseUser.displayName || 'User',
      email: firebaseUser.email!,
      role: userData.role
    };
  },

  logout: async () => {
    await signOut(auth);
  },

  // --- Real-time Subscriptions (Read) ---

  subscribeToRooms: (cb: (data: Room[]) => void) => {
    return onSnapshot(collection(db, "rooms"), (snapshot) => {
      const rooms = snapshot.docs.map(mapDoc) as Room[];
      cb(rooms.sort((a,b) => a.number.localeCompare(b.number)));
    });
  },

  subscribeToStudents: (cb: (data: Student[]) => void) => {
    return onSnapshot(collection(db, "students"), (snapshot) => {
      cb(snapshot.docs.map(mapDoc) as Student[]);
    });
  },

  subscribeToGrievances: (cb: (data: Grievance[]) => void) => {
    return onSnapshot(collection(db, "grievances"), (snapshot) => {
      const g = snapshot.docs.map(mapDoc) as Grievance[];
      cb(g.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });
  },

  subscribeToNotices: (cb: (data: Notice[]) => void) => {
    return onSnapshot(collection(db, "notices"), (snapshot) => {
      cb(snapshot.docs.map(mapDoc) as Notice[]);
    });
  },

  subscribeToLeaveRequests: (cb: (data: LeaveRequest[]) => void) => {
    return onSnapshot(collection(db, "leaveRequests"), (snapshot) => {
      cb(snapshot.docs.map(mapDoc) as LeaveRequest[]);
    });
  },

  // --- Mutations (Write) ---

  addStudent: async (studentData: Omit<Student, 'id'>) => {
    await addDoc(collection(db, "students"), studentData);
  },

  updateStudent: async (updatedData: Partial<Student>) => {
    if (!updatedData.id) return;
    const studentRef = doc(db, "students", updatedData.id);
    await updateDoc(studentRef, updatedData);
  },

  deleteStudent: async (studentId: string, roomNumber: string | null) => {
    await deleteDoc(doc(db, "students", studentId));

    if (roomNumber) {
      const q = query(collection(db, "rooms"), where("number", "==", roomNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0];
        const roomData = roomDoc.data();
        const updatedOccupants = (roomData.occupants || []).filter((oid: string) => oid !== studentId);
        await updateDoc(roomDoc.ref, { occupants: updatedOccupants });
      }
    }
  },

  addRoom: async (roomData: Omit<Room, 'id'>) => {
    await addDoc(collection(db, "rooms"), roomData);
  },

  allocateRoomCloud: async (room: Room, student: Student) => {
    const roomRef = doc(db, "rooms", room.id);
    const newOccupants = [...(room.occupants || []), student.id];
    await updateDoc(roomRef, { occupants: newOccupants });

    const studentRef = doc(db, "students", student.id);
    await updateDoc(studentRef, { roomNumber: room.number });
  },

  deallocateRoomCloud: async (room: Room, studentId: string) => {
    const roomRef = doc(db, "rooms", room.id);
    const newOccupants = (room.occupants || []).filter((id: string) => id !== studentId);
    await updateDoc(roomRef, { occupants: newOccupants });

    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, { roomNumber: null });
  },

  updateStudentFees: async (studentId: string, amount: number) => {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, { paidFees: amount });
  },

  addGrievance: async (g: any) => {
    await addDoc(collection(db, "grievances"), g);
  },

  updateGrievanceStatus: async (id: string, status: string) => {
    const gRef = doc(db, "grievances", id);
    await updateDoc(gRef, { status });
  },

  addNotice: async (n: any) => {
    await addDoc(collection(db, "notices"), n);
  },

  addLeaveRequest: async (r: any) => {
    await addDoc(collection(db, "leaveRequests"), r);
  },

  updateLeaveStatus: async (id: string, status: string) => {
    const lRef = doc(db, "leaveRequests", id);
    await updateDoc(lRef, { status });
  }
};
