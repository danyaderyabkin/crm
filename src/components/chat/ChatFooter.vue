<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  loading?: boolean;
  reset?: boolean;
  file?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'send'): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

const newMessage = ref(props.modelValue);

// Следим за изменением reset и очищаем поле
watch(() => props.reset, (newVal) => {
  if (newVal) {
    newMessage.value = '';
    emit('update:modelValue', '');
  }
});

const onInput = (value: string) => {
  newMessage.value = value;
  emit('update:modelValue', value);
};

const onSend = () => {
  if (newMessage.value.trim()) {
    emit('send');
  }
};
</script>

<template>
  <q-footer class="bg-grey-2">
    <q-toolbar>
      <q-input
        :model-value="newMessage"
        @update:model-value="onInput"
        placeholder="Написать сообщение..."
        borderless
        dense
        rounded
        class="full-width no-outline-input"
        @keyup.enter="onSend"
        @focus="onFocus"
        @blur="onBlur"
        :loading="loading"
      >
        <template v-if="file" v-slot:prepend>
          <q-icon
            name="add"
            @click="onSend"
            :class="{ 'text-grey': !newMessage.trim() }"
          />
        </template>
        <template v-slot:append>
          <q-icon
            name="send"
            @click="onSend"
            :class="{ 'text-primary': newMessage.trim() }"
          />
        </template>
      </q-input>
    </q-toolbar>
  </q-footer>
</template>

<style scoped lang="scss">
/* Стили можно оставить здесь или вынести в родительский компонент */
</style>
