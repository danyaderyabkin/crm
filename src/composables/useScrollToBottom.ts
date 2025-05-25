import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useScrollToBottom() {
  const messagesContainer = ref<HTMLElement | null>(null);

  const scrollToBottom = (smooth = false) => {
    setTimeout(() => {
      if (messagesContainer.value) {
        const scrollHeight = messagesContainer.value.scrollHeight;
        const clientHeight = messagesContainer.value.clientHeight;
        const paddingBottom = 0;

        messagesContainer.value.scrollTo({
          top: scrollHeight - clientHeight + paddingBottom,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }, 1);
  };

  const handleResize = () => {
    scrollToBottom(true);
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  });

  return {
    messagesContainer,
    scrollToBottom
  };
}


