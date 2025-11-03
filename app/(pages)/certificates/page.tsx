"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Archive } from "lucide-react";
import { toast } from "react-hot-toast";
import JSZip from "jszip";

export default function Certificates() {
  const [templateUrl] = useState<string | null>(() => {
    try { return localStorage.getItem("cert_template"); } catch { return null; }
  });
  interface FieldDef { id: string; name: string; x: number; y: number; fontSize: number; color: string }
  const [fields] = useState<FieldDef[]>(() => {
    try { const raw = localStorage.getItem("cert_fields"); if (raw) return JSON.parse(raw); } catch {}
    return [];
  });
  const [data] = useState<Record<string, string>[]>(() => {
    try { const raw = localStorage.getItem("cert_data"); if (raw) return JSON.parse(raw); } catch {}
    return [];
  });
  const [mapping] = useState<Record<string, string>>(() => {
    try { const raw = localStorage.getItem("cert_mapping"); if (raw) return JSON.parse(raw); } catch {}
    return {};
  });
  const [generating, setGenerating] = useState(false);

  

  const downloadAll = async () => {
    if (!templateUrl) return toast.error("No template found. Upload template first.");
    if (!fields || fields.length === 0) return toast.error("No fields configured. Configure fields first.");
    if (!data || data.length === 0) return toast.error("No data uploaded. Upload data first.");

    setGenerating(true);
    // load template image
    const img = new window.Image();
    img.src = templateUrl;
    await new Promise<void>((res) => {
      img.onload = () => res();
      img.onerror = () => res();
    });

    // generate each certificate as PNG and add to a ZIP
    const zip = new JSZip();
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 1200;
      canvas.height = img.naturalHeight || img.height || 850;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      // draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // draw fields
      for (const f of fields) {
        const mappedColumn = mapping[f.name];
        const value = (mappedColumn && row[mappedColumn]) ? row[mappedColumn] : "";
        ctx.fillStyle = f.color || "#000";
        // match preview rendering: center text horizontally and vertically
        // compute export scale so stored base fontSize is scaled to the template's native size
        const baseWidth = img.naturalWidth || img.width || 800;
        const exportScale = (canvas.width || baseWidth) / baseWidth;
        const exportFontSize = Math.max(8, Math.round((f.fontSize || 24) * exportScale));
        ctx.font = `${exportFontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const x = ((f.x || 50) / 100) * canvas.width;
        const y = ((f.y || 50) / 100) * canvas.height;
        ctx.fillText(value, x, y);
      }

      // convert to blob and add to zip
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (blob) {
        const name = (mapping[fields[0]?.name] && row[mapping[fields[0].name]]) ? `${row[mapping[fields[0].name]]}.png` : `certificate-${i + 1}.png`;
        zip.file(name, blob);
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `certificates-${new Date().toISOString().slice(0,10)}.zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("ZIP generated — download should start shortly.");
    } catch (err) {
      console.error("ZIP generation failed", err);
      toast.error("Failed to create ZIP. Try generating smaller batches.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmails = () => {
    toast.success("Sending certificates via email...");
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
            <p className="text-muted-foreground mt-1">View and manage all generated certificates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadAll} disabled={generating}>
              <Archive className="w-4 h-4 mr-2" />
              {generating ? "Generating..." : "Download ZIP"}
            </Button>
            <Button onClick={handleSendEmails}>
              <Mail className="w-4 h-4 mr-2" />
              Send All
            </Button>
          </div>
        </div>

        <div>
          {!templateUrl && (
            <Card>
              <CardContent>
                <p className="text-muted-foreground">No template found. Go to Upload Template to add one.</p>
              </CardContent>
            </Card>
          )}

          {data.length === 0 && (
            <Card>
              <CardContent>
                <p className="text-muted-foreground">No recipient data found. Upload a CSV in Upload Data.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
