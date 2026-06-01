const form = document.getElementById('carQuiz');
const steps = [...document.querySelectorAll('.quiz-step')];
const stepLabel = document.getElementById('stepLabel');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');
const priorityChips = document.getElementById('priorityChips');
const priorityNote = document.getElementById('priorityNote');
const resultsPanel = document.getElementById('resultsPanel');
const matchList = document.getElementById('matchList');
const openBooking = document.getElementById('openBooking');
const bookingModal = document.getElementById('bookingModal');
const closeBooking = document.getElementById('closeBooking');
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const downloadReport = document.getElementById('downloadReport');
const reportPreview = document.getElementById('reportPreview');
const reportText = document.getElementById('reportText');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');

let currentStep = 0;

const categories = {
  compactSedan: { label: 'Compact sedan', reason: 'Best when low cost, fuel economy, easy parking, and reliability matter most.' },
  hybridSedan: { label: 'Hybrid sedan', reason: 'Strong fit for longer commutes, fuel savings, and lower running costs.' },
  smallSUV: { label: 'Small SUV / crossover', reason: 'Good middle ground for visibility, cargo space, weather, and daily usability.' },
  midsizeSUV: { label: 'Midsize SUV', reason: 'Best when you need more passenger room, cargo space, comfort, or family flexibility.' },
  truck: { label: 'Truck / utility vehicle', reason: 'Makes sense for towing, hauling, work use, rougher access roads, or heavy gear.' },
  evHybrid: { label: 'EV or plug-in hybrid', reason: 'Worth considering if you have charging access and care about efficiency or newer tech.' },
  premium: { label: 'Premium comfort vehicle', reason: 'Fits buyers who value quietness, interior feel, design, comfort, or brand image.' },
  performance: { label: 'Sporty compact or performance car', reason: 'Best if driving feel, acceleration, handling, and personality matter more than pure practicality.' }
};

const budgetLabels = {
  veryLow: 'Under $10,000',
  low: '$10,000 to $20,000',
  mediumLow: '$20,000 to $35,000',
  medium: '$35,000 to $50,000',
  high: '$50,000 to $70,000',
  luxury: '$70,000+',
  unsure: 'Not sure yet'
};

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}

function getValue(name) {
  const field = form.querySelector(`[name="${name}"]`);
  return field ? field.value : '';
}

function getText(name) {
  const field = form.querySelector(`[name="${name}"]`);
  return field ? field.value.toLowerCase().trim() : '';
}

function add(scores, key, amount) {
  scores[key] += amount;
}

function textIncludes(text, words) {
  return words.some(word => text.includes(word));
}

function readableText(name, fallback = 'Not specified') {
  const raw = form.querySelector(`[name="${name}"]`)?.value?.trim();
  return raw || fallback;
}

function budgetWindowText() {
  const ranges = getCheckedValues('budgetRange');
  if (!ranges.length) return 'Not specified';
  if (ranges.includes('unsure')) return 'Needs budget guidance';
  return ranges.map(range => budgetLabels[range]).join(', ');
}

function brandNotesText() {
  const liked = readableText('brandsLiked', '');
  const avoided = readableText('brandsAvoided', '');
  const chips = getCheckedValues('brandSignal');
  if (!liked && !avoided && !chips.length) return 'No strong preference';
  if (liked && avoided) return `Likes: ${liked.slice(0, 46)} · Avoids: ${avoided.slice(0, 36)}`;
  if (liked) return `Likes: ${liked.slice(0, 64)}`;
  if (avoided) return `Avoids: ${avoided.slice(0, 64)}`;
  return chips.map(v => ({
    toyotaHonda: 'Reliability-focused',
    subaruMazda: 'Practical but nicer',
    american: 'American brands',
    luxury: 'Luxury brands',
    evBrands: 'EV-focused',
    noPreference: 'No strong preference'
  }[v])).join(', ');
}

function updateStep() {
  steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));

  const percent = Math.round(((currentStep + 1) / steps.length) * 100);
  stepLabel.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;

  prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.classList.toggle('hidden', currentStep === steps.length - 1);
  submitBtn.classList.toggle('hidden', currentStep !== steps.length - 1);
}

