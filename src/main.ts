import './style.css';
import './footer.css';
import './nav.css';
import nav from './nav';
nav();


document.getElementById('settings').addEventListener('click', () => {
  if (confirm('clear pwa cache ?')) {
    self.caches.keys().then(s => { s.forEach(k => { self.caches.delete(k) }) });
    navigator.serviceWorker.getRegistrations().then(s => { s.forEach(r => { r.unregister() }) });
    location.reload();
  }
});