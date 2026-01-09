/**
 * MouseParallax - 鼠标跟随视差效果
 * 让背景装饰元素随鼠标移动产生反向或同向位移，营造 3D 深度感。
 *
 * 使用方法：
 * 1. 在 HTML 元素上添加类名 `mouse-parallax`
 * 2. 设置 `data-depth` 属性（例如 "0.1", "-0.2"）。
 *    - 正值表示与鼠标反向移动（背景层效果）
 *    - 负值表示与鼠标同向移动（前景层效果）
 *    - 值越大，移动幅度越大
 */

class MouseParallax {
  constructor(options = {}) {
    this.options = {
      container: window,
      selector: ".mouse-parallax",
      smoothness: 0.1, // 移动平滑度 (0-1)，越小越有"惯性"
      ...options,
    };

    this.elements = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.destroyed = false;

    // 绑定方法以支持 removeEventListener
    this.handleMouseMoveBound = this.handleMouseMove.bind(this);
    this.handleResizeBound = this.handleResize.bind(this);

    this.init();
  }

  init() {
    // 收集所有视差元素
    const nodes = document.querySelectorAll(this.options.selector);
    nodes.forEach((node) => {
      this.elements.push({
        el: node,
        depth: parseFloat(node.dataset.depth) || 0.1,
        x: 0,
        y: 0,
      });
    });

    // 绑定事件
    this.options.container.addEventListener(
      "mousemove",
      this.handleMouseMoveBound,
    );

    window.addEventListener("resize", this.handleResizeBound);

    // 开始动画循环
    this.animate();
  }

  handleMouseMove(e) {
    // 计算鼠标相对于屏幕中心的归一化坐标 (-1 到 1)
    const x = e.clientX;
    const y = e.clientY;

    this.targetX = (x / this.windowWidth) * 2 - 1;
    this.targetY = (y / this.windowHeight) * 2 - 1;
  }

  handleResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  animate() {
    if (this.destroyed) return;

    // 线性插值 (Lerp) 实现平滑跟随
    this.mouseX += (this.targetX - this.mouseX) * this.options.smoothness;
    this.mouseY += (this.targetY - this.mouseY) * this.options.smoothness;

    this.elements.forEach((item) => {
      // 计算偏移量：归一化坐标 * 深度系数 * 基础倍率(例如 50px)
      const moveX = this.mouseX * item.depth * 50;
      const moveY = this.mouseY * item.depth * 50;

      // 应用变换
      item.el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }

  destroy() {
    this.destroyed = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.options.container.removeEventListener(
      "mousemove",
      this.handleMouseMoveBound,
    );
    window.removeEventListener("resize", this.handleResizeBound);
    this.elements = [];
  }
}
// 导出单例或类
export default MouseParallax;
