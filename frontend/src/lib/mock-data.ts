export const mockLeads = [
  { id: 1, firstName: "Marcus", lastName: "Williams", phone: "(404) 555-0192", email: "marcus.w@email.com", source: "CallRail", campaign: "Personal Injury - Google", score: 87, status: "Retained", assigned: "Sarah Chen", created: "2024-01-15" },
  { id: 2, firstName: "Diana", lastName: "Reyes", phone: "(305) 555-0847", email: "d.reyes@email.com", source: "Web Form", campaign: "Car Accident Landing Page", score: 72, status: "Consultation Scheduled", assigned: "James Park", created: "2024-01-16" },
  { id: 3, firstName: "Troy", lastName: "Henderson", phone: "(713) 555-0234", email: "troy.h@email.com", source: "CallRail", campaign: "Slip & Fall - Meta", score: 45, status: "Contacted", assigned: "Sarah Chen", created: "2024-01-17" },
  { id: 4, firstName: "Priya", lastName: "Sharma", phone: "(212) 555-0571", email: "priya.s@gmail.com", source: "Manual", campaign: "Referral", score: 91, status: "Consultation Completed", assigned: "Marcus Lee", created: "2024-01-18" },
  { id: 5, firstName: "Kevin", lastName: "O'Brien", phone: "(617) 555-0388", email: "kevin.ob@email.com", source: "CallRail", campaign: "Workers Comp - Google", score: 63, status: "New", assigned: "Unassigned", created: "2024-01-18" },
  { id: 6, firstName: "Alicia", lastName: "Torres", phone: "(214) 555-0149", email: "a.torres@email.com", source: "Web Form", campaign: "Personal Injury - Meta", score: 79, status: "Retained", assigned: "James Park", created: "2024-01-19" },
  { id: 7, firstName: "Derek", lastName: "Johnson", phone: "(312) 555-0762", email: "derek.j@email.com", source: "CallRail", campaign: "Truck Accident - Google", score: 34, status: "Lost", assigned: "Sarah Chen", created: "2024-01-19" },
  { id: 8, firstName: "Yuna", lastName: "Kim", phone: "(503) 555-0415", email: "yuna.k@email.com", source: "Calendly", campaign: "Organic Search", score: 82, status: "Consultation Scheduled", assigned: "Marcus Lee", created: "2024-01-20" },
];

export const mockCalls = [
  {
    id: 1,
    caller: "Marcus Williams",
    phone: "(404) 555-0192",
    duration: "4:32",
    date: "Jan 15, 2024 · 2:14 PM",
    score: 87,
    classification: "qualified",
    sentiment: "positive",
    sentimentScore: 0.82,
    summary: "Caller involved in a rear-end collision on I-285. Reports neck and back injuries. Not yet represented. Seeking aggressive representation for medical bills and lost wages. Strong case potential — commercial vehicle involved.",
    transcript: `Agent: Thank you for calling Mitchell & Associates, how can I help you today?\n\nCaller: Hi, I was in a car accident last Tuesday and I'm not sure what to do. Someone hit me from behind on the highway.\n\nAgent: I'm sorry to hear that. Are you okay? Were you injured?\n\nCaller: Yeah, my neck and back have been killing me. I went to urgent care and they said I have whiplash and a possible herniated disc. The other driver was driving a FedEx truck.\n\nAgent: I understand. That sounds like a serious situation. Do you have an attorney representing you currently?\n\nCaller: No, that's why I'm calling. My friend said I should get a lawyer.\n\nAgent: Absolutely. You're making the right call. Let me get some information and we'll schedule a free consultation with one of our attorneys...`,
    leadId: 1,
    campaign: "Personal Injury - Google",
  },
  {
    id: 2,
    caller: "Unknown - (305) 555-0847",
    phone: "(305) 555-0847",
    duration: "2:18",
    date: "Jan 16, 2024 · 11:02 AM",
    score: 72,
    classification: "qualified",
    sentiment: "neutral",
    sentimentScore: 0.51,
    summary: "Caller slipped and fell at a grocery store 3 days ago. Ankle injury, seeking compensation. Has photos of the scene. No attorney yet. Medium case potential.",
    transcript: `Agent: Mitchell & Associates, how can I help?\n\nCaller: Yes, I fell at a Publix store a few days ago and hurt my ankle pretty bad. I'm wondering if I have a case.\n\nAgent: I'm sorry that happened. Can you tell me more about what caused the fall?\n\nCaller: There was a wet floor but no sign. I have pictures on my phone...`,
    leadId: 2,
    campaign: "Slip & Fall - Meta",
  },
  {
    id: 3,
    caller: "Automated System",
    phone: "(800) 555-0000",
    duration: "0:45",
    date: "Jan 17, 2024 · 9:30 AM",
    score: 5,
    classification: "spam",
    sentiment: "neutral",
    sentimentScore: 0.5,
    summary: "Automated robocall — insurance marketing. No real caller. Classified as spam automatically.",
    transcript: "Automated message detected. Content flagged as spam.",
    leadId: null,
    campaign: "N/A",
  },
  {
    id: 4,
    caller: "Priya Sharma",
    phone: "(212) 555-0571",
    duration: "6:15",
    date: "Jan 18, 2024 · 3:47 PM",
    score: 91,
    classification: "qualified",
    sentiment: "positive",
    sentimentScore: 0.91,
    summary: "Caller was struck by a drunk driver. Significant injuries — broken arm, two cracked ribs. Medical bills exceeding $40k. Other driver cited and arrested. Excellent case potential.",
    transcript: `Agent: Thank you for calling. What can I do for you today?\n\nCaller: I was hit by a drunk driver two weeks ago. I'm still in a lot of pain and my insurance is being difficult.\n\nAgent: I'm so sorry. What were your injuries, if you don't mind sharing?\n\nCaller: I broke my arm and cracked two ribs. I have over forty thousand in medical bills already and I can't work...`,
    leadId: 4,
    campaign: "Referral",
  },
  {
    id: 5,
    caller: "Kevin O'Brien",
    phone: "(617) 555-0388",
    duration: "3:02",
    date: "Jan 18, 2024 · 4:55 PM",
    score: 63,
    classification: "qualified",
    sentiment: "neutral",
    sentimentScore: 0.58,
    summary: "Caller injured at work — forklift incident at warehouse. Has workman's comp claim open but feels settlement is too low. Wants second opinion on case value.",
    transcript: `Agent: Mitchell & Associates, this is James.\n\nCaller: Hi, I have a workers comp claim but I don't think the settlement they're offering is fair. I hurt my back pretty bad at work.\n\nAgent: I understand your concern. How did the injury occur?\n\nCaller: I was hit by a forklift at the warehouse where I work...`,
    leadId: 5,
    campaign: "Workers Comp - Google",
  },
];

