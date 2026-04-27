import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  is_membership: boolean
  created_at: string
}

export interface Post {
  id: string
  author_id: string | null
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
  author?: Profile
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: Profile
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

async function attachCommentAuthor(comment: any) {
  if (comment.author_id) {
    const { data: author } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', comment.author_id)
      .single()
    return { ...comment, author }
  }
  return { ...comment, author: null }
}

// ─── AUTH SERVICE ──────────────────────────────────────────────────────────────
export const authService = {
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, full_name: username } }
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// ─── PROFILE SERVICE ──────────────────────────────────────────────────────────
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// ─── POST SERVICE ─────────────────────────────────────────────────────────────
export const postService = {
  async getAll(limit = 20) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) return { data: null, error }
    const postsWithAuthors = await Promise.all((data || []).map(attachAuthor))
    return { data: postsWithAuthors, error: null }
  },

  async getById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
    
    if (error) return { data: null, error }
    return { data: await attachAuthor(data), error: null }
  },

  async getByAuthor(authorId: string) {
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

  async create(post: { title: string; subtitle?: string; cover_image?: string; content?: unknown; is_member_only?: boolean }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...post, author_id: user.id })
      .select()
      .single()
    
    if (error) return { data: null, error }
    return { data: await attachAuthor(data), error: null }
  }
}

// ─── LIKE SERVICE ──────────────────────────────────────────────────────────────
export const likeService = {
  async isLiked(userId: string, postId: string) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    return !!data
  },

  async getUserLikes(userId: string) {
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
    return data?.map(l => l.post_id) || []
  },

  async toggle(userId: string, postId: string) {
    const isLiked = await this.isLiked(userId, postId)
    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId)
    } else {
      await supabase.from('likes').insert({ user_id: userId, post_id: postId })
    }
    return !isLiked
  }
}

// ─── COMMENT SERVICE ──────────────────────────────────────────────────────────
export const commentService = {
  async getByPost(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) return { data: null, error }
    const commentsWithAuthors = await Promise.all((data || []).map(attachCommentAuthor))
    return { data: commentsWithAuthors, error: null }
  },

  async add(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, content })
      .select()
      .single()
    
    if (error) return { data: null, error }
    return { data: await attachCommentAuthor(data), error: null }
  },

  async delete(commentId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }
    return supabase.from('comments').delete().eq('id', commentId).eq('author_id', user.id)
  }
}

// ─── FOLLOW SERVICE ──────────────────────────────────────────────────────────
export const followService = {
  async isFollowing(followerId: string, followingId: string) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    return !!data
  },

  async getFollowing(userId: string) {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    return data?.map(f => f.following_id) || []
  },

  async toggle(followerId: string, followingId: string) {
    if (followerId === followingId) return false
    const isFollowing = await this.isFollowing(followerId, followingId)
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
    } else {
      await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
    }
    return !isFollowing
  },

  async getStats(userId: string) {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ])
    return { followers: followers || 0, following: following || 0 }
  }
}

// ─── BOOKMARK SERVICE ─────────────────────────────────────────────────────────
export const bookmarkService = {
  async getUserBookmarks(userId: string) {
    const { data } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId)
    return data?.map(b => b.post_id) || []
  },

  async isBookmarked(userId: string, postId: string) {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    return !!data
  },

  async toggle(userId: string, postId: string) {
    const isBookmarked = await this.isBookmarked(userId, postId)
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId)
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId })
    }
    return !isBookmarked
  }
}

export interface Post {
  id: string
  author_id: string | null
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
  author?: Profile
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: Profile
}

// ─── AUTH SERVICE ────────────────���────────────────────────────────────────────
export const authService = {
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, full_name: username } }
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async signOut() {
    return supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// ─── PROFILE SERVICE ───────────────────────────────────────────────────────────
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// ─── POST SERVICE ─────────────────────────────────────────────────────────────
export const postService = {
  async getAll(limit = 20) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async getById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .eq('id', postId)
      .single()
    return { data, error }
  },

  async getByAuthor(authorId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .eq('author_id', authorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(post: { title: string; subtitle?: string; cover_image?: string; content?: unknown; is_member_only?: boolean }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...post, author_id: user.id })
      .select()
      .single()
    return { data, error }
  }
}

// ─── LIKE SERVICE ──────────────────────────────────────────────────────────────
export const likeService = {
  async isLiked(userId: string, postId: string) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    return !!data
  },

  async getUserLikes(userId: string) {
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
    return data?.map(l => l.post_id) || []
  },

  async toggle(userId: string, postId: string) {
    const isLiked = await this.isLiked(userId, postId)
    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId)
    } else {
      await supabase.from('likes').insert({ user_id: userId, post_id: postId })
    }
    return !isLiked
  }
}

// ─── COMMENT SERVICE ──────────────────────────────────────────────────────────
export const commentService = {
  async getByPost(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  async add(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, content })
      .select('*, author:profiles!author_id(id, username, full_name, avatar_url)')
      .single()
    return { data, error }
  },

  async delete(commentId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }
    return supabase.from('comments').delete().eq('id', commentId).eq('author_id', user.id)
  }
}

// ─── FOLLOW SERVICE ──────────────────────────────────────────────────────────
export const followService = {
  async isFollowing(followerId: string, followingId: string) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    return !!data
  },

  async getFollowing(userId: string) {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    return data?.map(f => f.following_id) || []
  },

  async toggle(followerId: string, followingId: string) {
    if (followerId === followingId) return false
    const isFollowing = await this.isFollowing(followerId, followingId)
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId)
    } else {
      await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId })
    }
    return !isFollowing
  },

  async getStats(userId: string) {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ])
    return { followers: followers || 0, following: following || 0 }
  }
}

// ─── BOOKMARK SERVICE ─────────────────────────────────────────────────────────
export const bookmarkService = {
  async getUserBookmarks(userId: string) {
    const { data } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId)
    return data?.map(b => b.post_id) || []
  },

  async isBookmarked(userId: string, postId: string) {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    return !!data
  },

  async toggle(userId: string, postId: string) {
    const isBookmarked = await this.isBookmarked(userId, postId)
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId)
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId })
    }
    return !isBookmarked
  }
}