import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface Post {
  id: string
  author_id: string
  publication_id: string | null
  title: string
  subtitle: string | null
  cover_image: string | null
  content: unknown
  is_member_only: boolean
  is_published: boolean
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

export interface UserPost extends Post {
  isLiked?: boolean
  isSaved?: boolean
  isFollowing?: boolean
}

async function attachAuthor(post: any) {
  if (post.author_id) {
    const { data: author } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', post.author_id)
      .single()
    return { ...post, author }
  }
  return { ...post, author: null }
}

export const postService = {
  async getAllPosts(limit: number = 20, offset: number = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) return { data: null, error }
    const postsWithAuthors = await Promise.all((data || []).map(attachAuthor))
    return { data: postsWithAuthors, error: null }
  },

  async getPostById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
    
    if (error) return { data: null, error }
    return { data: await attachAuthor(data), error: null }
  },

  async getPostsByAuthor(authorId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    if (error) return { data: null, error }
    const postsWithAuthors = await Promise.all((data || []).map(attachAuthor))
    return { data: postsWithAuthors, error: null }
  },

  async createPost(post: {
    title: string
    subtitle?: string
    cover_image?: string
    content?: unknown
    is_member_only?: boolean
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...post,
        author_id: user.id
      })
      .select()
      .single()
    
    if (error) return { data: null, error }
    const postWithAuthor = await attachAuthor(data)
    return { data: postWithAuthor, error: null }
  }
}

export function usePosts() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const postsWithAuthors = await Promise.all((data || []).map(attachAuthor))
      setPosts(postsWithAuthors)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, error, refetch: fetchPosts }
}

export function useUserPosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserPosts = useCallback(async () => {
    if (!userId) {
      setPosts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const postsWithAuthors = await Promise.all((data || []).map(attachAuthor))
      setPosts(postsWithAuthors)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching user posts:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUserPosts()
  }, [fetchUserPosts])

  return { posts, loading, error, refetch: fetchUserPosts }
}

export function useFollowStats(userId?: string) {
  const [stats, setStats] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setStats({ followers: 0, following: 0 })
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
      ])

      setStats({
        followers: followers || 0,
        following: following || 0
      })
      setLoading(false)
    }

    fetchStats()
  }, [userId])

  return { ...stats, loading }
}

export function useBookmarks() {
  const { user } = useAuth()
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBookmarkedIds(new Set())
      setLoading(false)
      return
    }

    const fetchBookmarks = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', user.id)
      
      if (data) {
        setBookmarkedIds(new Set(data.map(b => b.post_id)))
      }
      setLoading(false)
    }

    fetchBookmarks()
  }, [user])

  const toggleBookmark = async (postId: string) => {
    if (!user) return false

    const isBookmarked = bookmarkedIds.has(postId)
    
    if (isBookmarked) {
      await supabase.from('bookmarks').delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      setBookmarkedIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        post_id: postId
      })
      setBookmarkedIds(prev => new Set([...prev, postId]))
    }
    
    return !isBookmarked
  }

  return { bookmarkedIds, loading, toggleBookmark }
}

export function useUserLikes() {
  const { user } = useAuth()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLikedIds(new Set())
      setLoading(false)
      return
    }

    const fetchLikes = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
      
      if (data) {
        setLikedIds(new Set(data.map(l => l.post_id)))
      }
      setLoading(false)
    }

    fetchLikes()
  }, [user])

  const toggleLike = async (postId: string) => {
    if (!user) return false

    const isLiked = likedIds.has(postId)
    
    if (isLiked) {
      await supabase.from('likes').delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      setLikedIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    } else {
      await supabase.from('likes').insert({
        user_id: user.id,
        post_id: postId
      })
      setLikedIds(prev => new Set([...prev, postId]))
    }
    
    return !isLiked
  }

  return { likedIds, loading, toggleLike }
}

export function useFollowingList() {
  const { user } = useAuth()
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFollowingIds(new Set())
      setLoading(false)
      return
    }

    const fetchFollowing = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
      
      if (data) {
        setFollowingIds(new Set(data.map(f => f.following_id)))
      }
      setLoading(false)
    }

    fetchFollowing()
  }, [user])

  const toggleFollow = async (targetUserId: string) => {
    if (!user) return false
    if (targetUserId === user.id) return false

    const isFollowing = followingIds.has(targetUserId)
    
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
      setFollowingIds(prev => {
        const next = new Set(prev)
        next.delete(targetUserId)
        return next
      })
    } else {
      await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: targetUserId
      })
      setFollowingIds(prev => new Set([...prev, targetUserId]))
    }
    
    return !isFollowing
  }

  return { followingIds, loading, toggleFollow }
}