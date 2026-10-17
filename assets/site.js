(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const safeStore = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const themeButton = document.querySelector('#theme-toggle');
  const syncTheme = () => {
    const dark = root.dataset.theme !== 'light';
    if (themeButton) {
      themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
      themeButton.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
    }
    const meta = document.querySelector('#theme-color');
    if (meta) meta.content = dark ? '#0b1114' : '#f5f6f1';
  };
  if (themeButton) {
    themeButton.hidden = false;
    syncTheme();
    themeButton.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      safeStore('aa-theme', root.dataset.theme);
      syncTheme();
    });
  }
  document.querySelectorAll('.personalize').forEach(el => { el.hidden = false; });
  const accentButtons = [...document.querySelectorAll('button[data-accent]')];
  const syncAccent = () => accentButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.accent === (root.dataset.accent || 'mint'))));
  syncAccent();
  accentButtons.forEach(button => button.addEventListener('click', () => {
    root.dataset.accent = button.dataset.accent;
    safeStore('aa-accent', root.dataset.accent);
    syncAccent();
  }));

  const motionButton = document.querySelector('#motion-toggle');
  if (motionButton) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = false;
    try { paused = localStorage.getItem('aa-motion') === 'paused'; } catch (_) {}
    const syncMotion = () => {
      root.dataset.motion = (paused || reduced.matches) ? 'paused' : 'running';
      motionButton.hidden = reduced.matches;
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.setAttribute('aria-label', paused ? 'Resume decorative motion' : 'Pause decorative motion');
      motionButton.title = motionButton.getAttribute('aria-label');
      motionButton.querySelector('span').textContent = paused ? 'Resume motion' : 'Pause motion';
    };
    syncMotion();
    reduced.addEventListener('change', syncMotion);
    motionButton.addEventListener('click', () => { paused = !paused; safeStore('aa-motion', paused ? 'paused' : 'running'); syncMotion(); });
  }

  const menu = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#navigation');
  if (menu && navigation) {
    menu.hidden = false;
    const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('open', open);
    });
    navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); }
    });
    document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
    window.matchMedia('(min-width: 621px)').addEventListener('change', closeMenu);
  }

  const perspectiveControls = document.querySelector('.segmented');
  if (perspectiveControls) {
    perspectiveControls.hidden = false;
    const setPerspective = value => {
      perspectiveControls.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.perspective === value)));
      document.querySelectorAll('[data-perspective-panel]').forEach(panel => { panel.hidden = panel.dataset.perspectivePanel !== value; });
    };
    setPerspective('research');
    perspectiveControls.addEventListener('click', event => {
      const button = event.target.closest('button[data-perspective]');
      if (button) setPerspective(button.dataset.perspective);
    });
  }

  const explorer = document.querySelector('.explorer');
  if (explorer) {
    const copy = {
      access: { tag: 'NETWORK ACCESSIBILITY', title: 'Connected doesn’t always mean accessible.', description: 'Road geometry, pavement condition or service gaps can make a connection harder to use. My research examines how these constraints should be represented in freight accessibility measures.' },
      traffic: { tag: 'PASSENGER–FREIGHT INTERACTION', title: 'The same road. Different consequences.', description: 'Passenger vehicles and freight share limited road space. I use corridor microsimulation to explore how changes in passenger demand affect freight delay and reliability.' },
      reliability: { tag: 'SERVICE & RELIABILITY', title: 'A route is useful when a business can rely on it.', description: 'Travel time alone does not describe the whole delivery experience. I am investigating how reliability, service availability and economic accessibility can help explain freight disadvantage.' }
    };
    const controls = explorer.querySelector('.explorer-controls');
    controls.hidden = false;
    controls.addEventListener('click', event => {
      const button = event.target.closest('button[data-network]');
      if (!button || !copy[button.dataset.network]) return;
      const value = button.dataset.network;
      explorer.dataset.explorerMode = value;
      controls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('#explorer-tag').textContent = copy[value].tag;
      document.querySelector('#explorer-title').textContent = copy[value].title;
      document.querySelector('#explorer-description').textContent = copy[value].description;
    });
  }

  const tools = document.querySelector('.publication-tools');
  if (tools) {
    tools.hidden = false;
    let selectedFilter = 'all';
    const search = document.querySelector('#publication-search');
    const works = [...document.querySelectorAll('.work')].map(element => ({element, searchText: element.textContent.toLowerCase()}));
    const update = () => {
      const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let count = 0;
      works.forEach(({element, searchText}) => {
        const statusMatch = selectedFilter === 'all' || (selectedFilter === 'other' ? element.dataset.status !== 'Published' : element.dataset.status === selectedFilter);
        element.hidden = !(statusMatch && terms.every(term => searchText.includes(term)));
        if (!element.hidden) count++;
      });
      document.querySelector('#filter-status').textContent = `${count} research ${count === 1 ? 'output' : 'outputs'} shown.`;
      document.querySelector('.empty-state').hidden = count !== 0;
    };
    const filters = tools.querySelector('.filters');
    filters.querySelectorAll('button').forEach(button => {
      const value = button.dataset.filter;
      const count = works.filter(({element}) => value === 'all' || (value === 'other' ? element.dataset.status !== 'Published' : element.dataset.status === value)).length;
      button.querySelector('span').textContent = String(count).padStart(2, '0');
    });
    const setFilter = value => {
      selectedFilter = value;
      filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === value)));
      update();
    };
    filters.addEventListener('click', event => { const button = event.target.closest('button[data-filter]'); if (button) setFilter(button.dataset.filter); });
    search.addEventListener('input', update);
    document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; setFilter('all'); search.focus(); });
    update();
  }

  const copyButton = document.querySelector('.copy-link');
  if (copyButton && window.isSecureContext && navigator.clipboard) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.querySelector('#copy-status');
      try { await navigator.clipboard.writeText('https://ahmedalmadhoun.com/'); status.textContent = 'Website link copied.'; }
      catch (_) { status.textContent = 'You can copy this address: ahmedalmadhoun.com'; }
    });
  }
  document.querySelectorAll('[data-print]').forEach(button => { button.hidden = false; button.addEventListener('click', () => window.print()); });

  const progress = document.querySelector('#reading-progress');
  if (progress) {
    let scheduled = false;
    const updateProgress = () => {
      const distance = root.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0})`;
      scheduled = false;
    };
    addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, {passive: true});
    addEventListener('resize', updateProgress, {passive: true});
    updateProgress();
  }
  if ('IntersectionObserver' in window && navigation) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navigation.querySelectorAll('a').forEach(link => {
            if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, {rootMargin: '-15% 0px -60% 0px', threshold: 0});
    document.querySelectorAll('#research, #publications, #experience, #contact').forEach(section => observer.observe(section));
  }
})();
