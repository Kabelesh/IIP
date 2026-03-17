/* ============================================================
   js/modules/admin/admin.js  —  Admin Module (localStorage only)
   Password stored as plaintext hash in localStorage.
   No server, no auth.php, no sessions.
   ============================================================ */
const Admin = (() => {
  'use strict';

  const ADMIN_PWD_KEY = 'ibm_admin_pwd_v1';
  const DEFAULT_PWD   = 'admin123';

  let _role  = 'write';
  let _actor = 'Admin';

  function _getLsPwd() {
    try { return localStorage.getItem(ADMIN_PWD_KEY) || DEFAULT_PWD; }
    catch(e) { return DEFAULT_PWD; }
  }
  function _setLsPwd(pwd) {
    try { localStorage.setItem(ADMIN_PWD_KEY, pwd); } catch(e) {}
  }

  function updateHeader() {
    const adminBtn = document.getElementById('admin-btn');
    const isAdmin  = (typeof Data !== 'undefined') ? Data.isAdmin() : false;
    if (adminBtn) {
      const lockSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
      if (isAdmin) {
        adminBtn.innerHTML = `${lockSvg} Logout`;
        adminBtn.title     = `Logged in as ${_actor} — click to logout`;
        adminBtn.style.color = 'var(--red)';
      } else {
        adminBtn.innerHTML   = `${lockSvg} Admin`;
        adminBtn.title       = 'Login as Admin';
        adminBtn.style.color = '';
      }
    }
  }

  function showLoginModal() {
    const existing = document.getElementById('admin-login-modal');
    if (existing) { existing.remove(); }

    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.style.cssText = [
      'position:fixed;inset:0;z-index:var(--z-modal)',
      'display:flex;align-items:center;justify-content:center',
      'background:rgba(0,0,0,0.55)'
    ].join(';');

    modal.innerHTML = `
      <div style="background:var(--bg-ui);border-radius:var(--radius-lg);padding:32px 36px;width:340px;box-shadow:var(--shadow-xl)">
        <h3 style="margin:0 0 20px;font-size:16px;font-weight:700;color:var(--text-primary)">Admin Login</h3>
        <input id="admin-pwd-input" type="password" placeholder="Password"
          style="width:100%;padding:9px 12px;border:1px solid var(--border-mid);border-radius:var(--radius-sm);font-size:14px;margin-bottom:14px;box-sizing:border-box;background:var(--bg-input);color:var(--text-primary)"/>
        <div id="admin-login-err" style="color:var(--red);font-size:12px;margin-bottom:10px;display:none">Incorrect password</div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="admin-login-cancel" class="btn btn-ghost btn-sm">Cancel</button>
          <button id="admin-login-submit" class="btn btn-primary btn-sm">Login</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const input  = modal.querySelector('#admin-pwd-input');
    const errEl  = modal.querySelector('#admin-login-err');
    const submit = modal.querySelector('#admin-login-submit');
    const cancel = modal.querySelector('#admin-login-cancel');

    const _attempt = () => {
      const pwd = input.value;
      if (pwd === _getLsPwd()) {
        modal.remove();
        if (typeof Data !== 'undefined') Data.setAdminMode(true);
        updateHeader();
        try { if (typeof App !== 'undefined') App.renderTab('admin'); } catch(e) {}
      } else {
        errEl.style.display = '';
        input.value = '';
        input.focus();
      }
    };

    submit.addEventListener('click', _attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') _attempt(); });
    cancel.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => input.focus(), 50);
  }

  function logout() {
    if (typeof Data !== 'undefined') Data.setAdminMode(false);
    updateHeader();
    try { if (typeof App !== 'undefined') App.renderTab('overview'); } catch(e) {}
  }

  async function changePassword(currentPwd, newPwd) {
    if (currentPwd !== _getLsPwd()) return { ok: false, error: 'Current password incorrect' };
    _setLsPwd(newPwd);
    return { ok: true };
  }

  function _wireAdminBtn() {
    const btn = document.getElementById('admin-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (typeof Data !== 'undefined' && Data.isAdmin()) logout();
      else showLoginModal();
    });
  }

  function _wireAdminNavItem() {
    const navBtn = document.getElementById('nav-admin-portal');
    if (!navBtn) return;
    navBtn.addEventListener('click', e => {
      if (typeof Data !== 'undefined' && !Data.isAdmin()) {
        e.stopImmediatePropagation();
        showLoginModal();
      }
    }, true);
  }

  function _wireNavDirtyGuard() {} // no-op without server sessions

  function setDirtyGuard() {}

  async function checkSession() { return false; }

  async function init() {
    updateHeader();
    _wireAdminBtn();
    _wireAdminNavItem();
    _wireNavDirtyGuard();
    // Restore admin session from sessionStorage (survives F5 but not tab close)
    try {
      if (sessionStorage.getItem('ibm_admin_session_v1') === '1') {
        if (typeof Data !== 'undefined') Data.setAdminMode(true);
        updateHeader();
      }
    } catch(e) {}
  }

  return { init, updateHeader, showLoginModal, logout, checkSession, changePassword, getActor: () => _actor, getRole: () => _role, isWriter: () => true, setDirtyGuard };
})();
