const form = document.getElementById('carQuiz');
const steps = [...document.querySelectorAll('.quiz-step')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const stepLabel = document.getElementById('stepLabel');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const resultsPanel = document.getElementById('resultsPanel');
const matchList = document.getElementById('matchList');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');
const priorityChips = document.getElementById('priorityChips');
const priorityNote = document.getElementById('priorityNote');
const bookingModal = document.getElementById('bookingModal');
const openBooking = document.getElementById('openBooking');
const closeBooking = document.getElementById('closeBooking');
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const downloadReport = document.getElementById('downloadReport');
const reportPreview = document.getElementById('reportPreview');
const reportText = document.getElementById('reportText');

let currentStep = 0;

const categories = {
  compactSedan: {
    label: 'Compact Sedan',
    reason: 'Affordable, efficient, easy to park, and simple to own.',
    score: 20
  },
  hybridSedan: {
    label: 'Hybrid Sedan',
    reason: 'Best if fuel savings and low running costs matter a lot.',
    score: 18
  },
  smallSUV: {
    label: 'Small SUV',
    reason: 'More space and visibility without feeling huge or expensive.',
    score: 20
  },
  midsizeSUV: {
    label: 'Midsize SUV',
    reason: 'Strong fit for families, road trips, pets, and cargo needs.',
    score: 18
  },
  truck: {
    label: 'Truck',
    reason: 'Best for towing, hauling, job needs, and durability.',
    score: 8
  },
  evHybrid: {
    label: 'EV or Plug-in Hybrid',
    reason: 'Great for tech-focused drivers open to charging or high efficiency.',
    score: 12
  },
  luxury: {
    label: 'Entry Luxury Vehicle',
    reason: 'Best if comfort, styling, and driving feel matter more than lowest cost.',
    score: 8
  },
  performance: {
    label: 'Sporty Sedan or Hatchback',
    reason: 'Better fit if you want something fun, responsive, and stylish.',
    score: 8
  }
};

function updateStep() {
  steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
  const percent = Math.round(((currentStep + 1) / steps.length) * 100);
  stepLabel.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.classList.toggle('hidden', currentStep === steps.length - 1);
  submitBtn.classList.toggle('hidden', currentStep !== steps.length - 1);
  updateLiveMeters();
}

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}

function getValue(name) {
  const selected = form.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : '';
}

function add(scores, key, amount) {
  scores[key] = (scores[key] || 0) + amount;
}