function scoreFromAnswers() {
  const scores = {
    compactSedan: 32,
    hybridSedan: 30,
    smallSUV: 30,
    midsizeSUV: 24,
    truck: 12,
    evHybrid: 12,
    premium: 12,
    performance: 10
  };

  const lifestyle = getCheckedValues('lifestyle');
  const likedText = getText('likedText');
  const dislikedText = getText('dislikedText');
  const extraContext = getText('extraContext');
  const allOpenText = `${likedText} ${dislikedText} ${extraContext} ${getText('brandsLiked')} ${getText('brandsAvoided')}`;
  const commute = getValue('commuteDistance');
  const driveMix = getValue('driveMix');
  const drivingStyle = getValue('drivingStyle');
  const annualMiles = getValue('annualMiles');
  const parking = getValue('parkingSituation');
  const budgetRanges = getCheckedValues('budgetRange');
  const usedOpen = getValue('usedOpen');
  const priorities = getCheckedValues('priority');
  const needs = getCheckedValues('needs');
  const personality = getValue('personality');
  const brandSignals = getCheckedValues('brandSignal');

  lifestyle.forEach(item => {
    if (item === 'commuter') { add(scores, 'compactSedan', 16); add(scores, 'hybridSedan', 18); }
    if (item === 'student') { add(scores, 'compactSedan', 20); add(scores, 'smallSUV', 6); }
    if (item === 'family') { add(scores, 'midsizeSUV', 24); add(scores, 'smallSUV', 15); }
    if (item === 'adventure') { add(scores, 'smallSUV', 22); add(scores, 'midsizeSUV', 16); add(scores, 'truck', 8); }
    if (item === 'city') { add(scores, 'compactSedan', 20); add(scores, 'hybridSedan', 10); }
    if (item === 'roadtrip') { add(scores, 'midsizeSUV', 16); add(scores, 'hybridSedan', 10); add(scores, 'premium', 8); }
    if (item === 'work') { add(scores, 'truck', 26); add(scores, 'midsizeSUV', 8); }
    if (item === 'firstCar') { add(scores, 'compactSedan', 18); add(scores, 'smallSUV', 8); }
    if (item === 'eco') { add(scores, 'hybridSedan', 20); add(scores, 'evHybrid', 20); }
  });

  if (textIncludes(allOpenText, ['reliable', 'dependable', 'never broke', 'cheap to maintain', 'low maintenance'])) {
    add(scores, 'compactSedan', 16); add(scores, 'hybridSedan', 10);
  }
  if (textIncludes(allOpenText, ['gas mileage', 'mpg', 'fuel', 'efficient'])) {
    add(scores, 'hybridSedan', 18); add(scores, 'compactSedan', 10); add(scores, 'evHybrid', 8);
  }
  if (textIncludes(allOpenText, ['easy to park', 'small', 'compact', 'not huge'])) add(scores, 'compactSedan', 16);
  if (textIncludes(allOpenText, ['comfortable', 'smooth', 'quiet', 'seats', 'luxury'])) {
    add(scores, 'premium', 14); add(scores, 'midsizeSUV', 8);
  }
  if (textIncludes(allOpenText, ['spacious', 'storage', 'cargo', 'room', 'dog crate', 'gear'])) {
    add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 14);
  }
  if (textIncludes(allOpenText, ['fun', 'fast', 'responsive', 'handling', 'sporty', 'slow', 'boring'])) {
    add(scores, 'performance', 22); add(scores, 'premium', 8);
  }
  if (textIncludes(allOpenText, ['visibility', 'sat higher', 'higher up', 'ride height', 'all-wheel', 'awd', '4wd', 'snow'])) {
    add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 12); add(scores, 'truck', 6);
  }
  if (textIncludes(allOpenText, ['professional', 'premium', 'client', 'nice interior'])) add(scores, 'premium', 16);

  if (textIncludes(dislikedText + ' ' + extraContext, ['too small', 'not enough storage', 'cramped'])) {
    add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 20);
  }
  if (textIncludes(dislikedText + ' ' + extraContext, ['too big', 'hard to park', 'huge car'])) {
    add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 8);
  }
  if (textIncludes(dislikedText + ' ' + extraContext, ['expensive repair', 'repairs', 'maintenance', 'broke'])) {
    add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 10);
  }
  if (textIncludes(dislikedText + ' ' + extraContext, ['outdated', 'tech', 'apple carplay', 'features'])) {
    add(scores, 'evHybrid', 14); add(scores, 'premium', 10);
  }

  if (commute === 'short') { add(scores, 'compactSedan', 8); add(scores, 'evHybrid', 8); }
  if (commute === 'medium') { add(scores, 'compactSedan', 10); add(scores, 'hybridSedan', 12); }
  if (commute === 'long') { add(scores, 'hybridSedan', 20); add(scores, 'premium', 8); }
  if (commute === 'veryLong') { add(scores, 'hybridSedan', 24); add(scores, 'evHybrid', 12); add(scores, 'premium', 10); }

  if (driveMix === 'city') { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 10); add(scores, 'evHybrid', 8); }
  if (driveMix === 'mixed') { add(scores, 'smallSUV', 10); add(scores, 'hybridSedan', 10); }
  if (driveMix === 'highway') { add(scores, 'hybridSedan', 14); add(scores, 'premium', 10); add(scores, 'midsizeSUV', 8); }

  if (drivingStyle === 'calm') { add(scores, 'compactSedan', 8); add(scores, 'hybridSedan', 8); }
  if (drivingStyle === 'steady') { add(scores, 'compactSedan', 8); add(scores, 'smallSUV', 8); }
  if (drivingStyle === 'spirited') { add(scores, 'performance', 14); add(scores, 'premium', 8); }
  if (drivingStyle === 'aggressive') { add(scores, 'performance', 26); add(scores, 'premium', 10); }

  if (annualMiles === 'high' || annualMiles === 'veryHigh') {
    add(scores, 'hybridSedan', 16); add(scores, 'compactSedan', 8);
  }

  if (parking === 'tight' || parking === 'street') {
    add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 8);
  }
  if (parking === 'garage' || parking === 'driveway') {
    add(scores, 'smallSUV', 8); add(scores, 'midsizeSUV', 6);
  }

  budgetRanges.forEach(budget => {
    if (['veryLow', 'low'].includes(budget)) {
      add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 7);
      scores.premium -= 8; scores.performance -= 6; scores.truck -= 4; scores.evHybrid -= 5;
    }
    if (budget === 'mediumLow') {
      add(scores, 'compactSedan', 12); add(scores, 'smallSUV', 14); add(scores, 'hybridSedan', 12);
    }
    if (budget === 'medium') {
      add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 14); add(scores, 'evHybrid', 8);
    }
    if (budget === 'high') {
      add(scores, 'midsizeSUV', 14); add(scores, 'premium', 16); add(scores, 'evHybrid', 14);
    }
    if (budget === 'luxury') {
      add(scores, 'premium', 30); add(scores, 'performance', 16); add(scores, 'evHybrid', 12);
    }
    if (budget === 'unsure') {
      add(scores, 'compactSedan', 10); add(scores, 'smallSUV', 8);
    }
  });

  if (usedOpen === 'usedOnly' || usedOpen === 'mostlyUsed') {
    add(scores, 'compactSedan', 12); add(scores, 'smallSUV', 8);
  }
  if (usedOpen === 'newOnly' || usedOpen === 'mostlyNew') {
    add(scores, 'evHybrid', 8); add(scores, 'premium', 8);
  }

  brandSignals.forEach(signal => {
    if (signal === 'toyotaHonda') { add(scores, 'compactSedan', 14); add(scores, 'hybridSedan', 12); add(scores, 'smallSUV', 8); }
    if (signal === 'subaruMazda') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 6); add(scores, 'premium', 5); }
    if (signal === 'american') { add(scores, 'truck', 10); add(scores, 'midsizeSUV', 8); }
    if (signal === 'luxury') { add(scores, 'premium', 18); add(scores, 'performance', 8); }
    if (signal === 'evBrands') { add(scores, 'evHybrid', 20); add(scores, 'premium', 6); }
  });

  priorities.forEach(priority => {
    if (priority === 'reliability') { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 12); }
    if (priority === 'gas') { add(scores, 'hybridSedan', 22); add(scores, 'evHybrid', 18); add(scores, 'compactSedan', 8); }
    if (priority === 'safety') { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 12); }
    if (priority === 'payment') { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 8); }
    if (priority === 'cargo') { add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 18); add(scores, 'truck', 8); }
    if (priority === 'comfort') { add(scores, 'premium', 18); add(scores, 'midsizeSUV', 10); }
    if (priority === 'tech') { add(scores, 'evHybrid', 18); add(scores, 'premium', 8); }
    if (priority === 'style') { add(scores, 'premium', 16); add(scores, 'performance', 10); }
    if (priority === 'performance') { add(scores, 'performance', 28); add(scores, 'premium', 8); }
    if (priority === 'resale') { add(scores, 'compactSedan', 10); add(scores, 'smallSUV', 10); }
    if (priority === 'maintenance') { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 8); }
    if (priority === 'visibility') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 10); }
    if (priority === 'awd') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 12); add(scores, 'truck', 8); }
    if (priority === 'easy') { add(scores, 'compactSedan', 14); add(scores, 'hybridSedan', 6); }
    if (priority === 'quiet') { add(scores, 'premium', 16); add(scores, 'evHybrid', 10); }
  });

  needs.forEach(need => {
    if (need === 'weather') { add(scores, 'smallSUV', 16); add(scores, 'midsizeSUV', 14); }
    if (need === 'gear') { add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 16); add(scores, 'truck', 8); }
    if (need === 'kids') { add(scores, 'midsizeSUV', 24); add(scores, 'smallSUV', 14); }
    if (need === 'pets') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 12); }
    if (need === 'trails') { add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 14); add(scores, 'truck', 10); }
    if (need === 'towing') { add(scores, 'truck', 30); add(scores, 'midsizeSUV', 10); }
    if (need === 'professional') { add(scores, 'premium', 16); add(scores, 'midsizeSUV', 8); }
    if (need === 'teen') { add(scores, 'compactSedan', 16); add(scores, 'smallSUV', 8); }
    if (need === 'elderly') { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 12); add(scores, 'premium', 8); }
    if (need === 'charging') { add(scores, 'evHybrid', 24); }
    if (need === 'rideshare') { add(scores, 'hybridSedan', 20); add(scores, 'compactSedan', 10); }
    if (need === 'weekendTrips') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 12); add(scores, 'premium', 8); }
  });

  if (personality === 'practical') { add(scores, 'compactSedan', 20); add(scores, 'hybridSedan', 12); }
  if (personality === 'comfort') { add(scores, 'premium', 22); add(scores, 'midsizeSUV', 10); }
  if (personality === 'adventure') { add(scores, 'smallSUV', 22); add(scores, 'midsizeSUV', 16); add(scores, 'truck', 8); }
  if (personality === 'tech') { add(scores, 'evHybrid', 24); add(scores, 'premium', 8); }
  if (personality === 'performance') { add(scores, 'performance', 30); add(scores, 'premium', 8); }
  if (personality === 'value') { add(scores, 'compactSedan', 20); add(scores, 'smallSUV', 10); }
  if (personality === 'safe') { add(scores, 'smallSUV', 16); add(scores, 'midsizeSUV', 14); add(scores, 'compactSedan', 8); }
  if (personality === 'simple') { add(scores, 'compactSedan', 22); add(scores, 'hybridSedan', 8); }

  return scores;
}

