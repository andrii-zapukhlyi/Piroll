 'use strict';
 var slideShow = (function () {
  return function (selector, config) {
    var
          _slider = document.querySelector(selector), // основный элемент блока
          _sliderContainer = _slider.querySelector('.slider__items'), // контейнер для .slider-item
          _sliderItems = _slider.querySelectorAll('.slider__item'), // коллекция .slider-item
          _sliderControls = _slider.querySelectorAll('.slider__control'), // элементы управления
          _currentPosition = 0, // позиция левого активного элемента
          _transformValue = 0, // значение транфсофрмации .slider_wrapper
          _transformStep = 100, // величина шага (для трансформации)
          _itemsArray = [], // массив элементов
          _timerId,
          _indicatorItems,
          _indicatorIndex = 0,
          _indicatorIndexMax = _sliderItems.length - 1,
          _stepTouch = 50,
          _config = {
            isAutoplay: false, // автоматическая смена слайдов
            directionAutoplay: 'next', // направление смены слайдов
            delayAutoplay: 5000, // интервал между автоматической сменой слайдов
            isPauseOnHover: true // устанавливать ли паузу при поднесении курсора к слайдеру
          };

        // настройка конфигурации слайдера в зависимости от полученных ключей
        for (var key in config) {
          if (key in _config) {
            _config[key] = config[key];
          }
        }

        // наполнение массива _itemsArray
        for (var i = 0, length = _sliderItems.length; i < length; i++) {
          _itemsArray.push({ item: _sliderItems[i], position: i, transform: 0 });
        }

        // переменная position содержит методы с помощью которой можно получить минимальный и максимальный индекс элемента, а также соответствующему этому индексу позицию
        var position = {
          getItemIndex: function (mode) {
            var index = 0;
            for (var i = 0, length = _itemsArray.length; i < length; i++) {
              if ((_itemsArray[i].position < _itemsArray[index].position && mode === 'min') || (_itemsArray[i].position > _itemsArray[index].position && mode === 'max')) {
                index = i;
              }
            }
            return index;
          },
          getItemPosition: function (mode) {
            return _itemsArray[position.getItemIndex(mode)].position;
          }
        };

        // функция, выполняющая смену слайда в указанном направлении
        var _move = function (direction) {
          var nextItem, currentIndicator = _indicatorIndex;;
          if (direction === 'next') {
            _currentPosition++;
            if (_currentPosition > position.getItemPosition('max')) {
              nextItem = position.getItemIndex('min');
              _itemsArray[nextItem].position = position.getItemPosition('max') + 1;
              _itemsArray[nextItem].transform += _itemsArray.length * 100;
              _itemsArray[nextItem].item.style.transform = 'translateX(' + _itemsArray[nextItem].transform + '%)';
            }
            _transformValue -= _transformStep;
            _indicatorIndex = _indicatorIndex + 1;
            if (_indicatorIndex > _indicatorIndexMax) {
              _indicatorIndex = 0;
            }
          } else {
            _currentPosition--;
            if (_currentPosition < position.getItemPosition('min')) {
              nextItem = position.getItemIndex('max');
              _itemsArray[nextItem].position = position.getItemPosition('min') - 1;
              _itemsArray[nextItem].transform -= _itemsArray.length * 100;
              _itemsArray[nextItem].item.style.transform = 'translateX(' + _itemsArray[nextItem].transform + '%)';
            }
            _transformValue += _transformStep;
            _indicatorIndex = _indicatorIndex - 1;
            if (_indicatorIndex < 0) {
              _indicatorIndex = _indicatorIndexMax;
            }
          }
          _sliderContainer.style.transform = 'translateX(' + _transformValue + '%)';
          _indicatorItems[currentIndicator].classList.remove('active');
          _indicatorItems[_indicatorIndex].classList.add('active');
        };

        // функция, осуществляющая переход к слайду по его порядковому номеру
        var _moveTo = function (index) {
          var i = 0, direction = (index > _indicatorIndex) ? 'next' : 'prev';
          while (index !== _indicatorIndex && i <= _indicatorIndexMax) {
            _move(direction);
            i++;
          }
        };

        // функция для запуска автоматической смены слайдов через промежутки времени
        var _startAutoplay = function () {
          if (!_config.isAutoplay) {
            return;
          }
          _stopAutoplay();
          _timerId = setInterval(function () {
            _move(_config.directionAutoplay);
          }, _config.delayAutoplay);
        };

        // функция, отключающая автоматическую смену слайдов
        var _stopAutoplay = function () {
          clearInterval(_timerId);
        };

        // функция, добавляющая индикаторы к слайдеру
        var _addIndicators = function () {
          var indicatorsContainer = document.createElement('ol');
          indicatorsContainer.classList.add('slider__indicators');
          for (var i = 0, length = _sliderItems.length; i < length; i++) {
            var sliderIndicatorsItem = document.createElement('li');
            if (i === 0) {
              sliderIndicatorsItem.classList.add('active');
            }
            sliderIndicatorsItem.setAttribute("data-slide-to", i);
            indicatorsContainer.appendChild(sliderIndicatorsItem);
          }
          _slider.appendChild(indicatorsContainer);
          _indicatorItems = _slider.querySelectorAll('.slider__indicators > li')
        };

        var _isTouchDevice = function () {
          return !!('ontouchstart' in window || navigator.maxTouchPoints);
        };

        // функция, осуществляющая установку обработчиков для событий 
        var _setUpListeners = function () {
          var _startX = 0;
          if (_isTouchDevice()) {
            _slider.addEventListener('touchstart', function (e) {
              _startX = e.changedTouches[0].clientX;
              _startAutoplay();
            });
            _slider.addEventListener('touchend', function (e) {
              var
              _endX = e.changedTouches[0].clientX,
              _deltaX = _endX - _startX;
              if (_deltaX > _stepTouch) {
                _move('prev');
              } else if (_deltaX < -_stepTouch) {
                _move('next');
              }
              _startAutoplay();
            });
          } else {
            for (var i = 0, length = _sliderControls.length; i < length; i++) {
              _sliderControls[i].classList.add('slider__control_show');
            }
          }
          _slider.addEventListener('click', function (e) {
            if (e.target.classList.contains('slider__control')) {
              e.preventDefault();
              _move(e.target.classList.contains('slider__control_next') ? 'next' : 'prev');
              _startAutoplay();
            } else if (e.target.getAttribute('data-slide-to')) {
              e.preventDefault();
              _moveTo(parseInt(e.target.getAttribute('data-slide-to')));
              _startAutoplay();
            }
          });
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === "hidden") {
              _stopAutoplay();
            } else {
              _startAutoplay();
            }
          }, false);
          if (_config.isPauseOnHover && _config.isAutoplay) {
            _slider.addEventListener('mouseenter', function () {
              _stopAutoplay();
            });
            _slider.addEventListener('mouseleave', function () {
              _startAutoplay();
            });
          }
        };

        // добавляем индикаторы к слайдеру
        _addIndicators();
        // установливаем обработчики для событий
        _setUpListeners();
        // запускаем автоматическую смену слайдов, если установлен соответствующий ключ
        _startAutoplay();

        return {
          // метод слайдера для перехода к следующему слайду
          next: function () {
            _move('next');
          },
          // метод слайдера для перехода к предыдущему слайду          
          left: function () {
            _move('prev');
          },
          // метод отключающий автоматическую смену слайдов
          stop: function () {
            _config.isAutoplay = false;
            _stopAutoplay();
          },
          // метод запускающий автоматическую смену слайдов
          cycle: function () {
            _config.isAutoplay = true;
            _startAutoplay();
          }
        }
      }
    }());

 slideShow('.slider', {
  isAutoplay: true
});

 slideShow('.slider', {
  isAutoplay: true
});


		// Проверка на поддержку webp
		function testWebP(callback) {

			var webP = new Image();
			webP.onload = webP.onerror = function () {
				callback(webP.height == 2);
			};
			webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
		}

		testWebP(function (support) {

			if (support == true) {
				document.querySelector('body').classList.add('webp');
			}else{
				document.querySelector('body').classList.add('no-webp');
			}
		});

		// Скролл

		$(document).ready(function() {
		// Get the header height
		var headerHeight= $('header').outerHeight();
		$('.nav__link').click(function(e) {
			var linkHref = $(this).attr('href');
			$('html, body').animate({
				scrollTop: $(linkHref).offset().top
		/* scrollTop: $(linkHref).offset().top - headerHeight 
		If Header position : fixed;*/
	},1000);
			e.preventDefault();
		});
	});

		$(document).ready(function() {
		// Get the header height
		var headerHeight= $('header').outerHeight();
		$('.btn__link').click(function(e) {
			var linkHref = $(this).attr('href');
			$('html, body').animate({
				scrollTop: $(linkHref).offset().top
		/* scrollTop: $(linkHref).offset().top - headerHeight 
		If Header position : fixed;*/
	},1000);
			e.preventDefault();
		});
	});

		// Меню бургер


		$(document).ready(function(){
			$(".header__burger").click(function(){
				$(".header__nav").toggleClass("active"); return false;
			});
		});


		$(document).ready(function(){
			$(".header__burger").click(function(){
				$(".header__burger").toggleClass("active"); return false;
			});
		});


		$(document).ready(function(){
			$(".nav__link").click(function(){
				$(".header__nav").removeClass("active");
				$(".header__burger").removeClass("active");
			});
		});


		$(window).scroll(function() {    
			$(".header__nav").removeClass("active");
			$(".header__burger").removeClass("active");
		});


		$(document).ready(function(){
			$("section").click(function(){
				$(".header__nav").removeClass("active");
				$(".header__burger").removeClass("active");
			});
		});


