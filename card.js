// Card features consolidated in load order. Each feature keeps its own scope.

/* BEGIN MERGED: world-stop-effects.js */
(function()
{
   'use strict';
   const activeEffects = new Set();
   function create()
   {
      let root = null;
      let filter = null;
      let center = null;
      let radius = 0;
      let disposed = false;
      const animations = new Set();
      function play(element, frames, options)
      {
         if (disposed || !element || typeof element.animate !== 'function') return Promise.resolve();
         const animation = element.animate(frames, options);
         animations.add(animation);
         return animation.finished.catch(() => {}).finally(() => animations.delete(animation));
      }
      function dispose()
      {
         disposed = true;
         activeEffects.delete(controller);
         for (const animation of animations) animation.cancel();
         animations.clear();
         if (root) root.remove();
         root = null;
      }
      function pointCircle(size)
      {
         return `circle(${size}px at ${center.x}px ${center.y}px)`;
      }
      function makeRing(reverse)
      {
         const ring = document.createElement('div');
         const diameter = radius * 2;
         ring.style.cssText = `position:absolute;width:${diameter}px;height:${diameter}px;left:${center.x - radius}px;top:${center.y - radius}px;border-radius:50%;pointer-events:none;will-change:transform,opacity;background:radial-gradient(circle,transparent 63%,rgba(112,79,214,.12) 66%,rgba(238,222,147,.6) 69%,rgba(255,251,220,.95) 70%,rgba(175,155,255,.5) 71%,transparent 75%);`;
         root.appendChild(ring);
         return play(ring,
            reverse ? [{transform: 'scale(1.45)', opacity: 0}, {transform: 'scale(.7)', opacity: .8, offset: .6}, {transform: 'scale(.005)', opacity: 0}] :
               [{transform: 'scale(.005)', opacity: 0}, {transform: 'scale(.25)', opacity: 1, offset: .22}, {transform: 'scale(1.45)', opacity: 0}],
            {duration: reverse ? 850 : 1000, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'forwards'}).finally(() => ring.remove());
      }
      async function enter(origin)
      {
         if (disposed || root) return;
         center = origin || {x: window.innerWidth / 2, y: window.innerHeight / 2};
         radius = Math.ceil(Math.hypot(Math.max(center.x, window.innerWidth - center.x), Math.max(center.y, window.innerHeight - center.y))) + 80;
         root = document.createElement('div');
         root.id = 'worldStopEffect';
         root.setAttribute('aria-hidden', 'true');
         root.style.cssText = 'position:fixed;inset:0;z-index:100090;pointer-events:none;overflow:hidden;contain:layout size;';
         filter = document.createElement('div');
         filter.style.cssText = 'position:absolute;inset:0;pointer-events:none;backdrop-filter:invert(1) hue-rotate(155deg) saturate(1.7);-webkit-backdrop-filter:invert(1) hue-rotate(155deg) saturate(1.7);background:rgba(114,73,166,.08);will-change:clip-path;';
         filter.style.clipPath = pointCircle(0);
         root.appendChild(filter);
         const callout = document.createElement('div');
         callout.textContent = '時よ止まれ！';
         callout.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff2c0;font-family:inherit;font-weight:900;font-size:clamp(34px,7vw,84px);letter-spacing:.08em;text-shadow:0 3px 12px #000,0 0 25px #d6ae55;';
         root.appendChild(callout);
         document.body.appendChild(root);
         await Promise.all([
            play(filter, [{clipPath: pointCircle(0)}, {clipPath: pointCircle(radius)}], {duration: 1000, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'forwards'}),
            makeRing(false),
            play(callout, [{opacity: 0, transform: 'scale(.94)'}, {opacity: 1, transform: 'scale(1)', offset: .2}, {opacity: 1, offset: .72}, {opacity: 0, transform: 'scale(1.03)'}], {duration: 1150, fill: 'forwards'})
         ]);
         if (disposed || !root) return;
         callout.remove();
         filter.style.clipPath = 'none';
         for (const animation of filter.getAnimations()) animation.cancel();
         // Keep only the page behind the normal-colored selection dialog inverted.
         root.style.zIndex = '100070';
      }
      async function resume()
      {
         if (disposed || !root) return;
         root.style.zIndex = '100090';
         const caption = document.createElement('div');
         caption.textContent = '時間開始流動';
         caption.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#f1e3ac;font-family:inherit;font-size:clamp(32px,7vw,80px);font-weight:900;letter-spacing:.08em;text-shadow:0 3px 16px #000;';
         root.appendChild(caption);
         await Promise.all([
            play(filter, [{clipPath: pointCircle(radius)}, {clipPath: pointCircle(0)}], {duration: 850, easing: 'cubic-bezier(.45,0,.75,.65)', fill: 'forwards'}),
            makeRing(true),
            play(caption, [{opacity: 0}, {opacity: 1, offset: .18}, {opacity: 1, offset: .75}, {opacity: 0}], {duration: 1100, fill: 'forwards'})
         ]);
         dispose();
      }
      const controller = {enter, resume, dispose};
      activeEffects.add(controller);
      return controller;
   }
   window.WorldStopEffects = {create, disposeAll: () => { for (const effect of Array.from(activeEffects)) effect.dispose(); }};
})();
;
/* END MERGED: world-stop-effects.js */

/* BEGIN MERGED: ban-pick.js */
(function()
{
   'use strict';
   const instances = new Set();
   function createGame(names, random = Math.random, settings = {})
   {
      const pool = Array.from(new Set(names));
      const initialCount = settings.initialCount || 12;
      const rounds = settings.rounds || 4;
      const rerollBudget = settings.budget || {used: 0, limit: 3};
      if (pool.length < initialCount + 2 * (rounds - 1) + rerollBudget.limit) throw new Error('輪番取捨候選池不足。');
      function pick(list) { return list[Math.min(list.length - 1, Math.floor(random() * list.length))]; }
      const initial = pool.slice();
      for (let i = initial.length - 1; i > 0; i--)
      {
         const j = Math.min(i, Math.floor(random() * (i + 1)));
         [initial[i], initial[j]] = [initial[j], initial[i]];
      }
      const cells = initial.slice(0, initialCount).map(name => ({name, banned: false, locked: false}));
      const seen = new Set(cells.map(cell => cell.name));
      let round = 1;
      let phase = 'player';
      let lockUsed = false;
      let queue = [];
      function playerAction(index, mode)
      {
         const cell = cells[index];
         if (phase !== 'player' || !cell || cell.banned || cell.locked || !['ban', 'lock'].includes(mode)) return false;
         if (mode === 'lock') { cell.locked = true; lockUsed = true; }
         else cell.banned = true;
         const available = cells.map((value, i) => i).filter(i => !cells[i].banned && !cells[i].locked);
         queue = [];
         for (let i = 0; i < (mode === 'lock' ? 2 : 1); i++)
         {
            const target = pick(available);
            available.splice(available.indexOf(target), 1);
            queue.push({type: 'ban', index: target});
         }
         const replacements = round === rounds ? 0 : mode === 'lock' ? 2 : 1;
         const replacementsPool = pool.filter(name => !seen.has(name));
         for (let i = 0; i < replacements; i++)
         {
            const target = pick(available);
            const name = pick(replacementsPool);
            available.splice(available.indexOf(target), 1);
            replacementsPool.splice(replacementsPool.indexOf(name), 1);
            queue.push({type: 'replace', index: target, name});
         }
         phase = 'computer';
         return true;
      }
      function reroll(index)
      {
         const cell = cells[index];
         if (!['player', 'finished'].includes(phase) || !cell || cell.banned || cell.locked || rerollBudget.used >= rerollBudget.limit) return false;
         const choices = pool.filter(name => !seen.has(name));
         if (!choices.length) return false;
         cell.name = pick(choices);
         seen.add(cell.name);
         rerollBudget.used++;
         return true;
      }
      function replaceByComputer(index)
      {
         const cell = cells[index];
         if (!cell || cell.banned || cell.locked) return false;
         const choices = pool.filter(name => !seen.has(name));
         if (!choices.length) return false;
         cell.name = pick(choices);
         seen.add(cell.name);
         return true;
      }
      function applyComputerAction(action, replacement = null)
      {
         if (phase !== 'computer' || queue[0] !== action) return false;
         const cell = cells[action.index];
         if (cell.banned || cell.locked) return false;
         if (action.type === 'ban') cell.banned = true;
         else if (replacement) { if (!replacement()) return false; }
         else { cell.name = action.name; seen.add(action.name); }
         queue.shift();
         if (!queue.length)
         {
            if (round === rounds) phase = 'finished';
            else { round++; phase = 'player'; }
         }
         return true;
      }
      return {
         cells,
         playerAction,
         reroll,
         applyComputerAction,
         replaceByComputer,
         get canComputerReplace() { return pool.some(name => !seen.has(name)); },
         get round() { return round; },
         get rounds() { return rounds; },
         get phase() { return phase; },
         get lockUsed() { return lockUsed; },
         get rerollsUsed() { return rerollBudget.used; },
         get rerollsRemaining() { return rerollBudget.limit - rerollBudget.used; },
         get nextAction() { return queue[0] || null; },
         get result() { return phase === 'finished' ? cells.filter(cell => !cell.banned).map(cell => cell.name) : null; }
      };
   }
   function open(options)
   {
      let catalog = options.catalog;
      const sharedBudget = {used: 0, limit: 3};
      let game = createGame(Object.keys(catalog), Math.random, {budget: sharedBudget});
      let stage = 'perk';
      const groups = {perk: {game, catalog, label: '技能'}};
      if (options.addonCatalog) groups.addon = {game: createGame(Object.keys(options.addonCatalog), Math.random, {initialCount: 6, rounds: 2, budget: sharedBudget}), catalog: options.addonCatalog, label: '配件'};
      let confirm = null;
      const overlay = document.createElement('div');
      overlay.id = 'banPickOverlay';
      let mode = 'ban';
      let disposed = false;
      let busy = false;
      let applied = false;
      const animations = new Set();
      const icons = {
         ban: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 15 49 49M49 15 15 49"/></svg>',
         lock: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="15" y="28" width="34" height="27" rx="4"/><path d="M22 28V18a10 10 0 0 1 20 0v10M32 39v6"/></svg>',
         replace: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M15 27a19 19 0 0 1 32-12l6 6M53 9v12H41M49 37a19 19 0 0 1-32 12l-6-6M11 55V43h12"/></svg>'
      };
      overlay.innerHTML = `
      <style>
      #banPickOverlay{position:fixed;inset:0;z-index:100080;display:flex;align-items:center;justify-content:center;background:#080c14ed;padding:20px;overflow:hidden;box-sizing:border-box;color:#edf2f8;font-family:inherit}
      #banPickOverlay *{box-sizing:border-box}.bp-panel{width:min(940px,100%);max-height:95dvh;overflow-x:hidden;overflow-y:auto;padding:24px;border:1px solid #526177;border-radius:20px;background:linear-gradient(145deg,#1b2331,#0e131e);box-shadow:0 20px 80px #0009}.bp-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}.bp-header h2{margin:0;font-size:28px}.bp-round{color:#b9cbe3;font-size:17px;font-weight:700}.bp-layout{display:grid;grid-template-columns:90px minmax(0,1fr) 90px;gap:20px;align-items:stretch}.bp-tools{display:flex;flex-direction:column;justify-content:space-around;gap:30px}.bp-tool{position:relative;display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1;border:2px solid #5d6a7d;border-radius:14px;background:#202b3d;color:#c2cede;cursor:pointer;transition:background .15s,border-color .15s,opacity .15s}.bp-tool svg,.bp-flying svg{width:70%;height:70%;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.bp-tool.active{color:#fff;border-color:#82bfff;background:#315d8b;box-shadow:0 0 0 3px #65a4e329}.bp-tool.lock-mode.active{color:#ffdf8d;border-color:#f0c469;background:#705824}.bp-tool:disabled{cursor:default}.bp-tool.used{opacity:.28;filter:grayscale(1);border-style:dashed;box-shadow:none}.bp-tool.computer{cursor:default;color:#ec8993;background:#312333}.bp-tool.computer.swap{color:#a8bcff;background:#252940}.bp-tool.acting{border-color:currentColor;box-shadow:0 0 22px #b3cafa55}.bp-tool-caption{font-size:12px;text-align:center;color:#a7b5c9;margin-top:8px;line-height:1.4}.bp-tools > div{width:100%}.bp-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;padding:15px;border:1px solid #4b5971;border-radius:16px;background:#070c15}.bp-boards{display:flex;flex-direction:column;gap:12px;min-width:0;padding:15px;border:1px solid #4b5971;border-radius:16px;background:#070c15}.bp-boards .bp-grid{padding:0;border:0;border-radius:0;background:none}.bp-section-head{display:flex;justify-content:space-between;gap:10px;padding:0 4px 8px;font-size:14px;color:#c6d6ec}.bp-perk-grid .bp-cell{aspect-ratio:auto;height:clamp(54px,13vh,104px)}.bp-addon-grid .bp-cell{aspect-ratio:auto;height:clamp(54px,13vh,104px)}.bp-cell{position:relative;display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:1;border:1px solid #4a5a72;border-radius:11px;background:#1b2638;overflow:hidden;cursor:pointer}.bp-cell img{width:85%;height:85%;object-fit:contain;pointer-events:none;transition:opacity .2s,filter .2s}.bp-perk-grid .bp-cell img{width:100%;height:100%;transform:scale(1.1)}.bp-cell:hover:enabled{border-color:#b0d7ff;background:#2b4260}.bp-cell:disabled{cursor:default}.bp-cell.banned{border-color:#70323e;background:#19101b}.bp-cell.banned img{opacity:.2;filter:grayscale(1)}.bp-mark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}.bp-mark.ban-mark{color:#ff4f69;font-size:clamp(38px,7vw,90px);font-weight:500;text-shadow:0 1px 8px #000}.bp-cell.locked{border:2px solid #efcd79;background:#3d3622;box-shadow:inset 0 0 16px #ddb65722}.bp-mark.lock-mark{inset:auto 3px 3px auto;width:30px;height:30px;color:#ffdf8d;background:#272316e8;border-radius:7px}.bp-mark svg{width:90%;height:90%;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.bp-help{min-height:58px;margin-top:18px;padding:13px 15px;border-radius:10px;background:#26344a;color:#e0eafa;line-height:1.6;font-size:14px}.bp-submit{display:block;margin:16px auto 0;padding:12px 26px;border:1px solid #9cb6d9;border-radius:10px;background:#38618e;color:#fff;font:inherit;font-weight:700;cursor:pointer}.bp-flying{position:fixed;z-index:2;display:flex;align-items:center;justify-content:center;pointer-events:none;color:#ff536a;filter:drop-shadow(0 0 8px #0009)}.bp-flying.swap{color:#b2bfff}.bp-cell:focus-visible,.bp-tool:focus-visible{outline:3px solid #e3edff;outline-offset:3px}
      @media(max-width:650px){#banPickOverlay{padding:8px}.bp-panel{padding:14px}.bp-header h2{font-size:23px}.bp-round{font-size:14px}.bp-layout{grid-template-columns:45px minmax(0,1fr) 45px;gap:8px}.bp-grid{padding:6px;gap:6px}.bp-boards{padding:6px;gap:6px}.bp-tool{border-radius:9px}.bp-tool-caption{font-size:10px}.bp-tools{gap:20px}.bp-mark.lock-mark{width:20px;height:20px}.bp-help{font-size:12px}}
      </style>
      <section class="bp-panel" role="dialog" aria-modal="true" aria-label="輪番取捨">
         <header class="bp-header"><h2>輪番取捨</h2><span class="bp-round"></span></header>
         <div class="bp-layout">
            <div class="bp-tools"><div><button class="bp-tool active" id="bpBan" aria-label="禁用模式" aria-pressed="true">${icons.ban}</button><div class="bp-tool-caption">禁用</div></div><div><button class="bp-tool lock-mode" id="bpLock" aria-label="鎖定模式" aria-pressed="false">${icons.lock}</button><div class="bp-tool-caption" id="bpLockLabel">鎖定 · 不限次數</div></div><div><button class="bp-tool" id="bpReroll" aria-label="重骰模式" aria-pressed="false">${icons.replace}</button><div class="bp-tool-caption" id="bpRerollLabel">重骰 · 剩 3 次</div></div></div>
            <div class="bp-boards"><section class="bp-section"><div class="bp-grid bp-perk-grid" id="bpPerkGrid" aria-label="十二個候選技能"></div></section>${options.addonCatalog ? '<section class="bp-section"><div class="bp-grid bp-addon-grid" id="bpAddonGrid" aria-label="六個候選配件"></div></section>' : ''}</div>
            <div class="bp-tools"><div><button class="bp-tool computer" id="bpComputerBan" disabled aria-label="電腦禁用">${icons.ban}</button><div class="bp-tool-caption">電腦禁用</div></div><div><button class="bp-tool computer swap" id="bpComputerSwap" disabled aria-label="電腦替換">${icons.replace}</button><div class="bp-tool-caption">電腦替換</div></div></div>
         </div>
         <div class="bp-help" role="status" aria-live="polite"></div>
      </section>`;
      document.body.appendChild(overlay);
      const q = selector => overlay.querySelector(selector);
      function dispose()
      {
         if (disposed) return;
         disposed = true;
         for (const animation of animations) animation.cancel();
         animations.clear();
         overlay.remove();
         instances.delete(controller);
      }
      async function animate(element, frames, duration)
      {
         if (disposed || !element || typeof element.animate !== 'function') return;
         const animation = element.animate(frames, {duration, easing: 'ease-in-out'});
         animations.add(animation);
         try { await animation.finished; } catch (_) {} finally { animations.delete(animation); }
      }
      function help(text) { q('.bp-help').textContent = text; }
      function cellElement(index, key = stage)
      {
         return q(key === 'perk' ? '#bpPerkGrid' : '#bpAddonGrid').children[index];
      }
      function allFinished()
      {
         return Object.values(groups).every(group => group.game.phase === 'finished');
      }
      function activate(key)
      {
         stage = key;
         game = groups[key].game;
         catalog = groups[key].catalog;
      }
      function render()
      {
         const totalRounds = Object.values(groups).reduce((sum, group) => sum + group.game.rounds, 0);
         const completedRounds = Object.values(groups).reduce((sum, group) => sum + (group.game.phase === 'finished' ? group.game.rounds : group.game.round - 1), 0);
         q('.bp-round').textContent = allFinished() ? `第 ${totalRounds} / ${totalRounds} 回合 · 完成` : `第 ${completedRounds + 1} / ${totalRounds} 回合`;
         const canPlay = !busy && !allFinished();
         q('#bpBan').disabled = !canPlay;
         q('#bpLock').disabled = !canPlay;
         q('#bpReroll').disabled = busy || game.rerollsRemaining === 0;
         q('#bpReroll').className = 'bp-tool' + (game.rerollsRemaining === 0 ? ' used' : mode === 'reroll' ? ' active' : '');
         q('#bpReroll').setAttribute('aria-pressed', String(mode === 'reroll'));
         q('#bpRerollLabel').textContent = `重骰 · 剩 ${game.rerollsRemaining} 次`;
         q('#bpBan').className = 'bp-tool' + (mode === 'ban' ? ' active' : '');
         q('#bpLock').className = 'bp-tool lock-mode' + (mode === 'lock' ? ' active' : '');
         q('#bpBan').setAttribute('aria-pressed', String(mode === 'ban'));
         q('#bpLock').setAttribute('aria-pressed', String(mode === 'lock'));
         const locks = Object.values(groups).reduce((sum, group) => sum + group.game.cells.filter(cell => cell.locked).length, 0);
         q('#bpLockLabel').textContent = `鎖定 · 已鎖 ${locks} 格`;
         for (const [key, group] of Object.entries(groups))
         {
            const model = group.game;
            const grid = q(key === 'perk' ? '#bpPerkGrid' : '#bpAddonGrid');
            grid.replaceChildren();
            model.cells.forEach((cell, index) =>
            {
               const item = group.catalog[cell.name];
               const button = document.createElement('button');
               button.className = 'bp-cell' + (cell.banned ? ' banned' : '') + (cell.locked ? ' locked' : '');
               const allowed = !busy && (model.phase === 'player' || (model.phase === 'finished' && mode === 'reroll'));
               button.disabled = !allowed || cell.banned || cell.locked;
               button.title = `${item.zh || cell.name} / ${item.en || cell.name}${cell.banned ? ' · 已禁用' : cell.locked ? ' · 已鎖定' : ''}`;
               button.setAttribute('aria-label', button.title);
               const image = document.createElement('img');
               image.src = item.img || '';
               image.alt = item.zh || cell.name;
               image.draggable = false;
               button.appendChild(image);
               if (cell.banned || cell.locked)
               {
                  const mark = document.createElement('span');
                  mark.className = 'bp-mark ' + (cell.banned ? 'ban-mark' : 'lock-mark');
                  if (cell.banned) mark.textContent = '×';
                  else mark.innerHTML = icons.lock;
                  button.appendChild(mark);
               }
               button.onclick = () => takeTurn(index, key);
               grid.appendChild(button);
            });
         }
         if (allFinished() && !confirm)
         {
            confirm = document.createElement('button');
            confirm.className = 'bp-submit';
            confirm.textContent = groups.addon ? '套用 4 技能＋2 配件' : '套用這 4 個技能';
            confirm.onclick = () =>
            {
               if (disposed || applied || busy || !allFinished()) return;
               applied = true;
               const result = groups.addon ? {perks: groups.perk.game.result.slice(), addons: groups.addon.game.result.slice()} : groups.perk.game.result.slice();
               dispose();
               options.onComplete(result);
            };
            q('.bp-panel').appendChild(confirm);
         }
         if (confirm) confirm.disabled = busy;
      }
      function prompt()
      {
         if (mode === 'reroll') { help(`重骰模式：點上方技能或下方配件重新抽取，剩 ${game.rerollsRemaining} 次。兩區共用次數，不消耗回合。`); return; }
         if (allFinished()) { help('兩區已完成！確認後套用亮著的 4 個技能與 2 個配件。'); return; }
         help(mode === 'lock' ? '鎖定模式：點技能或配件格保護它。電腦同區禁用兩格、跨區隨機替換兩格；各區最後一回合不替換。' : '禁用模式：自由點選技能區或配件區禁用一格，電腦在同區禁用，但替換可能跨到另一區。技能四回合、配件兩回合，各區最後一回合不替換。');
      }
      function setMode(next)
      {
         if (disposed || busy || (allFinished() && next !== 'reroll') || (next === 'reroll' && game.rerollsRemaining === 0)) return;
         mode = mode === next && next !== 'ban' ? 'ban' : next;
         render();
         prompt();
      }
      async function fly(action)
      {
         const source = q(action.type === 'ban' ? '#bpComputerBan' : '#bpComputerSwap');
         const destination = cellElement(action.index, action.key || stage);
         source.classList.add('acting');
         if (source.getBoundingClientRect && destination.getBoundingClientRect)
         {
            const from = source.getBoundingClientRect(), to = destination.getBoundingClientRect();
            const token = document.createElement('div');
            token.className = 'bp-flying' + (action.type === 'replace' ? ' swap' : '');
            token.innerHTML = icons[action.type === 'ban' ? 'ban' : 'replace'];
            token.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
            overlay.appendChild(token);
            await animate(token, [{transform: 'translate(0,0) scale(1)'}, {transform: `translate(${to.left + to.width / 2 - from.left - from.width / 2}px,${to.top + to.height / 2 - from.top - from.height / 2}px) scale(1.2)`}], 560);
            token.remove();
         }
         source.classList.remove('acting');
      }
      async function takeTurn(index, key)
      {
         if (disposed || busy) return;
         activate(key);
         if (mode === 'reroll')
         {
            if (!game.reroll(index)) return;
            busy = true;
            render();
            help(stage === 'addon' ? '正在重骰配件…' : '正在重骰技能…');
            await animate(cellElement(index), [{transform: 'rotateY(90deg)', opacity: .2}, {transform: 'rotateY(0deg)', opacity: 1}], 420);
            if (disposed) return;
            busy = false;
            if (game.rerollsRemaining === 0) mode = 'ban';
            render();
            prompt();
            return;
         }
         if (!game.playerAction(index, mode)) return;
         busy = true;
         mode = 'ban';
         render();
         await animate(cellElement(index), [{transform: 'scale(.9)'}, {transform: 'scale(1)'}], 200);
         const replaced = new Set();
         while (!disposed && game.nextAction)
         {
            const action = game.nextAction;
            let target = {key: stage, index: action.index};
            if (action.type === 'replace')
            {
               const candidates = Object.entries(groups).flatMap(([key, group]) => group.game.canComputerReplace ? group.game.cells.map((cell, index) => ({key, index, cell})).filter(item => !item.cell.banned && !item.cell.locked && !replaced.has(item.key + ':' + item.index)) : []);
               if (!candidates.length) { game.applyComputerAction(action, () => true); continue; }
               target = candidates[Math.floor(Math.random() * candidates.length)];
            }
            help(`電腦正在${action.type === 'ban' ? '禁用' : '替換'}${target.key === 'addon' ? '配件' : '技能'}…`);
            await fly({...action, key: target.key, index: target.index});
            if (disposed) return;
            game.applyComputerAction(action, action.type === 'replace' ? () => groups[target.key].game.replaceByComputer(target.index) : null);
            if (action.type === 'replace') replaced.add(target.key + ':' + target.index);
            render();
            await animate(cellElement(target.index, target.key), action.type === 'ban' ? [{opacity: 1}, {opacity: .4}, {opacity: 1}] : [{transform: 'rotateY(90deg)', opacity: .2}, {transform: 'rotateY(0deg)', opacity: 1}], 340);
         }
         if (disposed) return;
         busy = false;
         render();
         prompt();
      }
      q('#bpBan').onclick = () => setMode('ban');
      q('#bpLock').onclick = () => setMode('lock');
      q('#bpReroll').onclick = () => setMode('reroll');
      const controller = {dispose};
      instances.add(controller);
      render();
      prompt();
      return controller;
   }
   window.BanPickCard = {createGame, open, disposeAll: () => { for (const instance of Array.from(instances)) instance.dispose(); }};
})();
;
/* END MERGED: ban-pick.js */

/* BEGIN MERGED: casino-cards.js */
(function()
{
   'use strict';
   const instances = new Set();
   function ensureStyles()
   {
      if (document.getElementById('casinoCardStyles')) return;
      const style = document.createElement('style');
      style.id = 'casinoCardStyles';
      style.textContent = `
      #card17GuessOverlay .card17-guess-panel,#card17RewardPickerOverlay .card17-picker-panel,#card17DuelOverlay .card17-duel-panel,#blackjackOverlay .bj-table,#blackjackRewardOverlay .bj-table{background:radial-gradient(ellipse at 50% 15%,#23734e,#12482f 65%,#0b3023)!important;border:9px solid #493024!important;outline:1px solid #a98042;box-shadow:0 25px 80px #0009,inset 0 0 0 2px #b79c5a,inset 0 0 75px #001d1670!important;color:#fff3d7}
      #card17GuessOverlay .card17-guess-panel,#card17RewardPickerOverlay .card17-picker-panel,#card17DuelOverlay .card17-duel-panel{background-image:repeating-linear-gradient(87deg,#ffffff02 0 1px,transparent 1px 4px),radial-gradient(ellipse at top,#23734e,#12482f 65%,#0b3023)!important}
      #blackjackOverlay{position:fixed;inset:0;z-index:100080;background:#080c0bed;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;font-family:inherit;color:#fff3d7;overflow:hidden}#blackjackOverlay *{box-sizing:border-box}.bj-table{position:relative;width:min(1050px,100%);max-height:94dvh;overflow-y:auto;overflow-x:hidden;border-radius:32px;padding:25px 30px 22px}.bj-title{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:20px}.bj-title h2{margin:0;font-size:30px}.bj-wager-label{border:1px solid #c9b16c;color:#ffe5a6;border-radius:50px;padding:8px 18px;font-size:14px}.bj-intro{text-align:center;padding:20px 10px}.bj-intro p{line-height:1.8;color:#e5eddb}.bj-bet-input{display:block;width:min(400px,95%);margin:24px auto 10px;accent-color:#e3c46f}.bj-bet-amount{font-size:40px;font-weight:800;color:#ffe5a6}.bj-button{font:inherit;cursor:pointer;padding:12px 27px;border:1px solid #dfc78c;background:#e4c47b;color:#2d2515;font-weight:800;border-radius:10px}.bj-button.secondary{background:#123c2c;color:#fff0c6}.bj-button:disabled{opacity:.4;cursor:default}.bj-seat{padding:12px 0}.bj-seat-label{display:flex;justify-content:space-between;gap:12px;font-size:14px;letter-spacing:.08em;color:#e0d9b7;margin-bottom:12px}.bj-hand{min-height:130px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center}.bj-card{width:88px;height:120px;flex:0 0 88px;display:flex;align-items:center;justify-content:center;border:1px solid #d6c38c;border-radius:10px;background:linear-gradient(135deg,#26382f,#0e1b16);box-shadow:0 4px 9px #0005;position:relative}.bj-card img{width:90%;height:90%;object-fit:contain;filter:drop-shadow(0 2px 3px #0008)}.bj-card.back{background:repeating-linear-gradient(45deg,#274d64 0 4px,#18384c 4px 8px);box-shadow:0 4px 9px #0005,inset 0 0 0 5px #dec994,inset 0 0 0 7px #18384c}.bj-card.back::after{content:'?';font-size:38px;color:#dfc98e;font-weight:900}.bj-divider{display:flex;align-items:center;gap:18px;margin:14px 0;color:#c4b67e99;font-size:12px;letter-spacing:.25em;text-align:center}.bj-divider::before,.bj-divider::after{content:'';height:1px;flex:1;background:#b8a66a66}.bj-formula{text-align:right;margin:18px 0;color:#ffedb6;font-size:clamp(19px,3vw,28px);font-weight:800;overflow-wrap:anywhere}.bj-controls{display:flex;justify-content:center;gap:15px;border-top:1px solid #c2b17666;padding-top:20px;margin-top:10px}.bj-status{min-height:28px;text-align:center;line-height:1.6;font-size:16px;margin:12px 0;color:#fff4cf}.bj-result{font-size:24px;font-weight:900}.bj-subtle{font-size:12px;color:#d0ddca}.bj-rules{text-align:center;font-size:12px;color:#d0ddca;margin:8px 0 0}
      @media(max-width:650px){#blackjackOverlay{padding:8px}.bj-table{padding:17px 12px;border-width:6px!important;border-radius:20px}.bj-card{width:64px;height:88px;flex-basis:64px}.bj-hand{gap:8px;min-height:96px}.bj-title h2{font-size:24px}.bj-wager-label{padding:6px 10px}.bj-controls{gap:9px}.bj-button{padding:11px 19px}}
      `;
      document.head.appendChild(style);
   }
   function createGame(catalog, random = Math.random)
   {
      const deck = Object.keys(catalog).filter(name => Number.isInteger(catalog[name].score) && catalog[name].score >= 0 && catalog[name].score <= 5);
      if (deck.length < 4) throw new Error('二十一點至少需要四個有效技能。');
      for (let i = deck.length - 1; i > 0; i--)
      {
         const j = Math.floor(random() * (i + 1));
         [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      const player = [], dealer = [];
      const total = hand => hand.reduce((sum, name) => sum + catalog[name].score, 0);
      let phase = 'ready', result = null;
      function resolve()
      {
         const p = total(player), d = total(dealer);
         result = p > 21 ? 'lose' : d > 21 || p > d ? 'win' : p < d ? 'lose' : 'push';
         phase = 'finished';
      }
      function start()
      {
         if (phase !== 'ready') return false;
         player.push(deck.shift()); dealer.push(deck.shift());
         player.push(deck.shift()); dealer.push(deck.shift());
         phase = 'player';
         return true;
      }
      function hit()
      {
         if (phase !== 'player' || !deck.length) return false;
         player.push(deck.shift());
         if (total(player) > 21) resolve();
         else if (total(player) === 21 || !deck.length) phase = 'dealer';
         return true;
      }
      function stand()
      {
         if (phase !== 'player') return false;
         phase = 'dealer';
         return true;
      }
      function dealerStep()
      {
         if (phase !== 'dealer') return false;
         let drew = false;
         if (total(dealer) < 17 && deck.length) { dealer.push(deck.shift()); drew = true; }
         if (total(dealer) >= 17 || !deck.length) resolve();
         return drew;
      }
      return {player, dealer, start, hit, stand, dealerStep,
         get phase() { return phase; }, get result() { return result; },
         get playerTotal() { return total(player); }, get dealerTotal() { return total(dealer); }};
   }
   function open(options)
   {
      ensureStyles();
      const catalog = options.catalog;
      const game = createGame(catalog);
      const maxWager = Math.max(1, options.maxWager || 5);
      let wager = 1, busy = false, disposed = false, applied = false;
      const animations = new Set();
      const overlay = document.createElement('div');
      overlay.id = 'blackjackOverlay';
      overlay.innerHTML = `
      <section class="bj-table" role="dialog" aria-modal="true" aria-label="二十一點">
         <header class="bj-title"><h2>二十一點</h2><span class="bj-wager-label">下注 <b id="bjWager">1</b> 點</span></header>
         <div class="bj-intro"><p>選擇下注點數。贏了獲得等額點數，輸了扣除等額點數。</p><input id="bjBet" class="bj-bet-input" aria-label="下注點數" type="range" min="1" max="${maxWager}" value="1"><div class="bj-bet-amount">1 點</div><p>技能原本的 0～5 分就是牌面點數；移到自己的技能牌上可查看分數。<br>莊家未滿 17 點必須要牌，超過 21 點爆牌。平手${options.tieRule === 'dealer' ? '算莊家贏' : '不加不扣'}。</p><button class="bj-button" id="bjStart">下注並開始</button></div>
         <div class="bj-game" hidden><div class="bj-seat"><div class="bj-seat-label"><span>莊家</span><span class="bj-dealer-total"></span></div><div class="bj-hand" id="bjDealer"></div></div><div class="bj-divider">BLACKJACK · 21</div><div class="bj-seat"><div class="bj-seat-label"><span>你的手牌</span><span class="bj-subtle">移到技能牌上查看點數</span></div><div class="bj-hand" id="bjPlayer"></div></div><div class="bj-formula" aria-live="polite"></div><div class="bj-status" role="status"></div><div class="bj-controls"><button class="bj-button" id="bjHit">進牌</button><button class="bj-button secondary" id="bjStand">停牌</button><button class="bj-button" id="bjConfirm" hidden>確認結果</button></div><p class="bj-rules">技能點數直接相加 · 21 點自動停牌 · 勝負按下注點數 1：1 結算</p></div>
      </section>`;
      document.body.appendChild(overlay);
      const q = selector => overlay.querySelector(selector);
      function dispose()
      {
         if (disposed) return;
         disposed = true;
         for (const animation of animations) animation.cancel();
         animations.clear();
         overlay.remove();
         instances.delete(controller);
      }
      async function animate(element)
      {
         if (disposed || !element || !element.animate) return;
         const animation = element.animate([{transform: 'translateX(140px) rotate(5deg)', opacity: 0}, {transform: 'translateX(0) rotate(0)', opacity: 1}], {duration: 380, easing: 'cubic-bezier(.2,.7,.25,1)'});
         animations.add(animation);
         try { await animation.finished; } catch (_) {} finally { animations.delete(animation); }
      }
      function render()
      {
         for (const who of ['dealer', 'player'])
         {
            const hand = q(who === 'dealer' ? '#bjDealer' : '#bjPlayer');
            hand.replaceChildren();
            game[who].forEach((name, index) =>
            {
               const card = document.createElement('div');
               const hidden = who === 'dealer' && index > 0 && game.phase === 'player';
               card.className = 'bj-card' + (hidden ? ' back' : '');
               if (hidden) card.setAttribute('aria-label', '莊家暗牌');
               else
               {
                  const item = catalog[name];
                  const image = document.createElement('img');
                  image.src = item.img || ''; image.alt = item.zh || name; image.draggable = false;
                  card.appendChild(image);
                  card.title = who === 'player' ? `${item.zh || name} · ${item.score} 分` : (item.zh || name);
                  card.setAttribute('aria-label', card.title);
               }
               hand.appendChild(card);
            });
         }
         q('.bj-formula').textContent = `${game.player.map(name => catalog[name].score).join('+')}=${game.playerTotal}/21`;
         q('.bj-dealer-total').textContent = game.phase === 'finished' ? `${game.dealerTotal} 點` : '';
         q('#bjHit').disabled = busy || game.phase !== 'player';
         q('#bjStand').disabled = busy || game.phase !== 'player';
         const done = game.phase === 'finished';
         q('#bjHit').hidden = done; q('#bjStand').hidden = done; q('#bjConfirm').hidden = !done;
         q('#bjConfirm').disabled = busy;
         if (done)
         {
            const result = game.result === 'push' && options.tieRule === 'dealer' ? 'lose' : game.result;
            q('.bj-status').className = 'bj-status bj-result';
            q('.bj-status').textContent = result === 'win' ? `你贏了！＋${wager} 點` : result === 'lose' ? `${game.playerTotal > 21 ? '爆牌！' : '莊家勝出！'}－${wager} 點` : '平手 · 不加不扣';
         }
      }
      async function dealerTurn()
      {
         while (!disposed && game.phase === 'dealer')
         {
            const drew = game.dealerStep();
            render();
            if (drew) await animate(q('#bjDealer').children[game.dealer.length - 1]);
         }
      }
      q('#bjBet').oninput = () =>
      {
         wager = Math.max(1, Math.min(maxWager, Number(q('#bjBet').value) || 1));
         q('#bjWager').textContent = String(wager);
         q('.bj-bet-amount').textContent = wager + ' 點';
      };
      q('#bjStart').onclick = async () =>
      {
         if (disposed || busy || !game.start()) return;
         busy = true; q('.bj-intro').hidden = true; q('.bj-game').hidden = false;
         render();
         const dealt = [q('#bjPlayer').children[0], q('#bjDealer').children[0], q('#bjPlayer').children[1], q('#bjDealer').children[1]];
         dealt.forEach(card => {card.style.visibility = 'hidden';});
         for (const card of dealt) {if (disposed) return; card.style.visibility = 'visible'; await animate(card);}
         if (disposed) return;
         busy = false; q('.bj-status').textContent = '選擇進牌，或停牌交給莊家。'; render();
      };
      q('#bjHit').onclick = async () =>
      {
         if (disposed || busy || !game.hit()) return;
         busy = true; render(); await animate(q('#bjPlayer').children[game.player.length - 1]);
         if (disposed) return;
         if (game.phase === 'dealer') q('.bj-status').textContent = '莊家進牌中…';
         await dealerTurn(); if (disposed) return;
         busy = false; render();
      };
      q('#bjStand').onclick = async () =>
      {
         if (disposed || busy || !game.stand()) return;
         busy = true; q('.bj-status').textContent = '莊家進牌中…'; render();
         await dealerTurn(); if (disposed) return;
         busy = false; render();
      };
      q('#bjConfirm').onclick = () =>
      {
         if (disposed || busy || applied || game.phase !== 'finished') return;
         applied = true;
         const result = game.result === 'push' && options.tieRule === 'dealer' ? 'lose' : game.result;
         dispose(); options.onComplete(result, wager);
      };
      const controller = {dispose}; instances.add(controller); return controller;
   }
   ensureStyles();
   window.CasinoCards = {createGame, open, ensureStyles, disposeAll: () => {for (const instance of Array.from(instances)) instance.dispose();}};
})();
;
/* END MERGED: casino-cards.js */

/* BEGIN MERGED: casino-duel.js */
(function()
{
   'use strict';
   const api = window.CasinoCards;
   const instances = new Set();
   const originalDispose = api.disposeAll;
   const specials = {return: ['收回成命', '移除自己指定的一張牌（至少保留一張）。'], force: ['強迫進牌', '強迫莊家額外抽一張牌。'], redraw: ['重新洗命', '將自己最後一張牌換成牌庫中的另一張。'], swap: ['交換命運', '指定自己與莊家各一張牌，互相交換。'], limit24: ['突破極限', '將雙方本局的分數上限改成 24 分。'], limit18: ['步步為營', '將雙方本局的分數上限改成 18 分。'], insurance: ['保本護身', '選擇後自動生效，本局輸了不扣分、不重抽。']};
   function sampleSpecials(random = Math.random)
   {
      const keys = Object.keys(specials);
      for (let i = keys.length - 1; i > 0; i--) {const j = Math.floor(random() * (i + 1)); [keys[i], keys[j]] = [keys[j], keys[i]];}
      return keys.slice(0, 3);
   }
   specials.insight = ['明察秋毫', '揭曉指定莊家牌的分數，再決定是否拿到自己手裡。'];
   specials.insurance[1] = '選擇後自動生效：輸了固定扣 5 分，贏了按下注點數獲得獎勵。';
   function createDuel(catalog, random = Math.random, settings = {})
   {
      const deck = Object.keys(catalog).filter(name => Number.isInteger(catalog[name].score) && catalog[name].score >= 0 && catalog[name].score <= 5);
      if (deck.length < 6) throw new Error('至少需要六個技能。');
      for (let i = deck.length - 1; i > 0; i--)
      {
         const j = Math.floor(random() * (i + 1));
         [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      const player = [], dealer = [], known = new Set(), notes = new Map();
      const specialKeys = Object.keys(specials).filter(key => key !== 'insurance');
      const dealerSpecial = specials[settings.dealerSpecial] ? settings.dealerSpecial : specialKeys[Math.floor(random() * specialKeys.length)];
      let dealerAction = null;
      let revealed = null;
      let phase = 'ready', special = 'return', used = false, exchange = null, result = null, dealerBeforeExchange = null, limit = 21;
      const score = name => catalog[name].score;
      const total = hand => hand.reduce((sum, name) => sum + score(name), 0);
      const outcome = (p, d, cap = limit) => p > cap && d > cap ? 'push' : p > cap ? 'lose' : d > cap || p > d ? 'win' : p < d ? 'lose' : 'push';
      function draw(hand)
      {
         if (!deck.length) return false;
         const name = deck.shift(); hand.push(name);
         if (hand === player) known.add(name);
         return true;
      }
      function start(type)
      {
         if (phase !== 'ready' || !specials[type]) return false;
         special = type;
         for (let i = 0; i < 3; i++) {draw(player); draw(dealer);}
         phase = 'player'; return true;
      }
      function hit()
      {
         if (revealed || phase !== 'player' || total(player) >= limit) return false;
         return draw(player);
      }
      function stand()
      {
         if (revealed || phase !== 'player') return false;
         phase = 'dealer'; return true;
      }
      function dealerStep()
      {
         if (phase !== 'dealer' || total(dealer) >= 18 || !deck.length) return false;
         return draw(dealer);
      }
      function exchangeCards()
      {
         if (phase !== 'dealer' || (total(dealer) < 18 && deck.length)) return false;
         const p = total(player), d = total(dealer);
         dealerBeforeExchange = d;
         const rank = value => value === 'lose' ? 2 : value === 'push' ? 1 : 0;
         const baseline = rank(outcome(p, d));
         let best = baseline, options = [];
         if (dealerSpecial === 'swap') player.forEach((pn, pi) => dealer.forEach((dn, di) =>
         {
            if (score(pn) === score(dn)) return;
            const value = rank(outcome(p - score(pn) + score(dn), d - score(dn) + score(pn)));
            if (value > best) {best = value; options = [{pi, di, playerCard: pn, dealerCard: dn}];}
            else if (value === best && value > baseline) options.push({pi, di, playerCard: pn, dealerCard: dn});
         }));
         if (dealerSpecial === 'swap' && options.length)
         {
            exchange = {...options[Math.floor(random() * options.length)], playerBefore: p, dealerBefore: d};
            player[exchange.pi] = exchange.dealerCard; dealer[exchange.di] = exchange.playerCard;
            exchange.playerAfter = total(player); exchange.dealerAfter = total(dealer);
            known.add(exchange.dealerCard);
            dealerAction = {type:'swap', ...exchange};
         }
         else if (dealerSpecial === 'return' && dealer.length > 1)
         {
            const candidates = dealer.map((name, index) => ({index, value:rank(outcome(p, d - score(name)))})).filter(option => option.value > baseline);
            if (candidates.length)
            {
               const highest = Math.max(...candidates.map(option => option.value));
               const candidatesBest = candidates.filter(option => option.value === highest);
               const selected = candidatesBest[Math.floor(random() * candidatesBest.length)];
               const removed = dealer.splice(selected.index, 1)[0]; dealerAction = {type:'return', removed};
            }
         }
         else if ((dealerSpecial === 'force' || dealerSpecial === 'redraw') && deck.length)
         {
            const expected = deck.reduce((sum, name) => sum + rank(dealerSpecial === 'force' ? outcome(p + score(name), d) : outcome(p, d - score(dealer[dealer.length - 1]) + score(name))), 0) / deck.length;
            if (expected > baseline)
            {
               if (dealerSpecial === 'force') draw(player);
               else {dealer.pop(); draw(dealer);}
               dealerAction = {type:dealerSpecial};
            }
         }
         else if (dealerSpecial === 'limit24' || dealerSpecial === 'limit18')
         {
            const cap = dealerSpecial === 'limit24' ? 24 : 18;
            if (rank(outcome(p, d, cap)) > baseline) {limit = cap; dealerAction = {type:dealerSpecial};}
         }
         else if (dealerSpecial === 'insight')
         {
            const candidates = player.map((name, index) => ({index, value:rank(outcome(p - score(name), d + score(name)))})).filter(option => option.value > baseline);
            if (candidates.length)
            {
               const highest = Math.max(...candidates.map(option => option.value));
               const best = candidates.filter(option => option.value === highest);
               const selected = best[Math.floor(random() * best.length)];
               const taken = player.splice(selected.index, 1)[0]; dealer.push(taken); dealerAction = {type:'insight', taken};
            }
         }
         if (dealerAction) Object.assign(dealerAction, {playerBefore:p, dealerBefore:d, playerAfter:total(player), dealerAfter:total(dealer), limitAfter:limit});
         phase = 'response'; return dealerAction;
      }
      function canUse()
      {
         if (special === 'insurance' || used || !['player', 'response'].includes(phase)) return false;
         if (special === 'return') return player.length > 1;
         if (special === 'insight') return dealer.length > 0;
         if (special === 'swap') return player.length > 0 && dealer.length > 0;
         if (special === 'limit24' || special === 'limit18') return true;
         return deck.length > 0;
      }
      function useSpecial(selection = {})
      {
         if (!canUse()) return false;
         if (special === 'insight') return false;
         if (special === 'return')
         {
            if (!Number.isInteger(selection.playerIndex) || selection.playerIndex < 0 || selection.playerIndex >= player.length) return false;
            player.splice(selection.playerIndex, 1);
         }
         else if (special === 'swap')
         {
            const p = selection.playerIndex, d = selection.dealerIndex;
            if (!Number.isInteger(p) || !Number.isInteger(d) || p < 0 || p >= player.length || d < 0 || d >= dealer.length) return false;
            [player[p], dealer[d]] = [dealer[d], player[p]];
            known.add(player[p]);
         }
         else if (special === 'limit24') limit = 24;
         else if (special === 'limit18') limit = 18;
         else if (special === 'force') draw(dealer);
         else {player.pop(); draw(player);}
         used = true; return true;
      }
      function finish()
      {
         if (revealed || phase !== 'response') return false;
         result = outcome(total(player), total(dealer)); phase = 'finished'; return true;
      }
      function revealDealer(index)
      {
         if (special !== 'insight' || !canUse() || !Number.isInteger(index) || index < 0 || index >= dealer.length) return false;
         revealed = dealer[index]; known.add(revealed); used = true; return true;
      }
      function takeRevealed(take)
      {
         if (!revealed) return false;
         if (take)
         {
            const index = dealer.indexOf(revealed);
            if (index < 0) return false;
            player.push(dealer.splice(index, 1)[0]);
         }
         revealed = null; return true;
      }
      return {player, dealer, known, notes, start, hit, stand, dealerStep, exchangeCards, canUse, useSpecial, revealDealer, takeRevealed, finish,
         get phase() {return phase;}, get special() {return special;}, get used() {return used;}, get exchange() {return exchange;},
         get dealerBeforeExchange() {return dealerBeforeExchange;},
         get dealerSpecial() {return dealerSpecial;}, get dealerAction() {return dealerAction;},
         get limit() {return limit;},
         get lossAmount() {return special === 'insurance' ? 5 : null;},
         get result() {return result;}, get playerTotal() {return total(player);}, get dealerTotal() {return total(dealer);}};
   }
   function open(options)
   {
      api.ensureStyles();
      if (!document.getElementById('casinoDuelStyles'))
      {
         const style = document.createElement('style'); style.id = 'casinoDuelStyles';
         style.textContent = '.bj-special-options{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:18px 0}.bj-special-choice{flex:1;min-width:150px;max-width:260px;padding:15px;background:#123c2c;color:#fff0c6;border:1px solid #8b9c75;border-radius:12px;cursor:pointer;font:inherit}.bj-special-choice[aria-pressed="true"]{border:2px solid #ffe49b;background:#306448}.bj-special-choice small{display:block;margin-top:8px;line-height:1.6}.bj-duel-tools{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:15px 0}.bj-note-card{display:flex;flex-direction:column;align-items:center;gap:6px}.bj-note-select{max-width:100px;background:#173c2b;color:#fff0c6;border:1px solid #b9a46c;border-radius:6px;padding:5px;font:inherit;font-size:12px}.bj-card .bj-card-score{position:absolute;bottom:3px;right:5px;padding:2px 6px;border-radius:5px;background:#081c16e8;color:#ffe49b;font-weight:bold}.bj-note-result{font-size:12px;color:#ffedb6}.bj-estimate{text-align:right;color:#d5d8c3;font-size:14px;line-height:1.7;margin-top:10px}.bj-dealer-special{font-size:13px;color:#ffe5a6;text-align:center;line-height:1.7}.bj-duel-log{min-height:24px;color:#ffe5a6;text-align:center;line-height:1.6}.bj-duel-controls{flex-wrap:wrap}.bj-special-used{opacity:.55}';
         document.head.appendChild(style);
      }
      const game = createDuel(options.catalog), catalog = options.catalog;
      const offeredSpecials = sampleSpecials();
      let selected = offeredSpecials[0], wager = 1, busy = false, disposed = false, applied = false, popup = null, specialExpanded = false, targeting = null;
      const animations = new Set();
      const overlay = document.createElement('div'); overlay.id = 'blackjackOverlay';
      overlay.innerHTML = `<section class="bj-table" role="dialog" aria-modal="true" aria-label="二十一點"><header class="bj-title"><h2>二十一點</h2><span class="bj-wager-label">下注 <b id="bjWager">1</b> 點</span></header><div class="bj-intro"><div class="bj-setup-layout"><div class="bj-setup-cards"><h3 class="bj-setup-heading">特殊牌</h3><p class="bj-special-introduction">特殊牌可以改變手牌，幫助你逆轉局勢。<br>選擇一張，本局可使用一次。</p><div class="bj-special-options"></div></div><div class="bj-setup-wager"><h3 class="bj-setup-heading">賭注</h3><div class="bj-wager-center"><div class="bj-bet-amount">1 點</div><div class="bj-chip-holder"></div><input id="bjBet" class="bj-bet-input" aria-label="下注點數" type="range" min="1" max="${Math.max(1, Math.min(15, options.maxWager || 5))}" value="1"><button class="bj-button" id="bjStart">下注並開始</button></div></div></div></div><div class="bj-game" hidden><div class="bj-game-scroll"><div class="bj-dealer-special"></div><div class="bj-seat"><div class="bj-seat-label"><span>莊家</span><span class="bj-dealer-total"></span></div><div class="bj-hand" id="bjDealer"></div><div class="bj-estimate"></div></div><div class="bj-divider">BLACKJACK · 21</div><div class="bj-seat"><div class="bj-seat-label"><span>你的手牌</span><span class="bj-subtle">點擊卡牌查看分數</span></div><div class="bj-hand" id="bjPlayer"></div></div><div class="bj-formula"></div><div class="bj-duel-log" aria-live="polite"></div><div class="bj-status" role="status"></div><div class="bj-duel-tools"><button class="bj-button secondary" id="bjSpecial" aria-expanded="false"></button><div class="bj-special-detail" hidden><div><b id="bjSpecialName"></b><p id="bjSpecialDescription"></p></div><button class="bj-button" id="bjUseSpecial">使用</button></div></div></div><div class="bj-controls bj-duel-controls"><button class="bj-button" id="bjHit">進牌</button><button class="bj-button secondary" id="bjStand">停牌</button><button class="bj-button" id="bjReveal" hidden>結算並揭曉分數</button><button class="bj-button" id="bjConfirm" hidden>確認結果</button></div></div></section>`;
      document.body.appendChild(overlay);
      const q = selector => overlay.querySelector(selector);
      const chipStyle = document.createElement('style');
      chipStyle.textContent = '.bj-chip-piles{height:94px;display:flex;align-items:flex-end;justify-content:center;gap:8px;margin:8px auto 2px;max-width:100%;pointer-events:none}.bj-chip-pile{position:relative;width:53px;height:84px;flex:0 1 53px}.bj-chip{position:absolute;left:0;bottom:calc(var(--chip-level)*10px);width:100%;height:22px;box-sizing:border-box;border:2px solid #fff0bd;border-radius:50%;background:repeating-conic-gradient(from 12deg,#e8d9a8 0deg 13deg,#ad3444 13deg 58deg,#e8d9a8 58deg 71deg,#ad3444 71deg 120deg);box-shadow:0 4px 0 #722633,0 5px 0 #e1bf70,0 7px 5px #0007;animation:bjChipDrop .18s ease-out both}.bj-chip::after{content:"";position:absolute;inset:3px 9px;border:1px dashed #efd3a5;border-radius:50%;background:#922f3d}.bj-chip-pile:nth-child(3n+2) .bj-chip{filter:hue-rotate(115deg)}.bj-chip-pile:nth-child(3n) .bj-chip{filter:hue-rotate(205deg)}.bj-wager-limit{font-size:13px;font-weight:400;color:#e3d9b8;margin-top:5px}@keyframes bjChipDrop{from{transform:translateY(-9px);opacity:.25}to{transform:translateY(0);opacity:1}}@media(max-width:500px){.bj-chip-piles{gap:5px}.bj-chip-pile{width:40px;flex-basis:40px}.bj-chip::after{inset:3px 7px}}';
      overlay.appendChild(chipStyle);
      chipStyle.textContent += `
         #blackjackOverlay .bj-table{display:flex;flex-direction:column;overflow:hidden}
         #blackjackOverlay .bj-title{flex:0 0 auto}
         #blackjackOverlay .bj-intro{overflow-y:auto;min-height:0}
         #blackjackOverlay .bj-game{display:flex;flex-direction:column;min-height:0;overflow:hidden}
         #blackjackOverlay .bj-game[hidden],#blackjackOverlay .bj-intro[hidden]{display:none}
         .bj-game-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 5px 6px;scrollbar-width:thin}
         #blackjackOverlay .bj-duel-controls{flex:0 0 auto;margin:0;padding:13px 0 0;background:#103e2c;border-top:1px solid #bba36588;position:relative;z-index:1}
         @media(max-height:850px){#blackjackOverlay .bj-title{margin-bottom:10px}#blackjackOverlay .bj-game .bj-seat{padding:7px 0}#blackjackOverlay .bj-game .bj-hand{min-height:148px}#blackjackOverlay .bj-game .bj-card{height:116px;flex-basis:116px;width:80px}.bj-note-card{width:80px}.bj-seat-label{margin-bottom:7px}.bj-divider{margin:8px 0}.bj-formula{margin:10px 0;font-size:25px}.bj-duel-tools{min-height:86px;margin:9px 0}#blackjackOverlay #bjSpecial{height:85px;width:85px;flex-basis:85px}.bj-status{margin:7px 0;min-height:23px}.bj-above-score{height:22px;line-height:22px;font-size:20px}}
      `;
      chipStyle.textContent += `
         #blackjackOverlay .bj-game .bj-hand{gap:14px;min-height:170px;padding:8px 0 5px;align-items:flex-start}
         #blackjackOverlay .bj-game .bj-card{width:94px;height:140px;flex:0 0 140px;padding:6px;border:1px solid #d9bd71;border-radius:11px;background:linear-gradient(145deg,#244353,#142c39 48%,#0b1923);box-shadow:0 4px 0 #07121b,0 9px 12px #0005;cursor:pointer;transition:border-color .15s,transform .15s}
         #blackjackOverlay .bj-game .bj-card img{width:95%;height:85%;object-fit:contain}
         #blackjackOverlay .bj-game .bj-card:hover{border-color:#ffdf8d;transform:translateY(-3px)}
         #blackjackOverlay .bj-game .bj-card:focus-visible{outline:2px solid #ffe39a;outline-offset:4px}
         .bj-note-card{gap:7px;width:94px}
         .bj-above-score{height:25px;line-height:25px;font-size:22px;color:#ffedb6;font-weight:800;text-align:center}
         .bj-duel-tools{justify-content:flex-start;align-items:center;gap:14px;min-height:102px;margin:16px 0}
         #bjSpecial{flex:0 0 102px;width:102px;height:102px;padding:8px;font-size:17px;line-height:1.6;border:1px solid #d9bd71;background:linear-gradient(145deg,#244353,#0b1923);box-shadow:0 4px 9px #0005}
         #bjSpecial small{display:block;font-size:13px;font-weight:400}
         #bjSpecial[aria-expanded="true"]{border-color:#ffe39a;box-shadow:0 0 7px #eacb6f66}
         .bj-special-detail{flex:1;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 21px;background:#072b2080;border:1px solid #a48b4e;border-radius:12px}
         .bj-special-detail[hidden]{display:none}.bj-special-detail b{font-size:21px}.bj-special-detail p{margin:6px 0 0;line-height:1.7;font-size:15px}.bj-special-detail .bj-button{flex-shrink:0}
         .bj-card-popup-shade{position:fixed;inset:0;z-index:3;background:#0009;display:flex;align-items:center;justify-content:center;padding:18px}
         .bj-card-popup{position:relative;width:min(360px,100%);padding:28px 25px 24px;border:1px solid #e2c577;border-radius:16px;background:linear-gradient(145deg,#132e35,#07191e);box-shadow:0 20px 70px #0009;text-align:center;color:#fff0c6}
         .bj-card-popup h3{margin:0 20px 15px;font-size:23px}.bj-card-popup img{display:block;width:112px;height:112px;object-fit:contain;margin:12px auto}.bj-popup-score{font-size:30px;font-weight:800;margin:16px 0}.bj-popup-close{position:absolute;right:12px;top:9px;background:none;border:0;color:#f4d99c;font-size:28px;cursor:pointer}.bj-popup-prompt{display:block;line-height:1.7;margin:12px 0 9px}.bj-guess-input{width:100%;padding:12px 14px;font:inherit;font-size:24px;color:#fff0c6;caret-color:#ffe09b;background:#051a20;border:1px solid #d5b769;border-radius:8px;outline:none}.bj-guess-input:focus{border-color:#ffe29c;box-shadow:0 0 0 2px #e5c47733}.bj-popup-hint{font-size:12px;color:#d4ceb2;margin:8px 0 14px}.bj-popup-error{font-size:13px;color:#ffaca7;min-height:20px}.bj-popup-actions{display:flex;gap:12px;justify-content:center}.bj-popup-actions .bj-button{flex:1;padding:11px 16px}
         @media(max-width:650px){#blackjackOverlay .bj-game .bj-card{width:76px;height:114px;flex-basis:114px}.bj-note-card{width:76px}#blackjackOverlay .bj-game .bj-hand{min-height:146px;gap:11px}.bj-special-detail{padding:12px;gap:10px}.bj-special-detail b{font-size:18px}.bj-special-detail p{font-size:13px}.bj-special-detail .bj-button{padding:11px 15px}#bjSpecial{flex-basis:85px;width:85px;height:85px;font-size:15px}}
      `;
      chipStyle.textContent += `
         #blackjackOverlay .bj-table{width:min(1180px,100%)}
         .bj-intro{padding:16px 4px 8px;text-align:left}
         .bj-setup-layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(270px,1fr);gap:30px}
         .bj-setup-heading{font-size:27px;margin:0 0 19px;font-weight:800;color:#fff0c6}
         .bj-setup-heading::after{content:'';display:block;width:100px;height:1px;background:#d4b865;margin-top:13px}
         .bj-intro .bj-special-introduction{font-size:15px;line-height:1.8;margin:0 0 27px;color:#fff0d1}
         .bj-special-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0;padding:9px 0}
         .bj-special-choice{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;min-width:0;max-width:none;width:100%;min-height:305px;aspect-ratio:.61;padding:24px 14px;border:2px solid #96aebe;border-radius:16px;background:linear-gradient(145deg,#234659,#142c3a 48%,#0a1823);color:#fff4d5;box-shadow:0 5px 0 #0a131c,0 12px 16px #0007;transition:transform .18s,border-color .18s,box-shadow .18s;text-shadow:0 1px 2px #0008}
         .bj-special-choice b{font-size:clamp(20px,2.2vw,28px);font-weight:800;white-space:nowrap;line-height:1.4}
         .bj-special-choice small{font-size:15px;line-height:1.9;margin:0;width:100%;text-align:center;border-top:1px solid #7f9daa88;padding-top:24px;overflow-wrap:anywhere}
         .bj-special-choice[aria-pressed="true"]{border:3px solid #f0cf7a;background:linear-gradient(145deg,#294c5e,#173342 48%,#0a1a25);transform:translateY(-8px);box-shadow:0 5px 0 #826e35,0 12px 20px #0008,0 0 10px #edcf7240}
         .bj-special-choice:hover{transform:translateY(-5px)}
         .bj-special-choice[aria-pressed="true"]:hover{transform:translateY(-8px)}
         .bj-special-choice:focus-visible{outline:2px solid #fff3b4;outline-offset:4px}
         .bj-setup-wager{border-left:1px solid #c6a84999;padding-left:28px;display:flex;flex-direction:column}
         .bj-wager-center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:19px;padding:12px 0 7px;min-width:0}
         .bj-bet-amount{font-size:clamp(42px,5vw,66px);font-weight:800;line-height:1.2;color:#ffe4a0;text-align:center}
         .bj-chip-holder{width:100%;min-height:112px;display:flex;align-items:center;justify-content:center}
         .bj-chip-piles{width:100%;height:108px;gap:7px;margin:0;align-items:flex-end}
         .bj-chip-pile{width:60px;flex:0 1 60px;height:100px;min-width:0}
         .bj-chip{height:25px;bottom:calc(var(--chip-level)*13px);box-shadow:0 4px 0 #722633,0 5px 0 #e1bf70,0 8px 5px #0007}
         .bj-setup-wager .bj-bet-input{width:100%;margin:5px 0 15px;cursor:pointer}
         .bj-setup-wager #bjStart{width:100%;max-width:310px;padding:17px 15px;font-size:20px;background:linear-gradient(135deg,#f4d68a,#dfb857);border-color:#f4d68a;box-shadow:0 5px 12px #0003}
         @media(max-width:900px){.bj-setup-layout{grid-template-columns:minmax(0,1.6fr) minmax(220px,1fr);gap:18px}.bj-setup-wager{padding-left:18px}.bj-special-options{gap:8px}.bj-special-choice{padding:18px 9px;min-height:280px}.bj-special-choice b{font-size:19px}.bj-special-choice small{font-size:13px}}
         @media(max-width:700px){.bj-setup-layout{grid-template-columns:1fr;gap:25px}.bj-setup-wager{border-left:0;border-top:1px solid #c6a84999;padding:20px 0 0}.bj-special-choice{min-height:235px;aspect-ratio:.68}.bj-special-choice b{font-size:clamp(17px,4vw,24px)}.bj-special-introduction{font-size:14px}.bj-wager-center{gap:12px}.bj-setup-heading{font-size:23px}.bj-setup-wager .bj-bet-input{max-width:360px}.bj-bet-amount{font-size:45px}.bj-chip-piles{max-width:360px}.bj-special-options{padding-top:7px}}
         @media(prefers-reduced-motion:reduce){.bj-chip{animation:none}.bj-special-choice{transition:none}}
      `;
      chipStyle.textContent += `
         #blackjackOverlay .bj-table{max-height:94dvh;padding-top:16px;padding-bottom:16px}
         #blackjackOverlay .bj-game{flex:1 1 auto;overflow:hidden}
         #blackjackOverlay .bj-game-scroll{display:flex;flex-direction:column;overflow:hidden;padding:0 3px 3px}
         #blackjackOverlay .bj-game .bj-seat{flex:1 1 auto;min-height:0;padding:4px 0}
         #blackjackOverlay .bj-game .bj-seat-label{margin-bottom:4px;font-size:13px;line-height:1.4}
         #blackjackOverlay .bj-game .bj-hand{min-height:0;gap:clamp(3px,1vw,12px);padding:3px 0;flex-wrap:nowrap;align-items:flex-start}
         #blackjackOverlay .bj-game .bj-note-card{width:clamp(42px,9.5dvh,80px);flex:0 1 clamp(42px,9.5dvh,80px);min-width:0;gap:4px}
         #blackjackOverlay .bj-game .bj-card{width:100%;height:clamp(64px,14dvh,116px);flex:0 0 auto;min-width:0;padding:3px}
         #blackjackOverlay .bj-game .bj-above-score{height:20px;line-height:20px;font-size:19px}
         #blackjackOverlay .bj-game .bj-divider{margin:6px 0;line-height:1.3;font-size:10px;flex-shrink:0}
         #blackjackOverlay .bj-game .bj-estimate{font-size:12px;line-height:1.4;margin-top:4px}
         #blackjackOverlay .bj-game .bj-formula{font-size:clamp(18px,3dvh,25px);margin:6px 0;line-height:1.3;flex-shrink:0}
         #blackjackOverlay .bj-game .bj-duel-tools{min-height:0;height:auto;margin:7px 0;gap:12px;flex-wrap:nowrap;flex-shrink:0}
         #blackjackOverlay #bjSpecial{width:72px;height:72px;flex:0 0 72px;font-size:14px;padding:5px;line-height:1.5}
         #blackjackOverlay #bjSpecial small{font-size:11px}
         #blackjackOverlay .bj-special-detail{padding:10px 15px;gap:12px}
         #blackjackOverlay .bj-special-detail b{font-size:18px}
         #blackjackOverlay .bj-special-detail p{font-size:13px;line-height:1.5;margin-top:4px}
         #blackjackOverlay .bj-special-detail .bj-button{padding:9px 20px}
         #blackjackOverlay .bj-game .bj-status{min-height:0;margin:4px 0;line-height:1.4;font-size:14px;flex-shrink:0}
         #blackjackOverlay .bj-game .bj-status.bj-result{font-size:22px}
         #blackjackOverlay .bj-game .bj-duel-log{min-height:0;line-height:1.4;font-size:12px;flex-shrink:0;overflow-wrap:anywhere}
         #blackjackOverlay .bj-game .bj-dealer-special{font-size:12px;line-height:1.4;margin-bottom:3px;flex-shrink:0}
         #blackjackOverlay .bj-duel-controls{padding-top:10px}
         @media(max-height:700px){#blackjackOverlay .bj-title{margin-bottom:5px}#blackjackOverlay .bj-title h2{font-size:25px}#blackjackOverlay .bj-game .bj-card{height:clamp(52px,12dvh,85px)}#blackjackOverlay .bj-game .bj-note-card{width:56px;flex-basis:56px}#blackjackOverlay .bj-game .bj-duel-tools{margin:4px 0}#blackjackOverlay #bjSpecial{height:58px;width:68px;flex-basis:68px;font-size:13px}#blackjackOverlay .bj-duel-controls .bj-button{padding:8px 20px}#blackjackOverlay .bj-game .bj-divider{margin:3px 0}}
      `;
      chipStyle.textContent += `
         .bj-chip-mound{position:relative;isolation:isolate;width:min(100%,300px);height:160px;pointer-events:none;perspective:650px}
         .bj-scatter-item{position:absolute;width:59px;height:59px;transform-origin:center;filter:drop-shadow(2px 5px 3px #0006)}
         .bj-chip-mound .bj-chip{position:relative;display:block;left:auto;bottom:auto;width:59px;height:59px;border:2px solid #f3e5bd;border-radius:50%;background:repeating-conic-gradient(from 9deg,var(--chip-color) 0deg 35deg,#f6e9c8 35deg 49deg,var(--chip-color) 49deg 60deg);box-shadow:0 4px 0 var(--chip-edge),0 7px 0 var(--chip-edge),0 8px 0 #e6d7ac;transform:rotateX(var(--chip-tilt));animation:bjMoundDrop .2s ease-out both}
         .bj-chip-mound .bj-chip::after{inset:9px;border:1px dashed #f6e6bd;border-radius:50%;background:var(--chip-color);box-shadow:inset 0 0 0 3px #ffffff0c}
         @keyframes bjMoundDrop{from{opacity:0;translate:0 -11px}to{opacity:1;translate:0 0}}
         @media(prefers-reduced-motion:reduce){.bj-chip-mound .bj-chip{animation:none}}
      `;
      const chipColors = [['#b9313f','#762532'],['#388847','#235e31'],['#2677b8','#174e83'],['#bb9134','#806021'],['#8950a7','#54306e']];
      const chipStacks = [{count:5,x:28,y:45},{count:4,x:65,y:31},{count:3,x:39,y:18},{count:2,x:72,y:6},{count:1,x:27,y:0,leaning:true}];
      const chipPositions = [];
      chipStacks.forEach((stack, column) =>
      {
         for (let level = 0; level < stack.count; level++)
         {
            chipPositions.push({x:stack.x, y:stack.y + level * 10,
               angle:stack.leaning ? 22 : 0, tilt:stack.leaning ? 12 : 54, leaning:!!stack.leaning,
               color:chipColors[column], z:10 + column * 20 + level});
         }
      });
      const chipMound = document.createElement('div'); chipMound.className = 'bj-chip-mound'; chipMound.setAttribute('role', 'img');
      chipStyle.textContent += `
         .bj-chip-mound .bj-chip-leaning .bj-chip{box-shadow:0 1px 0 var(--chip-edge),0 2px 0 #dccb9d;border-width:1px}
         #blackjackOverlay .bj-special-options{grid-template-columns:repeat(3,minmax(0,1fr));gap:13px 10px}
         #blackjackOverlay .bj-special-choice{aspect-ratio:.61;min-height:280px;padding:23px 12px;gap:25px}
         #blackjackOverlay .bj-special-choice b{font-size:21px}
         #blackjackOverlay .bj-special-choice small{font-size:13px;padding-top:13px;line-height:1.7}
         #blackjackOverlay .bj-card.bj-target-eligible{border:2px solid #ffe39a;box-shadow:0 0 10px #f7da7955;cursor:crosshair}
         #blackjackOverlay .bj-card.bj-target-selected{border:2px solid #95e69d;box-shadow:0 0 12px #94e69c88;transform:translateY(-4px)}
         @media(max-height:750px){#blackjackOverlay .bj-special-choice{min-height:240px;padding:16px 9px;gap:17px}#blackjackOverlay .bj-special-choice small{font-size:12px;padding-top:14px}#blackjackOverlay .bj-special-choice b{font-size:19px}#blackjackOverlay .bj-intro .bj-special-introduction{margin-bottom:14px}}
      `;
      const chipNodes = [];
      q('.bj-chip-holder').replaceChildren(chipMound);
      function renderChips()
      {
         const amount = q('.bj-bet-amount'); amount.textContent = wager + ' 點';
         chipMound.setAttribute('aria-label', wager + ' 枚下注籌碼');
         while (chipNodes.length > wager) chipNodes.pop().remove();
         while (chipNodes.length < wager)
         {
            const layout = chipPositions[chipNodes.length];
            const wrapper = document.createElement('span'); wrapper.className = 'bj-scatter-item' + (layout.leaning ? ' bj-chip-leaning' : '');
            wrapper.style.cssText = `left:${layout.x}%;bottom:${layout.y}px;z-index:${layout.z};transform:translateX(-50%) rotate(${layout.angle}deg);--chip-tilt:${layout.tilt}deg;--chip-color:${layout.color[0]};--chip-edge:${layout.color[1]}`;
            const chip = document.createElement('span'); chip.className = 'bj-chip'; wrapper.appendChild(chip);
            chipMound.appendChild(wrapper); chipNodes.push(wrapper);
         }
      }
      function dispose()
      {
         if (disposed) return; disposed = true;
         if (popup) {popup.remove(); popup = null;}
         for (const animation of animations) animation.cancel();
         animations.clear(); overlay.remove(); instances.delete(controller);
      }
      async function animate(element, from = 'translateX(140px) rotate(5deg)')
      {
         if (disposed || !element || !element.animate) return;
         const animation = element.animate([{transform: from, opacity: 0}, {transform: 'translateX(0) rotate(0)', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.7,.25,1)'});
         animations.add(animation);
         try {await animation.finished;} catch (_) {} finally {animations.delete(animation);}
      }
      function openCard(name, who, trigger, offerTake = false)
      {
         if (busy || popup || disposed) return;
         const item = catalog[name];
         const known = who === 'player' || game.known.has(name) || game.phase === 'finished';
         const shade = document.createElement('div'); shade.className = 'bj-card-popup-shade'; popup = shade;
         const panel = document.createElement('div'); panel.className = 'bj-card-popup'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', known ? (item.zh || name) : '記錄猜測'); shade.appendChild(panel);
         let decided = false;
         const close = () =>
         {
            if (offerTake && !decided) {game.takeRevealed(false); decided = true;}
            shade.remove(); popup = null;
            if (offerTake && !disposed) render();
            if (!disposed && trigger && trigger.isConnected && trigger.focus) trigger.focus();
         };
         const closeButton = document.createElement('button'); closeButton.className = 'bj-popup-close'; closeButton.textContent = '×'; closeButton.setAttribute('aria-label', '關閉'); closeButton.onclick = close; panel.appendChild(closeButton);
         const heading = document.createElement('h3'); heading.textContent = known ? (item.zh || name) : '記錄猜測'; panel.appendChild(heading);
         const image = document.createElement('img'); image.src = item.img || ''; image.alt = item.zh || name; panel.appendChild(image);
         const focusable = [closeButton];
         let input = null, save = null;
         if (known)
         {
            const score = document.createElement('div'); score.className = 'bj-popup-score'; score.textContent = item.score + ' 分'; panel.appendChild(score);
            if (offerTake)
            {
               const question = document.createElement('p'); question.textContent = '要把這張牌拿到自己手裡嗎？'; panel.appendChild(question);
               const actions = document.createElement('div'); actions.className = 'bj-popup-actions'; panel.appendChild(actions);
               for (const take of [false,true])
               {
                  const button = document.createElement('button'); button.className = 'bj-button' + (take ? '' : ' secondary'); button.textContent = take ? '拿過來' : '留給莊家';
                  button.onclick = () => {if (decided || disposed) return; game.takeRevealed(take); decided = true; close(); q('.bj-duel-log').textContent = take ? '明察秋毫：已將指定牌拿到自己手裡。' : '明察秋毫：已確認分數，將牌留給莊家。';};
                  actions.appendChild(button); focusable.push(button);
               }
            }
            else
            {
               const button = document.createElement('button'); button.className = 'bj-button'; button.textContent = '關閉'; button.onclick = close; panel.appendChild(button); focusable.push(button);
            }
         }
         else
         {
            const label = document.createElement('label'); label.className = 'bj-popup-prompt'; label.textContent = '你猜這張牌幾分？'; label.setAttribute('for', 'bjGuessInput'); panel.appendChild(label);
            input = document.createElement('input'); input.id = 'bjGuessInput'; input.className = 'bj-guess-input'; input.type = 'text'; input.inputMode = 'numeric'; input.maxLength = 1; input.autocomplete = 'off'; input.value = game.notes.has(name) ? String(game.notes.get(name)) : ''; panel.appendChild(input); focusable.push(input);
            const hint = document.createElement('div'); hint.className = 'bj-popup-hint'; hint.textContent = '輸入 0～5'; panel.appendChild(hint);
            const error = document.createElement('div'); error.className = 'bj-popup-error'; error.setAttribute('role', 'alert'); panel.appendChild(error);
            const actions = document.createElement('div'); actions.className = 'bj-popup-actions'; panel.appendChild(actions);
            const clear = document.createElement('button'); clear.className = 'bj-button secondary'; clear.textContent = '清除';
            clear.onclick = () => {game.notes.delete(name); close(); render();}; actions.appendChild(clear); focusable.push(clear);
            save = document.createElement('button'); save.className = 'bj-button'; save.textContent = '儲存';
            save.onclick = () =>
            {
               const value = input.value.trim().replace(/[０-５]/g, c => String(c.charCodeAt(0) - 65296));
               if (value !== '' && !/^[0-5]$/.test(value)) {error.textContent = '請輸入 0～5。'; input.focus(); return;}
               if (value === '') game.notes.delete(name); else game.notes.set(name, Number(value));
               close(); render();
            };
            actions.appendChild(save); focusable.push(save);
         }
         shade.onclick = event => {if (event.target === shade) close();};
         shade.onkeydown = event =>
         {
            if (event.key === 'Escape') {event.preventDefault(); close();}
            else if (event.key === 'Enter' && input && event.target === input) {event.preventDefault(); save.onclick();}
            else if (event.key === 'Tab')
            {
               const first = focusable[0], last = focusable[focusable.length - 1];
               if (event.shiftKey && event.target === first) {event.preventDefault(); last.focus();}
               else if (!event.shiftKey && event.target === last) {event.preventDefault(); first.focus();}
            }
         };
         overlay.appendChild(shade);
         if (input) {input.focus(); if (input.select) input.select();} else closeButton.focus();
      }
      function estimate()
      {
         let sum = 0, missing = false;
         const parts = game.dealer.map(name =>
         {
            if (game.known.has(name)) {sum += catalog[name].score; return '已知 ' + catalog[name].score;}
            if (game.notes.has(name)) {sum += game.notes.get(name); return '猜測 ' + game.notes.get(name);}
            missing = true; return '？';
         });
         q('.bj-estimate').textContent = parts.join(' ＋ ') + ' ＝ ' + (missing ? '尚有未知（已填 ' + sum + '）' : '推算 ' + sum);
      }
      function render()
      {
         const done = game.phase === 'finished';
         for (const who of ['dealer', 'player'])
         {
            const hand = q(who === 'dealer' ? '#bjDealer' : '#bjPlayer'); hand.replaceChildren();
            game[who].forEach((name, index) =>
            {
               const item = catalog[name], wrapper = document.createElement('div'); wrapper.className = 'bj-note-card';
               const card = document.createElement('div'); card.className = 'bj-card';
               const image = document.createElement('img'); image.src = item.img || ''; image.alt = item.zh || name; image.draggable = false; card.appendChild(image);
               const visible = who === 'player' || game.known.has(name) || done;
               card.title = visible ? '點擊查看技能與分數' : '點擊記錄猜測';
               card.setAttribute('aria-label', visible ? (item.zh || name) + '，點擊查看分數' : '未知技能分數，點擊記錄猜測');
               card.setAttribute('role', 'button'); card.tabIndex = busy ? -1 : 0;
               if (targeting)
               {
                  const eligible = targeting.kind === 'insight' ? who === 'dealer' : targeting.kind === 'return' ? who === 'player' : targeting.playerIndex === null ? who === 'player' : who === 'dealer';
                  if (eligible) card.className += ' bj-target-eligible';
                  if (who === 'player' && targeting.playerIndex === index) card.className += ' bj-target-selected';
               }
               card.onclick = () =>
               {
                  if (targeting) return selectTarget(who, index); else openCard(name, who, card);
               };
               card.onkeydown = event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); card.onclick();}};
               if (who === 'dealer')
               {
                  const above = document.createElement('div'); above.className = 'bj-above-score'; above.textContent = visible ? String(item.score) : game.notes.has(name) ? game.notes.get(name) + '?' : ''; wrapper.appendChild(above);
               }
               wrapper.appendChild(card);
               if (who === 'player')
               {
                  const below = document.createElement('div'); below.className = 'bj-above-score'; below.textContent = String(item.score); wrapper.appendChild(below);
               }
               if (done && game.notes.has(name))
               {
                  const label = document.createElement('span'); label.className = 'bj-note-result'; label.textContent = `你猜 ${game.notes.get(name)} → 實際 ${item.score}`; wrapper.appendChild(label);
               }
               hand.appendChild(wrapper);
            });
         }
         q('.bj-formula').textContent = `${game.playerTotal}/${game.limit}`;
         q('.bj-divider').textContent = `BLACKJACK · ${game.limit}`;
         q('.bj-dealer-total').textContent = done ? `${game.dealer.map(name => catalog[name].score).join('+')}=${game.dealerTotal}/${game.limit}` : '';
         q('.bj-estimate').hidden = done; if (!done) estimate();
         q('.bj-dealer-special').textContent = `莊家特殊牌：${specials[game.dealerSpecial][0]} · ${game.dealerAction ? '已使用' : game.phase === 'player' ? (game.dealerSpecial === 'insight' ? '可指定你的一張牌，決定是否拿走。' : game.dealerSpecial === 'force' ? '強迫你額外抽一張牌。' : specials[game.dealerSpecial][1].replace('自己', '莊家').replace('與莊家', '與你')) : '未使用'}`;
         q('#bjHit').hidden = q('#bjStand').hidden = game.phase !== 'player';
         q('#bjHit').disabled = busy || !!targeting || game.playerTotal >= game.limit;
         q('#bjStand').disabled = busy || !!targeting;
         q('#bjStand').textContent = game.playerTotal > game.limit ? '交給莊家 · 保留救場機會' : '停牌';
         q('#bjSpecial').hidden = done;
         q('#bjSpecial').disabled = busy;
         q('#bjSpecial').replaceChildren();
         const specialTitle = document.createElement('b'); specialTitle.textContent = specials[game.special][0]; q('#bjSpecial').appendChild(specialTitle);
         const specialState = document.createElement('small'); specialState.textContent = game.special === 'insurance' ? '被動生效' : game.used ? '已使用' : '限一次'; q('#bjSpecial').appendChild(specialState);
         q('#bjSpecial').setAttribute('aria-expanded', String(specialExpanded && !done));
         q('.bj-special-detail').hidden = done || !specialExpanded;
         q('#bjSpecialName').textContent = specials[game.special][0]; q('#bjSpecialDescription').textContent = targeting ? targeting.kind === 'insight' ? '點選一張莊家卡牌，查看分數後決定是否拿取。' : targeting.kind === 'return' ? '點選要移除的我方卡牌。' : targeting.playerIndex === null ? '先點選要交換的我方卡牌。' : '再點選一張莊家卡牌，立即互換。' : specials[game.special][1];
         q('#bjUseSpecial').disabled = busy || !game.canUse(); q('#bjUseSpecial').textContent = game.special === 'insurance' ? '自動生效' : targeting ? '取消選擇' : game.used ? '已使用' : '使用';
         q('#bjReveal').hidden = game.phase !== 'response'; q('#bjReveal').disabled = busy || !!targeting;
         q('#bjConfirm').hidden = !done; q('#bjConfirm').disabled = busy;
         if (done)
         {
            const action = game.dealerAction;
            q('.bj-duel-log').textContent = (action
               ? `莊家使用「${specials[action.type][0]}」：莊家 ${action.dealerBefore} → ${action.dealerAfter} 分，你 ${action.playerBefore} → ${action.playerAfter} 分。`
               : `莊家補牌完成：${game.dealerBeforeExchange} 分，未使用特殊牌。`) + (game.used ? '你使用了「' + specials[game.special][0] + '」。' : '');
            const result = game.result === 'push' && options.tieRule === 'dealer' ? 'lose' : game.result;
            q('.bj-status').className = 'bj-status bj-result';
            q('.bj-status').textContent = result === 'win' ? `你贏了！＋${wager} 點` : result === 'lose' ? `${game.playerTotal > game.limit ? '你爆牌了！' : '莊家勝出！'}－${wager} 點` : game.playerTotal > game.limit && game.dealerTotal > game.limit ? '雙方爆牌 · 平手，不加不扣' : '平手 · 不加不扣';
            if (result === 'lose' && game.special === 'insurance') q('.bj-status').textContent = '本局落敗 · 保本護身生效，固定扣 5 分';
         }
         else q('.bj-status').textContent = game.phase === 'response' ? '最後回應：使用特殊牌或直接結算，之後不再補牌。' : '選擇進牌、停牌，或使用特殊牌。';
      }
      function wagerLimit()
      {
         return Math.max(1, Math.min(15, options.maxWager || 5));
      }
      function selectSpecial(type)
      {
         selected = type; q('.bj-special-options').replaceChildren();
         wager = Math.min(wager, wagerLimit());
         q('#bjBet').max = String(wagerLimit()); q('#bjBet').value = String(wager);
         q('#bjWager').textContent = String(wager); renderChips();
         offeredSpecials.forEach(key =>
         {
            const button = document.createElement('button'); button.className = 'bj-special-choice'; button.setAttribute('aria-pressed', String(key === selected));
            const title = document.createElement('b'); title.textContent = specials[key][0];
            const description = document.createElement('small'); description.textContent = specials[key][1]; button.appendChild(title); button.appendChild(description);
            button.onclick = () => selectSpecial(key); q('.bj-special-options').appendChild(button);
         });
      }
      q('#bjBet').oninput = () =>
      {
         wager = Math.max(1, Math.min(wagerLimit(), Number(q('#bjBet').value) || 1));
         q('#bjBet').value = String(wager);
         q('#bjWager').textContent = String(wager); renderChips();
      };
      q('#bjStart').onclick = async () =>
      {
         if (busy || popup || disposed || !game.start(selected)) return;
         busy = true; q('.bj-intro').hidden = true; q('.bj-game').hidden = false; render();
         const cards = [];
         for (let i = 0; i < 3; i++) cards.push(q('#bjPlayer').children[i], q('#bjDealer').children[i]);
         cards.forEach(card => {card.style.visibility = 'hidden';});
         for (const card of cards) {if (disposed) return; card.style.visibility = 'visible'; await animate(card);}
         if (disposed) return; busy = false; render();
      };
      q('#bjHit').onclick = async () =>
      {
         if (busy || targeting || popup || disposed || !game.hit()) return;
         busy = true; render(); await animate(q('#bjPlayer').children[game.player.length - 1]);
         if (disposed) return; busy = false; render();
      };
      q('#bjStand').onclick = async () =>
      {
         if (busy || targeting || popup || disposed || !game.stand()) return;
         busy = true; render(); q('.bj-status').textContent = '莊家補牌中…';
         while (!disposed && game.dealerStep()) {render(); q('.bj-status').textContent = '莊家補牌中…'; await animate(q('#bjDealer').children[game.dealer.length - 1]);}
         if (disposed) return;
         const action = game.exchangeCards(); render();
         q('.bj-duel-log').textContent = action ? `莊家使用了「${specials[action.type][0]}」！` : '莊家沒有使用特殊牌。';
         if (action && action.type === 'swap') await Promise.all([animate(q('#bjPlayer').children[action.pi], 'translateY(-90px)'), animate(q('#bjDealer').children[action.di], 'translateY(90px)')]);
         else if (action && (action.type === 'force' || action.type === 'redraw'))
         {
            const hand = q(action.type === 'force' ? '#bjPlayer' : '#bjDealer'); await animate(hand.children[hand.children.length - 1]);
         }
         if (disposed) return; busy = false; render();
      };
      q('#bjSpecial').onclick = () =>
      {
         if (busy || popup || disposed || game.phase === 'finished') return;
         specialExpanded = !specialExpanded; if (!specialExpanded) targeting = null; render();
      };
      async function applySpecial(selection = {})
      {
         if (busy || popup || disposed || !game.useSpecial(selection)) return;
         targeting = null;
         busy = true; render(); q('.bj-duel-log').textContent = '你使用了「' + specials[game.special][0] + '」。';
         if (game.special === 'swap')
         {
            await Promise.all([animate(q('#bjPlayer').children[selection.playerIndex], 'translateY(-70px)'), animate(q('#bjDealer').children[selection.dealerIndex], 'translateY(70px)')]);
         }
         else
         {
            const hand = game.special === 'force' ? q('#bjDealer') : q('#bjPlayer'); await animate(hand.children[hand.children.length - 1]);
         }
         if (disposed) return; busy = false; render();
      }
      function selectTarget(who, index)
      {
         if (!targeting || busy || popup || disposed) return;
         if (targeting.kind === 'insight')
         {
            if (who !== 'dealer' || !game.revealDealer(index)) return;
            const name = game.dealer[index]; targeting = null; render(); openCard(name, who, null, true); return;
         }
         if (targeting.kind === 'return') {if (who === 'player') return applySpecial({playerIndex:index}); return;}
         if (who === 'player') {targeting.playerIndex = index; render();}
         else if (targeting.playerIndex !== null) return applySpecial({playerIndex:targeting.playerIndex, dealerIndex:index});
      }
      q('#bjUseSpecial').onclick = () =>
      {
         if (busy || popup || disposed || !game.canUse()) return;
         if (targeting) {targeting = null; render(); return;}
         if (game.special === 'return' || game.special === 'swap' || game.special === 'insight')
         {
            targeting = {kind:game.special, playerIndex:null}; render(); return;
         }
         return applySpecial();
      };
      q('#bjReveal').onclick = async () =>
      {
         if (busy || targeting || popup || disposed || !game.finish()) return;
         busy = true; render();
         await Promise.all(Array.from(q('#bjDealer').children).map(card => animate(card, 'rotateY(90deg)')));
         if (disposed) return; busy = false; render();
      };
      q('#bjConfirm').onclick = () =>
      {
         if (disposed || busy || applied || game.phase !== 'finished') return;
         applied = true; const result = game.result === 'push' && options.tieRule === 'dealer' ? 'lose' : game.result;
         const settlement = {lossAmount:game.lossAmount === null ? wager : game.lossAmount};
         dispose(); options.onComplete(result, wager, settlement);
      };
      const controller = {dispose}; instances.add(controller); selectSpecial(selected); renderChips(); return controller;
   }
   api.createDuel = createDuel; api.sampleSpecials = sampleSpecials; api.open = open;
   api.disposeAll = () => {for (const instance of Array.from(instances)) instance.dispose(); originalDispose();};
})();
;
/* END MERGED: casino-duel.js */

/* BEGIN MERGED: blackjack-reward.js */
(function()
{
   'use strict';
   const instances = new Set();
   function createPlan(state, catalogs, budget)
   {
      const slots = [...state.addons.map(name => ({kind: 'addon', name})), ...state.perks.map(name => ({kind: 'perk', name}))].map(slot =>
      {
         const catalog = slot.kind === 'addon' ? catalogs.addons : catalogs.perks;
         return {...slot, original: catalog[slot.name].score, target: catalog[slot.name].score, extra: 0};
      });
      const cost = slot => Math.abs(slot.target - slot.original) + slot.extra;
      function pool(index)
      {
         const slot = slots[index], catalog = slot.kind === 'addon' ? catalogs.addons : catalogs.perks;
         const fixed = new Set(slots.filter(other => other !== slot && other.kind === slot.kind && cost(other) === 0).map(other => other.name));
         return Object.keys(catalog).filter(name => catalog[name].score === slot.target && !fixed.has(name) && (slot.kind !== 'addon' || catalog[name].killer === state.killerKey));
      }
      function validate()
      {
         if (slots.reduce((sum, slot) => sum + cost(slot), 0) > budget) return false;
         return slots.every((slot, index) =>
         {
            if (!cost(slot)) return true;
            const others = slots.filter(other => other !== slot && other.kind === slot.kind && cost(other) > 0 && other.target === slot.target).length;
            return pool(index).length - others >= slot.extra + 1;
         });
      }
      function set(index, target, extra)
      {
         const slot = slots[index];
         if (!slot || !Number.isInteger(target) || !Number.isInteger(extra) || extra < 0 || target < (slot.kind === 'addon' ? 1 : 0) || target > 5) return false;
         const oldTarget = slot.target, oldExtra = slot.extra;
         slot.target = target; slot.extra = extra;
         if (validate()) return true;
         slot.target = oldTarget; slot.extra = oldExtra;
         return false;
      }
      return {slots, set, validate, pool, cost,
         get used() { return slots.reduce((sum, slot) => sum + cost(slot), 0); },
         get remaining() { return budget - this.used; }};
   }
   function open(options)
   {
      const state = {killerKey: options.state.killerKey, addons: options.state.addons.slice(), perks: options.state.perks.slice()};
      let remaining = options.budget;
      let plan = createPlan(state, options.catalogs, remaining);
      let selected = 0, choosing = false, disposed = false, completed = false;
      const overlay = document.createElement('div'); overlay.id = 'blackjackRewardOverlay';
      overlay.innerHTML = `<style>
      #blackjackRewardOverlay{position:fixed;inset:0;z-index:100080;display:flex;align-items:center;justify-content:center;background:#080c0bed;padding:20px;box-sizing:border-box;color:#fff3d7;font-family:inherit}#blackjackRewardOverlay *{box-sizing:border-box}.bj-reward-slots{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:18px 0}.bj-reward-slot,.bj-reward-choice{font:inherit;color:#fff3d7;background:#123d2d;border:1px solid #a59462;border-radius:10px;padding:9px;cursor:pointer;min-width:0}.bj-reward-slot.active{background:#376e43;border:2px solid #ffe19c}.bj-reward-slot img,.bj-reward-choice img{width:100%;height:80px;object-fit:contain}.bj-reward-slot strong,.bj-reward-slot small{display:block;font-size:12px;margin-top:5px}.bj-reward-editor{padding:18px;border:1px solid #b5a06988;border-radius:14px;background:#00251766;text-align:center}.bj-reward-line{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px;margin:12px 0}.bj-reward-line button{padding:7px 16px}.bj-reward-line span{min-width:150px}.bj-reward-message{min-height:30px;text-align:center;color:#ffe4a4;line-height:1.7;margin:14px 0}.bj-reward-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px}.bj-reward-choice span{display:block;font-size:13px;margin:6px 0}.bj-reward-budget{font-size:22px;color:#ffe19c;font-weight:800}.bj-reward-commit{display:block;margin:18px auto 0}.bj-reward-note{font-size:12px;line-height:1.8;color:#d4dec9;text-align:center}@media(max-width:650px){#blackjackRewardOverlay{padding:8px}.bj-reward-slots{gap:4px}.bj-reward-slot{padding:4px}.bj-reward-slot img{height:45px}.bj-reward-slot strong,.bj-reward-slot small{font-size:10px}.bj-reward-line span{min-width:110px}}
      </style><section class="bj-table" role="dialog" aria-modal="true" aria-label="二十一點獎勵分配"><header class="bj-title"><h2>分配獎勵</h2><div class="bj-reward-balance"><div class="bj-reward-chips" aria-hidden="true"></div><span class="bj-reward-budget"></span></div></header><div class="bj-reward-slots"></div><div class="bj-reward-editor"><div class="bj-reward-preview"><img id="bjRewardPreview" alt=""><strong id="bjRewardName"></strong><span id="bjRewardCurrent"></span></div><div class="bj-reward-adjustments"><h3>調整此欄位</h3><div class="bj-reward-line"><label>目標分數</label><button class="bj-button secondary" id="bjScoreMinus" aria-label="降低目標分數">−</button><span id="bjRewardTarget"></span><button class="bj-button secondary" id="bjScorePlus" aria-label="提高目標分數">＋</button></div><div class="bj-reward-line"><label>候選數量</label><button class="bj-button secondary" id="bjChoiceMinus" aria-label="減少候選數量">−</button><span id="bjRewardOptions"></span><button class="bj-button secondary" id="bjChoicePlus" aria-label="增加候選數量">＋</button></div><div class="bj-reward-cost"><span id="bjRewardBreakdown"></span><strong id="bjRewardCost"></strong></div></div></div><div class="bj-reward-choices"></div><div class="bj-reward-message" role="status"></div><footer class="bj-reward-footer"><span>選牌後立即換上，剩餘點數可繼續使用。</span><button class="bj-button" id="bjRewardCommit"></button><button class="bj-button secondary" id="bjRewardFinish"></button></footer></section>`;
      document.body.appendChild(overlay);
      const style = document.createElement('style');
      style.textContent = `
         #blackjackRewardOverlay .bj-table{width:min(1160px,100%);max-height:94dvh;overflow:hidden;display:flex;flex-direction:column;padding:22px 25px 18px}
         #blackjackRewardOverlay .bj-title{flex-shrink:0;margin-bottom:12px}
         .bj-reward-balance{display:flex;align-items:center;gap:12px}.bj-reward-budget{white-space:nowrap;font-size:23px}
         .bj-reward-chips{height:38px;display:flex;align-items:flex-end;gap:3px}.bj-reward-chip-pile{position:relative;width:24px;height:36px}.bj-reward-mini-chip{position:absolute;left:0;bottom:calc(var(--level)*5px);width:24px;height:10px;border:1px solid #f0dca8;border-radius:50%;background:repeating-conic-gradient(#a33f48 0deg 50deg,#f1e5bd 50deg 65deg);box-shadow:0 2px 0 #632832}.bj-reward-chip-pile:nth-child(2n) .bj-reward-mini-chip{filter:hue-rotate(190deg)}
         #blackjackRewardOverlay .bj-reward-slots{gap:11px;margin:8px 0 17px;padding-top:5px;flex-shrink:0}
         #blackjackRewardOverlay .bj-reward-slot{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:5px;padding:12px 8px 9px;border-radius:12px;border:1px solid #9c925e;background:linear-gradient(145deg,#233e50,#142a38 55%,#0a1a25);box-shadow:0 5px 8px #0004;transition:transform .16s,border-color .16s}
         #blackjackRewardOverlay .bj-reward-slot.active{border:2px solid #f2d082;background:linear-gradient(145deg,#29495a,#152e3c 55%,#0c1c26);transform:translateY(-5px);box-shadow:0 0 8px #eac36766,0 7px 12px #0005}
         #blackjackRewardOverlay .bj-reward-slot img{height:clamp(48px,11dvh,95px);object-fit:contain}
         #blackjackRewardOverlay .bj-reward-slot strong{font-size:13px;margin:0;line-height:1.4;text-align:center;min-height:19px}
         #blackjackRewardOverlay .bj-reward-slot small{font-size:14px;margin:0;width:90%;text-align:center;padding:3px 5px;border:1px solid #a4b6bd44;border-radius:7px;background:#ffffff05}
         #blackjackRewardOverlay .bj-reward-editor{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.8fr);gap:28px;border:0;border-radius:0;border-top:1px solid #b09d5c55;background:none;padding:20px 6px 5px;text-align:left;min-height:0}
         #blackjackRewardOverlay .bj-reward-editor[hidden]{display:none}
         .bj-reward-preview{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-right:1px solid #b09d5c55;padding-right:25px;min-width:0}
         #bjRewardPreview{width:100%;max-width:175px;height:clamp(65px,19dvh,175px);object-fit:contain;filter:drop-shadow(0 4px 5px #0006)}
         #bjRewardName{font-size:22px;text-align:center;line-height:1.3}#bjRewardCurrent{font-size:16px;border:1px solid #b2aa7155;border-radius:8px;padding:5px 17px}
         .bj-reward-adjustments h3{font-size:23px;font-weight:800;margin:0 0 13px;padding-bottom:12px;border-bottom:1px solid #b09d5c55}
         #blackjackRewardOverlay .bj-reward-line{display:grid;grid-template-columns:minmax(90px,1fr) 44px minmax(70px,1fr) 44px;gap:12px;margin:12px 0;align-items:center}
         .bj-reward-line label{font-size:18px}.bj-reward-line .bj-button{padding:8px 9px}
         #blackjackRewardOverlay .bj-reward-line span{min-width:0;text-align:center;border:1px solid #b2aa7166;background:#071f24a0;border-radius:9px;padding:4px 8px;font-size:28px;line-height:1.3}
         .bj-reward-cost{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-top:1px solid #b09d5c55;padding-top:15px;margin-top:15px;font-size:14px;color:#e6ddb7}.bj-reward-cost strong{font-size:19px;color:#ffdf8c}
         #blackjackRewardOverlay .bj-reward-message{min-height:22px;margin:8px 0 5px;font-size:13px;line-height:1.5}
         .bj-reward-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-shrink:0;margin-top:6px}.bj-reward-footer>span{font-size:12px;color:#d1d6bb;flex:1}.bj-reward-footer .bj-button{padding:13px 23px;font-size:17px}#bjRewardCommit{background:linear-gradient(135deg,#f1d68c,#dcb359);border-color:#f0d180;color:#2b2416;flex:1}#bjRewardFinish{min-width:130px;font-size:15px}
         #blackjackRewardOverlay .bj-reward-choices:empty{display:none}#blackjackRewardOverlay .bj-reward-choices{display:flex;gap:12px;justify-content:center;padding:18px 0;min-height:0;flex-wrap:nowrap;flex:1}
         #blackjackRewardOverlay .bj-reward-choice{flex:0 1 170px;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;border-color:#c2ab6e;background:linear-gradient(145deg,#233e50,#0a1a25);box-shadow:0 5px 8px #0005;padding:15px 10px;min-height:170px}
         #blackjackRewardOverlay .bj-reward-choice img{height:clamp(60px,17dvh,140px)}.bj-reward-choice:hover{border-color:#ffe19c;transform:translateY(-4px)}
         @media(max-height:750px){#blackjackRewardOverlay .bj-table{padding:15px 20px}#blackjackRewardOverlay .bj-title{margin-bottom:5px}#blackjackRewardOverlay .bj-reward-slots{margin-bottom:10px}#blackjackRewardOverlay .bj-reward-slot{padding:8px 5px}#blackjackRewardOverlay .bj-reward-slot img{height:65px}#blackjackRewardOverlay .bj-reward-editor{padding-top:12px}.bj-reward-adjustments h3{font-size:20px;margin-bottom:8px;padding-bottom:8px}#blackjackRewardOverlay .bj-reward-line{margin:8px 0}.bj-reward-cost{margin-top:9px;padding-top:9px}#bjRewardPreview{height:110px}#bjRewardName{font-size:19px}.bj-reward-footer .bj-button{padding:10px 18px}}
         @media(max-width:700px){#blackjackRewardOverlay .bj-table{padding:16px 12px}.bj-reward-budget{font-size:16px}.bj-reward-balance{gap:6px}#blackjackRewardOverlay .bj-reward-slots{gap:5px}#blackjackRewardOverlay .bj-reward-slot strong{font-size:10px}#blackjackRewardOverlay .bj-reward-slot small{font-size:12px}#blackjackRewardOverlay .bj-reward-slot img{height:50px}#blackjackRewardOverlay .bj-reward-editor{gap:12px;grid-template-columns:minmax(0,1fr) minmax(0,1.7fr)}.bj-reward-preview{padding-right:10px}.bj-reward-line label{font-size:13px}#blackjackRewardOverlay .bj-reward-line{grid-template-columns:minmax(55px,1fr) 33px minmax(40px,.8fr) 33px;gap:5px}#blackjackRewardOverlay .bj-reward-line span{font-size:24px}.bj-reward-cost{font-size:12px}.bj-reward-cost strong{font-size:16px}.bj-reward-footer{gap:8px;flex-wrap:wrap}.bj-reward-footer>span{flex-basis:100%}#bjRewardFinish{min-width:100px}#bjRewardName{font-size:17px}}
      `;
      overlay.appendChild(style);
      const q = selector => overlay.querySelector(selector);
      const catalogFor = slot => slot.kind === 'addon' ? options.catalogs.addons : options.catalogs.perks;
      function dispose() { if (disposed) return; disposed = true; overlay.remove(); instances.delete(controller); }
      function render()
      {
         q('.bj-reward-budget').textContent = `剩餘 ${remaining} / ${options.budget} 點`;
         const chips = q('.bj-reward-chips'); chips.replaceChildren();
         for (let start = 0; start < remaining; start += 5)
         {
            const pile = document.createElement('div'); pile.className = 'bj-reward-chip-pile';
            for (let level = 0; level < Math.min(5, remaining - start); level++)
            {
               const chip = document.createElement('span'); chip.className = 'bj-reward-mini-chip'; chip.style.cssText = '--level:' + level; pile.appendChild(chip);
            }
            chips.appendChild(pile);
         }
         const container = q('.bj-reward-slots'); container.replaceChildren();
         plan.slots.forEach((slot, index) =>
         {
            const item = catalogFor(slot)[slot.name], button = document.createElement('button');
            button.className = 'bj-reward-slot' + (index === selected ? ' active' : '');
            button.disabled = choosing;
            const image = document.createElement('img'); image.src = item.img || ''; image.alt = item.zh || slot.name;
            const title = document.createElement('strong'); title.textContent = item.zh || slot.name;
            const info = document.createElement('small'); info.textContent = `${slot.original} 分`;
            button.append(image, title, info); button.onclick = () => {if (choosing || disposed) return; if (selected !== index) plan = createPlan(state, options.catalogs, remaining); selected = index; q('.bj-reward-message').textContent = ''; render();};
            container.appendChild(button);
         });
         const slot = plan.slots[selected];
         q('#bjRewardName').textContent = catalogFor(slot)[slot.name].zh || slot.name;
         const preview = q('#bjRewardPreview'); preview.src = catalogFor(slot)[slot.name].img || ''; preview.alt = catalogFor(slot)[slot.name].zh || slot.name;
         q('#bjRewardCurrent').textContent = `目前 ${slot.original} 分`;
         q('#bjRewardTarget').textContent = String(slot.target);
         q('#bjRewardOptions').textContent = String(slot.extra + 1);
         const price = plan.cost(slot);
         q('#bjRewardBreakdown').textContent = `調整分數 ${Math.abs(slot.target - slot.original)} 點 ＋ 額外候選 ${slot.extra} 點`;
         q('#bjRewardCost').textContent = `本次花費 ${price} 點`;
         q('#bjRewardCommit').textContent = '更換此欄位';
         q('#bjRewardCommit').disabled = choosing || price <= 0 || remaining <= 0;
         q('#bjRewardFinish').textContent = remaining ? `完成 · 放棄剩餘 ${remaining} 點` : '完成';
         q('#bjRewardFinish').disabled = choosing;
         q('.bj-reward-editor').hidden = choosing;
         q('#bjRewardCommit').hidden = choosing;
      }
      function adjust(targetDelta, extraDelta)
      {
         if (choosing || disposed) return;
         const slot = plan.slots[selected];
         let valid = false;
         if (targetDelta)
         {
            for (let target = slot.target + targetDelta; target >= (slot.kind === 'addon' ? 1 : 0) && target <= 5; target += targetDelta)
            {
               if (plan.set(selected, target, slot.extra)) { valid = true; break; }
            }
         }
         else valid = plan.set(selected, slot.target, slot.extra + extraDelta);
         if (!valid) q('.bj-reward-message').textContent = '點數不足、分數超出範圍，或沒有足夠的不重複候選。';
         else q('.bj-reward-message').textContent = '';
         render();
      }
      q('#bjScoreMinus').onclick = () => adjust(-1, 0); q('#bjScorePlus').onclick = () => adjust(1, 0);
      q('#bjChoiceMinus').onclick = () => adjust(0, -1); q('#bjChoicePlus').onclick = () => adjust(0, 1);
      q('#bjRewardCommit').onclick = () =>
      {
         if (disposed || choosing || !plan.validate() || plan.cost(plan.slots[selected]) <= 0) return;
         const index = selected, slot = plan.slots[index], price = plan.cost(slot);
         if (price > remaining) return;
         choosing = true; render();
         const pool = plan.pool(index);
         for (let i = pool.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]];}
         const candidates = pool.slice(0, slot.extra + 1);
         q('.bj-reward-message').textContent = `為${slot.kind === 'addon' ? '配件 ' + (index + 1) : '技能 ' + (index - 1)}選擇一個 ${slot.target} 分項目（${candidates.length} 選 1）`;
         const container = q('.bj-reward-choices'); container.replaceChildren();
         let picked = false;
         for (const name of candidates)
         {
            const item = catalogFor(slot)[name], button = document.createElement('button'); button.className = 'bj-reward-choice';
            const image = document.createElement('img'); image.src = item.img || ''; image.alt = item.zh || name;
            const label = document.createElement('span'); label.textContent = `${item.zh || name} · ${item.score} 分`;
            button.append(image, label); button.onclick = () =>
            {
               if (disposed || picked || !choosing) return;
               picked = true;
               if (slot.kind === 'addon') state.addons[index] = name; else state.perks[index - 2] = name;
               remaining -= price;
               plan = createPlan(state, options.catalogs, remaining); choosing = false;
               container.replaceChildren(); render();
               q('.bj-reward-message').textContent = `已更換為「${item.zh || name}」，花費 ${price} 點。${remaining ? '可繼續選擇欄位更換。' : '點數已用完，請按完成。'}`;
            };
            container.appendChild(button);
         }
      };
      q('#bjRewardFinish').onclick = () =>
      {
         if (disposed || choosing || completed) return;
         completed = true; dispose(); options.onComplete({addons: state.addons.slice(), perks: state.perks.slice()});
      };
      const controller = {dispose}; instances.add(controller); render(); return controller;
   }
   window.BlackjackReward = {createPlan, open, disposeAll: () => {for (const instance of Array.from(instances)) instance.dispose();}};
})();
;
/* END MERGED: blackjack-reward.js */

/* BEGIN MERGED: original-card.js */
(function()
{
   // ==========================
   // 0. 安全檢查
   // ==========================
   if (!window.PERKS || !window.ADDONS || !window.KILLERS)
   {
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
         effect:
         {
            type: 'become_wraith_fixed_addons_random_perks',
            data:
            {
               killerKey: 'The Wraith',
               addons: ["'Swift Hunt' - Blood", 'Bone Clapper']
            }
         }
      },

      // 2. 指定欄位單純重抽，並可再用一次剩餘卡片
      {
         id: 'card02',
         zh: '起床重睡',
         target: 'slot-addon-perk',
         colorType: 'slot',
         summary: '指定一個配件或技能欄位單純重抽。此卡使用後不結束卡片階段，可再使用一次剩餘卡片。',
         effect:
         {
            type: 'card02_reroll_slot_extra_card',
            data:
            {
            }
         }
      },

      // 3. 兩個配件總分為 7
      {
         id: 'card03',
         zh: '汰舊換新',
         target: 'addon',
         colorType: 'addon',
         summary: '系統會在後台自動重抽兩個配件，直到得到可用且總分為 7 的組合。',
         effect:
         {
            type: 'card03_addons_sum_7',
            data:
            {
            }
         }
      },

      // 4. 4 個技能不低於目前欄位分數
      {
         id: 'card04',
         zh: '空空遺忘',
         target: 'perk',
         colorType: 'perk',
         summary: '重抽四個技能，且分數都不會低於被指定欄位的分數。',
         effect:
         {
            type: 'card04_reroll_perks_not_lower_than_slot',
            data:
            {
            }
         }
      },

      // 5. 三個技能重抽，固定欄位至少 4 分
      {
         id: 'card05',
         zh: '重振旗鼓',
         target: 'perk',
         colorType: 'perk',
         summary: '重抽三個技能，其中卡片放置的欄位固定重抽成至少 4 分，其餘兩格照一般規則重抽。',
         effect:
         {
            type: 'card05_reroll_three_with_fixed_high_slot',
            data:
            {
            }
         }
      },

      // 6. 兩次 3-5 分技能五選一，隨機丟進技能欄位
      {
         id: 'card06',
         zh: '盤點庫存',
         target: 'perk',
         colorType: 'perk',
         summary: '進行兩次：每次抽出 5 個 3–5 分技能讓玩家選 1 個，並隨機替換到技能欄位。',
         effect:
         {
            type: 'card06_double_choice_random_perk_slot',
            data:
            {
               rounds: 2,
               choices: 5,
               scores: [3, 4, 5]
            }
         }
      },

      // 7. 4 技能隨機 1 重抽
      {
         id: 'card07',
         zh: '直觀投注',
         target: 'perk',
         colorType: 'perk',
         summary: '指定的技能重抽。',
         effect:
         {
            type: 'reroll_target_perk',
            data:
            {
            }
         }
      },

      // 8. 配件和技能隨機(0-6個)重抽
      {
         id: 'card08',
         zh: '歡愉至上',
         target: 'any',
         colorType: 'all-colored',
         summary: '隨機 0–6 格（技能或配件）重抽。',
         effect:
         {
            type: 'reroll_random_slots_0_6',
            data:
            {
               min: 0,
               max: 6
            }
         }
      },

      // 9. 單格：抽三個，三選一
      {
         id: 'card09',
         zh: '精挑細選',
         target: 'slot-any',
         colorType: 'slot',
         summary: '該欄位抽出 3 個候選，三選一替換。',
         effect:
         {
            type: 'reroll_slot_choice',
            data:
            {
               choices: 3
            }
         }
      },

      // 10. 單格：抽兩個，二選一
      {
         id: 'card10',
         zh: '五十五十',
         target: 'slot-any',
         colorType: 'slot',
         summary: '該欄位抽出 2 個候選，二選一替換。',
         effect:
         {
            type: 'reroll_slot_choice',
            data:
            {
               choices: 2
            }
         }
      },

      // 11. 技能 -> 當前殺手的 3 個技能擇一
      {
         id: 'card11',
         zh: '成功三轉',
         target: 'slot-perk',
         colorType: 'perk-slot',
         summary: '將此技能改成當前殺手的 3 個技能之一（多選一）。',
         effect:
         {
            type: 'replace_skill_by_current_killer_3pick',
            data:
            {
            }
         }
      },

      // 12. 技能 -> 通用技能 5 選 1
      {
         id: 'card12',
         zh: '萌新入坑',
         target: 'slot-perk',
         colorType: 'perk-slot',
         summary: '該欄位抽出 5 個通用技能候選，五選一替換。',
         effect:
         {
            type: 'replace_skill_general_choice',
            data:
            {
               choices: 5
            }
         }
      },

      // 13. 配件 -> 一紅配一白配
      {
         id: 'card13',
         zh: '混沌邪惡',
         target: 'addon',
         colorType: 'addon',
         summary: '從該殺手配件池中找出紅配 + 白配。',
         effect:
         {
            type: 'replace_addons_by_color',
            data:
            {
               colors: ['紅配', '白配']
            }
         }
      },

      // 14. 配件 -> 一紫配一綠配
      {
         id: 'card14',
         zh: '福音戰士',
         target: 'addon',
         colorType: 'addon',
         summary: '從該殺手配件池中找出紫配 + 綠配。',
         effect:
         {
            type: 'replace_addons_by_color',
            data:
            {
               colors: ['紫配', '綠配']
            }
         }
      },

      // 15. 配件 -> 兩藍配
      {
         id: 'card15',
         zh: '絕對中立',
         target: 'addon',
         colorType: 'addon',
         summary: '從該殺手配件池中找出兩個藍配。',
         effect:
         {
            type: 'replace_addons_by_color',
            data:
            {
               colors: ['藍配', '藍配']
            }
         }
      },

      // 16. 六欄固定分數後 +1 分重抽（5 -> 0）
      {
         id: 'card16',
         zh: '全民普發',
         target: 'any',
         colorType: 'all-neutral',
         summary: '六個非殺手欄位會以原分數 +1 的分數重抽（5 分會變成 0 分）；配件目標分數不足時改用最接近的可用分數。',
         effect:
         {
            type: 'card16_all_slots_plus_one_wrap',
            data:
            {
            }
         }
      },

      // 17. 小遊戲：猜分數對決
      {
         id: 'card17',
         zh: '狂賭之冤',
         target: 'any',
         colorType: 'casino',
         summary: '選擇 0–5 的分數後與莊家 0–6 對決。莊家比較大則獲勝，較小則失敗，相同則平手。',
         effect:
         {
            type: 'card17_score_duel_minigame',
            data:
            {
            }
         }
      },

      // 18. 兩個配件取平均後重抽
      {
         id: 'card18',
         zh: '一分為二',
         target: 'addon',
         colorType: 'addon',
         summary: '兩個配件會變成相同分數的配件。',
         effect:
         {
            type: 'card18_average_addons',
            data:
            {
            }
         }
      },

      // 19. 技能集中：指定欄位變 0 分，其餘技能 +1 分重抽
      {
         id: 'card19',
         zh: '生吞活剝',
         target: 'slot-perk',
         colorType: 'perk',
         summary: '指定技能欄位變成 0 分技能，其餘技能欄位以原分數 +1 的分數重抽。',
         effect:
         {
            type: 'card19_zero_and_plus_one',
            data:
            {
            }
         }
      },

      // 20. 齊頭平等
      {
         id: 'card20',
         zh: '共產主義',
         target: 'any',
         colorType: 'all-neutral',
         summary: '六個非殺手欄位會盡量變成同一個分數後重抽。',
         effect:
         {
            type: 'card20_equalize_all_scores',
            data:
            {
            }
         }
      },

      // 21. 什麼事都沒有
      {
         id: 'card21',
         zh: '無事發生',
         target: 'any',
         colorType: 'all-neutral-dark',
         summary: '什麼事都沒有發生。',
         effect:
         {
            type: 'none',
            data:
            {
            }
         }
      },

      // 22. 包含殺手全部重抽（彩色）
      {
         id: 'card22',
         zh: '轉生卡車',
         target: 'any',
         colorType: 'all-colored',
         summary: '重抽殺手、配件與全部技能。',
         effect:
         {
            type: 'reroll_all_including_killer',
            data:
            {
            }
         }
      },

      // 23. 技能 -> 隨機殺手的 3 個技能擇一
      {
         id: 'card23',
         zh: '軍備擴充',
         target: 'slot-perk',
         colorType: 'perk-slot',
         summary: '將此技能改成某位隨機殺手的 3 個技能之一（多選一）。',
         effect:
         {
            type: 'replace_skill_by_random_killer_3pick',
            data:
            {
               killerKey: null
            }
         }
      },

      // 24. 等值重抽：保持原分數但全部重抽
      {
         id: 'card24',
         zh: '似曾相似',
         target: 'any',
         colorType: 'all-neutral',
         summary: '保持每個欄位分數不變，但全部重新抽取同分數的技能或配件。',
         effect:
         {
            type: 'reroll_same_score_all',
            data:
            {
            }
         }
      },

      // 25. 固定選中欄位，其餘欄位重抽
      {
         id: 'card25',
         zh: '穩如磐石',
         target: 'any',
         colorType: 'all-neutral',
         summary: '固定被選擇的欄位，其餘技能與配件欄位全部重抽。',
         effect:
         {
            type: 'keep_selected_reroll_others',
            data:
            {
            }
         }
      },

      // 26. 配件提升一等（白->綠->藍->紫->紅->白）
      {
         id: 'card26',
         zh: '神奇糖果',
         target: 'addon',
         colorType: 'addon',
         summary: '選擇的配件升一級。',
         effect:
         {
            type: 'upgrade_addons_color',
            data:
            {
            }
         }
      },

      // 27. 學習裝置：選擇的配件升兩等，另一個升一等（白->綠->藍->紫->紅->白）
      {
         id: 'card27',
         zh: '學習裝置',
         target: 'addon',
         colorType: 'addon',
         summary: '選擇的配件升兩級，另一個配件升一級。',
         effect:
         {
            type: 'upgrade_addons_color_split',
            data:
            {
               selectedSteps: 2,
               otherSteps: 1
            }
         }
      },

      // 28. 普通卡：輪番取捨（十二技能，四回合禁用與替換）
      {
         id: 'card28',
         zh: '輪番取捨',
         target: 'any',
         colorType: 'all-colored',
         summary: '同時從 12 個技能與 6 個配件輪流禁用、鎖定或重骰，留下 4 技能與 2 配件；兩區共用 3 次重骰。',
         effect:
         {
            type: 'card28_ban_pick',
            data:
            {
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
         effect:
         {
            type: 'card29_steal_day_swap',
            data:
            {
               killerKey: null
            }
         }
      },

      // 30. 特殊卡：觀看廣告（不可跳過 5 張圖片輪播，結束後給獎勵）
      {
         id: 'card30',
         zh: '觀看廣告',
         target: 'any',
         colorType: 'all-neutral-dark',
         summary: '使用此卡觀看廣告來獲得豐厚獎勵。',
         effect:
         {
            type: 'card30_watch_ad',
            data:
            {
               // 5 張輪播圖片（可用 PNG/JPG/GIF；GIF 會自動播放）
               images: [
                  './images/other/ad1.png',
                  './images/other/ad2.png',
                  './images/other/ad3.png',
                  './images/other/ad4.png',
                  './images/other/ad5.png'
               ],
               intervalMs: 1500, // 每張 1.5 秒
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
         effect:
         {
            type: 'card31_replace_curse',
            data:
            {
            }
         }
      },

      // 32. 普通卡：怨者上鉤（指定技能 -> 天災鉤技能）
      {
         id: 'card32',
         zh: '怨者上鉤',
         target: 'perk',
         colorType: 'perk',
         summary: '將指定欄位的技能變為隨機天災技能。',
         effect:
         {
            type: 'card32_replace_scourge',
            data:
            {
            }
         }
      },

      // 33. 特殊卡：老威集合（殺手 -> aliases 含「威」；技能 -> 該殺手技能）
      {
         id: 'card33',
         zh: '老威集合',
         target: 'any',
         colorType: 'all-colored',
         summary: '所有威家人集合一起獵殺人類吧',
         effect:
         {
            type: 'card33_will_family',
            data:
            {
            }
         }
      },

      // 34. 普通卡：願望清單（5 隻殺手自選 1 隻，指定技能變成該殺手的隨機專屬技能）
      {
         id: 'card34',
         zh: '願望清單',
         target: 'perk',
         colorType: 'perk',
         summary: '隨機選出 5 位殺手，讓你自選 1 位，將指定欄位變成該殺手的隨機一個技能。',
         effect:
         {
            type: 'card34_wishlist',
            data:
            {
            }
         }
      },

      // 35. 做出選擇（A：技能4-5 / 配件1-2；B：技能0-1 / 配件4-5）
      {
         id: 'card35',
         zh: '做出選擇',
         target: 'slot-addon-perk',
         colorType: 'all-neutral-dark',
         summary: 'Let’s play a game：指定一個技能或配件欄位，再隨機選另一格，用滑條決定兩格互相轉移多少分。',
         effect:
         {
            type: 'card35_make_choice',
            data:
            {
            }
         }
      },

      // 36. 一視同仁（技能 + 配件 全部變成同一個隨機分數 1–5）
      {
         id: 'card36',
         zh: '一視同仁',
         target: 'any',
         colorType: 'all-neutral',
         summary: '所有技能與配件會被設為同一個隨機分數（1–5）。',
         effect:
         {
            type: 'card36_equal_score',
            data:
            {
            }
         }
      },

      // 37. The World：限時自由更換配件與技能
      {
         id: 'card37',
         zh: '砸瓦魯多',
         target: 'any',
         colorType: 'star-platinum',
         summary: '無駄無駄無駄無駄!',
         effect:
         {
            type: 'card37_star_platinum',
            data:
            {
            }
         }
      },

      // 38. 限時四選一：每輪獨立計時 1 秒
      {
         id: 'card38',
         zh: '生死時速',
         target: 'slot-perk',
         colorType: 'perk-slot',
         summary: '每輪從 4 個 2–5 分技能中選 1 個，獨立計時 1 秒；超時會在原視窗顯示「失敗」，按兩次任意按鍵後繼續。',
         effect:
         {
            type: 'card38_speed_choice',
            data:
            {
            }
         }
      },

      // 39. 快問快答：選兩格後答題，答對 +2，答錯/超時 -1
      {
         id: 'card39',
         zh: '快問快答',
         target: 'any',
         colorType: 'all-neutral-dark',
         summary: '選兩個非殺手欄位後進行快問快答；答對兩格各 +2，答錯或超時則各 -1。',
         effect:
         {
            type: 'card39_quiz',
            data:
            {
            }
         }
      },

      // 40. 賽巴精選：選兩個技能欄位，套用隨機套餐，配件各降 1 分
      {
         id: 'card40',
         zh: '賽巴精選',
         target: 'any',
         colorType: 'all-colored',
         summary: '選擇兩個技能欄位，抽出賽巴精選套餐並套用技能；配件 -1 分重抽。',
         effect:
         {
            type: 'card40_ceba_combo',
            data:
            {
            }
         }
      },

      // 41. 神之一手：候選分數 40% 高於、40% 等於、20% 低於原分數
      {
         id: 'card41',
         zh: '神之一手',
         target: 'any',
         colorType: "deity",
         summary: '請示神明幫你換技能。',
         effect:
         {
            type: 'card41_ask_deity',
            data:
            {
               maxLaughsPerSlot: 3
            }
         }
      },

      {
         id: 'card42',
         zh: '賽巴精選',
         target: 'slot-perk',
         colorType: 'all-colored',
         summary: '選擇一個技能欄位，我會幫你依照鬼給你個技能ouob；配件 -1 分重抽。',
         effect:
         {
            type: 'card42_ceba_killer_perk',
            data:
            {
            }
         }
      },
      {
         id: 'card43',
         zh: '免死金牌',
         target: 'passive',
         colorType: 'gold',
         summary: '本輪不會抽到迷因配件；其他卡片效果完成後，一個最低分欄位 +2 分重抽。',
         effect:
         {
            type: 'card43_immunity',
            data:
            {
            }
         }
      },
      {
         id: 'card44',
         zh: '二十一點',
         target: 'any',
         colorType: 'casino',
         summary: '用技能點數挑戰莊家。輸了隨機扣除技能與配件分數；贏了獲得可自由分配與增加候選的點數。',
         effect:
         {
            type: 'card44_blackjack',
            data:
            {
            }
         }
      },
      {
         id: 'card45',
         zh: '退讓一步',
         target: 'slot-addon-perk',
         colorType: 'slot',
         summary: '指定欄位減 1 分，從最多 5 個同分候選中選擇替換。',
         effect: {type: 'score_down_choice', data: {decrease: 1, choices: 5}}
      },
      {
         id: 'card46',
         zh: '退讓兩步',
         target: 'slot-addon-perk',
         colorType: 'slot',
         summary: '指定欄位減 2 分，從最多 10 個同分候選中選擇替換。',
         effect: {type: 'score_down_choice', data: {decrease: 2, choices: 10}}
      }
   ];

   const CEBA_KILLER_PERKS =
   {
      "The Trapper": [
         "Corrupt Intervention",
         "No Way Out",
         "Remember Me"
      ],
      "The Wraith": [
         "Turn Back the Clock",
         "Brutal Strength",
         "Bamboozle"
      ],
      "The Hillbilly": [
         "Bamboozle",
         "Barbecue & Chilli",
         "Hex: Hive Mind",
         "Lethal Pursuer",
         "Turn Back the Clock"
      ],
      "The Nurse": [
         "Lethal Pursuer",
         "Barbecue & Chilli",
         "Nowhere to Hide",
         "Predator",
         "Deerstalker",
         "Celestial Witness",
         "Nemesis"
      ],
      "The Shape": [
         "Play with Your Food",
         "Friends 'til the End",
         "Rapid Brutality"
      ],
      "The Hag": [
         "Monitor & Abuse",
         "Make Your Choice",
         "Coup de Grace"
      ],
      "The Doctor": [
         "Brutal Strength",
         "Rapid Brutality",
         "Distressing",
         "Coulrophobia"
      ],
      "The Huntress": [
         "Ultimate Weapon",
         "Darkness Revealed",
         "Iron Maiden"
      ],
      "The Cannibal": [
         "Bamboozle",
         "Hex: Crowd Control",
         "Spirit Fury"
      ],
      "The Nightmare": [
         "Fire Up",
         "Rapid Brutality",
         "Save the Best for Last",
         "Thrilling Tremors"
      ],
      "The Pig": [
         "Play with Your Food",
         "Ultimate Weapon",
         "Hex: Face the Darkness"
      ],
      "The Clown": [
         "Rapid Brutality",
         "Save the Best for Last",
         "Coup de Grace"
      ],
      "The Spirit": [
         "Rapid Brutality",
         "Save the Best for Last",
         "Batteries Included"
      ],
      "The Legion": [
         "Hex: Blood Favour",
         "Alien Instinct",
         "Surge"
      ],
      "The Plague": [
         "Thanatophobia",
         "Dying Light",
         "Batteries Included"
      ],
      "The Ghost Face": [
         "Play with Your Food",
         "A Nurse's Calling",
         "Batteries Included",
         "Pop Goes the Weasel"
      ],
      "The Demogorgon": [
         "Enduring",
         "Bamboozle",
         "Superior Anatomy"
      ],
      "The Oni": [
         "Play with Your Food",
         "Friends 'til the End",
         "Batteries Included"
      ],
      "The Deathslinger": [
         "Coup de Grace",
         "Batteries Included",
         "Rapid Brutality"
      ],
      "The Executioner": [
         "Zanshin Tactics",
         "I'm All Ears",
         "Discordance"
      ],
      "The Blight": [
         "Deerstalker",
         "Brutal Strength",
         "Lethal Pursuer",
         "Barbecue & Chilli"
      ],
      "The Twins": [
         "Hex: The Third Seal"
      ],
      "The Trickster": [
         "Batteries Included",
         "Hex: Blood Favour"
      ],
      "The Nemesis": [
         "Nemesis",
         "Discordance",
         "THWACK!",
         "Turn Back the Clock",
         "Eruption",
         "Lay Waste"
      ],
      "The Cenobite": [
         "Coup de Grace",
         "Hex: Face the Darkness",
         "Rapid Brutality"
      ],
      "The Artist": [
         "Gearhead",
         "Barbecue & Chilli",
         "Scourge Hook: Floods of Rage",
         "Discordance",
         "Celestial Witness",
         "Nemesis"
      ],
      "The Onryo": [
         "Brutal Strength",
         "Play with Your Food",
         "Rapid Brutality",
         "Save the Best for Last"
      ],
      "The Dredge": [
         "Surge",
         "Batteries Included",
         "Make Your Choice",
         "Coup de Grace"
      ],
      "The Mastermind": [
         "Brutal Strength",
         "Eruption",
         "Corrupt Intervention",
         "Turn Back the Clock"
      ],
      "The Knight": [
         "Surge",
         "Hex: Hive Mind",
         "Hex: Crowd Control",
         "Mindbreaker"
      ],
      "The Skull Merchant": [
         "Play with Your Food",
         "Batteries Included",
         "Rapid Brutality",
         "Save the Best for Last"
      ],
      "The Singularity": [
         "Bamboozle",
         "Surge",
         "Brutal Strength"
      ],
      "The Xenomorph": [
         "Enduring",
         "Eruption",
         "Bamboozle",
         "Batteries Included",
         "Knock Out"
      ],
      "The Good Guy": [
         "Batteries Included",
         "Turn Back the Clock",
         "Zanshin Tactics",
         "I'm All Ears"
      ],
      "The Unknown": [
         "Batteries Included",
         "Pop Goes the Weasel",
         "Nowhere to Hide",
         "Celestial Witness",
         "Nemesis",
         "Deerstalker",
         "Dead Man's Switch"
      ],
      "The Lich": [
         "Turn Back the Clock",
         "Thrilling Tremors",
         "I'm All Ears",
         "Furtive Chase",
         "Play with Your Food"
      ],
      "The Dark Lord": [
         "Turn Back the Clock",
         "Discordance",
         "Hex: Blood Favour",
         "Dead Man's Switch",
         "Dissolution"
      ],
      "The Houndmaster": [
         "Batteries Included",
         "Hex: Blood Favour",
         "Surge",
         "Corrupt Intervention",
         "Rapid Brutality",
         "Coup de Grace"
      ],
      "The Ghoul": [
         "Coup de Grace",
         "Fire Up",
         "Brutal Strength",
         "Agitation",
         "Hex: Blood Favour",
         "Forever Entwined"
      ],
      "The Animatronic": [
         "Leverage",
         "Bamboozle",
         "Hex: Blood Favour",
         "Surveillance"
      ],
      "The Krasue": [
         "Hex: Hive Mind",
         "Hex: Blood Favour",
         "Save the Best for Last"
      ],
      "The First": [
         "Batteries Included",
         "Scourge Hook: Floods of Rage",
         "Barbecue & Chilli",
         "Celestial Witness",
         "Nemesis"
      ],
      "The Slasher": [
         "THWACK!",
         "Hex: Hive Mind",
         "Batteries Included",
         "Hex: Ruin"
      ],
      "The Judgment": [
         "Celestial Witness",
         "Nemesis",
         "Lethal Pursuer",
         "Deerstalker",
         "Predator"
      ]
   };

   const CONDITIONAL_CEBA_KILLERS = ['The Nurse', 'The Artist', 'The Unknown', 'The First', 'The Judgment'];

   const CEBA_COMBOS = [
   {
      name: '與心愛的你行至世界盡頭',
      perks: ['牢牢緊握', '欣喜若狂']
   },
   {
      name: '滾雪球',
      perks: ['超級死黨', '鬼祟追逐']
   },
   {
      name: '歷久不衰',
      perks: ['死者開關', '禍害之鉤:痛苦迴響']
   },
   {
      name: '可能有點過期的',
      perks: ['爆發', '海之喚']
   },
   {
      name: '查無此人',
      perks: ['感染碰觸', '遊蕩之眼']
   },
   {
      name: '金剛腿',
      perks: ['所向無敵', '怒火中燒']
   },
   {
      name: '鐵頭功',
      perks: ['耐力持久', '暴怒怨靈']
   },
   {
      name: '多米諾骨牌',
      perks: ['恐懼傳染', '強制減速']
   },
   {
      name: '你看不到我啊',
      perks: ['出乎意料', '折磨之路']
   },
   {
      name: 'Need Some Pressure',
      perks: ['心驚肉跳', '逆轉時光']
   },
   {
      name: '禁止攜帶入場',
      perks: ['富蘭克林之死', '魔網同調']
   },
   {
      name: '40米長刀',
      perks: ['恩賜解脫', '震撼雷霆']
   },
   {
      name: '舉重選手',
      perks: ['永世糾纏', '怒火中燒']
   },
   {
      name: 'Party Walk',
      perks: ['疾速殘暴', '把最好的留在最後']
   },
   {
      name: '氣場滿天飛',
      perks: ['宿敵', '星辰證人']
   },
   {
      name: '懶得踹機',
      perks: ['突爆', '逆轉時光']
   },
   {
      name: '再給我兩分鐘',
      perks: ['無路可逃', '勿忘我']
   },
   {
      name: '拆圖騰模擬器',
      perks: ['厄咒:玩物', '厄咒:修飾痕']
   },
   {
      name: '我看到你了',
      perks: ['致命追逐者', '人肉燒烤']
   },
   {
      name: '後果自負',
      perks: ['厄咒:以眼還眼', '驕兵必破']
   }];

   // ==========================
   // 2. 共用工具
   // ==========================
   function shuffle(arr)
   {
      const copy = arr.slice();
      for (let i = copy.length - 1; i > 0; i--)
      {
         const j = Math.floor(Math.random() * (i + 1));
         [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
   }

   function getRandomItem(arr)
   {
      if (!arr || !arr.length) return null;
      return arr[Math.floor(Math.random() * arr.length)];
   }

   function cloneState(state)
   {
      return {
         killerKey: state.killerKey || null,
         addons: Array.isArray(state.addons) ? state.addons.slice() : [],
         perks: Array.isArray(state.perks) ? state.perks.slice() : []
      };
   }

   function getAllPerkNames()
   {
      return Object.keys(window.PERKS ||
      {});
   }

   function getAllPerksExcept(currentList)
   {
      const set = new Set(currentList || []);
      return getAllPerkNames().filter(name => !set.has(name));
   }

   function getAddonNamesForKiller(killerKey)
   {
      return Object.entries(window.ADDONS ||
         {})
         .filter(([name, a]) => a && a.killer === killerKey)
         .map(([name]) => name);
   }

   function getAllAddonsExceptForKiller(killerKey, currentList)
   {
      const set = new Set(currentList || []);
      return getAddonNamesForKiller(killerKey).filter(name => !set.has(name));
   }

   function getAddonsByAliasForKiller(killerKey, aliasText, excludeNames)
   {
      const exclude = new Set(excludeNames || []);
      return Object.entries(window.ADDONS ||
         {})
         .filter(([name, a]) =>
         {
            if (!a || a.killer !== killerKey) return false;
            if (exclude.has(name)) return false;
            const aliases = a.aliases || [];
            return aliases.includes(aliasText);
         })
         .map(([name]) => name);
   }

   function getPerkZh(name)
   {
      const p = window.PERKS && window.PERKS[name];
      return (p && p.zh) || '';
   }

   // 透過中文名稱找回 PERKS 的 key（方便你用中文直接指定技能）
   function findPerkKeyByZh(zhName)
   {
      const entries = Object.entries(window.PERKS ||
      {});
      for (const [key, perk] of entries)
      {
         if (!perk) continue;
         if ((perk.zh || '') === zhName || (perk.aliases || []).includes(zhName)) return key;
      }
      // 若遇到些微不一致，做一次模糊包含（保守）
      for (const [key, perk] of entries)
      {
         const zh = (perk && perk.zh) ? perk.zh : '';
         if (zh && zh.includes(zhName)) return key;
      }
      return null;
   }

   function getPerkImg(name)
   {
      const p = window.PERKS && window.PERKS[name];
      return (p && p.img) || '';
   }

   function getAddonZh(name)
   {
      const a = window.ADDONS && window.ADDONS[name];
      return (a && a.zh) || '';
   }

   function getAddonImg(name)
   {
      const a = window.ADDONS && window.ADDONS[name];
      return (a && a.img) || '';
   }

   function getKillerZh(key)
   {
      const k = window.KILLERS && window.KILLERS[key];
      return (k && k.zh) || key || '';
   }

   function getKillerImg(key)
   {
      const k = window.KILLERS && window.KILLERS[key];
      if (!k || !k.img) return '';

      let img = k.img;

      // 拉霸模式改用 killers2 資料夾
      img = img.replace("images/killers/", "images/killers2/");

      return img;
   }

   function getKillerScore(key)
   {
      const k = window.KILLERS && window.KILLERS[key];
      return (k && typeof k.score === 'number') ? k.score : null;
   }

   function getPerkScore(name)
   {
      const p = window.PERKS && window.PERKS[name];
      return (p && typeof p.score === 'number') ? p.score : null;
   }

   function getAddonScore(name)
   {
      const a = window.ADDONS && window.ADDONS[name];
      return (a && typeof a.score === 'number') ? a.score : null;
   }

   function getPerkNamesByScores(scores)
   {
      const scoreSet = new Set(scores || []);
      return Object.entries(window.PERKS ||
         {})
         .filter(([name, p]) => p && typeof p.score === 'number' && scoreSet.has(p.score))
         .map(([name]) => name);
   }

   function getAddonNamesByScoresForKiller(killerKey, scores)
   {
      if (!killerKey) return [];
      const scoreSet = new Set(scores || []);
      return Object.entries(window.ADDONS ||
         {})
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

若是我今天想要到陰屍路的專屬地圖，我在燒祭品的情況下機率為多少？（前提：所有玩家上一場都不是該地圖，且沒有人阻擋地圖祭品。）
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

   function parseCard39QuizRaw(raw)
   {
      const blocks = String(raw || '')
         .replace(/^\uFEFF/, '')
         .split(/\n\s*\n+/)
         .map(s => s.trim())
         .filter(Boolean);

      return blocks.map(block =>
      {
         let lines = block.split(/\n+/).map(s => s.trim()).filter(Boolean);
         if (!lines.length) return null;

         // 第一段題庫前面會有一個標題「題目」，不要把它當成真正題目
         if (lines[0] === '題目')
         {
            lines = lines.slice(1);
         }
         if (!lines.length) return null;

         const question = lines[0];
         const options = [];
         let answer = '';
         let note = '';

         for (let i = 1; i < lines.length; i++)
         {
            const line = lines[i];
            if (/^[A-D]\./.test(line))
            {
               options.push(
               {
                  label: line.slice(0, 1),
                  text: line.slice(2).trim()
               });
               continue;
            }
            if (line.startsWith('答 '))
            {
               const rest = line.slice(2).trim();
               const parts = rest.split(/\s+註釋:/);
               answer = (parts[0] || '').trim();
               note = (parts[1] || '').trim();
            }
         }

         if (!question) return null;
         return {
            question,
            options,
            answer,
            note
         };
      }).filter(Boolean);
   }

   const CARD39_QUIZ_DATA = Array.isArray(window.CARD39_QUIZ_DATA) && window.CARD39_QUIZ_DATA.length ?
      window.CARD39_QUIZ_DATA :
      parseCard39QuizRaw(CARD39_QUIZ_RAW);

   function normalizeCard39AnswerToken(value)
   {
      return String(value || '')
         .trim()
         .replace(/[．。]/g, '.')
         .replace(/^([A-D])\.$/, '$1')
         .replace(/\s+/g, '')
         .toUpperCase();
   }

   // ==========================
   // 2.x 測試用：強制抽中卡片 test
   // 可填入：2、'2'、'02'、'card02' 皆可
   // 例：const FORCE_DRAW_CARD_IDS = [17];
   // 每次進入卡片階段時，會優先把這些卡塞進 3 張卡片中（最多 3 張）
   // ==========================
   const FORCE_DRAW_CARD_IDS = [];

   function normalizeForcedCardId(value)
   {
      if (value == null) return null;
      const raw = String(value).trim();
      if (!raw) return null;

      const candidates = [];
      if (/^card\d+$/i.test(raw))
      {
         const digits = String(parseInt(raw.replace(/^card/i, ''), 10));
         if (digits && digits !== 'NaN')
         {
            candidates.push('card' + digits);
            candidates.push('card' + digits.padStart(2, '0'));
         }
      }
      else if (/^\d+$/.test(raw))
      {
         const digits = String(parseInt(raw, 10));
         if (digits && digits !== 'NaN')
         {
            candidates.push('card' + digits);
            candidates.push('card' + digits.padStart(2, '0'));
         }
      }
      else
      {
         return null;
      }

      for (const id of candidates)
      {
         if (CARDS.some(c => c && c.id === id)) return id;
      }
      return candidates[0] || null;
   }

   function getForcedCards(extraExcludeIds)
   {
      const exclude = new Set(extraExcludeIds || []);
      const result = [];
      const used = new Set();

      (FORCE_DRAW_CARD_IDS || []).forEach((value) =>
      {
         const id = normalizeForcedCardId(value);
         if (!id || used.has(id) || exclude.has(id)) return;
         const found = CARDS.find(c => c.id === id);
         if (!found) return;
         used.add(id);
         result.push(found);
      });

      return result.slice(0, 3);
   }

   function getGeneralPerkNames()
   {
      return Object.entries(window.PERKS ||
         {})
         .filter(([_, p]) => p && p.killer === 'General')
         .map(([name]) => name);
   }

   function pickDistinctRandom(arr, count)
   {
      return shuffle(arr || []).slice(0, Math.max(0, count || 0));
   }

   function getFallbackScoreSequence(score, opts)
   {
      const addOneFirst = !opts || opts.addOneFirst !== false;
      const seq = [];
      const push = (v) =>
      {
         if (typeof v !== 'number') return;
         if (v < 0 || v > 5) return;
         if (!seq.includes(v)) seq.push(v);
      };

      push(score);
      if (addOneFirst)
      {
         push(score + 1);
         push(score - 1);
      }
      else
      {
         push(score - 1);
         push(score + 1);
      }
      for (let delta = 2; delta <= 5; delta++)
      {
         push(score + delta);
         push(score - delta);
      }
      return seq;
   }

   function pickFromPoolPreferDistinct(pool, usedSet, allowDuplicateFallback)
   {
      const used = usedSet || new Set();
      let filtered = (pool || []).filter(name => !used.has(name));
      if (!filtered.length && allowDuplicateFallback)
      {
         filtered = (pool || []).slice();
      }
      if (!filtered.length) return null;
      return getRandomItem(filtered);
   }

   function buildPerkSelectionForScores(targetScores, options)
   {
      const opts = options ||
      {
      };
      const used = new Set(opts.initialUsed || []);
      const result = [];

      for (const score of targetScores)
      {
         let chosen = null;
         const sequence = typeof opts.scoreFallbackSequence === 'function' ?
            opts.scoreFallbackSequence(score) :
            [score];
         for (const s of sequence)
         {
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

   function buildAddonSelectionForScores(killerKey, targetScores, options)
   {
      const opts = options ||
      {
      };
      const used = new Set(opts.initialUsed || []);
      const result = [];

      for (const score of targetScores)
      {
         let chosen = null;
         const sequence = typeof opts.scoreFallbackSequence === 'function' ?
            opts.scoreFallbackSequence(score) :
            [score];
         for (const s of sequence)
         {
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

   function sanitizeAddonState(state)
   {
      if (!state || !state.killerKey) return state;

      const killerKey = state.killerKey;
      const killerPool = getAddonNamesForKiller(killerKey);
      const validSet = new Set(killerPool);
      const original = Array.isArray(state.addons) ? state.addons.slice(0, 2) : [];
      const result = [];
      const used = new Set();

      for (const name of original)
      {
         if (!name)
         {
            result.push(null);
            continue;
         }
         if (!validSet.has(name) || used.has(name))
         {
            result.push(null);
            continue;
         }
         result.push(name);
         used.add(name);
      }

      while (result.length < 2) result.push(null);

      for (let i = 0; i < 2; i++)
      {
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

   function rerollPerkSlotByScore(slotIdx, scoreSequence, options)
   {
      if (slotIdx < 0 || slotIdx > 3) return false;
      const perks = currentState.perks.slice();
      const other = perks.filter((_, i) => i !== slotIdx);
      for (const score of scoreSequence)
      {
         let pool = getPerkNamesByScores([score]).filter(name => !other.includes(name) && name !== perks[slotIdx]);
         if (!pool.length && options && options.allowKeepSameName)
         {
            pool = getPerkNamesByScores([score]).filter(name => !other.includes(name));
         }
         if (!pool.length && options && options.allowDuplicateFallback)
         {
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

   function rerollAddonSlotByScore(slotIdx, scoreSequence, options)
   {
      if (slotIdx < 0 || slotIdx > 1) return false;
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;
      const addons = currentState.addons.slice();
      const other = addons.filter((_, i) => i !== slotIdx);
      for (const score of scoreSequence)
      {
         let pool = getAddonNamesByScoresForKiller(killerKey, [score]).filter(name => !other.includes(name) && name !== addons[slotIdx]);
         if (!pool.length && options && options.allowKeepSameName)
         {
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

   function ensureStyles()
   {
      if (styleInjected) return;
      styleInjected = true;

      const style = document.createElement('style');
      style.id = 'card-system-styles';
      style.textContent = `
#cardContainer
{
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

#cardContainer.card-visible
{
   opacity: 1;
   transform: translateY(0);
}

.slot-card
{
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
      transform 0.45s cubic-bezier(.17, .67, .32, 1.4),
      opacity 0.3s ease-out;
   cursor: grab;
   user-select: none;
}

.slot-card.show
{
   opacity: 1;
   transform: translateY(0);
}

.slot-card:active
{
   cursor: grabbing;
}

.slot-card.card41-hover-note
{
   position: relative;
   overflow: visible;
}

.slot-card.card41-hover-note::after
{
   content: attr(data-hover-note);
   position: absolute;
   left: 50%;
   bottom: calc(100% + 10px);
   transform: translate(-50%, 6px);
   min-width: max-content;
   max-width: 260px;
   padding: 9px 13px;
   border: 1px solid rgba(143, 128, 255, 0.75);
   border-radius: 10px;
   background: rgba(18, 12, 52, 0.97);
   color: #fff;
   font-size: 14px;
   font-weight: 800;
   line-height: 1.35;
   text-align: center;
   box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55), 0 0 16px rgba(143, 128, 255, 0.3);
   opacity: 0;
   visibility: hidden;
   pointer-events: none;
   transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
   z-index: 30;
}

.slot-card.card41-hover-note:hover::after
{
   opacity: 1;
   visibility: visible;
   transform: translate(-50%, 0);
}

.the-world-title
{
   ruby-position: over;
   ruby-align: center;
}
.the-world-title rt
{
   font-size: .42em;
   font-weight: 500;
   letter-spacing: .08em;
}
.slot-card.color-star-platinum .slot-card-header
{
   line-height: 1.8;
}
.slot-card-header
{
   font-size: 22px;
   font-weight: 800;
   text-align: center;
   margin-top: 4px;
   margin-bottom: 10px;
   letter-spacing: 0.05em;
}

.slot-card-summary
{
   font-size: 12px;
   line-height: 1.4;
   opacity: 0.9;
   white-space: pre-line;
}

.slot-card-footer
{
   font-size: 11px;
   opacity: 0.65;
   text-align: right;
   margin-top: 8px;
}

.slot-card.color-all-colored
{
   background: linear-gradient(135deg, #d11b4f, #510a1e);
}

.slot-card.color-all-neutral
{
   background: linear-gradient(135deg, #3a87dd, #071787);
}

.slot-card.color-all-neutral-dark
{
   background: linear-gradient(135deg, #5f4938, #1a140f);
}

.slot-card.color-addon
{
   background: linear-gradient(135deg, #b34fd1ff, #612b72ff);
}
.slot-card.color-casino
{
   background: linear-gradient(135deg, #28734f 0%, #174c35 55%, #0b2c21 100%);
   border-color: #c9ad67;
   color: #fff3d7;
}
.slot-card.color-casino .slot-card-header
{
   color: #ffe3a0;
}
.dbd-card-panel.card-choice-double-list
{
   max-width: min(900px, calc(100vw - 40px)) !important;
}
.card-choice-double-list .card-choice-list
{
   display: grid;
   grid-template-columns: repeat(2, minmax(0, 1fr));
}
.card-choice-double-list .card-choice-item
{
   min-width: 0;
}
@media(max-width:650px)
{
   .card-choice-double-list .card-choice-list {grid-template-columns:1fr;}
}

.slot-card.color-deity
{
   background: linear-gradient(135deg,
         #8f80ff 0%,
         #3f2cc2 55%,
         #1b126e 100%);
}

.slot-card.color-perk
{
   background: linear-gradient(135deg, #4494bb, #a5a7cd);
}

.slot-card.color-slot
{
   background: linear-gradient(135deg, #f6b73c, #8a5600);
}

.slot-card.color-perk-slot
{
   background: linear-gradient(135deg, #5caf4eff, #2a5a21ff);
}

/* The World */
.slot-card.color-star-platinum
{
   background: linear-gradient(135deg, #E8CF8D 0%, #DDB65F 48%, #C69B43 100%);
   text-shadow: 0 1px 2px rgba(65, 39, 0, .75), 0 0 4px rgba(65, 39, 0, .25);
}

.slot-cell.card-drop-ok
{
   outline: 2px solid #fff4b3;
   box-shadow: 0 0 12px rgba(255, 255, 200, 0.9);
   opacity: 1 !important;
}

/* 多選彈窗 */
#cardChoiceOverlay
{
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.6);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 9999;
}

.card-choice-panel
{
   background: #1b1b1b;
   border-radius: 10px;
   padding: 16px 18px;
   max-width: 480px;
   width: 90%;
   color: #f5f5f5;
   box-shadow: 0 18px 36px rgba(0, 0, 0, 0.7);
}

.card-choice-title
{
   font-size: 14px;
   font-weight: 700;
   margin-bottom: 10px;
}

.card-choice-list
{
   display: flex;
   flex-direction: column;
   gap: 8px;
   margin-bottom: 10px;
}

.card-choice-item
{
   display: flex;
   align-items: center;
   gap: 8px;
   padding: 6px 8px;
   border-radius: 6px;
   background: #2a2a2a;
   cursor: pointer;
   transition: background 0.15s ease-out;
}

.card-choice-item:hover
{
   background: #3a3a3a;
}

.card-choice-icon
{
   width: 32px;
   height: 32px;
   border-radius: 4px;
   overflow: hidden;
   flex-shrink: 0;
   background: #000;
}

.card-choice-icon img
{
   width: 32px;
   height: 32px;
   object-fit: contain;
   display: block;
}

.card-choice-text-main
{
   font-size: 13px;
   font-weight: 600;
}

.card-choice-text-sub
{
   font-size: 11px;
   opacity: 0.75;
}

.card-choice-footer
{
   text-align: right;
   font-size: 11px;
   opacity: 0.7;
}

/* 兩選一彈窗（卡35） */
#cardBinaryChoiceOverlay
{
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.6);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 9999;
}

.card-binary-panel
{
   background: #1b1b1b;
   border-radius: 10px;
   padding: 16px 18px;
   max-width: 520px;
   width: 92%;
   color: #f5f5f5;
   box-shadow: 0 18px 36px rgba(0, 0, 0, 0.7);
}

.card-binary-title
{
   font-size: 14px;
   font-weight: 700;
   margin-bottom: 10px;
   white-space: pre-line;
}

.card-binary-actions
{
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 10px;
}

.card-binary-btn
{
   border: none;
   border-radius: 10px;
   padding: 10px 12px;
   background: #2a2a2a;
   color: #f5f5f5;
   cursor: pointer;
   text-align: left;
   transition: transform 0.12s ease-out, background 0.12s ease-out;
   box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
}

.card-binary-btn:hover
{
   background: #3a3a3a;
   transform: translateY(-1px);
}

.card-binary-btn:active
{
   transform: translateY(0);
}

.card-binary-btn .card-binary-label
{
   font-size: 13px;
   font-weight: 700;
   margin-bottom: 4px;
}

.card-binary-btn .card-binary-desc
{
   font-size: 12px;
   opacity: 0.85;
   line-height: 1.35;
   white-space: pre-line;
}



/* 觀看廣告（卡30）過場：全螢幕輪播，不可跳過 */
#cardAdOverlay
{
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.92);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 10000;
}

#cardAdOverlay .card-ad-img
{
   max-width: 100vw;
   max-height: 100vh;
   object-fit: contain;
   display: block;
}

#cardAdOverlay .card-ad-hint
{
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

#cardAdOverlay.can-close .card-ad-hint
{
   opacity: 1;
}

/* 無效卡片彈窗 */
#cardInvalidOverlay
{
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.6);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 9999;
}

.card-invalid-panel
{
   background: #1b1b1b;
   border-radius: 10px;
   padding: 16px 20px;
   max-width: 360px;
   width: 90%;
   color: #f5f5f5;
   box-shadow: 0 18px 36px rgba(0, 0, 0, 0.7);
   text-align: left;
   font-size: 13px;
}

.card-invalid-title
{
   font-weight: 700;
   margin-bottom: 8px;
}

.card-invalid-body
{
   white-space: pre-line;
   margin-bottom: 12px;
}

.card-invalid-btn
{
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

.card-invalid-btn:hover
{
   background: #ffd36c;
}

#card35TransferOverlay
{
   position: fixed;
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 100030;
}
.card35-transfer-panel
{
   width: 760px;
   text-align: center;
}
.card35-transfer-panel h2
{
   margin: 0 0 24px;
   font-size: 32px;
}
.card35-transfer-slots
{
   display: grid;
   grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
   gap: 8px;
   align-items: center;
}
.card35-transfer-knife
{
   font-size: 40px;
   line-height: 1;
   text-align: center;
   transform: rotate(-45deg);
   transition: transform .18s ease, opacity .18s ease;
}
.card35-transfer-slot
{
   padding: 18px 12px;
   border: 1px solid var(--dbd-line);
   border-radius: 12px;
   background: var(--dbd-raised);
   line-height: 1.6;
}
.card35-transfer-slot img
{
   display: block;
   width: 96px;
   height: 96px;
   object-fit: contain;
   margin: 12px auto;
}
.card35-transfer-score
{
   margin-top: 8px;
   color: #ffd36e;
}
.card35-transfer-directions
{
   display: flex;
   justify-content: space-between;
   margin-top: 28px;
   font-size: 13px;
   color: var(--dbd-muted);
}
.card35-transfer-panel input[type="range"]
{
   appearance: none;
   -webkit-appearance: none;
   width: 100%;
   height: 36px;
   margin: 20px 0;
   padding: 0;
   border: 0;
   background: transparent;
   cursor: ew-resize;
}
.card35-transfer-panel input[type="range"]::-webkit-slider-runnable-track
{
   height: 12px;
   border-radius: 999px;
   background: #772630;
   border: 1px solid #d74b58;
}
.card35-transfer-panel input[type="range"]::-webkit-slider-thumb
{
   appearance: none;
   -webkit-appearance: none;
   width: 32px;
   height: 32px;
   margin-top: -11px;
   border-radius: 50%;
   background: #ed3447;
   border: 3px solid #ffd5da;
   box-shadow: 0 3px 10px rgba(0, 0, 0, .35);
}
.card35-transfer-panel input[type="range"]::-moz-range-track
{
   height: 12px;
   border-radius: 999px;
   background: #772630;
   border: 1px solid #d74b58;
}
.card35-transfer-panel input[type="range"]::-moz-range-thumb
{
   width: 26px;
   height: 26px;
   border-radius: 50%;
   background: #ed3447;
   border: 3px solid #ffd5da;
   box-shadow: 0 3px 10px rgba(0, 0, 0, .35);
}
.card35-transfer-status
{
   min-height: 40px;
   font-size: 13px;
   color: var(--dbd-muted);
   margin-bottom: 12px;
}
.card35-transfer-panel button
{
   min-width: 120px;
   padding: 10px 24px;
   background: var(--dbd-raised);
}

#card43ImmunityOverlay
{
   position: fixed;
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 100060;
}
.card43-immunity-panel
{
   width: 580px;
   text-align: center;
}
.slot-card.color-gold
{
   background: linear-gradient(135deg, #fff2a6 0%, #ffd447 22%, #d99a08 48%, #ffde64 72%, #b87900 100%);
   color: #4a2c00;
   border: 2px solid #ffe993;
   box-shadow: 0 10px 24px rgba(0, 0, 0, .45), 0 0 24px rgba(255, 202, 40, .5), inset 0 0 16px rgba(255, 249, 194, .5);
}
.card43-immunity-medal
{
   width: 180px;
   min-height: 230px;
   margin: 20px auto;
   display: flex;
   align-items: center;
   justify-content: center;
   background: linear-gradient(135deg, #fff5b0 0%, #ffdc43 25%, #dca000 48%, #ffe779 72%, #ba7b00 100%);
   border: 3px solid #fff1a0;
   border-radius: 16px;
   color: #442604;
   font-size: 32px;
   font-weight: 900;
   box-shadow: 0 0 44px rgba(255, 208, 40, .65), inset 0 0 20px rgba(255, 249, 194, .6);
}
.card43-immunity-result
{
   margin: 20px 0;
   font-size: 18px;
   color: #ffe7a0;
}

#card39AnswerOverlay
{
   position: fixed;
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 100040;
}
.card39-answer-panel
{
   width: 760px;
   text-align: center;
   --answer-accent: #ff7b88;
}
.dbd-card-panel.card39-answer-panel
{
   background: radial-gradient(ellipse at top, #202c42, #0b101a 70%) !important;
   padding: 32px !important;
   border: 2px solid var(--answer-accent) !important;
   box-shadow: 0 20px 56px rgba(0, 0, 0, .55), 0 0 24px color-mix(in srgb, var(--answer-accent) 18%, transparent) !important;
}
.card39-answer-panel[data-result="correct"]
{
   --answer-accent: #77e1ac;
}
.card39-answer-panel[data-result="timeout"]
{
   --answer-accent: #ff7b88;
}
.card39-answer-kicker
{
   color: var(--dbd-muted);
   font-size: 11px;
   letter-spacing: .16em;
}
.card39-answer-title
{
   color: var(--answer-accent);
   display: inline-block;
   font-size: 16px;
   margin: 14px 0 24px;
   padding: 6px 18px;
   border: 1px solid var(--answer-accent);
   border-radius: 999px;
}
.card39-answer-question
{
   font-size: 22px;
   font-weight: 700;
   line-height: 1.7;
   margin-bottom: 24px;
   white-space: pre-wrap;
   overflow-wrap: anywhere;
}
.card39-answer-details
{
   display: grid;
   grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
   gap: 24px;
   align-items: stretch;
}
.card39-answer-box,
.card39-answer-note
{
   display: flex;
   flex-direction: column;
   justify-content: center;
   min-height: 180px;
   min-width: 0;
}
.card39-answer-note-text
{
   font-size: 22px;
   line-height: 1.6;
}
.card39-answer-box
{
   padding: 12px 0;
}
.card39-answer-label
{
   font-size: 12px;
   color: var(--dbd-muted);
   margin-bottom: 6px;
}
.card39-answer-value
{
   font-size: clamp(48px, 10vw, 88px);
   color: var(--answer-accent);
   font-weight: 900;
   line-height: 1.3;
   text-shadow: 0 0 24px color-mix(in srgb, var(--answer-accent) 20%, transparent);
   white-space: pre-wrap;
   overflow-wrap: anywhere;
}
.card39-answer-note
{
   padding: 12px 0;
   font-size: 16px;
   line-height: 1.7;
   white-space: pre-wrap;
   overflow-wrap: anywhere;
}
.card39-answer-footer
{
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 20px;
   margin-top: 20px;
   padding-top: 18px;
   font-size: 13px;
   color: var(--dbd-muted);
}
.card39-answer-footer button
{
   min-width: 180px;
   padding: 12px 32px;
   background: #344664;
   color: var(--dbd-text);
   flex-shrink: 0;
}

/* Shared popup styles merged from card-ui.css. */
/* dbdtool 7.0 — shared popup surfaces, spacing and interaction states. */
:root
{
   --dbd-surface: #0d1320;
   --dbd-raised: #2b3650;
   --dbd-line: rgba(172, 190, 225, .2);
   --dbd-text: #f2f5fc;
   --dbd-muted: #b4bed3;
   --dbd-radius: 16px;
   --dbd-shadow: 0 20px 56px rgba(0, 0, 0, .55);
}
.dbd-card-overlay
{
   padding: 20px !important;
   box-sizing: border-box;
   background: rgba(6, 9, 18, .8) !important;
   overflow-y: auto;
}
.dbd-card-panel
{
   box-sizing: border-box;
   max-width: calc(100vw - 40px) !important;
   max-height: calc(100dvh - 40px);
   overflow-y: auto;
   background: var(--dbd-surface) !important;
   border: 1px solid var(--dbd-line) !important;
   border-radius: var(--dbd-radius) !important;
   padding: 24px !important;
   color: var(--dbd-text) !important;
   box-shadow: var(--dbd-shadow) !important;
   font-family: inherit;
}
.dbd-card-shell .dbd-card-panel
{
   max-height: calc(100dvh - 150px);
}
.dbd-card-panel.card-choice-panel,
.dbd-card-panel.card-binary-panel
{
   width: 100%;
   max-width: min(560px, calc(100vw - 40px)) !important;
}
.dbd-card-panel.card-invalid-panel
{
   max-width: min(420px, calc(100vw - 40px)) !important;
}
.card-choice-title,
.card-binary-title,
.card-invalid-title,
.card17-duel-title,
.card17-guess-title,
.card17-picker-title
{
   font-size: 20px !important;
   font-weight: 800 !important;
   line-height: 1.4;
   margin-bottom: 16px !important;
}
.card-choice-list
{
   gap: 10px !important;
}
.card-choice-item,
.card-binary-btn,
.card17-choice-btn,
.card17-picker-btn,
.dbd-card-panel button
{
   box-sizing: border-box;
   border-radius: 10px !important;
   border: 1px solid var(--dbd-line);
   color: var(--dbd-text);
   font-family: inherit;
   line-height: 1.5;
   transition: background .15s ease, border-color .15s ease, transform .15s ease;
}
.card-choice-item,
.card-binary-btn,
.card17-choice-btn,
.card17-picker-btn
{
   padding: 12px !important;
   background: var(--dbd-raised) !important;
}
.card-choice-item:hover,
.dbd-card-panel button:not(:disabled):hover
{
   border-color: #789dec !important;
   box-shadow: 0 0 0 1px rgba(120, 157, 236, .25);
}
.dbd-card-panel button:focus-visible,
.card-choice-item:focus-visible
{
   outline: 2px solid #99b8ff;
   outline-offset: 3px;
}
.dbd-card-panel button:disabled
{
   opacity: .5;
   cursor: not-allowed;
}
.card-choice-icon
{
   width: 48px !important;
   height: 48px !important;
   border-radius: 10px !important;
   background: #101320 !important;
}
.card-choice-icon img
{
   width: 100% !important;
   height: 100% !important;
}
.card-choice-large-portraits .card-choice-icon
{
   width: 88px !important;
   height: 88px !important;
}
.card-choice-large-portraits .card-choice-item
{
   gap: 16px;
}
.card-choice-text-main,
.card-binary-label
{
   font-size: 14px !important;
}
.card-choice-text-sub,
.card-choice-footer,
.card-binary-desc,
.card-invalid-body
{
   font-size: 13px !important;
   line-height: 1.6 !important;
   color: var(--dbd-muted);
   overflow-wrap: anywhere;
}
#card38SpeedChoiceOverlay .dbd-card-panel
{
   position: relative;
}
.card42-result-overlay
{
   position: fixed;
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 100030;
   cursor: pointer;
}
.card42-result-panel
{
   width: 860px;
   text-align: center;
   position: relative;
}
.card42-result-content
{
   display: grid;
   grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
   align-items: center;
   gap: 32px;
   padding: 24px 12px;
   min-height: 240px;
}
.card42-result-message
{
   text-align: left;
}
.card42-result-title
{
   font-size: clamp(30px, 4.5vw, 52px);
   font-weight: 900;
   line-height: 1.35;
}
.card42-result-image
{
   display: block;
   width: 200px;
   max-width: 100%;
   height: 200px;
   margin: 0 auto 16px;
   object-fit: contain;
}
.card42-result-name
{
   font-size: 18px;
   font-weight: 700;
}
.card42-result-hint
{
   margin-top: 24px;
   font-size: 12px;
   color: var(--dbd-muted);
   position: relative;
   z-index: 2;
}
.card42-nemesis
{
   color: #f01824;
   font-size: clamp(42px, 7vw, 88px);
   font-weight: 900;
   line-height: 1.1;
   text-align: left;
   text-shadow: 0 0 18px rgba(240, 24, 36, .2);
}
.card39-slot-option
{
   display: flex;
   align-items: center;
   gap: 12px;
}
.card39-slot-image
{
   width: 64px;
   height: 64px;
   flex-shrink: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 10px;
   background: #101320;
   overflow: hidden;
}
.card39-slot-image img
{
   width: 100%;
   height: 100%;
   object-fit: contain;
}
.card39-slot-text
{
   min-width: 0;
   overflow-wrap: anywhere;
}
#card38ReadyOverlay
{
   position: fixed;
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 100003;
}
.card38-ready-panel
{
   width: 640px;
   text-align: center;
}
.card38-ready-title
{
   font-size: clamp(32px, 5vw, 52px);
   font-weight: 900;
   margin: 12px 0;
}
.card38-ready-count
{
   font-size: clamp(120px, 20vw, 200px);
   font-weight: 900;
   color: #f01824;
   line-height: 1.2;
   margin: 16px 0;
}
.card38-failure
{
   position: absolute;
   inset: 0;
   z-index: 1;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   border-radius: inherit;
   background: rgba(8, 10, 18, .15);
   color: #fff;
   text-align: center;
   pointer-events: none;
}
.card38-failure-title
{
   font-size: clamp(96px, 19vw, 220px);
   font-weight: 900;
   line-height: 1.05;
   letter-spacing: .04em;
   color: #f01824;
}
.card38-failure-hint
{
   margin-top: 10px;
   font-size: 14px;
   line-height: 1.5;
   text-shadow: 0 2px 6px #000;
}
@media (max-width: 600px)
{
   .card42-result-content
   {
      gap: 16px;
      padding: 12px 0;
      min-height: 160px;
   }
   .card42-result-title
   {
      font-size: clamp(24px, 6vw, 36px);
   }
   .card42-result-image
   {
      height: 140px;
   }
   .card42-result-message .card42-nemesis
   {
      font-size: clamp(28px, 7vw, 42px);
      text-align: left;
   }
   .dbd-card-overlay
   {
      padding: 12px !important;
   }
   .dbd-card-panel
   {
      padding: 18px !important;
      max-width: calc(100vw - 24px) !important;
   }
   .card-binary-actions,
   .card17-picker-grid
   {
      grid-template-columns: 1fr !important;
   }
   #card39SlotPickerOverlay .dbd-card-panel > div:last-child,
   #card38SpeedChoiceOverlay .dbd-card-panel > div:last-child,
   #card40SlotPickerOverlay .dbd-card-panel > div:nth-child(3)
   {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
   }
   #card41DeityOverlay .dbd-card-panel
   {
      grid-template-columns: 1fr !important;
      min-height: 0 !important;
   }
   #card41DeityOverlay .dbd-card-panel > div
   {
      min-height: 260px !important;
      padding: 20px !important;
   }
}
`;
      document.head.appendChild(style);
   }

   function ensureCardContainer()
   {
      let container = document.getElementById('cardContainer');
      if (!container)
      {
         container = document.createElement('div');
         container.id = 'cardContainer';
      }

      const slotMode = document.getElementById('slotMode');
      if (slotMode && container.parentNode !== slotMode.parentNode)
      {
         slotMode.parentNode.insertBefore(container, slotMode.nextSibling);
      }
      return container;
   }

   // ==========================
   // 4. 卡片抽選（含特殊卡 5%）
   // ==========================
   function drawOneCardWeighted(excludeIds)
   {
      // 盡量容錯：就算 index 的 SlotSettings 腳本壞掉，也能從 localStorage 抓到設定
      let settings = window.SlotSettings || null;
      if (!settings)
      {
         try
         {
            const raw = localStorage.getItem('dbd_slot_settings');
            if (raw) settings = JSON.parse(raw);
         }
         catch (e)
         {
            /* ignore */ }
      }
      settings = settings ||
      {
      };

      const specialEnabled = !!(
         settings.specialCardsEnabled ??
         settings.enableSpecialCards ??
         settings.enableSpecial ??
         settings.ssEnableSpecialCards
      );

      excludeIds = excludeIds || [];

      // 特殊卡：目前支援 card1 / card30 / card33（總機率 5%）
      const specialIds = ['card1', 'card30', 'card33'];
      const specials = CARDS.filter(c => specialIds.includes(c.id));
      const normals = CARDS.filter(c => !specialIds.includes(c.id));

      if (specialEnabled)
      {
         const p = 0.05; // 5%
         const availableSpecials = specials.filter(c => !excludeIds.includes(c.id));
         if (availableSpecials.length && Math.random() < p)
         {
            return getRandomItem(availableSpecials);
         }
      }

      let pool = normals.filter(c => !excludeIds.includes(c.id));
      if (!pool.length) pool = normals;
      return getRandomItem(pool);
   }

   function pickThreeCards(extraExcludeIds)
   {
      const chosen = [];
      const exclude = new Set(extraExcludeIds || []);

      const forced = getForcedCards(Array.from(exclude));
      forced.forEach((card) =>
      {
         if (!exclude.has(card.id) && chosen.length < 3)
         {
            exclude.add(card.id);
            chosen.push(card);
         }
      });

      let safety = 0;
      while (chosen.length < 3 && safety < 100)
      {
         safety++;
         const card = drawOneCardWeighted(Array.from(exclude));
         if (!card) break;
         if (!exclude.has(card.id))
         {
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
   function showChoiceOverlay(options)
   {
      const type = options.type;
      const candidates = options.candidates || [];
      const onPick = options.onPick;

      const overlay = document.createElement('div');
      overlay.id = 'cardChoiceOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card-choice-panel';
      if (options.largePortraits) panel.classList.add('card-choice-large-portraits');
      if (options.doubleList) panel.classList.add('card-choice-double-list');

      const titleEl = document.createElement('div');
      titleEl.className = 'card-choice-title';
      titleEl.textContent = options.title || '選擇一個替換選項：';

      const listEl = document.createElement('div');
      listEl.className = 'card-choice-list';

      candidates.forEach(name =>
      {
         const item = document.createElement('div');
         item.className = 'card-choice-item';

         const iconBox = document.createElement('div');
         iconBox.className = 'card-choice-icon';
         const img = document.createElement('img');
         let zh = '';
         let imgSrc = '';
         if (type === 'perk')
         {
            zh = getPerkZh(name) || name;
            imgSrc = getPerkImg(name);
         }
         else if (type === 'killer')
         {
            zh = getKillerZh(name) || name;
            imgSrc = getKillerImg(name);
         }
         else
         {
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
         sub.textContent = options.showScores ? `${type === 'addon' ? getAddonScore(name) : getPerkScore(name)} 分` : '';

         textBox.appendChild(main);
         textBox.appendChild(sub);

         item.appendChild(iconBox);
         item.appendChild(textBox);

         item.addEventListener('click', () =>
         {
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
   function showBinaryChoiceOverlay(options)
   {
      const overlay = document.createElement('div');
      overlay.id = 'cardBinaryChoiceOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card-binary-panel';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-binary-title';
      titleEl.textContent = options.title || '做出選擇：';

      const actions = document.createElement('div');
      actions.className = 'card-binary-actions';

      const items = options.items || [];
      items.forEach((it) =>
      {
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

         btn.addEventListener('click', () =>
         {
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

   function showCard17ScoreChoiceOverlay(options)
   {
      const overlay = document.createElement('div');
      overlay.id = 'cardBinaryChoiceOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card-binary-panel';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-binary-title';
      titleEl.textContent = options.title || '選擇一個分數';

      panel.appendChild(titleEl);

      const ruleLines = Array.isArray(options.ruleLines) ? options.ruleLines.filter(Boolean) : [];
      if (ruleLines.length)
      {
         const rules = document.createElement('div');
         rules.className = 'card17-choice-rules';
         rules.style.margin = '10px 0 14px';
         rules.style.padding = '10px 12px';
         rules.style.borderRadius = '10px';
         rules.style.background = 'rgba(255,255,255,0.05)';
         rules.style.border = '1px solid rgba(255,255,255,0.08)';
         rules.style.textAlign = 'left';
         rules.style.lineHeight = '1.65';

         ruleLines.forEach((line, idx) =>
         {
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

      (options.values || []).forEach((value) =>
      {
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
         btn.addEventListener('click', () =>
         {
            if (overlay.parentNode) document.body.removeChild(overlay);
            if (typeof options.onPick === 'function') options.onPick(value);
         });
         actions.appendChild(btn);
      });

      panel.appendChild(actions);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
   }

   function showInfoPopup(title, body, onClose)
   {
      const overlay = document.createElement('div');
      overlay.id = 'cardInvalidOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card-invalid-panel';

      const titleEl = document.createElement('div');
      titleEl.className = 'card-invalid-title';
      titleEl.textContent = title || '提示';

      const bodyEl = document.createElement('div');
      bodyEl.className = 'card-invalid-body';
      bodyEl.textContent = body || '';

      const btn = document.createElement('div');
      btn.className = 'card-invalid-btn';
      btn.textContent = '確認';
      btn.addEventListener('click', () =>
      {
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

   function ensureCard17AnimStyles()
   {
      if (card17AnimStyleInjected) return;
      card17AnimStyleInjected = true;

      const style = document.createElement('style');
      style.id = 'card17-duel-styles';
      style.textContent = `
#card17DuelOverlay
{
   position: fixed;
   inset: 0;
   z-index: 21000;
   background: radial-gradient(circle at top, rgba(43, 58, 112, 0.45), rgba(0, 0, 0, 0.90) 62%);
   display: flex;
   align-items: center;
   justify-content: center;
   backdrop-filter: blur(4px);
}

.card17-duel-panel
{
   width: min(760px, calc(100vw - 28px));
   border-radius: 24px;
   padding: 22px 22px 18px;
   background: linear-gradient(180deg, rgba(8, 11, 20, 0.96), rgba(14, 18, 34, 0.98));
   border: 1px solid rgba(255, 255, 255, 0.10);
   box-shadow: 0 28px 80px rgba(0, 0, 0, 0.58), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
   color: #f3f6ff;
}

.card17-duel-title
{
   text-align: center;
   font-size: 24px;
   font-weight: 900;
   letter-spacing: 0.06em;
   margin-bottom: 10px;
}

.card17-duel-sub
{
   text-align: center;
   font-size: 13px;
   color: rgba(225, 232, 255, 0.72);
   margin-bottom: 18px;
}

.card17-duel-vs
{
   display: grid;
   grid-template-columns: 1fr auto 1fr;
   align-items: center;
   gap: 16px;
}

.card17-duel-side
{
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

.card17-duel-side::before
{
   content: '';
   position: absolute;
   inset: -30% auto auto -20%;
   width: 120px;
   height: 120px;
   background: radial-gradient(circle, rgba(255, 255, 255, 0.10), transparent 70%);
   pointer-events: none;
}

.card17-duel-label
{
   font-size: 13px;
   color: rgba(225, 232, 255, 0.72);
   margin-bottom: 10px;
   letter-spacing: 0.14em;
}

.card17-duel-score
{
   width: 116px;
   height: 116px;
   border-radius: 28px;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 64px;
   font-weight: 900;
   background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.03));
   border: 1px solid rgba(255, 255, 255, 0.10);
   box-shadow: inset 0 0 22px rgba(255, 255, 255, 0.05), 0 10px 30px rgba(0, 0, 0, 0.35);
   text-shadow: 0 0 20px rgba(255, 255, 255, 0.18);
   transform: scale(1);
}

.card17-duel-score.rolling
{
   animation: card17ScoreRoll 0.18s linear infinite;
}

.card17-duel-score.locked
{
   animation: card17ScoreLock 0.35s ease-out;
}

.card17-duel-score.win
{
   box-shadow: inset 0 0 26px rgba(255, 255, 255, 0.08), 0 0 36px rgba(115, 255, 176, 0.42);
}

.card17-duel-score.lose
{
   box-shadow: inset 0 0 26px rgba(255, 255, 255, 0.06), 0 0 36px rgba(255, 100, 126, 0.34);
}

.card17-duel-mid
{
   font-size: 36px;
   font-weight: 900;
   color: rgba(255, 255, 255, 0.92);
   text-shadow: 0 0 18px rgba(255, 255, 255, 0.22);
}

.card17-duel-status
{
   margin-top: 18px;
   min-height: 56px;
   border-radius: 16px;
   padding: 14px 16px;
   text-align: center;
   font-size: 15px;
   line-height: 1.5;
   color: #f3f6ff;
   background: rgba(255, 255, 255, 0.04);
   border: 1px solid rgba(255, 255, 255, 0.06);
}

.card17-duel-status.result-win
{
   background: rgba(62, 161, 103, 0.14);
   border-color: rgba(115, 255, 176, 0.26);
}

.card17-duel-status.result-lose
{
   background: rgba(181, 59, 96, 0.16);
   border-color: rgba(255, 115, 151, 0.24);
}

.card17-duel-status.result-draw
{
   background: rgba(91, 118, 201, 0.16);
   border-color: rgba(122, 167, 255, 0.22);
}

.card17-duel-hint
{
   margin-top: 10px;
   text-align: center;
   font-size: 12px;
   color: rgba(225, 232, 255, 0.55);
}

#card17DuelOverlay.ready
{
   cursor: pointer;
}

#card17DuelOverlay.ready .card17-duel-panel
{
   box-shadow: 0 28px 80px rgba(0, 0, 0, 0.58), 0 0 0 1px rgba(140, 190, 255, 0.10), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

@keyframes card17ScoreRoll
{
   0%
   {
      transform: translateY(0) scale(1);
      filter: brightness(0.96);
   }

   50%
   {
      transform: translateY(-2px) scale(1.04);
      filter: brightness(1.08);
   }

   100%
   {
      transform: translateY(0) scale(1);
      filter: brightness(0.96);
   }
}

@keyframes card17ScoreLock
{
   0%
   {
      transform: scale(1.14);
   }

   100%
   {
      transform: scale(1);
   }
}

@media (max-width: 640px)
{
   .card17-duel-vs
   {
      grid-template-columns: 1fr;
   }

   .card17-duel-mid
   {
      display: none;
   }

   .card17-duel-side
   {
      min-height: 170px;
   }
}
`;
      document.head.appendChild(style);
   }

   function showCard17DuelAnimation(playerScore, dealerScore, result, onDone)
   {
      ensureCard17AnimStyles();

      const overlay = document.createElement('div');
      overlay.id = 'card17DuelOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card17-duel-panel';

      const title = document.createElement('div');
      title.className = 'card17-duel-title';
      title.textContent = '狂賭之冤';

      const sub = document.createElement('div');
      sub.className = 'card17-duel-sub';
      sub.textContent = '分數對決中……';

      const vs = document.createElement('div');
      vs.className = 'card17-duel-vs';

      function makeSide(labelText)
      {
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
         return {
            side,
            score
         };
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
      const close = () =>
      {
         handles.forEach(id =>
         {
            clearInterval(id);
            clearTimeout(id);
         });
         overlay.removeEventListener('click', onOverlayClick, true);
         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
         if (typeof onDone === 'function') onDone();
      };

      function onOverlayClick(e)
      {
         if (!canClose)
         {
            e.preventDefault();
            e.stopPropagation();
            return;
         }
         close();
      }

      overlay.addEventListener('click', onOverlayClick, true);

      const playerRoll = setInterval(() =>
      {
         player.score.textContent = String(Math.floor(Math.random() * 6));
      }, 80);
      const dealerRoll = setInterval(() =>
      {
         dealer.score.textContent = String(Math.floor(Math.random() * 7));
      }, 80);
      handles.push(playerRoll, dealerRoll);

      handles.push(setTimeout(() =>
      {
         clearInterval(playerRoll);
         player.score.classList.remove('rolling');
         player.score.classList.add('locked');
         player.score.textContent = String(playerScore);
         status.textContent = '你的分數已鎖定，等待莊家……';
      }, 650));

      handles.push(setTimeout(() =>
      {
         clearInterval(dealerRoll);
         dealer.score.classList.remove('rolling');
         dealer.score.classList.add('locked');
         dealer.score.textContent = String(dealerScore);

         let resultText = '平手';
         if (result === 'win') resultText = '你贏了';
         else if (result === 'lose') resultText = '你輸了';

         status.classList.add(result === 'win' ? 'result-win' : (result === 'lose' ? 'result-lose' : 'result-draw'));
         status.textContent = `${resultText}！ 玩家 ${playerScore} ： 莊家 ${dealerScore}`;
         sub.textContent = result === 'win' ?
            '莊家比較大，依規則你獲勝。' :
            (result === 'lose' ? '莊家比較小，依規則你失敗。' : '雙方相同，依規則平手。');

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
   function showInvalidCardPopup(card, message)
   {
      const overlay = document.createElement('div');
      overlay.id = 'cardInvalidOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card-invalid-panel';

      const title = document.createElement('div');
      title.className = 'card-invalid-title';
      title.textContent = '卡片無法生效';

      const body = document.createElement('div');
      body.className = 'card-invalid-body';
      const cardName = (card.zh && card.zh.trim()) ? card.zh.trim() : card.id;
      body.textContent = message || `【${cardName}】試著生效……\n但它失敗了，被惡靈的大手撕個粉碎。`;

      const btn = document.createElement('div');
      btn.className = 'card-invalid-btn';
      btn.textContent = '知道了';

      btn.addEventListener('click', () =>
      {
         document.body.removeChild(overlay);

         if (Array.isArray(currentCards))
         {
            currentCards = currentCards.filter(c => c.id !== card.id);
         }

         if (currentCards && currentCards.some(item => item.target !== 'passive'))
         {
            renderCards();
            return;
         }

         // 三張都掛了 → 清空卡片 + reset
         isActive = false;
         dragInfo = null;
         const container = document.getElementById('cardContainer');
         if (container)
         {
            container.innerHTML = '';
            container.classList.remove('card-visible');
         }
         if (typeof window.resetSlotState === 'function')
         {
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
   function renderCards()
   {
      const container = ensureCardContainer();
      container.innerHTML = '';

      currentCards.forEach(card =>
      {
         const cardEl = document.createElement('div');
         cardEl.className = 'slot-card';
         cardEl.classList.add('color-' + card.colorType.replace(/_/g, '-'));
         cardEl.setAttribute('draggable', card.target === 'passive' ? 'false' : 'true');
         if (card.target === 'passive') cardEl.style.cursor = 'default';
         cardEl.dataset.cardId = card.id;
         if (card.id === 'card41')
         {
            cardEl.classList.add('card41-hover-note');
            cardEl.dataset.hoverNote = '不可以細節反問喔';
         }

         const header = document.createElement('div');
         header.className = 'slot-card-header';
         const titleText = card.zh && card.zh.trim() ? card.zh : '卡片';
         header.textContent = titleText;

         const summary = document.createElement('div');
         summary.className = 'slot-card-summary';
         summary.textContent = card.runtimeSummary || card.summary || '';
         if (card.id === 'card43')
         {
            const notice = document.createElement('strong');
            notice.textContent = '此卡無法使用';
            notice.style.cssText = 'display:block;text-align:center;font-weight:900;margin-bottom:12px;';
            summary.prepend(notice);
         }

         const footer = document.createElement('div');
         footer.className = 'slot-card-footer';
         footer.textContent = `ID: ${card.id}`;

         cardEl.appendChild(header);
         cardEl.appendChild(summary);
         cardEl.appendChild(footer);

         cardEl.addEventListener('dragstart', (e) =>
         {
            if (!isActive || card.target === 'passive')
            {
               e.preventDefault();
               return;
            }
            dragInfo = {
               card,
               el: cardEl
            };
            e.dataTransfer.effectAllowed = 'move';
         });

         cardEl.addEventListener('dragend', () =>
         {
            dragInfo = null;
            clearDropHighlights();
         });

         container.appendChild(cardEl);

         requestAnimationFrame(() =>
         {
            cardEl.classList.add('show');
         });
      });

      container.classList.add('card-visible');
   }

   // 7.5 動態補上 11 / 23 號卡的殺手名稱
   function decorateCardSummaries()
   {
      if (!Array.isArray(currentCards)) return;

      currentCards.forEach(card =>
      {
         card.runtimeSummary = card.summary || '';

         // 11 號：當前殺手
         if (card.id === 'card11')
         {
            const k = currentState && currentState.killerKey;
            if (k && window.KILLERS && window.KILLERS[k])
            {
               const killerZh = window.KILLERS[k].zh || k;
               card.runtimeSummary = `${card.runtimeSummary}\n指定殺手：${killerZh}`;
            }
         }

         // 23 號：每次顯示都重新抽選殺手，並顯示一致的 killerKey
         if (card.id === 'card23')
         {
            if (!card.effect)
               card.effect = {
                  type: 'replace_skill_by_random_killer_3pick',
                  data:
                  {
                  }
               };
            if (!card.effect.data)
               card.effect.data = {};

            const killerKeys = Object.keys(window.KILLERS ||
            {});
            if (killerKeys.length > 0)
            {
               // ✔ 每次顯示卡片都抽一位新殺手
               const killerKey = killerKeys[Math.floor(Math.random() * killerKeys.length)];
               card.effect.data.killerKey = killerKey;

               const killerZh = window.KILLERS[killerKey].zh || killerKey;

               // ✔ 調整 runtimeSummary（顯示在卡片上）
               card.runtimeSummary = `${card.summary}\n抽選殺手：${killerZh}`;
            }
            else
            {
               // ✔ fallback 避免 runtimeSummary undefined
               card.runtimeSummary = card.summary || '';
            }
         }

      });
   }

   // ==========================
   // 8. 主入口：startCardPhase
   // ==========================
   function startCardPhase(state, options)
   {
      if (!reservedRoundCards) prepareRound();
      const settings = window.SlotSettings ||
      {
      };
      if (settings.cardsEnabled === false)
      {
         // cards disabled: apply immediately
         try
         {
            if (options && typeof options.onApplied === 'function')
            {
               options.onApplied(state ||
               {});
            }
         }
         catch (e)
         {
         }
         return;
      }
      ensureStyles();
      ensureCardContainer();

      currentState = sanitizeAddonState(cloneState(state ||
      {}));
      applyCallback = options && typeof options.onApplied === 'function' ?
         options.onApplied :
         null;
      isActive = true;
      dragInfo = null;
      currentCards = reservedRoundCards.slice();

      decorateCardSummaries(); // 先補好敘述
      renderCards(); // 再畫卡
      bindDroppableSlots();
   }

   // ==========================
   // 9. Drop 區綁定
   // ==========================
   let droppableBound = false;

   function bindDroppableSlots()
   {
      if (droppableBound) return;
      droppableBound = true;

      const board = document.getElementById('slotBoard');
      if (!board) return;

      const cells = Array.from(board.querySelectorAll('.slot-cell'));
      cells.forEach((cell, idx) =>
      {
         cell.dataset.slotIndex = idx;

         cell.addEventListener('dragover', (e) =>
         {
            if (!isActive || !dragInfo) return;
            const card = dragInfo.card;
            if (!card) return;
            if (isCardAllowedOnSlot(card, idx))
            {
               e.preventDefault();
               clearDropHighlights();
               cell.classList.add('card-drop-ok');
            }
         });

         cell.addEventListener('dragleave', () =>
         {
            cell.classList.remove('card-drop-ok');
         });

         cell.addEventListener('drop', (e) =>
         {
            if (!isActive || !dragInfo) return;
            e.preventDefault();
            const card = dragInfo.card;
            if (!card) return;
            const slotIndex = idx;
            if (!isCardAllowedOnSlot(card, slotIndex))
            {
               clearDropHighlights();
               return;
            }
            applyCardOnSlot(card, slotIndex);
         });
      });
   }

   function clearDropHighlights()
   {
      const cells = Array.from(document.querySelectorAll('#slotBoard .slot-cell'));
      cells.forEach(c => c.classList.remove('card-drop-ok'));
   }

   function isCardAllowedOnSlot(card, slotIndex)
   {
      const t = card.target;
      const isAddon = slotIndex === 1 || slotIndex === 2;
      const isPerk = slotIndex >= 3 && slotIndex <= 6;

      if (t === 'any') return true;
      if (t === 'addon') return isAddon;
      if (t === 'perk') return isPerk;
      if (t === 'slot-any') return true;
      if (t === 'slot-addon-perk') return isAddon || isPerk;
      if (t === 'slot-perk') return isPerk;
      return false;
   }

   // ==========================
   // 10. 卡片效果實作
   // ==========================
   function applyCardOnSlot(card, slotIndex)
   {
      const type = card.effect && card.effect.type;
      let ok = true;
      switch (type)
      {
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
         case 'card02_reroll_slot_extra_card':
            ok = doCard02RerollSlotExtraCard(card, slotIndex);
            if (ok) return;
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

         case 'card28_ban_pick':
            doCard28BanPick();
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
            doCard35MakeChoice(card, slotIndex);
            return;
         case 'card36_equal_score':
            ok = doCard36EqualScore();
            break;
         case 'card37_star_platinum':
            doCard37StarPlatinum();
            return;
         case 'card38_speed_choice':
            ok = doCard38SpeedChoice(slotIndex);
            if (ok) return;
            break;
         case 'card39_quiz':
            doCard39Quiz();
            return;
         case 'card40_ceba_combo':
            doCard40CebaCombo();
            return;
         case 'card42_ceba_killer_perk':
            doCard42CebaKillerPerk(slotIndex, card);
            return;
         case 'card41_ask_deity':
            doCard41AskDeity(card);
            return;
         case 'card17_extreme_redistribute':
            ok = doCard17ExtremeRedistribute();
            break;
         case 'card44_blackjack':
            doCard44Blackjack();
            return;
         case 'score_down_choice':
            doScoreDownChoice(card, slotIndex);
            return;
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

      if (!ok)
      {

         return;
      }

      // card1：使用後立刻生效，但用全螢幕圖片做結算提示（點任意處關閉）
      if (card && card.id === 'card1')
      {
         showCard1UseFullscreen(() => finishCardPhase());
         return;
      }

      finishCardPhase();
   }

   // ==========================
   // 10.x card1 全螢幕圖片提示
   // ==========================
   function showFullscreenImage(src, onClose, timeoutMs)
   {
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

      function closeOnce()
      {
         if (closed) return;
         closed = true;
         if (t) clearTimeout(t);
         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
         if (typeof onClose === 'function') onClose();
      }

      if (typeof timeoutMs === 'number' && timeoutMs > 0)
      {
         t = setTimeout(closeOnce, timeoutMs);
      }

      overlay.addEventListener('click', closeOnce);
   }

   function showCard1UseFullscreen(onClose)
   {
      const imgSrc = './images/other/彩蛋1.png';
      showFullscreenImage(imgSrc, onClose);
   }

   function doRerollAllIncludingKiller()
   {
      const killerKeys = Object.keys(window.KILLERS ||
      {});
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

   function doRerollAllExceptKiller()
   {
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

   function doRerollAddonsAll()
   {
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

   function doRerollSingleSlot(slotIndex)
   {
      if (!currentState) return false;

      const isAddonSlot = slotIndex === 1 || slotIndex === 2;
      const isPerkSlot = slotIndex >= 3 && slotIndex <= 6;
      if (!isAddonSlot && !isPerkSlot) return false;

      if (isAddonSlot)
      {
         const killerKey = currentState.killerKey;
         if (!killerKey || !Array.isArray(currentState.addons) || currentState.addons.length < 2) return false;

         const idx = slotIndex - 1;
         const originalAddons = currentState.addons.slice();
         const usedByOtherSlot = originalAddons.filter((_, i) => i !== idx);
         const pool = getAddonNamesForKiller(killerKey).filter(name =>
         {
            return name !== originalAddons[idx] && !usedByOtherSlot.includes(name);
         });
         if (!pool.length) return false;

         const picked = getRandomItem(pool);
         if (!picked) return false;

         const newAddons = originalAddons.slice();
         newAddons[idx] = picked;
         currentState.addons = newAddons;
         return true;
      }

      const idx = slotIndex - 3;
      if (!Array.isArray(currentState.perks) || currentState.perks.length < 4) return false;

      const originalPerks = currentState.perks.slice();
      const usedByOtherSlots = originalPerks.filter((_, i) => i !== idx);
      const pool = Object.keys(window.PERKS ||
      {}).filter(name =>
      {
         return name !== originalPerks[idx] && !usedByOtherSlots.includes(name);
      });
      if (!pool.length) return false;

      const picked = getRandomItem(pool);
      if (!picked) return false;

      const newPerks = originalPerks.slice();
      newPerks[idx] = picked;
      currentState.perks = newPerks;
      return true;
   }

   function syncCurrentStateToBoardWithoutEndingPhase()
   {
      if (typeof applyCallback !== 'function') return;
      try
      {
         applyCallback(sanitizeAddonState(cloneState(currentState)));
      }
      catch (e)
      {
         console.warn('起床重睡同步目前配置失敗:', e);
      }
   }

   function continueCardPhaseWithRemainingCards(usedCard, messageTitle, messageBody)
   {
      dragInfo = null;
      clearDropHighlights();

      if (Array.isArray(currentCards))
      {
         currentCards = currentCards.filter(c => !usedCard || c.id !== usedCard.id);
      }

      // 先同步畫面，讓玩家立刻看到指定欄位已經重抽。
      syncCurrentStateToBoardWithoutEndingPhase();

      if (currentCards && currentCards.some(item => item.target !== 'passive'))
      {
         decorateCardSummaries();
         renderCards();
         showInfoPopup(
            messageTitle || '起床重睡',
            messageBody || '請再次選擇使用一張卡片。',
            () =>
            {
            }
         );
         return;
      }

      finishCardPhase();
   }

   function doCard02RerollSlotExtraCard(card, slotIndex)
   {
      const ok = doRerollSingleSlot(slotIndex);
      if (!ok) return false;

      continueCardPhaseWithRemainingCards(
         card,
         '起床重睡',
         '指定欄位已重抽。本卡不結束卡片階段，請從剩餘卡片中再使用一張。'
      );
      return true;
   }

   function doRerollPerksAll()
   {
      const current = currentState.perks.slice();
      const pool = getAllPerksExcept(current);
      if (pool.length < 4) return false;

      const shuffled = shuffle(pool);
      const newPerks = shuffled.slice(0, 4);
      if (newPerks.length !== 4) return false;

      currentState.perks = newPerks;
      return true;
   }

   function doRerollTargetPerk(slotIndex)
   {
      if (slotIndex < 3 || slotIndex > 6) return false;
      if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4)
      {
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

   function doRerollRandomPerks(count)
   {
      count = Math.max(1, Math.min(4, count || 1));
      const indices = shuffle([0, 1, 2, 3]).slice(0, count);
      const originalPerks = currentState.perks.slice();
      if (originalPerks.length < 4) return false;

      // 全部技能池除去當前四個技能，避免重複與原本技能
      const basePool = getAllPerksExcept(originalPerks);
      if (basePool.length < indices.length) return false;

      const shuffledPool = shuffle(basePool);
      const finalPerks = originalPerks.slice();

      for (let i = 0; i < indices.length; i++)
      {
         finalPerks[indices[i]] = shuffledPool[i];
      }

      currentState.perks = finalPerks;
      return true;
   }

   function doRerollRandomSlots(min, max)
   {
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
      const baseAddonPool = killerKey ?
         getAddonNamesForKiller(killerKey).filter(name => !originalAddons.includes(name)) :
         [];

      for (const slot of chosen)
      {
         if (slot === 1 || slot === 2)
         {
            // 配件欄位
            if (!killerKey) return false;
            const idx = slot - 1;

            const pool = baseAddonPool.filter(n => !finalAddons.includes(n));
            if (!pool.length) return false;

            const chosenName = getRandomItem(pool);
            finalAddons[idx] = chosenName;
         }
         else
         {
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
   function doCard17ExtremeRedistribute()
   {
      if (!currentState) return false;
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;

      const slots = [
      {
         kind: 'addon',
         idx: 0
      },
      {
         kind: 'addon',
         idx: 1
      },
      {
         kind: 'perk',
         idx: 0
      },
      {
         kind: 'perk',
         idx: 1
      },
      {
         kind: 'perk',
         idx: 2
      },
      {
         kind: 'perk',
         idx: 3
      }];

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
      for (const s of score1Slots)
      {
         if (s.kind === 'perk')
         {
            const pool = perkScore1Pool.filter(n => !usedPerks.has(n));
            if (!pool.length) return false;
            const chosen = getRandomItem(pool);
            usedPerks.add(chosen);
            newPerks[s.idx] = chosen;
         }
         else
         {
            const pool = addonScore1Pool.filter(n => !usedAddons.has(n));
            if (!pool.length) return false;
            const chosen = getRandomItem(pool);
            usedAddons.add(chosen);
            newAddons[s.idx] = chosen;
         }
      }

      // 再處理 3/4/5 分欄位
      for (const s of otherSlots)
      {
         if (s.kind === 'perk')
         {
            const pool = perk345Pool.filter(n => !usedPerks.has(n));
            if (!pool.length) return false;
            const chosen = getRandomItem(pool);
            usedPerks.add(chosen);
            newPerks[s.idx] = chosen;
         }
         else
         {
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
   function doCard19ZeroAndPlusOne(slotIndex)
   {
      const isPerk = slotIndex >= 3 && slotIndex <= 6;
      if (!isPerk) return false;
      if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4)
      {
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
      for (let i = 0; i < newPerks.length; i++)
      {
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

   // 35 號卡：滑條分數轉移；缺少候選時只向上找分數。
   function getCard35TransferPairs(first, second, amount)
   {
      if (!amount) return [];
      const targets = [first.score + amount, second.score - amount].map((score, idx) =>
      {
         const meta = idx === 0 ? first : second;
         return Math.max(meta.isAddon ? 1 : 0, Math.min(5, score));
      });
      const selectedSlots = new Set([first.slotIndex, second.slotIndex]);
      function candidates(meta, score)
      {
         const pool = meta.isAddon ? getAddonNamesByScoresForKiller(currentState.killerKey, [score]) : getPerkNamesByScores([score]);
         const existing = meta.isAddon ? currentState.addons : currentState.perks;
         const base = meta.isAddon ? 1 : 3;
         return pool.filter(name => !existing.some((oldName, idx) => !selectedSlots.has(base + idx) && oldName === name));
      }
      let bestIncrease = Infinity;
      let pairs = [];
      for (let firstScore = targets[0]; firstScore <= 5; firstScore++)
      {
         for (let secondScore = targets[1]; secondScore <= 5; secondScore++)
         {
            const increase = firstScore - targets[0] + secondScore - targets[1];
            if (increase > bestIncrease) continue;
            for (const a of candidates(first, firstScore))
            {
               for (const b of candidates(second, secondScore))
               {
                  if (first.isAddon === second.isAddon && a === b) continue;
                  if (increase < bestIncrease)
                  {
                     bestIncrease = increase;
                     pairs = [];
                  }
                  const pair = [a, b];
                  pair.targetScores = targets;
                  pairs.push(pair);
               }
            }
         }
      }
      return pairs;
   }

   function doCard35MakeChoice(card, slotIndex)
   {
      if (!Number.isInteger(slotIndex) || slotIndex < 1 || slotIndex > 6 || !currentState) return;
      const first = getCard39SlotMeta(slotIndex);
      const randomIndex = getRandomItem([1, 2, 3, 4, 5, 6].filter(idx => idx !== slotIndex));
      const second = getCard39SlotMeta(randomIndex);
      if (!first || !second || typeof first.score !== 'number' || typeof second.score !== 'number')
      {
         showInvalidCardPopup(card);
         return;
      }
      const choices = new Map();
      for (let amount = -5; amount <= 5; amount++)
      {
         const pairs = getCard35TransferPairs(first, second, amount);
         if (pairs.length) choices.set(amount, pairs);
      }
      if (!choices.size)
      {
         showInvalidCardPopup(card, '這兩格沒有可用的加減分組合，請使用其他卡片。');
         return;
      }
      const overlay = document.createElement('div');
      overlay.id = 'card35TransferOverlay';
      overlay.className = 'dbd-card-overlay card35-transfer-overlay';
      const panel = document.createElement('div');
      panel.className = 'dbd-card-panel card35-transfer-panel';
      const title = document.createElement('h2');
      title.textContent = "Let's play a game";
      const row = document.createElement('div');
      row.className = 'card35-transfer-slots';
      const knife = document.createElement('div');
      knife.className = 'card35-transfer-knife';
      knife.textContent = '🔪';
      knife.setAttribute('aria-hidden', 'true');
      const scoreLabels = [];
      const previewImages = [];
      const previewNames = [];
      const previewPairs = new Map();
      [first, second].forEach((meta, idx) =>
      {
         const box = document.createElement('div');
         box.className = 'card35-transfer-slot';
         const label = document.createElement('div');
         label.textContent = `${idx === 0 ? '選的格子' : '隨機格子'} · ${meta.label}`;
         const image = document.createElement('img');
         image.src = meta.isAddon ? getAddonImg(meta.name) : getPerkImg(meta.name);
         image.alt = meta.zh || meta.name;
         const name = document.createElement('div');
         name.textContent = meta.zh || meta.name;
         name.className = 'card35-transfer-name';
         previewImages.push(image);
         previewNames.push(name);
         const score = document.createElement('div');
         score.className = 'card35-transfer-score';
         scoreLabels.push(score);
         box.append(label, image, name, score);
         row.appendChild(box);
         if (idx === 0) row.appendChild(knife);
      });
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '-5';
      slider.max = '5';
      slider.step = '1';
      slider.value = '0';
      slider.setAttribute('aria-label', '分數轉移：向左指定格加分，向右指定格減分');
      const status = document.createElement('div');
      status.className = 'card35-transfer-status';
      status.setAttribute('aria-live', 'polite');
      const confirm = document.createElement('button');
      confirm.type = 'button';
      confirm.textContent = '確定';
      function preview()
      {
         const amount = -Number(slider.value);
         const deltas = [amount, -amount];
         // Windows renders the knife tip down-right; point the tip horizontally at the losing slot.
         knife.style.transform = amount > 0 ? 'scale(-1, -1) rotate(135deg)' : 'scaleY(-1) rotate(135deg)';
         knife.style.opacity = amount === 0 ? '0.4' : '1';
         if (choices.has(amount) && !previewPairs.has(amount))
         {
            previewPairs.set(amount, getRandomItem(choices.get(amount)));
         }
         const pair = previewPairs.get(amount);
         [first, second].forEach((meta, idx) =>
         {
            const delta = deltas[idx];
            const displayedScore = pair ? pair.targetScores[idx] : Math.max(0, Math.min(5, meta.score + delta));
            const candidate = amount === 0 ? meta.name : pair && pair[idx];
            const actualScore = candidate ? (meta.isAddon ? getAddonScore(candidate) : getPerkScore(candidate)) : null;
            scoreLabels[idx].textContent = `${displayedScore} 分（${actualScore == null ? '無可用分數' : actualScore + ' 分'}）`;
            const image = previewImages[idx];
            image.style.visibility = candidate ? 'visible' : 'hidden';
            if (candidate)
            {
               image.src = meta.isAddon ? getAddonImg(candidate) : getPerkImg(candidate);
               const zh = meta.isAddon ? getAddonZh(candidate) : getPerkZh(candidate);
               image.alt = zh || candidate;
               previewNames[idx].textContent = zh || candidate;
            }
            else
            {
               previewNames[idx].textContent = '無可用候選';
            }
         });
         confirm.disabled = !choices.has(amount);
         status.textContent = amount === 0 ? '拖動滑條，決定轉移多少分。' : confirm.disabled ? '這個位置無法重抽：分數超出範圍或沒有可用組合。' : '確認後，這兩格會依新分數重抽。';
      }
      slider.addEventListener('input', preview);
      let applied = false;
      confirm.addEventListener('click', () =>
      {
         if (applied) return;
         const pair = previewPairs.get(-Number(slider.value));
         if (!pair) return;
         applied = true;
         slider.disabled = true;
         confirm.disabled = true;
         confirm.textContent = '執行中…';
         status.textContent = '';
         const amount = -Number(slider.value);
         const losingBox = row.querySelectorAll('.card35-transfer-slot')[amount > 0 ? 1 : 0];
         const knifeRect = knife.getBoundingClientRect();
         const targetRect = losingBox.getBoundingClientRect();
         const distance = targetRect.left + targetRect.width / 2 - (knifeRect.left + knifeRect.width / 2);
         const orientation = knife.style.transform;
         knife.animate(
         [
            { transform: orientation, opacity: 1 },
            { transform: `translateX(${distance}px) ${orientation}`, opacity: 1 }
         ],
         {
            duration: 550,
            easing: 'cubic-bezier(.35,0,.8,.3)',
            fill: 'forwards'
         });
         const roundState = currentState;
         setTimeout(() =>
         {
            if (currentState !== roundState || !overlay.isConnected) return;
            [first, second].forEach((meta, idx) =>
            {
               const list = meta.isAddon ? currentState.addons : currentState.perks;
               list[meta.slotIndex - (meta.isAddon ? 1 : 3)] = pair[idx];
            });
            overlay.remove();
            finishCardPhase();
         }, 650);
      });
      preview();
      panel.append(title, row, slider, status, confirm);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
   }

   // 36 號卡：一視同仁（技能 + 配件 全部變成同一個隨機分數 1–5）

   // 37. The World

   function playCard40CompleteSound()
   {
      try
      {
         const audio = new Audio('./complet.mp3');
         audio.volume = 0.35;
         const p = audio.play();
         if (p && typeof p.catch === 'function') p.catch(() =>
         {});
      }
      catch (e)
      {
      }
   }

   function findPerkKeyByZhOrKey(name)
   {
      if (!name) return null;
      if (window.PERKS && window.PERKS[name]) return name;
      const found = findPerkKeyByZh(name);
      if (found) return found;
      const norm = String(name).replace(/\s+/g, '').replace(/[：:]/g, ':').toLowerCase();
      for (const [key, perk] of Object.entries(window.PERKS ||
         {}))
      {
         const zh = perk && perk.zh ? String(perk.zh) : '';
         const keyNorm = String(key).replace(/\s+/g, '').replace(/[：:]/g, ':').toLowerCase();
         const zhNorm = zh.replace(/\s+/g, '').replace(/[：:]/g, ':').toLowerCase();
         if (keyNorm === norm || zhNorm === norm) return key;
      }
      return null;
   }

   function findAddonKeyByName(name)
   {
      if (!name) return null;
      if (window.ADDONS && window.ADDONS[name]) return name;
      const norm = String(name).replace(/\s+/g, '').replace(/[：:]/g, ':').toLowerCase();
      for (const [key, addon] of Object.entries(window.ADDONS ||
         {}))
      {
         const zh = addon && addon.zh ? String(addon.zh) : '';
         const keyNorm = String(key).replace(/\s+/g, '').replace(/[：:]/g, ':').toLowerCase();
         const zhNorm = zh.replace(/\s+/g, '').replace(/[：:]/g, ':').toLowerCase();
         if (keyNorm === norm || zhNorm === norm) return key;
      }
      return null;
   }

   function getAddonScoreSafe(name)
   {
      const key = findAddonKeyByName(name);
      return key ? getAddonScore(key) : null;
   }

   function rerollCard40AddonsMinusOne(delta = -1)
   {
      if (!currentState || !currentState.killerKey || !Array.isArray(currentState.addons)) return false;

      const killerKey = currentState.killerKey;
      const original = currentState.addons.slice(0, 2).map(findAddonKeyByName);
      if (original.length < 2 || original.some(a => !a)) return false;

      const oldScores = original.map(a => getAddonScoreSafe(a));
      if (oldScores.some(s => typeof s !== 'number')) return false;

      const allAddons = getAddonNamesForKiller(killerKey).filter(a => !original.includes(a));
      if (allAddons.length < 2) return false;

      const minusPairs = [];
      const samePairs = [];
      const plusPairs = [];

      for (let i = 0; i < allAddons.length; i++)
      {
         for (let j = i + 1; j < allAddons.length; j++)
         {
            const a = allAddons[i];
            const b = allAddons[j];

            const sa = getAddonScoreSafe(a);
            const sb = getAddonScoreSafe(b);
            if (typeof sa !== 'number' || typeof sb !== 'number') continue;

            // 第一優先：一般套餐 -1 分，彩蛋套餐 +1 分。
            if ((sa === oldScores[0] + delta && sb === oldScores[1] + delta) ||
               (sa === oldScores[1] + delta && sb === oldScores[0] + delta))
            {
               minusPairs.push([a, b]);
            }

            // 第二優先：兩個配件都同分重抽
            if ((sa === oldScores[0] && sb === oldScores[1]) ||
               (sa === oldScores[1] && sb === oldScores[0]))
            {
               samePairs.push([a, b]);
            }

            // 第三優先：目標與同分都不足時，沿用原有的反方向備援。
            if ((sa === oldScores[0] - delta && sb === oldScores[1] - delta) ||
               (sa === oldScores[1] - delta && sb === oldScores[0] - delta))
            {
               plusPairs.push([a, b]);
            }
         }
      }

      if (minusPairs.length)
      {
         currentState.addons = getRandomItem(minusPairs);
         return true;
      }

      if (samePairs.length)
      {
         currentState.addons = getRandomItem(samePairs);
         return true;
      }

      if (plusPairs.length)
      {
         currentState.addons = getRandomItem(plusPairs);
         return true;
      }

      return false;
   }

   function pickCard40ComboForSlots(slotIdxs)
   {
      if (!Array.isArray(CEBA_COMBOS) || !CEBA_COMBOS.length) return null;
      const selectedSlots = new Set(slotIdxs || []);
      const existingOutsideSelected = new Set(
         (currentState.perks || []).filter((_, idx) => !selectedSlots.has(idx))
      );

      const candidates = shuffle(CEBA_COMBOS).map(combo =>
      {
         const perkKeys = Array.isArray(combo.perks) ? combo.perks.map(findPerkKeyByZhOrKey) : [];
         return {
            combo,
            perkKeys
         };
      }).filter(item =>
      {
         if (!item.combo || item.perkKeys.length < 2 || item.perkKeys.some(k => !k)) return false;
         if (item.perkKeys[0] === item.perkKeys[1]) return false;
         return item.perkKeys.every(k => !existingOutsideSelected.has(k));
      });

      return candidates[0] || null;
   }

   function showCard40ComboResult(combo, onClose)
   {
      const overlay = document.createElement('div');
      overlay.id = 'card40ComboOverlay';
      overlay.classList.add('dbd-card-overlay');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.76);display:flex;align-items:center;justify-content:center;z-index:100030;color:#fff;cursor:pointer;padding:24px;box-sizing:border-box;';

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.style.cssText = 'max-width:980px;width:min(980px,94vw);text-align:center;pointer-events:none;background:linear-gradient(135deg,#d11b4f,#510a1e);border:1px solid rgba(255,255,255,0.22);border-radius:18px;padding:34px 32px 30px;box-shadow:0 22px 54px rgba(0,0,0,0.72),0 0 34px rgba(209,27,79,0.28),inset 0 0 0 1px rgba(255,255,255,0.06);';

      const pre = document.createElement('div');
      pre.textContent = '賽巴精選';
      pre.style.cssText = 'font-size:20px;letter-spacing:0.16em;color:rgba(255,255,255,0.72);font-weight:800;margin-bottom:22px;';

      const line = document.createElement('div');
      line.style.cssText = 'display:flex;align-items:baseline;justify-content:center;gap:14px;flex-wrap:wrap;line-height:1.05;';

      const title = document.createElement('span');
      title.textContent = `「${combo.name}」`;
      title.style.cssText = 'font-size:clamp(44px,7.2vw,104px);font-weight:1000;text-shadow:0 0 24px rgba(255,255,255,0.16),0 8px 30px rgba(0,0,0,0.75);';

      const suffix = document.createElement('span');
      suffix.textContent = '套餐';
      suffix.style.cssText = 'font-size:clamp(22px,3vw,40px);font-weight:900;color:rgba(255,255,255,0.82);';

      const hint = document.createElement('div');
      hint.textContent = '點任意位置繼續';
      hint.style.cssText = 'font-size:16px;margin-top:28px;color:rgba(255,255,255,0.55);';

      line.appendChild(title);
      line.appendChild(suffix);
      panel.appendChild(pre);
      panel.appendChild(line);
      panel.appendChild(hint);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      function closeOnce()
      {
         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
         if (typeof onClose === 'function') onClose();
      }
      overlay.addEventListener('click', closeOnce,
      {
         once: true
      });
   }

   function showCard40SlotPicker(onPick, requiredCount = 2)
   {
      const overlay = document.createElement('div');
      overlay.id = 'card40SlotPickerOverlay';
      overlay.classList.add('dbd-card-overlay');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:100029;color:#fff;padding:18px;box-sizing:border-box;';

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.style.cssText = 'width:min(980px,96vw);background:#1b1b1b;border:1px solid rgba(255,255,255,0.16);border-radius:18px;padding:22px;box-shadow:0 18px 36px rgba(0,0,0,0.7);';

      const title = document.createElement('div');
      title.textContent = requiredCount === 1 ? '賽巴精選：選一個技能欄位' : '賽巴精選：選兩個技能欄位';
      title.style.cssText = 'font-size:22px;font-weight:900;text-align:center;margin-bottom:8px;';

      const sub = document.createElement('div');
      sub.textContent = `已選 0 / ${requiredCount}`;
      sub.style.cssText = 'font-size:14px;color:rgba(255,255,255,0.68);text-align:center;margin-bottom:16px;';

      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;';

      const selected = [];
      const buttons = [];
      let selectionCommitted = false;
      for (let i = 0; i < 4; i++)
      {
         const btn = document.createElement('button');
         btn.type = 'button';
         const perkName = currentState && currentState.perks ? currentState.perks[i] : '';
         const zh = getPerkZh(perkName) || perkName || `技能 ${i + 1}`;
         const imgSrc = getPerkImg(perkName);
         btn.style.cssText = 'border-radius:14px;border:1px solid rgba(255,255,255,0.16);background:#2a2a2a;color:#fff;cursor:pointer;padding:10px 8px 12px;min-height:142px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;transition:background .12s ease, transform .12s ease, outline .12s ease;';

         const icon = document.createElement('div');
         icon.style.cssText = 'width:82px;height:82px;border-radius:8px;background:#050505;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,.35);';
         if (imgSrc)
         {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = zh;
            img.style.cssText = 'width:82px;height:82px;object-fit:contain;display:block;';
            icon.appendChild(img);
         }
         else
         {
            icon.textContent = `${i + 1}`;
            icon.style.fontSize = '28px';
            icon.style.fontWeight = '900';
            icon.style.color = 'rgba(255,255,255,.55)';
         }

         const label = document.createElement('div');
         label.textContent = zh;
         label.style.cssText = 'font-size:13px;font-weight:700;line-height:1.25;text-align:center;min-height:34px;display:flex;align-items:center;justify-content:center;word-break:break-word;';

         const slot = document.createElement('div');
         slot.textContent = `技能欄位 ${i + 1}`;
         slot.style.cssText = 'font-size:11px;color:rgba(255,255,255,.55);line-height:1;';

         btn.appendChild(icon);
         btn.appendChild(label);
         btn.appendChild(slot);
         btn.addEventListener('click', () =>
         {
            if (selectionCommitted) return;
            const at = selected.indexOf(i);
            if (at >= 0) selected.splice(at, 1);
            else if (selected.length < requiredCount) selected.push(i);
            buttons.forEach((b, idx) =>
            {
               const on = selected.includes(idx);
               b.style.outline = on ? '3px solid rgba(246,183,60,0.95)' : 'none';
               b.style.background = on ? '#3a3324' : '#2a2a2a';
               b.style.transform = on ? 'translateY(-1px)' : 'translateY(0)';
            });
            sub.textContent = `已選 ${selected.length} / ${requiredCount}`;
            if (selected.length === requiredCount)
            {
               selectionCommitted = true;
               setTimeout(() =>
               {
                  if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                  onPick(selected.slice());
               }, 140);
            }
         });
         buttons.push(btn);
         grid.appendChild(btn);
      }

      panel.appendChild(title);
      panel.appendChild(sub);
      panel.appendChild(grid);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
   }

   function doCard40CebaCombo()
   {
      if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4)
      {
         showInfoPopup('賽巴精選', '目前沒有足夠技能欄位可以套用。', () => finishCardPhase());
         return;
      }
      if (!currentState.killerKey || !Array.isArray(currentState.addons) || currentState.addons.length < 2)
      {
         showInfoPopup('賽巴精選', '目前沒有足夠配件欄位可以降分重抽。', () => finishCardPhase());
         return;
      }

      showCard40SlotPicker((slotIdxs) =>
      {
         const picked = pickCard40ComboForSlots(slotIdxs);
         if (!picked || !picked.combo || !Array.isArray(picked.perkKeys) || picked.perkKeys.length < 2)
         {
            showInfoPopup('賽巴精選', '沒有可用套餐：抽出的套餐會和未選欄位技能重複。', () => finishCardPhase());
            return;
         }

         const addonDelta = ['與心愛的你行至世界盡頭', '查無此人'].includes(picked.combo.name) ? 1 : -1;
         if (!rerollCard40AddonsMinusOne(addonDelta))
         {
            showInfoPopup('賽巴精選', '沒有可用且不重複的配件組合，無法重抽。', () => finishCardPhase());
            return;
         }

         const newPerks = currentState.perks.slice();
         newPerks[slotIdxs[0]] = picked.perkKeys[0];
         newPerks[slotIdxs[1]] = picked.perkKeys[1];
         currentState.perks = newPerks;

         playCard40CompleteSound();
         showCard40ComboResult(picked.combo, () => finishCardPhase());
      });
   }

   // 賽巴精選 II：候選只來自當前殺手的指定池。
   function getCard42Candidates(perkIdx)
   {
      if (!currentState || !currentState.killerKey) return [];
      const otherPerks = (currentState.perks || []).filter((name, idx) => idx !== perkIdx);
      const pool = CEBA_KILLER_PERKS[currentState.killerKey] || [];
      return pool.filter(name =>
      {
         if (!window.PERKS[name] || otherPerks.includes(name) || name === currentState.perks[perkIdx]) return false;
         if (name === 'Celestial Witness' && !otherPerks.includes('Nemesis')) return false;
         if (name === 'Nemesis' && CONDITIONAL_CEBA_KILLERS.includes(currentState.killerKey) && !otherPerks.includes('Celestial Witness')) return false;
         return true;
      });
   }

   function rerollCard42Addons(perkName)
   {
      const killerKey = currentState.killerKey;
      if (killerKey === 'The Nemesis' && perkName === 'Nemesis')
      {
         const original = currentState.addons.slice(0, 2);
         const scores = original.map(getAddonScore);
         if (scores.length < 2 || scores.some(score => typeof score !== 'number')) return false;
         const bonusIdx = Math.floor(Math.random() * 2);
         const targets = scores.map((score, idx) => Math.min(5, score + (idx === bonusIdx ? 2 : 1)));
         const pool = getAddonNamesForKiller(killerKey).filter(name => typeof getAddonScore(name) === 'number');
         let bestCost = Infinity;
         let pairs = [];
         for (const first of pool)
         {
            for (const second of pool)
            {
               if (first === second) continue;
               const distance = Math.abs(getAddonScore(first) - targets[0]) + Math.abs(getAddonScore(second) - targets[1]);
               // Prefer changing both addons when equally close to the targets.
               const cost = distance * 10 + Number(first === original[0]) + Number(second === original[1]);
               if (cost < bestCost)
               {
                  bestCost = cost;
                  pairs = [];
               }
               if (cost === bestCost) pairs.push([first, second]);
            }
         }
         const chosen = getRandomItem(pairs);
         if (!chosen) return false;
         currentState.addons = chosen;
         return true;
      }
      let fixedAddon = null;
      let otherDelta = -1;
      if (killerKey === 'The Wraith' && perkName === 'Turn Back the Clock') fixedAddon = "'The Serpent' - Soot";
      if (killerKey === 'The Xenomorph' && perkName === 'Enduring')
      {
         fixedAddon = 'Acidic Blood';
         otherDelta = -2;
      }
      if (killerKey === 'The Xenomorph' && perkName === 'Bamboozle')
      {
         fixedAddon = 'Self-Destruct Bolt';
         otherDelta = -2;
      }
      if (!fixedAddon) return rerollCard40AddonsMinusOne();
      if (!window.ADDONS[fixedAddon] || window.ADDONS[fixedAddon].killer !== killerKey) return false;

      const original = currentState.addons.slice(0, 2);
      // Keep an existing fixed addon in its slot; otherwise select its slot randomly.
      const existingIdx = original.indexOf(fixedAddon);
      const fixedIdx = existingIdx >= 0 ? existingIdx : Math.floor(Math.random() * 2);
      const otherIdx = 1 - fixedIdx;
      const oldScore = getAddonScore(original[otherIdx]);
      if (typeof oldScore !== 'number') return false;
      const targetScore = Math.max(0, oldScore + otherDelta);
      const sequence = getFallbackScoreSequence(targetScore,
      {
         addOneFirst: true
      });
      let chosen = null;
      for (const score of sequence)
      {
         let pool = getAddonNamesByScoresForKiller(killerKey, [score]).filter(name => name !== fixedAddon && !original.includes(name));
         if (!pool.length) pool = getAddonNamesByScoresForKiller(killerKey, [score]).filter(name => name !== fixedAddon);
         chosen = getRandomItem(pool);
         if (chosen) break;
      }
      if (!chosen) return false;
      const result = [];
      result[fixedIdx] = fixedAddon;
      result[otherIdx] = chosen;
      currentState.addons = result;
      return true;
   }

   function doCard42CebaKillerPerk(slotIndex, card)
   {
      if (!Number.isInteger(slotIndex) || slotIndex < 3 || slotIndex > 6) return;
      const usedCard = card || CARDS.find(item => item.id === 'card42');
      if (!currentState || !currentState.killerKey || !Array.isArray(currentState.perks) || currentState.perks.length < 4 || !Array.isArray(currentState.addons) || currentState.addons.length < 2)
      {
         showInvalidCardPopup(usedCard, '目前沒有完整的技能與配件欄位。');
         return;
      }
      const perkIdx = slotIndex - 3;
      const chosen = getRandomItem(getCard42Candidates(perkIdx));
      if (!chosen)
      {
         showInvalidCardPopup(usedCard, '我想不到要給什麼技能了 抱歉喔');
         return;
      }
      if (!rerollCard42Addons(chosen))
      {
         showInvalidCardPopup(usedCard, '目前沒有可用且不重複的配件組合。');
         return;
      }
      currentState.perks[perkIdx] = chosen;
      playCard40CompleteSound();
      showCard42Result(chosen);
   }

   function showCard42Result(perkName)
   {
      const overlay = document.createElement('div');
      overlay.id = 'card42ResultOverlay';
      overlay.className = 'dbd-card-overlay card42-result-overlay';
      const panel = document.createElement('div');
      panel.className = 'dbd-card-panel card42-result-panel';
      const title = document.createElement('div');
      title.className = 'card42-result-title';
      title.textContent = '我幫你選了這招 👍';
      const content = document.createElement('div');
      content.className = 'card42-result-content';
      const message = document.createElement('div');
      message.className = 'card42-result-message';
      const skill = document.createElement('div');
      skill.className = 'card42-result-skill';
      const image = document.createElement('img');
      image.className = 'card42-result-image';
      image.src = getPerkImg(perkName);
      image.alt = getPerkZh(perkName) || perkName;
      const name = document.createElement('div');
      name.className = 'card42-result-name';
      name.textContent = getPerkZh(perkName) || perkName;
      const hint = document.createElement('div');
      hint.className = 'card42-result-hint';
      hint.textContent = '按任意按鍵繼續';
      message.appendChild(title);
      skill.appendChild(image);
      skill.appendChild(name);
      if (currentState.killerKey === 'The Nemesis' && perkName === 'Nemesis')
      {
         title.textContent = 'Nemesis';
         title.classList.add('card42-nemesis');
      }
      content.appendChild(message);
      content.appendChild(skill);
      panel.appendChild(content);
      panel.appendChild(hint);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      let closed = false;
      function continueOnce(event)
      {
         if (event.type === 'keydown' && event.repeat) return;
         event.preventDefault();
         event.stopImmediatePropagation();
         if (closed) return;
         closed = true;
         document.removeEventListener('keydown', continueOnce, true);
         document.removeEventListener('click', continueOnce, true);
         overlay.remove();
         finishCardPhase();
      }
      document.addEventListener('keydown', continueOnce, true);
      document.addEventListener('click', continueOnce, true);
   }

   // 41 號：神之一手
   // 六個非殺手欄位依序抽出「同類型、不重複」候選。
   // 分數先抽方向：40% 高於、40% 等於、20% 低於。
   // 同一方向內的各分數等機率；該方向無可用候選時才改抽同分。
   // 聖筊遵照玩家選擇；陰筊反轉玩家選擇；笑筊換候選後重問，每格最多三次。
   function doCard41AskDeity(card)
   {
      if (!currentState || !currentState.killerKey ||
         !Array.isArray(currentState.addons) || currentState.addons.length < 2 ||
         !Array.isArray(currentState.perks) || currentState.perks.length < 4)
      {
         showInfoPopup('神之一手', '目前沒有完整的兩個配件與四個技能，無法請示。', () => finishCardPhase());
         return;
      }

      const data = card && card.effect && card.effect.data ? card.effect.data :
      {
      };
      const maxLaughs = Math.max(0, Number(data.maxLaughsPerSlot) || 3);
      const slots = [
      {
         type: 'addon',
         index: 0,
         label: '配件 1'
      },
      {
         type: 'addon',
         index: 1,
         label: '配件 2'
      },
      {
         type: 'perk',
         index: 0,
         label: '技能 1'
      },
      {
         type: 'perk',
         index: 1,
         label: '技能 2'
      },
      {
         type: 'perk',
         index: 2,
         label: '技能 3'
      },
      {
         type: 'perk',
         index: 3,
         label: '技能 4'
      }];

      function getCurrentName(slot)
      {
         return slot.type === 'addon' ?
            currentState.addons[slot.index] :
            currentState.perks[slot.index];
      }

      function getCandidate(slot, alreadyShown)
      {
         const currentName = getCurrentName(slot);
         const shown = alreadyShown || new Set();

         function getTargetScoreOrder(score, minScore)
         {
            const roll = Math.random();
            if (roll < 0.4)
            {
               const higher = [];
               for (let s = score + 1; s <= 5; s++) higher.push(s);
               return higher.length ? shuffle(higher) : [score];
            }
            if (roll < 0.8) return [score];
            const lower = [];
            for (let s = minScore; s < score; s++) lower.push(s);
            return lower.length ? shuffle(lower) : [score];
         }

         if (slot.type === 'addon')
         {
            const score = getAddonScore(currentName);
            if (typeof score !== 'number') return null;
            const used = new Set(currentState.addons || []);
            const makePool = target => getAddonNamesByScoresForKiller(currentState.killerKey, [target])
               .filter(name => name !== currentName && !used.has(name) && !shown.has(name));
            const scoreOrder = getTargetScoreOrder(score, 1);
            for (const targetScore of scoreOrder)
            {
               const pool = makePool(targetScore);
               if (pool.length) return getRandomItem(pool);
            }
            if (!scoreOrder.includes(score)) return getRandomItem(makePool(score));
            return null;
         }

         const score = getPerkScore(currentName);
         if (typeof score !== 'number') return null;
         const used = new Set(currentState.perks || []);
         const makePool = target => getPerkNamesByScores([target])
            .filter(name => name !== currentName && !used.has(name) && !shown.has(name));
         const scoreOrder = getTargetScoreOrder(score, 0);
         for (const targetScore of scoreOrder)
         {
            const pool = makePool(targetScore);
            if (pool.length) return getRandomItem(pool);
         }
         if (!scoreOrder.includes(score)) return getRandomItem(makePool(score));
         return null;
      }

      function applyCandidate(slot, candidate)
      {
         if (!candidate) return;
         if (slot.type === 'addon')
         {
            const next = currentState.addons.slice();
            next[slot.index] = candidate;
            currentState.addons = next;
         }
         else
         {
            const next = currentState.perks.slice();
            next[slot.index] = candidate;
            currentState.perks = next;
         }
      }

      function getCandidateMeta(slot, candidate)
      {
         const isAddon = slot.type === 'addon';
         return {
            zh: isAddon ? (getAddonZh(candidate) || candidate) : (getPerkZh(candidate) || candidate),
            en: isAddon ? (window.ADDONS?.[candidate]?.en || candidate) : candidate,
            img: isAddon ? getAddonImg(candidate) : getPerkImg(candidate),
            score: isAddon ? getAddonScore(candidate) : getPerkScore(candidate)
         };
      }

      function playCard41Audio(fileName, onEnded)
      {
         try
         {
            const audio = new Audio(`./images/other/${fileName}`);
            audio.volume = 0.7;
            if (typeof onEnded === 'function')
            {
               audio.addEventListener('ended', onEnded,
               {
                  once: true
               });
            }
            const p = audio.play();
            if (p && typeof p.catch === 'function')
            {
               p.catch(() =>
               {
                  if (typeof onEnded === 'function') onEnded();
               });
            }
         }
         catch (e)
         {
            if (typeof onEnded === 'function') onEnded();
         }
      }

      // 沿用 LichTool 預設的「結果 + 解釋」語音模式。
      function playCard41VoiceSequence(resultAudio, explainAudio)
      {
         playCard41Audio(resultAudio, () =>
         {
            if (explainAudio) playCard41Audio(explainAudio);
         });
      }

      function rollJiaobei(noLaugh)
      {
         const r = Math.random();
         if (noLaugh) return r < (2 / 3) ? 'success' : 'fail';
         if (r < 0.5) return 'success';
         if (r < 0.75) return 'laugh';
         return 'fail';
      }

      function removeOverlay(overlay)
      {
         if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }

      function showQuestion(slot, slotNumber, candidate, laughCount, shownCandidates, questionText)
      {
         const meta = getCandidateMeta(slot, candidate);
         const noLaugh = laughCount >= maxLaughs;
         const overlay = document.createElement('div');
         overlay.id = 'card41DeityOverlay';
         overlay.classList.add('dbd-card-overlay');
         overlay.style.cssText = 'position:fixed;inset:0;z-index:100050;background:rgba(0,0,0,.84);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;color:#fff;';

         const shell = document.createElement('div');
         shell.classList.add('dbd-card-shell');
         shell.style.cssText = 'width:min(1040px,96vw);max-height:96vh;display:flex;flex-direction:column;gap:10px;';

         const panel = document.createElement('div');
         panel.classList.add('dbd-card-panel');
         panel.style.cssText = 'width:100%;min-height:560px;background:radial-gradient(circle at 72% 42%,rgba(92,52,146,.28),transparent 38%),linear-gradient(145deg,#17131f,#08080c);border:1px solid rgba(223,196,255,.3);border-radius:24px;box-shadow:0 30px 80px rgba(0,0,0,.82),0 0 38px rgba(119,72,178,.2);display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.92fr);overflow:hidden;box-sizing:border-box;';

         const left = document.createElement('div');
         left.style.cssText = 'padding:42px 28px 34px 42px;display:flex;flex-direction:column;justify-content:center;';

         const progress = document.createElement('div');
         progress.textContent = `神之一手　${slotNumber + 1} / 6　目前詢問：${slot.label}`;
         progress.style.cssText = 'font-size:15px;font-weight:800;letter-spacing:.08em;color:#c9a8f4;margin-bottom:28px;';

         const question = document.createElement('div');
         question.textContent = questionText || '你要這個嗎？';
         question.style.cssText = 'width:7em;max-width:100%;font-size:clamp(36px,5vw,70px);font-weight:1000;line-height:1.16;letter-spacing:.01em;white-space:pre-line;word-break:break-all;text-shadow:0 8px 28px rgba(0,0,0,.65);margin-bottom:28px;';

         const candidateName = document.createElement('div');
         candidateName.textContent = meta.zh || meta.en;
         candidateName.style.cssText = 'font-size:25px;font-weight:900;color:#f0e7ff;margin-bottom:5px;';

         const candidateSub = document.createElement('div');
         candidateSub.textContent = `${meta.en}${typeof meta.score === 'number' ? `　分數：${meta.score}` : ''}`;
         candidateSub.style.cssText = 'font-size:13px;color:rgba(255,255,255,.52);margin-bottom:30px;';

         const actions = document.createElement('div');
         actions.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;';

         const wantBtn = document.createElement('button');
         wantBtn.type = 'button';
         wantBtn.textContent = '要';
         wantBtn.style.cssText = 'min-width:145px;padding:15px 26px;border:1px solid rgba(132,225,167,.55);border-radius:13px;background:#17633a;color:#fff;font-size:23px;font-weight:1000;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.35);';

         const rejectBtn = document.createElement('button');
         rejectBtn.type = 'button';
         rejectBtn.textContent = '不要';
         rejectBtn.style.cssText = 'min-width:145px;padding:15px 26px;border:1px solid rgba(239,132,144,.5);border-radius:13px;background:#742532;color:#fff;font-size:23px;font-weight:1000;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.35);';

         actions.appendChild(wantBtn);
         actions.appendChild(rejectBtn);
         left.appendChild(progress);
         left.appendChild(question);
         left.appendChild(candidateName);
         left.appendChild(candidateSub);
         left.appendChild(actions);

         const right = document.createElement('div');
         right.style.cssText = 'position:relative;min-height:560px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at center,rgba(125,75,191,.2),transparent 58%);overflow:hidden;';

         const hand = document.createElement('img');
         hand.src = './images/other/hand.png';
         hand.alt = 'hand';
         hand.style.cssText = 'position:absolute;width:min(430px,92%);height:auto;object-fit:contain;filter:drop-shadow(0 22px 24px rgba(0,0,0,.62));user-select:none;pointer-events:none;';

         const heldIcon = document.createElement('img');
         heldIcon.src = meta.img || '';
         heldIcon.alt = meta.zh || meta.en;
         heldIcon.style.cssText = 'position:absolute;width:118px;height:118px;object-fit:contain;left:50%;top:49%;transform:translate(-50%,-50%);filter:drop-shadow(0 8px 15px rgba(0,0,0,.8));border-radius:12px;user-select:none;pointer-events:none;';

         right.appendChild(hand);
         right.appendChild(heldIcon);
         panel.appendChild(left);
         panel.appendChild(right);

         const currentStrip = document.createElement('div');
         currentStrip.style.cssText = 'width:100%;display:grid;grid-template-columns:2fr 4fr;gap:10px;padding:8px 10px;background:rgba(13,11,19,.96);border:1px solid rgba(223,196,255,.22);border-radius:15px;box-shadow:0 12px 28px rgba(0,0,0,.5);box-sizing:border-box;';

         function makeCurrentGroup(titleText, type, names)
         {
            const group = document.createElement('div');
            group.style.cssText = 'min-width:0;display:flex;align-items:center;gap:7px;';

            const title = document.createElement('div');
            title.textContent = titleText;
            title.style.cssText = 'flex:0 0 auto;font-size:11px;font-weight:900;line-height:1.2;letter-spacing:.05em;color:#c9a8f4;writing-mode:vertical-rl;';
            group.appendChild(title);

            const items = document.createElement('div');
            items.style.cssText = `min-width:0;flex:1;display:grid;grid-template-columns:repeat(${names.length},minmax(0,1fr));gap:6px;`;

            names.forEach((name, index) =>
            {
               const itemSlot = {
                  type,
                  index
               };
               const itemMeta = getCandidateMeta(itemSlot, name);
               const active = slot.type === type && slot.index === index;

               const item = document.createElement('div');
               item.style.cssText = `min-width:0;height:54px;display:flex;align-items:center;gap:7px;padding:4px 6px;border-radius:9px;border:${active ? '2px solid #8f80ff' : '1px solid rgba(255,255,255,.12)'};background:${active ? 'rgba(63,44,194,.3)' : 'rgba(255,255,255,.045)'};box-sizing:border-box;box-shadow:${active ? '0 0 14px rgba(143,128,255,.34)' : 'none'};`;

               const icon = document.createElement('div');
               icon.style.cssText = 'width:42px;height:42px;flex:0 0 42px;border-radius:7px;background:#050505;overflow:hidden;display:flex;align-items:center;justify-content:center;';
               if (itemMeta.img)
               {
                  const img = document.createElement('img');
                  img.src = itemMeta.img;
                  img.alt = itemMeta.zh || itemMeta.en;
                  img.style.cssText = 'width:42px;height:42px;object-fit:contain;display:block;';
                  icon.appendChild(img);
               }

               const text = document.createElement('div');
               text.style.cssText = 'min-width:0;display:flex;flex-direction:column;gap:2px;';

               const nameLine = document.createElement('div');
               nameLine.textContent = itemMeta.zh || itemMeta.en || '未知';
               nameLine.style.cssText = 'font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

               const scoreLine = document.createElement('div');
               scoreLine.textContent = typeof itemMeta.score === 'number' ? `${itemMeta.score} 分` : '';
               scoreLine.style.cssText = 'font-size:10px;color:rgba(255,255,255,.5);';

               text.appendChild(nameLine);
               text.appendChild(scoreLine);
               item.appendChild(icon);
               item.appendChild(text);
               items.appendChild(item);
            });

            group.appendChild(items);
            return group;
         }

         currentStrip.appendChild(makeCurrentGroup('目前配件', 'addon', currentState.addons.slice(0, 2)));
         currentStrip.appendChild(makeCurrentGroup('目前技能', 'perk', currentState.perks.slice(0, 4)));

         shell.appendChild(panel);
         shell.appendChild(currentStrip);
         overlay.appendChild(shell);
         document.body.appendChild(overlay);

         function resolveChoice(wantsIt)
         {
            wantBtn.disabled = true;
            rejectBtn.disabled = true;
            wantBtn.style.opacity = '.45';
            rejectBtn.style.opacity = '.45';
            question.textContent = '擲筊中……';
            heldIcon.style.display = 'none';
            hand.src = './images/other/擲筊.png';
            if (hand.animate)
            {
               hand.animate([
               {
                  transform: 'rotate(-7deg) scale(.92)'
               },
               {
                  transform: 'rotate(8deg) scale(1.05)'
               },
               {
                  transform: 'rotate(-5deg) scale(.97)'
               },
               {
                  transform: 'rotate(0) scale(1)'
               }],
               {
                  duration: 400,
                  iterations: 1,
                  easing: 'ease-in-out'
               });
            }

            setTimeout(() =>
            {
               const result = rollJiaobei(noLaugh);
               if (result === 'success')
               {
                  hand.src = './images/other/聖杯.png';
                  question.textContent = '聖筊';
                  candidateName.textContent = wantsIt ? '照你的意思，換上去。' : '照你的意思，保留原本的。';
                  candidateSub.textContent = '';
                  const explainAudio = Math.random() < 0.5 ? 'ok.mp3' : '可以.mp3';
                  playCard41VoiceSequence('聖杯.mp3', explainAudio);
               }
               else if (result === 'fail')
               {
                  hand.src = './images/other/無杯.png';
                  question.textContent = '陰筊';
                  candidateName.textContent = wantsIt ? '不給你，保留原本的。' : '偏要給你，換上去。';
                  candidateSub.textContent = '';
                  playCard41VoiceSequence('無杯.mp3', 'dame.mp3');
               }
               else
               {
                  hand.src = './images/other/笑杯.png';
                  question.textContent = '笑筊';
                  candidateName.textContent = '聽不懂';
                  candidateSub.textContent = '';
                  const explainAudio = Math.random() < 0.25 ? '工三小.mp3' : 'wakaranai.mp3';
                  playCard41VoiceSequence('笑杯.mp3', explainAudio);
               }

               setTimeout(() =>
               {
                  removeOverlay(overlay);

                  if (result === 'laugh')
                  {
                     const nextLaughCount = laughCount + 1;
                     shownCandidates.add(candidate);
                     let nextCandidate = getCandidate(slot, shownCandidates);
                     // 同分候選已被笑完時，允許本格先前出現過的候選再次出現，仍不碰目前配置。
                     if (!nextCandidate)
                     {
                        shownCandidates.clear();
                        shownCandidates.add(candidate);
                        nextCandidate = getCandidate(slot, shownCandidates);
                     }
                     if (!nextCandidate)
                     {
                        processSlot(slotNumber + 1);
                        return;
                     }
                     showQuestion(
                        slot,
                        slotNumber,
                        nextCandidate,
                        nextLaughCount,
                        shownCandidates,
                        nextLaughCount >= maxLaughs ?
                        '你到底還要不要？' :
                        '聽不懂\n那你要這個嗎？'
                     );
                     return;
                  }

                  const shouldApply = result === 'success' ? wantsIt : !wantsIt;
                  if (shouldApply) applyCandidate(slot, candidate);
                  processSlot(slotNumber + 1);
               }, 2500);
            }, 400);
         }

         wantBtn.addEventListener('click', () => resolveChoice(true),
         {
            once: true
         });
         rejectBtn.addEventListener('click', () => resolveChoice(false),
         {
            once: true
         });
      }

      function processSlot(slotNumber)
      {
         if (slotNumber >= slots.length)
         {
            playCard40CompleteSound();
            finishCardPhase();
            return;
         }

         const slot = slots[slotNumber];
         const shownCandidates = new Set();
         const candidate = getCandidate(slot, shownCandidates);
         if (!candidate)
         {
            // 沒有同分且不重複的候選時，維持原樣並繼續下一格。
            processSlot(slotNumber + 1);
            return;
         }
         showQuestion(slot, slotNumber, candidate, 0, shownCandidates, '你要這個嗎？');
      }

      processSlot(0);
   }

   function doCard37StarPlatinum()
   {
      if (!currentState || document.getElementById('starPlatinumOverlay')) return;
      const generation = roundGeneration;
      const selectedSlots = new Set();
      let selected = 1;
      let page = 0;
      let started = false;
      let ended = false;
      let settledChanges = null;
      let deadline = 0;
      let timer = null;
      let timerTextAnimation = null;
      let worldEffect = null;
      const pools =
      {
         addon: shuffle(getAddonNamesForKiller(currentState.killerKey)),
         perk: shuffle(getAllPerkNames())
      };
      const overlay = document.createElement('div');
      overlay.id = 'starPlatinumOverlay';
      overlay.innerHTML = `
         <style>
         #starPlatinumOverlay{position:fixed;inset:0;z-index:100080;background:rgba(12,12,9,.94);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;color:#f3ead0;font-family:inherit}
         #starPlatinumOverlay *{box-sizing:border-box}
         .sp-announcement{position:fixed;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;background:#15140ddd;pointer-events:none;font-size:clamp(32px,7vw,80px);font-weight:900;letter-spacing:.08em;color:#f1e3ac;text-shadow:0 0 32px #debd6a;animation:sp-resume 2s ease forwards}@keyframes sp-resume{0%{opacity:0;transform:scale(.92)}15%,75%{opacity:1;transform:scale(1)}100%{opacity:0;visibility:hidden;transform:scale(1.05)}}
         .sp-panel{width:min(1100px,100%);max-height:95dvh;overflow-y:auto;overflow-x:hidden;border:1px solid #b58a43;border-radius:22px;background:linear-gradient(145deg,#2c291f,#11120f);padding:24px;box-shadow:0 20px 90px #0009}
         .sp-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px;overflow:hidden}.sp-heading h2{margin:0;font-size:28px;line-height:1.8;padding-top:4px}.sp-caption{color:#cbbd94;margin:5px 0 0}.sp-time{font-size:28px;font-weight:700;color:#f1e3ac;white-space:nowrap;line-height:1.3;text-align:right;min-width:5.5em;flex-shrink:0}.sp-time-text{display:inline-block}
         .sp-intro p{line-height:1.7;margin:10px 0}.sp-intro img{display:block;width:100%;max-height:400px;margin:20px auto;object-fit:contain;border-radius:12px;background:#171a13}
         .sp-button{font:inherit;color:#132413;border:1px solid #a3cf86;background:#83b66b;border-radius:10px;padding:12px 22px;cursor:pointer}.sp-button:hover{background:#a3cf86}.sp-primary{display:block;margin:18px auto 0;min-width:220px;font-weight:800}
         .sp-slots{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;margin-bottom:20px}.sp-slot{min-width:0;border:1px solid #58804e;background:#1c2b1c;color:#eee;border-radius:12px;padding:10px 5px;font:inherit;cursor:pointer}.sp-slot.active{border:2px solid #b7dd9b;background:#436c37;box-shadow:0 0 20px #83b66b55}.sp-slot img{width:100%;height:72px;object-fit:contain}.sp-slot strong,.sp-slot small{display:block}.sp-slot strong{font-size:12px;min-height:30px;margin:6px 0}.sp-slot small{font-size:11px;color:#c8d5ba}.sp-slot:disabled{cursor:default;opacity:1}.sp-slot.changed small{color:#b8dc9e}.sp-slot.unchanged{border:2px solid #ff646e;background:#391b29;box-shadow:0 0 16px #ff48543d}.sp-slot.unchanged small{color:#ff9ca4}.sp-slot small.sp-status-pending{color:#ff8992;font-weight:700}
         .sp-picker{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:12px;align-items:center}.sp-arrow{padding:12px 0;font-size:28px}.sp-arrow:disabled{opacity:.25;cursor:default}.sp-grid.addon-row{grid-template-rows:115px}.sp-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(3,115px);gap:9px}.sp-item{border:1px solid #557748;border-radius:10px;background:#243b23;color:#eee;padding:7px;font:inherit;cursor:pointer;min-width:0;display:flex;align-items:center;flex-direction:column;justify-content:center}.sp-item img{width:54px;height:54px;object-fit:contain}.sp-item span{font-size:12px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.sp-item small{color:#c1d3b2;font-size:11px}.sp-item:disabled{opacity:.3;cursor:default}.sp-item:hover:enabled{background:#4b773d;border-color:#b7dd9b}.sp-footer{display:flex;justify-content:space-between;margin-top:12px;color:#cbbd94;font-size:13px}
         @media(max-width:700px){#starPlatinumOverlay{padding:8px}.sp-panel{padding:12px}.sp-slots{gap:4px}.sp-slot img{height:42px}.sp-slot strong{font-size:10px}.sp-picker{grid-template-columns:25px minmax(0,1fr) 25px;gap:5px}.sp-grid{gap:4px;grid-template-rows:repeat(3,100px)}.sp-grid.addon-row{grid-template-rows:100px}.sp-item img{width:38px;height:38px}.sp-item span{font-size:10px}.sp-heading h2{font-size:22px}.sp-heading{flex-wrap:wrap}.sp-time{width:100%;min-width:0;font-size:26px}}
         </style>
         <section class="sp-panel" role="dialog" aria-modal="true" aria-label="The World">
            <header class="sp-heading"><div><h2><ruby class="the-world-title">The World<rp>（</rp><rt>ザ・ワールド</rt><rp>）</rp></ruby></h2><p class="sp-caption">無駄無駄無駄無駄!</p></div><div class="sp-time" role="timer" aria-live="off">準備開始</div></header>
            <div class="sp-intro">
               <p>開始後，你有 <b>12 秒</b>自由更換兩個配件與四個技能。點上方欄位，再點下方項目，配置會即時更新。<b>選擇原本相同的項目也算已更換，可免除該欄懲罰。</b></p>
               <p>選擇區隨機排序，配件每頁 <b>5 欄 × 1 行</b>，技能每頁 <b>5 欄 × 3 行</b>，按左右箭頭翻頁。時間到時未更換的欄位會被扣分。</p>
               <img src="images/star-platinum-guide.svg" alt="操作圖：點上方欄位使其高亮，再從下方十五格選擇項目，左右箭頭翻頁，選擇會即時顯示。">
               <p style="font-size:12px;color:#bba8d0">殺手不變。配件最低 1 分、技能最低 0 分；若沒有可替換且不重複的目標分數項目，該欄保留。</p>
               <button class="sp-button sp-primary" id="spStart">開始 · 12 秒</button>
            </div>
            <div class="sp-game" hidden><div class="sp-slots"></div><div class="sp-picker"><button class="sp-button sp-arrow" id="spPrev" aria-label="上一頁">‹</button><div class="sp-grid"></div><button class="sp-button sp-arrow" id="spNext" aria-label="下一頁">›</button></div><div class="sp-footer"><span id="spStatus"></span><span id="spPage"></span></div></div>
         </section>`;
      document.body.appendChild(overlay);
      const q = selector => overlay.querySelector(selector);
      const listFor = slot => slot < 3 ? currentState.addons : currentState.perks;
      const indexFor = slot => slot < 3 ? slot - 1 : slot - 3;
      const isChanged = slot => settledChanges ? settledChanges[slot - 1] : selectedSlots.has(slot);
      function itemInfo(slot, name)
      {
         if (slot === 0) return { name: getKillerZh(name), img: getKillerImg(name), score: null };
         return slot < 3 ? { name: getAddonZh(name) || name, img: getAddonImg(name), score: getAddonScore(name) } :
            { name: getPerkZh(name) || name, img: getPerkImg(name), score: getPerkScore(name) };
      }
      function addImage(parent, src)
      {
         const image = document.createElement('img');
         image.src = src;
         image.alt = '';
         image.draggable = false;
         parent.appendChild(image);
      }
      function activePool()
      {
         return selected < 3 ? pools.addon : pools.perk;
      }
      function pageSize()
      {
         return selected < 3 ? 5 : 15;
      }
      function randomizePage()
      {
         const pages = Math.max(1, Math.ceil(activePool().length / pageSize()));
         page = Math.floor(Math.random() * pages);
      }
      function preview()
      {
         if (typeof window.previewCardState === 'function') window.previewCardState(cloneState(currentState));
      }
      function render()
      {
         const slots = q('.sp-slots');
         slots.replaceChildren();
         for (let slot = 0; slot <= 6; slot++)
         {
            const name = slot === 0 ? currentState.killerKey : listFor(slot)[indexFor(slot)];
            const info = itemInfo(slot, name);
            const button = document.createElement('button');
            button.className = 'sp-slot' + (!ended && selected === slot ? ' active' : '') + (slot ? (isChanged(slot) ? ' changed' : (ended ? ' unchanged' : '')) : '');
            button.disabled = slot === 0 || ended;
            button.setAttribute('aria-label', slot === 0 ? '目前殺手' : (slot < 3 ? '配件 ' + slot : '技能 ' + (slot - 2)));
            button.setAttribute('aria-pressed', String(selected === slot));
            addImage(button, info.img);
            const title = document.createElement('strong');
            title.textContent = info.name;
            const status = document.createElement('small');
            status.textContent = slot === 0 ? '殺手 · 固定' : `${info.score} 分 · ${isChanged(slot) ? '已更換' : '未更換'}`;
            if (slot > 0 && !isChanged(slot)) status.className = 'sp-status-pending';
            button.append(title, status);
            button.onclick = () =>
            {
               if (!canAct()) return;
               selected = slot;
               randomizePage();
               render();
            };
            slots.appendChild(button);
         }
         const pool = activePool();
         const size = pageSize();
         const pages = Math.max(1, Math.ceil(pool.length / size));
         page = Math.min(page, pages - 1);
         q('#spPrev').disabled = ended || pages <= 1;
         q('#spNext').disabled = ended || pages <= 1;
         q('#spPage').textContent = `${page + 1} / ${pages}`;
         q('#spStatus').textContent = `選擇${selected < 3 ? '配件 ' + selected : '技能 ' + (selected - 2)} · 點擊項目立即替換`;
         const grid = q('.sp-grid');
         grid.className = 'sp-grid' + (selected < 3 ? ' addon-row' : '');
         grid.replaceChildren();
         for (const name of pool.slice(page * size, page * size + size))
         {
            const info = itemInfo(selected, name);
            const button = document.createElement('button');
            button.className = 'sp-item';
            const usedByOtherSlot = listFor(selected).some((value, index) => index !== indexFor(selected) && value === name);
            button.disabled = ended || usedByOtherSlot;
            addImage(button, info.img);
            const title = document.createElement('span');
            title.textContent = info.name;
            const score = document.createElement('small');
            score.textContent = `${info.score} 分`;
            button.append(title, score);
            button.onclick = () =>
            {
               if (!canAct() || usedByOtherSlot) return;
               listFor(selected)[indexFor(selected)] = name;
               selectedSlots.add(selected);
               preview();
               render();
            };
            grid.appendChild(button);
         }
      }
      function showTimerText(text)
      {
         const label = q('.sp-time');
         if (label.textContent === text) return;
         label.textContent = text;
         const textNode = document.createElement('span');
         textNode.className = 'sp-time-text';
         textNode.textContent = text;
         label.replaceChildren(textNode);
         if (timerTextAnimation && typeof timerTextAnimation.cancel === 'function') timerTextAnimation.cancel();
         if (typeof textNode.animate === 'function')
         {
            timerTextAnimation = textNode.animate(
               [
                  { transform: 'translateX(32px)', opacity: 0 },
                  { transform: 'translateX(0)', opacity: 1 }
               ],
               { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }
            );
         }
      }
      function cleanup()
      {
         clearInterval(timer);
         document.removeEventListener('visibilitychange', tick);
         if (worldEffect) worldEffect.dispose();
         overlay.remove();
      }
      function finish()
      {
         if (ended) return;
         ended = true;
         clearInterval(timer);
         if (generation !== roundGeneration || !currentState)
         {
            cleanup();
            return;
         }
         const changed = Array.from({length: 6}, (_, i) => isChanged(i + 1));
         let lowered = 0;
         let retained = 0;
         function lowerUntouched(kind, offset, getPool, getScore, minimum)
         {
            const list = currentState[kind];
            const slots = list.map((name, index) => ({ name, index }))
               .filter(item => !changed[item.index + offset]);
            const used = new Set(list.filter((_, index) => changed[index + offset]));
            const options = slots.map(item =>
            {
               const score = getScore(item.name);
               const deduction = score >= 3 ? 1 : 2;
               const target = Math.max(minimum, score - deduction);
               const lower = target < score ? shuffle(getPool(target)).filter(name => !used.has(name)) : [];
               return { ...item, lower, choices: [...lower, item.name] };
            }).sort((a, b) => a.choices.length - b.choices.length);
            let best = null;
            let bestCount = -1;
            const picked = [];
            function search(index, count)
            {
               if (count + options.length - index <= bestCount) return;
               if (index === options.length)
               {
                  bestCount = count;
                  best = picked.slice();
                  return;
               }
               const item = options[index];
               for (const name of item.choices)
               {
                  if (used.has(name)) continue;
                  used.add(name);
                  picked[index] = name;
                  search(index + 1, count + (item.lower.includes(name) ? 1 : 0));
                  used.delete(name);
                  if (bestCount === options.length) break;
               }
            }
            search(0, 0);
            if (best) options.forEach((item, index) => { list[item.index] = best[index]; });
            lowered += Math.max(0, bestCount);
            retained += slots.length - Math.max(0, bestCount);
         }
         settledChanges = changed;
         render();
         showTimerText('12秒過去');
         const restoration = worldEffect ? worldEffect.resume() : null;
         if (!worldEffect)
         {
         const announcement = document.createElement('div');
         announcement.className = 'sp-announcement';
         announcement.setAttribute('role', 'status');
         announcement.textContent = '時間開始流動';
         overlay.appendChild(announcement);
         }
         q('#spStatus').textContent = `時間到 · ${changed.filter(Boolean).length} 欄已更換，${changed.filter(value => !value).length} 欄未更換；確認結果後，紅框欄位扣分重抽。`; 
         const done = document.createElement('button');
         done.className = 'sp-button sp-primary';
         done.textContent = '確認結果';
         done.disabled = Boolean(restoration);
         if (restoration) restoration.finally(() =>
         {
            if (overlay.isConnected && generation === roundGeneration) done.disabled = false;
         });
         done.onclick = () =>
         {
            if (done.disabled) return;
            done.disabled = true;
            done.textContent = '正在重抽…';
            if (generation !== roundGeneration || !currentState || !overlay.isConnected) { cleanup(); return; }
            lowerUntouched('addons', 0, score => getAddonNamesByScoresForKiller(currentState.killerKey, [score]), getAddonScore, 1);
            lowerUntouched('perks', 2, score => getPerkNamesByScores([score]), getPerkScore, 0);
            // 保留拉霸機目前的配置，交由套用卡片結果時播放欄位換裝動畫。
            cleanup();
            if (generation === roundGeneration && currentState) finishCardPhase();
         };
         q('.sp-game').appendChild(done);
      }
      function canAct()
      {
         if (generation !== roundGeneration || !currentState)
         {
            ended = true;
            cleanup();
            return false;
         }
         if (!started || ended) return false;
         if (performance.now() >= deadline) { finish(); return false; }
         return true;
      }
      function tick()
      {
         if (!canAct()) return;
         const elapsed = Math.min(12, Math.floor((performance.now() - (deadline - 12000)) / 1000));
         showTimerText(elapsed > 0 ? elapsed + '秒過去' : '時よ止まれ！');
      }
      function changePage(direction)
      {
         if (!canAct()) return;
         const pages = Math.max(1, Math.ceil(activePool().length / pageSize()));
         page = (page + direction + pages) % pages;
         render();
      }
      q('#spPrev').onclick = () => changePage(-1);
      q('#spNext').onclick = () => changePage(1);
      q('#spStart').onclick = () =>
      {
         if (q('#spStart').disabled || started || generation !== roundGeneration || !currentState) return;
         q('#spStart').disabled = true;
         const rect = typeof q('#spStart').getBoundingClientRect === 'function' ? q('#spStart').getBoundingClientRect() : null;
         const origin = rect ? {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2} : null;
         q('.sp-intro').hidden = true;
         q('.sp-game').hidden = false;
         selected = 1 + Math.floor(Math.random() * 6);
         randomizePage();
         render();
         const images = Array.from(overlay.querySelectorAll('.sp-game img'));
         Promise.all(images.map(image => image.decode ? image.decode().catch(() => {}) : Promise.resolve())).then(async () =>
         {
            if (generation !== roundGeneration || !currentState || !overlay.isConnected) { cleanup(); return; }
            if (window.WorldStopEffects)
            {
               worldEffect = window.WorldStopEffects.create();
               showTimerText('時よ止まれ！');
               await worldEffect.enter(origin);
               if (generation !== roundGeneration || !currentState || !overlay.isConnected) { cleanup(); return; }
               overlay.style.background = 'rgba(12,12,9,.62)';
            }
            started = true;
            deadline = performance.now() + 12000;
            timer = setInterval(tick, 25);
            document.addEventListener('visibilitychange', tick);
            tick();
         });
      };
   }


   function doCard36EqualScore()
   {
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
      for (const p of shuffle(perkPool))
      {
         if (!newPerks.includes(p)) newPerks.push(p);
         if (newPerks.length === 4) break;
      }
      if (newPerks.length !== 4) return false;

      const newAddons = [];
      for (const a of shuffle(addonPool))
      {
         if (!newAddons.includes(a)) newAddons.push(a);
         if (newAddons.length === 2) break;
      }
      if (newAddons.length !== 2) return false;

      currentState.perks = newPerks;
      currentState.addons = newAddons;
      return true;
   }

   // 24 號卡：保持每格分數不變，但全部重抽同分數的技能或配件
   function doRerollSameScoreAll()
   {
      if (!currentState || !currentState.killerKey) return false;
      function findSelection(original, getPool, getScore, allowKeep = false)
      {
         const pools = original.map(name =>
         {
            const score = getScore(name);
            if (!name || typeof score !== 'number') return [];
            const candidates = shuffle(getPool(score).filter(candidate => candidate !== name));
            if (allowKeep && getPool(score).includes(name)) candidates.push(name);
            return candidates;
         });
         const result = [];
         const used = new Set();
         function select(index)
         {
            if (index === pools.length) return true;
            for (const name of pools[index])
            {
               if (used.has(name)) continue;
               result[index] = name;
               used.add(name);
               if (select(index + 1)) return true;
               used.delete(name);
            }
            return false;
         }
         if (select(0)) return result;
         return allowKeep ? null : findSelection(original, getPool, getScore, true);
      }
      const newAddons = findSelection(currentState.addons,
         score => getAddonNamesByScoresForKiller(currentState.killerKey, [score]), getAddonScore);
      const newPerks = findSelection(currentState.perks,
         score => getPerkNamesByScores([score]), getPerkScore);
      if (!newAddons || !newPerks) return false;
      currentState.addons = newAddons;
      currentState.perks = newPerks;
      return true;
   }

   // 25 號卡：固定被選中的欄位，其餘技能與配件欄位全部重抽
   function doKeepSelectedRerollOthers(slotIndex)
   {
      if (!currentState) return false;
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;

      const newPerks = currentState.perks.slice();
      const newAddons = currentState.addons.slice();

      const isAddonSlot = slotIndex === 1 || slotIndex === 2;
      const isPerkSlot = slotIndex >= 3 && slotIndex <= 6;

      const perkUsed = new Set();
      const addonUsed = new Set();

      if (isPerkSlot)
      {
         const keepIdx = slotIndex - 3;
         if (newPerks[keepIdx])
         {
            perkUsed.add(newPerks[keepIdx]);
         }
      }
      else if (isAddonSlot)
      {
         const keepIdx = slotIndex - 1;
         if (newAddons[keepIdx])
         {
            addonUsed.add(newAddons[keepIdx]);
         }
      }

      // 重新抽配件（不含保留欄位）
      const allAddons = getAddonNamesForKiller(killerKey);
      for (let i = 0; i < newAddons.length; i++)
      {
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
      for (let i = 0; i < newPerks.length; i++)
      {
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
   function doRerollSlotChoice(card, slotIndex, choiceCount)
   {
      const isAddonSlot = slotIndex === 1 || slotIndex === 2;
      const isPerkSlot = slotIndex >= 3 && slotIndex <= 6;

      if (!isAddonSlot && !isPerkSlot)
      {

         return;
      }

      choiceCount = Math.max(1, Math.min(3, choiceCount || 2));

      if (isAddonSlot)
      {
         const killerKey = currentState.killerKey;
         if (!killerKey)
         {

            return;
         }
         const originalAddons = currentState.addons.slice();
         const idx = slotIndex - 1;

         // 從該殺手配件池中，排除目前兩個配件，避免重複
         const basePool = getAddonNamesForKiller(killerKey).filter(
            name => !originalAddons.includes(name)
         );
         if (!basePool.length)
         {

            return;
         }

         const candidates = shuffle(basePool).slice(0, Math.min(choiceCount, basePool.length));

         if (candidates.length === 1)
         {
            const addons = originalAddons.slice();
            addons[idx] = candidates[0];
            currentState.addons = addons;
            finishCardPhase();
            return;
         }

         showChoiceOverlay(
         {
            type: 'addon',
            candidates,
            title: '選擇要替換成哪個配件：',
            onPick: (name) =>
            {
               const addons = originalAddons.slice();
               addons[idx] = name;
               currentState.addons = addons;
               finishCardPhase();
            }
         });
      }
      else if (isPerkSlot)
      {
         const originalPerks = currentState.perks.slice();
         const idx = slotIndex - 3;

         // 全部技能池除去當前四個技能
         const currentScore = getPerkScore(originalPerks[idx]);
         const basePool = getAllPerksExcept(originalPerks).filter(name =>
         {
            if (card.id !== 'card10') return true;
            const score = getPerkScore(name);
            return typeof currentScore === 'number' && typeof score === 'number' && score >= currentScore;
         });
         if (!basePool.length)
         {

            return;
         }

         const candidates = shuffle(basePool).slice(0, Math.min(choiceCount, basePool.length));

         if (candidates.length === 1)
         {
            const perks = originalPerks.slice();
            perks[idx] = candidates[0];
            currentState.perks = perks;
            finishCardPhase();
            return;
         }

         showChoiceOverlay(
         {
            type: 'perk',
            candidates,
            title: '選擇要替換成哪個技能：',
            onPick: (name) =>
            {
               const perks = originalPerks.slice();
               perks[idx] = name;
               currentState.perks = perks;
               finishCardPhase();
            }
         });
      }
   }

   // 11 號：當前殺手 -> 3 技能擇一
   function doReplaceSkillByCurrentKiller3Pick(card, slotIndex)
   {
      const isPerk = slotIndex >= 3 && slotIndex <= 6;
      if (!isPerk)
      {

         return;
      }
      const idx = slotIndex - 3;
      const killerKey = currentState && currentState.killerKey;
      if (!killerKey)
      {

         return;
      }

      const candidates = collectPerkCandidatesForKiller(killerKey);
      if (!candidates.length)
      {

         return;
      }

      showPerkMultiChoice(card, idx, candidates);
   }

   // 23 號：隨機殺手 -> 3 技能擇一
   function doReplaceSkillByRandomKiller3Pick(card, slotIndex)
   {
      const isPerk = slotIndex >= 3 && slotIndex <= 6;
      if (!isPerk)
      {

         return;
      }
      const idx = slotIndex - 3;

      // ✔ 只使用 decorateCardSummaries() 決定的 killerKey
      const killerKey =
         card.effect &&
         card.effect.data &&
         card.effect.data.killerKey;

      // 若沒有 killerKey（理論上不會發生）→ 直接當作無效卡
      if (!killerKey)
      {

         return;
      }

      const candidates = collectPerkCandidatesForKiller(killerKey);
      if (!candidates.length)
      {

         return;
      }

      showPerkMultiChoice(card, idx, candidates);
   }

   // 取得某殺手可用的技能候選（剃除目前 4 技能）
   function collectPerkCandidatesForKiller(killerKey)
   {
      const perks = currentState && Array.isArray(currentState.perks) ?
         currentState.perks.slice() :
         [];

      const poolAll = Object.entries(window.PERKS ||
         {})
         .filter(([name, p]) => p && p.killer === killerKey)
         .map(([name]) => name);

      if (!poolAll.length) return [];

      const forbidden = new Set(perks);
      const pool = poolAll.filter(name => !forbidden.has(name));
      return pool;
   }

   // 顯示多選一的技能選單（1 / 2 / 3 選一）
   function showPerkMultiChoice(card, perkIndex, allCandidates)
   {
      const perks = currentState && Array.isArray(currentState.perks) ?
         currentState.perks.slice() :
         [];

      const unique = Array.from(new Set(allCandidates));
      if (!unique.length)
      {

         return;
      }

      const candidates = shuffle(unique).slice(0, 3);

      if (candidates.length === 1)
      {
         perks[perkIndex] = candidates[0];
         currentState.perks = perks;
         finishCardPhase();
         return;
      }

      showChoiceOverlay(
      {
         type: 'perk',
         candidates,
         title: '選擇要替換成哪個技能：',
         onPick: (name) =>
         {
            perks[perkIndex] = name;
            currentState.perks = perks;
            finishCardPhase();
         }
      });
   }

   function doReplaceSkillByRandomKiller(slotIndex)
   {
      const isPerk = slotIndex >= 3 && slotIndex <= 6;
      if (!isPerk) return false;
      const idx = slotIndex - 3;

      const perks = currentState.perks.slice();
      const killerKeys = Object.keys(window.KILLERS ||
      {});
      if (!killerKeys.length) return false;
      const k = getRandomItem(killerKeys);

      const poolAll = Object.entries(window.PERKS ||
         {})
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

   function doReplaceSkillGeneral(slotIndex)
   {
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

   function doReplaceSkillGeneralChoice(slotIndex, choiceCount)
   {
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
      if (candidates.length === 1)
      {
         perks[idx] = candidates[0];
         currentState.perks = perks;
         finishCardPhase();
         return;
      }

      showChoiceOverlay(
      {
         type: 'perk',
         candidates,
         title: '選擇要替換成哪個通用技能：',
         onPick: (name) =>
         {
            const next = currentState.perks.slice();
            next[idx] = name;
            currentState.perks = next;
            finishCardPhase();
         }
      });
   }

   function doCard03AddonsSum7()
   {
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;
      const addonNames = getAddonNamesForKiller(killerKey);
      if (addonNames.length < 2) return false;

      const pairs = [];
      for (let i = 0; i < addonNames.length; i++)
      {
         for (let j = i + 1; j < addonNames.length; j++)
         {
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

   function doCard04RerollPerksNotLowerThanSlot(slotIndex)
   {
      if (slotIndex < 3 || slotIndex > 6) return false;
      const sourceIdx = slotIndex - 3;
      const sourceName = currentState.perks[sourceIdx];
      const minScore = getPerkScore(sourceName);
      if (typeof minScore !== 'number') return false;

      const pool = Object.entries(window.PERKS ||
         {})
         .filter(([_, p]) => p && typeof p.score === 'number' && p.score >= minScore)
         .map(([name]) => name);
      if (pool.length < 4) return false;

      const chosen = [];
      for (const name of shuffle(pool))
      {
         if (!chosen.includes(name)) chosen.push(name);
         if (chosen.length === 4) break;
      }
      if (chosen.length !== 4) return false;

      currentState.perks = chosen;
      return true;
   }

   function doCard05RerollThreeWithFixedHighSlot(slotIndex)
   {
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

      for (const idx of randomOther)
      {
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

   function doCard06DoubleChoiceRandomPerkSlot(card)
   {
      const data = (card && card.effect && card.effect.data) ? card.effect.data :
      {
      };
      const rounds = Math.max(1, Math.min(4, data.rounds || 2));
      const choiceCount = Math.max(1, Math.min(5, data.choices || 5));
      const scores = Array.isArray(data.scores) && data.scores.length ? data.scores : [3, 4, 5];
      const availableSlots = shuffle([0, 1, 2, 3]).slice(0, Math.min(rounds, 4));

      const step = (roundIndex) =>
      {
         if (roundIndex >= availableSlots.length)
         {
            finishCardPhase();
            return;
         }

         const slotIdx = availableSlots[roundIndex];
         const currentPerks = currentState.perks.slice();
         const currentName = currentPerks[slotIdx];
         const other = currentPerks.filter((_, i) => i !== slotIdx);
         let pool = getPerkNamesByScores(scores).filter(name => !other.includes(name) && name !== currentName);
         if (!pool.length) pool = getPerkNamesByScores(scores).filter(name => name !== currentName);
         if (!pool.length)
         {
            step(roundIndex + 1);
            return;
         }

         const candidates = shuffle(pool).slice(0, Math.min(choiceCount, pool.length));
         const applyPick = (name) =>
         {
            const perks = currentState.perks.slice();
            perks[slotIdx] = name;
            currentState.perks = perks;
            step(roundIndex + 1);
         };

         if (candidates.length === 1)
         {
            applyPick(candidates[0]);
            return;
         }

         showChoiceOverlay(
         {
            type: 'perk',
            candidates,
            title: `第 ${roundIndex + 1} 次選擇：技能會隨機替換到第 ${slotIdx + 1} 個技能欄位`,
            onPick: applyPick
         });
      };

      step(0);
   }

   function doCard16AllSlotsPlusOneWrap()
   {
      if (!currentState) return false;
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;

      const addonScores = currentState.addons.map(name =>
      {
         const s = getAddonScore(name);
         return typeof s === 'number' ? ((s + 1) % 6) : null;
      });
      const perkScores = currentState.perks.map(name =>
      {
         const s = getPerkScore(name);
         return typeof s === 'number' ? ((s + 1) % 6) : null;
      });
      if (addonScores.some(s => s == null) || perkScores.some(s => s == null)) return false;

      let newAddons = buildAddonSelectionForScores(killerKey, addonScores,
      {
         allowDuplicateFallback: false,
         scoreFallbackSequence: (score) => [score]
      });
      if (!newAddons)
      {
         // Choose the pair together so one fallback cannot take the other slot's only match.
         const pool = getAddonNamesForKiller(killerKey).filter(name =>
            typeof getAddonScore(name) === 'number'
         );
         const sequences = addonScores.map(score => getFallbackScoreSequence(score,
         {
            addOneFirst: true
         }));
         let bestCost = Infinity;
         let bestPairs = [];
         for (const first of pool)
         {
            for (const second of pool)
            {
               if (first === second) continue;
               const firstRank = sequences[0].indexOf(getAddonScore(first));
               const secondRank = sequences[1].indexOf(getAddonScore(second));
               if (firstRank < 0 || secondRank < 0) continue;
               const cost = firstRank + secondRank;
               if (cost < bestCost)
               {
                  bestCost = cost;
                  bestPairs = [];
               }
               if (cost === bestCost) bestPairs.push([first, second]);
            }
         }
         newAddons = getRandomItem(bestPairs);
      }
      const newPerks = buildPerkSelectionForScores(perkScores,
      {
         allowDuplicateFallback: false,
         scoreFallbackSequence: (score) => [score]
      });
      if (!newAddons || !newPerks) return false;

      currentState.addons = newAddons;
      currentState.perks = newPerks;
      return true;
   }

   function applyScoreToAllNonKillerSlots(score, options)
   {
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;
      const opts = options ||
      {
      };

      const addonScore = getFallbackScoreSequence(score,
         {
            addOneFirst: opts.addOneFirst !== false
         })
         .find(s => getAddonNamesByScoresForKiller(killerKey, [s]).length > 0);
      const perkScore = getFallbackScoreSequence(score,
         {
            addOneFirst: opts.addOneFirst !== false
         })
         .find(s => getPerkNamesByScores([s]).length > 0);
      if (addonScore == null || perkScore == null) return false;

      const newAddons = buildAddonSelectionForScores(killerKey, [addonScore, addonScore],
      {
         allowDuplicateFallback: false,
         scoreFallbackSequence: (s) => [s]
      });
      const newPerks = buildPerkSelectionForScores([perkScore, perkScore, perkScore, perkScore],
      {
         allowDuplicateFallback: false,
         scoreFallbackSequence: (s) => [s]
      });
      if (!newAddons || !newPerks) return false;

      currentState.addons = newAddons;
      currentState.perks = newPerks;
      return true;
   }

   function applyScoreToRandomNonKillerSlots(score, count, options)
   {
      if (!currentState || !currentState.killerKey) return false;
      const opts = options ||
      {
      };
      const slotOrder = shuffle([1, 2, 3, 4, 5, 6]);
      let applied = 0;

      for (const slot of slotOrder)
      {
         let ok = false;
         if (slot === 1 || slot === 2)
         {
            ok = rerollAddonSlotByScore(slot - 1, getFallbackScoreSequence(score,
            {
               addOneFirst: opts.addOneFirst !== false
            }),
            {
               allowDuplicateFallback: false,
               allowKeepSameName: true
            });
         }
         else
         {
            ok = rerollPerkSlotByScore(slot - 3, getFallbackScoreSequence(score,
            {
               addOneFirst: opts.addOneFirst !== false
            }),
            {
               allowDuplicateFallback: true,
               allowKeepSameName: true
            });
         }

         if (ok)
         {
            applied += 1;
            if (applied >= count) return true;
         }
      }

      return applied > 0;
   }

   function applyCard17WinReward(score)
   {
      if (!currentState || !currentState.killerKey) return false;

      const addonSequence = [];
      if (typeof score === 'number' && score >= 0 && score <= 5) addonSequence.push(score);
      if (!addonSequence.includes(1)) addonSequence.push(1);
      if (!addonSequence.includes(2)) addonSequence.push(2);
      for (const s of getFallbackScoreSequence(score,
         {
            addOneFirst: true
         }))
      {
         if (!addonSequence.includes(s)) addonSequence.push(s);
      }

      const perkSequence = getFallbackScoreSequence(score,
      {
         addOneFirst: true
      });

      let applied = 0;

      for (let i = 0; i < 2; i++)
      {
         const ok = rerollAddonSlotByScore(i, addonSequence,
         {
            allowDuplicateFallback: false,
            allowKeepSameName: true
         });
         if (!ok) return false;
         applied += 1;
      }

      for (let i = 0; i < 4; i++)
      {
         const ok = rerollPerkSlotByScore(i, perkSequence,
         {
            allowDuplicateFallback: true,
            allowKeepSameName: true
         });
         if (!ok) return false;
         applied += 1;
      }

      return applied === 6;
   }

   function clampCard39Score(isAddon, score)
   {
      if (typeof score !== 'number') return isAddon ? 1 : 0;
      if (isAddon) return Math.max(1, Math.min(5, score));
      return Math.max(0, Math.min(5, score));
   }

   function getCard39SlotElement(slotIndex)
   {
      const cells = Array.from(document.querySelectorAll('.slot-cell'));
      if (!cells.length) return null;
      return cells[slotIndex] || null;
   }

   function showCard39BigText(text, color)
   {
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
      requestAnimationFrame(() =>
      {
         el.style.opacity = '1';
         el.style.transform = 'scale(1)';
      });
      setTimeout(() =>
      {
         el.style.opacity = '0';
         el.style.transform = 'scale(1.18)';
      }, 560);
      setTimeout(() =>
      {
         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 860);
   }

   function showCard39FloatingDelta(slotIndex, delta)
   {
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
      requestAnimationFrame(() =>
      {
         float.style.transform = 'translate(-50%, -110%)';
         float.style.opacity = '0';
      });
      setTimeout(() =>
      {
         if (float.parentNode) float.parentNode.removeChild(float);
      }, 700);
   }

   function showCard39AnswerReveal(question, result, onClose)
   {
      const correct = !!result?.correct;
      const timedOut = !!result?.timedOut;
      const overlay = document.createElement('div');
      overlay.id = 'card39AnswerOverlay';
      overlay.className = 'dbd-card-overlay card39-answer-overlay';
      const panel = document.createElement('div');
      panel.className = 'dbd-card-panel card39-answer-panel';
      panel.dataset.result = correct ? 'correct' : timedOut ? 'timeout' : 'wrong';
      const kicker = document.createElement('div');
      kicker.className = 'card39-answer-kicker';
      kicker.textContent = '快問快答 · 解答';
      const title = document.createElement('h2');
      title.className = 'card39-answer-title';
      title.textContent = correct ? '✓ 答對了' : timedOut ? '時間到了' : '答錯了';
      const prompt = document.createElement('div');
      prompt.className = 'card39-answer-question';
      prompt.textContent = question?.question || '題目讀取失敗';
      const answerBox = document.createElement('div');
      answerBox.className = 'card39-answer-box';
      const answerLabel = document.createElement('div');
      answerLabel.className = 'card39-answer-label';
      answerLabel.textContent = '正確答案';
      const answer = document.createElement('div');
      answer.className = 'card39-answer-value';
      answer.textContent = question?.answer || '未知';
      answerBox.append(answerLabel, answer);
      panel.append(kicker, title, prompt);
      const details = document.createElement('div');
      details.className = 'card39-answer-details';
      details.appendChild(answerBox);
         const note = document.createElement('div');
         note.className = 'card39-answer-note';
         const label = document.createElement('div');
         label.className = 'card39-answer-label';
         label.textContent = '補充說明';
         const text = document.createElement('div');
         text.className = 'card39-answer-note-text';
         text.textContent = question?.note || '沒有補充說明';
         note.append(label, text);
         details.appendChild(note);
      panel.appendChild(details);
      const footer = document.createElement('div');
      footer.className = 'card39-answer-footer';
      const effect = document.createElement('div');
      effect.textContent = correct ? '兩個指定欄位各 +2 分' : '兩個指定欄位各 -1 分';
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '繼續';
      let closed = false;
      button.addEventListener('click', () =>
      {
         if (closed) return;
         closed = true;
         overlay.remove();
         if (typeof onClose === 'function') onClose();
      });
      footer.append(effect, button);
      panel.appendChild(footer);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      button.focus({ preventScroll: true });
   }

   function getCard39SlotMeta(slotIndex)
   {
      if (slotIndex === 1 || slotIndex === 2)
      {
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
      if (slotIndex >= 3 && slotIndex <= 6)
      {
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

   function applyCard39DeltaToSlot(slotIndex, delta)
   {
      const meta = getCard39SlotMeta(slotIndex);
      if (!meta || typeof meta.score !== 'number') return false;

      const targetScore = clampCard39Score(meta.isAddon, meta.score + delta);

      if (meta.isAddon)
      {
         let scoreSequence = [targetScore];

         // 39 號卡的簡單保護：
         // 若配件扣到 1 分，但該殺手沒有 1 分配件，就直接改試 2 分
         if (targetScore === 1)
         {
            const hasScore1 = getAddonNamesByScoresForKiller(currentState && currentState.killerKey, [1]).length > 0;
            if (!hasScore1) scoreSequence = [2];
         }

         return rerollAddonSlotByScore(slotIndex - 1, scoreSequence,
         {
            allowDuplicateFallback: false,
            allowKeepSameName: true
         });
      }

      return rerollPerkSlotByScore(slotIndex - 3, [targetScore],
      {
         allowDuplicateFallback: true,
         allowKeepSameName: true
      });
   }

   function showCard39SlotPicker(onDone)
   {
      const slots = [1, 2, 3, 4, 5, 6].map(getCard39SlotMeta).filter(Boolean);
      const selected = [];

      const overlay = document.createElement('div');
      overlay.id = 'card39SlotPickerOverlay';
      overlay.classList.add('dbd-card-overlay');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;z-index:100004;';

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.style.cssText = 'width:min(760px,calc(100vw - 24px));background:linear-gradient(180deg,#1c202c,#141823);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,0.5);';

      const title = document.createElement('div');
      title.textContent = '選擇兩個欄位';
      title.style.cssText = 'font-size:20px;font-weight:800;margin-bottom:6px;color:#fff;';

      const sub = document.createElement('div');
      sub.textContent = '請選兩個非殺手欄位，再按同一格可取消。';
      sub.style.cssText = 'font-size:13px;color:#bfc7da;margin-bottom:14px;';

      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;';

      function setSelectedStyle(btn, on)
      {
         btn.style.borderColor = on ? '#ffd36e' : 'rgba(255,255,255,0.1)';
         btn.style.boxShadow = on ? '0 0 0 1px rgba(255,211,110,0.55)' : 'none';
         btn.style.background = on ? '#2b3344' : '#202633';
      }

      slots.forEach((meta) =>
      {
         const btn = document.createElement('button');
         btn.type = 'button';
         btn.style.cssText = 'padding:12px 10px;border-radius:12px;background:#202633;border:1px solid rgba(255,255,255,0.1);color:#fff;text-align:left;min-height:96px;';
         btn.innerHTML = `
      <div style="font-size:13px;color:#9fb0d6;margin-bottom:6px;">${meta.label}</div>
      <div style="font-size:15px;font-weight:700;line-height:1.45;">${meta.zh || meta.name || '未知'}</div>
      <div style="font-size:12px;color:#c8d0e5;margin-top:6px;">目前分數：${meta.score ?? '?'}</div>
    `;
         btn.classList.add('card39-slot-option');
         const text = document.createElement('div');
         text.className = 'card39-slot-text';
         while (btn.firstChild) text.appendChild(btn.firstChild);
         const imageBox = document.createElement('div');
         imageBox.className = 'card39-slot-image';
         const imageSrc = meta.slotIndex <= 2 ? getAddonImg(meta.name) : getPerkImg(meta.name);
         if (imageSrc)
         {
            const image = document.createElement('img');
            image.src = imageSrc;
            image.alt = meta.zh || meta.name || '';
            imageBox.appendChild(image);
         }
         btn.appendChild(imageBox);
         btn.appendChild(text);
         setSelectedStyle(btn, false);

         btn.addEventListener('click', () =>
         {
            const idx = selected.indexOf(meta.slotIndex);
            if (idx !== -1)
            {
               selected.splice(idx, 1);
               setSelectedStyle(btn, false);
               return;
            }
            if (selected.length >= 2) return;
            selected.push(meta.slotIndex);
            setSelectedStyle(btn, true);

            if (selected.length >= 2)
            {
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

   function showCard39QuizOverlay(questionData, onAnswer, timeoutMs)
   {
      const q = questionData ||
      {
      };
      const limitMs = typeof timeoutMs === 'number' ? timeoutMs : 5000;
      let done = false;
      let remain = Math.ceil(limitMs / 1000);

      const overlay = document.createElement('div');
      overlay.id = 'card39QuizOverlay';
      overlay.classList.add('dbd-card-overlay');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:100005;';

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
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

      function finish(payload)
      {
         if (done) return;
         done = true;
         clearInterval(secondTimerId);
         clearInterval(progressTimerId);
         clearTimeout(timeoutId);
         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
         if (typeof onAnswer === 'function') onAnswer(payload);
      }

      const choices = Array.isArray(q.options) && q.options.length ?
         q.options.map(opt => (
         {
            value: opt.label,
            label: `${opt.label}. ${opt.text}`,
            raw: opt
         })) :
         [
         {
            value: '是',
            label: '是'
         },
         {
            value: '否',
            label: '否'
         }];

      choices.forEach((choice) =>
      {
         const btn = document.createElement('button');
         btn.type = 'button';
         btn.style.cssText = 'padding:12px 10px;border-radius:12px;background:#202633;border:1px solid rgba(255,255,255,0.1);color:#fff;text-align:left;font-size:14px;line-height:1.5;';
         btn.textContent = choice.label;
         btn.addEventListener('click', () =>
         {
            const normalizedUser = normalizeCard39AnswerToken(choice.value);
            const normalizedAnswer = normalizeCard39AnswerToken(q.answer);
            const correctByLabel = normalizedUser === normalizedAnswer;
            const correctByText = choice.raw && normalizeCard39AnswerToken(choice.raw.text) === normalizedAnswer;
            finish(
            {
               correct: !!(correctByLabel || correctByText),
               timedOut: false,
               question: q
            });
         });
         actions.appendChild(btn);
      });

      const timeoutId = setTimeout(() =>
      {
         timerEl.textContent = 'TIME UP';
         timerEl.style.color = '#ff6d6d';
         bar.style.width = '0%';
         bar.style.background = 'linear-gradient(90deg,#ff7b7b,#ff3b3b)';
         setTimeout(() => finish(
         {
            correct: false,
            timedOut: true,
            question: q
         }), 260);
      }, limitMs);

      const secondTimerId = setInterval(() =>
      {
         remain -= 1;
         if (remain < 0) remain = 0;
         timerEl.textContent = `剩餘時間：${remain} 秒`;
         if (remain <= 1) timerEl.style.color = '#ff6d6d';
      }, 1000);

      const progressTimerId = setInterval(() =>
      {
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

   function doCard39Quiz()
   {
      if (!currentState) return;

      showCard39SlotPicker((selectedSlots) =>
      {
         const question = getRandomItem(CARD39_QUIZ_DATA);
         if (!question)
         {
            showInfoPopup('快問快答', '題庫是空的。', () => finishCardPhase());
            return;
         }

         showCard39QuizOverlay(question, (result) =>
         {
            const delta = result && result.correct ? 2 : -1;

            if (result && result.correct)
            {
               showCard39BigText('CORRECT', '#5bff9b');
            }
            else if (result && result.timedOut)
            {
               showCard39BigText('TIME UP', '#ff5e5e');
            }
            else
            {
               showCard39BigText('WRONG', '#ff5e5e');
            }

            setTimeout(() =>
            {
               showCard39AnswerReveal(question, result, () =>
               {
                  selectedSlots.forEach((slotIndex) =>
                  {
                     applyCard39DeltaToSlot(slotIndex, delta);
                     showCard39FloatingDelta(slotIndex, delta);
                  });
                  setTimeout(() => finishCardPhase(), 720);
               });
            }, 650);
         }, 5000);
      });
   }

   function doCard38SpeedChoice(slotIndex)
   {
      const isPerk = slotIndex >= 3 && slotIndex <= 6;
      if (!isPerk || !currentState || !Array.isArray(currentState.perks)) return false;

      const preferredPerkIdx = slotIndex - 3;
      const allPerkIdxs = [0, 1, 2, 3];
      const roundOrder = [preferredPerkIdx].concat(allPerkIdxs.filter(i => i !== preferredPerkIdx));

      function fillFailedSlot(perkIdx)
      {
         const currentName = currentState.perks[perkIdx] || null;
         const lockedPerks = currentState.perks.filter((name, idx) => idx !== perkIdx && !!name);
         const pool = getPerkNamesByScores([0, 1, 2]).filter(name =>
            name !== currentName && !lockedPerks.includes(name)
         );
         const chosen = getRandomItem(pool);
         if (chosen) currentState.perks[perkIdx] = chosen;
      }

      function runRound(roundIdx)
      {
         if (roundIdx >= roundOrder.length)
         {
            finishCardPhase();
            return;
         }

         const perkIdx = roundOrder[roundIdx];
         const currentName = currentState.perks[perkIdx] || null;
         const lockedPerks = currentState.perks.filter((name, idx) => idx !== perkIdx && !!name);

         const highPoolBase = getPerkNamesByScores([2, 3, 4, 5]).filter(name =>
            name !== currentName && !lockedPerks.includes(name)
         );

         const currentChoices = pickDistinctRandom(highPoolBase, 4);
         if (!currentChoices.length)
         {
            runRound(roundIdx + 1);
            return;
         }

         const overlay = document.createElement('div');
         overlay.id = 'card38SpeedChoiceOverlay';
         overlay.classList.add('dbd-card-overlay');
         overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);display:flex;align-items:center;justify-content:center;z-index:100003;';

         const panel = document.createElement('div');
         panel.classList.add('dbd-card-panel');
         panel.style.cssText = 'width:min(920px,calc(100vw - 24px));background:linear-gradient(180deg,#1c202c,#141823);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,0.5);';

         const title = document.createElement('div');
         title.textContent = `第 ${roundIdx + 1} / 4 輪：1 秒內選 1 個技能`;
         title.style.cssText = 'font-size:20px;font-weight:800;margin-bottom:6px;color:#fff;';

         const timerEl = document.createElement('div');
         timerEl.style.cssText = 'font-size:13px;color:#ffd36e;margin-bottom:8px;';
         timerEl.textContent = '剩餘時間：1 秒';

         const barWrap = document.createElement('div');
         barWrap.style.cssText = 'width:100%;height:10px;background:rgba(255,255,255,0.10);border-radius:999px;overflow:hidden;margin:0 0 14px 0;border:1px solid rgba(255,255,255,0.06);';

         const bar = document.createElement('div');
         bar.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#6effa2,#ffd36e);transition:width 0.08s linear;';
         barWrap.appendChild(bar);

         const hint = document.createElement('div');
         hint.style.cssText = 'font-size:13px;color:#c8d0e5;margin-bottom:14px;';
         hint.textContent = '1 秒內選 1 個技能；超時會顯示「失敗」，按兩次任意按鍵繼續。';

         const slotHint = document.createElement('div');
         slotHint.style.cssText = 'font-size:12px;color:#8fa3cf;margin-bottom:14px;';
         slotHint.textContent = `本輪替換技能欄位：${perkIdx + 1}`;

         const grid = document.createElement('div');
         grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;';

         let done = false;
         let remain = 1;
         let progressTimerId = null;
         let secondTimerId = null;
         let timeoutId = null;
         let continueHandler = null;

         function stopTimers()
         {
            if (progressTimerId) clearInterval(progressTimerId);
            if (secondTimerId) clearInterval(secondTimerId);
            if (timeoutId) clearTimeout(timeoutId);
         }

         function cleanup()
         {
            stopTimers();
            if (continueHandler)
            {
               document.removeEventListener('click', continueHandler, true);
               document.removeEventListener('keydown', continueHandler, true);
               continueHandler = null;
            }
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
         }

         function showFailure()
         {
            if (done) return;
            done = true;
            stopTimers();
            timerEl.textContent = '剩餘時間：0.0 秒';
            timerEl.style.color = '#ff6d6d';
            bar.style.width = '0%';
            grid.querySelectorAll('button').forEach(btn =>
            {
               // Keep pointer events so clicking a frozen choice also continues.
               btn.setAttribute('aria-disabled', 'true');
               btn.style.opacity = '0.45';
            });
            const failure = document.createElement('div');
            failure.className = 'card38-failure';
            failure.setAttribute('role', 'status');
            failure.innerHTML = '<div class="card38-failure-title">失敗</div><div class="card38-failure-hint">按任意按鍵繼續</div>';
            panel.appendChild(failure);
            let presses = 0;
            continueHandler = (event) =>
            {
               // Prevent a Space/Enter press from also producing a button click.
               event.preventDefault();
               event.stopImmediatePropagation();
               if (event.type === 'keydown' && event.repeat) return;
               presses += 1;
               if (presses < 2)
               {
                  failure.querySelector('.card38-failure-hint').textContent = '按任意按鍵繼續（再按一次）';
                  return;
               }
               cleanup();
               fillFailedSlot(perkIdx);
               runRound(roundIdx + 1);
            };
            document.addEventListener('click', continueHandler, true);
            document.addEventListener('keydown', continueHandler, true);
         }

         function applyChoice(name)
         {
            if (done) return;
            if (performance.now() - startedAt >= 1100)
            {
               showFailure();
               return;
            }
            done = true;
            cleanup();
            currentState.perks[perkIdx] = name;
            runRound(roundIdx + 1);
         }

         currentChoices.forEach((name) =>
         {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'padding:10px;border-radius:12px;background:#202633;border:1px solid rgba(255,255,255,0.1);color:#fff;text-align:left;min-height:132px;';
            const zh = getPerkZh(name) || name;
            const img = getPerkImg(name);
            btn.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          <div style="width:54px;height:54px;border-radius:10px;background:#0e121d;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
            ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:contain;">` : ''}
          </div>
          <div style="min-width:0;">
            <div style="font-size:14px;font-weight:700;line-height:1.4;">${zh}</div>
          </div>
        </div>
      `;
            btn.addEventListener('click', (event) =>
            {
               if (!done) event.stopPropagation();
               applyChoice(name);
            });
            grid.appendChild(btn);
         });

         const startedAt = performance.now();
         secondTimerId = setInterval(() =>
         {
            remain = Math.max(0, 1 - (performance.now() - startedAt) / 1000);
            if (remain < 0) remain = 0;
            timerEl.textContent = `剩餘時間：${remain.toFixed(1)} 秒`;
            if (remain <= 1) timerEl.style.color = '#ff6d6d';
         }, 50);

         progressTimerId = setInterval(() =>
         {
            const elapsed = performance.now() - startedAt;
            const ratio = Math.max(0, 1 - (elapsed / 1000));
            bar.style.width = `${ratio * 100}%`;
            if (ratio <= 0.2) bar.style.background = 'linear-gradient(90deg,#ffae66,#ff4d4d)';
            if (ratio <= 0) clearInterval(progressTimerId);
         }, 50);

         timeoutId = setTimeout(() =>
         {
            showFailure();
         }, 1100);

         panel.appendChild(title);
         panel.appendChild(timerEl);
         panel.appendChild(barWrap);
         panel.appendChild(hint);
         panel.appendChild(slotHint);
         panel.appendChild(grid);
         overlay.appendChild(panel);
         document.body.appendChild(overlay);
      }

      const readyOverlay = document.createElement('div');
      readyOverlay.id = 'card38ReadyOverlay';
      readyOverlay.className = 'dbd-card-overlay';
      const readyPanel = document.createElement('div');
      readyPanel.className = 'dbd-card-panel card38-ready-panel';
      const readyTitle = document.createElement('div');
      readyTitle.className = 'card38-ready-title';
      readyTitle.textContent = '準備好了嗎';
      const readyCount = document.createElement('div');
      readyCount.className = 'card38-ready-count';
      readyCount.setAttribute('role', 'status');
      readyCount.textContent = '3';
      readyPanel.append(readyTitle, readyCount);
      readyOverlay.appendChild(readyPanel);
      document.body.appendChild(readyOverlay);
      const readyState = currentState;
      let countdown = 3;
      function countDown()
      {
         if (!readyOverlay.isConnected || currentState !== readyState || !isActive)
         {
            readyOverlay.remove();
            return;
         }
         countdown -= 1;
         if (countdown === 0)
         {
            readyOverlay.remove();
            runRound(0);
            return;
         }
         readyCount.textContent = String(countdown);
         setTimeout(countDown, 1000);
      }
      setTimeout(countDown, 1000);
      return true;
   }

   function doCard17LosePenalty()
   {
      const slotOrder = shuffle([1, 2, 3, 4, 5, 6]);
      let applied = 0;

      for (const slot of slotOrder)
      {
         let ok = false;

         if (slot === 1 || slot === 2)
         {
            const preferredScore = Math.random() < 0.5 ? 0 : 1;
            const fallbackScore = preferredScore === 0 ? 1 : 0;
            ok = rerollAddonSlotByScore(slot - 1, [preferredScore, fallbackScore],
            {
               allowDuplicateFallback: false,
               allowKeepSameName: true
            });
         }
         else
         {
            ok = rerollPerkSlotByScore(slot - 3, [0, 1],
            {
               allowDuplicateFallback: true,
               allowKeepSameName: true
            });
         }

         if (ok)
         {
            applied += 1;
            if (applied >= 3) return true;
         }
      }

      return applied > 0;
   }

   let card17GuessStyleInjected = false;

   function ensureCard17GuessStyles()
   {
      if (card17GuessStyleInjected) return;
      card17GuessStyleInjected = true;

      const style = document.createElement('style');
      style.id = 'card17-guess-styles';
      style.textContent = `
#card17GuessOverlay,
#card17RewardPickerOverlay
{
   position: fixed;
   inset: 0;
   z-index: 100020;
   background: rgba(0, 0, 0, 0.78);
   display: flex;
   align-items: center;
   justify-content: center;
   backdrop-filter: blur(4px);
}

.card17-guess-panel,
.card17-picker-panel
{
   width: min(860px, calc(100vw - 24px));
   background: linear-gradient(180deg, #0f1423, #101728);
   border: 1px solid rgba(255, 255, 255, 0.10);
   border-radius: 24px;
   padding: 22px 22px 18px;
   box-shadow: 0 24px 60px rgba(0, 0, 0, 0.52);
   color: #fff;
}

.card17-guess-title,
.card17-picker-title
{
   font-size: 24px;
   font-weight: 900;
   text-align: center;
   margin-bottom: 6px;
}

.card17-guess-sub,
.card17-picker-sub
{
   font-size: 13px;
   color: #bfc7da;
   text-align: center;
   margin-bottom: 16px;
}

.card17-guess-vs
{
   display: grid;
   grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
   gap: 16px;
   align-items: center;
}

.card17-guess-side
{
   min-height: 290px;
   border-radius: 20px;
   background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
   border: 1px solid rgba(255, 255, 255, 0.08);
   padding: 16px 14px;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: flex-start;
}

.card17-guess-label
{
   font-size: 14px;
   color: #d5def5;
   margin-bottom: 12px;
   font-weight: 700;
}

.card17-guess-imgwrap
{
   width: 126px;
   height: 126px;
   border-radius: 20px;
   background: linear-gradient(180deg, #1a2440, #18233c);
   border: 1px solid rgba(255, 255, 255, 0.12);
   display: flex;
   align-items: center;
   justify-content: center;
   overflow: hidden;
   margin-bottom: 12px;
   transform-style: preserve-3d;
}

.card17-guess-imgwrap img
{
   width: 100%;
   height: 100%;
   object-fit: contain;
   display: block;
}

.card17-guess-imgwrap.hidden-card
{
   position: relative;
   background: linear-gradient(180deg, #1d2a49, #16233d);
}

.card17-guess-imgwrap.hidden-card::before
{
   content: '?';
   position: absolute;
   inset: 0;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 48px;
   font-weight: 900;
   color: rgba(255, 255, 255, 0.92);
   z-index: 2;
}

.card17-guess-imgwrap.hidden-card img
{
   opacity: 0;
   visibility: hidden;
}

.card17-guess-imgwrap.hidden-card.revealed
{
   animation: card17FlipReveal 0.55s ease forwards;
}

.card17-guess-imgwrap.hidden-card.revealed::before
{
   display: none;
}

.card17-guess-imgwrap.hidden-card.revealed img
{
   opacity: 1;
   visibility: visible;
}

.card17-guess-score
{
   width: 112px;
   min-height: 60px;
   border-radius: 18px;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 52px;
   font-weight: 900;
   background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.04));
   border: 1px solid rgba(255, 255, 255, 0.12);
   margin-bottom: 10px;
   box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.04);
}

.card17-guess-score.hidden-score
{
   color: rgba(255, 255, 255, 0.92);
}

.card17-guess-name
{
   font-size: 12px;
   line-height: 1.5;
   color: #e5ecff;
   text-align: center;
   min-height: 38px;
   word-break: break-word;
}

.card17-guess-name.masked
{
   letter-spacing: 0.25em;
}

.card17-guess-mid
{
   font-size: 50px;
   font-weight: 900;
   color: rgba(255, 255, 255, 0.9);
   text-shadow: 0 0 20px rgba(255, 255, 255, 0.18);
}

.card17-guess-actions
{
   display: flex;
   justify-content: center;
   gap: 14px;
   margin-top: 18px;
}

.card17-choice-btn
{
   min-width: 120px;
   border: none;
   border-radius: 999px;
   padding: 12px 18px;
   font-size: 22px;
   font-weight: 900;
   color: #fff;
   background: linear-gradient(135deg, #74a7ff, #4f7ee8);
   box-shadow: 0 8px 22px rgba(79, 126, 232, 0.34);
   cursor: pointer;
}

.card17-choice-btn:disabled
{
   opacity: 0.55;
   cursor: default;
}

.card17-result-text
{
   margin-top: 14px;
   min-height: 60px;
   text-align: center;
   font-size: 44px;
   font-weight: 1000;
   letter-spacing: 0.08em;
   opacity: 0;
   transform: translateY(14px) scale(0.92);
   text-shadow: 0 0 18px rgba(255, 255, 255, 0.14);
}

.card17-result-text.show
{
   opacity: 1;
   transform: translateY(0) scale(1);
   transition: transform 0.28s ease, opacity 0.28s ease;
}

.card17-result-text.win
{
   color: #6effa2;
}

.card17-result-text.lose
{
   color: #ff6a82;
}

.card17-result-text.draw
{
   color: #ffd36e;
}

.card17-continue-hint
{
   margin-top: 8px;
   text-align: center;
   font-size: 12px;
   color: rgba(225, 232, 255, 0.65);
   opacity: 0;
}

#card17GuessOverlay.ready .card17-continue-hint
{
   opacity: 1;
}

.card17-picker-grid
{
   display: grid;
   grid-template-columns: repeat(2, minmax(0, 1fr));
   gap: 12px;
}

.card17-picker-btn
{
   padding: 12px 12px;
   border-radius: 14px;
   background: #202633;
   border: 1px solid rgba(255, 255, 255, 0.10);
   color: #fff;
   text-align: left;
   min-height: 112px;
   display: grid;
   grid-template-columns: 74px 1fr;
   gap: 12px;
   align-items: center;
   cursor: pointer;
}

.card17-picker-btn.selected
{
   border-color: #77ffb4;
   box-shadow: 0 0 0 1px rgba(119, 255, 180, 0.55);
   background: #2b3344;
}

.card17-picker-thumb
{
   width: 74px;
   height: 74px;
   border-radius: 12px;
   overflow: hidden;
   border: 1px solid rgba(255, 255, 255, 0.10);
   background: #121827;
   display: flex;
   align-items: center;
   justify-content: center;
}

.card17-picker-thumb img
{
   width: 100%;
   height: 100%;
   object-fit: contain;
   display: block;
}

.card17-picker-meta
{
   min-width: 0;
}

.card17-picker-name
{
   font-size: 14px;
   font-weight: 800;
   line-height: 1.4;
   margin-bottom: 6px;
   word-break: break-word;
}

.card17-picker-score
{
   font-size: 12px;
   color: #c8d0e5;
}

.card17-picker-label
{
   font-size: 12px;
   color: #8fb0ff;
   margin-bottom: 4px;
}

@keyframes card17FlipReveal
{
   0%
   {
      transform: rotateY(0deg) scale(1);
   }

   49%
   {
      transform: rotateY(90deg) scale(1.03);
   }

   50%
   {
      transform: rotateY(90deg) scale(1.03);
   }

   100%
   {
      transform: rotateY(0deg) scale(1);
   }
}

@media (max-width: 720px)
{
   .card17-guess-vs
   {
      grid-template-columns: 1fr;
   }

   .card17-guess-mid
   {
      display: none;
   }

   .card17-picker-grid
   {
      grid-template-columns: 1fr;
   }
}
`;
      document.head.appendChild(style);
   }

   function getCard17KnownPerkMeta(perkIdx)
   {
      if (!currentState || !Array.isArray(currentState.perks)) return null;
      const name = currentState.perks[perkIdx];
      if (!name) return null;
      const score = getPerkScore(name);
      if (typeof score !== 'number' || score < 1 || score > 4) return null;
      return {
         perkIdx,
         name,
         zh: getPerkZh(name) || '',
         img: getPerkImg(name) || '',
         score
      };
   }

   function getCard17PerkMetaAny(perkIdx)
   {
      if (!currentState || !Array.isArray(currentState.perks)) return null;
      const name = currentState.perks[perkIdx];
      if (!name) return null;
      const score = getPerkScore(name);
      if (typeof score !== 'number') return null;
      return {
         perkIdx,
         name,
         zh: getPerkZh(name) || '',
         img: getPerkImg(name) || '',
         score
      };
   }

   function getCard17RewardMeta(slotIndex)
   {
      if (slotIndex === 1 || slotIndex === 2)
      {
         const addonIdx = slotIndex - 1;
         const addonName = currentState && currentState.addons ? currentState.addons[addonIdx] : null;
         return {
            slotIndex,
            isAddon: true,
            label: `配件 ${addonIdx + 1}`,
            name: addonName,
            zh: addonName ? (getAddonZh(addonName) || addonName) : '未知配件',
            img: addonName ? (getAddonImg(addonName) || '') : '',
            score: addonName ? getAddonScore(addonName) : null
         };
      }
      if (slotIndex >= 3 && slotIndex <= 6)
      {
         const perkIdx = slotIndex - 3;
         const perkName = currentState && currentState.perks ? currentState.perks[perkIdx] : null;
         return {
            slotIndex,
            isAddon: false,
            label: `技能 ${perkIdx + 1}`,
            name: perkName,
            zh: perkName ? (getPerkZh(perkName) || perkName) : '未知技能',
            img: perkName ? (getPerkImg(perkName) || '') : '',
            score: perkName ? getPerkScore(perkName) : null
         };
      }
      return null;
   }

   function applyCard17DeltaToSlot(slotIndex, delta)
   {
      const meta = getCard17RewardMeta(slotIndex);
      if (!meta || typeof meta.score !== 'number') return false;

      if (meta.isAddon)
      {
         let target = meta.score + delta;
         if (target > 5) target = 5;
         if (target < 1) target = 1;
         return rerollAddonSlotByScore(slotIndex - 1, getFallbackScoreSequence(target,
         {
            addOneFirst: delta >= 0
         }),
         {
            allowDuplicateFallback: false,
            allowKeepSameName: true
         });
      }

      let target = meta.score + delta;
      if (target > 5) target = 5;
      if (target < 0) target = 0;
      return rerollPerkSlotByScore(slotIndex - 3, getFallbackScoreSequence(target,
      {
         addOneFirst: delta >= 0
      }),
      {
         allowDuplicateFallback: true,
         allowKeepSameName: true
      });
   }

   function showCard17RewardPicker(options)
   {
      ensureCard17GuessStyles();

      const opts = options ||
      {
      };
      const maxPick = Math.max(1, Math.min(6, Number(opts.maxPick) || 1));
      const picked = [];
      const metas = [1, 2, 3, 4, 5, 6].map(getCard17RewardMeta).filter(Boolean);

      const overlay = document.createElement('div');
      overlay.id = 'card17RewardPickerOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card17-picker-panel';

      const title = document.createElement('div');
      title.className = 'card17-picker-title';
      title.textContent = opts.title || '選擇欄位';

      const sub = document.createElement('div');
      sub.className = 'card17-picker-sub';
      sub.textContent = opts.sub || (maxPick === 1 ? '請選 1 個非殺手欄位。' : `請選 ${maxPick} 個非殺手欄位。`);

      const grid = document.createElement('div');
      grid.className = 'card17-picker-grid';

      metas.forEach((meta) =>
      {
         const btn = document.createElement('button');
         btn.type = 'button';
         btn.className = 'card17-picker-btn';
         btn.innerHTML = `
        <div class="card17-picker-thumb">${meta.img ? `<img src="${meta.img}" alt="">` : ''}</div>
        <div class="card17-picker-meta">
          <div class="card17-picker-label">${meta.label}</div>
          <div class="card17-picker-name">${meta.zh || meta.name || '未知'}</div>
          <div class="card17-picker-score">目前分數：${typeof meta.score === 'number' ? meta.score : '?'}</div>
        </div>
      `;

         btn.addEventListener('click', () =>
         {
            const idx = picked.indexOf(meta.slotIndex);
            if (idx !== -1)
            {
               picked.splice(idx, 1);
               btn.classList.remove('selected');
               return;
            }
            if (picked.length >= maxPick) return;
            picked.push(meta.slotIndex);
            btn.classList.add('selected');

            if (picked.length >= maxPick)
            {
               if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
               if (typeof opts.onDone === 'function') opts.onDone(picked.slice(0, maxPick));
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

   function showCard17GuessGame(knownPerkIdx, hiddenPerkIdx, onDone)
   {
      ensureCard17GuessStyles();

      const known = getCard17PerkMetaAny(knownPerkIdx);
      const hidden = getCard17PerkMetaAny(hiddenPerkIdx);
      if (!known || !hidden)
      {
         if (typeof onDone === 'function') onDone('draw');
         return;
      }

      const overlay = document.createElement('div');
      overlay.id = 'card17GuessOverlay';
      overlay.classList.add('dbd-card-overlay');

      const panel = document.createElement('div');
      panel.classList.add('dbd-card-panel');
      panel.className = 'dbd-card-panel card17-guess-panel';

      const title = document.createElement('div');
      title.className = 'card17-guess-title';
      title.textContent = '狂賭之冤';

      const sub = document.createElement('div');
      sub.className = 'card17-guess-sub';
      sub.textContent = '左邊已知，請猜右邊技能分數比較大還是比較小。';

      const vs = document.createElement('div');
      vs.className = 'card17-guess-vs';

      const left = document.createElement('div');
      left.className = 'card17-guess-side';
      left.innerHTML = `
      <div class="card17-guess-label">已知技能</div>
      <div class="card17-guess-imgwrap">${known.img ? `<img src="${known.img}" alt="">` : ''}</div>
      <div class="card17-guess-score">${known.score}</div>
      <div class="card17-guess-name">${known.zh ? `${known.name} / ${known.zh}` : known.name}</div>
    `;

      const right = document.createElement('div');
      right.className = 'card17-guess-side';
      right.innerHTML = `
      <div class="card17-guess-label">未知技能</div>
      <div class="card17-guess-imgwrap hidden-card" id="card17HiddenImgWrap">${hidden.img ? `<img src="${hidden.img}" alt="">` : ''}</div>
      <div class="card17-guess-score hidden-score" id="card17HiddenScore">?</div>
      <div class="card17-guess-name masked" id="card17HiddenName">？？？</div>
    `;

      const mid = document.createElement('div');
      mid.className = 'card17-guess-mid';
      mid.textContent = 'VS';

      vs.appendChild(left);
      vs.appendChild(mid);
      vs.appendChild(right);

      const actions = document.createElement('div');
      actions.className = 'card17-guess-actions';

      const bigBtn = document.createElement('button');
      bigBtn.type = 'button';
      bigBtn.className = 'card17-choice-btn';
      bigBtn.textContent = '比較大';

      const smallBtn = document.createElement('button');
      smallBtn.type = 'button';
      smallBtn.className = 'card17-choice-btn';
      smallBtn.textContent = '比較小';

      actions.appendChild(bigBtn);
      actions.appendChild(smallBtn);

      const resultText = document.createElement('div');
      resultText.className = 'card17-result-text';

      const continueHint = document.createElement('div');
      continueHint.className = 'card17-continue-hint';
      continueHint.textContent = '點擊任意位置繼續';

      panel.appendChild(title);
      panel.appendChild(sub);
      panel.appendChild(vs);
      panel.appendChild(actions);
      panel.appendChild(resultText);
      panel.appendChild(continueHint);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);

      let resolved = false;
      let canContinue = false;
      let finalResult = 'draw';

      const hiddenImgWrap = right.querySelector('#card17HiddenImgWrap');
      const hiddenScoreEl = right.querySelector('#card17HiddenScore');
      const hiddenNameEl = right.querySelector('#card17HiddenName');

      function enableContinue()
      {
         canContinue = true;
         overlay.classList.add('ready');
      }

      function cleanupAndDone()
      {
         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
         if (typeof onDone === 'function') onDone(finalResult);
      }

      overlay.addEventListener('click', (e) =>
      {
         if (!canContinue) return;
         if (e.target.closest('.card17-choice-btn')) return;
         cleanupAndDone();
      });

      function handleGuess(choice)
      {
         if (resolved) return;
         resolved = true;
         bigBtn.disabled = true;
         smallBtn.disabled = true;

         hiddenImgWrap.classList.add('revealed');
         hiddenScoreEl.textContent = String(hidden.score);
         hiddenNameEl.textContent = hidden.zh ? `${hidden.name} / ${hidden.zh}` : hidden.name;
         hiddenNameEl.classList.remove('masked');

         if (hidden.score > known.score) finalResult = (choice === 'big') ? 'win' : 'lose';
         else if (hidden.score < known.score) finalResult = (choice === 'small') ? 'win' : 'lose';
         else finalResult = 'draw';

         setTimeout(() =>
         {
            resultText.classList.add('show');
            if (finalResult === 'win')
            {
               resultText.classList.add('win');
               resultText.textContent = 'WIN';
            }
            else if (finalResult === 'lose')
            {
               resultText.classList.add('lose');
               resultText.textContent = 'LOSE';
            }
            else
            {
               resultText.classList.add('draw');
               resultText.textContent = 'DRAW';
            }
            enableContinue();
         }, 380);
      }

      bigBtn.addEventListener('click', (e) =>
      {
         e.stopPropagation();
         handleGuess('big');
      });
      smallBtn.addEventListener('click', (e) =>
      {
         e.stopPropagation();
         handleGuess('small');
      });
   }

   function applyBlackjackLoss(wager)
   {
      const perks = currentState.perks.slice(), addons = currentState.addons.slice();
      let remaining = Math.max(0, Math.floor(wager));
      while (remaining > 0)
      {
         const choices = [];
         for (const kind of ['perks', 'addons'])
         {
            const names = kind === 'perks' ? perks : addons;
            const getScore = kind === 'perks' ? getPerkScore : getAddonScore;
            const floor = kind === 'perks' ? 0 : 1;
            names.forEach((name, index) =>
            {
               const score = getScore(name);
               const other = names.filter((_, i) => i !== index);
               for (let target = score - 1; target >= floor; target--)
               {
                  const cost = score - target;
                  if (cost > remaining) break;
                  const pool = (kind === 'perks' ? getPerkNamesByScores([target]) : getAddonNamesByScoresForKiller(currentState.killerKey, [target]))
                     .filter(candidate => !other.includes(candidate));
                  if (!pool.length) continue;
                  choices.push({names, index, cost, pool});
                  break;
               }
            });
         }
         if (!choices.length) break;
         const choice = getRandomItem(choices);
         choice.names[choice.index] = getRandomItem(choice.pool);
         remaining -= choice.cost;
      }
      currentState.perks = perks;
      currentState.addons = addons;
      return true;
   }
   function doScoreDownChoice(card, slotIndex)
   {
      if (!currentState || slotIndex < 1 || slotIndex > 6) return;
      const isAddon = slotIndex <= 2;
      const index = slotIndex - (isAddon ? 1 : 3);
      const kind = isAddon ? 'addons' : 'perks';
      const original = currentState[kind][index];
      const score = isAddon ? getAddonScore(original) : getPerkScore(original);
      const data = card.effect.data;
      const target = score - data.decrease;
      if (!Number.isFinite(score) || target < (isAddon ? 1 : 0))
      {
         showInfoPopup(card.zh, `此欄位無法再減 ${data.decrease} 分，請選擇其他欄位。`);
         return;
      }
      const used = new Set(currentState[kind]);
      const pool = (isAddon ? getAddonNamesByScoresForKiller(currentState.killerKey, [target]) : getPerkNamesByScores([target]))
         .filter(name => !used.has(name));
      if (!pool.length)
      {
         showInfoPopup(card.zh, `沒有可用且不重複的 ${target} 分${isAddon ? '配件' : '技能'}，請選擇其他欄位。`);
         return;
      }
      const candidates = shuffle(Array.from(new Set(pool))).slice(0, data.choices);
      const generation = roundGeneration;
      let applied = false;
      showChoiceOverlay(
      {
         type: isAddon ? 'addon' : 'perk', candidates, doubleList: candidates.length > 5, showScores: true,
         title: `${card.zh} · ${score} → ${target} 分 · ${candidates.length} 選 1`,
         onPick: name =>
         {
            if (applied || generation !== roundGeneration || !currentState || !candidates.includes(name)) return;
            applied = true; currentState[kind][index] = name; finishCardPhase();
         }
      });
   }
   function doCard44Blackjack()
   {
      if (!currentState || !window.CasinoCards || !window.BlackjackReward) return;
      const generation = roundGeneration;
      const total = currentState.perks.reduce((sum, name) => sum + (getPerkScore(name) || 0), 0)
         + currentState.addons.reduce((sum, name) => sum + (getAddonScore(name) || 0), 0);
      if (total < 1)
      {
         showInfoPopup('二十一點', '目前技能總分為 0，沒有可下注的技能點數。', () => finishCardPhase());
         return;
      }
      window.CasinoCards.open(
      {
         catalog: window.PERKS,
         maxWager: Math.min(15, total),
         tieRule: 'push',
         onComplete: (result, wager, settlement = {}) =>
         {
            if (generation !== roundGeneration || !currentState) return;
            if (result === 'win')
            {
               window.BlackjackReward.open(
               {
                  state: cloneState(currentState),
                  catalogs: {perks: window.PERKS, addons: window.ADDONS},
                  budget: wager,
                  onComplete: (chosen) =>
                  {
                     if (generation !== roundGeneration || !currentState) return;
                     currentState.perks = chosen.perks.slice();
                     currentState.addons = chosen.addons.slice();
                     finishCardPhase();
                  }
               });
               return;
            }
            if (result === 'lose') applyBlackjackLoss(Number.isInteger(settlement.lossAmount) ? settlement.lossAmount : wager);
            finishCardPhase();
         }
      });
   }

   function doCard17ScoreDuelMinigame()
   {
      if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 2) return;

      const knownCandidates = [0, 1, 2, 3]
         .map(getCard17KnownPerkMeta)
         .filter(Boolean)
         .map(meta => meta.perkIdx);

      if (knownCandidates.length < 1)
      {
         showInfoPopup('狂賭之冤', '沒有 1～4 分的技能可作為左邊明牌，無法使用。', () => finishCardPhase());
         return;
      }

      const knownPerkIdx = getRandomItem(knownCandidates);
      const hiddenCandidates = [0, 1, 2, 3]
         .filter(i => i !== knownPerkIdx && !!getCard17PerkMetaAny(i));

      if (hiddenCandidates.length < 1)
      {
         showInfoPopup('狂賭之冤', '可用技能數量不足，無法使用。', () => finishCardPhase());
         return;
      }

      const hiddenPerkIdx = getRandomItem(hiddenCandidates);

      showCard17GuessGame(knownPerkIdx, hiddenPerkIdx, (result) =>
      {
         if (result === 'win')
         {
            showCard17RewardPicker(
            {
               title: '狂賭之冤',
               sub: '你猜對了，請選 2 個非殺手欄位 +2 分。',
               maxPick: 2,
               onDone: (picked) =>
               {
                  (picked || []).forEach((slotIndex) =>
                  {
                     applyCard17DeltaToSlot(slotIndex, 2);
                     if (typeof showCard39FloatingDelta === 'function')
                     {
                        showCard39FloatingDelta(slotIndex, 2);
                     }
                  });
                  setTimeout(() => finishCardPhase(), 720);
               }
            });
            return;
         }

         if (result === 'lose')
         {
            shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2).forEach((slotIndex) =>
            {
               applyCard17DeltaToSlot(slotIndex, -2);
               if (typeof showCard39FloatingDelta === 'function')
               {
                  showCard39FloatingDelta(slotIndex, -2);
               }
            });
            setTimeout(() => finishCardPhase(), 720);
            return;
         }

         showCard17RewardPicker(
         {
            title: '狂賭之冤',
            sub: '平手，請選 1 個非殺手欄位 +1 分。',
            maxPick: 1,
            onDone: (picked) =>
            {
               (picked || []).forEach((slotIndex) =>
               {
                  applyCard17DeltaToSlot(slotIndex, 1);
                  if (typeof showCard39FloatingDelta === 'function')
                  {
                     showCard39FloatingDelta(slotIndex, 1);
                  }
               });
               setTimeout(() => finishCardPhase(), 720);
            }
         });
      });
   }

   function doCard18AverageAddons()
   {
      const killerKey = currentState.killerKey;
      if (!killerKey || !currentState.addons || currentState.addons.length < 2) return false;
      const s1 = getAddonScore(currentState.addons[0]);
      const s2 = getAddonScore(currentState.addons[1]);
      if (typeof s1 !== 'number' || typeof s2 !== 'number') return false;

      const targetScore = Math.floor((s1 + s2 + 2) / 2);
      const newAddons = buildAddonSelectionForScores(killerKey, [targetScore, targetScore],
      {
         allowDuplicateFallback: false,
         scoreFallbackSequence: () => [targetScore, targetScore - 1]
      });
      if (!newAddons) return false;

      currentState.addons = newAddons;
      return true;
   }

   function doCard20EqualizeAllScores()
   {
      const scores = currentState.addons.map(getAddonScore).concat(currentState.perks.map(getPerkScore));
      if (scores.some(s => typeof s !== 'number')) return false;
      const avg = Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
      return applyScoreToAllNonKillerSlots(avg,
      {
         addOneFirst: false
      });
   }

   function doReplaceAddonsByColor(colors)
   {
      const killerKey = currentState.killerKey;
      if (!killerKey || !colors || !colors.length) return false;

      const used = currentState.addons.slice();
      const results = [];

      for (let i = 0; i < colors.length; i++)
      {
         const color = colors[i];
         const pool = getAddonsByAliasForKiller(killerKey, color, used.concat(results));
         if (!pool.length) return false;
         const chosen = getRandomItem(pool);
         results.push(chosen);
      }

      if (results.length < 2) return false;

      const addons = currentState.addons.slice();
      for (let i = 0; i < 2; i++)
      {
         if (results[i])
         {
            addons[i] = results[i];
         }
      }
      currentState.addons = addons;
      return true;
   }

   // 配件顏色提升：白->綠->藍->紫->紅->白（循環）
   // - card26：只提升「被選擇的配件」(selectedSteps=1, otherSteps=0)
   // - card27：選擇的配件 +2，另一個 +1
   function doUpgradeAddonsColor(slotIndex, selectedSteps, otherSteps)
   {
      const killerKey = currentState.killerKey;
      if (!killerKey) return false;

      // 只允許配件格（slotIndex 1 / 2）
      if (slotIndex !== 1 && slotIndex !== 2) return false;

      const cycle = ['白配', '綠配', '藍配', '紫配', '紅配'];

      const getAddonColor = (addonName) =>
      {
         const a = window.ADDONS && window.ADDONS[addonName];
         const aliases = (a && a.aliases) || [];
         for (const c of cycle)
         {
            if (aliases.includes(c)) return c;
         }
         return null;
      };

      const advanceColor = (color, steps) =>
      {
         const idx = cycle.indexOf(color);
         if (idx === -1) return null;
         const s = ((steps % cycle.length) + cycle.length) % cycle.length;
         return cycle[(idx + s) % cycle.length];
      };

      const upgradeOne = (addonName, steps, excludeNames) =>
      {
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
      if (otherSteps && otherSteps !== 0)
      {
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

   function doUpgradeAddonsColorSplit(slotIndex, selectedSteps, otherSteps)
   {
      return doUpgradeAddonsColor(slotIndex, selectedSteps, otherSteps);
   }

   function doRerollAllAddonPerk()
   {
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

   function doBecomeWraith(data)
   {
      const killerKey = (data && data.killerKey) || 'The Wraith';
      const addonNames = (data && data.addons) || ['Windstorm - Blood', 'Bone Clapper'];

      const addonsPool = getAddonNamesForKiller(killerKey);
      if (addonsPool.length < 2) return false;

      const fixedAddons = [];
      addonNames.forEach(n =>
      {
         if (addonsPool.includes(n) && !fixedAddons.includes(n))
         {
            fixedAddons.push(n);
         }
      });

      let poolA = addonsPool.filter(n => !fixedAddons.includes(n));
      while (fixedAddons.length < 2 && poolA.length)
      {
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

   // 28 號：輪番取捨
   function doCard28BanPick()
   {
      if (!currentState || !window.BanPickCard) return;
      const generation = roundGeneration;
      window.BanPickCard.open(
      {
         catalog: window.PERKS,
         addonCatalog: Object.fromEntries(Object.entries(window.ADDONS).filter(([name, addon]) => addon && addon.killer === currentState.killerKey)),
         onComplete: (result) =>
         {
            if (generation !== roundGeneration || !currentState) return;
            currentState.perks = result.perks.slice();
            currentState.addons = result.addons.slice();
            finishCardPhase();
         }
      });
   }
   // 29 號：偷天換日（指定殺手 + 其餘重抽；技能不會抽到 5 分）
   function doCard29StealDaySwap(card)
   {
      if (!currentState) return;

      const data = (card && card.effect && card.effect.data) ? card.effect.data :
      {
      };
      const originalPerks = Array.isArray(currentState.perks) ? currentState.perks.slice() : [];

      function applyWithKiller(killerKey)
      {
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

      const killerKeys = Object.keys(window.KILLERS ||
      {});
      if (!killerKeys.length) return;

      const candidates = shuffle(Array.from(new Set(killerKeys))).slice(0, 5);
      if (!candidates.length) return;

      if (candidates.length === 1)
      {
         const ok = applyWithKiller(candidates[0]);
         if (!ok) return;
         finishCardPhase();
         return;
      }

      showChoiceOverlay(
      {
         type: 'killer',
         candidates,
         title: '選擇要指定的殺手（偷天換日）：',
         onPick: (picked) =>
         {
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
   function doCard30WatchAd(card)
   {
      if (!currentState) return;

      const data = (card && card.effect && card.effect.data) ? card.effect.data :
      {
      };
      const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
      const intervalMs = (typeof data.intervalMs === 'number' && data.intervalMs > 0) ? data.intervalMs : 1000;
      const unlockDelayMs = (typeof data.unlockDelayMs === 'number' && data.unlockDelayMs >= 0) ? data.unlockDelayMs : 1000;

      if (!images.length)
      {

         return;
      }

      const killerKey = currentState.killerKey;
      if (!killerKey)
      {

         return;
      }

      // 先播放廣告輪播（不可跳過），使用者關閉後再進入「自選技能」流程
      showAdSlideshowOverlay(
         images,
         intervalMs,
         unlockDelayMs,
         () =>
         {
            // onUnlocked：等使用者關閉後再處理獎勵
         },
         () =>
         {
            // onClose：玩家自選 4 次（每次 5 選 1）的 4–5 分技能，然後套用獎勵
            const perk45PoolAll = getPerkNamesByScores([4, 5]);
            if (!perk45PoolAll || perk45PoolAll.length < 4)
            {

               finishCardPhase();
               return;
            }

            const picked = [];

            function pickNext(round)
            {
               const remain = perk45PoolAll.filter(p => !picked.includes(p));
               const candidates = shuffle(remain).slice(0, 5); // 每次抽 5 個給玩家選
               if (!candidates.length)
               {

                  finishCardPhase();
                  return;
               }

               showChoiceOverlay(
               {
                  type: 'perk',
                  title: `選擇第 ${round} 個（4–5 分）技能：`,
                  candidates,
                  onPick: (name) =>
                  {
                     picked.push(name);

                     if (picked.length < 4)
                     {
                        pickNext(round + 1);
                        return;
                     }

                     // 配件：兩個 3 分以上（依當前殺手）
                     const currentAddons = Array.isArray(currentState.addons) ? currentState.addons.slice() : [];
                     const addonPoolBase = getAddonNamesForKiller(killerKey);

                     let addonPool = addonPoolBase.filter(a =>
                     {
                        const s = getAddonScore(a);
                        return typeof s === 'number' && s >= 3;
                     });

                     // 優先避免抽到原本的配件，若不夠再放回去
                     const addonPoolNoDup = addonPool.filter(a => !currentAddons.includes(a));
                     if (addonPoolNoDup.length >= 2) addonPool = addonPoolNoDup;

                     if (!addonPool || addonPool.length < 2)
                     {

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
   function showAdSlideshowOverlay(images, intervalMs, unlockDelayMs, onUnlocked, onClose)
   {
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

      function setImage(i)
      {
         const src = images[i];
         img.src = src || '';
      }

      function cleanup()
      {
         if (t)
         {
            clearTimeout(t);
            t = null;
         }
         document.removeEventListener('keydown', onKeyDown, true);
         overlay.removeEventListener('click', onClick, true);
         if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }

      function onKeyDown(e)
      {
         // 避免 ESC 提前關掉
         if (!canClose && (e.key === 'Escape' || e.key === 'Esc'))
         {
            e.preventDefault();
            e.stopPropagation();
         }
      }

      function onClick(e)
      {
         if (!canClose)
         {
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

      function next()
      {
         idx++;
         if (idx >= images.length)
         {
            // 已在最後一張 → 等 unlockDelayMs 後解鎖關閉
            t = setTimeout(() =>
            {
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

   let reservedRoundCards = null;
   let immunityActive = false;
   let immunityTriggered = false;
   let finishingPhase = false;
   let roundGeneration = 0;
   let originalAddonCatalog = null;

   function resetRound()
   {
      roundGeneration += 1;
      if (originalAddonCatalog)
      {
         window.ADDONS = originalAddonCatalog;
         originalAddonCatalog = null;
      }
      reservedRoundCards = null;
      immunityActive = false;
      immunityTriggered = false;
      finishingPhase = false;
      isActive = false;
      dragInfo = null;
      document.getElementById('card43ImmunityOverlay')?.remove();
      document.getElementById('starPlatinumOverlay')?.remove();
      window.WorldStopEffects?.disposeAll();
      window.BanPickCard?.disposeAll();
      window.CasinoCards?.disposeAll();
      window.BlackjackReward?.disposeAll();
   }

   function prepareRound()
   {
      resetRound();
      reservedRoundCards = window.SlotSettings?.cardsEnabled === false ? [] : pickThreeCards();
      immunityActive = reservedRoundCards.some(card => card.id === 'card43');
      if (immunityActive)
      {
         // All existing addon draw paths, including fixed-addon effects, read this round's catalog.
         originalAddonCatalog = window.ADDONS;
         window.ADDONS = Object.fromEntries(Object.entries(originalAddonCatalog || {}).filter(([name, addon]) =>
            !(addon.aliases || []).some(alias => String(alias).includes('迷因配件'))
         ));
      }
   }

   function applyImmunityBonus(selectedSlot)
   {
      const slots = [1, 2, 3, 4, 5, 6].map(getCard39SlotMeta).filter(meta => meta && typeof meta.score === 'number');
      if (!slots.length) return '沒有可重抽的欄位';
      const lowest = Math.min(...slots.map(meta => meta.score));
      const meta = selectedSlot || getRandomItem(slots.filter(slot => slot.score === lowest));
      const target = Math.min(5, meta.score + 2);
      const scores = [];
      for (let score = target; score <= 5; score++) scores.push(score);
      for (let score = target - 1; score >= meta.score; score--) scores.push(score);
      const success = meta.isAddon ? rerollAddonSlotByScore(meta.slotIndex - 1, scores,
      {
         allowKeepSameName: false
      }) : rerollPerkSlotByScore(meta.slotIndex - 3, scores,
      {
         allowKeepSameName: false
      });
      const after = getCard39SlotMeta(meta.slotIndex);
      return success ? `${meta.label}：${meta.score} 分 → ${after.score} 分` : `${meta.label} 沒有可用的重抽候選`;
   }

   function finishCardPhase()
   {
      if (finishingPhase) return;
      if (!immunityActive || immunityTriggered)
      {
         finishCardPhaseImmediately();
         return;
      }
      finishingPhase = true;
      immunityTriggered = true;
      isActive = false;
      dragInfo = null;
      clearDropHighlights();
      const generation = roundGeneration;
      const slots = [1, 2, 3, 4, 5, 6].map(getCard39SlotMeta).filter(meta => meta && typeof meta.score === 'number');
      const lowest = Math.min(...slots.map(meta => meta.score));
      const selectedSlot = getRandomItem(slots.filter(meta => meta.score === lowest));
      if (!selectedSlot)
      {
         finishCardPhaseImmediately();
         return;
      }
      // Show the completed card effect, without applying the gold-card bonus or playing its sound.
      if (window.previewCardState) window.previewCardState(cloneState(currentState));
      const source = document.querySelector('.slot-card[data-card-id="card43"]');
      const cells = document.querySelectorAll('#slotBoard .slot-cell');
      const destination = cells[selectedSlot.slotIndex];
      if (!source || !destination)
      {
         applyImmunityBonus(selectedSlot);
         finishCardPhaseImmediately();
         return;
      }
      const start = source.getBoundingClientRect();
      const target = destination.getBoundingClientRect();
      const overlay = document.createElement('div');
      overlay.id = 'card43ImmunityOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:100060;pointer-events:auto;';
      const flyingCard = source.cloneNode(true);
      flyingCard.removeAttribute('data-card-id');
      flyingCard.setAttribute('draggable', 'false');
      flyingCard.classList.add('show');
      flyingCard.style.cssText = `position:fixed;left:${start.left}px;top:${start.top}px;width:${start.width}px;height:${start.height}px;margin:0;opacity:1;transform:none;pointer-events:none;`;
      overlay.appendChild(flyingCard);
      document.body.appendChild(overlay);
      source.style.visibility = 'hidden';
      const dx = target.left + target.width / 2 - (start.left + start.width / 2);
      const dy = target.top + target.height / 2 - (start.top + start.height / 2);
      const scale = Math.min(target.width / start.width, target.height / start.height);
      setTimeout(() =>
      {
         if (generation !== roundGeneration) return;
         flyingCard.animate(
         [
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${dx * .5}px,${dy * .5 - 45}px) rotate(-8deg) scale(.8)`, opacity: 1, offset: .5 },
            { transform: `translate(${dx}px,${dy}px) rotate(0) scale(${scale})`, opacity: 1 }
         ],
         {
            duration: 800,
            fill: 'forwards',
            easing: 'ease-in-out'
         });
         setTimeout(() =>
         {
            if (generation !== roundGeneration) return;
            // Hold the gold card over the destination before breaking it into pieces.
            setTimeout(() =>
            {
               if (generation !== roundGeneration) return;
               for (let row = 0; row < 4; row++)
               {
                  for (let col = 0; col < 3; col++)
                  {
                     const left = col * 100 / 3;
                     const right = (col + 1) * 100 / 3;
                     const top = row * 25;
                     const bottom = (row + 1) * 25;
                     const shapes = [
                        `${left}% ${top}%, ${right}% ${top}%, ${left}% ${bottom}%`,
                        `${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%`
                     ];
                     shapes.forEach(shape =>
                     {
                        const shard = flyingCard.cloneNode(true);
                        shard.classList.add('card43-shard');
                        shard.style.clipPath = `polygon(${shape})`;
                        overlay.appendChild(shard);
                        const spreadX = (col - 1) * 85 + (Math.random() - .5) * 55;
                        const spreadY = (row - 1.5) * 65 + Math.random() * 65;
                        shard.animate(
                        [
                           { transform: `translate(${dx}px,${dy}px) scale(${scale})`, opacity: 1 },
                           { transform: `translate(${dx + spreadX}px,${dy + spreadY}px) rotate(${(Math.random() - .5) * 100}deg) scale(${scale * .8})`, opacity: 0 }
                        ],
                        {
                           duration: 600,
                           fill: 'forwards',
                           easing: 'ease-out'
                        });
                     });
                  }
               }
               flyingCard.style.visibility = 'hidden';
               setTimeout(() =>
               {
                  if (generation !== roundGeneration) return;
                  applyImmunityBonus(selectedSlot);
                  overlay.remove();
                  // Apply the bonus and generator sound after the shatter finishes.
                  finishCardPhaseImmediately();
               }, 600);
            }, 400);
         }, 800);
      }, 350);
   }

   function finishCardPhaseImmediately()
   {
      isActive = false;
      dragInfo = null;

      const container = document.getElementById('cardContainer');
      if (container)
      {
         container.innerHTML = '';
         container.classList.remove('card-visible');
      }

      const machineEl = document.querySelector('.slot-machine');
      if (machineEl)
      {
         machineEl.classList.add('glow');
      }

      if (typeof applyCallback === 'function')
      {
         const finalState = sanitizeAddonState(cloneState(currentState));
         applyCallback(finalState,
         {
            instant: immunityTriggered
         });
         if (window.lockSlotLever)
         {
            window.lockSlotLever(500);
         }
      }
   }

   // ==========================
   // 10.x 新增卡片：31 / 32 / 33
   // ==========================
   function getPerkKeysByAlias(aliasText)
   {
      return Object.entries(window.PERKS ||
         {})
         .filter(([_, p]) => p && Array.isArray(p.aliases) && p.aliases.includes(aliasText))
         .map(([name]) => name);
   }

   function doCard31ReplaceCurse(slotIndex)
   {
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

   function doCard32ReplaceScourge(slotIndex)
   {
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

   function doCard33WillFamily()
   {
      if (!currentState) return false;

      // 1) 找出 aliases 內含「威」的殺手
      const killerKeys = Object.keys(window.KILLERS ||
      {});
      const willKillers = killerKeys.filter(k =>
      {
         const kk = window.KILLERS && window.KILLERS[k];
         const aliases = kk && Array.isArray(kk.aliases) ? kk.aliases : [];
         return aliases.includes('威');
      });
      if (!willKillers.length) return false;

      // 2) 從候選中挑一個「至少有 2 個配件」的殺手（避免必定失敗）
      let pickedKiller = null;
      for (let i = 0; i < 50; i++)
      {
         const candidate = getRandomItem(willKillers);
         const addonPool = getAddonNamesForKiller(candidate);
         if (addonPool && addonPool.length >= 2)
         {
            pickedKiller = candidate;
            break;
         }
      }
      if (!pickedKiller) return false;

      // 3) 技能：從「所有威家殺手」的技能池抽 4 個（不重複）
      //    （DBD 每個殺手通常只有 3 個專屬技能，所以這樣才能湊滿 4 格）
      const willPerkPool = Object.entries(window.PERKS ||
         {})
         .filter(([_, p]) => p && willKillers.includes(p.killer))
         .map(([name]) => name);

      const pickedPerks = [];
      const used = new Set();

      // 先從威家技能池抽
      const shuffledWill = shuffle(Array.from(new Set(willPerkPool)));
      for (const name of shuffledWill)
      {
         if (pickedPerks.length >= 4) break;
         if (used.has(name)) continue;
         used.add(name);
         pickedPerks.push(name);
      }

      // 不足 4 個：用通用技能補滿（保底不碎卡）
      if (pickedPerks.length < 4)
      {
         const allPerks = Object.keys(window.PERKS ||
         {});
         const shuffledAll = shuffle(allPerks);
         for (const name of shuffledAll)
         {
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

   function doCard34Wishlist(card, slotIndex)
   {
      const isPerk = slotIndex >= 3 && slotIndex <= 6;
      if (!isPerk)
      {

         return;
      }
      if (!currentState || !Array.isArray(currentState.perks) || currentState.perks.length < 4)
      {

         return;
      }

      const perkIdx = slotIndex - 3;

      // 從所有殺手中找出「至少有 1 個專屬技能」的殺手
      const killerKeys = Object.keys(window.KILLERS ||
      {});
      const killersWithPerks = killerKeys.filter(k =>
      {
         for (const p of Object.values(window.PERKS ||
            {}))
         {
            if (p && p.killer === k) return true;
         }
         return false;
      });

      if (killersWithPerks.length < 1)
      {

         return;
      }

      // 隨機抽出 5 位殺手（不足就用全部）
      const candidates = shuffle(killersWithPerks).slice(0, Math.min(5, killersWithPerks.length));

      showChoiceOverlay(
      {
         type: 'killer',
         candidates,
         title: '願望清單：從 5 位殺手中選 1 位',
         largePortraits: true,
         onPick: (killerKey) =>
         {
            // 把指定技能欄位換成該殺手的隨機 1 個專屬技能
            const poolAll = Object.entries(window.PERKS ||
               {})
               .filter(([_, p]) => p && p.killer === killerKey)
               .map(([name]) => name);

            if (!poolAll.length)
            {

               return;
            }

            const currentPerks = currentState.perks.slice();
            const used = new Set(currentPerks);
            used.delete(currentPerks[perkIdx]);

            let pool = poolAll.filter(p => !used.has(p));
            if (!pool.length) pool = poolAll;

            const picked = getRandomItem(pool);
            if (!picked)
            {

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
      prepareRound,
      resetRound,
      FORCE_DRAW_CARD_IDS
   };

})();

// === Tooltip 顯示分數 PATCH（安全版）===
(function()
{
   function applyScoreTooltip()
   {
      const cells = document.querySelectorAll('.slot-cell');
      cells.forEach(cell =>
      {
         const name = cell.getAttribute('title') || '';
         let score = null;

         if (window.getPerkScore) score = getPerkScore(name);
         if (score == null && window.getAddonScore) score = getAddonScore(name);

         if (typeof score === 'number')
         {
            cell.setAttribute('title', name + '\n分數：' + score);
         }
      });
   }

   document.addEventListener('mouseover', applyScoreTooltip);
})();
;
/* END MERGED: original-card.js */
