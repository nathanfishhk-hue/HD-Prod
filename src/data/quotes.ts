export interface HitQuote {
  quote: string;
  author: 'Mike Mentzer' | 'Dorian Yates' | 'Arthur Jones';
  context: string;
}

export const strokeQuotes: HitQuote[] = [
  {
    quote: "If you train with maximum intensity, you cannot train for long. High intensity and long duration are mutually exclusive.",
    author: "Mike Mentzer",
    context: "Heavy Duty Principle #1"
  },
  {
    quote: "Intensity is not just a high level of effort; it is the absolute maximum effort that humanly can be exerted.",
    author: "Mike Mentzer",
    context: "Failure & Absolute Intensity"
  },
  {
    quote: "You don't need 20 sets per bodypart. You need ONE set pushed past the threshold of complete muscular failure.",
    author: "Dorian Yates",
    context: "Blood & Guts Methodology"
  },
  {
    quote: "The final rep is the set. Every rep before that is just preparation to get to that true test of effort.",
    author: "Dorian Yates",
    context: "Temple Gym Mindset"
  },
  {
    quote: "It's not how much work you do in the gym; it's how much stimulation you provide and how well you recover outside the gym.",
    author: "Arthur Jones",
    context: "Nautilus Founder Principle"
  },
  {
    quote: "Lower the weight under strict 4-second control. Controlled negatives recruit maximum high-threshold motor units.",
    author: "Mike Mentzer",
    context: "Heavy Duty Tempo Rule"
  },
  {
    quote: "Double progression: when you hit the top of your prescribed rep range with perfect form, add weight next workout.",
    author: "Dorian Yates",
    context: "Progressive Overload Rule"
  },
  {
    quote: "Train like a savage, recover like a king. Recomposition requires precise recovery and high protein.",
    author: "Mike Mentzer",
    context: "Recomp & Recovery"
  }
];

export function getRandomQuote(): HitQuote {
  const index = Math.floor(Math.random() * strokeQuotes.length);
  return strokeQuotes[index];
}
