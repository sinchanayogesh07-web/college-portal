import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, Database, Server, Terminal, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api.ts';

interface RenderDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderDeployModal: React.FC<RenderDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    mode: 'mongodb' | 'in-memory';
    uriProvided: boolean;
    driver: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await api.getDbStatus();
      setDbStatus(data);
    } catch {
      // fallback
    } finally {
      setLoadingStatus(false);
    }
  };

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderYamlContent = `services:
  - type: web
    name: campus-placement-portal
    env: node
    plan: free
    region: oregon
    buildCommand: npm install && npm run build
    startCommand: npm run start
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false # Paste your MongoDB Atlas URI in Render Dashboard`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Render & MongoDB Deployment Guide</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow these steps to deploy this full-stack portal to Render with MongoDB.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Current Runtime Status Banner */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <span>Current Backend Datastore:</span>
                  <span className={`px-2 py-0.5 text-[11px] rounded font-mono ${
                    dbStatus?.mode === 'mongodb' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {dbStatus?.mode === 'mongodb' ? 'Connected to MongoDB Atlas' : 'In-Memory / Local Store'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {dbStatus?.mode === 'mongodb'
                    ? 'All jobs, resumes, and interview bookings are persisting to your MongoDB cluster.'
                    : 'The app works 100% out of the box with built-in realistic data and auto-switches to MongoDB once MONGODB_URI is provided.'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Step 1: Render Web Service Setup */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Step 1: Create Web Service on Render
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-700">
              <p>
                1. Go to{' '}
                <a
                  href="https://dashboard.render.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  dashboard.render.com <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p>2. Click <strong>New +</strong> &rarr; <strong>Web Service</strong>.</p>
              <p>3. Connect your GitHub/GitLab repository.</p>
            </div>
          </div>

          {/* Step 2: Build & Start Commands */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Step 2: Service Configuration Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium">Build Command</span>
                <div className="flex items-center justify-between mt-1 font-mono text-xs text-slate-800">
                  <code>npm install &amp;&amp; npm run build</code>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run build', 'build')}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {copiedKey === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium">Start Command</span>
                <div className="flex items-center justify-between mt-1 font-mono text-xs text-slate-800">
                  <code>npm run start</code>
                  <button
                    onClick={() => copyToClipboard('npm run start', 'start')}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {copiedKey === 'start' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: MongoDB Atlas Environment Variables */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Step 3: Environment Variables (Render Dashboard &rarr; Environment)
            </h3>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-emerald-400">NODE_ENV</span>
                <span className="text-slate-400">production</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-emerald-400">PORT</span>
                <span className="text-slate-400">10000</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-emerald-400 block">MONGODB_URI</span>
                  <span className="text-slate-500 text-[11px]">
                    mongodb+srv://&lt;db_user&gt;:&lt;password&gt;@cluster0.abcde.mongodb.net/placement_db?retryWrites=true&amp;w=majority
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'mongodb+srv://<db_user>:<password>@cluster0.abcde.mongodb.net/placement_db?retryWrites=true&w=majority',
                      'mongo_uri'
                    )
                  }
                  className="text-slate-400 hover:text-slate-200 p-1 shrink-0"
                  title="Copy MongoDB URI template"
                >
                  {copiedKey === 'mongo_uri' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 4: Render Blueprint File (render.yaml) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Step 4: Automated Blueprint File (render.yaml)
              </h3>
              <button
                onClick={() => copyToClipboard(renderYamlContent, 'yaml')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                {copiedKey === 'yaml' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy YAML
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
              {renderYamlContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>The repository already includes <code className="text-slate-700 font-mono">render.yaml</code> in its root.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
