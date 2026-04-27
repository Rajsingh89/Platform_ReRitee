import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Plus,
  X,
  Smile,
  Reply,
  Trash2,
  Pin,
  Search,
  Users,
  Circle,
  MoreVertical,
  Mic,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Maximize2,
  Minimize2,
  Copy,
  Download,
  Check,
  CheckCheck,
  ArrowDown,
  ArrowRight,
  Edit3,
  Sparkles,
  LayoutList,
  Star,
  AtSign,
  ShieldAlert,
  UserX,
  Flag,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
  reactions: Record<string, string[]>;
  replyTo?: { id: string; username: string; text: string };
  isPinned?: boolean;
  isEdited?: boolean;
  isStarred?: boolean;
  isReported?: boolean;
  moderation?: {
    score: number;
    isPromo: boolean;
  };
  type: "text" | "system";
  audioData?: string;       // base64 encoded audio blob
  audioDuration?: number;   // seconds
  isOneTimeAudio?: boolean; // disappears after first play
  imageData?: string;
  imageName?: string;
}

interface OnlineUser {
  username: string;
  avatar: string;
  joinedAt: number;
  isTyping?: boolean;
}

interface DirectMessage {
  id: string;
  conversationId: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  isRead?: boolean;
  imageData?: string;
  imageName?: string;
  audioData?: string;
  audioDuration?: number;
  isOneTimeAudio?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
}

interface DirectConversation {
  id: string;
  participants: [string, string];
  createdAt: number;
  updatedAt: number;
  messages: DirectMessage[];
}

interface ChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showBackButton?: boolean;
  backLabel?: string;
  onBack?: () => void;
}

type ChatSection = "chat" | "direct" | "highlights" | "people" | "insights";
type ChatFilter = "all" | "mine" | "media" | "voice" | "links" | "mentions" | "pinned" | "starred";

interface MsgMenuAnchor {
  top: number;
  bottom: number;
  left: number;
  right: number;
  preferRight: boolean;
}

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "👀", "🎉", "💡", "✅", "👏", "🚀", "💯", "🤔", "😍", "🙌", "⭐", "💪"];
const FULL_EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😆", "🥹", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
  "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
  "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶", "🫥", "😐", "🫤", "😑", "😬", "🙄",
  "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "💀", "☠️",
  "👻", "👽", "🤖", "💩", "🙈", "🙉", "🙊", "💋", "💯", "💥", "💫", "💦", "💨", "🕳️", "💬", "🗨️", "🧠", "❤️", "🩷", "🧡",
  "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "👍", "👎", "👏", "🙌", "🫶", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👊", "✊",
  "🤛", "🤜", "🫵", "👋", "🤚", "🖐️", "✋", "🖖", "🙏", "💪", "🫱", "🫲", "👀", "👁️", "🫦", "👄", "🐶", "🐱", "🦊", "🐻",
  "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🦄", "🐝", "🦋", "🌸", "🌼", "🌻", "🌷",
  "🌹", "🌺", "🍀", "🌿", "🌱", "🍎", "🍉", "🍌", "🍓", "🍒", "🍍", "🥭", "🍕", "🍔", "🍟", "🌭", "🍿", "🥗", "🍣", "🍩",
  "☕", "🍵", "🧃", "🥤", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🎯", "🎮", "🎧", "🎤", "🎹", "🥁", "🚗", "✈️", "🚀", "🛸",
  "🏠", "🏢", "🌍", "🌙", "⭐", "☀️", "⚡", "🔥", "❄️", "💧", "✅", "❌", "⚠️", "❓", "❗", "➕", "➖", "➡️", "⬅️", "🔔",
  "🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🏳️‍⚧️", "🇮🇳", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇰🇷", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇧🇷", "🇦🇪", "🇿🇦",
  "🐺", "🦝", "🦓", "🦒", "🦘", "🦬", "🦣", "🦏", "🐘", "🦛", "🦘", "🐫", "🦙", "🦥", "🦦", "🦨", "🦔", "🐿️", "🦫", "🦘",
  "🦅", "🦉", "🦜", "🕊️", "🦢", "🦩", "🦚", "🦤", "🪽", "🐦‍⬛", "🦆", "🐓", "🐇", "🐁", "🐀", "🐉", "🦕", "🦖", "🐍", "🦎",
  "🍇", "🍈", "🍋", "🍊", "🍐", "🥝", "🍅", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🧄", "🧅", "🍄", "🥔", "🍠",
  "🧂", "🫚", "🫒", "🫘", "🥜", "🌰", "🥐", "🥖", "🧀", "🥚", "🍗", "🥩", "🍤", "🍜", "🍛", "🍲", "🥟", "🍱", "🍙", "🍘",
  "♟️", "🎲", "🧩", "🪀", "🪁", "🏓", "🏸", "🥊", "🥋", "🏹", "⛳", "🏒", "🥅", "🎳", "🎰", "🕹️", "🎯", "🎮", "🛹", "🚴",
  "🐼", "🦧", "🦍", "🐅", "🐆", "🦌", "🦦", "🐳", "🐋", "🐬", "🦈", "🐢", "🦭", "🦑", "🐙", "🪼", "🦀", "🦞", "🐠", "🐟",
  "🦬", "🐘", "🦏", "🦍", "🐅", "🐆", "🦧", "🦒", "🦣", "🦦"
];
const COUNTRY_FLAG_CODES = [
  "AF", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BT",
  "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CD",
  "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FJ", "FI",
  "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IR", "IQ",
  "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI",
  "LT", "LU", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR", "MU", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM",
  "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "MK", "NO", "OM", "PK", "PW", "PA", "PG", "PY", "PE", "PH", "PL", "PT",
  "QA", "RO", "RU", "RW", "KN", "LC", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB", "SO",
  "ZA", "ES", "LK", "SD", "SS", "SR", "SE", "CH", "SY", "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN", "TR", "TM", "TV", "UG",
  "UA", "AE", "GB", "US", "UY", "UZ", "VU", "VE", "VN", "YE", "ZM", "ZW", "PS", "TW", "XK", "VA"
];
const toFlagEmoji = (countryCode: string) =>
  countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const COUNTRY_FLAG_EMOJIS = COUNTRY_FLAG_CODES.map(toFlagEmoji);
const FULL_EMOJI_CATALOG = Array.from(new Set([...FULL_EMOJI_LIST, ...COUNTRY_FLAG_EMOJIS]));

const STICKER_BASE = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😎", "🥳", "🤩", "😴", "🤯", "🤖", "👻", "💖", "🔥", "⭐", "🌈", "🎉", "🎮", "⚽",
  "🏀", "🎲", "🍕", "🍔", "🍟", "🍉", "🍓", "🥑", "🌶️", "🧄", "🧅", "🫚", "🦜", "🦉", "🦅", "🐼", "🐯", "🦁", "🐸", "🦄",
  "🌸", "🌻", "🌍", "🚀", "🏁", "💎", "🎯", "🎵", "🧠", "✅", "🇮🇳", "🇺🇸", "🇬🇧", "🇯🇵", "🇧🇷", "🇿🇦", "🇦🇪", "🇫🇷", "🇩🇪", "🇮🇹"
];
const STICKER_LIBRARY = Array.from({ length: 2200 }, (_, index) => ({
  id: `sticker-${index + 1}`,
  emoji: STICKER_BASE[index % STICKER_BASE.length],
  label: `Sticker ${index + 1}`,
}));
const MAX_MESSAGE_LENGTH = 1000;
const MAX_VOICE_DURATION = 350; // 6 minutes
const MAX_IMAGE_UPLOAD_BYTES = 6 * 1024 * 1024;
const PROMO_KEYWORDS = [
  "join my channel",
  "dm me",
  "crypto",
  "giveaway",
  "100% profit",
  "guaranteed return",
  "buy now",
  "whatsapp",
  "telegram",
  "subscribe",
  "click link",
  "promotion",
  "sponsor",
  "earn money",
];
const CHAT_STORAGE_KEY = "reritee-chat-messages";
const DIRECT_STORAGE_KEY = "reritee-direct-conversations";
const USER_STORAGE_KEY = "reritee-chat-user";
const COMMUNITY_JOINED_STORAGE_KEY = "reritee-community-joined";
const DRAFT_STORAGE_PREFIX = "reritee-chat-draft";
const DIRECT_DRAFT_STORAGE_PREFIX = "reritee-direct-draft";
const CHANNEL_NAME = "reritee-chat-channel";
const CHAT_FILTER_OPTIONS: Array<{ key: ChatFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "mine", label: "Mine" },
  { key: "media", label: "Media" },
  { key: "voice", label: "Voice" },
  { key: "links", label: "Links" },
  { key: "mentions", label: "Mentions" },
  { key: "pinned", label: "Pinned" },
  { key: "starred", label: "Starred" },
];

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-orange-500",
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getAvatarSticker = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return STICKER_BASE[Math.abs(hash) % STICKER_BASE.length];
};

const hasLinkInText = (text: string) => /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|in|net|org|io|app|ai)\b)/i.test(text);

const buildDirectConversationId = (userA: string, userB: string) =>
  [userA.trim().toLowerCase(), userB.trim().toLowerCase()].sort().join("::");

const buildDirectParticipants = (userA: string, userB: string): [string, string] =>
  [userA, userB].sort((left, right) => left.localeCompare(right)) as [string, string];

const getDirectPreview = (message?: DirectMessage) => {
  if (!message) return "No messages yet";
  if (message.imageData && !message.text.trim()) return "📷 Photo";
  if (message.imageData && message.text.trim()) return `📷 ${message.text}`;
  return message.text.length > 56 ? `${message.text.slice(0, 56)}...` : message.text;
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const compressImageFile = (file: File) =>
  new Promise<{ dataUrl: string; imageName: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1280;
        const ratio = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        let quality = 0.86;
        let output = canvas.toDataURL("image/jpeg", quality);
        const maxDataUrlLength = 850_000;
        while (output.length > maxDataUrlLength && quality > 0.45) {
          quality -= 0.08;
          output = canvas.toDataURL("image/jpeg", quality);
        }

        resolve({ dataUrl: output, imageName: file.name || "photo.jpg" });
      };
      image.onerror = () => reject(new Error("Invalid image"));
      image.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(file);
  });

const MENTION_REGEX = /@[a-zA-Z0-9_]+/g;

