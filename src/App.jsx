import { useState, useEffect, useRef } from "react";
import { supabase } from './supabase';
import AuthModal from './Auth';

// ─── ALL STEPS ACROSS ALL TIERS ───────────────────────────────────────────────
// Tiers 1-2 free. Tiers 3-7 base $5. Tiers 8-10 base $10.
const TIER_META = {
  1:  { label:"TIER 1",  name:"The Basics",          color:"#4ade80", base:0,  totalSteps:5  },
  2:  { label:"TIER 2",  name:"Building & Creating", color:"#a3e635", base:0,  totalSteps:5  },
  3:  { label:"TIER 3",  name:"Projects & Memory",   color:"#facc15", base:5,  totalSteps:10 },
  4:  { label:"TIER 4",  name:"Design & Visuals",    color:"#fb923c", base:5,  totalSteps:20 },
  5:  { label:"TIER 5",  name:"Creative & Writing",  color:"#f97316", base:5,  totalSteps:18 },
  6:  { label:"TIER 6",  name:"Technical Skills",    color:"#ef4444", base:5,  totalSteps:9  },
  7:  { label:"TIER 7",  name:"Advanced Features",   color:"#f472b6", base:5,  totalSteps:10 },
  8:  { label:"TIER 8",  name:"Total Integration",   color:"#a78bfa", base:10, totalSteps:10 },
  9:  { label:"TIER 9",  name:"Claude Design",       color:"#818cf8", base:10, totalSteps:20 },
  10: { label:"TIER 10", name:"Claude Skills",       color:"#c084fc", base:10, totalSteps:18 },
};

