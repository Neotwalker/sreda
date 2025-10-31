document.addEventListener("DOMContentLoaded", () => {
	
	// Слайдеры
	const headerswiper = new Swiper('.about--header__slider', {
		spaceBetween: 5,  // Дефолт для десктопа
		navigation: {
				prevEl: '.about-header-prev',
				nextEl: '.about-header-next',
		},
		loop: true,
		speed: 600,
		breakpoints: {
			0: {
				slidesPerView: 'auto',
				spaceBetween: 8,
				loop: false,
				freeMode: false,
				slidesPerGroup: 1,
			},
			481: {
				slidesPerView: 1,
				spaceBetween: 5,
				loop: true,
				freeMode: false,
			}
		}
	});
	const environmentswiper = new Swiper('.about--environment__wrapper', {
		slidesPerView: 1,
		spaceBetween: 5,
		navigation: {
			prevEl: '.prev-environment',
			nextEl: '.next-environment',
		},
		loop: true,
		speed: 600,
		breakpoints: {
			0: {
				slidesPerView: 'auto',
				spaceBetween: 8,
				loop: false,
				freeMode: false,
				slidesPerGroup: 1,
			},
			481: {
				slidesPerView: 1,
				spaceBetween: 5,
				loop: true,
				freeMode: false,
			}
		}
	});
	document.querySelectorAll('.about--finishing__rooms .block').forEach((block, index) => {
		new Swiper(block, {
			slidesPerView: 1,
			spaceBetween: 5,
			navigation: {
				prevEl: block.querySelector('.finishing-prev'),
				nextEl: block.querySelector('.finishing-next'),
			},
			loop: true,
			speed: 600,
			breakpoints: {
				0: {
					slidesPerView: 'auto',
					spaceBetween: 8,
					loop: false,
					freeMode: false,
					slidesPerGroup: 1,
				},
				481: {
					slidesPerView: 1,
					spaceBetween: 5,
					loop: true,
					freeMode: false,
				}
			}
		});
	});
	document.querySelectorAll('.about--hotOffers .images').forEach((block, index) => {
		new Swiper(block, {
			slidesPerView: 1,
			spaceBetween: 5,
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			loop: true,
			speed: 600,
		});
	});
	document.querySelectorAll('.about--constructionProgress__block').forEach((block, index) => {
		new Swiper(block, {
			slidesPerView: 4,
			spaceBetween: 20,
			navigation: {
				prevEl: block.querySelector('.constructionProgress-prev'),
				nextEl: block.querySelector('.constructionProgress-next'),
			},
			loop: true,
			speed: 600,
			breakpoints: {
				0: {
					slidesPerView: 'auto',
					spaceBetween: 8,
					loop: false,
					freeMode: false,
					slidesPerGroup: 1,
				},
				481: {
					slidesPerView: 4,
					spaceBetween: 20,
					loop: true,
					freeMode: false,
				}
			}
		});
	});

	// Функция для вычисления ширины текста в input
	function adjustInputWidth(input) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		const styles = window.getComputedStyle(input);
		context.font = `${styles.fontSize} ${styles.fontFamily}`;
		const textWidth = context.measureText(input.value || '0').width;
		const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
		const border = parseFloat(styles.borderLeftWidth) + parseFloat(styles.borderRightWidth);
		const newWidth = Math.max(15, textWidth + padding + border + 5); // +5 для запаса, min-width 15px
		input.style.width = `${newWidth}px`;
	}
	document.querySelectorAll('.group--range').forEach(group => {
		const sliderEl = group.querySelector('[id$="range"]');
		if (!sliderEl) return;

		const valueEls = group.querySelectorAll('.values input[id]');
		const min = parseFloat(sliderEl.dataset.min.replace(/\s/g, ''));
		const max = parseFloat(sliderEl.dataset.max.replace(/\s/g, ''));
		const startLeft = parseFloat(sliderEl.dataset.startLeft.replace(/\s/g, ''));
		const startRight = sliderEl.dataset.startRight ? parseFloat(sliderEl.dataset.startRight.replace(/\s/g, '')) : null;
		const step = parseFloat(sliderEl.dataset.step);

		// Проверка на корректность данных
		if (isNaN(min) || isNaN(max) || isNaN(startLeft) || (startRight !== null && isNaN(startRight)) || isNaN(step)) {
				console.error('Invalid slider data:', { min, max, startLeft, startRight, step });
				return;
		}

		// Определяем максимальное количество десятичных знаков на основе step
		const decimals = (step % 1 !== 0) ? 1 : 0;

		// Инициализируем ширину всех input при загрузке
		valueEls.forEach(input => adjustInputWidth(input));

		// Создаем слайдер
		noUiSlider.create(sliderEl, {
			start: startRight !== null ? [startLeft, startRight] : [startLeft],
			connect: startRight !== null ? true : 'lower',
			step: step,
			range: { min, max },
			format: {
					to: (value) => {
						const num = parseFloat(value);
						if (isNaN(num)) return '';
						return num.toLocaleString('ru-RU', {
							minimumFractionDigits: 0,
							maximumFractionDigits: decimals
						});
					},
					from: (value) => parseFloat(value.replace(/\s/g, '').replace(',', '.'))
			}
		});

		// Синхронизация input с слайдером (только если input не в фокусе)
		sliderEl.noUiSlider.on('update', (values) => {
			valueEls.forEach((input, i) => {
				if (document.activeElement !== input) {
					input.value = values[i];
					adjustInputWidth(input); // Обновляем ширину при изменении слайдера
				}
			});
		});

		// Обработчики для каждого input
		valueEls.forEach((input, index) => {
			// Храним идентификатор таймера для debouncing
			let debounceTimer;

			// При фокусе: убираем форматирование для удобного ввода
			input.addEventListener('focus', () => {
				const cleanValue = input.value.replace(/\s/g, '').replace(',', '.');
				input.value = cleanValue;
				adjustInputWidth(input); // Обновляем ширину при фокусе
			});

			// Live-обновление слайдера при вводе с задержкой 0.5 секунд
			input.addEventListener('input', () => {
				// Фильтрация: разрешаем только цифры, запятую и точку
				input.value = input.value.replace(/[^0-9,.]/g, '');

				const rawInput = input.value.replace(/\s/g, '').replace(',', '.');
				const parsed = parseFloat(rawInput);
				let targetValue;

				const currentRaw = sliderEl.noUiSlider.get(true);

				if (isNaN(parsed) || rawInput === '') {
					// При очистке или некорректном вводе: min для левого, max для правого
					targetValue = (index === 0) ? min : max;
				} else {
					// Округляем до шага
					targetValue = Math.round(parsed / step) * step;

					// Для двойного слайдера: предотвращаем пересечение
					if (startRight !== null) {
						const otherIndex = 1 - index;
						const otherValue = currentRaw[otherIndex];
						if ((index === 0 && targetValue > otherValue) ||
							(index === 1 && targetValue < currentRaw[0])) {
							targetValue = otherValue;
						}
					}

					// Ограничиваем диапазоном
					targetValue = Math.max(min, Math.min(max, targetValue));
				}

				// Сохраняем введенное значение в data атрибут для использования в blur
				input.dataset.lastValidValue = isNaN(parsed) || rawInput === '' ? targetValue : parsed;

				// Обновляем ширину input при вводе
				adjustInputWidth(input);

				// Debouncing: обновляем слайдер с задержкой 0.5 секунд
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					// Обновляем слайдер
					let newStart;
					if (startRight !== null) {
						newStart = [...currentRaw];
						newStart[index] = targetValue;
					} else {
						newStart = [targetValue];
					}
					sliderEl.noUiSlider.set(newStart);
				}, 500);
			});

			// При потере фокуса: форматируем введенное значение или значение из слайдера
			input.addEventListener('blur', () => {
				// Очищаем таймер, чтобы избежать лишних обновлений
				clearTimeout(debounceTimer);

				// Проверяем последнее введенное значение из data
				let lastValidValue = parseFloat(input.dataset.lastValidValue);
				let actualValue;

				if (!isNaN(lastValidValue)) {
					// Округляем до шага и ограничиваем диапазоном
					lastValidValue = Math.round(lastValidValue / step) * step;
					lastValidValue = Math.max(min, Math.min(max, lastValidValue));

					// Для двойного слайдера: предотвращаем пересечение
					if (startRight !== null) {
						const currentRaw = sliderEl.noUiSlider.get(true);
						const otherIndex = 1 - index;
						const otherValue = currentRaw[otherIndex];
						if ((index === 0 && lastValidValue > otherValue) ||
							(index === 1 && lastValidValue < currentRaw[0])) {
							lastValidValue = otherValue;
						}
					}
					actualValue = lastValidValue;
				} else {
					// Если нет валидного введенного значения, берем значение из слайдера
					const actualRaw = sliderEl.noUiSlider.get(true);
					actualValue = (startRight !== null) ? (actualRaw && actualRaw[index] !== undefined ? actualRaw[index] : (index === 0 ? min : max)) : (actualRaw && actualRaw[0] !== undefined ? actualRaw[0] : min);
				}

				// Обновляем слайдер с финальным значением
				let newStart;
				if (startRight !== null) {
					newStart = sliderEl.noUiSlider.get(true);
					newStart[index] = actualValue;
				} else {
					newStart = [actualValue];
				}
				sliderEl.noUiSlider.set(newStart);

				// Форматируем значение в input
				input.value = actualValue.toLocaleString('ru-RU', {
					minimumFractionDigits: 0,
					maximumFractionDigits: decimals
				});
				adjustInputWidth(input); // Обновляем ширину при потере фокуса
			});
		});
	});

	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
	// блок about--calculate
	const smoothHeight1 = (itemSelector, buttonSelector, contentSelector) => {
		const items = document.querySelectorAll(itemSelector);

		if (!items.length) return;

		items.forEach(el => {
			const button = el.querySelector(buttonSelector);
			const content = el.querySelector(contentSelector);

			button.addEventListener('click', () => {
				if (el.dataset.open !== 'true') {
					// Удаляем параметры для всех элементов, кроме текущего
					items.forEach(item => {
						if (item !== el) {
							item.dataset.open = 'false';
							item.classList.remove('active');
							item.querySelector(buttonSelector).classList.remove('active');
							item.querySelector(contentSelector).style.maxHeight = '';
						}
					});
					el.dataset.open = 'true';
					button.classList.add('active');
					el.classList.add('active');
					content.style.maxHeight = `${content.scrollHeight / rootFontSize}rem`;
				} else {
					el.dataset.open = 'false';
					el.classList.remove('active');
					button.classList.remove('active');
					content.style.maxHeight = '';
				}
			})

			const onResize = () => {
				if (el.dataset.open === 'true') {
					if (parseInt(content.style.maxHeight) !== content.scrollHeight) {
						content.style.maxHeight = `${content.scrollHeight / rootFontSize}rem`;
					}
				}
			}

			window.addEventListener('resize', onResize);
		});
	}
	smoothHeight1('.about--calculate__wrapper .item', '.item--button', '.item--more');

	// блок faq со сменой изображения справа
	const smoothHeight = (itemSelector, buttonSelector, contentSelector, imageSelector) => {
    const items = document.querySelectorAll(itemSelector);
    const images = document.querySelectorAll(imageSelector);
    if (!items.length) return;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    const showImage = (index) => {
        // Проверяем ширину экрана
        if (window.innerWidth > 480) {
            images.forEach(img => {
                img.classList.remove('active');
            });
            const activeImage = document.querySelector(`${imageSelector}[data-image="${index}"]`);
            if (activeImage) {
                activeImage.classList.add('active');
            }
        }
    };

    // Инициализация первого элемента
    const firstItem = items[0];
    const firstButton = firstItem.querySelector(buttonSelector);
    const firstContent = firstItem.querySelector(contentSelector);
    firstItem.classList.add('active');
    firstButton.classList.add('active');
    firstItem.dataset.open = 'true';
    firstContent.style.maxHeight = `${firstContent.scrollHeight / rootFontSize}rem`;
    showImage(1);

    items.forEach((el, index) => {
        const button = el.querySelector(buttonSelector);
        const content = el.querySelector(contentSelector);

        button.addEventListener('click', (event) => {
            if (event.target.closest('.h7') || event.target.closest('.icon')) {
                if (el.dataset.open !== 'true') {
                    items.forEach(item => {
                        if (item !== el) {
                            item.dataset.open = 'false';
                            item.classList.remove('active');
                            item.querySelector(buttonSelector).classList.remove('active');
                            item.querySelector(contentSelector).style.maxHeight = '';
                        }
                    });
                    el.dataset.open = 'true';
                    button.classList.add('active');
                    el.classList.add('active');
                    content.style.maxHeight = `${content.scrollHeight / rootFontSize}rem`;
                    showImage(index + 1);
                } else {
                    el.dataset.open = 'false';
                    el.classList.remove('active');
                    button.classList.remove('active');
                    content.style.maxHeight = '';
                }
            }
        });

        const onResize = () => {
            if (el.dataset.open === 'true') {
                if (parseInt(content.style.maxHeight) !== content.scrollHeight) {
                    content.style.maxHeight = `${content.scrollHeight / rootFontSize}rem`;
                }
            }
            // Обновляем отображение изображения при ресайзе
            if (el.classList.contains('active')) {
                showImage(index + 1);
            }
        };

        window.addEventListener('resize', onResize);
    });
	};

	smoothHeight('.faq--item', '.faq--item__button', '.faq--item__answer', '.faq--wrapper .image');
	
	// кастомный select
	const selects = document.querySelectorAll('.select');
	selects.forEach(select => {
		const button = select.querySelector('.select-button');
		const list = select.querySelector('.select-list');
		const buttonText = select.querySelector('.select-button-text');
		const items = select.querySelectorAll('.select-list-wrapper .item');

		button.addEventListener('click', (e) => {
			e.stopPropagation();
			const isOpen = select.classList.contains('open');
			
			selects.forEach(otherSelect => {
				otherSelect.classList.remove('open');
				otherSelect.querySelector('.select-list').classList.remove('show');
			});

			select.classList.toggle('open', !isOpen);
			list.classList.toggle('show', !isOpen);
		});

		items.forEach(item => {
			item.addEventListener('click', (e) => {
				e.stopPropagation();
				
				items.forEach(i => {
					const checkmark = i.querySelector('svg#i-check');
					if (checkmark) checkmark.remove();
				});

				item.insertAdjacentHTML('beforeend', `
					<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" id="i-check" viewBox="0 0 20 20" fill="none">
						<path d="M5.5 11.3L8.202 14l6.8-7" stroke="#16292C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				`);

				buttonText.textContent = item.textContent.trim();

				select.classList.remove('open');
				list.classList.remove('show');
			});
		});
	});

	const videoOrPhotobuttons = document.querySelectorAll('.videoOrPhoto .button--main');
	const videoOrPhotoblocks = document.querySelectorAll('.about--constructionProgress__block');
	videoOrPhotobuttons.forEach(button => {
		button.addEventListener('click', () => {
			// Удаляем класс active у всех кнопок
			videoOrPhotobuttons.forEach(btn => btn.classList.remove('active'));
			// Добавляем класс active к нажатой кнопке
			button.classList.add('active');

			// Получаем тип контента из data-атрибута
			const contentType = button.getAttribute('data-buttonContent');

			// Удаляем класс active у всех блоков
			videoOrPhotoblocks.forEach(block => block.classList.remove('active'));
			// Находим блок, соответствующий типу контента, и добавляем класс active
			const activeBlock = document.querySelector(`.about--constructionProgress__block[data-typeContent="${contentType}"]`);
			if (activeBlock) {
				activeBlock.classList.add('active');
			}
		});
	});

	// Получаем все кнопки и блоки
	const appsTypebuttons = document.querySelectorAll('.appsType .button');
	const roomBlocks = document.querySelectorAll('.about--finishing__rooms .block');
	// Добавляем обработчик клика на каждую кнопку
	appsTypebuttons.forEach(button => {
		button.addEventListener('click', function() {
			// Получаем data-room значение кнопки
			const room = this.getAttribute('data-room');

			// Удаляем active класс у всех кнопок
			appsTypebuttons.forEach(btn => btn.classList.remove('active'));
			// Добавляем active класс к текущей кнопке
			this.classList.add('active');

			// Удаляем active класс у всех блоков
			roomBlocks.forEach(block => block.classList.remove('active'));

			// Находим соответствующий блок по data-room
			const targetBlock = Array.from(roomBlocks).find(block => 
				block.getAttribute('data-room') === room
			);

			if (targetBlock) {
				targetBlock.classList.add('active');
				// Если используется Swiper, обновляем слайдер
				if (typeof Swiper !== 'undefined' && targetBlock.swiper) {
					const swiper = targetBlock.swiper;
					swiper.update();
					swiper.slideTo(0); // Возвращаемся к первому слайду
				}
			}
		});
	});

	// Объект для соответствия кнопок и модальных окон
	const modalTriggers = {
		'open--modal': 'modal--requestCall',
		'open--consultation': 'modal--consultation',
		'open--docs': 'modal--docs',
		'open--tour': 'modal--tour',
		'open--mortgage': 'modal--mortgage',
		'open--agency': 'modal--agency'
	};
	// Находим все кнопки с классами, начинающимися на open--
	const buttonsOpen = document.querySelectorAll('[class*="open--"]');
	// Обработчик клика по кнопкам открытия модалок
	buttonsOpen.forEach(button => {
		// Ищем класс, начинающийся с open--
		const triggerClass = Array.from(button.classList).find(cls => cls.startsWith('open--'));
		if (!triggerClass) {
				console.warn('Кнопка не имеет класса, начинающегося с open--:', button);
				return;
		}
		button.addEventListener('click', (e) => {
			e.preventDefault(); // Предотвращаем стандартное поведение
			const modalClass = modalTriggers[triggerClass];
			if (modalClass) {
				const modal = document.querySelector(`.${modalClass}`);
				if (modal) {
					// Закрываем все открытые модалки перед открытием новой
					document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
					modal.classList.add('active'); // Открываем нужную модалку
				} else {
					console.warn(`Модалка с классом ${modalClass} не найдена`);
				}
			} else {
				console.warn(`Класс ${triggerClass} не найден в modalTriggers`);
			}
		});
	});
	// Обработчик клика по кнопке закрытия модалки
	document.querySelectorAll('.modal--close').forEach(closeBtn => {
		closeBtn.addEventListener('click', () => {
			closeBtn.closest('.modal').classList.remove('active');
		});
	});
	// Обработчик клика вне модального окна
	document.addEventListener('click', (e) => {
		// Обработка для .select
		if (!e.target.closest('.select')) {
			const selects = document.querySelectorAll('.select');
			selects.forEach(select => {
				select.classList.remove('open');
				select.querySelector('.select-list')?.classList.remove('show');
			});
		}
		// Закрытие модалок при клике вне .modal--wrapper и не по кнопке открытия
		if (!e.target.closest('.modal--wrapper') && !e.target.closest('[class*="open--"]')) {
			document.querySelectorAll('.modal.active').forEach(modal => {
				modal.classList.remove('active');
			});
		}
	});
	// Закрытие модалок по клавише Escape (опционально)
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			document.querySelectorAll('.modal.active').forEach(modal => {
				modal.classList.remove('active');
			});
		}
	});

	// Автоматическая инициализация для всех с data-fancybox
	Fancybox.bind('[data-type="iframe"]', {
		type: 'iframe',
		width: 800,
		height: 'auto',
		autoSize: false,
		fitToView: false
	});

	const chooseAppsFilterButtons = document.querySelectorAll('.chooseApps__buttons .button');
	const chooseAppsTypeButtons = document.querySelectorAll('.chooseApps__typeApps .button');
	const chooseAppsItems = document.querySelectorAll('.chooseApps__list .item');
	const chooseAppsCurrentBlocks = document.querySelectorAll('.chooseApps__current');

	function handleFilterButtonClick() {
		chooseAppsFilterButtons.forEach(btn => btn.classList.remove('active'));
		this.classList.add('active');

		const type = this.getAttribute('data-chooseapps');

		// Обновляем класс current-apps и active для .item
		let firstMatchingItem = null;
		chooseAppsItems.forEach(item => {
			const itemType = item.getAttribute('data-chosenapps');
			const isMatching = itemType === type;
			item.classList.toggle('current-apps', isMatching);
			if (isMatching && !firstMatchingItem) {
				firstMatchingItem = item;
				item.classList.add('active');
			} else {
				item.classList.remove('active');
			}
		});

		// Активируем соответствующий .chooseApps__current
		if (firstMatchingItem) {
			const currentId = firstMatchingItem.getAttribute('data-choosecurrent');
			updateCurrentBlock(currentId);
		}
	}
	function handleTypeButtonClick() {
		const parentCurrent = this.closest('.chooseApps__current');
		const buttons = parentCurrent.querySelectorAll('.chooseApps__typeApps .button');
		const images = parentCurrent.querySelectorAll('.image img');
		buttons.forEach(btn => btn.classList.remove('active'));
		this.classList.add('active');

		const type = this.getAttribute('data-typeapps');
		images.forEach(img => img.classList.add('hidden'));
		const targetImage = parentCurrent.querySelector(`.image img[data-typeimg="${type}"]`);
		if (targetImage) {
			targetImage.classList.remove('hidden');
		}
	}
	function handleItemClick() {
		chooseAppsItems.forEach(item => item.classList.remove('active'));
		this.classList.add('active');

		const currentId = this.getAttribute('data-choosecurrent');
		updateCurrentBlock(currentId);
	}
	function updateCurrentBlock(currentId) {
		chooseAppsCurrentBlocks.forEach(block => {
			block.classList.toggle('active', block.getAttribute('data-currentapps') === currentId);
			if (block.classList.contains('active')) {
				const activeButton = block.querySelector('.chooseApps__typeApps .button.active');
				if (activeButton) {
					const type = activeButton.getAttribute('data-typeapps');
					const images = block.querySelectorAll('.image img');
					images.forEach(img => img.classList.add('hidden'));
					const targetImage = block.querySelector(`.image img[data-typeimg="${type}"]`);
					if (targetImage) {
						targetImage.classList.remove('hidden');
					}
				}
			}
		});
	}
	function handleLargeScreen() {
		// Удаляем обработчики для маленьких экранов
		chooseAppsItems.forEach(item => item.removeEventListener('click', handleItemClick));

		// Добавляем обработчики для фильтров
		chooseAppsFilterButtons.forEach(button => {
			button.removeEventListener('click', handleFilterButtonClick);
			button.addEventListener('click', handleFilterButtonClick);
		});

		// Добавляем обработчики для переключения изображений
		chooseAppsTypeButtons.forEach(button => {
			button.removeEventListener('click', handleTypeButtonClick);
			button.addEventListener('click', handleTypeButtonClick);
		});

		// Добавляем обработчики для кликов по .item
		chooseAppsItems.forEach(item => {
			item.removeEventListener('click', handleItemClick);
			item.addEventListener('click', handleItemClick);
		});
	}
	function handleSmallScreen() {
		// Удаляем обработчики для больших экранов
		chooseAppsFilterButtons.forEach(button => button.removeEventListener('click', handleFilterButtonClick));
		chooseAppsTypeButtons.forEach(button => button.removeEventListener('click', handleTypeButtonClick));
		chooseAppsItems.forEach(item => item.removeEventListener('click', handleItemClick));

		// Добавляем обработчики для аккордеона и фильтров
		chooseAppsFilterButtons.forEach(button => {
			button.removeEventListener('click', handleFilterButtonClick);
			button.addEventListener('click', handleFilterButtonClick);
		});

		chooseAppsItems.forEach(item => {
			item.removeEventListener('click', handleItemClick);
			item.addEventListener('click', handleItemClick);
		});
	}
	function initialize() {
		// Устанавливаем первую кнопку активной
		if (chooseAppsFilterButtons.length > 0) {
			chooseAppsFilterButtons.forEach(btn => btn.classList.remove('active'));
			chooseAppsFilterButtons[0].classList.add('active');

			const type = chooseAppsFilterButtons[0].getAttribute('data-chooseapps');

			// Устанавливаем current-apps и active для .item
			let firstMatchingItem = null;
			chooseAppsItems.forEach(item => {
				const itemType = item.getAttribute('data-chosenapps');
				const isMatching = itemType === type;
				item.classList.toggle('current-apps', isMatching);
				if (isMatching && !firstMatchingItem) {
					firstMatchingItem = item;
					item.classList.add('active');
				} else {
					item.classList.remove('active');
				}
			});

			// Активируем соответствующий .chooseApps__current
			if (firstMatchingItem) {
				const currentId = firstMatchingItem.getAttribute('data-choosecurrent');
				updateCurrentBlock(currentId);
			}
		}

		// Проверяем размер экрана
		if (window.innerWidth > 480) {
			handleLargeScreen();
		} else {
			handleSmallScreen();
		}
	}
	// Инициализация
	initialize();
	window.addEventListener('resize', () => {
		if (window.innerWidth > 480) {
			handleLargeScreen();
		} else {
			handleSmallScreen();
		}
	});
	function isMobile() {
		return window.matchMedia("(max-width: 992px)").matches;
	}

	document.querySelectorAll('.detail').forEach(detail => {
			detail.addEventListener('touchstart', function(e) {
					if (isMobile()) {
							e.preventDefault(); // Предотвращаем прокрутку или выделение
							document.querySelectorAll('.detail').forEach(d => d.classList.remove('active')); // Убираем active у других
							this.classList.toggle('active'); // Переключаем active для текущего
					}
			});

			// Убираем active при клике вне элемента
			document.addEventListener('click', function(e) {
					if (isMobile() && !e.target.closest('.detail')) {
							document.querySelectorAll('.detail').forEach(d => d.classList.remove('active'));
					}
			});
	});

	// страница projects.html
	const projectItems = document.querySelectorAll('.projects--item');
	projectItems.forEach(item => {
		const button = item.querySelector('.hide');
		const rightBlock = item.querySelector('.right');
		const textSpan = button.querySelector('span');

		// Устанавливаем начальный текст кнопки для мобильных устройств
		if (window.innerWidth <= 480) {
			textSpan.textContent = 'Раскрыть';
		} else {
			textSpan.textContent = 'Скрыть';
		}

		button.addEventListener('click', e => {
			e.preventDefault();
			
			// Работает только на мобильных (≤480px)
			if (window.innerWidth > 480) return;

			// Сворачиваем все остальные блоки
			projectItems.forEach(otherItem => {
				if (otherItem !== item) {
					const otherRight = otherItem.querySelector('.right');
					const otherButton = otherItem.querySelector('.hide');
					const otherSpan = otherButton.querySelector('span');
					otherRight.classList.remove('active');
					otherSpan.textContent = 'Раскрыть';
					otherButton.classList.remove('active');
				}
			});

			// Переключаем текущий блок
			const isHidden = !rightBlock.classList.contains('active');
			rightBlock.classList.toggle('active', isHidden);
			textSpan.textContent = isHidden ? 'Скрыть' : 'Раскрыть';
			button.classList.toggle('active', isHidden);
		});
	});


});