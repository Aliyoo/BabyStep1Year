/**
 * CursorEffects - 光标点击特效
 * 点击屏幕时产生可爱的粒子爆炸效果。
 */

class CursorEffects {
  constructor() {
    this.colors = ['#FFB6C1', '#FFDAB9', '#FFFACD', '#E0FFFF', '#DDA0DD'];
    this.particles = [];
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      this.explode(e.clientX, e.clientY);
    });
  }

  explode(x, y) {
    const particleCount = 12; // 粒子数量

    for (let i = 0; i < particleCount; i++) {
      // 创建粒子元素
      const particle = document.createElement('div');
      particle.classList.add('cursor-particle');

      // 随机颜色
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      particle.style.backgroundColor = color;

      // 初始位置
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      // 随机大小
      const size = Math.random() * 8 + 4; // 4px - 12px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.position = 'fixed';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';

      // 随机方向和距离
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 60 + 20; // 扩散距离

      // 设置 CSS 变量供动画使用 (或者直接用 JS 动画)
      // 这里为了性能，简单使用 Web Animations API
      document.body.appendChild(particle);

      const animation = particle.animate([
        { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% + ${Math.sin(angle) * velocity}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 600 + Math.random() * 200,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
      });

      animation.onfinish = () => {
        particle.remove();
      };
    }

    // 偶尔添加一个爱心
    if (Math.random() > 0.5) {
      this.addHeart(x, y);
    }
  }

  addHeart(x, y) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.position = 'fixed';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = '20px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(heart);

    const anim = heart.animate([
      { transform: 'translate(-50%, -50%) scale(0.5) rotate(0deg)', opacity: 0 },
      { transform: 'translate(-50%, -150%) scale(1.2) rotate(-10deg)', opacity: 1, offset: 0.5 },
      { transform: 'translate(-50%, -250%) scale(1) rotate(10deg)', opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out'
    });

    anim.onfinish = () => heart.remove();
  }
}

export default CursorEffects;