// Счетчик


$(document).ready(function(){   
  var $element = $('.numbers');
  let counter = 0;
  $(window).scroll(function() {
    var scroll = $(window).scrollTop() + $(window).height();
    var offset = $element.offset().top

    if (scroll > offset && counter == 0) {
      $('.numbers__item__count').each(function () {
        $(this).prop('Counter',0).animate({
          Counter:$(this).text()
        }, {
          duration: 5000,
          easing: 'swing',
          step:function(now){
            $(this).text(Math.ceil(now))
          }
        });
      });
      counter = 1;
    }
  });
});


// Показать больше работ

$(document).ready(function() {
    // Get the header height
    var headerHeight= $('header').outerHeight();
    $('.more__btn-hide').click(function(e) {
      var linkHref = $(this).attr('href');
      $('html, body').animate({
        scrollTop: $(linkHref).offset().top
    /* scrollTop: $(linkHref).offset().top - headerHeight 
    If Header position : fixed;*/
  },10);
      e.preventDefault();
    });
  });

$(document).ready(function(){
  $(".more__btn-show").click(function(){
    $(".more__btn-show").css({'display':'none'});
    $(".more__btn-hide").css({'display':'block'});
    $(".works__items-inactive").css({'position':'relative'});
    $(".works__items-inactive").css({'display':'block'});
  });
  $(".more__btn-hide").click(function(){
    $(".works__items-inactive").css({'position':'absolute'});
    $(".works__items-inactive").css({'display':'none'});
    $(".more__btn-hide").css({'display':'none'});
    $(".more__btn-show").css({'display':'block'});
  });
});


// Skills
$(document).ready(function(){
  var input = document.querySelector('.diaram__input-1');
  var input2 = document.querySelector('.diaram__input-2');
  var input3 = document.querySelector('.diaram__input-3');
  if ($(window).width() <= 586){
   $(".diagram__btn").click(function(){
    $(".diagram__skill-1").animate({'width':`${250 / 100 * input.value}`}, 2000);
  });
  $(".diagram__btn").click(function(){
    $(".diagram__skill-2").animate({'width':`${250 / 100 * input2.value}`}, 2000);
  });
   $(".diagram__btn").click(function(){
    $(".diagram__skill-3").animate({'width':`${250 / 100 * input3.value}`}, 2000);
  });
  } else{
    $(".diagram__btn").click(function(){
    $(".diagram__skill-1").animate({'width':`${500 / 100 * input.value}`}, 2000);
  });
  $(".diagram__btn").click(function(){
    $(".diagram__skill-2").animate({'width':`${500 / 100 * input2.value}`}, 2000);
  });
   $(".diagram__btn").click(function(){
    $(".diagram__skill-3").animate({'width':`${500 / 100 * input3.value}`}, 2000);
  });
  }
});
