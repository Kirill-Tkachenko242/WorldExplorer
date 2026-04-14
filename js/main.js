/* ============================================================
   WORLD EXPLORE — main.js
   Organized by responsibility:
   - Shared interactions
   - Izabel
   - Cleyton
   - Kirill
   ============================================================ */

$(document).ready(function () {

  /* Shared - global site interactions */
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 60) {
      $('#mainNav').addClass('scrolled');
      $('.back-to-top').addClass('visible');
    } else {
      $('#mainNav').removeClass('scrolled');
      $('.back-to-top').removeClass('visible');
    }
  });

  window.subscribeNewsletter = function () {
    const email = $('#newsletterEmail').val().trim();
    const msg = $('#newsletter-msg');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      msg.text('Please enter your email address.').css('color', '#ff6b6b');
    } else if (!emailRegex.test(email)) {
      msg.text('Please enter a valid email address.').css('color', '#ff6b6b');
    } else {
      msg.text('You\'re subscribed! Welcome aboard.').css('color', '#D6A126');
      $('#newsletterEmail').val('');
      setTimeout(() => msg.text(''), 4000);
    }
  };

  const fadeEls = document.querySelectorAll('.dest-card, .why-card, .exp-card, .team-card, .value-card, .testimonial-card');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
  });

  $('.back-to-top').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  /* Kirill - Experiences and Booking pages */

  let currentStep = 1;
  const totalSteps = 3;

  function applyBookingSearchParams() {
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    const query = (params.get('query') || '').trim();
    const date = params.get('date') || '';
    const travellers = params.get('travellers') || '';
    const destinationSelect = document.getElementById('bookDest');
    const summary = document.getElementById('bookingSearchSummary');
    const notesField = document.getElementById('bookNotes');

    if (date && document.getElementById('bookDate')) {
      $('#bookDate').val(date);
    }

    if (travellers && document.getElementById('bookTravellers')) {
      $('#bookTravellers').val(travellers);
    }

    if (query && destinationSelect) {
      const normalizedQuery = query.toLowerCase();
      let matchedValue = '';

      const destinationAliases = {
        'kyoto-japan': ['kyoto', 'japan', 'kyoto japan'],
        'serengeti-tanzania': ['serengeti', 'tanzania', 'safari', 'africa safari'],
        'patagonia-chile': ['patagonia', 'chile', 'hiking', 'trekking'],
        'santorini-greece': ['santorini', 'greece'],
        'bali-indonesia': ['bali', 'indonesia', 'beach', 'wellness'],
        'machu-picchu-peru': ['machu picchu', 'peru', 'inca trail', 'history']
      };

      Object.entries(destinationAliases).forEach(([value, aliases]) => {
        if (matchedValue) return;
        if (aliases.some(alias => normalizedQuery.includes(alias))) {
          matchedValue = value;
        }
      });

      if (matchedValue) {
        $('#bookDest').val(matchedValue);
      } else if (notesField) {
        const currentNotes = notesField.value.trim();
        notesField.value = currentNotes
          ? `${currentNotes}\nRequested activity/location: ${query}`
          : `Requested activity/location: ${query}`;
      }
    }

    if (summary) {
      const details = [];
      if (query) details.push(`<strong>Search:</strong> ${query}`);
      if (date) details.push(`<strong>Date:</strong> ${date}`);
      if (travellers) details.push(`<strong>People:</strong> ${travellers}`);

      if (details.length) {
        summary.innerHTML = details.join(' <span class="mx-2">•</span> ');
        summary.style.display = 'block';
      }
    }
  }

  function updateBookingStep(step) {
    for (let i = 1; i <= totalSteps; i++) {
      const dot = $(`.step[data-step="${i}"]`);
      dot.removeClass('active done');
      if (i < step) dot.addClass('done');
      if (i === step) dot.addClass('active');
    }

    $('.booking-step').removeClass('active');
    $(`#step${step}`).addClass('active');
    currentStep = step;

    if (step === totalSteps) {
      $('#nextBtn').text('Confirm Booking');
    } else {
      $('#nextBtn').text('Next →');
    }

    if (step === 3) updatePriceSummary();
  }

  function validateBookingStep(step) {
    if (step === 1) {
      const dest = $('#bookDest').val();
      const date = $('#bookDate').val();
      const travellers = $('#bookTravellers').val();

      if (!dest || !date || !travellers) {
        alert('Please fill in all fields to continue.');
        return false;
      }

      const chosenDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosenDate <= today) {
        alert('Please select a future date.');
        return false;
      }
    }

    if (step === 2) {
      const firstName = $('#bookFirst').val().trim();
      const lastName = $('#bookLast').val().trim();
      const email = $('#bookEmail').val().trim();
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!firstName || !lastName) {
        alert('Please enter your full name.');
        return false;
      }
      if (!emailRx.test(email)) {
        alert('Please enter a valid email address.');
        return false;
      }
    }

    return true;
  }

  function updatePriceSummary() {
    const dest = $('#bookDest').val();
    const travellers = parseInt($('#bookTravellers').val()) || 1;
    const type = $('#bookType').val();

    const prices = {
      'kyoto-japan': 1299,
      'serengeti-tanzania': 2599,
      'patagonia-chile': 1899,
      'santorini-greece': 1499,
      'bali-indonesia': 1099,
      'machu-picchu-peru': 1799
    };

    const typeExtra = { standard: 0, comfort: 300, luxury: 700 };
    const base = (prices[dest] || 1299) + (typeExtra[type] || 0);
    const total = base * travellers;

    const destNames = {
      'kyoto-japan': 'Kyoto, Japan',
      'serengeti-tanzania': 'Serengeti, Tanzania',
      'patagonia-chile': 'Patagonia, Chile',
      'santorini-greece': 'Santorini, Greece',
      'bali-indonesia': 'Bali, Indonesia',
      'machu-picchu-peru': 'Machu Picchu, Peru'
    };

    $('#summaryDest').text(destNames[dest] || dest);
    $('#summaryTravellers').text(travellers);
    $('#summaryType').text(type ? type.charAt(0).toUpperCase() + type.slice(1) : '—');
    $('#summaryBase').text('€' + base.toLocaleString() + ' per person');
    $('#summaryTotal').text('€' + total.toLocaleString());
  }

  function submitBooking() {
    const name = $('#bookFirst').val() + ' ' + $('#bookLast').val();
    $('#bookingForm').hide();
    $('#bookingSuccess').fadeIn(500);
    $('#confirmedName').text(name);

    const ref = 'WE-' + Math.random().toString(36).toUpperCase().substr(2, 8);
    $('#bookingRef').text(ref);
  }

  window.nextStep = function () {
    if (!validateBookingStep(currentStep)) return;
    if (currentStep < totalSteps) {
      updateBookingStep(currentStep + 1);
    } else {
      submitBooking();
    }
  };

  window.prevStep = function () {
    if (currentStep > 1) updateBookingStep(currentStep - 1);
  };

  applyBookingSearchParams();

  const bookDateInput = document.getElementById('bookDate');
  if (bookDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookDateInput.min = tomorrow.toISOString().split('T')[0];
  }
});

