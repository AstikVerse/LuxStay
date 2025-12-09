import React, { useState, useEffect } from 'react';
import { Room, Student, Grievance, Notice, LeaveRequest } from '../types';
import { AlertCircle, CheckCircle, Search, UserPlus, X, Layers, Printer, Download, DollarSign, Filter, Plus, Users, Phone, BookOpen, Clock, User, LogOut, MessageSquare, Send, Bell, Calendar, Check, Ban, Gift, Loader2, Database, BedDouble, UploadCloud, ArrowRight, CheckSquare, Square, Trash2, Edit, RefreshCw } from 'lucide-react';
import { dbService } from '../services/db';

interface DashboardProps {
  rooms: Room[];
  students: Student[];
  grievances: Grievance[];
  notices: Notice[];
  leaveRequests: LeaveRequest[];
  onAllocate: (roomId: string, studentId: string) => void;
  onDeallocate: (roomId: string, studentId: string) => void;
  onResolveGrievance: (id: string) => void;
  onAddStudent: (student: Omit<Student, 'id' | 'roomNumber' | 'paidFees'>) => void;
  onAddRoom: (room: Omit<Room, 'id' | 'occupants'>) => void;
  onPostNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  onProcessLeave: (id: string, status: 'Approved' | 'Rejected') => void;
  onDeleteStudent: (studentId: string, roomNumber: string | null) => void;
  onUpdateFees: (studentId: string, amount: number) => void;
}
const isDemo = user?.email === "demo@luxstay.com";
export const Dashboard: React.FC<DashboardProps> = ({ rooms, students, grievances, notices, leaveRequests, onAllocate, onDeallocate, onResolveGrievance, onAddStudent, onAddRoom, onPostNotice, onProcessLeave, onDeleteStudent, onUpdateFees }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'students' | 'requests'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [allocationSlot, setAllocationSlot] = useState<{roomId: string} | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  
  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{studentId: string, currentPaid: number, total: number} | null>(null);
  const [paymentMode, setPaymentMode] = useState<'add' | 'set'>('add');
  const [paymentAmount, setPaymentAmount] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animation State
  const [animatingStudentId, setAnimatingStudentId] = useState<string | null>(null);

  // System Notification State
  const [systemNotifications, setSystemNotifications] = useState<string[]>([]);
  
  // Student Profile Popup State
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Forms
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    year: 1,
    phoneNumber: '',
    parentPhoneNumber: '',
    aadharNumber: '',
    totalFees: 5000,
    dob: ''
  });

  const [newRoom, setNewRoom] = useState({
    number: '',
    floor: 1,
    capacity: 2,
    type: 'Double' as 'Single' | 'Double' | 'Triple' | 'Suite',
    price: 1000,
    features: [] as string[],
    image: ''
  });

  const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'Normal' });

  const viewingStudent = students.find(s => s.id === viewingStudentId);

  // Check for birthdays on mount
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 0-indexed
    const currentDay = today.getDate();

    const birthdayStudents = students.filter(s => {
        if (!s.dob) return false;
        const [_, m, d] = s.dob.split('-').map(Number);
        return m === currentMonth && d === currentDay;
    });

    if (birthdayStudents.length > 0) {
        const names = birthdayStudents.map(s => s.name).join(', ');
        setTimeout(() => {
            setSystemNotifications(prev => {
                if (prev.some(msg => msg.includes(names))) return prev;
                return [...prev, `🎉 Automated Email Sent: Happy Birthday to ${names}! 🎂`];
            });
        }, 1500); 
    }
  }, []);

  // Remove notifications after 6 seconds
  useEffect(() => {
    if (systemNotifications.length > 0) {
        const timer = setTimeout(() => {
            setSystemNotifications(prev => prev.slice(1));
        }, 6000);
        return () => clearTimeout(timer);
    }
  }, [systemNotifications]);

  // Group rooms by floor
  // Fix: Explicitly type sort parameters to prevent TS error on arithmetic operation
  const floors = [...new Set(rooms.map(r => r.floor))].sort((a: number, b: number) => a - b);

  // Stats
  const totalCapacity = rooms.reduce((acc: number, r) => (acc + (r.capacity || 0)), 0);
  const totalOccupied = rooms.reduce((acc: number, r) => (acc + (r.occupants ? r.occupants.length : 0)), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const pendingGrievances = grievances.filter(g => g.status === 'Pending').length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;
  const availableStudents = students.filter(s => s.roomNumber === null);
  
  // Financial Stats
  const totalFees = students.reduce((acc: number, s) => acc + (s.totalFees || 0), 0);
  const totalCollected = students.reduce((acc: number, s) => acc + (s.paidFees || 0), 0);
  const totalPending = totalFees - totalCollected;

  const handleSlotClick = (room: Room, isOccupied: boolean, occupantId?: string) => {
    if (isOccupied && occupantId) {
        setViewingStudentId(occupantId);
    } else {
        if (room.occupants.length < room.capacity) {
            setAllocationSlot({ roomId: room.id });
        }
    }
  };

  const handleDeallocateCurrentStudent = async () => {
    if (viewingStudent) {
        const room = rooms.find(r => r.occupants && r.occupants.includes(viewingStudent.id));
        
        if (room) {
             if (confirm(`Are you sure you want to deallocate ${viewingStudent.name} from Room ${room.number}?`)) {
                setIsProcessing(true);
                await onDeallocate(room.id, viewingStudent.id);
                
                setIsProcessing(false);
                setViewingStudentId(null);
                
                setSystemNotifications(prev => [...prev, `✅ Deallocated ${viewingStudent.name} successfully.`]);
             }
        } else {
            alert("System Error: Could not locate the room record for this student.");
        }
    }
  };

  const executeAllocation = async (studentId: string) => {
    if (allocationSlot) {
        setIsProcessing(true);
        await onAllocate(allocationSlot.roomId, studentId);
        
        setIsProcessing(false);
        setAnimatingStudentId(studentId);
        setTimeout(() => setAnimatingStudentId(null), 2000);
        
        setAllocationSlot(null);
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if(isDemo){
    alert("Action disabled in Demo Mode 😊");
    return;
  }
    onAddStudent({
        ...newStudent,
        year: Number(newStudent.year),
        totalFees: Number(newStudent.totalFees)
    });
    setShowAddStudentModal(false);
    setSystemNotifications(prev => [...prev, `✅ Adding student: ${newStudent.name}...`]);
    setNewStudent({ name: '', email: '', password: '', course: '', year: 1, phoneNumber: '', parentPhoneNumber: '', aadharNumber: '', totalFees: 5000, dob: '' });
  };

  const handleDeleteStudent = (e: React.MouseEvent, id: string, name: string, roomNum: string | null) => {
      e.stopPropagation();
      if(window.confirm(`WARNING: This will permanently delete ${name} from the database.\nThis action cannot be undone.\n\nContinue?`)) {
          onDeleteStudent(id, roomNum);
          setSystemNotifications(prev => [...prev, `🗑️ Deleting student: ${name}...`]);
          // Close profile if open
          if (viewingStudentId === id) setViewingStudentId(null);
      }
  };

  const handleOpenPaymentModal = (student: Student) => {
      setPaymentModal({
          studentId: student.id,
          currentPaid: student.paidFees,
          total: student.totalFees
      });
      setPaymentAmount('');
      setPaymentMode('add');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!paymentModal) return;
      
      const inputAmount = Number(paymentAmount) || 0;
      let newPaidTotal = 0;

      if (paymentMode === 'add') {
           newPaidTotal = paymentModal.currentPaid + inputAmount;
      } else {
           newPaidTotal = inputAmount;
      }

      onUpdateFees(paymentModal.studentId, newPaidTotal);
      setPaymentModal(null);
      setSystemNotifications(prev => [...prev, `💰 Fees Updated.`]);
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const capacityInt = parseInt(String(newRoom.capacity), 10);
      const floorInt = parseInt(String(newRoom.floor), 10);
      const priceInt = parseInt(String(newRoom.price), 10);

      const typeMap: {[key: number]: string} = { 1: 'Single', 2: 'Double', 3: 'Triple', 4: 'Suite' };
      const derivedType = capacityInt > 3 ? 'Suite' : (typeMap[capacityInt] || 'Double');

      onAddRoom({
          ...newRoom,
          capacity: capacityInt,
          floor: floorInt,
          price: priceInt,
          type: derivedType as any,
          image: newRoom.image || 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1000'
      });
      setShowAddRoomModal(false);
      setSystemNotifications(prev => [...prev, `✅ Adding Room ${newRoom.number}...`]);
      setNewRoom({ number: '', floor: 1, capacity: 2, type: 'Double', price: 1000, features: [], image: '' });
  };

  const toggleFeature = (feature: string) => {
      setNewRoom(prev => {
          if (prev.features.includes(feature)) {
              return { ...prev, features: prev.features.filter(f => f !== feature) };
          } else {
              return { ...prev, features: [...prev.features, feature] };
          }
      });
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    onPostNotice({ ...newNotice, priority: newNotice.priority as 'Normal' | 'Urgent' });
    setShowNoticeModal(false);
    setNewNotice({ title: '', content: '', priority: 'Normal' });
    setSystemNotifications(prev => [...prev, `✅ Notice Posted: ${newNotice.title}`]);
  };

  const downloadCSV = () => {
    const headers = ["Student ID,Name,Course,Year,Room,Phone,Parent Phone,Aadhar,DOB,Total Fees,Paid Fees,Pending Amount,Status"];
    const rows = students
        .filter(s => !showPendingOnly || (s.totalFees - s.paidFees > 0))
        .map(s => {
            const pending = s.totalFees - s.paidFees;
            const status = pending === 0 ? "Paid" : (pending === s.totalFees ? "Unpaid" : "Partial");
            return `${s.id},"${s.name}",${s.course},${s.year},${s.roomNumber || 'Not Allocated'},${s.phoneNumber},${s.parentPhoneNumber},${s.aadharNumber},${s.dob},${s.totalFees},${s.paidFees},${pending},${status}`;
        });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_financials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const matchesSearch = (room: Room) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    if (room.number.toLowerCase().includes(term)) return true;
    const roomOccupants = room.occupants.map(id => students.find(s => s.id === id)).filter(Boolean);
    return roomOccupants.some(student => 
        student && (student.name.toLowerCase().includes(term) || student.id.toLowerCase().includes(term))
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative">
      {/* System Toast Notifications */}
      <div className="fixed top-24 right-6 z-[100] space-y-2 pointer-events-none">
         {systemNotifications.map((msg, idx) => (
             <div key={idx} className="bg-slate-900/95 backdrop-blur border-l-4 border-amber-500 text-white p-4 rounded shadow-2xl flex items-center gap-3 animate-slide-in pointer-events-auto max-w-sm">
                 <div className="bg-amber-500/20 p-2 rounded-full">
                     <CheckCircle size={20} className="text-amber-500" />
                 </div>
                 <div className="text-sm font-medium">{msg}</div>
             </div>
         ))}
      </div>

      <header className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4 no-print">
        <div>
          <h2 className="text-4xl font-bold text-white serif tracking-tight">Warden Command Center</h2>
          <p className="text-slate-400 text-sm mt-1">Manage allocations and financials.</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('financials')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'financials' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Financials
                </button>
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'students' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Students
                </button>
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all relative ${activeTab === 'requests' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Requests
                    {pendingLeaves > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{pendingLeaves}</span>}
                </button>
                
                <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>

                <button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 rounded-full font-bold text-sm transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2 hover:bg-slate-700"
                >
                    <Plus size={14}/> Add Student
                </button>
                <button 
                    onClick={() => setShowAddRoomModal(true)}
                    className="px-4 py-2 rounded-full font-bold text-sm transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2 hover:bg-slate-700"
                >
                    <BedDouble size={14}/> Add Room
                </button>
                <button 
                    onClick={() => setShowNoticeModal(true)}
                    className="px-4 py-2 rounded-full font-bold text-sm transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2 hover:bg-slate-700"
                >
                    <Bell size={14}/> Post Notice
                </button>
            </div>
        </div>
      </header>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-6 py-3 rounded-xl flex flex-col items-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Occupancy</span>
                    <span className="text-3xl font-bold text-amber-500">{occupancyRate}%</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-6 py-3 rounded-xl flex flex-col items-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Pending Issues</span>
                    <span className={`text-3xl font-bold ${pendingGrievances > 0 ? 'text-rose-500' : 'text-amber-500'}`}>{pendingGrievances}</span>
                </div>
                {/* Active Notice Summary */}
                <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
                     <div>
                        <span className="text-amber-400 text-xs uppercase font-bold tracking-wider mb-1 block">Latest Notice</span>
                        <p className="text-slate-200 text-sm truncate">{notices[0]?.title || "No active notices"}</p>
                     </div>
                     <Bell className="text-amber-500 opacity-50" />
                </div>
            </div>

            {rooms.length === 0 && (
                 <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
                     <Database className="mx-auto text-slate-600 mb-4" size={48} />
                     <h3 className="text-xl font-bold text-white mb-2">Database is Empty</h3>
                     <p className="text-slate-400 mb-6">Load initial data to get started.</p>
                     
                     <div className="flex gap-4 justify-center">
                         <button 
                            onClick={() => setShowAddRoomModal(true)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold"
                         >
                            Add Room Manually
                         </button>
                     </div>
                 </div>
            )}

            {rooms.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Room Grid */}
                    <div className="xl:col-span-3 space-y-8">
                        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Layers className="text-amber-400" /> Building Overview
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search Room, Name or ID..." 
                                    className="bg-slate-950 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none w-72"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            {floors.map(floorNum => (
                                <div key={floorNum} className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest border-b border-slate-800 pb-2">
                                        <span className="bg-slate-900 px-2 py-1 rounded">Floor {floorNum}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {rooms.filter(r => r.floor === floorNum && matchesSearch(r)).map(room => {
                                            const isFull = room.occupants.length >= room.capacity;
                                            return (
                                                <div key={room.id} className={`bg-slate-900/60 backdrop-blur rounded-xl border ${isFull ? 'border-slate-800' : 'border-amber-500/30'} overflow-hidden shadow-lg transition-all hover:shadow-2xl group`}>
                                                    <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${room.image})` }}>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90" />
                                                        <div className="absolute bottom-2 left-4">
                                                            <h4 className="text-2xl font-bold text-white serif">Room {room.number}</h4>
                                                            <p className="text-xs text-slate-300">{room.type} • {room.features.includes('AC') ? 'AC' : 'Non-AC'}</p>
                                                        </div>
                                                        <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-1 rounded text-xs text-amber-400 font-mono">
                                                            ${room.price}/mo
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                                                            <span>Capacity: {room.capacity}</span>
                                                            <span className={isFull ? 'text-rose-400' : 'text-amber-400'}>{isFull ? 'NO VACANCY' : 'AVAILABLE'}</span>
                                                        </div>

                                                        {/* Bed Slots */}
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {Array.from({ length: room.capacity }).map((_, idx) => {
                                                                const occupantId = room.occupants[idx];
                                                                const occupant = occupantId ? students.find(s => s.id === occupantId) : null;
                                                                const isAnimating = occupantId === animatingStudentId;
                                                                
                                                                return (
                                                                    <button 
                                                                        key={idx}
                                                                        onClick={() => handleSlotClick(room, !!occupant, occupantId)}
                                                                        className={`
                                                                            relative h-16 rounded-lg border flex items-center justify-center transition-all duration-300
                                                                            ${occupant 
                                                                                ? `bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-amber-500 group/bed ${isAnimating ? 'animate-pop ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' : ''}` 
                                                                                : 'bg-slate-950/50 border-dashed border-slate-800 hover:border-amber-500 hover:bg-slate-900'
                                                                            }
                                                                        `}
                                                                        title={occupant ? `View ${occupant.name}` : "Allocate Student"}
                                                                    >
                                                                        {occupant ? (
                                                                            <div className="text-center">
                                                                                <div className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center mx-auto mb-1 transition-colors ${isAnimating ? 'bg-emerald-500 text-white' : 'bg-amber-600 text-white'}`}>
                                                                                    {occupant.name.charAt(0)}
                                                                                </div>
                                                                                <div className={`text-[9px] truncate w-16 px-1 ${isAnimating ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>{occupant.name}</div>
                                                                            </div>
                                                                        ) : (
                                                                            <UserPlus size={16} className="text-slate-600 group-hover:text-amber-400" />
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* Allocation Modal / Drawer */}
                        {allocationSlot && (
                            <div className="bg-slate-900 border-l-4 border-amber-500 rounded-lg p-5 shadow-2xl animate-fade-in-right fixed right-6 top-24 w-80 z-40">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-bold text-white">Allocate to Room {rooms.find(r => r.id === allocationSlot.roomId)?.number}</h4>
                                        <p className="text-xs text-slate-400">Select a student from the waitlist</p>
                                    </div>
                                    <button onClick={() => setAllocationSlot(null)} className="text-slate-400 hover:text-white"><X size={16}/></button>
                                </div>

                                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {isProcessing && <div className="text-center text-amber-500 py-2"><Loader2 className="animate-spin mx-auto"/></div>}
                                    {!isProcessing && availableStudents.length === 0 ? (
                                        <p className="text-slate-500 text-sm italic py-4 text-center">No students waiting for rooms.</p>
                                    ) : !isProcessing && (
                                        availableStudents.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => executeAllocation(student.id)}
                                                disabled={isProcessing}
                                                className="w-full flex items-center justify-between p-3 bg-slate-950/50 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-amber-500/50 transition-all text-left group disabled:opacity-50"
                                            >
                                                <div>
                                                    <p className="text-slate-200 font-bold text-sm group-hover:text-amber-400">{student.name}</p>
                                                    <p className="text-slate-500 text-xs">{student.course} • Yr {student.year}</p>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-slate-900">
                                                    <Plus size={14} />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
      )}

      {/* FINANCIALS TAB */}
      {activeTab === 'financials' && (
        <div className="space-y-6 animate-fade-in printable-area">
            <div className="flex justify-between items-center no-print">
                <h3 className="text-2xl font-bold text-white serif">Financial Overview</h3>
                <div className="flex gap-2">
                    <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800 no-print">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowPendingOnly(!showPendingOnly)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${showPendingOnly ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                        <Filter size={14} /> {showPendingOnly ? 'Showing Pending Only' : 'Show All Students'}
                    </button>
                 </div>
                 <div className="flex gap-8 text-right">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Total Expected</p>
                        <p className="text-xl font-bold text-white">${totalFees.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Collected</p>
                        <p className="text-xl font-bold text-emerald-400">${totalCollected.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Pending</p>
                        <p className="text-xl font-bold text-rose-400">${totalPending.toLocaleString()}</p>
                    </div>
                 </div>
            </div>

            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Course</th>
                            <th className="p-4">Room</th>
                            <th className="p-4 text-right">Total Fees</th>
                            <th className="p-4 text-right">Paid</th>
                            <th className="p-4 text-right">Pending</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {students.filter(s => !showPendingOnly || (s.totalFees - s.paidFees > 0)).map(student => {
                            const pending = student.totalFees - student.paidFees;
                            return (
                                <tr 
                                    key={student.id} 
                                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                                    onClick={() => setViewingStudentId(student.id)}
                                >
                                    <td className="p-4 font-medium text-white">
                                        {student.name}
                                        <div className="text-[10px] text-slate-500">{student.id}</div>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">{student.course} ({student.year})</td>
                                    <td className="p-4 text-amber-400 text-sm">{student.roomNumber || 'N/A'}</td>
                                    <td className="p-4 text-right text-slate-300">${student.totalFees.toLocaleString()}</td>
                                    <td className="p-4 text-right text-slate-300">${student.paidFees.toLocaleString()}</td>
                                    <td className={`p-4 text-right font-bold ${pending > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>${pending.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            pending === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                                            pending === student.totalFees ? 'bg-rose-500/20 text-rose-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                            {pending === 0 ? 'Paid' : pending === student.totalFees ? 'Unpaid' : 'Partial'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center no-print" onClick={e => e.stopPropagation()}>
                                        {pending > 0 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenPaymentModal(student);
                                                }}
                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 p-2 rounded-lg transition-colors"
                                                title="Record Payment"
                                            >
                                                <DollarSign size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-500 italic">No financial records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* STUDENTS LIST TAB */}
      {activeTab === 'students' && (
          <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white serif">Student Directory</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {students.map(student => (
                            <div 
                                key={student.id} 
                                onClick={() => setViewingStudentId(student.id)}
                                className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4 group cursor-pointer hover:bg-slate-900 transition-colors"
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-400">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{student.name}</p>
                                        <p className="text-xs text-slate-500 mb-1">{student.course} • Yr {student.year}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                                                <Phone size={10} /> {student.phoneNumber}
                                            </span>
                                            <span className={`text-[10px] px-2 py-1 rounded text-slate-900 font-bold ${student.roomNumber ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                                {student.roomNumber ? `Room ${student.roomNumber}` : 'Unallocated'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={(e) => handleDeleteStudent(e, student.id, student.name, student.roomNumber)}
                                    className="text-slate-600 hover:text-rose-500 transition-colors p-2 z-10"
                                    title="Delete Student"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {students.length === 0 && <p className="p-4 text-slate-500 italic col-span-full">No students found.</p>}
                    </div>
                </div>
          </div>
      )}

       {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             {/* Leave Requests */}
             <div className="space-y-4">
                 <h3 className="text-xl font-bold text-white serif flex items-center gap-2">
                    <Calendar className="text-amber-500" /> Leave Requests
                 </h3>
                 <div className="space-y-4">
                    {leaveRequests.length === 0 ? <p className="text-slate-500 italic text-sm">No active requests.</p> :
                        leaveRequests.map(req => {
                            const student = students.find(s => s.id === req.studentId);
                            return (
                                <div key={req.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                                     {req.status === 'Pending' && <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />}
                                     {req.status === 'Approved' && <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />}
                                     {req.status === 'Rejected' && <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />}
                                     
                                     <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-white font-bold">{student?.name || 'Unknown Student'}</p>
                                            <p className="text-xs text-slate-400">Room {student?.roomNumber || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{req.status}</span>
                                        </div>
                                     </div>
                                     
                                     <div className="bg-slate-950 p-3 rounded-lg text-sm text-slate-300 mb-3 border border-slate-800">
                                        <p className="mb-1 italic">"{req.reason}"</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                        </p>
                                     </div>

                                     {req.status === 'Pending' && (
                                         <div className="flex gap-2">
                                             <button onClick={() => onProcessLeave(req.id, 'Approved')} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-2 rounded text-xs font-bold transition-colors">Approve</button>
                                             <button onClick={() => onProcessLeave(req.id, 'Rejected')} className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 py-2 rounded text-xs font-bold transition-colors">Reject</button>
                                         </div>
                                     )}
                                </div>
                            );
                        })
                    }
                 </div>
             </div>

             {/* Grievances */}
             <div className="space-y-4">
                 <h3 className="text-xl font-bold text-white serif flex items-center gap-2">
                    <AlertCircle className="text-rose-500" /> Issues & Grievances
                 </h3>
                 <div className="space-y-4">
                    {grievances.length === 0 ? <p className="text-slate-500 italic text-sm">No reported issues.</p> :
                        grievances.map(g => {
                             const student = students.find(s => s.id === g.studentId);
                             return (
                                <div key={g.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${g.priority === 'High' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{g.priority} Priority</span>
                                        {g.status === 'Resolved' ? (
                                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><CheckCircle size={14}/> Resolved</span>
                                        ) : (
                                            <button onClick={() => onResolveGrievance(g.id)} className="text-xs bg-slate-800 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded transition-all">Mark Resolved</button>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-white mb-1">{g.category}</h4>
                                    <p className="text-sm text-slate-400 mb-2">{g.description}</p>
                                    <p className="text-xs text-slate-500">Reported by: {student?.name} (Room {student?.roomNumber})</p>
                                    
                                    {g.aiAnalysis && (
                                        <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded text-xs text-amber-500/80">
                                            AI Note: {g.aiAnalysis}
                                        </div>
                                    )}
                                </div>
                             );
                        })
                    }
                 </div>
             </div>
          </div>
      )}

      {/* MODALS */}
      
      {/* 1. Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                  <button onClick={() => setShowAddStudentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-bold text-white serif mb-6">Register New Student</h3>
                  <form onSubmit={handleAddStudentSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <input required type="text" placeholder="Full Name" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                          <input required type="email" placeholder="Email Address" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <input required type="password" placeholder="Temporary Password" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} />
                          <input required type="date" placeholder="Date of Birth" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} />
                      </div>
                      <input required type="text" placeholder="Aadhar Number (Unique ID)" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.aadharNumber} onChange={e => setNewStudent({...newStudent, aadharNumber: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                          <input required type="text" placeholder="Course (e.g. CS)" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})} />
                          <input required type="number" placeholder="Year" min="1" max="5" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.year} onChange={e => setNewStudent({...newStudent, year: parseInt(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <input required type="text" placeholder="Phone Number" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.phoneNumber} onChange={e => setNewStudent({...newStudent, phoneNumber: e.target.value})} />
                          <input required type="text" placeholder="Parent Phone" className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.parentPhoneNumber} onChange={e => setNewStudent({...newStudent, parentPhoneNumber: e.target.value})} />
                      </div>
                      <input required type="number" placeholder="Total Fees Amount" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newStudent.totalFees} onChange={e => setNewStudent({...newStudent, totalFees: parseInt(e.target.value)})} />
                      
                      <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-lg mt-2">Register Student</button>
                  </form>
             </div>
        </div>
      )}

      {/* 2. Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                  <button onClick={() => setShowAddRoomModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-bold text-white serif mb-6">Add New Room</h3>
                  <form onSubmit={handleAddRoomSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Room Number</label>
                            <input required type="text" placeholder="e.g. 101" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Floor Number</label>
                            <input required type="number" placeholder="1" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: parseInt(e.target.value)})} />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Capacity (Beds)</label>
                            <input required type="number" min="1" max="4" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Monthly Price ($)</label>
                            <input required type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: parseInt(e.target.value)})} />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs text-slate-500 mb-2 block">Amenities</label>
                          <div className="flex gap-4">
                              {['AC', 'Attached Washroom', 'Balcony'].map(feat => (
                                  <button 
                                    key={feat} 
                                    type="button" 
                                    onClick={() => toggleFeature(feat)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${newRoom.features.includes(feat) ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-700'}`}
                                  >
                                    {feat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <input type="text" placeholder="Image URL (Optional)" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newRoom.image} onChange={e => setNewRoom({...newRoom, image: e.target.value})} />
                      
                      <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-lg mt-2">Create Room</button>
                  </form>
             </div>
        </div>
      )}

      {/* 3. Post Notice Modal */}
      {showNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                  <button onClick={() => setShowNoticeModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-bold text-white serif mb-6">Post New Notice</h3>
                  <form onSubmit={handlePostNotice} className="space-y-4">
                      <input required type="text" placeholder="Title" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
                      
                      <select 
                        value={newNotice.priority}
                        onChange={(e) => setNewNotice({...newNotice, priority: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500"
                      >
                          <option value="Normal">Normal Priority</option>
                          <option value="Urgent">Urgent Priority</option>
                      </select>

                      <textarea required placeholder="Notice Content..." rows={4} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500" value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} />
                      
                      <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-lg">Post Notice</button>
                  </form>
             </div>
          </div>
      )}

      {/* 4. Payment Update Modal */}
      {paymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                  <button onClick={() => setPaymentModal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-white serif mb-4">Update Fees</h3>
                  
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Total Fees</span>
                          <span className="text-white font-bold">${paymentModal.total}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Paid So Far</span>
                          <span className="text-emerald-400 font-bold">${paymentModal.currentPaid}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-slate-800 pt-2 mt-2">
                          <span className="text-slate-400">Remaining</span>
                          <span className="text-rose-400 font-bold">${paymentModal.total - paymentModal.currentPaid}</span>
                      </div>
                  </div>
                  
                  {/* Toggle Mode */}
                  <div className="flex bg-slate-950 rounded-lg p-1 mb-4 border border-slate-800">
                      <button onClick={() => setPaymentMode('add')} className={`flex-1 py-1.5 text-xs font-bold rounded ${paymentMode === 'add' ? 'bg-amber-500 text-slate-900' : 'text-slate-500 hover:text-white'}`}>Add Payment</button>
                      <button onClick={() => setPaymentMode('set')} className={`flex-1 py-1.5 text-xs font-bold rounded ${paymentMode === 'set' ? 'bg-amber-500 text-slate-900' : 'text-slate-500 hover:text-white'}`}>Fix / Set Total</button>
                  </div>

                  <form onSubmit={handleSubmitPayment}>
                      <label className="text-xs text-slate-400 mb-1 block">
                          {paymentMode === 'add' ? 'Amount to Add ($)' : 'Correct Total Paid Amount ($)'}
                      </label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500 mb-4"
                      />
                      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> Confirm Update
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* 5. Student Profile Popup */}
      {viewingStudentId && viewingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 relative">
                      <button onClick={() => setViewingStudentId(null)} className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 rounded-full p-1"><X size={20}/></button>
                  </div>
                  <div className="px-6 pb-6 relative">
                      <div className="w-20 h-20 bg-slate-900 rounded-full border-4 border-slate-900 absolute -top-10 flex items-center justify-center text-3xl font-bold text-white">
                          {viewingStudent.name.charAt(0)}
                      </div>
                      
                      <div className="mt-12 text-center">
                          <h3 className="text-2xl font-bold text-white serif">{viewingStudent.name}</h3>
                          <p className="text-amber-500 font-medium">{viewingStudent.course} • Year {viewingStudent.year}</p>
                      </div>

                      <div className="mt-6 space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                              <span className="text-slate-400 text-sm">Room Number</span>
                              <span className="text-white font-bold">{viewingStudent.roomNumber || 'Not Allocated'}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                              <span className="text-slate-400 text-sm">Phone</span>
                              <span className="text-white font-bold">{viewingStudent.phoneNumber}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                              <span className="text-slate-400 text-sm">Parent Phone</span>
                              <span className="text-white font-bold">{viewingStudent.parentPhoneNumber}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                              <span className="text-slate-400 text-sm">Fees Paid</span>
                              <span className={`font-bold ${viewingStudent.totalFees - viewingStudent.paidFees > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  ${viewingStudent.paidFees} / ${viewingStudent.totalFees}
                              </span>
                          </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2">
                          {viewingStudent.roomNumber && (
                               <button 
                                    onClick={handleDeallocateCurrentStudent}
                                    disabled={isProcessing}
                                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                               >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <LogOut size={18} />}
                                    Deallocate Student Only
                               </button>
                          )}
                          <button 
                              onClick={(e) => handleDeleteStudent(e, viewingStudent.id, viewingStudent.name, viewingStudent.roomNumber)}
                              className="w-full bg-transparent hover:bg-rose-950/30 text-rose-600 border border-rose-900/50 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                          >
                              <Trash2 size={16} /> Permanently Delete Student
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
