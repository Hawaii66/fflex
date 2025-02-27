import { differenceInSeconds, eachDayOfInterval, format } from "date-fns";
import { useEffect, useState } from "react";
import { MultiSelect } from "./multi-select";
import { User } from "@/types";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
declare global {
  interface Window {
    plausible: (
      event: string,
      options?: { props?: Record<string, unknown> }
    ) => void;
  }
}
export default function FreeDays() {
  const [users, setUsers] = useState<User[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [groups, setGroups] = useState<{ name: string; ids: string[] }[]>([]);
  const [showTime, setShowTime] = useState(false);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data: {
        lastUpdated: string;
        start: string;
        end: string;
        users: {
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
      } = await (await fetch("./schedule.json")).json();

      setLastUpdated(data.lastUpdated);
      setUsers(
        data.users.map((i) => ({
          id: i.Employee.EmployeeId,
          name: `${i.Employee.FirstName} ${i.Employee.LastName}`,
          schedule: i.ScheduleDetailBubbleList.map((i) => ({
            date: new Date(i.Date),
            from: new Date(i.FromTime),
            to: new Date(i.ToTime),
            color: i.Color.BackgroundColor,
            description: i.Description,
          })),
        }))
      );
      setStart(new Date(data.start));
      setEnd(new Date(data.end));

      const groupRes = await fetch("/groups.json");
      setGroups(await groupRes.json());
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <div className="p-4 pb-2 w-full">
        <MultiSelect
          options={users.map((i) => ({
            label: i.name,
            value: i.id,
          }))}
          onValueChange={(s) => {
            setFilteredUsers(s);
            window.plausible("Filter users", { props: { users: s } });
          }}
          placeholder="Filter users"
        />
      </div>
      <div className="p-4 pb-2 w-full">
        <MultiSelect
          options={groups.map((i) => ({
            label: i.name,
            value: i.name,
          }))}
          onValueChange={(s) => {
            setFilteredGroups(s);
            window.plausible("Filter groups", { props: { groups: s } });
          }}
          placeholder="Filter groups"
        />
      </div>
      <div className="flex flex-row justify-start items-center gap-2 p-4 pt-0 w-full">
        <Label className="pl-4 text-muted-foreground text-sm">Visa tider</Label>
        <Checkbox
          checked={showTime}
          onCheckedChange={(s) => {
            if (typeof s === "boolean") {
              setShowTime(s);
              window.plausible("Show time", { props: { showTime: s } });
            }
          }}
        />
      </div>
      <h1 className="pl-4 font-bold text-black text-md">
        Last updated: {lastUpdated}
      </h1>

      <div
        className="relative grid p-4 pl-0 overflow-scroll"
        style={{
          gridTemplateColumns: `6em repeat(${
            eachDayOfInterval({ start, end }).length
          },10em)`,
        }}
      >
        <div className="left-0 sticky bg-white" />
        {eachDayOfInterval({ start, end }).map((day) => (
          <p
            key={format(day, "yyyyMMdd")}
            className="font-bold text-sm text-center"
          >
            {format(day, "yyyy-MM-dd EEE I")}
          </p>
        ))}
        {users
          .filter((i) =>
            filteredUsers.length === 0 ? true : filteredUsers.includes(i.id)
          )
          .filter((i) =>
            filteredGroups.length === 0
              ? true
              : groups
                  .filter((i) => filteredGroups.includes(i.name))
                  .flatMap((i) => i.ids)
                  .includes(i.id)
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((user) => (
            <>
              <p
                key={user.id}
                className="left-0 sticky flex justify-end items-center bg-white pr-2 font-semibold text-sm text-right"
              >
                {user.name}
              </p>
              {user.schedule.map((s) => (
                <div
                  key={format(s.date, "yyyyMMdd") + user.id}
                  style={{
                    backgroundColor: s.color,
                  }}
                  className="flex flex-col justify-center items-center m-2 p-2 rounded-sm h-16 text-center"
                >
                  <p key={user.id + format(s.date, "yyyyMMdd")}>
                    {s.description}
                  </p>
                  {differenceInSeconds(s.from, s.to) !== 0 && showTime && (
                    <p>
                      {format(s.from, "HH:mm")}-{format(s.to, "HH:mm")}
                    </p>
                  )}
                </div>
              ))}
            </>
          ))}
      </div>
    </div>
  );
}
