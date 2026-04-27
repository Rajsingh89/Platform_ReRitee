import { supabase } from '../lib/supabase'

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export const likeService = {
  async hasUserLiked(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    
    return !!data
  },

  async getUserLikes(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
    
    return data?.map(l => l.post_id) || []
  },

  async likePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: user.id,
        post_id: postId
      })
      .select()
      .single()
    
    if (!error && data) {
      await supabase.rpc('increment_claps', { post_uuid: postId })
    }
    
    return { data, error }
  },

  async unlikePost(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)
    
    if (!error) {
      await supabase.rpc('decrement_claps', { post_uuid: postId })
    }
    
    return { error }
  },

  async toggleLike(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const hasLiked = await this.hasUserLiked(user.id, postId)
    
    if (hasLiked) {
      await this.unlikePost(postId)
      return false
    } else {
      await this.likePost(postId)
      return true
    }
  }
}