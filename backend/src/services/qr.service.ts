// QR Code generation service
// qrcode and uuid packages are installed

import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export interface QRCodeData {
  data: string; // The data to encode in QR
  imageDataUrl?: string; // Base64 image data (if generating image)
}

export class QRService {
  /**
   * Generate QR code for payment
   * Contains purchase ID and a unique token
   */
  async generatePaymentQR(purchaseId: string): Promise<QRCodeData> {
    const token = uuidv4();
    const data = JSON.stringify({
      type: 'payment',
      purchaseId,
      token,
      timestamp: new Date().toISOString()
    });

    // Generate QR code image
    const imageDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2
    });

    return {
      data,
      imageDataUrl
    };
  }

  /**
   * Generate QR code for redemption
   * Contains redemption token
   */
  async generateRedemptionQR(redemptionToken: string): Promise<QRCodeData> {
    const data = JSON.stringify({
      type: 'redemption',
      token: redemptionToken,
      timestamp: new Date().toISOString()
    });

    // Generate QR code image
    const imageDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2
    });

    return {
      data,
      imageDataUrl
    };
  }

  /**
   * Parse QR code data
   */
  parseQRData(qrData: string): { type: string; [key: string]: any } | null {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      return null;
    }
  }
}