function calculateScores() {
  const scores = Object.fromEntries(Object.keys(categories).map(key => [key, categories[key].score]));
  const lifestyles = getCheckedValues('lifestyle');
  const budget = getValue('budget');
  const used = getValue('used');
  const personality = getValue('personality');
  const liked = getCheckedValues('liked');
  const disliked = getCheckedValues('disliked');
  const priorities = getCheckedValues('priority');
  const needs = getCheckedValues('needs');

  lifestyles.forEach(lifestyle => {
    if (lifestyle === 'commuter') { add(scores, 'compactSedan', 25); add(scores, 'hybridSedan', 22); add(scores, 'smallSUV', 8); }
    if (lifestyle === 'student') { add(scores, 'compactSedan', 28); add(scores, 'hybridSedan', 12); add(scores, 'smallSUV', 8); }
    if (lifestyle === 'family') { add(scores, 'midsizeSUV', 28); add(scores, 'smallSUV', 20); add(scores, 'hybridSedan', 8); }
    if (lifestyle === 'adventure') { add(scores, 'smallSUV', 25); add(scores, 'midsizeSUV', 22); add(scores, 'truck', 12); }
    if (lifestyle === 'city') { add(scores, 'compactSedan', 25); add(scores, 'hybridSedan', 22); add(scores, 'evHybrid', 12); }
    if (lifestyle === 'work') { add(scores, 'truck', 35); add(scores, 'midsizeSUV', 14); }
    if (lifestyle === 'roadtrip') { add(scores, 'midsizeSUV', 22); add(scores, 'smallSUV', 16); add(scores, 'hybridSedan', 10); }
    if (lifestyle === 'firstCar') { add(scores, 'compactSedan', 24); add(scores, 'smallSUV', 10); add(scores, 'hybridSedan', 8); }
    if (lifestyle === 'luxury') { add(scores, 'luxury', 26); add(scores, 'midsizeSUV', 12); add(scores, 'performance', 8); }
    if (lifestyle === 'eco') { add(scores, 'evHybrid', 24); add(scores, 'hybridSedan', 22); add(scores, 'compactSedan', 8); }
  });

  if (budget === 'veryLow') { add(scores, 'compactSedan', 30); add(scores, 'hybridSedan', 6); }
  if (budget === 'low') { add(scores, 'compactSedan', 24); add(scores, 'hybridSedan', 8); }
  if (budget === 'mediumLow') { add(scores, 'compactSedan', 18); add(scores, 'smallSUV', 12); add(scores, 'hybridSedan', 12); }
  if (budget === 'medium') { add(scores, 'smallSUV', 16); add(scores, 'hybridSedan', 16); add(scores, 'midsizeSUV', 12); add(scores, 'evHybrid', 10); }
  if (budget === 'high') { add(scores, 'midsizeSUV', 15); add(scores, 'evHybrid', 15); add(scores, 'luxury', 18); add(scores, 'performance', 12); }
  if (budget === 'premium') { add(scores, 'luxury', 30); add(scores, 'evHybrid', 18); add(scores, 'performance', 16); }
  if (budget === 'monthly') { add(scores, 'compactSedan', 20); add(scores, 'hybridSedan', 12); add(scores, 'smallSUV', 8); }
  if (used === 'yes') { add(scores, 'compactSedan', 10); add(scores, 'smallSUV', 8); }
  if (used === 'certified') { add(scores, 'smallSUV', 10); add(scores, 'midsizeSUV', 8); add(scores, 'luxury', 6); }
  if (used === 'no') { add(scores, 'evHybrid', 8); add(scores, 'hybridSedan', 6); add(scores, 'luxury', 4); }

  if (liked.includes('reliable')) { add(scores, 'compactSedan', 14); add(scores, 'hybridSedan', 10); }
  if (liked.includes('gas')) { add(scores, 'hybridSedan', 18); add(scores, 'compactSedan', 12); add(scores, 'evHybrid', 10); }
  if (liked.includes('parking')) { add(scores, 'compactSedan', 14); add(scores, 'hybridSedan', 10); }
  if (liked.includes('comfort')) { add(scores, 'midsizeSUV', 10); add(scores, 'luxury', 14); }
  if (liked.includes('space')) { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 16); }
  if (liked.includes('fun')) { add(scores, 'performance', 22); add(scores, 'luxury', 8); }
  if (liked.includes('cheapMaintain')) { add(scores, 'compactSedan', 16); add(scores, 'hybridSedan', 8); }
  if (liked.includes('visibility')) { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 10); }
  if (liked.includes('tech')) { add(scores, 'evHybrid', 14); add(scores, 'luxury', 8); }
  if (liked.includes('awd')) { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 12); add(scores, 'truck', 6); }
  if (liked.includes('style')) { add(scores, 'luxury', 14); add(scores, 'performance', 10); }
  if (liked.includes('rideHeight')) { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 12); }

  if (disliked.includes('small')) { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 18); }
  if (disliked.includes('slow')) { add(scores, 'performance', 20); add(scores, 'luxury', 8); }
  if (disliked.includes('gasbad')) { add(scores, 'hybridSedan', 18); add(scores, 'evHybrid', 16); }
  if (disliked.includes('repair')) { add(scores, 'compactSedan', 14); add(scores, 'hybridSedan', 8); }
  if (disliked.includes('tech')) { add(scores, 'evHybrid', 16); add(scores, 'luxury', 8); }
  if (disliked.includes('unsafe')) { add(scores, 'smallSUV', 10); add(scores, 'midsizeSUV', 14); }
  if (disliked.includes('big')) { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 10); }
  if (disliked.includes('low')) { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 10); }
  if (disliked.includes('uncomfortable')) { add(scores, 'midsizeSUV', 12); add(scores, 'luxury', 16); }
  if (disliked.includes('old')) { add(scores, 'evHybrid', 14); add(scores, 'luxury', 8); }
  if (disliked.includes('boring')) { add(scores, 'performance', 22); add(scores, 'luxury', 8); }
  if (disliked.includes('storage')) { add(scores, 'smallSUV', 16); add(scores, 'midsizeSUV', 18); add(scores, 'truck', 8); }

  priorities.forEach(priority => {
    if (priority === 'reliability') { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 12); }
    if (priority === 'fuel') { add(scores, 'hybridSedan', 22); add(scores, 'evHybrid', 18); add(scores, 'compactSedan', 12); }
    if (priority === 'safety') { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 14); }
    if (priority === 'payment') { add(scores, 'compactSedan', 20); add(scores, 'hybridSedan', 8); }
    if (priority === 'cargo') { add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 18); add(scores, 'truck', 10); }
    if (priority === 'comfort') { add(scores, 'midsizeSUV', 10); add(scores, 'luxury', 20); }
    if (priority === 'tech') { add(scores, 'evHybrid', 20); add(scores, 'luxury', 10); }
    if (priority === 'style') { add(scores, 'luxury', 16); add(scores, 'performance', 12); }
    if (priority === 'performance') { add(scores, 'performance', 26); add(scores, 'luxury', 8); }
    if (priority === 'resale') { add(scores, 'compactSedan', 10); add(scores, 'smallSUV', 10); }
    if (priority === 'maintenance') { add(scores, 'compactSedan', 18); add(scores, 'hybridSedan', 10); }
    if (priority === 'visibility') { add(scores, 'smallSUV', 12); add(scores, 'midsizeSUV', 10); }
    if (priority === 'awd') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 12); add(scores, 'truck', 8); }
    if (priority === 'brand') { add(scores, 'luxury', 8); add(scores, 'smallSUV', 8); add(scores, 'compactSedan', 6); }
    if (priority === 'easy') { add(scores, 'compactSedan', 14); add(scores, 'smallSUV', 8); }
  });

  needs.forEach(need => {
    if (need === 'weather') { add(scores, 'smallSUV', 16); add(scores, 'midsizeSUV', 14); }
    if (need === 'gear') { add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 16); add(scores, 'truck', 8); }
    if (need === 'kids') { add(scores, 'midsizeSUV', 24); add(scores, 'smallSUV', 14); }
    if (need === 'pets') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 14); }
    if (need === 'commute') { add(scores, 'hybridSedan', 16); add(scores, 'compactSedan', 12); }
    if (need === 'parking') { add(scores, 'compactSedan', 16); add(scores, 'hybridSedan', 8); }
    if (need === 'trails') { add(scores, 'smallSUV', 18); add(scores, 'midsizeSUV', 14); add(scores, 'truck', 10); }
    if (need === 'towing') { add(scores, 'truck', 30); add(scores, 'midsizeSUV', 10); }
    if (need === 'camping') { add(scores, 'smallSUV', 14); add(scores, 'midsizeSUV', 18); add(scores, 'truck', 8); }
    if (need === 'professional') { add(scores, 'luxury', 14); add(scores, 'midsizeSUV', 8); }
    if (need === 'elderly') { add(scores, 'midsizeSUV', 12); add(scores, 'smallSUV', 10); add(scores, 'luxury', 8); }
    if (need === 'highway') { add(scores, 'hybridSedan', 12); add(scores, 'midsizeSUV', 10); add(scores, 'luxury', 8); }
    if (need === 'charging') { add(scores, 'evHybrid', 24); }
    if (need === 'teen') { add(scores, 'compactSedan', 16); add(scores, 'smallSUV', 10); }
    if (need === 'rideshare') { add(scores, 'hybridSedan', 18); add(scores, 'compactSedan', 12); }
  });

  if (personality === 'practical') { add(scores, 'compactSedan', 20); add(scores, 'hybridSedan', 14); }
  if (personality === 'comfort') { add(scores, 'luxury', 20); add(scores, 'midsizeSUV', 12); }
  if (personality === 'adventure') { add(scores, 'smallSUV', 20); add(scores, 'midsizeSUV', 16); add(scores, 'truck', 8); }
  if (personality === 'tech') { add(scores, 'evHybrid', 24); add(scores, 'luxury', 8); }
  if (personality === 'performance') { add(scores, 'performance', 28); add(scores, 'luxury', 8); }
  if (personality === 'value') { add(scores, 'compactSedan', 20); add(scores, 'smallSUV', 10); }
  if (personality === 'safe') { add(scores, 'smallSUV', 16); add(scores, 'midsizeSUV', 14); add(scores, 'compactSedan', 8); }
  if (personality === 'simple') { add(scores, 'compactSedan', 22); add(scores, 'hybridSedan', 10); }

  return Object.entries(scores)
    .map(([key, score]) => ({ key, score, ...categories[key] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item, index, arr) => {
      const max = arr[0].score || 1;
      return { ...item, percent: Math.max(64, Math.round((item.score / max) * 94) - index * 2) };
    });
}

