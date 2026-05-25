// =============================================================
//  MATKA  —  script.js  (Fixed Chakri: independent rings, diamond indicator)
// =============================================================


// ── 1. DATA ───────────────────────────────────────────────────────────────

const LEFT_DATA = [
  [128, 129, 120, 130, 140], [137, 138, 139, 149, 159], [146, 147, 148, 158, 168],
  [236, 156, 157, 167, 230], [245, 237, 238, 239, 249], [290, 246, 247, 248, 258],
  [380, 345, 256, 257, 267], [470, 390, 346, 347, 348], [489, 480, 490, 356, 357],
  [560, 570, 580, 590, 456], [579, 589, 670, 680, 690], [678, 679, 689, 789, 780],
  null,
  [100, 110, 166, 112, 113], [119, 200, 229, 220, 122], [155, 228, 300, 266, 177],
  [227, 255, 337, 338, 339], [335, 336, 355, 400, 366], [344, 499, 445, 446, 447],
  [399, 660, 599, 455, 500], [588, 688, 779, 699, 799], [669, 778, 788, 770, 889],
  null,
  [777, 444, 111, 888, 555]
];

const RIGHT_DATA = [
  [123, 124, 125, 126, 127], [150, 160, 134, 135, 136], [169, 179, 170, 180, 145],
  [178, 250, 189, 234, 190], [240, 269, 260, 270, 235], [259, 278, 279, 289, 280],
  [268, 340, 350, 360, 370], [349, 359, 369, 379, 389], [358, 368, 378, 450, 460],
  [367, 458, 459, 469, 479], [457, 467, 468, 478, 569], [790, 890, 567, 568, 578],
  null,
  [114, 115, 116, 117, 118], [277, 133, 224, 144, 226], [330, 188, 233, 199, 244],
  [448, 223, 288, 225, 299], [466, 377, 440, 388, 334], [556, 449, 477, 559, 488],
  [600, 557, 558, 577, 550], [880, 566, 800, 667, 668], [899, 700, 990, 900, 677],
  null,
  [222, 999, 666, 333, 0]
];

const CHIPS_UPPER = [
  { val: 1, img: '../Assets/red1.png', size: 42 },
  { val: 10, img: '../Assets/Green10.png', size: 50 },
  { val: 25, img: '../Assets/blue25.png', size: 45 },
  { val: 50, img: '../Assets/orange50.png', size: 46 },
  { val: 100, img: '../Assets/blue100.png', size: 50 }
];

const CHIPS_LOWER = [
  { val: 500, img: '../Assets/pink500.png', size: 49 },
  { val: 1000, img: '../Assets/orange1000.png', size: 50 },
  { val: 5000, img: '../Assets/purple5000.png', size: 50 }
];


// ── 2. STATE ──────────────────────────────────────────────────────────────

// 1. Check for valid session first
const savedSession = sessionStorage.getItem('matka_user');
if (!savedSession && !window.location.href.includes('login.html')) {
  // If not logged in, force redirect to the login page at root
  window.location.href = '../login.html';
}

// 2. Load User Data
const userData = savedSession ? JSON.parse(savedSession) : { user: 'Guest', balance: 0 };

let panaBets = {};
let balance = userData.balance || 21446; // Use actual balance from API
let totalBet = 0;
let winning = 0;
let currentChip = 1;
let timerSeconds = 79;
let akdaBets = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '0': 0 };


// ── 3. GRID ───────────────────────────────────────────────────────────────

function renderGrids() {
  populateGrid('leftGrid', LEFT_DATA);
  populateGrid('rightGrid', RIGHT_DATA);
}

function populateGrid(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  let currentBlock = createBlock();
  let currentTable = createTable();
  currentBlock.appendChild(currentTable);
  container.appendChild(currentBlock);

  let rowIdx = 0;

  data.forEach(row => {
    if (row === null) {
      rowIdx = 0;
      currentBlock = createBlock();
      currentTable = createTable();
      currentBlock.appendChild(currentTable);
      container.appendChild(currentBlock);
    } else {
      const tr = document.createElement('tr');
      row.forEach((num, colIdx) => {
        const td = document.createElement('td');
        td.className = 'pana-cell-td';
        td.classList.add((colIdx + rowIdx) % 2 === 0 ? 'odd-col' : 'even-col');
        td.innerHTML = `
          <div class="pana-cell-inner">
            <span class="p-num">${String(num).padStart(3, '0')}</span>
            <span class="p-bet" id="bet-${num}"></span>
          </div>`;
        td.onclick = () => updatePanaBet(num, true);
        td.oncontextmenu = (e) => { e.preventDefault(); updatePanaBet(num, false); };
        tr.appendChild(td);
      });
      currentTable.appendChild(tr);
      rowIdx++;
    }
  });
}

function updatePanaBet(num, increase) {
  const currentBet = panaBets[num] || 0;
  let newBet = currentBet;
  if (increase) {
    newBet += currentChip;
    totalBet += currentChip;
    balance -= currentChip;
  } else {
    if (currentBet <= 0) return;
    const decr = Math.min(currentBet, currentChip);
    newBet -= decr;
    totalBet -= decr;
    balance += decr;
  }
  if (newBet > 0) panaBets[num] = newBet; else delete panaBets[num];
  updatePanaUI(num);
  updateStats();
}

function updatePanaUI(num) {
  const betEl = document.getElementById(`bet-${num}`);
  const td = betEl?.parentElement?.parentElement;
  if (!betEl) return;
  const bet = panaBets[num] || 0;
  betEl.textContent = bet > 0 ? bet : '';
  if (bet > 0) td?.classList.add('selected');
  else td?.classList.remove('selected');
}

function createBlock() {
  const div = document.createElement('div');
  div.className = 'grid-block';
  return div;
}
function createTable() {
  const table = document.createElement('table');
  table.className = 'grid-table';
  return table;
}


// ── 4. CHIPS ──────────────────────────────────────────────────────────────

function renderChips() {
  const upper = document.getElementById('chipRowUpper');
  const lower = document.getElementById('chipRowLower');
  if (!upper || !lower) return;

  CHIPS_UPPER.forEach(c => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.style.cssText = `width:${c.size}px;height:${c.size}px`;
    el.innerHTML = `<img src="${c.img}" style="width:100%;height:100%;object-fit:contain;">`;
    el.addEventListener('click', () => selectChip(c.val, el));
    upper.appendChild(el);
    if (c.val === currentChip) selectChip(c.val, el);
  });

  CHIPS_LOWER.forEach(c => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.style.cssText = `width:${c.size}px;height:${c.size}px`;
    el.innerHTML = `<img src="${c.img}" style="width:100%;height:100%;object-fit:contain;">`;
    el.addEventListener('click', () => selectChip(c.val, el));
    lower.appendChild(el);
  });

  const trash = document.createElement('div');
  trash.className = 'trash-btn';
  trash.innerHTML = `<img src="../Assets/bin image.png" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">`;
  trash.addEventListener('click', () => {
    const firstChip = document.querySelector('.chip');
    if (firstChip) firstChip.click();
  });
  lower.appendChild(trash);
}

function selectChip(val, el) {
  currentChip = val;
  document.querySelectorAll('.chip').forEach(c => {
    c.style.transform = '';
    c.style.boxShadow = '';
  });
  el.style.transform = 'scale(1.15) translateY(-5px)';
  el.style.boxShadow = '0 0 15px gold';
}


// ── 5. TIMER & SERVERSYNC ──────────────────────────────────────────────────

function serializeBets() {
  let bets = [];
  for (let num in akdaBets) {
    if (akdaBets[num] > 0) bets.push(`${num}X${akdaBets[num]}`);
  }
  for (let num in panaBets) {
    if (panaBets[num] > 0) bets.push(`${num}X${panaBets[num]}`);
  }
  return bets.join(',');
}

async function submitBets() {
  const betsStr = serializeBets();
  if (!betsStr) return;

  try {
    if (typeof API.insertData === 'function') {
      const res = await API.insertData(userData.user, betsStr, totalBet, 0, "");
      if (res && (res.status === true || res.success === true)) {
        console.log('Bets placed successfully on server!', res);
        localStorage.setItem('last_placed_bets', JSON.stringify({
          panaBets: { ...panaBets },
          akdaBets: { ...akdaBets },
          totalBet: totalBet
        }));

        // Auto print newly placed ticket
        if (res.barcodes && res.barcodes[0]) {
          try {
            const printRes = await API.reprintTicket(userData.user, res.barcodes[0]);
            if (printRes && printRes.status === true && Array.isArray(printRes.tickets) && printRes.tickets[0]) {
              printTicket(printRes.tickets[0]);
            }
          } catch (printErr) {
            console.error('Auto-print error:', printErr);
          }
        }
      } else {
        console.warn('Bet placement status false:', res.message || res);
      }
    }
  } catch (err) {
    console.error('Error placing bets on server:', err);
  }
}

