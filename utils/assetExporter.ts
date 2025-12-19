
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import { captureRef } from 'react-native-view-shot';

export interface AssetExportOptions {
  appIconRef?: any;
  featureGraphicRef?: any;
  phoneScreenshot1Ref?: any;
  phoneScreenshot2Ref?: any;
  phoneScreenshot3Ref?: any;
  tabletScreenshotRef?: any;
}

export async function exportAllAssets(options: AssetExportOptions): Promise<void> {
  try {
    const zip = new JSZip();
    const assetsFolder = zip.folder('vroomie-playstore-assets');

    if (!assetsFolder) {
      throw new Error('Failed to create assets folder');
    }

    // Capture and add app icon
    if (options.appIconRef) {
      console.log('Capturing app icon...');
      const appIconUri = await captureRef(options.appIconRef, {
        format: 'png',
        quality: 1,
        width: 512,
        height: 512,
      });
      const appIconBase64 = await FileSystem.readAsStringAsync(appIconUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      assetsFolder.file('app-icon-512x512.png', appIconBase64, { base64: true });
      console.log('App icon captured');
    }

    // Capture and add feature graphic
    if (options.featureGraphicRef) {
      console.log('Capturing feature graphic...');
      const featureGraphicUri = await captureRef(options.featureGraphicRef, {
        format: 'png',
        quality: 1,
        width: 1024,
        height: 500,
      });
      const featureGraphicBase64 = await FileSystem.readAsStringAsync(featureGraphicUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      assetsFolder.file('feature-graphic-1024x500.png', featureGraphicBase64, { base64: true });
      console.log('Feature graphic captured');
    }

    // Capture and add phone screenshots
    if (options.phoneScreenshot1Ref) {
      console.log('Capturing phone screenshot 1...');
      const phone1Uri = await captureRef(options.phoneScreenshot1Ref, {
        format: 'png',
        quality: 1,
        width: 1080,
        height: 1920,
      });
      const phone1Base64 = await FileSystem.readAsStringAsync(phone1Uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      assetsFolder.file('phone-screenshot-1-1080x1920.png', phone1Base64, { base64: true });
      console.log('Phone screenshot 1 captured');
    }

    if (options.phoneScreenshot2Ref) {
      console.log('Capturing phone screenshot 2...');
      const phone2Uri = await captureRef(options.phoneScreenshot2Ref, {
        format: 'png',
        quality: 1,
        width: 1080,
        height: 1920,
      });
      const phone2Base64 = await FileSystem.readAsStringAsync(phone2Uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      assetsFolder.file('phone-screenshot-2-1080x1920.png', phone2Base64, { base64: true });
      console.log('Phone screenshot 2 captured');
    }

    if (options.phoneScreenshot3Ref) {
      console.log('Capturing phone screenshot 3...');
      const phone3Uri = await captureRef(options.phoneScreenshot3Ref, {
        format: 'png',
        quality: 1,
        width: 1080,
        height: 1920,
      });
      const phone3Base64 = await FileSystem.readAsStringAsync(phone3Uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      assetsFolder.file('phone-screenshot-3-1080x1920.png', phone3Base64, { base64: true });
      console.log('Phone screenshot 3 captured');
    }

    // Capture and add tablet screenshot
    if (options.tabletScreenshotRef) {
      console.log('Capturing tablet screenshot...');
      const tabletUri = await captureRef(options.tabletScreenshotRef, {
        format: 'png',
        quality: 1,
        width: 1200,
        height: 1920,
      });
      const tabletBase64 = await FileSystem.readAsStringAsync(tabletUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      assetsFolder.file('tablet-screenshot-1200x1920.png', tabletBase64, { base64: true });
      console.log('Tablet screenshot captured');
    }

    // Add README file with instructions
    const readmeContent = `Vroomie Health Checkup - Google Play Store Assets
================================================

This package contains all the required assets for the Google Play Store listing.

Contents:
---------
1. app-icon-512x512.png - App icon (512 x 512 px)
2. feature-graphic-1024x500.png - Feature graphic (1024 x 500 px)
3. phone-screenshot-1-1080x1920.png - Phone screenshot 1 (1080 x 1920 px)
4. phone-screenshot-2-1080x1920.png - Phone screenshot 2 (1080 x 1920 px)
5. phone-screenshot-3-1080x1920.png - Phone screenshot 3 (1080 x 1920 px)
6. tablet-screenshot-1200x1920.png - Tablet screenshot (1200 x 1920 px)

Upload Instructions:
-------------------
1. Go to Google Play Console
2. Navigate to your app's Store Presence > Main store listing
3. Upload the app icon in the "App icon" section
4. Upload the feature graphic in the "Feature graphic" section
5. Upload phone screenshots in the "Phone screenshots" section
6. Upload tablet screenshot in the "Tablet screenshots" section

All assets are sized according to Google Play Store requirements.

Generated: ${new Date().toLocaleString()}
`;
    assetsFolder.file('README.txt', readmeContent);

    // Generate zip file
    console.log('Generating zip file...');
    const zipContent = await zip.generateAsync({ type: 'base64' });

    // Save zip file
    const fileUri = `${FileSystem.cacheDirectory}vroomie-playstore-assets.zip`;
    await FileSystem.writeAsStringAsync(fileUri, zipContent, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Zip file created:', fileUri);

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/zip',
        dialogTitle: 'Save Play Store Assets',
        UTI: 'public.zip-archive',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }

    console.log('Assets exported successfully');
  } catch (error) {
    console.error('Error exporting assets:', error);
    throw error;
  }
}
