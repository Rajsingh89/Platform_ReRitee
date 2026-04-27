import { supabase } from '../lib/supabase'

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export const followService = {
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    
    return !!data
  },

  async getFollowers(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId)
    
    return data?.map(f => f.follower_id) || []
  },

  async getFollowing(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    
    return data?.map(f => f.following_id) || []
  },

  async followUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    if (user.id === followingId) {
      return { error: new Error('Cannot follow yourself') }
    }

    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId
      })
      .select()
      .single()
    
    return { data, error }
  },

  async unfollowUser(followingId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
    
    return { error }
  },

  async toggleFollow(followingId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const isCurrentlyFollowing = await this.isFollowing(user.id, followingId)
    
    if (isCurrentlyFollowing) {
      await this.unfollowUser(followingId)
      return false
    } else {
      await this.followUser(followingId)
      return true
    }
  },

  async getFollowCount(userId: string) {
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    const { count: following } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    return { followers, following }
  }
}