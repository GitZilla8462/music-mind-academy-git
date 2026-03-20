// Article Management Panel
// src/components/teacher/ArticleManagementPanel.jsx
// Admin panel for managing news feed articles and artist allow/block lists.
// Standalone component — no props required.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Newspaper,
  Star,
  Flag,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  Shield,
  ShieldOff,
  AlertTriangle,
  Loader2,
  Music,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============================================================
// TAB DEFINITIONS
// ============================================================

const TABS = [
  { id: 'articles', label: 'Articles', icon: Newspaper },
  { id: 'allowlist', label: 'Artist Allowlist', icon: Shield },
  { id: 'blocklist', label: 'Artist Blocklist', icon: ShieldOff },
];

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_ARTICLES = [
  { _id: '1', headline: 'Taylor Swift Breaks Another Streaming Record', source: 'Rolling Stone', date: '2026-03-18', views: 142, flags: 0, approved: true, featured: true },
  { _id: '2', headline: 'How AI Is Changing the Way We Make Music', source: 'Wired', date: '2026-03-17', views: 98, flags: 0, approved: true, featured: false },
  { _id: '3', headline: 'K-Pop Group NewJeans Announces World Tour', source: 'Billboard', date: '2026-03-17', views: 87, flags: 1, approved: true, featured: false },
  { _id: '4', headline: 'Spotify Raises Prices Again for Premium Users', source: 'The Verge', date: '2026-03-16', views: 73, flags: 0, approved: true, featured: false },
  { _id: '5', headline: 'Why Vinyl Sales Keep Growing in a Digital World', source: 'NPR', date: '2026-03-15', views: 61, flags: 0, approved: true, featured: false },
  { _id: '6', headline: 'New Study Links Music Practice to Better Math Scores', source: 'EdWeek', date: '2026-03-15', views: 45, flags: 0, approved: true, featured: false },
  { _id: '7', headline: 'Grammy Awards Announce New Category for Video Game Music', source: 'Variety', date: '2026-03-14', views: 39, flags: 2, approved: true, featured: false },
  { _id: '8', headline: 'Controversial Lyrics Spark Debate About Content in Schools', source: 'Music News Daily', date: '2026-03-13', views: 22, flags: 4, approved: false, featured: false },
];

const MOCK_ALLOWLIST = [
  { name: 'Taylor Swift', genres: 'Pop, Country', verified: true },
  { name: 'Beyonce', genres: 'R&B, Pop', verified: true },
  { name: 'Billie Eilish', genres: 'Pop, Alt', verified: true },
  { name: 'Bruno Mars', genres: 'Pop, R&B', verified: true },
  { name: 'Olivia Rodrigo', genres: 'Pop, Rock', verified: true },
  { name: 'Lin-Manuel Miranda', genres: 'Musical Theater, Hip-Hop', verified: true },
  { name: 'Yo-Yo Ma', genres: 'Classical', verified: true },
  { name: 'Lizzo', genres: 'Pop, Hip-Hop', verified: true },
  { name: 'BTS', genres: 'K-Pop', verified: true },
  { name: 'Dua Lipa', genres: 'Pop, Dance', verified: true },
  { name: 'John Williams', genres: 'Film Score, Classical', verified: true },
  { name: 'Kendrick Lamar', genres: 'Hip-Hop', verified: true },
];

const MOCK_BLOCKLIST = [
  { name: 'Example Blocked Artist 1', reason: 'Content not appropriate for middle school audience' },
  { name: 'Example Blocked Artist 2', reason: 'Explicit lyrics in majority of catalog' },
];

// ============================================================
// ARTICLES TAB
// ============================================================

