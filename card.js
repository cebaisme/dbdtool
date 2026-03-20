(function () {
  // ==========================
  // 0. 安全檢查
  // ==========================
  if (!window.PERKS || !window.ADDONS || !window.KILLERS) {
    console.warn('CardSystem 需要先載入 killers.js / addons.js / perks.js');
  }

  // ==========================
  // 1. 卡片資料定義
  // ==========================
  const CARDS = [



    // 1. 特殊卡（The Wraith + 固定配件 + 技能重抽）
    {
      id: 'card1',
      zh: '福音戰士',
      target: 'any',
      colorType: 'addon',
      summary: '從該殺手配件池中找出紫配 + 綠配。',
      effect: {
        type: 'become_wraith_fixed_addons_random_perks',
        data: {
          killerKey: 'The Wraith',
          addons: ["'Swift Hunt' - Blood", 'Bone Clapper']
        }
      }
    },

    // 2. 5 個通用技能擇一
    {
      id: 'card02',
      zh: '起床重睡',
      target: 'slot-perk',
      colorType: 'perk-slot',
      summary: '該技能欄位抽出 5 個通用技能，五選一替換。',
      effect: { type: 'replace_skill_general_choice', data: { choices: 5 } }
    },

    // 3. 兩個配件總分為 7
    {
      id: 'card03',
      zh: '汰舊換新',
      target: 'addon',
      colorType: 'addon',
      summary: '系統會在後台自動重抽兩個配件，直到得到可用且總分為 7 的組合。',
      effect: { type: 'card03_addons_sum_7', data: {} }
    },

    // 4. 4 個技能不低於目前欄位分數
    {
      id: 'card04',
      zh: '空空遺忘',
      target: 'perk',
      colorType: 'perk',
      summary: '重抽四個技能，且分數都不會低於被指定欄位的分數。',
      effect: { type: 'card04_reroll_perks_not_lower_than_slot', data: {} }
    },

    // 5. 三個技能重抽，固定欄位至少 4 分
    {
      id: 'card05',
      zh: '重振旗鼓',
      target: 'perk',
      colorType: 'perk',
      summary: '重抽三個技能，其中卡片放置的欄位固定重抽成至少 4 分，其餘兩格照一般規則重抽。',
      effect: { type: 'card05_reroll_three_with_fixed_high_slot', data: {} }
    },

    // 6. 兩次 3-5 分技能五選一，隨機丟進技能欄位
    {
      id: 'card06',
      zh: '盤點庫存',
      target: 'perk',
      colorType: 'perk',
      summary: '進行兩次：每次抽出 5 個 3–5 分技能讓玩家選 1 個，並隨機替換到技能欄位。',
      effect: { type: 'card06_double_choice_random_perk_slot', data: { rounds: 2, choices: 5, scores: [3, 4, 5] } }
    },

    // 7. 4 技能隨機 1 重抽
    {
      id: 'card07',
      zh: '直觀投注',
      target: 'perk',
      colorType: 'perk',
      summary: '指定的技能重抽。',
      effect: { type: 'reroll_target_perk', data: {} }
    },

    // 8. 配件和技能隨機(0-6個)重抽
    {
      id: 'card08',
      zh: '歡愉至上',
      target: 'any',
      colorType: 'all-colored',
      summary: '隨機 0–6 格（技能或配件）重抽。',
      effect: { type: 'reroll_random_slots_0_6', data: { min: 0, max: 6 } }
    },

    // 9. 單格：抽三個，三選一
    {
      id: 'card09',
      zh: '精挑細選',
      target: 'slot-any',
      colorType: 'slot',
      summary: '該欄位抽出 3 個候選，三選一替換。',
      effect: { type: 'reroll_slot_choice', data: { choices: 3 } }
    },

    // 10. 單格：抽兩個，二選一
    {
      id: 'card10',
      zh: '五十五十',
      target: 'slot-any',
      colorType: 'slot',
      summary: '該欄位抽出 2 個候選，二選一替換。',
      effect: { type: 'reroll_slot_choice', data: { choices: 2 } }
    },

    // 11. 技能 -> 當前殺手的 3 個技能擇一
    {
      id: 'card11',
      zh: '成功三轉',
      target: 'slot-perk',
      colorType: 'perk-slot',
      summary: '將此技能改成當前殺手的 3 個技能之一（多選一）。',
      effect: { type: 'replace_skill_by_current_killer_3pick', data: {} }
    },

    // 12. 技能 -> 通用技能 5 選 1
    {
      id: 'card12',
      zh: '萌新入坑',
      target: 'slot-perk',
      colorType: 'perk-slot',
      summary: '該欄位抽出 5 個通用技能候選，五選一替換。',
      effect: { type: 'replace_skill_general_choice', data: { choices: 5 } }
    },

    // 13. 配件 -> 一紅配一白配
    {
      id: 'card13',
      zh: '混沌邪惡',
      target: 'addon',
      colorType: 'addon',
      summary: '從該殺手配件池中找出紅配 + 白配。',
      effect: { type: 'replace_addons_by_color', data: { colors: ['紅配', '白配'] } }
    },

    // 14. 配件 -> 一紫配一綠配
    {
      id: 'card14',
      zh: '福音戰士',
      target: 'addon',
      colorType: 'addon',
      summary: '從該殺手配件池中找出紫配 + 綠配。',
      effect: { type: 'replace_addons_by_color', data: { colors: ['紫配', '綠配'] } }
    },

    // 15. 配件 -> 兩藍配
    {
      id: 'card15',
      zh: '絕對中立',
      target: 'addon',
      colorType: 'addon',
      summary: '從該殺手配件池中找出兩個藍配。',
      effect: { type: 'replace_addons_by_color', data: { colors: ['藍配', '藍配'] } }
    },

    // 16. 六欄固定分數後 +1 分重抽（5 -> 0）
    {
      id: 'card16',
      zh: '全民普發',
      target: 'any',
      colorType: 'all-neutral',
      summary: '六個非殺手欄位會以原分數 +1 的分數重抽（5 分會變成 0 分）。',
      effect: { type: 'card16_all_slots_plus_one_wrap', data: {} }
    },

    // 17. 小遊戲：猜分數對決
    {
      id: 'card17',
      zh: '狂賭之冤',
      target: 'any',
      colorType: 'perk',
      summary: '選擇 0–5 的分數後與莊家 0–6 對決。莊家比較大則獲勝，較小則失敗，相同則平手。',
      effect: { type: 'card17_score_duel_minigame', data: {} }
    },

    // 18. 兩個配件取平均後重抽
    {
      id: 'card18',
      zh: '一分為二',
      target: 'addon',
      colorType: 'addon',
      summary: '兩個配件會變成相同分數的配件。',
      effect: { type: 'card18_average_addons', data: {} }
    },

    // 19. 技能集中：指定欄位變 0 分，其餘技能 +1 分重抽
    {
      id: 'card19',
      zh: '生吞活剝',
      target: 'slot-perk',
      colorType: 'perk',
      summary: '指定技能欄位變成 0 分技能，其餘技能欄位以原分數 +1 的分數重抽。',
      effect: { type: 'card19_zero_and_plus_one', data: {} }
    },

    // 20. 齊頭平等
    {
      id: 'card20',
      zh: '共產主義',
      target: 'any',
      colorType: 'all-neutral',
      summary: '六個非殺手欄位會盡量變成同一個分數後重抽。',
      effect: { type: 'card20_equalize_all_scores', data: {} }
    },

    // 21. 什麼事都沒有
    {
      id: 'card21',
      zh: '無事發生',
      target: 'any',
      colorType: 'all-neutral-dark',
      summary: '什麼事都沒有發生。',
      effect: { type: 'none', data: {} }
    },

    // 22. 包含殺手全部重抽（彩色）
    {
      id: 'card22',
      zh: '轉生卡車',
      target: 'any',
      colorType: 'all-colored',
      summary: '重抽殺手、配件與全部技能。',
      effect: { type: 'reroll_all_including_killer', data: {} }
    },

    // 23. 技能 -> 隨機殺手的 3 個技能擇一
    {
      id: 'card23',
      zh: '軍備擴充',
      target: 'slot-perk',
      colorType: 'perk-slot',
      summary: '將此技能改成某位隨機殺手的 3 個技能之一（多選一）。',
      effect: { type: 'replace_skill_by_random_killer_3pick', data: { killerKey: null } }
    },

    // 24. 等值重抽：保持原分數但全部重抽
    {
      id: 'card24',
      zh: '似曾相似',
      target: 'any',
      colorType: 'all-neutral',
      summary: '保持每個欄位分數不變，但全部重新抽取同分數的技能或配件。',
      effect: { type: 'reroll_same_score_all', data: {} }
    },

    // 25. 固定選中欄位，其餘欄位重抽
    {
      id: 'card25',
      zh: '穩如磐石',
      target: 'any',
      colorType: 'all-neutral',
      summary: '固定被選擇的欄位，其餘技能與配件欄位全部重抽。',
      effect: { type: 'keep_selected_reroll_others', data: {} }
    },

    // 26. 配件提升一等（白->綠->藍->紫->紅->白）
    {
      id: 'card26',
      zh: '神奇糖果',
      target: 'addon',
      colorType: 'addon',
      summary: '選擇的配件升一級。',
      effect: { type: 'upgrade_addons_color', data: {} }
    },

    // 27. 學習裝置：選擇的配件升兩等，另一個升一等（白->綠->藍->紫->紅->白）
    {
      id: 'card27',
      zh: '學習裝置',
      target: 'addon',
      colorType: 'addon',
      summary: '選擇的配件升兩級，另一個配件升一級。',
      effect: { type: 'upgrade_addons_color_split', data: { selectedSteps: 2, otherSteps: 1 } }
    },

    // 28. 特殊卡：幫撐十秒（技能組強制改寫 + 圖片過場）
    {
      id: 'card28',
      zh: '幫撐十秒',
      target: 'any',
      colorType: 'all-colored',
      summary: '...',
      effect: {
        type: 'card28_hold10s',
        data: {
          // 你可以把這張換成 PNG/JPG/GIF（GIF 可以直接放，<img> 會自動播放）
          image: './images/other/星爆氣流斬.gif',
          timeoutMs: 10220,
          perkSetsZh: [
            ['牢牢緊握', '瘋狂勇氣', '欣喜若狂'],
            ['把最好的留在最後', '招聘']
          ]
        }
      }
    },

    // 29. 普通卡：偷天換日（指定殺手 + 其餘重抽；技能不會抽到 5 分）
    {
      id: 'card29',
      zh: '偷天換日',
      target: 'any',
      colorType: 'all-colored',
      summary: '抽出 5 位殺手自選 1 位，並重抽兩個配件（配件抽不到 5 分），技能四個不變。',
      effect: { type: 'card29_steal_day_swap', data: { killerKey: null } }
    },

    // 30. 特殊卡：觀看廣告（不可跳過 5 張圖片輪播，結束後給獎勵）
    {
      id: 'card30',
      zh: '觀看廣告',
      target: 'any',
      colorType: 'all-neutral-dark',
      summary: '使用此卡觀看廣告來獲得豐厚獎勵。',
      effect: {
        type: 'card30_watch_ad',
        data: {
          // 5 張輪播圖片（可用 PNG/JPG/GIF；GIF 會自動播放）
          images: [
            './images/other/ad1.png',
            './images/other/ad2.png',
            './images/other/ad3.png',
            './images/other/ad4.png',
            './images/other/ad5.png'
          ],
          intervalMs: 1500,   // 每張 1.5 秒
          unlockDelayMs: 1000 // 最後一張出現後再等 1 秒才可關閉
        }
      }
    },

    // 31. 普通卡：竟敢無視（指定技能 -> 厄咒技能）
    {
      id: 'card31',
      zh: '竟敢無視',
      target: 'perk',
      colorType: 'perk',
      summary: '將指定欄位的技能變為隨機厄咒技能。',
      effect: { type: 'card31_replace_curse', data: {} }
    },

    // 32. 普通卡：怨者上鉤（指定技能 -> 天災鉤技能）
    {
      id: 'card32',
      zh: '怨者上鉤',
      target: 'perk',
      colorType: 'perk',
      summary: '將指定欄位的技能變為隨機天災技能。',
      effect: { type: 'card32_replace_scourge', data: {} }
    },

    // 33. 特殊卡：老威集合（殺手 -> aliases 含「威」；技能 -> 該殺手技能）
    {
      id: 'card33',
      zh: '老威集合',
      target: 'any',
      colorType: 'all-colored',
      summary: '所有威家人集合一起獵殺人類吧',
      effect: { type: 'card33_will_family', data: {} }
    },

    // 34. 普通卡：願望清單（5 隻殺手自選 1 隻，指定技能變成該殺手的隨機專屬技能）
    {
      id: 'card34',
      zh: '願望清單',
      target: 'perk',
      colorType: 'perk',
      summary: '隨機選出 5 位殺手，讓你自選 1 位，將指定欄位變成該殺手的隨機一個技能。',
      effect: { type: 'card34_wishlist', data: {} }
    },

    // 35. 做出選擇（A：技能4-5 / 配件1-2；B：技能0-1 / 配件4-5）
    {
      id: 'card35',
      zh: '做出選擇',
      target: 'any',
      colorType: 'all-neutral-dark',
      summary: 'I want to play a game.',
      effect: { type: 'card35_make_choice', data: {} }
    },

    // 36. 一視同仁（技能 + 配件 全部變成同一個隨機分數 1–5）
    {
      id: 'card36',
      zh: '一視同仁',
      target: 'any',
      colorType: 'all-neutral',
      summary: '所有技能與配件會被設為同一個隨機分數（1–5）。',
      effect: { type: 'card36_equal_score', data: {} }
    },

    // 37. 普通卡：殺手皇后（直接炸掉上一階段讓玩家重新拉拉霸）
    {
      id: 'card37',
      zh: '殺手皇后',
      target: 'any',
      colorType: 'killer-queen',
      summary: `「殺手皇后，第三爆彈，敗者食塵」`,
      effect: { type: 'card37_restart_slot', data: {} }
    },

    // 38. 限時四選一：3 秒內不選就變成 0–2 分技能
    {
      id: 'card38',
      zh: '生死時速',
      target: 'slot-perk',
      colorType: 'perk-slot',
      summary: '該技能欄位先抽出 4 個 3–5 分技能四選一；3 秒內沒選則候選改成 0–2 分技能。',
      effect: { type: 'card38_speed_choice', data: {} }
    },

    // 39. 快問快答：選兩格後答題，答對 +2，答錯/超時 -1
    {
      id: 'card39',
      zh: '快問快答',
      target: 'any',
      colorType: 'all-neutral-dark',
      summary: '選兩個非殺手欄位後進行快問快答；答對兩格各 +2，答錯或超時則各 -1。',
      effect: { type: 'card39_quiz', data: {} }
    },


  ];

  // ==========================
  // 2. 共用工具
  // ==========================
  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getRandomItem(arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function cloneState(state) {
    return {
      killerKey: state.killerKey || null,
      addons: Array.isArray(state.addons) ? state.addons.slice() : [],
      perks: Array.isArray(state.perks) ? state.perks.slice() : []
    };
  }

  function getAllPerkNames() {
    return Object.keys(window.PERKS || {});
  }

  function getAllPerksExcept(currentList) {
    const set = new Set(currentList || []);
    return getAllPerkNames().filter(name => !set.has(name));
  }

  function getAddonNamesForKiller(killerKey) {
    return Object.entries(window.ADDONS || {})
      .filter(([name, a]) => a && a.killer === killerKey)
      .map(([name]) => name);
  }

  function getAllAddonsExceptForKiller(killerKey, currentList) {
    const set = new Set(currentList || []);
    return getAddonNamesForKiller(killerKey).filter(name => !set.has(name));
  }

  function getAddonsByAliasForKiller(killerKey, aliasText, excludeNames) {
    const exclude = new Set(excludeNames || []);
    return Object.entries(window.ADDONS || {})
      .filter(([name, a]) => {
        if (!a || a.killer !== killerKey) return false;
        if (exclude.has(name)) return false;
        const aliases = a.aliases || [];
        return aliases.includes(aliasText);
      })
      .map(([name]) => name);
  }

  function getPerkZh(name) {
    const p = window.PERKS && window.PERKS[name];
    return (p && p.zh) || '';
  }

  // 透過中文名稱找回 PERKS 的 key（方便你用中文直接指定技能）
  function findPerkKeyByZh(zhName) {
    const entries = Object.entries(window.PERKS || {});
    for (const [key, perk] of entries) {
      if (!perk) continue;
      if ((perk.zh || '') === zhName) return key;
    }
    // 若遇到些微不一致，做一次模糊包含（保守）
    for (const [key, perk] of entries) {
      const zh = (perk && perk.zh) ? perk.zh : '';
      if (zh && zh.includes(zhName)) return key;
    }
    return null;
  }


  function getPerkImg(name) {
    const p = window.PERKS && window.PERKS[name];
    return (p && p.img) || '';
  }

  function getAddonZh(name) {
    const a = window.ADDONS && window.ADDONS[name];
    return (a && a.zh) || '';
  }

  function getAddonImg(name) {
    const a = window.ADDONS && window.ADDONS[name];
    return (a && a.img) || '';
  }

  function getKillerZh(key) {
    const k = window.KILLERS && window.KILLERS[key];
    return (k && k.zh) || key || '';
  }

  function getKillerImg(key) {
    const k = window.KILLERS && window.KILLERS[key];
    if (!k || !k.img) return '';

    let img = k.img;

    // 拉霸模式改用 killers2 資料夾
    img = img.replace("images/killers/", "images/killers2/");

    return img;
  }

  function getKillerScore(key) {
    const k = window.KILLERS && window.KILLERS[key];
    return (k && typeof k.score === 'number') ? k.score : null;
  }



  function getPerkScore(name) {
    const p = window.PERKS && window.PERKS[name];
    return (p && typeof p.score === 'number') ? p.score : null;
  }

  function getAddonScore(name) {
    const a = window.ADDONS && window.ADDONS[name];
    return (a && typeof a.score === 'number') ? a.score : null;
  }

  function getPerkNamesByScores(scores) {
    const scoreSet = new Set(scores || []);
    return Object.entries(window.PERKS || {})
      .filter(([name, p]) => p && typeof p.score === 'number' && scoreSet.has(p.score))
      .map(([name]) => name);
  }

  function getAddonNamesByScoresForKiller(killerKey, scores) {
    if (!killerKey) return [];
    const scoreSet = new Set(scores || []);
    return Object.entries(window.ADDONS || {})
      .filter(([name, a]) =>
        a && a.killer === killerKey &&
        typeof a.score === 'number' &&
        scoreSet.has(a.score)
      )
      .map(([name]) => name);
  }

const CARD39_QUIZ_RAW = String.raw`題目
DBD中所有版權角色都可以用暗金細胞購買
答 否 註釋:比爾

dbd是一個鮮少有bug的遊戲
答 否 註釋:dead bug daylight

攜帶鳳敏的「機械技術」時，對上佛萊迪入夢狀態，技能檢驗失敗沒有爆點時可以醒來嗎？
答 是 註釋:醒來判定來自「炸機」而不是爆點或巨大聲響

對上地獄修士時，被鎖鏈綁住仍然可以開門嗎？
答 是 註釋:遇到醫生瘋狂三時也可以，是個很重要的小知識

深度傷口在解除醫生瘋狂時仍會持續倒退
答 否 註釋:黃條解瘋狂期間不會倒退

幽靈殺手本名菲利浦
答 是 註釋:全名Philip Ojomo

最大的地圖是黑水沼澤蒼白玫瑰
答 否 註釋:最大的地圖是阿札羅夫長眠處(資料來源wikigg)

小丑在斬殺男性倖存者時會拿走右手小指
答 否 註釋:是左手小指，女性倖存者是右手食指

陰屍路章節剛推出時出現海量Bug，下列哪位殺手成功倖存沒有Bug？
A.醫生
B.淤神
C.未知惡物
D.以上皆非
答 D 註釋:醫生的電可以打斷翻窗、淤神會導致伺服器崩潰、偽人的幻影會不見，實際上這個版本並沒有殺手倖存ヽ(ﾟ∀。)ﾉ

據說每張地圖裡面都會藏有一個黃金工具箱，請問米德威治小學的黃金工具箱在哪裡？
A.圖書室
B.化學室
C.中庭花園
D.二樓廁所
答 B 註釋:在終局的時候會從房間正中間的桌子上肉塊中慢慢長出來

下列何者無法從外觀判斷能力狀態？
A.追跡者
B.好孩子娃娃
C.鬼臉
D.鬼武者
答 C 註釋:追跡者可以透過手臂來看出現在階級、恰吉把刀反拿代表隱身、鬼武者開大的時候會噴紅煙

邁爾斯攜帶「死兔子」配件，技能攜帶「恐懼釋放」和「監控與打擊」，在跟蹤模式下追逐倖存者，請問此時恐懼範圍約為多少公尺？
A.0
B.18
C.24
D.36
答 A 註釋:跟蹤模式下隱身

若是我今天想要到陰屍路的專屬地圖，我在燒祭品的情況下機率為多少？
A.0%
B.2.33%
C.6.81%
D.17.49%
答 C 註釋:祭品成功生效的機率是20%，並且同領域的地圖有四張，所以祭品成功並且到達目標地圖機率是5%；未成功時為44張地圖抽1，乘上80%約為1.81%，總計約6.81%。跟某些遊戲抽卡出金的機率差不多喔¯\(ツ)/¯

本網站作者名？
A.cade
B.oeba
C.eba
D.ceba
答 D 註釋:你好我是ceba，請多指教(￣▽￣)ノ

下列哪位殺手沒有搖籃曲？
A.怨靈
B.雙胞胎
C.騙術師
D.女獵人
答 A 註釋:怨靈的只是風聲音效，並不是搖籃曲

下列哪隻殺手設定上最年輕？
A.怨靈
B.異形
C.妖婆
D.維克多
答 B 註釋:怨靈18-20歲、妖婆17-18歲、維克多推測在6-7歲時掛掉、異形才剛出生不到幾個小時

以下殺手哪位沒有特殊斬殺？
A.原初者
B.貞子
C.劊子手
D.騎士
答 D 註釋:貞子迷咒7層可以特殊斬殺、三角頭二掛+折磨狀態可以特殊斬殺、原初者二掛+標記四層可以特殊斬殺`;

function parseCard39QuizRaw(raw) {
  const blocks = String(raw || '')
    .replace(/^\uFEFF/, '')
    .split(/\n\s*\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  return blocks.map(block => {
    let lines = block.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return null;

    // 第一段題庫前面會有一個標題「題目」，不要把它當成真正題目
    if (lines[0] === '題目') {
      lines = lines.slice(1);
    }
    if (!lines.length) return null;

    const question = lines[0];
    const options = [];
    let answer = '';
    let note = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^[A-D]\./.test(line)) {
        options.push({
          label: line.slice(0, 1),
          text: line.slice(2).trim()
        });
        continue;
      }
      if (line.startsWith('答 ')) {
        const rest = line.slice(2).trim();
        const parts = rest.split(/\s+註釋:/);
        answer = (parts[0] || '').trim();
        note = (parts[1] || '').trim();
      }
    }

    if (!question) return null;
    return { question, options, answer, note };
  }).filter(Boolean);
}

const CARD39_QUIZ_DATA = Array.isArray(window.CARD39_QUIZ_DATA) && window.CARD39_QUIZ_DATA.length
  ? window.CARD39_QUIZ_DATA
  : parseCard39QuizRaw(CARD39_QUIZ_RAW);

function normalizeCard39AnswerToken(value) {
  return String(value || '')
    .trim()
    .replace(/[．。]/g, '.')
    .replace(/^([A-D])\.$/, '$1')
    .replace(/\s+/g, '')
    .toUpperCase();
}


  // ==========================
  // 2.x 測試用：強制抽中卡片
  // 可填入：2、'2'、'02'、'card02' 皆可
  // 例：const FORCE_DRAW_CARD_IDS = [17];
  // 每次進入卡片階段時，會優先把這些卡塞進 3 張卡片中（最多 3 張）
  // ==========================
  const FORCE_DRAW_CARD_IDS = [];

  function normalizeForcedCardId(value) {
    if (value == null) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const candidates = [];
    if (/^card\d+$/i.test(raw)) {
      const digits = String(parseInt(raw.replace(/^card/i, ''), 10));
      if (digits && digits !== 'NaN') {
        candidates.push('card' + digits);
        candidates.push('card' + digits.padStart(2, '0'));
      }
    } else if (/^\d+$/.test(raw)) {
      const digits = String(parseInt(raw, 10));
      if (digits && digits !== 'NaN') {
        candidates.push('card' + digits);
        candidates.push('card' + digits.padStart(2, '0'));
      }
    } else {
      return null;
    }

    for (const id of candidates) {
      if (CARDS.some(c => c && c.id === id)) return id;
    }
    return candidates[0] || null;
  }

  function getForcedCards(extraExcludeIds) {
    const exclude = new Set(extraExcludeIds || []);
    const result = [];
    const used = new Set();

    (FORCE_DRAW_CARD_IDS || []).forEach((value) => {
      const id = normalizeForcedCardId(value);
      if (!id || used.has(id) || exclude.has(id)) return;
      const found = CARDS.find(c => c.id === id);
      if (!found) return;
      used.add(id);
      result.push(found);
    });

    return result.slice(0, 3);
  }

  function getGeneralPerkNames() {
    return Object.entries(window.PERKS || {})
      .filter(([_, p]) => p && p.killer === 'General')
      .map(([name]) => name);
  }

  function pickDistinctRandom(arr, count) {
    return shuffle(arr || []).slice(0, Math.max(0, count || 0));
  }

  function getFallbackScoreSequence(score, opts) {
    const addOneFirst = !opts || opts.addOneFirst !== false;
    const seq = [];
    const push = (v) => {
      if (typeof v !== 'number') return;
      if (v < 0 || v > 5) return;
      if (!seq.includes(v)) seq.push(v);
    };

    push(score);
    if (addOneFirst) {
      push(score + 1);
      push(score - 1);
    } else {
      push(score - 1);
      push(score + 1);
    }
    for (let delta = 2; delta <= 5; delta++) {
      push(score + delta);
      push(score - delta);
    }
    return seq;
  }

  function pickFromPoolPreferDistinct(pool, usedSet, allowDuplicateFallback) {
    const used = usedSet || new Set();
    let filtered = (pool || []).filter(name => !used.has(name));
    if (!filtered.length && allowDuplicateFallback) {
      filtered = (pool || []).slice();
    }
    if (!filtered.length) return null;
    return getRandomItem(filtered);
  }

  function buildPerkSelectionForScores(targetScores, options) {
    const opts = options || {};
    const used = new Set(opts.initialUsed || []);
    const result = [];

    for (const score of targetScores) {
      let chosen = null;
      const sequence = typeof opts.scoreFallbackSequence === 'function'
        ? opts.scoreFallbackSequence(score)
        : [score];
      for (const s of sequence) {
        const pool = getPerkNamesByScores([s]);
        chosen = pickFromPoolPreferDistinct(pool, used, !!opts.allowDuplicateFallback);
        if (chosen) break;
      }
      if (!chosen) return null;
      result.push(chosen);
      used.add(chosen);
    }
    return result;
  }

  function buildAddonSelectionForScores(killerKey, targetScores, options) {
    const opts = options || {};
    const used = new Set(opts.initialUsed || []);
    const result = [];

    for (const score of targetScores) {
      let chosen = null;
      const sequence = typeof opts.scoreFallbackSequence === 'function'
        ? opts.scoreFallbackSequence(score)
        : [score];
      for (const s of sequence) {
        const pool = getAddonNamesByScoresForKiller(killerKey, [s]);
        // 配件永遠禁止重複，因此這裡不接受 duplicate fallback
        chosen = pickFromPoolPreferDistinct(pool, used, false);
        if (chosen) break;
      }
      if (!chosen) return null;
      result.push(chosen);
      used.add(chosen);
    }
    return result;
  }

  function sanitizeAddonState(state) {
    if (!state || !state.killerKey) return state;

    const killerKey = state.killerKey;
    const killerPool = getAddonNamesForKiller(killerKey);
    const validSet = new Set(killerPool);
    const original = Array.isArray(state.addons) ? state.addons.slice(0, 2) : [];
    const result = [];
    const used = new Set();

    for (const name of original) {
      if (!name) {
        result.push(null);
        continue;
      }
      if (!validSet.has(name) || used.has(name)) {
        result.push(null);
        continue;
      }
      result.push(name);
      used.add(name);
    }

    while (result.length < 2) result.push(null);

    for (let i = 0; i < 2; i++) {
      if (result[i]) continue;
      const pool = killerPool.filter(name => !used.has(name));
      const chosen = getRandomItem(pool);
      if (!chosen) break;
      result[i] = chosen;
      used.add(chosen);
    }

    state.addons = result.slice(0, 2).filter(Boolean);
    return state;
  }

  function rerollPerkSlotByScore(slotIdx, scoreSequence, options) {
    if (slotIdx < 0 || slotIdx > 3) return false;
    const perks = currentState.perks.slice();
    const other = perks.filter((_, i) => i !== slotIdx);
    for (const score of scoreSequence) {
      let pool = getPerkNamesByScores([score]).filter(name => !other.includes(name) && name !== perks[slotIdx]);
      if (!pool.length && options && options.allowKeepSameName) {
        pool = getPerkNamesByScores([score]).filter(name => !other.includes(name));
      }
      if (!pool.length && options && options.allowDuplicateFallback) {
        pool = getPerkNamesByScores([score]).filter(name => name !== perks[slotIdx]);
      }
      if (!pool.length) continue;
      const chosen = getRandomItem(pool);
      if (!chosen) continue;
      perks[slotIdx] = chosen;
      currentState.perks = perks;
      return true;
    }
    return false;
  }

  function rerollAddonSlotByScore(slotIdx, scoreSequence, options) {
    if (slotIdx < 0 || slotIdx > 1) return false;
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;
    const addons = currentState.addons.slice();
    const other = addons.filter((_, i) => i !== slotIdx);
    for (const score of scoreSequence) {
      let pool = getAddonNamesByScoresForKiller(killerKey, [score]).filter(name => !other.includes(name) && name !== addons[slotIdx]);
      if (!pool.length && options && options.allowKeepSameName) {
        pool = getAddonNamesByScoresForKiller(killerKey, [score]).filter(name => !other.includes(name));
      }
      // 配件永遠禁止重複，因此這裡不做 duplicate fallback
      if (!pool.length) continue;
      const chosen = getRandomItem(pool);
      if (!chosen) continue;
      addons[slotIdx] = chosen;
      currentState.addons = addons;
      return true;
    }
    return false;
  }

  // ==========================
  // 3. UI 樣式 & 容器
  // ==========================
  let styleInjected = false;

  function ensureStyles() {
    if (styleInjected) return;
    styleInjected = true;

    const style = document.createElement('style');
    style.id = 'card-system-styles';
    style.textContent = `
      #cardContainer {
        width: 100%;
        max-width: 1150px;
        margin: 12px auto 0;
        display: flex;
        justify-content: center;
        gap: 12px;
        opacity: 0;
        transform: translateY(18px);
        transition: opacity 0.25s ease-out, transform 0.25s ease-out;
      }

      #cardContainer.card-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .slot-card {
        width: 220px;
        height: 310px;
        border-radius: 14px;
        box-shadow:
          0 10px 20px rgba(0, 0, 0, 0.45),
          0 0 0 1px rgba(0, 0, 0, 0.6);
        background: #222;
        color: #f5f5f5;
        padding: 25px 14px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        opacity: 0;
        transform: translateY(40px);
        transition:
          transform 0.45s cubic-bezier(.17,.67,.32,1.4),
          opacity 0.3s ease-out;
        cursor: grab;
        user-select: none;
      }

      .slot-card.show {
        opacity: 1;
        transform: translateY(0);
      }

      .slot-card:active {
        cursor: grabbing;
      }

      .slot-card-header {
        font-size: 22px;        
        font-weight: 800;       
        text-align: center;     
        margin-top: 4px;      
        margin-bottom: 10px;   
        letter-spacing: 0.05em;
      }

      .slot-card-summary {
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.9;
        white-space: pre-line;
      }

      .slot-card-footer {
        font-size: 11px;
        opacity: 0.65;
        text-align: right;
        margin-top: 8px;
      }

      .slot-card.color-all-colored {
        background: linear-gradient(135deg, #d11b4f, #510a1e);
      }
      .slot-card.color-all-neutral {
        background: linear-gradient(135deg, #3a87dd, #071787);
      }
      .slot-card.color-all-neutral-dark {
        background: linear-gradient(135deg, #5f4938, #1a140f);
      }
      .slot-card.color-addon {
        background: linear-gradient(135deg, #b34fd1ff, #612b72ff);
      }
      .slot-card.color-perk {
        background: linear-gradient(135deg, #4494bb, #a5a7cd);
      }
      .slot-card.color-slot {
        background: linear-gradient(135deg, #f6b73c, #8a5600);
      }
      .slot-card.color-perk-slot {
        background: linear-gradient(135deg, #5caf4eff, #2a5a21ff);
      }

      /* 敗者食塵 */
      .slot-card.color-killer-queen {
        background: linear-gradient(135deg, #F4CFE0 0%, #E8AFC8 45%, #D889B3 100%);
      }

      .slot-cell.card-drop-ok {
        outline: 2px solid #fff4b3;
        box-shadow: 0 0 12px rgba(255, 255, 200, 0.9);
        opacity: 1 !important;
      }

      /* 多選彈窗 */
      #cardChoiceOverlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .card-choice-panel {
        background: #1b1b1b;
        border-radius: 10px;
        padding: 16px 18px;
        max-width: 480px;
        width: 90%;
        color: #f5f5f5;
        box-shadow: 0 18px 36px rgba(0,0,0,0.7);
      }
      .card-choice-title {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .card-choice-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;
      }
      .card-choice-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        background: #2a2a2a;
        cursor: pointer;
        transition: background 0.15s ease-out;
      }
      .card-choice-item:hover {
        background: #3a3a3a;
      }
      .card-choice-icon {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        background: #000;
      }
      .card-choice-icon img {
        width: 32px;
        height: 32px;
        object-fit: contain;
        display: block;
      }
      .card-choice-text-main {
        font-size: 13px;
        font-weight: 600;
      }
      .card-choice-text-sub {
        font-size: 11px;
        opacity: 0.75;
      }
      .card-choice-footer {
        text-align: right;
        font-size: 11px;
        opacity: 0.7;
      }

      /* 兩選一彈窗（卡35） */
      #cardBinaryChoiceOverlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .card-binary-panel {
        background: #1b1b1b;
        border-radius: 10px;
        padding: 16px 18px;
        max-width: 520px;
        width: 92%;
        color: #f5f5f5;
        box-shadow: 0 18px 36px rgba(0,0,0,0.7);
      }
      .card-binary-title {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 10px;
        white-space: pre-line;
      }
      .card-binary-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .card-binary-btn {
        border: none;
        border-radius: 10px;
        padding: 10px 12px;
        background: #2a2a2a;
        color: #f5f5f5;
        cursor: pointer;
        text-align: left;
        transition: transform 0.12s ease-out, background 0.12s ease-out;
        box-shadow: 0 6px 14px rgba(0,0,0,0.35);
      }
      .card-binary-btn:hover {
        background: #3a3a3a;
        transform: translateY(-1px);
      }
      .card-binary-btn:active {
        transform: translateY(0);
      }
      .card-binary-btn .card-binary-label {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .card-binary-btn .card-binary-desc {
        font-size: 12px;
        opacity: 0.85;
        line-height: 1.35;
        white-space: pre-line;
      }

      

/* 觀看廣告（卡30）過場：全螢幕輪播，不可跳過 */
#cardAdOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
#cardAdOverlay .card-ad-img {
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  display: block;
}
#cardAdOverlay .card-ad-hint {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.45);
  padding: 6px 10px;
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
#cardAdOverlay.can-close .card-ad-hint {
  opacity: 1;
}

/* 無效卡片彈窗 */
      #cardInvalidOverlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .card-invalid-panel {
        background: #1b1b1b;
        border-radius: 10px;
        padding: 16px 20px;
        max-width: 360px;
        width: 90%;
        color: #f5f5f5;
        box-shadow: 0 18px 36px rgba(0,0,0,0.7);
        text-align: left;
        font-size: 13px;
      }
      .card-invalid-title {
        font-weight: 700;
        margin-bottom: 8px;
      }
      .card-invalid-body {
        white-space: pre-line;
        margin-bottom: 12px;
      }
      .card-invalid-btn {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        background: #f6b73c;
        color: #222;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
      }
      .card-invalid-btn:hover {
        background: #ffd36c;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCardContainer() {
    let container = document.getElementById('cardContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cardContainer';
    }

    const slotMode = document.getElementById('slotMode');
    if (slotMode && container.parentNode !== slotMode.parentNode) {
      slotMode.parentNode.insertBefore(container, slotMode.nextSibling);
    }
    return container;
  }

  // ==========================
  // 4. 卡片抽選（含特殊卡 5%）
  // ==========================
  function drawOneCardWeighted(excludeIds) {
    // 盡量容錯：就算 index 的 SlotSettings 腳本壞掉，也能從 localStorage 抓到設定
    let settings = window.SlotSettings || null;
    if (!settings) {
      try {
        const raw = localStorage.getItem('dbd_slot_settings');
        if (raw) settings = JSON.parse(raw);
      } catch (e) { /* ignore */ }
    }
    settings = settings || {};

    const specialEnabled = !!(
      settings.specialCardsEnabled ??
      settings.enableSpecialCards ??
      settings.enableSpecial ??
      settings.ssEnableSpecialCards
    );

    excludeIds = excludeIds || [];

    // 特殊卡：目前支援 card1 / card28 / card30 / card33（總機率 5%）
    const specialIds = ['card1', 'card28', 'card30', 'card33'];
    const specials = CARDS.filter(c => specialIds.includes(c.id));
    const normals = CARDS.filter(c => !specialIds.includes(c.id));

    if (specialEnabled) {
      const p = 0.05; // 5%
      const availableSpecials = specials.filter(c => !excludeIds.includes(c.id));
      if (availableSpecials.length && Math.random() < p) {
        return getRandomItem(availableSpecials);
      }
    }

    let pool = normals.filter(c => !excludeIds.includes(c.id));
    if (!pool.length) pool = normals;
    return getRandomItem(pool);
  }

  function pickThreeCards(extraExcludeIds) {
    const chosen = [];
    const exclude = new Set(extraExcludeIds || []);

    const forced = getForcedCards(Array.from(exclude));
    forced.forEach((card) => {
      if (!exclude.has(card.id) && chosen.length < 3) {
        exclude.add(card.id);
        chosen.push(card);
      }
    });

    let safety = 0;
    while (chosen.length < 3 && safety < 100) {
      safety++;
      const card = drawOneCardWeighted(Array.from(exclude));
      if (!card) break;
      if (!exclude.has(card.id)) {
        exclude.add(card.id);
        chosen.push(card);
      }
    }
    return chosen;
  }

  // ==========================
  // 5. 卡片階段狀態
  // ==========================
  let currentState = null;
  let applyCallback = null;
  let isActive = false;
  let currentCards = [];
  let dragInfo = null;

  // ==========================
  // 6. 多選一彈窗
  // ==========================
  function showChoiceOverlay(options) {
    const type = options.type;
    const candidates = options.candidates || [];
    const onPick = options.onPick;

    const overlay = document.createElement('div');
    overlay.id = 'cardChoiceOverlay';

    const panel = document.createElement('div');
    panel.className = 'card-choice-panel';

    const titleEl = document.createElement('div');
    titleEl.className = 'card-choice-title';
    titleEl.textContent = options.title || '選擇一個替換選項：';

    const listEl = document.createElement('div');
    listEl.className = 'card-choice-list';

    candidates.forEach(name => {
      const item = document.createElement('div');
      item.className = 'card-choice-item';

      const iconBox = document.createElement('div');
      iconBox.className = 'card-choice-icon';
      const img = document.createElement('img');
      let zh = '';
      let imgSrc = '';
      if (type === 'perk') {
        zh = getPerkZh(name) || name;
        imgSrc = getPerkImg(name);
      } else if (type === 'killer') {
        zh = getKillerZh(name) || name;
        imgSrc = getKillerImg(name);
      } else {
        zh = getAddonZh(name) || name;
        imgSrc = getAddonImg(name);
      }
      if (imgSrc) img.src = imgSrc;
      iconBox.appendChild(img);

      const textBox = document.createElement('div');
      const main = document.createElement('div');
      main.className = 'card-choice-text-main';
      main.textContent = zh || '未知';

      const sub = document.createElement('div');
      sub.className = 'card-choice-text-sub';
      sub.textContent = ''; // 不顯示英文

      textBox.appendChild(main);
      textBox.appendChild(sub);

      item.appendChild(iconBox);
      item.appendChild(textBox);

      item.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (typeof onPick === 'function') onPick(name);
      });

      listEl.appendChild(item);
    });

    const footer = document.createElement('div');
    footer.className = 'card-choice-footer';
    footer.textContent = '點擊其中一個選項進行替換';

    panel.appendChild(titleEl);
    panel.appendChild(listEl);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }


  // ==========================
  // 6.1 兩選一彈窗（卡35）
  // ==========================
  function showBinaryChoiceOverlay(options) {
    const overlay = document.createElement('div');
    overlay.id = 'cardBinaryChoiceOverlay';

    const panel = document.createElement('div');
    panel.className = 'card-binary-panel';

    const titleEl = document.createElement('div');
    titleEl.className = 'card-binary-title';
    titleEl.textContent = options.title || '做出選擇：';

    const actions = document.createElement('div');
    actions.className = 'card-binary-actions';

    const items = options.items || [];
    items.forEach((it) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-binary-btn';

      const label = document.createElement('div');
      label.className = 'card-binary-label';
      label.textContent = it.label || '';

      const desc = document.createElement('div');
      desc.className = 'card-binary-desc';
      desc.textContent = it.desc || '';

      btn.appendChild(label);
      btn.appendChild(desc);

      btn.addEventListener('click', () => {
        if (overlay.parentNode) document.body.removeChild(overlay);
        if (typeof options.onPick === 'function') options.onPick(it.key);
      });

      actions.appendChild(btn);
    });

    panel.appendChild(titleEl);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }


function showCard17ScoreChoiceOverlay(options) {
  const overlay = document.createElement('div');
  overlay.id = 'cardBinaryChoiceOverlay';

  const panel = document.createElement('div');
  panel.className = 'card-binary-panel';

  const titleEl = document.createElement('div');
  titleEl.className = 'card-binary-title';
  titleEl.textContent = options.title || '選擇一個分數';

  panel.appendChild(titleEl);

  const ruleLines = Array.isArray(options.ruleLines) ? options.ruleLines.filter(Boolean) : [];
  if (ruleLines.length) {
    const rules = document.createElement('div');
    rules.className = 'card17-choice-rules';
    rules.style.margin = '10px 0 14px';
    rules.style.padding = '10px 12px';
    rules.style.borderRadius = '10px';
    rules.style.background = 'rgba(255,255,255,0.05)';
    rules.style.border = '1px solid rgba(255,255,255,0.08)';
    rules.style.textAlign = 'left';
    rules.style.lineHeight = '1.65';

    ruleLines.forEach((line, idx) => {
      const row = document.createElement('div');
      row.className = 'card17-choice-rule-line';
      row.textContent = line;
      row.style.fontSize = '13px';
      row.style.color = idx === 0 ? '#7CFFB2' : (idx === 1 ? '#FF8E8E' : '#FFD36E');
      rules.appendChild(row);
    });

    panel.appendChild(rules);
  }

  const actions = document.createElement('div');
  actions.className = 'card-binary-actions';
  actions.style.gridTemplateColumns = 'repeat(6, 1fr)';

  (options.values || []).forEach((value) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card-binary-btn';
    btn.style.textAlign = 'center';

    const label = document.createElement('div');
    label.className = 'card-binary-label';
    label.textContent = String(value);
    label.style.fontSize = '26px';
    label.style.textAlign = 'center';

    btn.appendChild(label);
    btn.addEventListener('click', () => {
      if (overlay.parentNode) document.body.removeChild(overlay);
      if (typeof options.onPick === 'function') options.onPick(value);
    });
    actions.appendChild(btn);
  });

  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

  function showInfoPopup(title, body, onClose) {
    const overlay = document.createElement('div');
    overlay.id = 'cardInvalidOverlay';

    const panel = document.createElement('div');
    panel.className = 'card-invalid-panel';

    const titleEl = document.createElement('div');
    titleEl.className = 'card-invalid-title';
    titleEl.textContent = title || '提示';

    const bodyEl = document.createElement('div');
    bodyEl.className = 'card-invalid-body';
    bodyEl.textContent = body || '';

    const btn = document.createElement('div');
    btn.className = 'card-invalid-btn';
    btn.textContent = '確認';
    btn.addEventListener('click', () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof onClose === 'function') onClose();
    });

    panel.appendChild(titleEl);
    panel.appendChild(bodyEl);
    panel.appendChild(btn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }


  let card17AnimStyleInjected = false;
  function ensureCard17AnimStyles() {
    if (card17AnimStyleInjected) return;
    card17AnimStyleInjected = true;

    const style = document.createElement('style');
    style.id = 'card17-duel-styles';
    style.textContent = `
      #card17DuelOverlay {
        position: fixed;
        inset: 0;
        z-index: 21000;
        background: radial-gradient(circle at top, rgba(43, 58, 112, 0.45), rgba(0, 0, 0, 0.90) 62%);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      }
      .card17-duel-panel {
        width: min(760px, calc(100vw - 28px));
        border-radius: 24px;
        padding: 22px 22px 18px;
        background: linear-gradient(180deg, rgba(8, 11, 20, 0.96), rgba(14, 18, 34, 0.98));
        border: 1px solid rgba(255, 255, 255, 0.10);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.58), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        color: #f3f6ff;
      }
      .card17-duel-title {
        text-align: center;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 0.06em;
        margin-bottom: 10px;
      }
      .card17-duel-sub {
        text-align: center;
        font-size: 13px;
        color: rgba(225, 232, 255, 0.72);
        margin-bottom: 18px;
      }
      .card17-duel-vs {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 16px;
      }
      .card17-duel-side {
        border-radius: 20px;
        padding: 18px 14px;
        min-height: 220px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .card17-duel-side::before {
        content: '';
        position: absolute;
        inset: -30% auto auto -20%;
        width: 120px;
        height: 120px;
        background: radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%);
        pointer-events: none;
      }
      .card17-duel-label {
        font-size: 13px;
        color: rgba(225, 232, 255, 0.72);
        margin-bottom: 10px;
        letter-spacing: 0.14em;
      }
      .card17-duel-score {
        width: 116px;
        height: 116px;
        border-radius: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 64px;
        font-weight: 900;
        background: radial-gradient(circle at 30% 25%, rgba(255,255,255,0.14), rgba(255,255,255,0.03));
        border: 1px solid rgba(255,255,255,0.10);
        box-shadow: inset 0 0 22px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.35);
        text-shadow: 0 0 20px rgba(255,255,255,0.18);
        transform: scale(1);
      }
      .card17-duel-score.rolling {
        animation: card17ScoreRoll 0.18s linear infinite;
      }
      .card17-duel-score.locked {
        animation: card17ScoreLock 0.35s ease-out;
      }
      .card17-duel-score.win {
        box-shadow: inset 0 0 26px rgba(255,255,255,0.08), 0 0 36px rgba(115, 255, 176, 0.42);
      }
      .card17-duel-score.lose {
        box-shadow: inset 0 0 26px rgba(255,255,255,0.06), 0 0 36px rgba(255, 100, 126, 0.34);
      }
      .card17-duel-mid {
        font-size: 36px;
        font-weight: 900;
        color: rgba(255,255,255,0.92);
        text-shadow: 0 0 18px rgba(255,255,255,0.22);
      }
      .card17-duel-status {
        margin-top: 18px;
        min-height: 56px;
        border-radius: 16px;
        padding: 14px 16px;
        text-align: center;
        font-size: 15px;
        line-height: 1.5;
        color: #f3f6ff;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .card17-duel-status.result-win {
        background: rgba(62, 161, 103, 0.14);
        border-color: rgba(115,255,176,0.26);
      }
      .card17-duel-status.result-lose {
        background: rgba(181, 59, 96, 0.16);
        border-color: rgba(255,115,151,0.24);
      }
      .card17-duel-status.result-draw {
        background: rgba(91, 118, 201, 0.16);
        border-color: rgba(122,167,255,0.22);
      }
      .card17-duel-hint {
        margin-top: 10px;
        text-align: center;
        font-size: 12px;
        color: rgba(225, 232, 255, 0.55);
      }
      #card17DuelOverlay.ready {
        cursor: pointer;
      }
      #card17DuelOverlay.ready .card17-duel-panel {
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.58), 0 0 0 1px rgba(140, 190, 255, 0.10), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
      }
      @keyframes card17ScoreRoll {
        0% { transform: translateY(0) scale(1); filter: brightness(0.96); }
        50% { transform: translateY(-2px) scale(1.04); filter: brightness(1.08); }
        100% { transform: translateY(0) scale(1); filter: brightness(0.96); }
      }
      @keyframes card17ScoreLock {
        0% { transform: scale(1.14); }
        100% { transform: scale(1); }
      }
      @media (max-width: 640px) {
        .card17-duel-vs { grid-template-columns: 1fr; }
        .card17-duel-mid { display: none; }
        .card17-duel-side { min-height: 170px; }
      }
    `;
    document.head.appendChild(style);
  }

  function showCard17DuelAnimation(playerScore, dealerScore, result, onDone) {
    ensureCard17AnimStyles();

    const overlay = document.createElement('div');
    overlay.id = 'card17DuelOverlay';

    const panel = document.createElement('div');
    panel.className = 'card17-duel-panel';

    const title = document.createElement('div');
    title.className = 'card17-duel-title';
    title.textContent = '狂賭之冤';

    const sub = document.createElement('div');
    sub.className = 'card17-duel-sub';
    sub.textContent = '分數對決中……';

    const vs = document.createElement('div');
    vs.className = 'card17-duel-vs';

    function makeSide(labelText) {
      const side = document.createElement('div');
      side.className = 'card17-duel-side';
      const label = document.createElement('div');
      label.className = 'card17-duel-label';
      label.textContent = labelText;
      const score = document.createElement('div');
      score.className = 'card17-duel-score rolling';
      score.textContent = '?';
      side.appendChild(label);
      side.appendChild(score);
      return { side, score };
    }

    const player = makeSide('玩家');
    const dealer = makeSide('莊家');
    const mid = document.createElement('div');
    mid.className = 'card17-duel-mid';
    mid.textContent = 'VS';

    vs.appendChild(player.side);
    vs.appendChild(mid);
    vs.appendChild(dealer.side);

    const status = document.createElement('div');
    status.className = 'card17-duel-status';
    status.textContent = '莊家正在擲骰……';

    const hint = document.createElement('div');
    hint.className = 'card17-duel-hint';
    hint.textContent = '結果揭曉中……';

    panel.appendChild(title);
    panel.appendChild(sub);
    panel.appendChild(vs);
    panel.appendChild(status);
    panel.appendChild(hint);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const handles = [];
    let canClose = false;
    const close = () => {
      handles.forEach(id => {
        clearInterval(id);
        clearTimeout(id);
      });
      overlay.removeEventListener('click', onOverlayClick, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof onDone === 'function') onDone();
    };

    function onOverlayClick(e) {
      if (!canClose) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      close();
    }

    overlay.addEventListener('click', onOverlayClick, true);

    const playerRoll = setInterval(() => {
      player.score.textContent = String(Math.floor(Math.random() * 6));
    }, 80);
    const dealerRoll = setInterval(() => {
      dealer.score.textContent = String(Math.floor(Math.random() * 7));
    }, 80);
    handles.push(playerRoll, dealerRoll);

    handles.push(setTimeout(() => {
      clearInterval(playerRoll);
      player.score.classList.remove('rolling');
      player.score.classList.add('locked');
      player.score.textContent = String(playerScore);
      status.textContent = '你的分數已鎖定，等待莊家……';
    }, 650));

    handles.push(setTimeout(() => {
      clearInterval(dealerRoll);
      dealer.score.classList.remove('rolling');
      dealer.score.classList.add('locked');
      dealer.score.textContent = String(dealerScore);

      let resultText = '平手';
      if (result === 'win') resultText = '你贏了';
      else if (result === 'lose') resultText = '你輸了';

      status.classList.add(result === 'win' ? 'result-win' : (result === 'lose' ? 'result-lose' : 'result-draw'));
      status.textContent = `${resultText}！ 玩家 ${playerScore} ： 莊家 ${dealerScore}`;
      sub.textContent = result === 'win'
        ? '莊家比較大，依規則你獲勝。'
        : (result === 'lose' ? '莊家比較小，依規則你失敗。' : '雙方相同，依規則平手。');

      player.score.classList.add(result === 'lose' ? 'lose' : 'win');
      dealer.score.classList.add(result === 'win' ? 'win' : (result === 'lose' ? 'lose' : 'win'));

      canClose = true;
      overlay.classList.add('ready');
      hint.textContent = '點擊任意位置進入結算';
    }, 1350));
  }


  // ==========================
  // 6.5 無效卡片彈窗（卡片消失，三張都失敗則 reset）
  // ==========================
  function showInvalidCardPopup(card) {
    const overlay = document.createElement('div');
    overlay.id = 'cardInvalidOverlay';

    const panel = document.createElement('div');
    panel.className = 'card-invalid-panel';

    const title = document.createElement('div');
    title.className = 'card-invalid-title';
    title.textContent = '卡片無法生效';

    const body = document.createElement('div');
    body.className = 'card-invalid-body';
    const cardName = (card.zh && card.zh.trim()) ? card.zh.trim() : card.id;
    body.textContent = `【${cardName}】試著生效……\n但它失敗了，被惡靈的大手撕個粉碎。`;

    const btn = document.createElement('div');
    btn.className = 'card-invalid-btn';
    btn.textContent = '知道了';

    btn.addEventListener('click', () => {
      document.body.removeChild(overlay);

      if (Array.isArray(currentCards)) {
        currentCards = currentCards.filter(c => c.id !== card.id);
      }

      if (currentCards && currentCards.length > 0) {
        renderCards();
        return;
      }

      // 三張都掛了 → 清空卡片 + reset
      isActive = false;
      dragInfo = null;
      const container = document.getElementById('cardContainer');
      if (container) {
        container.innerHTML = '';
        container.classList.remove('card-visible');
      }
      if (typeof window.resetSlotState === 'function') {
        window.resetSlotState();
      }
    });

    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(btn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  // ==========================
  // 7. 繪製卡片
  // ==========================
  function renderCards() {
    const container = ensureCardContainer();
    container.innerHTML = '';

    currentCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'slot-card';
      cardEl.classList.add('color-' + card.colorType.replace(/_/g, '-'));
      cardEl.setAttribute('draggable', 'true');
      cardEl.dataset.cardId = card.id;

      const header = document.createElement('div');
      header.className = 'slot-card-header';
      const titleText = card.zh && card.zh.trim() ? card.zh : '卡片';
      header.textContent = titleText;

      const summary = document.createElement('div');
      summary.className = 'slot-card-summary';
      summary.textContent = card.runtimeSummary || card.summary || '';

      const footer = document.createElement('div');
      footer.className = 'slot-card-footer';
      footer.textContent = `ID: ${card.id}`;

      cardEl.appendChild(header);
      cardEl.appendChild(summary);
      cardEl.appendChild(footer);

      cardEl.addEventListener('dragstart', (e) => {
        if (!isActive) return;
        dragInfo = { card, el: cardEl };
        e.dataTransfer.effectAllowed = 'move';
      });

      cardEl.addEventListener('dragend', () => {
        dragInfo = null;
        clearDropHighlights();
      });

      container.appendChild(cardEl);

      requestAnimationFrame(() => {
        cardEl.classList.add('show');
      });
    });

    container.classList.add('card-visible');
  }

  // 7.5 動態補上 11 / 23 號卡的殺手名稱
  function decorateCardSummaries() {
    if (!Array.isArray(currentCards)) return;

    currentCards.forEach(card => {
      card.runtimeSummary = card.summary || '';

      // 11 號：當前殺手
      if (card.id === 'card11') {
        const k = currentState && currentState.killerKey;
        if (k && window.KILLERS && window.KILLERS[k]) {
          const killerZh = window.KILLERS[k].zh || k;
          card.runtimeSummary = `${card.runtimeSummary}\n指定殺手：${killerZh}`;
        }
      }

      // 23 號：每次顯示都重新抽選殺手，並顯示一致的 killerKey
      if (card.id === 'card23') {
        if (!card.effect)
          card.effect = { type: 'replace_skill_by_random_killer_3pick', data: {} };
        if (!card.effect.data)
          card.effect.data = {};

        const killerKeys = Object.keys(window.KILLERS || {});
        if (killerKeys.length > 0) {
          // ✔ 每次顯示卡片都抽一位新殺手
          const killerKey = killerKeys[Math.floor(Math.random() * killerKeys.length)];
          card.effect.data.killerKey = killerKey;

          const killerZh = window.KILLERS[killerKey].zh || killerKey;

          // ✔ 調整 runtimeSummary（顯示在卡片上）
          card.runtimeSummary = `${card.summary}\n抽選殺手：${killerZh}`;
        } else {
          // ✔ fallback 避免 runtimeSummary undefined
          card.runtimeSummary = card.summary || '';
        }
      }

    });
  }

  // ==========================
  // 8. 主入口：startCardPhase
  // ==========================
  function startCardPhase(state, options) {
    const settings = window.SlotSettings || {};
    if (settings.cardsEnabled === false) {
      // cards disabled: apply immediately
      try {
        if (options && typeof options.onApplied === 'function') {
          options.onApplied(state || {});
        }
      } catch (e) { }
      return;
    }
    ensureStyles();
    ensureCardContainer();

    currentState = sanitizeAddonState(cloneState(state || {}));
    applyCallback = options && typeof options.onApplied === 'function'
      ? options.onApplied
      : null;
    isActive = true;
    dragInfo = null;
    currentCards = pickThreeCards();

    decorateCardSummaries();  // 先補好敘述
    renderCards();            // 再畫卡
    bindDroppableSlots();
  }

  // ==========================
  // 9. Drop 區綁定
  // ==========================
  let droppableBound = false;

  function bindDroppableSlots() {
    if (droppableBound) return;
    droppableBound = true;

    const board = document.getElementById('slotBoard');
    if (!board) return;

    const cells = Array.from(board.querySelectorAll('.slot-cell'));
    cells.forEach((cell, idx) => {
      cell.dataset.slotIndex = idx;

      cell.addEventListener('dragover', (e) => {
        if (!isActive || !dragInfo) return;
        const card = dragInfo.card;
        if (!card) return;
        if (isCardAllowedOnSlot(card, idx)) {
          e.preventDefault();
          clearDropHighlights();
          cell.classList.add('card-drop-ok');
        }
      });

      cell.addEventListener('dragleave', () => {
        cell.classList.remove('card-drop-ok');
      });

      cell.addEventListener('drop', (e) => {
        if (!isActive || !dragInfo) return;
        e.preventDefault();
        const card = dragInfo.card;
        if (!card) return;
        const slotIndex = idx;
        if (!isCardAllowedOnSlot(card, slotIndex)) {
          clearDropHighlights();
          return;
        }
        applyCardOnSlot(card, slotIndex);
      });
    });
  }

  function clearDropHighlights() {
    const cells = Array.from(document.querySelectorAll('#slotBoard .slot-cell'));
    cells.forEach(c => c.classList.remove('card-drop-ok'));
  }

  function isCardAllowedOnSlot(card, slotIndex) {
    const t = card.target;
    const isAddon = slotIndex === 1 || slotIndex === 2;
    const isPerk = slotIndex >= 3 && slotIndex <= 6;

    if (t === 'any') return true;
    if (t === 'addon') return isAddon;
    if (t === 'perk') return isPerk;
    if (t === 'slot-any') return true;
    if (t === 'slot-perk') return isPerk;
    return false;
  }

  // ==========================
  // 10. 卡片效果實作
  // ==========================
  function applyCardOnSlot(card, slotIndex) {
    const type = card.effect && card.effect.type;
    let ok = true;
    switch (type) {
      case 'none':
        finishCardPhase();
        return;

      case 'reroll_all_including_killer':
        ok = doRerollAllIncludingKiller();
        break;
      case 'reroll_all_except_killer':
        ok = doRerollAllExceptKiller();
        break;
      case 'reroll_addons_all':
        ok = doRerollAddonsAll();
        break;
      case 'reroll_perks_all':
        ok = doRerollPerksAll();
        break;
      case 'reroll_random_perks':
        ok = doRerollRandomPerks((card.effect.data && card.effect.data.count) || 1);
        break;
      case 'reroll_target_perk':
        ok = doRerollTargetPerk(slotIndex);
        break;
      case 'reroll_random_slots_0_6':
        ok = doRerollRandomSlots(card.effect.data && card.effect.data.min, card.effect.data && card.effect.data.max);
        break;

      case 'reroll_slot_choice':
        doRerollSlotChoice(card, slotIndex, (card.effect.data && card.effect.data.choices) || 2);
        return;

      case 'replace_skill_by_current_killer_3pick':
        doReplaceSkillByCurrentKiller3Pick(card, slotIndex);
        return;

      case 'replace_skill_by_random_killer_3pick':
        doReplaceSkillByRandomKiller3Pick(card, slotIndex);
        return;

      case 'replace_skill_by_random_killer':
        ok = doReplaceSkillByRandomKiller(slotIndex);
        break;
      case 'replace_skill_general':
        ok = doReplaceSkillGeneral(slotIndex);
        break;
      case 'replace_skill_general_choice':
        doReplaceSkillGeneralChoice(slotIndex, (card.effect.data && card.effect.data.choices) || 5);
        return;
      case 'replace_addons_by_color':
        ok = doReplaceAddonsByColor(card.effect.data && card.effect.data.colors);
        break;
      case 'card03_addons_sum_7':
        ok = doCard03AddonsSum7();
        break;
      case 'card04_reroll_perks_not_lower_than_slot':
        ok = doCard04RerollPerksNotLowerThanSlot(slotIndex);
        break;
      case 'card05_reroll_three_with_fixed_high_slot':
        ok = doCard05RerollThreeWithFixedHighSlot(slotIndex);
        break;
      case 'card06_double_choice_random_perk_slot':
        doCard06DoubleChoiceRandomPerkSlot(card);
        return;
      case 'upgrade_addons_color':
        ok = doUpgradeAddonsColor(slotIndex, 1, 0);
        break;

      case 'upgrade_addons_color_split':
        ok = doUpgradeAddonsColorSplit(slotIndex, (card.effect.data && card.effect.data.selectedSteps) || 2, (card.effect.data && card.effect.data.otherSteps) || 1);
        break;

      case 'reroll_all_addon_perk':
        ok = doRerollAllAddonPerk();
        break;
      case 'become_wraith_fixed_addons_random_perks':
        ok = doBecomeWraith(card.effect.data);
        break;

      case 'card28_hold10s':
        doCard28Hold10Seconds(card);
        return;

      case 'card29_steal_day_swap':
        doCard29StealDaySwap(card);
        return;

      case 'card30_watch_ad':
        doCard30WatchAd(card);
        return;
      case 'card31_replace_curse':
        ok = doCard31ReplaceCurse(slotIndex);
        break;
      case 'card32_replace_scourge':
        ok = doCard32ReplaceScourge(slotIndex);
        break;
      case 'card33_will_family':
        ok = doCard33WillFamily();
        break;
      case 'card34_wishlist':
        doCard34Wishlist(card, slotIndex);
        return;
      case 'card35_make_choice':
        doCard35MakeChoice(card);
        return;
      case 'card36_equal_score':
        ok = doCard36EqualScore();
        break;
      case 'card37_restart_slot':
        ok = doCard37RestartSlot(card);
        break;
      case 'card38_speed_choice':
        ok = doCard38SpeedChoice(slotIndex);
        if (ok) return;
        break;
      case 'card39_quiz':
        doCard39Quiz();
        return;
      case 'card17_extreme_redistribute':
        ok = doCard17ExtremeRedistribute();
        break;
      case 'card17_score_duel_minigame':
        doCard17ScoreDuelMinigame(card);
        return;
      case 'card18_average_addons':
        ok = doCard18AverageAddons();
        break;
      case 'card20_equalize_all_scores':
        ok = doCard20EqualizeAllScores();
        break;
      case 'card16_all_slots_plus_one_wrap':
        ok = doCard16AllSlotsPlusOneWrap();
        break;
      case 'card19_zero_and_plus_one':
        ok = doCard19ZeroAndPlusOne(slotIndex);
        break;
      case 'reroll_same_score_all':
        ok = doRerollSameScoreAll();
        break;
      case 'keep_selected_reroll_others':
        ok = doKeepSelectedRerollOthers(slotIndex);
        break;
      default:
        console.warn('未知卡片效果:', type);
        ok = false;
        break;
    }

    if (!ok) {

      return;
    }

    // card1：使用後立刻生效，但用全螢幕圖片做結算提示（點任意處關閉）
    if (card && card.id === 'card1') {
      showCard1UseFullscreen(() => finishCardPhase());
      return;
    }

    finishCardPhase();
  }

  // ==========================
  // 10.x card1 全螢幕圖片提示
  // ==========================
  function showFullscreenImage(src, onClose, timeoutMs) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '20000';
    overlay.style.background = 'rgba(0,0,0,0.92)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    let closed = false;
    let t = null;

    function closeOnce() {
      if (closed) return;
      closed = true;
      if (t) clearTimeout(t);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof onClose === 'function') onClose();
    }

    if (typeof timeoutMs === 'number' && timeoutMs > 0) {
      t = setTimeout(closeOnce, timeoutMs);
    }

    overlay.addEventListener('click', closeOnce);
  }

  function showCard1UseFullscreen(onClose) {
    const imgSrc = './images/other/彩蛋1.png';
    showFullscreenImage(imgSrc, onClose);
  }

  function doRerollAllIncludingKiller() {
    const killerKeys = Object.keys(window.KILLERS || {});
    if (killerKeys.length === 0) return false;

    const newKiller = getRandomItem(killerKeys);
    if (!newKiller) return false;

    const addonPool = getAddonNamesForKiller(newKiller);
    if (addonPool.length < 2) return false;

    const shuffledA = shuffle(addonPool);
    const newAddons = shuffledA.slice(0, 2);

    const allPerks = getAllPerksExcept([]);
    if (allPerks.length < 4) return false;
    const shuffledP = shuffle(allPerks);
    const newPerks = shuffledP.slice(0, 4);

    currentState.killerKey = newKiller;
    currentState.addons = newAddons;
    currentState.perks = newPerks;
    return true;
  }

  function doRerollAllExceptKiller() {
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const addonPool = getAddonNamesForKiller(killerKey);
    if (addonPool.length < 2) return false;
    const shuffledA = shuffle(addonPool);
    const newAddons = shuffledA.slice(0, 2);

    const currentPerks = currentState.perks.slice();
    const pool = getAllPerksExcept(currentPerks);
    if (pool.length < 4) return false;
    const shuffledP = shuffle(pool);
    const newPerks = shuffledP.slice(0, 4);

    currentState.addons = newAddons;
    currentState.perks = newPerks;
    return true;
  }

  function doRerollAddonsAll() {
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;
    const addonPool = getAddonNamesForKiller(killerKey);
    if (addonPool.length < 2) return false;

    const current = currentState.addons.slice();
    const pool = getAllAddonsExceptForKiller(killerKey, current);
    if (pool.length < 2) return false;

    const shuffled = shuffle(pool);
    const newAddons = shuffled.slice(0, 2);
    if (newAddons.length !== 2) return false;

    currentState.addons = newAddons;
    return true;
  }

  function doRerollPerksAll() {
    const current = currentState.perks.slice();
    const pool = getAllPerksExcept(current);
    if (pool.length < 4) return false;

    const shuffled = shuffle(pool);
    const newPerks = shuffled.slice(0, 4);
    if (newPerks.length !== 4) return false;

    currentState.perks = newPerks;
    return true;
  }

  function doRerollTargetPerk(slotIndex) {
    if (slotIndex < 3 || slotIndex > 6) return false;
    if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4) {
      return false;
    }

    const perkIdx = slotIndex - 3;
    const originalPerks = currentState.perks.slice();

    const basePool = getAllPerksExcept(originalPerks);
    if (!basePool.length) return false;

    const newPerkName = getRandomItem(basePool);
    if (!newPerkName) return false;

    currentState.perks[perkIdx] = newPerkName;
    return true;
  }

  function doRerollRandomPerks(count) {
    count = Math.max(1, Math.min(4, count || 1));
    const indices = shuffle([0, 1, 2, 3]).slice(0, count);
    const originalPerks = currentState.perks.slice();
    if (originalPerks.length < 4) return false;

    // 全部技能池除去當前四個技能，避免重複與原本技能
    const basePool = getAllPerksExcept(originalPerks);
    if (basePool.length < indices.length) return false;

    const shuffledPool = shuffle(basePool);
    const finalPerks = originalPerks.slice();

    for (let i = 0; i < indices.length; i++) {
      finalPerks[indices[i]] = shuffledPool[i];
    }

    currentState.perks = finalPerks;
    return true;
  }

  function doRerollRandomSlots(min, max) {
    const indices = [1, 2, 3, 4, 5, 6]; // 不動 killer
    const minN = typeof min === 'number' ? min : 0;
    const maxN = typeof max === 'number' ? max : indices.length;
    const n = Math.floor(Math.random() * (maxN - minN + 1)) + minN;

    const chosen = shuffle(indices).slice(0, n);
    const originalPerks = currentState.perks.slice();
    const originalAddons = currentState.addons.slice();
    const finalPerks = originalPerks.slice();
    const finalAddons = originalAddons.slice();
    const killerKey = currentState.killerKey;

    // 事先建立基礎池：配件只從該殺手配件池中挑，排除原本兩個
    const basePerkPool = getAllPerksExcept(originalPerks);
    const baseAddonPool = killerKey
      ? getAddonNamesForKiller(killerKey).filter(name => !originalAddons.includes(name))
      : [];

    for (const slot of chosen) {
      if (slot === 1 || slot === 2) {
        // 配件欄位
        if (!killerKey) return false;
        const idx = slot - 1;

        const pool = baseAddonPool.filter(n => !finalAddons.includes(n));
        if (!pool.length) return false;

        const chosenName = getRandomItem(pool);
        finalAddons[idx] = chosenName;
      } else {
        // 技能欄位
        const idx = slot - 3;

        const pool = basePerkPool.filter(n => !finalPerks.includes(n));
        if (!pool.length) return false;

        const chosenName = getRandomItem(pool);
        finalPerks[idx] = chosenName;
      }
    }

    currentState.perks = finalPerks;
    currentState.addons = finalAddons;
    return true;
  }


  // 17 號卡：兩格變 1 分，其餘變 3/4/5 分（技能 / 配件分開池）
  function doCard17ExtremeRedistribute() {
    if (!currentState) return false;
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const slots = [
      { kind: 'addon', idx: 0 },
      { kind: 'addon', idx: 1 },
      { kind: 'perk', idx: 0 },
      { kind: 'perk', idx: 1 },
      { kind: 'perk', idx: 2 },
      { kind: 'perk', idx: 3 }
    ];

    const shuffledSlots = shuffle(slots);
    const score1Slots = shuffledSlots.slice(0, 2);
    const otherSlots = shuffledSlots.slice(2);

    const perkScore1Pool = getPerkNamesByScores([1]);
    const perk345Pool = getPerkNamesByScores([3, 4, 5]);
    const addonScore1Pool = getAddonNamesByScoresForKiller(killerKey, [1]);
    const addon345Pool = getAddonNamesByScoresForKiller(killerKey, [3, 4, 5]);

    if (!perkScore1Pool.length && score1Slots.some(s => s.kind === 'perk')) return false;
    if (!addonScore1Pool.length && score1Slots.some(s => s.kind === 'addon')) return false;
    if (!perk345Pool.length && otherSlots.some(s => s.kind === 'perk')) return false;
    if (!addon345Pool.length && otherSlots.some(s => s.kind === 'addon')) return false;

    const newPerks = currentState.perks.slice();
    const newAddons = currentState.addons.slice();
    const usedPerks = new Set();
    const usedAddons = new Set();

    // 先處理 1 分欄位
    for (const s of score1Slots) {
      if (s.kind === 'perk') {
        const pool = perkScore1Pool.filter(n => !usedPerks.has(n));
        if (!pool.length) return false;
        const chosen = getRandomItem(pool);
        usedPerks.add(chosen);
        newPerks[s.idx] = chosen;
      } else {
        const pool = addonScore1Pool.filter(n => !usedAddons.has(n));
        if (!pool.length) return false;
        const chosen = getRandomItem(pool);
        usedAddons.add(chosen);
        newAddons[s.idx] = chosen;
      }
    }

    // 再處理 3/4/5 分欄位
    for (const s of otherSlots) {
      if (s.kind === 'perk') {
        const pool = perk345Pool.filter(n => !usedPerks.has(n));
        if (!pool.length) return false;
        const chosen = getRandomItem(pool);
        usedPerks.add(chosen);
        newPerks[s.idx] = chosen;
      } else {
        const pool = addon345Pool.filter(n => !usedAddons.has(n));
        if (!pool.length) return false;
        const chosen = getRandomItem(pool);
        usedAddons.add(chosen);
        newAddons[s.idx] = chosen;
      }
    }

    currentState.perks = newPerks;
    currentState.addons = newAddons;
    return true;
  }

  // 19 號卡：指定技能欄位變 0 分，其餘技能欄位 +1 分重抽
  function doCard19ZeroAndPlusOne(slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) return false;
    if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4) {
      return false;
    }

    const selectedIdx = slotIndex - 3;
    const originalPerks = currentState.perks.slice();
    const newPerks = originalPerks.slice();

    // 先處理 0 分欄位
    const zeroPoolAll = getPerkNamesByScores([0]);
    if (!zeroPoolAll.length) return false;

    // 避免和其他欄位重複
    const usedNames = new Set();
    const zeroChoice = getRandomItem(zeroPoolAll);
    if (!zeroChoice) return false;
    newPerks[selectedIdx] = zeroChoice;
    usedNames.add(zeroChoice);

    // 其他技能欄位：以原分數 +1 的分數重抽（5 分維持抽 5 分）
    for (let i = 0; i < newPerks.length; i++) {
      if (i === selectedIdx) continue;

      const currentName = originalPerks[i];
      const currentScore = getPerkScore(currentName);
      if (currentScore == null) return false;

      // 🔥 修正在這：5 分技能不會 +1（避免變 6 分）
      const targetScore = (currentScore === 5) ? 5 : currentScore + 1;

      const poolAll = getPerkNamesByScores([targetScore]);
      if (!poolAll.length) return false;

      const pool = poolAll.filter(n => !usedNames.has(n));
      if (!pool.length) return false;

      const chosen = getRandomItem(pool);
      newPerks[i] = chosen;
      usedNames.add(chosen);
    }

    currentState.perks = newPerks;
    return true;
  }


  // 35 號卡：做出選擇（A：技能 4-5 / 配件 1-2；B：技能 0-1 / 配件 4-5）
  function doCard35MakeChoice(card) {
    if (!currentState) {

      return;
    }
    const killerKey = currentState.killerKey;
    if (!killerKey) {

      return;
    }

    showBinaryChoiceOverlay({
      title: `Make your choice.`,
      items: [
        {
          key: 'A',
          label: 'A ',
          desc: `技能：全部 4–5 分\n配件：全部 1–2 分`
        },
        {
          key: 'B',
          label: 'B ',
          desc: `技能：全部 0–1 分\n配件：全部 4–5 分`
        }
      ],
      onPick: (key) => {
        const wantPerkScores = (key === 'A') ? [4, 5] : [0, 1];
        const wantAddonScores = (key === 'A') ? [1, 2] : [4, 5];

        const perkPool = getPerkNamesByScores(wantPerkScores);
        const addonPool = getAddonNamesByScoresForKiller(killerKey, wantAddonScores);

        // 需要：4 個技能 + 2 個配件（盡量不重複）
        if (!perkPool || perkPool.length < 4) {

          return;
        }
        if (!addonPool || addonPool.length < 2) {

          return;
        }

        const newPerks = [];
        const perkCandidates = shuffle(perkPool);
        for (const p of perkCandidates) {
          if (!newPerks.includes(p)) newPerks.push(p);
          if (newPerks.length === 4) break;
        }
        if (newPerks.length !== 4) {

          return;
        }

        const newAddons = [];
        const addonCandidates = shuffle(addonPool);
        for (const a of addonCandidates) {
          if (!newAddons.includes(a)) newAddons.push(a);
          if (newAddons.length === 2) break;
        }
        if (newAddons.length !== 2) {

          return;
        }

        currentState.perks = newPerks;
        currentState.addons = newAddons;

        finishCardPhase();
      }
    });
  }





  // 36 號卡：一視同仁（技能 + 配件 全部變成同一個隨機分數 1–5）

  // 37. 殺手皇后：敗者食塵（直接回到拉霸階段）
  function doCard37RestartSlot(card) {
    isActive = false;
    currentCards = [];
    currentState = null;

    const container = document.getElementById('cardContainer');
    if (container) {
      container.innerHTML = '';
      container.classList.remove('card-visible');
    }

    if (typeof window.resetSlotState === 'function') {
      window.resetSlotState();
    }
    return true;
  }

  function doCard36EqualScore() {
    if (!currentState) return false;
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const score = Math.floor(Math.random() * 5) + 1; // 1~5

    const perkPool = getPerkNamesByScores([score]);
    const addonPool = getAddonNamesByScoresForKiller(killerKey, [score]);

    // 需要：4 技能 + 2 配件（盡量不重複）
    if (!perkPool || perkPool.length < 4) return false;
    if (!addonPool || addonPool.length < 2) return false;

    const newPerks = [];
    for (const p of shuffle(perkPool)) {
      if (!newPerks.includes(p)) newPerks.push(p);
      if (newPerks.length === 4) break;
    }
    if (newPerks.length !== 4) return false;

    const newAddons = [];
    for (const a of shuffle(addonPool)) {
      if (!newAddons.includes(a)) newAddons.push(a);
      if (newAddons.length === 2) break;
    }
    if (newAddons.length !== 2) return false;

    currentState.perks = newPerks;
    currentState.addons = newAddons;
    return true;
  }

  // 24 號卡：保持每格分數不變，但全部重抽同分數的技能或配件
  function doRerollSameScoreAll() {
    if (!currentState) return false;
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const newPerks = currentState.perks.slice();
    const newAddons = currentState.addons.slice();

    const usedPerks = new Set();
    const usedAddons = new Set();

    // 先處理配件欄位（slot 1、2）
    for (let i = 0; i < newAddons.length; i++) {
      const oldName = newAddons[i];
      if (!oldName) return false;
      const score = getAddonScore(oldName);
      if (score == null) return false;

      const basePool = getAddonNamesByScoresForKiller(killerKey, [score]);
      if (!basePool.length) return false;

      // 不要抽到原本同一個，且避免與已選中的重複
      const pool = basePool.filter(name => name !== oldName && !usedAddons.has(name));
      if (!pool.length) return false;

      const chosen = getRandomItem(pool);
      newAddons[i] = chosen;
      usedAddons.add(chosen);
    }

    // 再處理技能欄位（slot 3~6）
    for (let i = 0; i < newPerks.length; i++) {
      const oldName = newPerks[i];
      if (!oldName) return false;
      const score = getPerkScore(oldName);
      if (score == null) return false;

      const basePool = getPerkNamesByScores([score]);
      if (!basePool.length) return false;

      const pool = basePool.filter(name => name !== oldName && !usedPerks.has(name));
      if (!pool.length) return false;

      const chosen = getRandomItem(pool);
      newPerks[i] = chosen;
      usedPerks.add(chosen);
    }

    currentState.perks = newPerks;
    currentState.addons = newAddons;
    return true;
  }

  // 25 號卡：固定被選中的欄位，其餘技能與配件欄位全部重抽
  function doKeepSelectedRerollOthers(slotIndex) {
    if (!currentState) return false;
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const newPerks = currentState.perks.slice();
    const newAddons = currentState.addons.slice();

    const isAddonSlot = slotIndex === 1 || slotIndex === 2;
    const isPerkSlot = slotIndex >= 3 && slotIndex <= 6;

    const perkUsed = new Set();
    const addonUsed = new Set();

    if (isPerkSlot) {
      const keepIdx = slotIndex - 3;
      if (newPerks[keepIdx]) {
        perkUsed.add(newPerks[keepIdx]);
      }
    } else if (isAddonSlot) {
      const keepIdx = slotIndex - 1;
      if (newAddons[keepIdx]) {
        addonUsed.add(newAddons[keepIdx]);
      }
    }

    // 重新抽配件（不含保留欄位）
    const allAddons = getAddonNamesForKiller(killerKey);
    for (let i = 0; i < newAddons.length; i++) {
      const globalSlotIndex = i + 1; // addon slotIndex: 1,2
      if (globalSlotIndex === slotIndex) continue;

      const pool = allAddons.filter(name => !addonUsed.has(name));
      if (!pool.length) return false;

      const chosen = getRandomItem(pool);
      newAddons[i] = chosen;
      addonUsed.add(chosen);
    }

    // 重新抽技能（不含保留欄位）
    const allPerks = getAllPerkNames();
    for (let i = 0; i < newPerks.length; i++) {
      const globalSlotIndex = i + 3; // perk slotIndex: 3~6
      if (globalSlotIndex === slotIndex) continue;

      const pool = allPerks.filter(name => !perkUsed.has(name));
      if (!pool.length) return false;

      const chosen = getRandomItem(pool);
      newPerks[i] = chosen;
      perkUsed.add(chosen);
    }

    currentState.perks = newPerks;
    currentState.addons = newAddons;
    return true;
  }


  // 單格重抽（可 2 選 1 或 3 選 1）
  function doRerollSlotChoice(card, slotIndex, choiceCount) {
    const isAddonSlot = slotIndex === 1 || slotIndex === 2;
    const isPerkSlot = slotIndex >= 3 && slotIndex <= 6;

    if (!isAddonSlot && !isPerkSlot) {

      return;
    }

    choiceCount = Math.max(1, Math.min(3, choiceCount || 2));

    if (isAddonSlot) {
      const killerKey = currentState.killerKey;
      if (!killerKey) {

        return;
      }
      const originalAddons = currentState.addons.slice();
      const idx = slotIndex - 1;

      // 從該殺手配件池中，排除目前兩個配件，避免重複
      const basePool = getAddonNamesForKiller(killerKey).filter(
        name => !originalAddons.includes(name)
      );
      if (!basePool.length) {

        return;
      }

      const candidates = shuffle(basePool).slice(0, Math.min(choiceCount, basePool.length));

      if (candidates.length === 1) {
        const addons = originalAddons.slice();
        addons[idx] = candidates[0];
        currentState.addons = addons;
        finishCardPhase();
        return;
      }

      showChoiceOverlay({
        type: 'addon',
        candidates,
        title: '選擇要替換成哪個配件：',
        onPick: (name) => {
          const addons = originalAddons.slice();
          addons[idx] = name;
          currentState.addons = addons;
          finishCardPhase();
        }
      });
    } else if (isPerkSlot) {
      const originalPerks = currentState.perks.slice();
      const idx = slotIndex - 3;

      // 全部技能池除去當前四個技能
      const basePool = getAllPerksExcept(originalPerks);
      if (!basePool.length) {

        return;
      }

      const candidates = shuffle(basePool).slice(0, Math.min(choiceCount, basePool.length));

      if (candidates.length === 1) {
        const perks = originalPerks.slice();
        perks[idx] = candidates[0];
        currentState.perks = perks;
        finishCardPhase();
        return;
      }

      showChoiceOverlay({
        type: 'perk',
        candidates,
        title: '選擇要替換成哪個技能：',
        onPick: (name) => {
          const perks = originalPerks.slice();
          perks[idx] = name;
          currentState.perks = perks;
          finishCardPhase();
        }
      });
    }
  }

  // 11 號：當前殺手 -> 3 技能擇一
  function doReplaceSkillByCurrentKiller3Pick(card, slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) {

      return;
    }
    const idx = slotIndex - 3;
    const killerKey = currentState && currentState.killerKey;
    if (!killerKey) {

      return;
    }

    const candidates = collectPerkCandidatesForKiller(killerKey);
    if (!candidates.length) {

      return;
    }

    showPerkMultiChoice(card, idx, candidates);
  }

  // 23 號：隨機殺手 -> 3 技能擇一
  function doReplaceSkillByRandomKiller3Pick(card, slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) {

      return;
    }
    const idx = slotIndex - 3;

    // ✔ 只使用 decorateCardSummaries() 決定的 killerKey
    const killerKey =
      card.effect &&
      card.effect.data &&
      card.effect.data.killerKey;

    // 若沒有 killerKey（理論上不會發生）→ 直接當作無效卡
    if (!killerKey) {

      return;
    }

    const candidates = collectPerkCandidatesForKiller(killerKey);
    if (!candidates.length) {

      return;
    }

    showPerkMultiChoice(card, idx, candidates);
  }


  // 取得某殺手可用的技能候選（剃除目前 4 技能）
  function collectPerkCandidatesForKiller(killerKey) {
    const perks = currentState && Array.isArray(currentState.perks)
      ? currentState.perks.slice()
      : [];

    const poolAll = Object.entries(window.PERKS || {})
      .filter(([name, p]) => p && p.killer === killerKey)
      .map(([name]) => name);

    if (!poolAll.length) return [];

    const forbidden = new Set(perks);
    const pool = poolAll.filter(name => !forbidden.has(name));
    return pool;
  }

  // 顯示多選一的技能選單（1 / 2 / 3 選一）
  function showPerkMultiChoice(card, perkIndex, allCandidates) {
    const perks = currentState && Array.isArray(currentState.perks)
      ? currentState.perks.slice()
      : [];

    const unique = Array.from(new Set(allCandidates));
    if (!unique.length) {

      return;
    }

    const candidates = shuffle(unique).slice(0, 3);

    if (candidates.length === 1) {
      perks[perkIndex] = candidates[0];
      currentState.perks = perks;
      finishCardPhase();
      return;
    }

    showChoiceOverlay({
      type: 'perk',
      candidates,
      title: '選擇要替換成哪個技能：',
      onPick: (name) => {
        perks[perkIndex] = name;
        currentState.perks = perks;
        finishCardPhase();
      }
    });
  }

  function doReplaceSkillByRandomKiller(slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) return false;
    const idx = slotIndex - 3;

    const perks = currentState.perks.slice();
    const killerKeys = Object.keys(window.KILLERS || {});
    if (!killerKeys.length) return false;
    const k = getRandomItem(killerKeys);

    const poolAll = Object.entries(window.PERKS || {})
      .filter(([name, p]) => p && p.killer === k)
      .map(([name]) => name);

    if (!poolAll.length) return false;

    const currentName = perks[idx];
    const forbidden = new Set(perks);
    forbidden.delete(currentName);

    const pool = poolAll.filter(n => !forbidden.has(n));
    if (!pool.length) return false;

    const chosen = getRandomItem(pool);
    perks[idx] = chosen;
    currentState.perks = perks;
    return true;
  }


  function doReplaceSkillGeneral(slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) return false;
    const idx = slotIndex - 3;

    const perks = currentState.perks.slice();
    const currentName = perks[idx];
    const other = perks.filter((_, i) => i !== idx);
    const poolAll = getGeneralPerkNames();

    if (!poolAll.length) return false;

    let filtered = poolAll.filter(n => !other.includes(n) && n !== currentName);
    if (!filtered.length) filtered = poolAll.filter(n => n !== currentName);
    if (!filtered.length) return false;

    const chosen = getRandomItem(filtered);
    perks[idx] = chosen;
    currentState.perks = perks;
    return true;
  }

  function doReplaceSkillGeneralChoice(slotIndex, choiceCount) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) return;
    const idx = slotIndex - 3;

    const perks = currentState.perks.slice();
    const currentName = perks[idx];
    const other = perks.filter((_, i) => i !== idx);
    let pool = getGeneralPerkNames().filter(n => !other.includes(n) && n !== currentName);
    if (!pool.length) pool = getGeneralPerkNames().filter(n => n !== currentName);
    if (!pool.length) return;

    const candidates = shuffle(pool).slice(0, Math.min(choiceCount || 5, pool.length));
    if (!candidates.length) return;
    if (candidates.length === 1) {
      perks[idx] = candidates[0];
      currentState.perks = perks;
      finishCardPhase();
      return;
    }

    showChoiceOverlay({
      type: 'perk',
      candidates,
      title: '選擇要替換成哪個通用技能：',
      onPick: (name) => {
        const next = currentState.perks.slice();
        next[idx] = name;
        currentState.perks = next;
        finishCardPhase();
      }
    });
  }

  function doCard03AddonsSum7() {
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;
    const addonNames = getAddonNamesForKiller(killerKey);
    if (addonNames.length < 2) return false;

    const pairs = [];
    for (let i = 0; i < addonNames.length; i++) {
      for (let j = i + 1; j < addonNames.length; j++) {
        const a = addonNames[i];
        const b = addonNames[j];
        const sa = getAddonScore(a);
        const sb = getAddonScore(b);
        if (typeof sa !== 'number' || typeof sb !== 'number') continue;
        if (sa + sb === 7) pairs.push([a, b]);
      }
    }
    if (!pairs.length) return false;

    const picked = getRandomItem(pairs);
    if (!picked) return false;
    currentState.addons = picked.slice();
    return true;
  }

  function doCard04RerollPerksNotLowerThanSlot(slotIndex) {
    if (slotIndex < 3 || slotIndex > 6) return false;
    const sourceIdx = slotIndex - 3;
    const sourceName = currentState.perks[sourceIdx];
    const minScore = getPerkScore(sourceName);
    if (typeof minScore !== 'number') return false;

    const pool = Object.entries(window.PERKS || {})
      .filter(([_, p]) => p && typeof p.score === 'number' && p.score >= minScore)
      .map(([name]) => name);
    if (pool.length < 4) return false;

    const chosen = [];
    for (const name of shuffle(pool)) {
      if (!chosen.includes(name)) chosen.push(name);
      if (chosen.length === 4) break;
    }
    if (chosen.length !== 4) return false;

    currentState.perks = chosen;
    return true;
  }

  function doCard05RerollThreeWithFixedHighSlot(slotIndex) {
    if (slotIndex < 3 || slotIndex > 6) return false;
    const fixedIdx = slotIndex - 3;
    const original = currentState.perks.slice();
    if (original.length < 4) return false;

    const otherIndices = [0, 1, 2, 3].filter(i => i !== fixedIdx);
    const randomOther = pickDistinctRandom(otherIndices, 2);
    const targetIndices = [fixedIdx].concat(randomOther);

    const next = original.slice();
    const used = new Set(original.filter((_, i) => !targetIndices.includes(i)));

    let fixedPool = getPerkNamesByScores([4, 5]).filter(name => !used.has(name) && name !== original[fixedIdx]);
    if (!fixedPool.length) fixedPool = getPerkNamesByScores([4, 5]).filter(name => !used.has(name));
    const fixedPick = getRandomItem(fixedPool);
    if (!fixedPick) return false;
    next[fixedIdx] = fixedPick;
    used.add(fixedPick);

    for (const idx of randomOther) {
      let pool = getAllPerksExcept(next.filter((_, i) => i !== idx)).filter(name => !used.has(name));
      if (!pool.length) pool = getAllPerksExcept(next.filter((_, i) => i !== idx));
      const pick = getRandomItem(pool);
      if (!pick) return false;
      next[idx] = pick;
      used.add(pick);
    }

    currentState.perks = next;
    return true;
  }

  function doCard06DoubleChoiceRandomPerkSlot(card) {
    const data = (card && card.effect && card.effect.data) ? card.effect.data : {};
    const rounds = Math.max(1, Math.min(4, data.rounds || 2));
    const choiceCount = Math.max(1, Math.min(5, data.choices || 5));
    const scores = Array.isArray(data.scores) && data.scores.length ? data.scores : [3, 4, 5];
    const availableSlots = shuffle([0, 1, 2, 3]).slice(0, Math.min(rounds, 4));

    const step = (roundIndex) => {
      if (roundIndex >= availableSlots.length) {
        finishCardPhase();
        return;
      }

      const slotIdx = availableSlots[roundIndex];
      const currentPerks = currentState.perks.slice();
      const currentName = currentPerks[slotIdx];
      const other = currentPerks.filter((_, i) => i !== slotIdx);
      let pool = getPerkNamesByScores(scores).filter(name => !other.includes(name) && name !== currentName);
      if (!pool.length) pool = getPerkNamesByScores(scores).filter(name => name !== currentName);
      if (!pool.length) {
        step(roundIndex + 1);
        return;
      }

      const candidates = shuffle(pool).slice(0, Math.min(choiceCount, pool.length));
      const applyPick = (name) => {
        const perks = currentState.perks.slice();
        perks[slotIdx] = name;
        currentState.perks = perks;
        step(roundIndex + 1);
      };

      if (candidates.length === 1) {
        applyPick(candidates[0]);
        return;
      }

      showChoiceOverlay({
        type: 'perk',
        candidates,
        title: `第 ${roundIndex + 1} 次選擇：技能會隨機替換到第 ${slotIdx + 1} 個技能欄位`,
        onPick: applyPick
      });
    };

    step(0);
  }

  function doCard16AllSlotsPlusOneWrap() {
    if (!currentState) return false;
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const addonScores = currentState.addons.map(name => {
      const s = getAddonScore(name);
      return typeof s === 'number' ? ((s + 1) % 6) : null;
    });
    const perkScores = currentState.perks.map(name => {
      const s = getPerkScore(name);
      return typeof s === 'number' ? ((s + 1) % 6) : null;
    });
    if (addonScores.some(s => s == null) || perkScores.some(s => s == null)) return false;

    const newAddons = buildAddonSelectionForScores(killerKey, addonScores, {
      allowDuplicateFallback: false,
      scoreFallbackSequence: (score) => [score]
    });
    const newPerks = buildPerkSelectionForScores(perkScores, {
      allowDuplicateFallback: false,
      scoreFallbackSequence: (score) => [score]
    });
    if (!newAddons || !newPerks) return false;

    currentState.addons = newAddons;
    currentState.perks = newPerks;
    return true;
  }

  function applyScoreToAllNonKillerSlots(score, options) {
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;
    const opts = options || {};

    const addonScore = getFallbackScoreSequence(score, { addOneFirst: opts.addOneFirst !== false })
      .find(s => getAddonNamesByScoresForKiller(killerKey, [s]).length > 0);
    const perkScore = getFallbackScoreSequence(score, { addOneFirst: opts.addOneFirst !== false })
      .find(s => getPerkNamesByScores([s]).length > 0);
    if (addonScore == null || perkScore == null) return false;

    const newAddons = buildAddonSelectionForScores(killerKey, [addonScore, addonScore], {
      allowDuplicateFallback: false,
      scoreFallbackSequence: (s) => [s]
    });
    const newPerks = buildPerkSelectionForScores([perkScore, perkScore, perkScore, perkScore], {
      allowDuplicateFallback: false,
      scoreFallbackSequence: (s) => [s]
    });
    if (!newAddons || !newPerks) return false;

    currentState.addons = newAddons;
    currentState.perks = newPerks;
    return true;
  }

function applyScoreToRandomNonKillerSlots(score, count, options) {
  if (!currentState || !currentState.killerKey) return false;
  const opts = options || {};
  const slotOrder = shuffle([1, 2, 3, 4, 5, 6]);
  let applied = 0;

  for (const slot of slotOrder) {
    let ok = false;
    if (slot === 1 || slot === 2) {
      ok = rerollAddonSlotByScore(slot - 1, getFallbackScoreSequence(score, {
        addOneFirst: opts.addOneFirst !== false
      }), {
        allowDuplicateFallback: false,
        allowKeepSameName: true
      });
    } else {
      ok = rerollPerkSlotByScore(slot - 3, getFallbackScoreSequence(score, {
        addOneFirst: opts.addOneFirst !== false
      }), {
        allowDuplicateFallback: true,
        allowKeepSameName: true
      });
    }

    if (ok) {
      applied += 1;
      if (applied >= count) return true;
    }
  }

  return applied > 0;
}

function applyCard17WinReward(score) {
  if (!currentState || !currentState.killerKey) return false;

  const addonSequence = [];
  if (typeof score === 'number' && score >= 0 && score <= 5) addonSequence.push(score);
  if (!addonSequence.includes(1)) addonSequence.push(1);
  if (!addonSequence.includes(2)) addonSequence.push(2);
  for (const s of getFallbackScoreSequence(score, { addOneFirst: true })) {
    if (!addonSequence.includes(s)) addonSequence.push(s);
  }

  const perkSequence = getFallbackScoreSequence(score, { addOneFirst: true });

  let applied = 0;

  for (let i = 0; i < 2; i++) {
    const ok = rerollAddonSlotByScore(i, addonSequence, {
      allowDuplicateFallback: false,
      allowKeepSameName: true
    });
    if (!ok) return false;
    applied += 1;
  }

  for (let i = 0; i < 4; i++) {
    const ok = rerollPerkSlotByScore(i, perkSequence, {
      allowDuplicateFallback: true,
      allowKeepSameName: true
    });
    if (!ok) return false;
    applied += 1;
  }

  return applied === 6;
}

function clampCard39Score(isAddon, score) {
  if (typeof score !== 'number') return isAddon ? 1 : 0;
  if (isAddon) return Math.max(1, Math.min(5, score));
  return Math.max(0, Math.min(5, score));
}


function getCard39SlotElement(slotIndex) {
  const cells = Array.from(document.querySelectorAll('.slot-cell'));
  if (!cells.length) return null;
  return cells[slotIndex] || null;
}

function showCard39BigText(text, color) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:100020;pointer-events:none;';
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    color:${color || '#fff'};
    font-size:min(72px,14vw);
    font-weight:900;
    letter-spacing:0.08em;
    text-shadow:0 0 24px rgba(0,0,0,0.85),0 0 12px ${color || '#fff'};
    opacity:0;
    transform:scale(0.82);
    transition:all 0.22s ease-out;
  `;
  overlay.appendChild(el);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'scale(1.18)';
  }, 560);
  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 860);
}

