import { defineConfig } from "astro/config";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import sitemap from "@astrojs/sitemap";
import cloudflarePages from "@astrojs/cloudflare";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";

import { siteConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { rehypeMermaid } from "./src/plugins/rehype-mermaid.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkMermaid } from "./src/plugins/remark-mermaid.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";


// https://astro.build/config
// Cloudflare Pages adapter (also works for EdgeOne)
const adapter = cloudflarePages();

export default defineConfig({
    site: siteConfig.siteURL,
    base: "/",
    trailingSlash: "always",
    adapter: adapter,
    integrations: [
        tailwind({
            nesting: true,
        }),
        swup({
            theme: false,
            animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
            // The default value `transition-` cause transition delay when the Tailwind class `transition-all` is used
            containers: ["#main-grid"],
            cache: true,
            preload: false, // Disable preloading to reduce network requests
            accessibility: true,
            updateHead: true,
            updateBodyClass: false,
            globalInstance: true,
            // Scroll related configuration optimization
            smoothScrolling: false, // Disable smooth scrolling to improve performance and avoid conflicts with anchor navigation
            resolveUrl: (url) => url,
            animateHistoryBrowsing: false,
            skipPopStateHandling: (event) => {
                // Skip anchor link handling, let the browser handle it natively
                return event.state && event.state.url && event.state.url.includes("#");
            },
        }),
        icon({
            include: {
                // 只包含实际使用的图标，减少构建体积
                "material-symbols": [
                    "keyboard-arrow-up-rounded",
                    "chevron-left-rounded",
                    "chevron-right-rounded",
                    "more-horiz",
                    "keyboard-arrow-down-rounded",
                    "home-pin-outline",
                    "palette-outline",
                    "menu-rounded",
                    "error-outline",
                    "home",
                    "sentiment-sad",
                    "search-off",
                    "calendar-today-outline-rounded",
                    "edit-calendar-outline-rounded",
                    "book-2-outline-rounded",
                    "tag-rounded",
                    "visibility-outline-rounded",
                    "rss-feed",
                    "link",
                    "article",
                    "help-outline",
                    "notes-rounded",
                    "archive",
                    "work",
                    "psychology",
                    "timeline",
                    "book",
                    "photo-library",
                    "movie",
                    "person",
                    "group",
                    "info",
                    "history-rounded",
                    "schedule-outline-rounded",
                    "monitoring",
                    "mail-outline",
                    "explore-outline",
                ],
                "fa6-brands": [
                    "github",
                    "bilibili",
                    "creative-commons",
                ],
                "fa6-solid": [
                    "arrow-up-right-from-square",
                    "xmark",
                    "eye",
                ],
                "fa6-regular": [
                    "address-card",
                ],
                mdi: [
                    "pin",
                ],
            },
        }),
        expressiveCode({
            themes: ["github-light", "github-dark"],
            themeCSSSelector: (theme) => `[data-theme="${theme}"]`,
            plugins: [
                pluginCollapsibleSections(),
                pluginLineNumbers(),
                pluginLanguageBadge(),
                pluginCustomCopyButton(),
            ],
            defaultProps: {
                wrap: true,
                overridesByLang: {
                    shellsession: {
                        showLineNumbers: false,
                    },
                },
            },
            styleOverrides: {
                codeBackground: "var(--codeblock-bg)",
                borderRadius: "0.75rem",
                borderColor: "none",
                codeFontSize: "0.875rem",
                codeFontFamily:
                    "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                codeLineHeight: "1.5rem",
                frames: {
                    editorBackground: "var(--codeblock-bg)",
                    terminalBackground: "var(--codeblock-bg)",
                    terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
                    editorTabBarBackground: "var(--codeblock-topbar-bg)",
                    editorActiveTabBackground: "none",
                    editorActiveTabIndicatorBottomColor: "var(--primary)",
                    editorActiveTabIndicatorTopColor: "none",
                    editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
                    terminalTitlebarBorderBottomColor: "none",
                    copyButtonBackground: "var(--btn-regular-bg)",
                    copyButtonBackgroundHover: "var(--btn-regular-bg-hover)",
                    copyButtonBackgroundActive: "var(--btn-regular-bg-active)",
                    copyButtonForeground: "var(--btn-content)",
                },
                textMarkers: {
                    delHue: 0,
                    insHue: 180,
                    markHue: 250,
                },
            },
            frames: {
                showCopyToClipboardButton: false,
            },
        }),
        svelte(),
        sitemap(),
    ],
    markdown: {
        remarkPlugins: [
            remarkMath,
            remarkReadingTime,
            remarkExcerpt,
            remarkGithubAdmonitionsToDirectives,
            remarkDirective,
            remarkSectionize,
            parseDirectiveNode,
            remarkMermaid,
        ],
        rehypePlugins: [
            rehypeKatex,
            rehypeSlug,
            rehypeMermaid,
            [
                rehypeComponents,
                {
                    components: {
                        github: GithubCardComponent,
                        note: (x, y) => AdmonitionComponent(x, y, "note"),
                        tip: (x, y) => AdmonitionComponent(x, y, "tip"),
                        important: (x, y) => AdmonitionComponent(x, y, "important"),
                        caution: (x, y) => AdmonitionComponent(x, y, "caution"),
                        warning: (x, y) => AdmonitionComponent(x, y, "warning"),
                    },
                },
            ],
            [
                rehypeAutolinkHeadings,
                {
                    behavior: "append",
                    properties: {
                        className: ["anchor"],
                    },
                    content: {
                        type: "element",
                        tagName: "span",
                        properties: {
                            className: ["anchor-icon"],
                            "data-pagefind-ignore": true,
                        },
                        children: [
                            {
                                type: "text",
                                value: "#",
                            },
                        ],
                    },
                },
            ],
        ],
    },
    vite: {
        build: {
            rollupOptions: {
                onwarn(warning, warn) {
                    // temporarily suppress this warning
                    if (
                        warning.message.includes("is dynamically imported by") &&
                        warning.message.includes("but also statically imported by")
                    ) {
                        return;
                    }
                    warn(warning);
                },
            },
        },
    },
});
