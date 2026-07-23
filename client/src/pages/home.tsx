import React, { useState, useEffect } from 'react';
import MapContainer from '@/components/MapContainer';
import BottomSheet from '@/components/BottomSheet';
import FireDetailModal from '@/components/FireDetailModal';
import NotificationPermissionModal from '@/components/NotificationPermissionModal';
import { useAppContext } from '@/contexts/AppContext';
import { isOffline } from '@/lib/api';
import { FireLocation } from '@/types';

const Home: React.FC = () => {
  const { fires } = useAppContext();
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false); // Start collapsed by default
  const [selectedFire, setSelectedFire] = useState<FireLocation | null>(null);
  const [showFireDetailModal, setShowFireDetailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(isOffline());

  useEffect(() => {
    // Check for notification permission on first load
    if (Notification && Notification.permission === 'default') {
      // Show notification permission modal after a short delay
      const timer = setTimeout(() => {
        setShowNotificationModal(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    // Set up online/offline event listeners
    const handleOffline = () => setIsOfflineMode(true);
    const handleOnline = () => setIsOfflineMode(false);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const toggleBottomSheet = () => {
    setIsBottomSheetExpanded(!isBottomSheetExpanded);
  };

  const showFireDetails = (fire: FireLocation) => {
    setSelectedFire(fire);
    setShowFireDetailModal(true);
  };

  const closeFireDetailModal = () => {
    setShowFireDetailModal(false);
    setSelectedFire(null);
  };

  const handleRequestNotifications = () => {
    if (Notification) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Handle subscribing to notifications
          console.log('Notifications permission granted');
        }
        setShowNotificationModal(false);
      });
    }
  };

  return (
    <div className="flex flex-col h-screen relative">
      <MapContainer 
        onFireSelect={showFireDetails}
      />
      
      <BottomSheet 
        isExpanded={isBottomSheetExpanded}
        toggleExpand={toggleBottomSheet}
        isOffline={isOfflineMode}
        onAlertMe={(fireId) => {
          setShowNotificationModal(true);
        }}
      />
      
      {showFireDetailModal && selectedFire && (
        <FireDetailModal 
          fire={selectedFire}
          onClose={closeFireDetailModal}
          onGetAlerts={() => setShowNotificationModal(true)}
        />
      )}
      
      {showNotificationModal && (
        <NotificationPermissionModal 
          onEnable={handleRequestNotifications}
          onDismiss={() => setShowNotificationModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
