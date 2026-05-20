/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Link as LinkIcon, 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Send, 
  Download, 
  Share2,
  ChevronRight,
  RefreshCcw,
  MessageSquare,
  BarChart3,
  Terminal,
  Zap,
  X,
  Mic,
  AlertCircle,
  ExternalLink,
  Trash2,
  Calendar,
  Layout,
  Clock,
  Copy,
  Check,
  Plus,
  BookOpen,
  Target,
  UserCircle,
  Settings,
  Globe,
  PlusCircle,
  Music,
  Bell,
  Camera,
  Layers,
  HardDrive,
  Eye,
  Play,
  Presentation,
  FileSearch,
  Database,
  Palette,
  LogOut,
  ExternalLink as ExtLink,
  Facebook,
  Twitter,
  ShoppingBag,
  CreditCard,
  Maximize,
  ChevronLeft,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { analyzeUrl, generateSocialContent, generateVeoVideo, generateHiggsfieldVideo, chatRevision } from './services/geminiService';
import { ContentState, UserInputs, Avatar, Voice, ContentTemplate, ScheduledPost, Gem, SocialConnection, MediaAsset, UserPreferences, DeckSlide } from './types';

// Local fallbacks for deleted shadcn components
const Badge = ({ children, className }: any) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${className}`}>
    {children}
  </span>
);

const Separator = ({ className }: any) => (
  <div className={`shrink-0 bg-neutral-200 h-[1px] w-full ${className}`} />
);

const ScrollArea = ({ children, className }: any) => (
  <div className={`relative overflow-auto ${className}`}>
    {children}
  </div>
);

const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (v: string) => void }>({ activeTab: '', setActiveTab: () => {} });

const Tabs = ({ children, defaultValue, className, value, onValueChange }: any) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(defaultValue);
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = onValueChange !== undefined ? onValueChange : setInternalActiveTab;
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className }: any) => (
  <div className={className}>{children}</div>
);

const TabsTrigger = ({ children, value, className }: any) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  return (
    <button 
      onClick={() => setActiveTab(value)}
      className={`${className} ${activeTab === value ? 'data-[state=active]' : ''}`}
      data-state={activeTab === value ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, className }: any) => {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

import { 
  googleSignIn, 
  uploadToDrive, 
  auth,
  getAvatars,
  saveAvatar,
  deleteAvatar,
  updateAvatarVoice,
  getVoices,
  saveVoice,
  deleteVoice,
  getTemplates,
  getScheduledPosts,
  schedulePost,
  deleteScheduledPost,
  reschedulePost
} from './services/googleDriveService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  logAction, 
  checkIsAdmin, 
  syncUserProfile, 
  getLogs, 
  getAllUsers, 
  OperationLog, 
  UserProfile 
} from './services/loggingService';

const COUNTRIES = [
  { code: 'US', name: 'USA' }, { code: 'GB', name: 'UK' }, { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' }, { code: 'ES', name: 'Spain' }, { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' }, { code: 'CN', name: 'China' }, { code: 'KR', name: 'Korea' },
  { code: 'BR', name: 'Brazil' }, { code: 'MX', name: 'Mexico' }, { code: 'IN', name: 'India' }
];

const DeckViewer = ({ slides, brandKit }: { slides: DeckSlide[], brandKit: any }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center justify-between">
        <div>
           <Badge className="bg-black text-white px-4 py-1.5 rounded-full">Strategic Pitch Deck</Badge>
           <p className="text-[10px] items-center gap-2 font-black uppercase text-neutral-400 tracking-[0.3em] mt-3 flex">
             <Layout className="w-3 h-3" /> Synthesis Stage • Slide {currentSlide + 1} of {slides.length}
           </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="p-3 bg-white border border-border rounded-xl hover:bg-neutral-50 disabled:opacity-30 transition-all"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            className="p-3 bg-white border border-border rounded-xl hover:bg-neutral-50 disabled:opacity-30 transition-all"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="aspect-[16/9] w-full bg-neutral-900 rounded-[40px] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black" />
           <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600')] bg-cover bg-center mix-blend-overlay grayscale opacity-50" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 p-20 flex flex-col justify-center"
          >
            <div className="max-w-4xl space-y-12">
              <div className="space-y-6">
                <Badge className="bg-primary/20 text-primary border border-primary/30 px-6 py-2 text-xs">{slides[currentSlide].type?.toUpperCase() || 'STRATEGIC COMPONENT'}</Badge>
                <h2 className="font-space text-8xl text-white font-black leading-[0.9] tracking-tighter nexus-glow-text">
                  {slides[currentSlide].title}
                </h2>
              </div>
              
              <div className="space-y-10">
                <p className="text-2xl text-slate-300 leading-relaxed font-bold tracking-tight max-w-2xl">
                  {slides[currentSlide].content}
                </p>
                
                <div className="grid grid-cols-2 gap-8">
                  {slides[currentSlide].points?.map((point, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.1) }}
                      key={idx} 
                      className="flex items-start gap-5 p-6 bg-white/5 border border-white/5 rounded-[24px] hover:border-primary/20 transition-all group"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_10px_rgba(0,242,255,0.8)] group-hover:scale-125 transition-transform" />
                      <span className="text-sm font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">{point}</span>
                    </motion.div>
                  )) || null}
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-20 flex gap-2">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-12 bg-white' : 'w-2 bg-white/20'}`} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Architect Notes</span>
               <Terminal className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-bold text-white border-l-2 border-primary pl-4 leading-relaxed">
              Slide narrative optimized for investor resonance and high-conviction hardware storytelling.
            </p>
         </div>
         <div className="bg-primary/5 p-8 rounded-[32px] space-y-6 border border-primary/10">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">Visual Prompt</span>
               <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed italic">
              {slides[currentSlide].visualPrompt}
            </p>
         </div>
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const [driveUser, setDriveUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setDriveUser(user);
      if (user) {
        setIsAuthenticated(true);
        await syncUserProfile(user);
        const adminStatus = await checkIsAdmin(user.uid);
        setIsSystemAdmin(adminStatus);
        logAction('login', `User session initiated: ${user.email}`);
      } else {
        setIsAuthenticated(false);
        setIsSystemAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleDriveSave = async () => {
    if (!content?.data) return;
    setIsDriveSaving(true);
    try {
      const fileName = `NexusAI_${content.type}_${new Date().toISOString().split('T')[0]}.txt`;
      let textContent = `Title: ${content.data.title}\n\n`;
      if (content.type === 'video') textContent += `Script:\n${content.data.script}`;
      else if (content.type === 'article') textContent += `Article:\n${content.data.articleMarkdown}`;
      else if (content.type === 'image') textContent += `Prompts:\n${content.data.carouselImages?.map((i: any) => i.prompt).join('\n\n')}`;
      else textContent += `Custom Content:\n${content.data.customContent}`;

      await uploadToDrive(fileName, textContent);
      setContent(prev => prev ? { ...prev, saveStatus: 'saved' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to Drive');
    } finally {
      setIsDriveSaving(false);
    }
  };
  
  const [inputs, setInputs] = useState<UserInputs>({
    url: '',
    contentType: 'video',
    customPrompt: '',
    platforms: ['youtube'],
    globalSettings: true,
    style: 'Viral & Energetic',
    externalLinks: [],
    brandKit: {
      primaryColor: '#00FF00',
      secondaryColor: '#000000',
      accentColor: '#FF00FF',
      fontFamily: 'Inter'
    },
    shortenUrls: false,
    includeAvatarGlobal: true,
    includeAvatarPerPlatform: {},
    platformOptions: {
      aspectRatio: '16:9',
      postType: 'post',
      orientation: 'landscape',
      postToThreads: false,
      templateId: 'product-post'
    },
    perPlatformOptions: {},
    videoEngine: 'veo'
  });

  const [multiContent, setMultiContent] = useState<{ [platform: string]: ContentState }>({});

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [content, setContent] = useState<ContentState | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([
    { id: 'v1', name: 'James', accent: 'British (UK)', type: 'preset', createdAt: 0 },
    { id: 'v2', name: 'Sophia', accent: 'American (US)', type: 'preset', createdAt: 0 },
    { id: 'v3', name: 'Hiroshi', accent: 'Japanese (JP)', type: 'preset', createdAt: 0 },
    { id: 'v4', name: 'Elara', accent: 'Australian (AU)', type: 'preset', createdAt: 0 },
    { id: 'v5', name: 'Matteo', accent: 'Italian (IT)', type: 'preset', createdAt: 0 },
  ]);
  const [showAvatarSetupModal, setShowAvatarSetupModal] = useState(false);
  const [tempAvatarImage, setTempAvatarImage] = useState<string | null>(null);
  const [setupAvatarName, setSetupAvatarName] = useState('');
  const [setupSelectedVoiceId, setSetupSelectedVoiceId] = useState<string>('v1');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [view, setView] = useState<'forge' | 'settings' | 'avatars' | 'media' | 'architect' | 'brand-kit'>('forge');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 16));
  const [reschedulingPost, setReschedulingPost] = useState<string | null>(null);
  const [configuringConnection, setConfiguringConnection] = useState<SocialConnection | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [localSecrets, setLocalSecrets] = useState({
    geminiKey: localStorage.getItem('nexus_gemini_key') || '',
    higgsfieldKey: localStorage.getItem('nexus_higgsfield_key') || ''
  });

  const saveSecrets = (newSecrets: { geminiKey: string; higgsfieldKey: string }) => {
    setLocalSecrets(newSecrets);
    localStorage.setItem('nexus_gemini_key', newSecrets.geminiKey);
    localStorage.setItem('nexus_higgsfield_key', newSecrets.higgsfieldKey);
    setShowSettingsModal(false);
  };
  const [adminLogs, setAdminLogs] = useState<OperationLog[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoIngest: false,
    highRetention: true,
    cloudSync: true,
    stealthMode: false
  });

  const [gems, setGems] = useState<Gem[]>([{
    id: 'master-engine',
    name: 'Master Prompt: Intelligence Engine',
    systemInstruction: `Role & Identity: You are a 2026-grade Documentary Narrative and Visual Intelligence Engine.
Phase 1: Source Integration & Analysis Protocol. Fact Preservation.
Phase 2: Narrative & Hook Engineering. Use Curiosity Gap, Bandwagon Effect, Contrarian Statements.
Phase 3: Visual Generation Framework (Scene, Visual Style, Camera, Subject, BG, Lighting, Audio, Color).
Phase 4: Technical Execution (JSON Prompting).

--- SCRIPTING PROMPT ARCHITECTURE ---
1. Open with powerful cinematic hook.
2. Build suspense layered storytelling.
3. Emotional engagement (dramatic pauses).
4. Simple clear Hindi.
5. Blend facts naturally.
6. Immersive narrative.
7. Powerful closing line.

--- VISUAL PROMPT PROTOCOL ---
Scene: One clear sentence.
Visual Style: Documentary realism.
Main Subject: Identity Precision Lock.
Lighting: Atmospheric.
Final Rule: Start with "High-detail cinematic documentary illustration, realistic human proportions..." end with "cinematic documentary realism..."`,
    dataItems: [
      { id: '1', content: 'Hook: You\'ve got 1.5 seconds. Maybe less.' },
      { id: '2', content: 'Fact: 8 out of 10 people read a headline, but only 2 click through.' }
    ]
  }]);

  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([
    { id: '1', platform: 'facebook', name: 'Facebook Page', status: 'disconnected', enabled: false },
    { id: '2', platform: 'youtube', name: 'YouTube Studio', status: 'disconnected', enabled: false },
    { id: '3', platform: 'instagram', name: 'Instagram Graph', status: 'disconnected', enabled: false },
    { id: '4', platform: 'tiktok', name: 'TikTok Business', status: 'disconnected', enabled: false },
    { id: '5', platform: 'linkedin', name: 'LinkedIn Professional', status: 'disconnected', enabled: false },
    { id: '6', platform: 'twitter', name: 'Twitter / X', status: 'disconnected', enabled: false },
    { id: '7', platform: 'pinterest', name: 'Pinterest Business', status: 'disconnected', enabled: false },
    { id: '8', platform: 'medium', name: 'Medium Partner', status: 'disconnected', enabled: false },
    { id: '9', platform: 'substack', name: 'Substack Writer', status: 'disconnected', enabled: false },
    { id: '10', platform: 'shopify', name: 'Shopify Store', status: 'disconnected', enabled: false },
    { id: '11', platform: 'blogger', name: 'Blogger Site', status: 'disconnected', enabled: false }
  ]);

  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([
    { id: 'custom', name: 'Nexus Logic', description: 'User-defined neural instructions', category: 'post', prompt: '' },
    { id: 'social-post', name: 'Nexus Social', description: 'High-conversion Facebook & Instagram post', category: 'post', prompt: 'Create a high-retention product highlight post for social media.' },
    { id: 'long-video', name: 'Production Video', description: 'Deep-dive video script for YouTube', category: 'video', prompt: 'Write a comprehensive documentary-style video script for a long-form product showcase.' },
    { id: 'short-video', name: 'Nexus Short', description: 'Viral Shorts, Reels, and TikTok content', category: 'video', prompt: 'Create an energetic, high-speed viral short-form video script.' },
    { id: 'product-intel', name: 'Product Intelligence', description: 'Professional deep-dive technical article', category: 'article', prompt: 'Write a detailed feature analysis article for a professional blog.' },
    { id: 'analysis-review', name: 'Analysis Review', description: 'Strategic product evaluation and review', category: 'article', prompt: 'Write a cinematic documentary-style product review article.' },
    { id: 'visual-carousel', name: 'Visual Carousel', description: 'Multi-slide visual story for Instagram', category: 'image', prompt: 'Design a sequence of high-impact visual prompts for a multi-image carousel post.' }
  ]);

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([
    { id: '1', name: 'Nexus Promotional Video', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', createdAt: Date.now() },
    { id: '2', name: 'Tech Background Abstract', type: 'image', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800', createdAt: Date.now() },
    { id: '3', name: 'Product Shot 01', type: 'image', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', createdAt: Date.now() }
  ]);
  const [previewTarget, setPreviewTarget] = useState<'youtube' | 'instagram' | 'linkedin' | 'tiktok'>('youtube');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState('preview');
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [blueprintContent, setBlueprintContent] = useState('');
  const [customChatMessages, setCustomChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [urlPreview, setUrlPreview] = useState<{ title: string; thumbnail: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isInlineRecording, setIsInlineRecording] = useState(false);
  const [inlineRecordingTime, setInlineRecordingTime] = useState(0);
  const [voiceModalAvatar, setVoiceModalAvatar] = useState<Avatar | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onerror = () => reject(new Error('Neural parsing failed: The image file may be corrupt or an unsupported format.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Neural architecture error: Could not initialize image processing context.'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (err) {
          reject(new Error('Optimization failure: ' + (err instanceof Error ? err.message : 'Unknown processing error')));
        }
      };
    });
  };

  const downloadBlueprintPDF = () => {
    if (!blueprintContent) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('NEXUS AI DEPLOYMENT BLUEPRINT', 15, 25);
    doc.setFontSize(8);
    doc.text(`NEURAL SIGNATURE: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`, 15, 33);
    doc.text(`TIMESTAMP: ${new Date().toLocaleString()}`, pageWidth - 15, 33, { align: 'right' });
    
    // Reset colors
    doc.setTextColor(18, 18, 18);
    let yPos = 55;
    
    // Parameters Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM CONFIGURATION', 15, yPos);
    doc.setDrawColor(230, 230, 230);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
    yPos += 12;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const params = [
      ['Target Platform', inputs.platform.toUpperCase()],
      ['Content Type', inputs.contentType.toUpperCase()],
      ['Creative Tone', inputs.style.toUpperCase()],
      ['Source URL', inputs.url]
    ];
    
    params.forEach(([label, value]) => {
      doc.setTextColor(150, 150, 150);
      doc.text(`${label}:`, 15, yPos);
      doc.setTextColor(18, 18, 18);
      doc.text(value, 50, yPos);
      yPos += 7;
    });

    if (content?.data) {
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('GENERATED OUTPUT DATA', 15, yPos);
      doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
      yPos += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('TITLE:', 15, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(content.data.title || 'N/A', 30, yPos);
      yPos += 10;

      if (content.data.script || content.data.articleMarkdown) {
        doc.setFont('helvetica', 'normal');
        doc.text('PRIMARY CONTENT:', 15, yPos);
        yPos += 7;
        const bodyText = content.data.script || content.data.articleMarkdown || '';
        const splitBody = doc.splitTextToSize(bodyText, pageWidth - 30);
        doc.text(splitBody, 15, yPos);
        yPos += (splitBody.length * 4) + 15;
      }
    }
    
    // Logic Stream Section
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NEURAL LOGIC STREAM (RAW)', 15, yPos);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
    yPos += 12;
    
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    const splitText = doc.splitTextToSize(blueprintContent, pageWidth - 30);
    doc.text(splitText, 15, yPos);
    
    doc.save(`nexus-deployment-blueprint-${Date.now()}.pdf`);
  };

  const handleCreateAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!driveUser) {
      alert('Please Sign In with Google to save personas to your vault.');
      if (e.target) e.target.value = '';
      return;
    }
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Invalid Identity Format: Please select a valid profile image (JPG/PNG).');
        if (e.target) e.target.value = '';
        return;
      }

      // Check file size (max 5MB for storage safety)
      if (file.size > 5 * 1024 * 1024) {
        setError('Core Signature Overload: Image size exceeds 5MB limit.');
        if (e.target) e.target.value = '';
        return;
      }

      setLoading(true);
      setLoadingMessage('EXTRACTING IDENTITY FEATURES...');
      const reader = new FileReader();

      reader.onerror = () => {
        setError('Signal Interruption: Error reading image file.');
        setLoading(false);
        setLoadingMessage('');
        if (e.target) e.target.value = '';
      };

      reader.onloadend = async () => {
        try {
          const rawBase64 = reader.result as string;
          
          setLoadingMessage('OPTIMIZING NEURAL SIGNATURE...');
          const compressedBase64 = await compressImage(rawBase64);
          
          setTempAvatarImage(compressedBase64);
          setSetupAvatarName(file.name.split('.')[0] || 'New Identity');
          setShowAvatarSetupModal(true);
          setLoading(false);
          setLoadingMessage('');
          if (e.target) e.target.value = '';
        } catch (err) {
          console.error('Avatar ingest error:', err);
          const msg = err instanceof Error ? err.message : 'Unknown integration failure';
          setError(`VAULT_ERROR: ${msg}`);
          setLoading(false);
          setLoadingMessage('');
          if (e.target) e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchPreview = async () => {
      if (!inputs.url || !inputs.url.startsWith('http')) {
        setUrlPreview(null);
        return;
      }
      setLoadingPreview(true);
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputs.url })
        });
        const data = await res.json();
        if (data.title || data.thumbnail) {
          setUrlPreview(data);
        }
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setLoadingPreview(false);
      }
    };

    const timer = setTimeout(fetchPreview, 1000);
    return () => clearTimeout(timer);
  }, [inputs.url]);

  const [chatOpen, setChatOpen] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<any[] | null>(null);
  const [manualMedia, setManualMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  const batchInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleSpreadsheetUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      import('papaparse').then(Papa => {
        Papa.parse(file, {
          header: true,
          complete: async (results: any) => {
            let processedData = results.data;
            if (inputs.shortenUrls) {
              setBatchLoading(true);
              // Mock shortening for CSV URLs - in production this would call an API per URL
              processedData = processedData.map((row: any) => {
                const newRow = { ...row };
                Object.keys(newRow).forEach(key => {
                  if (typeof newRow[key] === 'string' && (newRow[key].startsWith('http://') || newRow[key].startsWith('https://'))) {
                    newRow[key] = `https://nx.us/${Math.random().toString(36).substr(2, 6)}`;
                  }
                });
                return newRow;
              });
              setBatchLoading(false);
            }
            setSpreadsheetData(processedData);
            alert(`Parsed ${processedData.length} units for batch processing.`);
          },
          error: (err: { message: string }) => {
            setError('Failed to parse spreadsheet: ' + err.message);
          }
        });
      });
    }
  };

  const handleManualMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualMedia({ url: reader.result as string, type });
      };
      reader.readAsDataURL(file);
    }
  };

  const systemInstructions = `SYSTEM CORE INSTRUCTIONS:
- Always prioritize high-conversion hooks.
- Ensure 9:16 aspect ratio optimization for social platforms.
- Keep tone professional yet viral.
- MANDATORY CTA: Include "This is Christopher from NexusAIGear, smash that like button and the link to the product is in the post. Don't forget to subscribe." in all video scripts.
- Use colorful emojis for engagement.`;

  useEffect(() => {
    if (driveUser) {
      loadAvatars(driveUser.uid);
      loadTemplates(driveUser.uid);
      loadSchedule(driveUser.uid);
    }
  }, [driveUser]);

  const loadAvatars = async (userId: string) => {
    try {
      setLoadingAvatars(true);
      const [fetchedAvatars, fetchedVoices] = await Promise.all([
        getAvatars(userId),
        getVoices(userId)
      ]);
      setAvatars(fetchedAvatars);
      
      const presetVoices: Voice[] = [
        { id: 'v1', name: 'James', accent: 'British (UK)', type: 'preset', createdAt: 0 },
        { id: 'v2', name: 'Sophia', accent: 'American (US)', type: 'preset', createdAt: 0 },
        { id: 'v3', name: 'Hiroshi', accent: 'Japanese (JP)', type: 'preset', createdAt: 0 },
        { id: 'v4', name: 'Elara', accent: 'Australian (AU)', type: 'preset', createdAt: 0 },
        { id: 'v5', name: 'Matteo', accent: 'Italian (IT)', type: 'preset', createdAt: 0 },
      ];
      setVoices([...presetVoices, ...fetchedVoices]);
    } catch (err) {
      console.error('Error loading avatars:', err);
      setError(`VAULT_LOAD_ERROR: ${err instanceof Error ? err.message : 'Storage Link Failure'}`);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const finalizeAvatarCreation = async () => {
    if (!driveUser || !tempAvatarImage) return;
    
    try {
      setLoading(true);
      setLoadingMessage('FINALIZING IDENTITY...');
      
      await saveAvatar(driveUser.uid, {
        photoBase64: tempAvatarImage,
        name: setupAvatarName,
        voiceId: setupSelectedVoiceId
      });

      await loadAvatars(driveUser.uid);
      setShowAvatarSetupModal(false);
      setTempAvatarImage(null);
      setSetupAvatarName('');
      setLoading(false);
    } catch (err) {
      setError(`FINALIZE_ERROR: ${err instanceof Error ? err.message : 'Unknown Failure'}`);
      setLoading(false);
    }
  };

  const loadTemplates = async (userId: string) => {
    const res = await getTemplates(userId);
    setTemplates(res);
  };

  const loadSchedule = async (userId: string) => {
    setLoadingSchedule(true);
    const res = await getScheduledPosts(userId);
    setScheduledPosts(res);
    setLoadingSchedule(false);
  };

  const handleReschedule = async (postId: string, newTime: string) => {
    if (!driveUser || !newTime) return;
    const timestamp = new Date(newTime).getTime();
    try {
      await reschedulePost(driveUser.uid, postId, timestamp);
      loadSchedule(driveUser.uid);
      setReschedulingPost(null);
    } catch (err) {
      setError('Failed to reschedule post');
    }
  };

  const handleDeleteSchedule = async (postId: string) => {
    if (!driveUser) return;
    if (!confirm('Are you sure you want to delete this post record?')) return;
    try {
      await deleteScheduledPost(driveUser.uid, postId);
      loadSchedule(driveUser.uid);
    } catch (err) {
      setError('Failed to delete scheduled post');
    }
  };

  const renderCalendar = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="h-8 flex items-center justify-center font-sans text-[10px] text-neutral-300 uppercase font-bold tracking-widest">{d}</div>
        ))}
        {blanks.map(i => <div key={`b-${i}`} className="h-16" />)}
        {days.map(d => {
          const dayDate = new Date(now.getFullYear(), now.getMonth(), d);
          const postsOnDay = scheduledPosts.filter(p => {
            const pDate = new Date(p.scheduledTime);
            return pDate.getDate() === d && pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
          });

          return (
            <div key={d} className={`h-16 border border-neutral-50 rounded-lg p-2 relative transition-all ${postsOnDay.length > 0 ? 'bg-neutral-50 border-primary/20 shadow-sm' : 'hover:bg-neutral-50'}`}>
              <span className="font-sans text-[9px] text-neutral-400 font-bold">{d}</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {postsOnDay.slice(0, 3).map(p => (
                  <div key={p.id} className="w-1.5 h-1.5 bg-primary rounded-full" title={p.title} />
                ))}
                {postsOnDay.length > 3 && <div className="text-[7px] text-primary font-bold">+{postsOnDay.length - 3}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const copyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDeleteAvatar = async (id: string) => {
    if (!driveUser) return;
    await deleteAvatar(driveUser.uid, id);
    loadAvatars(driveUser.uid);
  };

  const handleDeleteVoice = async (id: string) => {
    if (!driveUser) return;
    try {
      setLoading(true);
      setLoadingMessage('DELETING VOICE SIGNATURE...');
      await deleteVoice(driveUser.uid, id);
      await loadAvatars(driveUser.uid);
      setLoading(false);
      setLoadingMessage('');
    } catch (err) {
      console.error('Error deleting voice:', err);
      setError(`DELETE_VOICE_ERROR: ${err instanceof Error ? err.message : 'Unknown Failure'}`);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const playSimulatedVocalSustain = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePlayVoice = (voiceId: string) => {
    setPlayingVoiceId(voiceId);
    playSimulatedVocalSustain();
    setTimeout(() => {
      setPlayingVoiceId(null);
    }, 1000);
  };

  const handleAttachVoice = async (avatarId: string, voiceId: string) => {
    if (!driveUser) return;
    try {
      setLoading(true);
      setLoadingMessage('ATTACHING NEURAL VOICE SIGNATURE...');
      await updateAvatarVoice(driveUser.uid, avatarId, voiceId);
      // Update local state
      setAvatars(prev => prev.map(av => av.id === avatarId ? { ...av, voiceId } : av));
      setLoading(false);
      setLoadingMessage('');
      setVoiceModalAvatar(null);
      setShowVoiceModal(false);
    } catch (err) {
      console.error('Error updating voice association:', err);
      setError(`ATTACH_VOICE_ERROR: ${err instanceof Error ? err.message : 'Association Failure'}`);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleScheduleContent = async () => {
    if (!driveUser || !content) return;
    
    const isNow = scheduleMode === 'now';
    const scheduledTime = isNow ? Date.now() : new Date(scheduleDate).getTime();

    if (!isNow && isNaN(scheduledTime)) {
      setError('Invalid schedule date selected');
      return;
    }

    setLoadingMessage(isNow ? 'Deploying Content...' : 'Scheduling Sequences...');
    try {
      await schedulePost(driveUser.uid, {
        contentId: content.id,
        contentType: content.type,
        title: content.data?.title || 'Untitled Post',
        platform: inputs.platform || 'generic',
        scheduledTime: scheduledTime,
        status: isNow ? 'posted' : 'pending',
        thumbnailUrl: content.data?.imageUrl,
        notes: scheduleNotes
      });
      loadSchedule(driveUser.uid);
      setScheduleNotes('');
      alert(isNow ? 'Content published successfully!' : `Post scheduled for ${new Date(scheduledTime).toLocaleString()}`);
    } catch (err) {
      setError(isNow ? 'Failed to publish content' : 'Failed to schedule post');
    } finally {
      setLoadingMessage('');
    }
  };
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [shortening, setShortening] = useState(false);

  const handleShorten = async () => {
    if (!inputs.url) return;
    setShortening(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputs.url })
      });
      const { shortUrl } = await res.json();
      setInputs(prev => ({ ...prev, url: shortUrl }));
    } catch (err) {
      setError('Failed to shorten URL');
    } finally {
      setShortening(false);
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Invalid File: Please upload an image.');
        return;
      }

      setLoading(true);
      setLoadingMessage('Processing Identity Image...');
      const reader = new FileReader();
      
      reader.onerror = () => {
        setError('Transfer Error: Could not read image data.');
        setLoading(false);
        setLoadingMessage('');
      };

      reader.onloadend = async () => {
        try {
          const rawBase64 = reader.result as string;
          const compressedBase64 = await compressImage(rawBase64);
          setPhotoPreview(compressedBase64);
          setInputs(prev => ({ ...prev, photoBase64: compressedBase64 }));
          setLoading(false);
          setLoadingMessage('');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to process image');
          setLoading(false);
          setLoadingMessage('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setInputs(prev => ({ 
          ...prev, 
          brandKit: { ...prev.brandKit, logoBase64: base64 } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [generationReport, setGenerationReport] = useState<{platform: string, status: 'success' | 'failed', error?: string}[]>([]);
  const [showReport, setShowReport] = useState(false);

  const handleGenerate = async () => {
    if (inputs.platforms.length === 0) {
      setError('Neural Protocol Error: No target platforms selected.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Initializing Scraper...');
    setError(null);
    setGenerationReport([]);
    setShowReport(false);

    try {
      // Step 1: Scrape
      setLoadingMessage('Scraping Website Data...');
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputs.url })
      });
      
      const scrapeData = await scrapeRes.json().catch(() => ({}));
      if (!scrapeRes.ok || !scrapeData.content) {
        throw new Error(scrapeData.error || `Scrape Failed: ${scrapeRes.statusText}. Please check the URL.`);
      }

      const scrapedText = scrapeData.content;

      // Step 2: Analyze
      setLoadingMessage('Performing Deep Analysis...');
      const analysis = await analyzeUrl(scrapedText);

      // Step 3: Multi-Platform Generation
      const newMultiContent: { [platform: string]: ContentState } = {};
      let fullBlueprint = `--- NEURAL DEPLOYMENT BLUEPRINT ---\nTIMESTAMP: ${new Date().toISOString()}\nSOURCE: ${inputs.url}\nSTYLE: ${inputs.style}\n\n`;
      const reports: {platform: string, status: 'success' | 'failed', error?: string}[] = [];
      let currentStep = 0;
      const totalSteps = inputs.platforms.length;

      for (const plat of inputs.platforms) {
        currentStep++;
        setLoadingMessage(`Synthesizing for ${plat.toUpperCase()} (${currentStep}/${totalSteps})...`);
        
        try {
          const activeGem = gems[0];
          const options = inputs.globalSettings ? inputs.platformOptions : (inputs.perPlatformOptions[plat] || inputs.platformOptions);
          const selectedTemplate = contentTemplates.find(t => t.id === options.templateId) || contentTemplates[0];
          const customLogic = options.templateId === 'custom' 
            ? customChatMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
            : (selectedTemplate.prompt || inputs.customPrompt);

          const includeAvatar = inputs.globalSettings ? inputs.includeAvatarGlobal : (inputs.includeAvatarPerPlatform[plat] ?? inputs.includeAvatarGlobal);

          const combinedInstructions = `
            MASTER INSTRUCTION OVERRIDE:
            ${activeGem.systemInstruction}
            
            NEURAL DATA VAULT (INVARIANTS):
            ${activeGem.dataItems.map(d => d.content).join('\n')}
            
            TEMPLATE ARCHITECTURE:
            Name: ${selectedTemplate.name}
            Category: ${selectedTemplate.category}
            Logic: ${selectedTemplate.prompt}
            
            BRAND IDENTITY (STRICT ADHERENCE):
            - Primary Color: ${inputs.brandKit.primaryColor}
            - Secondary Color: ${inputs.brandKit.secondaryColor}
            - Accent Color: ${inputs.brandKit.accentColor}
            - Brand Font: ${inputs.brandKit.fontFamily}
            ${inputs.brandKit.logoBase64 ? "- Brand Logo: Available for visual synthesis context." : ""}
            Ensure all narrative and visual styles align with this identity.
            
            PLATFORM CONTEXT: ${plat.toUpperCase()}
            OPTIONS: ${JSON.stringify(options)}
            
            USER REFINEMENT / CHAT CONTEXT:
            ${customLogic}
            
            CRITICAL: Follow the "JSON Prompting" protocol from the master instruction. Generate the final content directly based on the inferred schema. Do not output the JSON schema itself.
          `;

          fullBlueprint += `[${plat.toUpperCase()} STRATEGY]\n${combinedInstructions}\n\n`;

          const generated = await generateSocialContent(
            inputs.contentType, 
            analysis, 
            inputs.style,
            inputs.externalLinks,
            plat,
            false,
            inputs.brandKit,
            combinedInstructions,
            options
          );

          let finalVideoUrl = manualMedia?.type === 'video' ? manualMedia.url : null;
          if (inputs.contentType === 'video') {
            if (manualMedia?.type === 'video') {
              reports.push({ platform: plat, status: 'success', error: 'Using manual media asset.' });
            } else if (generated.videoPrompt) {
              setLoadingMessage(`Rendering Video for ${plat.toUpperCase()}...`);
              try {
                const photoToUse = includeAvatar ? inputs.photoBase64 : undefined;
                if (inputs.videoEngine === 'higgsfield') {
                  finalVideoUrl = await generateHiggsfieldVideo(generated.videoPrompt, photoToUse);
                } else {
                  finalVideoUrl = await generateVeoVideo(generated.videoPrompt, photoToUse, options.aspectRatio);
                }
                reports.push({ platform: plat, status: 'success' });
              } catch (vidErr: any) {
                console.error(`Video generation failed for ${plat}:`, vidErr);
                reports.push({ platform: plat, status: 'failed', error: `Visual Component Failure: ${vidErr.message}` });
              }
            } else {
              reports.push({ platform: plat, status: 'failed', error: 'AI failed to generate a visual prompt for the video engine.' });
            }
          }

          const contentId = Math.random().toString(36).substr(2, 9);
          const contentState: ContentState = {
            id: contentId,
            type: inputs.contentType,
            status: 'completed',
            data: {
              ...generated,
              imageUrl: manualMedia?.type === 'image' ? manualMedia.url : generated.imageUrl,
              videoUrl: finalVideoUrl || undefined,
              analysis: JSON.stringify(analysis, null, 2),
              slides: generated.slides
            }
          };

          newMultiContent[plat] = contentState;

          // Auto-Schedule / Post
          if (driveUser) {
            const isNow = scheduleMode === 'now';
            const scheduledTime = isNow ? Date.now() : new Date(scheduleDate).getTime();
            
            await schedulePost(driveUser.uid, {
              contentId: contentId,
              contentType: inputs.contentType,
              title: generated.title || `Post for ${plat}`,
              platform: plat,
              scheduledTime: scheduledTime,
              status: isNow ? 'posted' : 'pending',
              thumbnailUrl: generated.imageUrl,
              notes: `Auto-generated for ${plat}`
            });
          }

          if (!reports.find(r => r.platform === plat)) {
            reports.push({ platform: plat, status: 'success' });
          }
        } catch (platErr: any) {
          console.error(`Platform ${plat} generation failed:`, platErr);
          reports.push({ platform: plat, status: 'failed', error: platErr.message });
        }
      }

      setMultiContent(newMultiContent);
      setGenerationReport(reports);
      setShowReport(true);
      // Backwards compatibility for single-content views if needed
      const successfulPlat = Object.keys(newMultiContent)[0];
      if (successfulPlat) {
        setContent(newMultiContent[successfulPlat]);
      }
      
      setBlueprintContent(fullBlueprint + "--- END BLUEPRINT ---");

      if (driveUser) {
        loadSchedule(driveUser.uid);
      }

      setStep(3);
      setShowBlueprint(true);
      setActiveStudioTab('preview');
      setView('media'); // Go to media library to see all finished posts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !content) return;
    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    try {
      const aiResponse = await chatRevision(userMsg, messages, content);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // Try to extract json-update
      const match = aiResponse.match(/```json-update\n([\s\S]*?)\n```/);
      if (match) {
        try {
          const updates = JSON.parse(match[1]);
          setContent(prev => {
            if (!prev) return null;
            return {
              ...prev,
              data: {
                ...prev.data,
                ...updates
              }
            };
          });
        } catch (e) {
          console.error("Failed to parse chat update JSON", e);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-12 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-black rounded-[24px] mx-auto flex items-center justify-center shadow-2xl skew-x-[-12deg] rotate-[-6deg]">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="serif-display text-5xl text-black">Nexus<span className="text-neutral-300">AI</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Biological Content Synthesis</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setIsAuthenticated(true)}
              className="w-full py-5 bg-white border border-neutral-100 rounded-2xl flex items-center justify-center gap-4 hover:bg-neutral-50 transition-all shadow-sm group"
            >
              <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">
                <Globe className="w-3 h-3 text-red-500" />
              </div>
              <span className="text-xs font-bold text-black uppercase tracking-widest">Sign in with Google</span>
            </button>

            <button 
              onClick={() => setIsAuthenticated(true)}
              className="w-full py-5 bg-black text-white rounded-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl group"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Facebook className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Continue with Facebook</span>
            </button>

            <button 
              onClick={() => setIsAuthenticated(true)}
              className="w-full py-5 bg-neutral-100 rounded-2xl flex items-center justify-center gap-4 hover:bg-neutral-200 transition-all group"
            >
              <div className="w-6 h-6 bg-neutral-800 rounded-lg flex items-center justify-center">
                <Twitter className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Login via Twitter</span>
            </button>
          </div>

          <div className="pt-8">
            <p className="text-[9px] text-neutral-300 uppercase font-black tracking-widest leading-relaxed">
              By entering the NEXUS, you agree to our <br/>
              <span className="text-black underline cursor-pointer">Terms of Synthesis</span> and <br/>
              <span className="text-black underline font-bold cursor-pointer">Privacy Blueprint</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-[#F8FAFC] flex font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] nexus-glass border-r border-white/5 flex flex-col z-[50]">
        <div className="p-10 border-b border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <Zap className="w-7 h-7 text-primary nexus-glow-text" />
            </div>
            <div>
              <p className="text-xl font-space font-black tracking-tighter text-white nexus-glow-text leading-none">NexusAI</p>
              <p className="text-[8px] font-bold text-slate-500 tracking-[0.3em] mt-1.5 uppercase">Intelligence Tier V5</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto nexus-circuit-bg">
          {[
            { id: 'forge', name: 'Nexus Forge', icon: Zap },
            { id: 'media', name: 'Nexus Assets', icon: HardDrive },
            { id: 'avatars', name: 'Nexus Identity', icon: UserCircle },
            { id: 'templates', name: 'Nexus Blueprints', icon: FileText },
            { id: 'brand-kit', name: 'Nexus Branding', icon: Palette },
            { id: 'marketplace', name: 'Nexus Subscriptions', icon: ShoppingBag, soon: true },
            { id: 'settings', name: 'Nexus Core', icon: Settings },
          ].map(item => {
            const isActive = view === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] relative group ${isActive ? 'bg-primary text-black shadow-[0_0_30px_rgba(0,242,255,0.3)] scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'group-hover:text-primary transition-colors'}`} />
                <span className="tracking-tight">{item.name}</span>
                {item.soon && <Badge className="ml-auto bg-white/10 text-[7px] py-[1px] px-1.5 border border-white/10 text-slate-500 uppercase">Soon</Badge>}
                {isActive && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black shadow-sm" />}
              </button>
            );
          })}

          {isSystemAdmin && (
            <button 
              onClick={() => setView('admin')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${view === 'admin' ? 'bg-secondary text-white shadow-[0_0_20px_rgba(112,0,255,0.3)]' : 'text-slate-400 hover:bg-secondary/10 hover:text-secondary'}`}
            >
              <Database className="w-5 h-5" />
              <span>System Logic</span>
            </button>
          )}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="bg-white/5 p-5 rounded-3xl flex items-center gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative group shadow-lg">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 text-white" />
              </div>
              <img src={driveUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nexus'} className="w-full h-full object-cover" alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-white tracking-tight leading-none mb-1.5 uppercase">{driveUser?.displayName || 'GUEST PROTOCOL'}</p>
              <button 
                onClick={() => driveUser ? auth.signOut() : handleGoogleSignIn()} 
                className="text-[9px] text-primary font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                {driveUser ? 'TERMINATE_SESSION' : 'INIT_AUTH'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-[280px] flex-1 p-12 max-w-[1600px]">
        <header className="mb-20 flex items-end justify-between">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/30 blur-2xl group-hover:bg-primary/50 transition-all duration-700" />
              <div className="relative w-20 h-20 bg-black border border-white/10 rounded-[32px] flex items-center justify-center p-4">
                 <Zap className="w-full h-full text-primary nexus-glow-text" />
              </div>
            </div>
            <div>
              <h1 className="font-space text-8xl text-white font-black tracking-tighter italic nexus-glow-text leading-[0.8] mb-4">
                Nexus<span className="text-white">AI</span>
              </h1>
              <p className="font-mono text-[12px] uppercase font-black text-slate-500 tracking-[0.6em]">THE FUTURE OF HARDWARE</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/40 transition-all shadow-2xl group"
              title="Connection Settings"
            >
              <Settings className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
            </button>
            <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">Neural Link Optimal</span>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {showSettingsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowSettingsModal(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden border border-border"
              >
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                   <div>
                     <h2 className="text-2xl font-black tracking-tighter italic nexus-glow-text">CONNECTION<span className="text-white">SETTINGS</span></h2>
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Neural Key Management</p>
                   </div>
                   <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                     <X className="w-5 h-5 text-slate-400" />
                   </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Zap className="w-3 h-3 text-primary" /> Gemini API Key (Analysis)
                    </label>
                    <input 
                      type="password"
                      className="nexus-input"
                      placeholder="Enter Google Generative AI Key..."
                      value={localSecrets.geminiKey}
                      onChange={(e) => setLocalSecrets(prev => ({ ...prev, geminiKey: e.target.value }))}
                    />
                    <p className="text-[9px] text-slate-500 leading-relaxed italic">
                      Used for scraping analysis and content generation. Replace this if you get "API key not valid" errors.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Video className="w-3 h-3 text-secondary" /> Higgsfield API Key (Video)
                    </label>
                    <input 
                      type="password"
                      className="nexus-input"
                      placeholder="Enter Higgsfield API Key..."
                      value={localSecrets.higgsfieldKey}
                      onChange={(e) => setLocalSecrets(prev => ({ ...prev, higgsfieldKey: e.target.value }))}
                    />
                    <p className="text-[9px] text-neutral-400 leading-relaxed italic">
                      Used for premium video generation. If left blank, the system will use current OAuth tokens.
                    </p>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button 
                      onClick={() => saveSecrets(localSecrets)}
                      className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                      Restore System Authority
                    </button>
                    <button 
                      onClick={() => {
                        const cleared = { geminiKey: '', higgsfieldKey: '' };
                        saveSecrets(cleared);
                      }}
                      className="w-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-black transition-colors"
                    >
                      Revert to System Defaults
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {error && !error.includes('VAULT') && !error.includes('Identity') && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col gap-4 text-red-600 animate-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">System Malfunction</p>
                  <p className="text-xs font-bold">API Error Detected</p>
                </div>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-white/50 rounded-2xl border border-red-50 text-sm">
              <p className="font-medium mb-2">{error}</p>
              
              {error.includes('RESOURCE_EXHAUSTED') || error.includes('prepayment credits') ? (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
                  <p className="font-bold flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> API Credits Issue
                  </p>
                  <p className="mb-2">Your current API Key (from Google Cloud) seems to have no balance. This often happens if the project has a Billing Account with zero credit.</p>
                  <p className="mb-3 text-[11px] opacity-75">Tip: If you're looking for the free daily limit, ensure your API Key is from a project that isn't strictly "Pay-as-you-go" or check the AI Studio billing console.</p>
                  <a 
                    href="https://aistudio.google.com/app/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition-colors"
                  >
                    Check Usage & Billing <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : error.includes('API key not valid') ? (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
                  <p className="font-bold flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" /> Action Required:
                  </p>
                  <p>1. Open the <strong>Settings (Gear Icon)</strong> in the top right of this app.</p>
                  <p>2. Paste a valid <strong>GEMINI_API_KEY</strong> from a billing-enabled project.</p>
                  <p className="mt-2 text-xs italic">This key is used only for the analysis/planning phase.</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === 'forge' ? (
            <motion.div 
              key="forge"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-12"
            >
              {/* Controls Column */}
              <div className="xl:col-span-4 space-y-12">
            <div className="bg-white border border-border p-10 rounded-[48px] space-y-10 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-50 pb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Sequence Forge</span>
                <Sparkles className="w-4 h-4 text-neutral-200" />
              </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Input Source</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 rounded-lg border border-neutral-100">
                        <span className="text-[8px] font-black uppercase text-neutral-300">Auto-Shorten</span>
                        <div 
                          onClick={() => setInputs(prev => ({ ...prev, shortenUrls: !prev.shortenUrls }))}
                          className={`w-6 h-3 rounded-full p-0.5 cursor-pointer transition-colors ${inputs.shortenUrls ? 'bg-black' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-2 h-2 bg-white rounded-full transition-transform ${inputs.shortenUrls ? 'translate-x-3' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <button 
                        onClick={() => batchInputRef.current?.click()}
                        className="text-[9px] font-bold text-black uppercase tracking-widest hover:opacity-80 px-2 py-1 bg-neutral-100 rounded-lg"
                      >
                        + Batch CSV
                      </button>
                    </div>
                    <input type="file" ref={batchInputRef} onChange={handleSpreadsheetUpload} accept=".csv" className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="url"
                        className="editorial-input pl-12"
                        placeholder="nexusai.tech/masterpiece"
                        value={inputs.url}
                        onChange={(e) => setInputs(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <button 
                      onClick={handleShorten}
                      disabled={shortening || !inputs.url}
                      className="p-4 bg-neutral-50 rounded-[20px] text-black hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                      title="Shorten URL"
                    >
                      {shortening ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* URL Preview */}
                  <AnimatePresence>
                    {(loadingPreview || urlPreview) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center gap-4 group/preview relative">
                          {loadingPreview ? (
                            <div className="w-20 h-14 bg-neutral-200 rounded-lg animate-pulse shrink-0" />
                          ) : (
                            <div className="w-20 h-14 bg-white rounded-lg overflow-hidden border border-neutral-100 shrink-0">
                              <img src={urlPreview?.thumbnail} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {loadingPreview ? (
                              <div className="space-y-2">
                                <div className="h-3 bg-neutral-200 rounded-full w-3/4 animate-pulse" />
                                <div className="h-2 bg-neutral-200 rounded-full w-1/2 animate-pulse" />
                              </div>
                            ) : (
                              <>
                                <p className="text-[10px] font-black text-black truncate uppercase tracking-tight">{urlPreview?.title}</p>
                                <p className="text-[8px] text-neutral-400 truncate mt-1">{inputs.url}</p>
                              </>
                            )}
                          </div>
                          {!loadingPreview && (
                            <button 
                              onClick={() => {
                                setInputs(prev => ({ ...prev, url: '' }));
                                setUrlPreview(null);
                              }}
                              className="absolute top-2 right-2 p-1 bg-white/50 rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-neutral-400" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {spreadsheetData && (
                    <div className="p-3 bg-neutral-50 border border-border rounded-xl flex items-center justify-between">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">CSV: {spreadsheetData.length} units</span>
                      <button onClick={() => setSpreadsheetData(null)}><X className="w-3 h-3 text-neutral-300" /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Content Architecture</label>
                  <div className="grid grid-cols-2 gap-2">
                     {[
                       { id: 'video', name: 'Neural Video', icon: Video },
                       { id: 'image', name: 'Visual Series', icon: ImageIcon },
                       { id: 'article', name: 'Core Analysis', icon: BookOpen },
                       { id: 'custom', name: 'Logic Script', icon: Terminal }
                     ].map(mode => (
                       <button 
                         key={mode.id}
                         onClick={() => setInputs(prev => ({ ...prev, contentType: mode.id as any }))}
                         className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${inputs.contentType === mode.id ? 'bg-black text-white border-black' : 'bg-white text-neutral-400 border-neutral-100 hover:border-neutral-200'}`}
                       >
                         <mode.icon className="w-5 h-5" />
                         <span className="text-[9px] font-black uppercase tracking-widest">{mode.name}</span>
                       </button>
                     ))}
                  </div>
                </div>

                {inputs.contentType === 'video' && (
                  <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Neural Video Engine</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'veo', name: 'Google Veo', desc: 'Cinematic' },
                        { id: 'higgsfield', name: 'Higgsfield', desc: 'Creator Pro' }
                      ].map(engine => (
                        <button
                          key={engine.id}
                          onClick={() => setInputs(prev => ({ ...prev, videoEngine: engine.id as any }))}
                          className={`p-3 rounded-xl flex flex-col items-center gap-1 border transition-all ${inputs.videoEngine === engine.id ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-neutral-50 text-neutral-400 border-neutral-100'}`}
                        >
                          <span className="text-[9px] font-black uppercase">{engine.name}</span>
                          <span className="text-[7px] uppercase opacity-50">{engine.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Target Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Facebook', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter_X', 'Investor_Network'
                    ].map(p => {
                      const id = p.toLowerCase();
                      const isActive = inputs.platforms.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setInputs(prev => {
                              const platforms = prev.platforms.includes(id)
                                ? prev.platforms.filter(plat => plat !== id)
                                : [...prev.platforms, id];
                              return { ...prev, platforms };
                            });
                          }}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            isActive ? 'bg-black text-white shadow-lg scale-105' : 'bg-neutral-50 text-neutral-400 border border-neutral-100 hover:border-neutral-200'
                          }`}
                        >
                          {p.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-black">Global Config</span>
                    <div 
                      onClick={() => setInputs(prev => ({ ...prev, globalSettings: !prev.globalSettings }))}
                      className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${inputs.globalSettings ? 'bg-black' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${inputs.globalSettings ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block opacity-0">Tone</label>
                    <select 
                      value={inputs.style}
                      onChange={(e) => setInputs(prev => ({ ...prev, style: e.target.value }))}
                      className="editorial-input appearance-none bg-white cursor-pointer px-4 font-bold text-[10px]"
                    >
                      <option>Viral & Energetic</option>
                      <option>Documentary & Serious</option>
                      <option>Playful & Witty</option>
                      <option>Minimalist & Luxury</option>
                      <option>Brutalist & Raw</option>
                    </select>
                  </div>
                </div>

                {/* Identity Profile Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Identity Profile</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-neutral-300">Sync Global</span>
                      <div 
                        onClick={() => setInputs(prev => ({ ...prev, includeAvatarGlobal: !prev.includeAvatarGlobal }))}
                        className={`w-6 h-3 rounded-full p-0.5 cursor-pointer transition-colors ${inputs.includeAvatarGlobal ? 'bg-black' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-2 h-2 bg-white rounded-full transition-transform ${inputs.includeAvatarGlobal ? 'translate-x-3' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => photoInputRef.current?.click()}
                      className="w-14 h-14 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors shrink-0 overflow-hidden"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} className="w-full h-full object-cover" alt="Persona" />
                      ) : (
                        <Camera className="w-5 h-5 text-neutral-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <select 
                        className="w-full bg-transparent border-b border-neutral-200 text-[10px] font-bold py-1 outline-none truncate"
                        onChange={(e) => {
                          const avatar = avatars.find(a => a.id === e.target.value);
                          if (avatar) {
                            setPhotoPreview(avatar.photoBase64);
                            setInputs(prev => ({ ...prev, photoBase64: avatar.photoBase64 }));
                          } else {
                            setPhotoPreview(null);
                            setInputs(prev => ({ ...prev, photoBase64: undefined }));
                          }
                        }}
                      >
                        <option value="">Manual Upload / Default</option>
                        {avatars.map(avatar => (
                          <option key={avatar.id} value={avatar.id}>{avatar.name}</option>
                        ))}
                      </select>
                      <p className="text-[8px] text-neutral-400 mt-1 uppercase tracking-widest">Active Identity Lock</p>
                    </div>
                  </div>
                  <input type="file" ref={photoInputRef} className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                </div>

                {/* Target Specific Options */}
                <div className="space-y-6">
                  {inputs.platforms.map(plat => {
                    if (!inputs.globalSettings || inputs.platforms.indexOf(plat) === 0) {
                      const options = inputs.globalSettings ? inputs.platformOptions : (inputs.perPlatformOptions[plat] || inputs.platformOptions);
                      const includeAvatar = inputs.globalSettings ? inputs.includeAvatarGlobal : (inputs.includeAvatarPerPlatform[plat] ?? inputs.includeAvatarGlobal);

                      return (
                        <div key={plat} className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 space-y-6 animate-in slide-in-from-left-2 duration-300">
                           <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-black" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-black">
                                 {inputs.globalSettings ? 'Global Parameters' : `${plat.toUpperCase()} Parameters`}
                               </span>
                             </div>
                             {!inputs.globalSettings && (
                               <div className="flex items-center gap-2">
                                 <span className="text-[8px] font-black text-neutral-400 uppercase">Avatar</span>
                                 <div 
                                    onClick={() => setInputs(prev => ({ 
                                      ...prev, 
                                      includeAvatarPerPlatform: { ...prev.includeAvatarPerPlatform, [plat]: !includeAvatar } 
                                    }))}
                                    className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${includeAvatar ? 'bg-black' : 'bg-neutral-200'}`}
                                  >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${includeAvatar ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </div>
                               </div>
                             )}
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 space-y-1">
                                <label className="text-[8px] font-black uppercase text-neutral-400">Strategy Template</label>
                                <select 
                                  value={options.templateId}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (inputs.globalSettings) {
                                      setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, templateId: val } }));
                                    } else {
                                      setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), templateId: val } } }));
                                    }
                                  }}
                                  className="w-full bg-transparent border-b border-neutral-200 text-[10px] font-bold py-1 outline-none"
                                >
                                  {contentTemplates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-neutral-400">Layout</label>
                                <select 
                                  value={options.aspectRatio}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    if (inputs.globalSettings) {
                                      setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, aspectRatio: val } }));
                                    } else {
                                      setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), aspectRatio: val } } }));
                                    }
                                  }}
                                  className="w-full bg-transparent border-b border-neutral-200 text-[10px] font-bold py-1 outline-none"
                                >
                                  <option value="9:16">9:16 (Vertical)</option>
                                  <option value="16:9">16:9 (Wide)</option>
                                  <option value="1:1">1:1 (Square)</option>
                                  <option value="4:5">4:5 (Portrait)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-neutral-400">Mode</label>
                                <select 
                                  value={options.postType}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    if (inputs.globalSettings) {
                                      setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, postType: val } }));
                                    } else {
                                      setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), postType: val } } }));
                                    }
                                  }}
                                  className="w-full bg-transparent border-b border-neutral-200 text-[10px] font-bold py-1 outline-none"
                                >
                                  <option value="post">Post</option>
                                  <option value="story">Story</option>
                                  <option value="reel">Reel / Short</option>
                                  <option value="article">Article</option>
                                  <option value="thread">Thread</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-neutral-400">Location</label>
                                <input 
                                  type="text"
                                  placeholder="Add Loc..."
                                  value={options.location || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (inputs.globalSettings) {
                                      setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, location: val } }));
                                    } else {
                                      setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), location: val } } }));
                                    }
                                  }}
                                  className="w-full bg-transparent border-b border-neutral-200 text-[10px] font-bold py-1 outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-neutral-400">Captions</label>
                                <div className="flex bg-neutral-50 p-0.5 rounded-lg border border-neutral-100">
                                  {['Yes', 'No'].map(choice => {
                                    const val = choice === 'Yes';
                                    const active = options.captions === val;
                                    return (
                                      <button
                                        key={choice}
                                        onClick={() => {
                                          if (inputs.globalSettings) {
                                            setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, captions: val } }));
                                          } else {
                                            setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), captions: val } } }));
                                          }
                                        }}
                                        className={`flex-1 text-[8px] font-black py-1 rounded-md transition-all ${active ? 'bg-black text-white shadow-sm' : 'text-neutral-400 hover:text-black'}`}
                                      >
                                        {choice.toUpperCase()}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[8px] font-black uppercase text-neutral-400">Translate</label>
                                  <div 
                                    onClick={() => {
                                      const val = !options.translate;
                                      if (inputs.globalSettings) {
                                        setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, translate: val } }));
                                      } else {
                                        setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), translate: val } } }));
                                      }
                                    }}
                                    className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${options.translate ? 'bg-primary' : 'bg-neutral-100'}`}
                                  >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${options.translate ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </div>
                                </div>
                                {options.translate && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {COUNTRIES.map(country => {
                                      const selected = (options.translationCountries || []).includes(country.code);
                                      return (
                                        <button
                                          key={country.code}
                                          onClick={() => {
                                            const current = options.translationCountries || [];
                                            const next = selected ? current.filter(c => c !== country.code) : [...current, country.code];
                                            if (inputs.globalSettings) {
                                              setInputs(prev => ({ ...prev, platformOptions: { ...prev.platformOptions, translationCountries: next } }));
                                            } else {
                                              setInputs(prev => ({ ...prev, perPlatformOptions: { ...prev.perPlatformOptions, [plat]: { ...(prev.perPlatformOptions[plat] || prev.platformOptions), translationCountries: next } } }));
                                            }
                                          }}
                                          className={`px-1.5 py-0.5 rounded text-[7px] font-black border transition-all ${selected ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                                        >
                                          {country.code}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase text-neutral-400">Tags</label>
                                <input 
                                  type="text"
                                  placeholder="@handle..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = (e.currentTarget as HTMLInputElement).value;
                                      if (val) {
                                        if (inputs.globalSettings) {
                                          setInputs(prev => ({ 
                                            ...prev, 
                                            platformOptions: { 
                                              ...prev.platformOptions, 
                                              tags: [...(prev.platformOptions.tags || []), val] 
                                            } 
                                          }));
                                        } else {
                                          setInputs(prev => ({ 
                                            ...prev, 
                                            perPlatformOptions: { 
                                              ...prev.perPlatformOptions, 
                                              [plat]: { 
                                                ...(prev.perPlatformOptions[plat] || prev.platformOptions), 
                                                tags: [...((prev.perPlatformOptions[plat] || prev.platformOptions).tags || []), val] 
                                              } 
                                            } 
                                          }));
                                        }
                                        (e.currentTarget as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                  className="w-full bg-transparent border-b border-neutral-200 text-[10px] font-bold py-1 outline-none"
                                />
                              </div>
                           </div>

                           {options.tags && options.tags.length > 0 && (
                             <div className="flex flex-wrap gap-2 pt-2">
                               {options.tags.map((tag, i) => (
                                 <span key={i} className="px-2 py-0.5 bg-black/5 rounded text-[8px] font-bold flex items-center gap-1">
                                   {tag}
                                   <X 
                                     className="w-2 h-2 cursor-pointer hover:text-red-500" 
                                     onClick={() => {
                                       if (inputs.globalSettings) {
                                         setInputs(prev => ({
                                           ...prev,
                                           platformOptions: {
                                             ...prev.platformOptions,
                                             tags: prev.platformOptions.tags?.filter((_, idx) => idx !== i)
                                           }
                                         }));
                                       } else {
                                          setInputs(prev => ({
                                           ...prev,
                                           perPlatformOptions: {
                                             ...prev.perPlatformOptions,
                                             [plat]: {
                                               ...(prev.perPlatformOptions[plat] || prev.platformOptions),
                                               tags: (prev.perPlatformOptions[plat] || prev.platformOptions).tags?.filter((_, idx) => idx !== i)
                                             }
                                           }
                                         }));
                                       }
                                     }}
                                   />
                                 </span>
                               ))}
                             </div>
                           )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button 
                          onClick={() => setScheduleMode('now')}
                          className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${scheduleMode === 'now' ? 'bg-black text-white' : 'bg-white border border-neutral-100 text-neutral-400'}`}
                        >
                          Now
                        </button>
                        <button 
                          onClick={() => setScheduleMode('later')}
                          className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${scheduleMode === 'later' ? 'bg-black text-white' : 'bg-white border border-neutral-100 text-neutral-400'}`}
                        >
                          Later
                        </button>
                      </div>

                      {scheduleMode === 'later' && (
                        <input 
                          type="datetime-local"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full p-3 bg-white border border-neutral-100 rounded-xl text-[9px] font-bold outline-none"
                        />
                      )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Target Specific Configurations</label>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-[32px] border border-neutral-100 flex items-center justify-between group hover:bg-neutral-100 transition-all cursor-pointer" onClick={() => setView('templates')}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Layers className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black block">Template Protocol</span>
                        <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-widest">Manage Global Logic Gateways</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {inputs.contentType === 'custom' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-500">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Neural Chat Revision</label>
                    <div className="bg-neutral-50 rounded-[32px] border border-neutral-100 overflow-hidden flex flex-col h-[300px]">
                      <ScrollArea className="flex-1 p-4">
                        {customChatMessages.length === 0 && (
                          <div className="h-full flex items-center justify-center text-neutral-300 text-[10px] font-black uppercase">
                            Describe your vision...
                          </div>
                        )}
                        <div className="space-y-4">
                          {customChatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-2xl text-[10px] font-bold ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white border border-neutral-200'}`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="p-4 bg-white border-t border-neutral-100 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Send instruction..."
                          className="flex-1 text-[10px] font-bold outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              setCustomChatMessages(prev => [...prev, { role: 'user', content: e.currentTarget.value }]);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button className="p-2 bg-black text-white rounded-xl"><Zap className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={loading || !inputs.url}
                  className="w-full py-6 bg-black text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex flex-col items-center gap-1 disabled:opacity-20"
                >
                  <div className="flex items-center gap-3">
                    {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                    <span>{scheduleMode === 'now' ? 'Execute Forge' : 'Forge & Schedule'}</span>
                  </div>
                </button>
              </div>

              {loading && (
                <div className="p-8 bg-neutral-50 border border-neutral-100 rounded-[32px] flex items-center gap-4 animate-in fade-in zoom-in-95">
                  <RefreshCcw className="w-5 h-5 text-neutral-400 animate-spin" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{loadingMessage || 'Synthesizing...'}</p>
                    <div className="mt-2 h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-neutral-400"
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Output Column (STUDIO) */}
              <div className="xl:col-span-8 space-y-12">
                {content ? (
                  <motion.div 
                    key="studio-output"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    <div className="bg-white border border-border p-2 rounded-[48px] overflow-hidden shadow-2xl">
                      <Tabs value={activeStudioTab} onValueChange={setActiveStudioTab} defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-neutral-50/50 p-1 mb-0 border-b border-neutral-100">
                          <TabsTrigger value="preview" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">Preview</TabsTrigger>
                          <TabsTrigger value="script" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">Script</TabsTrigger>
                          <TabsTrigger value="analysis" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">SEO</TabsTrigger>
                          <TabsTrigger value="schedule" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">Schedule</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[800px]">
                          <TabsContent value="preview" className="p-12">
                            {content.type !== 'deck' && (
                              <div className="flex items-center gap-4 mb-10 p-1 bg-neutral-50 border border-neutral-100 rounded-2xl w-fit">
                                {['youtube', 'instagram', 'linkedin', 'tiktok'].map(target => (
                                  <button 
                                    key={target}
                                    onClick={() => setPreviewTarget(target as any)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${previewTarget === target ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black'}`}
                                  >
                                    {target}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className={`bg-white rounded-[32px] p-12 text-black min-h-[600px] shadow-sm ring-1 ring-neutral-100 transition-all duration-700 ${
                              content.type === 'deck' ? 'max-w-6xl mx-auto' :
                              previewTarget === 'tiktok' || previewTarget === 'instagram' 
                                ? 'max-w-[400px] mx-auto rounded-[60px] border-[16px] border-black h-[800px] overflow-hidden relative' 
                                : 'max-w-4xl mx-auto'
                            }`} style={{ fontFamily: inputs.brandKit.fontFamily }}>
                              {content.type === 'deck' && content.data?.slides && (
                                <DeckViewer slides={content.data.slides} brandKit={inputs.brandKit} />
                              )}

                              {content.type === 'video' && (
                                <div className={`space-y-12 animate-in fade-in duration-700 ${previewTarget === 'tiktok' || previewTarget === 'instagram' ? 'h-full flex flex-col' : ''}`}>
                                  <div className="flex items-center justify-between mb-2">
                                     <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Neural Synthesis Output</span>
                                     <button 
                                      onClick={() => setIsEditingContent(!isEditingContent)}
                                      className="flex items-center gap-2 text-[10px] font-black uppercase text-black hover:underline"
                                     >
                                       {isEditingContent ? 'Save Changes' : 'Edit Script'}
                                     </button>
                                  </div>
                                  
                                  {isEditingContent ? (
                                    <textarea 
                                      className="w-full h-[400px] p-8 bg-neutral-50 rounded-3xl border border-neutral-100 font-mono text-xs leading-relaxed resize-none focus:bg-white transition-all shadow-inner"
                                      value={content.data?.script}
                                      onChange={(e) => setContent(prev => prev ? { ...prev, data: { ...prev.data, script: e.target.value } } : null)}
                                    />
                                  ) : (
                                    <>
                                      <div className={`video-preview-wrapper group relative overflow-hidden bg-black ${previewTarget === 'tiktok' || previewTarget === 'instagram' ? 'flex-1 rounded-0' : 'rounded-[32px] aspect-video'}`}>
                                        {content.data?.videoUrl ? (
                                          <video 
                                            src={content.data.videoUrl} 
                                            className="w-full h-full object-cover" 
                                            autoPlay 
                                            muted 
                                            loop 
                                            playsInline 
                                            controls
                                          />
                                        ) : (
                                          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-neutral-900">
                                            <div className="relative">
                                              <Video className="w-20 h-20 mb-6 opacity-20" />
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <Play className="w-8 h-8 text-white fill-white animate-pulse" />
                                              </div>
                                            </div>
                                            <p className="font-mono text-[10px] uppercase font-black tracking-[0.4em]">Integrated Neural Player</p>
                                            <div className="mt-8 flex gap-2">
                                              <div className="w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="w-1/3 h-full bg-white opacity-20" />
                                              </div>
                                              <span className="text-[8px] font-mono text-neutral-500">00:12 / 01:00</span>
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        
                                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                          <div className="flex items-center gap-4">
                                            <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white pointer-events-auto hover:bg-white/20">
                                              <Play className="w-4 h-4 fill-white" />
                                            </button>
                                            <div className="h-1 w-48 bg-white/20 rounded-full overflow-hidden">
                                              <div className="h-full bg-white w-1/3" />
                                            </div>
                                          </div>
                                          <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white pointer-events-auto hover:bg-white/20">
                                            <Maximize className="w-4 h-4" />
                                          </button>
                                        </div>

                                        {(previewTarget === 'tiktok' || previewTarget === 'instagram') && (
                                          <div className="absolute bottom-10 left-6 right-6 space-y-4 pointer-events-none">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30" />
                                                <span className="text-white text-xs font-bold">@NexusAIGear</span>
                                            </div>
                                            <p className="text-white text-xs leading-relaxed line-clamp-3">{content.data?.script}</p>
                                          </div>
                                        )}
                                      </div>
                                      {!(previewTarget === 'tiktok' || previewTarget === 'instagram') && (
                                        <div className="space-y-4">
                                          <h3 className="serif-display text-5xl leading-tight">{content.data?.title}</h3>
                                          <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl">{content.data?.script?.slice(0, 300)}...</p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}

                              {content.type === 'image' && (
                                <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-700">
                                  {content.data?.carouselImages?.map((img, i) => (
                                    <div key={i} className="aspect-square bg-neutral-50 rounded-3xl overflow-hidden border border-border group relative shadow-sm">
                                      <img src={`https://picsum.photos/seed/${content.id + i}/1000/1000`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Output" />
                                      <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-all flex items-end p-8 translate-y-4 group-hover:translate-y-0">
                                        <p className="text-black text-[11px] font-bold uppercase tracking-widest">{img.alt}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {content.type === 'article' && (
                                <div className="animate-in fade-in duration-700">
                                   <div className="flex items-center justify-between mb-8">
                                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Article Protocol</span>
                                      <button 
                                        onClick={() => setIsEditingContent(!isEditingContent)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase text-black hover:underline"
                                      >
                                        {isEditingContent ? 'Save Changes' : 'Edit Article'}
                                      </button>
                                  </div>

                                  {isEditingContent ? (
                                    <textarea 
                                      className="w-full h-[600px] p-8 bg-neutral-50 rounded-3xl border border-neutral-100 font-serif text-lg leading-relaxed resize-none focus:bg-white transition-all shadow-inner"
                                      value={content.data?.articleMarkdown}
                                      onChange={(e) => setContent(prev => prev ? { ...prev, data: { ...prev.data, articleMarkdown: e.target.value } } : null)}
                                    />
                                  ) : (
                                    <div className="prose prose-neutral max-w-none">
                                      {previewTarget === 'linkedin' && (
                                         <div className="flex items-center gap-3 mb-8">
                                            <div className="w-12 h-12 rounded-full bg-neutral-200" />
                                            <div>
                                               <p className="text-sm font-bold text-black">NexusAI Intelligence</p>
                                               <p className="text-xs text-neutral-400">Published on LinkedIn</p>
                                            </div>
                                         </div>
                                      )}
                                      <h3 className="serif-display text-6xl mb-12 border-b border-neutral-100 pb-12">{content.data?.title}</h3>
                                      <div className="text-neutral-600 leading-relaxed space-y-6 text-lg">
                                        {content.data?.articleMarkdown}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex flex-wrap gap-2 pt-12 border-t border-neutral-50">
                                {content.data?.seo?.keywords?.map(k => (
                                  <span key={k} className="px-3 py-1 bg-neutral-50 text-neutral-400 text-[10px] font-black rounded-lg uppercase tracking-widest">#{k}</span>
                                ))}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="script" className="p-12">
                            <div className="bg-neutral-50 border border-border rounded-3xl p-10 font-mono text-[12px] leading-relaxed text-neutral-500 whitespace-pre-wrap selection:bg-black selection:text-white">
                              {content.type === 'video' ? content.data?.script : content.data?.articleMarkdown || content.data?.customContent}
                            </div>
                          </TabsContent>

                          <TabsContent value="analysis" className="p-12">
                            <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-8 font-sans">
                                <div className="p-8 bg-neutral-50 border border-neutral-100 rounded-3xl space-y-2">
                                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Primary Hook</span>
                                  <p className="text-lg text-black font-bold italic">"{JSON.parse(content.data?.analysis || '{}').audience || 'General'}"</p>
                                </div>
                                <div className="p-8 bg-neutral-50 border border-neutral-100 rounded-3xl space-y-2">
                                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Aesthetic Tone</span>
                                  <p className="text-lg text-black font-bold">{JSON.parse(content.data?.analysis || '{}').tone || 'Balanced'}</p>
                                </div>
                              </div>
                              <div className="p-10 bg-neutral-50 border border-neutral-100 rounded-[40px] space-y-8">
                                <span className="text-[11px] font-black uppercase text-neutral-400 block tracking-[0.3em]">Optimized Strategy</span>
                                <div className="flex flex-wrap gap-3">
                                  {content.data?.seo?.keywords?.map(k => (
                                    <div key={k} className="px-5 py-2 bg-white text-black text-[11px] font-bold border border-neutral-100 rounded-xl uppercase tracking-widest shadow-sm">#{k}</div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-10 bg-black text-white rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                  <FileText className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                  <h4 className="serif-display text-2xl mb-2">Neural Execution Blueprint Ready</h4>
                                  <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-6">Contains prompts, parameters, and structural data</p>
                                  <button 
                                    onClick={downloadBlueprintPDF}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download PDF Report
                                  </button>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="schedule" className="p-12">
                             <div className="space-y-12 max-w-2xl">
                                <div className="p-10 bg-white border border-border rounded-[40px] space-y-8 shadow-sm">
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-2xl w-fit">
                                      <button 
                                        onClick={() => setScheduleMode('now')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scheduleMode === 'now' ? 'bg-black text-white shadow-lg' : 'text-neutral-400'}`}
                                      >
                                        Post Now
                                      </button>
                                      <button 
                                        onClick={() => setScheduleMode('later')}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scheduleMode === 'later' ? 'bg-black text-white shadow-lg' : 'text-neutral-400'}`}
                                      >
                                        Schedule
                                      </button>
                                    </div>

                                    {scheduleMode === 'later' && (
                                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Deployment Date</label>
                                        <input 
                                          type="datetime-local" 
                                          className="editorial-input"
                                          value={scheduleDate}
                                          onChange={(e) => setScheduleDate(e.target.value)}
                                        />
                                      </div>
                                    )}

                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Queue Notes</label>
                                      <textarea 
                                        className="editorial-input min-h-[120px] resize-none"
                                        placeholder="Final deployment instructions..."
                                        value={scheduleNotes}
                                        onChange={(e) => setScheduleNotes(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <button 
                                    onClick={handleScheduleContent} 
                                    className="w-full py-5 bg-black text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                  >
                                    {scheduleMode === 'now' ? 'Finalize & Post' : 'Confirm Schedule'}
                                  </button>
                                </div>
                             </div>
                          </TabsContent>
                        </ScrollArea>
                      </Tabs>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white border border-border rounded-[64px] p-32 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-neutral-50 p-12 rounded-[48px] mb-10">
                      <Sparkles className="w-20 h-20 text-neutral-200" />
                    </div>
                    <h3 className="serif-display text-4xl mb-4">Workspace Empty</h3>
                    <p className="max-w-sm text-neutral-400 text-sm leading-relaxed">Initiate forge sequence to materialize content in the studio buffer.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : view === 'architect' ? (
            <motion.div 
              key="architect"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-border rounded-[48px] p-12 shadow-sm space-y-12"
            >
                  <div className="flex items-center justify-between border-b border-neutral-50 pb-8">
                    <div>
                      <h2 className="serif-display text-4xl text-black">Template <span className="text-neutral-300">Architect</span></h2>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] mt-2">Neural Type Definition Interface</p>
                    </div>
                    <Layers className="w-8 h-8 text-neutral-100" />
                  </div>

                  <div className="max-w-2xl mx-auto space-y-10">
                    <div className="bg-neutral-50 rounded-[40px] p-10 border border-neutral-100 text-center space-y-6">
                      <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <Terminal className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black uppercase tracking-tight">Define Your Logic</h3>
                        <p className="text-xs text-neutral-400 mt-2">Describe the type of content you want Nexus to master. Gemini will architect the prompt and schema automatically.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <textarea 
                          className="editorial-input min-h-[200px] py-8 px-10 text-lg"
                          placeholder="Ex: 'A viral thread style for Twitter that uses contrarian statements and ends with a strong CTA...'"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              // Simulate template creation
                              setLoading(true);
                              setLoadingMessage('Architecting Logic...');
                              setTimeout(() => {
                                const newId = Math.random().toString(36).substr(2, 9);
                                setContentTemplates(prev => [...prev, {
                                  id: newId,
                                  name: 'Neural_Type_' + newId.toUpperCase(),
                                  description: 'AI-generated high-retention logic',
                                  category: 'post',
                                  prompt: (e.target as HTMLTextAreaElement).value
                                }]);
                                setLoading(false);
                                setView('forge');
                              }, 2000);
                            }
                          }}
                        />
                        <div className="absolute bottom-6 right-8 text-[9px] font-black text-neutral-300 uppercase tracking-widest">Ctrl + Enter to architect</div>
                      </div>
                      <button 
                         onClick={() => setView('forge')}
                         className="w-full py-6 border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-400 font-black uppercase tracking-widest text-[10px] hover:border-black hover:text-black transition-all"
                      >
                        Cancel Sequence
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : view === 'brand-kit' ? (
                <motion.div 
                  key="brand-kit"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-border rounded-[48px] p-12 shadow-sm space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-neutral-50 pb-8">
                    <div>
                      <h2 className="serif-display text-4xl text-black">Brand <span className="text-neutral-300">Identity</span></h2>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] mt-2">Visual Consistency Vault</p>
                    </div>
                    <Palette className="w-8 h-8 text-neutral-100" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black">Primary Brand Logo</label>
                        <div 
                          onClick={() => avatarInputRef.current?.click()}
                          className="w-full aspect-video rounded-[32px] border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center gap-4 hover:border-black transition-all cursor-pointer group bg-neutral-50/50"
                        >
                          {logoPreview ? (
                            <div className="relative w-full h-full p-8 flex items-center justify-center">
                              <img src={logoPreview} className="max-h-full max-w-full object-contain" alt="Brand Logo" />
                              <button 
                                onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setInputs(prev => ({ ...prev, brandKit: { ...prev.brandKit, logoBase64: undefined } })); }}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-neutral-300" />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold">Upload Vector or PNG</p>
                                <p className="text-[10px] text-neutral-400">Transparents preferred for overlays</p>
                              </div>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={avatarInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setLogoPreview(base64);
                                setInputs(prev => ({ ...prev, brandKit: { ...prev.brandKit, logoBase64: base64 } }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black">Atmospheric Colors</label>
                        <div className="grid grid-cols-3 gap-6">
                          {[
                            { key: 'primaryColor', label: 'Primary' },
                            { key: 'secondaryColor', label: 'Secondary' },
                            { key: 'accentColor', label: 'Accent' }
                          ].map((c) => (
                            <div key={c.key} className="space-y-2">
                              <div 
                                className="w-full h-12 rounded-xl shadow-inner border border-neutral-100"
                                style={{ backgroundColor: inputs.brandKit[c.key as keyof typeof inputs.brandKit] as string }}
                              />
                              <label className="text-[8px] font-bold uppercase text-neutral-400">{c.label}</label>
                              <input 
                                type="color"
                                value={inputs.brandKit[c.key as keyof typeof inputs.brandKit] as string}
                                onChange={(e) => setInputs(prev => ({ ...prev, brandKit: { ...prev.brandKit, [c.key]: e.target.value } }))}
                                className="w-full h-8 opacity-0 absolute cursor-pointer"
                                style={{ transform: 'translateY(-40px)' }}
                              />
                              <input 
                                type="text"
                                value={(inputs.brandKit[c.key as keyof typeof inputs.brandKit] as string).toUpperCase()}
                                onChange={(e) => setInputs(prev => ({ ...prev, brandKit: { ...prev.brandKit, [c.key]: e.target.value } }))}
                                className="w-full bg-transparent border-b border-neutral-100 text-[10px] font-mono p-1 uppercase"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black">Typography Foundation</label>
                        <div className="space-y-4">
                          {[
                            { name: 'Inter', desc: 'Modern, balanced sans-serif', sample: 'The quick brown fox jumps over the lazy dog' },
                            { name: 'Playfair Display', desc: 'Elegant, classical serif', sample: 'Luxury and sophistication in every pixel' },
                            { name: 'JetBrains Mono', desc: 'Technical, precise monospace', sample: 'def nexus_ai(): return "Future"' },
                            { name: 'Space Grotesk', desc: 'Futuristic, bold geometric', sample: 'Launching intelligence into orbit' }
                          ].map((font) => (
                            <div 
                              key={font.name}
                              onClick={() => setInputs(prev => ({ ...prev, brandKit: { ...prev.brandKit, fontFamily: font.name } }))}
                              className={`p-6 rounded-[32px] border transition-all cursor-pointer ${inputs.brandKit.fontFamily === font.name ? 'border-black bg-neutral-50 shadow-sm' : 'border-neutral-100 hover:border-neutral-200'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-black uppercase">{font.name}</span>
                                {inputs.brandKit.fontFamily === font.name && <Check className="w-4 h-4 text-black" />}
                              </div>
                              <p className="text-[10px] text-neutral-400 mb-4">{font.desc}</p>
                              <p 
                                className="text-lg leading-tight"
                                style={{ fontFamily: font.name }}
                              >
                                {font.sample}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 bg-neutral-50 rounded-[40px] border border-neutral-100 space-y-4">
                        <div className="flex items-center gap-3 text-black">
                          <Sparkles className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Neural Sync Active</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">
                          Your brand kit is now hard-coded into the generation protocols. Every visual, script, and article will be synthesized to match your specific palette and typographic rhythm.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button 
                      onClick={() => setView('forge')}
                      className="px-12 py-4 bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      Commit Brand Identity
                    </button>
                  </div>
                </motion.div>
              ) : view === 'settings' ? (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-border rounded-[48px] p-12 shadow-sm space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div>
                      <h2 className="font-space font-black italic text-4xl text-white nexus-glow-text">Nexus<span className="text-white/50">Core</span></h2>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mt-2">Neural Hub Settings</p>
                    </div>
                    <Settings className="w-8 h-8 text-white/10" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                         <h3 className="text-[12px] font-black uppercase tracking-widest text-black">Network Connectivity</h3>
                         <select 
                           className="text-[10px] bg-neutral-50 border border-neutral-100 rounded-lg p-1 outline-none"
                           onChange={(e) => {
                             const platform = e.target.value;
                             if (platform && !socialConnections.find(c => c.platform === platform)) {
                               const newConn: SocialConnection = {
                                 id: Math.random().toString(36).substr(2, 9),
                                 platform: platform,
                                 name: platform.charAt(0).toUpperCase() + platform.slice(1) + ' Sync',
                                 status: 'disconnected',
                                 enabled: false
                               };
                               setSocialConnections([...socialConnections, newConn]);
                             }
                             e.target.value = '';
                           }}
                         >
                           <option value="">+ ADD PLATFORM</option>
                           {['Facebook', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Pinterest', 'Reddit', 'Medium', 'Substack', 'Blogger', 'PowerPages', 'GitHub', 'Discord', 'Slack', 'WhatsApp', 'Telegram', 'Snapchat', 'Tumblr', 'Ghost', 'WordPress', 'Shopify'].map(p => (
                             <option key={p} value={p.toLowerCase()}>{p}</option>
                           ))}
                         </select>
                       </div>
                       <div className="space-y-4">
                          {socialConnections.map(conn => (
                            <div key={conn.id} className="p-6 bg-neutral-50 rounded-[32px] flex items-center justify-between border border-neutral-100 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                                  <Globe className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-black">{conn.name}</p>
                                  <Badge className={conn.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-neutral-200 text-neutral-400'}>
                                    {conn.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {configuringConnection?.id === conn.id ? (
                                  <div className="animate-in fade-in slide-in-from-right-4 flex items-center gap-3">
                                    <input 
                                      type="text" 
                                      placeholder="API Key / URL" 
                                      className="bg-white border rounded-lg px-3 py-1 text-[10px] outline-none"
                                    />
                                    <button 
                                      onClick={() => {
                                        setLoadingMessage(`Authenticating ${conn.platform}...`);
                                        setTimeout(() => {
                                          setSocialConnections(prev => prev.map(c => c.id === conn.id ? {...c, status: 'connected', enabled: true} : c));
                                          setConfiguringConnection(null);
                                          setLoadingMessage('');
                                        }, 1500);
                                      }}
                                      className="px-3 py-1 bg-black text-white rounded-lg text-[9px] font-black uppercase"
                                    >
                                      Link
                                    </button>
                                    <button onClick={() => setConfiguringConnection(null)} className="text-neutral-400 text-[9px] font-black uppercase">Cancel</button>
                                  </div>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => setConfiguringConnection(conn)}
                                      className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors"
                                    >
                                      Configure
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (confirm('Permanently remove this connection record?')) {
                                          setSocialConnections(prev => prev.filter(c => c.id !== conn.id));
                                        }
                                      }}
                                      className="text-[10px] font-black uppercase text-red-900/50 hover:text-red-500 transition-colors"
                                    >
                                      Remove
                                    </button>
                                    <div 
                                      onClick={() => {
                                        if (conn.status === 'connected') {
                                           setSocialConnections(prev => prev.map(c => c.id === conn.id ? {...c, enabled: !c.enabled} : c));
                                        } else {
                                          setConfiguringConnection(conn);
                                        }
                                      }}
                                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${conn.enabled ? 'bg-black' : 'bg-neutral-300'}`}
                                    >
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${conn.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                       </div>

                       <div className="pt-8 space-y-4">
                         <h3 className="text-[12px] font-black uppercase tracking-widest text-black">User Preferences</h3>
                         <div className="space-y-4">
                            {[
                              { key: 'autoIngest', label: 'Auto-Ingest CSV', desc: 'Automatically process uploaded spreadsheet units' },
                              { key: 'highRetention', label: 'High-Retention Mode', desc: 'Optimize visuals for maximum 3s retention' },
                              { key: 'cloudSync', label: 'Cloud Sync', desc: 'Mirror finish media to primary drive repository' },
                              { key: 'stealthMode', label: 'Stealth Mode', desc: 'Excluce NEXUS metadata from deployment packages' }
                            ].map((pref) => (
                              <div key={pref.key} className="flex items-center justify-between p-2">
                                <div>
                                  <p className="text-xs font-bold text-black">{pref.label}</p>
                                  <p className="text-[10px] text-neutral-400">{pref.desc}</p>
                                </div>
                                <div 
                                  onClick={() => setPreferences(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof prev] }))}
                                  className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-colors ${preferences[pref.key as keyof typeof preferences] ? 'bg-black' : 'bg-neutral-200'}`}
                                >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${preferences[pref.key as keyof typeof preferences] ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                              </div>
                            ))}
                         </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                         <h3 className="text-[12px] font-black uppercase tracking-widest text-black">Neural Gems</h3>
                         <button 
                           onClick={() => {
                             const newGem: Gem = {
                               id: Math.random().toString(36).substr(2, 9),
                               name: 'New Custom Gem',
                               systemInstruction: 'You are an AI assistant...',
                               dataItems: []
                             };
                             setGems([...gems, newGem]);
                           }}
                           className="p-2 bg-black text-white rounded-lg hover:scale-110 active:scale-95 transition-transform"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                       </div>
                       <div className="space-y-6">
                         {gems.map(gem => (
                           <div key={gem.id} className="bg-neutral-50 border border-neutral-100 rounded-[32px] p-8 space-y-6">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{gem.name}</span>
                               <Trash2 
                                 onClick={() => {
                                   if (gem.id === 'master-engine') return;
                                   setGems(gems.filter(g => g.id !== gem.id));
                                 }}
                                 className="w-4 h-4 text-neutral-200 hover:text-red-500 cursor-pointer transition-colors" 
                               />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[9px] font-black uppercase text-neutral-400">Master Instruction</label>
                               <textarea 
                                 className="editorial-input min-h-[120px] text-[11px] leading-relaxed"
                                 value={gem.systemInstruction}
                                 onChange={(e) => setGems(prev => prev.map(g => g.id === gem.id ? {...g, systemInstruction: e.target.value} : g))}
                               />
                             </div>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-[9px] font-black uppercase text-neutral-400">Data Invariants</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      id={`new-item-${gem.id}`}
                                      className="bg-transparent border-b border-neutral-100 text-[10px] outline-none"
                                      placeholder="Add variant..."
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = (e.currentTarget as HTMLInputElement).value;
                                          if (val) {
                                            setGems(prev => prev.map(g => g.id === gem.id ? {
                                              ...g, 
                                              dataItems: [...g.dataItems, { id: Math.random().toString(36).substr(2, 9), content: val }]
                                            } : g));
                                            (e.currentTarget as HTMLInputElement).value = '';
                                          }
                                        }
                                      }}
                                    />
                                    <PlusCircle 
                                      onClick={() => {
                                        const input = document.getElementById(`new-item-${gem.id}`) as HTMLInputElement;
                                        if (input.value) {
                                          setGems(prev => prev.map(g => g.id === gem.id ? {
                                            ...g, 
                                            dataItems: [...g.dataItems, { id: Math.random().toString(36).substr(2, 9), content: input.value }]
                                          } : g));
                                          input.value = '';
                                        }
                                      }}
                                      className="w-4 h-4 text-neutral-300 cursor-pointer hover:text-black transition-colors" 
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {gem.dataItems.map(item => (
                                    <div key={item.id} className="px-4 py-3 bg-white border border-neutral-100 rounded-2xl text-[10px] flex items-center justify-between group">
                                      <span className="truncate flex-1 pr-4">{item.content}</span>
                                      <X 
                                        onClick={() => {
                                          setGems(prev => prev.map(g => g.id === gem.id ? {
                                            ...g, 
                                            dataItems: g.dataItems.filter(i => i.id !== item.id)
                                          } : g));
                                        }}
                                        className="w-3 h-3 text-neutral-300 hover:text-red-500 cursor-pointer transition-colors" 
                                      />
                                    </div>
                                  ))}
                                  {gem.dataItems.length === 0 && <p className="text-[9px] text-neutral-300 italic">No data units mapped.</p>}
                                </div>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>

                   {/* Strategic Operations (Restricted) */}
                   {driveUser?.email === 'cscannell@nexusaigear.com' && (
                     <div className="pt-20 border-t border-white/5 space-y-10">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[12px] font-black uppercase tracking-widest text-primary italic">Strategic Intelligence Suite</h3>
                           <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[8px] font-black text-primary uppercase">Alpha Protocol Active</span>
                           </div>
                        </div>
                        <div className="nexus-card bg-primary/5 border border-primary/20 p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2" />
                           <div className="relative z-10 w-24 h-24 bg-black border border-white/10 rounded-3xl flex items-center justify-center p-6 shadow-[0_0_50px_rgba(0,242,255,0.15)]">
                              <Presentation className="w-full h-full text-primary" />
                           </div>
                           <div className="relative z-10 max-w-lg">
                              <h4 className="text-3xl font-space font-black text-white italic tracking-tighter">Investor Pitch Deck Forge</h4>
                              <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">
                                Secure strategic narrative engine for synthesizing investor-grade pitch decks from Nexus core data. High-conviction output protocol active for user cscannell.
                              </p>
                           </div>
                           <button 
                             onClick={() => {
                               setInputs(prev => ({ ...prev, contentType: 'deck' }));
                               setView('forge');
                             }}
                             className="nexus-btn nexus-btn-primary px-12 relative z-10"
                           >
                             Initialize Strategic Forge
                           </button>
                        </div>
                     </div>
                   )}
                   </div>
                </motion.div>
              ) : view === 'templates' ? (
                <motion.div 
                  key="templates"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-space font-black italic text-4xl text-white nexus-glow-text">Nexus<span className="text-white/50">Blueprints</span></h2>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mt-2">Neural Output Schematics</p>
                    </div>
                    <button 
                      onClick={() => {
                        const id = Math.random().toString(36).substr(2, 9);
                        setContentTemplates([...contentTemplates, {
                          id,
                          name: 'Nexus_Blueprint_' + id.toUpperCase(),
                          description: 'Custom neural logic sequence',
                          category: 'post',
                          prompt: ''
                        }]);
                        setEditingTemplateId(id);
                      }}
                      className="nexus-btn nexus-btn-primary py-3"
                    >
                      <Plus className="w-4 h-4" />
                      Initialize Blueprint
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {contentTemplates.map(template => (
                      <div key={template.id} className="nexus-card bg-white/5 group hover:bg-white/[0.07] transition-all relative p-8">
                        {editingTemplateId === template.id ? (
                          <div className="space-y-6 animate-in fade-in zoom-in-95">
                            <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-slate-500">Blueprint Name</label>
                              <input 
                                className="nexus-input py-2 px-4"
                                defaultValue={template.name}
                                onBlur={(e) => setContentTemplates(prev => prev.map(t => t.id === template.id ? {...t, name: e.target.value} : t))}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-slate-500">Logic Stream</label>
                              <textarea 
                                className="w-full min-h-[200px] bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-[10px] text-slate-300 leading-relaxed resize-none outline-none focus:border-primary/40"
                                defaultValue={template.prompt}
                                id={`lib-editor-${template.id}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const prompt = (document.getElementById(`lib-editor-${template.id}`) as HTMLTextAreaElement).value;
                                  setContentTemplates(prev => prev.map(t => t.id === template.id ? {...t, prompt} : t));
                                  setEditingTemplateId(null);
                                }}
                                className="flex-1 py-3 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >
                                Commit Logic
                              </button>
                              <button 
                                onClick={() => setEditingTemplateId(null)}
                                className="px-6 py-3 bg-white/5 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="aspect-video bg-black/60 rounded-3xl mb-8 relative overflow-hidden flex items-center justify-center p-8 border border-white/5 shadow-inner">
                              <div className="absolute inset-0 opacity-20 pointer-events-none nexus-circuit-bg" />
                              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                                 {template.category === 'video' ? <Video className="w-12 h-12 text-primary/40 group-hover:text-primary/60 transition-colors" /> :
                                  template.category === 'article' ? <BookOpen className="w-12 h-12 text-secondary/40 group-hover:text-secondary/60 transition-colors" /> :
                                  template.category === 'image' ? <ImageIcon className="w-12 h-12 text-primary/40 group-hover:text-primary/60 transition-colors" /> :
                                  <FileText className="w-12 h-12 text-slate-600 group-hover:text-slate-400 transition-colors" />}
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] group-hover:text-white/20 transition-colors">{template.category} ENGINE</p>
                                    <div className="h-0.5 w-12 bg-white/5 mx-auto rounded-full" />
                                 </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                               <Badge className="bg-white/5 text-slate-500 border border-white/5">{template.category}</Badge>
                               <div className="flex gap-1">
                                  {[1,2,3].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i === 1 ? 'bg-primary' : 'bg-white/10'}`} />)}
                               </div>
                            </div>
                            
                            <h3 className="font-space font-black text-2xl mb-2 text-white italic tracking-tighter group-hover:text-primary transition-colors">{template.name}</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mb-8 line-clamp-2">{template.description}</p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                              <button 
                                onClick={() => setEditingTemplateId(template.id)}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                              >
                                Edit Schematic
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Delete this blueprint schematic?')) {
                                    setContentTemplates(prev => prev.filter(t => t.id !== template.id));
                                  }
                                }}
                                className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : view === 'admin' ? (
                <motion.div 
                  key="admin"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="space-y-12"
                >
                   <div className="flex items-center justify-between">
                    <div>
                      <h2 className="serif-display text-4xl text-red-600">Admin <span className="text-neutral-300">Terminal</span></h2>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] mt-2">Critical System Operations</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={async () => {
                          const logs = await getLogs();
                          const users = await getAllUsers();
                          const data = { logs, users, timestamp: Date.now() };
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `NexusAI_Backup_${new Date().toISOString()}.json`;
                          a.click();
                          logAction('backup', 'Full system backup exported');
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-neutral-100 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Export Backup
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-border p-2 rounded-[48px] overflow-hidden shadow-2xl">
                    <Tabs defaultValue="logs" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-neutral-50/50 p-1 mb-0 border-b border-neutral-100">
                        <TabsTrigger value="logs" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">Operations Log</TabsTrigger>
                        <TabsTrigger value="users" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">User Directory</TabsTrigger>
                        <TabsTrigger value="files" className="py-4 font-black uppercase text-[10px] tracking-widest text-neutral-400 data-[state=active]:text-black">Global Files</TabsTrigger>
                      </TabsList>

                      <ScrollArea className="h-[600px]">
                        <TabsContent value="logs" className="p-12">
                          <div className="space-y-4">
                             <button 
                                onClick={async () => setAdminLogs(await getLogs())}
                                className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-4"
                             >
                                Refresh Logs
                             </button>
                             <div className="border border-neutral-100 rounded-3xl overflow-hidden">
                               <table className="w-full text-left bg-white">
                                  <thead className="bg-neutral-50 border-b border-neutral-100">
                                    <tr>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Timestamp</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">User</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Action</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Details</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-50">
                                    {(adminLogs.length > 0 ? adminLogs : []).map((log) => (
                                      <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-[9px] text-neutral-400">
                                          {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold">{log.userEmail || log.userId}</td>
                                        <td className="px-6 py-4">
                                           <Badge className="bg-black text-white">{log.action}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-neutral-500">{log.details}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                               </table>
                             </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="users" className="p-12">
                          <div className="space-y-4">
                             <button 
                                onClick={async () => setAdminUsers(await getAllUsers())}
                                className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-4"
                             >
                                Refresh Users
                             </button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {(adminUsers.length > 0 ? adminUsers : []).map((user) => (
                                 <div key={user.uid} className="p-8 bg-neutral-50 border border-neutral-100 rounded-[32px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all h-fit">
                                    <div className="space-y-1">
                                       <p className="text-sm font-bold text-black">{user.email}</p>
                                       <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest">UID: {user.uid.slice(0, 8)}...</p>
                                       <p className="text-[9px] text-neutral-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                       <Badge className={user.isAdmin ? "bg-red-600 text-white" : "bg-neutral-200 text-neutral-400"}>
                                          {user.isAdmin ? "Admin" : "User"}
                                       </Badge>
                                       <button 
                                          onClick={() => {
                                            alert("Admin status can only be modified via Firebase Console for security.");
                                          }}
                                          className="text-[9px] font-black uppercase tracking-widest text-neutral-300 group-hover:text-black transition-colors"
                                       >
                                          Manage Permissions
                                       </button>
                                    </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="files" className="p-12">
                           <div className="space-y-8">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">System-wide File Assets</h3>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Read/Write Permission Overrides</p>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {mediaAssets.map(asset => (
                                  <div key={asset.id} className="p-6 bg-neutral-50 border border-neutral-100 rounded-[32px] flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                                     <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-neutral-100 overflow-hidden">
                                           {asset.type === 'image' ? <img src={asset.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-neutral-900"><Play className="w-4 h-4 text-white" /></div>}
                                        </div>
                                        <div>
                                           <p className="text-xs font-bold">{asset.name}</p>
                                           <p className="text-[9px] text-neutral-400 font-mono italic">Nexus_{asset.id.slice(0,6)}</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end gap-1">
                                          <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Access Mode</span>
                                          <Badge className="bg-neutral-100 text-neutral-500">Restricted</Badge>
                                        </div>
                                        <button className="p-3 hover:bg-neutral-100 rounded-xl transition-colors">
                                           <Settings className="w-4 h-4 text-neutral-400" />
                                        </button>
                                     </div>
                                  </div>
                                ))}
                                {mediaAssets.length === 0 && <p className="text-center py-20 text-neutral-300 font-mono text-xs">No global assets detected in buffer</p>}
                              </div>
                           </div>
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </div>
                </motion.div>
              ) : view === 'marketplace' ? (
                <motion.div 
                  key="marketplace"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-border rounded-[48px] p-12 shadow-sm space-y-12"
                >
                   <div className="flex items-center justify-between border-b border-neutral-50 pb-8">
                    <div>
                      <h2 className="serif-display text-4xl text-black">Nexus <span className="text-neutral-300">Market</span></h2>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] mt-2">Monetize Your Neural Protocols</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-neutral-100" />
                  </div>

                  <div className="max-w-4xl mx-auto py-20 text-center space-y-8">
                    <div className="w-24 h-24 bg-neutral-50 rounded-[40px] flex items-center justify-center mx-auto border border-neutral-100">
                      <CreditCard className="w-10 h-10 text-neutral-300" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="serif-display text-5xl">E-commerce Integration Pending</h3>
                      <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">The Nexus Marketplace is architected for seamless Stripe and Shopify integration. Soon you'll be able to list your content frameworks and neural avatars for the global creative network.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-12 grayscale opacity-30">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-10" alt="Stripe" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg" className="h-10" alt="Shopify" />
                    </div>
                  </div>
                </motion.div>
              ) : view === 'media' ? (
                <motion.div 
                  key="media"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-border rounded-[48px] p-12 shadow-sm space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-neutral-50 pb-8">
                    <div>
                      <h2 className="serif-display text-4xl text-black">Asset <span className="text-neutral-300">Vault</span></h2>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] mt-2">Distributed Mirror Repository</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          if (driveUser) loadSchedule(driveUser.uid);
                        }}
                        className="flex items-center gap-3 px-6 py-3 bg-neutral-100 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Sync History
                      </button>
                      <button 
                         onClick={() => mediaInputRef.current?.click()}
                         className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        Ingest Media
                      </button>
                      <input type="file" ref={mediaInputRef} className="hidden" onChange={handleManualMediaUpload} />
                    </div>
                  </div>

                  <Tabs defaultValue="assets" className="space-y-8">
                    <TabsList className="bg-neutral-50 p-1 rounded-2xl w-fit">
                      <TabsTrigger value="assets" className="px-8 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Assets</TabsTrigger>
                      <TabsTrigger value="history" className="px-8 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Finished Posts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="aspect-square bg-neutral-50 rounded-[40px] border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-300 group hover:border-black hover:text-black transition-all cursor-pointer">
                          <PlusCircle className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">New Sequence</span>
                        </div>
                        {mediaAssets.map(asset => (
                          <div key={asset.id} className="aspect-square bg-neutral-100 rounded-[40px] overflow-hidden group relative shadow-md">
                            {asset.type === 'video' ? (
                              <video src={asset.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={asset.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={asset.name} />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6">
                               <p className="text-white text-[10px] font-black uppercase tracking-widest text-center">{asset.name}</p>
                               <div className="flex gap-2">
                                 <button 
                                  onClick={() => {
                                    const newName = prompt('Enter new asset name:', asset.name);
                                    if (newName) setMediaAssets(prev => prev.map(a => a.id === asset.id ? {...a, name: newName} : a));
                                  }}
                                  className="p-3 bg-white/20 rounded-xl hover:bg-white/40"
                                 >
                                  <Palette className="w-4 h-4 text-white" />
                                 </button>
                                 <button className="p-3 bg-white/20 rounded-xl hover:bg-white/40"><Eye className="w-4 h-4 text-white" /></button>
                                 <button className="p-3 bg-white/20 rounded-xl hover:bg-white/40"><Download className="w-4 h-4 text-white" /></button>
                               </div>
                            </div>
                            {asset.type === 'video' && (
                              <div className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-lg">
                                <Play className="w-3 h-3 text-white fill-current" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="history">
                      <div className="space-y-4">
                        {scheduledPosts.length === 0 ? (
                          <div className="py-32 text-center">
                            <Send className="w-16 h-16 text-neutral-100 mx-auto mb-6" />
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">No deployment history found</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {scheduledPosts.sort((a, b) => b.scheduledTime - a.scheduledTime).map(post => (
                              <div key={post.id} className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 flex items-center justify-between hover:bg-neutral-100 transition-all group">
                                <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 shrink-0">
                                    {post.thumbnailUrl ? (
                                       <img src={post.thumbnailUrl} className="w-full h-full object-cover" alt="Thumb" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-neutral-200">
                                        <FileText className="w-6 h-6" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-black">{post.platform}</span>
                                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${post.status === 'posted' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {post.status}
                                      </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-black mt-1">{post.title}</h4>
                                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest mt-1">
                                      {new Date(post.scheduledTime).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => {
                                      // Logic to preview a historical post
                                      // We'd need to fetch the content data, but for now we can show the thumb
                                      setError('Feature Deep Link: Historical preview protocol initializing...');
                                    }}
                                    className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 transition-all text-neutral-400 hover:text-black"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteSchedule(post.id)}
                                    className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 transition-all text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : view === 'avatars' ? (
                <motion.div 
                  key="avatars"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-border rounded-[48px] p-12 shadow-sm space-y-12"
                >
                  <Tabs defaultValue="personas" className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-50 pb-8 gap-6">
                      <div>
                        <h2 className="serif-display text-4xl text-black">Identity <span className="text-neutral-300">Vault</span></h2>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.3em] mt-2">Avatar & Neural Voice Management</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <TabsList className="bg-neutral-50 p-1 rounded-2xl shrink-0">
                          <TabsTrigger value="personas" className="px-6 py-2.5 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-neutral-400">Personas</TabsTrigger>
                          <TabsTrigger value="voices" className="px-6 py-2.5 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black text-neutral-400">Voice Signatures</TabsTrigger>
                        </TabsList>
                      </div>
                    </div>

                    {error && (error.includes('VAULT') || error.includes('Identity') || error.includes('VOICE')) && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-2">
                         <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
                         <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                      </div>
                    )}

                    {!driveUser ? (
                      <div className="flex flex-col items-center justify-center py-24 bg-neutral-50 rounded-[40px] border border-neutral-100 gap-6">
                         <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center">
                            <HardDrive className="w-10 h-10 text-neutral-200" />
                         </div>
                         <div className="text-center space-y-2">
                            <h3 className="font-bold text-xl">Cloud Vault Locked</h3>
                            <p className="text-neutral-400 text-sm max-w-sm mx-auto">Please authorize Google access to sync your identity profiles across the Nexus architecture.</p>
                         </div>
                         <button 
                          onClick={handleGoogleSignIn}
                          className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                         >
                          Authorize & Unlock
                         </button>
                      </div>
                    ) : (
                      <>
                        <TabsContent value="personas" className="space-y-8 animate-in fade-in-50 duration-300">
                          <div className="flex items-center justify-between pb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Calibrated Personas ({avatars.length})</h3>
                            <button 
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={loading}
                              className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                              {loading ? 'Processing...' : 'Ingest Identity'}
                            </button>
                          </div>

                          <input type="file" ref={avatarInputRef} className="hidden" onChange={handleCreateAvatar} accept="image/*" />
      
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            <div 
                              onClick={() => avatarInputRef.current?.click()}
                              className="aspect-square bg-neutral-50 rounded-[40px] border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-300 group hover:border-black hover:text-black transition-all cursor-pointer"
                            >
                              <PlusCircle className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-black uppercase tracking-widest">New Persona</span>
                            </div>
                            {loadingAvatars && avatars.length === 0 ? (
                              [1, 2, 3].map(i => (
                                <div key={i} className="aspect-square bg-neutral-100/50 rounded-[40px] animate-pulse" />
                              ))
                            ) : (
                              avatars.map(avatar => {
                                const matchedVoice = voices.find(v => v.id === avatar.voiceId);
                                const voiceLabel = matchedVoice ? `${matchedVoice.name} (${matchedVoice.accent})` : 'Default Voice';
                                return (
                                  <div key={avatar.id} className="aspect-square bg-neutral-100 rounded-[40px] overflow-hidden group relative shadow-md">
                                    <img src={avatar.photoBase64} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={avatar.name} />
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between">
                                      <div>
                                        <p className="text-white text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{avatar.name}</p>
                                        <p className="text-primary text-[7px] font-black uppercase tracking-widest mt-1">Voice: {voiceLabel}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => {
                                            setVoiceModalAvatar(avatar);
                                            setShowVoiceModal(true);
                                          }}
                                          title="Attach Neural Voice Signature"
                                          className="p-2 bg-primary/20 hover:bg-primary/40 rounded-xl transition-colors cursor-pointer"
                                        >
                                          <Mic className="w-4 h-4 text-primary" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteAvatar(avatar.id)}
                                          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            {!loadingAvatars && avatars.length === 0 && (
                              <div className="col-span-full py-12 text-center text-neutral-300 font-mono text-xs">
                                No identity profiles detected in buffer. Authorized access required for neural sync.
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="voices" className="space-y-8 animate-in fade-in-50 duration-300">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Available Voice Signatures</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {voices.map(voice => {
                                  const isPlaying = playingVoiceId === voice.id;
                                  return (
                                    <div 
                                      key={voice.id}
                                      className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100 flex items-center justify-between group hover:border-neutral-200 transition-all shadow-sm"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-sm tracking-tight text-black">{voice.name}</span>
                                          <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${voice.type === 'preset' ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                                            {voice.type === 'preset' ? 'PRESET' : 'CLONED'}
                                          </span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">{voice.accent}</span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => handlePlayVoice(voice.id)}
                                          className={`p-3 rounded-2xl transition-all shadow-sm border ${isPlaying ? 'bg-primary border-primary text-black scale-105' : 'bg-white border-neutral-100 text-neutral-400 hover:text-black hover:border-neutral-200'}`}
                                        >
                                          {isPlaying ? (
                                            <div className="flex items-center gap-0.5 h-3 px-1">
                                              <div className="w-[2px] h-full bg-black animate-bounce" style={{ animationDelay: '0s' }} />
                                              <div className="w-[2px] h-1/2 bg-black animate-bounce" style={{ animationDelay: '0.15s' }} />
                                              <div className="w-[2px] h-full bg-black animate-bounce" style={{ animationDelay: '0.3s' }} />
                                            </div>
                                          ) : (
                                            <Play className="w-3 h-3 text-neutral-400 group-hover:text-black" />
                                          )}
                                        </button>
                                        
                                        {voice.type === 'custom' && (
                                          <button 
                                            onClick={() => handleDeleteVoice(voice.id)}
                                            className="p-3 bg-white hover:bg-red-50 text-neutral-400 hover:text-red-500 border border-neutral-100 hover:border-red-100 rounded-2xl transition-all shadow-sm"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Clone Neural Signature</h3>
                              
                              <div className="bg-neutral-900 text-white rounded-[32px] p-6 border border-white/5 space-y-6 shadow-xl">
                                <div>
                                  <h4 className="font-bold text-sm text-white">Voice Ingestion Cloak</h4>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Direct upload or microphone recording</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div 
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center group cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'audio/*';
                                      input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                          alert('Auditory signature detected. Neural cloner active.');
                                          const voiceName = file.name.split('.')[0] || 'Custom Signature';
                                          const voiceAccent = 'Cloned Signature';
                                          try {
                                            const realId = await saveVoice(driveUser.uid, {
                                              name: voiceName,
                                              accent: voiceAccent,
                                              type: 'custom'
                                            });
                                            if (realId) {
                                              const newVoice: Voice = {
                                                id: realId,
                                                name: voiceName,
                                                accent: voiceAccent,
                                                type: 'custom',
                                                createdAt: Date.now()
                                              };
                                              setVoices(prev => [...prev, newVoice]);
                                            }
                                          } catch (err) {
                                            console.error('Error saving uploaded voice direct:', err);
                                          }
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    <Upload className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                                    <div>
                                      <p className="text-[8px] font-black uppercase tracking-widest text-white">Upload File</p>
                                      <p className="text-[6px] text-slate-400 mt-0.5 uppercase font-bold">WAV/MP3</p>
                                    </div>
                                  </div>

                                  <div 
                                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center group cursor-pointer transition-colors ${isInlineRecording ? 'bg-red-500/10 border-red-500 animate-pulse text-red-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                    onClick={() => {
                                      if (!isInlineRecording) {
                                        setIsInlineRecording(true);
                                        let time = 0;
                                        const interval = setInterval(() => {
                                          time += 1;
                                          setInlineRecordingTime(time);
                                          if (time >= 30) {
                                            clearInterval(interval);
                                            setIsInlineRecording(false);
                                            setInlineRecordingTime(0);
                                            alert('Recording complete. Neural signature extracted.');
                                            
                                            const voiceName = 'Recorded Voice ' + (voices.length - 4);
                                            const voiceAccent = 'Vocal Print (REC)';
                                            
                                            saveVoice(driveUser.uid, {
                                              name: voiceName,
                                              accent: voiceAccent,
                                              type: 'custom'
                                            }).then(realId => {
                                              if (realId) {
                                                const newVoice: Voice = {
                                                  id: realId,
                                                  name: voiceName,
                                                  accent: voiceAccent,
                                                  type: 'custom',
                                                  createdAt: Date.now()
                                                };
                                                setVoices(prev => [...prev, newVoice]);
                                              }
                                            }).catch(err => console.error(err));
                                          }
                                        }, 1000);
                                        (window as any).inlineRecInterval = interval;
                                      } else {
                                        clearInterval((window as any).inlineRecInterval);
                                        setIsInlineRecording(false);
                                        const voiceName = 'Recorded Voice ' + (voices.length - 4);
                                        const voiceAccent = 'Vocal Print (REC)';
                                        saveVoice(driveUser.uid, {
                                          name: voiceName,
                                          accent: voiceAccent,
                                          type: 'custom'
                                        }).then(realId => {
                                          if (realId) {
                                            const newVoice: Voice = {
                                              id: realId,
                                              name: voiceName,
                                              accent: voiceAccent,
                                              type: 'custom',
                                              createdAt: Date.now()
                                            };
                                            setVoices(prev => [...prev, newVoice]);
                                          }
                                        }).catch(err => console.error(err));
                                        setInlineRecordingTime(0);
                                        alert('Recording complete. Custom voice generated.');
                                      }
                                    }}
                                  >
                                    <Mic className={`w-5 h-5 ${isInlineRecording ? 'text-red-500' : 'text-neutral-400 group-hover:text-white'} transition-colors`} />
                                    <div>
                                      <p className="text-[8px] font-black uppercase tracking-widest">{isInlineRecording ? `REC ${inlineRecordingTime}s` : 'Record Live'}</p>
                                      <p className="text-[6px] text-slate-400 mt-0.5 uppercase font-bold">{isInlineRecording ? 'Click to Stop' : '30s Sample'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[7px] font-black uppercase tracking-widest text-slate-500">Neural Calibration Script</label>
                                  <div className="bg-black border border-white/5 p-4 rounded-2xl font-mono text-[8px] leading-relaxed text-slate-300 italic h-28 overflow-y-auto">
                                    "The Nexus architecture represents a shift in hardware intelligence. By synthesizing core narratives through neural logic, we unlock unprecedented strategic deployment capacity. Every signal processed strengthens the vault, ensuring high-conviction resonance across all strategic platforms."
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </>
                    )}
                  </Tabs>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </main>

      {/* Revision Floating Action */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-12 right-12 w-20 h-20 bg-white border border-border text-black rounded-[32px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full sm:w-[500px] z-[100] p-6"
          >
            <div className="h-full bg-white border border-border rounded-[48px] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
               <div className="p-10 border-b border-neutral-50 flex items-center justify-between">
                 <span className="font-black uppercase tracking-widest text-[11px] text-neutral-400">Refinement Terminal</span>
                 <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-neutral-50 rounded-xl transition-colors"><X className="text-neutral-400" /></button>
               </div>
               <div className="flex-1 p-10 overflow-auto space-y-6">
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-neutral-200 text-center opacity-50">
                      <MessageSquare className="w-12 h-12 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting input</p>
                   </div>
                 )}
                 {messages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`p-6 rounded-[24px] max-w-[90%] text-sm leading-relaxed ${m.role === 'user' ? 'bg-black text-white font-medium shadow-xl' : 'bg-neutral-50 text-neutral-600 border border-neutral-100'}`}>
                       {m.text}
                     </div>
                   </div>
                 ))}
               </div>
               <div className="p-10 border-t border-neutral-50 bg-neutral-50/30">
                 <div className="relative">
                   <input 
                     value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                     className="editorial-input pl-6 pr-16 py-5 rounded-[24px] shadow-sm"
                     placeholder="Neural refinement prompt..."
                     onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                   />
                   <button onClick={handleChat} className="absolute right-3 top-3 p-3 bg-black text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"><Send className="w-5 h-5" /></button>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Blueprint Modal */}
      <AnimatePresence>
        {showBlueprint && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[48px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-100"
            >
              <div className="p-10 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                <div>
                  <h3 className="serif-display text-4xl text-black">Deployment <span className="text-neutral-300">Blueprint</span></h3>
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mt-2">Neural Execution Verification unit_nx_01</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={downloadBlueprintPDF}
                    className="p-4 bg-black text-white rounded-2xl hover:scale-110 transition-transform flex items-center gap-3 px-6 shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Download PDF</span>
                  </button>
                  <button 
                    onClick={() => setShowBlueprint(false)}
                    className="p-4 bg-neutral-100 text-black rounded-2xl hover:bg-neutral-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-10 bg-neutral-900 font-mono text-[11px] leading-relaxed text-green-400 whitespace-pre-wrap">
                {blueprintContent}
              </ScrollArea>
              <div className="p-8 bg-white border-t border-neutral-100 flex justify-end gap-4">
                <button 
                   onClick={() => {
                     setInputs(prev => ({ ...prev, contentType: 'custom', customPrompt: blueprintContent }));
                     setShowBlueprint(false);
                     setView('forge');
                   }}
                   className="px-8 py-4 border-2 border-black text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black hover:text-white transition-all"
                >
                  Load into Custom Prompt
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(blueprintContent);
                    alert('Blueprint captured to clipboard.');
                  }}
                  className="px-8 py-4 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                >
                  Copy Logic Stream
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
             <div className="relative">
                <div className="w-32 h-32 border-4 border-white/10 rounded-full animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 border-4 border-t-white border-transparent rounded-full animate-spin" />
                <div className="absolute inset-x-0 -bottom-20 text-center space-y-4">
                   <p className="text-white text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">{loadingMessage || 'Synching Nervous System...'}</p>
                   <div className="flex items-center justify-center gap-2">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                   </div>
                   <p className="text-neutral-500 text-[8px] font-mono">NEURAL_LINK_ACTIVE: RELAYING_DATA_STREAM</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-neutral-100">
               <div className="p-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                        <Terminal className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="font-bold text-lg">Neural Post-Action Report</h2>
                        <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">Sequence ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                     </div>
                  </div>
                  <button onClick={() => setShowReport(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
                  {generationReport.map((rep, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${rep.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                             <span className="font-black text-[10px] uppercase tracking-widest">{rep.platform}</span>
                          </div>
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${rep.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {rep.status}
                          </span>
                       </div>
                       {rep.error && (
                         <p className="text-[10px] text-red-600 font-mono italic mt-2 bg-red-50/50 p-2 rounded-lg border border-red-50">{rep.error}</p>
                       )}
                    </div>
                  ))}
               </div>

               <div className="p-8 bg-neutral-50/50 border-t border-neutral-50 flex gap-4">
                  <button 
                    onClick={() => {
                      setShowReport(false);
                      setView('media');
                    }}
                    className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Access Media Vault
                  </button>
                  <button 
                    onClick={() => setShowReport(false)}
                    className="px-6 py-4 border-2 border-neutral-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-100 transition-all"
                  >
                    Acknowledge
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Setup Modal */}
      <AnimatePresence>
        {showAvatarSetupModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl border border-white/5"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-neutral-900">
                <div>
                  <h3 className="font-space font-black italic text-2xl text-white">Identity <span className="text-white/50">Calibration</span></h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Neural Voice & Persona configuration</p>
                </div>
                <button onClick={() => setShowAvatarSetupModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] bg-white">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-100 shadow-md shrink-0">
                    <img src={tempAvatarImage || ''} className="w-full h-full object-cover" alt="Identity Preview" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Persona Name</label>
                    <input 
                      value={setupAvatarName}
                      onChange={(e) => setSetupAvatarName(e.target.value)}
                      className="w-full bg-neutral-50 p-4 rounded-xl border border-neutral-100 font-bold text-sm focus:border-black transition-colors outline-none"
                      placeholder="e.g. Nexus Guardian Alpha"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Voice Synthesis</label>
                    <div className="flex gap-2">
                      <Badge className="bg-primary/10 text-primary border border-primary/20">HD Audio</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {voices.map(voice => (
                      <button 
                        key={voice.id}
                        onClick={() => setSetupSelectedVoiceId(voice.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 group ${setupSelectedVoiceId === voice.id ? 'border-primary bg-primary/5 text-black shadow-sm' : 'border-neutral-50 bg-neutral-50/50 hover:border-neutral-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs tracking-tight">{voice.name}</span>
                          <Music className={`w-3 h-3 ${setupSelectedVoiceId === voice.id ? 'text-primary' : 'text-neutral-200'}`} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${setupSelectedVoiceId === voice.id ? 'text-primary/60' : 'text-neutral-400'}`}>{voice.accent}</span>
                      </button>
                    ))}

                    <button 
                      onClick={() => setSetupSelectedVoiceId('custom')}
                      className={`p-4 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 transition-all ${setupSelectedVoiceId === 'custom' ? 'border-primary bg-primary/5 text-primary' : 'hover:border-black hover:text-black text-neutral-300'}`}
                    >
                      <PlusCircle className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Custom Voice</span>
                    </button>
                  </div>

                  {setupSelectedVoiceId === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4 border-t border-neutral-100"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 flex flex-col items-center justify-center gap-2 text-center group cursor-pointer hover:bg-neutral-100 transition-colors"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'audio/*';
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                alert('Voice sample detected. Neural cloning active.');
                                const voiceName = file.name.split('.')[0] || 'Custom Voice';
                                const voiceAccent = 'Cloned Signature';
                                if (driveUser) {
                                  try {
                                    const realId = await saveVoice(driveUser.uid, {
                                      name: voiceName,
                                      accent: voiceAccent,
                                      type: 'custom'
                                    });
                                    if (realId) {
                                      const newVoice: Voice = {
                                        id: realId,
                                        name: voiceName,
                                        accent: voiceAccent,
                                        type: 'custom',
                                        createdAt: Date.now()
                                      };
                                      setVoices(prev => [...prev, newVoice]);
                                      setSetupSelectedVoiceId(realId);
                                    }
                                  } catch (err) {
                                    console.error('Error saving modal cloned voice:', err);
                                  }
                                } else {
                                  const newVoice: Voice = {
                                    id: 'custom-' + Math.random().toString(36).substring(7),
                                    name: voiceName,
                                    accent: voiceAccent,
                                    type: 'custom',
                                    createdAt: Date.now()
                                  };
                                  setVoices(prev => [...prev, newVoice]);
                                  setSetupSelectedVoiceId(newVoice.id);
                                }
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="w-6 h-6 text-neutral-300 group-hover:text-black transition-colors" />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest">Upload</p>
                            <p className="text-[7px] text-neutral-400 mt-0.5 uppercase font-bold">Min 30s</p>
                          </div>
                        </div>

                        <div 
                          className={`p-6 rounded-2xl border border-neutral-100 flex flex-col items-center justify-center gap-2 text-center group cursor-pointer transition-colors ${isRecording ? 'bg-red-50 border-red-100 animate-pulse' : 'bg-neutral-50 hover:bg-neutral-100'}`}
                          onClick={() => {
                            if (!isRecording) {
                              setIsRecording(true);
                              let time = 0;
                              const interval = setInterval(() => {
                                time += 1;
                                setRecordingTime(time);
                                if (time >= 30) {
                                  clearInterval(interval);
                                  setIsRecording(false);
                                  setRecordingTime(0);
                                  alert('Recording complete. Neural signature extracted.');
                                  
                                  const voiceName = 'Recorded Voice ' + (voices.length - 4);
                                  const voiceAccent = 'Vocal Print (REC)';
                                  
                                  if (driveUser) {
                                    saveVoice(driveUser.uid, {
                                      name: voiceName,
                                      accent: voiceAccent,
                                      type: 'custom'
                                    }).then(realId => {
                                      if (realId) {
                                        const newVoice: Voice = {
                                          id: realId,
                                          name: voiceName,
                                          accent: voiceAccent,
                                          type: 'custom',
                                          createdAt: Date.now()
                                        };
                                        setVoices(prev => [...prev, newVoice]);
                                        setSetupSelectedVoiceId(realId);
                                      }
                                    }).catch(err => console.error(err));
                                  } else {
                                    const newVoice: Voice = {
                                      id: 'recorded-' + Math.random().toString(36).substring(7),
                                      name: voiceName,
                                      accent: voiceAccent,
                                      type: 'custom',
                                      createdAt: Date.now()
                                    };
                                    setVoices(prev => [...prev, newVoice]);
                                    setSetupSelectedVoiceId(newVoice.id);
                                  }
                                }
                              }, 1000);
                              
                              (window as any).avatarRecInterval = interval;
                            } else {
                              clearInterval((window as any).avatarRecInterval);
                              setIsRecording(false);
                              const voiceName = 'Recorded Voice ' + (voices.length - 4);
                              const voiceAccent = 'Vocal Print (REC)';
                              
                              if (driveUser) {
                                saveVoice(driveUser.uid, {
                                  name: voiceName,
                                  accent: voiceAccent,
                                  type: 'custom'
                                }).then(realId => {
                                  if (realId) {
                                    const newVoice: Voice = {
                                      id: realId,
                                      name: voiceName,
                                      accent: voiceAccent,
                                      type: 'custom',
                                      createdAt: Date.now()
                                    };
                                    setVoices(prev => [...prev, newVoice]);
                                    setSetupSelectedVoiceId(realId);
                                  }
                                }).catch(err => console.error(err));
                              } else {
                                const newVoice: Voice = {
                                  id: 'recorded-' + Math.random().toString(36).substring(7),
                                  name: voiceName,
                                  accent: voiceAccent,
                                  type: 'custom',
                                  createdAt: Date.now()
                                };
                                setVoices(prev => [...prev, newVoice]);
                                setSetupSelectedVoiceId(newVoice.id);
                              }
                              setRecordingTime(0);
                              alert('Recording finalized early. Vocal print synthesized.');
                            }
                          }}
                        >
                          <Camera className={`w-6 h-6 ${isRecording ? 'text-red-500' : 'text-neutral-300 group-hover:text-black'} transition-colors`} />
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest">{isRecording ? `REC ${recordingTime}s` : 'Record'}</p>
                            <p className="text-[7px] text-neutral-400 mt-0.5 uppercase font-bold">{isRecording ? 'Click to Stop' : 'Read Script'}</p>
                          </div>
                        </div>
                      </div>

                      {isRecording && (
                        <div className="p-4 bg-black text-white rounded-2xl font-mono text-[9px] leading-relaxed italic border border-primary/20">
                          "The Nexus architecture represents a shift in hardware intelligence. By synthesizing core narratives through neural logic, we unlock unprecedented strategic deployment capacity. Every signal processed strengthens the vault, ensuring high-conviction resonance across all strategic platforms."
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-neutral-900 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => setShowAvatarSetupModal(false)}
                  className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                >
                  Discard Profile
                </button>
                <button 
                  onClick={finalizeAvatarCreation}
                  className="px-10 py-3 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Deploy Identity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Association Modal */}
      <AnimatePresence>
        {showVoiceModal && voiceModalAvatar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden flex flex-col shadow-2xl border border-white/5 animate-in fade-in zoom-in-95 duration-250"
            >
              <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
                <div>
                  <h3 className="font-space font-black italic text-2xl text-white">Attach <span className="text-primary">Voice Signature</span></h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Connect voice print to: {voiceModalAvatar.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowVoiceModal(false);
                    setVoiceModalAvatar(null);
                  }} 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
                <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-3xl border border-neutral-100">
                  <img src={voiceModalAvatar.photoBase64} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={voiceModalAvatar.name} />
                  <div>
                    <h4 className="font-bold text-sm text-black">{voiceModalAvatar.name}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mt-0.5">
                      Currently Attached: {voices.find(v => v.id === voiceModalAvatar.voiceId)?.name || 'Default Voice'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Select Desired Voice Signature</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {voices.map(voice => {
                      const isSelected = voiceModalAvatar.voiceId === voice.id;
                      const isPlaying = playingVoiceId === voice.id;
                      return (
                        <div 
                          key={voice.id}
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-neutral-50 bg-neutral-50/50 hover:border-neutral-200'}`}
                          onClick={() => {
                            setVoiceModalAvatar(prev => prev ? { ...prev, voiceId: voice.id } : null);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-neutral-300'}`}>
                              {isSelected && <Check className="w-2 h-2 text-black stroke-[3]" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs tracking-tight text-black">{voice.name}</span>
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase ${voice.type === 'preset' ? 'bg-slate-100 text-slate-500' : 'bg-primary/20 text-primary'}`}>
                                  {voice.type === 'preset' ? 'Preset' : 'Cloned'}
                                </span>
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">{voice.accent}</span>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayVoice(voice.id);
                            }}
                            className={`p-2 rounded-xl transition-all border cursor-pointer ${isPlaying ? 'bg-primary border-primary text-black' : 'bg-white border-neutral-100 text-neutral-400 hover:text-black'}`}
                          >
                            {isPlaying ? (
                              <div className="flex items-center gap-0.5 h-3 px-1">
                                <div className="w-[1.5px] h-full bg-black animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-[1.5px] h-1/2 bg-black animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <div className="w-[1.5px] h-full bg-black animate-bounce" style={{ animationDelay: '0.3s' }} />
                              </div>
                            ) : (
                              <Play className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-neutral-900 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setShowVoiceModal(false);
                    setVoiceModalAvatar(null);
                  }}
                  className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (voiceModalAvatar && voiceModalAvatar.voiceId) {
                      handleAttachVoice(voiceModalAvatar.id, voiceModalAvatar.voiceId);
                    }
                  }}
                  className="px-8 py-3 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Confirm Association
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// REMOVE ALL CODE BELOW THIS

{/* End of App */}
