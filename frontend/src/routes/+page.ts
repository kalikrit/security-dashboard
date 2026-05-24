import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // Live-компоненты загружают данные самостоятельно
  // Здесь мы ничего не предзагружаем, чтобы избежать дублирования запросов
  return {};
};