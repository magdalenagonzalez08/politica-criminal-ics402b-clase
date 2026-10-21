(function () {
  var KEY = "pc_clase_sesion";
  var session = null;

  try {
    session = JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch (error) {
    session = null;
  }

  if (!session || !session.u || !session.exp || Date.now() > session.exp) {
    try { sessionStorage.removeItem(KEY); } catch (error) {}
    document.documentElement.style.display = "none";
    window.location.replace("login.html");
    return;
  }

  window.USUARIO_ACTUAL = session;

  document.addEventListener("DOMContentLoaded", function () {
    var name = document.getElementById("userName");
    var initial = document.getElementById("userInitial");
    var logout = document.getElementById("logoutBtn");
    var visibleName = session.n || session.u;

    if (name) name.textContent = visibleName;
    if (initial) initial.textContent = visibleName.trim().charAt(0).toUpperCase();
    if (logout) {
      logout.addEventListener("click", function () {
        sessionStorage.removeItem(KEY);
        window.location.replace("login.html");
      });
    }
  });
})();