function calculateMatches() {
  const scores = scoreFromAnswers();
  return Object.entries(scores)
    .map(([key, score]) => ({ key, score: Math.max(1, score), ...categories[key] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item, index, arr) => {
      const max = arr[0].score || 1;
      return { ...item, percent: Math.max(62, Math.min(97, Math.round((item.score / max) * 94) - index * 2)) };
    });
}

function resultProfile(matches) {
  const top = matches[0].key;
  const priorities = getCheckedValues('priority');
  const personality = getValue('personality');

  if (top === 'truck') return ['Work-ready utility buyer', 'You seem to need capability, durability, and practical utility more than a basic commuter car.'];
  if (top === 'midsizeSUV') return ['Space and safety driver', 'Your answers point toward room, comfort, people-moving ability, and long-term practicality.'];
  if (top === 'smallSUV') return ['Versatile everyday driver', 'You likely want something easy to live with, but more flexible than a basic sedan.'];
  if (top === 'hybridSedan' || top === 'evHybrid') return ['Efficiency-focused buyer', 'Your profile leans toward lower running costs, better mileage, and modern ownership efficiency.'];
  if (top === 'premium') return ['Comfort-focused buyer', 'You seem to value ride quality, quietness, interior feel, and a more polished ownership experience.'];
  if (top === 'performance' || personality === 'performance' || priorities.includes('performance')) return ['Fun-to-drive buyer', 'You want a car with personality, responsiveness, and more driving feel than a purely practical option.'];
  return ['Practical commuter', 'You need something reliable, affordable, easy to own, and grounded in real daily use.'];
}

function consultantFor(matches) {
  const top = matches[0].key;
  if (top === 'evHybrid' || top === 'hybridSedan') return ['EV & Hybrid Specialist', 'Best for comparing gas, hybrid, plug-in hybrid, and EV options without getting buried in tech details.'];
  if (top === 'midsizeSUV' || top === 'smallSUV') return ['Family & Lifestyle Vehicle Specialist', 'Best for sorting through safety, cargo space, comfort, and long-term ownership tradeoffs.'];
  if (top === 'truck') return ['Truck & Utility Specialist', 'Best for figuring out towing, hauling, cab size, bed size, and whether you really need a truck.'];
  if (top === 'premium' || top === 'performance') return ['Performance & Premium Specialist', 'Best for balancing fun, comfort, brand image, reliability, and ownership cost.'];
  return ['Budget & Used Car Specialist', 'Best for narrowing down reliable models, used-car risks, and fair price ranges.'];
}

function level(score) {
  if (score >= 70) return ['High', '84%'];
  if (score >= 40) return ['Medium', '56%'];
  return ['Low', '24%'];
}

function updateLiveMeters() {
  const likedText = getText('likedText');
  const dislikedText = getText('dislikedText');
  const extraContext = getText('extraContext');
  const priorities = getCheckedValues('priority');
  const needs = getCheckedValues('needs');
  const budgetRanges = getCheckedValues('budgetRange');
  const commute = getValue('commuteDistance');
  const drivingStyle = getValue('drivingStyle');
  const lifestyle = getCheckedValues('lifestyle');

  let efficiency = 10;
  let space = 10;
  let budgetFocus = 10;
  let performance = 10;
  const combinedText = `${likedText} ${dislikedText} ${extraContext}`;

  if (priorities.includes('gas') || lifestyle.includes('eco')) efficiency += 45;
  if (['long', 'veryLong'].includes(commute)) efficiency += 30;
  if (textIncludes(combinedText, ['gas', 'fuel', 'mpg', 'efficient'])) efficiency += 20;

  if (priorities.includes('cargo') || needs.some(n => ['gear', 'kids', 'pets', 'towing', 'weekendTrips'].includes(n))) space += 50;
  if (textIncludes(combinedText, ['small', 'storage', 'spacious', 'cargo', 'room', 'dog'])) space += 30;

  if (budgetRanges.some(b => ['veryLow', 'low', 'mediumLow', 'unsure'].includes(b))) budgetFocus += 55;
  if (priorities.includes('payment') || priorities.includes('maintenance') || priorities.includes('reliability')) budgetFocus += 25;
  if (textIncludes(combinedText, ['expensive', 'repair', 'maintenance'])) budgetFocus += 20;

  if (priorities.includes('performance')) performance += 55;
  if (['spirited', 'aggressive'].includes(drivingStyle)) performance += 35;
  if (textIncludes(combinedText, ['fun', 'slow', 'boring', 'fast', 'responsive'])) performance += 25;

  const meters = [
    ['Efficiency', efficiency, 'meterEfficiency', 'meterEfficiencyBar'],
    ['Space', space, 'meterSpace', 'meterSpaceBar'],
    ['Budget', budgetFocus, 'meterBudget', 'meterBudgetBar'],
    ['Performance', performance, 'meterPerformance', 'meterPerformanceBar']
  ];

  meters.forEach(([, value, labelId, barId]) => {
    const [label, width] = level(value);
    document.getElementById(labelId).textContent = label;
    document.getElementById(barId).style.width = width;
  });

  const strongest = meters.sort((a, b) => b[1] - a[1])[0][0];
  const summaryText = {
    Efficiency: 'Your answers are leaning toward efficiency and lower running costs.',
    Space: 'Your answers suggest space, visibility, or flexibility may matter most.',
    Budget: 'Your answers are pointing toward a practical, cost-conscious recommendation.',
    Performance: 'Your answers show some interest in driving feel and responsiveness.'
  };
  document.getElementById('summaryMiniText').textContent = summaryText[strongest] || 'Answer a few questions to form your profile.';
}

function showResults(event) {
  event.preventDefault();

  const matches = calculateMatches();
  const [title, summary] = resultProfile(matches);
  const [consultantTitle, consultantText] = consultantFor(matches);

  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultSummary').textContent = summary;
  document.getElementById('topScore').textContent = `${matches[0].percent}%`;
  document.getElementById('consultantTitle').textContent = consultantTitle;
  document.getElementById('consultantTitleInline').textContent = consultantTitle;
  document.getElementById('consultantText').textContent = consultantText;
  document.getElementById('budgetWindow').textContent = budgetWindowText();
  document.getElementById('brandNotes').textContent = brandNotesText();

  matchList.innerHTML = matches.map(match => `
    <div class="match-row">
      <div class="match-row-top">
        <span>${match.label}</span>
        <span>${match.percent}%</span>
      </div>
      <div class="match-bar"><i style="width:${match.percent}%"></i></div>
      <small>${match.reason}</small>
    </div>
  `).join('');

  resultsPanel.classList.remove('hidden');
  resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

nextBtn.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    updateStep();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    updateStep();
  }
});