function showCard39FloatingDelta(slotIndex, delta) {
  const host = getCard39SlotElement(slotIndex);
  if (!host) return;
  if (!host.style.position) host.style.position = 'relative';

  const float = document.createElement('div');
  float.textContent = delta > 0 ? `+${delta}` : `${delta}`;
  float.style.cssText = `
    position:absolute;
    left:50%;
    top:50%;
    transform:translate(-50%, -50%);
    color:${delta > 0 ? '#5bff9b' : '#ff6d6d'};
    font-size:28px;
    font-weight:900;
    text-shadow:0 0 10px rgba(0,0,0,0.85);
    pointer-events:none;
    z-index:40;
    opacity:1;
    transition:transform 0.62s ease, opacity 0.62s ease;
  `;
  host.appendChild(float);
  requestAnimationFrame(() => {
    float.style.transform = 'translate(-50%, -110%)';
    float.style.opacity = '0';
  });
  setTimeout(() => {
    if (float.parentNode) float.parentNode.removeChild(float);
  }, 700);
}

function showCard39AnswerReveal(question, result, onClose) {
  const title = result && result.correct ? '✔ 正確！' : (result && result.timedOut ? 'TIME UP' : '✖ 錯誤！');
  const lines = [
    question && question.question ? question.question : '題目讀取失敗',
    '',
    `正解：${question && question.answer ? question.answer : '未知'}`
  ];
  if (question && question.note) lines.push(`註釋：${question.note}`);
  showInfoPopup(title, lines.join('\n'), onClose);
}

