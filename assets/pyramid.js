console.log('🚀 pyramid.js 已加载 - 树状图版本');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ 开始构建乐句树状图');

  // ==================== 数据准备 ====================
  
  // 断句点数据（来自 mazurka174_Player_1_minima_levels.csv）
  const levelBreakpoints = {
    1: [9,14,20,22,28,32,34,37,40,44,47,52,54,58,62,66,68,71,75,80,83,85,88,91,95,100,102,105,109,112,115,118,121,129,133,137,140,143,148,152,155,157,160,163,167,169,172,174,178,182,186,188,190,192,197,201,207,210,212,216,220,223,226,233,236,240,245,249,255,258,262,264,269,274,278,283,287,292,298,302,305,307,311,316,321,328,330,336,338,342,344,346,351,355,361,364,366,369,371,373,375,381],
    2: [40,55,88,102,133,160,172,197,228,245,278,298,344,360],
    3: [82,331],
    4: []
  };

  const totalBeats = 395;

  // 构建层级化的树形数据结构
  function buildHierarchy() {
    // Level 4: 整体（1个节点）
    const root = {
      name: 'Level 4: 整体',
      level: 4,
      start: 0,
      end: totalBeats - 1,
      children: []
    };

    // Level 3: 根据 breakpoints[3] 分割（2个节点）
    const level3Breaks = [0, ...levelBreakpoints[3], totalBeats - 1].sort((a, b) => a - b);
    for (let i = 0; i < level3Breaks.length - 1; i++) {
      const l3Node = {
        name: `L3-${i + 1}`,
        level: 3,
        start: level3Breaks[i],
        end: level3Breaks[i + 1],
        children: []
      };
      root.children.push(l3Node);

      // Level 2: 在 L3 范围内找 L2 的断点
      const level2Breaks = [l3Node.start, ...levelBreakpoints[2].filter(b => b > l3Node.start && b < l3Node.end), l3Node.end].sort((a, b) => a - b);
      for (let j = 0; j < level2Breaks.length - 1; j++) {
        const l2Node = {
          name: `L2-${i + 1}.${j + 1}`,
          level: 2,
          start: level2Breaks[j],
          end: level2Breaks[j + 1],
          children: []
        };
        l3Node.children.push(l2Node);

        // Level 1: 在 L2 范围内找 L1 的断点
        const level1Breaks = [l2Node.start, ...levelBreakpoints[1].filter(b => b > l2Node.start && b < l2Node.end), l2Node.end].sort((a, b) => a - b);
        for (let k = 0; k < level1Breaks.length - 1; k++) {
          const l1Node = {
            name: `L1-${i + 1}.${j + 1}.${k + 1}`,
            level: 1,
            start: level1Breaks[k],
            end: level1Breaks[k + 1]
          };
          l2Node.children.push(l1Node);
        }
      }
    }

    return root;
  }

  const treeData = buildHierarchy();
  console.log('树状数据结构:', treeData);

  // ==================== D3.js 绘制树状图 ====================

  const wrapper = d3.select('#treeWrapper');
  const svg = d3.select('#treeCanvas');
  
  let width = 1600;
  let height = 1000;
  let orientation = 'vertical'; // 'vertical' 或 'horizontal'
  
  svg.attr('width', width).attr('height', height);

  let g = svg.append('g').attr('transform', 'translate(40, 40)');

  // 缩放功能
  const zoom = d3.zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  function drawTree() {
    g.selectAll('*').remove();

    // 创建树布局
    const treeLayout = d3.tree()
      .size(orientation === 'vertical' ? [width - 80, height - 80] : [height - 80, width - 80]);

    const root = d3.hierarchy(treeData);
    treeLayout(root);

    // 颜色映射
    const colors = {
      1: '#ff6b6b',
      2: '#4ecdc4',
      3: '#45b7d1',
      4: '#96ceb4'
    };

    // 绘制连接线
    const links = g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        if (orientation === 'vertical') {
          return `M${d.source.x},${d.source.y}
                  C${d.source.x},${(d.source.y + d.target.y) / 2}
                   ${d.target.x},${(d.source.y + d.target.y) / 2}
                   ${d.target.x},${d.target.y}`;
        } else {
          return `M${d.source.y},${d.source.x}
                  C${(d.source.y + d.target.y) / 2},${d.source.x}
                   ${(d.source.y + d.target.y) / 2},${d.target.x}
                   ${d.target.y},${d.target.x}`;
        }
      })
      .style('fill', 'none')
      .style('stroke', '#999')
      .style('stroke-width', 2)
      .style('opacity', 0.6);

    // 绘制节点
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => 
        orientation === 'vertical' 
          ? `translate(${d.x},${d.y})` 
          : `translate(${d.y},${d.x})`
      );

    // 节点圆圈
    nodes.append('circle')
      .attr('r', d => {
        // 根据层级调整大小
        return d.data.level === 4 ? 20 : d.data.level === 3 ? 15 : d.data.level === 2 ? 12 : 8;
      })
      .style('fill', d => colors[d.data.level])
      .style('stroke', '#fff')
      .style('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.data.level === 4 ? 25 : d.data.level === 3 ? 20 : d.data.level === 2 ? 16 : 12)
          .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.3))');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.data.level === 4 ? 20 : d.data.level === 3 ? 15 : d.data.level === 2 ? 12 : 8)
          .style('filter', 'none');
      });

    // 节点文字标签
    nodes.append('text')
      .attr('dy', d => d.data.level === 1 ? -15 : 35)
      .attr('text-anchor', 'middle')
      .style('font-size', d => d.data.level === 4 ? '14px' : d.data.level === 3 ? '12px' : '10px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.data.level === 4 ? '整体' : `${d.data.start}→${d.data.end}`);

    // Beat 信息
    nodes.append('text')
      .attr('dy', d => d.data.level === 1 ? -28 : 48)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('fill', '#666')
      .text(d => `(${d.data.end - d.data.start} beats)`);
  }

  drawTree();

  // ==================== 控制按钮 ====================

  // 返回按钮
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // 放大
  document.getElementById('zoomInBtn').addEventListener('click', () => {
    svg.transition().call(zoom.scaleBy, 1.3);
  });

  // 缩小
  document.getElementById('zoomOutBtn').addEventListener('click', () => {
    svg.transition().call(zoom.scaleBy, 0.7);
  });

  // 重置
  document.getElementById('resetBtn').addEventListener('click', () => {
    svg.transition().call(zoom.transform, d3.zoomIdentity);
  });

  // 切换方向
  document.getElementById('toggleOrientBtn').addEventListener('click', () => {
    orientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
    if (orientation === 'horizontal') {
      width = 1400;
      height = 1800;
    } else {
      width = 1600;
      height = 1000;
    }
    svg.attr('width', width).attr('height', height);
    drawTree();
  });

  console.log('✅ 树状图渲染完成！');
});
