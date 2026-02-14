import postcssImport from 'postcss-import';
import postcssNesting from 'tailwindcss/nesting/index.js';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const isProduction = process.env.NODE_ENV === 'production';

export default {
    plugins: {
        'postcss-import': postcssImport, // to combine multiple css files
        'tailwindcss/nesting': postcssNesting,
        tailwindcss: tailwindcss,
        autoprefixer: autoprefixer, // 自动添加浏览器前缀
        // 生产环境启用 CSS 压缩
        ...(isProduction && {
            cssnano: cssnano({
                preset: ['default', {
                    discardComments: { removeAll: true },
                    normalizeWhitespace: true,
                }]
            })
        })
    }
};