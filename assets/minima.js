// minima.js - 局部最小能量可视化

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const chartsContainer = document.getElementById('chartsContainer');

  try {
    // 加载 Player_1 文件夹中的四个层级的 CSV 数据
    const playerFolder = 'Player_1';
    const baseFileName = 'mazurka174_Player_1';

    // 为每个层级创建图表
    for (let level = 1; level <= 4; level++) {
      const levelData = await loadCSV(`${playerFolder}/${baseFileName}_level_${level}.csv`);
      console.log(`Level ${level} 数据:`, levelData);
      
      // 解析该层级的数据
      const parsedData = parseLevelData(levelData);
      console.log(`Level ${level} 解析后:`, parsedData);
      
      // 创建图表
      createLevelChart(level, parsedData);
    }

    // 隐藏加载提示，显示图表
    loadingEl.style.display = 'none';
    chartsContainer.style.display = 'grid';

  } catch (error) {
    console.error('加载数据时出错:', error);
    loadingEl.style.display = 'none';
    errorEl.textContent = `错误: ${error.message}`;
    errorEl.style.display = 'block';
  }
});

// 加载 CSV 文件
async function loadCSV(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`无法加载文件: ${filePath}`);
  }
  const text = await response.text();
  return parseCSV(text);
}

// 解析 CSV 文本
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  
  return data;
}

// 解析单个层级的 CSV 数据
function parseLevelData(data) {
  const points = [];
  const minimaIndices = [];
  
  data.forEach(row => {
    const index = parseInt(row.Index);
    const energyValue = parseFloat(row.Energy_Value);
    const isMinima = parseInt(row.Minima_Indices) === 1;
    
    if (!isNaN(index) && !isNaN(energyValue)) {
      points.push({
        index: index,
        energy: energyValue,
        isMinima: isMinima
      });
      
      if (isMinima) {
        minimaIndices.push(index);
      }
    }
  });

  return {
    points: points,
    minimaIndices: minimaIndices
  };
}

// 创建层级图表
function createLevelChart(level, data) {
  const canvas = document.getElementById(`chartLevel${level}`);
  const ctx = canvas.getContext('2d');

  const { points, minimaIndices } = data;

  // 准备图表数据
  const chartData = {
    labels: points.map(p => p.index),
    datasets: [
      {
        label: 'Energy Value',
        data: points.map(p => ({ x: p.index, y: p.energy })),
        borderColor: 'rgba(102, 126, 234, 1)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Local Minima (局部最小值)',
        data: points.filter(p => p.isMinima).map(p => ({ x: p.index, y: p.energy })),
        borderColor: 'rgba(231, 76, 60, 1)',
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        pointStyle: 'star',
        pointRadius: 10,
        pointHoverRadius: 14,
        showLine: false
      }
    ]
  };

  // 创建图表
  new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `共 ${minimaIndices.length} 个局部最小值`,
          font: {
            size: 14,
            weight: 'normal'
          },
          color: '#666'
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              return `Index: ${context[0].parsed.x}`;
            },
            label: function(context) {
              const value = context.parsed.y;
              if (context.datasetIndex === 0) {
                return `Energy Value: ${value.toFixed(4)}`;
              } else {
                return `局部最小值: ${value.toFixed(4)}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Index',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            callback: function(value) {
              return Math.round(value);
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Energy Value',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value.toFixed(2);
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });

  console.log(`Level ${level} 图表创建完成，数据点: ${points.length}, 局部最小值: ${minimaIndices.length}`);
}

