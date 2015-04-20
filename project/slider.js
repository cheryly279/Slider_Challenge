(function () {
  var assessmentMin    = 27000,
      assessmentMax    = 10600000,
      annualMin        = 5000,
      annualMax        = 5000000,
      assessmentFactor = 5.3;

  // buffer for logs
  var slideEvents = [];

  // cache common elements
  var sliderEl = $("#income-slider"),
      inputEl = $('#income-input');

  // setup slider
  sliderEl.slider({
    orientation: "horizontal",
    range: "min",
    min: annualMin,
    max: annualMax,
    value: 150,
    start: function( event, ui ) {
      console.log("Slide start.");
    },
    stop: function( event, ui ) {
      console.log("Slide stop.");
    }
  });

  sliderEl.on( "slide", function( event, ui ) {
    var timestamp = new Date(),
        timeFormatted = (timestamp.getMonth()+1) + "/" + timestamp.getDate() + "/" 
          + timestamp.getFullYear() + ", " + timestamp.getHours() + ":"   
          + timestamp.getMinutes() + ":" + timestamp.getSeconds();

    // update steps for different ranges
    sliderEl.slider("option", "step", determineStep(ui.value));

    // update input, trigger input's change event
    inputEl.val(ui.value).change();

    // store output for later logging
    slideEvents.push(timeFormatted + " Slider moved to value " + ui.value + ".");
  });


  // log to console, clear buffer
  setInterval(function () {
    while (slideEvents.length) {
      console.log(slideEvents.shift());
    }
  }, 500);


  inputEl.change(function () {
    // validate and display updated annual income, move slider appropriately
    var annualIncome = annualValidation($(this).val());
    sliderEl.slider("option", "value", annualIncome);
    $(this).val(addCommas(annualIncome));

    // calculate and display assessment value
    var assessment = calculateAssessment(annualIncome);
    $('.assessed-amount').html('$' + addCommas(assessment));

    // determine new location for assessment value and pointer
    // also: how far can assessment go (without falling off the page)
    var percentage    = parseFloat(assessment - assessmentMin) / 
                        parseFloat(assessmentMax - assessmentMin),
        incomeWidth   = $('.assessed-income').width(),
        topWidth      = $('.assessed-top').width(),
        moneyMargin   = incomeWidth * percentage,
        pointerMargin = topWidth * percentage,
        moneyLimit    = incomeWidth - topWidth,
        pointerLimit  = topWidth - $('.assessed-pointer').width();

    // move assessment and arrow along color bar
    $('.assessed-top').css('margin-left', Math.min(moneyMargin, moneyLimit));
    $('.assessed-pointer').css('left', Math.min(pointerMargin, pointerLimit));

    // set proper aligning of slider handle
    var alignment = parseFloat($('#income-slider .ui-slider-range').width()) / parseFloat(sliderEl.width()) * 18.0;
    $('#income-slider .ui-slider-handle').css('margin-left', '-' + alignment + 'px');

  });

  // calculate step amount for slider based on input
  function determineStep(inputValue) {
    if (inputValue <= 50000)
      return 5000;
    else if (inputValue > 50000 && inputValue <= 500000)
      return 50000;
    else if (inputValue > 500000 && inputValue <= 2000000)
      return 100000;
    else return 500000;
  }

  // clean up possible invalid input
  function annualValidation(inputText) {
    console.log('1: ' + inputText);
    console.log('1.5: ' + inputText.replace(',', ''));
    // remove comma, convert to integer
    var inputInt = parseInt(inputText.replace(',', ''));

    console.log('2: ' + inputInt);

    if (isNaN(inputInt)) {
      console.log('3: is NaN!');
      // if invalid input entered, just default to min
      return annualMin;
    } 
    else {
      console.log('4: Not NaN, ' + Math.max(Math.min(inputInt, annualMax), annualMin));
      // return integer entered, or force into range
      return Math.max(Math.min(inputInt, annualMax), annualMin);
    }
  }

  // display numeric values with commas
  function addCommas(inputValue) {
    var rgx = /(\d+)(\d{3})/,
        inputString = inputValue.toString();

    while (rgx.test(inputString)) {
      inputString = inputString.replace(rgx, '$1' + ',' + '$2');
    }

    return inputString;
  }

  // use annual value to calculate assessment value (for the color bar)
  function calculateAssessment(inputValue) {
    var assessmentValue = inputValue * assessmentFactor;

    // round to nearest thousand
    assessmentValue = Math.round(assessmentValue / 1000) * 1000;

    // cap out at 10.6 million
    return Math.min(assessmentValue, assessmentMax);
  }
}());