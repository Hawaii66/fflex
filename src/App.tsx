import { useState } from "react";
import { APIWrapper } from "./API";
import { Button } from "./components/ui/button";
import FreeDays from "./components/FreeDays";
import Groups from "./components/Groups";
import WorldMap from "./components/Map";

function App() {
  const [page, _setPage] = useState("");

  const setPage = (p: string) => {
    _setPage(p);
    window.plausible("Page", { props: { page: p } });
  };

  return (
    <APIWrapper>
      {page === "" && (
        <div className="flex flex-col justify-between items-center gap-8 w-screen h-screen">
          <div className="flex flex-col flex-grow justify-center items-center gap-4">
            <h1 className="font-bold text-2xl">F Flex</h1>
            <Button onClick={() => setPage("FreeDays")}>Schema</Button>
          </div>
          <div className="flex flex-row gap-4 pb-4">
            <Button onClick={() => setPage("Groups")}>Groups</Button>
            <Button onClick={() => setPage("Map")}>Map</Button>
          </div>
        </div>
      )}
      {page === "FreeDays" && <FreeDays />}
      {page === "Groups" && <Groups />}
      {page === "Map" && <WorldMap />}
    </APIWrapper>
  );
}

export default App;
