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

export const getFreeDays = async ({
  end,
  start,
}: {
  start: string;
  end: string;
}) => {
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
