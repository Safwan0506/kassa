import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './ui/Button';
import './BarcodeScanner.css';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScanning(true);
        }
      } catch {
        setError('Impossible d\'acceder a la camera. Verifiez les permissions.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    if (!('BarcodeDetector' in window)) {
      setError('Le scan de code-barres n\'est pas supporte par ce navigateur. Utilisez Chrome sur mobile.');
      return;
    }

    const detector = new (window as any).BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'],
    });

    let animId: number;

    async function detect() {
      if (scannedRef.current || !videoRef.current) return;
      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0 && !scannedRef.current) {
          scannedRef.current = true;
          stopCamera();
          onScan(barcodes[0].rawValue);
          return;
        }
      } catch {
        // detection frame error — continue
      }
      animId = requestAnimationFrame(detect);
    }

    animId = requestAnimationFrame(detect);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [scanning, onScan, stopCamera]);

  const handleManualInput = () => {
    const code = prompt('Entrez le code-barres manuellement :');
    if (code && code.trim()) {
      scannedRef.current = true;
      stopCamera();
      onScan(code.trim());
    }
  };

  return (
    <div className="barcode-scanner">
      <div className="barcode-scanner__overlay">
        <div className="barcode-scanner__header">
          <span className="barcode-scanner__title">
            <Camera size={18} /> Scanner un code-barres
          </span>
          <button className="barcode-scanner__close" onClick={() => { stopCamera(); onClose(); }}>
            <X size={20} />
          </button>
        </div>

        <div className="barcode-scanner__viewport">
          {error ? (
            <div className="barcode-scanner__error">
              <p>{error}</p>
              <Button variant="secondary" onClick={handleManualInput}>
                Saisie manuelle
              </Button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="barcode-scanner__video" playsInline muted />
              <div className="barcode-scanner__target" />
            </>
          )}
        </div>

        <div className="barcode-scanner__footer">
          <Button variant="secondary" size="sm" onClick={handleManualInput}>
            Saisie manuelle
          </Button>
        </div>
      </div>
    </div>
  );
}
