// Simulated authentication: sign in, sign up, sign out, password reset and guest
// order lookup. Accounts live in this browser tab (see commerce-store.js).
import {
  continueAsSeededClient,
  getCurrentAccount,
  getSeededClient,
  lookupOrder,
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "./commerce-store.js?v=full-prototype";
import { bindFormValidation, escapeHtml, runRequest } from "./commerce-ui.js?v=full-prototype";
import { isDemoMode } from "./demo-mode.js";

// Only same-site page redirects are honoured after sign-in.
function nextPage(fallback = "account.html") {
  const next = new URLSearchParams(location.search).get("next") || "";
  return /^[a-z0-9&-]+\.html(?:[?#][\w=&.%-]*)?$/i.test(next) ? next : fallback;
}

export function initLogin() {
  const formsWrap = document.querySelector(".js-auth-forms");
  const signedInWrap = document.querySelector(".js-auth-signed-in");
  if (!formsWrap || !signedInWrap) return;
  const params = new URLSearchParams(location.search);
  const flash = document.querySelector(".js-auth-flash");

  const account = getCurrentAccount();
  if (account) {
    formsWrap.hidden = true;
    signedInWrap.hidden = false;
    signedInWrap.querySelector(".js-auth-signed-in-title").textContent = `You’re signed in as ${account.email}.`;
    signedInWrap.querySelector(".js-auth-sign-out").addEventListener("click", () => {
      signOut();
      location.href = "login.html?signedout=1";
    });
    return;
  }
  const continueAs = document.querySelector(".js-continue-as");
  const seeded = getSeededClient();
  if (continueAs && seeded) {
    continueAs.hidden = false;
    const button = continueAs.querySelector(".js-continue-as-button");
    button.textContent = `Continue as ${seeded.fullName}`;
    button.addEventListener("click", async () => {
      const error = continueAs.querySelector(".js-continue-as-error");
      const result = await runRequest(button, "Signing in…", () => continueAsSeededClient(), { errorElement: error });
      if (!result) return;
      if (!result.ok) { error.textContent = result.message; return; }
      location.href = nextPage();
    });
  }
  if (params.get("signedout")) flash.textContent = "You’re signed out. Your Bag and Saved pieces are still here when you return.";

  const tabs = [...document.querySelectorAll(".js-auth-tab")];
  const signinForm = document.querySelector(".js-signin-form");
  const signupForm = document.querySelector(".js-signup-form");
  const setMode = (mode, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle("active", active);
      if (active && focus) tab.focus();
    });
    signinForm.hidden = mode !== "signin";
    signupForm.hidden = mode !== "create";
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      setMode(tab.dataset.mode === "signin" ? "create" : "signin", true);
    });
  });
  setMode(params.get("mode") === "create" ? "create" : "signin");

  const validateSignin = bindFormValidation(signinForm);
  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = signinForm.querySelector(".js-signin-error");
    if (!validateSignin()) { error.textContent = "Enter your email and password."; return; }
    const result = await runRequest(signinForm.querySelector(".js-signin-submit"), "Signing in…", () => signIn(Object.fromEntries(new FormData(signinForm))), { errorElement: error });
    if (!result) return;
    if (!result.ok) { error.textContent = result.message; signinForm.elements.password.select(); return; }
    location.href = nextPage();
  });

  const validateSignup = bindFormValidation(signupForm);
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = signupForm.querySelector(".js-signup-error");
    if (!validateSignup()) { error.textContent = "Check the highlighted fields."; return; }
    if (signupForm.elements.password.value.length < 8) {
      error.textContent = "Use at least 8 characters for the password.";
      signupForm.elements.password.focus();
      return;
    }
    const result = await runRequest(signupForm.querySelector(".js-signup-submit"), "Creating account…", () => signUp(Object.fromEntries(new FormData(signupForm))), { errorElement: error });
    if (!result) return;
    if (!result.ok) { error.textContent = result.message; signupForm.elements[result.field || "email"]?.focus(); return; }
    location.href = nextPage();
  });
}

export function initForgotPassword() {
  const requestForm = document.querySelector(".js-reset-request");
  const confirmForm = document.querySelector(".js-reset-confirm");
  const done = document.querySelector(".js-reset-done");
  if (requestForm && confirmForm) {
    const validateRequest = bindFormValidation(requestForm);
    const validateConfirm = bindFormValidation(confirmForm);
    let email = "";
    requestForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const error = requestForm.querySelector(".js-reset-request-error");
      const status = requestForm.querySelector(".js-reset-request-status");
      if (!validateRequest()) return;
      email = requestForm.elements.email.value;
      const result = await runRequest(requestForm.querySelector(".js-reset-request-submit"), "Sending…", () => requestPasswordReset(email), { errorElement: error });
      if (!result) return;
      // Real stores email the code. With the hidden demo tools on (?demo=1) the
      // code is also shown here so the whole flow can be completed in one tab.
      const demoCode = result.demoCode && isDemoMode()
        ? ` <strong class="demo-reset-code">Demo tools: your code is <span class="js-reset-demo-code">${escapeHtml(result.demoCode)}</span>.</strong>`
        : "";
      status.innerHTML = `If an account exists for ${escapeHtml(email)}, we’ve sent a 6-digit code. It expires in 15 minutes.${demoCode}`;
      if (result.demoCode) {
        confirmForm.hidden = false;
        confirmForm.elements.code.focus();
      }
    });
    confirmForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const error = confirmForm.querySelector(".js-reset-confirm-error");
      if (!validateConfirm()) return;
      const result = await runRequest(confirmForm.querySelector(".js-reset-confirm-submit"), "Updating…", () => resetPassword({ email, code: confirmForm.elements.code.value, password: confirmForm.elements.password.value }), { errorElement: error });
      if (!result) return;
      if (!result.ok) { error.textContent = result.message; confirmForm.elements[result.field || "code"]?.focus(); return; }
      requestForm.hidden = true;
      confirmForm.hidden = true;
      done.hidden = false;
      done.querySelector("a").focus();
    });
  }

  const lookup = document.querySelector(".js-order-lookup");
  if (lookup) {
    const validate = bindFormValidation(lookup);
    lookup.addEventListener("submit", async (event) => {
      event.preventDefault();
      const error = lookup.querySelector(".js-lookup-error");
      if (!validate()) return;
      const result = await runRequest(lookup.querySelector(".js-lookup-submit"), "Searching…", () => lookupOrder(lookup.elements.orderId.value, lookup.elements.email.value), { errorElement: error });
      if (!result) return;
      if (!result.ok) { error.textContent = result.message; return; }
      location.href = `order.html?id=${encodeURIComponent(result.order.id)}`;
    });
  }
}