const ALL_STEPS = [
  // TIER 1 (free)
  { id:"1.1", tier:1, label:"Simple Conversational Prompts",
    what:"Talk to Claude naturally — describe what you want like you\'d tell a smart friend.",
    try:[
      `"What are 5 ways to make money online?"`,
      `"I can't sleep and it's been happening for weeks. What are the most common reasons and what actually helps?"`,
      `"I'm 28, just got my first full-time job, and have no idea what to do with money. Walk me through the basics of personal finance from scratch."`,
    ],
    tip:"No need for special phrasing or technical language. Claude understands natural conversation — just say what you need like you\'d say it out loud." },

  { id:"1.2", tier:1, label:"Add Context to Your Prompts",
    what:"Tell Claude who you are, what you need, and why — and watch the quality jump.",
    try:[
      `"Explain compound interest to me like I'm 16."`,
      `"I'm a freelance graphic designer. What should I charge per hour and how do I justify it to clients?"`,
      `"I'm a primary school teacher with 24 mixed-ability students and no teaching assistant. Give me a lesson plan for teaching fractions that keeps every student engaged."`,
    ],
    tip:"Think of it as briefing someone before they help you. The more they know about your situation, the less generic their advice." },

  { id:"1.3", tier:1, label:"Assign Claude a Role",
    what:"Tell Claude to act as something and it adopts that expertise entirely.",
    try:[
      `"Act as a personal trainer. Give me a 4-week beginner workout plan."`,
      `"You are a financial advisor. I earn $4,000 a month, spend $3,200, and have no savings. Tell me exactly what to do."`,
      `"Act as the most demanding editor at a major newspaper. I'm going to paste a paragraph and I want you to tear it apart with no filter, then rewrite it the way it should read: [paste text]"`,
    ],
    tip:"The role changes what Claude prioritises. A coach focuses on mindset. A lawyer focuses on risk. A strategist focuses on leverage. Use roles to get the specific type of thinking you actually need." },

  { id:"1.4", tier:1, label:"Control Output Format",
    what:"Specify exactly how you want the answer structured.",
    try:[
      `"Give me this as a bullet point list."`,
      `"Summarise what you just said in exactly 3 sentences — one per main point."`,
      `"Rewrite this as a step-by-step numbered guide written for someone who has never done this before, with a brief explanation after each step: [paste content]"`,
    ],
    tip:"Format instructions work mid-conversation too. If Claude just gave you a long answer you don\'t love, just say 'redo that as a table' or 'cut that to 5 bullet points' — no need to start over." },

  { id:"1.5", tier:1, label:"Iterate & Refine",
    what:"Every response is a draft. Push back, redirect, and keep refining.",
    try:[
      `"Too long. Cut it in half."`,
      `"That's close but too formal — rewrite it like I'm texting a friend."`,
      `"You missed the main point. What I actually need is [explain what you really want]. Ignore the previous answer and start fresh with that in mind."`,
    ],
    tip:"You\'re not being difficult by pushing back — you\'re being a good collaborator. Claude doesn\'t get frustrated and it doesn\'t get defensive. Use that." },

  // TIER 2 (free)
  { id:"2.1", tier:2, label:"Build Tools & Calculators",
    what:"Ask Claude to build a functional tool — it appears as a live working app immediately.",
    try:[
      `"Build me a tip calculator."`,
      `"Make a unit converter for cooking measurements — cups, grams, ml, and tablespoons."`,
      `"Build me a monthly budget tracker where I can enter my income and expenses by category and it shows me how much I have left and where I'm overspending."`,
    ],
    tip:"Any calculator you\'ve Googled — Claude can build a custom one in under 30 seconds." },

  { id:"2.2", tier:2, label:"Create Games & Quizzes",
    what:"Fully playable games, quizzes, and puzzles built directly in the chat.",
    try:[
      `"Build a simple quiz with 5 questions about world capitals."`,
      `"Make a word guessing game where I have 6 attempts and get told if each letter is correct, in the wrong place, or not in the word."`,
      `"Build a trivia game about 90s music with 10 questions, a score counter, a timer for each question, and a final results screen that tells me which ones I got wrong."`,
    ],
    tip:"Games are the fastest way to see what Claude can actually build." },

  { id:"2.3", tier:2, label:"Generate Real Downloadable Files",
    what:"Claude creates actual .docx, .pptx, .xlsx, and .pdf files — not just text.",
    try:[
      `"Create a simple one-page CV template as a Word document."`,
      `"Make a monthly budget spreadsheet in Excel with income, fixed expenses, variable expenses, and a savings total that updates automatically."`,
      `"Build a 10-slide pitch deck for a meal prep delivery service targeting busy professionals — include a problem slide, solution, market size, business model, and a call to action."`,
    ],
    tip:"The files open perfectly in Microsoft Office and Google Workspace." },

  { id:"2.4", tier:2, label:"Search the Web in Real Time",
    what:"Claude searches the internet live — not just its trained knowledge.",
    try:[
      `"What's the latest news in AI today?"`,
      `"What are the best budget smartphones available right now and how do they compare?"`,
      `"Research what people are saying about remote work trends in 2025 — pull from multiple sources and give me a balanced summary of what's changing and why."`,
    ],
    tip:"If the information could have changed recently, Claude searches automatically." },

  { id:"2.5", tier:2, label:"Set Reminders & Calendar Events",
    what:"Claude connects directly to your device\'s calendar and reminders app.",
    try:[
      `"Remind me to drink water every day at 9am."`,
      `"Add a recurring team standup to my calendar every Monday and Wednesday at 9:30am."`,
      `"Set a reminder every Sunday evening at 7pm to review my goals for the week, and add a separate calendar event every Friday at 4pm called 'Weekly Wrap-Up' for the next 3 months."`,
    ],
    tip:"These fire directly in your device — even when Claude is closed." },

  // TIER 3
  { id:"3.1", tier:3, label:"What Projects Are",
    what:"A Project is a persistent workspace where Claude always remembers your context.",
    try:[
      `"Create a new project for my freelance business."`,
      `"Set up a project for a mobile app I'm building — include the app name, target audience, and core features."`,
      `"Create a project for my e-commerce store, include my brand name, target customer, top 3 selling products, tone of voice, and the main problem I'm trying to solve this quarter."`,
    ],
    tip:"Without Projects, every chat starts from scratch. With them, Claude always knows what you\'re working on." },

  { id:"3.2", tier:3, label:"Create Your First Project",
    what:"Set up a Project for the most important ongoing thing in your life right now.",
    try:[
      `"Here's my job title and company — remember this for future chats."`,
      `"I run a small bakery in Cape Town called Flour & Co. We sell sourdough and pastries to young professionals. Remember everything about my business."`,
      `"I'm building a SaaS product for HR managers. Here's everything you need to know about the product, the users, the pricing, and where we are in development: [describe it]"`,
    ],
    tip:"Projects are the single biggest quality-of-life upgrade for regular Claude users." },

  { id:"3.3", tier:3, label:"Upload Files to a Project",
    what:"Add documents to a project and Claude references them in every conversation.",
    try:[
      `"I've uploaded my CV — refer to it when I ask career questions."`,
      `"Here's my brand guidelines document. Use it whenever I ask you to write copy or create content."`,
      `"I've uploaded my business plan, three months of sales data, and my competitor research. Based on all of this, what should my top three priorities be right now?"`,
    ],
    tip:"Your uploaded files become permanent context. No re-uploading every time." },

  { id:"3.4", tier:3, label:"Set Custom Project Instructions",
    what:"Tell Claude exactly how to behave in this specific project — tone, format, rules.",
    try:[
      `"Always respond in bullet points. Keep answers under 150 words."`,
      `"I'm building a brand for Gen Z women. Always write in a confident, conversational tone — no corporate language, no filler."`,
      `"You are working with an early-stage founder who needs blunt, practical advice. No fluff, no hedging. Always end your response with one specific next action I should take today."`,
    ],
    tip:"Custom instructions override Claude\'s defaults for that project only." },

  { id:"3.5", tier:3, label:"Build Your Memory Profile",
    what:"Tell Claude facts about you that persist across all future conversations.",
    try:[
      `"Remember that I prefer bullet points over long paragraphs."`,
      `"I'm a UX designer based in London working mostly with fintech clients. Remember this when I ask for design or career advice."`,
      `"Remember that I run a bootstrapped e-commerce business, I have a $500 monthly marketing budget, I'm targeting South African women aged 25-40, and my biggest current challenge is customer retention."`,
    ],
    tip:"The more Claude knows about you, the more every answer feels written specifically for you." },

  // TIER 4
  { id:"4.1", tier:4, label:"Generate SVG Icons & Graphics",
    what:"Ask Claude to create any icon or illustration as a scalable SVG file.",
    try:[
      `"Create a simple SVG icon of a house."`,
      `"Make a set of 3 minimalist SVG icons for a wellness app — a leaf, a water drop, and a sun."`,
      `"Design a set of 6 SVG icons for a finance dashboard — income, expenses, savings, investments, debt, and net worth. Keep them consistent in style, thin-line, monochrome."`,
    ],
    tip:"SVGs are infinitely scalable — perfect at any size for websites, presentations, and logos." },

  { id:"4.2", tier:4, label:"Create Infographics",
    what:"Turn any data or concept into a visual infographic.",
    try:[
      `"Make a simple infographic showing the 3 stages of sleep."`,
      `"Create an infographic comparing the pros and cons of renting vs buying a home."`,
      `"Build a visual infographic showing the complete customer journey for an e-commerce brand — from first seeing an ad to becoming a repeat buyer, including the emotions at each stage."`,
    ],
    tip:"Infographics are massively shareable on social media. Great for content creation." },

  { id:"4.3", tier:4, label:"Build Flowcharts & Diagrams",
    what:"Describe any process and Claude maps it into a professional diagram.",
    try:[
      `"Create a flowchart for a basic morning routine."`,
      `"Build a mind map for launching a podcast — include planning, recording, editing, publishing, and promotion."`,
      `"Map out the complete decision flow for a customer service team handling complaints — from initial contact through escalation levels, resolution options, and follow-up, with decision points at each stage."`,
    ],
    tip:"Great for documenting processes, onboarding guides, and making complex logic visual." },

  { id:"4.4", tier:4, label:"Find & Map Real Locations",
    what:"Claude searches for real places and displays them on an interactive map.",
    try:[
      `"Find the top 3 rated coffee shops in Cape Town."`,
      `"Find 5 highly rated Italian restaurants in Johannesburg and show them on a map."`,
      `"Plan a full day out in New York City for a first-time visitor — morning, afternoon, and evening activities — map all the stops in logical order so I'm not doubling back across the city."`,
    ],
    tip:"Results come from real Google Places data — ratings, addresses, and hours included." },

  { id:"4.5", tier:4, label:"Design UI Mockups & Wireframes",
    what:"Build full app screens and webpage layouts as working HTML or React.",
    try:[
      `"Wireframe a simple login screen for a mobile app."`,
      `"Design a homepage layout for a premium skincare brand — include a hero section, product highlights, and a testimonials section."`,
      `"Build a full UI mockup for a personal finance app — include a dashboard with account balances, a spending breakdown by category, a recent transactions list, and a savings goal tracker. Dark theme, modern and clean."`,
    ],
    tip:"Hand these off to developers as a starting point, or use them directly." },

  // TIER 5
  { id:"5.1", tier:5, label:"Write Ad Copy",
    what:"Compelling ads for any platform — TikTok, Instagram, Google, Facebook.",
    try:[
      `"Write a Facebook ad for a gym offering a free trial."`,
      `"Write 3 Instagram ad captions for a skincare brand launching a new vitamin C serum — target women 25-35."`,
      `"Write a full TikTok ad script for a $97 online course teaching freelancers how to get their first client — hook in the first 2 seconds, build the problem, present the solution, and end with a clear call to action. Keep it under 45 seconds."`,
    ],
    tip:"Tell Claude the platform, the audience, and the goal. It writes for that exact context." },

  { id:"5.2", tier:5, label:"Write Email Marketing Campaigns",
    what:"Full email sequences — welcome series, product launches, nurture campaigns.",
    try:[
      `"Write a welcome email for new subscribers to a fitness newsletter."`,
      `"Write a 3-email sequence for a product launch — a teaser, a launch day email, and a last chance email."`,
      `"Write a 5-part nurture sequence for a life coaching business targeting burnt-out corporate professionals — start with empathy, build trust across the sequence, introduce the offer naturally by email 4, and close with urgency in email 5."`,
    ],
    tip:"Tell Claude the brand voice and it maintains it consistently across the whole sequence." },

  { id:"5.3", tier:5, label:"Social Media Captions & Posts",
    what:"Platform-specific captions for Instagram, LinkedIn, TikTok, X — in your voice.",
    try:[
      `"Write an Instagram caption for a photo of a sunset at the beach."`,
      `"Give me 5 LinkedIn post ideas for a marketing consultant and write the first one in full."`,
      `"Write a full week of Instagram content for a sustainable fashion brand — 7 captions mixing educational, inspirational, and promotional posts, each with relevant hashtags and a call to action that fits the post type."`,
    ],
    tip:"Paste 2-3 of your existing posts so Claude can match your exact voice." },

  { id:"5.4", tier:5, label:"Write Short Stories & Scripts",
    what:"Fiction, screenplays, YouTube scripts, and podcast outlines.",
    try:[
      `"Write a short poem about starting over."`,
      `"Write a 3-minute YouTube script explaining why most people fail at building habits."`,
      `"Write the first scene of a psychological thriller short story — introduce the main character, establish an unsettling atmosphere, drop one detail that seems small but will matter later, and end on a line that makes the reader need to continue."`,
    ],
    tip:"Give Claude a genre, scenario, and mood. The more specific, the better." },

  { id:"5.5", tier:5, label:"Translate & Learn Languages",
    what:"Translate anything with cultural context preserved — or practise conversation.",
    try:[
      `"Translate 'where is the nearest pharmacy?' into French, Spanish, and Mandarin."`,
      `"I'm learning Spanish at a beginner level. Teach me 10 essential phrases for ordering food at a restaurant, with pronunciation tips."`,
      `"Let's have a full conversation in Spanish. I'm at an intermediate level. After every response you give, highlight any grammar mistakes I made, explain why they're wrong, and give me the corrected version before continuing the conversation."`,
    ],
    tip:"Claude adapts idioms, tone, and cultural context — far beyond basic translation." },

  // TIER 6
  { id:"6.1", tier:6, label:"Write Code From a Description",
    what:"Describe what you want in plain English and Claude writes the code.",
    try:[
      `"Write a Python function that takes a list of numbers and returns the average."`,
      `"Write a JavaScript function that checks if an email address is valid and shows an error message if it isn't."`,
      `"Write a Python script that reads a CSV file of customer orders, calculates the total revenue per product category, and exports a new CSV showing each category, total units sold, and total revenue sorted from highest to lowest."`,
    ],
    tip:"You don\'t need to know what language to use. Just describe what you want it to do." },

  { id:"6.2", tier:6, label:"Explain & Understand Code",
    what:"Paste any code and Claude explains exactly what it does — line by line.",
    try:[
      `"Explain what this function does: [paste code]"`,
      `"Walk me through this SQL query step by step and explain what each part is doing: [paste query]"`,
      `"I inherited this Python script from a developer who left the company. Read through the whole thing, explain what it does in plain English, flag anything that looks like it could cause problems, and tell me what I'd need to change if I wanted it to run on a schedule automatically: [paste code]"`,
    ],
    tip:"Great for learning, inheriting code, or reviewing before running it." },

  { id:"6.3", tier:6, label:"Debug & Fix Broken Code",
    what:"Paste broken code and the error — Claude diagnoses and fixes it.",
    try:[
      `"This code throws an error — fix it: [paste code + error]"`,
      `"My function runs but keeps returning the wrong value. Here's the code and what it should be returning: [paste code]"`,
      `"My web app crashes every time a user submits the contact form. Here's the frontend code, the backend route, and the full error log. Find the root cause, fix it, and explain what was going wrong so I understand it for next time: [paste everything]"`,
    ],
    tip:"Always paste both the code AND the error message for fastest diagnosis." },

  { id:"6.4", tier:6, label:"Analyse Data & Spot Insights",
    what:"Upload data and Claude tells you what it means and what to do about it.",
    try:[
      `"Here's last month's sales data — what stands out? [paste data]"`,
      `"I have 6 months of website traffic data. Which channels are growing, which are declining, and what should I focus on? [paste data]"`,
      `"Here are 12 months of revenue, ad spend, customer acquisition cost, and churn rate figures for my business. Identify the 3 most important trends, tell me what's actually driving them, and give me specific recommendations for what to change in the next 90 days: [paste data]"`,
    ],
    tip:"Data without interpretation is just numbers. Claude tells you what to act on." },

  { id:"6.5", tier:6, label:"Financial & Math Calculations",
    what:"Model financial scenarios, solve complex equations, and interpret results.",
    try:[
      `"If I save $300 a month for 5 years at 7% annual return, what do I end up with?"`,
      `"Calculate the break-even point for a business with $8,000 monthly fixed costs, a product that sells for $120, and a cost per unit of $45."`,
      `"I'm deciding between two business models — one is subscription at $49/month with an expected 3% monthly churn, the other is one-time purchase at $297 with an expected 15% repeat purchase rate annually. Model out the revenue for both over 3 years assuming I acquire 50 new customers per month and tell me which performs better and when the crossover point is."`,
    ],
    tip:"Ask Claude to show every step — helps you understand the method, not just the answer." },

  // TIER 7
  { id:"7.1", tier:7, label:"Build Apps That Save Data",
    what:"Claude-built apps that remember your data between sessions — like real software.",
    try:[
      `"Build a simple note-taking app that saves my notes between sessions."`,
      `"Create a habit tracker that remembers which habits I completed each day and shows me my streak."`,
      `"Build a client project tracker where I can add clients, log work sessions with dates and hours, write notes per session, mark projects as active or complete, and see a running total of hours per client — all saved between sessions."`,
    ],
    tip:"Most AI-built apps forget everything when closed. These actually persist your data." },

  { id:"7.2", tier:7, label:"Multi-Screen Apps & Dashboards",
    what:"Apps with tabs, menus, and multiple pages — full navigation built in.",
    try:[
      `"Build a dashboard with two tabs — one for income and one for expenses."`,
      `"Create a recipe app with separate sections for Breakfast, Lunch, Dinner, and a Favourites tab I can save recipes to."`,
      `"Build a full personal productivity app with four screens — a daily to-do list, a habit tracker, a focus timer with session logging, and a weekly review screen that shows me how many tasks I completed, habits I hit, and hours I focused for that week."`,
    ],
    tip:"Multi-screen apps are real software. Tell Claude the sections you want and it wires up the navigation." },

  { id:"7.3", tier:7, label:"Apps That Pull Live API Data",
    what:"Connect any app to a public API for real-time data.",
    try:[
      `"Build a live weather widget using the OpenWeather API — I'll paste my key: [key]"`,
      `"Create a dashboard that shows the current price of Bitcoin, Ethereum, and Solana using the free CoinGecko API — refresh every 60 seconds."`,
      `"Build a live news dashboard using my NewsAPI key that pulls headlines from 3 categories I can choose, lets me filter by keyword, shows each article with a headline, source, and summary, and marks ones I've already read: [key]"`,
    ],
    tip:"Most public APIs have free tiers. Google '[topic] free API' to find one. Paste the key and Claude builds the whole app around it." },

  { id:"7.4", tier:7, label:"AI-Powered Apps",
    what:"Build apps that have their own AI brain inside — they think and respond by themselves.",
    try:[
      `"Build a chatbot that only talks about fitness and nutrition."`,
      `"Create an AI writing assistant that rewrites any text I paste in three different tones — professional, casual, and persuasive."`,
      `"Build an AI-powered interview coach — I tell it the job role and my background, it generates tailored interview questions, I type my answers, and it gives me specific feedback on content, clarity, and what a real interviewer would think, then suggests how to improve each answer."`,
    ],
    tip:"Once built, these tools run independently. Use them every day without coming back to Claude." },

  { id:"7.5", tier:7, label:"Clone & Customise Any Tool",
    what:"Describe a tool you use and Claude builds a custom version tailored exactly to you.",
    try:[
      `"Build me a simple Pomodoro timer — 25 minutes work, 5 minute break."`,
      `"Clone the basic functionality of a flashcard app where I can add my own cards and flip through them."`,
      `"Build a stripped-down Kanban board — three columns for To Do, In Progress, and Done, the ability to add and name cards, drag them between columns, add a short note to each card, and set a due date that turns red when overdue."`,
    ],
    tip:"Your custom version has no ads, no subscription, no unnecessary features." },

  // TIER 8
  { id:"8.1", tier:8, label:"Understand & Enable MCP",
    what:"MCP (Model Context Protocol) lets you plug external services directly into Claude.",
    try:[
      `"What is MCP and why does it matter?"`,
      `"Walk me through how to connect my first MCP server in Claude's settings."`,
      `"I use Notion for project management, Google Drive for documents, and Slack for team communication. Walk me through exactly how to connect all three via MCP, what Claude will be able to do inside each one once connected, and what I should set up first to get the most value immediately."`,
    ],
    tip:"Without MCP, Claude is a chatbot. With MCP, it operates inside your real tools." },

  { id:"8.2", tier:8, label:"Connect Google Drive",
    what:"Claude reads, searches, creates, and edits your Google Drive files.",
    try:[
      `"Find all documents I created this month in my Drive."`,
      `"Summarise the most recent strategy document in my Google Drive and pull out any action items."`,
      `"I have a folder in Google Drive called 'Client Proposals' with 8 documents inside. Read through all of them, identify the common structure across successful ones, flag anything inconsistent, and give me a template I can use for every future proposal based on what's working."`,
    ],
    tip:"Your entire Drive becomes searchable and writable through conversation." },

  { id:"8.3", tier:8, label:"Connect Notion",
    what:"Read and write Notion pages, databases, and entries through chat.",
    try:[
      `"Add a new task to my Notion task database: [task details]"`,
      `"Find all pages in my Notion workspace tagged as 'In Progress' and give me a summary of where each one stands."`,
      `"I have a Notion database tracking my content calendar with fields for topic, status, platform, publish date, and performance notes. Analyse everything marked as published, tell me which topics performed best, identify any patterns in what I posted on which platforms, and suggest my next 4 weeks of content based on what's worked."`,
    ],
    tip:"Your entire second brain becomes accessible and editable through conversation." },

  { id:"8.4", tier:8, label:"Connect Slack",
    what:"Read channels, catch up on messages, and send on your behalf.",
    try:[
      `"Summarise what was discussed in #general today."`,
      `"Find the last message from [person] in Slack and draft a reply for me to review."`,
      `"I've been out of office for 3 days. Go through all the Slack channels I'm a member of, pull out every message that mentions me directly, contains a decision that affects my work, or includes an action item for my team, and give me a prioritised catch-up summary so I know exactly what needs my attention first."`,
    ],
    tip:"Great for catching up quickly or drafting messages without switching apps." },

  { id:"8.5", tier:8, label:"Chain Multiple Tools Together",
    what:"Use several connected tools in a single request — the real power of MCP.",
    try:[
      `"Read my Slack messages from today and add any tasks mentioned to my Notion database."`,
      `"Check my Google Drive for any documents updated this week and send a summary to my team Slack channel."`,
      `"Every Monday morning I want you to read last week's completed tasks from my Notion, pull the relevant documents from Google Drive, check Slack for any unresolved discussions linked to those tasks, and compile a weekly progress report formatted with what was completed, what's blocked, and what's happening this week."`,
    ],
    tip:"One sentence triggers actions across 3 different apps. This is automation by conversation." },

  // TIER 9
  { id:"9.1", tier:9, label:"Access & Understand Claude Design",
    what:"Claude Design is a dedicated product — chat on the left, live canvas on the right.",
    try:[
      `"Open Claude Design and describe what I'm looking at."`,
      `"I want to design a landing page for my business. Walk me through how to start in Claude Design."`,
      `"I've never used Claude Design before. I run a small online clothing brand and want to create a full visual presence — a landing page, a pitch deck for potential stockists, and social media templates. Walk me through the best way to approach all three starting from scratch in Claude Design."`,
    ],
    tip:"This is a dedicated design workspace — not a chat artifact. It has its own canvas, export tools, and collaboration features." },

  { id:"9.2", tier:9, label:"Design Websites & App Prototypes",
    what:"Build realistic interactive prototypes without writing any code.",
    try:[
      `"Design a simple landing page for a coffee shop."`,
      `"Prototype a 3-screen onboarding flow for a meditation app — welcome screen, goal selection, and personalisation."`,
      `"Build a fully interactive prototype for a food delivery app — home feed with restaurant cards, a restaurant detail page with menu items and reviews, a cart screen, and a checkout flow with address and payment fields. Make it feel like a real app a user could test."`,
    ],
    tip:"These are clickable prototypes — not static images. Share them for user testing." },

  { id:"9.3", tier:9, label:"Create Pitch Decks & Presentations",
    what:"From a rough outline to a complete, on-brand slide deck.",
    try:[
      `"Create a 5-slide pitch deck for a bakery looking for a small business loan."`,
      `"Build a 10-slide investor deck for a B2B SaaS startup in the HR space — include problem, solution, market size, product demo slide, traction, and ask."`,
      `"Design a complete 15-slide Series A pitch deck for a fintech startup targeting unbanked populations in emerging markets — include the problem with real statistics, our solution, competitive landscape, business model, unit economics, go-to-market strategy, team slide, and a funding ask with clear use of funds breakdown."`,
    ],
    tip:"Export as PPTX and open directly in PowerPoint or Google Slides. Fully editable." },

  { id:"9.4", tier:9, label:"Export to Canva, PDF & PowerPoint",
    what:"Everything created exports in multiple formats or goes directly into Canva.",
    try:[
      `"Export this design as a PDF."`,
      `"Send this pitch deck to Canva so my team can edit it."`,
      `"I've finished designing a full brand kit in Claude Design — logo concepts, a landing page, and a pitch deck. Export the pitch deck as a PowerPoint so I can present it, send the landing page design to Canva so my designer can refine it, and export the brand kit as a PDF I can send to potential partners as a media pack."`,
    ],
    tip:"Claude Design generates it, Canva lets your team collaborate and finalise it." },

  { id:"9.5", tier:9, label:"Set Up a Brand Design System",
    what:"Point Claude at your assets and it builds a system that auto-applies your brand.",
    try:[
      `"Set up a basic design system using navy blue and white as my brand colours."`,
      `"Build a design system for a wellness brand — soft greens, warm neutrals, rounded components, and a friendly sans-serif font."`,
      `"I'm building a fintech brand targeting young professionals. Set up a complete design system including a primary and secondary colour palette with hex codes, typography hierarchy for headings and body text, button styles for primary and secondary actions, card components, form field styles, spacing rules, and a dark mode variation — then apply it automatically to everything I build going forward."`,
    ],
    tip:"Once set up, every future design automatically uses your brand colours, fonts, and components." },

  // TIER 10
  { id:"10.1", tier:10, label:"What Skills Are & How They Work",
    what:"Skills are reusable instruction packs Claude loads automatically when relevant.",
    try:[
      `"What is a Claude Skill and how is it different from a normal prompt?"`,
      `"Show me an example of a skill being loaded automatically during a task."`,
      `"I run a marketing agency and my team uses Claude daily for different tasks — writing copy, analysing data, creating reports, and managing client communications. Explain exactly how Claude Skills works, what we'd need to set up, how it would change the way my team works day to day, and what the biggest efficiency gains would be for a team our size."`,
    ],
    tip:"You don\'t manage skills manually. Claude detects when they apply and uses them silently." },

  { id:"10.2", tier:10, label:"Use Built-In Skills",
    what:"Anthropic ships pre-built skills for Excel, PowerPoint, Word, and PDF — activate immediately.",
    try:[
      `"Use the Excel skill to create a simple sales tracker."`,
      `"Use the PowerPoint skill to build a 6-slide company overview presentation."`,
      `"I need three things for a client meeting tomorrow — a detailed Excel model tracking their monthly revenue by product line with variance analysis against target, a polished Word document summarising their Q3 performance in a format I can leave behind, and a 10-slide PowerPoint pulling the key numbers into a visual presentation. Use the built-in skills to produce all three."`,
    ],
    tip:"With the skill active, Claude produces perfectly formatted files with working formulas — not rough drafts." },

  { id:"10.3", tier:10, label:"Build Your First Custom Skill",
    what:"Create a skill for any workflow you repeat — Claude guides you through building it.",
    try:[
      `"Help me build a skill for writing client emails in my tone of voice."`,
      `"I always structure my weekly reports the same way. Help me turn that into a reusable skill so Claude does it automatically every time."`,
      `"I run a content agency and every piece of content we produce follows a specific process — research phase, angle selection, outline approval, draft, edit, and client review. We also have a strict brand voice guide and a formatting standard for every platform. Help me build a custom skill that captures this entire workflow so any team member can produce on-brand content without me having to brief Claude from scratch every single time."`,
    ],
    tip:"The skill-creator skill writes the SKILL.md file for you. No manual file editing required." },

  { id:"10.4", tier:10, label:"Stack Multiple Skills Together",
    what:"Multiple skills load simultaneously — Claude coordinates them all automatically.",
    try:[
      `"Use my brand voice skill and my email template skill together to write a client update."`,
      `"Combine my data analysis skill and my report template skill to turn this spreadsheet into a formatted report: [paste data]"`,
      `"I have four skills set up — brand voice, content calendar format, platform-specific writing rules, and our client approval checklist. Use all four simultaneously to produce a complete content plan for three different clients, formatted correctly for each platform, written in each client's brand voice, and structured so it's ready to go straight into the approval process."`,
    ],
    tip:"Design each skill to do one thing well, then combine them freely. Composability is the real power." },

  { id:"10.5", tier:10, label:"Share Skills With Your Team",
    what:"Skills are portable — share them via version control or direct file sharing.",
    try:[
      `"How do I share a skill I built with a colleague?"`,
      `"Walk me through setting up a shared skill library for a small team of 5 people."`,
      `"I've built a suite of 8 custom skills for my agency covering our entire workflow. Walk me through the best way to package these skills so every team member has access to the same version, how to push updates when our processes change so everyone gets them automatically, how to onboard a new employee so they're using Claude at full capacity from day one, and how to track which skills are being used most so I know where to invest in building more."`,
    ],
    tip:"Team-shared skills capture and distribute institutional knowledge. Consistency across a whole team." },
];