form.addEventListener('change', updateLiveMeters);
form.addEventListener('input', updateLiveMeters);
form.addEventListener('submit', showResults);

priorityChips.addEventListener('change', event => {
  const checked = [...priorityChips.querySelectorAll('input:checked')];
  if (checked.length > 5) event.target.checked = false;
  priorityNote.textContent = `${Math.min(getCheckedValues('priority').length, 5)} of 5 selected`;
  updateLiveMeters();
});

openBooking.addEventListener('click', () => bookingModal.classList.remove('hidden'));
closeBooking.addEventListener('click', () => bookingModal.classList.add('hidden'));
bookingModal.addEventListener('click', event => {
  if (event.target === bookingModal) bookingModal.classList.add('hidden');
});

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  bookingSuccess.classList.remove('hidden');
  bookingForm.reset();
});

downloadReport.addEventListener('click', () => {
  const matches = calculateMatches();
  const lastCar = readableText('lastCar', 'your previous vehicle');
  const liked = readableText('likedText', 'what you liked');
  const disliked = readableText('dislikedText', 'what you disliked');
  const extra = readableText('extraContext', 'no extra notes provided');
  const brandsLiked = readableText('brandsLiked', 'no preferred brands listed');
  const brandsAvoided = readableText('brandsAvoided', 'no avoided brands listed');

  reportText.textContent = `Based on your answers, your strongest fit is ${matches[0].label}, followed by ${matches[1].label} and ${matches[2].label}. Your budget window is: ${budgetWindowText()}. Since you mentioned ${lastCar}, the consultant would compare that past experience against your current needs. They would pay attention to what you liked, such as "${liked.slice(0, 110)}", what you disliked, such as "${disliked.slice(0, 110)}", your brand preferences, including "${brandsLiked.slice(0, 90)}", brands to avoid, including "${brandsAvoided.slice(0, 90)}", and your extra notes: "${extra.slice(0, 130)}".`;
  reportPreview.classList.remove('hidden');
});

mobileMenu.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.addEventListener('click', () => navLinks.classList.remove('open'));

updateStep();
updateLiveMeters();