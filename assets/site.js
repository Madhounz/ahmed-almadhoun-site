document.documentElement.classList.add('js');
const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('open')) {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.focus();
  }
});
const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('.work').forEach(work => {
      const filter = button.dataset.filter;
      work.hidden = !(filter === 'all' || (filter === 'other' ? work.dataset.status !== 'Published' : work.dataset.status === filter));
      if (!work.hidden) count++;
    });
    document.querySelector('#filter-status').textContent = `${count} research outputs shown.`;
  });
}
