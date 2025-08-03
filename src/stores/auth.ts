import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
     initialized: false
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user 
  },
  actions: {
    async signUp(email, password) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        return { data, error: null }
      } catch (error) {
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async signIn(email, password) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        this.user = data.user
        return { data, error: null }
      } catch (error) {
        return { data: null, error }
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        this.user = null
      }
      return { error }
    },

    async initialize() {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      this.user = session?.user || null
      this.initialized = true

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null
      })
    }
  }
})
