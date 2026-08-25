[主题] 纯 SVG 自绘制标志与形变标题

仅以单个内联 SVG 和 SMIL 动画，创作虚构创意科技节 “VECTOR / 26” 的可循环动态主视觉。禁止 JavaScript 与 CSS 动画。

必做功能：
1. 标志从可见路径描边自绘制开始，随后形成清晰的抽象 V 图形与 `VECTOR / 26` 标题；不能依赖位图、emoji 或外部字体
2. 至少运用 `stroke-dasharray` / `stroke-dashoffset`、`animateTransform`、渐变或滤镜，并让动画循环有明确起承转合
3. 标题或几何元素须发生真实 SVG 形变/位移，而不只是全局旋转；相容 path 数据时可加入 path morph
4. 画面在深色与浅色系统背景均有足够对比；纯 SVG 直接作为文件打开或嵌入 GitHub 时应能演示
5. 保持语义化分组、`title` / `desc` 和 `prefers-reduced-motion` 可读替代（可用静态首帧）

评分重点：路径组织、SMIL 时间编排、矢量细节、字形/标志原创性，以及不用 JS 仍有清晰叙事的能力。
