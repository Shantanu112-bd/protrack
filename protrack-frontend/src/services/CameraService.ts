import { BrowserQRCodeReader } from "@zxing/browser";

export class CameraService {
  private codeReader: BrowserQRCodeReader;
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.codeReader = new BrowserQRCodeReader();
  }

  /**
   * Initialize camera access
   * @param videoElement The video element to display the camera feed
   * @returns Promise that resolves when camera is ready
   */
  async initializeCamera(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.videoElement = videoElement;

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Attach stream to video element
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw new Error(
        "Failed to access camera. Please ensure you have granted camera permissions."
      );
    }
  }

  /**
   * Stop camera and clean up resources
   */
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Scan for QR codes or barcodes in the camera feed
   * @param callback Function to call when a code is detected
   * @returns Promise that resolves with the decoded text
   */
  async scanForCode(callback?: (result: string) => void): Promise<string> {
    if (!this.videoElement) {
      throw new Error("Camera not initialized");
    }

    try {
      // Decode from video device
      const result = await this.codeReader.decodeFromVideoDevice(
        undefined,
        this.videoElement,
        (result, err) => {
          if (result) {
            // Stop scanning when result is found
            this.codeReader.reset();
            if (callback) {
              callback(result.getText());
            }
          }

          if (err && !(err instanceof Error)) {
            console.error("Scan error:", err);
          }
        }
      );

      return result.getText();
    } catch (error) {
      console.error("Error scanning for code:", error);
      throw new Error("Failed to scan code. Please try again.");
    }
  }

  /**
   * Take a photo from the current camera feed
   * @returns Promise that resolves with the image data URL
   */
  async takePhoto(): Promise<string> {
    if (!this.videoElement) {
      throw new Error("Camera not initialized");
    }

    // Create canvas to capture frame
    const canvas = document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to get canvas context");
    }

    // Draw current video frame to canvas
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

    // Return as data URL
    return canvas.toDataURL("image/jpeg");
  }

  /**
   * Check if camera access is supported
   * @returns Boolean indicating if camera access is supported
   */
  isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

// Singleton instance
export const cameraService = new CameraService();
