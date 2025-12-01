import React, { useState } from 'react';
import { Student, Grievance, Room, Notice, LeaveRequest } from '../types';
import { analyzeGrievance } from '../services/geminiService';
import { User, MessageSquare, ShieldCheck, Loader2, Sparkles, AlertTriangle, Pencil, Save, X, Bell, Calendar, Clock, Send } from 'lucide-react';

interface StudentPortalProps {
  student: Student;
  room: Room | undefined;
  grievances: Grievance[];
  notices: Notice[];
  leaveRequests: LeaveRequest[];
  onSubmitGrievance: (g: Omit<Grievance, 'id' | 'status' | 'timestamp'>) => void;
  onUpdateStudent: (updatedData: Partial<Student>) => void;
  onRequestLeave: (req: Omit<LeaveRequest, 'id' | 'status'>) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ student, room, grievances, notices, leaveRequests, onSubmitGrievance, onUpdateStudent, onRequestLeave }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'grievance' | 'leave'>('profile');
  const [category, setCategory] = useState('Maintenance');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{priority: string, analysis: string} | null>(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      course: student.course,
      year: student.year,
      phoneNumber: student.phoneNumber,
      parentPhoneNumber: student.parentPhoneNumber
  });

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
      reason: '',
      startDate: '',
      endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    // AI Analysis Step
    const analysisResult = await analyzeGrievance(description, category);
    
    onSubmitGrievance({
      studentId: student.id,
      category,
      description,
      aiAnalysis: analysisResult.analysis,
      priority: analysisResult.priority as 'Low' | 'Medium' | 'High'
    });

    setAiAnalysis(analysisResult);
    setIsSubmitting(false);
    setDescription('');
    // Clear analysis after 5 seconds
    setTimeout(() => setAiAnalysis(null), 5000);
  };

  const handleSaveProfile = () => {
    onUpdateStudent({
        id: student.id, 
        ...editForm
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
      setEditForm({
        course: student.course,
        year: student.year,
        phoneNumber: student.phoneNumber,
        parentPhoneNumber: student.parentPhoneNumber
      });
      setIsEditing(false);
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
      e.preventDefault();
      onRequestLeave({
          studentId: student.id,
          reason: leaveForm.reason,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate
      });
      setLeaveForm({ reason: '', startDate: '', endDate: '' });
      alert("Leave Request Submitted!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Left Sidebar: Notices & Menu */}
      <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="text-amber-500" /> Digital Notice Board
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {notices.map(notice => (
                      <div key={notice.id} className={`p-3 rounded-lg border ${notice.priority === 'Urgent' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950 border-slate-800'}`}>
                          <div className="flex justify-between items-start">
                              <h4 className={`text-sm font-bold ${notice.priority === 'Urgent' ? 'text-rose-400' : 'text-slate-200'}`}>{notice.title}</h4>
                              <span className="text-[10px] text-slate-500">{new Date(notice.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-3">{notice.content}</p>
                      </div>
                  ))}
                  {notices.length === 0 && <p className="text-slate-500 text-xs italic">No new notices.</p>}
              </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-2 rounded-2xl">
              <button onClick={() => setActiveSection('profile')} className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 font-medium transition-colors ${activeSection === 'profile' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                   <User size={18} /> My Profile
              </button>
              <button onClick={() => setActiveSection('leave')} className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 font-medium transition-colors ${activeSection === 'leave' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                   <Calendar size={18} /> Leave Applications
              </button>
              <button onClick={() => setActiveSection('grievance')} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 font-medium transition-colors ${activeSection === 'grievance' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                   <AlertTriangle size={18} /> Report Issue
              </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Profile Section */}
        {activeSection === 'profile' && (
             <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-8 rounded-2xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck size={120} />
                </div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white serif">{student.name}</h2>
                            {isEditing ? (
                                <div className="flex gap-2 mt-1">
                                    <input 
                                        type="text"
                                        value={editForm.course}
                                        onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white w-24"
                                        placeholder="Course"
                                    />
                                    <input 
                                        type="number"
                                        value={editForm.year}
                                        onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})}
                                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white w-12"
                                        placeholder="Year"
                                    />
                                </div>
                            ) : (
                                <p className="text-amber-400 font-medium">{student.course} • Year {student.year}</p>
                            )}
                        </div>
                    </div>
                    
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                            title="Edit Profile"
                        >
                            <Pencil size={16} />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={cancelEdit} className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-full">
                                <X size={16} />
                            </button>
                            <button onClick={handleSaveProfile} className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full">
                                <Save size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4 border-t border-slate-700 pt-6 relative z-10">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Student ID</span>
                        <span className="text-white font-mono">{student.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Aadhar ID</span>
                        <span className="text-white font-mono tracking-wider">{student.aadharNumber}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400">Email</span>
                        <span className="text-white">{student.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Phone</span>
                        {isEditing ? <input className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white text-right w-32" value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} /> : <span className="text-white">{student.phoneNumber}</span>}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Parent Phone</span>
                        {isEditing ? <input className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white text-right w-32" value={editForm.parentPhoneNumber} onChange={e => setEditForm({...editForm, parentPhoneNumber: e.target.value})} /> : <span className="text-white">{student.parentPhoneNumber}</span>}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Allocation Status</span>
                        {room ? (
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold border border-amber-500/30">
                                Room {room.number}
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm font-bold border border-rose-500/30">
                                Not Allocated
                            </span>
                        )}
                    </div>
                </div>

                {room && (
                    <div className="mt-8 bg-slate-950/60 p-4 rounded-xl relative z-10">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Room Details ({room.type})</h4>
                        <div className="flex flex-wrap gap-2">
                            {room.features.map(f => (
                                <span key={f} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
             </div>
        )}

        {/* Leave Section */}
        {activeSection === 'leave' && (
            <div className="space-y-6">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-8 rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-6 serif flex items-center gap-2">
                        <Calendar className="text-amber-500" /> Request Out-Pass / Leave
                    </h3>
                    <form onSubmit={handleSubmitLeave} className="space-y-4">
                        <textarea 
                            required 
                            placeholder="Reason for leave (e.g., Going home for weekend)..." 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none" 
                            rows={3}
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                            <Send size={16} /> Submit Request
                        </button>
                    </form>
                </div>

                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Request History</h3>
                    <div className="space-y-3">
                        {leaveRequests.length === 0 ? <p className="text-slate-500 italic">No previous requests.</p> : 
                            leaveRequests.map(req => (
                                <div key={req.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-300 text-sm font-medium">{req.reason}</p>
                                        <p className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                                            <Clock size={10} /> {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                                        req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                        req.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' :
                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        )}

        {/* Grievance Form */}
        {activeSection === 'grievance' && (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-8 rounded-2xl shadow-xl h-fit">
                <h3 className="text-2xl font-bold text-white mb-2 serif flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" />
                    Report an Issue
                </h3>
                <p className="text-slate-400 mb-6">Describe your problem. Our AI system will analyze priority and notify the warden instantly.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            <option>Maintenance</option>
                            <option>Cleanliness</option>
                            <option>Noise Complaint</option>
                            <option>Internet/Wifi</option>
                            <option>Roommate Issue</option>
                            <option>Security</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="E.g., The air conditioning in room 102 makes a loud rattling noise..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            required
                        />
                    </div>

                    {aiAnalysis && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-fade-in">
                            <p className="text-amber-400 text-sm font-bold flex items-center gap-2">
                                <Sparkles size={14} /> AI Analysis Complete
                            </p>
                            <p className="text-slate-300 text-xs mt-1">Priority identified as: <span className="font-bold">{aiAnalysis.priority}</span>. Ticket submitted successfully.</p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <MessageSquare size={18} />}
                        {isSubmitting ? 'Analyzing...' : 'Submit Report'}
                    </button>
                </form>

                <div className="mt-8 border-t border-slate-800 pt-6">
                    <h4 className="text-slate-400 font-bold mb-4">Past Reports</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {grievances.map(g => (
                            <div key={g.id} className="p-4 bg-slate-950/80 rounded-lg border border-slate-700">
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-white">{g.category}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        g.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>{g.status}</span>
                                </div>
                                <p className="text-slate-400 text-sm mb-2">{g.description}</p>
                                {g.aiAnalysis && (
                                    <div className="text-xs text-amber-400/80 italic border-t border-slate-800 pt-2 flex gap-1 items-center">
                                        <Sparkles size={10} /> Warden Note: {g.aiAnalysis}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};