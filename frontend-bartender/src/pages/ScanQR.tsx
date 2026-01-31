// Scan QR Page - Mobile-First, One-Handed, Full-Screen Camera
// Bartender can scan QR code with camera

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { SignOutButton } from '../components/SignOutButton';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanQR() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      cleanupScanner();
    };
  }, []);

  const cleanupScanner = async () => {
    try {
      if (scannerRef.current && isInitializedRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      }
    } catch (err) {
      console.debug('Scanner cleanup error (safe to ignore):', err);
    } finally {
      scannerRef.current = null;
      isInitializedRef.current = false;
      setScanning(false);
    }
  };

  const handleScan = async (qrData: string) => {
    try {
      setError(null);

      // Stop the scanner first
      await stopScanning();

      const scanResult = await apiService.scanRedemptionQR(qrData);
      setResult({
        success: true,
        message: `Peg served: ${scanResult.redemption.peg_size_ml}ml`
      });

      // Clear result after 3 seconds and resume scanning
      setTimeout(() => {
        setResult(null);
        startScanning();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error processing QR'
      });

      setTimeout(() => {
        setResult(null);
        setError(null);
        startScanning();
      }, 3000);
    }
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setError(null);
      setResult(null);

      // Clean up any existing scanner first
      await cleanupScanner();

      // Create new scanner instance
      scannerRef.current = new Html5Qrcode("reader");
      isInitializedRef.current = true;

      await scannerRef.current.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScan,
        (errorMessage) => {
          // Ignore scanning errors (they happen frequently)
          console.debug('QR scan error:', errorMessage);
        }
      );
    } catch (err) {
      setError('Failed to start camera. Please allow camera access.');
      await cleanupScanner();
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isInitializedRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await scannerRef.current.stop();
        }
      }
      setScanning(false);
    } catch (err) {
      console.debug('Error stopping scanner (safe to ignore):', err);
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center gap-2">
          <h1 className="text-xl font-bold">Scan QR Code</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/pending-payments')}
              className="px-4 py-2 text-gray-600 min-h-[44px]"
            >
              Back
            </button>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        {/* Camera view - full screen on mobile */}
        <div
          id="reader"
          className="w-full h-full"
        >
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center text-white p-4">
                <p className="mb-4">Ready to scan QR codes</p>
                <button
                  onClick={startScanning}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold min-h-[44px]"
                >
                  Start Camera
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result overlay */}
        {result && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 ${result.success ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
            <p className="text-center font-semibold">{result.message}</p>
          </div>
        )}

        {/* Error overlay */}
        {error && !result && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-600 text-white">
            <p className="text-center">{error}</p>
          </div>
        )}

        {/* Stop button - thumb-reachable at bottom */}
        {scanning && (
          <button
            onClick={stopScanning}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-red-600 text-white rounded-lg font-semibold min-h-[44px] min-w-[120px]"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
