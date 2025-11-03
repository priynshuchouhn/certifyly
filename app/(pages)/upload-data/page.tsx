"use client";
import { useState } from "react";
interface TextField {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function UploadData() {
  const navigate = useRouter();
  const [dataUploaded, setDataUploaded] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fields] = useState<TextField[]>(() => {
    try {
      const raw = localStorage.getItem("cert_fields");
      if (raw) return JSON.parse(raw) as TextField[];
    } catch {}
    return [];
  });
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          toast.error("No rows found in CSV");
          return;
        }
        const hdrs = Object.keys(parsed[0]);
        setHeaders(hdrs);
        setRows(parsed);
        setDataUploaded(true);
        toast.success("Data uploaded successfully!");
        try {
          localStorage.setItem("cert_data", JSON.stringify(parsed));
        } catch {}
      };
      reader.readAsText(file);
    }
  };

  

  const handleGenerate = () => {
    try {
      localStorage.setItem("cert_mapping", JSON.stringify(mapping));
      // ensure data already saved to cert_data when parsed
    } catch {}
    toast.success("Generating certificates...");
    setTimeout(() => {
      navigate.push("/certificates");
    }, 800);
  };

  function parseCSV(text: string): Record<string, string>[] {
    // very small CSV parser (handles simple CSVs, not all edge cases)
    const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim() !== "");
    if (lines.length === 0) return [];
    const header = splitCSVLine(lines[0]);
    const out: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = splitCSVLine(lines[i]);
      const row: Record<string, string> = {};
      for (let j = 0; j < header.length; j++) {
        row[header[j]] = parts[j] ?? "";
      }
      out.push(row);
    }
    return out;
  }

  function splitCSVLine(line: string) {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') {
          cur += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result.map(s => s.trim());
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Data</h1>
          <p className="text-muted-foreground mt-1">
            Upload recipient data to generate certificates in bulk
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipient Data</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file with recipient information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!dataUploaded ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileSpreadsheet className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">CSV or Excel file (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">recipients-data.csv</p>
                      <p className="text-xs text-muted-foreground">{rows.length} recipients found</p>
                    </div>
                  </div>
                  <Button onClick={handleGenerate}>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Certificates
                  </Button>
                </div>
                <div className="rounded-lg border border-border overflow-hidden p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Map CSV columns to template fields</h4>
                      <p className="text-sm text-muted-foreground">Select which CSV column should fill each template field</p>
                    </div>
                    <div className="grid gap-2">
                      {fields.map((f) => (
                        <div key={f.id} className="flex items-center gap-2">
                          <div className="w-36">{f.name}</div>
                          <select
                            className="flex-1 rounded border p-2"
                            value={mapping[f.name] ?? ""}
                            onChange={(e) => setMapping({ ...mapping, [f.name]: e.target.value })}
                          >
                            <option value="">-- select column --</option>
                            {headers.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium">Preview (first 5 rows)</h4>
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {headers.slice(0, 8).map((h) => (
                                <TableHead key={h}>{h}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.slice(0, 5).map((r, idx) => (
                              <TableRow key={idx}>
                                {headers.slice(0, 8).map((h) => (
                                  <TableCell key={h}>{r[h]}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Format</CardTitle>
            <CardDescription>Your CSV/Excel file should include these columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-secondary px-2 py-1 rounded">name</span>
                <span className="text-muted-foreground">- Recipient&apos;s full name</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-secondary px-2 py-1 rounded">email</span>
                <span className="text-muted-foreground">- Recipient&apos;s email address</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-secondary px-2 py-1 rounded">score</span>
                <span className="text-muted-foreground">- Any additional field (optional)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
