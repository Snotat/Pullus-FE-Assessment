'use client';

import { useEffect, useRef } from 'react';
import { useNetworkState } from 'react-use';
import { toast, ToastContainer } from 'react-toastify';
import { Wifi, WifiOff } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function NetworkChecker() {
  const network = useNetworkState();
  const lastStatus = useRef<boolean | undefined>(network.online);

  useEffect(() => {
   if (lastStatus.current !== network.online) {
      if (network.online) {
        toast.success("Back Online! Syncing changes...", {
          icon: <Wifi size={18} />,
          toastId: 'online-toast'
        });
      } else {
        toast.error("Offline. Work is being saved locally.", {
          icon: <WifiOff size={18} />,
          autoClose: false,
          toastId: 'offline-toast'
        });
      }
      lastStatus.current = network.online;
    }

    if (network.online) {
      toast.dismiss('offline-toast');
    }
  }, [network.online]);

  return (
    <ToastContainer 
      position="bottom-right"
      theme="dark"
      limit={3}
      stacked
    />
  );
}