function getCard39SlotMeta(slotIndex) {
  if (slotIndex === 1 || slotIndex === 2) {
    const addonIdx = slotIndex - 1;
    const addonName = currentState && currentState.addons ? currentState.addons[addonIdx] : null;
    return {
      slotIndex,
      isAddon: true,
      label: `配件 ${addonIdx + 1}`,
      name: addonName,
      zh: addonName ? (getAddonZh(addonName) || addonName) : '未知配件',
      score: addonName ? getAddonScore(addonName) : null
    };
  }
  if (slotIndex >= 3 && slotIndex <= 6) {
    const perkIdx = slotIndex - 3;
    const perkName = currentState && currentState.perks ? currentState.perks[perkIdx] : null;
    return {
      slotIndex,
      isAddon: false,
      label: `技能 ${perkIdx + 1}`,
      name: perkName,
      zh: perkName ? (getPerkZh(perkName) || perkName) : '未知技能',
      score: perkName ? getPerkScore(perkName) : null
    };
  }
  return null;
}

function applyCard39DeltaToSlot(slotIndex, delta) {
  const meta = getCard39SlotMeta(slotIndex);
  if (!meta || typeof meta.score !== 'number') return false;

  const targetScore = clampCard39Score(meta.isAddon, meta.score + delta);

  if (meta.isAddon) {
    let scoreSequence = [targetScore];

    // 39 號卡的簡單保護：
    // 若配件扣到 1 分，但該殺手沒有 1 分配件，就直接改試 2 分
    if (targetScore === 1) {
      const hasScore1 = getAddonNamesByScoresForKiller(currentState && currentState.killerKey, [1]).length > 0;
      if (!hasScore1) scoreSequence = [2];
    }

    return rerollAddonSlotByScore(slotIndex - 1, scoreSequence, {
      allowDuplicateFallback: false,
      allowKeepSameName: true
    });
  }

  return rerollPerkSlotByScore(slotIndex - 3, [targetScore], {
    allowDuplicateFallback: true,
    allowKeepSameName: true
  });
}

