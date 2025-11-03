"use client";

import React from "react";
import Joyride, { CallBackProps, STATUS } from "react-joyride";

const steps = [
  {
    target: 'button[aria-label="Open menu"]',
    content: "Open the menu to access navigation on mobile devices.",
  },
  {
    target: 'a[data-tour="nav-dashboard"]',
    content: "This is your Dashboard — summary metrics and quick links live here.",
  },
  {
    target: 'input[placeholder="Search templates, certificates..."]',
    content: "Use search to quickly find templates or certificates.",
  },
  {
    target: 'a[data-tour="nav-upload-template"]',
    content: "Go here to upload and manage certificate templates.",
  },
  {
    target: '[data-tour="upload-area"]',
    content: "Upload your certificate background image here. Click the box to choose a JPG/PNG file.",
  },
  {
    target: '[data-tour="next-field-mapping"]',
    content: "After uploading, click Next to configure field mapping for the template.",
  },
  {
    target: '[data-tour="certificate-preview"]',
    content: "This is the live certificate preview. Click on the canvas or drag fields to position them.",
  },
  {
    target: '[data-tour="add-field"]',
    content: "Add a new field (e.g., Name, Date) which you can place on the certificate.",
  },
  {
    target: '[data-tour="first-field"]',
    content: "Select a field from the list to edit its properties (name, position, size, color).",
  },
  {
    target: '[data-tour="field-name"]',
    content: "Change the field name here — this should match the column name from your upload later.",
  },
  {
    target: '[data-tour="x-pos"]',
    content: "Adjust the X position slider to move the field horizontally on the certificate.",
  },
  {
    target: '[data-tour="y-pos"]',
    content: "Adjust the Y position slider to move the field vertically on the certificate.",
  },
  {
    target: '[data-tour="save-continue"]',
    content: "Save your mapping and continue to upload data to generate certificates.",
  },
  {
    target: '[data-tour="visit"]',
    content: "A small promo/partner card — follow this link to learn more.",
  },
  {
    target: '[data-tour="profile"]',
    content: "Access your profile and account settings here.",
  },
];

export default function Tour({ run, onClose }: { run: boolean; onClose?: () => void }) {
  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (onClose) onClose();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      styles={{ options: { zIndex: 10000 } }}
    />
  );
}
