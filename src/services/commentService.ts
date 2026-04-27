import { supabase } from '../lib/supabase'

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

async function attachAuthor(comment: any) {
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

export const commentService = {
  async getCommentsByPost(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) return { data: null, error }
    
    const commentsWithAuthors = await Promise.all((data || []).map(attachAuthor))
    return { data: commentsWithAuthors, error: null }
  },

  async addComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content
      })
      .select()
      .single()
    
    if (error) return { data: null, error }
    
    const commentWithAuthor = await attachAuthor(data)
    
    if (!error && data) {
      await supabase.rpc('increment_comments', { post_uuid: postId })
    }
    
    return { data: commentWithAuthor, error: null }
  },

  async deleteComment(commentId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id)
    
    return { error }
  }
}