async function restorePreviousBets() {
  try {
    if (typeof API.getPreviousBetHistory !== 'function') {
      console.warn('API.getPreviousBetHistory not defined, falling back to local storage.');
      restorePreviousBetsLocal();
      return;
    }

    const res = await API.getPreviousBetHistory(userData.user);
    if (res && res.status === true && res.data) {
      let betData = res.data;
      if (Array.isArray(betData)) {
        betData = betData[0];
      }
      if (!betData) {
        alert("No previous bets found for this user!");
        return;
      }

      const tckResult = betData.tck_result;
      if (!tckResult) {
        alert("No previous bets found for this user!");
        return;
      }

      // Parse the tck_result string, e.g., "0X1,1X1,2X1,3X1,4X1,5X1,6X1,7X1,8X1,9X1,128X10,100X10,222X20"
      const parsedPanaBets = {};
      const parsedAkdaBets = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '0': 0 };
      let newTotalBet = 0;

      const betPairs = tckResult.split(',');
      for (const pair of betPairs) {
        if (!pair) continue;
        const parts = pair.split('X');
        if (parts.length === 2) {
          const numStr = parts[0];
          const betAmount = parseInt(parts[1]);
          if (isNaN(betAmount)) continue;

          newTotalBet += betAmount;

          if (numStr.length === 1) {
            // It's an Akda bet
            parsedAkdaBets[numStr] = betAmount;
          } else {
            // It's a Pana bet
            parsedPanaBets[parseInt(numStr)] = betAmount;
          }
        }
      }

      if (newTotalBet > balance + totalBet) {
        alert("Insufficient balance to restore these previous bets!");
        return;
      }

      // Return currently placed bets back to balance before restoring
      balance += totalBet;

      // Update states
      panaBets = parsedPanaBets;
      akdaBets = parsedAkdaBets;
      totalBet = newTotalBet;
      balance -= totalBet;

      // Clear visual highlights first, then set new ones
      document.querySelectorAll('.pana-cell-td.selected').forEach(td => td.classList.remove('selected'));
      document.querySelectorAll('.p-bet').forEach(span => span.textContent = '');

      for (let num in panaBets) updatePanaUI(parseInt(num));
      updateAkdaUI();
      updateStats();
    } else {
      alert(res.message || "No previous bets found to restore!");
    }
  } catch (err) {
    console.error('Error fetching previous bet history:', err);
    // Fallback to local storage
    restorePreviousBetsLocal();
  }
}

function restorePreviousBetsLocal() {
  const saved = localStorage.getItem('last_placed_bets');
  if (!saved) {
    alert("No previous bets found to restore!");
    return;
  }
  const data = JSON.parse(saved);

  // Return bets to balance before clearing
  balance += totalBet;

  panaBets = { ...data.panaBets };
  akdaBets = { ...data.akdaBets };
  totalBet = data.totalBet;
  balance -= totalBet;

  // Clear visual highlights first, then set new ones
  document.querySelectorAll('.pana-cell-td.selected').forEach(td => td.classList.remove('selected'));
  document.querySelectorAll('.p-bet').forEach(span => span.textContent = '');

  for (let num in panaBets) updatePanaUI(parseInt(num));
  updateAkdaUI();
  updateStats();
}

function doubleBets() {
  let cost = 0;
  for (let num in panaBets) cost += panaBets[num];
  for (let num in akdaBets) cost += akdaBets[num];
  if (cost === 0) return;
  if (cost > balance) {
    alert("Insufficient balance to double bets!");
    return;
  }
  for (let num in panaBets) {
    panaBets[num] *= 2;
    updatePanaUI(parseInt(num));
  }
  for (let num in akdaBets) {
    akdaBets[num] *= 2;
  }
  updateAkdaUI();
  balance -= cost;
  totalBet += cost;
  updateStats();
}

function calculateWinnings(winningPanaStr) {
  let winAmount = 0;
  const digits = winningPanaStr.split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  const winningAkda = (sum % 10).toString();

  // 1. Akda
  if (akdaBets[winningAkda] > 0) {
    winAmount += akdaBets[winningAkda] * 9;
  }

  // 2. Pana/Triple
  const panaNum = parseInt(winningPanaStr);
  if (panaBets[panaNum] > 0) {
    const uniqueDigits = new Set(winningPanaStr).size;
    if (uniqueDigits === 3) {
      winAmount += panaBets[panaNum] * 150; // SP
    } else if (uniqueDigits === 2) {
      winAmount += panaBets[panaNum] * 300; // DP
    } else if (uniqueDigits === 1) {
      winAmount += panaBets[panaNum] * 1000; // Triple
    }
  }
  return winAmount;
}

window.handleSpinCompleted = function (winningPanaStr) {
  const win = calculateWinnings(winningPanaStr);
  winning = win;
  if (win > 0) {
    balance += win;
    alert(`🎉 Congratulations! You won ${win} credits!`);
  }

  // Clear active bets from screen after showing result
  setTimeout(() => {
    totalBet = 0;
    panaBets = {};
    for (let num in akdaBets) akdaBets[num] = 0;
    document.querySelectorAll('.pana-cell-td.selected').forEach(td => td.classList.remove('selected'));
    document.querySelectorAll('.p-bet').forEach(span => span.textContent = '');
    updateAkdaUI();
    updateStats();

    // Sync with the server to get the new draw time and update result history
    syncWithServerTimer();
    syncBalanceWithServer();
  }, 3000);
};

async function syncBalanceWithServer() {
  try {
    if (typeof API.getBalance === 'function' && userData.user) {
      const res = await API.getBalance(userData.user);
      let newBalance = null;
      if (res) {
        if (res.balance !== undefined) {
          newBalance = parseFloat(res.balance);
        } else if (res.data !== undefined) {
          if (res.data.balance !== undefined) {
            newBalance = parseFloat(res.data.balance);
          } else if (!isNaN(res.data)) {
            newBalance = parseFloat(res.data);
          }
        }
      }
      if (newBalance !== null && !isNaN(newBalance)) {
        balance = newBalance;
        userData.balance = balance;
        sessionStorage.setItem('matka_user', JSON.stringify(userData));
        updateStats();
      }
    }
  } catch (err) {
    console.error('Error syncing balance with server:', err);
  }
}

let isSyncingTimer = false;

async function syncWithServerTimer() {
  if (isSyncingTimer) return;
  isSyncingTimer = true;
  try {
    const data = await API.getTimer();
    if (data && data.time !== undefined) {
      const serverTime = parseInt(data.time);
      if (!isNaN(serverTime)) {
        timerSeconds = serverTime;
      }
    } else {
      if (timerSeconds === 999) {
        timerSeconds = 240; // Fallback if server fails during transition
      }
    }
  } catch (err) {
    console.error('Error syncing timer with server:', err);
    if (timerSeconds === 999) {
      timerSeconds = 240; // Fallback if server fails during transition
    }
  } finally {
    isSyncingTimer = false;
    updateResults();
  }
}

function startTimer() {
  // Sync immediately when timer starts
  syncWithServerTimer();

  setInterval(async () => {
    // Only decrement if we are not in the transition/spin holding state (999)
    if (timerSeconds !== 999) {
      timerSeconds--;
    }

    // Auto-submit bets 5 seconds before spin
    if (timerSeconds === 5) {
      await submitBets();
    }

    if (timerSeconds < 0) {
      // Temporarily set to a holding state (999) so we don't trigger multiple spins
      timerSeconds = 999;

      // Auto-trigger spin
      window.spinChakri();
    }

    // Periodically sync with the server timer to prevent client-side drift
    if (timerSeconds !== 999 && timerSeconds > 0 && timerSeconds % 15 === 0) {
      syncWithServerTimer();
    }

    // Format and display the timer countdown
    const displaySecs = timerSeconds === 999 ? 0 : timerSeconds;
    const m = Math.floor(displaySecs / 60).toString().padStart(2, '0');
    const s = (displaySecs % 60).toString().padStart(2, '0');
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
      timerDisplay.textContent = `${m}:${s}`;
    }
  }, 1000);
}


// ── 6. RESULTS ────────────────────────────────────────────────────────────

