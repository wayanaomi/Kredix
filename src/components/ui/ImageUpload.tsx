"use client";

import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";

type ImageKind = "business-logo" | "product-image";

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

interface ImageUploadProps {
  label: string;
  kind: ImageKind;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ label, kind, value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file?: File) {
    if (!file) return;

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const signed = await apiFetch<SignatureResponse>("/api/uploads/signature", {
        method: "POST",
        body: { kind },
      });

      if (!signed.ok) {
        throw new Error(signed.data.error ?? "Could not prepare image upload.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signed.data.apiKey);
      formData.append("timestamp", String(signed.data.timestamp));
      formData.append("folder", signed.data.folder);
      formData.append("signature", signed.data.signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.data.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const result = await response.json();

      if (!response.ok || !result.secure_url) {
        throw new Error(result.error?.message ?? "Cloudinary upload failed.");
      }

      onChange(result.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      {value && (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Uploaded preview"
            className="h-20 w-20 rounded-xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm font-medium text-red-600"
          >
            Remove image
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(event) => uploadImage(event.target.files?.[0])}
        className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-4 file:py-2 file:font-medium file:text-text-primary"
      />

      <p className="text-xs text-text-secondary">
        JPG, PNG or WebP. Maximum size: 5MB.
      </p>

      {uploading && (
        <p className="text-sm text-text-secondary">Uploading image...</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
