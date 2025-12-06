<template>
  <div class="media-player bg-surface-card rounded-lg border border-border-primary p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
        <span>🎵</span>
        Player de Música
      </h3>
      
      <div class="flex items-center gap-2">
        <span class="text-xs text-text-muted">
          {{ currentTime }} / {{ duration }}
        </span>
        <BaseButton
          v-if="isMaster"
          variant="ghost"
          size="sm"
          @click="showMusicLibrary = true"
          iconLeft="📁"
        >
          Biblioteca
        </BaseButton>
      </div>
    </div>

    <!-- Current Track Info -->
    <div v-if="currentTrack" class="mb-4 p-3 bg-surface rounded-lg border border-border-secondary">
      <div class="flex items-center gap-3">
        <div 
          class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="{ 'animate-pulse': isPlaying }"
        >
          <span class="text-xl">🎵</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-text-primary truncate">{{ currentTrack.name }}</h4>
          <p class="text-sm text-text-muted truncate">{{ currentTrack.artist || 'Música ambiente' }}</p>
        </div>

        <div class="flex items-center gap-1">
          <BaseBadge
            :variant="isPlaying ? 'success' : 'ghost'"
            :iconLeft="isPlaying ? '▶️' : '⏸️'"
            size="xs"
          >
            {{ isPlaying ? 'Tocando' : 'Pausado' }}
          </BaseBadge>
        </div>
      </div>
    </div>

    <!-- No Track -->
    <div v-else class="mb-4 p-3 bg-surface rounded-lg border border-border-secondary text-center">
      <div class="text-text-muted">
        <span class="text-2xl block mb-2">🎵</span>
        <p class="text-sm">Nenhuma música selecionada</p>
        <BaseButton
          v-if="isMaster"
          variant="ghost"
          size="sm"
          @click="showMusicLibrary = true"
          class="mt-2"
        >
          Escolher Música
        </BaseButton>
      </div>
    </div>

    <!-- Audio Element -->
    <audio
      ref="audioRef"
      :src="src"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      preload="metadata"
    ></audio>

    <!-- Controls -->
    <div class="space-y-4">
      <!-- Playback Controls -->
      <div class="flex items-center justify-center gap-3">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="skipBackward"
          :disabled="!src"
          iconLeft="⏪"
        />
        
        <BaseButton
          :variant="isPlaying ? 'secondary' : 'primary'"
          @click="togglePlay"
          :disabled="!src"
          class="!w-12 !h-12"
        >
          {{ isPlaying ? '⏸️' : '▶️' }}
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          @click="skipForward"
          :disabled="!src"
          iconRight="⏩"
        />
      </div>

      <!-- Progress Bar -->
      <div v-if="src" class="space-y-2">
        <div class="relative">
          <input
            type="range"
            :value="currentTimeSeconds"
            :max="durationSeconds"
            @input="onSeek"
            class="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer progress-bar"
          />
        </div>
      </div>

      <!-- Volume Control -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-text-muted">🔊</span>
        <input
          type="range"
          :value="volume"
          min="0"
          max="100"
          @input="onVolumeChange"
          class="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer volume-bar"
        />
        <span class="text-sm text-text-muted w-12 text-right">{{ volume }}%</span>
      </div>

      <!-- Master Controls -->
      <div v-if="isMaster" class="flex justify-center gap-2 pt-2 border-t border-border-secondary">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="stopForAll"
          :disabled="!isPlaying"
        >
          ⏹️ Parar para Todos
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          @click="showUploadModal = true"
        >
          📁 Upload Música
        </BaseButton>
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadMusicModal
      v-if="showUploadModal"
      :campaign-id="campaignId"
      @close="showUploadModal = false"
      @uploaded="handleMusicUploaded"
    />

    <!-- Music Library Modal -->
    <MusicLibraryModal
      v-if="showMusicLibrary"
      :campaign-id="campaignId"
      @close="showMusicLibrary = false"
      @selected="handleMusicSelected"
    />
  </div>
</template>