async function updateResults() {
  const resultStrip = document.getElementById('resultStrip');
  if (!resultStrip) return;

  try {
    const last6 = await API.getResultLast6();
    if (last6 && last6.status === true && last6.results && last6.results.length > 0) {
      const formatted = last6.results.map(item => {
        const val = item.result || '';
        return val.split(',')[0].trim();
      }).filter(val => val !== '');
      if (formatted.length > 0) {
        resultStrip.textContent = formatted.join('   ');
        if (typeof window.setInitialWheelResult === 'function') {
          window.setInitialWheelResult(formatted[0]);
        }
        return;
      }
    }
  } catch (err) {
    console.error('Error fetching last 6 results:', err);
  }

  // Fallback to single Result.php
  try {
    const single = await API.getResult();
    if (single && single.status === true && single.previous_result) {
      const val = single.previous_result.split(',')[0].trim();
      resultStrip.textContent = val;
      if (typeof window.setInitialWheelResult === 'function') {
        window.setInitialWheelResult(val);
      }
    }
  } catch (err) {
    console.error('Error fetching single result:', err);
  }
}


// ── 7. STATS ─────────────────────────────────────────────────────────────

function updateStats() {
  const balanceEl = document.getElementById('balanceVal');
  if (balanceEl) balanceEl.textContent = balance.toLocaleString();

  const totalBetEl = document.getElementById('totalBetVal');
  if (totalBetEl) totalBetEl.textContent = totalBet;

  const winningEl = document.getElementById('winningVal');
  if (winningEl) winningEl.textContent = winning;

  const userBadge = document.querySelector('.user-badge span');
  if (userBadge) userBadge.textContent = userData.user;

  // Toggle button text between 'BET' and 'PREV' based on totalBet
  const prevBtn = document.querySelector('.prev-btn');
  if (prevBtn) {
    if (totalBet > 0) {
      prevBtn.textContent = 'BET';
      prevBtn.classList.add('bet-mode');
    } else {
      prevBtn.textContent = 'PREV';
      prevBtn.classList.remove('bet-mode');
    }
  }
}

async function handlePrevOrBetClick() {
  const prevBtn = document.querySelector('.prev-btn');
  if (prevBtn && prevBtn.textContent === 'BET') {
    if (totalBet === 0) return;

    prevBtn.disabled = true;
    prevBtn.textContent = 'PLACING...';
    try {
      await submitBets();
      alert('🎉 Bets placed successfully!');
      clearBoardAfterBetPlacement(); // Clear the board, triggering toggle back to PREV
      syncBalanceWithServer();
    } catch (err) {
      alert('Failed to place bets. Please try again.');
    } finally {
      prevBtn.disabled = false;
      updateStats();
    }
  } else {
    await restorePreviousBets();
  }
}

function clearBoardAfterBetPlacement() {
  panaBets = {};
  for (let num in akdaBets) akdaBets[num] = 0;
  totalBet = 0;
  document.querySelectorAll('.pana-cell-td.selected').forEach(td => td.classList.remove('selected'));
  document.querySelectorAll('.p-bet').forEach(span => span.textContent = '');
  updateAkdaUI();
  updateStats();
}

function clearBets() {
  for (let num in panaBets) { panaBets[num] = 0; updatePanaUI(parseInt(num)); }
  panaBets = {};
  for (let num in akdaBets) akdaBets[num] = 0;
  updateAkdaUI();
  balance += totalBet;
  totalBet = 0;
  updateStats();
}

function updateAkdaUI() {
  document.querySelectorAll('.header-box').forEach(box => {
    const num = box.getAttribute('data-num');
    const betEl = box.querySelector('.h-bet');
    if (betEl) betEl.textContent = akdaBets[num] > 0 ? akdaBets[num] : '';
  });
}


// ── 8. CHAKRI CANVAS ENGINE ───────────────────────────────────────────────

