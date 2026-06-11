/**
 * 应用入口文件
 *
 * 本文件是Vue3应用的启动入口，负责:
 *   1. 创建Vue应用实例
 *   2. 导入全局样式
 *   3. 挂载根组件 App.vue
 *
 * 使用 Vue3 的组合式 API 和 createApp 模式。
 */

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 创建Vue应用实例并挂载到DOM的 #app 元素
createApp(App).mount('#app')