const renderMessageText = (text: string, isOwn: boolean) => {
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const nodes: ReactNode[] = [];
    let cursor = 0;

    for (const match of line.matchAll(MENTION_REGEX)) {
      const token = match[0];
      const tokenIndex = match.index ?? 0;

      if (tokenIndex > cursor) {
        nodes.push(<span key={`text-${lineIndex}-${cursor}`}>{line.slice(cursor, tokenIndex)}</span>);
      }

      nodes.push(
        <span
          key={`mention-${lineIndex}-${tokenIndex}`}
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[0.92em] font-medium",
            isOwn ? "bg-white/15 text-white" : "bg-universe-highlight/10 text-universe-highlight"
          )}
        >
          {token}
        </span>
      );

      cursor = tokenIndex + token.length;
    }

    if (cursor < line.length) {
      nodes.push(<span key={`tail-${lineIndex}-${cursor}`}>{line.slice(cursor)}</span>);
    }

    return (
      <span key={`line-${lineIndex}`}>
        {nodes.length > 0 ? nodes : <span>&nbsp;</span>}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

const DirectMessageStatus = ({ isRead }: { isRead?: boolean }) => {
  if (isRead) {
    return (
      <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-rose-500/20 text-rose-400" title="Seen">
        <CheckCheck className="w-3 h-3" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center text-universe-muted" title="Sent">
      <Check className="w-3 h-3" />
    </span>
  );
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ---------- VoiceNotePlayer ----------
const VoiceNotePlayer = ({
  audioData,
  duration,
  isOneTime,
  isOwn,
}: {
  audioData: string;
  duration: number;
  isOneTime?: boolean;
  isOwn: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [played, setPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const getAudioUrl = useCallback(() => {
    if (urlRef.current) return urlRef.current;
    try {
      const parts = audioData.split(",");
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      urlRef.current = URL.createObjectURL(blob);
      return urlRef.current;
    } catch {
      return "";
    }
  }, [audioData]);

  const togglePlay = () => {
    if (isOneTime && played && !isPlaying) return;
    if (!audioRef.current) {
      const url = getAudioUrl();
      if (!url) return;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (isOneTime) setPlayed(true);
      };
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  if (isOneTime && played && !isPlaying) {
    return (
      <div className={cn("flex items-center gap-1.5 py-0.5 text-[11px]", isOwn ? "text-white/50" : "text-universe-muted")}>
        <span>🎤</span>
        <span>Played · one-time</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5 min-w-[148px] max-w-[220px]">
      <button
        onClick={togglePlay}
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
          isOwn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-universe-700 hover:bg-universe-600 text-universe-foreground"
        )}
        title={isPlaying ? "Pause" : isOneTime ? "Play (once)" : "Play"}
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-0.5">
        <div className={cn("w-full h-1 rounded-full overflow-hidden", isOwn ? "bg-white/20" : "bg-universe-700")}>
          <div
            className={cn("h-full rounded-full transition-all duration-100", isOwn ? "bg-white/70" : "bg-universe-highlight")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className={cn("text-[9px]", isOwn ? "text-white/50" : "text-universe-muted")}>
            {isPlaying ? formatDuration(Math.floor(currentTime)) : formatDuration(duration)}
          </span>
          {isOneTime && (
            <span className={cn("text-[9px] flex items-center gap-0.5", isOwn ? "text-white/50" : "text-universe-muted")}>
              👁️ once
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatRoom = ({
  isOpen,
  onClose,
  isExpanded = false,
  onToggleExpand,
  showBackButton = false,
  backLabel = "Back to Dashboard",
  onBack,
}: ChatRoomProps) => {
  const [username, setUsername] = useState(() => localStorage.getItem(USER_STORAGE_KEY) || "");
  const [usernameInput, setUsernameInput] = useState("");
  const [isJoined, setIsJoined] = useState(() => {
    const joinedValue = localStorage.getItem(COMMUNITY_JOINED_STORAGE_KEY);
    if (joinedValue === "1") return true;
    if (joinedValue === "0") return false;
    return !!localStorage.getItem(USER_STORAGE_KEY);
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [directConversations, setDirectConversations] = useState<Record<string, DirectConversation>>(() => {
    const stored = localStorage.getItem(DIRECT_STORAGE_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored) as Record<string, DirectConversation>;
    } catch {
      return {};
    }
  });
  const [inputText, setInputText] = useState("");
  const [directInputText, setDirectInputText] = useState("");
  const [selectedDirectId, setSelectedDirectId] = useState<string | null>(null);
  const [pendingDirectTarget, setPendingDirectTarget] = useState<string | null>(null);
  const [directSearchQuery, setDirectSearchQuery] = useState("");
  const [directTypingUser, setDirectTypingUser] = useState<string | null>(null);
  const [showEmojiForMsg, setShowEmojiForMsg] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState<string | null>(null);
  const [showDirectMsgMenu, setShowDirectMsgMenu] = useState<string | null>(null);
  const [msgMenuAnchor, setMsgMenuAnchor] = useState<MsgMenuAnchor | null>(null);
  const [msgMenuPosition, setMsgMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDirectEmojiPicker, setShowDirectEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [directListOnlyMode, setDirectListOnlyMode] = useState(false);
  const [profilePreviewUser, setProfilePreviewUser] = useState<string | null>(null);
  const [emojiSearchQuery, setEmojiSearchQuery] = useState("");
  const [stickerSearchQuery, setStickerSearchQuery] = useState("");
  const [visibleStickerCount, setVisibleStickerCount] = useState(240);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceRecordingTarget, setVoiceRecordingTarget] = useState<"community" | "direct">("community");
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [isOneTimeAudio, setIsOneTimeAudio] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(28).fill(2));
  const [activeSection, setActiveSection] = useState<ChatSection>("chat");
  const [chatFilter, setChatFilter] = useState<ChatFilter>("all");
  const [hidePromoMessages] = useState(true);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [composerWarning, setComposerWarning] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const directMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const directContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const directInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const directImageInputRef = useRef<HTMLInputElement>(null);
  const composerToolsRef = useRef<HTMLDivElement>(null);
  const msgMenuRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const directTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const waveformAnimRef = useRef<number | null>(null);
  const lastDirectMessageCountRef = useRef(0);
  const lastDirectConversationRef = useRef<string | null>(null);

  const closeMsgMenu = useCallback(() => {
    setShowMsgMenu(null);
    setMsgMenuAnchor(null);
    setMsgMenuPosition(null);
  }, []);

  const closeDirectMsgMenu = useCallback(() => {
    setShowDirectMsgMenu(null);
  }, []);

  const openMsgMenu = useCallback((id: string, triggerEl: HTMLElement, preferRight: boolean) => {
    const rect = triggerEl.getBoundingClientRect();
    setShowMsgMenu(id);
    setMsgMenuAnchor({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      preferRight,
    });
    setMsgMenuPosition(null);
  }, []);

  const playNotifSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.08;
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      return;
    }
  }, []);

  const broadcast = useCallback((type: string, payload: unknown) => {
    try {
      channelRef.current?.postMessage({ type, payload });
    } catch {
      return;
    }
  }, []);

  const upsertDirectMessage = useCallback((message: DirectMessage) => {
    setDirectConversations((prev) => {
      const existingConversation = prev[message.conversationId];
      if (existingConversation?.messages.some((entry) => entry.id === message.id)) return prev;

      const nextConversation: DirectConversation = existingConversation
        ? {
            ...existingConversation,
            updatedAt: message.timestamp,
            messages: [...existingConversation.messages, message].slice(-250),
          }
        : {
            id: message.conversationId,
            participants: buildDirectParticipants(message.from, message.to),
            createdAt: message.timestamp,
            updatedAt: message.timestamp,
            messages: [message],
          };

      return {
        ...prev,
        [message.conversationId]: nextConversation,
      };
    });
  }, []);

  const openDirectConversation = useCallback(
    (targetUsername: string) => {
      if (!username || !targetUsername || targetUsername === username) return;

      const conversationId = buildDirectConversationId(username, targetUsername);
      setDirectListOnlyMode(false);
      setSelectedDirectId((prev) => (directConversations[conversationId]?.messages.length ? conversationId : prev));
      setPendingDirectTarget(targetUsername);
      if (directConversations[conversationId]?.messages.length) {
        setSelectedDirectId(conversationId);
      } else {
        setSelectedDirectId(null);
      }
      setActiveSection("direct");
      setDirectSearchQuery("");
      setDirectTypingUser(null);
      closeMsgMenu();
      setTimeout(() => directInputRef.current?.focus(), 0);
    },
    [closeMsgMenu, directConversations, username]
  );

  const markDirectConversationRead = useCallback(
    (conversationId: string, reader: string) => {
      setDirectConversations((prev) => {
        const conversation = prev[conversationId];
        if (!conversation) return prev;

        const nextMessages = conversation.messages.map((message) => {
          if (message.to === reader && !message.isRead) {
            return { ...message, isRead: true };
          }
          return message;
        });

        if (nextMessages.every((message, index) => message === conversation.messages[index])) return prev;

        return {
          ...prev,
          [conversationId]: {
            ...conversation,
            messages: nextMessages,
          },
        };
      });
    },
    []
  );

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        switch (type) {
          case "NEW_MESSAGE":
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) return prev;
              return [...prev, payload];
            });
            if (!isAtBottom && activeSection === "chat") setUnreadCount((p) => p + 1);
            if (soundEnabled) playNotifSound();
            break;
          case "UNSEND_MESSAGE":
            setMessages((prev) => prev.filter((m) => !(m.id === payload.id && m.username === payload.username)));
            break;
          case "USER_JOIN":
            setOnlineUsers((prev) => {
              if (prev.find((u) => u.username === payload.username)) return prev;
              return [...prev, payload];
            });
            break;
          case "USER_LEAVE":
            setOnlineUsers((prev) => prev.filter((u) => u.username !== payload.username));
            break;
          case "TYPING":
            if (payload.username !== username) {
              setTypingUsers((prev) => {
                if (payload.isTyping && !prev.includes(payload.username)) return [...prev, payload.username];
                if (!payload.isTyping) return prev.filter((u) => u !== payload.username);
                return prev;
              });
            }
            break;
          case "CLEAR_MESSAGES":
            setMessages([]);
            break;
          case "DIRECT_MESSAGE":
            if (payload.from !== username && payload.to !== username) break;
            upsertDirectMessage(payload);
            if (payload.to === username) {
              if (activeSection !== "direct" || selectedDirectId !== payload.conversationId) {
                if (soundEnabled) playNotifSound();
              }
            }
            break;
          case "DIRECT_TYPING":
            if (payload.to !== username) break;
            if (payload.isTyping && selectedDirectId === payload.conversationId) {
              setDirectTypingUser(payload.from);
            } else if (!payload.isTyping && directTypingUser === payload.from) {
              setDirectTypingUser(null);
            }
            break;
          case "DIRECT_UNSEND":
            setDirectConversations((prev) => {
              const conversation = prev[payload.conversationId];
              if (!conversation) return prev;

              const nextMessages = conversation.messages.filter((message) => message.id !== payload.messageId);
              if (nextMessages.length === conversation.messages.length) return prev;

              if (nextMessages.length === 0) {
                const next = { ...prev };
                delete next[payload.conversationId];
                return next;
              }

              return {
                ...prev,
                [payload.conversationId]: {
                  ...conversation,
                  messages: nextMessages,
                  updatedAt: nextMessages[nextMessages.length - 1].timestamp,
                },
              };
            });
            break;
          default:
            break;
        }
      };
    } catch {
      return;
    }
    return () => {
      channelRef.current?.close();
    };
  }, [activeSection, directTypingUser, isAtBottom, playNotifSound, selectedDirectId, soundEnabled, upsertDirectMessage, username]);

  useEffect(() => {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return;
    try {
      setMessages(JSON.parse(stored));
    } catch {
      return;
    }
  }, []);



  useEffect(() => {
    if (messages.length === 0) return;
    // Strip audioData before persisting — blobs are too large for localStorage
    try {
      const storableMessages = messages.slice(-300).map((msg) =>
        msg.audioData ? { ...msg, audioData: undefined } : msg
      );
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(storableMessages));
    } catch {
      // localStorage quota exceeded — skip silently
    }
  }, [messages]);

  useEffect(() => {
    try {
      const persistedConversations = Object.fromEntries(
        Object.entries(directConversations).filter(([, conversation]) => conversation.messages.length > 0)
      );
      localStorage.setItem(DIRECT_STORAGE_KEY, JSON.stringify(persistedConversations));
    } catch {
      return;
    }
  }, [directConversations]);

  useEffect(() => {
    if (!isJoined || !username) return;
    const storedDraft = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}:${username}`);
    if (storedDraft) setInputText(storedDraft);
  }, [isJoined, username]);

  useEffect(() => {
    if (username) setUsernameInput(username);
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const draftKey = `${DRAFT_STORAGE_PREFIX}:${username}`;
    if (!inputText.trim()) {
      localStorage.removeItem(draftKey);
      return;
    }
    localStorage.setItem(draftKey, inputText.slice(0, MAX_MESSAGE_LENGTH));
  }, [inputText, username]);

  useEffect(() => {
    const directDraftId = selectedDirectId ?? (pendingDirectTarget ? buildDirectConversationId(username, pendingDirectTarget) : null);
    if (!username || !directDraftId) return;

    const draftKey = `${DIRECT_DRAFT_STORAGE_PREFIX}:${username}:${directDraftId}`;
    const storedDraft = localStorage.getItem(draftKey);
    setDirectInputText(storedDraft || "");
  }, [pendingDirectTarget, selectedDirectId, username]);

  useEffect(() => {
    const directDraftId = selectedDirectId ?? (pendingDirectTarget ? buildDirectConversationId(username, pendingDirectTarget) : null);
    if (!username || !directDraftId) return;

    const draftKey = `${DIRECT_DRAFT_STORAGE_PREFIX}:${username}:${directDraftId}`;
    if (!directInputText.trim()) {
      localStorage.removeItem(draftKey);
      return;
    }

    localStorage.setItem(draftKey, directInputText.slice(0, MAX_MESSAGE_LENGTH));
  }, [directInputText, pendingDirectTarget, selectedDirectId, username]);

  useEffect(() => {
    if (!isAtBottom || activeSection !== "chat") return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  }, [activeSection, isAtBottom, messages]);

  useEffect(() => {
    if (activeSection !== "direct" || !selectedDirectId) {
      lastDirectConversationRef.current = null;
      lastDirectMessageCountRef.current = 0;
      return;
    }

    const selectedConversation = directConversations[selectedDirectId];
    if (!selectedConversation) return;

    const isConversationChanged = lastDirectConversationRef.current !== selectedDirectId;
    const hasNewMessage = selectedConversation.messages.length > lastDirectMessageCountRef.current;

    if (isConversationChanged || hasNewMessage) {
      directMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    lastDirectConversationRef.current = selectedDirectId;
    lastDirectMessageCountRef.current = selectedConversation.messages.length;
    markDirectConversationRead(selectedDirectId, username);
  }, [activeSection, directConversations, markDirectConversationRead, selectedDirectId, username]);

  useEffect(() => {
    const conversationIds = Object.keys(directConversations).filter(
      (conversationId) =>
        directConversations[conversationId].participants.includes(username) && directConversations[conversationId].messages.length > 0
    );

    if (conversationIds.length === 0) {
      if (selectedDirectId) setSelectedDirectId(null);
      return;
    }

    if (
      (!selectedDirectId || !directConversations[selectedDirectId] || directConversations[selectedDirectId].messages.length === 0) &&
      !pendingDirectTarget &&
      !directListOnlyMode
    ) {
      const nextConversationId = [...conversationIds].sort(
        (left, right) => directConversations[right].updatedAt - directConversations[left].updatedAt
      )[0];
      setSelectedDirectId(nextConversationId);
    }
  }, [directConversations, directListOnlyMode, pendingDirectTarget, selectedDirectId, username]);

  useEffect(() => {
    if (!notifEnabled) return;

    const totalDirectUnread = Object.values(directConversations).reduce(
      (total, conversation) =>
        total + conversation.messages.filter((message) => message.to === username && !message.isRead).length,
      0
    );

    const totalUnread = unreadCount + totalDirectUnread;
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ReRitee Chat`;
      return;
    }

    document.title = "ReRitee";
    return () => {
      document.title = "ReRitee";
    };
  }, [directConversations, notifEnabled, unreadCount, username]);

  useEffect(() => {
    if (!showMsgMenu || !msgMenuAnchor || !msgMenuRef.current) return;

    const menuRect = msgMenuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const edgePadding = 8;

    let left = msgMenuAnchor.preferRight ? msgMenuAnchor.right - menuRect.width : msgMenuAnchor.left;
    left = Math.min(Math.max(left, edgePadding), viewportWidth - menuRect.width - edgePadding);

    let top = msgMenuAnchor.bottom + 8;
    if (top + menuRect.height > viewportHeight - edgePadding) {
      top = msgMenuAnchor.top - menuRect.height - 8;
    }
    top = Math.min(Math.max(top, edgePadding), viewportHeight - menuRect.height - edgePadding);

    setMsgMenuPosition({ top, left });
  }, [showMsgMenu, msgMenuAnchor]);

  useEffect(() => {
    if (!showMsgMenu) return;

    const handleWindowResize = () => closeMsgMenu();
    const handleOutsideClick = (event: MouseEvent) => {
      if (msgMenuRef.current?.contains(event.target as Node)) return;
      closeMsgMenu();
    };

    window.addEventListener("resize", handleWindowResize);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [closeMsgMenu, showMsgMenu]);

  useEffect(() => {
    if (!showEmojiPicker && !showAttachmentMenu && !showStickerPicker && !showDirectEmojiPicker) return;

    const handleOutsideToolsClick = (event: MouseEvent) => {
      if (composerToolsRef.current?.contains(event.target as Node)) return;
      setShowEmojiPicker(false);
      setShowDirectEmojiPicker(false);
      setShowAttachmentMenu(false);
      setShowStickerPicker(false);
    };

    document.addEventListener("mousedown", handleOutsideToolsClick);
    return () => document.removeEventListener("mousedown", handleOutsideToolsClick);
  }, [showAttachmentMenu, showDirectEmojiPicker, showEmojiPicker, showStickerPicker]);

  useEffect(() => {
    if (!isVoiceRecording || isVoicePaused) {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
        voiceIntervalRef.current = null;
      }
      return;
    }

    voiceIntervalRef.current = setInterval(() => {
      setVoiceDuration((prev) => {
        if (prev + 1 >= MAX_VOICE_DURATION) {
          clearInterval(voiceIntervalRef.current!);
          voiceIntervalRef.current = null;
        }
        return Math.min(prev + 1, MAX_VOICE_DURATION);
      });
    }, 1000);

    return () => {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current);
        voiceIntervalRef.current = null;
      }
    };
  }, [isVoicePaused, isVoiceRecording]);

  useEffect(() => {
    if (!isJoined || !username) return;
    const user: OnlineUser = { username, avatar: "", joinedAt: Date.now() };
    broadcast("USER_JOIN", user);
    setOnlineUsers((prev) => {
      if (prev.find((u) => u.username === username)) return prev;
      return [...prev, user];
    });

    const handleBeforeUnload = () => broadcast("USER_LEAVE", { username });
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      broadcast("USER_LEAVE", { username });
    };
  }, [broadcast, isJoined, username]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    setIsAtBottom(atBottom);
    if (atBottom) setUnreadCount(0);
  }, []);

  const handleTyping = () => {
    if (!username) return;
    if (!isTyping) {
      setIsTyping(true);
      broadcast("TYPING", { username, isTyping: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcast("TYPING", { username, isTyping: false });
    }, 2000);
  };

  const handleDirectTyping = () => {
    if (!username || !activeDirectPartner) return;

    const conversationId = selectedDirectId ?? buildDirectConversationId(username, activeDirectPartner);

    broadcast("DIRECT_TYPING", {
      conversationId,
      from: username,
      to: activeDirectPartner,
      isTyping: true,
    });

    if (directTypingTimeoutRef.current) clearTimeout(directTypingTimeoutRef.current);
    directTypingTimeoutRef.current = setTimeout(() => {
      broadcast("DIRECT_TYPING", {
        conversationId,
        from: username,
        to: activeDirectPartner,
        isTyping: false,
      });
    }, 1800);
  };

  const getModerationScore = (text: string) => {
    const normalized = text.toLowerCase();
    const matchedKeywords = PROMO_KEYWORDS.filter((keyword) => normalized.includes(keyword)).length;
    const linkMatches = (normalized.match(/https?:\/\//g) || []).length + (normalized.match(/\.com|\.in|\.net|\.org/g) || []).length;
    const uppercaseRatio = text.length > 0 ? text.replace(/[^A-Z]/g, "").length / text.length : 0;
    const repeatedPunct = /([!?.])\1{3,}/.test(text) ? 1 : 0;

    const score = matchedKeywords * 2 + linkMatches + (uppercaseRatio > 0.45 ? 1 : 0) + repeatedPunct;
    return {
      score,
      isPromo: score >= 3,
    };
  };

  const muteUser = (name: string) => {
    if (!name || name === username) return;
    setMutedUsers((prev) => new Set([...prev, name]));
    setShowMsgMenu(null);
  };

  const unmuteUser = (name: string) => {
    setMutedUsers((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const joinChat = () => {
    const savedUsername = localStorage.getItem(USER_STORAGE_KEY)?.trim() || "";
    const name = savedUsername || usernameInput.trim();
    if (!name || name.length < 2) return;
    const safeName = name.replace(/[<>&"']/g, "").slice(0, 20);
    setUsername(safeName);
    if (!savedUsername) {
      localStorage.setItem(USER_STORAGE_KEY, safeName);
    }
    localStorage.setItem(COMMUNITY_JOINED_STORAGE_KEY, "1");
    setIsJoined(true);

    const sysMsg: ChatMessage = {
      id: generateId(),
      username: "System",
      avatar: "",
      text: `${safeName} joined the chat 🎉`,
      timestamp: Date.now(),
      reactions: {},
      type: "system",
    };
    setMessages((prev) => [...prev, sysMsg]);
    broadcast("NEW_MESSAGE", sysMsg);
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !username) return;
    if (text.length > MAX_MESSAGE_LENGTH) return;

    const moderation = getModerationScore(text);
    if (moderation.score >= 6) {
      setComposerWarning("Message blocked: looks like promotion/spam. Please rewrite naturally.");
      return;
    }

    if (editingMsg) {
      setMessages((prev) => prev.map((m) => (m.id === editingMsg.id ? { ...m, text, isEdited: true } : m)));
      setEditingMsg(null);
      setInputText("");
      return;
    }

    const msg: ChatMessage = {
      id: generateId(),
      username,
      avatar: "",
      text,
      timestamp: Date.now(),
      reactions: {},
      replyTo: replyingTo
        ? { id: replyingTo.id, username: replyingTo.username, text: replyingTo.text.slice(0, 80) }
        : undefined,
      moderation,
      type: "text",
    };
    setMessages((prev) => [...prev, msg]);
    broadcast("NEW_MESSAGE", msg);
    setInputText("");
    setReplyingTo(null);
    setShowEmojiForMsg(null);
    setIsAtBottom(true);
    setActiveSection("chat");
    setShowMentionPicker(false);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    setShowStickerPicker(false);
    setComposerWarning(null);
    inputRef.current?.focus();
  };

  const sendDirectMessage = () => {
    const text = directInputText.trim();
    if (!text || !username || !activeDirectPartner) return;
    if (text.length > MAX_MESSAGE_LENGTH) return;

    const conversationId = selectedDirectId ?? buildDirectConversationId(username, activeDirectPartner);

    const message: DirectMessage = {
      id: generateId(),
      conversationId,
      from: username,
      to: activeDirectPartner,
      text,
      timestamp: Date.now(),
      isRead: false,
    };

    upsertDirectMessage(message);
    broadcast("DIRECT_MESSAGE", message);
    setDirectInputText("");
    setDirectTypingUser(null);
    setActiveSection("direct");
    setDirectListOnlyMode(false);
    setShowDirectEmojiPicker(false);
    setSelectedDirectId(conversationId);
    setPendingDirectTarget(activeDirectPartner);

    if (directTypingTimeoutRef.current) {
      clearTimeout(directTypingTimeoutRef.current);
      directTypingTimeoutRef.current = null;
    }

    broadcast("DIRECT_TYPING", {
      conversationId,
      from: username,
      to: activeDirectPartner,
      isTyping: false,
    });

    setTimeout(() => directInputRef.current?.focus(), 0);
  };

  const sendImageMessage = useCallback(
    async (file: File, mode: "community" | "direct") => {
      if (!username) return;
      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        setComposerWarning("Image too large. Please choose an image under 6 MB.");
        return;
      }

      try {
        const { dataUrl, imageName } = await compressImageFile(file);

        if (mode === "direct") {
          const selectedConversation = selectedDirectId ? directConversations[selectedDirectId] : null;
          const directPartner =
            pendingDirectTarget ?? selectedConversation?.participants.find((participant) => participant !== username) ?? null;
          if (!directPartner) return;

          const conversationId = selectedDirectId ?? buildDirectConversationId(username, directPartner);

          const message: DirectMessage = {
            id: generateId(),
            conversationId,
            from: username,
            to: directPartner,
            text: directInputText.trim(),
            timestamp: Date.now(),
            isRead: false,
            imageData: dataUrl,
            imageName,
          };

          upsertDirectMessage(message);
          broadcast("DIRECT_MESSAGE", message);
          setDirectInputText("");
          setDirectTypingUser(null);
          setActiveSection("direct");
          setDirectListOnlyMode(false);
          setShowDirectEmojiPicker(false);
          setSelectedDirectId(conversationId);
          setPendingDirectTarget(directPartner);
          setComposerWarning(null);
          return;
        }

        const moderation = getModerationScore(inputText.trim());
        if (moderation.score >= 6) {
          setComposerWarning("Message blocked: looks like promotion/spam. Please rewrite naturally.");
          return;
        }

        const msg: ChatMessage = {
          id: generateId(),
          username,
          avatar: "",
          text: inputText.trim(),
          timestamp: Date.now(),
          reactions: {},
          replyTo: replyingTo
            ? { id: replyingTo.id, username: replyingTo.username, text: replyingTo.text.slice(0, 80) }
            : undefined,
          moderation,
          type: "text",
          imageData: dataUrl,
          imageName,
        };

        setMessages((prev) => [...prev, msg]);
        broadcast("NEW_MESSAGE", msg);
        setInputText("");
        setReplyingTo(null);
        setShowEmojiForMsg(null);
        setIsAtBottom(true);
        setActiveSection("chat");
        setShowMentionPicker(false);
        setShowEmojiPicker(false);
        setShowAttachmentMenu(false);
        setShowStickerPicker(false);
        setComposerWarning(null);
      } catch {
        setComposerWarning("Unable to process image. Try a different file.");
      }
    },
    [
      broadcast,
      directConversations,
      directInputText,
      inputText,
      pendingDirectTarget,
      replyingTo,
      selectedDirectId,
      upsertDirectMessage,
      username,
    ]
  );

  const handleImagePick = useCallback(
    async (event: ChangeEvent<HTMLInputElement>, mode: "community" | "direct") => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      await sendImageMessage(file, mode);
    },
    [sendImageMessage]
  );

  const clearSelectedDirectConversation = () => {
    if (!selectedDirectConversation || !username) return;
    if (!window.confirm("Clear this private conversation?")) return;

    const currentConversationId = selectedDirectConversation.id;
    const partnerName = selectedDirectConversation.participants.find((participant) => participant !== username) ?? null;

    setDirectConversations((prev) => {
      const next = { ...prev };
      delete next[currentConversationId];
      return next;
    });

    localStorage.removeItem(`${DIRECT_DRAFT_STORAGE_PREFIX}:${username}:${currentConversationId}`);
    setDirectInputText("");
    setSelectedDirectId(null);
    setPendingDirectTarget(partnerName);
  };

  const startVoiceRecording = async (target: "community" | "direct" = "community") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStreamRef.current = stream;

      // Live waveform via AnalyserNode
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const animateWaveform = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const bars = Array.from({ length: 28 }, (_, i) => {
          const v = dataArray[Math.floor((i * dataArray.length) / 28)] / 255;
          return Math.max(2, Math.round(v * 20));
        });
        setWaveformBars(bars);
        waveformAnimRef.current = requestAnimationFrame(animateWaveform);
      };
      animateWaveform();

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100);

      setComposerWarning(null);
      setShowEmojiPicker(false);
      setShowDirectEmojiPicker(false);
      setShowAttachmentMenu(false);
      setShowStickerPicker(false);
      setShowMentionPicker(false);
      setVoiceRecordingTarget(target);
      setIsVoicePaused(false);
      setVoiceDuration(0);
      setIsVoiceRecording(true);
    } catch {
      setComposerWarning("Microphone access denied. Please allow microphone to record voice.");
    }
  };

  const cancelVoiceRecording = () => {
    if (waveformAnimRef.current) cancelAnimationFrame(waveformAnimRef.current);
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    setWaveformBars(Array(28).fill(2));
    setIsVoiceRecording(false);
    setVoiceRecordingTarget("community");
    setIsVoicePaused(false);
    setVoiceDuration(0);
  };

  const toggleVoicePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isVoicePaused) {
      mediaRecorderRef.current.resume();
      // Resume waveform animation
      if (analyserRef.current) {
        const analyser = analyserRef.current;
        const animateWaveform = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const bars = Array.from({ length: 28 }, (_, i) => {
            const v = dataArray[Math.floor((i * dataArray.length) / 28)] / 255;
            return Math.max(2, Math.round(v * 20));
          });
          setWaveformBars(bars);
          waveformAnimRef.current = requestAnimationFrame(animateWaveform);
        };
        animateWaveform();
      }
      setIsVoicePaused(false);
    } else {
      mediaRecorderRef.current.pause();
      if (waveformAnimRef.current) cancelAnimationFrame(waveformAnimRef.current);
      setWaveformBars(Array(28).fill(2));
      setIsVoicePaused(true);
    }
  };

  const sendVoiceRecording = () => {
    if (!username || !isVoiceRecording) return;

    const seconds = Math.max(1, voiceDuration);
    const capturedTarget = voiceRecordingTarget;
    const capturedReplyTo = replyingTo;
    const capturedIsOneTime = isOneTimeAudio;
    const capturedDirectPartner = activeDirectPartner;
    const capturedDirectConversationId =
      capturedDirectPartner ? selectedDirectId ?? buildDirectConversationId(username, capturedDirectPartner) : null;

    if (waveformAnimRef.current) cancelAnimationFrame(waveformAnimRef.current);
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());

    const finalize = (audioBlob: Blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;

        if (capturedTarget === "direct" && capturedDirectPartner && capturedDirectConversationId) {
          const directMessage: DirectMessage = {
            id: generateId(),
            conversationId: capturedDirectConversationId,
            from: username,
            to: capturedDirectPartner,
            text: `🎤 Voice note (${formatDuration(seconds)})`,
            timestamp: Date.now(),
            isRead: false,
            audioData: base64,
            audioDuration: seconds,
            isOneTimeAudio: capturedIsOneTime,
          };

          upsertDirectMessage(directMessage);
          broadcast("DIRECT_MESSAGE", directMessage);
          setActiveSection("direct");
          setDirectListOnlyMode(false);
          setSelectedDirectId(capturedDirectConversationId);
          setPendingDirectTarget(capturedDirectPartner);
          setDirectTypingUser(null);
          setShowDirectEmojiPicker(false);
          setIsOneTimeAudio(false);
          return;
        }

        const msg: ChatMessage = {
          id: generateId(),
          username,
          avatar: "",
          text: `🎤 Voice note (${formatDuration(seconds)})`,
          timestamp: Date.now(),
          reactions: {},
          replyTo: capturedReplyTo
            ? { id: capturedReplyTo.id, username: capturedReplyTo.username, text: capturedReplyTo.text.slice(0, 80) }
            : undefined,
          moderation: { score: 0, isPromo: false },
          type: "text",
          audioData: base64,
          audioDuration: seconds,
          isOneTimeAudio: capturedIsOneTime,
        };
        setMessages((prev) => [...prev, msg]);
        broadcast("NEW_MESSAGE", msg);
        setReplyingTo(null);
        setIsAtBottom(true);
        setActiveSection("chat");
        setIsOneTimeAudio(false);
      };
      reader.readAsDataURL(audioBlob);
    };

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      finalize(new Blob(audioChunksRef.current, { type: "audio/webm" }));
    } else {
      mediaRecorderRef.current.onstop = () => {
        finalize(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.stop();
    }

    mediaRecorderRef.current = null;
    setWaveformBars(Array(28).fill(2));
    setIsVoiceRecording(false);
    setVoiceRecordingTarget("community");
    setIsVoicePaused(false);
    setVoiceDuration(0);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setShowMsgMenu(null);
  };

  const unsendMessage = (id: string) => {
    const targetMessage = messages.find((message) => message.id === id);
    if (!targetMessage || targetMessage.username !== username) return;
    setMessages((prev) => prev.filter((message) => message.id !== id));
    broadcast("UNSEND_MESSAGE", { id, username });
    closeMsgMenu();
  };

  const deleteDirectMessageForMe = (conversationId: string, messageId: string) => {
    setDirectConversations((prev) => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;

      const nextMessages = conversation.messages.filter((message) => message.id !== messageId);
      if (nextMessages.length === conversation.messages.length) return prev;

      if (nextMessages.length === 0) {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      }

      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: nextMessages,
          updatedAt: nextMessages[nextMessages.length - 1].timestamp,
        },
      };
    });
    closeDirectMsgMenu();
  };

  const unsendDirectMessage = (conversationId: string, messageId: string) => {
    const targetConversation = directConversations[conversationId];
    const targetMessage = targetConversation?.messages.find((message) => message.id === messageId);
    if (!targetMessage || targetMessage.from !== username) return;

    deleteDirectMessageForMe(conversationId, messageId);
    broadcast("DIRECT_UNSEND", { conversationId, messageId, from: username });
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const reactions = { ...m.reactions };
        const users = reactions[emoji] ? [...reactions[emoji]] : [];
        if (users.includes(username)) {
          reactions[emoji] = users.filter((u) => u !== username);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...users, username];
        }
        return { ...m, reactions };
      })
    );
  };

  const togglePin = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m)));
    setShowMsgMenu(null);
  };

  const toggleStar = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)));
    setShowMsgMenu(null);
  };

  const toggleDirectPin = (conversationId: string, messageId: string) => {
    setDirectConversations((prev) => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, isPinned: !message.isPinned } : message
          ),
        },
      };
    });
    closeDirectMsgMenu();
  };

  const toggleDirectStar = (conversationId: string, messageId: string) => {
    setDirectConversations((prev) => {
      const conversation = prev[conversationId];
      if (!conversation) return prev;

      return {
        ...prev,
        [conversationId]: {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, isStarred: !message.isStarred } : message
          ),
        },
      };
    });
    closeDirectMsgMenu();
  };

  const reportMessage = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isReported: true } : m)));
    setShowMsgMenu(null);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1500);
    closeMsgMenu();
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMsg(msg);
    setInputText(msg.text);
    closeMsgMenu();
    setActiveSection("chat");
    inputRef.current?.focus();
  };

  const insertMention = (name: string) => {
    const textarea = inputRef.current;
    const mentionToken = `@${name} `;

    if (!textarea) {
      setInputText((prev) => `${prev}${prev.endsWith(" ") || prev.length === 0 ? "" : " "}${mentionToken}`);
      setShowMentionPicker(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prefix = inputText.substring(0, start);
    const suffix = inputText.substring(end);
    const spacer = prefix.length > 0 && !prefix.endsWith(" ") ? " " : "";
    const nextText = `${prefix}${spacer}${mentionToken}${suffix}`;

    setInputText(nextText);
    setShowMentionPicker(false);
    setTimeout(() => {
      textarea.focus();
      const cursor = prefix.length + spacer.length + mentionToken.length;
      textarea.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = inputRef.current;

    if (!textarea) {
      setInputText((prev) => `${prev}${emoji}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prefix = inputText.substring(0, start);
    const suffix = inputText.substring(end);
    const nextText = `${prefix}${emoji}${suffix}`;

    setInputText(nextText);
    setTimeout(() => {
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const insertDirectEmoji = (emoji: string) => {
    const textarea = directInputRef.current;

    if (!textarea) {
      setDirectInputText((prev) => `${prev}${emoji}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prefix = directInputText.substring(0, start);
    const suffix = directInputText.substring(end);
    const nextText = `${prefix}${emoji}${suffix}`;

    setDirectInputText(nextText);
    setTimeout(() => {
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const insertSticker = (stickerEmoji: string) => {
    insertEmoji(stickerEmoji);
    setShowStickerPicker(false);
  };

  const leaveChat = () => {
    const sysMsg: ChatMessage = {
      id: generateId(),
      username: "System",
      avatar: "",
      text: `${username} left the chat 👋`,
      timestamp: Date.now(),
      reactions: {},
      type: "system",
    };
    setMessages((prev) => [...prev, sysMsg]);
    broadcast("NEW_MESSAGE", sysMsg);
    broadcast("USER_LEAVE", { username });
    setOnlineUsers((prev) => prev.filter((user) => user.username !== username));
    setTypingUsers((prev) => prev.filter((name) => name !== username));
    localStorage.setItem(COMMUNITY_JOINED_STORAGE_KEY, "0");
    if (username) localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}:${username}`);
    setIsJoined(false);
    setActiveSection(
      Object.values(directConversations).some(
        (conversation) => conversation.participants.includes(username) && conversation.messages.length > 0
      )
        ? "direct"
        : "chat"
    );
  };

  const exportChat = () => {
    if (messages.length === 0) {
      setComposerWarning("No messages to export yet.");
      return;
    }

    const fileContent = messages
      .map((message) => `[${new Date(message.timestamp).toLocaleString()}] ${message.username}: ${message.text}`)
      .join("\n");

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reritee-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearChatHistory = () => {
    if (!window.confirm("Clear all messages from this chat? This action cannot be undone.")) return;
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    broadcast("CLEAR_MESSAGES", {});
    closeMsgMenu();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setUnreadCount(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDirectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendDirectMessage();
    }
  };

  const handleDirectComposerAction = () => {
    if (directInputText.trim()) {
      sendDirectMessage();
      return;
    }
    startVoiceRecording("direct");
    setTimeout(() => directInputRef.current?.focus(), 0);
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter(
      (m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const visibleMessages = useMemo(() => {
    return filteredMessages.filter((m) => {
      if (mutedUsers.has(m.username)) return false;
      if (hidePromoMessages && m.moderation?.isPromo) return false;
      return true;
    });
  }, [filteredMessages, hidePromoMessages, mutedUsers]);

  const chatMessagesForView = useMemo(() => {
    return visibleMessages.filter((message) => {
      if (message.type === "system") return chatFilter === "all";

      switch (chatFilter) {
        case "all":
          return true;
        case "mine":
          return message.username === username;
        case "media":
          return Boolean(message.imageData);
        case "voice":
          return Boolean(message.audioData);
        case "links":
          return hasLinkInText(message.text);
        case "mentions":
          return Boolean(username) && message.text.toLowerCase().includes(`@${username.toLowerCase()}`);
        case "pinned":
          return Boolean(message.isPinned);
        case "starred":
          return Boolean(message.isStarred);
        default:
          return true;
      }
    });
  }, [chatFilter, username, visibleMessages]);

  const textMessages = useMemo(() => messages.filter((m) => m.type === "text"), [messages]);
  const pinnedMessages = useMemo(() => textMessages.filter((m) => m.isPinned), [textMessages]);
  const starredMessages = useMemo(() => textMessages.filter((m) => m.isStarred), [textMessages]);
  const mediaMessageCount = useMemo(() => textMessages.filter((message) => message.imageData).length, [textMessages]);
  const voiceMessageCount = useMemo(() => textMessages.filter((message) => message.audioData).length, [textMessages]);
  const linkMessageCount = useMemo(() => textMessages.filter((message) => hasLinkInText(message.text)).length, [textMessages]);
  const averageMessageLength = useMemo(() => {
    if (textMessages.length === 0) return 0;
    const totalCharacters = textMessages.reduce((sum, message) => sum + message.text.trim().length, 0);
    return Math.round(totalCharacters / textMessages.length);
  }, [textMessages]);
  const totalReactionCount = useMemo(
    () => textMessages.reduce((sum, message) => sum + Object.values(message.reactions).reduce((acc, users) => acc + users.length, 0), 0),
    [textMessages]
  );
  const topContributors = useMemo(() => {
    const contributionMap = new Map<string, number>();
    textMessages.forEach((message) => {
      contributionMap.set(message.username, (contributionMap.get(message.username) ?? 0) + 1);
    });

    return Array.from(contributionMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [textMessages]);

  const trendingMessages = useMemo(() => {
    return [...textMessages]
      .map((msg) => ({
        ...msg,
        reactionCount: Object.values(msg.reactions).reduce((acc, users) => acc + users.length, 0),
      }))
      .filter((msg) => msg.reactionCount > 0)
      .sort((a, b) => b.reactionCount - a.reactionCount)
      .slice(0, 5);
  }, [textMessages]);

  const mentionMessages = useMemo(() => {
    if (!username) return [];
    return textMessages
      .filter((msg) => msg.text.toLowerCase().includes(`@${username.toLowerCase()}`))
      .slice(-5)
      .reverse();
  }, [textMessages, username]);

  const mentionableUsers = useMemo(() => {
    return onlineUsers.filter((user) => user.username !== username);
  }, [onlineUsers, username]);

  const directConversationList = useMemo(() => {
    return Object.values(directConversations)
      .filter((conversation) => conversation.participants.includes(username) && conversation.messages.length > 0)
      .sort((left, right) => right.updatedAt - left.updatedAt);
  }, [directConversations, username]);

  const filteredDirectConversationList = useMemo(() => {
    const query = directSearchQuery.trim().toLowerCase();
    if (!query) return directConversationList;

    return directConversationList.filter((conversation) => {
      const partnerName = conversation.participants.find((participant) => participant !== username) ?? "";
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return partnerName.toLowerCase().includes(query) || getDirectPreview(lastMessage).toLowerCase().includes(query);
    });
  }, [directConversationList, directSearchQuery, username]);

  const selectedDirectConversation = useMemo(() => {
    if (!selectedDirectId) return null;
    return directConversations[selectedDirectId] ?? null;
  }, [directConversations, selectedDirectId]);

  const activeDirectPartner = useMemo(() => {
    if (pendingDirectTarget) return pendingDirectTarget;
    if (!selectedDirectConversation) return null;
    return selectedDirectConversation.participants.find((participant) => participant !== username) ?? null;
  }, [pendingDirectTarget, selectedDirectConversation, username]);

  const directUnreadCount = useMemo(() => {
    return directConversationList.reduce(
      (total, conversation) =>
        total + conversation.messages.filter((message) => message.to === username && !message.isRead).length,
      0
    );
  }, [directConversationList, username]);
  const directPinnedCount = useMemo(
    () => directConversationList.reduce((sum, conversation) => sum + conversation.messages.filter((message) => message.isPinned).length, 0),
    [directConversationList]
  );
  const directStarredCount = useMemo(
    () => directConversationList.reduce((sum, conversation) => sum + conversation.messages.filter((message) => message.isStarred).length, 0),
    [directConversationList]
  );
  const selectedDirectPinnedCount = useMemo(
    () => selectedDirectConversation?.messages.filter((message) => message.isPinned).length ?? 0,
    [selectedDirectConversation]
  );
  const selectedDirectStarredCount = useMemo(
    () => selectedDirectConversation?.messages.filter((message) => message.isStarred).length ?? 0,
    [selectedDirectConversation]
  );

  const shouldShowDirectTab = activeSection === "direct" || directConversationList.length > 0;
  const showDirectThreadMobile = Boolean(activeDirectPartner);

  const filteredEmojiList = useMemo(() => {
    const trimmed = emojiSearchQuery.trim();
    if (!trimmed) return FULL_EMOJI_CATALOG;

    return FULL_EMOJI_CATALOG.filter((emoji) => {
      const code = emoji.codePointAt(0)?.toString(16) ?? "";
      return code.includes(trimmed.toLowerCase());
    });
  }, [emojiSearchQuery]);

  const filteredStickerList = useMemo(() => {
    const query = stickerSearchQuery.trim().toLowerCase();
    if (!query) return STICKER_LIBRARY;
    return STICKER_LIBRARY.filter((sticker) => sticker.label.toLowerCase().includes(query));
  }, [stickerSearchQuery]);

  const moderationQueue = useMemo(() => {
    return textMessages.filter((msg) => msg.moderation?.isPromo || msg.isReported).slice(-12).reverse();
  }, [textMessages]);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      return element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable;
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowShortcuts(false);
        setShowEmojiForMsg(null);
        closeMsgMenu();
        closeDirectMsgMenu();
        setShowSearch(false);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveSection("chat");
        setShowSearch((prev) => !prev);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        setShowShortcuts(true);
        return;
      }

      if (!isTypingTarget(event.target) && event.key === "/") {
        event.preventDefault();
        setActiveSection("chat");
        setShowSearch(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [closeDirectMsgMenu, closeMsgMenu]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (directTypingTimeoutRef.current) clearTimeout(directTypingTimeoutRef.current);
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current);
      if (waveformAnimRef.current) cancelAnimationFrame(waveformAnimRef.current);
      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        className={cn(
          "flex flex-col border border-universe-700/90 bg-universe-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 z-40",
          isExpanded
            ? "fixed inset-0 !rounded-none !border-0 !shadow-none z-50"
            : "w-full h-[calc(100vh-5.5rem)] max-h-[840px] sticky top-20"
        )}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-universe-700 bg-universe-800/60 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {showBackButton && (
              <button
                onClick={onBack ?? onClose}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-sm text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                title={backLabel}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{backLabel}</span>
              </button>
            )}
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-universe-highlight flex-shrink-0" />
            <h3 className="text-sm sm:text-base font-semibold text-universe-foreground truncate">Community Chat</h3>
            {isJoined && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                <Circle className="w-1.5 h-1.5 fill-current" /> Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {isJoined && (
              <>
                <button
                  onClick={exportChat}
                  className="inline-flex p-1.5 rounded-lg text-universe-muted hover:text-universe-foreground transition-colors"
                  title="Export chat"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={clearChatHistory}
                  className="inline-flex p-1.5 rounded-lg text-universe-muted hover:text-rose-400 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={leaveChat}
                  className="inline-flex px-2 py-1 rounded-lg text-xs sm:text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Leave chat"
                >
                  Leave
                </button>
                <button
                  onClick={() => setShowSearch((p) => !p)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    showSearch ? "text-universe-highlight bg-universe-highlight/10" : "text-universe-muted hover:text-universe-foreground"
                  )}
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveSection("insights")}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                    activeSection === "insights"
                      ? "text-universe-highlight bg-universe-highlight/10"
                      : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800"
                  )}
                  title="Insights"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Insights</span>
                </button>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                  title="Shortcuts"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Shortcuts</span>
                </button>
                <button
                  onClick={() => setSoundEnabled((p) => !p)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    soundEnabled ? "text-universe-muted hover:text-universe-foreground" : "text-rose-400"
                  )}
                  title={soundEnabled ? "Mute" : "Unmute"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setNotifEnabled((p) => !p)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    notifEnabled ? "text-universe-muted hover:text-universe-foreground" : "text-rose-400"
                  )}
                  title={notifEnabled ? "Disable alerts" : "Enable alerts"}
                >
                  {notifEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-universe-muted hover:text-universe-foreground transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-universe-muted hover:text-rose-400 transition-colors" title="Close">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && isJoined && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-universe-700"
            >
              <div className="px-4 py-2.5 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-universe-muted flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="flex-1 bg-transparent text-sm text-universe-foreground placeholder-universe-muted focus:outline-none"
                  autoFocus
                />
                {searchQuery && <span className="text-xs font-medium text-universe-muted">{chatMessagesForView.length} found</span>}
                <button onClick={() => setShowSearch(false)} className="text-universe-muted hover:text-universe-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isJoined && !shouldShowDirectTab ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-xs w-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl bg-universe-highlight/10 border border-universe-highlight/20 flex items-center justify-center mx-auto"
              >
                <Sparkles className="w-8 h-8 text-universe-highlight" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-universe-foreground mb-1">Join ReRitee Chat</h3>
                <p className="text-sm text-universe-muted">A dedicated section for live ideas, feedback, and collaboration.</p>
              </div>
              <div className="space-y-3">
                {username ? (
                  <div className="w-full bg-universe-800 border border-universe-700 rounded-lg px-4 py-2.5 text-sm text-universe-foreground text-left">
                    Profile ID: <span className="font-semibold text-universe-highlight">{username}</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinChat()}
                    placeholder="Choose your username"
                    maxLength={20}
                    className="w-full bg-universe-800 border border-universe-700 rounded-lg px-4 py-2.5 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-colors"
                    autoFocus
                  />
                )}
                <button
                  onClick={joinChat}
                  disabled={!username && usernameInput.trim().length < 2}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-sm font-medium transition-all",
                    (username || usernameInput.trim().length >= 2)
                      ? "bg-universe-highlight text-white hover:opacity-90"
                      : "bg-universe-800 text-universe-muted cursor-not-allowed"
                  )}
                >
                  {username ? "Continue as saved profile" : "Enter Chat Space"}
                </button>
                <p className="text-xs font-medium text-universe-muted">{username ? "Your profile ID is locked once created." : "2-20 chars • Same theme • Fully responsive"}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 sm:px-6 pt-3 border-b border-universe-700 bg-universe-900/90 backdrop-blur-sm">
              <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                {[
                  { key: "chat", label: "Chat", icon: MessageCircle },
                  ...(shouldShowDirectTab ? [{ key: "direct", label: "Direct", icon: MessageCircle, badge: directUnreadCount }] : []),
                  { key: "highlights", label: "Highlights", icon: LayoutList },
                  { key: "people", label: "People", icon: Users },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as ChatSection)}
                    className={cn(
                      "snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap border",
                      activeSection === item.key
                        ? "bg-universe-800 text-universe-highlight border-universe-700"
                        : "text-universe-muted hover:text-universe-foreground border-transparent hover:border-universe-700/70"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-universe-highlight/15 text-xs font-semibold text-universe-highlight">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-universe-muted px-3 py-1.5 rounded-full border border-universe-700 bg-universe-800/40">
                  <span>{onlineUsers.length} online</span>
                  <span>•</span>
                  <span>{textMessages.length} msgs</span>
                </div>
              </div>
              {isJoined && (
                <div className="flex items-center gap-2 w-full overflow-x-auto no-scrollbar pb-3">
                  <button
                    onClick={exportChat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-universe-muted border border-universe-700 bg-universe-800/50 hover:text-universe-foreground transition-colors"
                  >
                    <Download className="w-3 h-3" /> Export
                  </button>
                  <button
                    onClick={clearChatHistory}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-universe-muted border border-universe-700 bg-universe-800/50 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                  <button
                    onClick={leaveChat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-rose-400 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                  >
                    <X className="w-3 h-3" /> Leave
                  </button>
                  <button
                    onClick={() => setShowSearch((p) => !p)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      showSearch
                        ? "text-universe-highlight border-universe-highlight/40 bg-universe-highlight/10"
                        : "text-universe-muted border-universe-700 bg-universe-800/50 hover:text-universe-foreground"
                    )}
                  >
                    <Search className="w-3 h-3" /> Search
                  </button>
                  <button
                    onClick={() => setShowShortcuts(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-universe-muted border border-universe-700 bg-universe-800/50 hover:text-universe-foreground transition-colors"
                  >
                    <LayoutList className="w-3 h-3" /> Shortcuts
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {activeSection === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {isJoined && (
                      <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-universe-700/80 bg-universe-900/45">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                          {CHAT_FILTER_OPTIONS.map((option) => (
                            <button
                              key={option.key}
                              onClick={() => setChatFilter(option.key)}
                              className={cn(
                                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                chatFilter === option.key
                                  ? "border-universe-highlight/40 bg-universe-highlight/10 text-universe-highlight"
                                  : "border-universe-700 bg-universe-800/40 text-universe-muted hover:text-universe-foreground"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                          <span className="ml-auto shrink-0 rounded-full border border-universe-700 bg-universe-800/40 px-3 py-1.5 text-xs font-medium text-universe-muted">
                            Showing {chatMessagesForView.length}
                          </span>
                        </div>
                      </div>
                    )}
                    <div
                      ref={chatContainerRef}
                      onScroll={handleScroll}
                      className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6 space-y-3 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-universe-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full"
                    >
                      {chatMessagesForView.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-12">
                          <MessageCircle className="w-10 h-10 text-universe-muted/30" />
                          <p className="text-sm text-universe-muted">{searchQuery || chatFilter !== "all" ? "No messages matched your current filters." : "No visible messages. Try turning off filters."}</p>
                        </div>
                      ) : (
                        chatMessagesForView.map((msg, idx) => {
                          const isOwn = msg.username === username;
                          const prevMsg = idx > 0 ? chatMessagesForView[idx - 1] : null;
                          const isGrouped =
                            prevMsg && prevMsg.username === msg.username && msg.timestamp - prevMsg.timestamp < 120000;

                          if (msg.type === "system") {
                            return (
                              <div key={msg.id} className="flex justify-center py-2">
                                <span className="text-xs font-medium text-universe-muted bg-universe-800/60 px-3 py-1 rounded-full">{msg.text}</span>
                              </div>
                            );
                          }

                          return (
                            <div key={msg.id} className={cn("group relative", !isGrouped && idx > 0 && "mt-4")}>
                              {!isGrouped && (
                                <div className={cn("flex items-center gap-2 mb-1.5", isOwn && "flex-row-reverse")}>
                                  <button
                                    type="button"
                                    onClick={() => openDirectConversation(msg.username)}
                                    disabled={isOwn}
                                    className={cn(
                                      "inline-flex items-center gap-2 rounded-full transition-colors",
                                      isOwn ? "cursor-default" : "hover:text-universe-highlight"
                                    )}
                                    title={isOwn ? "This is you" : `Message ${msg.username} privately`}
                                  >
                                    <div
                                      className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0",
                                        getAvatarColor(msg.username)
                                      )}
                                    >
                                      {msg.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-semibold text-universe-foreground">{msg.username}</span>
                                  </button>
                                  {msg.isPinned && <Pin className="w-2.5 h-2.5 text-universe-highlight" />}
                                  {msg.isStarred && <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />}
                                  {msg.moderation?.isPromo && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">promo</span>}
                                  {msg.isReported && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">reported</span>}
                                </div>
                              )}

                              <div className={cn("flex items-start gap-1", isOwn ? "flex-row-reverse" : "") }>
                                <div className={cn("w-fit max-w-[86%] sm:max-w-[64%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                                  <div
                                    className={cn(
                                      "relative w-fit max-w-full rounded-2xl px-3.5 py-2.5 shadow-sm",
                                      isOwn
                                        ? "bg-universe-highlight/90 text-white rounded-br-sm"
                                        : "bg-universe-800/95 text-universe-foreground rounded-bl-sm border border-universe-700/70",
                                      msg.isPinned && "ring-1 ring-universe-highlight/40"
                                    )}
                                  >
                                    {msg.replyTo && (
                                      <div
                                        className={cn(
                                          "text-xs mb-1 pb-1 border-b",
                                          isOwn ? "border-white/20 text-white/70" : "border-universe-700 text-universe-muted"
                                        )}
                                      >
                                        <span className="font-medium">↩ {msg.replyTo.username}:</span> {msg.replyTo.text}
                                      </div>
                                    )}

                                    {msg.audioData ? (
                                      <VoiceNotePlayer
                                        audioData={msg.audioData}
                                        duration={msg.audioDuration ?? 1}
                                        isOneTime={msg.isOneTimeAudio}
                                        isOwn={isOwn}
                                      />
                                    ) : msg.imageData ? (
                                      <div className="space-y-1.5">
                                        <img
                                          src={msg.imageData}
                                          alt={msg.imageName || "Shared image"}
                                          className="w-full max-h-72 object-cover rounded-lg border border-universe-700/40"
                                          loading="lazy"
                                        />
                                        {msg.text.trim() ? (
                                          <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{renderMessageText(msg.text, isOwn)}</p>
                                        ) : null}
                                      </div>
                                    ) : (
                                      <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{renderMessageText(msg.text, isOwn)}</p>
                                    )}

                                  </div>

                                  {(msg.isEdited || Object.keys(msg.reactions).length > 0 || msg.timestamp) && (
                                    <div className={cn("mt-1.5 flex max-w-full flex-col gap-1", isOwn ? "items-end self-end" : "items-start self-start")}>
                                      {Object.keys(msg.reactions).length > 0 && (
                                        <div className="max-w-full overflow-x-auto no-scrollbar">
                                          <div className={cn("flex w-max flex-nowrap gap-1", isOwn ? "ml-auto" : "mr-auto")}>
                                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                                              <button
                                                key={emoji}
                                                onClick={() => toggleReaction(msg.id, emoji)}
                                                className={cn(
                                                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                                  users.includes(username)
                                                    ? "border-universe-highlight/50 bg-universe-highlight/10"
                                                    : "border-universe-700 bg-universe-900/40 hover:bg-universe-800"
                                                )}
                                                title={users.join(", ")}
                                              >
                                                {emoji} {users.length}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className={cn("flex items-center gap-1 text-xs font-medium", isOwn ? "text-white/70" : "text-universe-muted")}>
                                        {msg.isEdited ? <span>(edited)</span> : null}
                                        <span>{formatTime(msg.timestamp)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div
                                  className={cn(
                                    "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0",
                                    isOwn && "flex-row-reverse"
                                  )}
                                >
                                  <button
                                    onClick={() => setShowEmojiForMsg(showEmojiForMsg === msg.id ? null : msg.id)}
                                    className="p-1 rounded text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                                  >
                                    <Smile className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setReplyingTo(msg)}
                                    className="p-1 rounded text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                                  >
                                    <Reply className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(event) => {
                                      if (showMsgMenu === msg.id) {
                                        closeMsgMenu();
                                        return;
                                      }
                                      openMsgMenu(msg.id, event.currentTarget, isOwn);
                                    }}
                                    className="p-1 rounded text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors relative"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {showEmojiForMsg === msg.id && (
                                <div
                                  className={cn(
                                    "flex flex-wrap gap-1 mt-1 p-1.5 bg-universe-800 rounded-lg border border-universe-700 max-w-[250px]",
                                    isOwn ? "ml-auto" : ""
                                  )}
                                >
                                  {EMOJI_LIST.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        toggleReaction(msg.id, emoji);
                                        setShowEmojiForMsg(null);
                                      }}
                                      className="text-sm hover:scale-125 transition-transform p-0.5"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}

                              <AnimatePresence>
                                {showMsgMenu === msg.id && (
                                  <motion.div
                                    ref={msgMenuRef}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed z-[90] w-40 rounded-lg border border-universe-700 bg-universe-900 shadow-xl py-1"
                                    style={
                                      msgMenuPosition
                                        ? { top: msgMenuPosition.top, left: msgMenuPosition.left }
                                        : { top: -9999, left: -9999 }
                                    }
                                  >
                                    <button
                                      onClick={() => {
                                        setComposerWarning(`Sent ${formatTime(msg.timestamp)}`);
                                        closeMsgMenu();
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <Circle className="w-3 h-3 text-universe-muted" /> Message info
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyingTo(msg);
                                        closeMsgMenu();
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <Reply className="w-3 h-3 text-universe-muted" /> Reply
                                    </button>
                                    <button
                                      onClick={() => copyMessage(msg.text, msg.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      {copiedMsgId === msg.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-universe-muted" />
                                      )}
                                      {copiedMsgId === msg.id ? "Copied" : "Copy"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowEmojiForMsg(msg.id);
                                        closeMsgMenu();
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <Smile className="w-3 h-3 text-universe-muted" /> React
                                    </button>
                                    <button
                                      onClick={() => {
                                        setInputText((prev) => (prev ? `${prev}\n${msg.text}` : msg.text));
                                        setActiveSection("chat");
                                        closeMsgMenu();
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <ArrowRight className="w-3 h-3 text-universe-muted" /> Forward
                                    </button>
                                    <button
                                      onClick={() => togglePin(msg.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <Pin className="w-3 h-3 text-universe-muted" /> {msg.isPinned ? "Unpin" : "Pin"}
                                    </button>
                                    <button
                                      onClick={() => toggleStar(msg.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <Star className="w-3 h-3 text-universe-muted" /> {msg.isStarred ? "Unstar" : "Star"}
                                    </button>
                                    <button
                                      onClick={() => openDirectConversation(msg.username)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <MessageCircle className="w-3 h-3 text-universe-muted" /> Private chat
                                    </button>
                                    <button
                                      onClick={() => reportMessage(msg.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                    >
                                      <Flag className="w-3 h-3 text-universe-muted" /> {msg.isReported ? "Reported" : "Report"}
                                    </button>
                                    {!isOwn && (
                                      <button
                                        onClick={() => muteUser(msg.username)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                      >
                                        <UserX className="w-3 h-3 text-universe-muted" /> Mute user
                                      </button>
                                    )}
                                    {isOwn && (
                                      <>
                                        <button
                                          onClick={() => startEdit(msg)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Edit3 className="w-3 h-3 text-universe-muted" /> Edit
                                        </button>
                                        <button
                                          onClick={() => deleteMessage(msg.id)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" /> Delete for me
                                        </button>
                                        <button
                                          onClick={() => unsendMessage(msg.id)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                          <X className="w-3 h-3" /> Unsend
                                        </button>
                                      </>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {typingUsers.length > 0 && (
                      <div className="px-4 py-1 text-[10px] text-universe-muted animate-pulse">
                        {typingUsers.length === 1
                          ? `${typingUsers[0]} is typing...`
                          : `${typingUsers.slice(0, 2).join(", ")}${typingUsers.length > 2 ? ` and ${typingUsers.length - 2} more` : ""} are typing...`}
                      </div>
                    )}

                    {!isAtBottom && (
                      <div className="flex justify-center -mt-10 mb-2 relative z-10">
                        <button
                          onClick={scrollToBottom}
                          className="flex items-center gap-1 px-3 py-1.5 bg-universe-800 border border-universe-700 rounded-full text-xs text-universe-foreground hover:bg-universe-700 transition-colors shadow-lg"
                        >
                          <ArrowDown className="w-3 h-3" />
                          {unreadCount > 0 ? `${unreadCount} new` : "Latest"}
                        </button>
                      </div>
                    )}

                    <div className="border-t border-universe-700 bg-universe-800/30 flex-shrink-0">
                      {replyingTo && (
                        <div className="px-4 sm:px-5 pt-3 flex items-center gap-2 text-xs">
                          <Reply className="w-3 h-3 text-universe-highlight flex-shrink-0" />
                          <span className="text-universe-muted truncate">
                            Replying to <span className="text-universe-highlight font-medium">{replyingTo.username}</span>: {replyingTo.text.slice(0, 50)}
                          </span>
                          <button onClick={() => setReplyingTo(null)} className="text-universe-muted hover:text-rose-400 ml-auto flex-shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {editingMsg && (
                        <div className="px-4 sm:px-5 pt-3 flex items-center gap-2 text-xs">
                          <Edit3 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="text-universe-muted">Editing message</span>
                          <button
                            onClick={() => {
                              setEditingMsg(null);
                              setInputText("");
                            }}
                            className="text-universe-muted hover:text-rose-400 ml-auto flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="px-4 sm:px-5 py-4" ref={composerToolsRef}>
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              className="mb-2 rounded-2xl border border-universe-700 bg-universe-900 p-2.5"
                            >
                              <input
                                type="text"
                                value={emojiSearchQuery}
                                onChange={(e) => setEmojiSearchQuery(e.target.value)}
                                placeholder="Search emoji"
                                className="w-full rounded-full border border-universe-700 bg-universe-800/70 px-3 py-2 text-xs text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight/40"
                              />
                              <div className="mt-2 max-h-48 overflow-y-auto grid grid-cols-9 sm:grid-cols-12 gap-1.5">
                                {(filteredEmojiList.length > 0 ? filteredEmojiList : FULL_EMOJI_CATALOG).map((emoji) => (
                                  <button
                                    key={`picker-${emoji}`}
                                    onClick={() => insertEmoji(emoji)}
                                    className="text-lg leading-none p-1.5 rounded-lg hover:bg-universe-800 transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {showStickerPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              className="mb-2 rounded-2xl border border-universe-700 bg-universe-900 p-2.5"
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] font-medium text-universe-muted uppercase tracking-[0.16em]">Stickers (2200+)</span>
                                <button
                                  onClick={() => setShowStickerPicker(false)}
                                  className="text-[10px] text-universe-muted hover:text-universe-foreground transition-colors"
                                >
                                  Close
                                </button>
                              </div>

                              <input
                                type="text"
                                value={stickerSearchQuery}
                                onChange={(e) => {
                                  setStickerSearchQuery(e.target.value);
                                  setVisibleStickerCount(240);
                                }}
                                placeholder="Search sticker"
                                className="w-full rounded-full border border-universe-700 bg-universe-800/70 px-3 py-2 text-xs text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight/40"
                              />

                              <div className="mt-2 max-h-56 overflow-y-auto grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                                {filteredStickerList.slice(0, visibleStickerCount).map((sticker) => (
                                  <button
                                    key={sticker.id}
                                    onClick={() => insertSticker(sticker.emoji)}
                                    className="relative text-lg leading-none p-1.5 rounded-lg hover:bg-universe-800 transition-colors"
                                    title={sticker.label}
                                  >
                                    {sticker.emoji}
                                  </button>
                                ))}
                              </div>

                              {visibleStickerCount < filteredStickerList.length && (
                                <div className="mt-2 flex justify-center">
                                  <button
                                    onClick={() => setVisibleStickerCount((prev) => Math.min(prev + 240, filteredStickerList.length))}
                                    className="text-[11px] px-3 py-1.5 rounded-full border border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                                  >
                                    Load more stickers
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {showAttachmentMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              className="mb-2 w-[min(220px,calc(100vw-2rem))] py-1"
                            >
                              {[
                                { label: "Document", icon: "📄" },
                                { label: "Photos & videos", icon: "🖼️" },
                                { label: "Camera", icon: "📷" },
                                { label: "Audio", icon: "🎧" },
                                { label: "Contact", icon: "👤" },
                                { label: "Poll", icon: "📊" },
                                { label: "Event", icon: "📅" },
                                { label: "New sticker", icon: "➕" },
                                { label: "Mention", icon: "@" },
                              ].map((item) => (
                                <button
                                  key={`attach-${item.label}`}
                                  onClick={() => {
                                    if (item.label === "Photos & videos") {
                                      imageInputRef.current?.click();
                                      setShowAttachmentMenu(false);
                                      return;
                                    }
                                    if (item.label === "Mention") {
                                      setShowMentionPicker(true);
                                      setShowAttachmentMenu(false);
                                      setShowStickerPicker(false);
                                      return;
                                    }
                                    if (item.label === "New sticker") {
                                      setShowStickerPicker(true);
                                      setShowAttachmentMenu(false);
                                      setShowEmojiPicker(false);
                                      setStickerSearchQuery("");
                                      setVisibleStickerCount(240);
                                      return;
                                    }
                                    setComposerWarning(`${item.label} support is coming soon.`);
                                    setShowAttachmentMenu(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                >
                                  <span className="w-full flex items-center gap-2 rounded-xl border border-universe-700 bg-universe-900/95 px-3 py-2 shadow-lg">
                                    <span className="w-4 text-center">{item.icon}</span>
                                    <span>{item.label}</span>
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleImagePick(event, "community")}
                          className="hidden"
                        />

                        {showMentionPicker && (
                          <div className="mb-2 rounded-xl border border-universe-700 bg-universe-900/80 p-2.5">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-medium text-universe-muted uppercase tracking-[0.16em]">Mention someone</span>
                              <button
                                onClick={() => setShowMentionPicker(false)}
                                className="text-[10px] text-universe-muted hover:text-universe-foreground transition-colors"
                              >
                                Close
                              </button>
                            </div>
                            {mentionableUsers.length === 0 ? (
                              <p className="text-xs text-universe-muted">No other active users to mention right now.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {mentionableUsers.slice(0, 8).map((user) => (
                                  <button
                                    key={`mention-${user.username}`}
                                    onClick={() => insertMention(user.username)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-universe-700 bg-universe-800/60 text-xs text-universe-foreground hover:border-universe-highlight/40 hover:text-universe-highlight transition-colors"
                                  >
                                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white", getAvatarColor(user.username))}>
                                      {user.username[0].toUpperCase()}
                                    </div>
                                    @{user.username}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {isVoiceRecording ? (
                          <div className="flex items-center gap-2.5 rounded-full border border-universe-700 bg-universe-900/90 px-3.5 py-2">
                            <button
                              onClick={cancelVoiceRecording}
                              className="p-1.5 rounded-full text-universe-muted hover:text-rose-400 hover:bg-universe-800/70 transition-colors"
                              title="Discard recording"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="inline-flex items-center gap-1.5 text-xs text-universe-foreground min-w-[64px]">
                              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                              <span>{formatDuration(voiceDuration)}</span>
                            </div>

                            <div className="flex-1 flex items-end gap-px px-1 h-5 overflow-hidden">
                              {waveformBars.map((height, idx) => (
                                <span
                                  key={`wave-${idx}`}
                                  className={cn(
                                    "flex-1 rounded-full transition-all duration-75",
                                    isVoicePaused ? "bg-universe-muted/40" : "bg-rose-400/80"
                                  )}
                                  style={{ height: `${Math.max(2, Math.min(height, 20))}px` }}
                                />
                              ))}
                            </div>

                            <button
                              onClick={toggleVoicePause}
                              className="p-1.5 rounded-full text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70 transition-colors"
                              title={isVoicePaused ? "Resume" : "Pause"}
                            >
                              {isVoicePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => setIsOneTimeAudio((p) => !p)}
                              className={cn(
                                "p-1.5 rounded-full transition-colors text-sm leading-none",
                                isOneTimeAudio
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                              )}
                              title={isOneTimeAudio ? "One-time ON: plays once then disappears" : "One-time OFF: click to enable"}
                            >
                              👁️
                            </button>

                            <button
                              onClick={sendVoiceRecording}
                              className="p-2 rounded-full bg-emerald-500 text-universe-900 hover:bg-emerald-400 transition-colors"
                              title="Send voice note"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                        <div className="flex items-center gap-2.5 rounded-full border border-universe-700 bg-universe-900/80 px-3.5 py-2">
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                setShowAttachmentMenu((p) => !p);
                                setShowEmojiPicker(false);
                                setShowStickerPicker(false);
                              }}
                              className={cn(
                                "p-1.5 rounded-full transition-colors",
                                showAttachmentMenu ? "text-universe-highlight bg-universe-highlight/10" : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                              )}
                              title="Attachments"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setShowEmojiPicker((p) => !p);
                                setShowAttachmentMenu(false);
                                setShowStickerPicker(false);
                              }}
                              className={cn(
                                "p-1.5 rounded-full transition-colors",
                                showEmojiPicker ? "text-universe-highlight bg-universe-highlight/10" : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                              )}
                              title="Emoji"
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex-1 relative">
                            <textarea
                              ref={inputRef}
                              value={inputText}
                              onChange={(e) => {
                                setInputText(e.target.value);
                                setComposerWarning(null);
                                handleTyping();
                              }}
                              onKeyDown={handleKeyDown}
                              placeholder={editingMsg ? "Edit your message..." : "Type a message"}
                              rows={1}
                              maxLength={MAX_MESSAGE_LENGTH}
                              className="w-full bg-transparent border-0 px-1 py-1.5 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none resize-none max-h-32 transition-colors"
                              style={{ minHeight: "32px" }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (inputText.trim()) {
                                sendMessage();
                                return;
                              }
                              startVoiceRecording();
                            }}
                            className={cn(
                              "p-1.5 rounded-full transition-colors flex-shrink-0",
                              inputText.trim() && inputText.trim().length <= MAX_MESSAGE_LENGTH
                                ? "text-universe-highlight hover:bg-universe-highlight/10"
                                : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                            )}
                          >
                            {inputText.trim() ? <Send className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>
                        </div>
                        )}
                      </div>

                      {composerWarning && (
                        <div className="px-4 sm:px-5 pb-2 text-[10px] text-rose-400 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> {composerWarning}
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}

                {activeSection === "direct" && (
                  <motion.div
                    key="direct"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex flex-col lg:flex-row bg-universe-900/30"
                  >
                    {directConversationList.length > 0 && (
                      <aside className={cn(
                        "w-full lg:w-[320px] xl:w-[340px] border-b lg:border-b-0 lg:border-r border-universe-700 bg-universe-900/70",
                        showDirectThreadMobile ? "hidden lg:block" : "block"
                      )}>
                        <div className="px-4 sm:px-5 py-3.5 border-b border-universe-700 bg-universe-900/75">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-universe-foreground">Direct Messages</h4>
                              <p className="text-xs font-medium text-universe-muted">Only active private threads are shown.</p>
                            </div>
                            <span className="text-xs font-medium text-universe-muted rounded-full border border-universe-700 px-2 py-1 bg-universe-800/40">
                              {directConversationList.length}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-center gap-2 rounded-full border border-universe-700 bg-universe-800/60 px-3 py-2">
                            <Search className="w-3.5 h-3.5 text-universe-muted" />
                            <input
                              type="text"
                              value={directSearchQuery}
                              onChange={(e) => setDirectSearchQuery(e.target.value)}
                              placeholder="Search direct chats"
                              className="w-full bg-transparent text-sm font-medium text-universe-foreground placeholder-universe-muted focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="max-h-[40vh] lg:max-h-none lg:h-[calc(100%-92px)] overflow-y-auto px-3 py-3 space-y-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-universe-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                          {filteredDirectConversationList.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-universe-muted">No matching direct chats.</div>
                          ) : null}
                          {filteredDirectConversationList.map((conversation) => {
                            const partnerName = conversation.participants.find((participant) => participant !== username) ?? username;
                            const lastMessage = conversation.messages[conversation.messages.length - 1];
                            const unread = conversation.messages.filter((message) => message.to === username && !message.isRead).length;

                            return (
                              <button
                                key={conversation.id}
                                onClick={() => {
                                  setDirectListOnlyMode(false);
                                  setPendingDirectTarget(partnerName);
                                  setSelectedDirectId(conversation.id);
                                }}
                                className={cn(
                                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                                  selectedDirectId === conversation.id
                                    ? "border-universe-highlight/40 bg-universe-800"
                                    : "border-transparent bg-universe-900/30 hover:border-universe-700 hover:bg-universe-800/70"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setProfilePreviewUser(partnerName);
                                    }}
                                    className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0", getAvatarColor(partnerName))}
                                    title={`View ${partnerName}'s profile photo`}
                                  >
                                    <span>{getAvatarSticker(partnerName)}</span>
                                  </button>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-universe-foreground truncate">{partnerName}</p>
                                      {unread > 0 ? (
                                        <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-universe-highlight text-xs font-semibold text-white flex items-center justify-center">
                                          {unread}
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="text-[11px] text-universe-muted truncate mt-0.5">{getDirectPreview(lastMessage)}</p>
                                    <div className="mt-1 flex items-center justify-between gap-2 text-xs font-medium text-universe-muted">
                                      <span>{lastMessage ? formatTime(lastMessage.timestamp) : "Ready"}</span>
                                      <span>{conversation.messages.length} msg</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </aside>
                    )}

                    <div className={cn("flex-1 min-h-0 flex flex-col bg-universe-900/30", !showDirectThreadMobile && "hidden lg:flex")}>
                      {activeDirectPartner ? (
                        <>
                          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-universe-700 bg-universe-800/50">
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => {
                                  setDirectListOnlyMode(true);
                                  setSelectedDirectId(null);
                                  setPendingDirectTarget(null);
                                }}
                                className="lg:hidden p-1.5 rounded-full text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70 transition-colors"
                                title="Back to chats"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProfilePreviewUser(activeDirectPartner)}
                                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0", getAvatarColor(activeDirectPartner))}
                                title={`View ${activeDirectPartner}'s profile photo`}
                              >
                                <span>{getAvatarSticker(activeDirectPartner)}</span>
                              </button>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-universe-foreground truncate">{activeDirectPartner}</p>
                                <p className="text-[11px] text-universe-muted truncate">
                                  {selectedDirectConversation?.messages.length
                                    ? "Saved private thread"
                                    : "Private draft chat"}
                                </p>
                              </div>
                            </div>
                            {selectedDirectConversation?.messages.length ? (
                              <div className="hidden sm:flex items-center gap-1.5">
                                <button
                                  onClick={() => markDirectConversationRead(selectedDirectConversation.id, username)}
                                  className="text-xs font-medium text-universe-muted rounded-full border border-universe-700 px-2 py-1 bg-universe-800/40 hover:text-universe-foreground transition-colors"
                                  title="Mark as read"
                                >
                                  Read
                                </button>
                                <button
                                  onClick={clearSelectedDirectConversation}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 rounded-full border border-rose-500/40 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                                  title="Clear conversation"
                                >
                                  <Trash2 className="w-2.5 h-2.5" /> Clear
                                </button>
                                <div className="text-xs font-medium text-universe-muted rounded-full border border-universe-700 px-2 py-1 bg-universe-800/40">
                                  {selectedDirectConversation.messages.length} msg
                                </div>
                                <div className="text-xs font-medium text-universe-muted rounded-full border border-universe-700 px-2 py-1 bg-universe-800/40">
                                  {selectedDirectPinnedCount} pin
                                </div>
                                <div className="text-xs font-medium text-universe-muted rounded-full border border-universe-700 px-2 py-1 bg-universe-800/40">
                                  {selectedDirectStarredCount} star
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div
                            ref={directContainerRef}
                            className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-3 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-universe-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full"
                          >
                            {selectedDirectConversation?.messages.length ? (
                              selectedDirectConversation.messages.map((message) => {
                                const isOwnDirect = message.from === username;

                                return (
                                  <div key={message.id} className={cn("group relative flex items-start gap-1", isOwnDirect ? "justify-end" : "justify-start")}>
                                    {!isOwnDirect ? (
                                      <button
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setShowDirectMsgMenu((prev) => (prev === message.id ? null : message.id));
                                        }}
                                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                                        title="Message options"
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </button>
                                    ) : null}

                                    <div className={cn("w-fit max-w-[86%] sm:max-w-[64%] flex flex-col", isOwnDirect ? "items-end" : "items-start")}>
                                      <div
                                        className={cn(
                                          "w-fit max-w-full rounded-2xl px-3.5 py-2.5 shadow-sm",
                                          isOwnDirect
                                            ? "bg-universe-highlight/90 text-white rounded-br-sm"
                                            : "bg-universe-800/95 text-universe-foreground rounded-bl-sm border border-universe-700/70"
                                        )}
                                      >
                                        {message.audioData ? (
                                          <VoiceNotePlayer
                                            audioData={message.audioData}
                                            duration={message.audioDuration ?? 1}
                                            isOneTime={message.isOneTimeAudio}
                                            isOwn={isOwnDirect}
                                          />
                                        ) : message.imageData ? (
                                          <div className="space-y-1.5">
                                            <img
                                              src={message.imageData}
                                              alt={message.imageName || "Direct shared image"}
                                              className="w-full max-h-72 object-cover rounded-lg border border-universe-700/40"
                                              loading="lazy"
                                            />
                                            {message.text.trim() ? (
                                              <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{renderMessageText(message.text, isOwnDirect)}</p>
                                            ) : null}
                                          </div>
                                        ) : (
                                          <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{renderMessageText(message.text, isOwnDirect)}</p>
                                        )}
                                      </div>

                                      <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", isOwnDirect ? "text-white/70" : "text-universe-muted")}>
                                        {message.isPinned ? <Pin className="w-3 h-3 text-universe-highlight" /> : null}
                                        {message.isStarred ? <Star className="w-3 h-3 text-amber-400 fill-current" /> : null}
                                        <span>{formatTime(message.timestamp)}</span>
                                        {isOwnDirect ? <DirectMessageStatus isRead={message.isRead} /> : null}
                                      </div>
                                    </div>

                                    {isOwnDirect ? (
                                      <button
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setShowDirectMsgMenu((prev) => (prev === message.id ? null : message.id));
                                        }}
                                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                                        title="Message options"
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </button>
                                    ) : null}

                                    {showDirectMsgMenu === message.id ? (
                                      <div
                                        className={cn(
                                          "absolute top-6 z-30 w-44 rounded-lg border border-universe-700 bg-universe-900 shadow-xl py-1",
                                          isOwnDirect ? "right-1" : "left-1"
                                        )}
                                      >
                                        <button
                                          onClick={() => {
                                            setComposerWarning(`Sent ${formatTime(message.timestamp)}`);
                                            closeDirectMsgMenu();
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Circle className="w-3 h-3 text-universe-muted" /> Message info
                                        </button>
                                        <button
                                          onClick={() => {
                                            const preview = message.text?.slice(0, 60) || "Voice/Image";
                                            setDirectInputText((prev) => (prev ? `${prev}\n↩ ${preview}` : `↩ ${preview}\n`));
                                            closeDirectMsgMenu();
                                            setTimeout(() => directInputRef.current?.focus(), 0);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Reply className="w-3 h-3 text-universe-muted" /> Reply
                                        </button>
                                        <button
                                          onClick={() => copyMessage(message.text || "", message.id)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Copy className="w-3 h-3 text-universe-muted" /> Copy
                                        </button>
                                        <button
                                          onClick={() => {
                                            setDirectInputText((prev) => `${prev}${prev ? " " : ""}👍`);
                                            closeDirectMsgMenu();
                                            setTimeout(() => directInputRef.current?.focus(), 0);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Smile className="w-3 h-3 text-universe-muted" /> React
                                        </button>
                                        <button
                                          onClick={() => {
                                            setInputText((prev) => (prev ? `${prev}\n${message.text}` : message.text));
                                            setActiveSection("chat");
                                            closeDirectMsgMenu();
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <ArrowRight className="w-3 h-3 text-universe-muted" /> Forward
                                        </button>
                                        <button
                                          onClick={() => toggleDirectPin(message.conversationId, message.id)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Pin className="w-3 h-3 text-universe-muted" /> {message.isPinned ? "Unpin" : "Pin"}
                                        </button>
                                        <button
                                          onClick={() => toggleDirectStar(message.conversationId, message.id)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-universe-foreground hover:bg-universe-800 transition-colors"
                                        >
                                          <Star className="w-3 h-3 text-universe-muted" /> {message.isStarred ? "Unstar" : "Star"}
                                        </button>
                                        <div className="my-1 border-t border-universe-700" />
                                        <button
                                          onClick={() => deleteDirectMessageForMe(message.conversationId, message.id)}
                                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" /> Delete for me
                                        </button>
                                        {isOwnDirect ? (
                                          <button
                                            onClick={() => unsendDirectMessage(message.conversationId, message.id)}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                                          >
                                            <X className="w-3 h-3" /> Unsend
                                          </button>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <button
                                  type="button"
                                  onClick={() => setProfilePreviewUser(activeDirectPartner)}
                                  className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-2xl mb-3", getAvatarColor(activeDirectPartner))}
                                  title={`View ${activeDirectPartner}'s profile photo`}
                                >
                                  <span>{getAvatarSticker(activeDirectPartner)}</span>
                                </button>
                                <p className="text-base font-semibold text-universe-foreground">Private chat with {activeDirectPartner}</p>
                                <p className="text-sm text-universe-muted mt-2 max-w-sm">This chat is private. Send one message to save it in Direct.</p>
                              </div>
                            )}
                            <div ref={directMessagesEndRef} />
                          </div>

                          {directTypingUser === activeDirectPartner ? (
                            <div className="px-5 sm:px-6 py-1.5 text-[10px] text-universe-muted animate-pulse">{activeDirectPartner} is typing...</div>
                          ) : null}

                          <div className="border-t border-universe-700 bg-universe-800/30 px-4 sm:px-5 py-4">
                            <AnimatePresence>
                              {showDirectEmojiPicker && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  className="mb-2 rounded-2xl border border-universe-700 bg-universe-900 p-2.5"
                                >
                                  <div className="max-h-36 overflow-y-auto grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                                    {(filteredEmojiList.length > 0 ? filteredEmojiList : FULL_EMOJI_CATALOG).slice(0, 120).map((emoji) => (
                                      <button
                                        key={`direct-picker-${emoji}`}
                                        onClick={() => insertDirectEmoji(emoji)}
                                        className="text-lg leading-none p-1.5 rounded-lg hover:bg-universe-800 transition-colors"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {isVoiceRecording && voiceRecordingTarget === "direct" ? (
                              <div className="flex items-center gap-2.5 rounded-full border border-universe-700 bg-universe-900/90 px-3.5 py-2">
                                <button
                                  onClick={cancelVoiceRecording}
                                  className="p-1.5 rounded-full text-universe-muted hover:text-rose-400 hover:bg-universe-800/70 transition-colors"
                                  title="Discard recording"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="inline-flex items-center gap-1.5 text-xs text-universe-foreground min-w-[64px]">
                                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                                  <span>{formatDuration(voiceDuration)}</span>
                                </div>

                                <div className="flex-1 flex items-end gap-px px-1 h-5 overflow-hidden">
                                  {waveformBars.map((height, idx) => (
                                    <span
                                      key={`direct-wave-${idx}`}
                                      className={cn(
                                        "flex-1 rounded-full transition-all duration-75",
                                        isVoicePaused ? "bg-universe-muted/40" : "bg-rose-400/80"
                                      )}
                                      style={{ height: `${Math.max(2, Math.min(height, 20))}px` }}
                                    />
                                  ))}
                                </div>

                                <button
                                  onClick={toggleVoicePause}
                                  className="p-1.5 rounded-full text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70 transition-colors"
                                  title={isVoicePaused ? "Resume" : "Pause"}
                                >
                                  {isVoicePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={sendVoiceRecording}
                                  className="p-2 rounded-full bg-emerald-500 text-universe-900 hover:bg-emerald-400 transition-colors"
                                  title="Send voice note"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 rounded-full border border-universe-700 bg-universe-900/80 px-3.5 py-2">
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  <button
                                    onClick={() => directImageInputRef.current?.click()}
                                    className="p-1.5 rounded-full transition-colors text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                                    title="Send image"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowDirectEmojiPicker((prev) => !prev)}
                                    className={cn(
                                      "p-1.5 rounded-full transition-colors",
                                      showDirectEmojiPicker ? "text-universe-highlight bg-universe-highlight/10" : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                                    )}
                                    title="Emoji"
                                  >
                                    <Smile className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea
                                  ref={directInputRef}
                                  value={directInputText}
                                  onChange={(e) => {
                                    setDirectInputText(e.target.value);
                                    setComposerWarning(null);
                                    handleDirectTyping();
                                  }}
                                  onKeyDown={handleDirectKeyDown}
                                  placeholder="Type a message"
                                  rows={1}
                                  maxLength={MAX_MESSAGE_LENGTH}
                                  className="w-full bg-transparent border-0 px-1 py-1.5 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none resize-none max-h-32 transition-colors"
                                  style={{ minHeight: "32px" }}
                                />
                                <button
                                  onClick={handleDirectComposerAction}
                                  className={cn(
                                    "p-1.5 rounded-full transition-colors flex-shrink-0",
                                    directInputText.trim()
                                      ? "text-universe-highlight hover:bg-universe-highlight/10"
                                      : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/70"
                                  )}
                                  title={directInputText.trim() ? "Send private message" : "Voice note"}
                                >
                                  {directInputText.trim() ? <Send className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                              </div>
                            )}
                            <input
                              ref={directImageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleImagePick(event, "direct")}
                              className="hidden"
                            />
                            {composerWarning ? (
                              <div className="px-1 pt-1.5 text-[10px] text-rose-400 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> {composerWarning}
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center px-6">
                          <div className="text-center max-w-md">
                            <MessageCircle className="w-12 h-12 mx-auto text-universe-muted/30 mb-3" />
                            <p className="text-lg font-semibold text-universe-foreground">No saved private chats yet</p>
                            <p className="text-sm text-universe-muted mt-2">Community me kisi profile par click karo. Sirf wahi thread open hogi, aur first message ke baad hi Direct tab permanently dikhega.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeSection === "highlights" && (
                  <motion.div
                    key="highlights"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 overflow-y-auto p-4 space-y-4"
                  >
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="rounded-xl border border-universe-700 bg-universe-800/40 p-2.5">
                        <p className="text-[10px] text-universe-muted">Pinned</p>
                        <p className="text-lg font-semibold text-universe-foreground">{pinnedMessages.length}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/40 p-2.5">
                        <p className="text-[10px] text-universe-muted">Starred</p>
                        <p className="text-lg font-semibold text-universe-foreground">{starredMessages.length}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/40 p-2.5">
                        <p className="text-[10px] text-universe-muted">Mentions</p>
                        <p className="text-lg font-semibold text-universe-foreground">{mentionMessages.length}</p>
                      </div>
                    </div>

                    <section className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <h4 className="text-xs font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                        <Pin className="w-3.5 h-3.5 text-universe-highlight" /> Pinned Messages
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {pinnedMessages.length === 0 ? (
                          <p className="text-xs text-universe-muted">No pinned messages yet.</p>
                        ) : (
                          pinnedMessages.slice(-6).reverse().map((msg) => (
                            <button
                              key={msg.id}
                              onClick={() => {
                                setActiveSection("chat");
                                setSearchQuery(msg.text.slice(0, 24));
                              }}
                              className="w-full text-left rounded-lg border border-universe-700 bg-universe-900/60 px-2 py-1.5 hover:border-universe-highlight/40 transition-colors"
                            >
                              <p className="text-[11px] text-universe-highlight font-medium">{msg.username}</p>
                              <p className="text-xs text-universe-foreground truncate">{msg.text}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <h4 className="text-xs font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-universe-highlight" /> Trending Reactions
                      </h4>
                      <div className="space-y-2 max-h-44 overflow-y-auto">
                        {trendingMessages.length === 0 ? (
                          <p className="text-xs text-universe-muted">React to messages to unlock trending highlights.</p>
                        ) : (
                          trendingMessages.map((msg) => (
                            <div key={`trend-${msg.id}`} className="rounded-lg border border-universe-700 bg-universe-900/60 px-2 py-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] text-universe-highlight font-medium">{msg.username}</p>
                                <span className="text-[10px] text-universe-muted">{msg.reactionCount} reacts</span>
                              </div>
                              <p className="text-xs text-universe-foreground truncate">{msg.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <h4 className="text-xs font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                        <AtSign className="w-3.5 h-3.5 text-universe-highlight" /> Recent Mentions
                      </h4>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {mentionMessages.length === 0 ? (
                          <p className="text-xs text-universe-muted">No one has mentioned you yet.</p>
                        ) : (
                          mentionMessages.map((msg) => (
                            <div key={`mention-${msg.id}`} className="rounded-lg border border-universe-700 bg-universe-900/60 px-2 py-1.5">
                              <p className="text-[11px] text-universe-highlight font-medium">{msg.username}</p>
                              <p className="text-xs text-universe-foreground truncate">{msg.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <h4 className="text-xs font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-universe-highlight" /> Moderation Queue
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {moderationQueue.length === 0 ? (
                          <p className="text-xs text-universe-muted">No flagged content right now.</p>
                        ) : (
                          moderationQueue.map((msg) => (
                            <div key={`mod-${msg.id}`} className="rounded-lg border border-universe-700 bg-universe-900/60 px-2 py-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] text-universe-highlight font-medium">{msg.username}</p>
                                <div className="flex items-center gap-1">
                                  {msg.moderation?.isPromo && <span className="text-[9px] text-amber-400">promo</span>}
                                  {msg.isReported && <span className="text-[9px] text-rose-400">reported</span>}
                                </div>
                              </div>
                              <p className="text-xs text-universe-foreground truncate">{msg.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeSection === "insights" && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 overflow-y-auto p-4 space-y-4"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                      <div className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                        <p className="text-xs text-universe-muted">Community Msgs</p>
                        <p className="text-lg font-semibold text-universe-foreground">{textMessages.length}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                        <p className="text-xs text-universe-muted">Direct Threads</p>
                        <p className="text-lg font-semibold text-universe-foreground">{directConversationList.length}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                        <p className="text-xs text-universe-muted">Media Shared</p>
                        <p className="text-lg font-semibold text-universe-foreground">{mediaMessageCount}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                        <p className="text-xs text-universe-muted">Voice Notes</p>
                        <p className="text-lg font-semibold text-universe-foreground">{voiceMessageCount}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                        <p className="text-xs text-universe-muted">Links Shared</p>
                        <p className="text-lg font-semibold text-universe-foreground">{linkMessageCount}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                        <p className="text-xs text-universe-muted">Avg Msg Length</p>
                        <p className="text-lg font-semibold text-universe-foreground">{averageMessageLength}</p>
                      </div>
                    </div>

                    <section className="rounded-xl border border-universe-700 bg-universe-800/30 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-universe-foreground flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-universe-highlight" /> Smart Controls
                        </h4>
                        <button
                          onClick={() => setShowShortcuts(true)}
                          className="rounded-full border border-universe-700 px-3 py-1.5 text-xs font-medium text-universe-muted hover:text-universe-foreground transition-colors"
                        >
                          Open Shortcuts
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setActiveSection("chat");
                            setChatFilter("media");
                          }}
                          className="rounded-full border border-universe-700 bg-universe-900/60 px-3 py-1.5 text-xs font-medium text-universe-foreground hover:border-universe-highlight/40"
                        >
                          Media filter
                        </button>
                        <button
                          onClick={() => {
                            setActiveSection("chat");
                            setChatFilter("links");
                          }}
                          className="rounded-full border border-universe-700 bg-universe-900/60 px-3 py-1.5 text-xs font-medium text-universe-foreground hover:border-universe-highlight/40"
                        >
                          Link audit
                        </button>
                        <button
                          onClick={() => setActiveSection("highlights")}
                          className="rounded-full border border-universe-700 bg-universe-900/60 px-3 py-1.5 text-xs font-medium text-universe-foreground hover:border-universe-highlight/40"
                        >
                          Highlights panel
                        </button>
                        <button
                          onClick={() => setActiveSection(shouldShowDirectTab ? "direct" : "chat")}
                          className="rounded-full border border-universe-700 bg-universe-900/60 px-3 py-1.5 text-xs font-medium text-universe-foreground hover:border-universe-highlight/40"
                        >
                          Direct focus
                        </button>
                      </div>
                    </section>

                    <section className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <h4 className="text-sm font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-universe-highlight" /> Top Contributors
                      </h4>
                      <div className="space-y-2">
                        {topContributors.length === 0 ? (
                          <p className="text-xs text-universe-muted">No activity insights yet.</p>
                        ) : (
                          topContributors.map(([name, count], index) => (
                            <div key={`contributor-${name}`} className="flex items-center gap-2 rounded-lg border border-universe-700 bg-universe-900/60 px-3 py-2">
                              <div className="w-7 h-7 rounded-full bg-universe-highlight/15 text-universe-highlight flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-universe-foreground truncate">{name}</p>
                                <p className="text-xs text-universe-muted">{count} messages</p>
                              </div>
                              {name !== username ? (
                                <button
                                  onClick={() => openDirectConversation(name)}
                                  className="text-xs font-medium text-universe-highlight hover:text-universe-highlight/80"
                                >
                                  Message
                                </button>
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                        <h4 className="text-sm font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                          <LayoutList className="w-3.5 h-3.5 text-universe-highlight" /> Reaction + Highlight Stats
                        </h4>
                        <div className="space-y-2 text-sm text-universe-muted">
                          <div className="flex items-center justify-between gap-2">
                            <span>Total reactions</span>
                            <span className="font-semibold text-universe-foreground">{totalReactionCount}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Community pinned</span>
                            <span className="font-semibold text-universe-foreground">{pinnedMessages.length}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Community starred</span>
                            <span className="font-semibold text-universe-foreground">{starredMessages.length}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Direct pinned</span>
                            <span className="font-semibold text-universe-foreground">{directPinnedCount}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Direct starred</span>
                            <span className="font-semibold text-universe-foreground">{directStarredCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                        <h4 className="text-sm font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-universe-highlight" /> System Health
                        </h4>
                        <div className="space-y-2 text-sm text-universe-muted">
                          <div className="flex items-center justify-between gap-2">
                            <span>Promo filter</span>
                            <span className="font-semibold text-universe-foreground">On</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Moderation queue</span>
                            <span className="font-semibold text-universe-foreground">{moderationQueue.length}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Online users</span>
                            <span className="font-semibold text-universe-foreground">{onlineUsers.length}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Unread direct</span>
                            <span className="font-semibold text-universe-foreground">{directUnreadCount}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Draft buffers</span>
                            <span className="font-semibold text-universe-foreground">{(inputText.trim() ? 1 : 0) + (directInputText.trim() ? 1 : 0)}</span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeSection === "people" && (
                  <motion.div
                    key="people"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 overflow-y-auto p-4 space-y-4"
                  >
                    <div className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <h4 className="text-xs font-semibold text-universe-foreground flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-universe-highlight" /> Online People ({onlineUsers.length})
                      </h4>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {onlineUsers.length === 0 ? (
                          <p className="text-xs text-universe-muted">No one online right now.</p>
                        ) : (
                          onlineUsers.map((u) => (
                            <div key={u.username} className="flex items-center gap-2 rounded-lg border border-universe-700 bg-universe-900/70 px-2 py-1.5">
                              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white", getAvatarColor(u.username))}>
                                {u.username[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-universe-foreground truncate">{u.username} {u.username === username ? "(you)" : ""}</p>
                                <p className="text-[10px] text-universe-muted">Joined {formatTime(u.joinedAt)}</p>
                              </div>
                              <div className="ml-auto flex items-center gap-2">
                                <Circle className="w-2 h-2 text-emerald-400 fill-current" />
                                {u.username !== username && (
                                  <button
                                    onClick={() => openDirectConversation(u.username)}
                                    className="text-[10px] font-medium text-universe-highlight hover:text-universe-highlight/80 transition-colors"
                                  >
                                    Message
                                  </button>
                                )}
                                {u.username === username && (
                                  <button
                                    onClick={leaveChat}
                                    className="text-[10px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
                                  >
                                    Leave chat
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                        <p className="text-[10px] text-universe-muted">Active Typers</p>
                        <p className="text-base font-semibold text-universe-foreground">{typingUsers.length}</p>
                      </div>
                      <div className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                        <p className="text-[10px] text-universe-muted">Your Reactions</p>
                        <p className="text-base font-semibold text-universe-foreground">
                          {textMessages.reduce((acc, msg) => {
                            const count = Object.values(msg.reactions).reduce((sum, users) => {
                              return users.includes(username) ? sum + 1 : sum;
                            }, 0);
                            return acc + count;
                          }, 0)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-universe-700 bg-universe-800/30 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-universe-foreground flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-universe-highlight" /> User Controls
                        </p>
                        <span className="text-[10px] text-universe-muted">Muted: {mutedUsers.size}</span>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Array.from(mutedUsers).length === 0 ? (
                          <p className="text-xs text-universe-muted">No muted users.</p>
                        ) : (
                          Array.from(mutedUsers).map((name) => (
                            <div key={`mute-${name}`} className="flex items-center justify-between rounded-lg border border-universe-700 bg-universe-900/70 px-2 py-1.5">
                              <span className="text-xs text-universe-foreground">{name}</span>
                              <button onClick={() => unmuteUser(name)} className="text-[10px] text-universe-highlight hover:underline">
                                Unmute
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-universe-700 bg-universe-highlight/10 p-3">
                      <p className="text-xs font-medium text-universe-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-universe-highlight" /> Pro tip
                      </p>
                      <p className="text-xs text-universe-muted mt-1">
                        Use Highlights to pin or star useful messages, then jump back into Chat instantly.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowShortcuts(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="w-full max-w-lg rounded-3xl border border-universe-700 bg-universe-900 p-5 space-y-4"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-universe-foreground">Advanced Chat Shortcuts</h4>
                    <p className="text-sm text-universe-muted mt-1">Fast controls for search, filters, direct actions, and focus switching.</p>
                  </div>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="rounded-full border border-universe-700 p-2 text-universe-muted hover:text-universe-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    ["/", "Open chat search when not typing"],
                    ["Ctrl/Cmd + K", "Toggle global chat search"],
                    ["Ctrl/Cmd + /", "Open this shortcuts panel"],
                    ["Esc", "Close shortcuts, menus, and search"],
                    ["Enter", "Send current message"],
                    ["Shift + Enter", "Insert a new line"],
                  ].map(([shortcut, description]) => (
                    <div key={shortcut} className="rounded-xl border border-universe-700 bg-universe-800/35 p-3">
                      <p className="text-sm font-semibold text-universe-foreground">{shortcut}</p>
                      <p className="text-xs text-universe-muted mt-1">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-universe-700 bg-universe-800/30 p-4 space-y-2">
                  <p className="text-sm font-semibold text-universe-foreground">What was added</p>
                  <p className="text-sm text-universe-muted">Advanced filters, insights dashboard, real direct pin/star actions, keyboard shortcuts, and stable reaction/layout behavior.</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {profilePreviewUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setProfilePreviewUser(null)}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                className="w-full max-w-xs rounded-3xl border border-universe-700 bg-universe-900 p-5 text-center"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={cn("mx-auto w-24 h-24 rounded-3xl flex items-center justify-center text-4xl", getAvatarColor(profilePreviewUser))}>
                  {getAvatarSticker(profilePreviewUser)}
                </div>
                <p className="mt-3 text-base font-semibold text-universe-foreground truncate">{profilePreviewUser}</p>
                <p className="text-xs text-universe-muted mt-1">Profile photo preview</p>
                <button
                  onClick={() => setProfilePreviewUser(null)}
                  className="mt-4 w-full rounded-xl border border-universe-700 bg-universe-800/70 px-3 py-2 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
