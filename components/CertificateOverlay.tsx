"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
// react-konva is browser-only and can cause bundlers to attempt to resolve it on the server.
// Dynamically import it at runtime so Next.js won't try to bundle it during SSR.
// Note: react-konva is dynamically imported as RK; do not import Konva shapes statically here

interface TextField {
  id: string;
  name: string;
  x: number; // percent
  y: number; // percent
  fontSize: number;
  color: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface Props {
  fields: TextField[];
  selectedFieldId?: string;
  onSelect?: (id: string) => void;
  onUpdatePosition?: (id: string, xPercent: number, yPercent: number) => void;
  templateUrl?: string | null;
  // report the computed scale (stage width / template base width) to the parent so controls can match preview sizing
  onScaleChange?: (scale: number) => void;
}

export default function CertificateOverlay({ fields, selectedFieldId, onSelect, onUpdatePosition, onScaleChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  // loaded React-Konva module (Stage, Layer, Text, Image)
  const [RK, setRK] = useState<any>(null);
  // whether webfonts (Google Fonts) are ready - delay final draw until loaded so canvas uses correct fonts
  const [fontsReady, setFontsReady] = useState<boolean>(false);
  // store error message when Konva fails to load at runtime (often due to Brave Shields)
  const [konvaError, setKonvaError] = useState<string | null>(null);
  const textRefs = useRef<Record<string, any>>({});
  const stageRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    // import only on client at runtime
    import("react-konva")
      .then((mod) => {
        if (mounted) setRK(mod);
      })
      .catch((err) => {
        // If dynamic import fails, surface a helpful message. A common cause is Brave's Shields or other extensions
        // that interfere with Konva internals (canvas/WebGL APIs). Store message for UI.
        console.error("react-konva dynamic import failed:", err);
        if (mounted) setKonvaError(
          "Failed to load Konva. This can happen when Brave Shields or ad-blocking extensions block required APIs. Try disabling Shields for this site or use another browser."
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function updateSize() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // keep aspect ratio of parent; Stage needs width/height
      setSize({ width: Math.max(100, Math.round(rect.width)), height: Math.max(100, Math.round(rect.height)) });
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // update text offsets after mount so centering works
  useEffect(() => {
    Object.values(textRefs.current).forEach((node: any) => {
      try {
        if (node && node.getTextWidth) {
          node.offsetX(node.width() / 2);
          node.offsetY(node.height() / 2);
        }
      } catch {
        // ignore; best-effort centering
      }
    });
  }, [fields, size]);

  // load template image if provided
  useEffect(() => {
    try {
      const fromStorage = localStorage.getItem("cert_template");
      if (fromStorage) {
        const img = new window.Image();
        img.src = fromStorage;
        img.onload = () => setImageObj(img);
      }
    } catch {}
  }, []);

  // compute base width and scale used for font sizing and report it to parent when it changes
  const baseWidth = imageObj ? (imageObj.naturalWidth || imageObj.width || 800) : 800;
  const scale = size.width / baseWidth || 1;
  useEffect(() => {
    try {
      if (typeof onScaleChange === "function") onScaleChange(scale);
    } catch {}
  }, [scale, onScaleChange]);

  // Wait for document fonts to be ready before doing final canvas draws so Konva renders with correct fonts.
  useEffect(() => {
    let mounted = true;
    try {
      // If browser supports Font Loading API, wait for fonts to be ready. Otherwise proceed immediately.
      const fonts = (typeof document !== "undefined" ? (document as any).fonts : null);
      if (fonts && typeof fonts.ready?.then === "function") {
        // If fonts are already loaded, fonts.ready may already be resolved.
        fonts.ready.then(() => {
          if (!mounted) return;
          setFontsReady(true);
          // give Konva a moment to update and then batch draw layers
          setTimeout(() => {
            try { stageRef.current?.getLayers().forEach((l: any) => l.batchDraw()); } catch {}
          }, 30);
        }).catch(() => {
          if (!mounted) return;
          setFontsReady(true);
        });
      } else {
        // no Font Loading API, continue
        setFontsReady(true);
      }
    } catch {
      setFontsReady(true);
    }
    return () => { mounted = false; };
  }, [RK]);

  // when fonts become ready, ensure stage re-renders
  useEffect(() => {
    if (!fontsReady) return;
    try { stageRef.current?.getLayers().forEach((l: any) => l.batchDraw()); } catch {}
  }, [fontsReady]);

  // if RK not loaded yet (or failed), show a light placeholder to avoid SSR import errors
  if (!RK) {
    // show error UI when Konva failed to load due to Brave Shields etc
    if (konvaError) {
      return (
        <div ref={containerRef} className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-md text-center bg-white/90 border border-border rounded-md p-4">
            <h3 className="text-lg font-semibold">Konva failed to initialize</h3>
            <p className="text-sm mt-2 text-muted-foreground">{konvaError}</p>
            <div className="mt-3 text-left text-sm">
              <p className="font-medium">Quick steps</p>
              <ol className="list-decimal list-inside mt-1">
                <li>If you are using Brave, click the Brave lion icon in the address bar and turn off Shields for this site.</li>
                <li>Reload the page.</li>
                <li>Or try another browser (Chrome, Firefox) if the problem persists.</li>
              </ol>
            </div>
          </div>
        </div>
      );
    }

    return <div ref={containerRef} className="absolute inset-0" />;
  }

  const { Stage, Layer, Text, Image: KonvaImage, Rect } = RK;


  return (
    <div ref={containerRef} className="absolute inset-0">
      <Stage ref={stageRef} width={size.width} height={size.height} style={{ touchAction: "none" }}>
        <Layer>
          {/* background template image */}
          {imageObj && <KonvaImage image={imageObj} x={0} y={0} width={size.width} height={size.height} />}
          {fields.map((f) => {
            const x = (f.x / 100) * size.width;
            const y = (f.y / 100) * size.height;
            // scale font size according to the rendered image/stage width so text remains readable
            const scaledFontSize = Math.max(8, Math.round(f.fontSize * scale));
            const nodeRef = textRefs.current[f.id];
            const measuredWidth = nodeRef?.width?.() ?? 0;
            const measuredHeight = nodeRef?.height?.() ?? 0;
            const padding = 8;
            const rectWidth = Math.max(0, measuredWidth) + padding * 2;
            const rectHeight = Math.max(0, measuredHeight) + padding * 2;

            return (
              <React.Fragment key={f.id}>
                <Text
                  id={f.id}
                  name={f.id}
                  text={f.name}
                  x={x}
                  y={y}
                  fontSize={scaledFontSize}
                  fill={f.color}
                  fontFamily={f.fontFamily || "Inter"}
                  fontStyle={f.italic ? "italic" : "normal"}
                  fontWeight={f.bold ? "bold" : "normal"}
                  textDecoration={f.underline ? "underline" : ""}
                  draggable
                  listening={true}
                  hitStrokeWidth={10}
                  onClick={() => { onSelect?.(f.id); }}
                  onTap={() => { onSelect?.(f.id); }}
                  onMouseEnter={() => { try { if (containerRef.current) containerRef.current.style.cursor = 'grab'; } catch {} }}
                  onMouseLeave={() => { try { if (containerRef.current) containerRef.current.style.cursor = ''; } catch {} }}
                  onMouseDown={(e:any) => { try { e.target.moveToTop(); e.target.getLayer()?.batchDraw(); } catch {} }}
                  onDragStart={() => { try { if (containerRef.current) containerRef.current.style.cursor = 'grabbing'; } catch {} }}
                  onDragEnd={(e: any) => {
                    try { if (containerRef.current) containerRef.current.style.cursor = ''; } catch {}
                    const nx = e.target.x();
                    const ny = e.target.y();
                    const xPercent = Math.min(100, Math.max(0, (nx / size.width) * 100));
                    const yPercent = Math.min(100, Math.max(0, (ny / size.height) * 100));
                    onUpdatePosition?.(f.id, xPercent, yPercent);
                  }}
                  ref={(node: any) => {
                    if (node) textRefs.current[f.id] = node;
                  }}
                  // if fonts are not ready yet, hide text until we can draw with correct font
                  opacity={fontsReady ? 1 : 0}
                />

                {selectedFieldId === f.id && (
                  <Rect
                    x={x}
                    y={y}
                    width={rectWidth}
                    height={rectHeight}
                    offsetX={rectWidth / 2}
                    offsetY={rectHeight / 2}
                    stroke="#2563EB"
                    strokeWidth={2}
                    dash={[6, 4]}
                    listening={false}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

