const path = require('path');
const {build} = require('esbuild');


const args = require('minimist')(process.argv.slice(2)); // { _: [ 'reactivity' ], f: 'esm' }

// target表示打包的是哪个模块, 取出命令行中的_属性中的第0个元素
const target = args._[0] || "reacivity";
// format表示打包的格式 取出命令行中的f属性
const format = args.f || 'global';

// 解析打包模块的package.json的路径
const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`));

// 判断打包格式
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';

// 定义输出路径和文件名
// reactivity.global.js
// reactivity.esm.js
// reactivity.cjs.js
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`);


build({
    entryPoints: [path.resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === "cjs" ? "node" : "browser",
    watch: {
        // 监控文件变化
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`);
        },
    },
}).then(() => {
    console.log("watching~~~");
});