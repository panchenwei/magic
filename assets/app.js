// 1) 交互：点击按钮切换主题（给 <body> 切换一个类名）
document.getElementById('toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// 2) 数据：模拟从“服务器”拿数据并渲染到 DOM
const data = [
  { title: '卡片 A', desc: '由 JS 动态插入' },
  { title: '卡片 B', desc: 'HTML 是容器，CSS 控制样式' },
  { title: '卡片 C', desc: 'JS 负责把数据变成节点' },
];

const list = document.getElementById('list');
list.innerHTML = data.map(item => `
  <section class="card">
    <h3>${item.title}</h3>
    <p>${item.desc}</p>
  </section>
`).join('');
