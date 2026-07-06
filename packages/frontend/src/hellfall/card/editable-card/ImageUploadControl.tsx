import { useRef, useState } from 'react';
import { getAuthApiUrl } from '../../../auth/getAuthApiUrl';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledButton, createStyledSpan, createStyledSubtext } from '../../../styling';

export type ImageTarget = {
  label: string;
  faceIndex?: number;
  imageProp:
    | 'image'
    | 'still_image'
    | 'rotated_image'
    | 'print_image'
    | 'rotated_print_image'
    | 'still_print_image';
};

export function ImageUploadControl({
  cardId,
  target,
  onReplaced,
}: {
  cardId: string;
  target: ImageTarget;
  onReplaced: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const baseUrl = getAuthApiUrl();
    if (!baseUrl) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}/image`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          faceIndex: target.faceIndex,
          imageProp: target.imageProp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.reason || `Error ${res.status}`);
      }
      const cacheBusted = `${data.imageUrl}${
        data.imageUrl.includes('?') ? '&' : '?'
      }t=${Date.now()}`;
      onReplaced(cacheBusted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <UploadRow>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <UploadButton type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? 'Uploading…' : `Replace ${target.label}`}
      </UploadButton>
      {error && <ErrorText size="small">{error}</ErrorText>}
    </UploadRow>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

const uploadRowStyles = createStyles({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  marginTop: 4,
});
const UploadRow = createStyledSpan(uploadRowStyles, 'UploadRow');

const uploadButtonStyles = createStyles({
  padding: '2px 8px',
  fontSize: 11,
  border: '1px solid #ccc',
  borderRadius: 2,
  background: '#fff',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { borderColor: '#888' },
  '&:disabled': { opacity: 0.5, cursor: 'default' },
});
const UploadButton = createStyledButton(uploadButtonStyles, 'UploadButton');

const errorTextStyles = createStyles({ color: '#c00', fontSize: 11 });
const ErrorText = createStyledSubtext(errorTextStyles, 'ErrorText');
