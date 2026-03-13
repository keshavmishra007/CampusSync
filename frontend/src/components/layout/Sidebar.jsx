import React, { useEffect, useState } from "react";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  LogOut,
  Plus,
  User,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { authService, chatService } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ selectedChannel, setSelectedChannel }) => {

  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [channels, setChannels] = useState([]);
  const [subjectsOpen, setSubjectsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [newChannelName, setNewChannelName] = useState("");
  const [channelType, setChannelType] = useState("subject");
  const [customYear, setCustomYear] = useState("3");
  const [createError, setCreateError] = useState("");
  const [profile, setProfile] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  // safer localStorage parsing
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isFaculty = user?.role?.toLowerCase() === "faculty";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await chatService.getChannels();
        setChannels(res.data);

        if (res.data.length > 0 && !selectedChannel) {
          setSelectedChannel(res.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch channels", error);
      }
    };

    fetchChannels();
  }, [selectedChannel]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getMe();
        setProfile(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, []);

  // Group channels
  const branchChannels = channels.filter((c) => c.type === "branch-year");
  const subjects = channels.filter((c) => c.type === "subject");
  const projects = channels.filter((c) => c.type === "custom");

  // Create channel
  const createChannel = async () => {
    try {
      const payload = {
        name: newChannelName.trim(),
        type: channelType,
        branch: user?.branch || "CSE",
      };

      if (!payload.name) {
        setCreateError("Channel name is required.");
        return;
      }

      if (channelType === "custom") {
        payload.year = Number(customYear);
      }

      const res = await chatService.createChannel(payload);

      setShowCreateModal(false);
      setNewChannelName("");
      setChannelType("subject");
      setCustomYear("3");
      setCreateError("");

      const channelRes = await chatService.getChannels();
      setChannels(channelRes.data);
      setSelectedChannel(res.data);

    } catch (err) {
      setCreateError(
        err?.response?.data?.message || "Channel creation failed."
      );
      console.error("Channel creation failed", err);
    }
  };

  return (
    <div className="w-72 h-screen bg-sidebar flex flex-col text-slate-300 border-r border-slate-700/50">

      {/* HEADER */}
      <div className="p-6 border-b border-slate-700/50">
        <Logo forceWhite />
      </div>

      {/* BRANCH CHANNELS */}
      <div className="px-4 pt-4 space-y-2">
        {branchChannels.map((channel) => (
          <button
            key={channel._id}
            onClick={() => setSelectedChannel(channel)}
            className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg transition ${
              selectedChannel?._id === channel._id
                ? "bg-primary text-white"
                : "text-slate-400 hover:bg-sidebar-hover"
            }`}
          >
            <Hash size={16} />
            {channel.name}
          </button>
        ))}
      </div>

      {/* CHANNEL LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

        {/* SUBJECTS */}
        <div>
          <button
            onClick={() => setSubjectsOpen(!subjectsOpen)}
            className="flex items-center justify-between w-full text-xs text-slate-400 px-2 mb-2"
          >
            <span>SUBJECTS</span>
            {subjectsOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
          </button>

          {subjectsOpen && subjects.map((channel) => (
            <button
              key={channel._id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                selectedChannel?._id === channel._id
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:bg-sidebar-hover"
              }`}
            >
              <Hash size={16}/>
              {channel.name}
            </button>
          ))}
        </div>

        {/* PROJECT GROUPS */}
        <div>
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex items-center justify-between w-full text-xs text-slate-400 px-2 mb-2"
          >
            <span>PROJECT GROUPS</span>
            {projectsOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
          </button>

          {projectsOpen && projects.map((channel) => (
            <button
              key={channel._id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                selectedChannel?._id === channel._id
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:bg-sidebar-hover"
              }`}
            >
              <Hash size={16}/>
              {channel.name}
            </button>
          ))}
        </div>

        {/* CREATE CHANNEL BUTTON */}
        {isFaculty && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-sm text-primary px-2 py-2 hover:bg-primary/10 rounded-lg"
          >
            <Plus size={16}/>
            Create Channel
          </button>
        )}

      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-700/50 space-y-4">

        {/* THEME SWITCH */}
        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
          {[
            { mode: "light", icon: Sun, label: "Light mode" },
            { mode: "dark", icon: Moon, label: "Dark mode" },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              title={label}
              className={`flex-1 py-2 rounded-md transition flex items-center justify-center ${
                theme === mode
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <User size={16}/>
          <span className="text-xs">Profile</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-500"
        >
          <LogOut size={16}/>
          <span className="text-xs">Logout</span>
        </button>

      </div>

      {/* CREATE CHANNEL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-slate-900 p-6 rounded-lg w-80 space-y-4">

            <h3 className="text-lg font-semibold text-white">
              Create Channel
            </h3>

            <input
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e)=>setNewChannelName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 text-white"
            />

            <select
              value={channelType}
              onChange={(e) => {
                setChannelType(e.target.value);
                setCreateError("");
              }}
              className="w-full px-3 py-2 rounded bg-slate-800 text-white"
            >
              <option value="subject">Subject</option>
              <option value="custom">Project Group</option>
            </select>

            {channelType === "custom" && (
              <select
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 text-white"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            )}

            {createError && (
              <p className="text-sm text-red-400">{createError}</p>
            )}

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError("");
                }}
                className="text-slate-400"
              >
                Cancel
              </button>

              <button
                onClick={createChannel}
                className="bg-primary px-4 py-2 rounded text-white"
              >
                Create
              </button>

            </div>

          </div>

        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowProfile(false)}
          />
          <div className="w-[380px] bg-slate-900 border-l border-slate-700/50 text-slate-200 h-full flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Profile</h2>
                <p className="text-sm text-slate-400">Registration details</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfile(false)}
                className="p-2 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-xl font-bold">
                  {profile?.name?.[0] || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {profile?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-slate-400">{profile?.email || "-"}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-xl bg-slate-800/80 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Role</p>
                  <p className="text-sm font-medium capitalize text-white">
                    {profile?.role || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-800/80 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Branch</p>
                  <p className="text-sm font-medium text-white">
                    {profile?.branch || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-800/80 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Year</p>
                  <p className="text-sm font-medium text-white">
                    {profile?.year || "-"}
                  </p>
                </div>

                {profile?.role === "student" && (
                  <div className="rounded-xl bg-slate-800/80 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                      Enrollment Number
                    </p>
                    <p className="text-sm font-medium text-white">
                      {profile?.enrollmentNumber || "-"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;
