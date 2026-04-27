import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface Post {
  id: string
  author_id: string | null
  title: string
  subtitle: string | null
  cover_image: string | null
  content: unknown
  is_member_only: boolean
  claps_count: number
  comments_count: number
  read_time: string | null
  created_at: string
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

export interface Comment {
  id: string
  post_id: string
  content: string
  created_at: string
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

interface AppContextType {
  posts: Post[]
  loadingPosts: boolean
  refreshPosts: () => Promise<void>
  getPost: (id: string) => Post | undefined
  likedPostIds: Set<string>
  toggleLike: (postId: string) => Promise<void>
  bookmarkedPostIds: Set<string>
  toggleBookmark: (postId: string) => Promise<void>
  followingIds: Set<string>
  toggleFollow: (userId: string) => Promise<void>
  getComments: (postId: string) => Comment[]
  addComment: (postId: string, content: string) => Promise<void>
  followersCount: number
  followingCount: number
  refreshFollowStats: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set())
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set())
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading posts:', error)
        setPosts([])
        setLoadingPosts(false)
        return
      }
      
      const postsWithAuthors = await Promise.all((data || []).map(async (post) => {
        if (post.author_id) {
          const { data: author } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', post.author_id)
            .single()
          return { ...post, author }
        }
        return { ...post, author: null }
      }))
      
      setPosts(postsWithAuthors)
    } catch (err) {
      console.error('Error loading posts:', err)
      setPosts([])
    } finally {
      setLoadingPosts(false)
    }
  }, [])

  const loadUserData = useCallback(async () => {
    if (!user) {
      setLikedPostIds(new Set())
      setBookmarkedPostIds(new Set())
      setFollowingIds(new Set())
      return
    }

    const [likes, bookmarks, following] = await Promise.all([
      supabase.from('likes').select('post_id').eq('user_id', user.id),
      supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
      supabase.from('follows').select('following_id').eq('follower_id', user.id)
    ])

    setLikedPostIds(new Set(likes.data?.map(l => l.post_id) || []))
    setBookmarkedPostIds(new Set(bookmarks.data?.map(b => b.post_id) || []))
    setFollowingIds(new Set(following.data?.map(f => f.following_id) || []))
  }, [user])

  const loadFollowStats = useCallback(async () => {
    if (!user) return
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
    ])
    setFollowersCount(followers || 0)
    setFollowingCount(following || 0)
  }, [user])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    loadUserData()
    loadFollowStats()
  }, [user, loadUserData, loadFollowStats])

  const getPost = useCallback((id: string) => posts.find(p => p.id === id), [posts])

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return
    const isLiked = likedPostIds.has(postId)
    
    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', postId)
      setLikedPostIds(prev => { const n = new Set(prev); n.delete(postId); return n })
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
      setLikedPostIds(prev => new Set([...prev, postId]))
    }
  }, [user, likedPostIds])

  const toggleBookmark = useCallback(async (postId: string) => {
    if (!user) return
    const isBookmarked = bookmarkedPostIds.has(postId)
    
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('post_id', postId)
      setBookmarkedPostIds(prev => { const n = new Set(prev); n.delete(postId); return n })
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, post_id: postId })
      setBookmarkedPostIds(prev => new Set([...prev, postId]))
    }
  }, [user, bookmarkedPostIds])

  const toggleFollow = useCallback(async (userId: string) => {
    if (!user || user.id === userId) return
    const isFollowing = followingIds.has(userId)
    
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId)
      setFollowingIds(prev => { const n = new Set(prev); n.delete(userId); return n })
      setFollowersCount(prev => prev - 1)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: userId })
      setFollowingIds(prev => new Set([...prev, userId]))
      setFollowersCount(prev => prev + 1)
    }
  }, [user, followingIds])

  const getComments = useCallback((postId: string) => comments[postId] || [], [comments])

  const addComment = useCallback(async (postId: string, content: string) => {
    if (!user) return
    
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, content })
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .single()
    
    if (data) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }))
    }
  }, [user])

  return (
    <AppContext.Provider value={{
      posts,
      loadingPosts,
      refreshPosts: loadPosts,
      getPost,
      likedPostIds,
      toggleLike,
      bookmarkedPostIds,
      toggleBookmark,
      followingIds,
      toggleFollow,
      getComments,
      addComment,
      followersCount,
      followingCount,
      refreshFollowStats: loadFollowStats
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}