function showCard39SlotPicker(onDone) {
  const slots = [1, 2, 3, 4, 5, 6].map(getCard39SlotMeta).filter(Boolean);
  const selected = [];

  const overlay = document.createElement('div');
  overlay.id = 'card39SlotPickerOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;z-index:100004;';

  const panel = document.createElement('div');
  panel.style.cssText = 'width:min(760px,calc(100vw - 24px));background:linear-gradient(180deg,#1c202c,#141823);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,0.5);';

  const title = document.createElement('div');
  title.textContent = '選擇兩個欄位';
  title.style.cssText = 'font-size:20px;font-weight:800;margin-bottom:6px;color:#fff;';

  const sub = document.createElement('div');
  sub.textContent = '請選兩個非殺手欄位，再按同一格可取消。';
  sub.style.cssText = 'font-size:13px;color:#bfc7da;margin-bottom:14px;';

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;';

  function setSelectedStyle(btn, on) {
    btn.style.borderColor = on ? '#ffd36e' : 'rgba(255,255,255,0.1)';
    btn.style.boxShadow = on ? '0 0 0 1px rgba(255,211,110,0.55)' : 'none';
    btn.style.background = on ? '#2b3344' : '#202633';
  }

  slots.forEach((meta) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText = 'padding:12px 10px;border-radius:12px;background:#202633;border:1px solid rgba(255,255,255,0.1);color:#fff;text-align:left;min-height:96px;';
    btn.innerHTML = `
      <div style="font-size:13px;color:#9fb0d6;margin-bottom:6px;">${meta.label}</div>
      <div style="font-size:15px;font-weight:700;line-height:1.45;">${meta.zh || meta.name || '未知'}</div>
      <div style="font-size:12px;color:#c8d0e5;margin-top:6px;">目前分數：${meta.score ?? '?'}</div>
    `;
    setSelectedStyle(btn, false);

    btn.addEventListener('click', () => {
      const idx = selected.indexOf(meta.slotIndex);
      if (idx !== -1) {
        selected.splice(idx, 1);
        setSelectedStyle(btn, false);
        return;
      }
      if (selected.length >= 2) return;
      selected.push(meta.slotIndex);
      setSelectedStyle(btn, true);

      if (selected.length >= 2) {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (typeof onDone === 'function') onDone(selected.slice(0, 2));
      }
    });

    grid.appendChild(btn);
  });

  panel.appendChild(title);
  panel.appendChild(sub);
  panel.appendChild(grid);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  return true;
}

