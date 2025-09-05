import { SearchInput } from "../SearchInput";

type Props = {
  search: string;
  setSearch: (search: string) => void;
};

export function SearchBar({ search, setSearch }: Props) {
  const handleClear = () => {
    setSearch("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 mt-4">
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <SearchInput
          placeholder="Search boxes..."
          className="w-full sm:w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={handleClear}
          showClearButton={true}
        />
      </div>
    </div>
  );
}
