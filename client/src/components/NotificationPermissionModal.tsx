import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface NotificationPermissionModalProps {
  onEnable: () => void;
  onDismiss: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ 
  onEnable, 
  onDismiss 
}) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={true} onOpenChange={onDismiss}>
      <DialogContent className="bg-app-dark-lighter p-6 border-0 rounded-xl w-full max-w-md mx-auto">
        <DialogTitle className="sr-only">{t('notifications.title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('notifications.description')}</DialogDescription>
        <div className="flex items-center justify-center mb-5">
          <div className="w-16 h-16 bg-[hsl(var(--fire-orange))] bg-opacity-10 rounded-full flex items-center justify-center">
            <i className="ri-notification-3-line text-[hsl(var(--fire-orange))] text-3xl"></i>
          </div>
        </div>
        
        <h2 className="text-xl font-bold font-rubik text-center mb-2">{t('notifications.title')}</h2>
        <p className="text-gray-300 text-center mb-5">{t('notifications.description')}</p>
        
        <div className="space-y-3 mb-5">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-app-dark rounded-full flex items-center justify-center mr-3">
              <i className="ri-alert-line text-[hsl(var(--amber-warning))]"></i>
            </div>
            <div className="text-sm">{t('notifications.features.realtime')}</div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-app-dark rounded-full flex items-center justify-center mr-3">
              <i className="ri-map-pin-line text-[hsl(var(--amber-warning))]"></i>
            </div>
            <div className="text-sm">{t('notifications.features.location')}</div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-app-dark rounded-full flex items-center justify-center mr-3">
              <i className="ri-compass-3-line text-[hsl(var(--amber-warning))]"></i>
            </div>
            <div className="text-sm">{t('notifications.features.evacuation')}</div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-[hsl(var(--fire-orange))] hover:bg-orange-600 text-white py-3 rounded-lg font-medium mb-3"
          onClick={onEnable}
        >
          {t('notifications.enable')}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full bg-transparent hover:bg-gray-800 text-gray-400 py-3 rounded-lg font-medium"
          onClick={onDismiss}
        >
          {t('notifications.later')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionModal;