<script setup lang="ts">
// ============================================
// Media Player Component - Player de música para campanhas
// ============================================

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'

interface Props {
  src?: string
  campaignId: string
  isMaster: boolean
  autoplay?: boolean
}

interface Track {
  id: string
  name: string
  artist?: string
  url: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  timeUpdate: [time: number]
}>()

// Refs
const audioRef = ref<HTMLAudioElement>()

// State
const isPlaying = ref(false)
const volume = ref(50)
const currentTimeSeconds = ref(0)
const durationSeconds = ref(0)
const currentTrack = ref<Track | null>(null)

// Modal states
const showUploadModal = ref(false)
const showMusicLibrary = ref(false)

// ============================================
// Computed Properties
// ============================================
const currentTime = computed(() => {
  return formatTime(currentTimeSeconds.value)
})

const duration = computed(() => {
  return formatTime(durationSeconds.value)
})

// ============================================
// Methods
// ============================================
const togglePlay = async () => {
  if (!audioRef.value || !props.src) return

  try {
    if (isPlaying.value) {
      await audioRef.value.pause()
      emit('pause')
    } else {
      await audioRef.value.play()
      emit('play')
    }
  } catch (error) {
    console.error('Error playing audio:', error)
  }
}

const skipBackward = () => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
}

const skipForward = () => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.min(audioRef.value.duration, audioRef.value.currentTime + 10)
}

const onSeek = (event: Event) => {
  if (!audioRef.value) return
  const target = event.target as HTMLInputElement
  audioRef.value.currentTime = Number(target.value)
}

const onVolumeChange = (event: Event) => {
  if (!audioRef.value) return
  const target = event.target as HTMLInputElement
  volume.value = Number(target.value)
  audioRef.value.volume = volume.value / 100
}

const stopForAll = () => {
  if (!audioRef.value) return
  audioRef.value.pause()
  audioRef.value.currentTime = 0
  
  // TODO: Emit to server to stop for all players
  console.log('Stopping music for all players...')
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// ============================================
// Audio Event Handlers
// ============================================
const onLoadedMetadata = () => {
  if (!audioRef.value) return
  durationSeconds.value = audioRef.value.duration || 0
}

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTimeSeconds.value = audioRef.value.currentTime
  emit('timeUpdate', currentTimeSeconds.value)
}

const onEnded = () => {
  isPlaying.value = false
  emit('ended')
}

// ============================================
// External Events
// ============================================
const handleMusicUploaded = (music: any) => {
  console.log('Music uploaded:', music)
  showUploadModal.value = false
  // TODO: Add to campaign playlist
}

const handleMusicSelected = (music: any) => {
  console.log('Music selected:', music)
  currentTrack.value = music
  showMusicLibrary.value = false
  
  // TODO: Update campaign current music
  // emit('musicChanged', music.url)
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100
  }

  // Load current track info if src is provided
  if (props.src) {
    currentTrack.value = {
      id: 'current',
      name: extractFilename(props.src),
      url: props.src
    }
  }
})

// Watch for src changes
watch(() => props.src, (newSrc) => {
  if (newSrc && currentTrack.value?.url !== newSrc) {
    currentTrack.value = {
      id: 'current',
      name: extractFilename(newSrc),
      url: newSrc
    }
    
    // Autoplay if enabled
    if (props.autoplay) {
      nextTick(() => {
        togglePlay()
      })
    }
  }
})

// ============================================
// Utils
// ============================================
const extractFilename = (url: string) => {
  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  if (!filename) return 'Música'
  return filename.split('.')[0]?.replace(/[-_]/g, ' ') || 'Música'
}
</script>

<style scoped>
/* Custom range input styles */
.progress-bar::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  cursor: pointer;
  border: 2px solid #1a1a2e;
}

.progress-bar::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ef4444;
  cursor: pointer;
  border: 2px solid #1a1a2e;
}

.volume-bar::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6b7280;
  cursor: pointer;
  border: 2px solid #1a1a2e;
}

.volume-bar::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6b7280;
  cursor: pointer;
  border: 2px solid #1a1a2e;
}
</style>