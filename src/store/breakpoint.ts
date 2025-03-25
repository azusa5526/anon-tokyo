import { defineStore } from 'pinia';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

interface BreakpointState {
  // 儲存目前用來判斷的斷點 key
  reactiveStuff: keyof typeof breakpointsTailwind;
  // 使用 vueUse 的斷點物件
  breakpoints: ReturnType<typeof useBreakpoints<'sm' | 'md' | 'lg' | 'xl' | '2xl'>>;
}

export const useBreakpointStore = defineStore('breakpoint', {
  state: (): BreakpointState => ({
    reactiveStuff: 'lg',
    breakpoints: useBreakpoints<keyof typeof breakpointsTailwind>(breakpointsTailwind),
  }),
  getters: {
    // 判斷目前是否大於或等於 reactiveStuff 所指定的斷點
    isGreaterThanBreakpoint(state): boolean {
      return state.breakpoints.greaterOrEqual(() => state.reactiveStuff).value;
    },
    // 取得目前螢幕寬度所屬的斷點名稱（例如 'sm', 'md', ...）
    current(state): string[] {
      return state.breakpoints.current().value;
    },
    // 活躍的斷點名稱
    active(state): string {
      return state.breakpoints.active().value;
    },
    // 是否屬於 xs (< sm)
    xs(state): boolean {
      return state.breakpoints.smaller('sm').value;
    },
    // 是否屬於 xs (<= sm)
    xse(state): boolean {
      return state.breakpoints.smallerOrEqual('sm').value;
    },
    // sm 範圍（介於 sm 與 md 之間）
    sm(state): boolean {
      return state.breakpoints.between('sm', 'md').value;
    },
    // md 範圍（介於 md 與 lg 之間）
    md(state): boolean {
      return state.breakpoints.between('md', 'lg').value;
    },
    // lg 範圍（介於 lg 與 xl 之間）
    lg(state): boolean {
      return state.breakpoints.between('lg', 'xl').value;
    },
    // xl 範圍（介於 xl 與 2xl 之間）
    xl(state): boolean {
      return state.breakpoints.between('xl', '2xl').value;
    },
    // 是否屬於 2xl
    xxl(state): boolean {
      return state.breakpoints['2xl'];
    },
  },
});
