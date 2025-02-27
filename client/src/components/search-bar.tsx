
import React from 'react';
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Rechercher..."
        className="pl-8"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
