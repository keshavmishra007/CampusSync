import { io } from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MoreVertical,
  Megaphone,
  FileText,
  AlertTriangle,
  Clock,
  X,
  Paperclip,
  Download,
  Crown,
  BellOff,
  BellRing,
} from "lucide-react";
import { chatService } from "../../services/api";
import { Button } from "../ui/Button";

const ChatWindow = ({ selectedChannel }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [msgType, setMsgType] = useState("normal");
  const [deadline, setDeadline] = useState("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isFaculty = user?.role === "faculty";

  useEffect(() => {
    socketRef.current = io("https://campussync-pqrs.onrender.com");
    socketRef.current.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedChannel?._id || !socketRef.current) return;
    socketRef.current.emit("joinChannel", selectedChannel._id);
    fetchMessages();
  }, [selectedChannel]);

  const fetchMessages = async () => {
    try {
      const res = await chatService.getMessages(selectedChannel._id);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const openMembers = async () => {
    try {
      const res = await chatService.getMembers(selectedChannel._id);
      setMembers(res.data);
      setShowMembers(true);
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    try {
      await chatService.removeMember(selectedChannel._id, userId);
      setMembers((prev) => prev.filter((m) => m._id !== userId));
    } catch (error) {
      console.error("Remove failed", error.response?.data);
    }
  };

  const updateMemberMuteState = (userId, isMuted) => {
    setMembers((prev) =>
      prev.map((member) =>
        member._id === userId ? { ...member, isMuted } : member
      )
    );
  };

  const muteMember = async (userId) => {
    try {
      await chatService.muteMember(selectedChannel._id, userId);
      updateMemberMuteState(userId, true);
    } catch (error) {
      console.error("Mute failed", error.response?.data || error.message);
    }
  };

  const unmuteMember = async (userId) => {
    try {
      await chatService.unmuteMember(selectedChannel._id, userId);
      updateMemberMuteState(userId, false);
    } catch (error) {
      console.error("Unmute failed", error.response?.data || error.message);
    }
  };

  const handleFileSelect = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("channelId", selectedChannel._id);
    formData.append("messageType", msgType);
    if (msgType === "assignment") formData.append("deadline", deadline);
    try {
      await chatService.sendMessage(formData);
      setMsgType("normal");
    } catch (err) {
      console.error("File send failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const payload = {
        channelId: selectedChannel._id,
        content: input,
        messageType: msgType,
        deadline: msgType === "assignment" ? deadline : null,
      };
      await chatService.sendMessage(payload);
      setInput("");
      setMsgType("normal");
      setShowTypeMenu(false);
    } catch (error) {
      alert(error.response?.data?.message || "Send failed");
      console.error("Send failed", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChannel) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:bg-[#0f172a]">
        Select a channel
      </div>
    );
  }

  const activeStudents = members.filter(
    (member) => member.role === "student" && !member.isMuted
  );
  const mutedStudents = members.filter(
    (member) => member.role === "student" && member.isMuted
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 dark:bg-[#0f172a] relative overflow-hidden transition-colors duration-300">
      
      {/* HEADER */}
      <header className="h-20 px-6 bg-white dark:bg-[#1e293b] border-b dark:border-slate-800 flex items-center shrink-0">
        <button
          onClick={openMembers}
          className="group flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-sm">
            #
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
              {selectedChannel.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Main channel for Computer Science students
            </p>
          </div>
        </button>
      </header>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isStudent = msg.sender?.role === "student";
          
          const getBubbleStyles = () => {
            if (isStudent) return "bg-blue-600 text-white rounded-br-sm shadow-md";
            switch(msg.messageType) {
              case "announcement": return "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-l-4 border-blue-500 rounded-bl-sm";
              case "assignment": return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-l-4 border-emerald-500 rounded-bl-sm";
              case "alert": return "bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 border-l-4 border-rose-500 rounded-bl-sm";
              default: return "bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 border dark:border-slate-700 rounded-bl-sm";
            }
          };

          return (
            <div key={msg._id} className={`flex flex-col ${isStudent ? "items-end" : "items-start"} gap-1.5`}>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 px-1">
                <span className="font-semibold">{msg.sender?.name}</span>
                {msg.sender?.role === "faculty" && (
                  <span className="bg-blue-600 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">Faculty</span>
                )}
              </div>
              <div className={`px-5 py-3 rounded-2xl max-w-[70%] shadow-sm space-y-2 ${getBubbleStyles()}`}>
                {msg.messageType !== "normal" && (
                  <div className="flex items-center gap-2 font-bold text-xs tracking-wider uppercase">
                    {msg.messageType === "announcement" && <Megaphone size={14} />}
                    {msg.messageType === "assignment" && <FileText size={14} />}
                    {msg.messageType === "alert" && <AlertTriangle size={14} />}
                    {msg.messageType}
                  </div>
                )}
                {msg.content?.trim() && (
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}
                {msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {msg.fileName || "Attachment"}
                      </p>
                      {msg.fileType && (
                        <p className="text-xs opacity-75 truncate">{msg.fileType}</p>
                      )}
                    </div>
                    <Download size={16} className="shrink-0" />
                  </a>
                )}
                {msg.deadline && (
                  <div className="flex items-center gap-2 text-xs font-medium bg-black/5 dark:bg-white/5 p-2 rounded-lg mt-2">
                    <Clock size={14} /> Due: {msg.deadline}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA WITH SELECTION BANNERS */}
      <div className={`p-4 border-t dark:border-slate-800 shrink-0 transition-all duration-300 
        ${msgType === "announcement" ? "bg-blue-50 dark:bg-blue-900/10" : 
          msgType === "assignment" ? "bg-emerald-50 dark:bg-emerald-900/10" : 
          msgType === "alert" ? "bg-rose-50 dark:bg-rose-900/10" : "bg-white dark:bg-[#1e293b]"}`}>
        
        {msgType !== "normal" && (
          <div className={`flex items-center justify-between px-4 py-2 rounded-lg mb-3 animate-in slide-in-from-bottom-2 
            ${msgType === "announcement" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : 
              msgType === "assignment" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" : 
              "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"}`}>
            
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
              {msgType === "announcement" && <><Megaphone size={16}/> Announcement Mode</>}
              {msgType === "assignment" && <><FileText size={16}/> Assignment Mode</>}
              {msgType === "alert" && <><AlertTriangle size={16}/> Alert Mode</>}
            </div>
            
            <button onClick={() => setMsgType("normal")} className="hover:opacity-70"><X size={18} /></button>
          </div>
        )}

        {msgType === "assignment" && (
          <div className="mb-3 px-1 animate-in fade-in">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Submission Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border dark:border-slate-700 dark:bg-[#1e293b] dark:text-white p-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3 relative max-w-4xl mx-auto">
          <div className="flex items-center gap-1 relative">
            {isFaculty && (
              <div className="relative">
                <button type="button" onClick={() => setShowTypeMenu(!showTypeMenu)} 
                  className={`p-2.5 rounded-lg transition-colors ${showTypeMenu ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300'}`}>
                  <MoreVertical size={20} />
                </button>

                {showTypeMenu && (
                  <div className="absolute bottom-14 left-0 w-56 bg-white dark:bg-[#1e293b] shadow-2xl rounded-2xl p-2 border dark:border-slate-700 z-[100] animate-in fade-in zoom-in-95 duration-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2 tracking-widest">Select Category</p>
                    <button type="button" onClick={() => { setMsgType("normal"); setShowTypeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm dark:text-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Send size={14}/></div>
                      Normal
                    </button>
                    <button type="button" onClick={() => { setMsgType("announcement"); setShowTypeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"><Megaphone size={14}/></div>
                      Announcement
                    </button>
                    <button type="button" onClick={() => { setMsgType("assignment"); setShowTypeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><FileText size={14}/></div>
                      Assignment
                    </button>
                    <button type="button" onClick={() => { setMsgType("alert"); setShowTypeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-sm text-rose-600 dark:text-rose-400">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center"><AlertTriangle size={14}/></div>
                      Urgent Alert
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />
            <button type="button" onClick={handleFileSelect} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-300">
              <Paperclip size={20} />
            </button>
          </div>

          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message #${selectedChannel.name}`}
            className="flex-1 bg-slate-100 dark:bg-[#0f172a] border-none dark:text-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-5 shadow-lg shadow-blue-500/20"><Send size={18} /></Button>
        </form>
      </div>

      {/* RIGHT SIDE PANEL - RESTORED REMOVE OPTION */}
      {showMembers && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowMembers(false)} />
          <div className="w-[400px] bg-white dark:bg-[#1e293b] shadow-2xl h-full flex flex-col border-l dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Members ({members.length})</h2>
              <button onClick={() => setShowMembers(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Faculty Moderators</h4>
                <div className="space-y-4">
                  {members.filter(m => m.role === "faculty").map(member => (
                    <div key={member._id} className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                        {member.name[0]}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold dark:text-slate-100">{member.name}</p>
                        <Crown size={16} className="text-blue-500 fill-blue-500/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Students</h4>
                <div className="space-y-4">
                  {activeStudents.map(member => (
                    <div key={member._id} className="group flex items-center gap-4 p-2 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold dark:text-slate-300">
                        {member.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.branch} - {member.year}</p>
                      </div>
                      
                      {isFaculty && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => muteMember(member._id)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                            title="Mute student"
                          >
                            <BellOff size={18} />
                          </button>
                          <button 
                            onClick={() => removeMember(member._id)} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Remove from channel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Muted Students</h4>
                <div className="space-y-4">
                  {mutedStudents.map(member => (
                    <div key={member._id} className="group flex items-center gap-4 p-2 rounded-xl transition-all bg-amber-50 dark:bg-amber-900/10">
                      <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-300">
                        {member.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.branch} - {member.year}</p>
                      </div>

                      {isFaculty && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => unmuteMember(member._id)}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                            title="Unmute student"
                          >
                            <BellRing size={18} />
                          </button>
                          <button
                            onClick={() => removeMember(member._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Remove from channel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {mutedStudents.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No muted students.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