const ArticlesTab = () => {
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(null);

  // Attempt to fetch from real API on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news/admin`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setArticles(data);
            setApiAvailable(true);
            return;
          }
        }
        setApiAvailable(false);
      } catch {
        setApiAvailable(false);
      }
    };
    fetchArticles();
  }, []);

  const toggleApproval = async (id) => {
    const article = articles.find(a => a._id === id);
    if (!article) return;

    const newApproved = !article.approved;

    // Optimistic update
    setArticles(prev => prev.map(a => a._id === id ? { ...a, approved: newApproved } : a));

    if (apiAvailable) {
      try {
        await fetch(`${API_BASE}/api/news/admin/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved: newApproved })
        });
      } catch {
        // Revert on failure
        setArticles(prev => prev.map(a => a._id === id ? { ...a, approved: !newApproved } : a));
      }
    }
  };

  const toggleFeatured = async (id) => {
    const article = articles.find(a => a._id === id);
    if (!article) return;

    const newFeatured = !article.featured;
    setArticles(prev => prev.map(a => a._id === id ? { ...a, featured: newFeatured } : a));

    if (apiAvailable) {
      try {
        await fetch(`${API_BASE}/api/news/admin/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featured: newFeatured })
        });
      } catch {
        setArticles(prev => prev.map(a => a._id === id ? { ...a, featured: !newFeatured } : a));
      }
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateResult(null);

    if (apiAvailable) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/news/generate`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        setGenerateResult({ success: true, count: data.count || data.generated || 0 });
        // Re-fetch articles
        const articlesRes = await fetch(`${API_BASE}/api/news/admin`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (articlesRes.ok) {
          const updated = await articlesRes.json();
          if (Array.isArray(updated)) setArticles(updated);
        }
      } catch {
        setGenerateResult({ success: false, error: 'Failed to generate articles' });
      }
    } else {
      // Simulate generation with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerateResult({ success: true, count: 5, mock: true });
    }

    setGenerating(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{articles.length} articles</span>
          {apiAvailable === false && (
            <span className="text-xs text-yellow-500 bg-yellow-900/20 px-2 py-0.5 rounded">
              Using mock data — API unavailable
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {generateResult && (
            <span className={`text-xs ${generateResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {generateResult.success
                ? `Generated ${generateResult.count} articles${generateResult.mock ? ' (simulated)' : ''}`
                : generateResult.error
              }
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm rounded-lg transition-colors"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate Articles
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Headline</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Source</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Date</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Views</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Flags</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Featured</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr
                key={article._id}
                className={`border-b border-gray-700/50 transition-colors ${
                  !article.approved ? 'bg-red-900/10' : 'hover:bg-gray-700/30'
                }`}
              >
                <td className="px-4 py-3 max-w-[300px]">
                  <span className="text-white truncate block">{article.headline}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{article.source}</td>
                <td className="px-4 py-3 text-center text-gray-400 tabular-nums whitespace-nowrap">
                  {article.date}
                </td>
                <td className="px-4 py-3 text-center text-gray-300 tabular-nums">{article.views}</td>
                <td className="px-4 py-3 text-center">
                  {article.flags > 0 ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      article.flags >= 3 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      <Flag className="w-3.5 h-3.5" />
                      {article.flags}
                    </span>
                  ) : (
                    <span className="text-gray-600">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleApproval(article._id)}
                    className="inline-flex items-center gap-1"
                    title={article.approved ? 'Click to unapprove' : 'Click to approve'}
                  >
                    {article.approved ? (
                      <ToggleRight className="w-6 h-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-red-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleFeatured(article._id)}
                    className="transition-colors"
                    title={article.featured ? 'Remove from featured' : 'Feature this article'}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        article.featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-gray-400'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// ALLOWLIST TAB
// ============================================================

const AllowlistTab = () => {
  const [artists, setArtists] = useState(MOCK_ALLOWLIST);
  const [newName, setNewName] = useState('');
  const [newGenres, setNewGenres] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;

    setArtists(prev => [
      ...prev,
      { name, genres: newGenres.trim() || 'Unspecified', verified: false }
    ]);
    setNewName('');
    setNewGenres('');
  };

  const handleRemove = (name) => {
    setArtists(prev => prev.filter(a => a.name !== name));
  };

  return (
    <div className="space-y-4">
      {/* Add Artist Form */}
      <div className="bg-green-900/10 border border-green-800/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Artist to Allowlist
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Artist name"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="text"
            value={newGenres}
            onChange={(e) => setNewGenres(e.target.value)}
            placeholder="Genres (e.g. Pop, Rock)"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:text-green-400/50 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Artist List */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Artist</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Genres</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium">Verified</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium w-20">Remove</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist, i) => (
              <tr key={`${artist.name}-${i}`} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-white">{artist.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{artist.genres}</td>
                <td className="px-4 py-3 text-center">
                  {artist.verified ? (
                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                  ) : (
                    <span className="text-xs text-yellow-500">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleRemove(artist.name)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove from allowlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600 text-center py-2">
        Artist list management API coming soon — changes shown here are local only
      </p>
    </div>
  );
};

// ============================================================
// BLOCKLIST TAB
// ============================================================

const BlocklistTab = () => {
  const [blocked, setBlocked] = useState(MOCK_BLOCKLIST);
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    const reason = newReason.trim();
    if (!name || !reason) return;

    setBlocked(prev => [...prev, { name, reason }]);
    setNewName('');
    setNewReason('');
  };

  const handleRemove = (name) => {
    setBlocked(prev => prev.filter(a => a.name !== name));
  };

  return (
    <div className="space-y-4">
      {/* Add to Blocklist Form */}
      <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
          <ShieldOff className="w-4 h-4" /> Add to Blocklist
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Artist name"
            className="w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Reason for blocking"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newReason.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/30 disabled:text-red-400/50 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Block
          </button>
        </div>
      </div>

      {/* Blocklist Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Artist</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Reason</th>
              <th className="text-center px-4 py-3 text-gray-400 font-medium w-20">Remove</th>
            </tr>
          </thead>
          <tbody>
            {blocked.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No blocked artists
                </td>
              </tr>
            ) : (
              blocked.map((artist, i) => (
                <tr key={`${artist.name}-${i}`} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldOff className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-white">{artist.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{artist.reason}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRemove(artist.name)}
                      className="p-1 text-gray-500 hover:text-green-400 transition-colors"
                      title="Remove from blocklist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600 text-center py-2">
        Artist list management API coming soon — changes shown here are local only
      </p>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ArticleManagementPanel = () => {
  const [activeTab, setActiveTab] = useState('articles');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Article & Artist Management</h1>
            <p className="text-sm text-gray-400">Manage news feed content and artist lists for Music Journalist</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? tab.id === 'blocklist'
                      ? 'bg-red-600 text-white'
                      : tab.id === 'allowlist'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'articles' && <ArticlesTab />}
        {activeTab === 'allowlist' && <AllowlistTab />}
        {activeTab === 'blocklist' && <BlocklistTab />}
      </div>
    </div>
  );
};

export default ArticleManagementPanel;
