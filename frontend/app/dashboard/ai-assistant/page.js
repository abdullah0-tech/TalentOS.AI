'use client';

import { useState, useEffect, useRef } from 'react';
import { request } from '../../../services/api';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Trash2, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  RefreshCw,
  Terminal,
  Activity,
  Cpu,
  Layers,
  CheckCircle,
  Database,
  Search,
  Server
} from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef(null);

  // MCP Mock Terminal Activity log
  const [mcpLogs, setMcpLogs] = useState([
    { time: '23:14:02', level: 'system', server: 'StitchMCP', message: 'Connection established successfully.' },
    { time: '23:14:05', level: 'info', server: 'StitchMCP', message: 'Registered 12 tools to schema registry.' },
    { time: '23:15:32', level: 'system', server: 'KnowledgeBaseMCP', message: 'Ingested 14 company policy manuals.' },
    { time: '23:18:14', level: 'tool', server: 'StitchMCP', message: 'Executing tool: get_project { id: "hireflow" }' },
    { time: '23:18:15', level: 'success', server: 'StitchMCP', message: 'Tool output received. 1 project returned.' }
  ]);

  useEffect(() => {
    fetchHistory();
    // Simulate real-time MCP activity updates
    const interval = setInterval(() => {
      const serverNames = ['StitchMCP', 'KnowledgeBaseMCP'];
      const levels = ['tool', 'success', 'info'];
      const server = serverNames[Math.floor(Math.random() * serverNames.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      
      let message = '';
      if (server === 'StitchMCP') {
        message = level === 'tool' ? 'Executing tool: list_screens {}' 
                : level === 'success' ? 'Tool output: list_screens returned 6 records' 
                : 'Tool schema validation passed.';
      } else {
        message = level === 'tool' ? 'Executing tool: search_kb { query: "vacation" }' 
                : level === 'success' ? 'RAG database query matched 2 passages' 
                : 'Vector cache synchronized.';
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setMcpLogs(prev => [...prev.slice(-8), { time: timeStr, level, server, message }]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await request('/chat/history');
      setHistory(data);
      if (messages.length === 0 && data.length > 0) {
        const mapped = data.map(h => [
          { sender: 'user', text: h.message, time: h.createdAt },
          { sender: 'assistant', text: h.response, time: h.createdAt }
        ]).flat();
        setMessages(mapped);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const text = customText || input;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    // Log tool call simulation to terminal
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setMcpLogs(prev => [...prev, 
      { time: timeStr, level: 'tool', server: 'KnowledgeBaseMCP', message: `Executing RAG search query: "${text}"` }
    ]);

    if (!customText) setInput('');
    setLoading(true);

    try {
      const data = await request('/chat', {
        method: 'POST',
        body: { message: text }
      });
      const aiMsg = { sender: 'assistant', text: data.response, time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      
      const successNow = new Date();
      const successTimeStr = `${successNow.getHours().toString().padStart(2, '0')}:${successNow.getMinutes().toString().padStart(2, '0')}:${successNow.getSeconds().toString().padStart(2, '0')}`;
      setMcpLogs(prev => [...prev, 
        { time: successTimeStr, level: 'success', server: 'KnowledgeBaseMCP', message: `RAG search returned response. Payload: ${data.response.slice(0, 30)}...` }
      ]);

      fetchHistory();
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: `Error: ${err.message || 'Failed to connect to AI server. Please try again.'}`,
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { label: 'Rank Frontend Candidates', text: 'Show top frontend developer candidates and explain their scores.' },
    { label: 'Leave Policy Summary', text: 'What is our corporate policy on annual vacation days and sick leave?' },
    { label: 'Hiring Insights', text: 'Generate an analytics report explaining our recent application trends.' },
    { label: 'Suggest Interview Questions', text: 'Provide a list of mid-level backend node.js interview questions.' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[550px] font-sans">
      
      {/* 1. Left Sidebar: Chat History */}
      <div className="w-full lg:w-64 bg-surface-container/20 border border-outline rounded-2xl p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline">
            <h3 className="font-bold text-xs text-on-surface flex items-center gap-2 font-mono uppercase tracking-wider">
              <MessageSquare size={14} className="text-primary-light" /> Threads
            </h3>
            <button 
              onClick={fetchHistory}
              className="p-1 hover:bg-surface-high text-muted hover:text-on-surface rounded-lg transition"
              title="Refresh History"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-360px)] pr-1 scrollbar-none">
            {loadingHistory ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-[#080C16]/50 border border-outline/50 rounded-xl animate-pulse"></div>
              ))
            ) : history.length === 0 ? (
              <p className="text-muted text-[10px] py-8 text-center font-mono">No recent chats.</p>
            ) : (
              history.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSend(null, chat.message)}
                  className="w-full text-left p-2.5 hover:bg-surface-container/50 border border-transparent hover:border-outline rounded-xl transition flex flex-col gap-1 overflow-hidden"
                >
                  <p className="text-[11px] text-on-surface font-semibold truncate w-full">{chat.message}</p>
                  <span className="text-[8px] text-muted font-medium font-mono">
                    {new Date(chat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[10px] text-primary-light leading-normal flex items-start gap-2">
          <HelpCircle size={14} className="shrink-0 mt-0.5" />
          <span className="font-mono">RAG system links Candidate DB, Knowledge Base, and Stitch UI.</span>
        </div>
      </div>

      {/* 2. Central Section: Chat Window */}
      <div className="flex-1 bg-surface-container/20 border border-outline rounded-2xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-outline bg-[#080C16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 border border-primary/25 text-primary flex items-center justify-center rounded-xl font-bold">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-on-surface tracking-tight">AI HR Agent</h2>
              <p className="text-[9px] text-muted font-mono mt-0.5">Dual-RAG Database Search</p>
            </div>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-primary/10 text-primary-light border border-primary/20 font-mono">
            Grok ATS-1.5
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-none">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center max-w-md mx-auto text-center py-10">
              
              {/* Pulsing AI Orb Sphere */}
              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/25 rounded-full blur-xl animate-pulse-glow" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent animate-orb-float flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Sparkles size={18} />
                </div>
              </div>

              <h3 className="text-md font-bold text-on-surface tracking-tight font-display">Recruiter Command Workspace</h3>
              <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-mono">
                Ask about candidate rankings, policies, or request job post drafts.
              </p>

              {/* Sample Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleSend(e, p.text)}
                    className="p-3 bg-surface-container/20 hover:bg-surface-container/50 border border-outline hover:border-primary/20 text-left rounded-xl transition text-[11px] flex flex-col gap-1 hover:translate-y-[-1px]"
                  >
                    <span className="font-bold text-primary-light flex items-center gap-1">
                      {p.label} <ArrowRight size={10} />
                    </span>
                    <span className="text-muted line-clamp-1">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] rounded-xl p-3 leading-relaxed text-[11px] shadow-sm whitespace-pre-wrap
                    ${msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white font-medium border border-primary/20 shadow-md shadow-primary/10' 
                      : 'bg-surface-container border border-outline text-on-surface'}
                  `}>
                    {msg.text}
                    {msg.time && (
                      <span className={`block text-[8px] mt-1.5 text-right font-mono ${msg.sender === 'user' ? 'text-primary-light' : 'text-muted'}`}>
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container border border-outline text-muted rounded-xl p-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce delay-200"></span>
                    <span className="text-[9px] font-mono text-muted pl-1">RAG querying...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-outline bg-[#080C16]">
          <form onSubmit={handleSend} className="flex gap-2.5">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Show top frontend applicants')"
              className="flex-1 bg-surface-container/30 border border-outline focus:border-primary text-on-surface placeholder-muted rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold transition flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-lg shadow-primary/15"
            >
              Send <Send size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Right Sidebar: MCP Server Visualization */}
      <div className="w-full lg:w-72 bg-surface-container/20 border border-outline rounded-2xl p-4 flex flex-col justify-between shrink-0 font-mono text-[10px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline">
            <Server size={14} className="text-secondary" />
            <h3 className="font-bold text-on-surface text-xs uppercase tracking-wider">MCP Activity Monitor</h3>
          </div>

          {/* Servers Status */}
          <div className="space-y-2">
            <p className="text-muted font-bold text-[9px] uppercase tracking-wider">Connected Servers</p>
            <div className="space-y-1.5">
              <div className="p-2 bg-[#080C16] border border-outline rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={12} className="text-primary-light" />
                  <span className="text-on-surface font-bold">StitchMCP</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-success">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span> ONLINE
                </span>
              </div>
              <div className="p-2 bg-[#080C16] border border-outline rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu size={12} className="text-accent" />
                  <span className="text-on-surface font-bold">KnowledgeBaseMCP</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-success">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span> ONLINE
                </span>
              </div>
            </div>
          </div>

          {/* Registered Tools list */}
          <div className="space-y-2">
            <p className="text-muted font-bold text-[9px] uppercase tracking-wider">Registered Tools</p>
            <div className="flex flex-wrap gap-1 max-h-[110px] overflow-y-auto scrollbar-none p-1 bg-[#080C16] border border-outline rounded-xl">
              {['get_project', 'list_screens', 'generate_screen_from_text', 'search_kb', 'parse_resume', 'get_score', 'schedule_interview', 'send_invite'].map(tool => (
                <span key={tool} className="px-1.5 py-0.5 rounded bg-surface-high border border-outline text-primary-light text-[8px] font-semibold">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Active Logs Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-muted font-bold text-[9px] uppercase tracking-wider">Execution Log</p>
              <span className="text-[8px] text-muted">Auto-refreshing</span>
            </div>
            <div className="p-3 bg-[#080C16] border border-outline rounded-xl h-48 overflow-y-auto scrollbar-none flex flex-col gap-2 font-mono text-[9px]">
              {mcpLogs.map((log, index) => {
                let textClass = 'text-on-surface-variant';
                if (log.level === 'system') textClass = 'text-success';
                else if (log.level === 'tool') textClass = 'text-primary-light';
                else if (log.level === 'success') textClass = 'text-accent';

                return (
                  <div key={index} className="leading-relaxed border-b border-outline/20 pb-1 last:border-0">
                    <div className="flex items-center justify-between text-[8px] text-muted">
                      <span>{log.time} &bull; {log.server}</span>
                    </div>
                    <p className={`mt-0.5 ${textClass}`}>{log.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Agent Status Footer */}
        <div className="pt-3 border-t border-outline flex items-center justify-between text-[8px] text-muted font-mono">
          <span>Agent Loop State:</span>
          <span className="inline-flex items-center gap-1 font-bold text-primary-light">
            <span className="w-1 h-1 bg-primary-light rounded-full animate-ping"></span> LISTENING_FOR_COMMAND
          </span>
        </div>
      </div>

    </div>
  );
}
