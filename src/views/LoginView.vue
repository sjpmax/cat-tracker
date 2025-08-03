<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold">🐱 Cat Tracker</h1>
        <p class="text-base-content/70 mt-2">Track your cats' feeding habits</p>
      </div>
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/Auth/LoginForm.vue'
</script>
