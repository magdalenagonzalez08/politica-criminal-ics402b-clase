(function () {
  var KEY = "pc_clase_sesion";
  var ATTEMPTS = "pc_clase_intentos";
  var MAX_ATTEMPTS = 5;
  var LOCK_MS = 5 * 60 * 1000;
  var SESSION_MS = 8 * 60 * 60 * 1000;
  var ITERATIONS = 210000;

  var form = document.getElementById("loginForm");
  var userInput = document.getElementById("usuario");
  var passInput = document.getElementById("clave");
  var button = document.getElementById("loginBtn");
  var errorBox = document.getElementById("loginError");
  var busy = false;

  function fromBase64(value) {
    var raw = atob(value);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function equalBytes(a, b) {
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  function readAttempts() {
    try {
      return JSON.parse(localStorage.getItem(ATTEMPTS) || "{}");
    } catch (error) {
      return {};
    }
  }

  function writeAttempts(data) {
    try {
      localStorage.setItem(ATTEMPTS, JSON.stringify(data));
    } catch (error) {}
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function lockedUntil(username) {
    var record = readAttempts()[username];
    return record && record.until && record.until > Date.now() ? record.until : 0;
  }

  function registerFailure(username) {
    var data = readAttempts();
    var record = data[username] || { count: 0, until: 0 };
    data[username] = record;
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.count = 0;
      record.until = Date.now() + LOCK_MS;
      writeAttempts(data);
      return "Demasiados intentos. Espera 5 minutos antes de volver a probar.";
    }
    writeAttempts(data);
    var left = MAX_ATTEMPTS - record.count;
    return "Usuario o clave incorrectos. Te quedan " + left + " intento" + (left === 1 ? "" : "s") + ".";
  }

  function clearFailures(username) {
    var data = readAttempts();
    delete data[username];
    writeAttempts(data);
  }

  function validSession() {
    try {
      var session = JSON.parse(sessionStorage.getItem(KEY) || "null");
      return session && session.u && session.exp && Date.now() < session.exp;
    } catch (error) {
      return false;
    }
  }

  async function derive(password, salt, iterations) {
    var material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    var bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
      material,
      256
    );
    return new Uint8Array(bits);
  }

  function findUser(username) {
    return (window.USUARIOS || []).find(function (item) {
      return item.u === username;
    });
  }

  if (validSession()) {
    window.location.replace("index.html");
    return;
  }

  if (userInput) userInput.focus();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (busy) return;
    clearError();

    var username = userInput.value.trim().toLowerCase();
    var password = passInput.value.trim();

    if (!username || !password) {
      showError("Escribe tu usuario y tu clave.");
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      showError("Este navegador no permite iniciar sesión. Usa Chrome, Edge o Safari actualizado.");
      return;
    }

    var until = lockedUntil(username);
    if (until) {
      var minutes = Math.max(1, Math.ceil((until - Date.now()) / 60000));
      showError("Demasiados intentos. Espera " + minutes + " minuto" + (minutes === 1 ? "" : "s") + ".");
      return;
    }

    busy = true;
    button.disabled = true;
    button.textContent = "Entrando…";

    try {
      var user = findUser(username);
      var valid = false;

      if (user) {
        var salt = fromBase64(user.s);
        var expected = fromBase64(user.h);
        var actual = await derive(password, salt, user.i || ITERATIONS);
        valid = equalBytes(actual, expected);
      } else {
        await derive(password, new Uint8Array(16), ITERATIONS);
      }

      if (!valid) {
        passInput.value = "";
        passInput.focus();
        showError(registerFailure(username));
        return;
      }

      clearFailures(username);
      sessionStorage.setItem(KEY, JSON.stringify({
        u: user.u,
        n: user.n,
        exp: Date.now() + SESSION_MS
      }));
      window.location.replace("index.html");
    } catch (error) {
      showError("No se pudo validar el acceso. Inténtalo otra vez.");
    } finally {
      busy = false;
      button.disabled = false;
      button.textContent = "Entrar";
    }
  });
})();