function resultProfile(matches) {
  const top = matches[0].key;
  const personality = getValue('personality');
  const priorities = getCheckedValues('priority');

  if (top === 'truck') return ['Work-Ready Utility Buyer', 'You need strength, durability, and practical capability more than a basic commuter car.'];
  if (top === 'midsizeSUV') return ['Space & Safety Driver', 'You need a vehicle that can handle people, cargo, comfort, and longer-term practicality.'];
  if (top === 'smallSUV') return ['Versatile Everyday Driver', 'You want something practical but need more flexibility than a basic sedan.'];
  if (top === 'hybridSedan' || top === 'evHybrid') return ['Efficiency-Focused Buyer', 'You care about fuel savings, lower running costs, and modern driving tech.'];
  if (top === 'luxury') return ['Comfort-Focused Buyer', 'You value comfort, styling, and a more premium driving experience.'];
  if (top === 'performance' || personality === 'performance' || priorities.includes('performance')) return ['Fun-to-Drive Buyer', 'You want something that feels responsive and enjoyable, not just practical.'];
  return ['Practical Commuter', 'You need a reliable, affordable car that makes everyday driving simple.'];
}

function consultantFor(matches) {
  const top = matches[0].key;
  if (top === 'evHybrid' || top === 'hybridSedan') return ['EV & Hybrid Specialist', 'Best for comparing gas, hybrid, plug-in hybrid, and EV options without getting lost in tech details.'];
  if (top === 'midsizeSUV' || top === 'smallSUV') return ['Family & Lifestyle Vehicle Specialist', 'Best for sorting through safety, cargo space, comfort, and long-term ownership tradeoffs.'];
  if (top === 'truck') return ['Truck & Utility Specialist', 'Best for figuring out towing, hauling, bed size, cab size, and whether you really need a truck.'];
  if (top === 'luxury' || top === 'performance') return ['Performance & Premium Specialist', 'Best for balancing fun, comfort, brand image, reliability, and ownership costs.'];
  return ['Budget & Used Car Specialist', 'Best for narrowing down reliable models, used-car risks, and fair price ranges.'];
}