/* Izabel part
   This code is for:
   - index
   - destinations
   Active menu logic:
   https://stackoverflow.com/questions/3963495/jquery-set-active-menu-item

   jQuery animate counter:
   https://api.jquery.com/animate/

   IntersectionObserver animation:
   https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

   URLSearchParams:
   https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

   jQuery form validation pattern:
   https://jqueryvalidation.org/

   jQuery events:
   https://api.jquery.com/category/events/  */

$(document).ready(function () {
  // this makes the correct menu link stay active
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  $('#mainNav .nav-link').removeClass('active');
  $('#mainNav .nav-link').each(function () {
    const linkPage = ($(this).attr('href') || '').split('/').pop().toLowerCase();
    if (linkPage === currentPage) {
      $(this).addClass('active');
    }
  });

  /* Home page */

  // this animates the numbers on the home page
  function animateCounters() {
    $('.stat-num').each(function () {
      const $counter = $(this);
      const target = parseInt($counter.data('target'), 10);
      if (!target || $counter.data('animated')) return;

      $counter.data('animated', true);
      $({ count: 0 }).animate(
        { count: target },
        {
          duration: 1800,
          easing: 'swing',
          step: function () {
            $counter.text(Math.ceil(this.count).toLocaleString());
          },
          complete: function () {
            $counter.text(target.toLocaleString());
          }
        }
      );
    });
  }

  // this starts the number animation only when the hero is visible
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    heroObserver.observe(heroEl);
  }

  // this only allows dates from tomorrow
  const heroSearchDate = document.getElementById('heroSearchDate');
  if (heroSearchDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    heroSearchDate.min = tomorrow.toISOString().split('T')[0];
  }

  // this sends the home page search to booking.html
  const heroSearchForm = document.getElementById('heroSearchForm');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const params = new URLSearchParams();
      const query = ($('#heroSearchQuery').val() || '').trim();
      const date = $('#heroSearchDate').val();
      const travellers = $('#heroSearchTravellers').val();

      if (query) params.set('query', query);
      if (date) params.set('date', date);
      if (travellers) params.set('travellers', travellers);

      const bookingUrl = params.toString() ? `pages/booking.html?${params.toString()}` : 'pages/booking.html';
      window.location.href = bookingUrl;
    });
  }

  /* Destinations page */

  // this filters the destination cards by region
  $('.filter-btn').on('click', function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    const filter = $(this).data('filter');
    if (filter === 'all') {
      $('.dest-item').fadeIn(300);
    } else {
      $('.dest-item').hide();
      $(`.dest-item[data-region="${filter}"]`).fadeIn(300);
    }
  });

  // this scrolls from the hero section to the featured part
  $('.hero-scroll-hint').on('click', function () {
    const featuredSection = $('#featured');
    if (!featuredSection.length) return;
    $('html, body').animate({ scrollTop: featuredSection.offset().top - 70 }, 600);
  });

  $('#contactForm').on('submit', function (event) {
    event.preventDefault();

    let valid = true;
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validators = [
      {
        input: '#contactName',
        error: '#nameError',
        test: (value) => value.length >= 2,
        message: 'Please enter your full name.'
      },
      {
        input: '#contactEmail',
        error: '#emailError',
        test: (value) => emailRx.test(value),
        message: 'Please enter a valid email address.'
      },
      {
        input: '#contactSubject',
        error: '#subjectError',
        test: (value) => value.length >= 3,
        message: 'Please enter a subject.'
      },
      {
        input: '#contactMsg',
        error: '#msgError',
        test: (value) => value.length >= 10,
        message: 'Message must be at least 10 characters.'
      }
    ];

    validators.forEach((field) => {
      const $input = $(field.input);
      const value = ($input.val() || '').trim();
      if (!field.test(value)) {
        $input.addClass('form-error');
        $(field.error).text(field.message).show();
        valid = false;
      } else {
        $input.removeClass('form-error');
        $(field.error).hide();
      }
    });

    if (valid) {
      $('#formSuccessMsg').fadeIn(300);
      $('#contactForm')[0].reset();
      setTimeout(() => $('#formSuccessMsg').fadeOut(300), 5000);
    }
  });

  $('input.we-field, textarea.we-field, select.we-select').on('input change', function () {
    if (($(this).val() || '').toString().trim().length > 0) {
      $(this).removeClass('form-error');
    }
  });

  /* Extra support for my pages */

  // list of destinations used to connect my pages with booking
  const destinationCatalog = {
    'kyoto-japan': {
      name: 'Kyoto, Japan',
      price: 1299,
      aliases: ['kyoto', 'japan', 'kyoto japan']
    },
    'serengeti-tanzania': {
      name: 'Serengeti, Tanzania',
      price: 2599,
      aliases: ['serengeti', 'tanzania', 'safari', 'africa safari']
    },
    'patagonia-chile': {
      name: 'Patagonia, Chile',
      price: 1899,
      aliases: ['patagonia', 'chile', 'hiking', 'trekking']
    },
    'santorini-greece': {
      name: 'Santorini, Greece',
      price: 1499,
      aliases: ['santorini', 'greece']
    },
    'bali-indonesia': {
      name: 'Bali, Indonesia',
      price: 1099,
      aliases: ['bali', 'indonesia', 'beach', 'wellness']
    },
    'machu-picchu-peru': {
      name: 'Machu Picchu, Peru',
      price: 1799,
      aliases: ['machu picchu', 'peru', 'inca trail', 'history']
    },
    'rio-brazil': {
      name: 'Rio de Janeiro, Brazil',
      price: 1899,
      aliases: ['rio', 'rio de janeiro', 'brazil']
    },
    'moscow-russia': {
      name: 'Moscow, Russia',
      price: 2599,
      aliases: ['moscow', 'russia']
    },
    'cobh-ireland': {
      name: 'Cobh, Ireland',
      price: 500,
      aliases: ['cobh', 'ireland', 'county cork']
    },
    'narok-kenya': {
      name: 'Narok, Kenya',
      price: 1500,
      aliases: ['narok', 'kenya']
    },
    'jokulsarlon-iceland': {
      name: 'Jokulsarlon, Iceland',
      price: 1900,
      aliases: ['jokulsarlon', 'iceland']
    },
    'cappadocia-turkey': {
      name: 'Cappadocia, Turkey',
      price: 1200,
      aliases: ['cappadocia', 'turkey', 'balloon']
    }
  };

  // this makes sure booking has the same destinations from my pages
  function ensureBookingOptions() {
    const bookingSelect = document.getElementById('bookDest');
    if (!bookingSelect) return;

    const existingValues = new Set();
    Array.from(bookingSelect.options).forEach((option) => {
      if (!option.value) return;
      existingValues.add(option.value);
      if (destinationCatalog[option.value]) {
        option.textContent = `${destinationCatalog[option.value].name} - from EUR ${destinationCatalog[option.value].price.toLocaleString()}`;
      }
    });

    Object.entries(destinationCatalog).forEach(([value, destination]) => {
      if (existingValues.has(value)) return;
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${destination.name} - from EUR ${destination.price.toLocaleString()}`;
      bookingSelect.appendChild(option);
    });
  }

  // this checks which booking step is active
  function inferActiveStep() {
    const activeStepId = $('.booking-step.active').attr('id') || 'step1';
    const stepNumber = parseInt(activeStepId.replace('step', ''), 10);
    return Number.isNaN(stepNumber) ? 1 : stepNumber;
  }

  // this shows or hides the back button in booking
  function syncBookingNav() {
    const stepNumber = inferActiveStep();
    window.currentStepVal = stepNumber;

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
      prevBtn.style.display = stepNumber > 1 ? 'inline-block' : 'none';
    }
  }

  // this tries to match the search text with a destination
  function findDestinationByQuery(query) {
    const normalizedQuery = (query || '').toLowerCase();
    let matchedKey = '';

    Object.entries(destinationCatalog).forEach(([value, destination]) => {
      if (matchedKey) return;
      if (destination.aliases.some((alias) => normalizedQuery.includes(alias))) {
        matchedKey = value;
      }
    });

    return matchedKey;
  }

  // this updates the booking summary with the correct values
  function updateExtendedBookingSummary() {
    const bookingSelect = document.getElementById('bookDest');
    if (!bookingSelect) return;

    const destinationValue = bookingSelect.value;
    const travellers = parseInt($('#bookTravellers').val(), 10) || 1;
    const type = $('#bookType').val() || 'standard';
    const typeExtra = { standard: 0, comfort: 300, luxury: 700 };
    const destination = destinationCatalog[destinationValue];

    if (!destination) return;

    const basePrice = destination.price + (typeExtra[type] || 0);
    const totalPrice = basePrice * travellers;

    $('#summaryDest').text(destination.name);
    $('#summaryTravellers').text(travellers);
    $('#summaryType').text(type.charAt(0).toUpperCase() + type.slice(1));
    $('#summaryBase').text(`EUR ${basePrice.toLocaleString()} per person`);
    $('#summaryTotal').text(`EUR ${totalPrice.toLocaleString()}`);
  }

  // this reads the values coming from home or destinations page
  function applyExtendedBookingParams() {
    const bookingSelect = document.getElementById('bookDest');
    if (!bookingSelect) return;

    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    const query = (params.get('query') || '').trim();
    const date = params.get('date') || '';
    const travellers = params.get('travellers') || '';
    const summary = document.getElementById('bookingSearchSummary');
    const notesField = document.getElementById('bookNotes');

    if (date && document.getElementById('bookDate')) {
      $('#bookDate').val(date);
    }

    if (travellers && document.getElementById('bookTravellers')) {
      $('#bookTravellers').val(travellers);
    }

    if (query) {
      const matchedDestination = findDestinationByQuery(query);
      if (matchedDestination) {
        $('#bookDest').val(matchedDestination);
        if (notesField) {
          notesField.value = notesField.value
            .split('\n')
            .filter((line) => !line.startsWith('Requested activity/location:'))
            .join('\n')
            .trim();
        }
      } else if (notesField) {
        const currentNotes = notesField.value.trim();
        notesField.value = currentNotes
          ? `${currentNotes}\nRequested activity/location: ${query}`
          : `Requested activity/location: ${query}`;
      }
    }

    if (summary) {
      const details = [];
      if (query) details.push(`<strong>Search:</strong> ${query}`);
      if (date) details.push(`<strong>Date:</strong> ${date}`);
      if (travellers) details.push(`<strong>People:</strong> ${travellers}`);

      if (details.length) {
        summary.innerHTML = details.join(' <span class="mx-2">&bull;</span> ');
        summary.style.display = 'block';
      }
    }
  }

  // run the helpers needed for the pages to work together
  ensureBookingOptions();
  applyExtendedBookingParams();
  syncBookingNav();
  updateExtendedBookingSummary();

  $('#bookDest, #bookTravellers, #bookType').on('change', function () {
    updateExtendedBookingSummary();
  });

  if (!window.__weBookingWrapped && typeof window.nextStep === 'function' && typeof window.prevStep === 'function') {
    const originalNext = window.nextStep;
    const originalPrev = window.prevStep;

    window.nextStep = function () {
      originalNext();
      syncBookingNav();
      updateExtendedBookingSummary();
    };

    window.prevStep = function () {
      originalPrev();
      syncBookingNav();
      updateExtendedBookingSummary();
    };

    window.__weBookingWrapped = true;
  }

  $(window).trigger('scroll');
});