function showCard39QuizOverlay(questionData, onAnswer, timeoutMs) {
  const q = questionData || {};
  const limitMs = typeof timeoutMs === 'number' ? timeoutMs : 5000;
  let done = false;
  let remain = Math.ceil(limitMs / 1000);

  const overlay = document.createElement('div');
  overlay.id = 'card39QuizOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:100005;';

  const panel = document.createElement('div');
  panel.style.cssText = 'width:min(760px,calc(100vw - 24px));background:linear-gradient(180deg,#1c202c,#141823);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,0.5);';

  const title = document.createElement('div');
  title.textContent = '快問快答';
  title.style.cssText = 'font-size:20px;font-weight:800;margin-bottom:6px;color:#fff;';

  const timerEl = document.createElement('div');
  timerEl.textContent = `剩餘時間：${remain} 秒`;
  timerEl.style.cssText = 'font-size:13px;color:#ffd36e;margin-bottom:8px;';

  const barWrap = document.createElement('div');
  barWrap.style.cssText = 'width:100%;height:10px;background:rgba(255,255,255,0.10);border-radius:999px;overflow:hidden;margin:0 0 14px 0;border:1px solid rgba(255,255,255,0.06);';

  const bar = document.createElement('div');
  bar.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#6effa2,#ffd36e);transition:width 0.08s linear;';
  barWrap.appendChild(bar);

  const questionEl = document.createElement('div');
  questionEl.textContent = q.question || '題目讀取失敗';
  questionEl.style.cssText = 'font-size:16px;font-weight:700;line-height:1.6;color:#fff;margin-bottom:14px;white-space:pre-wrap;';

  const actions = document.createElement('div');
  actions.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;';

  const startAt = Date.now();

  function finish(payload) {
    if (done) return;
    done = true;
    clearInterval(secondTimerId);
    clearInterval(progressTimerId);
    clearTimeout(timeoutId);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (typeof onAnswer === 'function') onAnswer(payload);
  }

  const choices = Array.isArray(q.options) && q.options.length
    ? q.options.map(opt => ({
        value: opt.label,
        label: `${opt.label}. ${opt.text}`,
        raw: opt
      }))
    : [
        { value: '是', label: '是' },
        { value: '否', label: '否' }
      ];

  choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText = 'padding:12px 10px;border-radius:12px;background:#202633;border:1px solid rgba(255,255,255,0.1);color:#fff;text-align:left;font-size:14px;line-height:1.5;';
    btn.textContent = choice.label;
    btn.addEventListener('click', () => {
      const normalizedUser = normalizeCard39AnswerToken(choice.value);
      const normalizedAnswer = normalizeCard39AnswerToken(q.answer);
      const correctByLabel = normalizedUser === normalizedAnswer;
      const correctByText = choice.raw && normalizeCard39AnswerToken(choice.raw.text) === normalizedAnswer;
      finish({
        correct: !!(correctByLabel || correctByText),
        timedOut: false,
        question: q
      });
    });
    actions.appendChild(btn);
  });

  const timeoutId = setTimeout(() => {
    timerEl.textContent = 'TIME UP';
    timerEl.style.color = '#ff6d6d';
    bar.style.width = '0%';
    bar.style.background = 'linear-gradient(90deg,#ff7b7b,#ff3b3b)';
    setTimeout(() => finish({ correct: false, timedOut: true, question: q }), 260);
  }, limitMs);

  const secondTimerId = setInterval(() => {
    remain -= 1;
    if (remain < 0) remain = 0;
    timerEl.textContent = `剩餘時間：${remain} 秒`;
    if (remain <= 1) timerEl.style.color = '#ff6d6d';
  }, 1000);

  const progressTimerId = setInterval(() => {
    const elapsed = Date.now() - startAt;
    const ratio = Math.max(0, 1 - (elapsed / limitMs));
    bar.style.width = `${ratio * 100}%`;
    if (ratio <= 0.2) bar.style.background = 'linear-gradient(90deg,#ffae66,#ff4d4d)';
    if (ratio <= 0) clearInterval(progressTimerId);
  }, 50);

  panel.appendChild(title);
  panel.appendChild(timerEl);
  panel.appendChild(barWrap);
  panel.appendChild(questionEl);
  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  return true;
}

