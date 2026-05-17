import { useState, useEffect, useRef } from "react";
import { supabase } from './supabase';
import AuthModal from './Auth';

// ─── ALL STEPS ACROSS ALL TIERS ───────────────────────────────────────────────
// Tiers 1-2 free. Tiers 3-7 base $5. Tiers 8-10 base $10.
const TIER_META = {
  1:  { label:"TIER 1",  name:"The Basics",           color:"#4ade80", base:0,  totalSteps:5 },
  2:  { label:"TIER 2",  name:"Building & Creating",  color:"#a3e635", base:0,  totalSteps:5 },
  3:  { label:"TIER 3",  name:"Projects & Memory",    color:"#facc15", base:5,  totalSteps:5 },
  4:  { label:"TIER 4",  name:"Creative & Writing",   color:"#fb923c", base:5,  totalSteps:5 },
  5:  { label:"TIER 5",  name:"Technical Skills",     color:"#f97316", base:5,  totalSteps:5 },
  6:  { label:"TIER 6",  name:"Advanced Building",    color:"#ef4444", base:5,  totalSteps:5 },
  7:  { label:"TIER 7",  name:"Claude Design",        color:"#f472b6", base:5,  totalSteps:5 },
  8:  { label:"TIER 8",  name:"Total Integration",    color:"#a78bfa", base:10, totalSteps:5 },
  9:  { label:"TIER 9",  name:"Claude Skills",        color:"#818cf8", base:10, totalSteps:5 },
  10: { label:"TIER 10", name:"Claude Ecosystem",     color:"#c084fc", base:10, totalSteps:5 },
};

