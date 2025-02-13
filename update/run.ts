import * as fs from "fs/promises";
import { addDays, subDays, format } from "date-fns";

type CookieF = {
  cookie: string;
  cookie1: string;
};

type Settings = {
  method: "GET" | "POST";
  body?: object;
  url: string;
  cookie: string;
};

const makeHRMRequest = async (settings: Settings) => {
  console.log(settings);
  const response = await fetch(
    `https://flex.skistar.com/Mobile-SSO${settings.url}`,
    {
      method: settings.method,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        cookie: settings.cookie,
      },
      body: settings.body && JSON.stringify(settings.body),
    }
  );

  if (response.status >= 300) {
    console.log(response);
    const text = await response.text();
    console.log(text);
    throw new Error("Something went wrong with the request");
  }

  return response;
};

const getFreeDays = async (
  {
    end,
    start,
  }: {
    start: string;
    end: string;
  },
  cookies: CookieF[]
) => {
  console.log("Get free days", start, end, cookies);
  const withC = async (cookie: CookieF) => {
    console.log("with cookies", cookie);

    const response = await makeHRMRequest({
      cookie: `${cookie.cookie}; ${cookie.cookie1}`,
      method: "POST",
      url: "/Arbetspass/GetEmployeeScheduleDetailsRows",
      body: {
        FromDate: start,
        ToDate: end,
        EmployeeSelectionFilter: {
          TimegroupId: null,
          Accountings: [],
        },
        AccountingId: "",
        OnlyWorkingAtDates: false,
        PageSize: 500,
        SearchWord: "",
        IsBemanning: true,
      },
    });

    const json: {
      EmployeeScheduleDetailRows: {
        Employee: {
          EmployeeId: string;
          FirstName: string;
          LastName: string;
        };
        ScheduleDetailBubbleList: {
          Date: string;
          FromTime: string;
          ToTime: string;
          Description: string;
          Color: {
            BackgroundColor: string;
          };
        }[];
      }[];
    } = await response.json();
    return json;
  };

  const res: {
    EmployeeScheduleDetailRows: {
      Employee: {
        EmployeeId: string;
        FirstName: string;
        LastName: string;
      };
      ScheduleDetailBubbleList: {
        Date: string;
        FromTime: string;
        ToTime: string;
        Description: string;
        Color: {
          BackgroundColor: string;
        };
      }[];
    }[];
  }[] = [];
  for (let i = 0; i < cookies.length; i++) {
    try {
      const users = await withC(cookies[i]);
      res.push(users);
    } catch (e) {
      console.log("Error with cookie", e);
    }
  }
  return res;
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
    throw new Error("wrong auth cookie");
  }
  return {
    cookie: `HRMMobileFedauth=${auth1}`,
    cookie1: `HRMMobileFedauth1=${ensureBase64Padding(auth2)}`,
  };
};

const run = async () => {
  console.log("Running update command");

  const cookie1 = (await fs.readFile("./public/cookie.txt")).toString();

  const a = await getFreeDays(
    {
      start: format(subDays(new Date(), 3), "yyyy-MM-dd"),
      end: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    },
    [parseCookie(cookie1)]
  );

  console.log(a);
  const formatted = {
    lastUpdated: format(new Date(), "yyyy-MM-dd"),
    users: a.flatMap((i) => i.EmployeeScheduleDetailRows),
  };
  await fs.writeFile(
    "./public/schedule.json",
    JSON.stringify(formatted, null, 2)
  );
};

run();