function updateLiveMeters() {
  const priorities = getCheckedValues('priority');
  const needs = getCheckedValues('needs');
  const budget = getValue('budget');
  const liked = getCheckedValues('liked');
  const disliked = getCheckedValues('disliked');

  const reliability = priorities.includes('reliability') || priorities.includes('maintenance') || liked.includes('reliable') || liked.includes('cheapMaintain') || disliked.includes('repair') ? 'High' : priorities.includes('resale') ? 'Medium' : 'Low';
  const space = priorities.includes('cargo') || needs.some(n => ['gear','kids','pets','towing','camping','elderly'].includes(n)) || disliked.includes('small') || disliked.includes('storage') ? 'High' : liked.includes('space') ? 'Medium' : 'Low';
  const budgetFocus = ['veryLow','low','mediumLow','monthly','unsure'].includes(budget) || priorities.includes('payment') ? 'High' : budget === 'medium' ? 'Medium' : 'Low';
  const performance = priorities.includes('performance') || liked.includes('fun') || disliked.includes('slow') ? 'High' : 'Low';

  document.getElementById('meterReliability').textContent = reliability;
  document.getElementById('meterSpace').textContent = space;
  document.getElementById('meterBudget').textContent = budgetFocus;
  document.getElementById('meterPerformance').textContent = performance;
}

function showResults(event) {
  event.preventDefault();
  const matches = calculateScores();
  const [title, summary] = resultProfile(matches);
  const [consultantTitle, consultantText] = consultantFor(matches);

  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultSummary').textContent = summary;
  document.getElementById('topScore').textContent = `${matches[0].percent}%`;
  document.getElementById('consultantTitle').textContent = consultantTitle;
  document.getElementById('consultantText').textContent = consultantText;

  matchList.innerHTML = matches.map(match => `
    <div class="match-row">
      <div class="match-row-top"><span>${match.label}</span><span>${match.percent}%</span></div>
      <div class="bar"><i style="width:${match.percent}%"></i></div>
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
form.addEventListener('submit', showResults);

priorityChips.addEventListener('change', (event) => {
  const checked = [...priorityChips.querySelectorAll('input:checked')];
  if (checked.length > 4) {
    event.target.checked = false;
  }
  priorityNote.textContent = `${Math.min(getCheckedValues('priority').length, 4)} of 4 selected`;
  updateLiveMeters();
});

mobileMenu.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.addEventListener('click', () => navLinks.classList.remove('open'));

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
  const matches = calculateScores();
  const lastCar = form.querySelector('input[name="lastCar"]').value || 'your previous vehicle';
  reportText.textContent = `Based on your answers, your strongest fit is ${matches[0].label}, followed by ${matches[1].label} and ${matches[2].label}. Since you mentioned ${lastCar}, the consultant would focus on what you liked, what you disliked, your budget, and the main tradeoffs before recommending specific makes, models, and years.`;
  reportPreview.classList.remove('hidden');
});

updateStep();
