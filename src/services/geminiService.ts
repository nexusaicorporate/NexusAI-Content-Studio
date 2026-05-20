export async function analyzeUrl(content: string) {
  const geminiKey = localStorage.getItem('nexus_gemini_key');
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, geminiKey })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze content');
  }
  return response.json();
}

export async function generateSocialContent(
  type: string,
  analysis: any,
  style: string,
  extraLinks: string[],
  platform: string = 'generic',
  isMultiProduct: boolean = false,
  brandKit?: any,
  gemInstruction?: string,
  platformOptions?: any
) {
  const geminiKey = localStorage.getItem('nexus_gemini_key');
  const response = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type, analysis, style, extraLinks, platform, isMultiProduct, brandKit, gemInstruction, platformOptions,
      geminiKey
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate content');
  }
  return response.json();
}

export async function generateVeoVideo(prompt: string, imageBase64?: string, aspectRatio: string = '9:16') {
  const geminiKey = localStorage.getItem('nexus_gemini_key');
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine: 'veo', prompt, imageBase64, aspectRatio, geminiKey })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate video');
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function generateHiggsfieldVideo(prompt: string, imageBase64?: string) {
  const higgsfieldKey = localStorage.getItem('nexus_higgsfield_key');
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine: 'higgsfield', prompt, imageBase64, higgsfieldKey })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate Higgsfield video');
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function chatRevision(message: string, history: {role: string, text: string}[], currentContent: any) {
  const geminiKey = localStorage.getItem('nexus_gemini_key');
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, currentContent, geminiKey })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get chat response');
  }
  const data = await response.json();
  return data.text;
}
