import * as XLSX from "xlsx";
import Papa from "papaparse";
import { ImportedData } from "@/types/abc";

export const parseExcelFile = (file: File): Promise<ImportedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { 
          header: 1,
          raw: false,
          defval: ""
        });

        if (jsonData.length === 0) {
          reject(new Error("Arquivo vazio"));
          return;
        }

        const headers = jsonData[0].map(h => String(h || ""));
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== ""));

        resolve({ headers, rows });
      } catch (error) {
        reject(new Error("Erro ao processar arquivo Excel: " + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const parseCSVFile = (file: File): Promise<ImportedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as any[][];
          
          if (data.length === 0) {
            reject(new Error("Arquivo vazio"));
            return;
          }

          const headers = data[0].map(h => String(h || ""));
          const rows = data.slice(1).filter(row => row.some(cell => cell !== ""));

          resolve({ headers, rows });
        } catch (error) {
          reject(new Error("Erro ao processar arquivo CSV: " + (error as Error).message));
        }
      },
      error: (error) => {
        reject(new Error("Erro ao ler arquivo CSV: " + error.message));
      },
      skipEmptyLines: true,
      encoding: "UTF-8"
    });
  });
};

export const parseFile = (file: File): Promise<ImportedData> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCSVFile(file);
  } else if (extension === "xlsx" || extension === "xls") {
    return parseExcelFile(file);
  } else {
    return Promise.reject(new Error("Formato de arquivo não suportado"));
  }
};
