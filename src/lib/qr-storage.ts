export interface StoredQRData {
  qrCode?: {
    imageData?: string;
  };
  submissionDetails?: {
    submissionId?: string;
    submissionTime?: string;
    status?: string;
    portInfo?: string;
    customsOffice?: string;
  };
  paymentStatus: 'completed';
  timestamp: number;
  expiresAt: number;
}

const QR_STORAGE_KEY = 'completed_qr_code';
const QR_EXPIRY_HOURS = 48; // 2 days

export function saveCompletedQR(qrData: {
  qrCode?: { imageData?: string };
  submissionDetails?: {
    submissionId?: string;
    submissionTime?: string;
    status?: string;
    portInfo?: string;
    customsOffice?: string;
  };
}): void {
  try {
    const now = Date.now();
    const expiresAt = now + (QR_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const storedData: StoredQRData = {
      ...qrData,
      paymentStatus: 'completed',
      timestamp: now,
      expiresAt
    };
    
    localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(storedData));
  } catch (error) {
    console.error('Failed to save QR code to storage:', error);
  }
}

export function getStoredQR(): StoredQRData | null {
  try {
    const stored = localStorage.getItem(QR_STORAGE_KEY);
    if (!stored) return null;
    
    const data: StoredQRData = JSON.parse(stored);
    
    // Check if QR code has expired
    if (Date.now() > data.expiresAt) {
      clearStoredQR();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to retrieve QR code from storage:', error);
    return null;
  }
}

export function clearStoredQR(): void {
  try {
    localStorage.removeItem(QR_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored QR code:', error);
  }
}

export function hasValidStoredQR(): boolean {
  return getStoredQR() !== null;
}

export function getQRExpiryDate(): Date | null {
  const stored = getStoredQR();
  return stored ? new Date(stored.expiresAt) : null;
}

export function getQRTimeRemaining(): string | null {
  const stored = getStoredQR();
  if (!stored) return null;
  
  const now = Date.now();
  const timeLeft = stored.expiresAt - now;
  
  if (timeLeft <= 0) return null;
  
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hoursLeft > 0) {
    return `${hoursLeft}h ${minutesLeft}m remaining`;
  } else {
    return `${minutesLeft}m remaining`;
  }
}