function doCard39Quiz() {
  if (!currentState) return;

  showCard39SlotPicker((selectedSlots) => {
    const question = getRandomItem(CARD39_QUIZ_DATA);
    if (!question) {
      showInfoPopup('快問快答', '題庫是空的。', () => finishCardPhase());
      return;
    }

    showCard39QuizOverlay(question, (result) => {
      const delta = result && result.correct ? 2 : -1;

      if (result && result.correct) {
        showCard39BigText('CORRECT', '#5bff9b');
      } else if (result && result.timedOut) {
        showCard39BigText('TIME UP', '#ff5e5e');
      } else {
        showCard39BigText('WRONG', '#ff5e5e');
      }

      setTimeout(() => {
        showCard39AnswerReveal(question, result, () => {
          selectedSlots.forEach((slotIndex) => {
            applyCard39DeltaToSlot(slotIndex, delta);
            showCard39FloatingDelta(slotIndex, delta);
          });
          setTimeout(() => finishCardPhase(), 720);
        });
      }, 650);
    }, 5000);
  });
}

function doCard38SpeedChoice(slotIndex) {
  const isPerk = slotIndex >= 3 && slotIndex <= 6;
  if (!isPerk || !currentState || !Array.isArray(currentState.perks)) return false;

  const preferredPerkIdx = slotIndex - 3;
  const allPerkIdxs = [0, 1, 2, 3];
  const roundOrder = [preferredPerkIdx].concat(allPerkIdxs.filter(i => i !== preferredPerkIdx));

  function autoFillRemainingLowScore(startRoundIdx) {
    for (let i = startRoundIdx; i < roundOrder.length; i++) {
      const perkIdx = roundOrder[i];
      const currentName = currentState.perks[perkIdx] || null;
      const lockedPerks = currentState.perks.filter((name, idx) => idx !== perkIdx && !!name);
      const pool = getPerkNamesByScores([0, 1, 2]).filter(name =>
        name !== currentName && !lockedPerks.includes(name)
      );
      const chosen = getRandomItem(pool);
      if (chosen) currentState.perks[perkIdx] = chosen;
    }
    finishCardPhase();
  }

  function showTimeoutConfirm(startRoundIdx) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;z-index:100010;';
    const box = document.createElement('div');
    box.style.cssText = 'padding:20px 24px;border-radius:18px;background:rgba(22,14,18,0.96);border:1px solid rgba(255,80,80,0.25);box-shadow:0 24px 60px rgba(0,0,0,0.55);';
    box.innerHTML = '<div style="font-size:min(64px,13vw);font-weight:900;color:#ff4d4d;letter-spacing:0.08em;text-shadow:0 0 20px rgba(255,0,0,0.35);">已超時</div><div style="text-align:center;color:#ffb0b0;margin-top:10px;font-size:14px;">點擊任意位置後，剩餘未選技能將自動補成 0–2 分</div>';
    overlay.appendChild(box);
    overlay.addEventListener('click', () => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      autoFillRemainingLowScore(startRoundIdx);
    }, { once: true });
    document.body.appendChild(overlay);
  }

  function runRound(roundIdx) {
    if (roundIdx >= roundOrder.length) {
      finishCardPhase();
      return;
    }

    const perkIdx = roundOrder[roundIdx];
    const currentName = currentState.perks[perkIdx] || null;
    const lockedPerks = currentState.perks.filter((name, idx) => idx !== perkIdx && !!name);

    const highPoolBase = getPerkNamesByScores([3, 4, 5]).filter(name =>
      name !== currentName && !lockedPerks.includes(name)
    );

    const currentChoices = pickDistinctRandom(highPoolBase, 4);
    if (!currentChoices.length) {
      runRound(roundIdx + 1);
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'card38SpeedChoiceOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:100003;';

    const panel = document.createElement('div');
    panel.style.cssText = 'width:min(920px,calc(100vw - 24px));background:linear-gradient(180deg,#1c202c,#141823);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,0.5);';

    const title = document.createElement('div');
    title.textContent = `第 ${roundIdx + 1} / 4 輪：3 秒內選 1 個技能`;
    title.style.cssText = 'font-size:20px;font-weight:800;margin-bottom:6px;color:#fff;';

    const timerEl = document.createElement('div');
    timerEl.style.cssText = 'font-size:13px;color:#ffd36e;margin-bottom:8px;';
    timerEl.textContent = '剩餘時間：3 秒';

    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'width:100%;height:10px;background:rgba(255,255,255,0.10);border-radius:999px;overflow:hidden;margin:0 0 14px 0;border:1px solid rgba(255,255,255,0.06);';

    const bar = document.createElement('div');
    bar.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#6effa2,#ffd36e);transition:width 0.08s linear;';
    barWrap.appendChild(bar);

    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:13px;color:#c8d0e5;margin-bottom:14px;';
    hint.textContent = '3 秒內從 3–5 分技能中選 1 個；超時則剩下未選欄位會由系統補成 0–2 分。';

    const slotHint = document.createElement('div');
    slotHint.style.cssText = 'font-size:12px;color:#8fa3cf;margin-bottom:14px;';
    slotHint.textContent = `本輪替換技能欄位：${perkIdx + 1}`;

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;';

    let done = false;
    let remain = 3;
    let progressTimerId = null;
    let secondTimerId = null;
    let timeoutId = null;

    function cleanup() {
      if (progressTimerId) clearInterval(progressTimerId);
      if (secondTimerId) clearInterval(secondTimerId);
      if (timeoutId) clearTimeout(timeoutId);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function applyChoice(name) {
      if (done) return;
      done = true;
      cleanup();
      currentState.perks[perkIdx] = name;
      runRound(roundIdx + 1);
    }

    currentChoices.forEach((name) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'padding:10px;border-radius:12px;background:#202633;border:1px solid rgba(255,255,255,0.1);color:#fff;text-align:left;min-height:132px;';
      const zh = getPerkZh(name) || name;
      const score = getPerkScore(name);
      const img = getPerkImg(name);
      btn.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          <div style="width:54px;height:54px;border-radius:10px;background:#0e121d;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
            ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:contain;">` : ''}
          </div>
          <div style="min-width:0;">
            <div style="font-size:14px;font-weight:700;line-height:1.4;">${zh}</div>
            <div style="font-size:12px;color:#9fb0d6;margin-top:4px;">分數：${typeof score === 'number' ? score : '?'}</div>
          </div>
        </div>
      `;
      btn.addEventListener('click', () => applyChoice(name));
      grid.appendChild(btn);
    });

    const startedAt = Date.now();
    secondTimerId = setInterval(() => {
      remain -= 1;
      if (remain < 0) remain = 0;
      timerEl.textContent = `剩餘時間：${remain} 秒`;
      if (remain <= 1) timerEl.style.color = '#ff6d6d';
    }, 1000);

    progressTimerId = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.max(0, 1 - (elapsed / 3000));
      bar.style.width = `${ratio * 100}%`;
      if (ratio <= 0.2) bar.style.background = 'linear-gradient(90deg,#ffae66,#ff4d4d)';
      if (ratio <= 0) clearInterval(progressTimerId);
    }, 50);

    timeoutId = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      showTimeoutConfirm(roundIdx);
    }, 3000);

    panel.appendChild(title);
    panel.appendChild(timerEl);
    panel.appendChild(barWrap);
    panel.appendChild(hint);
    panel.appendChild(slotHint);
    panel.appendChild(grid);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  runRound(0);
  return true;
}

function doCard17LosePenalty() {
  const slotOrder = shuffle([1, 2, 3, 4, 5, 6]);
  let applied = 0;

  for (const slot of slotOrder) {
    let ok = false;

    if (slot === 1 || slot === 2) {
      const preferredScore = Math.random() < 0.5 ? 0 : 1;
      const fallbackScore = preferredScore === 0 ? 1 : 0;
      ok = rerollAddonSlotByScore(slot - 1, [preferredScore, fallbackScore], {
        allowDuplicateFallback: false,
        allowKeepSameName: true
      });
    } else {
      ok = rerollPerkSlotByScore(slot - 3, [0, 1], {
        allowDuplicateFallback: true,
        allowKeepSameName: true
      });
    }

    if (ok) {
      applied += 1;
      if (applied >= 3) return true;
    }
  }

  return applied > 0;
}

function doCard17ScoreDuelMinigame() {
  if (!currentState) return;

  showCard17ScoreChoiceOverlay({
    title: '選擇你的分數（0–5）',
    values: [0, 1, 2, 3, 4, 5],
    ruleLines: [
      '勝利：6 個欄位變為該分數重抽（若配件沒有 0 分，會自動改試 1 分，再不行試 2 分）',
      '失敗：隨機 3 個欄位變為 0–1 分重抽',
      '平手：隨機 4 個欄位變為該分數重抽'
    ],
    onPick: (playerScore) => {
      const dealerScore = Math.floor(Math.random() * 7);
      let result = 'draw';
      if (dealerScore > playerScore) result = 'win';
      else if (dealerScore < playerScore) result = 'lose';

      let ok = false;
      if (result === 'win') ok = applyCard17WinReward(playerScore);
      else if (result === 'draw') ok = applyScoreToRandomNonKillerSlots(playerScore, 4, { addOneFirst: false });
      else ok = doCard17LosePenalty();

      const title = result === 'win' ? '你贏了' : (result === 'lose' ? '你輸了' : '平手');
      const bodyLines = [
        `玩家分數：${playerScore}`,
        `莊家分數：${dealerScore}`,
        result === 'win'
          ? '莊家比較大，依規則你獲勝。6 個非殺手欄位已重抽，配件若沒有 0 分會自動改試 1 分，再不行試 2 分。'
          : (result === 'lose'
            ? '莊家比較小，依規則你失敗。系統已盡量讓隨機 3 欄變為 0–1 分重抽。'
            : '分數相同，依規則平手。隨機 4 個非殺手欄位已依該分數重抽。')
      ];

      showInfoPopup(title, bodyLines.join('\n'), () => {
        if (ok) finishCardPhase();
      });
    }
  });
}

  function doCard18AverageAddons() {
    const killerKey = currentState.killerKey;
    if (!killerKey || !currentState.addons || currentState.addons.length < 2) return false;
    const s1 = getAddonScore(currentState.addons[0]);
    const s2 = getAddonScore(currentState.addons[1]);
    if (typeof s1 !== 'number' || typeof s2 !== 'number') return false;

    const targetScore = Math.floor((s1 + s2 + 2) / 2);
    const newAddons = buildAddonSelectionForScores(killerKey, [targetScore, targetScore], {
      allowDuplicateFallback: false,
      scoreFallbackSequence: () => [targetScore, targetScore - 1]
    });
    if (!newAddons) return false;

    currentState.addons = newAddons;
    return true;
  }

  function doCard20EqualizeAllScores() {
    const scores = currentState.addons.map(getAddonScore).concat(currentState.perks.map(getPerkScore));
    if (scores.some(s => typeof s !== 'number')) return false;
    const avg = Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
    return applyScoreToAllNonKillerSlots(avg, { addOneFirst: false });
  }

  function doReplaceAddonsByColor(colors) {
    const killerKey = currentState.killerKey;
    if (!killerKey || !colors || !colors.length) return false;

    const used = currentState.addons.slice();
    const results = [];

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      const pool = getAddonsByAliasForKiller(killerKey, color, used.concat(results));
      if (!pool.length) return false;
      const chosen = getRandomItem(pool);
      results.push(chosen);
    }

    if (results.length < 2) return false;

    const addons = currentState.addons.slice();
    for (let i = 0; i < 2; i++) {
      if (results[i]) {
        addons[i] = results[i];
      }
    }
    currentState.addons = addons;
    return true;
  }


  // 配件顏色提升：白->綠->藍->紫->紅->白（循環）
  // - card26：只提升「被選擇的配件」(selectedSteps=1, otherSteps=0)
  // - card27：選擇的配件 +2，另一個 +1
  function doUpgradeAddonsColor(slotIndex, selectedSteps, otherSteps) {
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    // 只允許配件格（slotIndex 1 / 2）
    if (slotIndex !== 1 && slotIndex !== 2) return false;

    const cycle = ['白配', '綠配', '藍配', '紫配', '紅配'];

    const getAddonColor = (addonName) => {
      const a = window.ADDONS && window.ADDONS[addonName];
      const aliases = (a && a.aliases) || [];
      for (const c of cycle) {
        if (aliases.includes(c)) return c;
      }
      return null;
    };

    const advanceColor = (color, steps) => {
      const idx = cycle.indexOf(color);
      if (idx === -1) return null;
      const s = ((steps % cycle.length) + cycle.length) % cycle.length;
      return cycle[(idx + s) % cycle.length];
    };

    const upgradeOne = (addonName, steps, excludeNames) => {
      if (!addonName || !steps) return addonName;

      const curColor = getAddonColor(addonName);
      if (!curColor) return addonName;

      const targetColor = advanceColor(curColor, steps);
      if (!targetColor) return addonName;

      const pool = getAddonsByAliasForKiller(killerKey, targetColor, excludeNames);
      if (!pool.length) return addonName;

      return getRandomItem(pool) || addonName;
    };

    const original = (currentState.addons || []).slice(0, 2);
    const results = original.slice();

    const selectedIdx = slotIndex - 1;
    const otherIdx = selectedIdx === 0 ? 1 : 0;

    // 先處理選中的那格（避免抽到原本兩個 + 另一格目前內容）
    const excludeForSelected = original.slice(); // 排除原本兩個
    results[selectedIdx] = upgradeOne(original[selectedIdx], selectedSteps, excludeForSelected);

    // 再處理另一格（若 otherSteps=0 就不動）
    if (otherSteps && otherSteps !== 0) {
      const excludeForOther = original.concat([results[selectedIdx]]);
      results[otherIdx] = upgradeOne(original[otherIdx], otherSteps, excludeForOther);
    }

    // 最終保底
    currentState.addons = [
      results[0] || original[0] || null,
      results[1] || original[1] || null
    ];
    return true;
  }

  function doUpgradeAddonsColorSplit(slotIndex, selectedSteps, otherSteps) {
    return doUpgradeAddonsColor(slotIndex, selectedSteps, otherSteps);
  }

  function doRerollAllAddonPerk() {
    const killerKey = currentState.killerKey;
    if (!killerKey) return false;

    const addonPool = getAddonNamesForKiller(killerKey);
    if (addonPool.length < 2) return false;
    const shuffledA = shuffle(addonPool);
    const newAddons = shuffledA.slice(0, 2);

    const currentPerks = currentState.perks.slice();
    const pool = getAllPerksExcept(currentPerks);
    if (pool.length < 4) return false;
    const shuffledP = shuffle(pool);
    const newPerks = shuffledP.slice(0, 4);

    currentState.addons = newAddons;
    currentState.perks = newPerks;
    return true;
  }

  function doBecomeWraith(data) {
    const killerKey = (data && data.killerKey) || 'The Wraith';
    const addonNames = (data && data.addons) || ['Windstorm - Blood', 'Bone Clapper'];

    const addonsPool = getAddonNamesForKiller(killerKey);
    if (addonsPool.length < 2) return false;

    const fixedAddons = [];
    addonNames.forEach(n => {
      if (addonsPool.includes(n) && !fixedAddons.includes(n)) {
        fixedAddons.push(n);
      }
    });

    let poolA = addonsPool.filter(n => !fixedAddons.includes(n));
    while (fixedAddons.length < 2 && poolA.length) {
      const n = getRandomItem(poolA);
      fixedAddons.push(n);
      poolA = poolA.filter(x => x !== n);
    }
    if (fixedAddons.length < 2) return false;

    const current = currentState.perks.slice();
    const pool = getAllPerksExcept(current);
    if (pool.length < 4) return false;
    const shuffled = shuffle(pool);
    const newPerks = shuffled.slice(0, 4);

    currentState.killerKey = killerKey;
    currentState.addons = fixedAddons.slice(0, 2);
    currentState.perks = newPerks;
    return true;
  }

  // ==========================
  // 11. 結束卡片階段
  // ==========================

  // 28 號：幫撐十秒（強制指定技能組 + 全螢幕圖片，點任意處關閉或 10.22 秒自動關）
  function doCard28Hold10Seconds(card) {
    if (!currentState) return;

    const data = (card && card.effect && card.effect.data) ? card.effect.data : {};
    const timeoutMs = typeof data.timeoutMs === 'number' ? data.timeoutMs : 10220;
    const imgSrc = data.image || './images/cards/card28_hold10s.gif';

    const perkSetsZh = Array.isArray(data.perkSetsZh) ? data.perkSetsZh : [];
    if (!perkSetsZh.length) {

      return;
    }

    // ✅ 立刻生效：先把技能組改掉
    const pickedSetZh = getRandomItem(perkSetsZh) || [];
    const forced = [];

    pickedSetZh.forEach(zhName => {
      const key = findPerkKeyByZh(zhName);
      if (key && !forced.includes(key)) forced.push(key);
    });

    // 強制清單如果因為名稱對不上而變空 → 當作無效卡
    if (!forced.length) {

      return;
    }

    // 補滿 4 格（避免 UI/流程怪掉）
    const need = Math.max(0, 4 - forced.length);
    if (need > 0) {
      const restPool = getAllPerksExcept(forced);
      const extra = shuffle(restPool).slice(0, need);
      currentState.perks = forced.concat(extra);
    } else {
      currentState.perks = forced.slice(0, 4);
    }



    // ✅ 同時把配件改成兩個藍配（抽不到兩個藍配就當作無效卡）
    if (currentState && currentState.killerKey) {
      const okAddons = doReplaceAddonsByColor(['藍配', '藍配']);
      if (!okAddons) {

        return;
      }
    } else {

      return;
    }
    // ✅ 全螢幕圖片（GIF 可以；就是一張 <img>）
    // 關閉後才結束卡片階段，避免直接把卡片階段收掉看不到過場
    showFullscreenImage(imgSrc, () => {
      finishCardPhase();
    }, timeoutMs);
  }
  // 29 號：偷天換日（指定殺手 + 其餘重抽；技能不會抽到 5 分）
  function doCard29StealDaySwap(card) {
    if (!currentState) return;

    const data = (card && card.effect && card.effect.data) ? card.effect.data : {};
    const originalPerks = Array.isArray(currentState.perks) ? currentState.perks.slice() : [];

    function applyWithKiller(killerKey) {
      if (!killerKey) return false;
      if (!window.KILLERS || !window.KILLERS[killerKey]) return false;

      currentState.killerKey = killerKey;

      const addonPool = getAddonNamesForKiller(killerKey).filter((name) => getAddonScore(name) !== 5);
      if (!addonPool || addonPool.length < 2) return false;

      const newAddons = shuffle(addonPool).slice(0, 2);
      if (newAddons.length !== 2) return false;

      currentState.addons = newAddons;
      currentState.perks = originalPerks.slice();
      return true;
    }

    const killerKeys = Object.keys(window.KILLERS || {});
    if (!killerKeys.length) return;

    const candidates = shuffle(Array.from(new Set(killerKeys))).slice(0, 5);
    if (!candidates.length) return;

    if (candidates.length === 1) {
      const ok = applyWithKiller(candidates[0]);
      if (!ok) return;
      finishCardPhase();
      return;
    }

    showChoiceOverlay({
      type: 'killer',
      candidates,
      title: '選擇要指定的殺手（偷天換日）：',
      onPick: (picked) => {
        data.killerKey = picked;
        const ok = applyWithKiller(picked);
        if (!ok) return;
        finishCardPhase();
      }
    });
  }

  // 30 號：觀看廣告（不可跳過 5 張圖片輪播；最後一張顯示 1 秒後才可關閉；關閉後套用獎勵）
  // 新效果：
  // - 殺手不變
  // - 技能：玩家自選 2 個「4 或 5 分」技能，另外 2 個隨機（不重複）
  // - 配件：重抽 2 個「3 分以上」配件
  function doCard30WatchAd(card) {
    if (!currentState) return;

    const data = (card && card.effect && card.effect.data) ? card.effect.data : {};
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    const intervalMs = (typeof data.intervalMs === 'number' && data.intervalMs > 0) ? data.intervalMs : 1000;
    const unlockDelayMs = (typeof data.unlockDelayMs === 'number' && data.unlockDelayMs >= 0) ? data.unlockDelayMs : 1000;

    if (!images.length) {

      return;
    }

    const killerKey = currentState.killerKey;
    if (!killerKey) {

      return;
    }

    // 先播放廣告輪播（不可跳過），使用者關閉後再進入「自選技能」流程
    showAdSlideshowOverlay(
      images,
      intervalMs,
      unlockDelayMs,
      () => {
        // onUnlocked：等使用者關閉後再處理獎勵
      },
      () => {
        // onClose：玩家自選 4 次（每次 5 選 1）的 4–5 分技能，然後套用獎勵
        const perk45PoolAll = getPerkNamesByScores([4, 5]);
        if (!perk45PoolAll || perk45PoolAll.length < 4) {

          finishCardPhase();
          return;
        }

        const picked = [];

        function pickNext(round) {
          const remain = perk45PoolAll.filter(p => !picked.includes(p));
          const candidates = shuffle(remain).slice(0, 5); // 每次抽 5 個給玩家選
          if (!candidates.length) {

            finishCardPhase();
            return;
          }

          showChoiceOverlay({
            type: 'perk',
            title: `選擇第 ${round} 個（4–5 分）技能：`,
            candidates,
            onPick: (name) => {
              picked.push(name);

              if (picked.length < 4) {
                pickNext(round + 1);
                return;
              }

              // 配件：兩個 3 分以上（依當前殺手）
              const currentAddons = Array.isArray(currentState.addons) ? currentState.addons.slice() : [];
              const addonPoolBase = getAddonNamesForKiller(killerKey);

              let addonPool = addonPoolBase.filter(a => {
                const s = getAddonScore(a);
                return typeof s === 'number' && s >= 3;
              });

              // 優先避免抽到原本的配件，若不夠再放回去
              const addonPoolNoDup = addonPool.filter(a => !currentAddons.includes(a));
              if (addonPoolNoDup.length >= 2) addonPool = addonPoolNoDup;

              if (!addonPool || addonPool.length < 2) {

                finishCardPhase();
                return;
              }
              const pickedAddons = shuffle(addonPool).slice(0, 2);

              // ✅ 套用獎勵（殺手不變）
              currentState.addons = pickedAddons.slice(0, 2);
              currentState.perks = picked.slice(0, 4);

              finishCardPhase();
            }
          });
        }

        pickNext(1);
      }
    );
  }

  // 全螢幕廣告輪播：每 intervalMs 換一張，最後一張顯示 unlockDelayMs 後才可關閉
  function showAdSlideshowOverlay(images, intervalMs, unlockDelayMs, onUnlocked, onClose) {
    // 清掉可能殘留的 overlay
    const old = document.getElementById('cardAdOverlay');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    const overlay = document.createElement('div');
    overlay.id = 'cardAdOverlay';

    const img = document.createElement('img');
    img.className = 'card-ad-img';
    img.alt = 'ad';
    overlay.appendChild(img);

    const hint = document.createElement('div');
    hint.className = 'card-ad-hint';
    hint.textContent = '點擊任意處關閉';
    overlay.appendChild(hint);

    let canClose = false;
    let idx = 0;
    let t = null;

    function setImage(i) {
      const src = images[i];
      img.src = src || '';
    }

    function cleanup() {
      if (t) {
        clearTimeout(t);
        t = null;
      }
      document.removeEventListener('keydown', onKeyDown, true);
      overlay.removeEventListener('click', onClick, true);
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    function onKeyDown(e) {
      // 避免 ESC 提前關掉
      if (!canClose && (e.key === 'Escape' || e.key === 'Esc')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function onClick(e) {
      if (!canClose) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      cleanup();
      if (typeof onClose === 'function') onClose();
    }

    document.addEventListener('keydown', onKeyDown, true);
    overlay.addEventListener('click', onClick, true);
    document.body.appendChild(overlay);

    // 開始輪播
    setImage(0);

    function next() {
      idx++;
      if (idx >= images.length) {
        // 已在最後一張 → 等 unlockDelayMs 後解鎖關閉
        t = setTimeout(() => {
          canClose = true;
          overlay.classList.add('can-close');
          if (typeof onUnlocked === 'function') onUnlocked();
        }, unlockDelayMs);
        return;
      }
      setImage(idx);
      t = setTimeout(next, intervalMs);
    }

    // 第一張也顯示 intervalMs，再換到下一張
    t = setTimeout(next, intervalMs);
  }





  function finishCardPhase() {
    isActive = false;
    dragInfo = null;

    const container = document.getElementById('cardContainer');
    if (container) {
      container.innerHTML = '';
      container.classList.remove('card-visible');
    }

    const machineEl = document.querySelector('.slot-machine');
    if (machineEl) {
      machineEl.classList.add('glow');
    }

    if (typeof applyCallback === 'function') {
      const finalState = sanitizeAddonState(cloneState(currentState));
      applyCallback(finalState);
      if (window.lockSlotLever) {
        window.lockSlotLever(500);
      }
    }
  }


  // ==========================
  // 10.x 新增卡片：31 / 32 / 33
  // ==========================
  function getPerkKeysByAlias(aliasText) {
    return Object.entries(window.PERKS || {})
      .filter(([_, p]) => p && Array.isArray(p.aliases) && p.aliases.includes(aliasText))
      .map(([name]) => name);
  }

  function doCard31ReplaceCurse(slotIndex) {
    if (slotIndex < 3 || slotIndex > 6) return false;
    if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4) return false;

    const idx = slotIndex - 3;
    const poolAll = getPerkKeysByAlias('厄咒');
    if (!poolAll.length) return false;

    const used = new Set(currentState.perks);
    used.delete(currentState.perks[idx]);

    let pool = poolAll.filter(p => !used.has(p));
    if (!pool.length) pool = poolAll;

    const picked = getRandomItem(pool);
    if (!picked) return false;

    currentState.perks[idx] = picked;
    return true;
  }

  function doCard32ReplaceScourge(slotIndex) {
    if (slotIndex < 3 || slotIndex > 6) return false;
    if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4) return false;

    const idx = slotIndex - 3;
    const poolAll = getPerkKeysByAlias('天災鉤');
    if (!poolAll.length) return false;

    const used = new Set(currentState.perks);
    used.delete(currentState.perks[idx]);

    let pool = poolAll.filter(p => !used.has(p));
    if (!pool.length) pool = poolAll;

    const picked = getRandomItem(pool);
    if (!picked) return false;

    currentState.perks[idx] = picked;
    return true;
  }

  function doCard33WillFamily() {
    if (!currentState) return false;

    // 1) 找出 aliases 內含「威」的殺手
    const killerKeys = Object.keys(window.KILLERS || {});
    const willKillers = killerKeys.filter(k => {
      const kk = window.KILLERS && window.KILLERS[k];
      const aliases = kk && Array.isArray(kk.aliases) ? kk.aliases : [];
      return aliases.includes('威');
    });
    if (!willKillers.length) return false;

    // 2) 從候選中挑一個「至少有 2 個配件」的殺手（避免必定失敗）
    let pickedKiller = null;
    for (let i = 0; i < 50; i++) {
      const candidate = getRandomItem(willKillers);
      const addonPool = getAddonNamesForKiller(candidate);
      if (addonPool && addonPool.length >= 2) {
        pickedKiller = candidate;
        break;
      }
    }
    if (!pickedKiller) return false;

    // 3) 技能：從「所有威家殺手」的技能池抽 4 個（不重複）
    //    （DBD 每個殺手通常只有 3 個專屬技能，所以這樣才能湊滿 4 格）
    const willPerkPool = Object.entries(window.PERKS || {})
      .filter(([_, p]) => p && willKillers.includes(p.killer))
      .map(([name]) => name);

    const pickedPerks = [];
    const used = new Set();

    // 先從威家技能池抽
    const shuffledWill = shuffle(Array.from(new Set(willPerkPool)));
    for (const name of shuffledWill) {
      if (pickedPerks.length >= 4) break;
      if (used.has(name)) continue;
      used.add(name);
      pickedPerks.push(name);
    }

    // 不足 4 個：用通用技能補滿（保底不碎卡）
    if (pickedPerks.length < 4) {
      const allPerks = Object.keys(window.PERKS || {});
      const shuffledAll = shuffle(allPerks);
      for (const name of shuffledAll) {
        if (pickedPerks.length >= 4) break;
        if (used.has(name)) continue;
        used.add(name);
        pickedPerks.push(name);
      }
    }

    if (pickedPerks.length < 4) return false;

    // 4) 配件：改成新殺手的任意兩配
    const addonPool = getAddonNamesForKiller(pickedKiller);
    if (!addonPool || addonPool.length < 2) return false;
    const newAddons = shuffle(addonPool).slice(0, 2);

    currentState.killerKey = pickedKiller;
    currentState.perks = pickedPerks;
    currentState.addons = newAddons;
    return true;
  }


  function doCard34Wishlist(card, slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) {

      return;
    }
    if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4) {

      return;
    }

    const perkIdx = slotIndex - 3;

    // 從所有殺手中找出「至少有 1 個專屬技能」的殺手
    const killerKeys = Object.keys(window.KILLERS || {});
    const killersWithPerks = killerKeys.filter(k => {
      for (const p of Object.values(window.PERKS || {})) {
        if (p && p.killer === k) return true;
      }
      return false;
    });

    if (killersWithPerks.length < 1) {

      return;
    }

    // 隨機抽出 5 位殺手（不足就用全部）
    const candidates = shuffle(killersWithPerks).slice(0, Math.min(5, killersWithPerks.length));

    showChoiceOverlay({
      type: 'killer',
      candidates,
      title: '願望清單：從 5 位殺手中選 1 位',
      onPick: (killerKey) => {
        // 把指定技能欄位換成該殺手的隨機 1 個專屬技能
        const poolAll = Object.entries(window.PERKS || {})
          .filter(([_, p]) => p && p.killer === killerKey)
          .map(([name]) => name);

        if (!poolAll.length) {

          return;
        }

        const currentPerks = currentState.perks.slice();
        const used = new Set(currentPerks);
        used.delete(currentPerks[perkIdx]);

        let pool = poolAll.filter(p => !used.has(p));
        if (!pool.length) pool = poolAll;

        const picked = getRandomItem(pool);
        if (!picked) {

          return;
        }

        currentState.perks[perkIdx] = picked;
        finishCardPhase();
      }
    });
  }

  // ==========================
  // 12. 對外介面
  // ==========================
  window.CardSystem = {
    startCardPhase,
    FORCE_DRAW_CARD_IDS
  };


})();


// === Tooltip 顯示分數 PATCH（安全版）===
(function () {
  function applyScoreTooltip() {
    const cells = document.querySelectorAll('.slot-cell');
    cells.forEach(cell => {
      const name = cell.getAttribute('title') || '';
      let score = null;

      if (window.getPerkScore) score = getPerkScore(name);
      if (score == null && window.getAddonScore) score = getAddonScore(name);

      if (typeof score === 'number') {
        cell.setAttribute('title', name + '\n分數：' + score);
      }
    });
  }

  document.addEventListener('mouseover', applyScoreTooltip);
})();
