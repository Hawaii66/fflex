import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onSuccess: () => void;
};

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

export default function GetToken({ onSuccess }: Props) {
  return (
    <div className="flex flex-col justify-center items-center gap-4 w-screen h-screen">
      <Label>Cookie</Label>
      <Input
        className="w-64"
        placeholder="Paste cookie here"
        onChange={(e) => {
          const token = parseCookie(e.target.value);
          if (!token) {
            alert("Failed to parse cookie");
            return;
          }
          onSuccess();
        }}
      />
    </div>
  );
}
