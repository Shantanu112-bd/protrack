export class FileDownloadService {
  /**
   * Download data as a file
   * @param data The data to download (string, Blob, or JSON)
   * @param filename The name of the file to download
   * @param type The MIME type of the file (default: 'application/json')
   */
  downloadFile(
    data: string | Blob | object,
    filename: string,
    type: string = "application/json"
  ): void {
    let blob: Blob;

    if (data instanceof Blob) {
      blob = data;
    } else if (typeof data === "string") {
      blob = new Blob([data], { type });
    } else {
      // Assume it's a JSON object
      const json = JSON.stringify(data, null, 2);
      blob = new Blob([json], { type: "application/json" });
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download a CSV file from array data
   * @param data Array of objects to convert to CSV
   * @param filename Name of the CSV file
   * @param headers Optional custom headers for the CSV
   */
  downloadCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    headers?: string[]
  ): void {
    if (!data || data.length === 0) {
      throw new Error("No data provided for CSV export");
    }

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(","),
      ...data.map((row) =>
        csvHeaders
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in values
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Download as CSV file
    this.downloadFile(csvContent, filename, "text/csv");
  }

  /**
   * Download a PDF file
   * @param content PDF content as ArrayBuffer or Blob
   * @param filename Name of the PDF file
   */
  downloadPDF(content: ArrayBuffer | Blob, filename: string): void {
    const blob =
      content instanceof Blob
        ? content
        : new Blob([content], { type: "application/pdf" });
    this.downloadFile(blob, filename, "application/pdf");
  }

  /**
   * Download an image file
   * @param imageUrl URL of the image to download
   * @param filename Name of the image file
   * @param type MIME type of the image (default: 'image/png')
   */
  async downloadImage(
    imageUrl: string,
    filename: string,
    type: string = "image/png"
  ): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      this.downloadFile(blob, filename, type);
    } catch (error) {
      console.error("Error downloading image:", error);
      throw new Error("Failed to download image");
    }
  }

  /**
   * Generate and download a report
   * @param reportData Data for the report
   * @param reportType Type of report ('json', 'csv', 'xml')
   * @param filename Base name for the file
   */
  downloadReport<T extends Record<string, unknown>>(
    reportData: T | T[],
    reportType: string,
    filename: string
  ): void {
    switch (reportType.toLowerCase()) {
      case "json":
        this.downloadFile(reportData, `${filename}.json`, "application/json");
        break;
      case "csv":
        if (Array.isArray(reportData)) {
          this.downloadCSV(reportData, `${filename}.csv`);
        } else {
          throw new Error("CSV export requires array data");
        }
        break;
      case "xml": {
        const xmlContent = this.objectToXML(reportData);
        this.downloadFile(xmlContent, `${filename}.xml`, "application/xml");
        break;
      }
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  /**
   * Convert object to XML format
   * @param obj Object to convert to XML
   * @returns XML string representation
   */
  private objectToXML(obj: unknown, rootName: string = "root"): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += this.buildXML(obj, rootName);
    return xml;
  }

  /**
   * Recursively build XML from object
   * @param obj Object to convert
   * @param tagName Name of the current XML tag
   * @returns XML string
   */
  private buildXML(obj: unknown, tagName: string): string {
    if (obj === null || obj === undefined) {
      return `<${tagName}></${tagName}>`;
    }

    if (
      typeof obj === "string" ||
      typeof obj === "number" ||
      typeof obj === "boolean"
    ) {
      return `<${tagName}>${this.escapeXml(String(obj))}</${tagName}>`;
    }

    if (Array.isArray(obj)) {
      let xml = "";
      obj.forEach((item, index) => {
        xml += this.buildXML(item, `${tagName}_${index}`);
      });
      return xml;
    }

    if (typeof obj === "object") {
      let xml = `<${tagName}>`;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          xml += this.buildXML((obj as Record<string, unknown>)[key], key);
        }
      }
      xml += `</${tagName}>`;
      return xml;
    }

    return `<${tagName}>${String(obj)}</${tagName}>`;
  }

  /**
   * Escape XML special characters
   * @param str String to escape
   * @returns Escaped string
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

// Singleton instance
export const fileDownloadService = new FileDownloadService();
