// Portfolio Share Button
// src/components/student/PortfolioShareButton.jsx
// Generates share link + QR code for the student's portfolio

import React, { useState } from 'react';
import { Share2, Link, Check, X, QrCode, Eye, EyeOff } from 'lucide-react';
import { createShareToken, setPortfolioPublic } from '../../firebase/portfolios';

const PortfolioShareButton = ({ studentUid, portfolio, onPortfolioUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const shareUrl = portfolio?.shareToken
    ? `${window.location.origin}/portfolio/${portfolio.shareToken}`
    : null;

  const handleShare = async () => {
    if (portfolio?.shareToken) {
      setShowModal(true);
      generateQR(portfolio.shareToken);
      return;
    }

    setSharing(true);
    try {
      const token = await createShareToken(studentUid);
      onPortfolioUpdate({ shareToken: token, isPublic: true });
      setShowModal(true);
      generateQR(token);
    } catch (err) {
      console.error('Error creating share token:', err);
    } finally {
      setSharing(false);
    }
  };

  const generateQR = async (token) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const url = `${window.location.origin}/portfolio/${token}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' }
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for Chromebooks
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTogglePublic = async () => {
    const newState = !portfolio?.isPublic;
    try {
      await setPortfolioPublic(studentUid, newState);
      onPortfolioUpdate({ isPublic: newState });
    } catch (err) {
      console.error('Error toggling public:', err);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        <Share2 size={16} />
        {sharing ? 'Creating link...' : 'Share'}
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Share Portfolio</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Public toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {portfolio?.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span>{portfolio?.isPublic ? 'Portfolio is public' : 'Portfolio is private'}</span>
                </div>
                <button
                  onClick={handleTogglePublic}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    portfolio?.isPublic ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    portfolio?.isPublic ? 'left-5' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Share URL */}
              {shareUrl && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate font-mono">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${
                      copied
                        ? 'bg-green-50 text-green-600'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                    title="Copy link"
                  >
                    {copied ? <Check size={18} /> : <Link size={18} />}
                  </button>
                </div>
              )}

              {/* QR Code */}
              {qrDataUrl && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Scan to view portfolio</p>
                  <img
                    src={qrDataUrl}
                    alt="Portfolio QR Code"
                    className="w-40 h-40 mx-auto border border-gray-200 rounded-lg"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    Print this for concert night or open house
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioShareButton;
