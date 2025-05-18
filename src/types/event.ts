export interface Event {
  id: string;
  title: string;
  location: string;
  time: string; // Example: "05:00 PM - 10:00 PM"
  date: {
    day: number;
    month: string; // Short form like "Jan", "Feb", etc.
  };
  price: number;
  imageUrl: string;
  description?: string;
  categories?: string[]; // Optional, e.g., ["Food", "Music", "Tech"]
  isMine?: boolean; // Optional, to flag if it's user's own event
}
