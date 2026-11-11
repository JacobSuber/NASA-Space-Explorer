/* NASA Space Explorer LevelUp — browser install, offline status & permissions. */
(() => {
  'use strict';
  const installButton = document.getElementById('installAppButton');
  const notifyButton = document.getElementById('notificationsButton');
  const message = document.getElementById('pwaMessage');
  const connectionStatus = document.getElementById('connectionStatus');
  const connectionText = document.getElementById('connectionText');
  let deferredInstallPrompt = null;
  let registrationPromise = null;
  let showingCachedResults = false;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

  function tellUser(value) {
    message.hidden = !value;
    message.textContent = value || '';
  }
  function updateConnection() {
    const offline = !navigator.onLine;
    connectionStatus.classList.toggle('offline', offline);
    connectionText.textContent = offline ? (showingCachedResults ? 'Offline · Showing saved NASA results' : 'Offline · Previously saved results available') : 'Online · Ready to explore';
    if (!offline) showingCachedResults = false;
  }
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  updateConnection();
  navigator.serviceWorker?.addEventListener('message', event => {
    if (event.data?.type === 'APOD_OFFLINE_FALLBACK') {
      showingCachedResults = true;
      updateConnection();
      tellUser('NASA is unreachable, so this date range was loaded from the saved offline cache.');
    }
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    registrationPromise = navigator.serviceWorker.register('./service-worker.js')
      .catch(error => {
        console.error('Service worker registration failed', error);
        tellUser('Offline support could not start in this browser. Reload the published HTTPS site and try again.');
        return null;
      });
  } else {
    tellUser('Offline installation requires an HTTPS connection and a browser with service worker support.');
  }

  function updateInstallButton() {
    if (isStandalone()) {
      installButton.textContent = '✓ App Installed';
      installButton.disabled = true;
    } else {
      installButton.textContent = '↓ Install App';
      installButton.disabled = false;
    }
  }
  updateInstallButton();

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
    tellUser('This app is ready to install. Tap Install App to add it to your device.');
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallButton();
    tellUser('NASA Space Explorer has been installed. Open it from your home screen.');
  });

  installButton.addEventListener('click', async () => {
    if (isStandalone()) {
      tellUser('You are already using the installed NASA Space Explorer app.');
      updateInstallButton();
      return;
    }
    if (deferredInstallPrompt) {
      const prompt = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await prompt.prompt();
        const result = await prompt.userChoice;
        tellUser(result.outcome === 'accepted' ? 'Installation accepted. Look for NASA Space Explorer on your home screen.' : 'Installation dismissed. You can try again when your browser offers installation.');
      } catch (error) {
        console.error('Install prompt error', error);
        tellUser('The browser could not open the install dialog. Try your browser menu → Install app.');
      }
    } else if (isIOS()) {
      tellUser('On iPhone/iPad: open this URL in Safari, tap the Share button, then Add to Home Screen. Open the new Space Explorer icon to use it standalone.');
    } else {
      tellUser('Open the browser menu (⋮) and choose Install app or Add to Home screen. On desktop Chrome, look for the install icon in the address bar.');
    }
  });

  notifyButton.addEventListener('click', async () => {
    if (!('Notification' in window) || !window.isSecureContext) {
      tellUser('This browser does not support notification permission here. Try the installed app over HTTPS.');
      return;
    }
    try {
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission === 'granted') {
        tellUser('Notification permission granted! NASA Space Explorer can show notifications.');
        notifyButton.textContent = '✓ Notifications Allowed';
        // A visible local notification demonstrates that permission is working.
        if (registrationPromise) {
          const reg = await registrationPromise;
          if (reg && typeof reg.showNotification === 'function') {
            await reg.showNotification('NASA Space Explorer', {
              body:'Notifications are enabled. Keep exploring the universe!',
              icon:'./img/icon-192.png',
              badge:'./img/icon-192.png',
              tag:'nasa-space-explorer-permission'
            });
          }
        }
      } else if (permission === 'denied') {
        tellUser('Notifications are blocked. You can enable them from this site’s browser or device settings.');
      } else {
        tellUser('Permission was not granted. Tap Enable Notifications whenever you want to try again.');
      }
    } catch (error) {
      console.error('Notification permission error', error);
      tellUser('Notification permission could not be requested. On iOS, install this app to your home screen first, then try again.');
    }
  });
  if ('Notification' in window && Notification.permission === 'granted') {
    notifyButton.textContent = '✓ Notifications Allowed';
  }
})();
