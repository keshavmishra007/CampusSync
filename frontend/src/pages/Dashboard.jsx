import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import AIAssistant from "../components/chat/AIAssistant";

const Dashboard = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar */}
      <Sidebar
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />

      {/* Chat Area */}
      <main className="flex-1 relative">
        <ChatWindow selectedChannel={selectedChannel} />
        <AIAssistant />
      </main>

    </div>
  );
};

export default Dashboard;