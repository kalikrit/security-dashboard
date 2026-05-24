<script lang="ts">
  import { onMount } from 'svelte';
  import { checkBackendHealth } from '$lib/api/client';
  
  let available = $state(true);
  let checkInterval: ReturnType<typeof setInterval>;
  
  async function checkBackendConnection(): Promise<void> {
    const isHealthy = await checkBackendHealth();
    available = isHealthy;
  }
  
  onMount(() => {
    // Первоначальная проверка
    checkBackendConnection();
    
    // Проверяем статус каждые 5 секунд
    checkInterval = setInterval(() => {
      checkBackendConnection();
    }, 5000);

    return () => {
      clearInterval(checkInterval);
    };
  });
</script>

{#if !available}
  <div class="backend-status offline">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
    <span>Бэкенд недоступен. Отображаются последние известные данные.</span>
  </div>
{:else}
  <div class="backend-status online">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>Подключение к бэкенду активно</span>
  </div>
{/if}

<style>
  .backend-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
  }

  .backend-status.offline {
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
  }

  .backend-status.online {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
  }

  .backend-status svg {
    flex-shrink: 0;
  }
</style>
