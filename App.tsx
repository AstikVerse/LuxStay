
import React, { useState, useEffect } from 'react';
import { Room, Student, Grievance, User, Role, Notice, LeaveRequest } from './types';
import { ThreeDScene } from './components/ThreeDScene';
import { Dashboard } from './components/Dashboard';
import { StudentPortal } from './components/StudentPortal';
import { Navbar } from './components/Navbar';
import { BedDouble, Shield, MapPin, Wifi, Coffee, Loader2, Lock, Mail, CreditCard, Info } from 'lucide-react';
import { dbService } from './services/db';

const LandingPage = () => (
  <div className="space-y-32 animate-fade-in text-center md:text-left">
    {/* Hero */}
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center relative z-10 px-4">
      <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold tracking-wider mb-6 animate-fade-in-up">
        WELCOME TO PARADISE
      </div>
      <h1 className="text-5xl md:text-8xl font-bold text-white serif tracking-tight mb-8 leading-tight">
        Experience Living <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-amber-600">
          Reimagined
        </span>
      </h1>
      <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
        Where world-class luxury meets academic excellence. A hostel designed not just for staying, but for thriving.
      </p>
    </section>

    {/* Rooms Showcase */}
    <section id="rooms" className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white serif mb-4">Exquisite Accommodations</h2>
        <p className="text-slate-400">Choose from our selection of premium living spaces.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "The Royal Suite", img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600", desc: "Private balcony, jacuzzi, and kitchenette." },
          { title: "Executive Double", img: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=600", desc: "Spacious shared living with ergonomic study zones." },
          { title: "Premium Triple", img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600", desc: "Community-focused design with ample privacy." }
        ].map((item, i) => (
          <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer">
             <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.img})` }} />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
             <div className="absolute bottom-0 left-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform">
                <h3 className="text-2xl font-bold text-white serif mb-2">{item.title}</h3>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">{item.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </section>

    {/* Location & Amenities */}
    <section id="location" className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center bg-slate-900/30 rounded-3xl p-12 backdrop-blur-sm border border-slate-800/50">
      <div>
        <h2 className="text-4xl font-bold text-white serif mb-6">Prime Location</h2>
        <p className="text-slate-300 text-lg leading-relaxed mb-8">
          Nestled on the coastline, LuxStay offers breathtaking ocean views while being just a 5-minute shuttle ride from the main university campus. 
          Enjoy the tranquility of nature without compromising on connectivity.
        </p>
        <div className="flex items-center gap-4 text-amber-400 font-bold">
            <MapPin />
            <span>12 Ocean Drive, Cape Coast</span>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden h-80 bg-slate-900 border border-slate-700 flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <button className="relative z-10 bg-white/10 backdrop-blur border border-white/30 text-white px-6 py-2 rounded-full hover:bg-white/20 transition-all">View on Map</button>
      </div>
    </section>

    <section id="amenities" className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-4xl font-bold text-white serif mb-12 text-center">World-Class Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { icon: Wifi, label: "Gigabit WiFi" },
                { icon: Coffee, label: "24/7 Cafe" },
                { icon: Shield, label: "Smart Security" },
                { icon: BedDouble, label: "Housekeeping" }
            ].map((am, i) => (
                <div key={i} className="bg-slate-950/50 border border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-amber-500/50 transition-colors group">
                    <am.icon size={40} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span className="font-bold text-slate-300">{am.label}</span>
                </div>
            ))}
        </div>
    </section>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Real-time Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  // Computed State
  const currentStudent = React.useMemo(() => {
    if (currentUser?.role !== Role.STUDENT) return null;
    return students.find(s => s.id === currentUser.id);
  }, [currentUser, students]);

  // Subscriptions to Data Service
  useEffect(() => {
    // Only subscribe to data if we are logged in, OR if we want public data (like rooms) on landing
    // For now, we fetch everything, but in prod you might limit this.
    const unsubRooms = dbService.subscribeToRooms(setRooms);
    const unsubStudents = dbService.subscribeToStudents(setStudents);
    const unsubGrievances = dbService.subscribeToGrievances(setGrievances);
    const unsubNotices = dbService.subscribeToNotices(setNotices);
    const unsubLeaves = dbService.subscribeToLeaveRequests(setLeaveRequests);

    return () => {
        unsubRooms();
        unsubStudents();
        unsubGrievances();
        unsubNotices();
        unsubLeaves();
    };
  }, []);

  // Auth State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  
  // Form State
  const [formData, setFormData] = useState({ email: '', password: '', aadharNumber: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAuthError('');
  };

  const resetAuth = () => {
    setFormData({ email: '', password: '', aadharNumber: '' });
    setAuthError('');
    setIsLoading(false);
    setIsRegistering(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
        if (isRegistering) {
            // Student Registration Flow
            const user = await dbService.registerStudent(formData.email, formData.password, formData.aadharNumber);
            setCurrentUser(user as User);
            setShowLoginModal(false);
        } else {
            // Normal Login Flow
            const user = await dbService.login(formData.email, formData.password, selectedRole);
            if (user) {
                setCurrentUser(user);
                setShowLoginModal(false);
            }
        }
    } catch (err: any) {
        console.error(err);
        let msg = err.message || 'Authentication failed.';
        if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
            msg = "Account not found or Incorrect Password.";
        }
        if (msg.includes('email-already-in-use')) {
            msg = "This email is already registered. Please login.";
        }
        setAuthError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await dbService.logout();
    setCurrentUser(null);
    resetAuth();
  };

  const handleAddStudent = async (newStudentData: Omit<Student, 'id' | 'roomNumber' | 'paidFees'>) => {
    const newStudent = {
        ...newStudentData,
        roomNumber: null,
        paidFees: 0,
        dob: newStudentData.dob || '2000-01-01' 
    };
    await dbService.addStudent(newStudent);
  };

  const handleAddRoom = async (roomData: Omit<Room, 'id' | 'occupants'>) => {
      const newRoom = {
          ...roomData,
          occupants: [] 
      };
      await dbService.addRoom(newRoom);
  };

  const handleUpdateStudent = async (updatedData: Partial<Student>) => {
      await dbService.updateStudent(updatedData);
  };

  const handleAllocateRoom = async (roomId: string, studentId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const student = students.find(s => s.id === studentId);
    if (room && student) {
        await dbService.allocateRoomCloud(room, student);
    }
  };

  const handleDeallocateRoom = async (roomId: string, studentId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        await dbService.deallocateRoomCloud(room, studentId);
    }
  };

  const handleDeleteStudent = async (studentId: string, roomNumber: string | null) => {
      await dbService.deleteStudent(studentId, roomNumber);
  };
  
  const handleUpdateFees = async (studentId: string, amount: number) => {
      await dbService.updateStudentFees(studentId, amount);
  };

  const handleSubmitGrievance = async (g: Omit<Grievance, 'id' | 'status' | 'timestamp'>) => {
    const newGrievance = {
      ...g,
      status: 'Pending' as const,
      timestamp: new Date().toISOString()
    };
    await dbService.addGrievance(newGrievance);
  };

  const handleResolveGrievance = async (id: string) => {
    await dbService.updateGrievanceStatus(id, 'Resolved');
  };

  const handlePostNotice = async (notice: Omit<Notice, 'id' | 'date'>) => {
      const newNotice = {
          ...notice,
          date: new Date().toISOString()
      };
      await dbService.addNotice(newNotice);
  };

  const handleRequestLeave = async (req: Omit<LeaveRequest, 'id' | 'status'>) => {
      const newReq = {
          ...req,
          status: 'Pending' as const
      };
      await dbService.addLeaveRequest(newReq);
  };

  const handleProcessLeave = async (id: string, status: 'Approved' | 'Rejected') => {
      await dbService.updateLeaveStatus(id, status);
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <ThreeDScene />

      <Navbar 
        user={currentUser} 
        onLogout={handleLogout} 
        onLoginClick={() => {
            resetAuth();
            setShowLoginModal(true);
        }} 
      />

      <main className="pt-24 z-10 relative">
        
        {/* Render Views based on auth state */}
        {!currentUser && <LandingPage />}

        {currentUser?.role === Role.ADMIN && (
          <div className="max-w-7xl mx-auto px-6">
            <Dashboard 
                rooms={rooms} 
                students={students} 
                grievances={grievances}
                notices={notices}
                leaveRequests={leaveRequests}
                onAllocate={handleAllocateRoom}
                onDeallocate={handleDeallocateRoom}
                onResolveGrievance={handleResolveGrievance}
                onAddStudent={handleAddStudent}
                onAddRoom={handleAddRoom}
                onPostNotice={handlePostNotice}
                onProcessLeave={handleProcessLeave}
                onDeleteStudent={handleDeleteStudent}
                onUpdateFees={handleUpdateFees}
            />
          </div>
        )}

        {currentUser?.role === Role.STUDENT && (
          <div className="max-w-7xl mx-auto px-6 pb-12">
            {currentStudent ? (
                <StudentPortal 
                    student={currentStudent}
                    room={rooms.find(r => r.id === currentStudent.roomNumber ? r.id : (r.occupants.includes(currentStudent.id)))}
                    grievances={grievances.filter(g => g.studentId === currentUser.id)}
                    notices={notices}
                    leaveRequests={leaveRequests.filter(l => l.studentId === currentUser.id)}
                    onSubmitGrievance={handleSubmitGrievance}
                    onUpdateStudent={handleUpdateStudent}
                    onRequestLeave={handleRequestLeave}
                />
            ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={48} />
                    <p className="animate-pulse">Loading Profile Data...</p>
                    <button onClick={handleLogout} className="text-xs text-rose-500 hover:underline mt-4">Cancel & Logout</button>
                 </div>
            )}
          </div>
        )}

        {/* Authentication Modal */}
        {showLoginModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600" />
                
                {/* Role/Mode Switcher */}
                <div className="flex justify-center mb-6 bg-slate-950 p-1 rounded-full border border-slate-800 w-fit mx-auto">
                    {!isRegistering ? (
                        <>
                            <button 
                                onClick={() => setSelectedRole(Role.STUDENT)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedRole === Role.STUDENT ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Student
                            </button>
                            <button 
                                onClick={() => setSelectedRole(Role.ADMIN)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selectedRole === Role.ADMIN ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Admin
                            </button>
                        </>
                    ) : (
                        <div className="px-6 py-2 rounded-full text-sm font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Student Registration
                        </div>
                    )}
                </div>

                <h2 className="text-3xl font-bold mb-2 serif text-center text-white">
                    {isRegistering ? 'Activate Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-400 mb-6 text-center text-sm">
                    {isRegistering 
                        ? 'Link your email to your student profile.' 
                        : (selectedRole === Role.ADMIN ? 'Secure Warden Access' : 'Please login with your student credentials.')
                    }
                </p>

                {/* DEMO CREDENTIALS HINT - REMOVED FOR PRODUCTION FIREBASE SETUP */}
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            name="email"
                            type="email" 
                            placeholder="Email Address" 
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        <input 
                            name="password"
                            type="password" 
                            placeholder={isRegistering ? "Create Password" : "Password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            required
                        />
                    </div>

                    {isRegistering && (
                         <div className="relative animate-fade-in">
                            <CreditCard className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                name="aadharNumber"
                                type="text" 
                                placeholder="Verify Aadhar Number" 
                                value={formData.aadharNumber}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                required
                            />
                             <p className="text-[10px] text-slate-500 mt-1 ml-2">Must match the record added by Warden.</p>
                        </div>
                    )}

                    {authError && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-bold animate-pulse">
                            {authError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Activate Account' : 'Login')}
                    </button>
                </form>

                {selectedRole === Role.STUDENT && !isRegistering && (
                    <div className="mt-6 text-center text-sm text-slate-500 px-4">
                        New Student?{' '}
                        <button onClick={() => setIsRegistering(true)} className="text-amber-500 hover:text-amber-400 font-bold underline decoration-amber-500/30 underline-offset-4">
                            Activate your account
                        </button>
                    </div>
                )}

                {isRegistering && (
                    <div className="mt-6 text-center text-sm text-slate-500 px-4">
                        Already active?{' '}
                        <button onClick={() => setIsRegistering(false)} className="text-amber-500 hover:text-amber-400 font-bold underline decoration-amber-500/30 underline-offset-4">
                            Back to Login
                        </button>
                    </div>
                )}
                
                <button 
                    onClick={() => { setShowLoginModal(false); resetAuth(); }} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    ✕
                </button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
