const GREETING_PHRASES = [
  "let's get to work",
  "let's make something wonderful",
  'ready to sparkle?',
  "let's add some magic to the shop",
  'time to get creative',
  "let's make some bracelets shine",
  'the bracelets are waiting for you',
  "let's make today a good one",
]

function timeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function getAdminGreeting(adminName) {
  const name = adminName ? adminName[0].toUpperCase() + adminName.slice(1) : 'there'
  const phrase = GREETING_PHRASES[Math.floor(Math.random() * GREETING_PHRASES.length)]
  return `${timeOfDayGreeting()}, ${name} — ${phrase}.`
}
