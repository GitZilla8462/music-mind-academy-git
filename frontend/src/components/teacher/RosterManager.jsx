// Roster Manager Component
// src/components/teacher/RosterManager.jsx
// Full-featured roster management with sorting, search, bulk actions, and privacy mode

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Printer,
  CreditCard,
  Users,
  X,
  Search,
  Eye,
  EyeOff,
  Download,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Shuffle,
  Check
} from 'lucide-react';
import {
  getClassRoster,
  addSeatToRoster,
  bulkAddSeats,
  removeSeat,
  resetSeatPin,
  updateSeat,
  getPrintableRoster,
  generateMissingUsernames,
  regenerateUsername
} from '../../firebase/enrollments';
import PrintableLoginCards from './PrintableLoginCards';

const RosterManager = ({ classId, className, onClose }) => {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSeats, setAddingSeats] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [showPrintableCards, setShowPrintableCards] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [importingNames, setImportingNames] = useState(false);
  const [generatingUsernames, setGeneratingUsernames] = useState(false);

  // New feature states
  const [searchQuery, setSearchQuery] = useState('');
  const [showPins, setShowPins] = useState(true);
  const [sortBy, setSortBy] = useState('seat-asc'); // 'name-asc', 'name-desc', 'seat-asc', 'seat-desc', 'username-asc', 'username-desc'
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [copiedRoster, setCopiedRoster] = useState(false);
  const [regeneratingUsername, setRegeneratingUsername] = useState(null);

  // Fetch roster
  const fetchRoster = async () => {
    try {
      const data = await getClassRoster(classId);
      setRoster(data);
    } catch (error) {
      console.error('Error fetching roster:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [classId]);

  // Filter and sort roster
  const filteredAndSortedRoster = useMemo(() => {
    let result = [...roster];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(seat =>
        (seat.displayName || '').toLowerCase().includes(query) ||
        (seat.username || '').toLowerCase().includes(query) ||
        String(seat.seatNumber).includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      const nameA = (a.displayName || '').toLowerCase();
      const nameB = (b.displayName || '').toLowerCase();
      const usernameA = (a.username || '').toLowerCase();
      const usernameB = (b.username || '').toLowerCase();

      switch (sortBy) {
        case 'name-asc': return nameA.localeCompare(nameB);
        case 'name-desc': return nameB.localeCompare(nameA);
        case 'seat-asc': return a.seatNumber - b.seatNumber;
        case 'seat-desc': return b.seatNumber - a.seatNumber;
        case 'username-asc': return usernameA.localeCompare(usernameB);
        case 'username-desc': return usernameB.localeCompare(usernameA);
        default: return a.seatNumber - b.seatNumber;
      }
    });

    return result;
  }, [roster, searchQuery, sortBy]);

  // Check if any seats are missing usernames
  const hasMissingUsernames = roster.some(s => !s.username);

  // Selection helpers
  const allSelected = filteredAndSortedRoster.length > 0 &&
    filteredAndSortedRoster.every(s => selectedSeats.has(s.seatNumber));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSeats(new Set());
    } else {
      setSelectedSeats(new Set(filteredAndSortedRoster.map(s => s.seatNumber)));
    }
  };

  const toggleSelect = (seatNumber) => {
    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatNumber)) {
      newSelected.delete(seatNumber);
    } else {
      newSelected.add(seatNumber);
    }
    setSelectedSeats(newSelected);
  };

  // Add a single seat
  const handleAddSeat = async () => {
    const nextSeatNumber = roster.length > 0
      ? Math.max(...roster.map(s => s.seatNumber)) + 1
      : 1;

    try {
      await addSeatToRoster(classId, { seatNumber: nextSeatNumber });
      fetchRoster();
    } catch (error) {
      console.error('Error adding seat:', error);
      alert(error.message);
    }
  };

  // Bulk add seats
  const handleBulkAdd = async () => {
    if (bulkCount < 1) return;

    setAddingSeats(true);
    try {
      await bulkAddSeats(classId, bulkCount);
      fetchRoster();
    } catch (error) {
      console.error('Error bulk adding seats:', error);
    } finally {
      setAddingSeats(false);
    }
  };

  // Bulk import names
  const handleBulkImportNames = async () => {
    const names = bulkNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) {
      alert('Please enter at least one name');
      return;
    }

    setImportingNames(true);
    try {
      const currentSeatCount = roster.length;
      const seatsNeeded = names.length - currentSeatCount;

      if (seatsNeeded > 0) {
        await bulkAddSeats(classId, seatsNeeded);
        await fetchRoster();
      }

      const updatedRoster = await getClassRoster(classId);

      for (let i = 0; i < names.length; i++) {
        const seat = updatedRoster[i];
        if (seat) {
          await updateSeat(classId, seat.seatNumber, { displayName: names[i] });
        }
      }

      await fetchRoster();
      setShowBulkImport(false);
      setBulkNames('');
      alert(`Successfully imported ${names.length} student name${names.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error importing names:', error);
      alert('Error importing names. Please try again.');
    } finally {
      setImportingNames(false);
    }
  };

  // Generate usernames for seats that don't have them
  const handleGenerateUsernames = async () => {
    const seatsWithoutUsernames = roster.filter(s => !s.username);
    if (seatsWithoutUsernames.length === 0) {
      alert('All seats already have usernames!');
      return;
    }

    setGeneratingUsernames(true);
    try {
      const count = await generateMissingUsernames(classId);
      await fetchRoster();
      alert(`Generated usernames for ${count} seat${count !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error generating usernames:', error);
      alert('Error generating usernames. Please try again.');
    } finally {
      setGeneratingUsernames(false);
    }
  };

  // Regenerate single username
  const handleRegenerateUsername = async (seatNumber) => {
    setRegeneratingUsername(seatNumber);
    try {
      const newUsername = await regenerateUsername(classId, seatNumber);
      await fetchRoster();
      alert(`New username: ${newUsername}`);
    } catch (error) {
      console.error('Error regenerating username:', error);
      alert('Error regenerating username. Please try again.');
    } finally {
      setRegeneratingUsername(null);
    }
  };

  // Remove a seat
  const handleRemoveSeat = async (seatNumber) => {
    if (!confirm(`Remove Seat ${seatNumber}? This will also remove any associated student data.`)) {
      return;
    }

    try {
      await removeSeat(classId, seatNumber);
      selectedSeats.delete(seatNumber);
      setSelectedSeats(new Set(selectedSeats));
      fetchRoster();
    } catch (error) {
      console.error('Error removing seat:', error);
    }
  };

  // Bulk remove selected seats
  const handleBulkRemove = async () => {
    if (selectedSeats.size === 0) return;

    if (!confirm(`Remove ${selectedSeats.size} selected student${selectedSeats.size > 1 ? 's' : ''}? This cannot be undone.`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      for (const seatNumber of selectedSeats) {
        await removeSeat(classId, seatNumber);
      }
      setSelectedSeats(new Set());
      await fetchRoster();
    } catch (error) {
      console.error('Error bulk removing seats:', error);
      alert('Error removing some seats. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Reset PIN
  const handleResetPin = async (seatNumber) => {
    try {
      const newPin = await resetSeatPin(classId, seatNumber);
      fetchRoster();
      alert(`New PIN for Seat ${seatNumber}: ${newPin}`);
    } catch (error) {
      console.error('Error resetting PIN:', error);
    }
  };

  // Bulk reset PINs
  const handleBulkResetPins = async () => {
    if (selectedSeats.size === 0) return;

    if (!confirm(`Reset PINs for ${selectedSeats.size} selected student${selectedSeats.size > 1 ? 's' : ''}?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const newPins = [];
      for (const seatNumber of selectedSeats) {
        const newPin = await resetSeatPin(classId, seatNumber);
        newPins.push({ seatNumber, pin: newPin });
      }
      await fetchRoster();
      alert(`Reset ${newPins.length} PIN${newPins.length > 1 ? 's' : ''}. Print new login cards to distribute.`);
    } catch (error) {
      console.error('Error bulk resetting PINs:', error);
      alert('Error resetting some PINs. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Update display name
  const handleUpdateName = async (seatNumber, newName) => {
    try {
      await updateSeat(classId, seatNumber, { displayName: newName });
      // Don't refetch - update locally for better UX
      setRoster(prev => prev.map(s =>
        s.seatNumber === seatNumber ? { ...s, displayName: newName } : s
      ));
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  // Copy roster to clipboard
  const handleCopyRoster = async () => {
    const printable = await getPrintableRoster(classId);
    const text = `Class: ${className}\n\nName\tUsername\tPIN\n` +
      printable.map(s => `${s.displayName}\t${s.username}\t${s.pin}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedRoster(true);
    setTimeout(() => setCopiedRoster(false), 2000);
  };

  // Export to CSV
  const handleExportCSV = async () => {
    const printable = await getPrintableRoster(classId);

    const csvContent = [
      ['Name', 'Username', 'PIN', 'Seat Number'].join(','),
      ...printable.map(s => [
        `"${(s.displayName || '').replace(/"/g, '""')}"`,
        s.username,
        s.pin,
        s.seatNumber
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${className.replace(/[^a-z0-9]/gi, '_')}_roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sort header click handler
  const handleSort = (column) => {
    if (sortBy === `${column}-asc`) {
      setSortBy(`${column}-desc`);
    } else {
      setSortBy(`${column}-asc`);
    }
  };

  // Get sort icon for a column
  const getSortIcon = (column) => {
    if (sortBy === `${column}-asc`) return <ArrowUp size={12} />;
    if (sortBy === `${column}-desc`) return <ArrowDown size={12} />;
    return <ArrowUpDown size={12} className="text-gray-300" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{className}</h2>
              <p className="text-sm text-gray-500">
                {roster.length} student{roster.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyRoster}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Copy roster"
              >
                {copiedRoster ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
              </button>
              <button
                onClick={handleExportCSV}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Export to CSV"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setShowPrintableCards(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                title="Print login cards"
              >
                <CreditCard size={18} />
                Print Cards
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
            {/* Search and Privacy Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={() => setShowPins(!showPins)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showPins
                    ? 'text-gray-600 hover:bg-gray-200 bg-gray-100'
                    : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                }`}
                title={showPins ? 'Hide PINs (projector mode)' : 'Show PINs'}
              >
                {showPins ? <Eye size={16} /> : <EyeOff size={16} />}
                {showPins ? 'PINs Visible' : 'PINs Hidden'}
              </button>
            </div>

            {/* Add Seats Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleAddSeat}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Plus size={16} />
                Add Seat
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Bulk add:</span>
                <input
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.max(1, Math.min(40, parseInt(e.target.value) || 1)))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm"
                  min={1}
                  max={40}
                />
                <button
                  onClick={handleBulkAdd}
                  disabled={addingSeats}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium disabled:opacity-50"
                >
                  {addingSeats ? 'Adding...' : 'Add'}
                </button>
              </div>

              <div className="border-l border-gray-300 pl-4">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <Users size={16} />
                  Import Names
                </button>
              </div>
            </div>

            {/* Bulk Actions (when items selected) */}
            {selectedSeats.size > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">
                  {selectedSeats.size} selected
                </span>
                <div className="flex-1" />
                <button
                  onClick={handleBulkResetPins}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  Reset PINs
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
                <button
                  onClick={() => setSelectedSeats(new Set())}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Missing Usernames Banner */}
          {!loading && hasMissingUsernames && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="text-sm text-amber-800">
                <strong>Note:</strong> Some seats don't have usernames yet. Generate them so students can log in.
              </div>
              <button
                onClick={handleGenerateUsernames}
                disabled={generatingUsernames}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium disabled:opacity-50"
              >
                {generatingUsernames ? 'Generating...' : 'Generate Usernames'}
              </button>
            </div>
          )}

          {/* Roster List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : roster.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students yet. Add seats to get started.
              </div>
            ) : filteredAndSortedRoster.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students match "{searchQuery}"
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <button
                        onClick={toggleSelectAll}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('name')}
                    >
                      <span className="flex items-center gap-1">
                        Name {getSortIcon('name')}
                      </span>
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('username')}
                    >
                      <span className="flex items-center gap-1">
                        Username {getSortIcon('username')}
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      PIN
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none w-20"
                      onClick={() => handleSort('seat')}
                    >
                      <span className="flex items-center gap-1">
                        Seat {getSortIcon('seat')}
                      </span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedRoster.map((seat) => (
                    <tr
                      key={seat.seatNumber}
                      className={`hover:bg-gray-50 ${selectedSeats.has(seat.seatNumber) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(seat.seatNumber)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {selectedSeats.has(seat.seatNumber) ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={seat.displayName}
                          onChange={(e) => handleUpdateName(seat.seatNumber, e.target.value)}
                          className="w-full px-2 py-1 text-sm font-medium border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-transparent"
                          placeholder="Student name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-blue-600">
                            {seat.username || '—'}
                          </span>
                          {seat.username && (
                            <button
                              onClick={() => handleRegenerateUsername(seat.seatNumber)}
                              disabled={regeneratingUsername === seat.seatNumber}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Generate new username"
                            >
                              <Shuffle size={14} className={regeneratingUsername === seat.seatNumber ? 'animate-spin' : ''} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-sm font-bold ${showPins ? 'text-gray-900' : 'text-gray-300'}`}>
                          {showPins ? seat.pin : '••••'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        #{seat.seatNumber}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleResetPin(seat.seatNumber)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Reset PIN"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveSeat(seat.seatNumber)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Remove seat"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Students log in with their username + PIN.
              Click on a name to edit it. Use "Print Cards" to give students their login info.
            </p>
          </div>
        </div>
      </div>

      {/* Printable Login Cards Modal */}
      {showPrintableCards && roster.length > 0 && (
        <PrintableLoginCards
          roster={roster}
          className={className}
          onClose={() => setShowPrintableCards(false)}
        />
      )}

      {/* Bulk Import Names Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowBulkImport(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Import Student Names</h3>
              <button
                onClick={() => setShowBulkImport(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                Paste a list of student names (one per line). Names will be assigned to seats in order starting from Seat 1.
                New seats will be created if needed.
              </p>
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder="John Smith&#10;Jane Doe&#10;Alex Johnson&#10;..."
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                {bulkNames.split('\n').filter(n => n.trim()).length} name{bulkNames.split('\n').filter(n => n.trim()).length !== 1 ? 's' : ''} detected
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowBulkImport(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImportNames}
                disabled={importingNames || !bulkNames.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
              >
                {importingNames ? 'Importing...' : 'Import Names'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterManager;
