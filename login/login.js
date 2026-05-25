document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const loginMsg = document.getElementById('loginMsg');
  const userInp = document.getElementById('username');
  const passInp = document.getElementById('password');

  async function handleLogin() {
    const u = userInp.value.trim();
    const p = passInp.value.trim();

    if (!u || !p) {
      showError('Please enter both username and password');
      return;
    }

    loginBtn.textContent = 'AUTHENTICATING...';
    loginBtn.disabled = true;
    loginMsg.classList.remove('show');

    try {
      // Call the API login function (from api.js)
      const res = await API.login(u, p);

      if (res.status === true || res.success === true || res.token) {
        
        // Save session data to sessionStorage
        sessionStorage.setItem('matka_user', JSON.stringify({
          id: res.id || res.user_id || (res.data && (res.data.id || res.data.user_id)) || "",
          user: res.username || res.user || (res.data && (res.data.username || res.data.user)) || u,
          balance: res.balance || (res.data && res.data.balance) || 0,
          token: res.token || (res.data && res.data.token) || null
        }));

        // Redirect to main game.html inside login folder
        window.location.href = 'login/game.html';
      } else {
        showError(res.message || 'Invalid Username or Password');
      }
    } catch (err) {
      console.error(err);
      showError('Server connection failed.');
    } finally {
      loginBtn.textContent = 'SIGN IN';
      loginBtn.disabled = false;
    }
  }

  function showError(msg) {
    loginMsg.textContent = msg;
    loginMsg.classList.add('show');
  }

  loginBtn.addEventListener('click', handleLogin);
  passInp.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
});