// --- PRICE CALCULATION ---
// Pack 1 (Tiers 3-7): 10+20+18+9+10 = 67 total steps, cost $5 -> $0.0746/step
// Pack 2 (Tiers 8-10): 10+20+18 = 48 total steps, cost $10 -> $0.2083/step
// Any recommended step just costs its pack's flat per-step rate.
// Buying all steps in pack 1 = exactly $5. Pack 2 = exactly $10. Total = $15 max.

const PACK1_TIERS    = [3,4,5,6,7];
const PACK2_TIERS    = [8,9,10];
// Pricing uses ACTUAL steps in the system:
// Pack 1: 5 tiers x 5 steps = 25 steps total -> $5 / 25 = $0.20 per step
// Pack 2: 3 tiers x 5 steps = 15 steps total -> $10 / 15 = $0.667 per step
// Buying all 40 steps = exactly $15. Personalised path always costs less.
const PACK1_ACTUAL_STEPS = 25;
const PACK2_ACTUAL_STEPS = 15;
// Credit pricing: 1 credit = $0.01
// Pack 1: $5 = 500 credits / 25 steps = 20 credits per step
// Pack 2: $10 = 1000 credits / 15 steps = 67 credits per step
const PACK1_PER_STEP = 20;   // credits
const PACK2_PER_STEP = 67;   // credits
const CREDIT_PACKS = [
  { id: 'credits_100',  credits: 100,  price: 1,  checkoutId: 'dbbdfcfa-46cf-4b7f-9cfb-c71fea6ddfd6' },
  { id: 'credits_500',  credits: 500,  price: 5,  checkoutId: 'a2434402-0389-40bd-ac27-f44c721ab15d', popular: true },
  { id: 'credits_1000', credits: 1000, price: 10, checkoutId: '0a56ea97-80b0-4a39-864d-b2a27be528c7' },
];

function calcPrice(recommendedIds) {
  const byTier = {};
  recommendedIds.forEach(id => {
    const step = ALL_STEPS.find(s => s.id === id);
    if (!step) return;
    if (TIER_META[step.tier].base === 0) return;
    if (!byTier[step.tier]) byTier[step.tier] = [];
    byTier[step.tier].push(id);
  });

  const breakdown = [];
  Object.entries(byTier).forEach(([tierId, steps]) => {
    const tid      = parseInt(tierId);
    const perStep  = PACK1_TIERS.includes(tid) ? PACK1_PER_STEP : PACK2_PER_STEP;
    const subtotal = perStep * steps.length;
    breakdown.push({ tierId:tid, count:steps.length, of:TIER_META[tid].totalSteps, subtotal });
  });

  const total = parseFloat(Math.max(0.99, breakdown.reduce((s,b) => s+b.subtotal, 0)).toFixed(2));
  return { total, breakdown };
}


// ─── PATH RECOMMENDATIONS ─────────────────────────────────────────────────────
// Maps [goal, level, focus] → array of step IDs
function getRecommendations(goal, level, focus) {

  // ── PREREQUISITE MAP ────────────────────────────────────────────────────
  // If you unlock step X, you must also have these steps unlocked first.
  // Rule 1: First step of any tier is always included if ANY step in that tier is recommended.
  // Rule 2: Hard sequential dependencies within tiers.
  const PREREQS = {
    // Tier 3: Projects & Memory
    "3.2": ["3.1"],               // Can't create a project without knowing what it is
    "3.3": ["3.1","3.2"],         // Can't upload files without a project
    "3.4": ["3.1","3.2"],         // Can't set instructions without a project
    "3.5": [],                    // Memory is standalone

    // Tier 4: Design & Visuals (mostly standalone but ordered logically)
    "4.2": ["4.1"],               // Infographics build on icons knowledge
    "4.4": ["4.3"],               // Location maps build on diagrams context
    "4.5": ["4.1"],               // UI mockups assume basic SVG/visual understanding

    // Tier 5: Creative & Writing (mostly standalone)
    "5.2": ["5.1"],               // Email campaigns build on ad copy skills
    "5.3": [],                    // Social captions standalone
    "5.4": [],                    // Scripts standalone
    "5.5": [],                    // Languages standalone

    // Tier 6: Technical — strong sequential dependency
    "6.2": ["6.1"],               // Can't explain code without writing it first
    "6.3": ["6.1","6.2"],         // Can't debug without understanding code
    "6.4": [],                    // Data analysis standalone
    "6.5": [],                    // Math/finance standalone

    // Tier 7: Advanced features
    "7.2": ["7.1"],               // Multi-screen apps build on single-screen apps
    "7.3": ["7.1","7.2"],         // Live API apps need app foundation
    "7.4": [],                    // AI-powered apps standalone concept
    "7.5": ["7.1"],               // Cloning tools needs basic artifact knowledge

    // Tier 8: MCP — 8.1 is the gateway, nothing works without it
    "8.2": ["8.1"],
    "8.3": ["8.1"],
    "8.4": ["8.1"],
    "8.5": ["8.1","8.2","8.3"],   // Chaining requires having individual tools connected

    // Tier 9: Claude Design — 9.1 is the gateway
    "9.2": ["9.1"],
    "9.3": ["9.1"],
    "9.4": ["9.1"],
    "9.5": ["9.1","9.2"],

    // Tier 10: Skills — 10.1 is the gateway
    "10.2": ["10.1"],
    "10.3": ["10.1","10.2"],      // Building skills requires understanding + built-ins
    "10.4": ["10.1","10.3"],      // Stacking requires knowing how to build one first
    "10.5": ["10.1","10.3","10.4"],
  };

  // Tier intro steps — always included if ANY step from that tier is picked
  const TIER_INTROS = {
    3:"3.1", 4:"4.1", 5:"5.1", 6:"6.1",
    7:"7.1", 8:"8.1", 9:"9.1", 10:"10.1",
  };

  // ── GOAL WEIGHTS ────────────────────────────────────────────────────────
  const GOAL_WEIGHTS = {
    productivity: {
      "3.2":5,"3.4":5,"3.5":5,"3.3":3,"3.1":4,
      "6.4":4,"6.5":3,"6.1":2,"6.2":2,
      "7.2":4,"7.1":3,"7.5":2,
      "5.2":3,
      "8.2":4,"8.3":4,"8.5":5,"8.1":3,"8.4":3,
      "4.3":2,
      "10.3":3,"10.2":2,
    },
    business: {
      "5.1":5,"5.2":5,"5.3":5,"5.4":3,"5.5":3,
      "3.2":4,"3.3":4,"3.4":5,"3.5":3,"3.1":2,
      "4.1":3,"4.2":4,"4.3":2,"4.5":2,
      "9.3":4,"9.4":3,"9.1":3,"9.2":2,
      "7.4":4,"7.1":2,
      "8.2":3,"8.3":3,"8.5":3,"8.1":3,
      "6.4":3,"6.1":2,
      "10.2":3,"10.3":3,"10.1":2,
    },
    builder: {
      "6.1":5,"6.2":4,"6.3":5,"6.4":4,"6.5":3,
      "7.1":5,"7.2":5,"7.3":5,"7.4":5,"7.5":4,
      "8.1":4,"8.2":3,"8.3":3,"8.5":5,
      "10.1":3,"10.2":3,"10.3":5,"10.4":4,"10.5":3,
      "3.2":2,"3.3":2,"3.4":3,"3.1":2,
      "4.5":3,"4.1":2,
      "9.1":2,"9.2":3,
    },
    creator: {
      "4.1":5,"4.2":5,"4.3":3,"4.4":3,"4.5":5,
      "5.1":5,"5.2":4,"5.3":5,"5.4":4,"5.5":3,
      "9.1":4,"9.2":4,"9.3":5,"9.4":5,"9.5":3,
      "3.2":3,"3.4":4,"3.5":3,"3.1":3,
      "7.4":4,"7.1":2,
      "8.2":3,"8.3":3,"8.1":2,
      "10.2":3,"10.3":3,"10.1":2,
      "6.4":2,"6.1":2,
    },
    mastery: {
      "3.1":4,"3.2":4,"3.3":4,"3.4":4,"3.5":4,
      "4.1":3,"4.2":3,"4.3":3,"4.4":3,"4.5":4,
      "5.1":4,"5.2":4,"5.3":4,"5.4":3,"5.5":3,
      "6.1":4,"6.2":4,"6.3":4,"6.4":4,"6.5":3,
      "7.1":4,"7.2":4,"7.3":4,"7.4":5,"7.5":3,
      "8.1":4,"8.2":4,"8.3":4,"8.4":3,"8.5":5,
      "9.1":4,"9.2":4,"9.3":4,"9.4":4,"9.5":3,
      "10.1":4,"10.2":4,"10.3":4,"10.4":4,"10.5":3,
    },
  };

  // ── FOCUS MULTIPLIERS ───────────────────────────────────────────────────
  const FOCUS_MULT = {
    quickwins: {
      "3.2":1.8,"3.4":1.8,"3.5":1.8,
      "5.1":1.8,"5.2":1.8,"5.3":1.8,
      "6.1":1.5,"6.3":1.5,"7.4":1.5,"4.1":1.4,"4.2":1.4,
      "8.4":0.2,"8.5":0.2,"10.4":0.2,"10.5":0.2,"9.5":0.2,"10.1":0.2,
    },
    deep: {
      "3.1":1.8,"3.3":1.8,"6.4":1.8,"6.5":1.8,
      "8.1":1.8,"8.5":1.8,"10.1":1.8,"10.4":1.8,"10.5":1.8,
      "9.5":1.8,"7.5":1.5,"7.3":1.5,"5.4":1.5,"5.5":1.5,
    },
    connect: {
      "8.1":3.0,"8.2":3.0,"8.3":3.0,"8.4":3.0,"8.5":3.0,
      "10.3":2.0,"10.4":2.0,"10.5":2.0,"3.3":1.8,"3.4":1.5,
    },
    build: {
      "7.1":2.5,"7.2":2.5,"7.3":2.5,"7.4":2.5,"7.5":2.0,
      "6.1":2.0,"6.2":1.8,"6.3":2.0,"9.1":1.8,"9.2":1.8,
      "10.3":1.8,"10.4":1.8,"4.5":1.5,
    },
  };

  // ── LEVEL SETTINGS ──────────────────────────────────────────────────────
  const LEVEL_MAX          = { beginner:12, basic:16, intermediate:22, advanced:28 };
  const NEEDS_INTERMEDIATE = new Set(["8.4","8.5","10.4","10.5","9.5","7.3","10.1","6.5"]);
  const NEEDS_ADVANCED     = new Set(["10.5","9.5"]);

  const allPaidIds = [
    "3.1","3.2","3.3","3.4","3.5",
    "4.1","4.2","4.3","4.4","4.5",
    "5.1","5.2","5.3","5.4","5.5",
    "6.1","6.2","6.3","6.4","6.5",
    "7.1","7.2","7.3","7.4","7.5",
    "8.1","8.2","8.3","8.4","8.5",
    "9.1","9.2","9.3","9.4","9.5",
    "10.1","10.2","10.3","10.4","10.5",
  ];

  // ── STEP 1: SCORE & FILTER ──────────────────────────────────────────────
  const goalW  = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.mastery;
  const focusM = FOCUS_MULT[focus] || {};
  const maxSteps = LEVEL_MAX[level] || 22;

  const scored = allPaidIds
    .filter(id => {
      if (level === "beginner" && NEEDS_INTERMEDIATE.has(id)) return false;
      if (level === "basic"    && NEEDS_ADVANCED.has(id))     return false;
      return true;
    })
    .map(id => ({ id, score: (goalW[id] || 0) * (focusM[id] || 1) }))
    .filter(s => s.score > 0)
    .sort((a,b) => b.score - a.score);

  const initial = new Set(scored.slice(0, maxSteps).map(s => s.id));

  // ── STEP 2: RESOLVE PREREQUISITES ──────────────────────────────────────
  // Keep resolving until stable — handles chains like 6.3 needs 6.2 needs 6.1
  let changed = true;
  while (changed) {
    changed = false;

    // 2a: Add hard prereqs for every selected step
    initial.forEach(id => {
      (PREREQS[id] || []).forEach(pre => {
        if (!initial.has(pre)) { initial.add(pre); changed = true; }
      });
    });

    // 2b: Add tier intro if any step from that tier is selected
    initial.forEach(id => {
      const tier = parseInt(id.split('.')[0]);
      const intro = TIER_INTROS[tier];
      if (intro && !initial.has(intro)) { initial.add(intro); changed = true; }
    });
  }

  return [...initial].sort();
}


// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  { id:"goal", q:"What do you want to achieve?", options:[
    { id:"productivity", icon:"⚡", label:"Save time & boost productivity", desc:"Work faster, automate tasks" },
    { id:"business",     icon:"💼", label:"Grow a business or income",      desc:"Marketing, content, client work" },
    { id:"builder",      icon:"🛠️", label:"Build apps, tools & automations", desc:"Create real software products" },
    { id:"creator",      icon:"🎨", label:"Create content & visuals",        desc:"Writing, design, social media" },
    { id:"mastery",      icon:"🧠", label:"Master every Claude feature",     desc:"Leave nothing unexplored" },
  ]},
  { id:"level", q:"Where are you starting from?", options:[
    { id:"beginner",     icon:"🌱", label:"Complete beginner",  desc:"Just signed up" },
    { id:"basic",        icon:"🔆", label:"Know the basics",    desc:"Basic prompting only" },
    { id:"intermediate", icon:"🔥", label:"Intermediate user",  desc:"Regular user, want more" },
    { id:"advanced",     icon:"💎", label:"Advanced user",      desc:"Daily user — want hidden features" },
  ]},
  { id:"focus", q:"What matters most to you?", options:[
    { id:"quickwins", icon:"🎯", label:"Quick wins I can use today",     desc:"Immediately applicable" },
    { id:"deep",      icon:"📚", label:"Understand everything deeply",   desc:"Nothing left behind" },
    { id:"connect",   icon:"🔗", label:"Connect Claude to all my tools", desc:"Integrations & automations" },
    { id:"build",     icon:"🏗️", label:"Build real things",             desc:"Apps, tools, AI products" },
  ]},
];

