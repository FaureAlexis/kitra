'use client';

import React, { useState } from 'react';
import { Save, Share2, Download, X } from 'lucide-react';
import { useWalletData } from '../../../../../hooks/useWalletData';
import { useAITexture } from '../../../../../lib/services/ai-texture.service';
import { toast } from 'sonner';
import styles from '../../builder.module.css';

interface ActionsBarProps {
  currentTextureId?: string | null;
}

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (designName: string, designDescription: string) => void;
  isLoading: boolean;
}

const SaveDesignModal = React.memo<SaveDesignModalProps>(function SaveDesignModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading 
}) {
  const [designName, setDesignName] = useState('');
  const [designDescription, setDesignDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designName.trim()) {
      toast.error('Please enter a design name');
      return;
    }
    onSave(designName.trim(), designDescription.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setDesignName('');
      setDesignDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">Save Design to IPFS</h2>
          {!isLoading && (
            <button 
              onClick={handleClose}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-black/60" />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="designName" className="block text-sm font-medium text-black/80 mb-2">
              Design Name *
            </label>
            <input
              id="designName"
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className={`${styles.glassInput} w-full`}
              placeholder="Enter a name for your design"
              disabled={isLoading}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="designDescription" className="block text-sm font-medium text-black/80 mb-2">
              Description
            </label>
            <textarea
              id="designDescription"
              value={designDescription}
              onChange={(e) => setDesignDescription(e.target.value)}
              className={`${styles.glassTextarea} w-full h-24 resize-none`}
              placeholder="Describe your design (optional)"
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`${styles.actionButton} flex-1`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !designName.trim()}
              className={`${styles.actionButton} ${styles.primary} flex-1`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save size={16} />
                  Save to IPFS
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-4 p-3 bg-black/5 rounded-lg">
          <p className="text-xs text-black/60">
            Your design will be permanently stored on IPFS and can be shared with others.
          </p>
        </div>
      </div>
    </div>
  );
});

export const ActionsBar = React.memo<ActionsBarProps>(function ActionsBar({ 
  currentTextureId 
}) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const walletData = useWalletData();
  const { saveDesignToIPFS } = useAITexture();

  const handleSaveDesign = async (designName: string, designDescription: string) => {
    if (!currentTextureId) {
      toast.error('No texture to save. Please generate a design first.');
      return;
    }

    if (!walletData.isConnected) {
      toast.error('Please connect your wallet to save designs');
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await saveDesignToIPFS({
        textureId: currentTextureId,
        designName,
        designDescription,
        userAddress: walletData.address
      });

      if (result.success) {
        toast.success('Design saved to IPFS successfully!', {
          description: `IPFS Hash: ${result.ipfsHash?.slice(0, 12)}...`
        });
        setShowSaveModal(false);
        
        // TODO: Could trigger a callback to parent to update UI state
      } else {
        toast.error('Failed to save design', {
          description: result.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('Save design error:', error);
      toast.error('Failed to save design', {
        description: 'Please try again later'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    toast.info('Share functionality coming soon!');
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  return (
    <>
      <div className={`${styles.actionsBar} ${styles.glassPanel}`}>
        <button 
          className={`${styles.actionButton} ${styles.primary}`}
          onClick={() => setShowSaveModal(true)}
          disabled={!currentTextureId || isSaving}
        >
          <Save size={18} />
          Save Design
        </button>
        <button 
          className={styles.actionButton}
          onClick={handleShare}
        >
          <Share2 size={18} />
          Share
        </button>
        <button 
          className={styles.actionButton}
          onClick={handleExport}
        >
          <Download size={18} />
          Export
        </button>
      </div>

      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveDesign}
        isLoading={isSaving}
      />
    </>
  );
}); 