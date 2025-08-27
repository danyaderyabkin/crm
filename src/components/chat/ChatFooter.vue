<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  loading?: boolean;
  reset?: boolean;
  file?: boolean;
  global?: boolean;
  replyTo?: {
    id: number;
    message: string;
    message_text?: string;
    author?: string;
    attachment?: string | null;
  } | null;
  attachment?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'send', payload: { type?: number; file?: File | null }): void; // Изменяем сигнатуру
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'cancel-reply'): void;
  (e: 'file-selected', file: File): void;
  (e: 'cancel-attachment'): void;
}>();

const newMessage = ref(props.modelValue);
const isFocused = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);

// Следим за изменениями
watch(() => props.reset, (newVal) => {
  if (newVal) {
    newMessage.value = '';
    emit('update:modelValue', '');
    clearFile();
  }
});

watch(() => props.replyTo, () => {
  const input = document.querySelector('.chat-input') as HTMLInputElement;
  input?.focus();
});

// Очистка файла
const clearFile = () => {
  selectedFile.value = null;
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = null;
  }
};

// Обработчики сообщений
const onInput = (value: string) => {
  newMessage.value = value;
  if (props.replyTo) {
    emit('update:modelValue', `[quote]${props.replyTo.message}[/quote]${value}`);
  } else {
    emit('update:modelValue', value);
  }
};



// Функционал файлов
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    filePreviewUrl.value = URL.createObjectURL(target.files[0]);
    emit('file-selected', target.files[0]);
    target.value = ''; // Сброс для возможности повторной загрузки того же файла
  }
};

const cancelAttachment = () => {
  clearFile();
  emit('cancel-attachment');
};

// Форматирование информации о файле
const fileInfo = computed(() => {
  if (!selectedFile.value) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return `${selectedFile.value.name} (${formatSize(selectedFile.value.size)})`;
});

// Форматирование предпросмотра ответа
const replyPreview = computed(() => {
  if (!props.replyTo) return null;

  const processText = (text: string) => {
    if (!text) return '';
    const withoutQuotes = text.replace(/\[quote\].*?\[\/quote\]/gs, '').trim();
    return withoutQuotes || text.slice(0, 50) + (text.length > 50 ? '...' : '');
  };

  const processedText = processText(props.replyTo.message || props.replyTo.message_text || '');
  return props.replyTo.attachment
    ? `📎 ${processedText || 'Вложение'}`
    : processedText;
});

const onSend = () => {
  if (newMessage.value.trim()) {
    // Создаем объект с данными для отправки
    const payload = {
      type: props.global ? 3 : 4,
      file: selectedFile.value || null,
      text: props.replyTo ? `[quote]${replyPreview.value}[/quote]${newMessage.value.trim()}` : newMessage.value.trim()
    };

    // Отправляем данные в родительский компонент
    emit('send', payload);

    // Сбрасываем состояние
    emit('cancel-reply');
    clearFile();
    newMessage.value = '';
    emit('update:modelValue', '');
  }
};
</script>

<template>
  <q-footer class="bg-grey-2">
    {{global}}

    <!-- Блок предпросмотра ответа -->
    <div v-if="replyTo" class="reply-preview bg-blue-1 q-px-md q-pt-xs q-pb-none">
      <div class="row items-center">
        <div class="col text-caption text-grey-8">
          Ответ: {{ replyPreview }}
        </div>
        <q-btn
          flat
          dense
          round
          icon="close"
          size="sm"
          @click="$emit('cancel-reply')"
          class="text-grey-6"
        />
      </div>
    </div>

    <!-- Блок предпросмотра файла -->
    <div v-if="selectedFile" class="file-preview bg-blue-1 q-px-md q-pt-xs q-pb-none">
      <div class="row items-center">
        <div class="col text-caption text-grey-8">
           {{ fileInfo }}
        </div>
        <q-btn
          flat
          dense
          round
          icon="close"
          size="sm"
          @click="cancelAttachment"
          class="text-grey-6"
        />
      </div>
    </div>

    <q-toolbar>
      <!-- Скрытый input для выбора файлов -->
      <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileChange"
      />

      <q-input
        ref="inputRef"
        :model-value="newMessage"
        @update:model-value="onInput"
        placeholder="Написать сообщение..."
        borderless
        dense
        rounded
        class="full-width no-outline-input chat-input"
        @keyup.enter="onSend"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :loading="loading"
      >
        <template v-slot:prepend>
          <q-icon
            v-if="file"
            name="attach_file"
            @click="triggerFileInput"
            class="cursor-pointer text-primary"
          />
        </template>

        <template v-slot:append>
          <q-icon
            name="send"
            @click="onSend"
            :class="{ 'text-primary': newMessage.trim(), 'pointer-event-none':  !newMessage.trim()}"
          />
        </template>
      </q-input>
    </q-toolbar>
  </q-footer>
</template>

<style scoped lang="scss">
.reply-preview, .file-preview {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--q-primary);
  }
}

.file-preview {
  &::before {
    background: var(--q-positive);
  }
}

.no-outline-input {
  :deep(.q-field__control) {
    border-radius: 20px;
    background: white;
    padding-left: 12px;
    padding-right: 8px;
  }
}

.q-footer {
  padding: 0;
}
</style>
