export type ResultCompetition = {
  publicId: string;
  name: string;
};

export type ResultTeam = {
  id: number;
  teamName: string;
  playerNames: string[];
  status: "in_league" | "waitlist";
  competitionPublicId: string;
};
