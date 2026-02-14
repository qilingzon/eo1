<script>
import { onMount, onDestroy } from "svelte";

import { pioConfig } from "@/config";


// 将配置转换为 Pio 插件需要的格式
const pioOptions = {
    mode: pioConfig.mode,
    hidden: pioConfig.hiddenOnMobile,
    content: pioConfig.dialog || {},
    model: pioConfig.models || ["/pio/models/pio/model.json"],
};

// 全局Pio实例引用
let pioInstance = null;
let pioInitialized = false;
let pioContainer;
let pioCanvas;
let isHomePage = true;
let isBrowser = false;

// 检查是否为首页
function checkIsHomePage() {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    return path === '/' || path === '';
}

// 等待 DOM 加载完成后再初始化 Pio
function initPio() {
    if (typeof window === "undefined") return;
    if (typeof Paul_Pio !== "undefined") {
        try {
            // 确保DOM元素存在
            if (pioContainer && pioCanvas && !pioInitialized) {
                pioInstance = new Paul_Pio(pioOptions);
                pioInitialized = true;
                console.log("Pio initialized successfully (Svelte)");
            } else if (!pioContainer || !pioCanvas) {
                console.warn("Pio DOM elements not found, retrying...");
                setTimeout(initPio, 100);
            }
        } catch (e) {
            console.error("Pio initialization error:", e);
        }
    } else {
        // 如果 Paul_Pio 还未定义，稍后再试
        setTimeout(initPio, 100);
    }
}

// 加载必要的脚本
function loadPioAssets() {
    if (typeof window === "undefined") return;

    // 加载JS脚本
    const loadScript = (src, id) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`#${id}`)) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.id = id;
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    // 按顺序加载脚本
    loadScript("/pio/static/l2d.js", "pio-l2d-script")
        .then(() => loadScript("/pio/static/pio.js", "pio-main-script"))
        .then(() => {
            // 脚本加载完成后初始化
            setTimeout(initPio, 100);
        })
        .catch((error) => {
            console.error("Failed to load Pio scripts:", error);
        });
}

// 更新显示状态
function updateVisibility() {
    isHomePage = checkIsHomePage();
    if (pioContainer) {
        pioContainer.style.display = isHomePage ? 'block' : 'none';
    }
}

onMount(() => {
    if (!pioConfig.enable) return;
    
    isBrowser = true;
    isHomePage = checkIsHomePage();
    
    // 加载资源并初始化
    loadPioAssets();
    
    // 监听页面切换
    document.addEventListener('swup:contentReplaced', updateVisibility);
    window.addEventListener('popstate', updateVisibility);
});

onDestroy(() => {
    if (typeof window === 'undefined') return;
    console.log("Pio Svelte component destroyed (keeping instance alive)");
    document.removeEventListener('swup:contentReplaced', updateVisibility);
    window.removeEventListener('popstate', updateVisibility);
});
</script>

{#if pioConfig.enable && isBrowser}
  <div 
    class={`pio-container ${pioConfig.position || 'right'}`} 
    bind:this={pioContainer}
    style="display: {isHomePage ? 'block' : 'none'}"
  >
    <div class="pio-action"></div>
    <canvas 
        id="pio" 
        bind:this={pioCanvas}
        width={(pioConfig.width || 350) * 2}
        height={(pioConfig.height || 320) * 2}
        style="width: {pioConfig.width || 350}px; height: {pioConfig.height || 320}px;"
    ></canvas>
  </div>
{/if}

<style>
  /* 手机端看板娘缩小并固定在右上角 */
  @media (max-width: 768px) {
    .pio-container {
      transform: scale(0.5);
      transform-origin: top right;
      position: fixed !important;
      right: 0 !important;
      top: 60px !important;
      left: auto !important;
      bottom: auto !important;
    }
  }
</style>