(function () {

  const cv = document.getElementById('chakriCanvas');
  const cx = cv.getContext('2d');
  const W = 320, H = 320, MX = 160, MY = 160;

  const BEZEL_R = 155, BEZEL_W = 10;
  const R1 = 144, R2 = 103, R3 = 71, RC = 38;

  const SEGS = 10;
  const STEP = 2 * Math.PI / SEGS;  // 36° per segment

  // Numbers on each ring
  const outerN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const midN = [2, 3, 4, 5, 6, 7, 8, 9, 0, 1];
  const innN = [8, 9, 0, 1, 2, 3, 4, 5, 6, 7];

  // ── INDEPENDENT ring state ──
  let angOuter = 0;
  let angMid = Math.PI * 0.37;   // start offset so they don't all show 0
  let angInn = Math.PI * 0.71;

  let spdOuter = 0, spdMid = 0, spdInn = 0;

  // Spin phases: 0=idle, 1=spinning (constant/waiting for API), 2=decelerating, 4=done
  let phase = 0;
  let running = false;
  let resStr = '128';

  // Highlight state (set when a ring snaps)
  let outerSnapped = false, midSnapped = false, innSnapped = false;

  // Target angles, start angles and frame tracker
  let targetAngOuter = 0;
  let targetAngMid = 0;
  let targetAngInn = 0;

  let startAngOuter = 0;
  let startAngMid = 0;
  let startAngInn = 0;

  let currentFrame = 0;

  // Easing helper
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Calculate target angle when rotating anti-clockwise (decreasing angle)
  function getTargetAngleDec(currentAng, targetIdx) {
    const topA = -Math.PI / 2;
    const baseAng = topA - (targetIdx + 0.5) * STEP;
    const minRotation = 3.5 * 2 * Math.PI; // at least 3.5 spins
    let targetAng = baseAng;
    while (targetAng > currentAng - minRotation) {
      targetAng -= 2 * Math.PI;
    }
    return targetAng;
  }

  // Calculate target angle when rotating clockwise (increasing angle)
  function getTargetAngleInc(currentAng, targetIdx) {
    const topA = -Math.PI / 2;
    const baseAng = topA - (targetIdx + 0.5) * STEP;
    const minRotation = 3.5 * 2 * Math.PI; // at least 3.5 spins
    let targetAng = baseAng;
    while (targetAng < currentAng + minRotation) {
      targetAng += 2 * Math.PI;
    }
    return targetAng;
  }

  // Helper to fetch the result with retries (polling)
  async function fetchFreshResult(maxRetries = 8, interval = 500) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const res = await API.getResult();
        if (res && res.status === true && res.previous_result) {
          const val = res.previous_result.split(',')[0].trim();
          if (val.length === 3 && !isNaN(val)) {
            console.log(`Successfully fetched fresh result on attempt ${i + 1}:`, val);
            return val;
          }
        }
      } catch (err) {
        console.warn(`Attempt ${i + 1} to fetch result failed:`, err);
      }
      // Wait for next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error("Polling timeout: Fresh result not available on server");
  }

  // ── Colour helpers ──────────────────────────────────────────────────────

  function outerFill(i) {
    const g = cx.createRadialGradient(MX, MY, R2, MX, MY, R1);
    if (i % 2 === 0) {
      g.addColorStop(0, '#C83010'); g.addColorStop(0.5, '#D94518'); g.addColorStop(1, '#B02808');
    } else {
      g.addColorStop(0, '#B82808'); g.addColorStop(0.5, '#C83810'); g.addColorStop(1, '#A02206');
    }
    return g;
  }
  function midFill(i) {
    const g = cx.createRadialGradient(MX, MY, R3, MX, MY, R2);
    if (i % 2 === 0) {
      g.addColorStop(0, '#8B1A06'); g.addColorStop(0.5, '#9E2008'); g.addColorStop(1, '#7A1404');
    } else {
      g.addColorStop(0, '#7C1404'); g.addColorStop(0.5, '#8E1A06'); g.addColorStop(1, '#6C1002');
    }
    return g;
  }
  function innFill(i) {
    const g = cx.createRadialGradient(MX, MY, RC, MX, MY, R3);
    if (i % 2 === 0) {
      g.addColorStop(0, '#6A0E04'); g.addColorStop(0.5, '#7A1206'); g.addColorStop(1, '#5A0A02');
    } else {
      g.addColorStop(0, '#5C0A02'); g.addColorStop(0.5, '#6E1004'); g.addColorStop(1, '#4E0802');
    }
    return g;

  }



  // ── Ring drawing ──────────────────────────────────────────────────────

  function drawRing(nums, ro, ri, fillFn, currentAng, highlightIdx) {
    for (let i = 0; i < SEGS; i++) {
      const a0 = currentAng + i * STEP, a1 = a0 + STEP;
      cx.beginPath(); cx.moveTo(MX, MY); cx.arc(MX, MY, ro, a0, a1); cx.closePath();
      cx.fillStyle = fillFn(i); cx.fill();
    }
    // Dividers
    for (let i = 0; i < SEGS; i++) {
      const a0 = currentAng + i * STEP;
      cx.beginPath();
      cx.moveTo(MX + ri * Math.cos(a0), MY + ri * Math.sin(a0));
      cx.lineTo(MX + ro * Math.cos(a0), MY + ro * Math.sin(a0));
      cx.strokeStyle = 'rgba(255,220,100,0.25)'; cx.lineWidth = 1; cx.stroke();
    }
    // Numbers
    for (let i = 0; i < SEGS; i++) {
      const ma = currentAng + i * STEP + STEP / 2;
      const tr = (ro + ri) / 2;
      const tx = MX + tr * Math.cos(ma), ty = MY + tr * Math.sin(ma);
      cx.save();
      cx.translate(tx, ty); cx.rotate(ma + Math.PI / 2);
      cx.fillStyle = '#ffffff';
      cx.font = 'bold 20px "Times New Roman", serif';
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.shadowColor = 'rgba(0,0,0,0.95)'; cx.shadowBlur = 5;
      cx.fillText(nums[i], 0, 0);
      cx.restore();
    }
    // Highlight the snapped segment in gold
    if (highlightIdx !== null && highlightIdx !== undefined) {
      const a0 = currentAng + highlightIdx * STEP, a1 = a0 + STEP;
      cx.beginPath();
      cx.arc(MX, MY, ro, a0, a1); cx.arc(MX, MY, ri, a1, a0, true);
      cx.closePath();
      cx.fillStyle = 'rgba(255, 220, 30, 0.22)';
      cx.fill();
      cx.strokeStyle = 'rgba(255,220,30,0.7)'; cx.lineWidth = 2; cx.stroke();
    }
  }

  function goldBand(r, w) {
    const g = cx.createRadialGradient(MX, MY, r - w, MX, MY, r + w);
    g.addColorStop(0, '#3a2000'); g.addColorStop(0.15, '#c89010');
    g.addColorStop(0.35, '#ffe566'); g.addColorStop(0.5, '#f5c018');
    g.addColorStop(0.65, '#ffe566'); g.addColorStop(0.85, '#c89010');
    g.addColorStop(1, '#3a2000');
    cx.beginPath(); cx.arc(MX, MY, r, 0, 2 * Math.PI);
    cx.strokeStyle = g; cx.lineWidth = w * 2; cx.stroke();
  }

  function drawOuterBezel() {
    const g = cx.createRadialGradient(MX, MY, BEZEL_R - BEZEL_W / 2, MX, MY, BEZEL_R + BEZEL_W / 2);
    g.addColorStop(0, '#3a2000'); g.addColorStop(0.12, '#c89010');
    g.addColorStop(0.35, '#ffe566'); g.addColorStop(0.5, '#f5c018');
    g.addColorStop(0.65, '#ffe566'); g.addColorStop(0.88, '#c89010');
    g.addColorStop(1, '#3a2000');
    cx.beginPath(); cx.arc(MX, MY, BEZEL_R, 0, 2 * Math.PI);
    cx.strokeStyle = g; cx.lineWidth = BEZEL_W; cx.stroke();
    cx.beginPath(); cx.arc(MX, MY, BEZEL_R - BEZEL_W / 2 - 1, 0, 2 * Math.PI);
    cx.strokeStyle = 'rgba(255,240,100,0.55)'; cx.lineWidth = 1.2; cx.stroke();
    cx.beginPath(); cx.arc(MX, MY, BEZEL_R + BEZEL_W / 2 - 1, 0, 2 * Math.PI);
    cx.strokeStyle = 'rgba(120,80,0,0.5)'; cx.lineWidth = 1; cx.stroke();
  }

  function drawCenter() {
    // 1. Outer Golden Rim (Bezel)
    const rimR = RC + 6;
    const rimG = cx.createRadialGradient(MX, MY, RC, MX, MY, rimR);
    rimG.addColorStop(0, '#3a2000');
    rimG.addColorStop(0.2, '#c89010');
    rimG.addColorStop(0.5, '#fff5a0');
    rimG.addColorStop(0.8, '#c89010');
    rimG.addColorStop(1, '#3a2000');

    cx.beginPath(); cx.arc(MX, MY, rimR, 0, 2 * Math.PI);
    cx.fillStyle = rimG; cx.fill();
    cx.strokeStyle = 'rgba(0,0,0,0.5)'; cx.lineWidth = 1; cx.stroke();

    // 2. White Marble Ball
    const ballG = cx.createRadialGradient(MX - RC * 0.3, MY - RC * 0.3, 2, MX, MY, RC);
    ballG.addColorStop(0, '#ffffff');      // bright shine
    ballG.addColorStop(0.3, '#f5f5f0');    // surface
    ballG.addColorStop(0.7, '#e0ddd0');    // subtle marble tone
    ballG.addColorStop(1, '#c0baa0');      // bottom shadow

    cx.beginPath(); cx.arc(MX, MY, RC, 0, 2 * Math.PI);
    cx.fillStyle = ballG; cx.fill();

    // Subtle inner stroke for the ball
    cx.beginPath(); cx.arc(MX, MY, RC, 0, 2 * Math.PI);
    cx.strokeStyle = 'rgba(139, 100, 0, 0.3)'; cx.lineWidth = 2; cx.stroke();

    // 3. Typography (Bold Serif)
    cx.fillStyle = '#000000';
    cx.font = 'bold 28px "Times New Roman", serif';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';

    // Slight shadow for depth
    cx.shadowColor = 'rgba(0,0,0,0.2)';
    cx.shadowOffsetX = 1; cx.shadowOffsetY = 1;
    cx.shadowBlur = 2;

    cx.fillText(resStr, MX, MY + 1);

    // Reset shadow
    cx.shadowColor = 'transparent'; cx.shadowOffsetX = 0; cx.shadowOffsetY = 0; cx.shadowBlur = 0;
  }

  // ── Bead helper ──────────────────────────────────────────────────────

  function bead(x, y, r, glow) {
    r = r || 3.5;
    const bg = cx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.05, x, y, r);
    const base = 200 + 55 * glow;
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.25, `rgb(255,255,${Math.round(base)})`);
    bg.addColorStop(0.6, '#ddd8c8');
    bg.addColorStop(0.85, '#bbb090');
    bg.addColorStop(1, '#888060');
    cx.beginPath(); cx.arc(x, y, r, 0, 2 * Math.PI); cx.fillStyle = bg; cx.fill();
    if (glow > 0.5) {
      cx.beginPath(); cx.arc(x, y, r + 1, 0, 2 * Math.PI);
      cx.strokeStyle = `rgba(255,255,200,${(glow - 0.5) * 0.4})`;
      cx.lineWidth = 1; cx.stroke();
    }
  }

  // ── DIAMOND indicator ─────────────────────────────────────────────────
  //
  //  Shape:  4 sides of beads forming a diamond (rhombus) outline
  //  at the 12-o'clock position, spanning all three rings:
  //
  //       * * * * *     ← top arc  (outer rim, R1)
  //      *         *    ← left/right straight lines along segment edges
  //     *           *
  //      *         *    ← mid-level vertex  (R3)
  //       *       *
  //        *     *
  //         * * *       ← bottom arc (inner rim, RC+6)

  function drawDiamond() {
    const topA = -Math.PI / 2;          // 12-o'clock
    const halfW = STEP / 2;              // half-width of one segment (18°)
    const leftA = topA - halfW;
    const rightA = topA + halfW;

    const time = Date.now() / 140;
    const N = 14;   // beads per straight side

    // ── 1. Top arc along outer rim (R1) ──────────────────────────────
    const arcN = 10;
    for (let i = 0; i <= arcN; i++) {
      const t = i / arcN;
      const a = leftA + t * (rightA - leftA);
      const g = (Math.sin(time + i * 0.6) + 1) / 2;
      bead(MX + R1 * Math.cos(a), MY + R1 * Math.sin(a), 3.4, g);
    }

    // ── 2. Left side: outer-rim corner → inner-rim corner (straight) ─
    const lx0 = MX + R1 * Math.cos(leftA), ly0 = MY + R1 * Math.sin(leftA);
    const lx1 = MX + (RC + 6) * Math.cos(leftA), ly1 = MY + (RC + 6) * Math.sin(leftA);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const g = (Math.sin(time - i * 0.35) + 1) / 2;
      bead(lx0 + (lx1 - lx0) * t, ly0 + (ly1 - ly0) * t, 3.4 * (1 - t * 0.25), g);
    }

    // ── 3. Bottom arc along inner rim (RC+6) ─────────────────────────
    for (let i = 0; i <= arcN; i++) {
      const t = i / arcN;
      const a = leftA + t * (rightA - leftA);
      const g = (Math.sin(time + i * 0.6 + 1.5) + 1) / 2;
      bead(MX + (RC + 6) * Math.cos(a), MY + (RC + 6) * Math.sin(a), 2.8, g);
    }

    // ── 4. Right side: inner-rim corner → outer-rim corner (straight) ─
    const rx0 = MX + R1 * Math.cos(rightA), ry0 = MY + R1 * Math.sin(rightA);
    const rx1 = MX + (RC + 6) * Math.cos(rightA), ry1 = MY + (RC + 6) * Math.sin(rightA);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const g = (Math.sin(time - i * 0.35) + 1) / 2;
      bead(rx1 + (rx0 - rx1) * t, ry1 + (ry0 - ry1) * t, 3.4 * (1 - ((N - i) / N) * 0.25), g);
    }


  }

  // ── Utility: snap an angle so a segment midpoint sits at 12-o'clock ─

  function snapToSegment(ang) {
    const topA = -Math.PI / 2;
    // Normalise so theta is in [0, 2π)
    const theta = ((topA - ang - STEP / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const i = Math.round(theta / STEP) % SEGS;
    return topA - (i + 0.5) * STEP;
  }

  function getIdxAtTop(ang) {
    const topA = -Math.PI / 2;
    const theta = ((topA - ang - STEP / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    return Math.round(theta / STEP) % SEGS;
  }

  // ── Main render ──────────────────────────────────────────────────────

  function frame() {
    cx.clearRect(0, 0, W, H);
    drawOuterBezel();

    cx.save();
    cx.beginPath(); cx.arc(MX, MY, R1, 0, 2 * Math.PI); cx.clip();

    // Each ring uses its own independent angle
    // Highlight index is only set once a ring has snapped
    const idxO = outerSnapped ? getIdxAtTop(angOuter) : null;
    const idxM = midSnapped ? getIdxAtTop(angMid) : null;
    const idxI = innSnapped ? getIdxAtTop(angInn) : null;

    //const id1=innSnapped ? get getIdxAtTop(angInn) : null;

    // Outer ring spins anti-clockwise (decreasing angle)
    drawRing(outerN, R1, R2, outerFill, angOuter, idxO);
    // Mid ring spins clockwise (increasing angle) — opposite direction
    drawRing(midN, R2, R3, midFill, angMid, idxM);
    // Inner ring spins anti-clockwise
    drawRing(innN, R3, RC, innFill, angInn, idxI);

    cx.restore();

    goldBand(R2, 3.5);
    goldBand(R3, 2.8);
    drawCenter();
    drawDiamond();   // ← diamond indicator always visible at 12-o'clock
  }

  // ── Phase-based animation loop ────────────────────────────────────────
  //
  //  Phase 1 → all three rings spinning
  //  Phase 2 → outer snapped, mid+inner still spinning
  //  Phase 3 → mid  snapped, inner still spinning
  //  Phase 4 → inner snapped → done

  function animLoop() {
    if (!running) return;

    if (phase === 1) {
      // Phase 1: Constant speed spin waiting for API result to resolve
      angOuter -= spdOuter;
      angMid += spdMid;
      angInn -= spdInn;

    } else if (phase === 2) {
      // Phase 2: Decelerating using easeOutCubic to target angles
      currentFrame++;

      // Outer ring: stops in 120 frames
      const tO = Math.min(1, currentFrame / 120);
      angOuter = startAngOuter + (targetAngOuter - startAngOuter) * easeOutCubic(tO);
      if (tO >= 1) {
        outerSnapped = true;
      }

      // Mid ring: stops in 180 frames
      const tM = Math.min(1, currentFrame / 180);
      angMid = startAngMid + (targetAngMid - startAngMid) * easeOutCubic(tM);
      if (tM >= 1) {
        midSnapped = true;
      }

      // Inner ring: stops in 240 frames
      const tI = Math.min(1, currentFrame / 240);
      angInn = startAngInn + (targetAngInn - startAngInn) * easeOutCubic(tI);
      if (tI >= 1) {
        innSnapped = true;
      }

      // When the last ring stops, we are complete
      if (tI >= 1) {
        phase = 4;
        running = false;

        const iO = getIdxAtTop(angOuter);
        const iM = getIdxAtTop(angMid);
        const iI = getIdxAtTop(angInn);
        resStr = `${outerN[iO]}${midN[iM]}${innN[iI]}`;

        document.getElementById('resultStrip').textContent =
          '🎯 Result: ' + resStr;

        if (typeof window.handleSpinCompleted === 'function') {
          window.handleSpinCompleted(resStr);
        }

        frame();              // one final clean draw
        setTimeout(frame, 50);
        return;
      }
    }

    frame();
    requestAnimationFrame(animLoop);
  }

  // ── Public spin API ──────────────────────────────────────────────────

  window.spinChakri = function () {
    if (running) return;

    running = true;
    phase = 1;
    resStr = '?';
    outerSnapped = false;
    midSnapped = false;
    innSnapped = false;

    // Phase 1 constant speeds
    spdOuter = 0.15;
    spdMid = 0.17;
    spdInn = 0.19;

    // Fetch the result from API with polling (retry)
    let targetResultPromise = fetchFreshResult(8, 500)
      .catch(err => {
        console.warn("Failed to fetch fresh result, using random board fallback:", err);
        const allValidPanas = [...LEFT_DATA.flat(), ...RIGHT_DATA.flat()].filter(n => n !== null);
        const fallbackNum = allValidPanas[Math.floor(Math.random() * allValidPanas.length)];
        const val = String(fallbackNum).padStart(3, '0');
        console.log("Spin targeting fallback result:", val);
        return val;
      });

    targetResultPromise.then(result => {
      const targetIdxO = outerN.indexOf(parseInt(result[0]));
      const targetIdxM = midN.indexOf(parseInt(result[1]));
      const targetIdxI = innN.indexOf(parseInt(result[2]));

      startAngOuter = angOuter;
      startAngMid = angMid;
      startAngInn = angInn;

      targetAngOuter = getTargetAngleDec(startAngOuter, targetIdxO);
      targetAngMid = getTargetAngleInc(startAngMid, targetIdxM);
      targetAngInn = getTargetAngleDec(startAngInn, targetIdxI);

      currentFrame = 0;
      phase = 2;
    });

    animLoop();
  };

  window.setInitialWheelResult = function (result) {
    if (running) return;
    if (result && result.length === 3 && !isNaN(result)) {
      resStr = result;
      const targetIdxO = outerN.indexOf(parseInt(result[0]));
      const targetIdxM = midN.indexOf(parseInt(result[1]));
      const targetIdxI = innN.indexOf(parseInt(result[2]));

      const topA = -Math.PI / 2;
      angOuter = topA - (targetIdxO + 0.5) * STEP;
      angMid = topA - (targetIdxM + 0.5) * STEP;
      angInn = topA - (targetIdxI + 0.5) * STEP;

      frame();
    }
  };

  // ── Boot ─────────────────────────────────────────────────────────────

  frame();                                    // static first draw
  // ⚠️ REMOVED: Mock spin triggers that conflict with the countdown timer and cause false winning alerts on refresh.
  // setTimeout(() => window.spinChakri(), 1500);
  // setInterval(() => window.spinChakri(), 45000);

})();


// ── 9. INIT ───────────────────────────────────────────────────────────────

function initApp() {
  renderGrids();
  renderChips();
  startTimer();
  updateResults();
  syncBalanceWithServer();
  updateStats();

  const clearBtn = document.querySelector('.clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', clearBets);

  const prevBtn = document.querySelector('.prev-btn');
  if (prevBtn) prevBtn.addEventListener('click', handlePrevOrBetClick);

  const doubleBtn = document.querySelector('.double-btn');
  if (doubleBtn) doubleBtn.addEventListener('click', doubleBets);

  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to log out?')) {
        try {
          const userId = userData.id || "";
          await API.logout(userId);
        } catch (err) {
          console.error('Logout failed:', err);
        }
        sessionStorage.removeItem('matka_user');
        window.location.href = '../login.html';
      }
    });
  }

  const limitBar = document.getElementById('limitBar');
  const sideAkda = document.querySelector('.side-akda');

  if (sideAkda && limitBar) {
    sideAkda.onclick = () => {
      limitBar.style.display = 'block';
      limitBar.textContent = 'Akda Min : 5 Max : 10000';
      for (let num in akdaBets) updateAkdaBet(num, true);
    };
    sideAkda.oncontextmenu = (e) => {
      e.preventDefault();
      limitBar.style.display = 'block';
      limitBar.textContent = 'Akda Min : 5 Max : 10000';
      for (let num in akdaBets) updateAkdaBet(num, false);
    };
  }

  const sideSP = document.querySelector('.side-sp');
  const sideDP = document.querySelector('.side-dp');
  const sideTriple = document.querySelector('.side-triple');

  if (sideSP) {
    const allPana = () => [...LEFT_DATA.flat(), ...RIGHT_DATA.flat()].filter(n => n !== null);
    sideSP.onclick = () => {
      limitBar.style.display = 'block'; limitBar.textContent = 'SP Min : 5 Max : 5000';
      allPana().forEach(num => { if (new Set(String(num).padStart(3, '0')).size === 3) updatePanaBet(num, true); });
    };
    sideSP.oncontextmenu = (e) => {
      e.preventDefault();
      limitBar.style.display = 'block'; limitBar.textContent = 'SP Min : 5 Max : 5000';
      allPana().forEach(num => { if (new Set(String(num).padStart(3, '0')).size === 3) updatePanaBet(num, false); });
    };

  }

  if (sideDP) {
    const allPana = () => [...LEFT_DATA.flat(), ...RIGHT_DATA.flat()].filter(n => n !== null);
    sideDP.onclick = () => {
      limitBar.style.display = 'block'; limitBar.textContent = 'DP Min : 5 Max : 2500';
      allPana().forEach(num => { if (new Set(String(num).padStart(3, '0')).size === 2) updatePanaBet(num, true); });
    };
    sideDP.oncontextmenu = (e) => {
      e.preventDefault();
      limitBar.style.display = 'block'; limitBar.textContent = 'DP Min : 5 Max : 2500';
      allPana().forEach(num => { if (new Set(String(num).padStart(3, '0')).size === 2) updatePanaBet(num, false); });
    };
  }

  if (sideTriple) {
    const allPana = () => [...LEFT_DATA.flat(), ...RIGHT_DATA.flat()].filter(n => n !== null);
    sideTriple.onclick = () => {
      limitBar.style.display = 'block'; limitBar.textContent = 'Triple Min : 5 Max : 1000';
      allPana().forEach(num => { if (new Set(String(num).padStart(3, '0')).size === 1) updatePanaBet(num, true); });
    };
    sideTriple.oncontextmenu = (e) => {
      e.preventDefault();
      limitBar.style.display = 'block'; limitBar.textContent = 'Triple Min : 5 Max : 1000';
      allPana().forEach(num => { if (new Set(String(num).padStart(3, '0')).size === 1) updatePanaBet(num, false); });
    };
  }

  document.querySelectorAll('.header-box').forEach(box => {
    const num = box.getAttribute('data-num');
    box.onclick = (e) => { e.stopPropagation(); updateAkdaBet(num, true); };
    box.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); updateAkdaBet(num, false); };
  });

  // Initialize Info Modal
  initInfoModal();
}

