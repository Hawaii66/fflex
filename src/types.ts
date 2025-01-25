export type Children = { children: React.ReactNode };

export type User = {
  name: string;
  id: string;
  schedule: {
    date: Date;
    from: Date;
    to: Date;
    description: string;
    color: string;
  }[];
};
