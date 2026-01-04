(() => {
  const config = window.RECAPTCHA_CONFIG || {};
  const form = document.querySelector(config.formSelector || ".contact-form");
  const widget = document.querySelector(config.widgetSelector || ".g-recaptcha");

  if (!form || !widget) {
    return;
  }

  const modeValue = config.mode || form.dataset.recaptchaMode || "v2-visible";
  const mode = modeValue.toLowerCase();
  const siteKey = config.siteKey || widget.dataset.sitekey;
  const action = config.action || form.dataset.recaptchaAction || "submit";

  if (!siteKey) {
    return;
  }

  const ensureTokenField = () => {
    let field = form.querySelector('input[name="g-recaptcha-response"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = "g-recaptcha-response";
      form.appendChild(field);
    }
    return field;
  };

  const loadScript = (src) =>
    new Promise((resolve) => {
      const existing = document.querySelector(`script[src^="${src}"]`);
      if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
        resolve();
        return;
      }
      if (existing) {
        existing.addEventListener("load", () => resolve());
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", () => resolve());
      document.head.appendChild(script);
    });

  if (mode === "v3") {
    widget.style.display = "none";
    const tokenField = ensureTokenField();
    const scriptSrc = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
      siteKey
    )}`;

    loadScript(scriptSrc).then(() => {
      form.addEventListener("submit", (event) => {
        if (form.dataset.recaptchaReady === "true") {
          return;
        }
        event.preventDefault();
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action })
            .then((token) => {
              tokenField.value = token;
              form.dataset.recaptchaReady = "true";
              form.submit();
            });
        });
      });
    });
    return;
  }

  loadScript("https://www.google.com/recaptcha/api.js").then(() => {
    if (mode !== "v2-invisible") {
      return;
    }

    widget.setAttribute("data-size", "invisible");
    widget.setAttribute("data-callback", "recaptchaV2Callback");

    const tokenField = ensureTokenField();
    window.recaptchaV2Callback = (token) => {
      tokenField.value = token;
      form.dataset.recaptchaReady = "true";
      form.submit();
    };

    form.addEventListener("submit", (event) => {
      if (form.dataset.recaptchaReady === "true") {
        return;
      }
      event.preventDefault();
      window.grecaptcha.execute();
    });
  });
})();