function updateAkdaBet(num, increase) {
  const currentBet = akdaBets[num] || 0;
  if (increase) {
    akdaBets[num] += currentChip;
    totalBet += currentChip;
    balance -= currentChip;
  } else {
    if (currentBet <= 0) return;
    const decr = Math.min(currentBet, currentChip);
    akdaBets[num] -= decr;
    totalBet -= decr;
    balance += decr;

  }
  updateAkdaUI();
  updateStats();
}

// ── 10. INFO MODAL SYSTEM ──────────────────────────────────────────────────

let selectedTicketBarcode = null;

function initInfoModal() {
  const infoBtn = document.querySelector('.info-btn');
  const infoOverlay = document.getElementById('infoModalOverlay');
  const closeBtn = document.getElementById('infoModalClose');

  if (!infoBtn || !infoOverlay || !closeBtn) return;

  // Set default dates to today
  const todayStr = new Date().toISOString().split('T')[0];
  const elements = ['historyFromDate', 'historyToDate', 'netFromDate', 'netToDate'];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = todayStr;
  });

  // Open modal
  infoBtn.addEventListener('click', () => {
    infoOverlay.classList.add('show');
    // Load initial tab data
    loadActiveTab();
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    infoOverlay.classList.remove('show');
  });

  infoOverlay.addEventListener('click', (e) => {
    if (e.target === infoOverlay) {
      infoOverlay.classList.remove('show');
    }
  });

  // Tab switching
  const tabButtons = document.querySelectorAll('.info-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.info-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const content = document.getElementById(tabId);
      if (content) content.classList.add('active');

      loadActiveTab();
    });
  });

  // Event handlers for filters
  const btnHistoryView = document.getElementById('btnHistoryView');
  if (btnHistoryView) {
    btnHistoryView.addEventListener('click', loadHistory);
  }

  const btnHistoryRefresh = document.getElementById('btnHistoryRefresh');
  if (btnHistoryRefresh) {
    btnHistoryRefresh.addEventListener('click', loadHistory);
  }

  const btnNetView = document.getElementById('btnNetView');
  if (btnNetView) {
    btnNetView.addEventListener('click', loadNetSummary);
  }

  // Cancel Ticket Form Submit
  const btnCancelTicketSubmit = document.getElementById('btnCancelTicketSubmit');
  if (btnCancelTicketSubmit) {
    btnCancelTicketSubmit.addEventListener('click', submitDirectCancel);
  }

  const btnCancelRefresh = document.getElementById('btnCancelRefresh');
  if (btnCancelRefresh) {
    btnCancelRefresh.addEventListener('click', loadCurrentDrawHistory);
  }

  // Footer action buttons
  const btnHistoryDetails = document.getElementById('btnHistoryDetails');
  if (btnHistoryDetails) {
    btnHistoryDetails.addEventListener('click', handleHistoryDetails);
  }

  const btnHistoryReprint = document.getElementById('btnHistoryReprint');
  if (btnHistoryReprint) {
    btnHistoryReprint.addEventListener('click', handleHistoryReprint);
  }

  const btnHistoryClaim = document.getElementById('btnHistoryClaim');
  if (btnHistoryClaim) {
    btnHistoryClaim.addEventListener('click', handleHistoryClaim);
  }
}

