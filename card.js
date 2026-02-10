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

    // 2. 不包含殺手全部重抽
    {
      id: 'card02',
      zh: '起床重睡',
      target: 'any',
      colorType: 'all-neutral',
      summary: '保留殺手，重抽配件與全部技能。',
      effect: { type: 'reroll_all_except_killer', data: {} }
    },

    // 3. 配件全部重抽
    {
      id: 'card03',
      zh: '汰舊換新',
      target: 'addon',
      colorType: 'addon',
      summary: '重抽兩個配件欄位。',
      effect: { type: 'reroll_addons_all', data: {} }
    },

    // 4. 4 個技能全部重抽
    {
      id: 'card04',
      zh: '空空遺忘',
      target: 'perk',
      colorType: 'perk',
      summary: '重抽四個技能欄位。',
      effect: { type: 'reroll_perks_all', data: {} }
    },

    // 5. 4 技能隨機 3 重抽
    {
      id: 'card05',
      zh: '重振旗鼓',
      target: 'perk',
      colorType: 'perk',
      summary: '隨機三個技能重抽。',
      effect: { type: 'reroll_random_perks', data: { count: 3 } }
    },

    // 6. 4 技能隨機 2 重抽
    {
      id: 'card06',
      zh: '盤點庫存',
      target: 'perk',
      colorType: 'perk',
      summary: '隨機兩個技能重抽。',
      effect: { type: 'reroll_random_perks', data: { count: 2 } }
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

    // 12. 技能 -> 通用技能
    {
      id: 'card12',
      zh: '萌新入坑',
      target: 'slot-perk',
      colorType: 'perk-slot',
      summary: '將此技能改成通用技能。',
      effect: { type: 'replace_skill_general', data: {} }
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

    // 16. 技能平均分配後重抽（實作：重抽全部技能）
    {
      id: 'card16',
      zh: '全民普發',
      target: 'perk',
      colorType: 'perk',
      summary: '將技能重新分配並重抽四個技能。',
      effect: { type: 'reroll_perks_all', data: {} }
    },

    // 17. 技能極端分配：兩格變 1 分，其餘變 3/4/5 分
    {
      id: 'card17',
      zh: '狂賭之冤',
      target: 'any',
      colorType: 'perk',
      summary: '隨機兩個欄位變為 1 分，其餘欄位抽 3/4/5 分的技能或配件。',
      effect: { type: 'card17_extreme_redistribute', data: {} }
    },

    // 18. 配件平均分配後重抽（實作：重抽兩個配件）
    {
      id: 'card18',
      zh: '一分為二',
      target: 'addon',
      colorType: 'addon',
      summary: '將配件分配後重抽兩個配件。',
      effect: { type: 'reroll_addons_all', data: {} }
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

    // 20. 技能 + 配件總和平均（實作：技能+配件全部重抽）
    {
      id: 'card20',
      zh: '共產主義',
      target: 'any',
      colorType: 'all-neutral',
      summary: '重新分配技能與配件並重抽全部欄位。',
      effect: { type: 'reroll_all_addon_perk', data: {} }
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


    // 37. 特殊卡：哼啊阿阿（配件/技能分數依序變為 1 1 4 5 1 4）
    {
      id: 'card37',
      zh: '哼啊阿阿',
      target: 'any',
      colorType: 'all-neutral-dark',
      summary: '為這麼臭的卡有存在的必要嗎?',
      effect: { type: 'card37_set_sequence_scores', data: { seq: [1, 1, 4, 5, 1, 4] } }
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
    return (k && k.img) || '';
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

    // 特殊卡：目前支援 card1 / card28（總機率 5%）
    const specialIds = ['card1', 'card28', 'card30', 'card33', 'card37'];
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

    currentState = cloneState(state || {});
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
          // 不能使用在該欄位：視為使用失敗，跳出提示並消耗此卡
          showInvalidCardPopup(card);
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
      case 'replace_addons_by_color':
        ok = doReplaceAddonsByColor(card.effect.data && card.effect.data.colors);
        break;
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
      case 'card17_extreme_redistribute':
        ok = doCard17ExtremeRedistribute();
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
      case 'card37_set_sequence_scores':
        ok = doCard37SetSequenceScores(card, card.effect && card.effect.data);
        break;

      default:
        console.warn('未知卡片效果:', type);
        ok = false;
        break;
    }

    if (!ok) {
      showInvalidCardPopup(card);
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
      showInvalidCardPopup(card);
      return;
    }
    const killerKey = currentState.killerKey;
    if (!killerKey) {
      showInvalidCardPopup(card);
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
          showInvalidCardPopup(card);
          return;
        }
        if (!addonPool || addonPool.length < 2) {
          showInvalidCardPopup(card);
          return;
        }

        const newPerks = [];
        const perkCandidates = shuffle(perkPool);
        for (const p of perkCandidates) {
          if (!newPerks.includes(p)) newPerks.push(p);
          if (newPerks.length === 4) break;
        }
        if (newPerks.length !== 4) {
          showInvalidCardPopup(card);
          return;
        }

        const newAddons = [];
        const addonCandidates = shuffle(addonPool);
        for (const a of addonCandidates) {
          if (!newAddons.includes(a)) newAddons.push(a);
          if (newAddons.length === 2) break;
        }
        if (newAddons.length !== 2) {
          showInvalidCardPopup(card);
          return;
        }

        currentState.perks = newPerks;
        currentState.addons = newAddons;

        finishCardPhase();
      }
    });
  }





  // 36 號卡：一視同仁（技能 + 配件 全部變成同一個隨機分數 1–5）
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
      showInvalidCardPopup(card);
      return;
    }

    choiceCount = Math.max(1, Math.min(3, choiceCount || 2));

    if (isAddonSlot) {
      const killerKey = currentState.killerKey;
      if (!killerKey) {
        showInvalidCardPopup(card);
        return;
      }
      const originalAddons = currentState.addons.slice();
      const idx = slotIndex - 1;

      // 從該殺手配件池中，排除目前兩個配件，避免重複
      const basePool = getAddonNamesForKiller(killerKey).filter(
        name => !originalAddons.includes(name)
      );
      if (!basePool.length) {
        showInvalidCardPopup(card);
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
        showInvalidCardPopup(card);
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
      showInvalidCardPopup(card);
      return;
    }
    const idx = slotIndex - 3;
    const killerKey = currentState && currentState.killerKey;
    if (!killerKey) {
      showInvalidCardPopup(card);
      return;
    }

    const candidates = collectPerkCandidatesForKiller(killerKey);
    if (!candidates.length) {
      showInvalidCardPopup(card);
      return;
    }

    showPerkMultiChoice(card, idx, candidates);
  }

  // 23 號：隨機殺手 -> 3 技能擇一
  function doReplaceSkillByRandomKiller3Pick(card, slotIndex) {
    const isPerk = slotIndex >= 3 && slotIndex <= 6;
    if (!isPerk) {
      showInvalidCardPopup(card);
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
      showInvalidCardPopup(card);
      return;
    }

    const candidates = collectPerkCandidatesForKiller(killerKey);
    if (!candidates.length) {
      showInvalidCardPopup(card);
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
      showInvalidCardPopup(card);
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

    const poolAll = Object.entries(window.PERKS || {})
      .filter(([name, p]) => p && p.killer === 'General')
      .map(([name]) => name);

    if (!poolAll.length) return false;

    let filtered = poolAll.filter(n => !other.includes(n) && n !== currentName);
    if (!filtered.length) filtered = poolAll.filter(n => n !== currentName);
    if (!filtered.length) return false;

    const chosen = getRandomItem(filtered);
    perks[idx] = chosen;
    currentState.perks = perks;
    return true;
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
      showInvalidCardPopup(card);
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
      showInvalidCardPopup(card);
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
        showInvalidCardPopup(card);
        return;
      }
    } else {
      showInvalidCardPopup(card);
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
    const settings = window.SlotSettings || {};

    // 若使用者開了「自選殺手鎖定」，就直接用鎖定殺手，不再跳選擇
    const lockedKiller = (settings.lockKiller && settings.lockKillerKey) ? settings.lockKillerKey : null;

    // 保留原本四個技能（本卡不會改技能）
    const originalPerks = Array.isArray(currentState.perks) ? currentState.perks.slice() : [];

    function applyWithKiller(killerKey) {
      if (!killerKey) return false;
      if (!window.KILLERS || !window.KILLERS[killerKey]) return false;

      // 指定殺手（若被鎖定，外部 index 會覆蓋回去；但這裡仍照流程寫入 currentState）
      currentState.killerKey = killerKey;

      // 重抽兩個配件（從該殺手配件池中抽，不重複；配件抽不到 5 分）
      const addonPool = getAddonNamesForKiller(killerKey).filter(n => getAddonScore(n) !== 5);
      if (!addonPool || addonPool.length < 2) return false;
      const newAddons = shuffle(addonPool).slice(0, 2);
      if (newAddons.length !== 2) return false;
      currentState.addons = newAddons;

      // ✅ 技能不變：直接還原原本四個技能
      currentState.perks = Array.isArray(originalPerks) ? originalPerks.slice() : [];
      return true;
    }

    // 有鎖定殺手 → 直接套用（不彈窗）
    if (lockedKiller) {
      const ok = applyWithKiller(lockedKiller);
      if (!ok) {
        showInvalidCardPopup(card);
        return;
      }
      finishCardPhase();
      return;
    }

    // 玩家自選：先抽 5 位殺手讓他選
    const killerKeys = Object.keys(window.KILLERS || {});
    if (!killerKeys.length) {
      showInvalidCardPopup(card);
      return;
    }

    const candidates = shuffle(Array.from(new Set(killerKeys))).slice(0, 5);
    if (candidates.length < 1) {
      showInvalidCardPopup(card);
      return;
    }

    // 只有 1 個候選就直接用（保險）
    if (candidates.length === 1) {
      const ok = applyWithKiller(candidates[0]);
      if (!ok) {
        showInvalidCardPopup(card);
        return;
      }
      finishCardPhase();
      return;
    }

    showChoiceOverlay({
      type: 'killer',
      candidates,
      title: '選擇要指定的殺手（偷天換日）：',
      onPick: (picked) => {
        data.killerKey = picked; // 記錄一下（方便未來除錯/顯示）
        const ok = applyWithKiller(picked);
        if (!ok) {
          showInvalidCardPopup(card);
          return;
        }
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
      showInvalidCardPopup(card);
      return;
    }

    const killerKey = currentState.killerKey;
    if (!killerKey) {
      showInvalidCardPopup(card);
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
          showInvalidCardPopup(card);
          finishCardPhase();
          return;
        }

        const picked = [];

        function pickNext(round) {
          const remain = perk45PoolAll.filter(p => !picked.includes(p));
          const candidates = shuffle(remain).slice(0, 5); // 每次抽 5 個給玩家選
          if (!candidates.length) {
            showInvalidCardPopup(card);
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
                showInvalidCardPopup(card);
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
      const finalState = cloneState(currentState);
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
      showInvalidCardPopup(card);
      return;
    }
    if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4) {
      showInvalidCardPopup(card);
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
      showInvalidCardPopup(card);
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
          showInvalidCardPopup(card);
          return;
        }

        const currentPerks = currentState.perks.slice();
        const used = new Set(currentPerks);
        used.delete(currentPerks[perkIdx]);

        let pool = poolAll.filter(p => !used.has(p));
        if (!pool.length) pool = poolAll;

        const picked = getRandomItem(pool);
        if (!picked) {
          showInvalidCardPopup(card);
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
    startCardPhase
  };
  // ==========================
  // 37. 特殊卡：哼啊阿阿（分數序列：1 1 4 5 1 4）
  // 依序套用到：配件1、配件2、技能1、技能2、技能3、技能4
  // ==========================
  function doCard37SetSequenceScores(card, data) {
    if (!currentState) {
      showInvalidCardPopup(card);
      return false;
    }
    const killerKey = currentState.killerKey;
    if (!killerKey) {
      showInvalidCardPopup(card);
      return false;
    }

    const seq = (data && Array.isArray(data.seq) && data.seq.length === 6) ? data.seq : [1, 1, 4, 5, 1, 4];

    function pickUnique(pool, usedSet) {
      const candidates = (pool || []).filter(x => !usedSet.has(x));
      if (candidates.length < 1) return null;
      const picked = shuffle(candidates)[0];
      usedSet.add(picked);
      return picked;
    }

    // Addons
    const usedAddons = new Set();
    const addon1 = pickUnique(getAddonNamesByScoresForKiller(killerKey, [seq[0]]), usedAddons);
    if (!addon1) { showInvalidCardPopup(card); return false; }
    const addon2 = pickUnique(getAddonNamesByScoresForKiller(killerKey, [seq[1]]), usedAddons);
    if (!addon2) { showInvalidCardPopup(card); return false; }

    // Perks
    const usedPerks = new Set();
    const perks = [];
    for (let i = 2; i < 6; i++) {
      const perk = pickUnique(getPerkNamesByScores([seq[i]]), usedPerks);
      if (!perk) { showInvalidCardPopup(card); return false; }
      perks.push(perk);
    }

    currentState.addons = [addon1, addon2];
    currentState.perks = perks;

    applyCurrentState();
    return true;
  }

})();
