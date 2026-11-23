(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = {meta: null, job: null, pollTimer: null, elapsedTimer: null, results: [], filter: 'all', sites: [], selectedSites: new Set(), view: 'search'};
  const terminalStates = new Set(['completed', 'failed', 'cancelled']);
  const apiBase = (typeof window.SHERLOCK_API_BASE_URL === 'string' ? window.SHERLOCK_API_BASE_URL : '').trim().replace(/\/+$/, '');
  let token = sessionStorage.getItem('sherlock_token') || '';

  async function api(path, options = {}) {
    const headers = {...(options.headers || {})};
    if (token) headers['X-Sherlock-Token'] = token;
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(`${apiBase}${path}`, {...options, headers, cache: 'no-store'});
    } catch (error) {
      throw new Error('Cannot reach Sherlock Web server. Make sure it is running.');
    }
    if (!response.ok) {
      let message = `Server request failed (${response.status})`;
      try {
        const payload = await response.json();
        const detail = payload.detail;
        message = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(d => d.msg || 'Invalid field').join('; ') : message);
      } catch (_) { /* keep HTTP message */ }
      throw new Error(message);
    }
    return response;
  }

  async function requestJson(path, options) {
    return (await api(path, options)).json();
  }

  function showAlert(message, kind = 'error') {
    const area = $('alertArea');
    area.replaceChildren();
    const item = document.createElement('div');
    item.className = `alert ${kind}`;
    item.textContent = message;
    area.appendChild(item);
  }

  function clearAlert() { $('alertArea').replaceChildren(); }

  function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  }

  function validLink(raw) {
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }

  function formatTime(seconds) {
    const value = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }

  function setView(view) {
    state.view = view;
    for (const name of ['search', 'history', 'guide']) {
      $('view' + name.charAt(0).toUpperCase() + name.slice(1)).hidden = name !== view;
    }
    document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    $('currentViewName').textContent = {search:'Username Search', history:'Scan History', guide:'Documentation'}[view];
    if (view === 'history') refreshHistory();
  }

  async function loadMeta() {
    if (!apiBase) {
      $('engineBadge').textContent = 'SEARCH ENGINE NOT CONNECTED';
      $('runButton').disabled = true;
      showAlert('Sherlock Web is published, but live scans are not connected yet. GitHub Pages cannot run the Sherlock Python engine. A separate secure Python backend is required; no searches can run until it is configured.');
      return;
    }
    try {
      state.meta = await requestJson('/api/meta');
      $('authPanel').hidden = !state.meta.auth_required;
      $('authToken').value = token;
      const pip = document.createElement('span');
      pip.className = `status-pip ${state.meta.engine_ready ? '' : 'offline'}`;
      $('engineBadge').replaceChildren(pip, document.createTextNode(' ' + (state.meta.engine_ready ? `ENGINE ONLINE${state.meta.engine_version ? ' · v' + state.meta.engine_version : ''}` : 'ENGINE NOT INSTALLED')));
      $('runButton').disabled = !state.meta.engine_ready;
      if (!state.meta.engine_ready) showAlert('Sherlock is not installed on this server yet. Run “pip install -r requirements.txt”, then restart the server. The website will use the real engine once installed.');
    } catch (error) {
      $('engineBadge').textContent = 'SERVER NOT REACHABLE';
      $('runButton').disabled = true;
      showAlert(error.message);
    }
  }

  function parseNames(text) {
    return [...new Set(text.split(/[\s,;]+/).map(name => name.trim()).filter(Boolean))];
  }

  function parseSites(text) {
    return [...new Set(text.split(',').map(site => site.trim()).filter(Boolean))];
  }

  async function startSearch(event) {
    event.preventDefault();
    clearAlert();
    const names = parseNames($('usernames').value);
    if (names.length < 1 || names.length > 8) return showAlert('Enter between 1 and 8 usernames, separated by commas, spaces or new lines.');
    if (!names.every(name => /^[A-Za-z0-9_.?{}][A-Za-z0-9_.?{}-]{0,63}$/.test(name))) return showAlert('Invalid username: use letters, numbers, periods, dashes, underscores, or the Sherlock {?} wildcard.');
    const sites = parseSites($('siteInput').value);
    if (sites.length > 30) return showAlert('You can select at most 30 specific sites per scan. Leave the field blank to check all sites.');
    if (state.job && !terminalStates.has(state.job.status)) return showAlert('A scan is already running in this tab. Stop it or let it finish first.');
    $('runButton').disabled = true;
    $('runButton').textContent = 'Starting scan…';
    const request = {usernames: names, sites, timeout: Number($('timeout').value), nsfw: $('nsfw').checked, local: $('local').checked, ignore_exclusions: $('ignoreExclusions').checked};
    try {
      const created = await requestJson('/api/scans', {method: 'POST', body: JSON.stringify(request)});
      $('resultsSection').hidden = true;
      $('activityPanel').hidden = false;
      $('activityHeading').textContent = `Scanning ${names.join(', ')}`;
      $('activityLog').textContent = 'Starting official Sherlock engine…';
      setView('search');
      state.job = {...created, usernames: names};
      await loadScan(created.id);
      startPolling(created.id);
      $('activityPanel').scrollIntoView({behavior:'smooth',block:'start'});
    } catch (error) {
      showAlert(error.message);
    } finally {
      $('runButton').textContent = '⌕ Run Sherlock ↗';
      $('runButton').disabled = !(state.meta && state.meta.engine_ready);
    }
  }

  function startPolling(id) {
    if (state.pollTimer) clearInterval(state.pollTimer);
    if (state.elapsedTimer) clearInterval(state.elapsedTimer);
    state.pollTimer = setInterval(() => loadScan(id), 1500);
    state.elapsedTimer = setInterval(updateElapsed, 1000);
    updateElapsed();
  }

  function stopPolling() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    if (state.elapsedTimer) clearInterval(state.elapsedTimer);
    state.pollTimer = null;
    state.elapsedTimer = null;
  }

  function updateElapsed() {
    if (!state.job || !state.job.started_at) return;
    const start = new Date(state.job.started_at).getTime();
    const end = state.job.finished_at ? new Date(state.job.finished_at).getTime() : Date.now();
    $('elapsedValue').textContent = formatTime((end - start) / 1000);
  }

  async function loadScan(id) {
    try {
      const job = await requestJson(`/api/scans/${encodeURIComponent(id)}`);
      if (state.job && state.job.id !== id) return;
      state.job = job;
      $('activityPanel').hidden = false;
      $('activityHeading').textContent = `Scanning ${job.usernames.join(', ')}`;
      $('activityStatus').textContent = job.status.toUpperCase();
      $('activityStatus').className = 'pill ' + job.status;
      $('activityStage').textContent = ({queued:'Queued for Sherlock', running:'Checking site availability', completed:'Scan complete', failed:'Scan failed', cancelled:'Scan cancelled'})[job.status];
      $('activityCount').textContent = job.summary.checked || job.events_seen || '—';
      $('stopButton').hidden = terminalStates.has(job.status);
      const log = (job.log || []).join('\n');
      if ($('activityLog').textContent !== log && log) {
        $('activityLog').textContent = log;
        $('activityLog').scrollTop = $('activityLog').scrollHeight;
      }
      updateElapsed();
      if (terminalStates.has(job.status)) {
        stopPolling();
        if (job.status === 'failed' || job.status === 'cancelled') showAlert(job.error || 'The scan did not finish. See activity log.');
        if (job.status === 'completed') {
          state.results = job.results || [];
          $('resultsSection').hidden = false;
          $('resultsHeading').textContent = `Results for ${job.usernames.join(', ')}`;
          renderResults();
        }
      }
    } catch (error) {
      stopPolling();
      showAlert(error.message);
    }
  }

  async function stopScan() {
    if (!state.job || terminalStates.has(state.job.status)) return;
    try {
      await requestJson(`/api/scans/${encodeURIComponent(state.job.id)}`, {method:'DELETE'});
      $('activityStage').textContent = 'Stopping scan…';
      await loadScan(state.job.id);
    } catch (error) { showAlert(error.message); }
  }

  function renderResults() {
    const records = state.results;
    const count = key => records.filter(r => r.status === key).length;
    const found = count('found'), absent = count('not_found'), unknown = count('unknown');
    $('foundMetric').textContent = found;
    $('notFoundMetric').textContent = absent;
    $('unknownMetric').textContent = unknown;
    $('totalMetric').textContent = records.length;
    $('tabAll').textContent = records.length;
    $('tabFound').textContent = found;
    $('tabNotFound').textContent = absent;
    $('tabUnknown').textContent = unknown;
    const query = $('filterInput').value.toLowerCase().trim();
    const matched = records.filter(r => (state.filter === 'all' || r.status === state.filter) && (`${r.site} ${r.username} ${r.url}`).toLowerCase().includes(query));
    const mode = $('sortOrder').value;
    matched.sort((a,b) => {
      if (mode === 'site') return a.site.localeCompare(b.site);
      if (mode === 'username') return a.username.localeCompare(b.username) || a.site.localeCompare(b.site);
      if (mode === 'time') return (Number(a.response_time) || Infinity) - (Number(b.response_time) || Infinity);
      return ({found:0, unknown:1, not_found:2}[a.status] - {found:0, unknown:1, not_found:2}[b.status]) || a.site.localeCompare(b.site);
    });
    const body = $('resultRows');
    if (!matched.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty-row">No results match this filter.</td></tr>`;
    } else {
      body.innerHTML = matched.map(row => {
        const url = validLink(row.url);
        const link = url ? `<a href="${safeText(url)}" class="view-link" target="_blank" rel="noopener noreferrer">Open profile ↗</a>` : '—';
        const status = {found: 'FOUND', not_found: 'NOT FOUND', unknown: 'UNKNOWN'}[row.status] || 'UNKNOWN';
        return `<tr><td><div class="site-cell"><span class="site-letter">${safeText(row.site.charAt(0).toUpperCase())}</span>${safeText(row.site)}</div></td><td class="username-cell">@${safeText(row.username)}</td><td><span class="status-tag ${safeText(row.status)}">${status}</span></td><td>${safeText(row.response_time ? `${row.response_time}s` : '—')}</td><td>${link}</td></tr>`;
      }).join('');
    }
    $('showingLabel').textContent = `Showing ${matched.length} of ${records.length} records`;
  }

  async function exportResults(format) {
    $('exportMenu').hidden = true;
    if (!state.job || state.job.status !== 'completed') return showAlert('Finish a scan before exporting.');
    try {
      const response = await api(`/api/scans/${state.job.id}/export/${format}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `sherlock-${state.job.id.slice(0,8)}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) { showAlert(error.message); }
  }

  async function refreshHistory() {
    const list = $('historyList');
    try {
      const history = await requestJson('/api/scans');
      list.replaceChildren();
      if (!history.length) {
        const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No scans yet. Start a search to create an investigation.'; list.appendChild(p); return;
      }
      for (const job of history) {
        const item = document.createElement('button');
        item.type = 'button'; item.className = 'history-item';
        const names = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = job.usernames.join(', ');
        const caption = document.createElement('small'); caption.textContent = `${new Date(job.created_at).toLocaleString()} · ${job.summary.checked} sites checked · ${job.summary.found} found`;
        names.append(title, caption);
        const info = document.createElement('div'); info.className = 'history-right';
        const status = document.createElement('span'); status.className = `pill ${job.status}`; status.textContent = job.status.toUpperCase();
        const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.style.color = '#b7f574';
        info.append(status, arrow); item.append(names, info);
        item.addEventListener('click', async () => {
          stopPolling(); state.job = {id:job.id};
          state.filter = 'all'; document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active',t.dataset.filter === 'all'));
          $('filterInput').value = ''; $('sortOrder').value = 'status';
          $('resultsSection').hidden = true; setView('search');
          await loadScan(job.id);
          if (!terminalStates.has(state.job.status)) startPolling(job.id);
          $('activityPanel').scrollIntoView({behavior:'smooth'});
        });
        list.appendChild(item);
      }
    } catch (error) { list.textContent = error.message; }
  }

  async function openSitesDialog() {
    try {
      const result = await requestJson('/api/sites');
      state.sites = result.sites || [];
      state.selectedSites = new Set(parseSites($('siteInput').value));
      $('siteSearch').value = '';
      renderSites();
      $('sitesDialog').showModal();
    } catch (error) { showAlert(error.message); }
  }

  function renderSites() {
    const list = $('siteList'); list.replaceChildren();
    const term = $('siteSearch').value.trim().toLowerCase();
    const matched = state.sites.filter(site => site.toLowerCase().includes(term));
    $('siteSelectedCount').textContent = `${state.selectedSites.size} sites selected`;
    if (!matched.length) {
      const item = document.createElement('p'); item.className = 'site-list-empty';
      item.textContent = state.sites.length ? 'No sites match your search.' : 'The site catalog is unavailable. Enter exact site names in the advanced field.';
      list.appendChild(item); return;
    }
    const fragment = document.createDocumentFragment();
    for (const site of matched) {
      const row = document.createElement('label'); row.className = 'site-choice';
      const span = document.createElement('span'); span.textContent = site;
      const check = document.createElement('input'); check.type = 'checkbox'; check.checked = state.selectedSites.has(site);
      check.addEventListener('change', () => {
        if (check.checked && state.selectedSites.size >= 30) { check.checked = false; return showAlert('You can select up to 30 sites.'); }
        if (check.checked) state.selectedSites.add(site); else state.selectedSites.delete(site);
        $('siteSelectedCount').textContent = `${state.selectedSites.size} sites selected`;
      });
      row.append(span, check); fragment.appendChild(row);
    }
    list.appendChild(fragment);
  }

  function wireEvents() {
    document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
    $('searchForm').addEventListener('submit', startSearch);
    $('stopButton').addEventListener('click', stopScan);
    $('timeout').addEventListener('input', () => { $('timeoutValue').textContent = `${$('timeout').value} s`; });
    $('filterInput').addEventListener('input', renderResults);
    $('sortOrder').addEventListener('change', renderResults);
    document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === button));
      renderResults();
    }));
    $('exportButton').addEventListener('click', () => { $('exportMenu').hidden = !$('exportMenu').hidden; });
    document.querySelectorAll('[data-format]').forEach(button => button.addEventListener('click', () => exportResults(button.dataset.format)));
    document.addEventListener('click', (event) => { if (!event.target.closest('.export-wrap')) $('exportMenu').hidden = true; });
    $('browseSites').addEventListener('click', openSitesDialog);
    $('siteSearch').addEventListener('input', renderSites);
    $('applySites').addEventListener('click', () => {
      $('siteInput').value = [...state.selectedSites].join(', ');
      $('sitesDialog').close();
    });
    $('saveToken').addEventListener('click', () => {
      token = $('authToken').value.trim();
      if (token) sessionStorage.setItem('sherlock_token', token);
      else sessionStorage.removeItem('sherlock_token');
      clearAlert();
      showAlert('Token set for this browser tab. You can now run protected requests.', 'success');
    });
  }

  wireEvents();
  loadMeta();
})();