function loadActiveTab() {
  const activeTabBtn = document.querySelector('.info-tab-btn.active');
  if (!activeTabBtn) return;
  const tabId = activeTabBtn.getAttribute('data-tab');

  if (tabId === 'tab-history') {
    loadHistory();
  } else if (tabId === 'tab-cancel') {
    loadCurrentDrawHistory();
  } else if (tabId === 'tab-net-pay') {
    loadNetSummary();
  }
}

async function loadHistory() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9" style="padding: 20px; color: var(--gold-light);">LOADING TICKETS...</td></tr>';
  selectedTicketBarcode = null;

  try {
    const fromDateEl = document.getElementById('historyFromDate');
    const toDateEl = document.getElementById('historyToDate');
    const fromDateVal = fromDateEl ? fromDateEl.value : new Date().toISOString().split('T')[0];
    const toDateVal = toDateEl ? toDateEl.value : fromDateVal;

    // Parse dates
    const start = new Date(fromDateVal);
    const end = new Date(toDateVal);
    const dates = [];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      dates.push(fromDateVal);
    } else {
      // Limit range to max 7 days to prevent heavy API load
      let current = new Date(start);
      let limit = 0;
      while (current <= end && limit < 7) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
        limit++;
      }
    }

    // Fetch history for each date in parallel
    const promises = dates.map(d => API.getBetHistory(userData.user, d));
    const results = await Promise.all(promises);

    let allTickets = [];
    results.forEach((res, idx) => {
      if (res && res.status === true && Array.isArray(res.tickets)) {
        const recordDate = dates[idx];
        res.tickets.forEach(ticket => {
          ticket.recordDate = recordDate;
        });
        allTickets = allTickets.concat(res.tickets);
      }
    });

    // Fetch results to populate the RESULT column for today's tickets
    let resultsMap = {};
    try {
      const last6 = await API.getResultLast6();
      if (last6 && last6.status === true && Array.isArray(last6.results)) {
        last6.results.forEach(item => {
          if (item.time && item.result) {
            const cleanedVal = item.result.split(',')[0].trim();
            resultsMap[item.time] = cleanedVal;
          }
        });
      }
    } catch (err) {
      console.error('Error pre-fetching results for history:', err);
    }

    // Sort tickets by bet_time descending (newest first)
    allTickets.sort((a, b) => {
      const parseDateTime = (timeStr, dateStr) => {
        if (!timeStr || !dateStr) return 0;
        const match = timeStr.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return new Date(dateStr).getTime();
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const ampm = match[4].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const d = new Date(dateStr);
        d.setHours(hours, minutes, seconds, 0);
        return d.getTime();
      };
      return parseDateTime(b.bet_time, b.recordDate) - parseDateTime(a.bet_time, a.recordDate);
    });

    tbody.innerHTML = '';

    if (allTickets.length > 0) {
      allTickets.forEach(ticket => {
        const tr = document.createElement('tr');
        const barcode = ticket.barcode || ticket.ticket_id || ticket.id || "";
        tr.setAttribute('data-barcode', barcode);
        tr.setAttribute('data-ticket', JSON.stringify(ticket));

        // Determine status
        let status = 'Pending';
        const winAmt = parseFloat(ticket.win_amt || 0);
        if (winAmt > 0) {
          status = (ticket.claim_status === '1' || ticket.claim_status === 1) ? 'Claimed' : 'Won';
        } else {
          // Compare draw time to current time
          if (ticket.draw_times && ticket.recordDate) {
            const match = ticket.draw_times.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
              let hours = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const ampm = match[3].toUpperCase();
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
              const drawDate = new Date(ticket.recordDate);
              drawDate.setHours(hours, minutes, 0, 0);
              if (new Date() > drawDate) {
                status = 'Lost';
              }
            }
          }
        }

        // Get result
        const resultVal = resultsMap[ticket.draw_times] || "N/A";

        tr.innerHTML = `
          <td>${barcode}</td>
          <td>${ticket.id || "N/A"}</td>
          <td style="color: var(--gold-light);">${ticket.amount || 0}</td>
          <td style="color: #39FF14;">${ticket.win_amt || 0}</td>
          <td>${ticket.draw_times || "N/A"}</td>
          <td style="color: ${status === 'Won' || status === 'Claimed' ? '#39FF14' : (status === 'Lost' ? '#ff3333' : '#fff')};">${status}</td>
          <td style="color: var(--gold-light);">${resultVal}</td>
          <td>${ticket.draw_times || "N/A"}</td>
          <td>${ticket.bet_time || "N/A"}</td>
        `;

        tr.addEventListener('click', () => {
          document.querySelectorAll('.history-table tbody tr').forEach(r => r.classList.remove('selected'));
          tr.classList.add('selected');
          selectedTicketBarcode = barcode;
        });

        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="9" style="padding: 20px; color: #aaa;">NO RECORDS FOUND FOR THIS RANGE</td></tr>';
    }
  } catch (err) {
    console.error('Error loading bet history:', err);
    tbody.innerHTML = '<tr><td colspan="9" style="padding: 20px; color: #ff3333;">FAILED TO LOAD BET HISTORY</td></tr>';
  }
}

