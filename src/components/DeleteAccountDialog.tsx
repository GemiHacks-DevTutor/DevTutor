'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteAccountDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteAccountDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';

  const handleConfirm = async () => {
    if (confirmationText === CONFIRMATION_TEXT) 
      await onConfirm();
    
  };

  const isConfirmDisabled = confirmationText !== CONFIRMATION_TEXT || isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              This action cannot be undone!
            </p>
            <p>
              This will permanently delete your account and remove all associated data including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Your profile and account information</li>
              <li>All your learning progress and courses</li>
              <li>Your questionnaire responses and preferences</li>
              <li>Any tools you&apos;ve created</li>
            </ul>
            <div className="pt-3">
              <p className="font-medium text-sm">
                To confirm, type <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">DELETE MY ACCOUNT</span> below:
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Type confirmation text here"
                disabled={isDeleting}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting Account...
              </>
            ) : (
              'Delete Account Permanently'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
