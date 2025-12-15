"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Player, Court } from "@/lib/types";
import { sports } from "@/lib/constants";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

export function AddMatchForm({ onSuccess, className }: AddMatchFormProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data as Player[]));

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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
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
          name="loserId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loser</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select loser" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
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
                      {sport}
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
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id.toString()}>
                      {court.name} ({court.type})
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