const ALL_STEPS = [
  // TIER 1 — THE BASICS (free)
  { id:"1.1", tier:1, label:"Simple Conversational Prompts",
    what:"Talk to Claude naturally — describe what you want like you\'d tell a smart friend.",
    try:[
      `"What are 5 ways to make money online?"`,
      `"I can\'t sleep and it\'s been happening for weeks. What should I try?"`,
      `"Explain quantum computing like I\'m 12 years old."`
    ],
    tip:"No need for special phrasing or technical language. Claude understands natural conversation — just say what you need like you\'d say it out loud." },

  { id:"1.2", tier:1, label:"Add Context to Your Prompts",
    what:"Tell Claude who you are, what you need, and why — and watch the quality jump.",
    try:[
      `"I\'m a freelance graphic designer pitching to corporate clients. Write me a short bio for my website."`,
      `"I\'m 28, work in finance, and want to start investing. What should I know first?"`,
      `"I run a small bakery and want to grow on Instagram. Give me 3 content ideas for this week."`
    ],
    tip:"Think of it as briefing someone before they help you. The more they know about your situation, the less generic their advice." },

  { id:"1.3", tier:1, label:"Assign Claude a Role",
    what:"Tell Claude to act as something and it adopts that expertise entirely.",
    try:[
      `"Act as a brutally honest editor and review this email I\'m about to send to my boss."`,
      `"You are a Michelin-star chef. Give me a dinner recipe using chicken, lemon, and whatever is usually in a pantry."`,
      `"Act as a career coach. I\'ve been in the same job for 4 years and feel stuck. What should I do?"`
    ],
    tip:"The role changes what Claude prioritises. A coach focuses on mindset. A lawyer focuses on risk. A strategist focuses on leverage. Use roles to get the specific type of thinking you actually need." },

  { id:"1.4", tier:1, label:"Control Output Format",
    what:"Specify exactly how you want the answer structured.",
    try:[
      `"Give me a comparison of Notion vs Obsidian as a markdown table with columns for price, best use case, and learning curve."`,
      `"Summarise the French Revolution in exactly 5 bullet points, each under 15 words."`,
      `"Write a morning routine for productivity. Format it as a numbered checklist with times."`
    ],
    tip:"Format instructions work mid-conversation too. If Claude just gave you a long answer you don\'t love, just say \'redo that as a table\' or \'cut that to 5 bullet points\' — no need to start over." },

  { id:"1.5", tier:1, label:"Iterate & Refine",
    what:"Every response is a draft. Push back, redirect, and keep refining.",
    try:[
      `"Make it shorter and more punchy — I want it to feel like a tweet, not an essay."`,
      `"That\'s too formal. Rewrite it like a text message to a friend."`,
      `"Good start, but add a sense of urgency and a specific call to action at the end."`
    ],
    tip:"You\'re not being difficult by pushing back — you\'re being a good collaborator. Claude doesn\'t get frustrated and it doesn\'t get defensive. Use that." },

  // TIER 2 — BUILDING & CREATING (free)
  { id:"2.1", tier:2, label:"Build Tools & Calculators",
    what:"Ask Claude to build a functional tool — it appears as a live working app immediately.",
    try:[
      `"Build me a BMI calculator with metric and imperial options."`,
      `"Create a tip calculator that splits the bill between any number of people."`,
      `"Make a countdown timer to my next holiday — date is December 20th."`
    ],
    tip:"Any calculator you\'ve Googled — Claude can build a custom one in under 30 seconds." },

  { id:"2.2", tier:2, label:"Create Games & Quizzes",
    what:"Fully playable games, quizzes, and puzzles built directly in the chat.",
    try:[
      `"Build me a trivia quiz about 90s pop culture with 10 questions and a score tracker."`,
      `"Make a word guessing game like Wordle but the theme is countries."`,
      `"Create a personality quiz: which type of entrepreneur are you?"`
    ],
    tip:"Games are the fastest way to see what Claude can actually build." },

  { id:"2.3", tier:2, label:"Generate Real Downloadable Files",
    what:"Claude creates actual .docx, .pptx, .xlsx, and .pdf files — not just text.",
    try:[
      `"Create a professional invoice template as a Word document with my business name: Bright Studio."`,
      `"Build a weekly budget spreadsheet in Excel with income, expenses, and auto-calculated savings."`,
      `"Make a 5-slide pitch deck in PowerPoint for a mobile app that delivers groceries in 15 minutes."`
    ],
    tip:"The files open perfectly in Microsoft Office and Google Workspace." },

  { id:"2.4", tier:2, label:"Search the Web in Real Time",
    what:"Claude searches the internet live — not just its trained knowledge.",
    try:[
      `"What\'s the latest news on interest rates in South Africa today?"`,
      `"Search for the best JavaScript frameworks in 2025 and compare their popularity."`,
      `"Find the current price of Tesla stock and give me a 3-sentence summary of recent news about them."`
    ],
    tip:"If the information could have changed recently, Claude searches automatically." },

  { id:"2.5", tier:2, label:"Generate SVG Icons & Graphics",
    what:"Ask Claude to create any icon or illustration as a scalable SVG file.",
    try:[
      `"Create a minimalist SVG icon of a coffee cup — clean lines, suitable for a menu header."`,
      `"Design an SVG logo mark for a fitness brand called Peak — use geometric shapes only."`,
      `"Make a set of 3 matching SVG icons: home, settings, and notifications — all in the same style."`
    ],
    tip:"SVGs are infinitely scalable — perfect at any size for websites, presentations, and logos." },

  // TIER 3 — PROJECTS & MEMORY (pack 1)
  { id:"3.1", tier:3, label:"What Projects Are",
    what:"A Project is a persistent workspace where Claude always remembers your context.",
    try:[
      `"Explain the difference between a regular Claude chat and a Project."`,
      `"What types of ongoing work benefit most from having a dedicated Project?"`,
      `"Show me an example of what I would put in a Project for running a small online store."`
    ],
    tip:"Without Projects, every chat starts from scratch. With them, Claude always knows what you\'re working on." },

  { id:"3.2", tier:3, label:"Create Your First Project",
    what:"Set up a Project for the most important ongoing thing in your life right now.",
    try:[
      `"I\'m creating a Project for my freelance copywriting business. What should I include in the setup?"`,
      `"Help me set up a Project for managing my job search — I\'m applying to marketing roles."`,
      `"I want a Project for my side hustle selling handmade jewellery. What context should I give Claude?"`
    ],
    tip:"Projects are the single biggest quality-of-life upgrade for regular Claude users." },

  { id:"3.3", tier:3, label:"Upload Files to a Project",
    what:"Add documents to a project and Claude references them in every conversation.",
    try:[
      `"I uploaded my brand guidelines PDF. Now write me a product description that matches this tone."`,
      `"I\'ve added my CV to this project. Help me tailor it for a senior marketing manager role."`,
      `"My uploaded business plan is in this project. What are the 3 weakest sections I should strengthen?"`
    ],
    tip:"Your uploaded files become permanent context. No re-uploading every time." },

  { id:"3.4", tier:3, label:"Set Custom Project Instructions",
    what:"Tell Claude exactly how to behave in this specific project — tone, format, rules.",
    try:[
      `"My project instructions say: always respond in bullet points, never use jargon, and keep responses under 150 words. Now help me summarise this article."`,
      `"I\'ve set this project to always write in British English and use a formal tone. Draft a client update email."`,
      `"My instructions say: act as a startup advisor, always challenge my assumptions, and end every response with one question. Let\'s start."`
    ],
    tip:"Custom instructions override Claude\'s defaults for that project only." },

  { id:"3.5", tier:3, label:"Build Your Memory Profile",
    what:"Tell Claude facts about you that persist across all future conversations.",
    try:[
      `"Remember that I\'m a 34-year-old teacher in Cape Town who runs a small tutoring side business and prefers concise answers."`,
      `"Store this: I\'m vegetarian, training for a half marathon, and my goal this year is to write a book."`,
      `"Add to my memory: I prefer bullet points over paragraphs, I\'m a visual learner, and I work best with examples."`
    ],
    tip:"The more Claude knows about you, the more every answer feels written specifically for you." },

  // TIER 4 — CREATIVE & WRITING (pack 1)
  { id:"4.1", tier:4, label:"Write Ad Copy",
    what:"Compelling ads for any platform — TikTok, Instagram, Google, Facebook.",
    try:[
      `"Write a 15-second TikTok ad script for a protein shake targeting gym beginners. Tone: motivating, not bro-culture."`,
      `"Create 3 Facebook ad variations for a online course that teaches people to build websites. Budget-conscious audience."`,
      `"Write a Google search ad for a Cape Town plumber. Include a USP and a call to action. Max 90 characters per line."`
    ],
    tip:"Tell Claude the platform, the audience, and the goal. It writes for that exact context." },

  { id:"4.2", tier:4, label:"Write Email Marketing Campaigns",
    what:"Full email sequences — welcome series, product launches, nurture campaigns.",
    try:[
      `"Write a 3-email welcome sequence for a meal prep delivery service. Day 1: onboarding. Day 3: first order nudge. Day 7: loyalty hook."`,
      `"Create a product launch email for a new skincare range targeting women over 40. Tone: confident and empowering."`,
      `"Write a re-engagement email for customers who haven\'t ordered in 60 days. Offer: 20% off. Keep it warm, not desperate."`
    ],
    tip:"Tell Claude the brand voice and it maintains it consistently across the whole sequence." },

  { id:"4.3", tier:4, label:"Social Media Captions & Posts",
    what:"Platform-specific captions for Instagram, LinkedIn, TikTok, X — in your voice.",
    try:[
      `"Write 5 Instagram captions for a coffee shop in Johannesburg. Mix: one funny, one aesthetic, one behind-the-scenes, one promotional, one community."`,
      `"Create a LinkedIn post announcing I just got promoted to Head of Marketing. Professional but human. No buzzwords."`,
      `"Write a Twitter/X thread about why most people fail at building habits. 6 tweets, punchy, contrarian angle."`
    ],
    tip:"Paste 2-3 of your existing posts so Claude can match your exact voice." },

  { id:"4.4", tier:4, label:"Write Short Stories & Scripts",
    what:"Fiction, screenplays, YouTube scripts, and podcast outlines.",
    try:[
      `"Write the opening scene of a psychological thriller set in a Cape Town apartment building. 300 words."`,
      `"Create a YouTube script intro for a tech review channel — product: new Sony headphones. Hook them in 30 seconds."`,
      `"Write a 5-minute podcast episode outline on the topic: why most people never finish what they start."`
    ],
    tip:"Give Claude a genre, scenario, and mood. The more specific, the better." },

  { id:"4.5", tier:4, label:"Create Infographics",
    what:"Turn any data or concept into a visual infographic anyone can read at a glance.",
    try:[
      `"Create an infographic showing the 5 stages of a startup: idea, validation, launch, growth, scale. Each stage gets an icon and 2-line description."`,
      `"Build an infographic comparing remote vs office work across 6 factors: productivity, cost, collaboration, wellbeing, flexibility, and career growth."`,
      `"Design an infographic: \'The 7 habits of highly effective morning routines\' — visual timeline format."`
    ],
    tip:"Infographics are massively shareable on social media. Great for content creators and educators." },

  // TIER 5 — TECHNICAL SKILLS (pack 1)
  { id:"5.1", tier:5, label:"Write Code From a Description",
    what:"Describe what you want in plain English and Claude writes the code.",
    try:[
      `"Write a Python script that reads a CSV file of sales data and prints the top 5 products by revenue."`,
      `"Build a JavaScript function that takes a list of names and returns them sorted alphabetically, removing duplicates."`,
      `"Create an HTML page with a simple contact form — name, email, message — that validates inputs before submission."`
    ],
    tip:"You don\'t need to know what language to use. Just describe what you want it to do." },

  { id:"5.2", tier:5, label:"Explain & Understand Code",
    what:"Paste any code and Claude explains exactly what it does — line by line.",
    try:[
      `"Explain this Python function to me like I\'ve never coded before: [paste code]"`,
      `"Walk me through what this SQL query does, step by step: SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 7 DAY"`,
      `"I found this JavaScript snippet online. What does it do and are there any risks in using it?"`
    ],
    tip:"Great for learning, inheriting code, or reviewing before running it." },

  { id:"5.3", tier:5, label:"Debug & Fix Broken Code",
    what:"Paste broken code and the error — Claude diagnoses and fixes it.",
    try:[
      `"Here\'s my Python script and the error I\'m getting: TypeError: \'NoneType\' object is not subscriptable. Fix it: [paste code]"`,
      `"My CSS navbar looks fine on desktop but breaks on mobile. Here\'s the code — what\'s wrong?"`,
      `"This JavaScript function should return the sum of an array but it keeps returning NaN. Debug it: [paste code]"`
    ],
    tip:"Always paste both the code AND the error message for fastest diagnosis." },

  { id:"5.4", tier:5, label:"Analyse Data & Spot Insights",
    what:"Upload data and Claude tells you what it means and what to do about it.",
    try:[
      `"Here are my last 90 days of website traffic stats. Which pages are underperforming and why? [paste data]"`,
      `"Analyse this sales CSV and tell me: best day of the week, top product, and any anomalies worth investigating."`,
      `"I\'ve pasted 6 months of customer reviews. What are the top 3 complaints and the top 3 praise points?"`
    ],
    tip:"Data without interpretation is just numbers. Claude tells you what to act on." },

  { id:"5.5", tier:5, label:"Build Flowcharts & Diagrams",
    what:"Describe any process and Claude maps it into a professional diagram.",
    try:[
      `"Create a flowchart for my client onboarding process: inquiry → discovery call → proposal → contract → kickoff → delivery → review."`,
      `"Build a decision tree diagram for: should I quit my job? Branch based on financial runway, job satisfaction, and alternative income."`,
      `"Map out the architecture of a basic e-commerce website as a system diagram — frontend, backend, database, and payment gateway."`
    ],
    tip:"Great for documenting processes, onboarding guides, and making complex logic visual." },

  // TIER 6 — ADVANCED BUILDING (pack 1)
  { id:"6.1", tier:6, label:"Build Apps That Save Data",
    what:"Claude-built apps that remember your data between sessions — like real software.",
    try:[
      `"Build a habit tracker app that saves my daily check-ins and shows a streak counter. Data should persist when I close the app."`,
      `"Create a client notes app where I can add clients, log meetings, and search past notes. Everything saves automatically."`,
      `"Make a personal finance tracker that stores income and expenses, shows monthly totals, and persists between visits."`
    ],
    tip:"Most AI-built apps forget everything when closed. These actually persist your data." },

  { id:"6.2", tier:6, label:"Multi-Screen Apps & Dashboards",
    what:"Apps with tabs, menus, and multiple pages — full navigation built in.",
    try:[
      `"Build a project management dashboard with 3 tabs: Active Projects, Completed, and Archive. Each project has a status and due date."`,
      `"Create a personal dashboard with 4 sections: Today\'s Tasks, Goals, Journal, and Analytics — all navigable from a sidebar."`,
      `"Make a recipe app with screens for: Browse Recipes, My Favourites, Meal Planner, and Shopping List."`
    ],
    tip:"Multi-screen apps are real software. Tell Claude the sections you want and it wires up the navigation." },

  { id:"6.3", tier:6, label:"Apps That Pull Live API Data",
    what:"Connect any app to a public API for real-time data.",
    try:[
      `"Build a weather dashboard that pulls live data from OpenWeatherMap API for any city I search."`,
      `"Create a crypto price tracker that fetches live prices from CoinGecko\'s free API every 30 seconds."`,
      `"Make a news aggregator that pulls headlines from NewsAPI and lets me filter by category."`
    ],
    tip:"Most public APIs have free tiers. Google \'[topic] free API\' to find one. Paste the key and Claude builds the whole app around it." },

  { id:"6.4", tier:6, label:"AI-Powered Apps",
    what:"Build apps that have their own AI brain inside — they think and respond by themselves.",
    try:[
      `"Build an AI writing coach app where I paste any text and it gives detailed feedback on clarity, tone, and structure."`,
      `"Create an AI meal planner that asks about my dietary preferences and generates a weekly plan with shopping list."`,
      `"Make an AI interview prep tool — I paste a job description and it generates 10 tailored interview questions with ideal answer frameworks."`
    ],
    tip:"Once built, these tools run independently. Use them every day without coming back to Claude." },

  { id:"6.5", tier:6, label:"Clone & Customise Any Tool",
    what:"Describe a tool you use and Claude builds a custom version tailored exactly to you.",
    try:[
      `"Clone the core functionality of Trello for my personal use — just boards, lists, and cards with drag and drop."`,
      `"Build a custom Notion-style notes app but simplified: just pages, tags, and a search bar. No bloat."`,
      `"Create my own version of a Pomodoro timer but with custom work/break intervals and a session log."`
    ],
    tip:"Your custom version has no ads, no subscription, no unnecessary features." },

  // TIER 7 — CLAUDE DESIGN (pack 1)
  { id:"7.1", tier:7, label:"Access & Understand Claude Design",
    what:"Claude Design is a dedicated product — chat on the left, live canvas on the right.",
    try:[
      `"What is Claude Design and how is it different from using Claude normally?"`,
      `"What types of design work can I do in Claude Design that I can\'t do in a regular chat?"`,
      `"Walk me through the Claude Design interface — what does each panel do?"`
    ],
    tip:"Claude Design is a separate product at claude.ai/design. It\'s built for visual output — not just text." },

  { id:"7.2", tier:7, label:"Design Websites & App Prototypes",
    what:"Build realistic interactive prototypes without writing any code.",
    try:[
      `"Design a landing page for a personal finance app targeting millennials. Dark mode, clean, modern."`,
      `"Create an interactive prototype for a food delivery app — home screen, menu, cart, and checkout flow."`,
      `"Build a portfolio website prototype for a UX designer — include a hero, case studies grid, and contact section."`
    ],
    tip:"These prototypes are real HTML you can hand directly to a developer or deploy yourself." },

  { id:"7.3", tier:7, label:"Create Pitch Decks & Presentations",
    what:"From a rough outline to a complete, on-brand slide deck.",
    try:[
      `"Create a 10-slide investor pitch deck for a SaaS tool that helps freelancers manage clients. Include: problem, solution, market size, traction, team, and ask."`,
      `"Build a sales presentation for a digital marketing agency pitching to a retail client. 8 slides, results-focused."`,
      `"Make a keynote-style presentation about the future of remote work. 6 slides, bold visuals, minimal text."`
    ],
    tip:"Claude Design auto-applies your brand colours and fonts if you provide them in the prompt." },

  { id:"7.4", tier:7, label:"Design UI Mockups & Wireframes",
    what:"Build full app screens and webpage layouts as working HTML or React.",
    try:[
      `"Wireframe a mobile banking app — show the dashboard, transaction history, and transfer screens."`,
      `"Design a high-fidelity mockup for a SaaS analytics dashboard — charts, sidebar navigation, user profile."`,
      `"Create a wireframe for a checkout flow: cart summary → shipping details → payment → confirmation."`
    ],
    tip:"Hand these off to developers as a starting point, or use them directly." },

  { id:"7.5", tier:7, label:"Set Up a Brand Design System",
    what:"Point Claude at your assets and it builds a system that auto-applies your brand.",
    try:[
      `"Here are my brand colours (#1A1A2E, #E94560) and font (Bebas Neue + DM Mono). Build a design system I can reference in future prompts."`,
      `"Create a brand style guide for a sustainable fashion brand: earthy tones, serif fonts, minimal aesthetic."`,
      `"Set up a reusable component library for my brand — buttons, cards, headers, and form fields all matching my visual identity."`
    ],
    tip:"Save your brand system as a Project instruction so Claude applies it automatically every time." },

  // TIER 8 — TOTAL INTEGRATION / MCP (pack 2)
  { id:"8.1", tier:8, label:"Understand & Enable MCP",
    what:"MCP (Model Context Protocol) lets you plug external services directly into Claude.",
    try:[
      `"Explain MCP to me like I\'ve never heard of it — what does it actually do?"`,
      `"What\'s the difference between using Claude normally and using Claude with MCP enabled?"`,
      `"Walk me through how to enable my first MCP server in Claude Desktop."`
    ],
    tip:"Without MCP, Claude is a chatbot. With MCP, it operates inside your real tools." },

  { id:"8.2", tier:8, label:"Connect Google Drive",
    what:"Claude reads, searches, creates, and edits your Google Drive files.",
    try:[
      `"Search my Drive for any documents containing the word \'proposal\' and summarise the most recent one."`,
      `"Create a new Google Doc called \'Q3 Marketing Plan\' and populate it with a basic structure."`,
      `"Find my most recent spreadsheet and tell me what data it contains."`
    ],
    tip:"Claude can work across your entire Drive — not just files you manually paste in." },

  { id:"8.3", tier:8, label:"Connect Notion",
    what:"Read and write Notion pages, databases, and entries through chat.",
    try:[
      `"Add a new entry to my Notion CRM database: Company: Acme Corp, Contact: John Smith, Status: Follow-up needed."`,
      `"Find all Notion pages tagged \'In Progress\' and summarise what\'s currently active."`,
      `"Create a new Notion page in my Projects database with a template structure for a new client onboarding."`
    ],
    tip:"Claude can update your Notion databases without you opening Notion at all." },

  { id:"8.4", tier:8, label:"Connect Slack",
    what:"Read channels, catch up on messages, and send on your behalf.",
    try:[
      `"Summarise everything posted in the #general channel today that I might have missed."`,
      `"Post a message to #team-updates: \'The Q3 report is ready for review. Link in the thread.\'"`,
      `"Find any messages from the last 48 hours that mention the word \'urgent\' and list them."`
    ],
    tip:"Claude can post, summarise, and search Slack — without you scrolling through channels." },

  { id:"8.5", tier:8, label:"Chain Multiple Tools Together",
    what:"Use several connected tools in a single request — the real power of MCP.",
    try:[
      `"Find the latest proposal in my Google Drive, create a Notion entry for it in my CRM, and post a Slack message to #sales saying it\'s ready for review."`,
      `"Summarise this week\'s Slack highlights, add them to a new Notion page called \'Weekly Digest\', and save it to my Drive."`,
      `"Check my Notion task list for anything due today, then post a morning briefing to the #daily-standup Slack channel."`
    ],
    tip:"This is where MCP becomes genuinely powerful — Claude acts as the coordinator across your entire tool stack." },

  // TIER 9 — CLAUDE SKILLS (pack 2)
  { id:"9.1", tier:9, label:"What Skills Are & How They Work",
    what:"Skills are reusable instruction packs Claude loads automatically when relevant.",
    try:[
      `"Explain what a Claude Skill is and how it differs from a Project instruction."`,
      `"Give me 3 examples of tasks that would benefit from having a dedicated Skill set up."`,
      `"What happens when I activate a Skill in Claude — what changes about how it responds?"`
    ],
    tip:"Think of Skills as pre-loaded expertise. Claude knows exactly how to behave before you say a word." },

  { id:"9.2", tier:9, label:"Use Built-In Skills",
    what:"Anthropic ships pre-built skills for Excel, PowerPoint, Word, and PDF — activate and use instantly.",
    try:[
      `"Activate the Excel skill and help me build a dynamic sales dashboard with charts."`,
      `"Use the PowerPoint skill to turn this bullet-point outline into a complete 8-slide presentation."`,
      `"Enable the PDF skill and extract all the key data points from this contract I\'ve uploaded."`
    ],
    tip:"Built-in Skills are production-ready from day one. No setup needed beyond activating them." },

  { id:"9.3", tier:9, label:"Build Your First Custom Skill",
    what:"Create a skill for any workflow you repeat — Claude guides you through building it.",
    try:[
      `"Help me build a custom skill for writing LinkedIn posts in my voice. I want it to always use short paragraphs, ask a question at the end, and never use the word \'leverage\'."`,
      `"Create a skill for my weekly client report — it should always pull from the template I\'ve defined and format output in our company style."`,
      `"Build a customer support skill that always responds empathetically, offers a solution within 2 sentences, and escalates if the issue involves a refund."`
    ],
    tip:"Your custom skill is portable. Use it across Projects and share it with teammates." },

  { id:"9.4", tier:9, label:"Stack Multiple Skills Together",
    what:"Multiple skills load simultaneously — Claude coordinates them all automatically.",
    try:[
      `"I have a writing skill and a brand voice skill active. Write a product launch email using both."`,
      `"Stack my data analysis skill with my presentation skill to turn this CSV into a boardroom-ready deck."`,
      `"Use my customer support skill and my translation skill together to write a response to a French-speaking customer."`
    ],
    tip:"Skills compound. The more relevant ones you have active, the more precisely Claude performs." },

  { id:"9.5", tier:9, label:"Share Skills With Your Team",
    what:"Skills are portable — share them via version control or direct file sharing.",
    try:[
      `"Export my brand writing skill so I can share it with my marketing team."`,
      `"How do I import a skill file that a colleague sent me into my Claude setup?"`,
      `"Create a standardised onboarding skill for new team members joining my company — covers our tone, tools, and workflow."`
    ],
    tip:"A shared skill means every person on your team has the same baseline. No more inconsistent outputs." },

  { id:"10.1", tier:10, icon:"⚡", label:"Claude Code",
    what:"A command-line tool that writes, edits, tests, and runs entire codebases autonomously — far beyond single-file generation.",
    try:[
      "\"Set up a complete Node.js REST API with authentication, a database connection, and three endpoints — scaffold everything and explain each file.\"",
      "\"I have a broken React project. Here's the error log. Diagnose the issue, fix the relevant files, and run the tests to confirm it's resolved.\"",
      "\"Build me a CLI tool in Python that watches a folder for new CSV files, processes them, and outputs a summary report automatically.\""
    ],
    tip:"Claude Code works directly in your terminal — it reads your files, runs commands, and makes changes. Think of it as a developer who has access to your entire project." },

  { id:"10.2", tier:10, icon:"🌐", label:"Claude in Chrome",
    what:"A browser extension that gives Claude eyes on whatever you're looking at — it sees the page and helps in real time without copy-pasting.",
    try:[
      "\"I'm on this product page. Write me a comparison table of this product versus the top 3 competitors based on what you can see right now.\"",
      "\"I'm looking at my Google Analytics dashboard. What are the 3 most important things I should act on based on what you see?\"",
      "\"Read this article I have open and give me a 5-bullet briefing I can share in our team Slack in under 60 seconds.\""
    ],
    tip:"Claude in Chrome removes the copy-paste step entirely. Whatever you're looking at becomes the context — Claude sees it directly and can act on it immediately." },

  { id:"10.3", tier:10, icon:"🖥️", label:"Cowork",
    what:"A desktop agent that automates file management and task workflows for non-developers — Claude operates your computer on your behalf.",
    try:[
      "\"Watch my Downloads folder. When a new PDF arrives, rename it with today's date and the sender's name, then move it to the right project folder.\"",
      "\"Go through my Desktop, identify files older than 30 days that haven't been opened, and organise them into an archive folder by month.\"",
      "\"Every Monday morning, open my weekly template, fill in last week's completed tasks from my notes folder, and save it as this week's review.\""
    ],
    tip:"Cowork is built for people who don't write code. You describe the file task in plain English and Claude executes it on your actual machine." },

  { id:"10.4", tier:10, icon:"📊", label:"Claude in Excel",
    what:"Claude works directly inside your spreadsheet — reading data, writing formulas, building charts, and explaining what everything means.",
    try:[
      "\"Look at this sales data spreadsheet. Build me a pivot table showing revenue by region and month, then add a trend line chart automatically.\"",
      "\"This formula in column G is returning errors. Diagnose it, fix it, and add a comment explaining what the corrected formula does.\"",
      "\"Take this raw data dump and clean it — remove duplicates, fix date formats, standardise the currency column, and flag any outliers in red.\""
    ],
    tip:"Claude in Excel is available as a Microsoft 365 add-in. It reads your entire workbook as context — so it understands relationships between sheets automatically." },

  { id:"10.5", tier:10, icon:"📑", label:"Claude in PowerPoint",
    what:"Claude builds, edits, and redesigns presentations directly inside PowerPoint — from a brief to a polished deck without leaving the app.",
    try:[
      "\"I have a rough 3-slide deck. Expand it to 10 slides with a proper narrative arc, on-brand visuals described in the notes, and a strong closing CTA.\"",
      "\"Redesign this presentation to match our brand colours (#1A1A2E, #16213E) and make every slide follow a consistent layout with our logo top-right.\"",
      "\"Turn this meeting transcript into a 6-slide summary presentation I can send to stakeholders who weren't in the room.\""
    ],
    tip:"Claude in PowerPoint is a Microsoft 365 add-in. It reads your existing slides as context — so edits feel intentional, not generic." }
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
const PACK2_PER_STEP = 67;   // credits (15 × 67 = 1005, capped to 1000 when unlocking full pack)
const PACK1_FULL_COST = 500;  // exact cost for all pack 1 steps
const PACK2_FULL_COST = 1000; // exact cost for all pack 2 steps
const CREDIT_PACKS = [
  { id: 'credits_100',  credits: 100,  price: 1,  checkoutId: '26268180-1977-4a8f-ae33-2962d8dc5983' },
  { id: 'credits_500',  credits: 500,  price: 5,  checkoutId: '32e0b88a-1adc-4406-a54a-7c628bb78c90', popular: true },
  { id: 'credits_1000', credits: 1000, price: 10, checkoutId: 'c4f1014a-d365-468a-b1e8-9e9f9c38a8a6' },
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

    // Tier 4: Creative & Writing (standalone, ordered logically)
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
const HOW_TO_ACCESS = {
  // Tier 3 — Projects & Memory
  "3.1": ["Go directly to: claude.ai/projects", "Click 'New Project'", "Give it a name — this becomes your persistent workspace", "All chats inside it share the same context and memory"],
  "3.2": ["Open any Project at claude.ai/projects", "Click the project name → then 'Edit' or the pencil icon", "Add your instructions in the 'Custom instructions' field", "Every new chat inside this project will follow those instructions automatically"],
  "3.3": ["Open any Project at claude.ai/projects", "Click 'Add content' or the + icon inside the project", "Upload a file (PDF, doc, image) or paste text directly", "Claude references it in every conversation within that project"],
  "3.4": ["Go to claude.ai → click your profile icon (bottom left) → Settings", "Or go directly to: claude.ai/settings", "Find 'Custom instructions' or 'Preferences'", "Type your global default instructions — applies to all chats outside of projects"],
  "3.5": ["Open a Project at claude.ai/projects or start a new chat", "Tell Claude facts about yourself naturally — it retains them within the session", "For permanent memory across all chats, save a context file inside a Project", "You can also write a 'personal brief' and upload it to any Project"],

  // Tier 7 — Claude Design
  "7.1": ["Go directly to: claude.ai/design", "Sign in if prompted — Design is available on all paid plans", "Start with a simple request: 'Design a landing page for my business'", "The visual canvas opens automatically on the right"],
  "7.2": ["Go directly to: claude.ai/design", "Type what you want to build — be specific about your industry and style", "Claude generates a live preview you can edit in real time", "Click any element to select it or describe changes in the chat"],
  "7.3": ["Go directly to: claude.ai/design", "Type: 'Create a pitch deck for [your idea] — [number] slides'", "Claude builds slides in the canvas — ask for layout or content changes in chat", "Export when done using the export button in the canvas toolbar"],
  "7.4": ["Go directly to: claude.ai/design", "Type: 'Wireframe a mobile [screen type] for [your app or business]'", "Claude generates wireframe-style mockups with multiple screen states", "Ask for alternative layouts or specific changes directly in the chat"],
  "7.5": ["Go directly to: claude.ai/design", "Type: 'Create a brand design system for [your business]' with your industry and tone", "Claude builds a visual guide — colours, fonts, logo concepts, and component examples", "Save the output as a file and upload it to your Project for future reference"],

  // Tier 8 — Total Integration / MCP
  "8.1": ["Go directly to: claude.ai/settings/integrations or claude.ai/settings/mcp", "Find 'MCP Servers' or 'Integrations' and click 'Add server'", "Paste the MCP server config for your chosen tool (configs at github.com/modelcontextprotocol/servers)", "Restart Claude — the connected tool will now appear in your available integrations"],
  "8.2": ["Enable MCP first (see Step 8.1)", "Get the Google Drive MCP config from: github.com/modelcontextprotocol/servers", "Add it at claude.ai/settings/integrations and authorise your Google account", "Then ask Claude directly: 'Find my last 10 files in Google Drive'"],
  "8.3": ["Get your Notion integration token at: notion.so/my-integrations", "Get the Notion MCP config from: github.com/modelcontextprotocol/servers", "Add it at claude.ai/settings/integrations and paste your token", "Share the Notion databases you want Claude to access with your integration"],
  "8.4": ["Create a Slack app at: api.slack.com/apps", "Get the Slack MCP config from: github.com/modelcontextprotocol/servers", "Add it at claude.ai/settings/integrations with your bot token", "Add the bot to your Slack workspace — Claude can now read and post to channels"],
  "8.5": ["Ensure each tool is connected at claude.ai/settings/integrations (Steps 8.2–8.4)", "In a single Claude conversation describe the full workflow across tools", "Claude will use each connected tool in sequence automatically", "Save the workflow as a Project instruction so it runs the same way every time"],

  // Tier 9 — Claude Skills
  "9.1": ["Go directly to: claude.ai/settings/skills or claude.ai/skills", "Skills extend what Claude can do beyond conversation", "Browse available built-in skills or read the overview at docs.claude.ai", "Enable the skills most relevant to your work"],
  "9.2": ["Go to: claude.ai/settings/skills", "Browse built-in skills — categories include Research, Writing, Analysis, and more", "Toggle a skill on to enable it", "Claude will use it automatically in relevant conversations — no extra prompting needed"],
  "9.3": ["Go to: claude.ai/settings/skills → click 'Create skill' or 'New skill'", "Describe what the skill should do in plain English", "Give it a name and save — test it immediately in a new chat", "Refine the description if the output isn't quite right"],
  "9.4": ["Create individual skills for related tasks at claude.ai/settings/skills", "In a complex task Claude will chain relevant skills automatically", "You can also ask explicitly: 'Use my research skill and my summary skill for this task'", "Skills stack — the output of one feeds directly into the next"],
  "9.5": ["Go to: claude.ai/settings/skills → find your custom skill", "Look for a 'Share' or 'Export' option on the skill", "Share the skill config or link with teammates", "They import it into their own Claude settings at claude.ai/settings/skills"],

  // Tier 10 — Claude Ecosystem
  "10.1": ["Read the full setup guide at: claude.ai/code or docs.claude.ai/claude-code", "Install Node.js from nodejs.org (version 18 or higher required)", "Open your terminal and run: npm install -g @anthropic-ai/claude-code", "Navigate to your project folder and run: claude — you're ready to build"],
  "10.2": ["Go directly to the Chrome Web Store: chromewebstore.google.com", "Search 'Claude for Chrome' — install the official Anthropic extension", "Pin it to your toolbar and click it on any webpage", "Claude opens in a side panel and can see everything on the current page"],
  "10.3": ["Download the Cowork desktop app at: claude.ai/cowork", "Install it and sign in with your Anthropic account", "Grant it access to the folders you want automated", "Describe your file task in plain English — Cowork runs it on your machine"],
  "10.4": ["Requires Microsoft 365 — open Excel and go to Insert → Add-ins → Get Add-ins", "Or go directly to: appsource.microsoft.com and search 'Claude'", "Click Add and sign in with your Anthropic account", "Claude appears as a panel on the right side of your spreadsheet — ready to work with your data"],
  "10.5": ["Requires Microsoft 365 — open PowerPoint and go to Insert → Add-ins → Get Add-ins", "Or go directly to: appsource.microsoft.com and search 'Claude'", "Click Add and sign in with your Anthropic account", "Claude appears as a panel — describe changes and it edits your slides directly"],
};

const RESULT_PLACEHOLDERS = {
  "1.1": "Asked Claude to plan my week like a personal assistant",
  "1.2": "Brief with my job title got me a perfect cover letter",
  "1.3": "Claude as a financial advisor reviewed my investment plan",
  "1.4": "Got my meeting notes as a clean bullet summary",
  "1.5": "Refined a product tagline through 4 iterations",
  "2.1": "Built a freelance rate calculator with tax and savings",
  "2.2": "Created a team trivia quiz about our company history",
  "2.3": "Generated a downloadable client proposal in Word format",
  "2.4": "Searched for competitor pricing and market trends live",
  "2.5": "Created a full SVG icon set for my app in minutes",
  "3.1": "Set up a Project for my e-commerce business with full context",
  "3.2": "Created my first Project for managing my job search",
  "3.3": "Uploaded my brand guide and got on-brand copy instantly",
  "3.4": "Set instructions so Claude always responds in my tone",
  "3.5": "Built a memory profile so Claude knows my work and goals",
  "4.1": "Wrote 3 Facebook ad variations for my product launch",
  "4.2": "Built a 5-email welcome sequence for new subscribers",
  "4.3": "Got a week of Instagram captions for my food brand",
  "4.4": "Wrote a short film script from a single premise",
  "4.5": "Turned raw sales data into a shareable infographic",
  "5.1": "Described a tool in plain English, got working Python code",
  "5.2": "Understood a complex API I had never seen before",
  "5.3": "Fixed a bug in my script in under 2 minutes",
  "5.4": "Found the key insight hidden in 3 months of sales data",
  "5.5": "Mapped my entire client onboarding process as a flowchart",
  "6.1": "Built a habit tracker app that saves data between sessions",
  "6.2": "Created a 4-tab project dashboard with full navigation",
  "6.3": "Built a live crypto tracker pulling real prices from an API",
  "6.4": "Made an AI writing coach that critiques any draft",
  "6.5": "Cloned a Notion-style tool tailored to my workflow",
  "7.1": "Designed a landing page for my SaaS product in Claude Design",
  "7.2": "Built a full app prototype with home, menu, and checkout screens",
  "7.3": "Created a 10-slide investor pitch deck from scratch",
  "7.4": "Wireframed a 3-screen mobile banking app in minutes",
  "7.5": "Set up a full brand design system with my colours and fonts",
  "8.1": "Connected my first MCP server and unlocked Claude\'s real power",
  "8.2": "Claude found and summarised my last 10 Drive files",
  "8.3": "Asked Claude to update my Notion CRM automatically",
  "8.4": "Claude posted a summary to our team Slack channel",
  "8.5": "Chained Drive + Notion + Slack in one single request",
  "9.1": "Understood the difference between Skills and Project instructions",
  "9.2": "Used the built-in Excel skill to build a dynamic dashboard",
  "9.3": "Built a custom LinkedIn writing skill in my exact voice",
  "9.4": "Stacked my writing and translation skills for multilingual content",
  "9.5": "Exported my brand skill and shared it with my whole team",
  "10.1": "Used Claude Code to refactor my entire codebase to TypeScript",
  "10.2": "Claude in Chrome summarised a 40-page report while I browsed",
  "10.3": "Cowork renamed and organised 200 files in my Downloads folder",
  "10.4": "Claude in Excel built a 12-month revenue forecast from my data",
  "10.5": "Claude in PowerPoint redesigned my deck to match our brand",
};

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
      .select('unlocked_ids, done_ids, saved_tips, credits, my_results')
      .eq('user_id', userId)
      .single();
    if (data) {
      if (data.unlocked_ids) setUnlocked(new Set(data.unlocked_ids));
      if (data.done_ids)     setDone(new Set(data.done_ids));
      if (data.saved_tips)   setSavedTips(new Set(data.saved_tips));
      if (data.credits)      setCredits(data.credits);
      if (data.my_results)   setMyResults(data.my_results);
    }
  };

  // Manually refresh user data from Supabase
  const refreshUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadUserData(session.user.id);
  };

  // Dismiss first-time feature highlights
  const dismissFeatures = () => {
    setSeenFeatures(true);
    try { localStorage.setItem('mc_seen_features', '1'); } catch {}
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

  // Check result quality via API
  const checkResultQuality = async (text, stepLabel) => {
    try {
      const res = await fetch('/api/check-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultText: text, stepLabel })
      });
      const data = await res.json();
      if (data.quality === 'poor' && data.suggestion) {
        setResultToast(data.suggestion);
        setTimeout(() => setResultToast(null), 12000); // auto dismiss after 12s
      }
    } catch { /* fail silently */ }
  };

  // Load quiz question for a step
  const loadQuiz = async (step) => {
    setQuizFor(step.id);
    setQuizData(null);
    setQuizAnswer(null);
    setQuizResult(null);
    setQuizLoading(true);
    try {
      const res = await fetch('/api/quiz-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepLabel: step.label, stepWhat: step.what, stepTip: step.tip })
      });
      const data = await res.json();
      if (data.skip) {
        // API failed — mark mastered silently
        setQuizFor(null);
        toggleDone(step.id, { stopPropagation: () => {} });
      } else {
        setQuizData(data);
      }
    } catch {
      // API failed — mark mastered silently
      setQuizFor(null);
      toggleDone(step.id, { stopPropagation: () => {} });
    }
    setQuizLoading(false);
  };

  // Submit quiz answer
  const submitQuiz = (step, selectedIdx) => {
    setQuizAnswer(selectedIdx);
    if (selectedIdx === quizData.correct) {
      setQuizResult('correct');
      setTimeout(() => {
        setQuizFor(null);
        setQuizData(null);
        setQuizAnswer(null);
        setQuizResult(null);
        toggleDone(step.id, { stopPropagation: () => {} });
      }, 1200);
    } else {
      setQuizResult('wrong');
    }
  };

  // Retry quiz with fresh question
  const retryQuiz = (step) => {
    setQuizAnswer(null);
    setQuizResult(null);
    loadQuiz(step);
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
    // Show "try your own idea" nudge
    setShowOwnIdea(stepId);
    setTimeout(() => setShowOwnIdea(null), 6000);
    // Check quality in background
    const step = ALL_STEPS.find(s => s.id === stepId);
    if (step && resultDraft.text.trim()) checkResultQuality(resultDraft.text, step.label);
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

    const resultTitles = myResults.length > 0
      ? myResults.slice(-8).map(r => r.title).join(', ')
      : '';

    // Get starred tip step labels
    const starredSteps = ALL_STEPS
      .filter(s => savedTips.has(s.id))
      .map(s => s.label)
      .join(', ');

    if (!resultTitles && !starredSteps) {
      setBuildIdeas([{ title: 'Nothing personal yet', description: 'Save some results and star some tips first — then your project ideas will be genuinely tailored to what you actually work on.', skills_used: [] }]);
      setBuildLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/build-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultTitles, starredSteps })
      });
      const data = await res.json();
      if (data.error) {
        setBuildIdeas([{ title: 'API Error', description: data.error, skills_used: [] }]);
      } else {
        setBuildIdeas(data.ideas || []);
      }
    } catch (err) {
      setBuildIdeas([{ title: 'Connection Error', description: err.message || 'Could not reach the server. Please try again.', skills_used: [] }]);
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
  const [showBuilder, setShowBuilder]  = useState(false);    // project ideas panel
  const [buildIdeas, setBuildIdeas]    = useState(null);     // AI generated ideas
  const [buildLoading, setBuildLoading]= useState(false);
  const [seenBuilder, setSeenBuilder]  = useState(() => {
    try { return localStorage.getItem('mc_seen_builder') === '1'; } catch { return false; }
  });
  const [seenFeatures, setSeenFeatures] = useState(() => {
    try { return localStorage.getItem('mc_seen_features') === '1'; } catch { return false; }
  });
  const [copiedIdeaId, setCopiedIdea]  = useState(null);
  const [expandedResult, setExpandedResult] = useState(null);
  const [openHowTo, setOpenHowTo]            = useState(null); // stepId with how-to expanded
  const [quizFor, setQuizFor]                = useState(null); // stepId currently being quizzed
  const [quizData, setQuizData]              = useState(null); // {question, options, correct}
  const [quizLoading, setQuizLoading]        = useState(false);
  const [quizAnswer, setQuizAnswer]          = useState(null); // index of selected answer
  const [quizResult, setQuizResult]          = useState(null); // 'correct' | 'wrong'
  const [resultToast, setResultToast]      = useState(null); // {message} fade-in quality hint
  const [showOwnIdea, setShowOwnIdea]      = useState(null); // stepId that just got a result saved
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

  // Value of steps regardless of lock status (for showing credit already applied)
  const valueOf = (ids) => {
    return ids.reduce((sum, id) => {
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
    // Use exact pack costs to avoid rounding issues
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
        .pulse-glow-yellow { animation: pulseYellow 2s ease-in-out infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut { from{opacity:1} to{opacity:0} }
        @media (max-width: 480px) {
          .nav-bar { padding: 0.6rem 0.85rem !important; flex-wrap: wrap; gap: 0.4rem; }
          .nav-logo { font-size: 0.85rem !important; letter-spacing: 2px !important; }
          .nav-right { gap: 0.4rem !important; flex-wrap: wrap; justify-content: flex-end; }
          .nav-pct { display: none !important; }
          .nav-cr-btn { font-size: 0.55rem !important; padding: 0.25rem 0.55rem !important; }
          .nav-feature-btn { font-size: 0.55rem !important; padding: 0.25rem 0.5rem !important; }
          .nav-refresh { display: none !important; }
          .feature-banner { flex-wrap: wrap; gap: 0.35rem !important; }
          .feature-banner-label { font-size: 0.52rem !important; }
        }
        .pulse-glow-purple { animation: pulsePurple 2s ease-in-out infinite; }
        .pulse-glow-green  { animation: pulseGreen  2s ease-in-out infinite; }
        @keyframes pulseYellow { 0%,100%{box-shadow:0 0 0 0 #facc1555;} 50%{box-shadow:0 0 0 6px #facc1522;} }
        @keyframes pulsePurple { 0%,100%{box-shadow:0 0 0 0 #a78bfa55;} 50%{box-shadow:0 0 0 6px #a78bfa22;} }
        @keyframes pulseGreen  { 0%,100%{box-shadow:0 0 0 0 #4ade8055;} 50%{box-shadow:0 0 0 6px #4ade8022;} }
        .done-btn{font-family:'DM Mono',monospace;font-size:0.63rem;border-radius:3px;padding:3px 10px;cursor:pointer;letter-spacing:1px;transition:all 0.15s;border:1px solid;}
        .pgbar{height:2px;border-radius:2px;background:#111;overflow:hidden;}
        .pgfill{height:100%;border-radius:2px;transition:width 0.4s ease;}
        .pill{font-size:0.52rem;padding:1px 6px;border-radius:20px;letter-spacing:1.5px;text-transform:uppercase;}
        .overlay{position:fixed;inset:0;background:#000000bb;backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;}
        .modal{background:#0c0c0c;border:1px solid #1e1e1e;border-radius:14px;padding:2rem 1.5rem;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="nav-bar" style={{ borderBottom:"1px solid #0d0d0d", padding:"0.85rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"#060606", zIndex:100 }}>
        <span className="nav-logo" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"3px", background:"linear-gradient(90deg,#4ade80,#facc15,#f97316,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          MASTER CLAUDE
        </span>
        <div className="nav-right" style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          {pct > 0 && <span className="nav-pct" style={{ fontSize:"0.57rem", color:"#333", letterSpacing:"1px" }}>{pct}% mastered</span>}
          <button className="nav-cr-btn" onClick={() => setShowTopUp(true)} style={{ background:"none", border:"1px solid #1e1e1e", color: credits > 0 ? "#facc15" : "#555", fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", letterSpacing:"1px", padding:"0.3rem 0.85rem", borderRadius:20, cursor:"pointer" }}>
            Cr.{credits}
          </button>
          {user && <button className="nav-refresh" onClick={refreshUserData} title="Refresh credits" style={{ background:"none", border:"none", color:"#333", fontSize:"0.8rem", cursor:"pointer", padding:"0.2rem", lineHeight:1 }}>↻</button>}
          <div style={{ position:"relative" }}>
            <button onClick={() => { setShowResults(p => !p); dismissFeatures(); }} title="My Results"
              className={`nav-feature-btn${!seenFeatures ? " pulse-glow-purple" : ""}`}
              style={{ background: showResults ? "#1e1e1e" : "none", border:"1px solid #1e1e1e", color: myResults.length > 0 ? "#a78bfa" : "#555", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1px", padding:"0.3rem 0.7rem", borderRadius:20, cursor:"pointer", position:"relative" }}>
              ◈{myResults.length > 0 && <span style={{ position:"absolute", top:-4, right:-4, background:"#a78bfa", color:"#000", fontSize:"0.45rem", fontWeight:"bold", width:13, height:13, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{myResults.length}</span>}
            </button>
          </div>
          <div style={{ position:"relative" }}>
            <button onClick={() => { setShowBuilder(p => !p); dismissFeatures(); if (!buildIdeas && !buildLoading) generateBuildIdeas(); }}
              title="What can I build?"
              className={`nav-feature-btn${!seenFeatures ? " pulse-glow-yellow" : ""}`}
              style={{ background: showBuilder ? "#1e1e1e" : "none", border:"1px solid #1e1e1e", color:"#555", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"1px", padding:"0.3rem 0.7rem", borderRadius:20, cursor:"pointer" }}>
              ⚡
            </button>
          </div>
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
          <div style={{ position:"relative" }}>
            <button onClick={() => { setSavedPanel(p => !p); dismissFeatures(); }}
              className={`nav-feature-btn${!seenFeatures ? " pulse-glow-green" : ""}`}
              style={{ background: savedPanel ? "#1e1e1e" : "transparent", border:"1px solid #1e1e1e", color: savedTips.size > 0 ? "#facc15" : "#555", fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", padding:"0.32rem 0.7rem", borderRadius:20, cursor:"pointer", position:"relative", transition:"all 0.2s" }}
              title="Saved tips">
              ★
              {savedTips.size > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, background:"#facc15", color:"#000", fontSize:"0.45rem", fontWeight:"bold", width:13, height:13, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                  {savedTips.size}
                </span>
              )}
            </button>
          </div>
          <button className="cta" onClick={openQuiz}
            style={{ background:"transparent", border:"1px solid #1e1e1e", color:"#666", fontSize:"0.62rem", padding:"0.35rem 0.9rem" }}>
            Personalise
          </button>
        </div>
      </nav>

      {/* ── QUALITY HINT TOAST ─────────────────────────────────────── */}
      {resultToast && (
        <div style={{ position:"fixed", bottom:"1.5rem", left:"50%", transform:"translateX(-50%)", zIndex:500, maxWidth:"min(380px, 90vw)", width:"100%", animation:"fadeIn 0.4s ease" }}>
          <div style={{ background:"#0f0f0f", border:"1px solid #facc1544", borderRadius:12, padding:"0.85rem 1rem", display:"flex", gap:"0.75rem", alignItems:"flex-start", boxShadow:"0 8px 32px #000000aa" }}>
            <span style={{ fontSize:"0.9rem", flexShrink:0 }}>💡</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.62rem", color:"#facc15", letterSpacing:"1px", marginBottom:"0.25rem" }}>COULD BE BETTER</div>
              <div style={{ fontSize:"0.7rem", color:"#aaa", lineHeight:1.6 }}>{resultToast}</div>
            </div>
            <button onClick={() => setResultToast(null)}
              style={{ background:"none", border:"none", color:"#444", fontSize:"0.9rem", cursor:"pointer", flexShrink:0, lineHeight:1 }}>×</button>
          </div>
        </div>
      )}

      {/* ── FEATURE DISCOVERY BANNER ──────────────────────────────── */}
      {!seenFeatures && (
        <div className="feature-banner" style={{ background:"#0a0a0a", borderBottom:"1px solid #1a1a1a", padding:"0.5rem 1rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem" }}>
          <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", alignItems:"center" }}>
            <span className="feature-banner-label" style={{ fontSize:"0.6rem", color:"#4ade80", letterSpacing:"1px", whiteSpace:"nowrap" }}>★ save tips</span>
            <span style={{ fontSize:"0.6rem", color:"#a78bfa", letterSpacing:"1px", whiteSpace:"nowrap" }}>◈ my results</span>
            <span style={{ fontSize:"0.6rem", color:"#facc15", letterSpacing:"1px", whiteSpace:"nowrap" }}>⚡ project ideas</span>
          </div>
          <button onClick={dismissFeatures}
            style={{ background:"none", border:"1px solid #222", color:"#444", fontFamily:"'DM Mono',monospace", fontSize:"0.55rem", letterSpacing:"1px", padding:"0.2rem 0.6rem", borderRadius:20, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
            got it ×
          </button>
        </div>
      )}

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

                            {/* How to get there */}
                            {HOW_TO_ACCESS[step.id] && (
                              <div style={{ marginTop:"0.5rem" }}>
                                <button onClick={e => { e.stopPropagation(); setOpenHowTo(openHowTo === step.id ? null : step.id); }}
                                  style={{ background:"none", border:"none", color:`${tm.color}88`, fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"1.5px", cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:"0.3rem" }}>
                                  <span>{openHowTo === step.id ? "▾" : "▸"}</span>
                                  HOW TO GET THERE
                                </button>
                                {openHowTo === step.id && (
                                  <div style={{ marginTop:"0.4rem", background:`${tm.color}08`, border:`1px solid ${tm.color}22`, borderRadius:8, padding:"0.65rem 0.75rem", animation:"fadeIn 0.2s ease" }}>
                                    {HOW_TO_ACCESS[step.id].map((instruction, idx) => {
                                      // Make URLs clickable
                                      const urlMatch = instruction.match(/(https?:\/\/\S+|[\w.-]+\.[\w]{2,}\/[\w./\-?=&]+)/);
                                      return (
                                        <div key={idx} style={{ display:"flex", gap:"0.5rem", marginBottom: idx < HOW_TO_ACCESS[step.id].length - 1 ? "0.4rem" : 0 }}>
                                          <span style={{ fontSize:"0.58rem", color:tm.color, fontFamily:"'DM Mono',monospace", fontWeight:600, flexShrink:0 }}>{idx + 1}.</span>
                                          <span style={{ fontSize:"0.65rem", color:"#888", lineHeight:1.55 }}>
                                            {urlMatch ? (
                                              <>
                                                {instruction.split(urlMatch[0])[0]}
                                                <a href={urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`}
                                                  target="_blank" rel="noopener noreferrer"
                                                  onClick={e => e.stopPropagation()}
                                                  style={{ color:tm.color, textDecoration:"underline", textDecorationStyle:"dotted" }}>
                                                  {urlMatch[0]}
                                                </a>
                                                {instruction.split(urlMatch[0])[1]}
                                              </>
                                            ) : instruction}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
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
                            {/* Add result button + own idea nudge */}
                            {addResultFor !== step.id && (
                              <>
                                <button onClick={e => { e.stopPropagation(); setAddResultFor(step.id); setResultDraft({title:'',text:''}); }}
                                  style={{ background:"none", border:`1px dashed ${tm.color}44`, color:`${tm.color}99`, fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", letterSpacing:"1.5px", padding:"0.3rem 0.75rem", borderRadius:20, cursor:"pointer", marginTop:"0.5rem", width:"100%", textAlign:"center" }}>
                                  + Add My Result
                                </button>

                              </>
                            )}
                            {addResultFor === step.id && (
                              <div style={{ marginTop:"0.5rem", background:"#090909", border:`1px solid ${tm.color}22`, borderRadius:8, padding:"0.75rem" }} onClick={e => e.stopPropagation()}>
                                <div style={{ fontSize:"0.62rem", color:`${tm.color}99`, lineHeight:1.6, marginBottom:"0.4rem", fontStyle:"italic" }}>
                                  ✦ Use something real to you — your project ideas will be much more personal.
                                </div>
                                <input placeholder={`Title (e.g. ${RESULT_PLACEHOLDERS[step.id] || "what did you make?"})`} value={resultDraft.title}
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
                            {/* Mark mastered — quiz gated */}
                            <div style={{ marginTop:"0.65rem" }}>
                              {quizFor === step.id ? (
                                <div style={{ background:"#090909", border:`1px solid ${tm.color}33`, borderRadius:10, padding:"0.85rem" }} onClick={e => e.stopPropagation()}>
                                  {quizLoading ? (
                                    <div style={{ fontSize:"0.68rem", color:"#555", textAlign:"center", padding:"0.5rem", letterSpacing:"1px" }}>Generating question...</div>
                                  ) : quizData ? (
                                    <>
                                      <div style={{ fontSize:"0.7rem", color:"#ccc", lineHeight:1.6, marginBottom:"0.75rem", fontWeight:500 }}>{quizData.question}</div>
                                      <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem", marginBottom:"0.65rem" }}>
                                        {quizData.options.map((opt, i) => {
                                          let bg = "#0d0d0d";
                                          let border = "#1e1e1e";
                                          let color = "#888";
                                          if (quizAnswer !== null) {
                                            if (i === quizData.correct) { bg = `${tm.color}22`; border = tm.color; color = tm.color; }
                                            else if (i === quizAnswer && quizAnswer !== quizData.correct) { bg = "#ff444422"; border = "#ff4444"; color = "#ff4444"; }
                                          }
                                          return (
                                            <button key={i} onClick={() => quizAnswer === null && submitQuiz(step, i)}
                                              style={{ background:bg, border:`1px solid ${border}`, color, fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", padding:"0.5rem 0.75rem", borderRadius:7, cursor: quizAnswer === null ? "pointer" : "default", textAlign:"left", transition:"all 0.2s", lineHeight:1.5 }}>
                                              {opt}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      {quizResult === 'correct' && (
                                        <div style={{ fontSize:"0.68rem", color:tm.color, textAlign:"center", letterSpacing:"1px" }}>✓ Correct — marking as mastered</div>
                                      )}
                                      {quizResult === 'wrong' && (
                                        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                                          <div style={{ fontSize:"0.68rem", color:"#ff4444", textAlign:"center" }}>Not quite — re-study the step and try again</div>
                                          <button onClick={() => retryQuiz(step)}
                                            style={{ background:"none", border:`1px solid ${tm.color}44`, color:tm.color, fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", padding:"0.4rem", borderRadius:6, cursor:"pointer", letterSpacing:"1px" }}>
                                            Try again →
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : null}
                                </div>
                              ) : (
                                <button className="done-btn"
                                  onClick={e => { e.stopPropagation(); if (!isDone) loadQuiz(step); else toggleDone(step.id, e); }}
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
                    const credit       = Math.round(valueOf(alreadyOwned.filter(id => TIER_META[parseInt(id.split(".")[0])].base > 0)));
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
        const pack1RemIds = allRemIds.filter(id => PACK1_TIERS.includes(parseInt(id.split(".")[0])));
    const pack2RemIds = allRemIds.filter(id => PACK2_TIERS.includes(parseInt(id.split(".")[0])));
    const pack1RemCost = pack1RemIds.length > 0 ? Math.min(PACK1_FULL_COST, Math.round(costOf(pack1RemIds))) : 0;
    const pack2RemCost = pack2RemIds.length > 0 ? Math.min(PACK2_FULL_COST, Math.round(costOf(pack2RemIds))) : 0;
    const allRemAmt = pack1RemCost + pack2RemCost;
        // Only count paid steps (tiers 3+) in already applied calculation
    // Calculate already paid — only count paid steps, cap packs at their defined costs
    const ownedPack1 = ALL_STEPS.filter(s => isStepUnlocked(s) && PACK1_TIERS.includes(s.tier));
    const ownedPack2 = ALL_STEPS.filter(s => isStepUnlocked(s) && PACK2_TIERS.includes(s.tier));
    const pack1Paid  = ownedPack1.length === 25 ? PACK1_FULL_COST : Math.round(costOf(ownedPack1.map(s=>s.id)));
    const pack2Paid  = ownedPack2.length === 15 ? PACK2_FULL_COST : Math.round(costOf(ownedPack2.map(s=>s.id)));
    const alreadyPaidAmt = pack1Paid + pack2Paid;

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
                    const redirect = encodeURIComponent('https://master-claude.com?checkout=success');
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
                    style={{ background: pack.popular ? "linear-gradient(135deg,#facc15,#f97316)" : "#111", border:`1px solid ${pack.popular ? "#facc1544" : "#2a2a2a"}`, color: pack.popular ? "#000" : "#888", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", fontWeight:500, padding:"0.55rem 0", width:"100%", borderRadius:20, letterSpacing:"1px", pointerEvents:"none" }}>
                    ${pack.price}
                  </div>
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
                      The more results you save, the smarter your <strong style={{ color:"#ccc" }}>Project Ideas</strong> ideas become. Claude uses your saved result titles to understand what you actually use it for — and tailors project ideas specifically to your work.
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
                    <div key={result.id}
                      style={{ background:"#0d0d0d", border:`1px solid ${expandedResult === result.id ? (tier?.color+"44" || "#333") : "#1a1a1a"}`, borderRadius:8, padding:"0.85rem", marginBottom:"0.6rem", position:"relative", cursor:"pointer", transition:"border-color 0.2s" }}
                      onClick={() => setExpandedResult(expandedResult === result.id ? null : result.id)}>
                      <div style={{ fontSize:"0.58rem", color: tier?.color || "#555", letterSpacing:"1.5px", marginBottom:"0.2rem" }}>
                        {step?.id} · {step?.label}
                      </div>
                      <div style={{ fontSize:"0.8rem", color:"#ccc", fontWeight:500, marginBottom:"0.4rem" }}>{result.title}</div>
                      <div style={{ fontSize:"0.68rem", color:"#666", lineHeight:1.6, maxHeight: expandedResult === result.id ? "none" : 60, overflow:"hidden", WebkitMaskImage: expandedResult === result.id ? "none" : "linear-gradient(to bottom, black 50%, transparent)" }}>
                        {result.text}
                      </div>
                      {expandedResult !== result.id && (
                        <div style={{ fontSize:"0.55rem", color:"#333", marginTop:"0.3rem", letterSpacing:"1px" }}>tap to expand</div>
                      )}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.5rem" }}>
                        <span style={{ fontSize:"0.55rem", color:"#383838" }}>{result.date}</span>
                        <button onClick={e => { e.stopPropagation(); deleteResult(result.id); }} style={{ background:"none", border:"none", color:"#333", fontSize:"0.7rem", cursor:"pointer" }}>✕</button>
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
                <div style={{ fontSize:"0.55rem", color:"#555", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"0.2rem" }}>Based on your results & starred tips</div>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", letterSpacing:"2px", color:"#e0e0e0" }}>Project Ideas</h2>
              </div>
              <button onClick={() => setShowBuilder(false)} style={{ background:"none", border:"none", color:"#444", fontSize:"1rem", cursor:"pointer" }}>×</button>
            </div>

            {/* One-time intro */}
            {!seenBuilder && (
              <div style={{ background:"#0d0d0d", border:"1px solid #facc1522", borderRadius:10, padding:"1rem", marginBottom:"1.25rem" }}>
                <div style={{ fontSize:"0.75rem", color:"#facc15", fontWeight:500, marginBottom:"0.5rem" }}>⚡ How this works</div>
                <div style={{ fontSize:"0.7rem", color:"#888", lineHeight:1.7, marginBottom:"0.85rem" }}>
                                This reads your saved results and starred tips to generate 3 project ideas tailored to what you actually work on — not generic Claude use cases.<br/><br/>
                                <strong style={{ color:"#ccc" }}>What to do with an idea:</strong> copy it, open Claude in a new tab, and paste it in.
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