export const kpiData = {
  totalLeads:       { value: 1284, trend: +18.2, label: "Total Leads" },
  qualifiedLeads:   { value: 847,  trend: +12.4, label: "Qualified Leads" },
  consultations:    { value: 412,  trend: +9.1,  label: "Consultations" },
  retainedClients:  { value: 203,  trend: +22.8, label: "Retained Clients" },
};

export const leadsOverTime = [
  { date: "Dec 22", leads: 28 }, { date: "Dec 24", leads: 22 }, { date: "Dec 26", leads: 18 },
  { date: "Dec 28", leads: 31 }, { date: "Dec 30", leads: 35 }, { date: "Jan 1",  leads: 14 },
  { date: "Jan 3",  leads: 42 }, { date: "Jan 5",  leads: 38 }, { date: "Jan 7",  leads: 51 },
  { date: "Jan 9",  leads: 47 }, { date: "Jan 11", leads: 58 }, { date: "Jan 13", leads: 62 },
  { date: "Jan 15", leads: 55 }, { date: "Jan 17", leads: 71 }, { date: "Jan 19", leads: 68 },
  { date: "Jan 21", leads: 74 }, { date: "Jan 23", leads: 82 }, { date: "Jan 25", leads: 78 },
];

export const leadsBySource = [
  { source: "CallRail",  leads: 612, color: "#3b82f6" },
  { source: "Web Form",  leads: 384, color: "#10b981" },
  { source: "Manual",    leads: 156, color: "#f59e0b" },
  { source: "Calendly",  leads: 132, color: "#8b5cf6" },
];

export const funnelData = [
  { stage: "Leads",         value: 1284, pct: 100, color: "#3b82f6" },
  { stage: "Qualified",     value: 847,  pct: 66,  color: "#60a5fa" },
  { stage: "Consultation",  value: 412,  pct: 32,  color: "#f59e0b" },
  { stage: "Retained",      value: 203,  pct: 16,  color: "#10b981" },
];

export const aiInsights = [
  {
    icon: "trending-up",
    color: "green",
    title: "Google Ads is your top ROI channel",
    body: "14 retained clients this month at $312 cost-per-client — 3× better than Meta. Consider increasing budget allocation by 20%.",
    action: "View Marketing Report",
  },
  {
    icon: "star",
    color: "gold",
    title: "Sarah Chen converts 34% above firm average",
    body: "Her qualification rate (78%) is highest on the team. Consider pairing her with newer intake specialists for coaching.",
    action: "View Team Report",
  },
  {
    icon: "alert-triangle",
    color: "red",
    title: "Missed calls up 18% this week",
    body: "Peak missed-call window is 12–2 PM daily. You may be leaving 8–12 qualified leads per week uncontacted.",
    action: "View Call Analytics",
  },
];
