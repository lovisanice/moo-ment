// 文案库——祝贺语和鼓励的话都是琲琲写的
window.Moo = window.Moo || {};

Moo.words = {
  // 「不要了」之后的祝贺
  skip: [
    '又为喜欢的生活攒下了一点点！',
    '恭喜这笔钱成功转岗！',
    '这波不亏！',
    '给别的快乐腾个位置！',
    '嘿嘿，懂的都懂。',
    '钱花在喜欢的事情上，好像更开心！',
  ],
  // 「犒劳自己！」之后的鼓励
  keep: [
    '有时候生活就是需要一点小小的慰藉。',
    '细微的满足也是对自己的温柔。',
    '今天也真是辛苦我了！',
    '来都来了，好好享受。',
    '已满血复活！',
  ],
  // Tab 2 顶上那句
  momentsLead: '那一刻的你需要它，这就够了。',
  // 弹窗标题
  ask: {
    eat: { title: '今天想吃什么？', what: '想吃的东西', why: '为什么想吃呢', whatPh: '比如：麻辣烫', whyPh: '饿了？馋了？还是今天有点难过……' },
    buy: { title: '今天想买什么？', what: '想买的东西', why: '为什么想买呢', whatPh: '比如：一条新裙子', whyPh: '需要？喜欢？还是想让自己开心一下……' },
  },
  pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  },
};

// 琲琲画的素材
Moo.images = {
  skip: 'assets/bouquet.png',  // 花束牛
  keep: 'assets/bouquet.png',
  calc: 'assets/calc.gif',     // 思考牛
};
