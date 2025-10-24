console.log('🚀🚀🚀 app.js 文件已加载！');

// 等待 DOM 和 OSMD 库加载完成
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅✅✅ DOM 加载完成，开始初始化！');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const sheetMusicEl = document.getElementById('sheetMusic');
  const zoomLevelEl = document.getElementById('zoomLevel');
  
  let osmd = null;
  let currentZoom = 1.0;
  let renderTimeout = null; // 防抖定时器
  let currentLevel = 1; // 当前选中的层级
  
  // 直接嵌入断句点数据（来自 mazurka174_Player_1_minima_levels.csv）
  const levelBreakpoints = {
    1: [9,14,20,22,28,32,34,37,40,44,47,52,54,58,62,66,68,71,75,80,83,85,88,91,95,100,102,105,109,112,115,118,121,129,133,137,140,143,148,152,155,157,160,163,167,169,172,174,178,182,186,188,190,192,197,201,207,210,212,216,220,223,226,233,236,240,245,249,255,258,262,264,269,274,278,283,287,292,298,302,305,307,311,316,321,328,330,336,338,342,344,346,351,355,361,364,366,369,371,373,375,381],
    2: [40,55,88,102,133,160,172,197,228,245,278,298,344,360],
    3: [82,331],
    4: []
  };

  // Energy_Value 数据（断句概率）- 来自 mazurka174_Player_1_level_1.csv
  const energyValues = [0.583672030305773,0.6739767623306633,0.7327115473875029,0.7203984719659483,0.7083785650068124,0.6966414793878902,0.5928609328626915,0.39763441296487917,0.37059078597407547,0.35289327068660875,0.35289327068660875,0.5165223577744449,0.7203984719659483,0.799074226607566,0.6523306842422997,0.8587097301258724,0.8431964403592892,0.7851210478997577,0.7582611788872315,0.6418684131662558,0.6216261930408736,0.7203984719659461,0.6216261930408736,0.6851773492484758,0.7327115473875067,0.7715211142225245,0.6316360821138649,0.5836720303057754,0.5323222807229897,0.5658568110627701,0.7851210478997577,0.5746725896572453,0.5088481094851462,0.6118315703995563,0.4745380259057703,0.5300454834448919,0.7327115473875023,0.5836720303057722,0.6118315703995563,0.6523306842422997,0.39763441296487917,0.45686569476202427,0.7273699651256956,0.5550531466108231,0.5404568945182799,0.68517734924848,0.6418684131662594,0.4795592352801374,0.708378565006808,0.68517734924848,0.6216261930408701,0.5323222807229954,0.2473386638437614,0.5404010130503988,0.4737967977112886,0.6022453439846531,0.4939299445863334,0.4527310450922768,0.290498987078747,0.48299733497152814,0.6418684131662594,0.8587097301258779,0.5323222807229897,0.8587097301258779,0.6493175500222248,0.6146084743385176,0.6022453439846531,0.6966414793878974,0.6966414793878809,0.7453286493626726,0.7083785650068248,0.5323222807229839,0.6316360821138685,0.7582611788872315,0.6022453439846531,0.47256984484484127,0.5746725896572453,0.6216261930408701,0.7582611788872315,0.7867476860022189,0.49306780569548725,0.548754200589482,0.4502662585312466,0.3106780888125039,0.7582611788872315,0.5165223577744393,0.5746725896572453,0.5389321674930304,0.3986829321984067,0.4942454311324787,0.5734020807698055,0.3659463242647538,0.5658568110627639,0.673976762330674,0.6966414793878809,0.501318658333387,0.5088481094851517,0.548754200589482,0.5928609328626889,0.472569844844851,0.14493764138346274,0.45581269639311545,0.42990257312535135,0.6118315703995495,0.4458384919519925,0.35536314369925653,0.47955923528013245,0.6216261930408701,0.708378565006808,0.6966414793878809,0.8431964403592946,0.7715211142225197,0.673976762330674,0.708378565006808,0.8280968383198097,0.7492535451709076,0.8089709442292555,0.858709730125889,0.68517734924848,0.7582611788872315,0.7327115473874936,0.7203984719659504,0.7990742266075735,0.708378565006808,0.6022453439846531,0.548754200589482,0.5323222807229839,0.4149514245337802,0.30274921037785263,0.12411127160869694,0.12411127160869982,0.35218549835634466,0.46329269128103084,0.4589654956047309,0.5658568110627762,0.9096178400506253,0.6954855654716512,0.6118315703995768,0.6316360821138397,0.685177349248496,0.6523306842422846,0.7203984719659677,0.6316360821138685,0.5243456205936273,0.6523306842422846,0.6316360821138685,0.546574550714744,0.4958433629499754,0.43937437418071534,0.459041248463632,0.708378565006808,0.7318361971815852,0.4800553805529512,0.6118315703995768,0.38802915518425757,0.3744064699053851,0.6523306842422846,0.501318658333387,0.5165223577744504,0.501318658333387,0.37050832360982244,0.5374315257724435,0.49676178438676283,0.40331133962244736,0.6630307342064391,0.621626193040856,0.5836720303057916,0.4404966554372164,0.5558061137087811,0.5443685992907097,0.5617413465243664,0.5323222807229839,0.18930172450426477,0.5252063085177032,0.2864437482710605,0.3788095691260292,0.3705907859740856,0.30931765396348443,0.2808133031746784,0.5088481094851407,0.6739767623306583,0.8045178996158336,0.740456879516844,0.8416716020745373,0.7595692591320946,0.7327115473874757,0.7203984719659677,0.9804655498090858,0.843196440359273,0.9079090205284941,0.8746539446081535,0.9079090205284941,0.8280968383198097,0.9252594949216668,0.8280968383198097,0.7327115473875112,0.6316360821138685,0.5243456205936273,0.6851773492484637,0.6216261930408842,0.40331133962244736,0.36036032863182316,0.36543559457895386,0.501318658333387,0.6966414793878974,0.8622867830565052,0.8474459901626965,0.8355446144057613,0.8746539446081996,0.858709730125889,0.8133945942287119,0.961514217534318,0.8746539446081996,0.9252594949216668,0.9252594949216668,0.9079090205284455,0.8280968383198097,0.9431202773852264,0.6966414793878974,0.6630307342064391,0.48667805887162235,0.6022453439846531,0.6739767623306899,0.42762859724459895,0.49316718609813176,0.3726235020273953,0.2820029670402262,0.43506149534051575,0.6739767623306899,0.7951780309174779,0.8474459901626965,0.8910472918928753,0.8280968383198097,0.7582611788872129,0.843196440359273,0.9748195614733467,0.8633642495865266,0.9252594949216668,0.9252594949216668,0.9079090205284455,0.8431964403593164,0.9252594949216167,0.813394594228753,0.708378565006808,0.6316360821138685,0.548754200589482,0.685177349248496,0.6523306842422846,0.4549274752421924,0.24897205602919542,0.24897205602919542,0.39763441296487917,0.6216261930408842,0.7990742266075533,0.8175887568206128,0.7970587666562068,0.8564320560715386,0.7715211142225388,0.7003640063247303,0.9882785192026246,0.9481544993007482,0.858709730125889,0.843196440359273,0.9252594949216668,0.891047291892828,1.0,0.7715211142225388,0.7083785650068419,0.43944621191237565,0.39763441296489516,0.4727426375941905,0.4727426375941905,0.3651805281966883,0.06809426743730221,0.06809426743729358,0.3811486179512854,0.46593780795413314,0.6626627934388815,0.5243456205936498,0.6966414793878645,0.6022453439846531,0.548754200589482,0.47256984484483133,0.4394462119124117,0.5658568110627514,0.6022453439846531,0.6739767623306583,0.5404568945182917,0.6418684131662814,0.5836720303057399,0.548754200589482,0.5404568945182917,0.4728683544139642,0.48636863574779454,0.6118315703996045,0.5187068505394417,0.4570917245165174,0.42689230121011645,0.2847804194556098,0.4209194341705144,0.5088481094851407,0.4866780588716428,0.4795592352801124,0.5377830396909613,0.3729437290159773,0.29218652056366395,0.621626193040856,0.5323222807230067,0.5572191290055447,0.6316360821138972,0.5088481094851407,0.445838491951965,0.5572191290055933,0.6641362650797282,0.6408138922410326,0.45234390969140725,0.22242642832919823,0.37993463439271835,0.3811486179512854,0.4657063893723482,0.5323222807230067,0.43944621191237565,0.49392994458633854,0.6118315703995495,0.6118315703995495,0.6523306842423146,0.7083785650068419,0.6630307342064391,0.6316360821138397,0.7582611788872129,0.5746725896572707,0.6022453439846531,0.6022453439846531,0.6523306842423146,0.6851773492484637,0.7582611788872129,0.548754200589482,0.621626193040856,0.5928609328627023,0.6418684131662814,0.7327115473875112,0.6316360821138397,0.47742194873419247,0.6663303361686922,0.4795592352801525,0.501318658333387,0.4795592352801525,0.5243456205936047,0.5746725896572707,0.5658568110627514,0.5572191290055447,0.5323222807230067,0.6418684131662227,0.6523306842423146,0.621626193040856,0.5243456205936498,0.5572191290055447,0.6118315703995495,0.6851773492484637,0.6739767623307212,0.5397310196163144,0.45292476472876625,0.6118315703995495,0.5404568945182917,0.4940461467931509,0.6849975282321069,0.39763441296489516,0.621626193040856,0.6851773492484637,0.6216261930409124,0.7453286493626726,0.6630307342064391,0.7203984719658987,0.44583849195200165,0.6630307342064391,0.6418684131662814,0.7715211142225007,0.5658568110627514,0.36543559457896846,0.1762973502823755,0.14493764138346274,0.14493764138346274,0.14493764138346274,0.14493764138346274,0.5404568945182917,0.5658568110628011,0.621626193040856,0.6022453439846531,0.5746725896572201,0.5165223577744724,0.38670358796159726,0.23115256101222553,0.20080109043416747,0.0,0.0];

  // 根据断句点计算乐句范围（断句点是 0-394 的时间网格索引）
  function calculatePhrases(breakpointArray, totalBeats = 395) {
    const breakpoints = [0, ...breakpointArray, totalBeats - 1]; // 添加起始点和结束点（0 和 394）
    breakpoints.sort((a, b) => a - b);
    
    // 计算每个乐句的范围（以百分比表示，便于后续映射到实际音符）
    const phrases = [];
    for (let i = 0; i < breakpoints.length - 1; i++) {
      phrases.push({
        startPercent: breakpoints[i] / (totalBeats - 1),  // 转换为 0-1 的百分比
        endPercent: breakpoints[i + 1] / (totalBeats - 1),
        color: i % 2 === 0 ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 150, 255, 0.5)' // 红蓝交替
      });
    }
    
    return phrases;
  }

  // 在乐谱上渲染乐句背景色
  function renderPhraseHighlights(phrases) {
    console.log('🎵 === 开始渲染乐句高亮 ===');
    console.log('接收到的乐句数量:', phrases.length);
    if (!osmd || !osmd.graphic) {
      console.warn('OSMD 未初始化');
      return;
    }
    
    try {
      // 清除之前的高亮
      const existingHighlights = document.querySelectorAll('.phrase-highlight');
      existingHighlights.forEach(el => el.remove());
      
      const svgElement = document.querySelector('#sheetMusic svg');
      if (!svgElement) {
        console.error('找不到 SVG 元素');
        return;
      }
      
      // 创建一个容器组用于放置高亮
      let highlightGroup = svgElement.querySelector('.phrase-highlight-group');
      if (!highlightGroup) {
        highlightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        highlightGroup.setAttribute('class', 'phrase-highlight-group');
        svgElement.insertBefore(highlightGroup, svgElement.firstChild);
      } else {
        highlightGroup.innerHTML = ''; // 清空之前的高亮
      }
      
      // 获取所有音符头（noteheads）
      const noteHeads = svgElement.querySelectorAll('[id*="vf-"]');
      console.log(`SVG 中找到 ${noteHeads.length} 个元素`);
      
      // 收集音符位置
      const notePositions = [];
      noteHeads.forEach((element, index) => {
        try {
          const bbox = element.getBBox();
          if (bbox && bbox.width > 0) {
            notePositions.push({
              index: index,
              element: element,
              x: bbox.x,
              y: bbox.y,
              width: bbox.width,
              height: bbox.height
            });
          }
        } catch (e) {
          // 忽略无法获取 bbox 的元素
        }
      });
      
      console.log(`收集到 ${notePositions.length} 个有效音符位置`);
      
      // 按 X 坐标分组（同一时间点的所有音符，包括不同声部）
      const timePoints = [];
      const xTolerance = 5; // X 坐标容差，认为在这个范围内的音符是同一时刻
      
      notePositions.forEach(note => {
        let found = false;
        for (let tp of timePoints) {
          if (Math.abs(tp.x - note.x) < xTolerance) {
            tp.notes.push(note);
            tp.minY = Math.min(tp.minY, note.y);
            tp.maxY = Math.max(tp.maxY, note.y + note.height);
            found = true;
            break;
          }
        }
        if (!found) {
          timePoints.push({
            x: note.x,
            notes: [note],
            minY: note.y,
            maxY: note.y + note.height
          });
        }
      });
      
      // 按 X 坐标排序时间点
      timePoints.sort((a, b) => a.x - b.x);
      console.log(`识别出 ${timePoints.length} 个时间点（预期 395 个）`);
      
      // 按百分比渲染乐句高亮
      phrases.forEach((phrase, phraseIndex) => {
        // 根据百分比计算起始和结束时间点索引
        const startIdx = Math.floor(timePoints.length * phrase.startPercent);
        const endIdx = Math.ceil(timePoints.length * phrase.endPercent) - 1;
        
        if (startIdx >= timePoints.length || endIdx < 0) return;
        
        // 获取这个乐句的所有时间点
        const phraseTimePoints = timePoints.slice(startIdx, Math.min(endIdx + 1, timePoints.length));
        
        if (phraseTimePoints.length === 0) return;
        
        console.log(`乐句 ${phraseIndex + 1}: 百分比 ${(phrase.startPercent*100).toFixed(1)}%-${(phrase.endPercent*100).toFixed(1)}%, 时间点索引 ${startIdx}-${endIdx}`);
        
        // 收集这个乐句的所有音符
        const phraseNotes = [];
        phraseTimePoints.forEach(tp => {
          tp.notes.forEach(note => phraseNotes.push(note));
        });
        
        if (phraseNotes.length === 0) return;
        
        console.log(`  共 ${phraseNotes.length} 个音符，第一个音符: x=${phraseNotes[0].x.toFixed(0)}, y=${phraseNotes[0].y.toFixed(0)}`);
        
        // 按 X 坐标排序，检测换行
        phraseNotes.sort((a, b) => a.x - b.x);
        
        // 将音符分组到不同的行（检测换行）
        const rows = [];
        let currentRow = [phraseNotes[0]];
        
        for (let i = 1; i < phraseNotes.length; i++) {
          const prevX = phraseNotes[i - 1].x;
          const currX = phraseNotes[i].x;
          
          // 如果 X 坐标大幅回退（超过 200），说明换行了
          if (currX < prevX - 200) {
            rows.push(currentRow);
            currentRow = [phraseNotes[i]];
          } else {
            currentRow.push(phraseNotes[i]);
          }
        }
        rows.push(currentRow);
        
        console.log(`  分为 ${rows.length} 行`);
        
        // 为每一行创建一个矩形（包含上下谱表）
        rows.forEach((rowNotes, rowIdx) => {
          // 计算 X 范围
          let minX = Infinity, maxX = -Infinity;
          rowNotes.forEach(note => {
            minX = Math.min(minX, note.x);
            maxX = Math.max(maxX, note.x + note.width);
          });
          
          // 计算 Y 范围（这一行的所有音符范围，包括上下谱表）
          let minY = Infinity, maxY = -Infinity;
          rowNotes.forEach(note => {
            minY = Math.min(minY, note.y);
            maxY = Math.max(maxY, note.y + note.height);
          });
          
          // 扩展一点边距
          const padding = 15;
          
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('class', 'phrase-highlight');
          rect.setAttribute('x', minX - padding);
          rect.setAttribute('y', minY - padding);
          rect.setAttribute('width', maxX - minX + padding * 2);
          rect.setAttribute('height', maxY - minY + padding * 2);
          rect.setAttribute('fill', phrase.color);
          rect.setAttribute('rx', '4');
          
          highlightGroup.appendChild(rect);
          
          console.log(`    行 ${rowIdx + 1}: X=${minX.toFixed(0)}-${maxX.toFixed(0)}, Y=${minY.toFixed(0)}-${maxY.toFixed(0)}`);
        });
      });
      
      console.log(`✅ 成功渲染 ${phrases.length} 个乐句高亮`);
      
    } catch (error) {
      console.error('渲染乐句高亮时出错:', error);
    }
  }


  // 加载并应用指定层级的乐句高亮
  async function applyLevelHighlight(level) {
    console.log(`🔵 开始应用 Level ${level} 高亮`);
    const breakpoints = levelBreakpoints[level] || [];
    console.log(`🔵 断点数量:`, breakpoints.length);
    const phrases = calculatePhrases(breakpoints);
    console.log(`Level ${level} 乐句数量:`, phrases.length);
    // console.log('乐句详情:', phrases); // 太大了，会卡住浏览器
    
    console.log(`🔵 准备调用 renderPhraseHighlights，传入 ${phrases.length} 个乐句`);
    renderPhraseHighlights(phrases);
    console.log(`🔵 renderPhraseHighlights 调用完成`);
  }

  // 初始化乐谱显示
  async function initSheetMusic() {
    try {
      // 检查 OSMD 是否加载
      if (typeof opensheetmusicdisplay === 'undefined') {
        throw new Error('OpenSheetMusicDisplay 库未加载');
      }

      // 创建 OSMD 实例
      osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(sheetMusicEl, {
        autoResize: true,
        backend: 'svg',
        drawTitle: true,
        drawComposer: true,
        drawPartNames: true,
        drawMeasureNumbers: true,
        measureNumberInterval: 2,
        disableCursor: false,
      });

      // 加载 MusicXML 文件
      await osmd.load('yuepu.xml');
      
      // 渲染乐谱
      await osmd.render();
      
      // 隐藏加载提示
      loadingEl.style.display = 'none';
      
      console.log('乐谱加载成功！');
      
      // 默认加载 Level 1 的乐句高亮
      await applyLevelHighlight(currentLevel);
    } catch (error) {
      console.error('加载乐谱时出错:', error);
      loadingEl.style.display = 'none';
      errorEl.style.display = 'block';
      errorEl.querySelector('p').textContent = `加载失败: ${error.message}`;
    }
  }

  // 缩放控制（带防抖优化）
  function updateZoom(newZoom, immediate = false) {
    if (!osmd) return;
    
    currentZoom = Math.max(0.5, Math.min(3.0, newZoom)); // 限制在 50% - 300%
    osmd.zoom = currentZoom;
    
    // 立即更新显示的百分比
    zoomLevelEl.textContent = Math.round(currentZoom * 100);
    
    // 使用防抖：延迟渲染，避免频繁点击时多次渲染
    if (renderTimeout) {
      clearTimeout(renderTimeout);
    }
    
    if (immediate) {
      osmd.render().then(() => {
        applyLevelHighlight(currentLevel); // 重新绘制高亮和折线图
      });
    } else {
      renderTimeout = setTimeout(() => {
        osmd.render().then(() => {
          applyLevelHighlight(currentLevel); // 重新绘制高亮和折线图
        });
      }, 150); // 150ms 防抖延迟
    }
  }

  // 按钮事件监听（增加到 0.2，变化更明显）
  document.getElementById('zoomIn').addEventListener('click', () => {
    updateZoom(currentZoom + 0.2);
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    updateZoom(currentZoom - 0.2);
  });

  document.getElementById('resetZoom').addEventListener('click', () => {
    updateZoom(1.0, true); // 重置时立即渲染
  });

  // 键盘快捷键（同样增加到 0.2）
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        updateZoom(currentZoom + 0.2);
      } else if (e.key === '-') {
        e.preventDefault();
        updateZoom(currentZoom - 0.2);
      } else if (e.key === '0') {
        e.preventDefault();
        updateZoom(1.0, true);
      }
    }
  });

  // 层级按钮事件监听
  const levelButtons = document.querySelectorAll('.level-btn');
  levelButtons.forEach(button => {
    button.addEventListener('click', async () => {
      // 移除所有按钮的 active 状态
      levelButtons.forEach(btn => btn.classList.remove('active'));
      // 添加当前按钮的 active 状态
      button.classList.add('active');
      
      // 获取层级编号
      currentLevel = parseInt(button.id.replace('level', ''));
      console.log(`切换到 Level ${currentLevel}`);
      
      // 加载并应用新层级的乐句高亮
      await applyLevelHighlight(currentLevel);
    });
  });

  // 乐句金字塔按钮点击事件
  const pyramidBtn = document.getElementById('pyramidBtn');
  if (pyramidBtn) {
    pyramidBtn.addEventListener('click', () => {
      window.location.href = 'pyramid.html';
    });
  }

  // 开始加载
  initSheetMusic();
});
