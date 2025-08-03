<template>
  <div class="card w-full max-w-sm mx-auto bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title justify-center">{{ isSignUp ? 'Sign Up' : 'Login' }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input v-model="email"
                 type="email"
                 placeholder="Enter your email"
                 class="input input-bordered w-full"
                 required />
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input v-model="password"
                 type="password"
                 placeholder="Enter your password"
                 class="input input-bordered w-full"
                 required />
        </div>

        <div v-if="error" class="alert alert-error mt-4">
          <span>{{ error }}</span>
        </div>

        <div class="card-actions justify-end mt-6">
          <button type="submit"
                  class="btn btn-primary w-full"
                  :class="{ 'loading': authStore.loading }"
                  :disabled="authStore.loading">
            {{ isSignUp ? 'Sign Up' : 'Login' }}
          </button>
        </div>
      </form>

      <div class="divider">OR</div>

      <button @click="toggleMode"
              class="btn btn-ghost w-full">
        {{ isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const error = ref('')

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  error.value = ''
}

const handleSubmit = async () => {
  error.value = ''

  const { data, error: authError } = isSignUp.value
    ? await authStore.signUp(email.value, password.value)
    : await authStore.signIn(email.value, password.value)

  if (authError) {
    error.value = authError.message
  } else if (data && !isSignUp.value) {
    router.push('/dashboard')
  } else if (isSignUp.value) {
    error.value = 'Check your email for confirmation link!'
  }
}</script>
