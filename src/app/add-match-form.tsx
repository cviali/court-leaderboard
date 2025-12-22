"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { Player, Court } from "@/lib/types";
import { sports } from "@/lib/constants";
import { toast } from "sonner";
import { revalidateLeaderboard } from "./actions";
import { Search, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormSchema = z.object({
  winnerId: z.string().min(1, "Please select a winner"),
  loserId: z.string().min(1, "Please select a loser"),
  sport: z.enum(sports),
  courtId: z.string().min(1, "Please select a court"),
});

interface AddMatchFormProps {
  onSuccess?: () => void;
  className?: string;
}

function PlayerSearchSelect({
  value,
  onChange,
  disabled,
  placeholder = "Select player...",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setSelectedName("");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        setLoading(true);
        // Encode the query to handle special characters correctly
        const encodedQuery = encodeURIComponent(query);
        // Only fetch if open is true. If query is empty, we might want to fetch recent or top players.
        // But if query is present, we definitely want to search.
        const url = query 
          ? `/api/players?search=${encodedQuery}&limit=10`
          : `/api/players?limit=10`; // Fetch top 10 if no query

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            setResults(data as Player[]);
            setLoading(false);
          });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (player: Player) => {
    onChange(player.id.toString());
    setSelectedName(player.name);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={selectedName ? "" : "text-muted-foreground"}>
          {selectedName || placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search players..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No player found.</div>
            ) : (
              results.map((player) => (
                <div
                  key={player.id}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === player.id.toString() && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(player)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === player.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {player.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddMatchForm({ onSuccess, className }: AddMatchFormProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/courts")
      .then((res) => res.json())
      .then((data) => setCourts(data as Court[]));
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      winnerId: "",
      loserId: "",
      sport: "padel",
      courtId: "",
    },
  });

  const selectedSport = form.watch("sport");

  useEffect(() => {
    form.setValue("courtId", "");
  }, [selectedSport, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.winnerId === data.loserId) {
      form.setError("loserId", {
        type: "manual",
        message: "Winner and loser cannot be the same person",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId: parseInt(data.winnerId),
          loserId: parseInt(data.loserId),
          sport: data.sport,
          courtId: parseInt(data.courtId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record match");
      }

      toast.success("Match recorded successfully!");
      await revalidateLeaderboard();
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      toast.error("Failed to record match. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
        <FormField
          control={form.control}
          name="winnerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Winner</FormLabel>
              <FormControl>
                <PlayerSearchSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  placeholder="Select winner"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="loserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loser</FormLabel>
              <FormControl>
                <PlayerSearchSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  placeholder="Select loser"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="courtId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Court</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a court" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courts
                    .filter((court) => court.type === selectedSport)
                    .map((court) => (
                    <SelectItem key={court.id} value={court.id.toString()}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Recording..." : "Record Match"}
        </Button>
      </form>
    </Form>
  );
}
