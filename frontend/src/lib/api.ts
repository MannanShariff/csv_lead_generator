import { StreamMessage } from './types';

let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
if (!baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  baseUrl = `${cleanUrl}/api`;
}
export const API_BASE_URL = baseUrl;

export async function importCSVStream(
  file: File,
  onMessage: (message: StreamMessage) => void
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError = 'Failed to import CSV';
    try {
      const errObj = JSON.parse(errorText);
      parsedError = errObj.error || parsedError;
    } catch {
      parsedError = errorText || parsedError;
    }
    throw new Error(parsedError);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Readable stream not supported by browser');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');

    // Keep the last partial line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed) as StreamMessage;
        onMessage(parsed);
      } catch (err) {
        console.error('Failed to parse stream line:', trimmed, err);
      }
    }
  }

  // Parse remaining line if there is any
  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim()) as StreamMessage;
      onMessage(parsed);
    } catch (err) {
      console.error('Failed to parse remaining stream buffer:', buffer, err);
    }
  }
}
