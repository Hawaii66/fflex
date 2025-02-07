import { createContext, useEffect, useRef, useState } from "react";
import { Children } from "./types";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";

const ensureBase64Padding = (token: string) => {
  while (token.length % 4 !== 0) {
    token += "=";
  }
  return token;
};

const parseCookie = (cookieString: string) => {
  const parsed = cookieString
    .split(";")
    .reduce<{ [key in string]: string }>((cookies, cookie) => {
      const [key, value] = cookie.split("=").map((part) => part.trim());
      if (key) cookies[key] = decodeURIComponent(value || "");
      return cookies;
    }, {});

  const auth1 = parsed["HRMMobileFedauth"];
  const auth2 = parsed["HRMMobileFedauth1"];
  if (
    auth1 === undefined ||
    auth1.trim().length === 0 ||
    auth2 === undefined ||
    auth2.trim().length === 0
  ) {
    return null;
  }
  return {
    cookie: `HRMMobileFedauth=${auth1}`,
    cookie1: `HRMMobileFedauth1=${ensureBase64Padding(auth2)}`,
  };
};

export type CookieF = {
  cookie: string;
  cookie1: string;
};

export const CookieContext = createContext<CookieF[]>([]);

const secretPassword = "fflex";

export function APIWrapper({ children }: Children) {
  const [hasToken, setHasToken] = useState(false);
  const [password, setPassword] = useState("");
  const [cookies, setCookies] = useState<CookieF[]>([]);

  const isLoading = useRef(false);

  useEffect(() => {
    if (isLoading.current) return;

    isLoading.current = true;
    console.log("Load cookies");
    const loadCookie = async (str: string) => {
      console.log("loading cookie", str);
      const cookie = await fetch(str);
      const text = await cookie.text();
      const t = parseCookie(text);
      if (!t) return;
      setCookies((o) => [...o, t]);
      setHasToken(true);
    };
    loadCookie("/cookie.txt");
  }, []);

  if (password !== secretPassword) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 px-8 w-screen h-screen">
        <h1 className="font-bold text-2xl">F Flex</h1>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    );
  }
  if (!hasToken) {
    return <p>Error loading</p>;
  }

  return (
    <CookieContext.Provider value={cookies}> {children}</CookieContext.Provider>
  );
}
