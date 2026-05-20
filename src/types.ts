export interface Voice {
  id: string;
  name: string;
  accent: string;
  type: 'preset' | 'custom';
  audioUrl?: string;
  createdAt: number;
}

export interface Avatar {
  id: string;
  name: string;
  photoBase64: string;
  createdAt: number;
  voiceId?: string;
}

export interface Gem {
  id: string;
  name: string;
  systemInstruction: string;
  dataItems: { id: string; content: string }[];
}

export interface SocialConnection {
  id: string;
  platform: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  enabled: boolean;
  icon?: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'post' | 'article' | 'video' | 'image';
  previewIcon?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'pdf';
  url: string;
  thumbnailUrl?: string;
  createdAt: number;
}

export interface UserPreferences {
  autoIngest: boolean;
  highRetention: boolean;
  cloudSync: boolean;
  stealthMode: boolean;
}

export type ContentType = 'video' | 'image' | 'article' | 'deck' | 'custom';
export type VideoEngine = 'veo' | 'higgsfield';

export interface DeckSlide {
  title: string;
  content: string;
  points: string[];
  visualPrompt: string;
  type: 'title' | 'problem' | 'solution' | 'market' | 'product' | 'revenue' | 'team' | 'contact';
}

export interface ContentState {
  id: string;
  type: ContentType;
  status: 'idle' | 'generating' | 'completed' | 'error';
  data?: {
    title?: string;
    description?: string;
    script?: string;
    videoUrl?: string; 
    imageUrl?: string;
    carouselImages?: { url: string; alt: string; prompt: string }[];
    slides?: DeckSlide[];
    articleMarkdown?: string;
    analysis?: string;
    videoPrompt?: string;
    customContent?: string;
    seo?: {
      keywords: string[];
      tags: string[];
      altText: string;
      metaDescription: string;
    };
    ctaText?: string;
    platformMetadata?: any;
  };
  error?: string;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  saveUrl?: string;
}

export interface BrandKit {
  logoBase64?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface PlatformOptions {
  aspectRatio?: '9:16' | '16:9' | '4:5' | '1:1' | '3:4';
  postType?: 'post' | 'story' | 'reel' | 'short' | 'tweet' | 'thread' | 'article';
  orientation?: 'portrait' | 'landscape';
  location?: string;
  tags?: string[];
  postToThreads?: boolean;
  templateId?: string;
  captions?: boolean;
  translate?: boolean;
  translationCountries?: string[];
}

export interface UserInputs {
  url: string;
  photoBase64?: string;
  contentType: ContentType;
  customPrompt?: string;
  platforms: string[];
  globalSettings: boolean;
  style: string;
  externalLinks: string[];
  brandKit: BrandKit;
  shortenUrls: boolean;
  includeAvatarGlobal: boolean;
  includeAvatarPerPlatform: { [platform: string]: boolean };
  platformOptions: PlatformOptions;
  perPlatformOptions: { [platform: string]: PlatformOptions };
  videoEngine: VideoEngine;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  platform: string;
  scheduledTime: number;
  status: 'pending' | 'posted' | 'failed';
  thumbnailUrl?: string;
  videoDuration?: number;
  notes?: string;
}
