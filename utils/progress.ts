import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置进度条
NProgress.configure({
  minimum: 0.1,
  showSpinner: false,
  trickleSpeed: 200,
  easing: 'ease',
  speed: 500,
});

export const ProgressManager = {
  start: () => {
    NProgress.start();
  },
  done: () => {
    NProgress.done();
  },
  set: (progress: number) => {
    NProgress.set(progress);
  },
}; 