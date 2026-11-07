/* ============================================================
   EVORA — event dataset
   All dates are ISO-8601 local start times. price 0 = free.
   ============================================================ */

const EVENTS = [
  {
    id: "ember-oak",
    title: "Ember & Oak: A Winter Supper Club",
    category: "Food & Drink",
    date: "2026-11-14T19:00:00",
    venue: "The Verandah, Indiranagar",
    city: "Bengaluru",
    price: 2400,
    capacity: 48,
    booked: 41,
    featured: false,
    blurb: "A seven-course fire-kissed menu served at one long teak table",
    description: [
      "Chef Meera Kulkarni opens her courtyard kitchen for a single November evening. Seven courses cooked over mango-wood embers, paired with a short list of natural wines and a longer list of strangers who will not stay strangers.",
      "Seats are communal and dietary notes are honoured with a week's notice. Arrive hungry; leave with the recipes."
    ]
  },
  {
    id: "signal-summit",
    title: "Signal: The Product & Futures Summit",
    category: "Technology",
    date: "2026-11-21T09:30:00",
    venue: "MLR Convention Centre",
    city: "Bengaluru",
    price: 1800,
    capacity: 400,
    booked: 312,
    featured: true,
    blurb: "One day of sharp talks on building products India actually uses",
    description: [
      "Fourteen practitioners — founders, design leads and two stubborn contrarians — on what the next decade of Indian software looks like when the cheap-copy era ends.",
      "No panels longer than forty minutes, no sponsor decks on stage. Lunch, chai and the hallway track are included in the ticket."
    ]
  },
  {
    id: "vernissage",
    title: "Vernissage: New Voices in Contemporary Art",
    category: "Art & Design",
    date: "2026-11-28T17:00:00",
    venue: "Bikaner House",
    city: "New Delhi",
    price: 0,
    capacity: 220,
    booked: 148,
    featured: false,
    blurb: "Opening night for nine emerging artists, with the curators in the room",
    description: [
      "Nine artists under thirty-five take over Bikaner House's galleries for an opening that doubles as a conversation — the curators walk the floor all evening and expect to be argued with.",
      "Entry is free with a pass. The exhibition then runs for three weeks; tonight is for first looks and unguarded opinions."
    ]
  },
  {
    id: "analog-sundays",
    title: "Analog Sundays: A Vinyl Listening Session",
    category: "Music",
    date: "2026-12-06T16:00:00",
    venue: "antiSocial, Khar",
    city: "Mumbai",
    price: 900,
    capacity: 90,
    booked: 67,
    featured: false,
    blurb: "One album, front to back, on a system that costs more than a car",
    description: [
      "This Sunday's pick: a 1974 pressing chosen by the room's resident collector. Phones stay in pockets, drinks stay low, and the record plays once — all the way through.",
      "After the side-B fade, the floor opens for whoever wants to put the next needle down. Bring a record if you're brave."
    ]
  },
  {
    id: "coastal-21k",
    title: "Monsoon Marathon: Coastal 21K",
    category: "Sports & Fitness",
    date: "2026-12-13T05:30:00",
    venue: "Marine Drive start line",
    city: "Kochi",
    price: 1200,
    capacity: 1500,
    booked: 1180,
    featured: false,
    blurb: "A half-marathon along the harbour, timed for first light",
    description: [
      "Twenty-one kilometres of flat, fast tarmac between the harbour and the fishing villages, run before the city fully wakes. Pacers for 1:45, 2:00 and 2:20 buses.",
      "Registration includes a chip-timed bib, two hydration stops per 5K, breakfast at the finish village and the year's best sunrise, weather permitting."
    ]
  },
  {
    id: "founders-table",
    title: "The Founders' Table: Winter Cohort",
    category: "Business",
    date: "2026-12-19T18:30:00",
    venue: "WeWork Galaxy, Residency Rd",
    city: "Bengaluru",
    price: 3500,
    capacity: 36,
    booked: 29,
    featured: true,
    blurb: "A closed-room dinner for twelve founders and twelve honest questions",
    description: [
      "Twelve seats, twelve founders, one long table. The evening's single rule: every question asked in the room must be one you would answer yourself on record.",
      "A senior operator hosts and keeps score. Chatham House applies; what is said at the table funds what is admitted at the table."
    ]
  },
  {
    id: "solstice-strings",
    title: "Solstice Strings: Chamber Music Under Stars",
    category: "Music",
    date: "2026-12-21T19:30:00",
    venue: "Amber Fort Courtyard",
    city: "Jaipur",
    price: 1500,
    capacity: 180,
    booked: 173,
    featured: true,
    blurb: "A string quartet plays the longest night of the year, outdoors",
    description: [
      "On the winter solstice, a quartet takes the Amber Fort courtyard at dusk: Dvořák, a new commission, and one raga transcription written for the occasion.",
      "Blankets and chai are provided; the desert does the rest. This is the season's single most requested evening — the courtyard holds 180 and no more."
    ]
  },
  {
    id: "type-terrain",
    title: "Type & Terrain: A Lettering Retreat",
    category: "Art & Design",
    date: "2027-01-09T10:00:00",
    venue: "Norbulingka Institute",
    city: "Dharamshala",
    price: 4800,
    capacity: 24,
    booked: 11,
    featured: false,
    blurb: "Three mornings of hand-lettering in the foothills, taught slowly",
    description: [
      "A working retreat at the Norbulingka craft campus: broad-nib fundamentals, Devanagari calligraphy, and one afternoon carving a colophon stamp in the institute's own workshops.",
      "Materials, lunches and mountain air included. Limited to twenty-four hands so the feedback stays personal."
    ]
  },
  {
    id: "ferment-fest",
    title: "Ferment Fest: Kimchi, Kombucha & Co.",
    category: "Food & Drink",
    date: "2027-01-16T11:00:00",
    venue: "Assagao Community Hall",
    city: "Goa",
    price: 1100,
    capacity: 140,
    booked: 96,
    featured: false,
    blurb: "A day of living food — stalls, swaps and a very loud tasting tent",
    description: [
      "Twenty producers of things that bubble, brine and culture take over the Assagao hall for Goa's only fermentation fair. Sourdough swaps, kimchi tastings and a SCOBY clinic for the infected-curious.",
      "Your pass includes a tasting flight and a jar to take home. Bring a ferment to swap and the entry fee is forgiven."
    ]
  },
  {
    id: "mind-the-breath",
    title: "Mind the Breath: A Stillness Intensive",
    category: "Wellness",
    date: "2027-01-23T07:00:00",
    venue: "Zorba the Buddha",
    city: "New Delhi",
    price: 2000,
    capacity: 60,
    booked: 38,
    featured: false,
    blurb: "A silent morning of breathwork and meditation in six acres of green",
    description: [
      "Four guided hours — pranayama, a long sit, and a walking meditation through the gardens — led by a teacher who speaks rarely and precisely.",
      "Open to complete beginners; the only prerequisite is arriving on time. Phones are checked at the gate and returned with tea."
    ]
  },
  {
    id: "circuit-breakers",
    title: "Circuit Breakers: Hardware Hack Night",
    category: "Technology",
    date: "2027-01-30T18:00:00",
    venue: "T-Hub, Raidurg",
    city: "Hyderabad",
    price: 0,
    capacity: 120,
    booked: 84,
    featured: false,
    blurb: "Solder, sensors and street snacks. Build something useless, beautifully",
    description: [
      "An open hack night for people who miss touching hardware. Bring a half-finished board, a weird sensor, or nothing at all — the parts wall is communal and the mentors roam.",
      "Demos at ten sharp, voted by decibel meter. The winning useless machine takes home the golden multimeter."
    ]
  },
  {
    id: "raga-at-dawn",
    title: "Raga at Dawn: An Ustad's Morning",
    category: "Music",
    date: "2027-02-06T06:00:00",
    venue: "Chowmahalla Palace",
    city: "Hyderabad",
    price: 1300,
    capacity: 150,
    booked: 61,
    featured: false,
    blurb: "Bhairav and Bhairavi in the Durbar Hall as the light comes up",
    description: [
      "Morning ragas belong to morning light. An ustad and his ensemble perform Bhairav and Bhairavi in the Durbar Hall while the palace courtyard wakes outside the arches.",
      "The recital is followed by kahwa and questions. Doors open at 5:30 — the music waits for no one, and neither does the sun."
    ]
  }
];

/* Category order for the filter chips */
const CATEGORIES = ["All", "Music", "Technology", "Art & Design", "Food & Drink", "Business", "Wellness", "Sports & Fitness"];
