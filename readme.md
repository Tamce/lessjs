## lessjs 是什么？
1. lessjs 是仿 linux 下 `less` 命令的基本操作方法（但是快捷键略有不同），直接在网页上对长文本进行浏览和筛选的工具。
2. 基本保持和 `less` 一致的快捷键以降低使用学习成本，并且提供颜色字符高亮显示功能(目前支持不全)。

## 快捷键说明
<table id="kbd-table">
    <tr><td><kbd>?</kbd> 显示帮助信息<br></td><td><kbd>Esc</kbd> 关闭此提示</td></tr>
    <tr><td><kbd>u</kbd> 向上滚动半屏</td><td><kbd>d</kbd> 向下滚动半屏</td></tr>
    <tr><td><kbd>k</kbd> 向上滚动一行</td><td><kbd>j</kbd> 向下滚动一行</td></tr>
    <tr><td><kbd>h</kbd> 向左滚动一段距离</td><td><kbd>k</kbd> 向右滚动一段距离</td></tr>
    <tr><td><kbd>/</kbd> 进入搜索模式</td><td><kbd>:</kbd> 进入命令模式</td></tr>
    <tr><td><kbd>Esc</kbd> 退出搜索/命令模式</td></tr>
</table>

## Todos
- [ ] 支持 `g` 跳转指令
- [ ] 支持切换显示行号
- [ ] 支持 `n/N` 指令
- [ ] 重构 command mode 使用回调进行交互，避免和页面元素耦合
- [ ] 支持用户注册自定义命令
- [ ] 完善配色方案