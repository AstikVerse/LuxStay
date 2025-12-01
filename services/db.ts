
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
  User as FirebaseUser 
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

  /**
   * 1. Check if student data exists (created by Admin).
   * 2. Verify Aadhar.
   * 3. Create Firebase Auth Account.
   * 4. Link Auth ID to Student Record.
   */
  registerStudent: async (email: string, password: string, aadharNumber: string) => {
    // Step 1: Find the pre-created student record
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No student record found with this email. Please ask the Admin to add you first.");
    }

    const studentDoc = querySnapshot.docs[0];
    const studentData = studentDoc.data();

    // Step 2: Verify Aadhar
    if (studentData.aadharNumber !== aadharNumber) {
      throw new Error("Aadhar number does not match our records.");
    }

    // Step 3: Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 4: Create User Role Doc
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

  /**
   * Login for both Admin and Student
   */
  login: async (email: string, password: string, role: Role) => {
    // 1. Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 2. Fetch User Role Data from 'users' collection
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Fallback: If it's the very first admin and they don't have a user doc yet,
      // you might want to manually create it in Firebase Console, 
      // OR allow a specific email to bypass (NOT RECOMMENDED FOR PRODUCTION).
      // For now, we throw error.
      throw new Error("User profile not found.");
    }

    const userData = userDocSnap.data();

    if (userData.role !== role) {
      await signOut(auth);
      throw new Error(`Unauthorized. You are not an ${role}.`);
    }

    // Return the user object
    return {
      id: userData.studentId || firebaseUser.uid, // Use studentId for students, authId for admin
      name: userData.name || "User",
      email: email,
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
      // Sort by room number
      cb(rooms.sort((a,b) => a.number.localeCompare(b.number)));
    });
  },

  subscribeToStudents: (cb: (data: Student[]) => void) => {
    return onSnapshot(collection(db, "students"), (snapshot) => {
      cb(snapshot.docs.map(mapDoc) as Student[]);
    });
  },

  subscribeToGrievances: (cb: (data: Grievance[]) => void) => {
    // Order by timestamp desc would require an index, for now client sort
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
    // 1. Delete student doc
    await deleteDoc(doc(db, "students", studentId));

    // 2. If allocated, remove from room occupants
    if (roomNumber) {
      // Find the room doc first
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
    // 1. Update Room
    const roomRef = doc(db, "rooms", room.id);
    const newOccupants = [...(room.occupants || []), student.id];
    await updateDoc(roomRef, { occupants: newOccupants });

    // 2. Update Student
    const studentRef = doc(db, "students", student.id);
    await updateDoc(studentRef, { roomNumber: room.number });
  },

  deallocateRoomCloud: async (room: Room, studentId: string) => {
    // 1. Update Room
    const roomRef = doc(db, "rooms", room.id);
    const newOccupants = (room.occupants || []).filter(id => id !== studentId);
    await updateDoc(roomRef, { occupants: newOccupants });

    // 2. Update Student
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
