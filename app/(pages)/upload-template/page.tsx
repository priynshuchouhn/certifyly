'use client';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ArrowRight, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadTemplate() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const router = useRouter();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (JPG, PNG)");
        return;
      }
      // read file as data URL and persist to localStorage so other pages can access it
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        try {
          localStorage.setItem("cert_template", dataUrl);
        } catch {
          // ignore localStorage errors
        }
        setUploadedFile(file);
        setPreviewUrl(dataUrl);
        toast.success("Template uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    try {
      localStorage.removeItem("cert_template");
    } catch {}
  };

  const handleNext = () => {
    if (!uploadedFile) {
      toast.error("Please upload a template first");
      return;
    }
    router.push("/field-mapping");
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Template</h1>
          <p className="text-muted-foreground mt-1">
            Upload your certificate background to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Background</CardTitle>
            <CardDescription>
              Upload a JPG or PNG image that will be used as your certificate template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!uploadedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border bg-secondary">
                  <Image
                    src={previewUrl}
                    alt="Template preview"
                    className="w-full h-auto"
                    width={400}
                    height={300}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemove}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div>
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button onClick={handleNext}>
                    Next: Field Mapping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
