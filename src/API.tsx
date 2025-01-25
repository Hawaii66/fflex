import { useEffect, useState } from "react";
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
    return false;
  }
  document.cookie = `HRMMobileFedauth=${auth1}`;
  document.cookie = `HRMMobileFedauth1=${ensureBase64Padding(auth2)}`;
  return true;
};

const secretPassword = "fflex";

export function APIWrapper({ children }: Children) {
  const [hasToken, setHasToken] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const t = async () => {
      const cookie = await fetch("/cookie.txt");
      const text = await cookie.text();
      parseCookie(text);
      setHasToken(true);
    };
    t();
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

  return children;
}
