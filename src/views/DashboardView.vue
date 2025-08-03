<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navigation -->
    <div class="navbar bg-primary text-primary-content">
      <div class="navbar-start">
        <h1 class="text-xl font-bold">🐱 Cat Tracker</h1>
      </div>
      <div class="navbar-end">
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost">
            {{ authStore.user?.email }}
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow text-base-content">
            <li><a @click="handleLogout">Logout</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-4">
      <!-- Add Cat Section -->
      <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
          <h2 class="card-title">Add New Cat</h2>
          <form @submit.prevent="addCat" class="flex gap-4">
            <input v-model="newCatName"
                   type="text"
                   placeholder="Cat name"
                   class="input input-bordered flex-1"
                   required />
            <input v-model.number="newCatAge"
                   type="number"
                   placeholder="Cat age"
                   class="input input-bordered flex-1"
                   min="0"
                   required />
            <input v-model.number="newCatWeight"
                   type="number"
                   placeholder="Cat weight"
                   class="input input-bordered flex-1"
                   min="0"
                   required />
            <input v-model="newCatColor"
                   type="text"
                   placeholder="Cat color"
                   class="input input-bordered flex-1"
                   required />
            <button type="submit" class="btn btn-primary">Add Cat</button>
          </form>
        </div>
      </div>

      <!-- Cats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="cat in cats" :key="cat.id" class="card bg-base-100 shadow-xl">
          <div class="card-body grid grid-cols-2">
            <div>
              <h2 class="card-title">{{ cat.name }}</h2>
              <p class="text-sm text-base-content/70">{{ cat.age }} years old • {{ cat.color }} • {{ cat.weight }}lbs</p>

              <!-- Recent Feedings -->
              <div class="mb-4">
                <h3 class="font-semibold mb-2">Recent Feedings:</h3>
                <div v-if="getRecentFeedings(cat.id).length === 0" class="text-base-content/60">
                  No feedings recorded yet
                </div>
                <div v-else class="space-y-1">
                  <div v-for="feeding in getRecentFeedings(cat.id)"
                       :key="feeding.id"
                       class="text-sm">
                    {{ feeding.amount }} scoops ({{ feeding.type }}) - {{ formatTime(feeding.fed_at) }}
                  </div>
                </div>
              </div>

              <!-- Add Feeding Form -->
              <form @submit.prevent="addFeeding(cat.id)">
                <div class="flex gap-2">
                  <input v-model.number="feedingAmounts[cat.id].amount"
                         type="number"
                         step="0.5"
                         placeholder="Amount (scoops)"
                         class="input input-bordered input-md w-20"
                         min="0.5"
                         required />
                  <select v-model="feedingAmounts[cat.id].type"
                          class="select select-bordered select-md w-20">
                    <option value="dry">Dry</option>
                    <option value="wet">Wet</option>
                  </select>
                  <button type="submit" class="btn btn-primary btn-sm">Feed</button>
                </div>
              </form>
            </div>
            <div>
              {{getCatSize(cat.weight) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="cats.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🐱</div>
        <h3 class="text-2xl font-bold mb-2">No cats yet!</h3>
        <p class="text-base-content/60">Add your first cat above to start tracking feeding habits.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()
const router = useRouter()

const cats = ref([])
const feedings = ref([])
const newCatName = ref('')
const newCatAge = ref<number>()
const newCatWeight = ref<number>()
const newCatColor = ref('')
const feedingAmounts = reactive<Record<string, { amount: number; type: string }>>({})

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}

const addCat = async () => {
  // Fixed validation logic
  if (!newCatName.value.trim() || !newCatAge.value || newCatAge.value <= 0 || newCatWeight.value <= 0 || !newCatColor.value.trim()) {
    return
  }

  const { data, error } = await supabase
    .from('cats')
    .insert([
      {
        name: newCatName.value,
        user_id: authStore.user?.id,
        age: newCatAge.value,
        color: newCatColor.value,
        weight: newCatWeight.value 
      }
    ])
    .select()

  if (error) {
    console.error('Error adding cat:', error)
  } else {
    cats.value.push(data[0])
    // Initialize feeding form for new cat
    initializeCatFeeding(data[0].id)
    // Reset form
    newCatName.value = ''
    newCatAge.value = undefined
    newCatColor.value = ''
  }
}

const initializeCatFeeding = (catId: string) => {
  if (!feedingAmounts[catId]) {
    feedingAmounts[catId] = { amount: 1, type: 'dry' }
  }
}

const addFeeding = async (catId: string) => {
  const feeding = feedingAmounts[catId]
  if (!feeding || feeding.amount <= 0) return

  const { data, error } = await supabase
    .from('feedings')
    .insert([
      {
        cat_id: catId,
        amount: feeding.amount,
        type: feeding.type,  // Make sure this matches your DB column name
        user_id: authStore.user?.id
      }
    ])
    .select()

  if (error) {
    console.error('Error adding feeding:', error)
  } else {
    feedings.value.push(data[0])
    // Reset to defaults
    feedingAmounts[catId] = { amount: 1, type: 'dry' }
  }
}

const getRecentFeedings = (catId: string) => {
  return feedings.value
    .filter(f => f.cat_id === catId)
    .sort((a, b) => new Date(b.fed_at) - new Date(a.fed_at))
    .slice(0, 3)
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

const getCatSize = (weight: number) => {
  if (weight < 9) return 'Smoll'
  if (weight < 11) return 'Chonk'
  return 'Mega Chonker'
}

const loadData = async () => {
  // Load cats
  const { data: catsData } = await supabase
    .from('cats')
    .select('*')
    .eq('user_id', authStore.user?.id)

  // Load feedings
  const { data: feedingsData } = await supabase
    .from('feedings')
    .select('*')
    .eq('user_id', authStore.user?.id)

  cats.value = catsData || []
  feedings.value = feedingsData || []

  // Initialize feeding forms for all cats
  cats.value.forEach(cat => initializeCatFeeding(cat.id))
}

onMounted(() => {
  loadData()
})</script>
