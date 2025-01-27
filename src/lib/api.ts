import { CookieF } from "@/API";

type Settings = {
  method: "GET" | "POST";
  body?: object;
  url: string;
};

const makeHRMRequest = async (settings: Settings) => {
  const response = await fetch(`/api/Mobile-SSO${settings.url}`, {
    method: settings.method,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
    body: settings.body && JSON.stringify(settings.body),
  });

  if (response.status >= 300) {
    console.log(response);
    throw new Error("Something went wrong with the request");
  }

  return response;
};

export const testConnection = async () => {
  const response = await makeHRMRequest({
    method: "POST",
    url: "/home/GetRequestToken",
  });

  const body = await response.json();
  if ("Token" in body) {
    return true;
  }
  return false;
};

export const getFreeDays = async (
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
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    document.cookie = cookie.cookie;
    document.cookie = cookie.cookie1;

    const response = await makeHRMRequest({
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

export const getGeoLocations = async () => {
  const response = await makeHRMRequest({
    method: "POST",
    url: "/Stampling/GetClockingSettings",
  });

  const json: {
    ClockingLocations: {
      Latitude: number;
      Longitude: number;
      Radius: number;
      Name: string;
    }[];
  } = await response.json();

  return json.ClockingLocations;
};