// ─── MASTERY PANEL COMPONENT ─────────────────────────────────────────────────
function MasteryPanel({ tiers, tierMeta, allSteps, done, pct }) {
  const [expanded, setExpanded] = useState(false);
  const total = allSteps.length;

  return (
    <div style={{
      background:"#0a0a0a",
      border:"1px solid #161616",
      borderRadius:10,
      marginBottom:"1.5rem",
      overflow:"hidden",
      transition:"all 0.3s ease",
    }}>
      {/* Top bar — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding:"0.85rem 1.1rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.75rem" }}>

        {/* Segmented progress bar */}
        <div style={{ flex:1, height:6, borderRadius:3, background:"#111", overflow:"hidden", display:"flex", gap:"1px" }}>
          {tiers.map(tierId => {
            const tm      = tierMeta[tierId];
            const steps   = allSteps.filter(s => s.tier === tierId);
            const tierPct = steps.length / total;      // this tier's share of total width
            const doneHere = steps.filter(s => done.has(s.id)).length;
            const fillPct  = steps.length > 0 ? doneHere / steps.length : 0;
            return (
              <div key={tierId} style={{ flex: tierPct, height:"100%", background:"#1a1a1a", borderRadius:1, overflow:"hidden", position:"relative" }}>
                <div style={{
                  position:"absolute", inset:0,
                  width:`${fillPct * 100}%`,
                  background: tm.color,
                  borderRadius:1,
                  transition:"width 0.5s ease",
                }} />
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ flexShrink:0, textAlign:"right" }}>
          <span style={{ fontSize:"0.78rem", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"1px", color:"#e0e0e0" }}>{pct}%</span>
          <span style={{ fontSize:"0.56rem", color:"#383838", marginLeft:"0.35rem", letterSpacing:"1px" }}>MASTERED</span>
        </div>
        <span style={{ color:"#2a2a2a", fontSize:"0.6rem", flexShrink:0 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div style={{ borderTop:"1px solid #111", padding:"0.85rem 1.1rem" }}>
          <div style={{ fontSize:"0.54rem", color:"#333", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"0.85rem" }}>
            Progress by tier
          </div>

          {tiers.map(tierId => {
            const tm       = tierMeta[tierId];
            const steps    = allSteps.filter(s => s.tier === tierId);
            const doneHere = steps.filter(s => done.has(s.id)).length;
            const tierPct  = steps.length > 0 ? Math.round((doneHere / steps.length) * 100) : 0;
            const contrib  = Math.round((doneHere / total) * 100);  // contribution to overall %

            return (
              <div key={tierId} style={{ marginBottom:"0.7rem" }}>
                {/* Row header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.28rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.45rem" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background: doneHere > 0 ? tm.color : "#222", flexShrink:0, transition:"background 0.3s" }} />
                    <span style={{ fontSize:"0.62rem", color: doneHere > 0 ? "#bbb" : "#383838", letterSpacing:"0.5px" }}>
                      {tm.label} · {tm.name}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", flexShrink:0 }}>
                    {/* Contribution badge */}
                    {contrib > 0 && (
                      <span style={{
                        fontSize:"0.5rem",
                        color: tm.color,
                        background:`${tm.color}12`,
                        border:`1px solid ${tm.color}25`,
                        padding:"1px 5px",
                        borderRadius:10,
                        letterSpacing:"1px",
                        whiteSpace:"nowrap",
                      }}>
                        +{contrib}% overall
                      </span>
                    )}
                    <span style={{ fontSize:"0.62rem", color: tierPct === 100 ? tm.color : "#444", letterSpacing:"1px", minWidth:52, textAlign:"right" }}>
                      {doneHere}/{steps.length} · {tierPct}%
                    </span>
                  </div>
                </div>

                {/* Tier progress bar — segmented by individual steps */}
                <div style={{ height:3, borderRadius:2, background:"#111", overflow:"hidden", display:"flex", gap:"1px" }}>
                  {steps.map(step => (
                    <div key={step.id} style={{
                      flex:1, height:"100%",
                      background: done.has(step.id) ? tm.color : "#1a1a1a",
                      borderRadius:1,
                      transition:"background 0.4s ease",
                    }} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Overall summary row */}
          <div style={{ borderTop:"1px solid #111", paddingTop:"0.75rem", marginTop:"0.35rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"0.58rem", color:"#383838", letterSpacing:"1.5px" }}>TOTAL MASTERY</span>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
              <span style={{ fontSize:"0.62rem", color:"#555" }}>{done.size} / {total} steps</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", letterSpacing:"1px", background:"linear-gradient(90deg,#4ade80,#facc15,#f97316,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {pct}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [modal, setModal]         = useState(false);
  const [user, setUser]           = useState(null);
  const [showAuth, setShowAuth]   = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Listen to auth state changes + reload data after returning from checkout
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (session?.user) loadUserData(session.user.id);
    });
    // Reload credits after returning from checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) loadUserData(session.user.id);
      }, 3000);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load user's unlocked steps and progress from Supabase
  const loadUserData = async (userId) => {
    const { data } = await supabase
      .from('user_progress')
      .select('unlocked_ids, done_ids, saved_tips, credits')
      .eq('user_id', userId)
      .single();
    if (data) {
      if (data.unlocked_ids) setUnlocked(new Set(data.unlocked_ids));
      if (data.done_ids)     setDone(new Set(data.done_ids));
      if (data.saved_tips)   setSavedTips(new Set(data.saved_tips));
      if (data.credits)      setCredits(data.credits);
    }
  };

  // Manually refresh user data from Supabase
  const refreshUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadUserData(session.user.id);
  };

  // Copy build idea as prompt
  const copyIdea = (idea) => {
    const text = `Build me: ${idea.title}\n\n${idea.description}\n\nSkills to use: ${(idea.skills_used || []).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedIdea(idea.title);
    setTimeout(() => setCopiedIdea(null), 2000);
  };

  // Copy to clipboard
  const copyPrompt = (text, id) => {
    navigator.clipboard.writeText(text.replace(/^"|"$/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save completion note and mark mastered
  const saveNoteAndMaster = (stepId, e) => {
    const note = completionNote[stepId] || '';
    if (note.trim()) {
      setSavedNotes(prev => ({ ...prev, [stepId]: note }));
      if (user) saveUserData(user.id, { completion_notes: { ...savedNotes, [stepId]: note } });
    }
    setShowNoteFor(null);
    toggleDone(stepId, e);
  };

  // Add a result
  const addResult = (stepId) => {
    if (!resultDraft.title.trim() && !resultDraft.text.trim()) return;
    const result = {
      id: Date.now(),
      stepId,
      title: resultDraft.title || 'Untitled',
      text: resultDraft.text,
      date: new Date().toLocaleDateString(),
    };
    const newResults = [...myResults, result];
    setMyResults(newResults);
    if (user) saveUserData(user.id, { my_results: newResults });
    setResultDraft({ title:'', text:'' });
    setAddResultFor(null);
  };

  // Delete a result
  const deleteResult = (id) => {
    const newResults = myResults.filter(r => r.id !== id);
    setMyResults(newResults);
    if (user) saveUserData(user.id, { my_results: newResults });
  };

  // Generate build ideas via serverless function
  const generateBuildIdeas = async () => {
    setBuildLoading(true);
    setBuildIdeas(null);
    const unlockedSteps = ALL_STEPS.filter(s => done.has(s.id));
    const stepNames = unlockedSteps.map(s => s.label).join(', ');
    const resultContext = myResults.length > 0
      ? myResults.slice(-6).map(r => r.title).join(', ')
      : '';
    try {
      const res = await fetch('/api/build-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepNames, resultContext })
      });
      const data = await res.json();
      setBuildIdeas(data.ideas || []);
    } catch (err) {
      setBuildIdeas([{ title: 'Error', description: 'Could not generate ideas. Please try again.', skills_used: [] }]);
    }
    setBuildLoading(false);
  };

  // Save user progress to Supabase whenever state changes
  const saveUserData = async (userId, updates) => {
    await supabase.from('user_progress').upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(0);
    setUnlocked(new Set());
    setDone(new Set());
    setSavedTips(new Set());
  };
  const [qIdx, setQIdx]           = useState(0);
  const [answers, setAnswers]     = useState({});
  const [recs, setRecs]               = useState(null);
  const [unlockedIds, setUnlocked]     = useState(new Set());
  const [credits, setCredits]          = useState(0);        // learner credit balance
  const [showTopUp, setShowTopUp]      = useState(false);    // top up credits modal
  const [copiedId, setCopiedId]        = useState(null);     // which try-these was just copied
  const [completionNote, setNote]      = useState({});       // stepId -> note text being typed
  const [showNoteFor, setShowNoteFor]  = useState(null);     // stepId showing note prompt
  const [savedNotes, setSavedNotes]    = useState({});       // stepId -> saved note
  const [myResults, setMyResults]      = useState([]);       // array of {id, stepId, title, text, date}
  const [showResults, setShowResults]  = useState(false);    // my results panel
  const [addResultFor, setAddResultFor]= useState(null);     // stepId adding result for
  const [resultDraft, setResultDraft]  = useState({title:'', text:''});
  const [showBuilder, setShowBuilder]  = useState(false);    // what can I build panel
  const [buildIdeas, setBuildIdeas]    = useState(null);     // AI generated ideas
  const [buildLoading, setBuildLoading]= useState(false);
  const [seenBuilder, setSeenBuilder]  = useState(() => {
    try { return localStorage.getItem('mc_seen_builder') === '1'; } catch { return false; }
  });
  const [copiedIdeaId, setCopiedIdea]  = useState(null);
  const [stepModal, setStepModal]      = useState(null);    // locked step clicked -> { step, allRemaining }
  const [tierModal, setTierModal]      = useState(null);    // locked tier clicked -> tierId
  const [savedTips, setSavedTips]      = useState(() => {
    try { const s = localStorage.getItem("mc_saved_tips"); return s ? new Set(JSON.parse(s)) : new Set(); }
    catch { return new Set(); }
  });
  const [savedPanel, setSavedPanel]    = useState(false);   // saved tips panel open
  const [openTier, setOpenTier]        = useState(null);
  const [openSkill, setOpenSkill]      = useState(null);
  const [done, setDone]                = useState(new Set());

  // Price for a single step
  const stepPrice = (stepId) => {
    const tier = parseInt(stepId.split(".")[0]);
    return PACK1_TIERS.includes(tier) ? PACK1_PER_STEP : PACK2_PER_STEP;
  };

  // Cost of an array of step IDs (only unowned ones that aren't free)
  const costOf = (ids) => {
    return ids.reduce((sum, id) => {
      if (unlockedIds.has(id)) return sum;
      if (TIER_META[parseInt(id.split(".")[0])].base === 0) return sum;
      return sum + stepPrice(id);
    }, 0);
  };

  // All locked paid steps in the system
  const allLockedPaid = ALL_STEPS.filter(s =>
    TIER_META[s.tier].base > 0 && !unlockedIds.has(s.id)
  );

  const toggleDone = (id, e) => {
    e.stopPropagation();
    setDone(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      if (user) saveUserData(user.id, { done_ids: [...n] });
      return n;
    });
  };

  const handleAnswer = (qId, optId) => {
    const next = { ...answers, [qId]: optId };
    setAnswers(next);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      const ids   = getRecommendations(next.goal, next.level, next.focus);
      const price = calcPrice(ids);
      setRecs({ ids, ...price });
      setModal("result");
    }
  };

  const openQuiz = () => { setQIdx(0); setAnswers({}); setModal("quiz"); };
  const closeModal = () => { setModal(false); setStepModal(null); setTierModal(null); };

  // Lemon Squeezy checkout URLs
  const LS_ADVANCED = 'https://masterclaude.lemonsqueezy.com/buy/1608090';
  const LS_EXPERT   = 'https://masterclaude.lemonsqueezy.com/buy/1608129';

  // Determine which pack to charge based on step IDs
  const getCheckoutUrl = (ids) => {
    const hasPack2 = ids.some(id => parseInt(id.split(".")[0]) >= 8);
    const hasPack1 = ids.some(id => { const t = parseInt(id.split(".")[0]); return t >= 3 && t <= 7; });
    // Build checkout URL with user info so webhook can identify them
    const checkoutParams = new URLSearchParams({
      'checkout[email]': user?.email || '',
      'checkout[custom][user_id]': user?.id || '',
    });
    if (hasPack1 && hasPack2) {
      // Buying both packs — charge Expert ($10) and then unlock pack1 via webhook too
      // For now redirect to Expert pack and handle pack1 in webhook
      return `${LS_EXPERT}?${checkoutParams}`;
    }
    if (hasPack2) return `${LS_EXPERT}?${checkoutParams}`;
    return `${LS_ADVANCED}?${checkoutParams}`;
  };

  // Open Lemon Squeezy checkout
  // Spend credits to unlock steps
  const doUnlock = (ids, amount) => {
    if (!user) { setShowAuth(true); return; }
    if (credits < amount) {
      closeModal();
      setShowTopUp(true);
      return;
    }
    const newCredits = credits - amount;
    setUnlocked(prev => {
      const n = new Set(prev);
      ids.forEach(id => n.add(id));
      if (user) saveUserData(user.id, { unlocked_ids: [...n], credits: newCredits });
      return n;
    });
    setCredits(newCredits);
    closeModal();
  }

  // Unlock from personalisation result (only charge for steps not already owned)
  const unlockRecs = () => {
    if (!recs) return;
    if (!user) { setShowAuth(true); return; }
    const newIds = recs.ids.filter(id => !unlockedIds.has(id));
    const amount = parseFloat(costOf(newIds).toFixed(2));
    doUnlock(newIds, amount);
  };

  // Unlock a single step (and its prerequisites)
  const unlockStep = (stepId) => {
    if (!user) { setShowAuth(true); return; }
    // Resolve prereqs for this single step
    const toAdd = new Set([stepId]);
    let changed = true;
    while (changed) {
      changed = false;
      toAdd.forEach(id => {
        (PREREQS_MAP[id] || []).forEach(pre => { if (!toAdd.has(pre) && !unlockedIds.has(pre)) { toAdd.add(pre); changed = true; } });
      });
      toAdd.forEach(id => {
        const tier = parseInt(id.split(".")[0]);
        const intro = TIER_INTROS_MAP[tier];
        if (intro && !toAdd.has(intro) && !unlockedIds.has(intro)) { toAdd.add(intro); changed = true; }
      });
    }
    const newIds = [...toAdd].filter(id => !unlockedIds.has(id) && TIER_META[parseInt(id.split(".")[0])].base > 0);
    const amount = Math.round(costOf(newIds));
    doUnlock(newIds, amount);
  };

  // Unlock ALL remaining locked steps
  const unlockAll = () => {
    if (!user) { setShowAuth(true); return; }
    const newIds = allLockedPaid.map(s => s.id);
    const amount = parseFloat(costOf(newIds).toFixed(2));
    doUnlock(newIds, amount);
  };

  // Toggle star on a tip — persists to Supabase if logged in, else localStorage
  const toggleStar = (stepId) => {
    setSavedTips(prev => {
      const n = new Set(prev);
      n.has(stepId) ? n.delete(stepId) : n.add(stepId);
      if (user) {
        saveUserData(user.id, { saved_tips: [...n] });
      } else {
        try { localStorage.setItem("mc_saved_tips", JSON.stringify([...n])); } catch {}
      }
      return n;
    });
  };

  // Unlock an entire tier (all steps not yet owned)
  const unlockTier = (tierId, e) => {
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    const tierSteps = ALL_STEPS.filter(s => s.tier === tierId && !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0);
    const newIds    = tierSteps.map(s => s.id);
    const amount    = Math.round(costOf(newIds));
    doUnlock(newIds, amount);
  };

  // Price to unlock an entire tier (only unowned steps)
  const tierUnlockPrice = (tierId) => {
    const remaining = ALL_STEPS.filter(s => s.tier === tierId && !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0);
    return Math.round(costOf(remaining.map(s => s.id)));
  };

  const isStepUnlocked = (step) => {
    if (TIER_META[step.tier].base === 0) return true;
    return unlockedIds.has(step.id);
  };

  const pct = Math.round((done.size / ALL_STEPS.length) * 100);
  const tiers = Object.keys(TIER_META).map(Number).sort((a,b)=>a-b);

  // Prerequisite maps for single-step unlock resolver
  const PREREQS_MAP = {
    "3.2":["3.1"],"3.3":["3.1","3.2"],"3.4":["3.1","3.2"],
    "4.2":["4.1"],"4.4":["4.3"],"4.5":["4.1"],
    "5.2":["5.1"],
    "6.2":["6.1"],"6.3":["6.1","6.2"],
    "7.2":["7.1"],"7.3":["7.1","7.2"],"7.5":["7.1"],
    "8.2":["8.1"],"8.3":["8.1"],"8.4":["8.1"],"8.5":["8.1","8.2","8.3"],
    "9.2":["9.1"],"9.3":["9.1"],"9.4":["9.1"],"9.5":["9.1","9.2"],
    "10.2":["10.1"],"10.3":["10.1","10.2"],"10.4":["10.1","10.3"],"10.5":["10.1","10.3","10.4"],
  };
  const TIER_INTROS_MAP = {3:"3.1",4:"4.1",5:"5.1",6:"6.1",7:"7.1",8:"8.1",9:"9.1",10:"10.1"};

  return (
    <div style={{ minHeight:"100vh", background:"#060606", color:"#ddd", fontFamily:"'DM Mono',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#1e1e1e;}
        .fade{animation:fi 0.35s ease both;}
        @keyframes fi{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .opt{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:9px;padding:0.85rem 1rem;cursor:pointer;text-align:left;transition:all 0.15s;width:100%;}
        .opt:hover{border-color:#333;background:#111;transform:translateY(-1px);}
        .cta{border:none;border-radius:30px;cursor:pointer;font-family:'DM Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;transition:all 0.18s;font-weight:500;}
        .cta:hover{opacity:0.85;transform:scale(1.02);}
        .sub-row{padding:0.55rem 1.1rem 0.55rem 2.8rem;border-top:1px solid #0d0d0d;cursor:pointer;transition:background 0.1s;display:flex;align-items:center;gap:0.55rem;}
        .sub-row:hover{background:#0b0b0b;}
        .try-line{font-size:0.75rem;padding:0.38rem 0.65rem;margin:0.22rem 0;border-radius:0 5px 5px 0;line-height:1.55;border-left:2px solid;background:#0c0c0c;color:#c8c8c8;}
        .done-btn{font-family:'DM Mono',monospace;font-size:0.63rem;border-radius:3px;padding:3px 10px;cursor:pointer;letter-spacing:1px;transition:all 0.15s;border:1px solid;}
        .pgbar{height:2px;border-radius:2px;background:#111;overflow:hidden;}
        .pgfill{height:100%;border-radius:2px;transition:width 0.4s ease;}
        .pill{font-size:0.52rem;padding:1px 6px;border-radius:20px;letter-spacing:1.5px;text-transform:uppercase;}
        .overlay{position:fixed;inset:0;background:#000000bb;backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal{background:#0c0c0c;border:1px solid #1e1e1e;border-radius:14px;padding:2rem 1.5rem;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom:"1px solid #0d0d0d", padding:"0.85rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#060606", zIndex:100 }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"3px", background:"linear-gradient(90deg,#4ade80,#facc15,#f97316,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          MASTER CLAUDE
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          {pct > 0 && <span style={{ fontSize:"0.57rem", color:"#333", letterSpacing:"1px" }}>{pct}% mastered</span>}
          <button onClick={() => setShowTopUp(true)} style={{ background:"none", border:"1px solid #1e1e1e", color: credits > 0 ? "#facc15" : "#555", fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", letterSpacing:"1px", padding:"0.3rem 0.85rem", borderRadius:20, cursor:"pointer" }}>
            Cr.{credits}
          </button>
          {user && <button onClick={refreshUserData} title="Refresh credits" style={{ background:"none", border:"none", color:"#333", fontSize:"0.8rem", cursor:"pointer", padding:"0.2rem", lineHeight:1 }}>↻</button>}
          <button onClick={() => setShowResults(p => !p)} title="My Results"
            style={{ background: showResults ? "#1e1e1e" : "none", border:"1px solid #1e1e1e", color: myResults.length > 0 ? "#a78bfa" : "#555", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1px", padding:"0.3rem 0.7rem", borderRadius:20, cursor:"pointer", position:"relative" }}>
            ◈{myResults.length > 0 && <span style={{ position:"absolute", top:-4, right:-4, background:"#a78bfa", color:"#000", fontSize:"0.45rem", fontWeight:"bold", width:13, height:13, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{myResults.length}</span>}
          </button>
          <button onClick={() => { setShowBuilder(p => !p); if (!buildIdeas && !buildLoading) generateBuildIdeas(); }}
            title="What can I build?"
            style={{ background: showBuilder ? "#1e1e1e" : "none", border:"1px solid #1e1e1e", color:"#555", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1px", padding:"0.3rem 0.7rem", borderRadius:20, cursor:"pointer" }}>
            ⚡
          </button>
          {/* Auth button */}
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ fontSize:'0.58rem', color:'#555', letterSpacing:'1px', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={signOut} style={{ background:'none', border:'1px solid #1e1e1e', color:'#555', fontFamily:"'DM Mono',monospace", fontSize:'0.58rem', letterSpacing:'1px', padding:'0.3rem 0.75rem', borderRadius:20, cursor:'pointer' }}>
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ background:'none', border:'1px solid #1e1e1e', color:'#666', fontFamily:"'DM Mono',monospace", fontSize:'0.62rem', letterSpacing:'1.5px', padding:'0.35rem 0.9rem', borderRadius:20, cursor:'pointer' }}>
              Sign in
            </button>
          )}
          {/* Saved tips bookmark */}
          <button onClick={() => setSavedPanel(p => !p)}
            style={{ background: savedPanel ? "#1e1e1e" : "transparent", border:"1px solid #1e1e1e", color: savedTips.size > 0 ? "#facc15" : "#555", fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", padding:"0.32rem 0.7rem", borderRadius:20, cursor:"pointer", position:"relative", transition:"all 0.2s" }}
            title="Saved tips">
            ★
            {savedTips.size > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4, background:"#facc15", color:"#000", fontSize:"0.45rem", fontWeight:"bold", width:13, height:13, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                {savedTips.size}
              </span>
            )}
          </button>
          <button className="cta" onClick={openQuiz}
            style={{ background:"transparent", border:"1px solid #1e1e1e", color:"#666", fontSize:"0.62rem", padding:"0.35rem 0.9rem" }}>
            Personalise
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:640, margin:"0 auto", padding:"4rem 1.5rem 3rem", textAlign:"center" }}>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.8rem,8vw,5rem)", letterSpacing:"3px", lineHeight:0.93, marginBottom:"1.1rem" }}>
          <span style={{ background:"linear-gradient(135deg,#e0e0e0,#555)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>You signed up<br/>for Claude.</span>
          <br/>
          <span style={{ background:"linear-gradient(135deg,#4ade80,#facc15)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Now master it.</span>
        </h1>
        <p style={{ color:"#444", fontSize:"0.8rem", lineHeight:1.9, marginBottom:"2rem" }}>
          10 tiers · 100+ skills · everything from basic prompts<br/>to features most users never discover
        </p>
        <button className="cta" onClick={openQuiz}
          style={{ background:"linear-gradient(135deg,#4ade80,#facc15)", color:"#000", fontSize:"0.72rem", padding:"0.75rem 2rem" }}>
          Personalise My Roadmap
        </button>
      </div>

      <div style={{ borderTop:"1px solid #0d0d0d" }} />

      {/* ── ROADMAP ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"2rem 1rem 5rem" }}>
        {/* ── MASTERY PROGRESS PANEL ─────────────────────────────── */}
        {pct > 0 && (
          <MasteryPanel
            tiers={tiers}
            tierMeta={TIER_META}
            allSteps={ALL_STEPS}
            done={done}
            pct={pct}
          />
        )}

        {/* Step emoji lookup */}
        {(() => {
          const STEP_EMOJIS = {
            "1.1":"💬","1.2":"🎯","1.3":"🎭","1.4":"📐","1.5":"🔄",
            "2.1":"🏗️","2.2":"🎮","2.3":"📁","2.4":"🔍","2.5":"🗓️",
            "3.1":"📂","3.2":"✨","3.3":"📎","3.4":"⚙️","3.5":"🧠",
            "4.1":"🎨","4.2":"📊","4.3":"🗺️","4.4":"📍","4.5":"🖥️",
            "5.1":"📣","5.2":"📧","5.3":"📱","5.4":"✍️","5.5":"🌍",
            "6.1":"💻","6.2":"🔎","6.3":"🐛","6.4":"📈","6.5":"🧮",
            "7.1":"💾","7.2":"🪟","7.3":"⚡","7.4":"🤖","7.5":"🛠️",
            "8.1":"🔌","8.2":"📂","8.3":"📓","8.4":"💬","8.5":"🔗",
            "9.1":"🖼️","9.2":"🖱️","9.3":"🎞️","9.4":"📤","9.5":"🏢",
            "10.1":"🎒","10.2":"📦","10.3":"🛠️","10.4":"🔀","10.5":"👥",
          };
          const TIER_SUBTITLES = {
            1:"Master communication & input",
            2:"Build real things — apps, files, research",
            3:"Make Claude remember you",
            4:"Design without a designer",
            5:"Write like a pro",
            6:"Think like a developer",
            7:"Build AI-powered tools",
            8:"Connect everything",
            9:"Your dedicated visual workspace",
            10:"Teach Claude your way of working",
          };

          return tiers.map(tierId => {
          const tm      = TIER_META[tierId];
          const steps   = ALL_STEPS.filter(s => s.tier === tierId);
          const isOpen  = openTier === tierId;
          const isFree  = tm.base === 0;
          const sd      = steps.filter(s => done.has(s.id)).length;
          const hasAnyUnlocked = steps.some(s => unlockedIds.has(s.id));
          const tierActive     = isFree || hasAnyUnlocked;
          const recStepsInTier = recs ? steps.filter(s => recs.ids.includes(s.id)) : [];
          const hasRec = recStepsInTier.length > 0;

          return (
            <div key={tierId} id={`tier-${tierId}`} style={{
              marginBottom:"0.75rem",
              border:`1px solid ${isOpen && tierActive ? tm.color+"33" : tierActive ? "#1c1c1c" : "#0f0f0f"}`,
              borderRadius:12,
              overflow:"hidden",
              opacity: tierActive ? 1 : 0.55,
              transition:"opacity 0.4s ease, border-color 0.3s ease",
              background: isOpen ? "#0a0a0a" : "#080808",
            }}>

              {/* ── TIER HEADER ─────────────────────────────────── */}
              <div style={{ padding:"1rem 1.1rem", display:"flex", alignItems:"center", gap:"0.9rem" }}>

                {/* Circular numbered badge */}
                <div
                  onClick={() => {
                    if (!isFree && !tierActive) { setTierModal(tierId); setModal("tier"); }
                    else { setOpenTier(isOpen ? null : tierId); }
                  }}
                  style={{
                    width:44, height:44, borderRadius:"50%", flexShrink:0, cursor:"pointer",
                    background: tierActive ? `${tm.color}15` : "#111",
                    border:`2px solid ${tierActive ? tm.color+"55" : "#1e1e1e"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.2rem",
                    color: tierActive ? tm.color : "#2a2a2a",
                    transition:"all 0.3s",
                  }}>
                  {tierId}
                </div>

                {/* Label block */}
                <div
                  onClick={() => {
                    if (!isFree && !tierActive) { setTierModal(tierId); setModal("tier"); }
                    else { setOpenTier(isOpen ? null : tierId); }
                  }}
                  style={{ flex:1, cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap", marginBottom:"0.18rem" }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"3px", color: tierActive ? tm.color : "#444", transition:"color 0.3s" }}>
                      {tm.label}
                    </span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"2px", color: tierActive ? "#d0d0d0" : "#444", transition:"color 0.3s" }}>
                      {tm.name.toUpperCase()}
                    </span>
                    {isFree && (
                      <span style={{ fontSize:"0.56rem", padding:"2px 8px", borderRadius:20, background:`${tm.color}18`, color:tm.color, border:`1px solid ${tm.color}30`, letterSpacing:"1.5px", textTransform:"uppercase" }}>
                        Always Free
                      </span>
                    )}
                    {!isFree && !tierActive && <span style={{ fontSize:"0.7rem", opacity:0.5 }}>🔒</span>}
                    {hasRec && !isFree && !tierActive && (
                      <span style={{ fontSize:"0.52rem", padding:"2px 7px", borderRadius:20, background:"#ffffff06", color:"#555", border:"1px solid #1e1e1e", letterSpacing:"1.5px", textTransform:"uppercase" }}>
                        Recommended
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:"0.7rem", color: tierActive ? "#555" : "#3a3a3a", transition:"color 0.3s" }}>
                    {TIER_SUBTITLES[tierId]}
                  </div>
                </div>

                {/* Progress + chevron */}
                <div
                  onClick={() => setOpenTier(isOpen ? null : tierId)}
                  style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"0.25rem", flexShrink:0, cursor:"pointer" }}>
                  <span style={{ fontSize:"0.65rem", color: sd === steps.length && sd > 0 ? tm.color : tierActive ? "#555" : "#444", letterSpacing:"1px", fontWeight:500 }}>
                    {sd}/{steps.length}
                  </span>
                  <span style={{ color: tierActive ? "#3a3a3a" : "#1e1e1e", fontSize:"0.65rem" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* ── STEPS ───────────────────────────────────────── */}
              {isOpen && (
                <div style={{ borderTop:`1px solid ${tm.color}15` }}>
                  {steps.map((step, idx) => {
                    const unlocked  = isStepUnlocked(step);
                    const isDone    = done.has(step.id);
                    const isSubOpen = openSkill === step.id;
                    const isRec     = recs && recs.ids.includes(step.id);
                    const emoji     = STEP_EMOJIS[step.id] || "▸";

                    return (
                      <div key={step.id} style={{
                        borderTop: idx > 0 ? "1px solid #0f0f0f" : "none",
                        background: isDone ? `${tm.color}06` : isSubOpen ? "#0d0d0d" : "transparent",
                        transition:"background 0.2s",
                      }}>
                        {/* Step row — always visible with emoji, label, description */}
                        <div
                          onClick={() => {
                            if (unlocked) { setOpenSkill(isSubOpen ? null : step.id); }
                            else if (!user) { setShowAuth(true); }
                            else { setStepModal(step); setModal("step"); }
                          }}
                          style={{ display:"flex", alignItems:"flex-start", gap:"0.85rem", padding:"0.9rem 1.1rem", cursor:"pointer" }}>

                          {/* Emoji icon in small circle */}
                          <div style={{
                            width:36, height:36, borderRadius:"50%", flexShrink:0,
                            background: unlocked ? `${tm.color}12` : "#0e0e0e",
                            border:`1px solid ${unlocked ? tm.color+"30" : "#161616"}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"1rem", lineHeight:1,
                            opacity: unlocked ? 1 : 0.3,
                            transition:"all 0.3s",
                          }}>
                            {unlocked ? emoji : "🔒"}
                          </div>

                          {/* Label + description block */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.25rem", flexWrap:"wrap" }}>
                              {/* Done circle */}
                              {unlocked && (
                                <div
                                  onClick={(e) => { e.stopPropagation(); toggleDone(step.id, e); }}
                                  style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${isDone ? tm.color : "#2a2a2a"}`, background:isDone ? tm.color : "transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.4rem", color:"#000", fontWeight:"bold", transition:"all 0.25s", cursor:"pointer" }}>
                                  {isDone ? "✓" : ""}
                                </div>
                              )}
                              <span style={{ fontSize:"0.85rem", fontWeight:500, color: isDone ? tm.color : unlocked ? "#d0d0d0" : "#555", transition:"color 0.3s", lineHeight:1.2 }}>
                                {step.label}
                              </span>
                              {!unlocked && isRec && (
                                <button onClick={(e) => { e.stopPropagation(); setModal("result"); }}
                                  style={{ background:`${tm.color}18`, border:`1px solid ${tm.color}44`, color:tm.color, fontFamily:"'DM Mono',monospace", fontSize:"0.52rem", padding:"0.18rem 0.55rem", borderRadius:20, cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase" }}>
                                  unlock
                                </button>
                              )}
                            </div>
                            {/* Description — always visible */}
                            <div style={{ fontSize:"0.72rem", color: unlocked ? "#555" : "#383838", lineHeight:1.6, transition:"color 0.3s" }}>
                              {step.what}
                            </div>
                            {(() => {
                              const count = myResults.filter(r => r.stepId === step.id).length;
                              return count > 0 ? (
                                <div style={{ marginTop:"0.3rem", fontSize:"0.58rem", color:`${tm.color}99`, letterSpacing:"1px" }}>
                                  ◈ {count} result{count > 1 ? "s" : ""} saved
                                </div>
                              ) : null;
                            })()}
                          </div>

                          {/* Chevron */}
                          {unlocked && (
                            <span style={{ color:"#2a2a2a", fontSize:"0.6rem", flexShrink:0, marginTop:"0.2rem" }}>
                              {isSubOpen ? "▲" : "▼"}
                            </span>
                          )}
                        </div>

                        {/* Expanded skill detail — only when unlocked */}
                        {isSubOpen && unlocked && (
                          <div style={{ padding:"0.15rem 1.1rem 0.9rem 2.6rem" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                              <div style={{ fontSize:"0.54rem", color:tm.color, letterSpacing:"2px" }}>▶ TRY THESE:</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleStar(step.id); }}
                                title={savedTips.has(step.id) ? "Remove from saved" : "Save this tip"}
                                style={{
                                  background:"none", border:"none", cursor:"pointer",
                                  fontSize:"1rem", lineHeight:1,
                                  color: savedTips.has(step.id) ? "#facc15" : "#555",
                                  transition:"color 0.2s",
                                  padding:"0.1rem",
                                }}>
                                {savedTips.has(step.id) ? "★" : "☆"}
                              </button>
                            </div>
                            {step.try.map((t,i) => {
                              const uid = `${step.id}-${i}`;
                              return (
                                <div key={i} className="try-line" style={{ borderColor:`${tm.color}44`, position:"relative", paddingRight:"2rem" }}>
                                  {t}
                                  <button
                                    onClick={e => { e.stopPropagation(); copyPrompt(t, uid); }}
                                    title="Copy prompt"
                                    style={{ position:"absolute", top:"50%", right:"0.4rem", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"0.7rem", color: copiedId === uid ? tm.color : "#444", transition:"color 0.2s", lineHeight:1, padding:"0.2rem" }}>
                                    {copiedId === uid ? "✓" : "⎘"}
                                  </button>
                                </div>
                              );
                            })}
                            <div style={{ background:"#0a0a0a", border:`1px solid ${tm.color}18`, borderRadius:5, padding:"0.48rem 0.65rem", margin:"0.5rem 0", fontSize:"0.68rem", color:"#666", lineHeight:1.65 }}>
                              <span style={{ color:tm.color, fontWeight:500 }}>💡 </span>{step.tip}
                            </div>
                            {/* Add result button */}
                            {addResultFor !== step.id && (
                              <button onClick={e => { e.stopPropagation(); setAddResultFor(step.id); setResultDraft({title:'',text:''}); }}
                                style={{ background:"none", border:`1px dashed ${tm.color}44`, color:`${tm.color}99`, fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"1.5px", padding:"0.3rem 0.75rem", borderRadius:20, cursor:"pointer", marginTop:"0.5rem", width:"100%", textAlign:"center" }}>
                                + Add My Result
                              </button>
                            )}
                            {addResultFor === step.id && (
                              <div style={{ marginTop:"0.5rem", background:"#090909", border:`1px solid ${tm.color}22`, borderRadius:8, padding:"0.75rem" }} onClick={e => e.stopPropagation()}>
                                <input placeholder="Title (e.g. My first AI email campaign)" value={resultDraft.title}
                                  onChange={e => setResultDraft(p => ({...p, title: e.target.value}))}
                                  style={{ width:"100%", background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:6, padding:"0.45rem 0.65rem", color:"#ccc", fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", marginBottom:"0.5rem", outline:"none" }} />
                                <textarea placeholder="Paste your Claude output here..." value={resultDraft.text}
                                  onChange={e => setResultDraft(p => ({...p, text: e.target.value}))}
                                  rows={4} style={{ width:"100%", background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:6, padding:"0.45rem 0.65rem", color:"#ccc", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", resize:"vertical", outline:"none", marginBottom:"0.5rem" }} />
                                <div style={{ display:"flex", gap:"0.5rem" }}>
                                  <button onClick={() => addResult(step.id)} style={{ flex:1, background:`${tm.color}22`, border:`1px solid ${tm.color}44`, color:tm.color, fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", padding:"0.45rem", borderRadius:6, cursor:"pointer" }}>Save Result</button>
                                  <button onClick={() => setAddResultFor(null)} style={{ background:"none", border:"1px solid #222", color:"#555", fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", padding:"0.45rem 0.75rem", borderRadius:6, cursor:"pointer" }}>Cancel</button>
                                </div>
                              </div>
                            )}
                            {/* Mark mastered with optional note */}
                            <div style={{ marginTop:"0.65rem" }}>
                              {showNoteFor === step.id ? (
                                <div style={{ background:"#090909", border:`1px solid ${tm.color}22`, borderRadius:8, padding:"0.75rem" }} onClick={e => e.stopPropagation()}>
                                  <div style={{ fontSize:"0.65rem", color:tm.color, marginBottom:"0.5rem", letterSpacing:"1px" }}>What did you discover? (optional)</div>
                                  <textarea placeholder="Write one thing you learned or a result you got..."
                                    value={completionNote[step.id] || ''} onChange={e => setNote(p => ({...p, [step.id]: e.target.value}))}
                                    rows={3} style={{ width:"100%", background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:6, padding:"0.45rem 0.65rem", color:"#ccc", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", resize:"none", outline:"none", marginBottom:"0.5rem" }} />
                                  <div style={{ display:"flex", gap:"0.5rem" }}>
                                    <button className="done-btn" onClick={e => saveNoteAndMaster(step.id, e)} style={{ flex:1, background:`${tm.color}22`, borderColor:tm.color, color:tm.color }}>Save & Mark Mastered</button>
                                    <button onClick={e => { setShowNoteFor(null); toggleDone(step.id, e); }} style={{ background:"none", border:"1px solid #222", color:"#555", fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", padding:"0.45rem 0.75rem", borderRadius:6, cursor:"pointer" }}>Skip</button>
                                  </div>
                                </div>
                              ) : (
                                <button className="done-btn" onClick={e => { e.stopPropagation(); if (!isDone) setShowNoteFor(step.id); else toggleDone(step.id, e); }}
                                  style={{ background:isDone ? tm.color : "transparent", color:isDone ? "#000" : tm.color, borderColor:tm.color }}>
                                  {isDone ? "✓ MASTERED" : "MARK MASTERED"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Unlock rest — shown inside expanded tier when partially or fully locked */}
                  {!isFree && steps.some(s => !unlockedIds.has(s.id)) && (() => {
                    const lockedSteps = steps.filter(s => !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0);
                    const restPrice   = Math.round(costOf(lockedSteps.map(s => s.id)));
                    return (
                      <div style={{ borderTop:`1px solid ${tm.color}15`, padding:"0.85rem 1.1rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.75rem", flexWrap:"wrap", background:"#090909" }}>
                        <div>
                          <div style={{ fontSize:"0.68rem", color:"#666", marginBottom:"0.15rem", fontWeight:500 }}>
                            {lockedSteps.length} step{lockedSteps.length > 1 ? "s" : ""} still locked in this tier
                          </div>
                          <div style={{ fontSize:"0.6rem", color:"#333" }}>Unlock them all at once</div>
                        </div>
                        <button
                          className="cta"
                          onClick={(e) => unlockTier(tierId, e)}
                          style={{
                            background:`${tm.color}18`,
                            border:`1px solid ${tm.color}44`,
                            color:tm.color,
                            fontSize:"0.65rem",
                            padding:"0.45rem 1.1rem",
                            flexShrink:0,
                          }}>
                          Unlock rest · ✦ {restPrice}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        }); })()}
      </div>

      {/* ── MODAL OVERLAY ───────────────────────────────────────────── */}
      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal fade" onClick={e => e.stopPropagation()}>

            {/* QUIZ */}
            {modal === "quiz" && (
              <>
                <div style={{ display:"flex", gap:"0.35rem", marginBottom:"1.75rem" }}>
                  {QUESTIONS.map((_,i) => <div key={i} style={{ flex:1, height:2, borderRadius:1, background: i <= qIdx ? "#e0e0e0" : "#1a1a1a", transition:"background 0.3s" }} />)}
                </div>
                <div style={{ fontSize:"0.56rem", color:"#444", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"0.5rem" }}>
                  Personalise Your Roadmap · {qIdx + 1} of {QUESTIONS.length}
                </div>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.3rem,4vw,1.8rem)", letterSpacing:"2px", color:"#e0e0e0", marginBottom:"1.4rem", lineHeight:1.1 }}>
                  {QUESTIONS[qIdx].q}
                </h2>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  {QUESTIONS[qIdx].options.map(opt => (
                    <button key={opt.id} className="opt" onClick={() => handleAnswer(QUESTIONS[qIdx].id, opt.id)}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                        <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontSize:"0.8rem", color:"#ddd", fontWeight:500, marginBottom:"0.12rem" }}>{opt.label}</div>
                          <div style={{ fontSize:"0.65rem", color:"#555" }}>{opt.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.2rem", alignItems:"center" }}>
                  {qIdx > 0
                    ? <button onClick={() => setQIdx(qIdx - 1)} style={{ background:"none", border:"none", color:"#444", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1.5px", cursor:"pointer" }}>← Back</button>
                    : <span />}
                  <button onClick={closeModal} style={{ background:"none", border:"none", color:"#333", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1.5px", cursor:"pointer" }}>Cancel</button>
                </div>
              </>
            )}

            {/* RESULT */}
            {modal === "result" && recs && (() => {
              const topTierColor = recs.breakdown.length > 0 ? TIER_META[recs.breakdown[0].tierId].color : "#4ade80";
              return (
                <>
                  <div style={{ fontSize:"0.56rem", color:"#444", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"0.5rem" }}>Your personalised path</div>
                  <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.3rem,4vw,1.75rem)", letterSpacing:"2px", color:"#e0e0e0", marginBottom:"0.35rem" }}>
                    {recs.ids.length} steps recommended for you
                  </h2>
                  <p style={{ fontSize:"0.7rem", color:"#555", lineHeight:1.7, marginBottom:"1.4rem" }}>
                    Selected from {recs.breakdown.length} tier{recs.breakdown.length > 1 ? "s" : ""} · ✦ {recs.total} credits total
                  </p>

                  {/* Breakdown */}
                  <div style={{ background:"#090909", border:"1px solid #161616", borderRadius:9, padding:"1rem", marginBottom:"1.2rem" }}>
                    <div style={{ fontSize:"0.54rem", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"0.75rem" }}>Price breakdown</div>
                    {recs.breakdown.map(b => {
                      const tm = TIER_META[b.tierId];
                      const pctOfTier = Math.round((b.count / b.of) * 100);
                      return (
                        <div key={b.tierId} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.45rem 0", borderBottom:"1px solid #111" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:tm.color, flexShrink:0 }} />
                            <span style={{ fontSize:"0.7rem", color:"#888" }}>{tm.name}</span>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                            <span style={{ fontSize:"0.62rem", color:"#444" }}>{b.count}/{b.of} steps · {pctOfTier}%</span>
                            <span style={{ fontSize:"0.75rem", color:tm.color, fontWeight:500 }}>✦ {b.subtotal}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"0.6rem" }}>
                      <span style={{ fontSize:"0.68rem", color:"#666" }}>Total</span>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", color:topTierColor, letterSpacing:"1px" }}>✦ {recs.total}</span>
                    </div>
                  </div>

                  {/* Recommended steps list */}
                  <div style={{ marginBottom:"1.2rem", maxHeight:"160px", overflowY:"auto" }}>
                    <div style={{ fontSize:"0.54rem", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"0.55rem" }}>Steps included</div>
                    {recs.ids.map(id => {
                      const step = ALL_STEPS.find(s => s.id === id);
                      if (!step) return null;
                      const tm = TIER_META[step.tier];
                      return (
                        <div key={id} style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.35rem" }}>
                          <span style={{ fontSize:"0.56rem", color:tm.color, minWidth:26 }}>{id}</span>
                          <span style={{ fontSize:"0.7rem", color:"#888" }}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const alreadyOwned = recs.ids.filter(id => unlockedIds.has(id));
                    const newSteps     = recs.ids.filter(id => !unlockedIds.has(id) && TIER_META[parseInt(id.split(".")[0])].base > 0);
                    const toPay        = Math.round(costOf(newSteps));
                    const credit       = Math.round(costOf(alreadyOwned.filter(id => TIER_META[parseInt(id.split(".")[0])].base > 0)));
                    return (
                      <>
                        {alreadyOwned.length > 0 && (
                          <div style={{ background:"#0a0a0a", border:`1px solid ${topTierColor}22`, borderRadius:8, padding:"0.65rem 0.85rem", marginBottom:"0.75rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div>
                              <div style={{ fontSize:"0.62rem", color:topTierColor, marginBottom:"0.2rem" }}>{alreadyOwned.length} steps already unlocked</div>
                              <div style={{ fontSize:"0.58rem", color:"#444" }}>Credit applied to your total</div>
                            </div>
                            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem", color:topTierColor }}>-✦ {credit}</span>
                          </div>
                        )}
                        {newSteps.length > 0 ? (
                          <button className="cta" onClick={unlockRecs}
                            style={{ background:`linear-gradient(135deg,${topTierColor},${topTierColor}99)`, color:"#000", fontSize:"0.73rem", padding:"0.82rem", width:"100%", marginBottom:"0.65rem" }}>
                            Unlock {newSteps.length} New Steps — ✦ {toPay}
                          </button>
                        ) : (
                          <div style={{ background:`${topTierColor}15`, border:`1px solid ${topTierColor}33`, borderRadius:9, padding:"0.8rem", textAlign:"center", marginBottom:"0.65rem" }}>
                            <div style={{ fontSize:"0.75rem", color:topTierColor }}>✓ All recommended steps already unlocked</div>
                          </div>
                        )}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <button onClick={openQuiz} style={{ background:"none", border:"none", color:"#333", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1px", cursor:"pointer" }}>
                            ↺ Retake quiz
                          </button>
                          <span style={{ fontSize:"0.58rem", color:"#2a2a2a", letterSpacing:"1px" }}>Credits deducted instantly · no expiry</span>
                        </div>
                      </>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── TIER UNLOCK MODAL ───────────────────────────────────── */}
      {modal === "tier" && tierModal && (() => {
        const tierId   = tierModal;
        const tm       = TIER_META[tierId];
        const steps    = ALL_STEPS.filter(s => s.tier === tierId);

        // Which pack does this tier belong to?
        const isPack1  = PACK1_TIERS.includes(tierId);
        const packTiers = isPack1 ? PACK1_TIERS : PACK2_TIERS;
        const packName  = isPack1 ? "Tiers 3–7" : "Tiers 8–10";
        const packLabel = isPack1 ? "Advanced Pack" : "Expert Pack";

        // Prices
        const tierAmt  = Math.round(costOf(steps.map(s=>s.id)));

        const packStepIds = ALL_STEPS.filter(s => packTiers.includes(s.tier) && !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0).map(s=>s.id);
        const packAmt     = Math.round(costOf(packStepIds));

        const allRemIds   = ALL_STEPS.filter(s => !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0).map(s=>s.id);
        const allRemAmt   = Math.min(1500, Math.round(costOf(allRemIds)));
        const alreadyPaidAmt = Math.round(1500 - allRemAmt);

        const options = [
          {
            key:"tier",
            title:`Unlock ${tm.name}`,
            sub:`${steps.length} steps · this tier only`,
            price: tierAmt,
            color: tm.color,
            action: () => { unlockTier(tierId, { stopPropagation:()=>{} }); },
            cta:`Unlock ${tm.label}`,
          
          },
          {
            key:"pack",
            title:`Unlock ${packLabel}`,
            sub:`${packLabel} · ${packName} · all tiers in this pack`,
            price: packAmt,
            color: isPack1 ? "#facc15" : "#c084fc",
            action: () => {
              const newIds = packStepIds.filter(id => !unlockedIds.has(id));
              doUnlock(newIds, packAmt);
            },
            cta:`Unlock ${packLabel}`,
          
          },
          {
            key:"all",
            title:"Unlock Everything",
            sub:`Complete access · all 10 tiers · 40 steps`,
            price: allRemAmt,
            color: "#e0e0e0",
            badge: alreadyPaidAmt > 0 ? `-✦ ${alreadyPaidAmt} already applied` : null,
            action: unlockAll,
            cta:"Get Full Access",
          },
        ].filter(o => o.price > 0);

        return (
          <div className="overlay" onClick={closeModal}>
            <div className="modal fade" onClick={e => e.stopPropagation()} style={{ position:"relative" }}>
              <button onClick={closeModal} style={{ position:"absolute", top:"1rem", right:"1rem", background:"none", border:"none", color:"#333", fontSize:"1rem", cursor:"pointer" }}>×</button>

              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.4rem" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:tm.color, flexShrink:0 }} />
                <span style={{ fontSize:"0.55rem", color:tm.color, letterSpacing:"2.5px", textTransform:"uppercase" }}>{tm.label}</span>
              </div>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", letterSpacing:"2px", color:"#e0e0e0", marginBottom:"0.3rem" }}>
                {tm.name}
              </h2>
              <p style={{ fontSize:"0.7rem", color:"#555", lineHeight:1.6, marginBottom:"1.4rem" }}>
                Choose how much of the roadmap you want to unlock.
              </p>

              {/* Options */}
              {options.map((opt, i) => (
                <div key={opt.key} style={{
                  background:"#090909",
                  border:`1px solid ${i === 0 ? tm.color+"30" : i === 1 ? opt.color+"22" : "#1e1e1e"}`,
                  borderRadius:9,
                  padding:"1rem",
                  marginBottom:"0.6rem",
                  position:"relative",
                  overflow:"hidden",
                }}>
                  {/* "Best value" badge on full access */}
                  {opt.key === "all" && (
                    <div style={{ position:"absolute", top:0, right:0, background:"#e0e0e018", borderLeft:"1px solid #2a2a2a", borderBottom:"1px solid #2a2a2a", padding:"2px 8px", borderRadius:"0 0 0 6px" }}>
                      <span style={{ fontSize:"0.5rem", color:"#888", letterSpacing:"1.5px", textTransform:"uppercase" }}>Best Value</span>
                    </div>
                  )}

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.55rem" }}>
                    <div style={{ flex:1, paddingRight:"1rem" }}>
                      <div style={{ fontSize:"0.78rem", color: opt.key === "all" ? "#ccc" : opt.color, fontWeight:500, marginBottom:"0.2rem" }}>{opt.title}</div>
                      <div style={{ fontSize:"0.62rem", color:"#444", lineHeight:1.5 }}>{opt.sub}</div>
                      {opt.badge && (
                        <div style={{ fontSize:"0.56rem", color:"#4ade80", marginTop:"0.25rem" }}>{opt.badge}</div>
                      )}
                    </div>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.75rem", color:opt.color, lineHeight:1, flexShrink:0 }}>
                      ✦ {opt.price}
                    </span>
                  </div>

                  <button className="cta" onClick={opt.action}
                    style={{
                      background: opt.key === "all"
                        ? "linear-gradient(135deg,#4ade80,#facc15,#f97316,#c084fc)"
                        : opt.key === "pack"
                        ? `${opt.color}22`
                        : `linear-gradient(135deg,${tm.color},${tm.color}99)`,
                      border: opt.key !== "all" ? `1px solid ${opt.color}44` : "none",
                      color: opt.key === "all" ? "#000" : opt.color,
                      fontSize:"0.7rem",
                      padding:"0.7rem",
                      width:"100%",
                    }}>
                    {opt.cta}
                  </button>
                </div>
              ))}

              {/* Personalise link */}
              <div style={{ textAlign:"center", paddingTop:"0.25rem" }}>
                <button onClick={() => { closeModal(); openQuiz(); }}
                  style={{ background:"none", border:"none", color:"#333", fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"1.5px", cursor:"pointer" }}>
                  Or personalise to find relevant steps only →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

            {/* ── STEP UNLOCK MODAL ──────────────────────────────────── */}
      {modal === "step" && stepModal && (() => {
        const step         = stepModal;
        const tm           = TIER_META[step.tier];
        const singlePrice  = Math.round(stepPrice(step.id));

        // Prereqs that will also be unlocked (not yet owned)
        const toAddSet = new Set([step.id]);
        let ch = true;
        while (ch) {
          ch = false;
          toAddSet.forEach(id => {
            (PREREQS_MAP[id]||[]).forEach(pre => { if (!toAddSet.has(pre) && !unlockedIds.has(pre)) { toAddSet.add(pre); ch=true; } });
          });
          toAddSet.forEach(id => {
            const t = parseInt(id.split(".")[0]);
            const intro = TIER_INTROS_MAP[t];
            if (intro && !toAddSet.has(intro) && !unlockedIds.has(intro)) { toAddSet.add(intro); ch=true; }
          });
        }
        const newIds    = [...toAddSet].filter(id => !unlockedIds.has(id) && TIER_META[parseInt(id.split(".")[0])].base > 0);
        const bundleAmt = Math.round(costOf(newIds));

        // "Unlock everything" option
        const remainingAll  = allLockedPaid.map(s => s.id);
        const remainingAmt  = Math.min(1500, Math.round(costOf(remainingAll)));

        return (
          <div className="overlay" onClick={closeModal}>
            <div className="modal fade" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.2rem" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:tm.color, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"0.56rem", color:tm.color, letterSpacing:"2px", textTransform:"uppercase" }}>{tm.label} · {tm.name}</div>
                  <div style={{ fontSize:"0.88rem", color:"#ddd", fontWeight:500, marginTop:"0.2rem" }}>{step.label}</div>
                </div>
              </div>

              <div style={{ fontSize:"0.72rem", color:"#555", lineHeight:1.65, marginBottom:"1.4rem" }}>
                This step is locked. Choose how you want to unlock it.
              </div>

              {/* Option 1: Single step */}
              <div style={{ background:"#090909", border:`1px solid ${tm.color}25`, borderRadius:9, padding:"1rem", marginBottom:"0.65rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.6rem" }}>
                  <div>
                    <div style={{ fontSize:"0.72rem", color:"#ccc", fontWeight:500, marginBottom:"0.2rem" }}>Unlock this step</div>
                    {newIds.length > 1 && (
                      <div style={{ fontSize:"0.62rem", color:"#444" }}>
                        + {newIds.length - 1} prerequisite{newIds.length > 2 ? "s" : ""} included automatically
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:tm.color, lineHeight:1 }}>
                    ✦ {bundleAmt}
                  </span>
                </div>
                {newIds.length > 1 && (
                  <div style={{ marginBottom:"0.65rem" }}>
                    {newIds.map(id => {
                      const s = ALL_STEPS.find(x => x.id === id);
                      return s ? (
                        <div key={id} style={{ display:"flex", gap:"0.4rem", marginBottom:"0.2rem" }}>
                          <span style={{ fontSize:"0.55rem", color:tm.color, minWidth:26 }}>{id}</span>
                          <span style={{ fontSize:"0.65rem", color:"#555" }}>{s.label}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                <button className="cta" onClick={() => unlockStep(step.id)}
                  style={{ background:`linear-gradient(135deg,${tm.color},${tm.color}99)`, color:"#000", fontSize:"0.7rem", padding:"0.7rem", width:"100%" }}>
                  Unlock {newIds.length} Step{newIds.length > 1 ? "s" : ""}
                </button>
              </div>

              {/* Option 2: Unlock entire tier */}
              {(() => {
                const tierStepsRemaining = ALL_STEPS.filter(s => s.tier === step.tier && !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0);
                const tierAmt = Math.round(costOf(tierStepsRemaining.map(s => s.id)));
                // Only show if there are more steps in the tier beyond what's being unlocked
                if (tierStepsRemaining.length <= newIds.length) return null;
                return (
                  <div style={{ background:"#090909", border:`1px solid ${tm.color}20`, borderRadius:9, padding:"1rem", marginBottom:"0.65rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
                      <div>
                        <div style={{ fontSize:"0.72rem", color:"#bbb", fontWeight:500, marginBottom:"0.2rem" }}>Unlock entire {tm.name} tier</div>
                        <div style={{ fontSize:"0.62rem", color:"#444" }}>{tierStepsRemaining.length} steps · complete tier access</div>
                      </div>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:tm.color, lineHeight:1 }}>
                        ✦ {tierAmt}
                      </span>
                    </div>
                    <button className="cta" onClick={(e) => unlockTier(step.tier, e)}
                      style={{ background:`${tm.color}18`, border:`1px solid ${tm.color}44`, color:tm.color, fontSize:"0.68rem", padding:"0.65rem", width:"100%" }}>
                      Unlock All {tierStepsRemaining.length} Steps in {tm.name}
                    </button>
                  </div>
                );
              })()}

              {/* Option 3: Unlock everything remaining */}
              {remainingAll.length > newIds.length && (() => {
                const tierStepsRemaining = ALL_STEPS.filter(s => s.tier === step.tier && !unlockedIds.has(s.id) && TIER_META[s.tier].base > 0);
                if (remainingAll.length <= tierStepsRemaining.length) return null;
                return (
                  <div style={{ background:"#090909", border:"1px solid #1a1a1a", borderRadius:9, padding:"1rem", marginBottom:"0.65rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
                      <div>
                        <div style={{ fontSize:"0.72rem", color:"#888", fontWeight:500, marginBottom:"0.2rem" }}>Unlock everything remaining</div>
                        <div style={{ fontSize:"0.62rem", color:"#444" }}>{remainingAll.length} steps · all tiers</div>
                      </div>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:"#888", lineHeight:1 }}>
                        ✦ {remainingAmt}
                      </span>
                    </div>
                    <button className="cta" onClick={unlockAll}
                      style={{ background:"transparent", border:"1px solid #2a2a2a", color:"#666", fontSize:"0.68rem", padding:"0.65rem", width:"100%" }}>
                      Unlock Everything Remaining
                    </button>
                  </div>
                );
              })()}

              {/* Personalise option */}
              <div style={{ textAlign:"center", paddingTop:"0.25rem" }}>
                <button onClick={() => { closeModal(); openQuiz(); }}
                  style={{ background:"none", border:"none", color:"#444", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1.5px", cursor:"pointer" }}>
                  Or personalise my roadmap to find relevant steps →
                </button>
              </div>

              <button onClick={closeModal}
                style={{ position:"absolute", top:"1rem", right:"1rem", background:"none", border:"none", color:"#333", fontSize:"1rem", cursor:"pointer", lineHeight:1 }}>
                ×
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── TOP UP CREDITS MODAL ─────────────────────────────────── */}
      {showTopUp && (
        <div style={{ position:"fixed", inset:0, background:"#000000bb", backdropFilter:"blur(6px)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
          onClick={() => setShowTopUp(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#0c0c0c", border:"1px solid #1e1e1e", borderRadius:14, padding:"2rem 1.5rem", width:"100%", maxWidth:420, position:"relative" }}>
            <button onClick={() => setShowTopUp(false)} style={{ position:"absolute", top:"1rem", right:"1rem", background:"none", border:"none", color:"#444", fontSize:"1rem", cursor:"pointer" }}>×</button>

            {/* Header */}
            <div style={{ marginBottom:"0.3rem", fontSize:"0.55rem", color:"#555", letterSpacing:"2.5px", textTransform:"uppercase" }}>Learner Credits</div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.6rem", letterSpacing:"2px", color:"#e0e0e0", marginBottom:"0.3rem" }}>Top Up Credits</h2>
            <p style={{ fontSize:"0.7rem", color:"#555", lineHeight:1.7, marginBottom:"1.5rem" }}>
              Credits never expire. Use them to unlock any step, tier, or your personalised path.
              {credits > 0 && <span style={{ color:"#facc15" }}> You currently have ✦ {credits}.</span>}
              {credits === 0 && <span style={{ color:"#ff6b6b" }}> You need more credits to unlock steps.</span>}
            </p>

            {/* 3 equal credit pack cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"0.65rem", marginBottom:"1.25rem" }}>
              {CREDIT_PACKS.map(pack => (
                <div key={pack.id}
                  onClick={() => {
                    const email = encodeURIComponent(user?.email || '');
                    const uid = encodeURIComponent(user?.id || '');
                    const redirect = encodeURIComponent('https://master-claude.vercel.app?checkout=success');
                    const url = `https://masterclaude.lemonsqueezy.com/checkout/buy/${pack.checkoutId}?checkout[email]=${email}&checkout[custom][user_id]=${uid}&checkout[redirect_url]=${redirect}`;
                    window.open(url, '_blank');
                  }}
                  style={{ position:"relative", background:"#090909", border:`1px solid ${pack.popular ? "#facc1555" : "#1e1e1e"}`, borderRadius:10, padding:"1rem 0.75rem", textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = pack.popular ? "#facc15aa" : "#333"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = pack.popular ? "#facc1555" : "#1e1e1e"}>
                  {pack.popular && (
                    <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#facc1522", border:"1px solid #facc1544", color:"#facc15", fontSize:"0.48rem", padding:"2px 8px", borderRadius:20, letterSpacing:"1.5px", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                      Most popular
                    </div>
                  )}
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color: pack.popular ? "#facc15" : "#e0e0e0", lineHeight:1, marginBottom:"0.2rem" }}>
                    ✦ {pack.credits}
                  </div>
                  <div style={{ fontSize:"0.62rem", color:"#555", marginBottom:"0.75rem" }}>credits</div>
                  <button
                    onClick={e => e.stopPropagation()}
                    style={{ background: pack.popular ? "linear-gradient(135deg,#facc15,#f97316)" : "#111", border:`1px solid ${pack.popular ? "#facc1544" : "#2a2a2a"}`, color: pack.popular ? "#000" : "#888", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", fontWeight:500, padding:"0.55rem 0", width:"100%", borderRadius:20, cursor:"pointer", transition:"all 0.2s", letterSpacing:"1px" }}>
                    ${pack.price}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ fontSize:"0.6rem", color:"#333", textAlign:"center", letterSpacing:"1px" }}>
              1 credit = $0.01 · one-time purchase · no subscription
            </div>
          </div>
        </div>
      )}

      {/* ── AUTH MODAL ───────────────────────────────────────────── */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(u) => { setUser(u); setShowAuth(false); }}
          color="#4ade80"
        />
      )}

      {/* ── MY RESULTS PANEL ───────────────────────────────────────── */}
      {showResults && (
        <div style={{ position:"fixed", inset:0, background:"#000000cc", backdropFilter:"blur(6px)", zIndex:300, display:"flex", alignItems:"stretch", justifyContent:"flex-end" }} onClick={() => setShowResults(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#0a0a0a", borderLeft:"1px solid #1a1a1a", width:"min(360px,100vw)", display:"flex", flexDirection:"column", animation:"slideIn 0.25s ease" }}>
            <div style={{ padding:"1.1rem 1.2rem", borderBottom:"1px solid #141414", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <span style={{ color:"#a78bfa", fontSize:"0.85rem" }}>◈</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"2px", color:"#e0e0e0" }}>MY RESULTS</span>
                {myResults.length > 0 && <span style={{ fontSize:"0.58rem", color:"#555", letterSpacing:"1px" }}>{myResults.length} saved</span>}
              </div>
              <button onClick={() => setShowResults(false)} style={{ background:"none", border:"none", color:"#444", fontSize:"1rem", cursor:"pointer" }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
              {myResults.length === 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"1rem", paddingTop:"0.5rem" }}>
                  <div style={{ background:"#0d0d0d", border:"1px solid #a78bfa22", borderRadius:10, padding:"1rem" }}>
                    <div style={{ fontSize:"0.72rem", color:"#a78bfa", fontWeight:500, marginBottom:"0.5rem" }}>◈ What is this?</div>
                    <div style={{ fontSize:"0.68rem", color:"#666", lineHeight:1.7 }}>
                      My Results is your personal gallery of Claude outputs. After using a prompt from any step, save what Claude gave you here — with a title so you can find it later.
                    </div>
                  </div>
                  <div style={{ background:"#0d0d0d", border:"1px solid #facc1522", borderRadius:10, padding:"1rem" }}>
                    <div style={{ fontSize:"0.72rem", color:"#facc15", fontWeight:500, marginBottom:"0.5rem" }}>⚡ Pro tip</div>
                    <div style={{ fontSize:"0.68rem", color:"#666", lineHeight:1.7 }}>
                      The more results you save, the smarter your <strong style={{ color:"#ccc" }}>What Can I Build</strong> ideas become. Claude uses your saved result titles to understand what you actually use it for — and tailors project ideas specifically to your work.
                    </div>
                  </div>
                  <div style={{ textAlign:"center", paddingTop:"0.5rem" }}>
                    <span style={{ fontSize:"0.65rem", color:"#333" }}>Open any step and click <strong style={{ color:"#888" }}>+ Add My Result</strong> to get started.</span>
                  </div>
                </div>
              ) : (
                myResults.slice().reverse().map(result => {
                  const step = ALL_STEPS.find(s => s.id === result.stepId);
                  const tier = step ? TIER_META[step.tier] : null;
                  return (
                    <div key={result.id} style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:8, padding:"0.85rem", marginBottom:"0.6rem", position:"relative" }}>
                      <div style={{ fontSize:"0.58rem", color: tier?.color || "#555", letterSpacing:"1.5px", marginBottom:"0.2rem" }}>
                        {step?.id} · {step?.label}
                      </div>
                      <div style={{ fontSize:"0.8rem", color:"#ccc", fontWeight:500, marginBottom:"0.4rem" }}>{result.title}</div>
                      <div style={{ fontSize:"0.68rem", color:"#666", lineHeight:1.6, maxHeight:80, overflow:"hidden", WebkitMaskImage:"linear-gradient(to bottom, black 60%, transparent)" }}>{result.text}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.5rem" }}>
                        <span style={{ fontSize:"0.55rem", color:"#383838" }}>{result.date}</span>
                        <button onClick={() => deleteResult(result.id)} style={{ background:"none", border:"none", color:"#333", fontSize:"0.7rem", cursor:"pointer" }}>✕</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WHAT CAN I BUILD PANEL ──────────────────────────────────── */}
      {showBuilder && (
        <div style={{ position:"fixed", inset:0, background:"#000000cc", backdropFilter:"blur(6px)", zIndex:300, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"2rem 1rem", overflowY:"auto" }} onClick={() => setShowBuilder(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#0a0a0a", border:"1px solid #1e1e1e", borderRadius:14, padding:"1.75rem", width:"100%", maxWidth:440 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <div>
                <div style={{ fontSize:"0.55rem", color:"#555", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"0.2rem" }}>Based on your mastered steps</div>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", letterSpacing:"2px", color:"#e0e0e0" }}>What Can I Build?</h2>
              </div>
              <button onClick={() => setShowBuilder(false)} style={{ background:"none", border:"none", color:"#444", fontSize:"1rem", cursor:"pointer" }}>×</button>
            </div>

            {/* One-time intro */}
            {!seenBuilder && (
              <div style={{ background:"#0d0d0d", border:"1px solid #facc1522", borderRadius:10, padding:"1rem", marginBottom:"1.25rem" }}>
                <div style={{ fontSize:"0.75rem", color:"#facc15", fontWeight:500, marginBottom:"0.5rem" }}>⚡ How this works</div>
                <div style={{ fontSize:"0.7rem", color:"#888", lineHeight:1.7, marginBottom:"0.85rem" }}>
                  This looks at every step you've marked as <strong style={{ color:"#ccc" }}>Mastered</strong> and generates 3 specific project ideas tailored to exactly what you know. The more you master — and the more results you save — the more personalised your ideas become.
                  <br/><br/>
                  <strong style={{ color:"#ccc" }}>What to do with an idea:</strong> copy it, open Claude in a new tab, and paste it in. Your mastered skills are everything you need to build it.
                </div>
                <button onClick={() => { setSeenBuilder(true); try { localStorage.setItem('mc_seen_builder', '1'); } catch {} }}
                  style={{ background:"#facc1522", border:"1px solid #facc1544", color:"#facc15", fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", letterSpacing:"1.5px", padding:"0.5rem 1rem", borderRadius:20, cursor:"pointer", width:"100%" }}>
                  Got it →
                </button>
              </div>
            )}

            {buildLoading && (
              <div style={{ textAlign:"center", padding:"2rem", color:"#555", fontSize:"0.75rem", letterSpacing:"1px" }}>Generating ideas based on your progress...</div>
            )}

            {!buildLoading && !buildIdeas && done.size === 0 && (
              <div style={{ textAlign:"center", padding:"1.5rem", color:"#444", fontSize:"0.72rem", lineHeight:1.7 }}>
                Mark some steps as <strong style={{ color:"#888" }}>Mastered</strong> first — then come back here for personalised project ideas.
              </div>
            )}

            {!buildLoading && buildIdeas && buildIdeas.map((idea, i) => (
              <div key={i} style={{ background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:10, padding:"1rem", marginBottom:"0.75rem", position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.35rem" }}>
                  <div style={{ fontSize:"0.85rem", color:"#e0e0e0", fontWeight:500, flex:1, paddingRight:"2rem" }}>{idea.title}</div>
                  <button onClick={() => copyIdea(idea)} title="Copy as prompt"
                    style={{ position:"absolute", top:"1rem", right:"1rem", background:"none", border:"none", cursor:"pointer", fontSize:"0.75rem", color: copiedIdeaId === idea.title ? "#4ade80" : "#444", transition:"color 0.2s" }}>
                    {copiedIdeaId === idea.title ? "✓" : "⎘"}
                  </button>
                </div>
                <div style={{ fontSize:"0.72rem", color:"#666", lineHeight:1.65, marginBottom:"0.5rem" }}>{idea.description}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem" }}>
                  {(idea.skills_used || []).map((s, j) => (
                    <span key={j} style={{ fontSize:"0.55rem", color:"#888", background:"#111", border:"1px solid #1e1e1e", padding:"2px 7px", borderRadius:20, letterSpacing:"1px" }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}

            {!buildLoading && buildIdeas && (
              <button onClick={generateBuildIdeas} style={{ width:"100%", background:"none", border:"1px solid #1e1e1e", color:"#555", fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", letterSpacing:"1.5px", padding:"0.65rem", borderRadius:8, cursor:"pointer", marginTop:"0.25rem" }}>
                ↻ Generate new ideas
              </button>
            )}
          </div>
        </div>
      )}

            {/* ── SAVED TIPS PANEL ──────────────────────────────────────── */}
      {savedPanel && (
        <div style={{
          position:"fixed", top:0, right:0, bottom:0, width:"min(340px, 100vw)",
          background:"#0a0a0a", borderLeft:"1px solid #1a1a1a",
          zIndex:300, display:"flex", flexDirection:"column",
          boxShadow:"-8px 0 32px #00000066",
          animation:"slideIn 0.25s ease",
        }}>
          <style>{`@keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }`}</style>

          {/* Panel header */}
          <div style={{ padding:"1.1rem 1.2rem", borderBottom:"1px solid #141414", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <span style={{ color:"#facc15", fontSize:"0.85rem" }}>★</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"2px", color:"#e0e0e0" }}>SAVED TIPS</span>
              {savedTips.size > 0 && (
                <span style={{ fontSize:"0.58rem", color:"#555", letterSpacing:"1px" }}>{savedTips.size} saved</span>
              )}
            </div>
            <button onClick={() => setSavedPanel(false)}
              style={{ background:"none", border:"none", color:"#444", fontSize:"1rem", cursor:"pointer", lineHeight:1 }}>×</button>
          </div>

          {/* Panel content */}
          <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
            {savedTips.size === 0 ? (
              /* Empty state */
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:"0.75rem", paddingBottom:"4rem" }}>
                <span style={{ fontSize:"1.8rem", opacity:0.15 }}>☆</span>
                <div style={{ fontSize:"0.75rem", color:"#333", textAlign:"center", lineHeight:1.7 }}>
                  Star any tip to save it here.<br/>
                  <span style={{ fontSize:"0.65rem", color:"#282828" }}>They'll be waiting next time you visit.</span>
                </div>
              </div>
            ) : (
              /* Saved tips list — grouped by tier */
              (() => {
                const tierIds = [...new Set(
                  [...savedTips].map(id => parseInt(id.split(".")[0]))
                )].sort((a,b) => a-b);

                return tierIds.map(tierId => {
                  const tm = TIER_META[tierId];
                  const tierSaved = [...savedTips].filter(id => parseInt(id.split(".")[0]) === tierId);

                  return (
                    <div key={tierId} style={{ marginBottom:"1.25rem" }}>
                      {/* Tier label */}
                      <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", marginBottom:"0.55rem" }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:tm.color, flexShrink:0 }} />
                        <span style={{ fontSize:"0.56rem", color:tm.color, letterSpacing:"2px", textTransform:"uppercase" }}>{tm.label} · {tm.name}</span>
                      </div>

                      {tierSaved.map(stepId => {
                        const step = ALL_STEPS.find(s => s.id === stepId);
                        if (!step) return null;
                        return (
                          <div key={stepId} style={{
                            background:"#0d0d0d",
                            border:`1px solid #1a1a1a`,
                            borderRadius:7,
                            padding:"0.7rem 0.75rem",
                            marginBottom:"0.45rem",
                            cursor:"pointer",
                            transition:"border-color 0.15s",
                            position:"relative",
                          }}
                          onClick={() => {
                            // Navigate to the step in the roadmap
                            setSavedPanel(false);
                            setTimeout(() => {
                              setOpenTier(tierId);
                              setOpenSkill(stepId);
                              // Scroll to tier
                              const el = document.getElementById(`tier-${tierId}`);
                              if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
                            }, 280);
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = tm.color + "44"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>

                            {/* Step label */}
                            <div style={{ fontSize:"0.6rem", color:"#444", letterSpacing:"1px", marginBottom:"0.35rem" }}>
                              {stepId} · {step.label}
                            </div>

                            {/* Tip text */}
                            <div style={{ fontSize:"0.72rem", color:"#888", lineHeight:1.65, paddingRight:"1.2rem" }}>
                              <span style={{ color:tm.color, fontWeight:500 }}>💡 </span>{step.tip}
                            </div>

                            {/* Unstar button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStar(stepId); }}
                              title="Remove from saved"
                              style={{
                                position:"absolute", top:"0.5rem", right:"0.5rem",
                                background:"none", border:"none", cursor:"pointer",
                                fontSize:"0.75rem", color:"#facc15", lineHeight:1, padding:"0.1rem",
                                transition:"color 0.15s",
                              }}>
                              ★
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      )}

      <div style={{ borderTop:"1px solid #0d0d0d", padding:"1.2rem", textAlign:"center" }}>
        <div style={{ fontSize:"0.55rem", color:"#1e1e1e", letterSpacing:"2px" }}>MASTER CLAUDE · 10 TIERS · 100+ SKILLS</div>
      </div>
    </div>
  );
}
