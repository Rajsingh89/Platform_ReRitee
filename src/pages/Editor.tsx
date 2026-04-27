import { useState, useEffect } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { BrainCircuit, Plus, Image as ImageIcon, AlertTriangle, MessageSquare, X, Eye, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { postService } from "../services/postService";

interface Block {
  type: 'paragraph' | 'challenge' | 'perspective';
  content: string;
  question?: string;
  options?: string[];
}

export const Editor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshPosts } = useApp();
  
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { type: 'paragraph', content: '' }
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageInput, setCoverImageInput] = useState("");
  
  const [showCognitiveMenu, setShowCognitiveMenu] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const addBlock = (type: string) => {
    setBlocks([...blocks, { type: type as Block['type'], content: '' }]);
    setShowCognitiveMenu(null);
  };

  const updateBlock = (index: number, content: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].content = content;
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
    setShowTagInput(false);
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleCoverImage = () => {
    if (coverImageInput.trim()) {
      setCoverImage(coverImageInput.trim());
    }
    setShowTagInput(false);
  };

  const previewContent = blocks.map(b => b.content).filter(c => c).join('\n\n');

  const handlePreview = () => {
    if (!title.trim()) {
      alert("Please add a title before previewing");
      return;
    }
    setShowPreview(true);
  };

  const handlePublish = async () => {
    if (!user) {
      alert("Please sign in to publish");
      navigate("/login");
      return;
    }
    if (!title.trim()) {
      alert("Please add a title");
      return;
    }

    setPublishing(true);
    try {
      const content = blocks.map(b => ({
        type: b.type,
        content: b.content
      }));

      const readTime = `${Math.max(1, Math.ceil(previewContent.split(' ').length / 200))} min`;

      const { data, error } = await postService.createPost({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        cover_image: coverImage || null,
        content: content,
        is_member_only: false,
      });

      if (error) throw error;

      await refreshPosts();
      navigate(`/blog/${data.id}`);
    } catch (err) {
      console.error("Publish error:", err);
      alert("Failed to publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) return;
    
    setSaving(true);
    try {
      const content = blocks.map(b => ({
        type: b.type,
        content: b.content
      }));

      const { error } = await postService.createPost({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        cover_image: coverImage || null,
        content: content,
        is_member_only: false,
      });

      if (error) throw error;

      setLastSaved(new Date());
    } catch (err) {
      console.error("Save draft error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground transition-colors duration-300">
      <Navbar />
      
      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-universe-900/95 backdrop-blur overflow-y-auto"
          >
            <div className="max-w-3xl mx-auto px-4 py-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Preview</h2>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-universe-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <article className="prose prose-invert max-w-none">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{title || "Untitled"}</h1>
                {subtitle && <p className="text-xl text-universe-muted mb-8">{subtitle}</p>}
                
                {coverImage && (
                  <img src={coverImage} alt="" className="w-full h-64 object-cover rounded-lg mb-8" />
                )}
                
                <div className="space-y-4">
                  {blocks.filter(b => b.content).map((block, idx) => (
                    <p key={idx} className="text-lg leading-relaxed">{block.content}</p>
                  ))}
                </div>
                
                {tags.length > 0 && (
                  <div className="flex gap-2 mt-8">
                    {tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-universe-800 rounded-full text-sm">{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <div className="mb-8 flex items-center gap-4 text-sm text-universe-muted">
          <span>Draft in {user ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown') : 'Guest'}</span>
          <span>·</span>
          {saving ? (
            <span className="text-universe-muted flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>
          ) : lastSaved ? (
            <span className="text-green-500">Saved</span>
          ) : (
            <span>Unsaved</span>
          )}
        </div>

        {/* Title Input */}
        <input 
          type="text" 
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-5xl md:text-6xl font-serif font-bold placeholder-universe-muted/50 border-none outline-none mb-4 text-universe-foreground focus:placeholder-universe-highlight/30 transition-colors"
        />

        {/* Subtitle Input */}
        <input 
          type="text" 
          placeholder="Subtitle (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full bg-transparent text-xl text-universe-muted placeholder-universe-muted/50 border-none outline-none mb-8 text-universe-foreground focus:placeholder-universe-highlight/30 transition-colors"
        />

        {/* Cover Image */}
        {coverImage && (
          <div className="mb-8">
            <img src={coverImage} alt="" className="w-full h-48 object-cover rounded-lg" />
            <button 
              onClick={() => setCoverImage("")}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              Remove cover image
            </button>
          </div>
        )}

        {/* Editor Area */}
        <div className="space-y-6 min-h-[50vh]">
          {blocks.map((block, idx) => (
            <div key={idx} className="relative group">
              <button
                onClick={() => deleteBlock(idx)}
                className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 text-universe-muted hover:text-red-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              
              {block.type === 'paragraph' && (
                <textarea 
                  placeholder="Tell your story..." 
                  value={block.content}
                  onChange={(e) => updateBlock(idx, e.target.value)}
                  className="w-full bg-transparent text-xl font-serif text-universe-foreground placeholder-universe-muted/50 border-none outline-none resize-none overflow-hidden h-auto focus:placeholder-universe-highlight/30 transition-colors"
                  rows={3}
                />
              )}
              
              {block.type === 'challenge' && (
                <div className="p-6 rounded-xl bg-universe-800 border border-universe-highlight/30 relative">
                  <div className="absolute -left-3 top-6 w-1 h-12 bg-universe-highlight rounded-full" />
                  <div className="flex items-center gap-2 mb-4 text-universe-highlight font-bold text-xs uppercase tracking-wider">
                    <BrainCircuit className="w-4 h-4" /> Reritee Challenge
                  </div>
                  <textarea 
                    placeholder="Enter the question to challenge the reader..."
                    value={block.content}
                    onChange={(e) => updateBlock(idx, e.target.value)}
                    className="w-full bg-transparent text-lg font-medium text-universe-foreground placeholder-universe-muted border-none outline-none mb-4"
                    rows={2}
                  />
                </div>
              )}

              {block.type === 'perspective' && (
                <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30 relative ml-8">
                  <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" /> Critic's Perspective
                  </div>
                  <textarea 
                    placeholder="How would a critic argue against the previous point?"
                    value={block.content}
                    onChange={(e) => updateBlock(idx, e.target.value)}
                    className="w-full bg-transparent text-lg text-universe-foreground placeholder-universe-muted border-none outline-none resize-none"
                    rows={2}
                  />
                </div>
              )}

              {/* Quick Add Menu Trigger */}
              <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                <button 
                  onClick={() => setShowCognitiveMenu(showCognitiveMenu === idx ? null : idx)}
                  className="w-8 h-8 rounded-full border border-universe-muted text-universe-muted flex items-center justify-center hover:border-universe-highlight hover:text-universe-highlight transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Cognitive Menu */}
              <AnimatePresence>
                {showCognitiveMenu === idx && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute left-10 top-0 z-20 bg-universe-800 border border-universe-700 rounded-lg shadow-2xl p-2 flex gap-2"
                  >
                    <button onClick={() => addBlock('challenge')} className="p-2 hover:bg-universe-highlight/10 rounded group/btn relative transition-colors">
                      <BrainCircuit className="w-5 h-5 text-universe-muted group-hover/btn:text-universe-highlight transition-colors" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none">Add Challenge</span>
                    </button>
                    <button onClick={() => addBlock('perspective')} className="p-2 hover:bg-universe-highlight/10 rounded group/btn relative transition-colors">
                      <MessageSquare className="w-5 h-5 text-universe-muted group-hover/btn:text-universe-highlight transition-colors" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none">Add Perspective</span>
                    </button>
                    <button className="p-2 hover:bg-universe-highlight/10 rounded group/btn relative transition-colors">
                      <ImageIcon className="w-5 h-5 text-universe-muted group-hover/btn:text-universe-highlight transition-colors" />
                    </button>
                    <button className="p-2 hover:bg-universe-highlight/10 rounded group/btn relative transition-colors">
                      <AlertTriangle className="w-5 h-5 text-universe-muted group-hover/btn:text-universe-highlight transition-colors" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Add Content Button */}
        <button 
          onClick={() => setBlocks([...blocks, { type: 'paragraph', content: '' }])}
          className="mt-8 flex items-center gap-2 text-universe-muted hover:text-universe-highlight transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add more content
        </button>

        {/* Tags Section */}
        <div className="mt-12 border-t border-universe-700 pt-8">
          <h3 className="text-sm font-medium mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-universe-800 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="text-universe-muted hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {showTagInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Enter tag"
                  className="px-3 py-1 bg-universe-800 rounded-full text-sm border border-universe-700 focus:border-universe-highlight outline-none"
                  autoFocus
                />
                <button onClick={addTag} className="text-universe-highlight hover:text-universe-highlight/80">
                  Add
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowTagInput(true)}
                className="px-3 py-1 bg-universe-800/50 rounded-full text-sm text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
              >
                + Add tag
              </button>
            )}
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="mt-8 border-t border-universe-700 pt-8">
          <h3 className="text-sm font-medium mb-4">Cover Image</h3>
          {coverImage ? (
            <div className="text-sm text-universe-muted">
              Cover image set. <button onClick={() => setCoverImage("")} className="text-red-400 hover:text-red-300">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImageInput}
                onChange={(e) => setCoverImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCoverImage()}
                placeholder="Paste image URL"
                className="flex-1 px-3 py-2 bg-universe-800 rounded text-sm border border-universe-700 focus:border-universe-highlight outline-none"
              />
              <Button onClick={handleCoverImage} variant="ghost" size="sm">Add</Button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-universe-900/90 backdrop-blur border-t border-universe-700 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div className="flex gap-4 text-sm text-universe-muted">
             <button onClick={handleSaveDraft} className="hover:text-universe-highlight transition-colors">
               {saving ? 'Saving...' : 'Save draft'}
             </button>
           </div>
           <div className="flex gap-4">
             <Button 
               variant="ghost" 
               onClick={handlePreview}
               disabled={!title.trim()}
               className="flex items-center gap-2"
             >
               <Eye className="w-4 h-4" /> Preview
             </Button>
             <Button 
               variant="primary" 
               onClick={handlePublish}
               disabled={publishing || !title.trim() || !user}
               className="flex items-center gap-2"
             >
               {publishing ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                 </>
               ) : (
                 <>
                   <Send className="w-4 h-4" /> Publish
                 </>
               )}
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};