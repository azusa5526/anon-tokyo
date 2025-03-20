export type Resolution = { width: number; height: number };
export interface ResolutionRule {
  format: 'webp' | 'gif';
  maxFrames: number; // 當 outputFrames 小於這個值時，使用此規則
  allowedKeys: string[]; // 允許的解析度 key
  description: string;
}

export const maxFrames = 360;
export const speed = 1000 / 23.976;
export const maxFrameGroups = 10;
export const formats = ['webp', 'gif'];
export const resolutions = new Map<string, Resolution>([
  ['qHD', { width: 480, height: 270 }],
  ['nHD', { width: 640, height: 360 }],
  ['qHD+', { width: 960, height: 540 }],
  ['HD', { width: 1280, height: 720 }],
  // ['FullHD', { width: 1920, height: 1080 }],
]);

// 規則陣列依順序判斷，採用先符合的規則
export const resolutionRules: ResolutionRule[] = [
  {
    format: 'webp',
    maxFrames: 168,
    allowedKeys: ['qHD', 'nHD', 'qHD+', 'HD'],
    description: '所有解析度皆可使用',
  },
  {
    format: 'webp',
    maxFrames: 288,
    allowedKeys: ['qHD', 'nHD', 'qHD+'],
    description: '僅限 qHD+ 以下解析度選項',
  },
  {
    format: 'webp',
    maxFrames: maxFrames,
    allowedKeys: ['qHD', 'nHD'],
    description: '僅限 nHD 以下解析度選項',
  },
  {
    format: 'gif',
    maxFrames: 96,
    allowedKeys: ['qHD', 'nHD', 'qHD+'],
    description: 'GIF 格式：僅允許較低解析度',
  },
  {
    format: 'gif',
    maxFrames: 192,
    allowedKeys: ['qHD', 'nHD'],
    description: 'GIF 格式：更嚴格的解析度限制',
  },
  {
    format: 'gif',
    maxFrames: maxFrames,
    allowedKeys: ['qHD'],
    description: 'GIF 格式：只可使用最低解析度',
  },
];
