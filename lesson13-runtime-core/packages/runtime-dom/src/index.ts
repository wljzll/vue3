// 对元素可以进行节点操作
import { createRenderer } from "packages/runtime-core/src/renderer";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, { patchProp });

export const render = (vnode,container) =>{
    createRenderer(renderOptions).render(vnode,container)
}
export * from "@vue/runtime-core";
