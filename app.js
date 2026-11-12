(function(){
  "use strict";

  /* ================= DATA ================= */
  // cat: strength | strength-lite | mobility | easy | tempo | speed | gp | long | peak | steady | taper | shake | cycle | rest | race
  var DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  function d(day,cat,opts){ opts=opts||{}; return Object.assign({d:day,cat:cat}, opts); }

  function defaultPlan(){
    return [
      {total:20, days:[ d("Mon","strength"), d("Tue","easy",{dist:5}), d("Wed","rest"), d("Thu","tempo",{dist:5}), d("Fri","cycle",{mins:45}), d("Sat","long",{dist:10}), d("Sun","rest") ]},
      {total:23, days:[ d("Mon","strength"), d("Tue","easy",{dist:6}), d("Wed","rest"), d("Thu","speed",{dist:6}), d("Fri","cycle",{mins:45}), d("Sat","long",{dist:11}), d("Sun","rest") ]},
      {total:25, days:[ d("Mon","strength"), d("Tue","easy",{dist:6}), d("Wed","rest"), d("Thu","tempo",{dist:7}), d("Fri","cycle",{mins:50}), d("Sat","long",{dist:12}), d("Sun","rest") ]},
      {total:20, recovery:true, days:[ d("Mon","strength-lite"), d("Tue","easy",{dist:5}), d("Wed","rest"), d("Thu","easy",{dist:5}), d("Fri","cycle",{mins:40}), d("Sat","long",{dist:10}), d("Sun","rest") ]},
      {total:27, days:[ d("Mon","strength"), d("Tue","easy",{dist:7}), d("Wed","rest"), d("Thu","speed",{dist:7}), d("Fri","cycle",{mins:50}), d("Sat","long",{dist:13}), d("Sun","rest") ]},
      {total:29, days:[ d("Mon","strength"), d("Tue","easy",{dist:7}), d("Wed","rest"), d("Thu","tempo",{dist:8}), d("Fri","cycle",{mins:50}), d("Sat","long",{dist:14}), d("Sun","rest") ]},
      {total:31, days:[ d("Mon","strength"), d("Tue","easy",{dist:8}), d("Wed","rest"), d("Thu","speed",{dist:8}), d("Fri","cycle",{mins:60}), d("Sat","long",{dist:15}), d("Sun","rest") ]},
      {total:23, recovery:true, days:[ d("Mon","strength-lite"), d("Tue","easy",{dist:6}), d("Wed","rest"), d("Thu","easy",{dist:6}), d("Fri","cycle",{mins:45}), d("Sat","long",{dist:11}), d("Sun","rest") ]},
      {total:33, days:[ d("Mon","strength"), d("Tue","easy",{dist:8}), d("Wed","rest"), d("Thu","tempo",{dist:9}), d("Fri","cycle",{mins:60}), d("Sat","long",{dist:16}), d("Sun","rest") ]},
      {total:35, days:[ d("Mon","strength"), d("Tue","easy",{dist:8}), d("Wed","rest"), d("Thu","speed",{dist:9}), d("Fri","cycle",{mins:60}), d("Sat","long",{dist:18}), d("Sun","rest") ]},
      {total:39, days:[ d("Mon","strength"), d("Tue","easy",{dist:9}), d("Wed","rest"), d("Thu","tempo",{dist:10}), d("Fri","cycle",{mins:60}), d("Sat","peak",{dist:20}), d("Sun","rest") ]},
      {total:24, recovery:true, days:[ d("Mon","strength-lite"), d("Tue","easy",{dist:6}), d("Wed","rest"), d("Thu","easy",{dist:6}), d("Fri","cycle",{mins:45}), d("Sat","long",{dist:12}), d("Sun","rest") ]},
      {total:34, days:[ d("Mon","strength"), d("Tue","easy",{dist:8}), d("Wed","rest"), d("Thu","gp",{dist:10}), d("Fri","cycle",{mins:50}), d("Sat","steady",{dist:16}), d("Sun","rest") ]},
      {total:27, taper:true, days:[ d("Mon","strength-lite"), d("Tue","easy",{dist:7}), d("Wed","rest"), d("Thu","tempo",{dist:8}), d("Fri","cycle",{mins:45}), d("Sat","taper",{dist:12}), d("Sun","rest") ]},
      {total:20, taper:true, days:[ d("Mon","mobility"), d("Tue","easy",{dist:6}), d("Wed","rest"), d("Thu","gp",{dist:6}), d("Fri","cycle",{mins:30}), d("Sat","taper",{dist:8}), d("Sun","rest") ]},
      {total:29.1, raceweek:true, days:[ d("Mon","rest"), d("Tue","easy",{dist:5}), d("Wed","rest"), d("Thu","shake",{dist:3}), d("Fri","rest"), d("Sat","rest"), d("Sun","race",{dist:21.1}) ]}
    ];
  }
  var PLAN = defaultPlan();

  var CAT_META = {
    "strength":   {label:"Strength",     color:"var(--violet)", dim:"var(--violet-dim)"},
    "strength-lite":{label:"Strength · light", color:"var(--violet)", dim:"var(--violet-dim)"},
    "mobility":   {label:"Mobility",     color:"var(--moss)",   dim:"var(--moss-dim)"},
    "easy":       {label:"Easy run",     color:"var(--sage)",   dim:"var(--sage-dim)"},
    "tempo":      {label:"Tempo",        color:"var(--amber)",  dim:"var(--amber-dim)"},
    "speed":      {label:"Speed",        color:"var(--amber)",  dim:"var(--amber-dim)"},
    "gp":         {label:"Goal pace",    color:"var(--amber)",  dim:"var(--amber-dim)"},
    "long":       {label:"Long run",     color:"var(--accent)", dim:"var(--accent-dim)"},
    "peak":       {label:"Peak long run",color:"var(--accent)", dim:"var(--accent-dim)"},
    "steady":     {label:"Steady",       color:"var(--accent)", dim:"var(--accent-dim)"},
    "taper":      {label:"Taper run",    color:"var(--accent)", dim:"var(--accent-dim)"},
    "shake":      {label:"Shakeout",     color:"var(--accent)", dim:"var(--accent-dim)"},
    "cycle":      {label:"Cycle",        color:"var(--slate)",  dim:"var(--slate-dim)"},
    "rest":       {label:"Rest",         color:"var(--moss)",   dim:"var(--moss-dim)"},
    "race":       {label:"Race day",     color:"var(--race)",   dim:"var(--race-dim)"}
  };

  /* ================= PACE GOALS ================= */
  // Each running category maps to a pace zone expressed as seconds/km added to
  // (or, for "exact" zones, equal to) your goal race pace.
  var PACE_ZONES = {
    "easy":   {lowAdd:55,  highAdd:85},
    "long":   {lowAdd:90,  highAdd:130},
    "peak":   {lowAdd:90,  highAdd:130},
    "taper":  {lowAdd:80,  highAdd:115},
    "steady": {lowAdd:15,  highAdd:25},
    "tempo":  {lowAdd:5,   highAdd:18},
    "speed":  {lowAdd:-32, highAdd:-15},
    "shake":  {lowAdd:100, highAdd:140},
    "gp":     {exact:true},
    "race":   {exact:true}
  };

  function goalPaceSecPerKm(){ return (state.goalTimeSec || 7200) / RACE_DIST; }

  function fmtPace(sec){
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec/60), s = sec%60;
    return m + ":" + (s<10 ? "0"+s : s);
  }

  function fmtHMS(totalSec){
    totalSec = Math.max(0, Math.round(totalSec));
    var h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60), s = totalSec%60;
    return h + ":" + (m<10?"0"+m:m) + ":" + (s<10?"0"+s:s);
  }
  function parseTimeToSec(str){
    if(!str) return null;
    var parts = str.trim().split(":").map(function(p){ return parseFloat(p); });
    if(parts.some(isNaN)) return null;
    var sec = 0;
    if(parts.length === 3) sec = parts[0]*3600 + parts[1]*60 + parts[2];
    else if(parts.length === 2) sec = parts[0]*60 + parts[1];
    else if(parts.length === 1) sec = parts[0]*60; // bare number = minutes
    return sec > 0 ? sec : null;
  }

  function paceRangeFor(cat){
    var zone = PACE_ZONES[cat];
    if(!zone) return null;
    var g = goalPaceSecPerKm();
    if(zone.exact) return {low:g, high:g, text: fmtPace(g)+"/km"};
    var profile = DIST_PROFILE[state.raceDistKey] || DIST_PROFILE.half;
    var scale = profile.paceScale || 1;
    var lo = g + zone.lowAdd*scale, hi = g + zone.highAdd*scale;
    return {low:lo, high:hi, text: fmtPace(lo)+"–"+fmtPace(hi)+"/km"};
  }

  function estTimeFor(dist, low, high){
    if(!dist) return "";
    var mid = (low+high)/2;
    var totalSec = mid*dist;
    var h = Math.floor(totalSec/3600), m = Math.round((totalSec%3600)/60);
    if(m===60){ h+=1; m=0; }
    return h>0 ? (h+"h "+m+"m") : (m+" min");
  }

  var ADVICE = {
    "strength": "20–30 minutes. Work through your five exercises with controlled reps and stop a couple of reps short of failure — you've got quality runs later in the week. This is what keeps your form from falling apart late in long runs. Change the exercises any time in Settings.",
    "strength-lite": "Recovery week — same exercises, one set fewer (shown below), at lighter loads. The goal is to maintain movement quality, not add fatigue.",
    "mobility": "Dynamic stretching, hip openers, ankle circles, foam roller on calves/quads/IT band. 15–20 minutes. This week it replaces strength work entirely — legs need to feel fresh, not worked.",
    "easy": "Conversational pace — you should be able to talk in full sentences. If you're checking your watch to slow down, you're not slowing down enough. This run is about time on feet and aerobic base, not effort.",
    "tempo": "Comfortably hard — roughly the effort you could hold for about an hour if you had to. Warm up 10 minutes easy first. The point is to teach your body to clear lactate at a faster sustained pace.",
    "speed": "Broken into intervals — e.g. 400–800m repeats at a hard-but-controlled effort with equal-time jog recovery. Warm up properly (10 min easy + strides). Focus on form and cadence over raw speed; ragged form here builds bad habits.",
    "gp": "Goal-pace practice. Run a chunk of this session at your goal pace (below) so it stops feeling like \"race pace\" and starts feeling like \"normal.\"",
    "long": "Slow it down — 60–90 seconds/km slower than easy pace is fine, especially in the first half. Practice your race-day fuelling: something small every 40–45 minutes once you're past 60 minutes of running.",
    "peak": "Your longest run of the whole plan — a dress rehearsal for race day. Wear race shoes, test your exact fuelling plan, start slow and let the back half feel a little faster. Whatever you learn here, apply on race day.",
    "steady": "Continuous effort, just outside goal race pace — a notch harder than a long run but not as sharp as a tempo. It's about rhythm and confidence with three weeks to go.",
    "taper": "Shorter than it's been in weeks — that's intentional, not a step backwards. Keep some race-pace strides in there so your legs stay sharp, but resist the urge to add extra distance.",
    "shake": "Very short and easy, just to keep blood moving through the legs. Nothing new, nothing hard — this run should barely feel like exercise.",
    "cycle": "Low-impact aerobic cross-training. Keep it in an easy-to-moderate zone (you can still hold a conversation), cadence around 85–95rpm. It builds aerobic fitness while giving your running muscles a break from impact.",
    "rest": "Full rest. This is where the adaptation from your training actually happens — prioritise sleep and hydration over any temptation to \"just do something light.\"",
    "race": "Race day. Warm up 10–15 minutes easy plus a few strides. Start 5–10 seconds/km slower than goal pace for the first couple of km — most sub-2 attempts are lost by going out too hot, not by holding back early."
  };

  var WEEK_NOTES = {};
  function buildWeekNotes(){
    WEEK_NOTES = {};
    PLAN.forEach(function(w,i){
      if(w.recovery) WEEK_NOTES[i] = "Recovery week — lower volume on purpose, so your body absorbs the last few weeks of work before loading rises again.";
      if(w.taper) WEEK_NOTES[i] = "Taper — volume drops, intensity stays. Trust it; this is what lets you show up fresh.";
      if(w.raceweek) WEEK_NOTES[i] = "Race week. Short, easy sessions only until Sunday — the work is already done.";
    });
  }
  buildWeekNotes();

  var STORAGE_KEY = "sub2h-tracker-v1";
  var HERO_CATS = {long:1, peak:1, steady:1, taper:1, gp:1, tempo:1, speed:1, easy:1, shake:1};
  var FUEL_THRESHOLD = 15; // km — sessions at/above this get a fuelling/gear checklist
  var FUEL_ITEMS = ["Pack gels / nutrition for the distance","Test race-day shoes & socks","Plan hydration (bottle, belt, or route past water)","Lay out kit the night before"];
  /* ---------- Strength exercise library ----------
     type: "bodyweight" (no weights needed) or "weights". full / lite = sets x reps on a normal vs light (recovery/taper) week.
     You choose up to MAX_PICKS of these in Settings; those become the routine on every strength day. */
  var MAX_PICKS = 5;
  var EXERCISES = [
    // ---- bodyweight ----
    {id:"bw-squat",       type:"bodyweight", name:"Bodyweight squat",           focus:"Quads · glutes",         gear:"No equipment", full:"3 × 15",            lite:"2 × 15"},
    {id:"walking-lunge",  type:"bodyweight", name:"Walking lunges",             focus:"Quads · glutes",         gear:"No equipment", full:"3 × 10 each leg",   lite:"2 × 10 each leg"},
    {id:"reverse-lunge",  type:"bodyweight", name:"Reverse lunges",             focus:"Glutes · quads",         gear:"No equipment", full:"3 × 10 each leg",   lite:"2 × 8 each leg"},
    {id:"step-up",        type:"bodyweight", name:"Step-ups",                   focus:"Glutes · quads",         gear:"A bench or step", full:"3 × 10 each leg", lite:"2 × 8 each leg"},
    {id:"split-squat-bw", type:"bodyweight", name:"Bulgarian split squat",      focus:"Quads · glutes",         gear:"A bench or step", full:"3 × 8 each leg",  lite:"2 × 6 each leg"},
    {id:"glute-bridge",   type:"bodyweight", name:"Glute bridge",               focus:"Glutes · hamstrings",    gear:"No equipment", full:"3 × 15",            lite:"2 × 15"},
    {id:"sl-glute-bridge",type:"bodyweight", name:"Single-leg glute bridge",    focus:"Glutes · hamstrings",    gear:"No equipment", full:"3 × 12 each leg",   lite:"2 × 10 each leg"},
    {id:"sl-deadlift-bw", type:"bodyweight", name:"Single-leg deadlift",        focus:"Hamstrings · balance",   gear:"No equipment", full:"3 × 8 each leg",    lite:"2 × 8 each leg"},
    {id:"calf-raise-sl",  type:"bodyweight", name:"Single-leg calf raise",      focus:"Calves · Achilles",      gear:"A step (optional)", full:"3 × 15 each leg", lite:"2 × 12 each leg"},
    {id:"plank",          type:"bodyweight", name:"Plank",                      focus:"Core",                   gear:"No equipment", full:"3 × 40 s",          lite:"2 × 30 s"},
    {id:"side-plank",     type:"bodyweight", name:"Side plank",                 focus:"Core · hips",            gear:"No equipment", full:"3 × 30 s each side",lite:"2 × 20 s each side"},
    {id:"dead-bug",       type:"bodyweight", name:"Dead bug",                   focus:"Core",                   gear:"No equipment", full:"3 × 10 each side",  lite:"2 × 8 each side"},
    {id:"bird-dog",       type:"bodyweight", name:"Bird dog",                   focus:"Core · glutes",          gear:"No equipment", full:"3 × 10 each side",  lite:"2 × 8 each side"},
    {id:"side-leg-raise", type:"bodyweight", name:"Side-lying leg raise",       focus:"Hip stabilisers",        gear:"No equipment", full:"2 × 15 each side",  lite:"2 × 12 each side"},
    {id:"push-up",        type:"bodyweight", name:"Push-ups",                   focus:"Chest · shoulders · core",gear:"No equipment", full:"3 × 10",           lite:"2 × 8"},
    // ---- weights ----
    {id:"goblet-squat",   type:"weights",    name:"Goblet squat",               focus:"Quads · glutes",         gear:"Dumbbell or kettlebell", full:"3 × 10",          lite:"2 × 10"},
    {id:"rdl",            type:"weights",    name:"Romanian deadlift",          focus:"Hamstrings · glutes",    gear:"Dumbbells or barbell",   full:"3 × 10",          lite:"2 × 10"},
    {id:"sl-rdl-wt",      type:"weights",    name:"Single-leg Romanian deadlift",focus:"Hamstrings · balance",  gear:"Dumbbell or kettlebell", full:"3 × 8 each leg",  lite:"2 × 8 each leg"},
    {id:"db-lunge",       type:"weights",    name:"Dumbbell walking lunges",    focus:"Quads · glutes",         gear:"Dumbbells",              full:"3 × 10 each leg", lite:"2 × 8 each leg"},
    {id:"db-step-up",     type:"weights",    name:"Dumbbell step-ups",          focus:"Glutes · quads",         gear:"Dumbbells + bench",      full:"3 × 10 each leg", lite:"2 × 8 each leg"},
    {id:"split-squat-wt", type:"weights",    name:"Dumbbell Bulgarian split squat",focus:"Quads · glutes",      gear:"Dumbbells + bench",      full:"3 × 8 each leg",  lite:"2 × 6 each leg"},
    {id:"hip-thrust",     type:"weights",    name:"Barbell hip thrust",         focus:"Glutes",                 gear:"Barbell + bench",        full:"3 × 10",          lite:"2 × 10"},
    {id:"calf-raise-wt",  type:"weights",    name:"Weighted calf raise",        focus:"Calves · Achilles",      gear:"Dumbbell + step",        full:"3 × 15",          lite:"2 × 12"},
    {id:"kb-swing",       type:"weights",    name:"Kettlebell swing",           focus:"Posterior chain · power",gear:"Kettlebell",             full:"3 × 15",          lite:"2 × 12"},
    {id:"back-squat",     type:"weights",    name:"Barbell back squat",         focus:"Quads · glutes · core",  gear:"Barbell + rack",         full:"3 × 8",           lite:"2 × 8"},
    {id:"deadlift",       type:"weights",    name:"Deadlift",                   focus:"Posterior chain",        gear:"Barbell",                full:"3 × 6",           lite:"2 × 5"},
    {id:"db-row",         type:"weights",    name:"Dumbbell row",               focus:"Upper back · posture",   gear:"Dumbbell + bench",       full:"3 × 10 each arm", lite:"2 × 8 each arm"},
    {id:"farmer-carry",   type:"weights",    name:"Farmer's carry",             focus:"Core · grip · posture",  gear:"Heavy dumbbells",        full:"3 × 30 m",        lite:"2 × 20 m"},
    {id:"db-press",       type:"weights",    name:"Dumbbell shoulder press",    focus:"Shoulders · core",       gear:"Dumbbells",              full:"3 × 10",          lite:"2 × 8"}
  ];
  var EXERCISE_BY_ID = {};
  EXERCISES.forEach(function(e){ EXERCISE_BY_ID[e.id] = e; });
  // A sensible runner-friendly starting five: 3 bodyweight + 2 weights
  var DEFAULT_PICKS = ["walking-lunge", "sl-glute-bridge", "plank", "goblet-squat", "rdl"];
  var WCODE = { // Open-Meteo weather code -> emoji, rough mapping
    0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌦️",
    61:"🌧️",63:"🌧️",65:"🌧️",71:"🌨️",73:"🌨️",75:"🌨️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️"
  };

  /* ================= PLAN GENERATOR (start-a-new-plan) ================= */
  var RACE_DISTANCES = {"5k":5, "10k":10, "half":21.1, "marathon":42.2};
  var RACE_DIST_LABELS = {"5k":"5K", "10k":"10K", "half":"Half Marathon", "marathon":"Marathon"};
  var DIST_PROFILE = {
    // baseTotal/peakTotal = weekly km at the start/peak of the build phase.
    // longRatio/qualRatio = share of that week's total spent on the long run / quality session.
    // paceScale = multiplier applied to the easy/tempo/etc pace-zone offsets (shorter races have wider gaps to goal pace).
    "5k":       {baseTotal:14, peakTotal:32, longRatio:0.30, qualRatio:0.36, paceScale:1.55},
    "10k":      {baseTotal:16, peakTotal:34, longRatio:0.38, qualRatio:0.30, paceScale:1.25},
    "half":     {baseTotal:18, peakTotal:38, longRatio:0.48, qualRatio:0.27, paceScale:1.0},
    "marathon": {baseTotal:22, peakTotal:55, longRatio:0.55, qualRatio:0.22, paceScale:0.85}
  };
  var RACE_DIST = RACE_DISTANCES.half; // reassigned when a plan is generated for a different distance
  function roundHalf(x){ return Math.round(x*2)/2; }

  function generatePlan(numWeeks, raceDistKey){
    raceDistKey = RACE_DISTANCES[raceDistKey] ? raceDistKey : "half";
    var raceDist = RACE_DISTANCES[raceDistKey];
    var profile = DIST_PROFILE[raceDistKey];
    numWeeks = Math.max(6, Math.min(24, Math.round(numWeeks) || 16));
    var buildCount = numWeeks - 3; // reserve 2 taper weeks + 1 race week
    if(buildCount < 3){ buildCount = 3; }

    var baseTotal = profile.baseTotal, peakTotal = profile.peakTotal;
    var longRatio = profile.longRatio, qualRatio = profile.qualRatio;
    var weeks = [];

    for(var i=1; i<=buildCount; i++){
      var progress = buildCount>1 ? (i-1)/(buildCount-1) : 1;
      var trend = baseTotal + (peakTotal-baseTotal)*progress;
      var isFinal = (i === buildCount);
      var isPostPeakRecovery = (!isFinal && buildCount>=5 && i === buildCount-1);
      var isPeak = (!isFinal && !isPostPeakRecovery && buildCount>=6 && i === buildCount-2);
      var isPeriodic = (!isFinal && !isPostPeakRecovery && !isPeak && i % 4 === 0);
      var isRecoveryWeek = isPostPeakRecovery || isPeriodic;

      var total;
      if(isFinal) total = peakTotal*0.87;
      else if(isPostPeakRecovery) total = peakTotal*0.63;
      else if(isPeak) total = peakTotal;
      else if(isPeriodic) total = trend*0.72;
      else total = trend;

      var longDist = roundHalf(total*longRatio);
      var qualDist = roundHalf(total*qualRatio);
      var easyDist = Math.max(3, roundHalf(total - longDist - qualDist));

      var qualityCat = isRecoveryWeek ? "easy" : (isFinal ? "gp" : (i%2===0 ? "speed" : "tempo"));
      var longCat = isFinal ? "steady" : (isPeak ? "peak" : "long");
      var strengthCat = isRecoveryWeek ? "strength-lite" : "strength";
      var cycleMins = Math.round((30 + (total/peakTotal)*35)/5)*5;

      weeks.push({
        total: roundHalf(easyDist+qualDist+longDist),
        recovery: isRecoveryWeek || undefined,
        days:[
          {d:"Mon", cat:strengthCat},
          {d:"Tue", cat:"easy", dist:easyDist},
          {d:"Wed", cat:"rest"},
          {d:"Thu", cat:qualityCat, dist:qualDist},
          {d:"Fri", cat:"cycle", mins:cycleMins},
          {d:"Sat", cat:longCat, dist:longDist},
          {d:"Sun", cat:"rest"}
        ]
      });
    }

    var t1Total = peakTotal*0.66;
    var t1Long = roundHalf(t1Total*(longRatio*0.9)), t1Qual = roundHalf(t1Total*qualRatio);
    var t1Easy = Math.max(3, roundHalf(t1Total - t1Long - t1Qual));
    weeks.push({
      total: roundHalf(t1Easy+t1Qual+t1Long), taper:true,
      days:[
        {d:"Mon", cat:"strength-lite"},
        {d:"Tue", cat:"easy", dist:t1Easy},
        {d:"Wed", cat:"rest"},
        {d:"Thu", cat:"tempo", dist:t1Qual},
        {d:"Fri", cat:"cycle", mins:35},
        {d:"Sat", cat:"taper", dist:t1Long},
        {d:"Sun", cat:"rest"}
      ]
    });

    var t2Total = peakTotal*0.45;
    var t2Long = roundHalf(t2Total*(longRatio*0.85)), t2Qual = roundHalf(t2Total*qualRatio);
    var t2Easy = Math.max(3, roundHalf(t2Total - t2Long - t2Qual));
    weeks.push({
      total: roundHalf(t2Easy+t2Qual+t2Long), taper:true,
      days:[
        {d:"Mon", cat:"mobility"},
        {d:"Tue", cat:"easy", dist:t2Easy},
        {d:"Wed", cat:"rest"},
        {d:"Thu", cat:"gp", dist:t2Qual},
        {d:"Fri", cat:"cycle", mins:25},
        {d:"Sat", cat:"taper", dist:t2Long},
        {d:"Sun", cat:"rest"}
      ]
    });

    var shakeDist = roundHalf(Math.max(1.5, Math.min(3, raceDist*0.15)));
    var raceEasy = roundHalf(Math.max(2, Math.min(5, raceDist*0.25)));
    weeks.push({
      total: roundHalf(shakeDist+raceEasy+raceDist), raceweek:true,
      days:[
        {d:"Mon", cat:"rest"},
        {d:"Tue", cat:"easy", dist:raceEasy},
        {d:"Wed", cat:"rest"},
        {d:"Thu", cat:"shake", dist:shakeDist},
        {d:"Fri", cat:"rest"},
        {d:"Sat", cat:"rest"},
        {d:"Sun", cat:"race", dist:raceDist}
      ]
    });

    return weeks;
  }

  /* ================= STATE ================= */
  function defaultState(){
    return {startDate:null, status:{}, makeupOn:{}, logs:{}, checklist:{}, taperChecklist:{}, weatherCache:{}, themePref:"system", goalTimeSec:7200, raceDistKey:"half", planData:null, archive:[], weatherEnabled:false, strengthPicks:[], strengthLoads:{}, strengthChecks:{}};
  }
  var state = defaultState();
  var memoryFallback = false;

  /* ---------- Input validation ----------
     Everything that comes from localStorage or an imported backup file is treated as UNTRUSTED.
     sanitizeState() rebuilds the whole state object field-by-field: types are checked, strings are
     length-capped, enums are whitelisted, and every object key must match a strict pattern
     (which also blocks "__proto__"-style prototype-pollution keys). Anything invalid is dropped. */
  var DEFAULT_WEEKS = 16;
  var KEY_RE = /^w(\d{1,2})-([0-6])$/;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var STATUS_VALUES = {done:1, skipped:1, modified:1};
  var FEEL_VALUES = {easy:1, moderate:1, hard:1};
  var TAPER_KEYS = ["sleep","carbs","kit","logistics"];
  var MAX_IMPORT_BYTES = 5 * 1024 * 1024;

  function isObj(o){ return o !== null && typeof o === "object" && !Array.isArray(o); }
  function hasOwn(o, k){ return Object.prototype.hasOwnProperty.call(o, k); }
  function cleanText(v, max){
    return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").slice(0, max) : "";
  }
  function cleanNum(v, min, max, dflt){
    var n = typeof v === "number" ? v : parseFloat(v);
    return isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt;
  }
  function cleanDate(v){
    if(typeof v !== "string" || !DATE_RE.test(v)) return null;
    return isNaN(new Date(v + "T00:00:00").getTime()) ? null : v;
  }
  function validKey(k, nWeeks){
    var m = KEY_RE.exec(k);
    return !!m && parseInt(m[1], 10) < nWeeks;
  }
  function cleanPlan(p){
    if(!Array.isArray(p) || p.length < 1 || p.length > 52) return null;
    var out = [];
    for(var wi=0; wi<p.length; wi++){
      var w = p[wi];
      if(!isObj(w) || !Array.isArray(w.days) || w.days.length !== 7) return null;
      var days = [];
      for(var di=0; di<7; di++){
        var dd = w.days[di];
        if(!isObj(dd) || typeof dd.cat !== "string" || !hasOwn(CAT_META, dd.cat)) return null;
        var nd = {d: DAYS[di], cat: dd.cat};
        if(dd.dist != null){ var dist = cleanNum(dd.dist, 0, 100, 0); if(dist > 0) nd.dist = dist; }
        if(dd.mins != null){ var mins = cleanNum(dd.mins, 0, 600, 0); if(mins > 0) nd.mins = mins; }
        days.push(nd);
      }
      var nw = {total: cleanNum(w.total, 0, 500, 0), days: days};
      if(w.recovery === true) nw.recovery = true;
      if(w.taper === true) nw.taper = true;
      if(w.raceweek === true) nw.raceweek = true;
      out.push(nw);
    }
    return out;
  }
  function cleanStatus(o, n){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).forEach(function(k){ if(validKey(k, n) && STATUS_VALUES[o[k]] === 1) out[k] = o[k]; });
    return out;
  }
  function cleanLogs(o, n){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).forEach(function(k){
      var l = o[k];
      if(!validKey(k, n) || !isObj(l)) return;
      var km = cleanNum(l.km, 0, 500, null);
      out[k] = {
        km: km === null ? "" : String(km),
        time: cleanText(l.time, 20),
        feel: FEEL_VALUES[l.feel] === 1 ? l.feel : "",
        note: cleanText(l.note, 500)
      };
    });
    return out;
  }
  function cleanMakeup(o, n){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).forEach(function(k){
      var m = o[k];
      if(!validKey(k, n) || !isObj(m) || !validKey(m.fromKey, n)) return;
      out[k] = {fromKey: m.fromKey, fromG: Math.round(cleanNum(m.fromG, 0, n*7, 0)),
                fromLabel: cleanText(m.fromLabel, 40), label: cleanText(m.label, 60)};
    });
    return out;
  }
  function cleanChecklist(o, n){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).forEach(function(k){
      if(!validKey(k, n) || !isObj(o[k])) return;
      var items = {};
      Object.keys(o[k]).forEach(function(i){ if(/^\d{1,2}$/.test(i)) items[i] = o[k][i] === true; });
      out[k] = items;
    });
    return out;
  }
  function cleanPicks(a){
    var out = [], seen = {};
    if(!Array.isArray(a)) return out;
    a.forEach(function(id){
      if(typeof id === "string" && hasOwn(EXERCISE_BY_ID, id) && !seen[id] && out.length < MAX_PICKS){ seen[id] = true; out.push(id); }
    });
    return out;
  }
  function cleanLoads(o){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).forEach(function(id){
      if(!hasOwn(EXERCISE_BY_ID, id)) return;
      var n = cleanNum(o[id], 0, 500, 0);
      if(n > 0) out[id] = Math.round(n*2)/2;
    });
    return out;
  }
  function cleanStrengthChecks(o, n){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).forEach(function(k){
      if(!validKey(k, n) || !isObj(o[k])) return;
      var items = {};
      Object.keys(o[k]).forEach(function(id){ if(hasOwn(EXERCISE_BY_ID, id)) items[id] = o[k][id] === true; });
      out[k] = items;
    });
    return out;
  }
  function cleanTaper(o){
    var out = {};
    if(!isObj(o)) return out;
    TAPER_KEYS.forEach(function(k){ if(o[k] === true) out[k] = true; });
    return out;
  }
  function cleanWeather(o){
    var out = {};
    if(!isObj(o)) return out;
    Object.keys(o).filter(function(k){ return DATE_RE.test(k); }).slice(0, 40).forEach(function(k){
      var w = o[k];
      if(!isObj(w)) return;
      out[k] = {code: Math.round(cleanNum(w.code, 0, 99, 0)), tmax: Math.round(cleanNum(w.tmax, -60, 60, 0)),
                tmin: Math.round(cleanNum(w.tmin, -60, 60, 0)), pop: w.pop == null ? null : Math.round(cleanNum(w.pop, 0, 100, 0))};
    });
    return out;
  }
  function cleanArchive(a){
    var out = [], seen = {};
    if(!Array.isArray(a)) return out;
    a.slice(0, 10).forEach(function(e, i){
      if(!isObj(e)) return;
      var plan = cleanPlan(e.planData);
      if(!plan) return;
      var n = plan.length;
      var id = (typeof e.id === "string" && /^arc\d{1,16}$/.test(e.id) && !seen[e.id]) ? e.id : "arc" + Date.now() + i;
      seen[id] = true;
      out.push({
        id: id,
        archivedAt: cleanDate(e.archivedAt) || "unknown date",
        weeks: n,
        raceDistKey: hasOwn(RACE_DISTANCES, e.raceDistKey) ? e.raceDistKey : "half",
        goalTimeSec: Math.round(cleanNum(e.goalTimeSec, 300, 43200, 7200)),
        startDate: cleanDate(e.startDate),
        planData: plan,
        status: cleanStatus(e.status, n), logs: cleanLogs(e.logs, n), makeupOn: cleanMakeup(e.makeupOn, n),
        checklist: cleanChecklist(e.checklist, n), taperChecklist: cleanTaper(e.taperChecklist), strengthChecks: cleanStrengthChecks(e.strengthChecks, n)
      });
    });
    return out;
  }
  function sanitizeState(raw){
    var s = defaultState();
    if(!isObj(raw)) return s;
    s.planData = cleanPlan(raw.planData);
    var n = s.planData ? s.planData.length : DEFAULT_WEEKS;
    s.startDate = cleanDate(raw.startDate);
    s.status = cleanStatus(raw.status, n);
    s.logs = cleanLogs(raw.logs, n);
    s.makeupOn = cleanMakeup(raw.makeupOn, n);
    s.checklist = cleanChecklist(raw.checklist, n);
    s.taperChecklist = cleanTaper(raw.taperChecklist);
    s.strengthChecks = cleanStrengthChecks(raw.strengthChecks, n);
    s.strengthPicks = cleanPicks(raw.strengthPicks);
    s.strengthLoads = cleanLoads(raw.strengthLoads);
    s.weatherCache = cleanWeather(raw.weatherCache);
    s.themePref = (raw.themePref === "light" || raw.themePref === "dark" || raw.themePref === "system") ? raw.themePref : "system";
    s.goalTimeSec = Math.round(cleanNum(raw.goalTimeSec, 300, 43200, 7200));
    s.raceDistKey = (typeof raw.raceDistKey === "string" && hasOwn(RACE_DISTANCES, raw.raceDistKey)) ? raw.raceDistKey : "half";
    s.weatherEnabled = raw.weatherEnabled === true;
    s.archive = cleanArchive(raw.archive);
    return s;
  }

  function loadState(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw && raw.length <= MAX_IMPORT_BYTES){ state = sanitizeState(JSON.parse(raw)); }
    }catch(e){ memoryFallback = true; }
  }
  function saveState(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch(e){ memoryFallback = true; }
  }
  loadState();

  if(state.planData && Array.isArray(state.planData) && state.planData.length){
    PLAN = state.planData;
  } else {
    state.planData = PLAN;
  }
  if(!RACE_DISTANCES[state.raceDistKey]) state.raceDistKey = "half";
  RACE_DIST = RACE_DISTANCES[state.raceDistKey];

  /* ================= HELPERS ================= */
  function key(w,di){ return "w"+w+"-"+di; }
  function globalIndex(w,di){ return w*7 + di; }

  function dateForGlobal(g){
    if(!state.startDate) return null;
    var start = new Date(state.startDate+"T00:00:00");
    var dt = new Date(start.getTime());
    dt.setDate(dt.getDate() + g);
    return dt;
  }
  function fmtDate(dt){
    if(!dt) return null;
    return dt.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
  }
  function fmtDateShort(dt){
    if(!dt) return null;
    return dt.toLocaleDateString(undefined, {month:'short', day:'numeric'});
  }

  function sessionLabel(day){
    if(day.cat === "race") return "RACE DAY";
    if(day.cat === "rest") return "Rest";
    var meta = CAT_META[day.cat];
    if(day.dist) return day.dist+" km " + (day.cat==="easy"?"easy": day.cat==="long"?"long": day.cat==="peak"?"peak long run": day.cat==="steady"?"steady": day.cat==="taper"?"taper": day.cat==="shake"?"shakeout": day.cat==="gp"?"@ goal pace": day.cat==="tempo"?"tempo": day.cat==="speed"?"speed": "");
    if(day.mins) return day.mins+" min cycle";
    return meta.label;
  }

  function isoDate(dt){
    if(!dt) return null;
    var y=dt.getFullYear(), m=("0"+(dt.getMonth()+1)).slice(-2), day=("0"+dt.getDate()).slice(-2);
    return y+"-"+m+"-"+day;
  }
  function todayDate(){
    var t = new Date(); t.setHours(0,0,0,0); return t;
  }
  function daysBetween(a,b){
    return Math.round((b.getTime()-a.getTime())/86400000);
  }
  function weekForToday(){
    if(!state.startDate) return null;
    var start = new Date(state.startDate+"T00:00:00");
    var diff = daysBetween(start, todayDate());
    if(diff<0) return -1; // before plan starts
    var wi = Math.floor(diff/7);
    if(wi >= PLAN.length) return PLAN.length; // after plan ends
    return wi;
  }
  function jumpToCurrentWeek(){
    var wk = weekForToday();
    if(wk !== null && wk >= 0 && wk < PLAN.length) currentWeek = wk;
  }
  function centerActiveWeekChip(){
    var active = weekRail.querySelector(".week-chip.active");
    if(active) weekRail.scrollLeft = active.offsetLeft - (weekRail.clientWidth - active.offsetWidth) / 2;
  }

  function raceGlobalIndex(){
    for(var wi=0; wi<PLAN.length; wi++){
      for(var di=0; di<PLAN[wi].days.length; di++){
        if(PLAN[wi].days[di].cat === "race") return globalIndex(wi,di);
      }
    }
    return null;
  }

  function allSessions(){
    var out = [];
    PLAN.forEach(function(week, wi){
      week.days.forEach(function(day, di){
        out.push({wi:wi, di:di, day:day, key:key(wi,di), g:globalIndex(wi,di)});
      });
    });
    return out;
  }

  /* ================= EDIT / SWAP SESSIONS ================= */
  var EDIT_CATS = [
    {v:"rest", l:"Rest"}, {v:"easy", l:"Easy run"}, {v:"tempo", l:"Tempo"}, {v:"speed", l:"Speed"},
    {v:"gp", l:"Goal pace"}, {v:"long", l:"Long run"}, {v:"peak", l:"Peak long run"}, {v:"steady", l:"Steady"},
    {v:"taper", l:"Taper run"}, {v:"shake", l:"Shakeout"}, {v:"strength", l:"Strength"},
    {v:"strength-lite", l:"Strength · light"}, {v:"mobility", l:"Mobility"}, {v:"cycle", l:"Cycle"}
  ];
  var DIST_CATS = {easy:1, tempo:1, speed:1, gp:1, long:1, peak:1, steady:1, taper:1, shake:1};

  function recomputeWeekTotal(wi){
    var week = PLAN[wi];
    if(!week) return;
    var sum = 0;
    week.days.forEach(function(day){ if(day.dist) sum += day.dist; });
    week.total = roundHalf(sum);
  }

  function applyDayEdit(wi, di, newCat, newDist, newMins){
    var day = PLAN[wi].days[di];
    day.cat = newCat;
    if(DIST_CATS[newCat]){ day.dist = newDist; delete day.mins; }
    else if(newCat === "cycle"){ day.mins = newMins; delete day.dist; }
    else { delete day.dist; delete day.mins; }
    recomputeWeekTotal(wi);
    state.planData = PLAN;
  }

  function swapDays(keyA, wiA, diA, wiB, diB){
    var dayA = PLAN[wiA].days[diA], dayB = PLAN[wiB].days[diB];
    var tmpCat = dayA.cat, tmpDist = dayA.dist, tmpMins = dayA.mins;
    dayA.cat = dayB.cat; dayA.dist = dayB.dist; dayA.mins = dayB.mins;
    if(dayA.dist==null) delete dayA.dist;
    if(dayA.mins==null) delete dayA.mins;
    dayB.cat = tmpCat; dayB.dist = tmpDist; dayB.mins = tmpMins;
    if(dayB.dist==null) delete dayB.dist;
    if(dayB.mins==null) delete dayB.mins;
    recomputeWeekTotal(wiA);
    if(wiB !== wiA) recomputeWeekTotal(wiB);
    state.planData = PLAN;
  }

  /* ================= RESCHEDULE LOGIC ================= */
  function findCandidates(fromWi, fromDi){
    var fromG = globalIndex(fromWi, fromDi);
    var all = allSessions();
    var used = {};
    all.forEach(function(s){ if(state.makeupOn[s.key]) used[s.key]=true; });

    var candidates = [];
    for(var i=0;i<all.length;i++){
      var s = all[i];
      if(s.g <= fromG) continue;
      if(s.g > fromG + 9) break;
      if(s.day.cat !== "rest" && s.day.cat !== "mobility") continue;
      if(used[s.key]) continue;
      if(s.day.cat === "race") continue;
      var daysAway = s.g - fromG;
      var why;
      if(s.wi === fromWi) why = "Later this week — closest fit to the original slot.";
      else if(s.wi === fromWi+1 && daysAway <= 7) why = "Early next week — still keeps momentum.";
      else why = "A bit further out, but open.";
      candidates.push({s:s, daysAway:daysAway, why:why});
      if(candidates.length >= 3) break;
    }
    return candidates;
  }

  /* ================= RENDER ================= */
  var weekRail = document.getElementById("weekRail");
  var dayList = document.getElementById("dayList");
  var weekTitle = document.getElementById("weekTitle");
  var weekTag = document.getElementById("weekTag");
  var weekNoteEl = document.getElementById("weekNote");
  var currentWeek = 0;
  var openKey = null;
  var rescheduleOpenKey = null;
  var logOpenKey = null;
  var manualPickerOpenKey = null;
  var editOpenKey = null;

  function computeStats(){
    var all = allSessions();
    var trackable = all.filter(function(s){ return s.day.cat !== "rest"; });
    var done=0, skipped=0, kmDone=0;
    trackable.forEach(function(s){
      var st = state.status[s.key];
      var log = state.logs[s.key];
      if(st === "done" || st === "modified"){
        done++;
        var km = (log && log.km!=null && log.km!=="") ? parseFloat(log.km) : s.day.dist;
        if(km) kmDone += km;
      }
      if(st === "skipped") skipped++;
    });
    return {total:trackable.length, done:done, skipped:skipped, kmDone:Math.round(kmDone*10)/10};
  }

  function weeklyMileage(){
    // returns [{wi, planned, actual}] per week — actual only counts logged (done/modified) sessions
    return PLAN.map(function(week, wi){
      var planned=0, actual=0;
      week.days.forEach(function(day, di){
        if(!day.dist) return;
        planned += day.dist;
        var k = key(wi,di);
        var st = state.status[k];
        if(st === "done" || st === "modified"){
          var log = state.logs[k];
          var km = (log && log.km!=null && log.km!=="") ? parseFloat(log.km) : day.dist;
          actual += km;
        }
      });
      return {wi:wi, planned:Math.round(planned*10)/10, actual:Math.round(actual*10)/10};
    });
  }

  function computeStreaks(){
    var attempted = allSessions()
      .filter(function(s){ return s.day.cat!=="rest" && state.status[s.key]; })
      .sort(function(a,b){ return a.g-b.g; });
    var current = 0, best = 0, running = 0;
    attempted.forEach(function(s){
      var st = state.status[s.key];
      if(st==="done" || st==="modified"){ running++; if(running>best) best=running; }
      else { running = 0; }
    });
    // current streak = trailing run at the end of the attempted list
    for(var i=attempted.length-1; i>=0; i--){
      var st = state.status[attempted[i].key];
      if(st==="done" || st==="modified") current++;
      else break;
    }
    return {current:current, best:best};
  }

  function last4WeeksPct(){
    if(!state.startDate) return null;
    var today = todayDate();
    var cutoff = new Date(today.getTime()); cutoff.setDate(cutoff.getDate()-28);
    var due=0, done=0;
    allSessions().forEach(function(s){
      if(s.day.cat==="rest") return;
      var dt = dateForGlobal(s.g);
      if(!dt || dt < cutoff || dt > today) return;
      due++;
      var st = state.status[s.key];
      if(st==="done" || st==="modified") done++;
    });
    if(due===0) return null;
    return Math.round((done/due)*100);
  }

  function computeProjection(){
    // Riegel-formula projection from the most recent logged aerobic/long-effort session with both actual km & time.
    var candidates = allSessions().filter(function(s){
      return ["long","peak","steady","taper"].indexOf(s.day.cat)>=0;
    });
    var best = null;
    candidates.forEach(function(s){
      var log = state.logs[s.key];
      if(!log || !log.km || !log.time) return;
      var km = parseFloat(log.km);
      var sec = parseTimeToSec(log.time);
      if(!km || !sec) return;
      if(!best || s.g > best.g) best = {s:s, km:km, sec:sec};
    });
    if(!best) return null;
    var predictedSec = best.sec * Math.pow(RACE_DIST/best.km, 1.06);
    var diff = predictedSec - (state.goalTimeSec||7200);
    var dt = dateForGlobal(best.s.g);
    return {
      predictedSec: predictedSec,
      diffSec: diff,
      km: best.km,
      loggedSec: best.sec,
      cat: best.s.day.cat,
      dateLabel: dt ? fmtDateShort(dt) : ("Week "+(best.s.wi+1))
    };
  }

  function computeDebt(){
    // skipped sessions with no makeup pointing to them, within the current calendar month (if startDate set)
    var all = allSessions();
    var madeUpFromKeys = {};
    Object.keys(state.makeupOn).forEach(function(mk){
      var m = state.makeupOn[mk];
      if(m && m.fromKey) madeUpFromKeys[m.fromKey] = true;
    });
    var now = todayDate();
    var owed = [];
    all.forEach(function(s){
      if(state.status[s.key] !== "skipped") return;
      if(madeUpFromKeys[s.key]) return;
      var dt = dateForGlobal(s.g);
      if(dt && (now.getMonth()!==dt.getMonth() || now.getFullYear()!==dt.getFullYear())){
        // outside current month — still counted, but only if in the past 45 days to stay relevant
        if(Math.abs(daysBetween(dt, now)) > 45) return;
      }
      owed.push(s);
    });
    return owed;
  }

  function renderOverall(){
    var stats = computeStats();
    var frac = stats.total ? stats.done/stats.total : 0;
    document.getElementById("overallPct").textContent = Math.round(frac*100);
    document.getElementById("overallBar").style.width = (frac*100) + "%";
    document.getElementById("overallDone").textContent = stats.done;
    document.getElementById("overallTotal").textContent = stats.total;
    document.getElementById("overallKmNum").textContent = stats.kmDone;
    document.getElementById("overallSkipNum").textContent = stats.skipped;
  }

  function renderRaceChip(){
    var chip = document.getElementById("raceChip");
    var raceG = raceGlobalIndex();
    if(!state.startDate || raceG == null){ chip.style.display = "none"; return; }
    var daysLeft = daysBetween(todayDate(), dateForGlobal(raceG));
    // inside the final ~2 weeks the big taper banner shows the countdown, so don't repeat it up here
    if(daysLeft < 0 || daysLeft <= 16){ chip.style.display = "none"; return; }
    chip.style.display = "block";
    document.getElementById("raceDays").textContent = daysLeft;
    document.getElementById("raceDaysLbl").textContent = daysLeft === 1 ? "day to go" : "days to go";
  }

  function renderNextUp(){
    var all = allSessions();
    var next = null;
    for(var i=0;i<all.length;i++){
      var s = all[i];
      if(s.day.cat === "rest") continue;
      if(!state.status[s.key]){ next = s; break; }
    }
    var el = document.getElementById("nextUp");
    if(!next){ el.style.display="none"; return; }
    el.style.display="flex";
    var dt = dateForGlobal(next.g);
    var dateTxt = dt ? fmtDate(dt) : ("Week "+(next.wi+1)+" · "+next.day.d);
    var np = next.day.dist ? paceRangeFor(next.day.cat) : null;
    el.innerHTML = '<div class="nu-body"><div class="nu-eyebrow">Next up</div><div class="nu-title">'+sessionLabel(next.day)+'</div>'+
      '<div class="nu-meta">'+dateTxt+(np ? ' · '+np.text : '')+'</div></div><div class="nu-go">'+ICON_SVG_OPEN+'<path d="M5 12h14M13 6l6 6-6 6"/></svg></div>';
    el.onclick = function(){ goToWeek(next.wi); openKey = next.key; render(); scrollToCard(next.key); };
  }

  function renderDebtBadge(){
    var owed = computeDebt();
    var badge = document.getElementById("debtBadge");
    if(owed.length === 0){ badge.style.display = "none"; return; }
    badge.style.display = "inline-flex";
    document.getElementById("debtTxt").textContent = owed.length + (owed.length===1 ? " session owed" : " sessions owed") + " · tap to review";
    badge.onclick = function(){
      var s = owed[0];
      goToWeek(s.wi); openKey = s.key; rescheduleOpenKey = s.key; render(); scrollToCard(s.key);
    };
  }

  function renderInsights(){
    renderStatRow();
    renderProjection();
    var wrap = document.getElementById("chartWrap");
    var data = weeklyMileage();
    var maxV = Math.max.apply(null, data.map(function(w){ return Math.max(w.planned, w.actual); }).concat([1]));
    var W = 340, H = 190, padB = 24, padT = 22, plotH = H - padB - padT, n = data.length, slot = W / n;
    var svg = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Weekly mileage, planned versus logged" style="width:100%;height:auto;display:block;">';
    [0, 0.5, 1].forEach(function(f){
      var y = padT + plotH * (1 - f);
      svg += '<line x1="0" x2="'+W+'" y1="'+y+'" y2="'+y+'" style="stroke:var(--line)" stroke-width="1"></line>';
    });
    svg += '<text x="0" y="13" font-size="11" font-weight="700" style="fill:var(--ink-faint)">'+Math.round(maxV)+' km</text>';
    var every = n > 18 ? 2 : 1;
    data.forEach(function(w, i){
      var cx = i*slot + slot/2, bw = Math.max(5, Math.min(13, slot*0.3));
      var ph = (w.planned/maxV)*plotH, ah = (w.actual/maxV)*plotH, cur = (i === currentWeek);
      svg += '<rect x="'+(cx-bw-1)+'" y="'+(padT+plotH-ph)+'" width="'+bw+'" height="'+ph+'" rx="3" style="fill:var(--ink-faint)" opacity="'+(cur?0.65:0.35)+'"></rect>';
      if(w.actual > 0) svg += '<rect x="'+(cx+1)+'" y="'+(padT+plotH-ah)+'" width="'+bw+'" height="'+ah+'" rx="3" style="fill:var(--accent)"></rect>';
      if(i % every === 0 || cur) svg += '<text x="'+cx+'" y="'+(H-7)+'" font-size="11" font-weight="'+(cur?800:600)+'" text-anchor="middle" style="fill:'+(cur?'var(--ink)':'var(--ink-faint)')+'">'+(i+1)+'</text>';
    });
    svg += '</svg>';
    wrap.innerHTML = svg;
  }

  function renderStatRow(){
    var wrap = document.getElementById("statRow");
    var streaks = computeStreaks();
    var pct = last4WeeksPct();
    wrap.innerHTML =
      '<div class="stat-chip"><div class="sc-num">'+streaks.current+'</div><div class="sc-lbl">Current streak</div></div>'+
      '<div class="stat-chip"><div class="sc-num">'+streaks.best+'</div><div class="sc-lbl">Best streak</div></div>'+
      '<div class="stat-chip"><div class="sc-num">'+(pct==null?"—":pct+"%")+'</div><div class="sc-lbl">Last 4 weeks</div></div>';
  }

  function renderProjection(){
    var wrap = document.getElementById("projectionWrap");
    var p = computeProjection();
    if(!p){ wrap.innerHTML = ""; return; }
    var behind = p.diffSec > 0;
    var diffAbs = Math.abs(p.diffSec);
    var diffTxt = fmtHMS(diffAbs).replace(/^0:/, "");
    wrap.innerHTML = '<div class="projection-box'+(behind?" behind":"")+'">'+
      '<div class="pj-kicker">Projected finish · '+(behind ? "behind goal" : "on track")+'</div><div class="pj-num">'+fmtHMS(p.predictedSec)+'</div>'+
      '<div class="pj-sub">'+(behind ? diffTxt+" over" : diffTxt+" under")+' your '+fmtHMS(state.goalTimeSec||7200)+' goal — based on your '+p.dateLabel+' '+CAT_META[p.cat].label.toLowerCase()+' ('+p.km+' km in '+fmtHMS(p.loggedSec)+').</div>'+
    '</div>';
  }

  /* ================= RACE SPLITS ================= */
  var splitStrategy = "even";
  function computeSplits(strategy){
    var g = goalPaceSecPerKm();
    var totalKm = RACE_DIST;
    var fullKm = Math.floor(totalKm + 1e-9);
    var negOffset = 8; // sec/km — first half slightly slower, second half slightly faster, average pace is unchanged
    var rows = [];
    var cum = 0;
    for(var i=1; i<=fullKm; i++){
      var pace = g;
      if(strategy === "negative") pace = (i <= totalKm/2) ? g+negOffset : g-negOffset;
      cum += pace;
      rows.push({label:String(i), paceSec:pace, cumSec:cum});
    }
    var remainder = totalKm - fullKm;
    if(remainder > 0.01){
      var pace = g + (strategy==="negative" ? -negOffset : 0);
      cum += pace*remainder;
      rows.push({label:roundHalf(totalKm)+" (finish)", paceSec:pace, cumSec:cum});
    }
    return rows;
  }

  function renderSplits(){
    var toggle = document.getElementById("splitsToggle");
    if(toggle){
      toggle.querySelectorAll("[data-split-strategy]").forEach(function(btn){
        btn.classList.toggle("sel", btn.getAttribute("data-split-strategy")===splitStrategy);
      });
    }
    var rows = computeSplits(splitStrategy);
    var html = '<table class="splits-table"><thead><tr><th>Km</th><th>Pace</th><th>Cumulative</th></tr></thead><tbody>';
    rows.forEach(function(r){
      html += '<tr><td class="km">'+r.label+'</td><td>'+fmtPace(r.paceSec)+'/km</td><td>'+fmtHMS(r.cumSec)+'</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById("splitsTableWrap").innerHTML = html;
  }

  function renderTaperBanner(){
    var el = document.getElementById("taperBanner");
    var raceG = raceGlobalIndex();
    if(!state.startDate || raceG==null){ el.style.display="none"; return; }
    var raceDt = dateForGlobal(raceG);
    var daysLeft = daysBetween(todayDate(), raceDt);
    if(daysLeft < 0 || daysLeft > 16){ el.style.display="none"; return; }
    el.style.display = "block";
    var tc = state.taperChecklist;
    var items = [
      {k:"sleep", label:"Prioritise sleep this week"},
      {k:"carbs", label:"Start carb-loading 1–2 days out"},
      {k:"kit", label:"Kit (shoes, bib, watch, fuel) laid out & charged"},
      {k:"logistics", label:"Race-morning logistics sorted (transport, timing)"}
    ];
    var subTxt = daysLeft === 0 ? "It's race day — good luck!" : (daysLeft===1 ? "Race day is tomorrow." : "Taper mode — trust the work, keep the legs fresh.");
    var html = '<div class="cd-row"><div><div class="cd-num">'+(daysLeft)+'</div><div class="cd-lbl">'+(daysLeft===1?"day to race":"days to race")+'</div></div>'+
      '<div class="cd-lbl" style="text-align:right;">'+fmtDate(raceDt)+'</div></div>'+
      '<div class="cd-sub">'+subTxt+'</div>'+
      '<div class="taper-checklist">'+items.map(function(it){
        var checked = tc[it.k] ? "checked" : "";
        return '<label><input type="checkbox" data-tc="'+it.k+'" '+checked+'>'+it.label+'</label>';
      }).join("")+'</div>';
    el.innerHTML = html;
    el.querySelectorAll("[data-tc]").forEach(function(cb){
      cb.onchange = function(){
        state.taperChecklist[cb.getAttribute("data-tc")] = cb.checked;
        saveState();
      };
    });
  }

  function renderWeekRail(){
    weekRail.innerHTML = "";
    PLAN.forEach(function(week, wi){
      var chip = document.createElement("div");
      chip.className = "week-chip" + (wi===currentWeek?" active":"") + (week.recovery?" recovery":"");
      var dotsHtml = week.days.map(function(day,di){
        if(day.cat==="rest") return "";
        var st = state.status[key(wi,di)];
        return '<i class="'+(st==="done"?"done":st==="skipped"?"skip":st==="modified"?"mod":"")+'"></i>';
      }).join("");
      chip.innerHTML = '<div class="wk">W'+(wi+1)+'</div><div class="km">'+week.total+'k</div><div class="dots">'+dotsHtml+'</div>';
      chip.onclick = function(){ goToWeek(wi); };
      weekRail.appendChild(chip);
    });
  }

  function goToWeek(wi){
    currentWeek = wi;
    render();
    var active = weekRail.querySelector(".week-chip.active");
    if(active) active.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
  }

  function scrollToCard(k){
    setTimeout(function(){
      var el = document.querySelector('[data-key="'+k+'"]');
      if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
    }, 60);
  }

  function renderWeekHeader(){
    var week = PLAN[currentWeek];
    weekTitle.textContent = "Week " + (currentWeek+1);
    weekTag.textContent = week.total + " km total";
    weekNoteEl.textContent = WEEK_NOTES[currentWeek] || "";
    weekNoteEl.style.display = WEEK_NOTES[currentWeek] ? "block" : "none";
  }

  function makeupIncomingFor(targetKey){
    return state.makeupOn[targetKey] || null;
  }

  /* ---- icons (inline SVG; markup only, so it is fine under the CSP) ---- */
  var ICON_SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var CAT_ICONS = {
    run:      '<circle cx="14.5" cy="4.5" r="1.8"/><path d="M12.6 8.3 10.2 13.4l3.5 2.4.8 4.7"/><path d="M10.2 13.4 6.6 16.6l-2.6-.6"/><path d="M12.6 8.3l3.4 1.6 2.7-.9"/><path d="M12.6 8.3 9.2 9.6 8 7.6"/>',
    route:    '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
    timer:    '<circle cx="12" cy="14" r="7"/><path d="M12 14l3-3M9.5 2.5h5"/>',
    zap:      '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>',
    target:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    pulse:    '<path d="M21.5 12h-4l-3 8.5L9.5 3.5 6.5 12h-4"/>',
    peak:     '<path d="M3 20 9.5 8l4 7 2.5-4L21 20z"/>',
    taper:    '<path d="M22 17l-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    bike:     '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="15" cy="5.5" r="1.3"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
    wind:     '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    moon:     '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    flag:     '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4.5L17 13H5"/>'
  };
  var CAT_ICON_KEY = {easy:"run", shake:"run", long:"route", peak:"peak", steady:"pulse", taper:"taper", tempo:"timer", speed:"zap",
                      gp:"target", cycle:"bike", strength:"dumbbell", "strength-lite":"dumbbell", mobility:"wind", rest:"moon", race:"flag"};
  function catIcon(cat){
    var k = hasOwn(CAT_ICON_KEY, cat) ? CAT_ICON_KEY[cat] : "run";
    return ICON_SVG_OPEN + CAT_ICONS[k] + '</svg>';
  }
  function statusDotHtml(status){
    var glyph = status==="done" ? '<path d="M6 12.5l4 4 8-9"/>' :
                status==="skipped" ? '<path d="M7 7l10 10M17 7L7 17"/>' :
                status==="modified" ? '<path d="M12 7v6M12 16.8v.2"/>' : '';
    var cls = STATUS_VALUES[status] === 1 ? " " + status : "";
    return '<div class="st'+cls+'">'+(glyph ? ICON_SVG_OPEN.replace('stroke-width="2"','stroke-width="2.6"') + glyph + '</svg>' : '')+'</div>';
  }

  /* ---- strength routine (your chosen exercises) ---- */
  function currentPicks(){
    var picks = cleanPicks(state.strengthPicks);
    return picks.length ? picks : DEFAULT_PICKS.slice();
  }
  function loadLabel(ex){
    var kg = state.strengthLoads[ex.id];
    return (ex.type === "weights" && kg > 0) ? " · " + kg + " kg" : "";
  }
  function strengthRoutineHtml(k, cat){
    var lite = cat === "strength-lite";
    var checks = state.strengthChecks[k] || {};
    var rows = currentPicks().map(function(id){
      var ex = EXERCISE_BY_ID[id];
      var done = checks[id] === true;
      return '<label class="ex-row'+(done?" checked":"")+'"><input type="checkbox" data-ex="'+escapeHtml(id)+'"'+(done?" checked":"")+'>'+
        '<span class="ex-txt"><b>'+escapeHtml(ex.name)+'</b><small>'+escapeHtml((lite ? ex.lite : ex.full) + loadLabel(ex))+'</small></span>'+
        '<span class="ex-tag '+ex.type+'">'+(ex.type === "weights" ? "Weights" : "Bodyweight")+'</span></label>';
    }).join("");
    return '<div class="strength-routine"><div class="sr-head"><h4>'+(lite ? "Light routine" : "Routine")+'</h4>'+
      '<button type="button" class="sr-edit" data-edit-exercises>Change exercises</button></div>'+rows+'</div>';
  }

  function paceChipHtml(day){
    if(!day.dist) return "";
    var p = paceRangeFor(day.cat);
    if(!p) return "";
    return '<span class="pace-chip">'+p.text+'</span>';
  }

  function statCell(val, lbl){ return '<div class="sg"><b>'+val+'</b><span>'+lbl+'</span></div>'; }
  function paceBoxHtml(day){
    if(day.dist){
      var p = paceRangeFor(day.cat);
      if(!p) return "";
      var est = estTimeFor(day.dist, p.low, p.high);
      return '<div class="stat-grid">'+statCell(day.dist, "km")+statCell(p.text.replace("/km",""), "min / km")+statCell(est, "est. time")+'</div>';
    }
    if(day.cat === "cycle" && day.mins){
      return '<div class="stat-grid">'+statCell(day.mins, "minutes")+statCell("85–95", "rpm cadence")+statCell("Easy", "effort")+'</div>';
    }
    return "";
  }

  function weatherChipHtml(dt){
    if(!dt) return "";
    var iso = isoDate(dt);
    var wx = state.weatherCache[iso];
    if(!wx) return "";
    var pop = Number(wx.pop);
    var rain = (wx.pop!=null && isFinite(pop) && pop>=40) ? " 💧"+Math.round(pop)+"%" : "";
    return '<span class="weather-chip">'+weatherCodeIcon(wx.code)+" "+Math.round(Number(wx.tmin)||0)+"–"+Math.round(Number(wx.tmax)||0)+"°"+rain+'</span>';
  }

  function feelTagHtml(feel){
    if(FEEL_VALUES[feel] !== 1) return "";
    return '<span class="feel-tag '+feel+'">'+feel+'</span>';
  }

  function logSummaryHtml(log){
    if(!log) return "";
    var bits = [];
    if(log.km) bits.push('<b>'+escapeHtml(log.km)+' km</b>');
    if(log.time) bits.push(escapeHtml(log.time));
    var line1 = bits.length ? bits.join(" · ") + feelTagHtml(log.feel) : (log.feel ? "Felt: "+feelTagHtml(log.feel) : "");
    var line2 = log.note ? '<div style="margin-top:4px;">"'+escapeHtml(log.note)+'"</div>' : "";
    if(!line1 && !line2) return "";
    return '<div class="log-summary">'+line1+line2+'</div>';
  }

  var ESC_MAP = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
  function escapeHtml(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return ESC_MAP[c]; });
  }

  function keyFromGlobal(g){
    var wi = Math.floor(g/7), di = g%7;
    return {wi:wi, di:di, key:key(wi,di)};
  }

  function renderDays(){
    dayList.innerHTML = "";
    var week = PLAN[currentWeek];
    week.days.forEach(function(day, di){
      var k = key(currentWeek, di);
      var meta = CAT_META[day.cat];
      var status = state.status[k];
      var g = globalIndex(currentWeek, di);
      var dt = dateForGlobal(g);
      var log = state.logs[k];
      var completed = status==="done" || status==="modified";

      var isToday = !!dt && isoDate(dt) === isoDate(todayDate());
      var wrap = document.createElement("div");
      wrap.className = "day" + (status==="done"?" done":status==="skipped"?" skipped":status==="modified"?" modified":"");

      var card = document.createElement("div");
      card.className = "card" + (status==="done"?" done":"") + (status==="modified"?" modified":"") + (openKey===k?" open":"") +
                       (isToday?" today":"") + (day.cat==="rest"?" rest":"") + (day.cat==="race"?" race":"");
      card.style.setProperty("--cat-color", meta.color);
      card.style.setProperty("--cat-dim", meta.dim);
      card.setAttribute("data-key", k);

      var metaLine = '<span class="when">'+(dt ? fmtDate(dt) : day.d)+'</span>' + (isToday ? '<span class="today-tag">Today</span>' : '') +
                     paceChipHtml(day) + weatherChipHtml(dt);
      var incoming = makeupIncomingFor(k);

      var top = document.createElement("div");
      top.className = "card-top";
      top.innerHTML =
        '<div class="tile">'+catIcon(day.cat)+'</div>'+
        '<div class="maininfo"><div class="sub">'+sessionLabel(day)+'</div>'+
        '<div class="meta">'+metaLine+'</div></div>'+
        statusDotHtml(status);
      top.onclick = function(){ openKey = (openKey===k? null : k); if(openKey!==k){ rescheduleOpenKey=null; logOpenKey=null; manualPickerOpenKey=null; editOpenKey=null; } render(); if(openKey===k) scrollToCard(k); };
      card.appendChild(top);

      var body = document.createElement("div");
      body.className = "card-body";
      var inner = document.createElement("div");
      inner.className = "card-body-inner";

      var catLabelHtml = '<div class="cat-eyebrow">'+meta.label+'</div>';
      var paceHtml = paceBoxHtml(day);
      var adviceHtml = '<div class="advice">'+ADVICE[day.cat]+'</div>';

      var statusHtml = "";
      if(status==="done") statusHtml = '<div class="status-note done">Logged as done</div>' + logSummaryHtml(log);
      if(status==="modified") statusHtml = '<div class="status-note modified">Modified — not quite as planned</div>' + logSummaryHtml(log);
      if(status==="skipped") statusHtml = '<div class="status-note skipped">Skipped</div>';
      if(incoming){
        var fromDt = dateForGlobal(incoming.fromG);
        statusHtml += '<div class="status-note makeup">↳ Make-up session: '+escapeHtml(incoming.label)+' (moved from '+escapeHtml(incoming.fromLabel)+')</div>';
      }

      var logToggleHtml = completed ? '<button class="log-toggle" data-logtoggle="1">'+(log ? "Edit details" : "Add time, distance & how it felt")+'</button>' : "";

      var logFormHtml = "";
      if(logOpenKey === k && completed){
        var lkm = log && log.km!=null ? log.km : (day.dist || "");
        var ltime = log && log.time ? log.time : "";
        var lfeel = log && log.feel ? log.feel : "";
        var lnote = log && log.note ? log.note : "";
        logFormHtml = '<div class="log-form">'+
          '<div class="lf-row">'+
            '<div class="lf-field"><label>Actual km</label><input type="number" step="0.1" min="0" id="lf-km" value="'+escapeHtml(lkm)+'"></div>'+
            '<div class="lf-field"><label>Time (e.g. 52:10)</label><input type="text" id="lf-time" value="'+escapeHtml(ltime)+'"></div>'+
          '</div>'+
          '<div class="lf-field" style="margin-bottom:8px;"><label>How did it feel?</label>'+
            '<div class="feel-btns">'+
              ['easy','moderate','hard'].map(function(f){ return '<button type="button" class="'+(lfeel===f?"sel":"")+'" data-feel="'+f+'">'+f+'</button>'; }).join("")+
            '</div>'+
          '</div>'+
          '<div class="lf-field" style="margin-bottom:8px;"><label>Notes (pace, weather, niggles...)</label><textarea id="lf-note">'+escapeHtml(lnote)+'</textarea></div>'+
          '<button class="lf-save" data-savelog="1">Save details</button>'+
        '</div>';
      }

      var fuelHtml = "";
      if(day.dist && day.dist >= FUEL_THRESHOLD){
        var ck = state.checklist[k] || {};
        fuelHtml = '<div class="fuel-check"><h4>Fuelling & gear checklist</h4>' +
          FUEL_ITEMS.map(function(item, idx){
            var checked = ck[idx] ? "checked" : "";
            return '<label class="'+(ck[idx]?"checked":"")+'"><input type="checkbox" data-fuel="'+idx+'" '+checked+'>'+item+'</label>';
          }).join("") + '</div>';
      }

      var strengthHtml = (day.cat === "strength" || day.cat === "strength-lite") ? strengthRoutineHtml(k, day.cat) : "";

      var editToggleHtml = day.cat!=="race" ? '<button class="edit-toggle" data-edittoggle="1">'+(editOpenKey===k ? "Close editor" : "Edit or swap")+'</button>' : "";
      var editPanelHtml = "";
      if(editOpenKey === k && day.cat!=="race"){
        var catOptsHtml = EDIT_CATS.map(function(c){ return '<option value="'+c.v+'" '+(c.v===day.cat?"selected":"")+'>'+c.l+'</option>'; }).join("");
        var showDist = DIST_CATS[day.cat];
        var showMins = day.cat==="cycle";
        editPanelHtml = '<div class="edit-panel"><h4>Change this session</h4>'+
          '<div class="ep-row">'+
            '<select id="ep-cat">'+catOptsHtml+'</select>'+
            (showDist ? '<input type="number" step="0.5" min="0" id="ep-dist" placeholder="km" value="'+(day.dist||"")+'">' : "") +
            (showMins ? '<input type="number" step="5" min="0" id="ep-mins" placeholder="mins" value="'+(day.mins||"")+'">' : "") +
          '</div>'+
          '<button class="ep-save" data-editsave="'+k+'" data-editwi="'+currentWeek+'" data-editdi="'+di+'">Save changes</button>'+
          '<div class="ep-divider"></div>'+
          '<h4>Swap with another day</h4>'+
          '<div class="ep-swap-row"><select id="ep-swap-target">'+
            allSessions().filter(function(s){ return s.key!==k && s.day.cat!=="race"; }).map(function(s){
              var sdt = dateForGlobal(s.g);
              var when = sdt ? fmtDateShort(sdt) : ("Wk"+(s.wi+1)+" "+DAYS[s.di]);
              return '<option value="'+s.wi+'|'+s.di+'">'+when+' · '+sessionLabel(s.day)+'</option>';
            }).join("") +
          '</select><button data-editswap="'+k+'" data-editswapwi="'+currentWeek+'" data-editswapdi="'+di+'">Swap</button></div>'+
        '</div>';
      }

      var actionsHtml = '<div class="actions">'+
        '<button class="'+(status==="done"?"on":"")+'" data-act="done">'+"Done"+'</button>'+
        '<button class="'+(status==="modified"?"mod-on":"")+'" data-act="modified">'+"Modified"+'</button>'+
        '<button class="'+(status==="skipped"?"skip-on":"")+'" data-act="skip">'+(status==="skipped"?"Skipped":"Skip")+'</button>'+
        (status ? '<button class="undo" data-act="undo">Undo</button>' : '') +
        '</div>';

      var rescheduleHtml = "";
      if(rescheduleOpenKey === k){
        var cands = findCandidates(currentWeek, di);
        rescheduleHtml = '<div class="reschedule"><h4>Best days to fit this in</h4>';
        if(cands.length===0){
          rescheduleHtml += '<div class="no-cand">No open rest day in the next 9 days — safest bet is to just let it go and pick the plan back up as scheduled.</div>';
        } else {
          cands.forEach(function(c, idx){
            var cdt = dateForGlobal(c.s.g);
            var when = cdt ? fmtDateShort(cdt)+" · "+DAYS[c.s.di] : "Week "+(c.s.wi+1)+" "+DAYS[c.s.di];
            rescheduleHtml += '<div class="cand"><div class="info"><div class="when">'+when+'</div><div class="why">'+c.why+'</div></div>'+
              '<button data-move-to="'+c.s.key+'" data-move-from="'+k+'">Move here</button></div>';
          });
        }
        rescheduleHtml += '<div class="manual-picker"><button class="mp-toggle" data-mptoggle="1">'+(manualPickerOpenKey===k ? "Hide day picker" : "Pick a different day instead")+'</button>';
        if(manualPickerOpenKey === k){
          var maxG = Math.min(g+14, PLAN.length*7 - 1);
          if(state.startDate){
            var minDt = dateForGlobal(g+1), maxDt = dateForGlobal(maxG);
            rescheduleHtml += '<div class="mp-row"><input type="date" id="mp-date" min="'+isoDate(minDt)+'" max="'+isoDate(maxDt)+'" value="'+isoDate(minDt)+'">'+
              '<button data-manual-move="'+k+'" data-manual-g="'+g+'">Move here</button></div>';
          } else {
            var opts = "";
            for(var gg=g+1; gg<=maxG; gg++){
              var tf = keyFromGlobal(gg);
              opts += '<option value="'+gg+'">Week '+(tf.wi+1)+' · '+DAYS[tf.di]+'</option>';
            }
            rescheduleHtml += '<div class="mp-row"><select id="mp-select">'+opts+'</select>'+
              '<button data-manual-move="'+k+'" data-manual-g="'+g+'">Move here</button></div>';
          }
        }
        rescheduleHtml += '</div></div>';
      }

      inner.innerHTML = catLabelHtml + paceHtml + adviceHtml + statusHtml + logToggleHtml + logFormHtml + fuelHtml + strengthHtml + actionsHtml + editToggleHtml + editPanelHtml + rescheduleHtml;
      body.appendChild(inner);
      card.appendChild(body);
      wrap.appendChild(card);
      dayList.appendChild(wrap);

      // wire actions
      inner.querySelectorAll("[data-act]").forEach(function(btn){
        btn.onclick = function(e){
          e.stopPropagation();
          var act = btn.getAttribute("data-act");
          if(act==="done"){
            state.status[k] = state.status[k]==="done" ? null : "done";
            if(!state.status[k]){ delete state.status[k]; logOpenKey=null; } else { logOpenKey = k; }
            rescheduleOpenKey = null; manualPickerOpenKey = null;
            clearMakeupIfAny(k);
          } else if(act==="modified"){
            state.status[k] = state.status[k]==="modified" ? null : "modified";
            if(!state.status[k]){ delete state.status[k]; logOpenKey=null; } else { logOpenKey = k; }
            rescheduleOpenKey = null; manualPickerOpenKey = null;
            clearMakeupIfAny(k);
          } else if(act==="skip"){
            if(state.status[k]==="skipped"){
              state.status[k] = null; delete state.status[k];
              rescheduleOpenKey = null;
              clearMakeupIfAny(k);
            } else {
              state.status[k] = "skipped";
              rescheduleOpenKey = k; logOpenKey = null;
            }
          } else if(act==="undo"){
            delete state.status[k];
            rescheduleOpenKey = null; logOpenKey = null; manualPickerOpenKey = null; editOpenKey = null;
            clearMakeupIfAny(k);
          }
          saveState(); render();
        };
      });
      inner.querySelectorAll("[data-move-to]").forEach(function(btn){
        btn.onclick = function(e){
          e.stopPropagation();
          var toKey = btn.getAttribute("data-move-to");
          var fromKey = btn.getAttribute("data-move-from");
          var fromDay = PLAN[currentWeek].days[di];
          var fromDt = dateForGlobal(g);
          state.makeupOn[toKey] = {
            fromKey: fromKey,
            fromG: g,
            fromLabel: (fromDt? fmtDateShort(fromDt): (DAYS[di]+" Wk"+(currentWeek+1))),
            label: sessionLabel(fromDay)
          };
          rescheduleOpenKey = null; manualPickerOpenKey = null;
          saveState(); render();
        };
      });
      var mpToggle = inner.querySelector("[data-mptoggle]");
      if(mpToggle){
        mpToggle.onclick = function(e){
          e.stopPropagation();
          manualPickerOpenKey = (manualPickerOpenKey===k? null : k);
          render();
        };
      }
      var manualMoveBtn = inner.querySelector("[data-manual-move]");
      if(manualMoveBtn){
        manualMoveBtn.onclick = function(e){
          e.stopPropagation();
          var fromKey = manualMoveBtn.getAttribute("data-manual-move");
          var fromG = parseInt(manualMoveBtn.getAttribute("data-manual-g"), 10);
          var targetG;
          if(state.startDate){
            var dateInput = document.getElementById("mp-date");
            var chosen = new Date(dateInput.value+"T00:00:00");
            var start = new Date(state.startDate+"T00:00:00");
            targetG = daysBetween(start, chosen);
          } else {
            targetG = parseInt(document.getElementById("mp-select").value, 10);
          }
          if(isNaN(targetG) || targetG <= fromG || targetG >= PLAN.length*7){ return; }
          var tf = keyFromGlobal(targetG);
          if(PLAN[tf.wi].days[tf.di].cat === "race"){ alert("Can't schedule a make-up over race day — pick another day."); return; }
          var fromDay = PLAN[currentWeek].days[di];
          var fromDt = dateForGlobal(fromG);
          state.makeupOn[tf.key] = {
            fromKey: fromKey,
            fromG: fromG,
            fromLabel: (fromDt ? fmtDateShort(fromDt) : (DAYS[di]+" Wk"+(currentWeek+1))),
            label: sessionLabel(fromDay)
          };
          rescheduleOpenKey = null; manualPickerOpenKey = null;
          saveState(); render();
        };
      }
      var logToggleBtn = inner.querySelector("[data-logtoggle]");
      if(logToggleBtn){
        logToggleBtn.onclick = function(e){
          e.stopPropagation();
          logOpenKey = (logOpenKey===k? null : k);
          render();
          if(logOpenKey===k) scrollToCard(k);
        };
      }
      inner.querySelectorAll("[data-feel]").forEach(function(btn){
        btn.onclick = function(e){
          e.stopPropagation();
          inner.querySelectorAll("[data-feel]").forEach(function(b){ b.classList.remove("sel"); });
          btn.classList.add("sel");
          btn.setAttribute("data-selected","1");
        };
      });
      var saveLogBtn = inner.querySelector("[data-savelog]");
      if(saveLogBtn){
        saveLogBtn.onclick = function(e){
          e.stopPropagation();
          var kmVal = document.getElementById("lf-km").value;
          var timeVal = document.getElementById("lf-time").value;
          var noteVal = document.getElementById("lf-note").value;
          var feelBtn = inner.querySelector("[data-feel].sel");
          var feelVal = feelBtn ? feelBtn.getAttribute("data-feel") : (log && log.feel) || "";
          state.logs[k] = {km: kmVal, time: timeVal, feel: feelVal, note: noteVal};
          logOpenKey = null;
          saveState(); render();
        };
      }
      inner.querySelectorAll("[data-fuel]").forEach(function(cb){
        cb.onclick = function(e){ e.stopPropagation(); };
        cb.onchange = function(){
          if(!state.checklist[k]) state.checklist[k] = {};
          state.checklist[k][cb.getAttribute("data-fuel")] = cb.checked;
          saveState(); render();
        };
      });
      inner.querySelectorAll("[data-ex]").forEach(function(cb){
        cb.onclick = function(e){ e.stopPropagation(); };
        cb.onchange = function(){
          var id = cb.getAttribute("data-ex");
          if(!hasOwn(EXERCISE_BY_ID, id)) return;
          if(!state.strengthChecks[k]) state.strengthChecks[k] = {};
          state.strengthChecks[k][id] = cb.checked;
          saveState(); render();
        };
      });
      var editExBtn = inner.querySelector("[data-edit-exercises]");
      if(editExBtn) editExBtn.onclick = function(e){ e.stopPropagation(); openStrengthSettings(); };
      var editToggleBtn = inner.querySelector("[data-edittoggle]");
      if(editToggleBtn){
        editToggleBtn.onclick = function(e){
          e.stopPropagation();
          editOpenKey = (editOpenKey===k? null : k);
          render();
          if(editOpenKey===k) scrollToCard(k);
        };
      }
      var epCatSelect = inner.querySelector("#ep-cat");
      if(epCatSelect){
        epCatSelect.onclick = function(e){ e.stopPropagation(); };
        epCatSelect.onchange = function(){
          var epRow = epCatSelect.parentElement;
          epRow.querySelectorAll("input").forEach(function(i){ i.remove(); });
          if(DIST_CATS[epCatSelect.value]){
            var di2 = document.createElement("input");
            di2.type="number"; di2.step="0.5"; di2.min="0"; di2.id="ep-dist"; di2.placeholder="km";
            di2.value = day.dist || "";
            epRow.appendChild(di2);
          } else if(epCatSelect.value === "cycle"){
            var mi2 = document.createElement("input");
            mi2.type="number"; mi2.step="5"; mi2.min="0"; mi2.id="ep-mins"; mi2.placeholder="mins";
            mi2.value = day.mins || "";
            epRow.appendChild(mi2);
          }
        };
      }
      var epSaveBtn = inner.querySelector("[data-editsave]");
      if(epSaveBtn){
        epSaveBtn.onclick = function(e){
          e.stopPropagation();
          var newCat = document.getElementById("ep-cat").value;
          var distEl = document.getElementById("ep-dist");
          var minsEl = document.getElementById("ep-mins");
          var newDist = distEl ? parseFloat(distEl.value)||0 : undefined;
          var newMins = minsEl ? parseFloat(minsEl.value)||0 : undefined;
          var ewi = parseInt(epSaveBtn.getAttribute("data-editwi"),10), edi = parseInt(epSaveBtn.getAttribute("data-editdi"),10);
          applyDayEdit(ewi, edi, newCat, newDist, newMins);
          editOpenKey = null;
          saveState(); render();
        };
      }
      var epSwapBtn = inner.querySelector("[data-editswap]");
      if(epSwapBtn){
        epSwapBtn.onclick = function(e){
          e.stopPropagation();
          var target = document.getElementById("ep-swap-target").value.split("|");
          var twi = parseInt(target[0],10), tdi = parseInt(target[1],10);
          var ewi = parseInt(epSwapBtn.getAttribute("data-editswapwi"),10), edi = parseInt(epSwapBtn.getAttribute("data-editswapdi"),10);
          swapDays(k, ewi, edi, twi, tdi);
          editOpenKey = null;
          saveState(); render();
        };
      }
    });
  }

  function clearMakeupIfAny(k){
    Object.keys(state.makeupOn).forEach(function(mk){
      if(state.makeupOn[mk] && state.makeupOn[mk].fromKey === k) delete state.makeupOn[mk];
    });
  }

  function render(){
    var planLenLabel = document.getElementById("planLenLabel");
    if(planLenLabel) planLenLabel.textContent = PLAN.length + "-Week Roadmap";
    var goalTimeLabel = document.getElementById("goalTimeLabel");
    if(goalTimeLabel) goalTimeLabel.textContent = "Goal finish time — " + (RACE_DIST_LABELS[state.raceDistKey]||"Half Marathon") + " (h:mm:ss)";
    var sp = document.getElementById("setupPrompt");
    if(sp) sp.style.display = state.startDate ? "none" : "flex";
    renderOverall();
    renderRaceChip();
    renderDebtBadge();
    renderTaperBanner();
    renderNextUp();
    renderWeekRail();
    renderWeekHeader();
    renderDays();
    if(insightsPanel && insightsPanel.classList.contains("open")) renderInsights();
  }

  /* ================= SETTINGS ================= */
  var gearBtn = document.getElementById("gearBtn");
  var settingsPanel = document.getElementById("settingsPanel");
  var startDateInput = document.getElementById("startDate");
  var insightsBtn = document.getElementById("insightsBtn");
  var insightsPanel = document.getElementById("insightsPanel");
  var splitsBtn = document.getElementById("splitsBtn");
  var splitsPanel = document.getElementById("splitsPanel");
  if(state.startDate) startDateInput.value = state.startDate;

  var navPlanBtn = document.getElementById("navPlan");
  var sheetPairs = [[settingsPanel, gearBtn], [insightsPanel, insightsBtn], [splitsPanel, splitsBtn]];
  function updateTabs(){
    var anyOpen = false;
    sheetPairs.forEach(function(pair){
      var open = pair[0].classList.contains("open");
      pair[1].classList.toggle("active", open);
      if(open) anyOpen = true;
    });
    navPlanBtn.classList.toggle("active", !anyOpen);
    document.body.classList.toggle("sheet-open", anyOpen);
  }
  function closeOtherPanels(keep){
    [settingsPanel, insightsPanel, splitsPanel].forEach(function(p){ if(p !== keep) p.classList.remove("open"); });
    updateTabs();
  }
  function togglePanel(panel, onOpen){
    var willOpen = !panel.classList.contains("open");
    closeOtherPanels(willOpen ? panel : null);
    panel.classList.toggle("open", willOpen);
    if(willOpen){ panel.scrollTop = 0; if(onOpen) onOpen(); }
    updateTabs();
  }
  gearBtn.onclick = function(){ togglePanel(settingsPanel); };
  insightsBtn.onclick = function(){ togglePanel(insightsPanel, renderInsights); };
  splitsBtn.onclick = function(){ togglePanel(splitsPanel, renderSplits); };
  navPlanBtn.onclick = function(){ closeOtherPanels(null); };
  document.getElementById("setupPrompt").onclick = function(){
    closeOtherPanels(settingsPanel);
    settingsPanel.classList.add("open"); settingsPanel.scrollTop = 0; updateTabs();
    setTimeout(function(){ startDateInput.scrollIntoView({block:"center", behavior:"smooth"}); }, 380);
  };
  document.querySelectorAll("[data-close-sheet]").forEach(function(b){ b.onclick = function(){ closeOtherPanels(null); }; });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeOtherPanels(null); });
  document.getElementById("splitsToggle").querySelectorAll("[data-split-strategy]").forEach(function(btn){
    btn.onclick = function(){
      splitStrategy = btn.getAttribute("data-split-strategy");
      renderSplits();
    };
  });
  document.getElementById("splitsPrintBtn").onclick = function(){ window.print(); };

  startDateInput.onchange = function(){
    state.startDate = startDateInput.value || null;
    jumpToCurrentWeek();
    saveState(); render();
    centerActiveWeekChip();
    fetchWeatherForUpcoming();
  };

  var goalTimeInput = document.getElementById("goalTime");
  var goalPaceInput = document.getElementById("goalPace");
  function refreshGoalFields(){
    goalTimeInput.value = fmtHMS(state.goalTimeSec || 7200);
    goalPaceInput.value = fmtPace(goalPaceSecPerKm());
  }
  refreshGoalFields();
  goalTimeInput.onchange = function(){
    var sec = parseTimeToSec(goalTimeInput.value);
    if(!sec){ goalTimeInput.value = fmtHMS(state.goalTimeSec); return; }
    state.goalTimeSec = sec;
    refreshGoalFields();
    saveState(); render();
  };
  goalPaceInput.onchange = function(){
    var paceSec = parseTimeToSec(goalPaceInput.value); // "m:ss" per km — same parser as h:mm:ss handles this
    if(!paceSec){ refreshGoalFields(); return; }
    state.goalTimeSec = Math.round(paceSec * RACE_DIST);
    refreshGoalFields();
    saveState(); render();
  };

  document.getElementById("resetBtn").onclick = function(){
    if(confirm("Reset all logged progress? This can't be undone.")){
      state.status = {}; state.makeupOn = {}; state.logs = {}; state.checklist = {}; state.taperChecklist = {}; state.strengthChecks = {};
      saveState(); render();
    }
  };

  /* ---- Appearance (light / dark / system) ---- */
  function resolveTheme(){
    if(state.themePref === "light" || state.themePref === "dark") return state.themePref;
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
  }
  function applyTheme(){
    var t = resolveTheme();
    document.documentElement.setAttribute("data-theme", t);
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if(metaTheme) metaTheme.setAttribute("content", t==="light" ? "#F5F3EF" : "#12181B");
  }
  function renderThemeToggle(){
    themeToggle.querySelectorAll("[data-theme-opt]").forEach(function(btn){
      btn.classList.toggle("sel", btn.getAttribute("data-theme-opt") === (state.themePref||"system"));
    });
  }
  var themeToggle = document.getElementById("themeToggle");
  themeToggle.querySelectorAll("[data-theme-opt]").forEach(function(btn){
    btn.onclick = function(){
      state.themePref = btn.getAttribute("data-theme-opt");
      saveState(); applyTheme(); renderThemeToggle();
    };
  });
  renderThemeToggle();
  applyTheme();
  if(window.matchMedia){
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onSystemChange = function(){ if(state.themePref === "system" || !state.themePref) applyTheme(); };
    if(mq.addEventListener) mq.addEventListener("change", onSystemChange);
    else if(mq.addListener) mq.addListener(onSystemChange);
  }

  /* ---- Strength exercise picker ---- */
  var exFilter = "all";
  var exListEl = document.getElementById("exList"), exCountEl = document.getElementById("exCount"),
      exLoadsEl = document.getElementById("exLoads"), exHintEl = document.getElementById("exHint");
  var exHintTimer = null;
  function exHint(msg){
    exHintEl.textContent = msg || "";
    clearTimeout(exHintTimer);
    if(msg) exHintTimer = setTimeout(function(){ exHintEl.textContent = ""; }, 4000);
  }
  function togglePick(id){
    if(!hasOwn(EXERCISE_BY_ID, id)) return;
    var picks = currentPicks().slice(), i = picks.indexOf(id);
    if(i >= 0){
      if(picks.length <= 1){ exHint("Keep at least one exercise selected."); return; }
      picks.splice(i, 1);
    } else {
      if(picks.length >= MAX_PICKS){ exHint("You've already chosen " + MAX_PICKS + " — tap one to remove it first."); return; }
      picks.push(id);
    }
    exHint("");
    state.strengthPicks = picks;
    saveState(); renderExercisePicker(); render();
  }
  function renderExercisePicker(){
    var picks = currentPicks();
    var left = MAX_PICKS - picks.length;
    exCountEl.textContent = picks.length + " of " + MAX_PICKS + " chosen" + (left > 0 ? " — pick " + left + " more" : " — tap one to swap it");
    document.getElementById("exSummary").textContent = picks.map(function(id){ return EXERCISE_BY_ID[id].name; }).join(" · ");
    document.querySelectorAll("[data-ex-filter]").forEach(function(b){ b.classList.toggle("sel", b.getAttribute("data-ex-filter") === exFilter); });
    exListEl.innerHTML = EXERCISES.filter(function(ex){ return exFilter === "all" || ex.type === exFilter; }).map(function(ex){
      var sel = picks.indexOf(ex.id) >= 0;
      var full = !sel && picks.length >= MAX_PICKS;
      return '<button type="button" class="ex-item'+(sel?" sel":"")+(full?" full":"")+'" data-pick="'+escapeHtml(ex.id)+'" aria-pressed="'+(sel?"true":"false")+'">'+
        '<span class="ex-check">'+(sel ? ICON_SVG_OPEN.replace('stroke-width="2"','stroke-width="3"')+'<path d="M6 12.5l4 4 8-9"/></svg>' : '')+'</span>'+
        '<span class="ex-main"><b>'+escapeHtml(ex.name)+'</b><small>'+escapeHtml(ex.focus)+' · '+escapeHtml(ex.gear)+'</small></span>'+
        '<span class="ex-rx"><em class="ex-tag '+ex.type+'">'+(ex.type === "weights" ? "Weights" : "Bodyweight")+'</em><small>'+escapeHtml(ex.full)+'</small></span></button>';
    }).join("");
    exListEl.querySelectorAll("[data-pick]").forEach(function(b){ b.onclick = function(){ togglePick(b.getAttribute("data-pick")); }; });
    // working weights for the chosen weighted exercises
    var weighted = picks.filter(function(id){ return EXERCISE_BY_ID[id].type === "weights"; });
    exLoadsEl.innerHTML = weighted.length ? '<h5>Working weights</h5>' + weighted.map(function(id){
      var ex = EXERCISE_BY_ID[id], kg = state.strengthLoads[id];
      return '<label class="ex-load"><span>'+escapeHtml(ex.name)+'</span><span class="ex-load-in"><input type="number" inputmode="decimal" min="0" max="500" step="0.5" placeholder="—" data-load="'+escapeHtml(id)+'" value="'+(kg > 0 ? kg : "")+'"><em>kg</em></span></label>';
    }).join("") + '<div class="hint">Optional — shown on your strength days so you can see what to load. Update it as you get stronger.</div>' : "";
    exLoadsEl.querySelectorAll("[data-load]").forEach(function(inp){
      inp.onchange = function(){
        var id = inp.getAttribute("data-load");
        if(!hasOwn(EXERCISE_BY_ID, id)) return;
        var n = cleanNum(inp.value, 0, 500, 0);
        if(n > 0) state.strengthLoads[id] = Math.round(n*2)/2; else delete state.strengthLoads[id];
        inp.value = state.strengthLoads[id] || "";
        saveState(); render();
      };
    });
  }
  document.querySelectorAll("[data-ex-filter]").forEach(function(b){ b.onclick = function(){ exFilter = b.getAttribute("data-ex-filter"); renderExercisePicker(); }; });
  document.getElementById("exReset").onclick = function(){
    state.strengthPicks = []; exHint("");
    saveState(); renderExercisePicker(); render();
  };
  function openStrengthSettings(){
    closeOtherPanels(settingsPanel);
    settingsPanel.classList.add("open"); settingsPanel.scrollTop = 0; updateTabs();
    setTimeout(function(){ document.getElementById("strengthGroup").scrollIntoView({block:"start", behavior:"smooth"}); }, 380);
  }
  renderExercisePicker();

  /* ---- Weather (opt-in) ---- */
  var weatherToggle = document.getElementById("weatherToggle");
  weatherToggle.checked = !!state.weatherEnabled;
  weatherToggle.onchange = function(){
    state.weatherEnabled = weatherToggle.checked;
    if(!state.weatherEnabled) state.weatherCache = {};
    saveState(); renderDays();
    if(state.weatherEnabled) fetchWeatherForUpcoming();   // runs from a user tap, so the permission prompt has context
  };

  /* ---- Plan history / archive ---- */
  function statsForArchive(entry){
    var plan = entry.planData || [];
    var total=0;
    plan.forEach(function(week){ week.days.forEach(function(day){ if(day.cat!=="rest") total++; }); });
    var done=0;
    Object.keys(entry.status||{}).forEach(function(k){
      var st = entry.status[k];
      if(st==="done" || st==="modified") done++;
    });
    return {total:total, done:done, pct: total ? Math.round(done/total*100) : 0};
  }

  function archiveCurrentPlan(){
    var hasData = Object.keys(state.status||{}).length>0 || Object.keys(state.logs||{}).length>0;
    if(!hasData) return;
    var raceDay = null;
    (state.planData||PLAN).forEach(function(week){
      week.days.forEach(function(day){ if(day.cat==="race") raceDay = day; });
    });
    state.archive = state.archive || [];
    state.archive.unshift({
      id: "arc"+Date.now(),
      archivedAt: isoDate(new Date()),
      weeks: (state.planData||PLAN).length,
      raceDistKey: state.raceDistKey,
      goalTimeSec: state.goalTimeSec,
      startDate: state.startDate,
      planData: state.planData || PLAN,
      status: state.status,
      logs: state.logs,
      makeupOn: state.makeupOn,
      checklist: state.checklist,
      taperChecklist: state.taperChecklist,
      strengthChecks: state.strengthChecks
    });
    if(state.archive.length > 10) state.archive.length = 10; // keep it tidy
  }

  function renderArchiveList(){
    var wrap = document.getElementById("archiveList");
    if(!wrap) return;
    var list = state.archive || [];
    if(list.length===0){
      wrap.innerHTML = '<div class="hint">No past plans archived yet — starting a new plan will save this one here first.</div>';
      return;
    }
    wrap.innerHTML = list.map(function(entry){
      var stats = statsForArchive(entry);
      var distLabel = RACE_DIST_LABELS[entry.raceDistKey] || "Half Marathon";
      var raceDt = null;
      if(entry.startDate){
        var raceG = (entry.weeks-1)*7+6;
        var start = new Date(entry.startDate+"T00:00:00");
        raceDt = new Date(start.getTime()); raceDt.setDate(raceDt.getDate()+raceG);
      }
      return '<div class="archive-card" data-arc-id="'+escapeHtml(entry.id)+'">'+
        '<div class="ac-top"><span class="ac-title">'+entry.weeks+'-week · '+distLabel+'</span><span class="ac-pct">'+stats.pct+'%</span></div>'+
        '<div class="ac-sub">'+(raceDt ? "Race day "+fmtDate(raceDt) : "No start date set")+' · '+stats.done+'/'+stats.total+' sessions · archived '+escapeHtml(entry.archivedAt)+'</div>'+
        '<div class="ac-btns"><button data-arc-restore="'+escapeHtml(entry.id)+'">Restore</button><button class="danger" data-arc-delete="'+escapeHtml(entry.id)+'">Delete</button></div>'+
      '</div>';
    }).join("");
    wrap.querySelectorAll("[data-arc-restore]").forEach(function(btn){
      btn.onclick = function(){
        var id = btn.getAttribute("data-arc-restore");
        var idx = (state.archive||[]).findIndex(function(e){ return e.id===id; });
        if(idx<0) return;
        if(!confirm("Restore this plan? Your current plan will be archived first.")) return;
        var entry = state.archive[idx];
        state.archive.splice(idx,1);
        archiveCurrentPlan();
        state.planData = entry.planData; PLAN = entry.planData;
        state.raceDistKey = entry.raceDistKey || "half"; RACE_DIST = RACE_DISTANCES[state.raceDistKey];
        state.goalTimeSec = entry.goalTimeSec || 7200;
        state.startDate = entry.startDate;
        state.status = entry.status || {}; state.logs = entry.logs || {};
        state.makeupOn = entry.makeupOn || {}; state.checklist = entry.checklist || {};
        state.taperChecklist = entry.taperChecklist || {};
        state.strengthChecks = entry.strengthChecks || {};
        syncAfterStateLoad();
        saveState();
        showHint("Plan restored.");
      };
    });
    wrap.querySelectorAll("[data-arc-delete]").forEach(function(btn){
      btn.onclick = function(){
        var id = btn.getAttribute("data-arc-delete");
        if(!confirm("Delete this archived plan? This can't be undone.")) return;
        state.archive = (state.archive||[]).filter(function(e){ return e.id!==id; });
        saveState(); renderArchiveList();
      };
    });
  }

  /* ---- Shared state-sync (used after restoring a backup or an archived plan) ---- */
  function syncAfterStateLoad(){
    if(state.planData && Array.isArray(state.planData) && state.planData.length){ PLAN = state.planData; }
    else { PLAN = defaultPlan(); state.planData = PLAN; }
    if(!RACE_DISTANCES[state.raceDistKey]) state.raceDistKey = "half";
    RACE_DIST = RACE_DISTANCES[state.raceDistKey];
    buildWeekNotes();
    currentWeek = 0; openKey = null; rescheduleOpenKey = null; logOpenKey = null; manualPickerOpenKey = null; editOpenKey = null;
    if(startDateInput) startDateInput.value = state.startDate || "";
    if(goalTimeInput && goalPaceInput) refreshGoalFields();
    if(npDistSelect) npDistSelect.value = state.raceDistKey;
    if(npWeeksInput) npWeeksInput.value = PLAN.length;
    if(weatherToggle) weatherToggle.checked = !!state.weatherEnabled;
    if(typeof renderExercisePicker === "function" && exListEl) renderExercisePicker();
    applyTheme(); renderThemeToggle();
    render();
    renderArchiveList();
    fetchWeatherForUpcoming();
  }

  /* ---- Start a new plan ---- */
  var npWeeksInput = document.getElementById("npWeeks");
  var npRaceDateInput = document.getElementById("npRaceDate");
  var npDistSelect = document.getElementById("npDist");
  npWeeksInput.value = PLAN.length;
  npDistSelect.value = state.raceDistKey;
  document.getElementById("npGenerate").onclick = function(){
    var weeksVal = parseInt(npWeeksInput.value, 10);
    var raceVal = npRaceDateInput.value;
    var distKey = npDistSelect.value;
    if(!raceVal){ showHint("Pick a race day first."); return; }
    if(!weeksVal || weeksVal < 6 || weeksVal > 24){ showHint("Choose a plan length between 6 and 24 weeks."); return; }
    if(!confirm("Start a new "+weeksVal+"-week "+RACE_DIST_LABELS[distKey]+" plan for "+raceVal+"? Your current plan will be archived first.")) return;

    archiveCurrentPlan();

    PLAN = generatePlan(weeksVal, distKey);
    state.planData = PLAN;
    state.raceDistKey = distKey;
    RACE_DIST = RACE_DISTANCES[distKey];
    buildWeekNotes();
    var raceDt = new Date(raceVal+"T00:00:00");
    var raceG = (PLAN.length-1)*7 + 6;
    var startDt = new Date(raceDt.getTime());
    startDt.setDate(startDt.getDate() - raceG);
    state.startDate = isoDate(startDt);
    state.status = {}; state.makeupOn = {}; state.logs = {}; state.checklist = {}; state.taperChecklist = {}; state.strengthChecks = {}; state.weatherCache = {};
    currentWeek = 0; openKey = null; rescheduleOpenKey = null; logOpenKey = null; manualPickerOpenKey = null; editOpenKey = null;

    startDateInput.value = state.startDate;
    npWeeksInput.value = PLAN.length;
    refreshGoalFields();
    saveState(); render();
    renderArchiveList();
    fetchWeatherForUpcoming();
    showHint("New "+PLAN.length+"-week "+RACE_DIST_LABELS[distKey]+" plan set — race day "+fmtDate(raceDt)+", starting "+fmtDate(startDt)+".");
  };
  renderArchiveList();

  /* ---- Backup / Restore ---- */
  var backupHint = document.getElementById("backupHint");
  function showHint(msg){ backupHint.style.display="block"; backupHint.textContent = msg; }
  document.getElementById("backupBtn").onclick = function(){
    try{
      var blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var stamp = isoDate(new Date());
      a.href = url; a.download = "sub2h-tracker-backup-"+stamp+".json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
      showHint("Backup downloaded. Keep it somewhere safe — Import to restore on another device.");
    }catch(e){ showHint("Couldn't create the backup file on this device."); }
  };
  var restoreFile = document.getElementById("restoreFile");
  document.getElementById("restoreBtn").onclick = function(){ restoreFile.click(); };
  restoreFile.onchange = function(){
    var file = restoreFile.files && restoreFile.files[0];
    if(!file) return;
    if(file.size > MAX_IMPORT_BYTES){ showHint("That file is too large to be a backup."); restoreFile.value = ""; return; }
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var parsed = JSON.parse(reader.result);
        if(!isObj(parsed)) throw new Error("bad file");
        state = sanitizeState(parsed);   // untrusted input: rebuilt field-by-field, never merged raw
        syncAfterStateLoad();
        saveState();
        showHint("Progress restored from backup.");
      }catch(e){ showHint("That file didn't look like a valid backup."); }
      restoreFile.value = "";
    };
    reader.readAsText(file);
  };

  /* ---- Import from Strava (CSV/paste, no live connection) ---- */
  function parseCsvLine(line){
    // minimal CSV splitter that respects "quoted, fields"
    var out = [], cur = "", inQ = false;
    for(var i=0;i<line.length;i++){
      var c = line[i];
      if(inQ){
        if(c==='"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else inQ=false; }
        else cur += c;
      } else {
        if(c==='"') inQ = true;
        else if(c===','){ out.push(cur); cur=""; }
        else cur += c;
      }
    }
    out.push(cur);
    return out.map(function(s){ return s.trim(); });
  }

  function findCol(headers, candidates){
    for(var i=0;i<headers.length;i++){
      var h = headers[i].toLowerCase();
      for(var j=0;j<candidates.length;j++){
        if(h.indexOf(candidates[j]) >= 0) return i;
      }
    }
    return -1;
  }

  function parseStravaText(text, unit){
    var lines = text.split(/\r?\n/).map(function(l){ return l.trim(); }).filter(function(l){ return l.length; });
    if(!lines.length) return [];
    var rows = lines.map(parseCsvLine);
    var header = rows[0].map(function(h){ return h.toLowerCase(); });
    var looksLikeStravaExport = header.some(function(h){ return h.indexOf("activity date")>=0 || h.indexOf("activity type")>=0; });

    var activities = [];
    var unitFactor = unit==="mi" ? 1.60934 : (unit==="m" ? 0.001 : 1);

    if(looksLikeStravaExport){
      var dateCol = findCol(header, ["activity date"]);
      var typeCol = findCol(header, ["activity type"]);
      var distCol = findCol(header, ["distance"]);
      var timeCol = findCol(header, ["moving time","elapsed time"]);
      var nameCol = findCol(header, ["activity name","name"]);
      rows.slice(1).forEach(function(r){
        if(typeCol>=0 && r[typeCol] && r[typeCol].toLowerCase().indexOf("run")<0) return;
        var dt = dateCol>=0 ? new Date(r[dateCol]) : null;
        if(!dt || isNaN(dt.getTime())) return;
        var rawDist = distCol>=0 ? parseFloat(r[distCol]) : NaN;
        if(isNaN(rawDist)) return;
        // Strava's bulk-export "Distance" column is typically in meters regardless of the unit picker (raw export quirk)
        var km = rawDist > 300 ? rawDist/1000 : rawDist*unitFactor;
        var timeRaw = timeCol>=0 ? r[timeCol] : "";
        var sec = /^[0-9.]+$/.test(timeRaw) ? parseFloat(timeRaw) : parseTimeToSec(timeRaw);
        activities.push({date:dt, km:roundHalf(km), sec:sec||null, name: nameCol>=0 ? r[nameCol] : "Run"});
      });
    } else {
      // Simple format: date, distance, time[, type]
      rows.forEach(function(r){
        if(r.length < 2) return;
        var dt = new Date(r[0]);
        if(isNaN(dt.getTime())) return;
        var km = parseFloat(r[1]);
        if(isNaN(km)) return;
        km = km * unitFactor;
        var sec = r[2] ? (/^[0-9.]+$/.test(r[2]) ? parseFloat(r[2]) : parseTimeToSec(r[2])) : null;
        activities.push({date:dt, km:roundHalf(km), sec:sec, name:"Run"});
      });
    }
    return activities;
  }

  function fmtDuration(sec){
    sec = Math.max(0, Math.round(sec));
    return sec < 3600 ? fmtPace(sec) : fmtHMS(sec);
  }

  var stravaMatches = [];
  var FUZZY_MAX_DAYS = 3; // how many days off a session can be and still be considered
  function matchStravaActivities(activities){
    if(!state.startDate) return activities.map(function(a){ return {activity:a, session:null, include:false}; });

    var candidates = allSessions().filter(function(s){ return s.day.cat!=="rest" && s.day.dist; }).map(function(s){
      return {s:s, dt:dateForGlobal(s.g)};
    }).filter(function(c){ return c.dt; });

    var byDate = {};
    candidates.forEach(function(c){ byDate[isoDate(c.dt)] = c; });

    var results = activities.map(function(a){ return {activity:a, session:null, include:false, matchType:null, dayDiff:0}; });
    var usedSessionKeys = {};

    // Pass 1 — exact date match
    results.forEach(function(r){
      var c = byDate[isoDate(r.activity.date)];
      if(c && !usedSessionKeys[c.s.key]){
        r.session = c.s; r.include = true; r.matchType = "exact"; r.dayDiff = 0;
        usedSessionKeys[c.s.key] = true;
      }
    });

    // Pass 2 — fuzzy match on remaining activities: nearby date + similar distance, greedy best-score-first
    var pairs = [];
    results.forEach(function(r, ri){
      if(r.session) return;
      candidates.forEach(function(c){
        if(usedSessionKeys[c.s.key]) return;
        var dayDiff = Math.abs(daysBetween(c.dt, r.activity.date));
        if(dayDiff===0 || dayDiff > FUZZY_MAX_DAYS) return; // dayDiff 0 already handled (or conflicted) in pass 1
        var planned = c.s.day.dist;
        var distDiff = Math.abs(planned - r.activity.km);
        var tolerance = Math.max(2, planned*0.4);
        if(distDiff > tolerance) return;
        var score = dayDiff + (distDiff/Math.max(planned,1))*3;
        pairs.push({ri:ri, c:c, score:score, dayDiff:dayDiff, distDiff:distDiff});
      });
    });
    pairs.sort(function(a,b){ return a.score-b.score; });
    pairs.forEach(function(p){
      var r = results[p.ri];
      if(r.session || usedSessionKeys[p.c.s.key]) return; // already claimed by a better-scoring pair
      r.session = p.c.s; r.include = true; r.matchType = "fuzzy"; r.dayDiff = p.dayDiff;
      usedSessionKeys[p.c.s.key] = true;
    });

    return results;
  }

  function renderStravaPreview(){
    var wrap = document.getElementById("stravaPreviewWrap");
    if(!stravaMatches.length){ wrap.innerHTML = ""; return; }
    if(!state.startDate){
      wrap.innerHTML = '<div class="hint">Set your Week 1 start date first — matching needs real calendar dates.</div>';
      return;
    }
    var matchedCount = stravaMatches.filter(function(m){ return m.session; }).length;
    var html = '<table class="strava-preview"><thead><tr><th></th><th>Date</th><th>Activity</th><th>Matches</th></tr></thead><tbody>';
    stravaMatches.forEach(function(m, idx){
      var dateTxt = fmtDateShort(m.activity.date);
      var actTxt = m.activity.km + ' km' + (m.activity.sec ? ' in ' + fmtDuration(m.activity.sec) : '');
      var matchTxt = "No matching session";
      if(m.session){
        matchTxt = sessionLabel(m.session.day);
        if(m.matchType==="fuzzy"){
          matchTxt += ' <span class="fuzzy-tag">~'+m.dayDiff+'d off, '+m.session.day.dist+'km planned</span>';
        }
      }
      html += '<tr>'+
        '<td>'+(m.session ? '<input type="checkbox" data-strava-idx="'+idx+'" '+(m.include?"checked":"")+'>' : '')+'</td>'+
        '<td>'+dateTxt+'</td><td>'+actTxt+'</td>'+
        '<td class="'+(m.session?"":"unmatched")+'">'+matchTxt+'</td>'+
      '</tr>';
    });
    html += '</tbody></table>';
    if(matchedCount>0) html += '<div class="hint" style="margin-top:8px;">Exact-date matches are checked automatically; fuzzy matches (nearby date, similar distance) are flagged and checked too — review before pairing.</div>';
    if(matchedCount>0) html += '<button class="strava-apply-btn" id="stravaApplyBtn">Pair '+matchedCount+' matched run'+(matchedCount===1?"":"s")+'</button>';
    wrap.innerHTML = html;
    wrap.querySelectorAll("[data-strava-idx]").forEach(function(cb){
      cb.onchange = function(){ stravaMatches[parseInt(cb.getAttribute("data-strava-idx"),10)].include = cb.checked; };
    });
    var applyBtn = document.getElementById("stravaApplyBtn");
    if(applyBtn){
      applyBtn.onclick = function(){
        var n = 0;
        stravaMatches.forEach(function(m){
          if(!m.session || !m.include) return;
          var k = m.session.key;
          var prevLog = state.logs[k] || {};
          state.logs[k] = {
            km: m.activity.km,
            time: m.activity.sec ? fmtDuration(m.activity.sec) : (prevLog.time||""),
            feel: prevLog.feel || "",
            note: prevLog.note ? prevLog.note + " (Strava import)" : "Imported from Strava"
          };
          state.status[k] = "done";
          n++;
        });
        saveState(); render();
        showHint("Paired "+n+" run"+(n===1?"":"s")+" from Strava.");
        stravaMatches = [];
        document.getElementById("stravaPreviewWrap").innerHTML = "";
        document.getElementById("stravaPaste").value = "";
      };
    }
  }

  document.getElementById("stravaPreviewBtn").onclick = function(){
    var text = document.getElementById("stravaPaste").value;
    if(!text.trim()){ showHint("Paste some activity data first, or upload a CSV."); return; }
    if(text.length > MAX_IMPORT_BYTES){ showHint("That's too much data to import at once — try a smaller date range."); return; }
    var unit = document.getElementById("stravaUnit").value;
    var activities = parseStravaText(text, unit);
    if(!activities.length){ showHint("Couldn't find any runs in that data — check the format and try again."); return; }
    stravaMatches = matchStravaActivities(activities);
    renderStravaPreview();
  };
  var stravaFileInput = document.getElementById("stravaFile");
  document.getElementById("stravaFileBtn").onclick = function(){ stravaFileInput.click(); };
  stravaFileInput.onchange = function(){
    var file = stravaFileInput.files && stravaFileInput.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      document.getElementById("stravaPaste").value = reader.result;
      stravaFileInput.value = "";
    };
    reader.readAsText(file);
  };

  /* ---- Calendar export (.ics) ---- */
  function icsEscape(s){
    return String(s||"").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n|\r/g, "\\n");
  }
  function icsDate(dt){
    var y=dt.getFullYear(), m=("0"+(dt.getMonth()+1)).slice(-2), day=("0"+dt.getDate()).slice(-2);
    return y+m+day;
  }
  document.getElementById("icsBtn").onclick = function(){
    if(!state.startDate){ showHint("Set your Week 1 start date first — the calendar needs real dates."); return; }
    var lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Sub2H Tracker//EN","CALSCALE:GREGORIAN"];
    allSessions().forEach(function(s){
      if(s.day.cat === "rest") return;
      var dt = dateForGlobal(s.g);
      if(!dt) return;
      var endDt = new Date(dt.getTime()); endDt.setDate(endDt.getDate()+1);
      var p = paceRangeFor(s.day.cat);
      var descBits = [ADVICE[s.day.cat] || ""];
      if(p) descBits.push("Pace target: "+p.text);
      lines.push("BEGIN:VEVENT");
      lines.push("UID:"+s.key+"-sub2h@tracker");
      lines.push("DTSTART;VALUE=DATE:"+icsDate(dt));
      lines.push("DTEND;VALUE=DATE:"+icsDate(endDt));
      lines.push("SUMMARY:"+icsEscape(sessionLabel(s.day)+" — "+CAT_META[s.day.cat].label));
      lines.push("DESCRIPTION:"+icsEscape(descBits.join("\n\n")));
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    try{
      var blob = new Blob([lines.join("\r\n")], {type:"text/calendar"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "sub2h-training-plan.ics";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
      showHint("Calendar file downloaded — import it into Google/Apple/Outlook calendar.");
    }catch(e){ showHint("Couldn't create the calendar file on this device."); }
  };

  /* ---- Shareable summary / report ---- */
  function buildSummaryText(){
    var stats = computeStats();
    var streaks = computeStreaks();
    var pct = last4WeeksPct();
    var proj = computeProjection();
    var distLabel = RACE_DIST_LABELS[state.raceDistKey] || "Half Marathon";
    var lines = [
      "🏃 " + distLabel + " training — " + PLAN.length + "-week plan",
      stats.done + "/" + stats.total + " sessions done (" + stats.kmDone + " km logged), " + stats.skipped + " skipped",
      "Current streak: " + streaks.current + " · Best streak: " + streaks.best,
    ];
    if(pct!=null) lines.push("Last 4 weeks: " + pct + "% completed");
    if(proj){
      var behind = proj.diffSec > 0;
      lines.push("Projected finish: " + fmtHMS(proj.predictedSec) + " (" + (behind?"+":"-") + fmtHMS(Math.abs(proj.diffSec)).replace(/^0:/,"") + " vs " + fmtHMS(state.goalTimeSec||7200) + " goal)");
    }
    var raceG = raceGlobalIndex();
    if(state.startDate && raceG!=null){
      var raceDt = dateForGlobal(raceG);
      var daysLeft = daysBetween(todayDate(), raceDt);
      lines.push("Race day: " + fmtDate(raceDt) + (daysLeft>=0 ? " (" + daysLeft + " days to go)" : ""));
    }
    return lines.join("\n");
  }

  document.getElementById("copySummaryBtn").onclick = function(){
    var text = buildSummaryText();
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){
        showHint("Summary copied — paste it anywhere.");
      }).catch(function(){ showHint("Couldn't copy automatically — select and copy manually:\n\n"+text); });
    } else {
      showHint("Clipboard isn't available here — here's the summary:\n\n"+text);
    }
  };

  document.getElementById("reportBtn").onclick = function(){
    try{
      var stats = computeStats();
      var streaks = computeStreaks();
      var weekly = weeklyMileage();
      var distLabel = RACE_DIST_LABELS[state.raceDistKey] || "Half Marathon";
      var rows = weekly.map(function(w){
        return "<tr><td>Week "+(w.wi+1)+"</td><td>"+w.planned+" km</td><td>"+w.actual+" km</td></tr>";
      }).join("");
      var html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta http-equiv='Content-Security-Policy' content=\"default-src 'none'; style-src 'unsafe-inline'\"><title>Training report</title>"+
        "<style>body{font-family:-apple-system,Arial,sans-serif;background:#F5F3EF;color:#1C2420;padding:24px;max-width:640px;margin:0 auto;}"+
        "h1{font-size:20px;} .stats{display:flex;gap:10px;margin:16px 0;flex-wrap:wrap;} .stat{background:#fff;border:1px solid #ddd;border-radius:10px;padding:10px 14px;flex:1;min-width:120px;}"+
        ".stat b{display:block;font-size:20px;} table{width:100%;border-collapse:collapse;margin-top:16px;} td,th{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:13px;}"+
        "</style></head><body>"+
        "<h1>🏃 "+distLabel+" training report</h1>"+
        "<div>Generated "+fmtDate(new Date())+"</div>"+
        "<div class='stats'>"+
          "<div class='stat'><b>"+stats.done+"/"+stats.total+"</b>sessions done</div>"+
          "<div class='stat'><b>"+stats.kmDone+" km</b>logged</div>"+
          "<div class='stat'><b>"+streaks.current+"</b>current streak</div>"+
          "<div class='stat'><b>"+streaks.best+"</b>best streak</div>"+
        "</div>"+
        "<table><thead><tr><th>Week</th><th>Planned</th><th>Actual</th></tr></thead><tbody>"+rows+"</tbody></table>"+
        "</body></html>";
      var blob = new Blob([html], {type:"text/html"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "sub2h-training-report.html";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
      showHint("Report downloaded — a static page you can open, print or send.");
    }catch(e){ showHint("Couldn't build the report on this device."); }
  };

  /* ================= WEATHER ================= */
  function weatherCodeIcon(code){ return WCODE[code] || "🌡️"; }

  function fetchWeatherForUpcoming(){
    if(!state.weatherEnabled || !state.startDate || !navigator.geolocation) return; // off unless the user opted in
    var today = todayDate();
    var horizon = new Date(today.getTime()); horizon.setDate(horizon.getDate()+16);
    var anyNeeded = allSessions().some(function(s){
      if(s.day.cat === "rest") return false;
      var dt = dateForGlobal(s.g);
      if(!dt || dt < today || dt > horizon) return false;
      var iso = isoDate(dt);
      return !state.weatherCache[iso];
    });
    if(!anyNeeded) return;
    navigator.geolocation.getCurrentPosition(function(pos){
      // Round to 2 decimals (~1 km): plenty for a forecast, and we never send a precise location
      var lat = Math.round(pos.coords.latitude*100)/100, lon = Math.round(pos.coords.longitude*100)/100;
      if(!isFinite(lat) || !isFinite(lon)) return;
      var url = "https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+
        "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max"+
        "&forecast_days=16&timezone=auto";
      fetch(url, {credentials:"omit", referrerPolicy:"no-referrer"}).then(function(r){
        if(!r.ok) throw new Error("weather http " + r.status);
        return r.json();
      }).then(function(data){
        if(!data || !isObj(data.daily) || !Array.isArray(data.daily.time)) return;
        var d = data.daily, fresh = {};
        for(var i=0; i<Math.min(d.time.length, 16); i++){
          if(typeof d.time[i] !== "string") continue;
          fresh[d.time[i]] = {code:d.weathercode && d.weathercode[i], tmax:d.temperature_2m_max && d.temperature_2m_max[i],
                              tmin:d.temperature_2m_min && d.temperature_2m_min[i], pop:d.precipitation_probability_max && d.precipitation_probability_max[i]};
        }
        state.weatherCache = cleanWeather(fresh);   // third-party data is validated like any other input
        saveState(); renderDays();
      }).catch(function(){ /* silently ignore — weather is a nice-to-have */ });
    }, function(){ /* permission denied — silently skip */ }, {timeout:8000});
  }

  /* ================= PWA ================= */
  // The manifest is a static file linked from index.html. The service worker is sw.js (same origin).
  function registerServiceWorker(){
    if(!("serviceWorker" in navigator)) return;
    if(location.protocol !== "https:" && location.hostname !== "localhost") return;
    window.addEventListener("load", function(){
      navigator.serviceWorker.register("sw.js").catch(function(){ /* offline mode unavailable here; the app still works */ });
    });
  }

  /* ================= INIT ================= */
  jumpToCurrentWeek();
  render();
  centerActiveWeekChip();
  registerServiceWorker();
  fetchWeatherForUpcoming();
})();