async function loadNetSummary() {
  const saleEl = document.getElementById('netTotalSale');
  const winEl = document.getElementById('netTotalWin');
  const commEl = document.getElementById('netTotalCommission');
  const netEl = document.getElementById('netToPayValue');

  if (!saleEl || !winEl || !commEl || !netEl) return;

  saleEl.textContent = '...';
  winEl.textContent = '...';
  commEl.textContent = '...';
  netEl.textContent = '...';

  try {
    const fromDateVal = document.getElementById('netFromDate')?.value || new Date().toISOString().split('T')[0];
    const toDateVal = document.getElementById('netToDate')?.value || new Date().toISOString().split('T')[0];

    const res = await API.getGameWiseReport(userData.user, fromDateVal, toDateVal);
    if (res && res.status === true) {
      const totals = res.grand_totals || {};
      saleEl.textContent = parseFloat(totals.total_sale || totals.amount || 0).toLocaleString();
      winEl.textContent = parseFloat(totals.total_win || totals.winning || 0).toLocaleString();
      commEl.textContent = parseFloat(totals.total_commission || totals.commission || 0).toLocaleString();
      netEl.textContent = parseFloat(totals.net_to_pay || totals.net || 0).toLocaleString();
    } else {
      saleEl.textContent = '0';
      winEl.textContent = '0';
      commEl.textContent = '0';
      netEl.textContent = '0';
    }
  } catch (err) {
    console.error('Error loading net summary:', err);
    saleEl.textContent = 'ERROR';
    winEl.textContent = 'ERROR';
    commEl.textContent = 'ERROR';
    netEl.textContent = 'ERROR';
  }
}

async function submitDirectCancel() {
  const input = document.getElementById('cancelTicketIdInput');
  const statusMsg = document.getElementById('cancelStatusMsg');
  if (!input || !statusMsg) return;

  const ticketId = input.value.trim();
  if (!ticketId) {
    showCancelStatus('Please enter a Ticket ID', false);
    return;
  }

  statusMsg.className = 'status-msg';
  statusMsg.textContent = 'CANCELLING TICKET...';

  try {
    const res = await API.cancelTicket(userData.user, ticketId);
    if (res && (res.status === true || res.success === true)) {
      showCancelStatus(res.message || 'Ticket cancelled successfully!', true);
      input.value = '';
      syncBalanceWithServer();
      loadCurrentDrawHistory(); // Reload current draw tickets list
    } else {
      showCancelStatus(res.message || 'Failed to cancel ticket.', false);
    }
  } catch (err) {
    console.error('Error cancelling ticket:', err);
    showCancelStatus('Server error during ticket cancellation.', false);
  }
}

function showCancelStatus(msg, isSuccess) {
  const statusMsg = document.getElementById('cancelStatusMsg');
  if (!statusMsg) return;
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg ' + (isSuccess ? 'success' : 'error');
}

async function loadCurrentDrawHistory() {
  const tbody = document.getElementById('cancelTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; color: var(--gold-light);">LOADING ACTIVE TICKETS...</td></tr>';

  try {
    const res = await API.getCurrentDrawHistory(userData.user);
    tbody.innerHTML = '';

    if (res && res.status === true && Array.isArray(res.tickets) && res.tickets.length > 0) {
      res.tickets.forEach(ticket => {
        const tr = document.createElement('tr');
        const barcode = ticket.barcode || "";
        const ticketId = ticket.id;
        tr.setAttribute('data-barcode', barcode);
        tr.setAttribute('data-ticket-id', ticketId);
        tr.setAttribute('data-ticket', JSON.stringify(ticket));

        tr.innerHTML = `
          <td>${barcode}</td>
          <td>${ticketId || "N/A"}</td>
          <td style="color: var(--gold-light);">${ticket.amount || 0}</td>
          <td>${ticket.draw_time || ticket.draw_times || "N/A"}</td>
          <td>${ticket.bet_time || ticket.tck_time || "N/A"}</td>
          <td>
            <button class="action-submit-btn inline-cancel-btn" data-ticket-id="${ticketId}" data-barcode="${barcode}" style="padding: 3px 10px; font-size: 12px; margin: 0; background: linear-gradient(180deg, #d32f2f 0%, #8b0000 100%);">CANCEL</button>
          </td>
        `;

        // Click row to auto-populate manual input
        tr.addEventListener('click', () => {
          document.querySelectorAll('#cancelHistoryTable tbody tr').forEach(r => r.classList.remove('selected'));
          tr.classList.add('selected');
          const input = document.getElementById('cancelTicketIdInput');
          if (input) input.value = ticketId; // Populate integer ID for safety
        });

        tbody.appendChild(tr);
      });

      // Add click handlers for the inline CANCEL buttons
      tbody.querySelectorAll('.inline-cancel-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation(); // Avoid row click selection trigger
          const ticketId = btn.getAttribute('data-ticket-id');
          const barcode = btn.getAttribute('data-barcode');
          if (confirm(`Are you sure you want to cancel ticket: ${barcode}?`)) {
            const statusMsg = document.getElementById('cancelStatusMsg');
            if (statusMsg) {
              statusMsg.className = 'status-msg';
              statusMsg.textContent = 'CANCELLING TICKET...';
            }
            try {
              const cancelRes = await API.cancelTicket(userData.user, ticketId);
              if (cancelRes && (cancelRes.status === true || cancelRes.success === true)) {
                showCancelStatus(cancelRes.message || 'Ticket cancelled successfully!', true);
                const input = document.getElementById('cancelTicketIdInput');
                if (input) input.value = '';
                syncBalanceWithServer();
                loadCurrentDrawHistory();
              } else {
                showCancelStatus(cancelRes.message || 'Failed to cancel ticket.', false);
              }
            } catch (err) {
              console.error('Cancel error:', err);
              showCancelStatus('Server error during ticket cancellation.', false);
            }
          }
        });
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; color: #aaa;">NO ACTIVE TICKETS FOUND FOR CURRENT DRAW</td></tr>';
    }
  } catch (err) {
    console.error('Error loading current draw history:', err);
    tbody.innerHTML = '<tr><td colspan="6" style="padding: 20px; color: #ff3333;">FAILED TO LOAD ACTIVE TICKETS</td></tr>';
  }
}

