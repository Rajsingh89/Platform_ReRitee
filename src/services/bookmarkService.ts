import { supabase } from '../lib/supabase'

export interface Bookmark {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

async function attachPostAuthor(bookmark: any) {
  if (bookmark.post_id) {
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, subtitle, cover_image, author_id, created_at')
      .eq('id', bookmark.post_id)
      .single()
    
    if (post && post.author_id) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', post.author_id)
        .single()
      return { ...bookmark, post: { ...post, author } }
    }
    return { ...bookmark, post }
  }
  return { ...bookmark, post: null }
}

export const bookmarkService = {
  async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) return { data: null, error }
    
    const bookmarksWithPosts = await Promise.all((data || []).map(attachPostAuthor))
    return { data: bookmarksWithPosts, error: null }
  },

  async isBookmarked(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    
    return !!data
  },

  async addBookmark(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        post_id: postId
      })
      .select()
      .single()
    
    return { data, error }
  },

  async removeBookmark(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)
    
    return { error }
  },

  async toggleBookmark(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const isCurrentlyBookmarked = await this.isBookmarked(user.id, postId)
    
    if (isCurrentlyBookmarked) {
      await this.removeBookmark(postId)
      return false
    } else {
      await this.addBookmark(postId)
      return true
    }
  }
}