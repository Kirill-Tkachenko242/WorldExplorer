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

  /*
    Kirill - Experiences and Booking pages
  */

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
