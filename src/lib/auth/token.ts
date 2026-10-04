type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

let tokenGetter: TokenGetter = () => null;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let handlingUnauthorized = false;

export function registerAuthTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

export function getAuthToken(): string | null {
  try {
    return tokenGetter();
  } catch {
    return null;
  }
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  if (handlingUnauthorized) {
    return;
  }

  handlingUnauthorized = true;
  try {
    unauthorizedHandler?.();
  } finally {
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        handlingUnauthorized = false;
      }, 1000);
    } else {
      handlingUnauthorized = false;
    }
  }
}
