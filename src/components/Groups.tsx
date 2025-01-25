import { getFreeDays } from "@/lib/api";
import { User } from "@/types";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { MultiSelect } from "./multi-select";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Trash } from "lucide-react";

const start = new Date("2025-01-01");
const end = new Date("2025-02-28");

export default function Groups() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<{ name: string; ids: string[] }[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const load = async () => {
      const users = await getFreeDays({
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
      });
      setUsers(
        users.EmployeeScheduleDetailRows.map((i) => ({
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

      const groupsRes = await fetch("/groups.json");
      const groups: { name: string; ids: string[] }[] = await groupsRes.json();
      setGroups(groups);
    };
    load();
  }, []);

  return (
    <div>
      <div>
        <MultiSelect
          options={users.map((i) => ({ label: i.name, value: i.id }))}
          onValueChange={setFilteredUsers}
        />
        <Input
          placeholder="Name"
          value={name}
          onChange={(t) => setName(t.target.value)}
        />
        <Button
          onClick={() => {
            setGroups((g) => [...g, { name: name, ids: filteredUsers }]);
            setFilteredUsers([]);
            setName("");
          }}
        >
          Add Group
        </Button>
      </div>
      <Separator />
      {Array.from(groups).map((group) => (
        <Card>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {group.ids.map((id) => (
              <p>- {users.find((i) => i.id === id)!.name}</p>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                setGroups(groups.filter((i) => i.name !== group.name));
              }}
            >
              <Trash />
            </Button>
          </CardFooter>
        </Card>
      ))}
      <Button
        onClick={() =>
          window.navigator.clipboard.writeText(JSON.stringify(groups))
        }
      >
        Save
      </Button>
    </div>
  );
}
