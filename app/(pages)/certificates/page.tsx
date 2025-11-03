"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { toast } from "react-hot-toast";
import JSZip from "jszip";

export default function Certificates() {
  const [templateUrl] = useState<string | null>(() => {
    try { return localStorage.getItem("cert_template"); } catch { return null; }
  });
  interface FieldDef { id: string; name: string; x: number; y: number; fontSize: number; color: string; fontFamily?: string; bold?: boolean; italic?: boolean; underline?: boolean }
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
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  

  const downloadAll = async () => {
    if (!templateUrl) return toast.error("No template found. Upload template first.");
    if (!fields || fields.length === 0) return toast.error("No fields configured. Configure fields first.");
    if (!data || data.length === 0) return toast.error("No data uploaded. Upload data first.");

  setGenerating(true);
  setProgress({ current: 0, total: data.length });
    // load template image
    const img = new window.Image();
    img.src = templateUrl;
    await new Promise<void>((res) => {
      img.onload = () => res();
      img.onerror = () => res();
    });

    // wait for webfonts to be ready once before generating the batch so canvas draws use correct faces
    try {
      if (typeof document !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = (document as any).fonts;
        if (fonts && typeof fonts.ready?.then === "function") {
          await fonts.ready;
        }
      }
    } catch {}

    // generate each certificate as PNG and add to a ZIP
    const zip = new JSZip();
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      // update per-certificate progress
      try { setProgress({ current: i + 1, total: data.length }); } catch {}
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
        // compose font string with style/weight/family so canvas uses same styling as preview
        const fontStyle = f.italic ? "italic" : "normal";
        const fontWeight = f.bold ? "700" : "400";
        const familyRaw = f.fontFamily || "Inter";
        // wrap family in quotes if it contains spaces
        const family = /\s/.test(familyRaw) ? `"${familyRaw}"` : familyRaw;
        ctx.font = `${fontStyle} ${fontWeight} ${exportFontSize}px ${family}, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const x = ((f.x || 50) / 100) * canvas.width;
        const y = ((f.y || 50) / 100) * canvas.height;
        ctx.fillText(value, x, y);
        // draw underline manually if requested — canvas doesn't support text-decoration
        if (f.underline) {
          try {
            const metrics = ctx.measureText(value);
            const textWidth = metrics.width;
            // position underline a bit below center baseline; tweak multiplier if needed per font
            const underlineY = y + Math.max(1, exportFontSize * 0.35);
            const lineStart = x - textWidth / 2;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = Math.max(1, Math.round(exportFontSize * 0.06));
            ctx.beginPath();
            ctx.moveTo(lineStart, underlineY);
            ctx.lineTo(lineStart + textWidth, underlineY);
            ctx.stroke();
          } catch {}
        }
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
      localStorage.clear();
      toast.success("ZIP generated — download should start shortly.");
    } catch (err) {
      console.error("ZIP generation failed", err);
      toast.error("Failed to create ZIP. Try generating smaller batches.");
    } finally {
      setGenerating(false);
      setProgress(null);
    }
  };

  const downloadPreview = async () => {
    if (!templateUrl) return toast.error("No template found. Upload template first.");
    if (!fields || fields.length === 0) return toast.error("No fields configured. Configure fields first.");

    try {
      // load template image
      const img = new window.Image();
      img.src = templateUrl;
      await new Promise<void>((res) => {
        img.onload = () => res();
        img.onerror = () => res();
      });

      // wait for fonts once
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = (typeof document !== 'undefined') ? (document as any).fonts : undefined;
        if (fonts && typeof fonts.ready?.then === 'function') await fonts.ready;
      } catch {}

      // create canvas sized to template native size
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 1200;
      canvas.height = img.naturalHeight || img.height || 850;
      const ctx = canvas.getContext('2d');
      if (!ctx) return toast.error('Unable to create canvas context');

      // draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // pick a sample row (first data row) or empty values
      const sample = data[0] || {};

      for (const f of fields) {
        const mappedColumn = mapping[f.name];
        const value = (mappedColumn && sample[mappedColumn]) ? sample[mappedColumn] : f.name;
        ctx.fillStyle = f.color || '#000';
        const baseWidth = img.naturalWidth || img.width || 800;
        const exportScale = (canvas.width || baseWidth) / baseWidth;
        const exportFontSize = Math.max(8, Math.round((f.fontSize || 24) * exportScale));
        const fontStyle = f.italic ? 'italic' : 'normal';
        const fontWeight = f.bold ? '700' : '400';
        const familyRaw = f.fontFamily || 'Inter';
        const family = /\s/.test(familyRaw) ? `"${familyRaw}"` : familyRaw;
        ctx.font = `${fontStyle} ${fontWeight} ${exportFontSize}px ${family}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const x = ((f.x || 50) / 100) * canvas.width;
        const y = ((f.y || 50) / 100) * canvas.height;
        ctx.fillText(value, x, y);
        if (f.underline) {
          try {
            const metrics = ctx.measureText(value);
            const textWidth = metrics.width;
            const underlineY = y + Math.max(1, exportFontSize * 0.35);
            const lineStart = x - textWidth / 2;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = Math.max(1, Math.round(exportFontSize * 0.06));
            ctx.beginPath();
            ctx.moveTo(lineStart, underlineY);
            ctx.lineTo(lineStart + textWidth, underlineY);
            ctx.stroke();
          } catch {}
        }
      }

      // trigger download
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) return toast.error('Failed to create preview PNG');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-preview.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Preview downloaded');
    } catch (err) {
      console.error('Preview generation failed', err);
      toast.error('Failed to create preview');
    }
  };

  // const handleSendEmails = () => {
  //   toast.success("Sending certificates via email...");
  // };

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
            <Button variant="ghost" onClick={async () => { try { setGenerating(true); await downloadPreview(); } finally { setGenerating(false); } }} disabled={generating || !templateUrl}>
              Download Preview
            </Button>
            {/* <Button onClick={handleSendEmails}>
              <Mail className="w-4 h-4 mr-2" />
              Send All
            </Button> */}
          </div>
          {progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <div>Generating {progress.current} of {progress.total}</div>
                <div>{Math.round((progress.current / Math.max(1, progress.total)) * 100)}%</div>
              </div>
              <div className="w-full bg-muted h-2 rounded overflow-hidden">
                <div
                  className="bg-primary h-2"
                  style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          {!templateUrl && (
            <Card className="mb-3">
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