async function handleHistoryDetails() {
  const selectedRow = document.querySelector('.history-table tbody tr.selected');
  if (!selectedRow) {
    alert('Please select a ticket from the table first.');
    return;
  }
  const ticketData = JSON.parse(selectedRow.getAttribute('data-ticket') || '{}');
  const barcode = selectedRow.getAttribute('data-barcode');

  // Determine status
  let status = 'Pending';
  const winAmt = parseFloat(ticketData.win_amt || 0);
  if (winAmt > 0) {
    status = (ticketData.claim_status === '1' || ticketData.claim_status === 1) ? 'Claimed' : 'Won';
  } else {
    if (ticketData.draw_times && ticketData.recordDate) {
      const match = ticketData.draw_times.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        const drawDate = new Date(ticketData.recordDate);
        drawDate.setHours(hours, minutes, 0, 0);
        if (new Date() > drawDate) {
          status = 'Lost';
        }
      }
    }
  }

  // Fetch full details (bet lines) via print tickets API
  let betLinesDetails = '';
  try {
    const res = await API.reprintTicket(userData.user, barcode);
    if (res && res.status === true && res.tickets && res.tickets[0]) {
      const reprintData = res.tickets[0];
      if (Array.isArray(reprintData.bet_lines) && reprintData.bet_lines.length > 0) {
        betLinesDetails = '\n\nBets:\n' + reprintData.bet_lines.map(line => `  • Number: ${line.num} (Amount: ${line.qty})`).join('\n');
      }
    }
  } catch (err) {
    console.error('Error fetching ticket details:', err);
  }

  alert(`Ticket ID: ${barcode}\nGame ID: ${ticketData.id || "N/A"}\nPlayed Amount: ${ticketData.amount || 0}\nWinning Amount: ${ticketData.win_amt || 0}\nStatus: ${status}\nDraw Time: ${ticketData.draw_times || "N/A"}\nTicket Time: ${ticketData.bet_time || "N/A"}${betLinesDetails}`);
}

async function handleHistoryReprint() {
  if (!selectedTicketBarcode) {
    alert('Please select a ticket to reprint.');
    return;
  }
  try {
    const res = await API.reprintTicket(userData.user, selectedTicketBarcode);
    if (res && res.status === true && Array.isArray(res.tickets) && res.tickets[0]) {
      printTicket(res.tickets[0]);
    } else {
      alert(res.message || 'Failed to reprint ticket.');
    }
  } catch (err) {
    console.error('Reprint error:', err);
    alert('Failed to connect to printer server.');
  }
}

async function handleHistoryClaim() {
  if (!selectedTicketBarcode) {
    alert('Please select a ticket to claim.');
    return;
  }
  try {
    const res = await API.claimTicket(userData.user, selectedTicketBarcode);
    const actualRes = Array.isArray(res) ? res[0] : res;
    if (actualRes && (actualRes.status === true || actualRes.success === true)) {
      alert(actualRes.message || 'Ticket claimed successfully!');
      syncBalanceWithServer();
      loadHistory();
    } else {
      alert(actualRes.message || 'Failed to claim ticket.');
    }
  } catch (err) {
    console.error('Claim error:', err);
    alert('Failed to claim ticket.');
  }
}

async function handleHistoryCancel() {
  const selectedRow = document.querySelector('.history-table tbody tr.selected');
  if (!selectedRow) {
    alert('Please select a ticket to cancel.');
    return;
  }
  const ticketData = JSON.parse(selectedRow.getAttribute('data-ticket') || '{}');
  const barcode = selectedRow.getAttribute('data-barcode');

  if (!confirm('Are you sure you want to cancel ticket: ' + barcode + '?')) {
    return;
  }
  try {
    const res = await API.cancelTicket(userData.user, ticketData.id);
    if (res && (res.status === true || res.success === true)) {
      alert(res.message || 'Ticket cancelled successfully!');
      syncBalanceWithServer();
      loadHistory();
    } else {
      alert(res.message || 'Failed to cancel ticket.');
    }
  } catch (err) {
    console.error('Cancel error:', err);
    alert('Failed to cancel ticket.');
  }
}

function printTicket(ticket) {
  if (!ticket) return;

  // Create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Convert bet time to 24-hour format if it's in 12-hour format
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return 'N/A';
    const match = timeStr.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const seconds = match[3];
    const ampm = match[4].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  };

  const gameDateVal = ticket.recordDate || new Date().toISOString().split('T')[0];
  const drawTimeVal = ticket.draw_time || ticket.draw_times || 'N/A';
  const ticketTimeVal = convertTo24Hour(ticket.tck_time || ticket.bet_time);
  const retailerIdVal = userData.user || 'anil';
  const totalPointVal = ticket.amount || 0;
  const totalQtyVal = ticket.qty || Math.round(totalPointVal / 2);

  // Group bet lines into rows of 3 pairs (Num/Qty) sorted in ascending numeric order
  const betLines = [...(ticket.bet_lines || [])].sort((a, b) => {
    const numA = parseInt(a.num);
    const numB = parseInt(b.num);
    return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
  });
  let tableRowsHtml = '';
  for (let i = 0; i < betLines.length; i += 3) {
    const b1 = betLines[i] || { num: '', qty: '' };
    const b2 = betLines[i + 1] || { num: '', qty: '' };
    const b3 = betLines[i + 2] || { num: '', qty: '' };

    const formatNum = (num) => {
      if (num === undefined || num === null || num === '') return '';
      // Format number exactly as placed
      return String(num);
    };

    const formatQty = (qty) => {
      if (qty === undefined || qty === null || qty === '') return '';
      return String(qty);
    };

    tableRowsHtml += `
      <tr>
        <td style="border: 2px solid #000; padding: 4px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif;">${formatNum(b1.num)}</td>
        <td style="border: 2px solid #000; padding: 4px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif;">${formatQty(b1.qty)}</td>
        <td style="border: 2px solid #000; padding: 4px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif;">${formatNum(b2.num)}</td>
        <td style="border: 2px solid #000; padding: 4px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif;">${formatQty(b2.qty)}</td>
        <td style="border: 2px solid #000; padding: 4px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif;">${formatNum(b3.num)}</td>
        <td style="border: 2px solid #000; padding: 4px; font-weight: bold; font-size: 13px; font-family: Arial, sans-serif;">${formatQty(b3.qty)}</td>
      </tr>
    `;
  }

  // Generate dynamic barcode image using meta bwipjs API
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(ticket.barcode)}&scale=2&rotate=N&height=8&includetext=false`;

  const html = `
    <html>
      <head>
        <title>Print Ticket</title>
        <style>
          @page {
            margin: 0;
            size: 58mm auto;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #000;
            margin: 0;
            padding: 10px 14px;
            width: 58mm;
            box-sizing: border-box;
          }
          .title-header {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2px;
            font-family: Arial, sans-serif;
          }
          .subtitle-header {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 6px;
            font-family: Arial, sans-serif;
          }
          .thick-line {
            border-top: 3px solid #000;
            margin-bottom: 12px;
          }
          .double-line {
            border-top: 3px double #000;
            margin-top: 10px;
            margin-bottom: 8px;
          }
          .details-block {
            text-align: left;
            font-size: 14px;
            font-weight: bold;
            line-height: 1.4;
            font-family: Arial, sans-serif;
            margin-bottom: 12px;
          }
          .grid-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            text-align: center;
            margin-top: 8px;
          }
          .grid-table th {
            border: 2px solid #000;
            padding: 4px;
            font-weight: bold;
            font-size: 13px;
            font-family: Arial, sans-serif;
          }
          .barcode-container {
            margin-top: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
          }
          .barcode-img {
            max-width: 100%;
            height: auto;
            width: 150px;
          }
          .barcode-text {
            font-size: 13px;
            font-weight: bold;
            margin-top: 4px;
            letter-spacing: 1px;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="title-header">Gwin Matka</div>
        <div class="subtitle-header">(Ticket valid for 10 days)</div>
        <div class="thick-line"></div>
        
        <div class="details-block">
          <div>Game Date : ${gameDateVal}</div>
          <div>Draw Time : ${drawTimeVal}</div>
          <div>Ticket Time : ${ticketTimeVal}</div>
          <div>Retailer ID : ${retailerIdVal}</div>
          <div>Total Point : ${totalPointVal}</div>
          <div>Total Qty : ${totalQtyVal}</div>
        </div>

        <table class="grid-table">
          <thead>
            <tr>
              <th>Num</th>
              <th>Qty</th>
              <th>Num</th>
              <th>Qty</th>
              <th>Num</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        
        <div class="double-line"></div>
        
        <div class="barcode-container">
          <img class="barcode-img" src="${barcodeUrl}" alt="BARCODE">
          <div class="barcode-text">${ticket.barcode}</div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  // Clean up iframe after printing is done
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 5000);
}

// Auto-scaling system to fit game perfectly on screen decreases/zooms
function scaleGame() {
  const container = document.querySelector('.game-container');
  if (!container) return;

  const designedWidth = 1400;
  const designedHeight = 780;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / designedWidth;
  const scaleY = windowHeight / designedHeight;
  
  // Calculate scale factor to fit both width and height fully (maintaining designed aspect ratio)
  const scale = Math.min(scaleX, scaleY);

  container.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener('resize', scaleGame);

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
    scaleGame();
  });
} else {
  initApp();
  scaleGame();
}



