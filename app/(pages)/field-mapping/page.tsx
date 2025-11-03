"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const CertificateOverlay = dynamic(() => import("@/components/CertificateOverlay"), { ssr: false });
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface TextField {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export default function FieldMapping() {
  const navigate = useRouter();
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [fields, setFields] = useState<TextField[]>(() => {
    try {
      const raw = localStorage.getItem("cert_fields");
      if (raw) {
        return JSON.parse(raw) as TextField[];
      }
    } catch {}
    return [{ id: "1", name: "Name", x: 50, y: 50, fontSize: 24, color: "#000000", fontFamily: "Inter", bold: false, italic: false, underline: false }];
  });

  const [selectedField, setSelectedField] = useState<string>(() => {
    try {
      const raw = localStorage.getItem("cert_fields");
      if (raw) {
        const parsed = JSON.parse(raw) as TextField[];
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return "1";
  });

  const addField = () => {
    const newField: TextField = {
      id: Date.now().toString(),
      name: "New Field",
      // offset new fields slightly so they don't stack exactly on top of the default field
      x: Math.min(90, 50 + fields.length * 3),
      y: Math.min(90, 50 + fields.length * 3),
  fontSize: 24,
  color: "#000000",
  fontFamily: "Inter",
  bold: false,
  italic: false,
  underline: false,
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
    toast.success("Field added successfully!");
  };

  const updateField = (id: string, updates: Partial<TextField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const selectedFieldData = fields.find(f => f.id === selectedField);

  const handleSave = () => {
    try {
      localStorage.setItem("cert_fields", JSON.stringify(fields));
    } catch {}
    toast.success("Template configured successfully!");
    navigate.push("/upload-data");
  };

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Configure where each field should appear on your certificate
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Preview</CardTitle>
                <CardDescription>
                  Click on the canvas to position your fields
                </CardDescription>
              </CardHeader>
                <CardContent>
                  <div data-tour="certificate-preview" className="relative w-full aspect-[1.414/1] bg-gradient-subtle rounded-lg border border-border overflow-hidden">
                    <div className="absolute inset-0 bg-white/50">
                    {/* Konva overlay (client only) - dynamically loaded to avoid SSR issues */}
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore-next-line */}
                    <CertificateOverlay
                      fields={fields}
                      selectedFieldId={selectedField}
                      onSelect={(id: string) => setSelectedField(id)}
                      onUpdatePosition={(id: string, x: number, y: number) => updateField(id, { x, y })}
                      onScaleChange={(s: number) => setPreviewScale(s)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fields</CardTitle>
                  <Button data-tour="add-field" size="sm" onClick={addField}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {fields.map((field, idx) => (
                  <Button
                    key={field.id}
                    data-tour={idx === 0 ? "first-field" : undefined}
                    variant={selectedField === field.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedField(field.id)}
                  >
                    {field.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {selectedFieldData && (
              <Card>
                <CardHeader>
                  <CardTitle>Field Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Field Name</Label>
                    <Input data-tour="field-name" value={selectedFieldData.name} onChange={(e) => updateField(selectedField, { name: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label data-tour="x-pos">X Position: {selectedFieldData.x.toFixed(2)}%</Label>
                    <Slider
                      value={[selectedFieldData.x]}
                      onValueChange={([x]) => updateField(selectedField, { x })}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label data-tour="y-pos">Y Position: {selectedFieldData.y.toFixed(2)}%</Label>
                    <Slider
                      value={[selectedFieldData.y]}
                      onValueChange={([y]) => updateField(selectedField, { y })}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {selectedFieldData.fontSize}px (preview: {Math.round(selectedFieldData.fontSize * previewScale)}px)</Label>
                    <Slider
                      value={[Math.round(selectedFieldData.fontSize * previewScale)]}
                      onValueChange={([scaled]) => {
                        const s = Math.max(0.0001, previewScale);
                        const base = Math.max(8, Math.round(scaled / s));
                        updateField(selectedField, { fontSize: base });
                      }}
                      min={Math.round(12 * previewScale)}
                      max={Math.round(72 * previewScale)}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <select
                      value={selectedFieldData.fontFamily || "Inter"}
                      onChange={(e) => updateField(selectedField, { fontFamily: e.target.value })}
                      className="w-full border border-border rounded px-2 py-1 bg-transparent"
                      data-tour="font-family"
                    >
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                      <option>Lato</option>
                      <option>Montserrat</option>
                      <option>Merriweather</option>
                      <option>Georgia</option>
                      <option>Times New Roman</option>
                      <option>Arial</option>
                      <option>Courier New</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={selectedFieldData.bold ? "default" : "outline"}
                        onClick={() => updateField(selectedField, { bold: !selectedFieldData.bold })}
                        aria-pressed={selectedFieldData.bold}
                        title="Bold"
                      >
                        <span className="font-bold">B</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={selectedFieldData.italic ? "default" : "outline"}
                        onClick={() => updateField(selectedField, { italic: !selectedFieldData.italic })}
                        aria-pressed={selectedFieldData.italic}
                        title="Italic"
                      >
                        <span className="italic">I</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={selectedFieldData.underline ? "default" : "outline"}
                        onClick={() => updateField(selectedField, { underline: !selectedFieldData.underline })}
                        aria-pressed={selectedFieldData.underline}
                        title="Underline"
                      >
                        <span className="underline">U</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      type="color"
                      value={selectedFieldData.color}
                      onChange={(e) => updateField(selectedField, { color: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Button data-tour="save-continue" className="w-full" size="lg" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
