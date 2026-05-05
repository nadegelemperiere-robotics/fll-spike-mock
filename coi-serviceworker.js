/*! coi-serviceworker v0.1.7 — MIT, Guido Zuidhof & contributors.
    Active COOP/COEP côté client pour rendre SharedArrayBuffer disponible
    (nécessaire à Pyodide.setInterruptBuffer pour interrompre du Python pur).
    Mode credentialless par défaut : on n'exige pas que les ressources
    cross-origin (icônes, mats…) renvoient un en-tête CORP. */
let coepCredentialless = true;

if (typeof window === 'undefined') {
  // --- Côté Service Worker ---
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('message', (ev) => {
    if (!ev.data) return;
    if (ev.data.type === 'deregister') {
      self.registration.unregister()
        .then(() => self.clients.matchAll())
        .then((clients) => clients.forEach((c) => c.navigate(c.url)));
    } else if (ev.data.type === 'coepCredentialless') {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener('fetch', (event) => {
    const r = event.request;
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;

    const request = (coepCredentialless && r.mode === 'no-cors')
      ? new Request(r, { credentials: 'omit' })
      : r;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) return response;
          const headers = new Headers(response.headers);
          headers.set('Cross-Origin-Embedder-Policy', coepCredentialless ? 'credentialless' : 'require-corp');
          if (!coepCredentialless) headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');
          return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  // --- Côté page : enregistrement du SW ---
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem('coiReloadedBySelf');
    window.sessionStorage.removeItem('coiReloadedBySelf');

    const coi = {
      shouldRegister: () => !reloadedBySelf,
      shouldDeregister: () => false,
      coepCredentialless: () => true,   // mode credentialless : pas besoin que les
                                         // ressources cross-origin (icônes, mats…)
                                         // renvoient un en-tête CORP.
      coepDegrade: () => true,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi,
    };

    const n = navigator;
    const controlling = n.serviceWorker && n.serviceWorker.controller;

    if (controlling && !window.crossOriginIsolated) {
      window.sessionStorage.setItem('coiReloadedBySelf', 'coepdegrade');
      coi.doReload('coepdegrade');
      return;
    }

    if (coi.shouldRegister() && !window.crossOriginIsolated && n.serviceWorker) {
      n.serviceWorker.register(window.document.currentScript.src).then(
        (registration) => {
          !coi.quiet && console.log('COOP/COEP SW enregistré', registration.scope);

          registration.addEventListener('updatefound', () => {
            window.sessionStorage.setItem('coiReloadedBySelf', 'updatefound');
            coi.doReload();
          });

          if (registration.active && !n.serviceWorker.controller) {
            window.sessionStorage.setItem('coiReloadedBySelf', 'notcontrolling');
            coi.doReload();
          }
        },
        (err) => !coi.quiet && console.error('COOP/COEP SW échec :', err)
      );
    }
  })();
}
