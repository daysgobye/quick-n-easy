// quick-n-easy-scripts.js
// Vanilla JavaScript for Quick 'n Easy Styles components

document.addEventListener('DOMContentLoaded', () => {
    /**
     * ------------------------------------------------------------------------
     * Accordion Component
     * ------------------------------------------------------------------------
     */
    const accordionItems = document.querySelectorAll('.qne-accordion-item');
    accordionItems.forEach(item => {
        const button = item.querySelector('.qne-accordion-button');
        const content = item.querySelector('.qne-accordion-content');
        const contentInner = item.querySelector('.qne-accordion-content-inner');

        if (button && content && contentInner) {
            button.setAttribute('aria-expanded', item.classList.contains('qne-active'));
            content.setAttribute('aria-hidden', !item.classList.contains('qne-active'));

            button.addEventListener('click', () => {
                const isActive = item.classList.contains('qne-active');

                // Optional: Close other accordions in the same group if they have a common parent with data-qne-accordion-group
                const parentGroup = item.closest('[data-qne-accordion-group="true"]');
                if (parentGroup && !isActive) { // Only close others if opening this one
                    parentGroup.querySelectorAll('.qne-accordion-item.qne-active').forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('qne-active');
                            otherItem.querySelector('.qne-accordion-button').setAttribute('aria-expanded', 'false');
                            const otherContent = otherItem.querySelector('.qne-accordion-content');
                            otherContent.setAttribute('aria-hidden', 'true');
                            otherContent.style.maxHeight = null;
                            otherContent.querySelector('.qne-accordion-content-inner').style.paddingTop = '0';
                            otherContent.querySelector('.qne-accordion-content-inner').style.paddingBottom = '0';
                        }
                    });
                }

                item.classList.toggle('qne-active');
                const nowActive = item.classList.contains('qne-active');
                button.setAttribute('aria-expanded', nowActive);
                content.setAttribute('aria-hidden', !nowActive);

                if (nowActive) {
                    // Temporarily set to auto to get the scrollHeight, then set to actual height for transition
                    content.style.maxHeight = content.scrollHeight + "px";
                    contentInner.style.paddingTop = getComputedStyle(item).getPropertyValue('--qne-gap-md');
                    contentInner.style.paddingBottom = getComputedStyle(item).getPropertyValue('--qne-gap-md');
                } else {
                    contentInner.style.paddingTop = '0';
                    contentInner.style.paddingBottom = '0';
                    // Add a small delay before setting maxHeight to null to allow padding transition
                    setTimeout(() => {
                        content.style.maxHeight = null;
                    }, 50); // Adjust delay if needed, should match padding transition time roughly
                }
            });

            // Set initial state for already active accordions (e.g. pre-set in HTML)
            if (item.classList.contains('qne-active')) {
                content.style.maxHeight = content.scrollHeight + "px";
                contentInner.style.paddingTop = getComputedStyle(item).getPropertyValue('--qne-gap-md');
                contentInner.style.paddingBottom = getComputedStyle(item).getPropertyValue('--qne-gap-md');
            } else {
                contentInner.style.paddingTop = '0';
                contentInner.style.paddingBottom = '0';
                content.style.maxHeight = null;
            }
        }
    });

    /**
     * ------------------------------------------------------------------------
     * Modal Component
     * ------------------------------------------------------------------------
     */
    const modalTriggers = document.querySelectorAll('[data-qne-modal-target]');
    const openModals = []; // Keep track of open modals for nested scenarios

    function openModal(modal) {
        if (modal) {
            modal.classList.add('qne-modal-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            openModals.push(modal);
            // Focus on the first focusable element in the modal
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length) {
                focusableElements[0].focus();
            }
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('qne-modal-open');
            modal.setAttribute('aria-hidden', 'true');
            openModals.pop();
            if (openModals.length === 0) { // Only restore scroll if no other modals are open
                document.body.style.overflow = '';
            }
            // Return focus to the trigger element if available
            const trigger = document.querySelector(`[data-qne-modal-target="${modal.id}"]`);
            if (trigger) {
                trigger.focus();
            }
        }
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            const modalId = trigger.getAttribute('data-qne-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal);
            }
        });
    });

    document.querySelectorAll('.qne-modal').forEach(modal => {
        // Close button inside modal
        modal.querySelectorAll('[data-qne-modal-dismiss], .qne-modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeModal(modal);
            });
        });

        // Close modal on backdrop click
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { // Clicked on the backdrop itself
                closeModal(modal);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && openModals.length > 0) {
            closeModal(openModals[openModals.length - 1]); // Close the topmost modal
        }
    });


    /**
     * ------------------------------------------------------------------------
     * Tabs Component
     * ------------------------------------------------------------------------
     */
    const tabContainers = document.querySelectorAll('.qne-tabs');
    tabContainers.forEach(tabContainer => {
        const tabButtons = Array.from(tabContainer.querySelectorAll('.qne-tab-button'));
        const tabContents = Array.from(tabContainer.querySelectorAll('.qne-tab-content'));
        let activeTabIndex = -1;

        function activateTab(index) {
            if (index < 0 || index >= tabButtons.length) return;

            // Deactivate current active tab
            if (activeTabIndex !== -1) {
                tabButtons[activeTabIndex].classList.remove('qne-active');
                tabButtons[activeTabIndex].setAttribute('aria-selected', 'false');
                tabButtons[activeTabIndex].setAttribute('tabindex', '-1');
                if (tabContents[activeTabIndex]) tabContents[activeTabIndex].classList.remove('qne-active');
            }

            // Activate new tab
            tabButtons[index].classList.add('qne-active');
            tabButtons[index].setAttribute('aria-selected', 'true');
            tabButtons[index].setAttribute('tabindex', '0'); // Make active tab focusable
            if (tabContents[index]) tabContents[index].classList.add('qne-active');

            activeTabIndex = index;
            tabButtons[index].focus(); // Move focus to the active tab button
        }


        tabButtons.forEach((button, index) => {
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('tabindex', '-1'); // Initially not focusable with Tab key
            const targetContentId = button.getAttribute('data-qne-tab-target');
            if (targetContentId) {
                const targetContent = tabContainer.querySelector(targetContentId);
                if (targetContent) {
                    targetContent.setAttribute('role', 'tabpanel');
                    targetContent.setAttribute('aria-labelledby', button.id || `qne-tab-button-${index}`);
                    if (!button.id) button.id = `qne-tab-button-${index}`;
                }
            }


            button.addEventListener('click', () => {
                activateTab(index);
            });

            button.addEventListener('keydown', (event) => {
                let newIndex = index;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    newIndex = (index + 1) % tabButtons.length;
                    event.preventDefault(); // Prevent page scroll
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
                    event.preventDefault(); // Prevent page scroll
                } else if (event.key === 'Home') {
                    newIndex = 0;
                    event.preventDefault();
                } else if (event.key === 'End') {
                    newIndex = tabButtons.length - 1;
                    event.preventDefault();
                }
                if (newIndex !== index) {
                    activateTab(newIndex);
                }
            });

            if (button.classList.contains('qne-active')) {
                activeTabIndex = index; // Note initial active tab
            }
        });

        // Activate the first tab by default if none are marked active, or the one marked active
        if (activeTabIndex !== -1) {
            activateTab(activeTabIndex); // Re-affirm active tab for tabindex and focus
        } else if (tabButtons.length > 0) {
            activateTab(0); // Default to first tab
        }
    });


    /**
     * ------------------------------------------------------------------------
     * Carousel Component
     * ------------------------------------------------------------------------
     */
    document.querySelectorAll('.qne-carousel').forEach(carousel => {
        const inner = carousel.querySelector('.qne-carousel-inner');
        const items = Array.from(carousel.querySelectorAll('.qne-carousel-item'));
        const prevButton = carousel.querySelector('.qne-carousel-control.qne-prev');
        const nextButton = carousel.querySelector('.qne-carousel-control.qne-next');
        const indicatorsContainer = carousel.querySelector('.qne-carousel-indicators');
        let currentIndex = 0;
        const totalItems = items.length;
        let autoPlayInterval = null;
        const autoPlayDelay = parseInt(carousel.dataset.qneInterval, 10) || 0; // e.g., data-qne-interval="5000" for 5s

        if (!inner || totalItems === 0) return;

        function updateCarousel(isSmooth = true) {
            if (!isSmooth) inner.style.transition = 'none'; // Disable transition for instant jump (e.g., after autoplay loop)
            inner.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (!isSmooth) {
                // Force reflow to apply the transform instantly before re-enabling transition
                // eslint-disable-next-line no-unused-expressions
                inner.offsetHeight;
                inner.style.transition = ''; // Re-enable original transition
            }


            if (indicatorsContainer) {
                const indicators = indicatorsContainer.querySelectorAll('.qne-carousel-indicator');
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('qne-active', index === currentIndex);
                    indicator.setAttribute('aria-current', index === currentIndex);
                });
            }
            // Update aria-live region for screen readers
            const liveRegion = carousel.querySelector('.qne-carousel-liveregion');
            if (liveRegion) {
                liveRegion.textContent = `Slide ${currentIndex + 1} of ${totalItems}`;
            }

            items.forEach((item, index) => {
                item.setAttribute('aria-hidden', index !== currentIndex);
                item.classList.toggle('qne-active', index === currentIndex);
            });
        }

        function createIndicators() {
            if (!indicatorsContainer) return;
            indicatorsContainer.innerHTML = ''; // Clear existing
            for (let i = 0; i < totalItems; i++) {
                const button = document.createElement('button');
                button.classList.add('qne-carousel-indicator');
                button.setAttribute('type', 'button');
                button.setAttribute('aria-label', `Go to slide ${i + 1}`);
                button.setAttribute('aria-current', 'false');
                if (i === currentIndex) {
                    button.classList.add('qne-active');
                    button.setAttribute('aria-current', 'true');
                }
                button.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                    resetAutoPlay();
                });
                indicatorsContainer.appendChild(button);
            }
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        }

        function startAutoPlay() {
            if (autoPlayDelay > 0 && !autoPlayInterval) {
                autoPlayInterval = setInterval(showNext, autoPlayDelay);
            }
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                showPrev();
                resetAutoPlay();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                showNext();
                resetAutoPlay();
            });
        }

        // Initialize items with aria-hidden
        items.forEach((item, index) => {
            item.setAttribute('aria-hidden', index !== currentIndex);
        });


        if (indicatorsContainer) {
            createIndicators();
        }

        // Add ARIA live region for screen reader announcements
        let liveRegion = carousel.querySelector('.qne-carousel-liveregion');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'qne-carousel-liveregion';
            liveRegion.setAttribute('aria-live', 'polite'); // 'polite' or 'assertive'
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            liveRegion.style.clip = 'rect(0, 0, 0, 0)';
            liveRegion.style.whiteSpace = 'nowrap';
            liveRegion.style.border = '0';
            carousel.appendChild(liveRegion);
        }


        updateCarousel(false); // Initial call, no smooth transition for first load
        startAutoPlay();

        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        carousel.addEventListener('focusin', stopAutoPlay); // Stop when child element gets focus
        carousel.addEventListener('focusout', startAutoPlay); // Resume when focus leaves

    });

});
