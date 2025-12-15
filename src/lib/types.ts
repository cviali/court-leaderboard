export interface Player {
  id: number;
  name: string;
  points: number;
  lastMatchAt: Date | null;
  lastCourtId?: number | null;
  lastCourtName?: string | null;
}

export interface Match {
  id: number;
  winnerId: number;
  loserId: number;
  sport: "padel" | "tennis" | "badminton";
  courtId: number;
  createdAt: Date;
}

export interface Court {
  id: number;
  name: string;
  type: "padel" | "tennis" | "badminton";
}
