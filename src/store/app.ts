import { defineStore } from 'pinia';

interface State {
  infoDialogOpen: boolean;
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    infoDialogOpen: false,
  }),
});
