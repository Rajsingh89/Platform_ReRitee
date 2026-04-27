import { supabase } from '../lib/supabase'

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
    is_published?: boolean
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...post,
        author_id: user.id,
        is_published: post.is_published ?? true
      })
      .select()
      .single()
    
    if (error) return { data: null, error }
    return { data: await attachAuthor(data), error: null }
  },

  async updatePost(postId: string, updates: Partial<Post>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('author_id', user.id)
      .select()
      .single()
    
    if (error) return { data: null, error }
    return { data: await attachAuthor(data), error: null }
  },

  async deletePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id)
    
    return { error }
  }
}