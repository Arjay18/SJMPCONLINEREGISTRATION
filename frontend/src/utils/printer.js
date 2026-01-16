/**
 * ESC/POS Thermal Printer Utility
 * 
 * This utility provides functions to print coupons on Bluetooth thermal printers.
 * 
 * For Web Bluetooth API:
 * - Requires HTTPS or localhost
 * - Supported on Chrome, Edge, Opera (Android and Desktop)
 * - Not supported on iOS Safari
 * 
 * Alternative: Use a native mobile app wrapper (React Native, Cordova, Capacitor)
 * or a dedicated printing service/bridge app.
 */

// ESC/POS command bytes
const ESC = 0x1B;
const GS = 0x1D;

// ESC/POS commands
const commands = {
  INIT: [ESC, 0x40], // Initialize printer
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT_ON: [GS, 0x21, 0x11],
  DOUBLE_HEIGHT_OFF: [GS, 0x21, 0x00],
  LINE_FEED: [0x0A],
  CUT_PAPER: [GS, 0x56, 0x00], // Full cut
  PARTIAL_CUT: [GS, 0x56, 0x01],
};

// Convert string to bytes
function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

// Build print data
function buildPrintData(couponData) {
  const data = [];
  
  // Initialize printer
  data.push(...commands.INIT);
  
  // Header - SJMPC (centered, bold, double height)
  data.push(...commands.ALIGN_CENTER);
  data.push(...commands.BOLD_ON);
  data.push(...commands.DOUBLE_HEIGHT_ON);
  data.push(...stringToBytes(couponData.organization || 'ORGANIZATION NAME'));
  data.push(...commands.LINE_FEED);
  data.push(...commands.DOUBLE_HEIGHT_OFF);
  data.push(...commands.BOLD_OFF);
  data.push(...commands.LINE_FEED);
  
  // Divider
  data.push(...stringToBytes('================================'));
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  
  // Registration successful message (centered, bold)
  data.push(...commands.BOLD_ON);
  data.push(...stringToBytes('REGISTRATION SUCCESSFUL'));
  data.push(...commands.BOLD_OFF);
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  
  // Member details (left aligned)
  data.push(...commands.ALIGN_LEFT);
  
  data.push(...commands.BOLD_ON);
  data.push(...stringToBytes('Passbook Number:'));
  data.push(...commands.BOLD_OFF);
  data.push(...commands.LINE_FEED);
  data.push(...stringToBytes(`  ${couponData.passbook_no}`));
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  
  data.push(...commands.BOLD_ON);
  data.push(...stringToBytes('Name:'));
  data.push(...commands.BOLD_OFF);
  data.push(...commands.LINE_FEED);
  data.push(...stringToBytes(`  ${couponData.full_name}`));
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  
  data.push(...commands.BOLD_ON);
  data.push(...stringToBytes('Date & Time:'));
  data.push(...commands.BOLD_OFF);
  data.push(...commands.LINE_FEED);
  data.push(...stringToBytes(`  ${couponData.registration_date}`));
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  
  // Footer divider
  data.push(...commands.ALIGN_CENTER);
  data.push(...stringToBytes('================================'));
  data.push(...commands.LINE_FEED);
  data.push(...stringToBytes('Thank you!'));
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  data.push(...commands.LINE_FEED);
  
  // Cut paper
  data.push(...commands.CUT_PAPER);
  
  return new Uint8Array(data);
}

/**
 * Print coupon using Web Bluetooth API
 * @param {Object} couponData - Coupon data containing organization, passbook_no, full_name, registration_date
 * @returns {Promise<void>}
 */
export async function printCoupon(couponData) {
  try {
    // Check if Web Bluetooth is supported
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Opera on Android/Desktop.');
    }

    // Request Bluetooth device
    console.log('Requesting Bluetooth printer...');
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Common printer service
      ],
      optionalServices: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] // Another common service
    });

    console.log('Connecting to printer:', device.name);
    const server = await device.gatt.connect();

    // Get printer service
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    
    // Get characteristic for writing
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    // Build print data
    const printData = buildPrintData(couponData);

    // Send data to printer
    console.log('Sending print data...');
    await characteristic.writeValue(printData);

    console.log('Print successful!');
    
    // Disconnect
    device.gatt.disconnect();
    
  } catch (error) {
    console.error('Print error:', error);
    
    if (error.name === 'NotFoundError') {
      throw new Error('No printer found. Please make sure your Bluetooth printer is turned on and in pairing mode.');
    } else if (error.name === 'SecurityError') {
      throw new Error('Bluetooth access denied. Please enable Bluetooth and grant permissions.');
    } else {
      throw new Error(`Print failed: ${error.message}`);
    }
  }
}

/**
 * Alternative: Print using a text-based approach for debugging
 * This creates a text receipt that can be copied or used with other printing methods
 */
export function generateTextReceipt(couponData) {
  return `
================================
   ${couponData.organization || 'ORGANIZATION NAME'}
================================

  REGISTRATION SUCCESSFUL

Passbook Number:
  ${couponData.passbook_no}

Name:
  ${couponData.full_name}

Date & Time:
  ${couponData.registration_date}

================================
        Thank you!
================================
`;
}

/**
 * For Android apps using Cordova/Capacitor:
 * Use plugins like:
 * - cordova-plugin-bluetooth-serial
 * - capacitor-bluetooth-printer
 * 
 * Example integration:
 * 
 * import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial';
 * 
 * async function printViaCordova(couponData) {
 *   const printData = buildPrintData(couponData);
 *   await BluetoothSerial.write(printData);
 * }
 */

const printerUtils = {
  printCoupon,
  generateTextReceipt,
  buildPrintData
};

export default printerUtils;
