import { supabase } from '../lib/supabase'
import type { Profile } from './authService'

export interface ProfileWithFollowStatus extends Profile {
  isFollowing: boolean;
}

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error) return null
    return data
  },

  async getSuggestedUsers(currentUserId: string, limit = 5): Promise<Profile[]> {
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);

    const followingIds = following?.map(f => f.following_id) || [];
    const excludeIds = [...followingIds, currentUserId];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  async getFollowingUsers(currentUserId: string): Promise<Profile[]> {
    const { data } = await supabase
      .from('follows')
      .select('following:following_id(id, username, full_name, avatar_url)')
      .eq('follower_id', currentUserId);

    return data?.map(f => f.following).filter(Boolean) as Profile[] || [];
  }
}