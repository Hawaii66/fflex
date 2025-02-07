import { getFreeDays } from "@/lib/api";
import {
  addDays,
  differenceInSeconds,
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";
import { useContext, useEffect, useState } from "react";
import { MultiSelect } from "./multi-select";
import { User } from "@/types";
import { CookieContext } from "@/API";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

const start = subDays(new Date(), 3);
const end = addDays(new Date(), 30);

export default function FreeDays() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<{ name: string; ids: string[] }[]>([]);
  const [showTime, setShowTime] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const cookies = useContext(CookieContext);

  useEffect(() => {
    const load = async () => {
      const users = await getFreeDays(
        {
          start: format(start, "yyyy-MM-dd"),
          end: format(end, "yyyy-MM-dd"),
        },
        cookies
      );
      const user = users.flatMap((i) => i.EmployeeScheduleDetailRows);
      setUsers(
        user.map((i) => ({
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
          onValueChange={setFilteredUsers}
          placeholder="Filter users"
        />
      </div>
      <div className="p-4 pb-2 w-full">
        <MultiSelect
          options={groups.map((i) => ({
            label: i.name,
            value: i.name,
          }))}
          onValueChange={setFilteredGroups}
          placeholder="Filter groups"
        />
      </div>
      <div className="flex flex-row justify-start items-center gap-2 p-4 pt-0 w-full">
        <Label className="pl-4 text-muted-foreground text-sm">Visa tider</Label>
        <Checkbox
          checked={showTime}
          onCheckedChange={(s) => typeof s === "boolean" && setShowTime(s)}
        />
      </div>

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
            className="font-bold text-center text-sm"
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
                className="text-right left-0 sticky flex justify-end items-center bg-white pr-2 font-semibold text-sm"
              >
                {user.name}
              </p>
              {user.schedule.map((s) => (
                <div
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
                      {format(s.from, "hh:mm")}-{format(s.to, "hh:mm")}
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
